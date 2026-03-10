import { NavLink } from 'react-router-dom'
import Navbar from './Navbar'

const adminNav = [
  { to: '/admin',              icon: '📊', label: 'Overview'      },
  { to: '/admin/students',     icon: '👩‍🎨', label: 'Students'      },
  { to: '/admin/courses',      icon: '📚', label: 'Course Content' },
  { to: '/admin/assignments',  icon: '✏️',  label: 'Assignments'   },
  { to: '/admin/announcements',icon: '📣', label: 'Announcements'  },
  { to: '/admin/revenue',      icon: '💰', label: 'Revenue'        },
]

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar variant="admin" />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr' }}>
        {/* Admin sidebar */}
        <aside style={{
          background: 'var(--bg2)',
          borderRight: '1px solid var(--border)',
          padding: '24px 12px',
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          <div style={{ marginBottom: 8, padding: '0 10px' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 2,
              color: 'var(--text3)', fontFamily: 'var(--font-body)',
            }}>ADMIN PANEL</span>
          </div>
          {adminNav.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                marginBottom: 3, textDecoration: 'none', cursor: 'pointer',
                background: isActive ? 'rgba(153,86,159,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(153,86,159,0.2)' : '1px solid transparent',
                transition: 'all 0.2s',
                color: isActive ? 'var(--purple)' : 'var(--text2)',
                fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-body)',
              })}
            >
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </aside>

        {/* Page content */}
        <main style={{ padding: '36px 40px', overflowY: 'auto', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
