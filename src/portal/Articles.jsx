import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PortalShell from './PortalShell'
import { Icon } from '../components/Icons'
import { articles, formatDate } from '../lib/articles'
import { loadDrafts } from './portalStore'
import DeleteArticleDialog from './DeleteArticleDialog'

export default function Articles({ email, onLogout, notify }) {
  const [drafts, setDrafts] = useState(() => loadDrafts())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletedSlugs, setDeletedSlugs] = useState(() => new Set())

  const rows = useMemo(() => {
    const draftSlugs = new Set(drafts.map(draft => draft.slug))
    const published = articles
      .filter(article => !deletedSlugs.has(article.slug))
      .map(article => draftSlugs.has(article.slug)
        ? { ...article, ...drafts.find(draft => draft.slug === article.slug), status: 'draft', isPublished: true }
        : { ...article, status: 'published', isPublished: true })
    const newDrafts = drafts
      .filter(draft => !articles.some(article => article.slug === draft.slug))
      .filter(draft => !deletedSlugs.has(draft.slug) && !deletedSlugs.has(draft.originalSlug))
      .map(draft => ({ ...draft, isPublished: false }))
    return [...newDrafts, ...published]
      .filter(row => filter === 'all' || (filter === 'draft' ? row.status === 'draft' : row.status === 'published'))
      .filter(row => `${row.title} ${row.slug} ${row.tags?.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  }, [drafts, query, filter, deletedSlugs])

  function handleDeleted(result, target) {
    const slugs = [target?.slug, target?.originalSlug].filter(Boolean)
    setDeletedSlugs(previous => new Set([...previous, ...slugs]))
    setDrafts(loadDrafts())
    setDeleteTarget(null)
    notify(result?.message || 'Article deleted')
  }

  return (
    <PortalShell
      email={email}
      onLogout={onLogout}
      eyebrow="Library"
      title="All articles"
      actions={<Link to="/portal/articles/new" className="btn btn--primary"><Icon name="plus" size={17} /> New article</Link>}
    >
      <div className="portal-panel">
        <div className="portal-panel__head">
          <div className="portal-filter-tabs" role="group" aria-label="Filter by status">
            {['all', 'published', 'draft'].map(value => (
              <button key={value} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>
                {value === 'all' ? 'All' : value === 'draft' ? 'Drafts' : 'Published'}
              </button>
            ))}
          </div>
          <label className="portal-search">
            <Icon name="search" size={17} />
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search articles" aria-label="Search articles" />
          </label>
        </div>

        <div className="portal-cards">
          {rows.map(row => (
            <article className="portal-article-card" key={`${row.slug}-${row.status}`}>
              <Link to={`/portal/articles/${row.slug}/edit`} className="portal-article-card__media">
                <img src={row.cover} alt="" width="480" height="300" loading="lazy" />
                <span className={`portal-status ${row.status === 'published' ? 'is-published' : 'is-draft'}`}>{row.status === 'published' ? 'Published' : row.isPublished ? 'Draft changes' : 'Draft'}</span>
              </Link>
              <div className="portal-article-card__body">
                <div className="portal-row__tags">{row.tags?.slice(0, 3).map(tag => <em key={tag}>{tag}</em>)}</div>
                <h2><Link to={`/portal/articles/${row.slug}/edit`}>{row.title || 'Untitled draft'}</Link></h2>
                <p>{row.excerpt || 'No excerpt yet.'}</p>
                <div className="portal-article-card__foot">
                  <span>{formatDate(row.updatedAt || row.updatedAtLocal)}</span>
                  <div className="portal-row__actions">
                    <Link to={`/portal/articles/${row.slug}/edit`} aria-label="Edit"><Icon name="edit" size={17} /></Link>
                    <Link to={`/portal/articles/${row.slug}/preview`} aria-label="Preview"><Icon name="eye" size={17} /></Link>
                    <button type="button" onClick={() => setDeleteTarget(row)} aria-label={`Delete ${row.title}`} title="Delete article"><Icon name="trash" size={17} /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!rows.length ? <div className="portal-empty"><Icon name="edit" size={26} /><h3>No articles found</h3><p>Change the filters or create a new article.</p><Link to="/portal/articles/new" className="btn btn--primary">New article</Link></div> : null}
      </div>
      {deleteTarget ? (
        <DeleteArticleDialog
          article={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={result => handleDeleted(result, deleteTarget)}
        />
      ) : null}
    </PortalShell>
  )
}
