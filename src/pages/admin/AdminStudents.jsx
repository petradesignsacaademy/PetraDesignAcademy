import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

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

  async function updateStatus(id, status) {
    await supabase.from('profiles').update({ status }).eq('id', id)
    if (status === 'approved') {
      // Send approval notification
      await supabase.from('notifications').insert({
        user_id: id, type: 'approved',
        title: 'Your access has been approved!',
        body: 'Welcome to Petra Designs. You can now access the full course.',
        link: '/courses',
      })
      // Enroll student in all published courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('is_published', true)
      if (courses?.length) {
        const enrollments = courses.map(c => ({ student_id: id, course_id: c.id }))
        await supabase.from('enrollments').upsert(enrollments, { onConflict: 'student_id,course_id', ignoreDuplicates: true })
      }
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
                </div>
              </div>
            )
          })
        )}
      </div>
    </AdminLayout>
  )
}
