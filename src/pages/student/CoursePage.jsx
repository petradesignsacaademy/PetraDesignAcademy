import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StudentLayout from '../../components/layout/StudentLayout'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDuration(mins) {
  if (!mins) return ''
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function moduleColor(index) {
  return ['#99569F', '#47C6EB', '#ED518E', '#F9A534'][index % 4]
}

// ── Progress ring ─────────────────────────────────────────────────────────────
function ProgressRing({ percent, color, size = 56 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  )
}

export default function CoursePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse]           = useState(null)
  const [modules, setModules]         = useState([])
  const [progress, setProgress]       = useState({})   // lessonId → is_completed
  const [expanded, setExpanded]       = useState(null) // moduleId that's open
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    loadCourse()
  }, [user])

  async function loadCourse() {
    setLoading(true)
    try {
      // 1. Grab the first published course (only one at launch)
      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('sort_order')
        .limit(1)
        .single()

      if (courseErr) throw courseErr
      setCourse(courseData)

      // 2. Grab all published modules + their lessons in one query
      const { data: modulesData, error: modErr } = await supabase
        .from('modules')
        .select(`
          *,
          lessons (
            id, title, description, video_url, duration_mins,
            sort_order, is_published, has_assignment
          )
        `)
        .eq('course_id', courseData.id)
        .eq('is_published', true)
        .order('sort_order')

      if (modErr) throw modErr

      // Sort lessons within each module
      const sorted = modulesData.map(m => ({
        ...m,
        lessons: (m.lessons || [])
          .filter(l => l.is_published)
          .sort((a, b) => a.sort_order - b.sort_order),
      }))
      setModules(sorted)

      // Open first module by default
      if (sorted.length > 0) setExpanded(sorted[0].id)

      // 3. Grab student's lesson progress
      const allLessonIds = sorted.flatMap(m => m.lessons.map(l => l.id))
      if (allLessonIds.length > 0) {
        const { data: progressData } = await supabase
          .from('lesson_progress')
          .select('lesson_id, is_completed')
          .eq('student_id', user.id)
          .in('lesson_id', allLessonIds)

        const map = {}
        progressData?.forEach(p => { map[p.lesson_id] = p.is_completed })
        setProgress(map)
      }
    } catch (err) {
      setError('Could not load the course. Please refresh and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Overall course progress
  const allLessons    = modules.flatMap(m => m.lessons)
  const completedCount = allLessons.filter(l => progress[l.id]).length
  const totalCount    = allLessons.length
  const overallPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Find next incomplete lesson to continue
  function findNextLesson() {
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!progress[lesson.id]) return { mod, lesson }
      }
    }
    return null
  }

  function goToLesson(mod, lesson) {
    navigate(`/courses/${course.id}/modules/${mod.id}/lessons/${lesson.id}`)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Loading your course...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </StudentLayout>
    )
  }

  if (error) {
    return (
      <StudentLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text2)', fontSize: 15 }}>{error}</p>
          </div>
        </div>
      </StudentLayout>
    )
  }

  const next = findNextLesson()

  return (
    <StudentLayout>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>

        {/* ── Course header ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--purple)', fontFamily: 'Poppins, sans-serif', marginBottom: 8 }}>MY COURSE</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
            <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 44, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
              {course?.title}
            </h1>
            {/* Overall progress ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 20px', flexShrink: 0 }}>
              <ProgressRing percent={overallPct} color="var(--purple)" size={52} />
              <div>
                <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{overallPct}%</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{completedCount}/{totalCount} lessons</div>
              </div>
            </div>
          </div>
          {course?.description && (
            <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, marginTop: 12, lineHeight: 1.7, maxWidth: 600 }}>{course.description}</p>
          )}
        </div>

        {/* ── Continue banner ──────────────────────────────────────────────── */}
        {next && overallPct < 100 && (
          <div
            onClick={() => goToLesson(next.mod, next.lesson)}
            style={{ background: 'linear-gradient(135deg, #12133C, #2D1060)', border: '1px solid rgba(153,86,159,0.3)', borderRadius: 18, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s', gap: 16 }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(153,86,159,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>▶️</div>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>CONTINUE WHERE YOU LEFT OFF</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, color: '#fff', fontSize: 15 }}>{next.lesson.title}</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{next.mod.title}{next.lesson.duration_mins ? ` · ${formatDuration(next.lesson.duration_mins)}` : ''}</div>
              </div>
            </div>
            <button style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Completed banner ─────────────────────────────────────────────── */}
        {overallPct === 100 && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 18, padding: '20px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32 }}>🏆</div>
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: '#22C55E' }}>Course complete! Congratulations.</div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>You've completed all lessons. Your certificate is ready.</div>
            </div>
            <button onClick={() => navigate(`/certificate/${course.id}`)} style={{ marginLeft: 'auto', background: '#22C55E', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
              View Certificate →
            </button>
          </div>
        )}

        {/* ── Modules accordion ────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modules.map((mod, modIndex) => {
            const color          = moduleColor(modIndex)
            const isOpen         = expanded === mod.id
            const modCompleted   = mod.lessons.filter(l => progress[l.id]).length
            const modTotal       = mod.lessons.length
            const modPct         = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0
            const isModDone      = modPct === 100

            return (
              <div key={mod.id} style={{ background: 'var(--surface)', border: `1px solid ${isOpen ? color + '40' : 'var(--border)'}`, borderRadius: 18, overflow: 'hidden', transition: 'border-color 0.2s' }}>

                {/* Module header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : mod.id)}
                  style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, userSelect: 'none' }}
                >
                  {/* Number badge */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}18`, border: `1.5px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isModDone
                      ? <span style={{ color, fontSize: 16 }}>✓</span>
                      : <span style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 18, fontWeight: 700, color }}>{modIndex + 1}</span>
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{mod.title}</h3>
                      {isModDone && <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 999, fontFamily: 'Poppins, sans-serif' }}>COMPLETE</span>}
                    </div>
                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${modPct}%`, background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', fontWeight: 600, flexShrink: 0 }}>{modCompleted}/{modTotal}</span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <div style={{ color: 'var(--text3)', fontSize: 18, transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>⌄</div>
                </div>

                {/* Lessons list */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${color}20` }}>
                    {mod.lessons.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 13 }}>No lessons published yet.</div>
                    ) : (
                      mod.lessons.map((lesson, lessonIndex) => {
                        const isDone    = progress[lesson.id] === true
                        const isNext    = next?.lesson.id === lesson.id

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => goToLesson(mod, lesson)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 16,
                              padding: '14px 24px',
                              borderBottom: lessonIndex < mod.lessons.length - 1 ? '1px solid var(--border)' : 'none',
                              cursor: 'pointer',
                              background: isNext ? `${color}07` : 'transparent',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { if (!isNext) e.currentTarget.style.background = 'var(--bg2)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = isNext ? `${color}07` : 'transparent' }}
                          >
                            {/* Lesson status circle */}
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                              background: isDone ? color : isNext ? `${color}15` : 'var(--bg3)',
                              border: isDone ? 'none' : isNext ? `2px solid ${color}` : '2px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {isDone
                                ? <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>
                                : isNext
                                  ? <span style={{ fontSize: 10 }}>▶</span>
                                  : <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>{lessonIndex + 1}</span>
                              }
                            </div>

                            {/* Title + meta */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: isNext ? 600 : 500, color: isDone ? 'var(--text2)' : 'var(--text)', marginBottom: 2 }}>
                                {lesson.title}
                              </div>
                              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                {lesson.duration_mins && (
                                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>🎬 {formatDuration(lesson.duration_mins)}</span>
                                )}
                                {lesson.has_assignment && (
                                  <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>✏️ Assignment</span>
                                )}
                              </div>
                            </div>

                            {/* Right arrow */}
                            <span style={{ color: isNext ? color : 'var(--text3)', fontSize: 16, flexShrink: 0 }}>›</span>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {modules.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, color: 'var(--text)', marginBottom: 8 }}>Course content coming soon</h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Petra is putting the finishing touches on the modules. Check back soon!</p>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
