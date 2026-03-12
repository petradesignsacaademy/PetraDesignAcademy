import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Avatar } from '../ui'

const studentLinks = [
  { to: '/dashboard',   label: 'Dashboard',   icon: '🏠' },
  { to: '/courses',     label: 'My Course',    icon: '📚' },
  { to: '/assignments', label: 'Assignments',  icon: '✏️' },
  { to: '/community',   label: 'Community',    icon: '💬' },
]

const adminLinks = [
  { to: '/admin',               label: 'Overview',       icon: '📊' },
  { to: '/admin/students',      label: 'Students',       icon: '👩‍🎨' },
  { to: '/admin/courses',       label: 'Course Content', icon: '📚' },
  { to: '/admin/assignments',   label: 'Assignments',    icon: '✏️' },
  { to: '/admin/announcements', label: 'Announcements',  icon: '📣' },
  { to: '/admin/revenue',       label: 'Revenue',        icon: '💰' },
]

export default function Navbar({ variant = 'student' }) {
  const { profile, isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
    setOpen(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Account'
  const links = variant === 'admin' ? adminLinks : studentLinks

  return (
    <>
      <nav style={{
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        padding: '0 28px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        flexShrink: 0,
      }}>

        {/* ── Logo ── */}
        <Link
          to={isAdmin ? '/admin' : '/dashboard'}
          onClick={() => setOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}
        >
          <img
            src="/logo.png"
            alt="Petra Designs"
            style={{
              height: 38,
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: theme === 'dark'
                ? 'brightness(1)'
                : 'brightness(0) saturate(100%) invert(11%) sepia(45%) saturate(900%) hue-rotate(210deg) brightness(95%)',
            }}
          />
          {isAdmin && (
            <span style={{ background: 'rgba(249,165,52,0.15)', color: 'var(--amber)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, letterSpacing: 1, fontFamily: 'var(--font-body)' }}>ADMIN</span>
          )}
        </Link>

        {/* ── Desktop links (student) ── */}
        {variant === 'student' && (
          <div className="nav-desktop-links" style={{ display: 'flex', gap: 4 }}>
            {studentLinks.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500,
                color: location.pathname === to ? 'var(--purple)' : 'var(--text2)',
                textDecoration: 'none', transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                background: location.pathname === to ? 'rgba(153,86,159,0.1)' : 'transparent',
              }}>{label}</Link>
            ))}
          </div>
        )}

        {/* ── Desktop right ── */}
        <div className="nav-desktop-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggleTheme} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 12, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <div
            onClick={handleSignOut}
            title="Sign out"
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 10px', borderRadius: 999 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={32} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', fontFamily: 'var(--font-body)' }}>{firstName}</span>
          </div>
        </div>

        {/* ── Hamburger ── */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, flexDirection: 'column', gap: 5,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.25s', transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'opacity 0.25s', opacity: open ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.25s', transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, top: 64, zIndex: 199 }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '16px 20px 28px', animation: 'slideDown 0.22s ease', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>

            {/* Nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
              {links.map(({ to, label, icon }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', borderRadius: 12, textDecoration: 'none',
                  fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)',
                  color: location.pathname === to ? 'var(--purple)' : 'var(--text)',
                  background: location.pathname === to ? 'rgba(153,86,159,0.1)' : 'transparent',
                  border: `1px solid ${location.pathname === to ? 'rgba(153,86,159,0.2)' : 'transparent'}`,
                }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>{label}
                </Link>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', marginBottom: 4 }}>
                <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={38} />
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{profile?.full_name || 'Student'}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{isAdmin ? 'Administrator' : 'Student'}</div>
                </div>
              </div>

              {/* Account (students) */}
              {variant === 'student' && (
                <Link to="/account" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none', fontSize: 14, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)' }}>
                  <span>👤</span> My Account
                </Link>
              )}

              {/* Theme toggle */}
              <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>

              {/* Sign out */}
              <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#EF4444', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                <span>🚪</span> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
