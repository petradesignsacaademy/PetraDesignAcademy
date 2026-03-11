import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Avatar } from '../ui'

const studentLinks = [
  { to: '/dashboard',   label: 'Dashboard', icon: '🏠' },
  { to: '/courses',     label: 'My Course',  icon: '📚' },
  { to: '/assignments', label: 'Assignments', icon: '✏️' },
  { to: '/community',   label: 'Community',  icon: '💬' },
]

export default function Navbar({ variant = 'student' }) {
  const { profile, isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
    setMenuOpen(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Account'

  return (
    <>
      <nav style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
      }}>
        {/* Logo */}
        <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, var(--purple), var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'var(--font-display)' }}>P</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Petra Designs</span>
          {isAdmin && (
            <span style={{ background: 'rgba(249,165,52,0.15)', color: 'var(--amber)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, letterSpacing: 1 }}>ADMIN</span>
          )}
        </Link>

        {/* Desktop centre nav — student only */}
        {variant === 'student' && (
          <div className="nav-desktop-links" style={{ display: 'flex', gap: 4 }}>
            {studentLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                color: location.pathname === to ? 'var(--purple)' : 'var(--text2)',
                textDecoration: 'none', transition: 'all 0.2s',
                background: location.pathname === to ? 'rgba(153,86,159,0.1)' : 'transparent',
              }}>{label}</Link>
            ))}
          </div>
        )}

        {/* Desktop right */}
        <div className="nav-desktop-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '7px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={handleSignOut} title="Click to sign out">
            <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={34} />
            <span className="nav-name" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{firstName}</span>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'transparent' : 'var(--text)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'transparent' : 'var(--text)', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, top: 64 }}>
          {/* Backdrop */}
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
          {/* Drawer */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '16px 20px 24px', animation: 'slideDown 0.2s ease' }}>
            {/* Nav links */}
            {variant === 'student' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                {studentLinks.map(({ to, label, icon }) => (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12, fontSize: 15, fontWeight: 600,
                    color: location.pathname === to ? 'var(--purple)' : 'var(--text)',
                    textDecoration: 'none',
                    background: location.pathname === to ? 'rgba(153,86,159,0.1)' : 'transparent',
                    border: location.pathname === to ? '1px solid rgba(153,86,159,0.2)' : '1px solid transparent',
                  }}>
                    <span>{icon}</span>{label}
                  </Link>
                ))}
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
                <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={32} />
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{profile?.full_name}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{profile?.email}</div>
                </div>
              </div>
              <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#EF4444', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                <span>🚪</span> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-right  { display: none !important; }
          .nav-hamburger      { display: flex !important; }
          nav { padding: 0 16px !important; }
        }
      `}</style>
    </>
  )
}
