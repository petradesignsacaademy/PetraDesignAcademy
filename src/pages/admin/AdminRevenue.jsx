import AdminLayout from '../../components/layout/AdminLayout'

export default function AdminRevenue() {
  return (
    <AdminLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Revenue</h1>
        <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Payment tracking and transaction history</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '48px 40px', textAlign: 'center', maxWidth: 560 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(249,165,52,0.1)', border: '1px solid rgba(249,165,52,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>💰</div>
        <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 30, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Payment integration coming soon</h2>
        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 24 }}>
          Once you decide on a payment provider — Stripe, Paystack, or Selar — revenue tracking, transaction history, and promo code management will be built right here.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          {[
            ['Stripe', 'Best for international payments, very developer-friendly'],
            ['Paystack', 'Best for Nigerian payments, built for Africa'],
            ['Selar', 'Simplest setup — no code needed, works immediately'],
          ].map(([name, desc]) => (
            <div key={name} style={{ display: 'flex', gap: 14, padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(153,86,159,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 14 }}>💳</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{name}</div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
