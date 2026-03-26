import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function NotFoundPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(153,86,159,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ position: 'absolute', top: 28, left: 32, display: 'flex', alignItems: 'center' }}>
        <img src="/logo.png" alt="Petra Designs" style={{ height: 32, width: 'auto', filter: theme === 'dark' ? 'brightness(1)' : 'brightness(0) saturate(100%) invert(11%) sepia(45%) saturate(900%) hue-rotate(210deg) brightness(95%)' }} />
      </Link>

      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{ position: 'absolute', top: 24, right: 28, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13, fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Content */}
      <div style={{ position: 'relative', maxWidth: 560 }}>
        <div style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 'clamp(100px, 20vw, 160px)', fontWeight: 700, lineHeight: 1, background: 'linear-gradient(135deg, #99569F, #ED518E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>
          404
        </div>

        <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, marginBottom: 16 }}>
          Page not found
        </h1>

        <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, color: 'var(--text3)', lineHeight: 1.8, fontWeight: 300, marginBottom: 40 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Back to home
          </Link>
          <Link to="/portfolio" style={{ padding: '12px 28px', border: '1.5px solid var(--border)', color: 'var(--text2)', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            View portfolio
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          a[href="/"] + a { display: none; }
        }
      `}</style>
    </div>
  )
}