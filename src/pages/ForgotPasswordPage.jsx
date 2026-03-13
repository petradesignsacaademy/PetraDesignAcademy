import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (err) {
      setError('Something went wrong. Please check the email and try again.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="login-grid" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* Left — brand panel */}
      <div className="login-brand" style={{
        background: 'linear-gradient(160deg, #12133C 0%, #2D1060 60%, #12133C 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(153,86,159,0.15)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(71,198,235,0.08)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <img src="/logo.png" alt="Petra Designs" style={{ height: 38, width: 'auto', filter: 'brightness(1)' }} />
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: 'Poppins, sans-serif' }}>ACCOUNT RECOVERY</div>
          <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Happens to<br />
            <span style={{ fontStyle: 'italic', color: '#99569F' }}>the best of us.</span>
          </h2>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.8 }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <Link to="/login" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to sign in
          </Link>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="login-form" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px', background: 'var(--bg)', position: 'relative' }}>

        <button onClick={toggleTheme} style={{ position: 'absolute', top: 24, right: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <div className="mobile-logo" style={{ display: 'none', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <img src="/logo.png" alt="Petra Designs" style={{ height: 40, width: 'auto', filter: theme === 'dark' ? 'brightness(1)' : 'brightness(0) saturate(100%) invert(11%) sepia(45%) saturate(900%) hue-rotate(210deg) brightness(95%)' }} />
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>
                📬
              </div>
              <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 38, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Check your email</h1>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
                We sent a reset link to <strong style={{ color: 'var(--text2)' }}>{email}</strong>. Check your inbox and click the link to reset your password.
              </p>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 13 }}>
                Didn't get it?{' '}
                <button onClick={() => setSent(false)} style={{ background: 'none', border: 'none', color: 'var(--purple)', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'Poppins, sans-serif' }}>
                  Try again
                </button>
              </p>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, color: 'var(--text3)', fontFamily: 'Poppins, sans-serif', fontSize: 13, textDecoration: 'none' }}>
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 36 }}>
                <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Reset password</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>
                  Remember it?{' '}
                  <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(237,81,142,0.08)', border: '1px solid rgba(237,81,142,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#ED518E' }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--text)', fontFamily: 'Poppins, sans-serif', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#99569F'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading
                    ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Sending...</>
                    : 'Send reset link →'
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .login-grid  { grid-template-columns: 1fr !important; }
          .login-brand { display: none !important; }
          .login-form  { padding: 48px 24px !important; align-items: stretch !important; }
          .mobile-logo { display: flex !important; justify-content: center; }
        }
      `}</style>
    </div>
  )
}
