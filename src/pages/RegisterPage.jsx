import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const SELAR_URL = 'https://selar.com/2625473152'

// Enrollment is now handled via Selar payment.
// This page redirects users there immediately.
export default function RegisterPage() {
  const { theme } = useTheme()

  useEffect(() => {
    // Give the page a moment to render before redirecting,
    // so users on slow connections see the message instead of a blank flash.
    const t = setTimeout(() => { window.location.href = SELAR_URL }, 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>

      <Link to="/" style={{ marginBottom: 48 }}>
        <img src="/logo.png" alt="Petra Designs" style={{ height: 32, width: 'auto',
          filter: theme === 'dark' ? 'brightness(1)' : 'brightness(0) saturate(100%) invert(11%) sepia(45%) saturate(900%) hue-rotate(210deg) brightness(95%)'
        }} />
      </Link>

      {/* Spinner */}
      <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 32px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(153,86,159,0.15), rgba(237,81,142,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🎓</div>
        <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#99569F', animation: 'spin 1.2s linear infinite' }} />
      </div>

      <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 42, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.1 }}>
        Taking you to<br />
        <span style={{ fontStyle: 'italic', color: 'var(--purple)' }}>enrollment…</span>
      </h1>

      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 32, maxWidth: 400 }}>
        Enrollment is processed securely through Selar. You'll be redirected automatically.
      </p>

      <a href={SELAR_URL} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', padding: '14px 36px', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 28px rgba(153,86,159,0.3)' }}>
        Enroll Now — ₦25,000 →
      </a>

      <p style={{ marginTop: 24, fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)' }}>
        Already enrolled?{' '}
        <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}