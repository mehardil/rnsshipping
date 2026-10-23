import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icons'
import { apiFetch, deleteDraft } from './portalStore'

export default function DeleteArticleDialog({ article, onClose, onDeleted }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => emailRef.current?.focus(), 60)
    const onKey = event => {
      if (event.key === 'Escape' && !loading) onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [loading, onClose])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const slug = article.originalSlug || article.slug
      const result = await apiFetch('/api/delete', {
        method: 'POST',
        body: JSON.stringify({ slug, email, password }),
      })
      deleteDraft(article.slug)
      if (article.originalSlug) deleteDraft(article.originalSlug)
      onDeleted(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-modal" role="presentation">
      <button type="button" className="portal-modal__backdrop" aria-label="Close delete dialog" onClick={() => { if (!loading) onClose() }} />
      <section className="portal-modal__box" role="dialog" aria-modal="true" aria-labelledby="delete-article-title">
        <button type="button" className="portal-modal__close" onClick={onClose} aria-label="Close" disabled={loading}><Icon name="close" size={20} /></button>
        <span className="portal-modal__icon"><Icon name="trash" size={22} /></span>
        <h2 id="delete-article-title">Delete this article?</h2>
        <p className="portal-modal__article">{article.title || 'Untitled article'}</p>
        <p className="portal-modal__warning">
          {article.isPublished
            ? 'This removes the article from the repository and schedules a rebuild to take the public page offline. This cannot be undone.'
            : 'This removes the local draft. This cannot be undone.'}
        </p>

        <form onSubmit={submit} className="portal-modal__form">
          <label className="portal-field">
            <span>Authorisation email</span>
            <input
              ref={emailRef}
              type="email"
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
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter the portal password"
              required
              disabled={loading}
            />
          </label>

          {error ? <p className="portal-alert portal-alert--error" role="alert">{error}</p> : null}

          <div className="portal-modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn portal-danger-btn" disabled={loading}>
              {loading ? 'Deleting…' : 'Authorise and delete'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
