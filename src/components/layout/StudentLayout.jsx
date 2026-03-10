import Navbar from './Navbar'

export default function StudentLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar variant="student" />
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  )
}
