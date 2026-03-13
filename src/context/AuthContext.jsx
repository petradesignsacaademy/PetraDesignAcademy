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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('[Auth] Profile fetch error:', error.message)
        setProfile(null)
        setAuthError(`Profile fetch failed: ${error.message}`)
        return null
      }

      if (!data) {
        console.warn('[Auth] No profile found for user:', userId)
        setProfile(null)
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

  const handleSession = useCallback(async (session, source) => {
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

    // Safety net — if loading never resolves in 10s, force it
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error('[Auth] TIMEOUT: forcing loading=false after 10s')
        setLoading(false)
        setAuthError('Authentication timed out. Please refresh the page.')
      }
    }, 10000)

    // Register listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip INITIAL_SESSION — handled by getSession below (avoids race condition)
        if (event === 'INITIAL_SESSION') return
        if (!isMounted) return

        if (event !== 'TOKEN_REFRESHED') setLoading(true)
        await handleSession(session, `onAuthStateChange(${event})`)
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
        await handleSession(session, 'getSession')
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
