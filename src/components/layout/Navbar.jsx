import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { Avatar } from '../ui'

const studentLinks = [
  { to: '/dashboard',   label: 'Dashboard',  icon: '🏠' },
  { to: '/courses',     label: 'My Course',   icon: '📚' },
  { to: '/assignments', label: 'Assignments', icon: '✏️' },
  { to: '/community',   label: 'Community',   icon: '💬' },
]

const adminLinks = [
  { to: '/admin',               label: 'Overview',       icon: '📊' },
  { to: '/admin/students',      label: 'Students',       icon: '👩‍🎨' },
  { to: '/admin/courses',       label: 'Course Content', icon: '📚' },
  { to: '/admin/assignments',   label: 'Assignments',    icon: '✏️' },
  { to: '/admin/announcements', label: 'Announcements',  icon: '📣' },
  { to: '/admin/revenue',       label: 'Revenue',        icon: '💰' },
]

function NotificationIcon({ type }) {
  const icons = { approved: '✅', feedback: '💬', announcement: '📣' }
  return <span style={{ fontSize: 16 }}>{icons[type] || '🔔'}</span>
}

export default function Navbar({ variant = 'student' }) {
  const { profile, isAdmin, signOut, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [menuOpen, setMenuOpen]         = useState(false)
  const [bellOpen, setBellOpen]         = useState(false)
  const [notifs, setNotifs]             = useState([])
  const [notifsLoading, setNotifsLoading] = useState(false)
  const bellRef = useRef(null)

  const unreadCount = notifs.filter(n => !n.is_read).length

  useEffect(() => {
    if (!user || isAdmin) return
    loadNotifications()
  }, [user])

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function loadNotifications() {
    setNotifsLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setNotifs(data || [])
    setNotifsLoading(false)
  }

  async function markAllRead() {
    const ids = notifs.filter(n => !n.is_read).map(n => n.id)
    if (!ids.length) return
    await supabase.from('notifications').update({ is_read: true }).in('id', ids)
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  async function markOneRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  function handleNotifClick(notif) {
    markOneRead(notif.id)
    setBellOpen(false)
    if (notif.link) navigate(notif.link)
  }

  function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
    setMenuOpen(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Account'
  const links     = variant === 'admin' ? adminLinks : studentLinks

  return (
    <>
      <nav style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        padding: '0 28px', height: 64, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 200, flexShrink: 0,
      }}>

        {/* Logo */}
        <Link
          to={isAdmin ? '/admin' : '/dashboard'}
          onClick={() => setMenuOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}
        >
          <img src="/logo.png" alt="Petra Designs" style={{
            height: 38, width: 'auto', objectFit: 'contain', display: 'block',
            filter: theme === 'dark'
              ? 'brightness(1)'
              : 'brightness(0) saturate(100%) invert(11%) sepia(45%) saturate(900%) hue-rotate(210deg) brightness(95%)',
          }} />
          {isAdmin && (
            <span style={{ background: 'rgba(249,165,52,0.15)', color: 'var(--amber)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, letterSpacing: 1, fontFamily: 'var(--font-body)' }}>ADMIN</span>
          )}
        </Link>

        {/* Desktop nav links — student only */}
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

        {/* Desktop right */}
        <div className="nav-desktop-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Bell — students only */}
          {variant === 'student' && (
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setBellOpen(o => !o); if (!bellOpen) loadNotifications() }}
                style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 999, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16 }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: -3, background: '#ED518E', color: '#fff', fontSize: 9, fontWeight: 700, fontFamily: 'Poppins, sans-serif', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div style={{ position: 'absolute', top: 48, right: 0, width: 340, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', zIndex: 300, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                      Notifications{unreadCount > 0 && <span style={{ background: '#ED518E', color: '#fff', fontSize: 10, padding: '1px 7px', borderRadius: 999, marginLeft: 6 }}>{unreadCount}</span>}
                    </span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--purple)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {notifsLoading ? (
                      <div style={{ padding: '32px', textAlign: 'center', fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 13 }}>Loading...</div>
                    ) : notifs.length === 0 ? (
                      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                        <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text3)' }}>No notifications yet.</div>
                      </div>
                    ) : notifs.map((n, i) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        style={{ display: 'flex', gap: 12, padding: '14px 18px', cursor: n.link ? 'pointer' : 'default', background: n.is_read ? 'transparent' : 'rgba(153,86,159,0.05)', borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => { if (n.link) e.currentTarget.style.background = 'var(--bg2)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(153,86,159,0.05)' }}
                      >
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <NotificationIcon type={n.type} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: n.is_read ? 500 : 700, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                          {n.body && <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', lineHeight: 1.5, marginBottom: 3 }}>{n.body}</div>}
                          <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'var(--text3)' }}>{timeAgo(n.created_at)}</div>
                        </div>
                        {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ED518E', flexShrink: 0, marginTop: 6 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        >
          {variant === 'student' && unreadCount > 0 && (
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#ED518E' }} />
          )}
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.25s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'opacity 0.25s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.25s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, top: 64, zIndex: 199 }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '16px 20px 28px', animation: 'slideDown 0.22s ease', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
              {links.map(({ to, label, icon }) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
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

            {/* Notifications in mobile drawer — students only */}
            {variant === 'student' && notifs.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                    Notifications{unreadCount > 0 && <span style={{ background: '#ED518E', color: '#fff', fontSize: 10, padding: '1px 7px', borderRadius: 999, marginLeft: 6 }}>{unreadCount}</span>}
                  </span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--purple)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>Mark all read</button>
                  )}
                </div>
                {notifs.slice(0, 5).map(n => (
                  <div key={n.id} onClick={() => { handleNotifClick(n); setMenuOpen(false) }}
                    style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 10, marginBottom: 4, background: n.is_read ? 'transparent' : 'rgba(153,86,159,0.06)', cursor: n.link ? 'pointer' : 'default' }}
                  >
                    <NotificationIcon type={n.type} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: n.is_read ? 500 : 700, fontSize: 13, color: 'var(--text)' }}>{n.title}</div>
                      {n.body && <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{n.body}</div>}
                    </div>
                    {!n.is_read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ED518E', flexShrink: 0, marginTop: 4 }} />}
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', marginBottom: 4 }}>
                <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size={38} />
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{profile?.full_name || 'Student'}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text3)' }}>{isAdmin ? 'Administrator' : 'Student'}</div>
                </div>
              </div>

              {variant === 'student' && (
                <Link to="/account" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none', fontSize: 14, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)' }}>
                  <span>👤</span> My Account
                </Link>
              )}

              <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>

              <button onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#EF4444', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                <span>🚪</span> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-right  { display: none !important; }
          .nav-hamburger      { display: flex !important; }
        }
      `}</style>
    </>
  )
}
