import { useAuth } from '../hooks/useAuth'
import Login from './Login'
import '../styles-admin.css'

// Wraps the app. When Supabase is configured, users must be signed in AND active
// (approved by an admin) to get in. When Supabase isn't configured — e.g. local
// dev without keys — it passes straight through so the tool still runs locally.
export default function AuthGate({ children }) {
  const auth = useAuth()

  if (!auth.configured) return children
  if (auth.loading) return <div className="admin__loading">Loading…</div>
  if (!auth.session) return <Login auth={auth} />

  if (auth.status !== 'active') {
    return (
      <div className="auth">
        <div className="auth__card">
          <h1 className="auth__title">{auth.status === 'disabled' ? 'Access disabled' : 'Awaiting approval'}</h1>
          <p className="auth__note">
            You're signed in as <strong>{auth.user.email}</strong>.{' '}
            {auth.status === 'disabled'
              ? 'Your access has been disabled by an admin.'
              : 'An admin needs to activate your account before you can use the tool.'}
          </p>
          <div className="auth__actions">
            <button className="btn" onClick={auth.signOut}>Sign out</button>
          </div>
        </div>
      </div>
    )
  }

  return children
}
