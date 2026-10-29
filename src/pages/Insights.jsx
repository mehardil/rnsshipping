import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import ArticleCard from '../components/ArticleCard'
import { Icon } from '../components/Icons'
import { articles, getAllTags } from '../lib/articles'

const HERO_SRC = '/images/insights-hero-1800.webp'
const HERO_SRCSET = '/images/insights-hero-640.webp 640w, /images/insights-hero-960.webp 960w, /images/insights-hero-1280.webp 1280w, /images/insights-hero-1800.webp 1800w'

export default function Insights() {
  const [activeTag, setActiveTag] = useState('')
  const tags = useMemo(() => getAllTags(), [])
  const featured = articles.find(article => article.featured) || articles[0]
  const filtered = activeTag
    ? articles.filter(article => article.tags.includes(activeTag))
    : articles.filter(article => article.slug !== featured?.slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'RNS Shipping Insights',
    description: 'Practical guides on ship repair, cleaning, maintenance, logistics and compliance for vessels in Dubai and the UAE.',
    url: 'https://rnsshipping.com/insights',
    publisher: { '@id': 'https://rnsshipping.com/#organization' },
    blogPost: articles.map(article => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      url: `https://rnsshipping.com/insights/${article.slug}`,
      image: `https://rnsshipping.com${article.cover}`,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
    })),
  }

  return (
    <>
      <Seo
        title="Marine Insights, Ship Repair & Cleaning Guides"
        description="Practical guides on ship repair, ship cleaning, tank cleaning, maintenance and compliance for vessels calling at Dubai, Jebel Ali and Khorfakkan."
        path="/insights"
        keywords="ship repair Dubai guide, ship cleaning Dubai, tank cleaning Jebel Ali, ship maintenance UAE, marine services insights"
        image={featured?.cover || '/images/marine-engine-room.webp'}
        preloadImage="/images/insights-hero-1280.webp"
        preloadImageSrcSet={HERO_SRCSET}
        preloadImageSizes="100vw"
        jsonLd={jsonLd}
      />

      <section className="insights-hero">
        <div className="insights-hero__bg" aria-hidden="true">
          <img
            src={HERO_SRC}
            srcSet={HERO_SRCSET}
            sizes="100vw"
            alt=""
            width="1800"
            height="1013"
            fetchpriority="high"
            decoding="async"
          />
        </div>
        <div className="container insights-hero__inner">
          <Reveal>
            <span className="eyebrow">Insights &amp; Expertise</span>
            <h1>Practical marine knowledge, from the operations desk.</h1>
            <p className="lead">
              Straight answers on ship repair, cleaning, maintenance, spares and compliance —
              written for ship managers, chief engineers and technical superintendents in Dubai and
              across the UAE.
            </p>
            <div className="insights-hero__stats">
              <span><b>{articles.length}</b> in-depth guides</span>
              <span><b>{tags.length}</b> topics covered</span>
              <span><b>35+</b> years at sea</span>
            </div>
          </Reveal>
        </div>
      </section>

      {featured ? (
        <section className="insights-featured">
          <div className="container">
            <Reveal>
              <ArticleCard article={featured} featured />
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="section insights-index">
        <div className="container">
          <Reveal className="insights-index__head">
            <div>
              <span className="eyebrow">Browse the library</span>
              <h2>Guides for the decisions that keep vessels moving</h2>
            </div>
            <Link to="/contact" className="btn btn--primary">
              Ask our operations team <Icon name="arrow" size={18} className="btn__arrow" />
            </Link>
          </Reveal>

          <div className="tag-filter" role="group" aria-label="Filter articles by topic">
            <button type="button" className={!activeTag ? 'is-active' : ''} onClick={() => setActiveTag('')} aria-pressed={!activeTag}>All topics</button>
            {tags.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                className={activeTag === tag ? 'is-active' : ''}
                onClick={() => setActiveTag(tag)}
                aria-pressed={activeTag === tag}
              >
                {tag} <span>{count}</span>
              </button>
            ))}
          </div>

          {filtered.length ? (
            <div className="insights-grid">
              {filtered.map((article, index) => (
                <Reveal key={article.slug} delay={(index % 3) * 70}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="insights-empty">
              <h3>No articles in this topic yet</h3>
              <p>Try another topic or browse the full library.</p>
              <button type="button" className="btn btn--ghost" onClick={() => setActiveTag('')}>Show all topics</button>
            </div>
          )}
        </div>
      </section>

      <section className="insights-cta">
        <div className="container insights-cta__inner">
          <div>
            <span className="eyebrow">Next port call</span>
            <h2>Need a technical team, cleaning scope or spare part?</h2>
            <p>Send the vessel details and working window. The RNS operations desk will review the requirement.</p>
          </div>
          <div className="insights-cta__actions">
            <Link to="/contact" className="btn btn--accent">Request a quotation <Icon name="arrow" size={18} /></Link>
            <a href="https://wa.me/971555396858" target="_blank" rel="noopener noreferrer" className="btn btn--ghost-light">
              <Icon name="whatsapp" size={18} /> WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
