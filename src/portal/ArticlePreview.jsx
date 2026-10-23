import { extractHeadings, renderMarkdown } from '../lib/markdown'
import { formatDate } from '../lib/articles'
import { Icon } from '../components/Icons'

export default function ArticlePreview({ article }) {
  if (!article) return null
  const headings = extractHeadings(article.body)
  return (
    <div className="portal-preview">
      <div className="portal-preview__cover">
        <img src={article.cover} alt={article.coverAlt} width="1400" height="800" />
        <div>
          <span className="portal-preview__tag">{article.tags?.[0] || 'Article'}</span>
          <h1>{article.title || 'Untitled article'}</h1>
          <p>{article.excerpt}</p>
          <div className="portal-preview__meta">
            <span>{article.author}</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>{article.readingTime || Math.max(1, Math.ceil((article.body || '').split(/\s+/).length / 220))} min read</span>
          </div>
        </div>
      </div>

      <div className="portal-preview__layout">
        <article className="article-body portal-preview__body">
          {article.takeaways?.length ? (
            <aside className="article-takeaways">
              <span className="eyebrow">Key takeaways</span>
              <ul>{article.takeaways.map(item => <li key={item}><Icon name="check" size={17} />{item}</li>)}</ul>
            </aside>
          ) : null}
          {renderMarkdown(article.body || '')}
          {article.faqs?.length ? (
            <section className="article-faq">
              <span className="eyebrow">Frequently asked</span>
              <h2>Questions ship managers ask</h2>
              <div>
                {article.faqs.filter(faq => faq.q).map(faq => (
                  <details className="faq-item" key={faq.q}>
                    <summary>{faq.q}</summary>
                    <p>{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </article>
        <aside className="portal-preview__aside">
          {headings.length ? (
            <nav className="article-toc">
              <span>On this page</span>
              <ul>{headings.map(heading => <li key={heading.id} className={heading.level === 3 ? 'is-sub' : ''}><a href={`#${heading.id}`}>{heading.text}</a></li>)}</ul>
            </nav>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
