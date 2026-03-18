import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

export default function AdminLoginPage() {
  const { theme, toggleTheme } = useTheme()
  const { signIn, signOut, isAdmin, loading: authLoading, user, profile } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [checkingRole, setCheckingRole] = useState(false)

  // If already logged in as admin, go straight to /admin
  useEffect(() => {
    if (!authLoading && user && profile && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [authLoading, user, profile, isAdmin, navigate])

  // After sign-in, wait for AuthContext to finish loading the profile, then check role
  useEffect(() => {
    if (!checkingRole) return
    if (authLoading) return   // still fetching profile — wait

    // AuthContext has settled
    setCheckingRole(false)
    setLoading(false)

    if (isAdmin) {
      navigate('/admin', { replace: true })
    } else {
      signOut()
      setError('Access denied. This portal is for administrators only.')
    }
  }, [checkingRole, authLoading, isAdmin, navigate, signOut])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError('Incorrect email or password.')
        setLoading(false)
        return
      }
      // Sign-in succeeded — AuthContext will now fetch the profile.
      // Keep spinner running and wait for authLoading to settle (useEffect above).
      setCheckingRole(true)
    } catch (err) {
      console.error('[AdminLogin] error:', err)
      setError('Something went wrong. Please try again.')
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', position: 'relative' }}>

      <button onClick={toggleTheme} style={{ position: 'fixed', top: 24, right: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '999px', padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
        <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>

      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img src="/logo.png" alt="Petra Designs" style={{ height: 40, width: 'auto', marginBottom: 24, filter: theme === 'dark' ? 'brightness(1)' : 'brightness(0) saturate(100%) invert(11%) sepia(45%) saturate(900%) hue-rotate(210deg) brightness(95%)' }} />
          <div style={{ display: 'inline-block', background: 'rgba(249,165,52,0.12)', color: '#F9A534', fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: '4px 14px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', marginBottom: 16 }}>ADMIN PORTAL</div>
          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Admin Sign in</h1>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14 }}>Restricted access — administrators only.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(237,81,142,0.08)', border: '1px solid rgba(237,81,142,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: '#ED518E' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Email address</label>
            <input type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#F9A534'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Poppins, sans-serif' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ ...inputStyle, paddingRight: 48 }}
                onFocus={e => e.target.style.borderColor = '#F9A534'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ background: loading ? 'var(--bg3)' : 'linear-gradient(135deg, #F9A534, #ED518E)', color: '#fff', border: 'none', borderRadius: '999px', padding: '14px', fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading
              ? <><div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Signing in...</>
              : 'Sign in →'
            }
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
