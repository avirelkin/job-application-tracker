export default function AuthScreen({
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  submitAuth,
}) {
  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <h2>
          Track every application. <br />
          Stay in control.
        </h2>
        <p>Notes, statuses, and timelines—so you always know whats next.</p>

        <ul className="auth-bullets">
          <li>
            <span className="badge badge-applied auth-badge">Applied</span>
            <span className="auth-bullet-text">
              Smart filtering + status tracking
            </span>
          </li>
          <li>
            <span className="badge badge-interview auth-badge">Interview</span>
            <span className="auth-bullet-text">
              Full details modal for notes
            </span>
          </li>
          <li>
            <span className="badge badge-offer auth-badge">Offer</span>
            <span className="auth-bullet-text">Created + applied dates</span>
          </li>
        </ul>
      </div>

      <div className="auth-card">
        <h2 style={{ marginTop: 0 }}>
          {authMode === 'register' ? 'Create account' : 'Log in'}
        </h2>

        <form onSubmit={submitAuth} style={{ display: 'grid', gap: 10 }}>
          <input
            placeholder="Email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            placeholder="Password"
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            autoComplete={
              authMode === 'register' ? 'new-password' : 'current-password'
            }
          />

          <button className="btn" type="submit">
            {authMode === 'register' ? 'Register' : 'Login'}
          </button>

          <button
            className="btn"
            type="button"
            onClick={() =>
              setAuthMode((m) => (m === 'login' ? 'register' : 'login'))
            }
          >
            Switch to {authMode === 'login' ? 'Register' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
