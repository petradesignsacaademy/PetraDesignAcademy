import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => onChange(s)}
          style={{ fontSize: 24, cursor: 'pointer', color: s <= (hover || value) ? '#F9A534' : 'var(--bg3)', transition: 'color 0.1s' }}>★</span>
      ))}
    </div>
  )
}

export default function AdminAssignments() {
  const [submissions, setSubmissions] = useState([])
  const [filter, setFilter]  = useState('submitted') // submitted | reviewed
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [stars, setStars]    = useState(0)
  const [saving, setSaving]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSubmissions() }, [filter])

  async function loadSubmissions() {
    setLoading(true)
    const { data } = await supabase
      .from('submissions')
      .select('*, profiles(full_name, email, avatar_url), lessons(title, module_id, modules(title))')
      .eq('status', filter)
      .order('submitted_at', { ascending: false })
    setSubmissions(data || [])
    setLoading(false)
  }

  function openReview(sub) {
    setSelected(sub)
    setFeedback(sub.feedback_text || '')
    setStars(sub.star_rating || 0)
  }

  async function submitFeedback() {
    if (!feedback && !stars) return
    setSaving(true)
    await supabase.from('submissions').update({
      feedback_text: feedback,
      star_rating:   stars || null,
      status:        'reviewed',
      reviewed_at:   new Date().toISOString(),
    }).eq('id', selected.id)

    // Notify the student
    await supabase.from('notifications').insert({
      user_id: selected.student_id,
      type:    'feedback_posted',
      title:   'Petra reviewed your assignment!',
      body:    `Feedback on: ${selected.lessons?.title}`,
      link:    `/courses`,
    })

    setSaving(false)
    setSelected(null)
    loadSubmissions()
  }

  const counts = { submitted: 0, reviewed: 0 }
  // We load per-filter so just track via label

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Assignments</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Review student submissions and give feedback</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, width: 'fit-content', marginBottom: 24 }}>
        {[['submitted', '📬 To Review'], ['reviewed', '✓ Reviewed']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: filter === val ? 'linear-gradient(135deg, #99569F, #ED518E)' : 'transparent', color: filter === val ? '#fff' : 'var(--text2)', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, padding: 24 }}>Loading...</div>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{filter === 'submitted' ? '🎉' : '📭'}</div>
          <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>
            {filter === 'submitted' ? "All caught up!" : "No reviewed assignments yet"}
          </h3>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>
            {filter === 'submitted' ? "No assignments waiting for review." : "Reviewed assignments will appear here."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {submissions.map(sub => (
            <div key={sub.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>
                  {sub.profiles?.full_name?.[0] || '?'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>
                    {sub.profiles?.full_name} — <span style={{ color: 'var(--purple)' }}>{sub.lessons?.title}</span>
                  </div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>
                    {sub.lessons?.modules?.title} · Submitted {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  {sub.written_answer && (
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text2)', marginTop: 6, padding: '8px 12px', background: 'var(--bg2)', borderRadius: 8, maxWidth: 500 }}>
                      "{sub.written_answer.substring(0, 140)}{sub.written_answer.length > 140 ? '...' : ''}"
                    </div>
                  )}
                  {sub.star_rating && filter === 'reviewed' && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 14, color: s <= sub.star_rating ? '#F9A534' : 'var(--bg3)' }}>★</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                {sub.file_url && (
                  <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ background: 'rgba(71,198,235,0.1)', border: '1px solid rgba(71,198,235,0.2)', color: 'var(--blue)', padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: 'Poppins, sans-serif' }}>
                    👁 View file
                  </a>
                )}
                {filter === 'submitted' ? (
                  <button onClick={() => openReview(sub)} style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Give Feedback
                  </button>
                ) : (
                  <button onClick={() => openReview(sub)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', padding: '7px 14px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Edit Feedback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', width: '100%', maxWidth: 520, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>Give Feedback</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text3)', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
                {selected.profiles?.full_name} — {selected.lessons?.title}
              </div>
              {selected.written_answer && (
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)', marginTop: 6, fontStyle: 'italic' }}>
                  "{selected.written_answer}"
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Star rating</label>
              <StarPicker value={stars} onChange={setStars} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Written feedback</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={5} placeholder="Write your feedback for this student..."
                style={{ width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                onFocus={e => e.target.style.borderColor = '#99569F'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button onClick={submitFeedback} disabled={saving || (!feedback && !stars)} style={{ width: '100%', background: saving || (!feedback && !stars) ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '13px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {saving ? 'Sending...' : 'Send feedback to student ✓'}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
