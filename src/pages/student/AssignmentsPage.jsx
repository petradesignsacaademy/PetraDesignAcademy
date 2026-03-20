import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StudentLayout from '../../components/layout/StudentLayout'
import { getLessonByKey, COURSE } from '../../data/courseData'

const STATUS = {
  submitted: { label: 'Under Review', color: '#F9A534', bg: 'rgba(249,165,52,0.1)' },
  reviewed:  { label: 'Reviewed',     color: '#22C55E', bg: 'rgba(34,197,94,0.1)'  },
  pending:   { label: 'Not Started',  color: '#9896B8', bg: 'rgba(152,150,184,0.1)' },
}

export default function AssignmentsPage() {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('all')

  useEffect(() => { loadSubmissions() }, [user])

  async function loadSubmissions() {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try {
      // No JOIN to lessons table — lesson info comes from static courseData
      const { data } = await supabase
        .from('submissions')
        .select('id, lesson_id, file_url, file_name, written_answer, status, submitted_at, feedback_text, star_rating, reviewed_at')
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
      setSubmissions(data || [])
    } catch (err) {
      console.error('[Assignments] loadSubmissions error:', err)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { key: 'all',       label: 'All' },
    { key: 'submitted', label: 'Under Review' },
    { key: 'reviewed',  label: 'Reviewed' },
  ]

  const filtered = activeTab === 'all' ? submissions : submissions.filter(s => s.status === activeTab)

  if (loading) return (
    <StudentLayout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--purple)', animation:'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </StudentLayout>
  )

  return (
    <StudentLayout>
      <div style={{ maxWidth:860, margin:'0 auto', padding:'36px 32px' }} className="page-wrap">

        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:'Cormorant Upright, serif', fontSize:42, fontWeight:700, color:'var(--text)', marginBottom:6 }}>My Assignments</h1>
          <p style={{ fontFamily:'Poppins, sans-serif', color:'var(--text3)', fontSize:14 }}>Track your submissions and feedback from Petra.</p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:24, background:'var(--surface)', borderRadius:12, padding:4, width:'fit-content' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ background: activeTab === t.key ? 'var(--purple)' : 'transparent', color: activeTab === t.key ? '#fff' : 'var(--text3)', border:'none', borderRadius:8, padding:'8px 18px', fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.2s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 24px', background:'var(--surface)', borderRadius:20, border:'1px solid var(--border)' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>✏️</div>
            <h3 style={{ fontFamily:'Cormorant Upright, serif', fontSize:28, color:'var(--text)', marginBottom:8 }}>No assignments yet</h3>
            <p style={{ fontFamily:'Poppins, sans-serif', color:'var(--text3)', fontSize:14, marginBottom:24 }}>Complete lessons with assignments to see them here.</p>
            <button onClick={() => navigate('/courses')} style={{ background:'linear-gradient(135deg, #99569F, #ED518E)', color:'#fff', border:'none', borderRadius:999, padding:'12px 28px', fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:14, cursor:'pointer' }}>
              Go to Course →
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {filtered.map(sub => {
              const st     = STATUS[sub.status] || STATUS.pending
              const lesson = getLessonByKey(sub.lesson_id)
              const mod    = lesson ? COURSE.modules[lesson.moduleIdx] : null

              return (
                <div key={sub.id}
                  style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'24px 28px', transition:'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, gap:16, flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontFamily:'Poppins, sans-serif', fontSize:11, fontWeight:700, letterSpacing:1.5, color:'var(--text3)', marginBottom:4 }}>
                        {mod?.title?.toUpperCase() || 'ASSIGNMENT'}
                      </div>
                      <h3 style={{ fontFamily:'Cormorant Upright, serif', fontSize:22, fontWeight:700, color:'var(--text)' }}>
                        {lesson?.title || sub.lesson_id}
                      </h3>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
                      {sub.star_rating && (
                        <div style={{ display:'flex', gap:2 }}>
                          {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:14, color: s <= sub.star_rating ? '#F9A534' : 'var(--bg3)' }}>★</span>)}
                        </div>
                      )}
                      <span style={{ background:st.bg, color:st.color, padding:'4px 12px', borderRadius:999, fontFamily:'Poppins, sans-serif', fontSize:11, fontWeight:700 }}>
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {sub.feedback_text && (
                    <div style={{ background:'var(--bg2)', borderRadius:12, padding:'14px 16px', marginBottom:12, borderLeft:'3px solid var(--purple)' }}>
                      <div style={{ fontFamily:'Poppins, sans-serif', fontSize:11, fontWeight:700, color:'var(--purple)', marginBottom:6, letterSpacing:1 }}>PETRA'S FEEDBACK</div>
                      <p style={{ fontFamily:'Poppins, sans-serif', fontSize:13, color:'var(--text2)', lineHeight:1.7, margin:0 }}>{sub.feedback_text}</p>
                    </div>
                  )}

                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                    <span style={{ fontFamily:'Poppins, sans-serif', fontSize:12, color:'var(--text3)' }}>
                      Submitted {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                      {sub.reviewed_at && ` · Reviewed ${new Date(sub.reviewed_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}`}
                    </span>
                    {lesson && (
                      <button
                        onClick={() => navigate(`/courses/m/${lesson.moduleIdx}/l/${lesson.lessonIdx}`)}
                        style={{ background:'none', border:'1px solid var(--border)', borderRadius:999, padding:'6px 16px', fontFamily:'Poppins, sans-serif', fontSize:12, fontWeight:600, color:'var(--text2)', cursor:'pointer' }}
                      >
                        View Lesson →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .page-wrap { padding: 24px 16px !important; } }
      `}</style>
    </StudentLayout>
  )
}