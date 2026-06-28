import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Quick-fill demo accounts so all four logins are easy to try.
const DEMO = [
  { label: 'Admin', username: 'admin', password: 'admin123' },
  { label: 'Ruban (Owner)', username: 'ruban', password: 'ruban123' },
  { label: 'Siva (Owner)', username: 'siva', password: 'siva123' },
  { label: 'Rajavel (Owner)', username: 'rajavel', password: 'rajavel123' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await login(username, password)
      navigate(user.role === 'admin' ? '/admin' : '/owner', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  function quickFill(account) {
    setUsername(account.username)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-logo">🌿</span>
          <h1>Farm Management</h1>
          <p>Sign in to manage and view your farm ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-demo">
          <span className="login-demo-title">Demo accounts — click to fill</span>
          <div className="login-demo-grid">
            {DEMO.map((a) => (
              <button key={a.username} type="button" className="chip" onClick={() => quickFill(a)}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
