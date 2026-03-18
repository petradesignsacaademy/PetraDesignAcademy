import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

export default function ResetPasswordPage() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [newPass, setNewPass]         = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState('')
  const [ready, setReady]             = useState(false)

  // Supabase fires PASSWORD_RECOVERY when the user arrives via the reset link.
  // We wait for that event before showing the form so the session is established.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Also check if we already have an active recovery session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (newPass.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: newPass })
    if (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
    setTimeout(() => navigate('/login'), 2500)
  }

  const inputStyle = {
    width: '100%', background: 'var(--surface)',
    border: '1.5px solid var(--border)', borderRadius: 12,
    padding: '12px 16px', fontSize: 14, color: 'var(--text)',
    fontFamily: 'Poppins, sans-serif', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
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
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: 'Poppins, sans-serif' }}>NEW PASSWORD</div>
          <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Almost<br />
            <span style={{ fontStyle: 'italic', color: '#99569F' }}>back in.</span>
          </h2>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.8 }}>
            Choose a new password for your account.
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

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>
                ✅
              </div>
              <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 38, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Password updated!</h1>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, lineHeight: 1.8 }}>
                Your password has been changed. Redirecting you to sign in…
              </p>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.7s linear infinite', margin: '0 auto 20px' }} />
              <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Verifying your reset link…</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 36 }}>
                <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Set new password</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(237,81,142,0.08)', border: '1px solid rgba(237,81,142,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#ED518E' }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>New password</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#99569F'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Confirm new password</label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#99569F'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {loading
                    ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Updating…</>
                    : 'Update password →'
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
