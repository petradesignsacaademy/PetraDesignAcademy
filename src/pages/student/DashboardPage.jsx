import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import StudentLayout from '../../components/layout/StudentLayout'
import { COURSE, ALL_LESSONS, getLessonByKey } from '../../data/courseData'

function ProgressRing({ percent, color = 'var(--purple)', size = 80 }) {
  const r    = (size - 8) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ - (percent / 100) * circ}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

export default function DashboardPage() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()

  const [progress,       setProgress]       = useState({})
  const [announcements,  setAnnouncements]  = useState([])
  const [recentFeedback, setRecentFeedback] = useState([])
  const [loading,        setLoading]        = useState(true)

  useEffect(() => { if (user) loadDashboard() }, [user])

  async function loadDashboard() {
    setLoading(true)
    try {
      // Progress from course_progress table (uses lesson keys from static data)
      const { data: prog } = await supabase
        .from('course_progress')
        .select('lesson_key, is_completed')
        .eq('student_id', user.id)
        .in('lesson_key', ALL_LESSONS.map(l => l.key))
      const map = {}
      prog?.forEach(p => { map[p.lesson_key] = p.is_completed })
      setProgress(map)

      // Latest announcements
      const { data: ann } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      setAnnouncements(ann || [])

      // Recent reviewed submissions (no JOIN — look up lesson from static data)
      const { data: subs } = await supabase
        .from('submissions')
        .select('id, lesson_id, feedback_text, star_rating, reviewed_at, status')
        .eq('student_id', user.id)
        .eq('status', 'reviewed')
        .order('reviewed_at', { ascending: false })
        .limit(3)
      setRecentFeedback(subs || [])

    } catch (err) { console.error('[Dashboard]', err) }
    finally { setLoading(false) }
  }

  const completedCount = ALL_LESSONS.filter(l => progress[l.key]).length
  const totalCount     = ALL_LESSONS.length
  const overallPct     = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const nextLesson     = ALL_LESSONS.find(l => !progress[l.key]) || null

  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  if (loading) return (
    <StudentLayout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--border)', borderTopColor:'var(--purple)', animation:'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </StudentLayout>
  )

  return (
    <StudentLayout>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'36px 32px' }} className="dashboard-wrap">

        {/* Greeting */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:'Cormorant Upright, serif', fontSize:42, fontWeight:700, color:'var(--text)', lineHeight:1.1, marginBottom:6 }}>
            {greeting}, {firstName} ✨
          </h1>
          <p style={{ fontFamily:'Poppins, sans-serif', color:'var(--text3)', fontSize:14 }}>
            {overallPct === 0   ? "You haven't started the course yet — let's go!"
           : overallPct === 100 ? "You've completed the course! Amazing work."
                                : `You're ${overallPct}% through the course. Keep going!`}
          </p>
        </div>

        {/* Top grid: progress + continue */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }} className="dash-top-grid">

          {/* Progress card */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'24px 28px', display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <ProgressRing percent={overallPct} size={80} />
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:'Cormorant Upright, serif', fontSize:18, fontWeight:700, color:'var(--text)' }}>{overallPct}%</span>
              </div>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'Poppins, sans-serif', fontSize:11, fontWeight:700, letterSpacing:2, color:'var(--text3)', marginBottom:6 }}>COURSE PROGRESS</div>
              <div style={{ fontFamily:'Cormorant Upright, serif', fontSize:28, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{completedCount} / {totalCount}</div>
              <div style={{ fontFamily:'Poppins, sans-serif', fontSize:13, color:'var(--text3)', marginBottom:12 }}>lessons completed</div>
              {/* Per-module breakdown */}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {COURSE.modules.map((mod) => {
                  const done  = mod.lessons.filter(l => progress[l.key]).length
                  const total = mod.lessons.length
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
                  return (
                    <div key={mod.index} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:mod.color, flexShrink:0 }} />
                      <div style={{ flex:1, height:4, background:'var(--bg3)', borderRadius:999, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:mod.color, borderRadius:999, transition:'width 0.8s ease' }} />
                      </div>
                      <span style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'var(--text3)', flexShrink:0 }}>{done}/{total}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Continue / completed card */}
          {overallPct === 100 ? (
            <div style={{ background:'linear-gradient(135deg, #12133C, #2D1060)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:20, padding:'24px 28px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🏆</div>
              <div>
                <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:15, color:'#22C55E', marginBottom:4 }}>Course Complete!</div>
                <div style={{ fontFamily:'Poppins, sans-serif', fontSize:13, color:'rgba(255,255,255,0.5)' }}>Amazing work — you did it.</div>
              </div>
            </div>
          ) : nextLesson ? (
            <div
              onClick={() => navigate(`/courses/m/${nextLesson.moduleIdx}/l/${nextLesson.lessonIdx}`)}
              style={{ background:'linear-gradient(135deg, #12133C, #2D1060)', border:'1px solid rgba(153,86,159,0.3)', borderRadius:20, padding:'24px 28px', cursor:'pointer', display:'flex', flexDirection:'column', justifyContent:'space-between', transition:'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
            >
              <div>
                <div style={{ fontFamily:'Poppins, sans-serif', fontSize:10, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,0.4)', marginBottom:12 }}>CONTINUE LEARNING</div>
                <div style={{ fontFamily:'Cormorant Upright, serif', fontSize:26, fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:6 }}>{nextLesson.title}</div>
                <div style={{ fontFamily:'Poppins, sans-serif', fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>{COURSE.modules[nextLesson.moduleIdx].title}</div>
              </div>
              <span style={{ background:'linear-gradient(135deg, #99569F, #ED518E)', color:'#fff', padding:'10px 20px', borderRadius:999, fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:13, display:'inline-flex', alignItems:'center', gap:6, width:'fit-content' }}>
                ▶ Continue →
              </span>
            </div>
          ) : (
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'24px 28px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', gap:12 }}>
              <div style={{ fontSize:36 }}>📚</div>
              <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:14, color:'var(--text)' }}>Ready to start?</div>
              <button onClick={() => navigate('/courses')} style={{ background:'linear-gradient(135deg, #99569F, #ED518E)', color:'#fff', border:'none', borderRadius:999, padding:'10px 22px', fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:13, cursor:'pointer' }}>Go to Course →</button>
            </div>
          )}
        </div>

        {/* Bottom grid: announcements + feedback */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="dash-bottom-grid">

          {/* Announcements */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'22px 24px' }}>
            <h3 style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:16 }}>📣 Announcements</h3>
            {announcements.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', fontFamily:'Poppins, sans-serif', color:'var(--text3)', fontSize:13 }}>No announcements yet.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {announcements.map((a, i) => (
                  <div key={a.id} style={{ paddingBottom:12, borderBottom: i < announcements.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, color:'var(--text)', marginBottom:3 }}>{a.title}</div>
                    <div style={{ fontFamily:'Poppins, sans-serif', fontSize:12, color:'var(--text2)', lineHeight:1.6, marginBottom:4 }}>{a.content?.substring(0, 100)}{a.content?.length > 100 ? '...' : ''}</div>
                    <div style={{ fontFamily:'Poppins, sans-serif', fontSize:11, color:'var(--text3)' }}>{new Date(a.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent feedback */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'22px 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontFamily:'Poppins, sans-serif', fontWeight:700, fontSize:14, color:'var(--text)' }}>💬 Recent Feedback</h3>
              {recentFeedback.length > 0 && (
                <button onClick={() => navigate('/assignments')} style={{ background:'none', border:'none', color:'var(--purple)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Poppins, sans-serif' }}>View all →</button>
              )}
            </div>
            {recentFeedback.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>✏️</div>
                <div style={{ fontFamily:'Poppins, sans-serif', color:'var(--text3)', fontSize:13 }}>No feedback yet. Complete a lesson with an assignment to get started.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {recentFeedback.map((sub, i) => {
                  const lesson = getLessonByKey(sub.lesson_id)
                  return (
                    <div key={sub.id} style={{ paddingBottom:12, borderBottom: i < recentFeedback.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                        <div style={{ fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:13, color:'var(--text)' }}>{lesson?.title || sub.lesson_id}</div>
                        {sub.star_rating && (
                          <div style={{ display:'flex', gap:1, flexShrink:0 }}>
                            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize:11, color: s <= sub.star_rating ? '#F9A534' : 'var(--bg3)' }}>★</span>)}
                          </div>
                        )}
                      </div>
                      <div style={{ fontFamily:'Poppins, sans-serif', fontSize:12, color:'var(--text2)', lineHeight:1.6, fontStyle:'italic' }}>
                        "{sub.feedback_text?.substring(0, 90)}{sub.feedback_text?.length > 90 ? '...' : ''}"
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }} className="dash-quick-links">
          {[
            { label:'My Course',   icon:'📚', to:'/courses',     color:'#99569F' },
            { label:'Assignments', icon:'✏️', to:'/assignments', color:'#ED518E' },
            { label:'Community',   icon:'💬', to:'/community',   color:'#47C6EB' },
            { label:'My Account',  icon:'👤', to:'/account',     color:'#F9A534' },
          ].map(({ label, icon, to, color }) => (
            <div key={to} onClick={() => navigate(to)}
              style={{ background:'var(--surface)', border:`1px solid ${color}20`, borderRadius:14, padding:'16px', textAlign:'center', cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=`${color}50`; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=`${color}20`; e.currentTarget.style.transform='translateY(0)' }}
            >
              <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
              <div style={{ fontFamily:'Poppins, sans-serif', fontSize:12, fontWeight:600, color:'var(--text2)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .dashboard-wrap  { padding: 24px 16px !important; }
          .dash-top-grid   { grid-template-columns: 1fr !important; }
          .dash-bottom-grid{ grid-template-columns: 1fr !important; }
          .dash-quick-links{ grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </StudentLayout>
  )
}