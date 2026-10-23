import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PortalShell from './PortalShell'
import ArticlePreview from './ArticlePreview'
import { Icon } from '../components/Icons'
import { loadArticle } from '../lib/articles'
import { getDraft } from './portalStore'

export default function PreviewArticle({ email, onLogout }) {
  const { slug } = useParams()
  const [article, setArticle] = useState(() => getDraft(slug))
  const [loading, setLoading] = useState(!article)

  useEffect(() => {
    let active = true
    const draft = getDraft(slug)
    if (draft) { setArticle(draft); setLoading(false); return }
    loadArticle(slug).then(result => {
      if (active) { setArticle(result); setLoading(false) }
    })
    return () => { active = false }
  }, [slug])

  return (
    <PortalShell
      email={email}
      onLogout={onLogout}
      eyebrow="Preview"
      title={article?.title || 'Article preview'}
      actions={<Link to={`/portal/articles/${slug}/edit`} className="btn btn--primary"><Icon name="edit" size={17} /> Edit article</Link>}
    >
      {loading ? <div className="portal-loading-card">Loading preview…</div> : <div className="portal-panel portal-panel--preview"><ArticlePreview article={article} /></div>}
    </PortalShell>
  )
}
