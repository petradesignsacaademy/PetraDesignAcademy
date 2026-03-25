import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Navbar from './Navbar'

const adminNav = [
  { to: '/admin',               icon: '📊', label: 'Overview'       },
  { to: '/admin/students',      icon: '👩‍🎨', label: 'Students'       },
  { to: '/admin/courses',       icon: '📚', label: 'Course Content'  },
  { to: '/admin/assignments',   icon: '✏️',  label: 'Assignments'    },
  { to: '/admin/announcements', icon: '📣', label: 'Announcements'   },
  { to: '/admin/revenue',       icon: '💰', label: 'Revenue'         },
  { to: '/admin/portfolio',     icon: '🖼️', label: 'Portfolio'       },
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar variant="admin" />

      {/* Mobile menu button — only visible on small screens */}
      <div className="admin-mobile-btn" style={{
        display: 'none',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--font-body)' }}
        >
          <span>☰</span> {sidebarOpen ? 'Close menu' : 'Menu'}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, top: 64 }}>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 260, bottom: 0, background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '20px 12px', overflowY: 'auto', animation: 'slideInLeft 0.2s ease' }}>
            <div style={{ padding: '0 10px', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', fontFamily: 'var(--font-body)' }}>ADMIN PANEL</span>
            </div>
            {adminNav.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 12, marginBottom: 3,
                  textDecoration: 'none',
                  background: isActive ? 'rgba(153,86,159,0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(153,86,159,0.2)' : '1px solid transparent',
                  color: isActive ? 'var(--purple)' : 'var(--text2)',
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                })}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Main grid — sidebar + content */}
      <div className="admin-layout-grid" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1 }}>

        {/* Desktop sidebar */}
        <aside className="admin-sidebar" style={{
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          padding: '24px 12px',
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          <div style={{ padding: '0 10px', marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', fontFamily: 'var(--font-body)' }}>ADMIN PANEL</span>
          </div>
          {adminNav.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 3,
                textDecoration: 'none',
                background: isActive ? 'rgba(153,86,159,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(153,86,159,0.2)' : '1px solid transparent',
                transition: 'all 0.2s',
                color: isActive ? 'var(--purple)' : 'var(--text2)',
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              })}
            >
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </aside>

        {/* Page content */}
        <main className="admin-main" style={{ padding: '36px 40px', overflowY: 'auto', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 768px) {
          .admin-layout-grid { grid-template-columns: 1fr !important; }
          .admin-sidebar     { display: none !important; }
          .admin-mobile-btn  { display: flex !important; }
          .admin-main        { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  )
}
