import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

const INVITE_URL = 'https://arizznwyilssuihycbjw.supabase.co/functions/v1/invite-student'
const REMOVE_URL = 'https://arizznwyilssuihycbjw.supabase.co/functions/v1/remove-student'

const STATUS_STYLES = {
  approved:  { bg: 'rgba(34,197,94,0.1)',   color: '#22C55E', label: 'Active'   },
  pending:   { bg: 'rgba(249,165,52,0.1)',  color: '#F9A534', label: 'Pending'  },
  suspended: { bg: 'rgba(239,68,68,0.08)',  color: '#EF4444', label: 'Suspended'},
}

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [filter, setFilter]     = useState('all')  // all | pending | approved | suspended
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)   // student detail modal
  const [showAdd, setShowAdd]   = useState(false)
  const [addForm, setAddForm]   = useState({ full_name: '', email: '' })
  const [addError, setAddError] = useState('')
  const [addSaving, setAddSaving] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null) // student object to remove
  const [removing, setRemoving] = useState(false)

  useEffect(() => { loadStudents() }, [])

  async function loadStudents() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
      setStudents(data || [])
    } catch (err) {
      console.error('[AdminStudents] loadStudents error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function inviteStudent() {
    setAddError('')
    if (!addForm.full_name.trim() || !addForm.email.trim()) {
      setAddError('Both name and email are required.')
      return
    }
    setAddSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(INVITE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ full_name: addForm.full_name.trim(), email: addForm.email.trim() }),
      })
      let json
      try { json = await res.json() } catch { json = {} }
      if (!res.ok) {
        const msg = json.error || ''
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered') || msg.toLowerCase().includes('exists')) {
          setAddError('This email is already registered. Try a different email address.')
        } else {
          setAddError(msg || `Error ${res.status} — check the Supabase Edge Function logs.`)
        }
        return
      }
      setAddSuccess(true)
      loadStudents()
      setTimeout(() => { setShowAdd(false); setAddSuccess(false); setAddForm({ full_name: '', email: '' }) }, 2000)
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAddSaving(false)
    }
  }

  async function removeStudent() {
    if (!confirmRemove) return
    setRemoving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(REMOVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ student_id: confirmRemove.id }),
      })
      const json = await res.json()
      if (!res.ok) { alert(json.error || 'Failed to remove student.'); return }
      setStudents(prev => prev.filter(s => s.id !== confirmRemove.id))
      setConfirmRemove(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setRemoving(false)
    }
  }

  async function updateStatus(id, status) {
    await supabase.from('profiles').update({ status }).eq('id', id)
    if (status === 'approved') {
      await supabase.from('notifications').insert({
        user_id: id, type: 'approved',
        title: 'Your access has been approved!',
        body: 'Welcome to Petra Designs. You can now access the full course.',
        link: '/courses',
      })
    }
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
  }

  const filtered = students.filter(s => {
    const matchStatus = filter === 'all' || s.status === filter
    const matchSearch = !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const counts = {
    all:       students.length,
    pending:   students.filter(s => s.status === 'pending').length,
    approved:  students.filter(s => s.status === 'approved').length,
    suspended: students.filter(s => s.status === 'suspended').length,
  }

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Students</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Manage and monitor all enrolled members</p>
        </div>
        <button onClick={() => { setShowAdd(true); setAddError(''); setAddSuccess(false); setAddForm({ full_name: '', email: '' }) }}
          style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 22px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          + Add Student
        </button>
      </div>

      {/* Auto-approval note */}
      <div style={{ background: 'rgba(71,198,235,0.07)', border: '1px solid rgba(71,198,235,0.2)', borderRadius: 12, padding: '12px 18px', marginBottom: 24, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
        💳 <strong>Students who purchase on Selar are approved automatically.</strong> The Approve button below is for edge cases — gifted access, manual enrolments, or fixing a stuck account.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 0 }}>
        <div>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
          {['all', 'pending', 'approved', 'suspended'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: filter === f ? 'linear-gradient(135deg, #99569F, #ED518E)' : 'transparent', color: filter === f ? '#fff' : 'var(--text2)', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {f} <span style={{ opacity: 0.7 }}>({counts[f]})</span>
            </button>
          ))}
        </div>
        <input
          placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '9px 14px', fontSize: 13, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', outline: 'none', width: 260 }}
          onFocus={e => e.target.style.borderColor = '#99569F'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', background: 'var(--bg2)', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          {['Student', 'Email', 'Status', 'Actions'].map(h => (
            <div key={h} style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text3)' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>
            {search ? 'No students match your search.' : 'No students in this category.'}
          </div>
        ) : (
          filtered.map((s, i) => {
            const st = STATUS_STYLES[s.status] || STATUS_STYLES.pending
            return (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>
                    {s.full_name?.[0] || '?'}
                  </div>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{s.full_name}</span>
                </div>
                {/* Email */}
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)' }}>{s.email}</span>
                {/* Status */}
                <span style={{ display: 'inline-flex', alignItems: 'center', background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', width: 'fit-content' }}>
                  {st.label}
                </span>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.status === 'pending' && (
                    <button onClick={() => updateStatus(s.id, 'approved')} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                      Approve
                    </button>
                  )}
                  {s.status === 'approved' && (
                    <button onClick={() => updateStatus(s.id, 'suspended')} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                      Suspend
                    </button>
                  )}
                  {s.status === 'suspended' && (
                    <button onClick={() => updateStatus(s.id, 'approved')} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                      Reinstate
                    </button>
                  )}
                  <button onClick={() => setConfirmRemove(s)} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                    Remove
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
      {/* Confirm Remove modal */}
      {confirmRemove && (
        <div onClick={() => !removing && setConfirmRemove(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', width: '100%', maxWidth: 420, padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Remove student?</h3>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 24 }}>
              This will permanently delete <strong style={{ color: 'var(--text)' }}>{confirmRemove.full_name}</strong> ({confirmRemove.email}) and revoke all their access. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmRemove(null)} disabled={removing}
                style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text2)', borderRadius: 999, padding: '12px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={removeStudent} disabled={removing}
                style={{ flex: 1, background: removing ? 'var(--bg3)' : '#EF4444', color: '#fff', border: 'none', borderRadius: 999, padding: '12px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: removing ? 'not-allowed' : 'pointer' }}>
                {removing ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student modal */}
      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', width: '100%', maxWidth: 460, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Add New Student</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text3)', cursor: 'pointer' }}>×</button>
            </div>

            {addSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>Invite sent!</p>
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{addForm.email} will receive an email to set their password.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Full name</label>
                  <input
                    value={addForm.full_name}
                    onChange={e => setAddForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="e.g. Amara Johnson"
                    style={{ width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#99569F'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>Email address</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="student@example.com"
                    style={{ width: '100%', background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#99569F'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    onKeyDown={e => e.key === 'Enter' && inviteStudent()}
                  />
                </div>
                {addError && (
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#EF4444' }}>
                    {addError}
                  </div>
                )}
                <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.6 }}>
                  The student will receive an email with a link to set their password and access the course.
                </p>
                <button onClick={inviteStudent} disabled={addSaving}
                  style={{ width: '100%', background: addSaving ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '13px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: addSaving ? 'not-allowed' : 'pointer' }}>
                  {addSaving ? 'Sending invite...' : 'Send Invite ✓'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
