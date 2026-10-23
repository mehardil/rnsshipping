import { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import ArticleCard from '../components/ArticleCard'
import ShareButtons from '../components/ShareButtons'
import { Icon } from '../components/Icons'
import NotFound from './NotFound'
import { ArticleDataContext, readEmbeddedArticle } from '../lib/articleContext'
import { articleHref, formatDate, loadArticle, relatedArticles } from '../lib/articles'
import { extractHeadings, renderMarkdown } from '../lib/markdown'

const ORIGIN = 'https://rnsshipping.com'

export default function InsightDetail() {
  const { slug } = useParams()
  const contextArticle = useContext(ArticleDataContext)
  const embedded = useMemo(() => readEmbeddedArticle(), [])
  const initial = contextArticle?.slug === slug ? contextArticle : embedded?.slug === slug ? embedded : null
  const [article, setArticle] = useState(initial)
  const [loading, setLoading] = useState(!initial)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (initial) {
      setArticle(initial)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    loadArticle(slug).then(result => {
      if (cancelled) return
      setArticle(result)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [slug, initial])

  useEffect(() => {
    if (!article) return
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [article])

  const headings = useMemo(() => article ? extractHeadings(article.body) : [], [article])
  const related = useMemo(() => article ? relatedArticles(article, 3) : [], [article])

  if (loading && !article) {
    return (
      <section className="section article-loading" aria-busy="true">
        <div className="container"><p>Loading article…</p></div>
      </section>
    )
  }
  if (!article) return <NotFound />

  const url = `${ORIGIN}${articleHref(article)}`
  const primaryTag = article.tags?.[0]
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    image: [`${ORIGIN}${article.cover}`],
    datePublished: new Date(`${article.publishedAt}T08:00:00Z`).toISOString(),
    dateModified: new Date(`${article.updatedAt}T08:00:00Z`).toISOString(),
    author: { '@type': 'Organization', name: article.author },
    publisher: { '@id': `${ORIGIN}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: article.keywords,
    articleSection: primaryTag,
    wordCount: article.wordCount,
    inLanguage: 'en-AE',
  }
  const faqJsonLd = article.faqs?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  } : undefined

  return (
    <>
      <Seo
        title={article.seoTitle || article.title}
        description={article.description}
        path={articleHref(article)}
        image={article.cover}
        keywords={article.keywords}
        type="article"
        publishedTime={new Date(`${article.publishedAt}T08:00:00Z`).toISOString()}
        modifiedTime={new Date(`${article.updatedAt}T08:00:00Z`).toISOString()}
        author={article.author}
        section={primaryTag}
        tags={article.tags}
        jsonLd={articleJsonLd}
        extraJsonLd={faqJsonLd}
      />

      <div className="article-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

      <section className="article-hero">
        <div className="container article-hero__grid">
          <div className="article-hero__copy">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link><span>/</span><Link to="/insights">Insights</Link><span>/</span>
              <span aria-current="page">{primaryTag || 'Article'}</span>
            </nav>
            <div className="article-hero__tags">
              {article.tags.map(tag => <span key={tag}>{tag}</span>)}
            </div>
            <h1>{article.title}</h1>
            <p className="lead">{article.excerpt}</p>
            <div className="article-hero__meta">
              <span className="article-author">
                <span className="article-author__avatar">RNS</span>
                <span><b>{article.author}</b><small>Marine operations &amp; technical team</small></span>
              </span>
              <span className="article-meta-item"><Icon name="clock" size={16} /> {article.readingTime} min read</span>
              <span className="article-meta-item"><time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time></span>
            </div>
            <ShareButtons title={article.title} url={url} compact />
          </div>
          <figure className="article-hero__cover">
            <img src={article.cover} alt={article.coverAlt} width="1400" height="900" fetchpriority="high" />
          </figure>
        </div>
      </section>

      <section className="section article-section">
        <div className="container article-layout">
          <article className="article-body">
            {article.takeaways?.length ? (
              <aside className="article-takeaways">
                <span className="eyebrow">Key takeaways</span>
                <ul>{article.takeaways.map(item => <li key={item}><Icon name="check" size={17} />{item}</li>)}</ul>
              </aside>
            ) : null}
            {renderMarkdown(article.body)}

            {article.faqs?.length ? (
              <section className="article-faq">
                <span className="eyebrow">Frequently asked</span>
                <h2>Questions ship managers ask</h2>
                <div>
                  {article.faqs.map(faq => (
                    <details className="faq-item" key={faq.q}>
                      <summary>{faq.q}</summary>
                      <p>{faq.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="article-author-box">
              <span className="article-author__avatar article-author__avatar--large">RNS</span>
              <div>
                <h3>{article.author}</h3>
                <p>
                  Practical guidance from RNS Shipping&apos;s marine operations and technical team in
                  Dubai, with more than 35 years of seafaring and technical experience supporting
                  vessels across the UAE.
                </p>
                <Link to="/about" className="text-link">About RNS Shipping <Icon name="arrow" size={17} /></Link>
              </div>
            </div>

            <div className="article-share-end">
              <ShareButtons title={article.title} url={url} />
            </div>
          </article>

          <aside className="article-aside">
            {headings.length ? (
              <nav className="article-toc" aria-label="On this page">
                <span>On this page</span>
                <ul>
                  {headings.map(heading => (
                    <li key={heading.id} className={heading.level === 3 ? 'is-sub' : ''}>
                      <a href={`#${heading.id}`}>{heading.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}

            <div className="article-aside__tags">
              <span>Topics</span>
              <div>{article.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            </div>

            <div className="article-cta">
              <span className="eyebrow">Operations desk</span>
              <h3>Need this scope on your vessel?</h3>
              <p>Send the vessel details, port and working window. We will review the requirement.</p>
              <Link to="/contact?service=Ship%20Repair%20%26%20Maintenance" className="btn btn--primary">Request a quotation <Icon name="arrow" size={17} /></Link>
              <a href="tel:+971555396858" className="text-link"><Icon name="phone" size={16} /> +971 55 539 6858</a>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section section--tint">
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">Continue reading</span>
              <h2>Related marine guidance</h2>
            </Reveal>
            <div className="grid grid-3">
              {related.map(item => <Reveal key={item.slug}><ArticleCard article={item} /></Reveal>)}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
