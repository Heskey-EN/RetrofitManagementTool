import { useState } from 'react'

// Email/password sign in, with a sign-up toggle for new team members. New
// sign-ups land as 'pending' until an admin activates them (see AdminPage).
export default function Login({ auth }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      if (mode === 'signin') {
        const { error } = await auth.signIn(email.trim(), password)
        if (error) setMessage({ type: 'error', text: error.message })
      } else {
        const { data, error } = await auth.signUp(email.trim(), password, fullName.trim())
        if (error) setMessage({ type: 'error', text: error.message })
        else if (!data.session) {
          setMessage({ type: 'ok', text: 'Account created. Check your email to confirm, then ask an admin to activate your access.' })
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <p className="auth__eyebrow">Retrofit Project Management Tool</p>
        <h1 className="auth__title">{mode === 'signin' ? 'Sign in' : 'Create your account'}</h1>
        <form className="auth__form" onSubmit={submit}>
          {mode === 'signup' && (
            <label className="auth__field">
              <span>Full name</span>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" autoComplete="name" />
            </label>
          )}
          <label className="auth__field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ecofutures.co.uk" autoComplete="email" required />
          </label>
          <label className="auth__field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={6} />
          </label>
          {message && <p className={`auth__msg auth__msg--${message.type}`}>{message.text}</p>}
          <button className="auth__submit" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p className="auth__switch">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(null) }}>
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
