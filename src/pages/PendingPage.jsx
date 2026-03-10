import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function PendingPage() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Minimal nav */}
      <nav style={{ padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #99569F, #ED518E)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16, fontFamily: 'Cormorant Upright, serif' }}>P</span>
          </div>
          <span style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Petra Designs</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '999px', padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text2)', fontSize: 12, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '999px', padding: '6px 16px', cursor: 'pointer', color: 'var(--text3)', fontSize: 13, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

          {/* Animated waiting icon */}
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 36px' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(153,86,159,0.15), rgba(237,81,142,0.15))', border: '2px solid rgba(153,86,159,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
              ⏳
            </div>
            <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#99569F', animation: 'spin 2s linear infinite' }} />
          </div>

          <h1 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 46, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.1 }}>
            You're on the list,{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--purple)' }}>
              {profile?.full_name?.split(' ')[0] || 'friend'}
            </span>
          </h1>

          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text2)', fontSize: 16, lineHeight: 1.8, marginBottom: 8 }}>
            Your account is created and your access request is <strong style={{ color: 'var(--purple)' }}>pending approval</strong>.
          </p>
          <p style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--text3)', fontSize: 14, lineHeight: 1.8, marginBottom: 40 }}>
            Petra personally reviews every application. She'll reach out via DM once your account is approved — usually within 24–48 hours.
          </p>

          {/* Status card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 32px', marginBottom: 32, textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--text3)', fontFamily: 'Poppins, sans-serif', marginBottom: 20 }}>YOUR APPLICATION STATUS</div>

            {[
              { step: 'Account created', done: true, desc: 'Your account was successfully created' },
              { step: 'Awaiting approval', done: false, active: true, desc: 'Petra will review and approve your request' },
              { step: 'Access granted', done: false, desc: 'Full platform access — start your first lesson' },
            ].map(({ step, done, active, desc }, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: i < 2 ? 20 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: done ? 'linear-gradient(135deg, #99569F, #ED518E)' : active ? 'rgba(153,86,159,0.15)' : 'var(--bg3)',
                    border: active ? '2px solid #99569F' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {done
                      ? <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>
                      : active
                        ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#99569F', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text3)' }} />
                    }
                  </div>
                  {i < 2 && <div style={{ width: 1, height: 20, background: done ? '#99569F' : 'var(--border)', marginTop: 4 }} />}
                </div>
                <div style={{ paddingTop: 3 }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 600, color: done || active ? 'var(--text)' : 'var(--text3)', marginBottom: 2 }}>{step}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Account info */}
          <div style={{ background: 'rgba(153,86,159,0.06)', border: '1px solid rgba(153,86,159,0.15)', borderRadius: 14, padding: '16px 20px', marginBottom: 32, textAlign: 'left' }}>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, color: 'var(--text2)' }}>
              <strong style={{ color: 'var(--purple)' }}>Registered as:</strong> {profile?.email || '—'}
            </div>
          </div>

          <button
            onClick={handleSignOut}
            style={{ background: 'none', border: '1.5px solid var(--border)', color: 'var(--text2)', borderRadius: '999px', padding: '11px 28px', fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Sign out for now
          </button>

          <p style={{ marginTop: 20, fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)' }}>
            Come back and sign in after Petra approves you
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  )
}
