import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

// Tracks the Supabase auth session and the signed-in user's profile (role +
// access status). Safe to use when Supabase isn't configured — it just reports
// `configured: false` so callers can show setup guidance instead of a login.
export function useAuth() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data || null)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return undefined
    }
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      await loadProfile(data.session?.user?.id)
      if (active) setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      loadProfile(s?.user?.id)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback((email, password) => supabase.auth.signInWithPassword({ email, password }), [])
  const signUp = useCallback(
    (email, password, fullName) =>
      supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } }),
    [],
  )
  const signOut = useCallback(() => supabase.auth.signOut(), [])
  const refresh = useCallback(() => loadProfile(session?.user?.id), [loadProfile, session])

  return {
    configured: isSupabaseConfigured,
    session,
    user: session?.user || null,
    profile,
    role: profile?.role || null,
    status: profile?.status || null,
    isAdmin: profile?.role === 'admin',
    loading,
    signIn,
    signUp,
    signOut,
    refresh,
  }
}
