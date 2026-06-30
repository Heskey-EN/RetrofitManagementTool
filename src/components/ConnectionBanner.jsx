import { storeMode } from '../lib/jobsStore'

// Tells the user whether they have true multi-user sync (Supabase) or are in
// the local-only fallback. Only shown in local mode so it stays out of the way
// once Supabase is configured.
export default function ConnectionBanner() {
  if (storeMode === 'supabase') return null
  return (
    <div className="banner banner--warn" role="status">
      <strong>Local mode</strong> — jobs and documents are stored in this browser
      (IndexedDB) and synced across tabs on this machine. Live sync across users
      can be added later via the pluggable backend layer.
    </div>
  )
}
