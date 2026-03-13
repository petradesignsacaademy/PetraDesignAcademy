import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[Supabase] URL:', supabaseUrl)
console.log('[Supabase] Key prefix:', supabaseAnonKey?.substring(0, 20))

// Never throw at module level — it crashes React before it mounts
// Instead create a dummy client and let AuthContext handle the error gracefully
const missingVars = !supabaseUrl || !supabaseAnonKey
const badKey = supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')

if (missingVars) {
  console.error('[Supabase] MISSING environment variables — check Vercel env vars')
} else if (badKey) {
  console.error('[Supabase] Invalid anon key format — must start with eyJ')
}

export const supabaseConfigError = missingVars
  ? 'Missing Supabase environment variables. Check Vercel settings.'
  : badKey
  ? 'Invalid Supabase anon key. Go to Supabase → Settings → API and copy the anon/public key.'
  : null

export const supabase = (missingVars || badKey)
  ? {
      auth: {
        getSession:          async () => ({ data: { session: null }, error: null }),
        onAuthStateChange:   ()      => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword:  async () => ({ data: null, error: { message: supabaseConfigError } }),
        signUp:              async () => ({ data: null, error: { message: supabaseConfigError } }),
        signOut:             async () => {},
        resetPasswordForEmail: async () => ({ error: { message: supabaseConfigError } }),
      },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
    }
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken:   true,
        persistSession:     true,
        detectSessionInUrl: true,
      },
    })
