import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import Login from './Login'
import AddUserModal from './AddUserModal'
import '../styles-admin.css'

const ROLES = ['admin', 'member', 'viewer']
const STATUSES = ['pending', 'active', 'disabled']

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Admin console: manage who can access the tool and what role they hold.
// Gated to signed-in admins; everyone else sees a sign-in or a not-authorised
// message. All reads/writes go through Supabase RLS.
export default function AdminPage() {
  const auth = useAuth()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [error, setError] = useState(null)
  const [addOpen, setAddOpen] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    setError(null)
    const { data, error: err } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
    if (err) setError(err.message)
    setUsers(data || [])
    setLoadingUsers(false)
  }, [])

  useEffect(() => {
    if (auth.isAdmin) loadUsers()
  }, [auth.isAdmin, loadUsers])

  async function updateUser(id, patch) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
    const { error: err } = await supabase.from('profiles').update(patch).eq('id', id)
    if (err) {
      setError(err.message)
      loadUsers()
    }
  }

  if (!auth.configured) {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1 className="auth__title">Admin</h1>
          <p className="auth__note">
            Supabase isn't connected in this build. Add <code>VITE_SUPABASE_URL</code> and
            <code>VITE_SUPABASE_ANON_KEY</code>, then run the migration in <code>supabase/migrations</code>.
          </p>
          <a className="auth__link" href="#/">← Back to home</a>
        </div>
      </div>
    )
  }

  if (auth.loading) return <div className="admin__loading">Loading…</div>

  if (!auth.session) return <Login auth={auth} />

  if (!auth.isAdmin) {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1 className="auth__title">Not authorised</h1>
          <p className="auth__note">
            You're signed in as <strong>{auth.user.email}</strong>, but this area is for admins only.
            {auth.status === 'pending' && ' Your access is still pending approval.'}
          </p>
          <div className="auth__actions">
            <a className="btn" href="#/app">Open the app</a>
            <button className="btn" onClick={auth.signOut}>Sign out</button>
          </div>
        </div>
      </div>
    )
  }

  const counts = users.reduce((acc, u) => ((acc[u.status] = (acc[u.status] || 0) + 1), acc), {})

  return (
    <div className="admin">
      <header className="admin__top">
        <div>
          <p className="admin__eyebrow">Admin</p>
          <h1 className="admin__title">Users &amp; access</h1>
        </div>
        <div className="admin__top-actions">
          <button className="btn btn--primary" onClick={() => setAddOpen(true)}>＋ Add user</button>
          <a className="btn" href="#/app">Open the app</a>
          <button className="btn" onClick={auth.signOut}>Sign out ({auth.user.email})</button>
        </div>
      </header>

      <div className="admin__summary">
        <span>{users.length} user{users.length === 1 ? '' : 's'}</span>
        <span className="admin__dot admin__dot--active">{counts.active || 0} active</span>
        <span className="admin__dot admin__dot--pending">{counts.pending || 0} pending</span>
        <span className="admin__dot admin__dot--disabled">{counts.disabled || 0} disabled</span>
        <button className="btn btn--sm" onClick={loadUsers}>Refresh</button>
      </div>

      {error && <div className="admin__error">{error}</div>}

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loadingUsers && users.length === 0 ? (
              <tr><td colSpan={5} className="admin__empty">Loading users…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="admin__empty">No users yet. People appear here after they sign up.</td></tr>
            ) : (
              users.map((u) => {
                const self = u.id === auth.user.id
                return (
                  <tr key={u.id}>
                    <td>{u.full_name || <span className="admin__muted">—</span>}{self && <span className="admin__you">you</span>}</td>
                    <td className="admin__mono">{u.email}</td>
                    <td>
                      <select
                        className={`admin__select admin__select--role admin__role--${u.role}`}
                        value={u.role}
                        onChange={(e) => updateUser(u.id, { role: e.target.value })}
                        disabled={self}
                        title={self ? "You can't change your own role" : 'Change role'}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        className={`admin__select admin__status--${u.status}`}
                        value={u.status}
                        onChange={(e) => updateUser(u.id, { status: e.target.value })}
                        disabled={self}
                        title={self ? "You can't change your own status" : 'Change status'}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="admin__muted">{formatDate(u.created_at)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="admin__hint">
        Use <strong>Add user</strong> to create an account directly, or let people sign up
        from the login screen (they start as <strong>pending</strong>) and set them to
        <strong> active</strong> here.
      </p>

      {addOpen && <AddUserModal onClose={() => setAddOpen(false)} onCreated={loadUsers} />}
    </div>
  )
}
