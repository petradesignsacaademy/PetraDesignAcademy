import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [done, setDone]         = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp(email, password, fullName)

    if (signUpError) {
      setError(signUpError.message || 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // Show success state — student is pending approval
    setDone(true)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    color: 'var(--text)',
    fontFamily: 'Poppins, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36 }}>✓</div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Request sent!</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text2)', fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>
            Your account has been created and is <strong style={{ color: 'var(--purple)' }}>waiting for approval</strong>.
          </p>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
            Petra will review your request and approve you via DM. Once approved, you'll receive a confirmation and can log in immediately.
          </p>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text3)', fontFamily: 'Poppins, sans-serif', marginBottom: 12 }}>WHAT HAPPENS NEXT</div>
            {[
              ['1', 'Petra receives your request notification'],
              ['2', 'She reviews and approves you via DM'],
              ['3', 'You log in and start your first lesson'],
            ].map(([num, text]) => (
              <div key={num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>{num}</span>
                </div>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)', paddingTop: 3 }}>{text}</span>
              </div>
            ))}
          </div>
          <Link to="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', borderRadius: '999px', padding: '13px 32px', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Go to login page →
          </Link>
        </div>
      </div>
    )
  }

  // ── Registration form ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

      {/* ── Left — branding panel ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(160deg, #12133C 0%, #1a0a3d 50%, #12133C 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(237,81,142,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(71,198,235,0.08)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 20, fontFamily: 'Cormorant Upright, serif' }}>P</span>
          </div>
          <span style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 22, fontWeight: 600, color: '#fff' }}>Petra Designs</span>
        </div>

        {/* Quote */}
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: 'Poppins, sans-serif' }}>JOIN THE COMMUNITY</div>
          <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 50, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Every expert was once<br />
            <span style={{ fontStyle: 'italic', color: '#ED518E' }}>a beginner.</span>
          </h2>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.8 }}>
            Request your spot in the course. Petra personally reviews every application.
          </p>
        </div>

        {/* What you get */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
          {[
            ['🎬', 'Professional video lessons'],
            ['📄', 'Downloadable PDFs & resources'],
            ['✏️', 'Personal feedback from Petra'],
            ['🏆', 'Certificate of completion'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right — form panel ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px', background: 'var(--bg)', position: 'relative' }}>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{ position: 'absolute', top: 24, right: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '999px', padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Request access</h1>
            <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>
              Already approved?{' '}
              <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
            </p>
          </div>

          {/* Info note */}
          <div style={{ background: 'rgba(71,198,235,0.08)', border: '1px solid rgba(71,198,235,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--blue)', lineHeight: 1.6 }}>
            ℹ️ Access is by approval only. Petra will review your request and reach out via DM before activating your account.
          </div>

          {error && (
            <div style={{ background: 'rgba(237,81,142,0.08)', border: '1px solid rgba(237,81,142,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#ED518E' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Full name</label>
              <input
                type="text" placeholder="Your full name"
                value={fullName} onChange={e => setFullName(e.target.value)} required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#99569F'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Email address</label>
              <input
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#99569F'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Create password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Minimum 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={e => e.target.style.borderColor = '#99569F'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Confirm password</label>
              <input
                type="password" placeholder="Repeat your password"
                value={confirm} onChange={e => setConfirm(e.target.value)} required
                style={{ ...inputStyle, borderColor: confirm && confirm !== password ? '#ED518E' : 'var(--border)' }}
                onFocus={e => e.target.style.borderColor = confirm !== password ? '#ED518E' : '#99569F'}
                onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? '#ED518E' : 'var(--border)'}
              />
              {confirm && confirm !== password && (
                <span style={{ fontSize: 12, color: '#ED518E', fontFamily: 'Poppins, sans-serif' }}>Passwords don't match</span>
              )}
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)',
                color: '#fff', border: 'none', borderRadius: '999px',
                padding: '14px', fontSize: 15, fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', marginTop: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading
                ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Sending request...</>
                : 'Request access →'
              }
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
