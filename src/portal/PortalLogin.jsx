import { useState } from 'react'
import { Icon } from '../components/Icons'
import { apiFetch } from './portalStore'

export default function PortalLogin({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await apiFetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      onSuccess(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="portal-login">
      <section className="portal-login__brand">
        <img className="portal-login__bg" src="/images/rns-ship-bow.webp" alt="" width="1600" height="1000" />
        <div className="portal-login__overlay" />
        <a className="portal-brand" href="/" aria-label="RNS Shipping home">
          <img src="/images/logo.png" alt="RNS Shipping LLC logo" width="52" height="52" />
          <span>RNS Shipping<small>Insights Studio</small></span>
        </a>
        <div className="portal-login__copy">
          <span className="eyebrow">Editorial portal</span>
          <h1>Write with the authority of the operations desk.</h1>
          <p>Publish practical marine guidance, manage your article library and keep every page search-ready.</p>
          <div className="portal-login__badges">
            <span><Icon name="shield" size={17} /> Private access</span>
            <span><Icon name="search" size={17} /> SEO built in</span>
            <span><Icon name="clock" size={17} /> Live in ~90 seconds</span>
          </div>
        </div>
        <div className="portal-login__footer">
          <span>RNS Shipping LLC · Dubai, UAE</span>
          <a href="/insights">View public insights</a>
        </div>
      </section>

      <section className="portal-login__panel">
        <div className="portal-login__form-wrap">
          <div className="portal-login__eyebrow"><Icon name="edit" size={16} /> Authorised personnel</div>
          <h2>Sign in to Insights Studio</h2>
          <p className="portal-login__intro">Use the RNS editorial account to create, edit and publish articles.</p>

          <form onSubmit={submit} className="portal-form">
            <label className="portal-field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="info@rns-shipping.com"
                required
                disabled={loading}
              />
            </label>
            <label className="portal-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </label>

            {error ? <p className="portal-alert portal-alert--error" role="alert">{error}</p> : null}

            <button type="submit" className="btn btn--primary portal-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'} {!loading && <Icon name="arrow" size={18} />}
            </button>
          </form>

          <p className="portal-login__note">
            <Icon name="shield" size={15} /> Access is limited to the RNS editorial account. Sessions expire after 8 hours.
          </p>
          <a className="portal-login__back" href="/">← Back to rnsshipping.com</a>
        </div>
      </section>
    </main>
  )
}
