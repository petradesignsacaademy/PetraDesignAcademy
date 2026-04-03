import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

const SELAR_URL = 'https://selar.com/2625473152'

export default function RegisterPage() {
  const { theme, toggleTheme } = useTheme()

  const [form, setForm]     = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function setField(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.full_name.trim())      { setError('Please enter your full name.'); return }
    if (form.password.length < 8)    { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email:    form.email.trim(),
        password: form.password,
        options:  { data: { full_name: form.full_name.trim() } },
      })

      if (signUpError) {
        const msg = signUpError.message.toLowerCase()
        if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('user already')) {
          setError('This email is already registered. Try signing in instead.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      // Account created — show success then send to Selar to complete payment
      setDone(true)
      setTimeout(() => { window.location.href = SELAR_URL }, 2500)

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: 'Poppins, sans-serif' }}>JOIN THE ACADEMY</div>
          <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
            Your design<br />
            <span style={{ fontStyle: 'italic', color: '#99569F' }}>journey starts here.</span>
          </h2>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.8 }}>
            Create your account, complete payment on Selar, and get access to the full course.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
          {[['100+', 'Students'], ['6', 'Modules'], ['30+', 'Lessons']].map(([val, label]) => (
            <div key={label}>
              <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, fontWeight: 700, color: '#fff' }}>{val}</div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
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

        <div style={{ width: '100%', maxWidth: 420 }}>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>
                ✅
              </div>
              <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 40, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Account created!</h1>
              <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, lineHeight: 1.8 }}>
                Taking you to Selar to complete your payment…<br />
                Your access will be activated once payment is confirmed.
              </p>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--purple)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)' }}>Redirecting…</span>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Create account</h1>
                <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
                </p>
              </div>

              {error && (
                <div style={{ background: 'rgba(237,81,142,0.08)', border: '1px solid rgba(237,81,142,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#ED518E' }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Full name</label>
                  <input
                    type="text" placeholder="Your full name"
                    value={form.full_name} onChange={setField('full_name')} required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#99569F'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Email address</label>
                  <input
                    type="email" placeholder="you@example.com"
                    value={form.email} onChange={setField('email')} required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#99569F'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'} placeholder="Minimum 8 characters"
                      value={form.password} onChange={setField('password')} required
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
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password"
                      value={form.confirm} onChange={setField('confirm')} required
                      style={{ ...inputStyle, paddingRight: 48 }}
                      onFocus={e => e.target.style.borderColor = '#99569F'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{ background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading
                    ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Creating account…</>
                    : 'Create account & pay →'
                  }
                </button>
              </form>

              <p style={{ marginTop: 20, fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', lineHeight: 1.7, textAlign: 'center' }}>
                After creating your account you'll be taken to Selar to complete payment. Your access is activated once your payment is confirmed.
              </p>
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