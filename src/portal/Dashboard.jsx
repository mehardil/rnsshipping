import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PortalShell from './PortalShell'
import { Icon } from '../components/Icons'
import { articles, formatDate } from '../lib/articles'
import { loadDrafts } from './portalStore'
import DeleteArticleDialog from './DeleteArticleDialog'

export default function Dashboard({ email, onLogout, notify }) {
  const [query, setQuery] = useState('')
  const [drafts, setDrafts] = useState(() => loadDrafts())
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletedSlugs, setDeletedSlugs] = useState(() => new Set())

  const rows = useMemo(() => {
    const draftBySlug = new Map(drafts.map(draft => [draft.slug, draft]))
    const published = articles
      .filter(article => !deletedSlugs.has(article.slug))
      .map(article => draftBySlug.get(article.slug)
        ? { ...article, ...draftBySlug.get(article.slug), status: 'draft', isPublished: true }
        : { ...article, status: 'published', isPublished: true })
    const newDrafts = drafts
      .filter(draft => !articles.some(article => article.slug === draft.slug))
      .filter(draft => !deletedSlugs.has(draft.slug) && !deletedSlugs.has(draft.originalSlug))
      .map(draft => ({ ...draft, isPublished: false }))
    return [...newDrafts, ...published].filter(row => {
      if (!query.trim()) return true
      const value = `${row.title} ${row.slug} ${row.tags?.join(' ')}`.toLowerCase()
      return value.includes(query.toLowerCase())
    })
  }, [drafts, query, deletedSlugs])

  function handleDeleted(result, target) {
    const slugs = [target?.slug, target?.originalSlug].filter(Boolean)
    setDeletedSlugs(previous => new Set([...previous, ...slugs]))
    setDrafts(loadDrafts())
    setDeleteTarget(null)
    notify(result?.message || 'Article deleted')
  }

  const visiblePublished = articles.filter(article => !deletedSlugs.has(article.slug))
  const visibleDrafts = drafts.filter(draft => !deletedSlugs.has(draft.slug) && !deletedSlugs.has(draft.originalSlug))
  const tags = new Set(visiblePublished.flatMap(article => article.tags))
  const lastDate = visiblePublished[0]?.updatedAt

  return (
    <PortalShell
      email={email}
      onLogout={onLogout}
      eyebrow="Overview"
      title="Editorial dashboard"
      actions={<Link to="/portal/articles/new" className="btn btn--primary"><Icon name="plus" size={17} /> New article</Link>}
    >
      <section className="portal-stats">
        <div className="portal-stat">
          <span className="portal-stat__icon"><Icon name="edit" size={20} /></span>
          <div><b>{visiblePublished.length}</b><span>Published articles</span></div>
        </div>
        <div className="portal-stat">
          <span className="portal-stat__icon"><Icon name="save" size={20} /></span>
          <div><b>{visibleDrafts.length}</b><span>Drafts in progress</span></div>
        </div>
        <div className="portal-stat">
          <span className="portal-stat__icon"><Icon name="tag" size={20} /></span>
          <div><b>{tags.size}</b><span>Topics covered</span></div>
        </div>
        <div className="portal-stat">
          <span className="portal-stat__icon"><Icon name="clock" size={20} /></span>
          <div><b>{lastDate ? formatDate(lastDate, { day: undefined, year: undefined, month: 'short' }) : '—'}</b><span>Last update</span></div>
        </div>
      </section>

      <section className="portal-panel">
        <div className="portal-panel__head">
          <div>
            <h2>Articles</h2>
            <p>Published pages and drafts. Drafts are private until you publish them.</p>
          </div>
          <label className="portal-search">
            <Icon name="search" size={17} />
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search articles" aria-label="Search articles" />
          </label>
        </div>

        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="portal-table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={`${row.slug}-${row.status}`}>
                  <td>
                    <div className="portal-row">
                      <img src={row.cover} alt="" width="96" height="60" loading="lazy" />
                      <div>
                        <strong>{row.title || 'Untitled draft'}</strong>
                        <span>/{row.isPublished ? 'insights' : 'draft'}/{row.slug || 'untitled'}</span>
                        <div className="portal-row__tags">{row.tags?.slice(0, 2).map(tag => <em key={tag}>{tag}</em>)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`portal-status ${row.status === 'published' ? 'is-published' : 'is-draft'}`}>{row.status === 'published' ? 'Published' : row.isPublished ? 'Draft changes' : 'Draft'}</span></td>
                  <td><span className="portal-muted">{formatDate(row.updatedAt || row.updatedAtLocal)}</span></td>
                  <td>
                    <div className="portal-row__actions">
                      <Link to={`/portal/articles/${row.slug}/edit`} aria-label={`Edit ${row.title}`} title="Edit"><Icon name="edit" size={17} /></Link>
                      {row.isPublished ? <a href={`/insights/${row.slug}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${row.title}`} title="View live"><Icon name="eye" size={17} /></a> : null}
                      <button type="button" onClick={() => setDeleteTarget(row)} aria-label={`Delete ${row.title}`} title="Delete article"><Icon name="trash" size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <div className="portal-empty"><Icon name="edit" size={26} /><h3>No articles match that search</h3><p>Try another term or create a new article.</p></div> : null}
        </div>
      </section>

      <section className="portal-tip">
        <Icon name="search" size={20} />
        <div>
          <h3>Publishing with search in mind</h3>
          <p>Every article is prerendered with a canonical URL, article schema, sitemap entry and internal links. Use the SEO checklist in the editor before you publish.</p>
        </div>
      </section>

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
