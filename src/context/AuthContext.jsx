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
    setUser(currentUser)
    if (currentUser) {
      await fetchProfile(currentUser.id)
    } else {
      setProfile(null)
    }
  }, [fetchProfile])

  useEffect(() => {
    let isMounted = true

    // Last-resort safety net — if everything hangs for 8s, force navigate to login
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error('[Auth] TIMEOUT: forcing redirect to login')
        Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k) })
        window.location.href = '/login'
      }
    }, 8000)

    // Register listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip INITIAL_SESSION — handled by initializeAuth below
        if (event === 'INITIAL_SESSION') return
        // Skip SIGNED_IN that fires during/before initial session handling (Supabase quirk)
        if (event === 'SIGNED_IN' && !initialSessionHandled.current) return
        if (!isMounted) return

        if (event !== 'TOKEN_REFRESHED') setLoading(true)
        await handleSession(session, `onAuthStateChange(${event})`)
        if (isMounted) setLoading(false)
      }
    )

    // Then validate and load the initial session
    const initializeAuth = async () => {
      try {
        // getSession() reads from localStorage — fast, but may return a stale/expired token
        const { data: { session } } = await supabase.auth.getSession()
        if (!isMounted) return

        if (!session) {
          // No stored session — user is not logged in
          setUser(null)
          setProfile(null)
          return
        }

        // Validate the stored session with Supabase servers (network call).
        // This detects expired/revoked tokens immediately instead of letting
        // the profile fetch hang with a stale auth header.
        const { data: { user: validatedUser }, error: userError } = await supabase.auth.getUser()
        if (!isMounted) return

        if (userError || !validatedUser) {
          // Stored session is stale — clear it now so the user goes straight to login
          console.warn('[Auth] Stale session cleared:', userError?.message)
          Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k) })
          setUser(null)
          setProfile(null)
          return
        }

        // Valid session — load profile
        setUser(validatedUser)
        await fetchProfile(validatedUser.id)
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
