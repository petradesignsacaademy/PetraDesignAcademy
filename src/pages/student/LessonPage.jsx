import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StudentLayout from '../../components/layout/StudentLayout'
import { COURSE, getLesson, getAdjacentLessons } from '../../data/courseData'

export default function LessonPage() {
  const { mIdx, lIdx }  = useParams()
  const moduleIdx        = parseInt(mIdx, 10)
  const lessonIdx        = parseInt(lIdx, 10)
  const { user }         = useAuth()
  const navigate         = useNavigate()

  const lesson  = getLesson(moduleIdx, lessonIdx)
  const mod     = COURSE.modules[moduleIdx]
  const { prev, next } = lesson ? getAdjacentLessons(moduleIdx, lessonIdx) : { prev: null, next: null }
  const modLessons = mod?.lessons || []

  const [progress,    setProgress]    = useState({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [tab,         setTab]         = useState('overview')
  const [saving,      setSaving]      = useState(false)

  const [pdfOpen,            setPdfOpen]            = useState(false)
  const [answerText,         setAnswerText]         = useState('')
  const [driveLink,          setDriveLink]          = useState('')
  const [submitting,         setSubmitting]         = useState(false)
  const [submitted,          setSubmitted]          = useState(false)
  const [existingSubmission, setExistingSubmission] = useState(null)

  useEffect(() => {
    if (user && lesson) {
      setTab('overview')
      setPdfOpen(!lesson.videoId && !!lesson.pdf)
      loadProgress()
      if (lesson.hasAssignment) loadSubmission()
    }
  }, [mIdx, lIdx, user])

  async function loadProgress() {
    try {
      const keys = modLessons.map(l => l.key)
      if (keys.length === 0) return
      const { data } = await supabase
        .from('course_progress')
        .select('lesson_key, is_completed')
        .eq('student_id', user.id)
        .in('lesson_key', keys)
      const map = {}
      data?.forEach(r => { map[r.lesson_key] = r.is_completed })
      setProgress(map)
      setIsCompleted(map[lesson.key] || false)
    } catch (err) {
      console.error('[LessonPage] loadProgress error:', err)
    }
  }

  async function loadSubmission() {
    try {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', user.id)
        .eq('lesson_id', lesson.key)
        .maybeSingle()
      if (data) {
        setExistingSubmission(data)
        setSubmitted(true)
        setAnswerText(data.written_answer || '')
        setDriveLink(data.file_url || '')
      }
    } catch (err) {
      console.error('[LessonPage] loadSubmission error:', err)
    }
  }

  async function toggleComplete() {
    setSaving(true)
    const newVal = !isCompleted
    const now    = new Date().toISOString()

    const { error } = await supabase
      .from('course_progress')
      .upsert({ student_id: user.id, lesson_key: lesson.key, is_completed: newVal, completed_at: newVal ? now : null },
               { onConflict: 'student_id,lesson_key' })

    if (!error) {
      setIsCompleted(newVal)
      setProgress(p => ({ ...p, [lesson.key]: newVal }))
      if (newVal && next) {
        setTimeout(() => navigate(`/courses/m/${next.moduleIdx}/l/${next.lessonIdx}`), 800)
      }
    }
    setSaving(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmedLink = driveLink.trim()
    if (!answerText && !trimmedLink) return
    setSubmitting(true)

    const { error } = await supabase
      .from('submissions')
      .upsert({
        student_id:     user.id,
        lesson_id:      lesson.key,
        written_answer: answerText,
        file_url:       trimmedLink || null,
        file_name:      null,
        status:         'submitted',
        submitted_at:   new Date().toISOString(),
      }, { onConflict: 'student_id,lesson_id' })

    if (!error) setSubmitted(true)
    setSubmitting(false)
  }

  if (!lesson) {
    return (
      <StudentLayout>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center', padding:24 }}>
          <div>
            <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
            <p style={{ fontFamily:'Poppins, sans-serif', color:'var(--text2)', fontSize:15 }}>Lesson not found.</p>
            <Link to="/courses" style={{ marginTop:16, display:'inline-block', color:'var(--purple)', fontFamily:'Poppins, sans-serif', fontWeight:600 }}>← Back to course</Link>
          </div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', minHeight:'calc(100vh - 64px)' }}>

        {/* Main content */}
        <div style={{ borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'auto' }}>

          {/* Video */}
          <div style={{ background:'#000', position:'relative', width:'100%' }}>
            {lesson.videoId ? (
              <div style={{ position:'relative', paddingTop:'56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0&modestbranding=1`}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
                />
              </div>
            ) : (
              <div style={{ aspectRatio:'16/9', background:'linear-gradient(135deg, #12133C, #2D1060)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{lesson.pdf ? '📄' : '🎬'}</div>
                <p style={{ fontFamily:'Poppins, sans-serif', color:'rgba(255,255,255,0.6)', fontSize:15, fontWeight:600 }}>{lesson.pdf ? 'PDF Lesson' : 'Video coming soon'}</p>
                {lesson.pdf && <p style={{ fontFamily:'Poppins, sans-serif', color:'rgba(255,255,255,0.35)', fontSize:13 }}>Scroll down to read the resource below</p>}
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div style={{ padding:'28px 32px', flex:1 }}>

            {/* Breadcrumb */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16, fontFamily:'Poppins, sans-serif', fontSize:12, color:'var(--text3)' }}>
              <Link to="/courses" style={{ color:'var(--purple)', textDecoration:'none', fontWeight:600 }}>Course</Link>
              <span>›</span>
              <span>{mod.title}</span>
            </div>

            {/* Title + complete button */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, marginBottom:24 }}>
              <h1 style={{ fontFamily:'Cormorant Upright, serif', fontSize:36, fontWeight:700, color:'var(--text)', lineHeight:1.1 }}>{lesson.title}</h1>
              <button
                onClick={toggleComplete}
                disabled={saving}
                style={{ background: isCompleted ? 'rgba(34,197,94,0.1)' : 'var(--surface)', border:`1.5px solid ${isCompleted ? '#22C55E' : 'var(--border)'}`, color: isCompleted ? '#22C55E' : 'var(--text2)', padding:'9px 18px', borderRadius:999, fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, cursor: saving ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'all 0.2s' }}
              >
                {saving ? '...' : isCompleted ? '✓ Completed' : 'Mark complete'}
              </button>
            </div>

            {lesson.hasAssignment && (
              <div style={{ marginBottom:24 }}>
                <span style={{ fontFamily:'Poppins, sans-serif', fontSize:13, color:'var(--pink)', background:'rgba(237,81,142,0.08)', padding:'4px 12px', borderRadius:999, fontWeight:600 }}>✏️ Includes assignment</span>
              </div>
            )}

            {/* PDF resource toggle — visible from any tab */}
            {lesson.pdf && (
              <div style={{ marginBottom:24 }}>
                <button
                  onClick={() => setPdfOpen(o => !o)}
                  style={{ background: pdfOpen ? 'rgba(153,86,159,0.1)' : 'var(--surface)', border:`1.5px solid ${pdfOpen ? 'var(--purple)' : 'var(--border)'}`, color: pdfOpen ? 'var(--purple)' : 'var(--text2)', padding:'9px 18px', borderRadius:999, fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8, transition:'all 0.2s' }}
                >
                  📄 {pdfOpen ? 'Hide' : 'View'} PDF Resource
                </button>
                {pdfOpen && (
                  <div style={{ marginTop:12, border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                    <div style={{ background:'var(--surface)', padding:'10px 16px', borderBottom:'1px solid var(--border)', fontFamily:'Poppins, sans-serif', fontSize:13, fontWeight:600, color:'var(--text2)' }}>
                      📄 {lesson.pdf.title}
                    </div>
                    <iframe
                      src={`https://drive.google.com/file/d/${lesson.pdf.driveId}/preview`}
                      width="100%"
                      height="520"
                      allow="autoplay"
                      style={{ border:'none', display:'block' }}
                      title={lesson.pdf.title}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:24 }}>
              {[
                { key:'overview',    label:'📖 Overview' },
                { key:'assignment',  label:'✏️ Assignment', hidden: !lesson.hasAssignment },
              ].filter(t => !t.hidden).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{ padding:'10px 20px', background:'none', border:'none', borderBottom:`2px solid ${tab === t.key ? 'var(--purple)' : 'transparent'}`, color: tab === t.key ? 'var(--purple)' : 'var(--text3)', fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.2s', marginBottom:-1 }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {tab === 'overview' && (
              <div style={{ animation:'fadeIn 0.3s ease' }}>
                {lesson.description
                  ? <p style={{ fontFamily:'Poppins, sans-serif', color:'var(--text2)', fontSize:15, lineHeight:1.85 }}>{lesson.description}</p>
                  : <p style={{ fontFamily:'Poppins, sans-serif', color:'var(--text3)', fontSize:14, fontStyle:'italic' }}>No description added yet.</p>
                }
              </div>
            )}

            {/* Assignment tab */}
            {tab === 'assignment' && lesson.hasAssignment && (
              <div style={{ animation:'fadeIn 0.3s ease' }}>
                {lesson.assignmentBrief && (
                  <div style={{ background:'rgba(237,81,142,0.06)', border:'1px solid rgba(237,81,142,0.15)', borderRadius:14, padding:'18px 20px', marginBottom:24 }}>
                    <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:13, color:'var(--pink)', marginBottom:10 }}>✏️ Assignment Brief</div>
                    <p style={{ fontFamily:'Poppins, sans-serif', fontSize:14, color:'var(--text2)', lineHeight:1.8 }}>{lesson.assignmentBrief}</p>
                  </div>
                )}

                {existingSubmission?.status === 'reviewed' && (
                  <div style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:14, padding:'18px 20px', marginBottom:24 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:13, color:'#22C55E' }}>✓ Feedback from Petra</div>
                      {existingSubmission.star_rating && (
                        <div style={{ display:'flex', gap:2 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize:16, color: s <= existingSubmission.star_rating ? '#F9A534' : 'var(--bg3)' }}>★</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <p style={{ fontFamily:'Poppins, sans-serif', fontSize:14, color:'var(--text2)', lineHeight:1.8 }}>{existingSubmission.feedback_text}</p>
                  </div>
                )}

                {submitted && existingSubmission?.status !== 'reviewed' ? (
                  <div style={{ background:'rgba(153,86,159,0.06)', border:'1px solid rgba(153,86,159,0.2)', borderRadius:14, padding:'24px', textAlign:'center', marginBottom:24 }}>
                    <div style={{ fontSize:36, marginBottom:12 }}>📬</div>
                    <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:15, color:'var(--purple)', marginBottom:6 }}>Assignment submitted!</div>
                    <p style={{ fontFamily:'Poppins, sans-serif', fontSize:13, color:'var(--text3)' }}>Petra will review your work and post feedback here. Check back soon.</p>
                    <button onClick={() => setSubmitted(false)} style={{ marginTop:14, background:'none', border:'1px solid var(--border)', color:'var(--text3)', padding:'7px 16px', borderRadius:999, fontFamily:'Poppins, sans-serif', fontSize:12, fontWeight:600, cursor:'pointer' }}>Edit submission</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <div>
                      <label style={{ display:'block', fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, color:'var(--text2)', marginBottom:8 }}>
                        Google Drive link <span style={{ color:'var(--text3)', fontWeight:400 }}>(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={driveLink}
                        onChange={e => setDriveLink(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        style={{ width:'100%', background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--text)', fontFamily:'Poppins, sans-serif', outline:'none', boxSizing:'border-box' }}
                        onFocus={e => e.target.style.borderColor='#99569F'}
                        onBlur={e => e.target.style.borderColor='var(--border)'}
                      />
                      <p style={{ fontFamily:'Poppins, sans-serif', fontSize:12, color:'var(--text3)', marginTop:6 }}>
                        Upload your work to Google Drive, set sharing to <strong>Anyone with the link can view</strong>, then paste the link above.
                      </p>
                    </div>
                    <div>
                      <label style={{ display:'block', fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, color:'var(--text2)', marginBottom:8 }}>
                        Written notes / questions for Petra <span style={{ color:'var(--text3)', fontWeight:400 }}>(optional)</span>
                      </label>
                      <textarea
                        value={answerText} onChange={e => setAnswerText(e.target.value)}
                        placeholder="Share your thought process, any questions, or notes about your submission..."
                        rows={4}
                        style={{ width:'100%', background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--text)', fontFamily:'Poppins, sans-serif', resize:'vertical', outline:'none', lineHeight:1.6 }}
                        onFocus={e => e.target.style.borderColor='#99569F'}
                        onBlur={e => e.target.style.borderColor='var(--border)'}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || (!driveLink.trim() && !answerText)}
                      style={{ background: submitting || (!driveLink.trim() && !answerText) ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)', color:'#fff', border:'none', borderRadius:999, padding:'13px 28px', fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:14, cursor: submitting || (!driveLink.trim() && !answerText) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:8, alignSelf:'flex-start' }}
                    >
                      {submitting
                        ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }} />Submitting...</>
                        : existingSubmission ? 'Update submission' : 'Submit assignment'
                      }
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Prev / Next nav */}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:40, paddingTop:24, borderTop:'1px solid var(--border)' }}>
              {prev ? (
                <button onClick={() => navigate(`/courses/m/${prev.moduleIdx}/l/${prev.lessonIdx}`)} style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text2)', padding:'10px 20px', borderRadius:999, fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                  ← {prev.title}
                </button>
              ) : <div />}
              {next ? (
                <button onClick={() => navigate(`/courses/m/${next.moduleIdx}/l/${next.lessonIdx}`)} style={{ background:'linear-gradient(135deg, #99569F, #ED518E)', color:'#fff', border:'none', padding:'10px 20px', borderRadius:999, fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                  {next.title} →
                </button>
              ) : <div />}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lesson-sidebar" style={{ background:'var(--bg2)', overflowY:'auto', position:'sticky', top:64, height:'calc(100vh - 64px)' }}>
          <div style={{ padding:'20px 16px', borderBottom:'1px solid var(--border)' }}>
            <Link to="/courses" style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'Poppins, sans-serif', fontSize:12, color:'var(--text3)', textDecoration:'none', marginBottom:10, fontWeight:600 }}>
              ← All modules
            </Link>
            <div style={{ fontFamily:'Poppins, sans-serif', fontSize:10, fontWeight:700, letterSpacing:2, color:'var(--text3)', marginBottom:4 }}>MODULE {String(moduleIdx + 1).padStart(2,'0')}</div>
            <div style={{ fontFamily:'Cormorant Upright, serif', fontSize:18, fontWeight:700, color:'var(--text)', lineHeight:1.2 }}>{mod.title}</div>
            <div style={{ marginTop:12 }}>
              <div style={{ height:4, background:'var(--bg3)', borderRadius:999, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${modLessons.length > 0 ? Math.round((modLessons.filter(l => progress[l.key]).length / modLessons.length) * 100) : 0}%`, background:mod.color, borderRadius:999, transition:'width 0.5s' }} />
              </div>
              <div style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'var(--text3)', marginTop:5 }}>
                {modLessons.filter(l => progress[l.key]).length}/{modLessons.length} complete
              </div>
            </div>
          </div>

          <div style={{ padding:'8px 8px' }}>
            {modLessons.map((l, i) => {
              const isCurrent = l.lessonIdx === lessonIdx && l.moduleIdx === moduleIdx
              const isDone    = progress[l.key]
              return (
                <div
                  key={l.key}
                  onClick={() => navigate(`/courses/m/${l.moduleIdx}/l/${l.lessonIdx}`)}
                  style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'11px 10px', borderRadius:12, marginBottom:2, cursor:'pointer', background: isCurrent ? 'rgba(153,86,159,0.1)' : 'transparent', border: isCurrent ? '1px solid rgba(153,86,159,0.2)' : '1px solid transparent', transition:'all 0.15s' }}
                  onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background='var(--bg3)' }}
                  onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background='transparent' }}
                >
                  <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, marginTop:1, background: isDone ? 'rgba(34,197,94,0.12)' : isCurrent ? 'rgba(153,86,159,0.12)' : 'var(--bg3)', border:`1.5px solid ${isDone ? '#22C55E' : isCurrent ? 'var(--purple)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {isDone
                      ? <span style={{ fontSize:10, color:'#22C55E', fontWeight:700 }}>✓</span>
                      : <span style={{ fontFamily:'Poppins, sans-serif', fontSize:10, fontWeight:700, color: isCurrent ? 'var(--purple)' : 'var(--text3)' }}>{i + 1}</span>
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'Poppins, sans-serif', fontSize:13, fontWeight: isCurrent ? 600 : 500, color: isCurrent ? 'var(--purple)' : isDone ? 'var(--text2)' : 'var(--text)', lineHeight:1.3, marginBottom:3 }}>{l.title}</div>
                    <div style={{ display:'flex', gap:4 }}>
                      {l.hasAssignment && <span style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'var(--text3)' }}>✏️</span>}
                      {l.pdf && <span style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'var(--text3)' }}>📄</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) { .lesson-sidebar { display: none !important; } }
      `}</style>
    </StudentLayout>
  )
}