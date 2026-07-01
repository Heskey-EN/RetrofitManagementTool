import { createClient } from '@supabase/supabase-js'

// Normalise the project URL: people often paste the REST endpoint
// (…supabase.co/rest/v1/) or leave a trailing slash, which makes the client
// build invalid paths like …/rest/v1/auth/v1/token ("Invalid path specified in
// request URL"). Strip a stray /rest/v1 or /auth/v1 and any trailing slash so
// only the base project URL is used.
function normalizeSupabaseUrl(u) {
  if (!u) return u
  return u.trim().replace(/\/(rest|auth)\/v1\/?$/i, '').replace(/\/+$/, '')
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

// The app works with or without Supabase configured. When both env vars are
// present we create a real client and get true multi-user real-time sync.
// Otherwise the store falls back to a local (per-browser) backend.
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      realtime: { params: { eventsPerSecond: 20 } },
    })
  : null
