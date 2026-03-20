import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StudentLayout from '../../components/layout/StudentLayout'
import { COURSE, ALL_LESSONS } from '../../data/courseData'

function ProgressRing({ percent, color, size = 56 }) {
  const r    = (size - 6) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ - (percent / 100) * circ}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

export default function CoursePage() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [progress, setProgress] = useState({})   // key → is_completed
  const [expanded, setExpanded] = useState(0)    // module index open
  const [loading, setLoading]   = useState(true)

  useEffect(() => { if (user) loadProgress() }, [user])

  async function loadProgress() {
    setLoading(true)
    try {
      const keys = ALL_LESSONS.map(l => l.key)
      const { data } = await supabase
        .from('course_progress')
        .select('lesson_key, is_completed')
        .eq('student_id', user.id)
        .in('lesson_key', keys)
      const map = {}
      data?.forEach(r => { map[r.lesson_key] = r.is_completed })
      setProgress(map)
    } catch (err) {
      console.error('[CoursePage] loadProgress error:', err)
    } finally {
      setLoading(false)
    }
  }

  const completedCount = ALL_LESSONS.filter(l => progress[l.key]).length
  const totalCount     = ALL_LESSONS.length
  const overallPct     = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  function findNextLesson() {
    return ALL_LESSONS.find(l => !progress[l.key]) || null
  }

  function goToLesson(lesson) {
    navigate(`/courses/m/${lesson.moduleIdx}/l/${lesson.lessonIdx}`)
  }

  if (loading) {
    return (
      <StudentLayout>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16 }}>
          <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--purple)', animation:'spin 0.7s linear infinite' }} />
          <p style={{ fontFamily:'Poppins, sans-serif', color:'var(--text3)', fontSize:14 }}>Loading your course...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </StudentLayout>
    )
  }

  const next = findNextLesson()

  return (
    <StudentLayout>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 32px' }}>

        {/* Course header */}
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'var(--purple)', fontFamily:'Poppins, sans-serif', marginBottom:8 }}>MY COURSE</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:24 }}>
            <h1 style={{ fontFamily:'Cormorant Upright, serif', fontSize:44, fontWeight:700, color:'var(--text)', lineHeight:1.1 }}>
              {COURSE.title}
            </h1>
            <div style={{ display:'flex', alignItems:'center', gap:14, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'14px 20px', flexShrink:0 }}>
              <ProgressRing percent={overallPct} color="var(--purple)" size={52} />
              <div>
                <div style={{ fontFamily:'Cormorant Upright, serif', fontSize:26, fontWeight:700, color:'var(--text)' }}>{overallPct}%</div>
                <div style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'var(--text3)', fontWeight:500 }}>{completedCount}/{totalCount} lessons</div>
              </div>
            </div>
          </div>
          <p style={{ fontFamily:'Poppins, sans-serif', color:'var(--text3)', fontSize:14, marginTop:12, lineHeight:1.7, maxWidth:600 }}>{COURSE.description}</p>
        </div>

        {/* Continue banner */}
        {next && overallPct < 100 && (
          <div
            onClick={() => goToLesson(next)}
            style={{ background:'linear-gradient(135deg, #12133C, #2D1060)', border:'1px solid rgba(153,86,159,0.3)', borderRadius:18, padding:'20px 24px', marginBottom:32, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', transition:'transform 0.2s', gap:16 }}
            onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'rgba(153,86,159,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>▶️</div>
              <div>
                <div style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:1, marginBottom:3 }}>CONTINUE WHERE YOU LEFT OFF</div>
                <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:600, color:'#fff', fontSize:15 }}>{next.title}</div>
                <div style={{ fontFamily:'Poppins, sans-serif', fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{COURSE.modules[next.moduleIdx].title}</div>
              </div>
            </div>
            <button style={{ background:'linear-gradient(135deg, #99569F, #ED518E)', color:'#fff', border:'none', borderRadius:999, padding:'10px 22px', fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
              Continue →
            </button>
          </div>
        )}

        {/* Completed banner */}
        {overallPct === 100 && (
          <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:18, padding:'20px 24px', marginBottom:32, display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:32 }}>🏆</div>
            <div>
              <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:15, color:'#22C55E' }}>Course complete! Congratulations.</div>
              <div style={{ fontFamily:'Poppins, sans-serif', fontSize:13, color:'var(--text3)', marginTop:2 }}>You've completed all lessons.</div>
            </div>
          </div>
        )}

        {/* Modules accordion */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {COURSE.modules.map((mod, mIdx) => {
            const isOpen       = expanded === mIdx
            const modLessons   = mod.lessons
            const modCompleted = modLessons.filter(l => progress[l.key]).length
            const modTotal     = modLessons.length
            const modPct       = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0
            const isModDone    = modPct === 100

            return (
              <div key={mIdx} style={{ background:'var(--surface)', border:`1px solid ${isOpen ? mod.color + '40' : 'var(--border)'}`, borderRadius:18, overflow:'hidden', transition:'border-color 0.2s' }}>

                {/* Module header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : mIdx)}
                  style={{ padding:'20px 24px', cursor:'pointer', display:'flex', alignItems:'center', gap:16, userSelect:'none' }}
                >
                  <div style={{ width:40, height:40, borderRadius:12, background:`${mod.color}18`, border:`1.5px solid ${mod.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {isModDone
                      ? <span style={{ color:mod.color, fontSize:16 }}>✓</span>
                      : <span style={{ fontFamily:'Cormorant Upright, serif', fontSize:18, fontWeight:700, color:mod.color }}>{String(mIdx).padStart(2,'0')}</span>
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <h3 style={{ fontFamily:'Cormorant Upright, serif', fontSize:22, fontWeight:700, color:'var(--text)', margin:0 }}>{mod.title}</h3>
                      {isModDone && <span style={{ background:'rgba(34,197,94,0.1)', color:'#22C55E', fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:999, fontFamily:'Poppins, sans-serif' }}>COMPLETE</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ flex:1, height:4, background:'var(--bg3)', borderRadius:999, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${modPct}%`, background:mod.color, borderRadius:999, transition:'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'var(--text3)', fontWeight:600, flexShrink:0 }}>{modCompleted}/{modTotal}</span>
                    </div>
                  </div>
                  <div style={{ color:'var(--text3)', fontSize:18, transition:'transform 0.25s', transform:isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink:0 }}>⌄</div>
                </div>

                {/* Lessons */}
                {isOpen && (
                  <div style={{ borderTop:`1px solid ${mod.color}20` }}>
                    {modLessons.map((lesson, lIdx) => {
                      const isDone = progress[lesson.key] === true
                      const isNext = next?.key === lesson.key
                      return (
                        <div
                          key={lesson.key}
                          onClick={() => goToLesson(lesson)}
                          style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 24px', borderBottom: lIdx < modLessons.length - 1 ? '1px solid var(--border)' : 'none', cursor:'pointer', background: isNext ? `${mod.color}07` : 'transparent', transition:'background 0.15s' }}
                          onMouseEnter={e => { if (!isNext) e.currentTarget.style.background='var(--bg2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = isNext ? `${mod.color}07` : 'transparent' }}
                        >
                          <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0, background: isDone ? mod.color : isNext ? `${mod.color}15` : 'var(--bg3)', border: isDone ? 'none' : isNext ? `2px solid ${mod.color}` : '2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {isDone
                              ? <span style={{ color:'#fff', fontSize:12, fontWeight:700 }}>✓</span>
                              : isNext
                                ? <span style={{ fontSize:10 }}>▶</span>
                                : <span style={{ fontFamily:'Poppins, sans-serif', fontSize:11, fontWeight:600, color:'var(--text3)' }}>{lIdx + 1}</span>
                            }
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontFamily:'Poppins, sans-serif', fontSize:14, fontWeight: isNext ? 600 : 500, color: isDone ? 'var(--text2)' : 'var(--text)', marginBottom:2 }}>
                              {lesson.title}
                            </div>
                            {lesson.hasAssignment && (
                              <span style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'var(--text3)' }}>✏️ Assignment</span>
                            )}
                          </div>
                          <span style={{ color: isNext ? mod.color : 'var(--text3)', fontSize:16, flexShrink:0 }}>›</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </StudentLayout>
  )
}