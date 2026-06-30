import { supabase, isSupabaseConfigured } from './supabaseClient'

// A small uniform interface over two interchangeable backends:
//   - "supabase": a shared Postgres table with real-time Postgres changes,
//     giving true multi-user sync across all 40-50 users.
//   - "local": browser localStorage + BroadcastChannel, which syncs across
//     tabs on one machine so the app is fully usable before Supabase is set up.
//
// Components don't care which backend is active; they call the same methods and
// subscribe to the same change events.

const TABLE = 'jobs'

function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/* -------------------------------------------------------------------------- */
/*  Supabase backend                                                          */
/* -------------------------------------------------------------------------- */

function createSupabaseStore() {
  return {
    mode: 'supabase',

    async fetchAll() {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    },

    async insertMany(jobs) {
      const rows = jobs.map((j) => ({ ...j, id: j.id || uuid() }))
      const { data, error } = await supabase.from(TABLE).insert(rows).select()
      if (error) throw error
      return data
    },

    async updateJob(id, patch) {
      const { data, error } = await supabase
        .from(TABLE)
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async clearAll() {
      // Delete every row. neq on a never-null column matches all rows.
      const { error } = await supabase.from(TABLE).delete().neq('id', uuid())
      if (error) throw error
    },

    subscribe(onChange) {
      const channel = supabase
        .channel('jobs-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: TABLE },
          (payload) => onChange(payload),
        )
        .subscribe()
      return () => supabase.removeChannel(channel)
    },
  }
}

/* -------------------------------------------------------------------------- */
/*  Local backend (localStorage + BroadcastChannel)                           */
/* -------------------------------------------------------------------------- */

const LS_KEY = 'rmt:jobs'

function createLocalStore() {
  const channel =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('rmt:jobs') : null

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
    } catch {
      return []
    }
  }
  const write = (rows) => localStorage.setItem(LS_KEY, JSON.stringify(rows))
  const announce = (payload) => channel?.postMessage(payload)

  return {
    mode: 'local',

    async fetchAll() {
      return read()
    },

    async insertMany(jobs) {
      const now = new Date().toISOString()
      const rows = jobs.map((j) => ({
        ...j,
        id: j.id || uuid(),
        created_at: now,
        updated_at: now,
      }))
      write([...read(), ...rows])
      announce({ eventType: 'INSERT', new: rows })
      return rows
    },

    async updateJob(id, patch) {
      const rows = read()
      const idx = rows.findIndex((r) => r.id === id)
      if (idx === -1) return null
      rows[idx] = { ...rows[idx], ...patch, updated_at: new Date().toISOString() }
      write(rows)
      announce({ eventType: 'UPDATE', new: rows[idx] })
      return rows[idx]
    },

    async clearAll() {
      write([])
      announce({ eventType: 'DELETE', new: null })
    },

    subscribe(onChange) {
      if (!channel) return () => {}
      const handler = (e) => onChange(e.data)
      channel.addEventListener('message', handler)
      // Also pick up changes from other tabs via the storage event.
      const storageHandler = (e) => {
        if (e.key === LS_KEY) onChange({ eventType: 'SYNC', new: null })
      }
      window.addEventListener('storage', storageHandler)
      return () => {
        channel.removeEventListener('message', handler)
        window.removeEventListener('storage', storageHandler)
      }
    },
  }
}

export const jobsStore = isSupabaseConfigured ? createSupabaseStore() : createLocalStore()
export const storeMode = jobsStore.mode
