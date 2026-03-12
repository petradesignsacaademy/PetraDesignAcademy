import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StudentLayout from '../../components/layout/StudentLayout'

function formatDuration(mins) {
  if (!mins) return ''
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Extract YouTube video ID from various URL formats
function getYouTubeId(url) {
  if (!url) return null
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export default function LessonPage() {
  const { courseId, moduleId, lessonId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [lesson, setLesson]         = useState(null)
  const [module, setModule]         = useState(null)
  const [resources, setResources]   = useState([])
  const [allLessons, setAllLessons] = useState([])   // for sidebar
  const [progress, setProgress]     = useState({})   // lessonId → is_completed
  const [isCompleted, setIsCompleted] = useState(false)
  const [tab, setTab]               = useState('overview')
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  // Assignment state
  const [answerText, setAnswerText] = useState('')
  const [file, setFile]             = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [existingSubmission, setExistingSubmission] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  async function loadLesson() {
    setLoading(true)
    setTab('overview')
    try {
      // Load lesson
      const { data: lessonData, error: lessonErr } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()
      if (lessonErr) throw lessonErr
      setLesson(lessonData)

      // Load module
      const { data: moduleData } = await supabase
        .from('modules')
        .select('*, lessons(id, title, sort_order, is_published, duration_mins, has_assignment)')
        .eq('id', moduleId)
        .single()
      setModule(moduleData)

      // Sorted published lessons for sidebar
      const sorted = (moduleData?.lessons || [])
        .filter(l => l.is_published)
        .sort((a, b) => a.sort_order - b.sort_order)
      setAllLessons(sorted)

      // Load resources for this lesson
      const { data: resData } = await supabase
        .from('lesson_resources')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('sort_order')
      setResources(resData || [])

      // Load this student's progress for all lessons in module
      const lessonIds = sorted.map(l => l.id)
      if (lessonIds.length > 0) {
        const { data: progData } = await supabase
          .from('lesson_progress')
          .select('lesson_id, is_completed')
          .eq('student_id', user.id)
          .in('lesson_id', lessonIds)
        const map = {}
        progData?.forEach(p => { map[p.lesson_id] = p.is_completed })
        setProgress(map)
        setIsCompleted(map[lessonId] || false)
      }

      // Check for existing submission
      if (lessonData.has_assignment) {
        const { data: subData } = await supabase
          .from('submissions')
          .select('*')
          .eq('student_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle()
        if (subData) {
          setExistingSubmission(subData)
          setSubmitted(true)
          setAnswerText(subData.written_answer || '')
        }
      }
    } catch (err) {
      setError('Could not load this lesson. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Mark complete / incomplete toggle
  async function toggleComplete() {
    setSaving(true)
    const newVal = !isCompleted
    const now = new Date().toISOString()

    const { error: upsertErr } = await supabase
      .from('lesson_progress')
      .upsert({
        student_id:   user.id,
        lesson_id:    lessonId,
        is_completed: newVal,
        completed_at: newVal ? now : null,
        updated_at:   now,
      }, { onConflict: 'student_id,lesson_id' })

    if (!upsertErr) {
      setIsCompleted(newVal)
      setProgress(p => ({ ...p, [lessonId]: newVal }))

      // Auto-advance to next lesson when marking complete
      if (newVal) {
        const currentIndex = allLessons.findIndex(l => l.id === lessonId)
        const next = allLessons[currentIndex + 1]
        if (next) {
          setTimeout(() => navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${next.id}`), 800)
        }
      }
    }
    setSaving(false)
  }

  // Submit assignment
  async function handleSubmit(e) {
    e.preventDefault()
    if (!answerText && !file) return
    setSubmitting(true)

    let fileUrl = existingSubmission?.file_url || null
    let fileName = existingSubmission?.file_name || null

    // Upload file to Supabase Storage if provided
    if (file) {
      const ext = file.name.split('.').pop()
      const path = `submissions/${user.id}/${lessonId}.${ext}`
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('assignments')
        .upload(path, file, { upsert: true })
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('assignments').getPublicUrl(path)
        fileUrl  = urlData.publicUrl
        fileName = file.name
      }
    }

    const { error: subErr } = await supabase
      .from('submissions')
      .upsert({
        student_id:     user.id,
        lesson_id:      lessonId,
        written_answer: answerText,
        file_url:       fileUrl,
        file_name:      fileName,
        status:         'submitted',
        submitted_at:   new Date().toISOString(),
      }, { onConflict: 'student_id,lesson_id' })

    if (!subErr) {
      setSubmitted(true)
      setFile(null)
    }
    setSubmitting(false)
  }

  // Navigate between lessons
  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson   = allLessons[currentIndex - 1]
  const nextLesson   = allLessons[currentIndex + 1]

  const videoId = getYouTubeId(lesson?.video_url)

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Loading lesson...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </StudentLayout>
    )
  }

  if (error || !lesson) {
    return (
      <StudentLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 24 }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text2)', fontSize: 15 }}>{error || 'Lesson not found.'}</p>
            <Link to="/courses" style={{ marginTop: 16, display: 'inline-block', color: 'var(--purple)', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>← Back to course</Link>
          </div>
        </div>
      </StudentLayout>
    )
  }

  function renderSidebar() {
    return (
      <div style={{ background: 'var(--bg2)', overflowY: 'auto', height: '100%' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
          <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', textDecoration: 'none', marginBottom: 10, fontWeight: 600 }}>
            ← All modules
          </Link>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', marginBottom: 4 }}>MODULE</div>
          <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{module?.title}</div>
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${allLessons.length > 0 ? Math.round((allLessons.filter(l => progress[l.id]).length / allLessons.length) * 100) : 0}%`, background: 'var(--purple)', borderRadius: 999, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', marginTop: 5 }}>
              {allLessons.filter(l => progress[l.id]).length}/{allLessons.length} complete
            </div>
          </div>
        </div>
        <div style={{ padding: '8px 8px' }}>
          {allLessons.map((l, i) => {
            const isCurrent = l.id === lessonId
            const isDone    = progress[l.id]
            return (
              <div key={l.id}
                onClick={() => { navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${l.id}`); setSidebarOpen(false) }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 10px', borderRadius: 12, marginBottom: 2, cursor: 'pointer', background: isCurrent ? 'rgba(153,86,159,0.1)' : 'transparent', border: isCurrent ? '1px solid rgba(153,86,159,0.2)' : '1px solid transparent', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = 'var(--bg3)' }}
                onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: isDone ? 'rgba(34,197,94,0.12)' : isCurrent ? 'rgba(153,86,159,0.12)' : 'var(--bg3)', border: `1.5px solid ${isDone ? '#22C55E' : isCurrent ? 'var(--purple)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone ? <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 700 }}>✓</span> : <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, fontWeight: 700, color: isCurrent ? 'var(--purple)' : 'var(--text3)' }}>{i + 1}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: isCurrent ? 600 : 500, color: isCurrent ? 'var(--purple)' : isDone ? 'var(--text2)' : 'var(--text)', lineHeight: 1.3, marginBottom: 3 }}>{l.title}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {l.duration_mins && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>{formatDuration(l.duration_mins)}</span>}
                    {l.has_assignment && <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>· ✏️</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <StudentLayout>
      {/* Mobile sidebar toggle bar */}
      <div className="lesson-mob-btn" style={{ display: 'none', padding: '10px 16px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setSidebarOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)' }}>
          <span>📋</span> {sidebarOpen ? 'Hide lesson list' : 'Lesson list'}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, top: 64, zIndex: 150 }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 300, bottom: 0, borderLeft: '1px solid var(--border)', overflowY: 'auto', animation: 'slideInRight 0.2s ease' }}>
            {renderSidebar()}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 'calc(100vh - 64px)' }}>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>

          {/* Video area */}
          <div style={{ background: '#000', position: 'relative', width: '100%' }}>
            {videoId ? (
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            ) : (
              // Placeholder when no video yet
              <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #12133C, #2D1060)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎬</div>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Video coming soon</p>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div style={{ padding: '28px 32px', flex: 1 }}>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>
              <Link to="/courses" style={{ color: 'var(--purple)', textDecoration: 'none', fontWeight: 600 }}>Course</Link>
              <span>›</span>
              <span>{module?.title}</span>
            </div>

            {/* Title row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 36, fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}>
                {lesson.title}
              </h1>
              <button
                onClick={toggleComplete}
                disabled={saving}
                style={{
                  background: isCompleted ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
                  border: `1.5px solid ${isCompleted ? '#22C55E' : 'var(--border)'}`,
                  color: isCompleted ? '#22C55E' : 'var(--text2)',
                  padding: '9px 18px', borderRadius: 999,
                  fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                {saving ? '...' : isCompleted ? '✓ Completed' : 'Mark complete'}
              </button>
            </div>

            {/* Duration + assignment badge */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {lesson.duration_mins && (
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', background: 'var(--bg2)', padding: '4px 12px', borderRadius: 999 }}>🎬 {formatDuration(lesson.duration_mins)}</span>
              )}
              {lesson.has_assignment && (
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--pink)', background: 'rgba(237,81,142,0.08)', padding: '4px 12px', borderRadius: 999, fontWeight: 600 }}>✏️ Includes assignment</span>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, gap: 0 }}>
              {[
                { key: 'overview', label: '📖 Overview' },
                { key: 'resources', label: `📄 Resources${resources.length > 0 ? ` (${resources.length})` : ''}` },
                ...(lesson.has_assignment ? [{ key: 'assignment', label: '✏️ Assignment' }] : []),
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.key ? 'var(--purple)' : 'transparent'}`, color: tab === t.key ? 'var(--purple)' : 'var(--text3)', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1 }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'overview' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {lesson.description
                  ? <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text2)', fontSize: 15, lineHeight: 1.85 }}>{lesson.description}</p>
                  : <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, fontStyle: 'italic' }}>No description added yet.</p>
                }
              </div>
            )}

            {tab === 'resources' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                {resources.length === 0 ? (
                  <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, fontStyle: 'italic' }}>No resources added for this lesson yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {resources.map(r => (
                      <a key={r.id} href={r.file_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(153,86,159,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {r.file_type === 'pdf' ? '📄' : '📁'}
                          </div>
                          <div>
                            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{r.title}</div>
                            {(r.file_size || r.file_type) && (
                              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                                {[r.file_type?.toUpperCase(), formatBytes(r.file_size)].filter(Boolean).join(' · ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--purple)', fontWeight: 600 }}>↓ Download</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'assignment' && lesson.has_assignment && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>

                {/* Brief */}
                {lesson.assignment_brief && (
                  <div style={{ background: 'rgba(237,81,142,0.06)', border: '1px solid rgba(237,81,142,0.15)', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--pink)', marginBottom: 10 }}>✏️ Assignment Brief</div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{lesson.assignment_brief}</p>
                  </div>
                )}

                {/* Feedback from Petra — show if submission was reviewed */}
                {existingSubmission?.status === 'reviewed' && (
                  <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, color: '#22C55E' }}>✓ Feedback from Petra</div>
                      {existingSubmission.star_rating && (
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: 16, color: s <= existingSubmission.star_rating ? '#F9A534' : 'var(--bg3)' }}>★</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{existingSubmission.feedback_text}</p>
                  </div>
                )}

                {/* Submitted state */}
                {submitted && existingSubmission?.status !== 'reviewed' ? (
                  <div style={{ background: 'rgba(153,86,159,0.06)', border: '1px solid rgba(153,86,159,0.2)', borderRadius: 14, padding: '24px', textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--purple)', marginBottom: 6 }}>Assignment submitted!</div>
                    <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)' }}>Petra will review your work and post feedback here. Check back soon.</p>
                    <button onClick={() => setSubmitted(false)} style={{ marginTop: 14, background: 'none', border: '1px solid var(--border)', color: 'var(--text3)', padding: '7px 16px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit submission</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Upload your work</label>
                      <div
                        onClick={() => fileRef.current?.click()}
                        style={{ border: `2px dashed ${file ? 'var(--purple)' : 'var(--border)'}`, borderRadius: 14, padding: '28px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: file ? 'rgba(153,86,159,0.04)' : 'transparent' }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{file ? '📎' : '📁'}</div>
                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: file ? 'var(--purple)' : 'var(--text2)', fontWeight: file ? 600 : 400 }}>
                          {file ? file.name : 'Click to upload your file'}
                        </div>
                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>JPEG, PNG, PDF · Max 20MB</div>
                        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Written notes / questions for Petra <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
                      <textarea
                        value={answerText} onChange={e => setAnswerText(e.target.value)}
                        placeholder="Share your thought process, any questions, or notes about your submission..."
                        rows={4}
                        style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                        onFocus={e => e.target.style.borderColor = '#99569F'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || (!file && !answerText)}
                      style={{ background: submitting || (!file && !answerText) ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '13px 28px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: submitting || (!file && !answerText) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}
                    >
                      {submitting
                        ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Submitting...</>
                        : existingSubmission ? 'Update submission' : 'Submit assignment'
                      }
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Prev / Next navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              {prevLesson ? (
                <button onClick={() => navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${prevLesson.id}`)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '10px 20px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ← {prevLesson.title}
                </button>
              ) : <div />}
              {nextLesson ? (
                <button onClick={() => navigate(`/courses/${courseId}/modules/${moduleId}/lessons/${nextLesson.id}`)} style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {nextLesson.title} →
                </button>
              ) : <div />}
            </div>
          </div>
        </div>

        {/* ── Sidebar — desktop only ── */}
        <div className="lesson-sidebar" style={{ background: 'var(--bg2)', overflowY: 'auto', position: 'sticky', top: 64, height: 'calc(100vh - 64px)' }}>
          {renderSidebar()}
        </div>
      </div>

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 768px) {
          .lesson-sidebar { display: none !important; }
          .lesson-mob-btn { display: flex !important; }
        }
      `}</style>
    </StudentLayout>
  )
}
