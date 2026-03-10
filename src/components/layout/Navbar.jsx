import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Avatar } from '../ui'

export default function Navbar({ variant = 'student' }) {
  const { profile, isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <nav style={{
      background: 'var(--bg2)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <Link to={isAdmin ? '/admin' : '/dashboard'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--purple), var(--pink))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'var(--font-display)' }}>P</span>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>
          Petra Designs
        </span>
        {isAdmin && (
          <span style={{
            background: 'rgba(249,165,52,0.15)', color: 'var(--amber)',
            fontSize: 10, fontWeight: 700, padding: '2px 8px',
            borderRadius: 'var(--radius-full)', letterSpacing: 1,
          }}>ADMIN</span>
        )}
      </Link>

      {/* Centre nav — student only */}
      {variant === 'student' && (
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/courses',   label: 'My Course'  },
            { to: '/assignments', label: 'Assignments' },
            { to: '/community', label: 'Community'  },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '6px 16px', borderRadius: 'var(--radius-full)',
              fontSize: 13, fontWeight: 500, color: 'var(--text2)',
              textDecoration: 'none', transition: 'all 0.2s',
              background: window.location.pathname === to ? 'rgba(153,86,159,0.1)' : 'transparent',
            }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)', padding: '7px 14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 6, color: 'var(--text2)', fontSize: 12,
            fontFamily: 'var(--font-body)', fontWeight: 500,
            transition: 'all 0.2s',
          }}
          title="Toggle dark/light mode"
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Profile dropdown (simplified) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={handleSignOut}
          title="Click to sign out"
        >
          <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={34} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>
            {profile?.full_name?.split(' ')[0] || 'Account'}
          </span>
        </div>
      </div>
    </nav>
  )
}
