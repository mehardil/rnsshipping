import { Link } from 'react-router-dom'
import { Icon } from './Icons'
import { articleHref, formatDate } from '../lib/articles'

export default function ArticleCard({ article, featured = false }) {
  if (!article) return null
  const primaryTag = article.tags?.[0]
  return (
    <article className={`insight-card ${featured ? 'insight-card--featured' : ''}`}>
      <Link to={articleHref(article)} className="insight-card__media" aria-label={`Read ${article.title}`}>
        <img src={article.cover} alt={article.coverAlt} width="900" height="563" loading={featured ? 'eager' : 'lazy'} decoding="async" />
        {primaryTag ? <span className="insight-card__tag">{primaryTag}</span> : null}
      </Link>
      <div className="insight-card__body">
        <div className="insight-card__meta">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{article.readingTime} min read</span>
        </div>
        <h3><Link to={articleHref(article)}>{article.title}</Link></h3>
        <p>{article.excerpt}</p>
        <Link to={articleHref(article)} className="insight-card__link">
          Read article <Icon name="arrow" size={17} />
        </Link>
      </div>
    </article>
  )
}
