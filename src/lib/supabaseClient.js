import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The app works with or without Supabase configured. When both env vars are
// present we create a real client and get true multi-user real-time sync.
// Otherwise the store falls back to a local (per-browser) backend.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      realtime: { params: { eventsPerSecond: 20 } },
    })
  : null
