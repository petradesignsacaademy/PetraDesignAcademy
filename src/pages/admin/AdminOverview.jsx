import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import AdminLayout from '../../components/layout/AdminLayout'

function StatCard({ icon, value, label, color, bg }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}25`, borderRadius: 18, padding: '22px 20px' }}>
      <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 34, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginTop: 3 }}>{label}</div>
    </div>
  )
}

export default function AdminOverview() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats]       = useState({ students: 0, pending: 0, submissions: 0, revenue: 0 })
  const [pending, setPending]   = useState([])
  const [queue, setQueue]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [studentsRes, pendingRes, submissionsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student').eq('status', 'approved'),
        supabase.from('profiles').select('*').eq('role', 'student').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('submissions').select('*, profiles(full_name, email), lessons(title, modules(title))').eq('status', 'submitted').order('submitted_at', { ascending: false }).limit(5),
      ])

      setStats({
        students:    studentsRes.count || 0,
        pending:     pendingRes.data?.length || 0,
        submissions: submissionsRes.data?.length || 0,
      })
      setPending(pendingRes.data || [])
      setQueue(submissionsRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function approveStudent(id) {
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', id)
    // Send notification
    await supabase.from('notifications').insert({
      user_id: id, type: 'approved',
      title: 'Your access has been approved!',
      body: 'Welcome to Petra Designs. You can now access the full course.',
      link: '/courses',
    })
    // Enroll in all published courses
    const { data: courses } = await supabase
      .from('courses').select('id').eq('is_published', true)
    if (courses?.length) {
      const enrollments = courses.map(c => ({ student_id: id, course_id: c.id }))
      await supabase.from('enrollments').upsert(enrollments, { onConflict: 'student_id,course_id', ignoreDuplicates: true })
    }
    loadData()
  }

  async function declineStudent(id) {
    await supabase.from('profiles').update({ status: 'suspended' }).eq('id', id)
    loadData()
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'Petra'

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          {greeting}, {firstName} ✨
        </h1>
        <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>
          Here's what's happening on your platform today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 32 }}>
        <StatCard icon="👩‍🎨" value={loading ? '—' : stats.students}    label="Approved students"     color="var(--purple)" bg="rgba(153,86,159,0.08)" />
        <StatCard icon="⏳"  value={loading ? '—' : stats.pending}     label="Awaiting approval"     color="var(--amber)"  bg="rgba(249,165,52,0.08)" />
        <StatCard icon="📬"  value={loading ? '—' : stats.submissions} label="Assignments to review"  color="var(--pink)"   bg="rgba(237,81,142,0.08)" />
        <StatCard icon="💰"  value="—"                                  label="Revenue (coming soon)"  color="var(--blue)"   bg="rgba(71,198,235,0.08)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Pending approvals */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
              ⏳ Pending approvals
            </h3>
            {pending.length > 0 && (
              <span style={{ background: 'rgba(249,165,52,0.12)', color: 'var(--amber)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: 'Poppins, sans-serif' }}>
                {pending.length} waiting
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text3)', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>
              🎉 All caught up — no pending approvals
            </div>
          ) : (
            pending.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < pending.length - 1 ? '1px solid var(--border)' : 'none', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--purple), var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>
                    {s.full_name?.[0] || '?'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.full_name}</div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => approveStudent(s.id)} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => declineStudent(s.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}

          {pending.length > 0 && (
            <button onClick={() => navigate('/admin/students')} style={{ marginTop: 14, width: '100%', background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', padding: '9px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Manage all students →
            </button>
          )}
        </div>

        {/* Assignment queue */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
              📬 Assignment queue
            </h3>
            {queue.length > 0 && (
              <span style={{ background: 'rgba(237,81,142,0.1)', color: 'var(--pink)', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: 'Poppins, sans-serif' }}>
                {queue.length} to review
              </span>
            )}
          </div>

          {queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text3)', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>
              🎉 No assignments waiting for review
            </div>
          ) : (
            queue.map((sub, i) => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < queue.length - 1 ? '1px solid var(--border)' : 'none', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(237,81,142,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pink)', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>
                    {sub.profiles?.full_name?.[0] || '?'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.profiles?.full_name} — {sub.lessons?.title}
                    </div>
                    <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>
                      {sub.lessons?.modules?.title} · {new Date(sub.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate('/admin/assignments')} style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>
                  Review
                </button>
              </div>
            ))
          )}

          {queue.length > 0 && (
            <button onClick={() => navigate('/admin/assignments')} style={{ marginTop: 14, width: '100%', background: 'none', border: '1px solid var(--border)', color: 'var(--text2)', padding: '9px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              View all assignments →
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
