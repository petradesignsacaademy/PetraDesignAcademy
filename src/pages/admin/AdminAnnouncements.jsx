import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/layout/AdminLayout'

export default function AdminAnnouncements() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]  = useState(true)
  const [composing, setComposing] = useState(false)
  const [title, setTitle]      = useState('')
  const [content, setContent]  = useState('')
  const [sending, setSending]  = useState(false)
  const [sent, setSent]        = useState(false)

  useEffect(() => { loadAnnouncements() }, [])

  async function loadAnnouncements() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
      setAnnouncements(data || [])
    } catch (err) {
      console.error('[AdminAnnouncements] loadAnnouncements error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function sendAnnouncement() {
    if (!title || !content) return
    setSending(true)

    // Save announcement
    await supabase.from('announcements').insert({ title, content, author_id: user.id })

    // Get all approved students and notify them
    const { data: students } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .eq('status', 'approved')

    if (students?.length > 0) {
      const notifications = students.map(s => ({
        user_id: s.id,
        type: 'announcement',
        title,
        body: content.substring(0, 120) + (content.length > 120 ? '...' : ''),
        link: '/community',
      }))
      await supabase.from('notifications').insert(notifications)
    }

    setSending(false)
    setSent(true)
    setTitle('')
    setContent('')
    setTimeout(() => { setSent(false); setComposing(false) }, 2000)
    loadAnnouncements()
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm('Delete this announcement?')) return
    await supabase.from('announcements').delete().eq('id', id)
    loadAnnouncements()
  }

  const inputStyle = { background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', outline: 'none', width: '100%', transition: 'border-color 0.2s' }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Announcements</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Broadcast messages to all approved students</p>
        </div>
        <button onClick={() => setComposing(true)} style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          + New Announcement
        </button>
      </div>

      {/* Compose form */}
      {composing && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px 28px', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>New Announcement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Title</label>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. New lesson published!" onFocus={e => e.target.style.borderColor = '#99569F'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Message</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 120, lineHeight: 1.7 }} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your message to all students..." onFocus={e => e.target.style.borderColor = '#99569F'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={sendAnnouncement} disabled={sending || sent || !title || !content} style={{ background: sent ? 'rgba(34,197,94,0.1)' : (!title || !content) ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)', color: sent ? '#22C55E' : '#fff', border: sent ? '1px solid rgba(34,197,94,0.25)' : 'none', borderRadius: 999, padding: '11px 28px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: !title || !content ? 'not-allowed' : 'pointer' }}>
                {sent ? '✓ Sent to all students!' : sending ? 'Sending...' : 'Send to all students →'}
              </button>
              <button onClick={() => { setComposing(false); setTitle(''); setContent('') }} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 999, padding: '11px 22px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past announcements */}
      <div>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text3)', letterSpacing: 1, marginBottom: 14 }}>PAST ANNOUNCEMENTS</h3>
        {loading ? (
          <div style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Loading...</div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📣</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>No announcements sent yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map(a => (
              <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 8 }}>
                  <h4 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{a.title}</h4>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>
                      {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={() => deleteAnnouncement(a.id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '4px 10px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Delete</button>
                  </div>
                </div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, margin: 0 }}>{a.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
