import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/layout/AdminLayout'

export default function AdminRevenue() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)

  // Manual payment form state
  const [showForm, setShowForm]   = useState(false)
  const [formEmail, setFormEmail] = useState('')
  const [formAmount, setFormAmount] = useState('25000')
  const [formRef, setFormRef]     = useState('')
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')

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

  async function handleManualPayment(e) {
    e.preventDefault()
    setFormError('')
    const email = formEmail.trim().toLowerCase()
    if (!email.includes('@')) { setFormError('Enter a valid email address.'); return }

    setSaving(true)
    try {
      // Find the profile by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      await supabase.from('payments').insert({
        user_id:   profile?.id || null,
        email,
        amount:    parseInt(formAmount, 10) || 25000,
        currency:  'NGN',
        reference: formRef.trim() || null,
        provider:  'selar',
        status:    'succeeded',
      })

      // Also approve the student if they have a profile
      if (profile?.id) {
        await supabase.from('profiles').update({ status: 'approved' }).eq('id', profile.id)
      }

      setFormEmail('')
      setFormAmount('25000')
      setFormRef('')
      setShowForm(false)
      loadPayments()
    } catch (err) {
      setFormError('Failed to save. Try again.')
    } finally {
      setSaving(false)
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Revenue</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Payment history from Selar</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          + Record payment manually
        </button>
      </div>

      {/* Manual payment form */}
      {showForm && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>Record a manual payment</h3>
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
            Use this when Selar doesn't send the full amount or you need to approve a student who paid outside the automatic flow.
          </p>
          {formError && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#EF4444', marginBottom: 12 }}>{formError}</p>}
          <form onSubmit={handleManualPayment} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {[
              { label: 'Student email', value: formEmail, set: setFormEmail, placeholder: 'student@email.com', type: 'email', flex: 2 },
              { label: 'Amount (₦)', value: formAmount, set: setFormAmount, placeholder: '25000', type: 'number', flex: 1 },
              { label: 'Selar reference (optional)', value: formRef, set: setFormRef, placeholder: 'SEL-xxx', type: 'text', flex: 1 },
            ].map(({ label, value, set, placeholder, type, flex }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 5, flex }}>
                <label style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 0.5 }}>{label.toUpperCase()}</label>
                <input
                  type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                  style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)', fontFamily: 'Poppins, sans-serif', fontSize: 13, outline: 'none', minWidth: 120 }}
                />
              </div>
            ))}
            <button type="submit" disabled={saving}
              style={{ padding: '9px 20px', background: saving ? 'var(--bg3)' : '#22C55E', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              style={{ padding: '9px 16px', background: 'none', color: 'var(--text3)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'Poppins, sans-serif', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Info note about Selar amounts */}
      <div style={{ background: 'rgba(249,165,52,0.07)', border: '1px solid rgba(249,165,52,0.2)', borderRadius: 12, padding: '11px 16px', marginBottom: 24, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
        ℹ️ <strong>Note:</strong> Selar doesn't always include the payment amount in the redirect. If you see ₦25,000 for all rows, that's the default — cross-check with your Selar dashboard. Use "Record payment manually" to correct any entries.
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Total revenue',     value: loading ? '—' : fmt(total),     icon: '💰', color: 'var(--amber)',  bg: 'rgba(249,165,52,0.08)'  },
          { label: 'This month',        value: loading ? '—' : fmt(thisMonth), icon: '📅', color: 'var(--purple)', bg: 'rgba(153,86,159,0.08)'  },
          { label: 'Total enrollments', value: loading ? '—' : count,          icon: '🎓', color: 'var(--blue)',   bg: 'rgba(71,198,235,0.08)'  },
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
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>Loading…</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '48px 40px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💳</div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text3)' }}>
              No payments yet. Transactions will appear here once students purchase on Selar.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '10px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
              {['Student', 'Amount', 'Reference', 'Date'].map(h => (
                <div key={h} style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--text3)' }}>{h.toUpperCase()}</div>
              ))}
            </div>
            {payments.map((p, i) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12, padding: '14px 24px', borderBottom: i < payments.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.email}</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>{fmt(p.amount)}</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.reference || '—'}</div>
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