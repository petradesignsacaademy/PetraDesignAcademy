import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

export default function AdminRevenue() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadPayments() }, [])

  async function loadPayments() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
      setPayments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const total    = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const count    = payments.length
  const thisMonth = payments.filter(p => {
    const d = new Date(p.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((sum, p) => sum + (p.amount || 0), 0)

  function fmt(n) {
    return '₦' + Number(n).toLocaleString('en-NG')
  }

  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Revenue</h1>
        <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Payment history from Selar</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Total revenue',    value: loading ? '—' : fmt(total),     icon: '💰', color: 'var(--amber)',  bg: 'rgba(249,165,52,0.08)'  },
          { label: 'This month',       value: loading ? '—' : fmt(thisMonth), icon: '📅', color: 'var(--purple)', bg: 'rgba(153,86,159,0.08)'  },
          { label: 'Total enrollments',value: loading ? '—' : count,          icon: '🎓', color: 'var(--blue)',   bg: 'rgba(71,198,235,0.08)'  },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${color}25`, borderRadius: 18, padding: '22px 20px' }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 34, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', fontWeight: 500, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Transaction table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Transaction history</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>
            Loading...
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💳</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text3)' }}>
              No payments yet. Transactions will appear here once students purchase on Selar.
            </p>
          </div>
        ) : (
          <div>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '10px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
              {['Student', 'Amount', 'Reference', 'Date'].map(h => (
                <div key={h} style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text3)' }}>{h.toUpperCase()}</div>
              ))}
            </div>
            {payments.map((p, i) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '14px 24px', borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.email}</div>
                </div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>
                  {fmt(p.amount)}
                </div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.reference || '—'}
                </div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>
                  {new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}