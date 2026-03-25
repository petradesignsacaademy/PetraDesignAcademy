import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

// Selar appends query params to the redirect URL after purchase.
// We read whatever they send and call our webhook API to create the account.

export default function PaymentSuccessPage() {
  const { theme } = useTheme()
  const [status, setStatus]     = useState('processing') // processing | success | error | needs_email
  const [email, setEmail]       = useState('')
  const [inputEmail, setInput]  = useState('')
  const [error, setError]       = useState('')
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const params = new URLSearchParams(window.location.search)

    // Selar may send: email, buyer_email, customer_email, reference, order_reference
    const buyerEmail = (
      params.get('email') ||
      params.get('buyer_email') ||
      params.get('customer_email') ||
      ''
    ).trim().toLowerCase()

    const buyerName = (
      params.get('name') ||
      params.get('buyer_name') ||
      params.get('customer_name') ||
      ''
    ).trim()

    const reference = (
      params.get('reference') ||
      params.get('order_reference') ||
      params.get('ref') ||
      ''
    ).trim()

    if (buyerEmail) {
      setEmail(buyerEmail)
      processPayment(buyerEmail, buyerName, reference)
    } else {
      // Selar didn't include email in the redirect — ask the buyer to confirm their email
      setStatus('needs_email')
    }
  }, [])

  async function processPayment(buyerEmail, buyerName, reference) {
    setStatus('processing')
    try {
      const res = await fetch('/api/selar-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { email: buyerEmail, name: buyerName },
          reference,
          total: 25000,
        }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setError(data?.error || 'Something went wrong.')
        setStatus('error')
      }
    } catch (err) {
      setError('Could not connect. Please try again.')
      setStatus('error')
    }
  }

  function handleEmailSubmit(e) {
    e.preventDefault()
    const trimmed = inputEmail.trim().toLowerCase()
    if (!trimmed.includes('@')) { setError('Please enter a valid email.'); return }
    setEmail(trimmed)
    setError('')
    processPayment(trimmed, '', '')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

      {/* Logo */}
      <div style={{ marginBottom: 48 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.png" alt="Petra Designs" style={{ height: 32, width: 'auto',
            filter: theme === 'dark' ? 'brightness(1)' : 'brightness(0) saturate(100%) invert(11%) sepia(45%) saturate(900%) hue-rotate(210deg) brightness(95%)'
          }} />
        </Link>
      </div>

      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* ── PROCESSING ── */}
        {status === 'processing' && (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(153,86,159,0.15), rgba(237,81,142,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#99569F', animation: 'spin 1.2s linear infinite' }} />
              <span style={{ fontSize: 36 }}>🎓</span>
            </div>
            <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Setting up your account…
            </h1>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text3)', lineHeight: 1.7 }}>
              This only takes a moment.
            </p>
          </>
        )}

        {/* ── NEEDS EMAIL ── */}
        {status === 'needs_email' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🎉</div>
            <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Purchase confirmed!
            </h1>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 32 }}>
              Enter the email address you used to pay on Selar and we'll set up your account right away.
            </p>
            <form onSubmit={handleEmailSubmit} style={{ textAlign: 'left' }}>
              <input
                type="email"
                placeholder="Your email address"
                value={inputEmail}
                onChange={e => setInput(e.target.value)}
                required
                style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'Poppins, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
              />
              {error && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#EF4444', marginBottom: 12 }}>{error}</p>}
              <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                Activate my account →
              </button>
            </form>
          </>
        )}

        {/* ── SUCCESS ── */}
        {status === 'success' && (
          <>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 40, boxShadow: '0 12px 40px rgba(153,86,159,0.35)' }}>
              ✓
            </div>
            <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 46, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.1 }}>
              You're in,{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--purple)' }}>welcome!</span>
            </h1>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 8 }}>
              Your account has been created.
            </p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 40 }}>
              Check <strong style={{ color: 'var(--purple)' }}>{email}</strong> for an email from us with a link to set your password and log in.
            </p>

            <div style={{ background: 'rgba(153,86,159,0.07)', border: '1px solid rgba(153,86,159,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)', lineHeight: 1.75, margin: 0 }}>
                <strong>Can't find the email?</strong> Check your spam folder. If it's not there after a few minutes, use the "Forgot password" option on the login page to set your password.
              </p>
            </div>

            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', padding: '14px 36px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 28px rgba(153,86,159,0.3)' }}>
              Go to login →
            </Link>
          </>
        )}

        {/* ── ERROR ── */}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 24 }}>⚠️</div>
            <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 12 }}>
              {error}
            </p>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text3)', lineHeight: 1.75, marginBottom: 36 }}>
              Your payment on Selar was still processed. Please contact Petra directly and she'll sort your access out quickly.
            </p>
            <button
              onClick={() => { setStatus('needs_email'); setError('') }}
              style={{ background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Try again
            </button>
          </>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}