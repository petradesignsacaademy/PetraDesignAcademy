import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Spinner shown while session is loading
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--purple)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Any logged-in, approved student
export function ProtectedRoute({ children }) {
  const { user, isApproved, isPending, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />

  // Approved — let them through
  if (isApproved) return children

  // Pending approval — show a holding page
  if (isPending) return <Navigate to="/pending" replace />

  // Edge case: logged in but no profile yet
  return <Navigate to="/login" replace />
}

// Admin only — Petra's dashboard
export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading)  return <LoadingScreen />
  if (!user)    return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return children
}

// Redirect already-logged-in users away from /login and /register
export function GuestRoute({ children }) {
  const { user, isAdmin, isApproved, loading } = useAuth()

  if (loading) return <LoadingScreen />

  if (user) {
    if (isAdmin)    return <Navigate to="/admin"     replace />
    if (isApproved) return <Navigate to="/dashboard" replace />
    return <Navigate to="/pending" replace />
  }

  return children
}
