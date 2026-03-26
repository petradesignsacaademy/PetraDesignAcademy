import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [authError, setAuthError] = useState(null)
  const initialSessionHandled   = useRef(false)
  const currentUserIdRef        = useRef(null)

  const fetchProfile = useCallback(async (userId) => {
    try {
      // Try SECURITY DEFINER RPC first — bypasses RLS so admin profiles are never blocked.
      // Fall back to direct table query if the function is unavailable.
      let data = null

      const { data: rows, error: rpcError } = await supabase.rpc('get_my_profile')
      if (!rpcError) {
        data = Array.isArray(rows) ? rows[0] ?? null : rows ?? null
      }

      if (!data) {
        // Fallback: direct query (works for students whose RLS is straightforward)
        const { data: row, error: tableError } = await supabase
          .from('profiles').select('*').eq('id', userId).maybeSingle()
        if (tableError) {
          console.error('[Auth] Profile fetch error:', tableError.message)
          setProfile(null)
          setAuthError(`Profile fetch failed: ${tableError.message}`)
          return null
        }
        data = row ?? null
      }

      if (!data) {
        console.warn('[Auth] No profile found for user:', userId)
        setProfile(null)
        setAuthError('No profile found for your account. Please contact support.')
        return null
      }

      setProfile(data)
      setAuthError(null)
      return data
    } catch (err) {
      console.error('[Auth] Unexpected error in fetchProfile:', err)
      setProfile(null)
      setAuthError(`Unexpected error: ${err.message}`)
      return null
    }
  }, [])

  const handleSession = useCallback(async (session) => {
    const currentUser = session?.user ?? null
    currentUserIdRef.current = currentUser?.id ?? null
    setUser(currentUser)
    if (currentUser) {
      await fetchProfile(currentUser.id)
    } else {
      setProfile(null)
    }
  }, [fetchProfile])

  useEffect(() => {
    let isMounted = true

    // Last-resort safety net — if init never completes in 8s, force navigate to login.
    // Uses the ref (not the `loading` state) to avoid the stale-closure problem.
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !initialSessionHandled.current) {
        console.error('[Auth] TIMEOUT: forcing redirect to login')
        Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k) })
        window.location.href = '/login'
      }
    }, 8000)

    // Register listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // INITIAL_SESSION — handled by initializeAuth below
        if (event === 'INITIAL_SESSION') return
        // TOKEN_REFRESHED — Supabase manages the token internally; no state update needed
        if (event === 'TOKEN_REFRESHED') return
        // SIGNED_IN during startup — already handled by initializeAuth
        if (event === 'SIGNED_IN' && !initialSessionHandled.current) return
        if (!isMounted) return

        if (event === 'SIGNED_OUT') {
          // Clear state immediately without a loading flash
          setUser(null)
          setProfile(null)
          return
        }

        // SIGNED_IN for the same user = silent token refresh on tab focus — skip loading
        if (event === 'SIGNED_IN' && session?.user?.id === currentUserIdRef.current) {
          setUser(session.user)
          return
        }
        // Genuine new SIGNED_IN (different user, magic link, etc.) or USER_UPDATED
        setLoading(true)
        await handleSession(session)
        if (isMounted) setLoading(false)
      }
    )

    // Then get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('[Auth] getSession error:', error)
          setAuthError(`Session error: ${error.message}`)
        }
        if (!isMounted) return
        await handleSession(session)
      } catch (err) {
        console.error('[Auth] initializeAuth error:', err)
        if (isMounted) setAuthError(`Init error: ${err.message}`)
      } finally {
        if (isMounted) {
          initialSessionHandled.current = true
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [handleSession])

  const isAdmin    = profile?.role === 'admin'
  const isApproved = profile?.status === 'approved'
  const isPending  = profile?.status === 'pending'

  const value = {
    user, profile, loading, authError,
    isAdmin, isApproved, isPending,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: async () => {
      await supabase.auth.signOut()
      // Wipe all Supabase localStorage keys so no stale session survives
      Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k) })
      setUser(null)
      setProfile(null)
    },
    signUp: (email, password, fullName) => supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    }),
    refreshProfile: () => user ? fetchProfile(user.id) : Promise.resolve(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
