import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = 'https://arizznwyilssuihycbjw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyaXp6bnd5aWxzc3VpaHljYmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDQyNTcsImV4cCI6MjA4ODcyMDI1N30.ysk8SOeJ_nChxn_yXTQAiyELYWAcwyWsRgmLQgMmj68'

export const supabaseConfigError = null

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: true,
  },
})
