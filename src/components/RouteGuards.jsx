import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--purple)', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ fontFamily: 'Cormorant Upright, serif', fontSize: 28, color: 'var(--text)', marginBottom: 8 }}>Something went wrong</h2>
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'var(--text3)', marginBottom: 24, maxWidth: 400 }}>
        We couldn't load your profile. This might be a temporary issue.
      </p>
      {message && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>{message}</p>}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #99569F, #ED518E)', color: '#fff', border: 'none', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Retry
        </button>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
          style={{ padding: '10px 24px', background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 999, fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { user, profile, isAdmin, isApproved, isPending, loading, authError } = useAuth()
  const location = useLocation()

  if (loading)  return <LoadingScreen />
  if (!user)    return <Navigate to="/login" state={{ from: location }} replace />
  if (!profile) return authError ? <ErrorScreen message={authError} /> : <LoadingScreen />
  if (isAdmin)    return children
  if (isApproved) return children
  if (isPending)  return <Navigate to="/pending" replace />
  return <Navigate to="/login" replace />
}

export function AdminRoute({ children }) {
  const { user, profile, isAdmin, loading, authError } = useAuth()
  const location = useLocation()

  if (loading)   return <LoadingScreen />
  if (!user)     return <Navigate to="/admin-login" state={{ from: location }} replace />
  if (!profile)  return authError ? <ErrorScreen message={authError} /> : <LoadingScreen />
  if (!isAdmin)  return <Navigate to="/admin-login" replace />
  return children
}

export function GuestRoute({ children }) {
  const { user, profile, isAdmin, isApproved, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user)   return children
  if (!profile) return <LoadingScreen />
  if (isAdmin)    return <Navigate to="/admin"     replace />
  if (isApproved) return <Navigate to="/dashboard" replace />
  return <Navigate to="/pending" replace />
}
