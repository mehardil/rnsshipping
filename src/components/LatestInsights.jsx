import { Link } from 'react-router-dom'
import { articles } from '../lib/articles'
import { Icon } from './Icons'
import Reveal from './Reveal'
import ArticleCard from './ArticleCard'

export default function LatestInsights() {
  const latest = articles.slice(0, 3)
  if (!latest.length) return null
  return (
    <section className="section section--tint">
      <div className="container">
        <Reveal className="insights-teaser__head">
          <div>
            <span className="eyebrow">Insights &amp; Expertise</span>
            <h2>Practical knowledge from the operations desk</h2>
            <p className="lead">
              Guides on ship repair, cleaning, maintenance and compliance for vessels calling at
              Dubai, Jebel Ali and Khorfakkan.
            </p>
          </div>
          <Link to="/insights" className="text-link">
            View all insights <Icon name="arrow" size={18} />
          </Link>
        </Reveal>
        <div className="grid grid-3 insights-teaser__grid">
          {latest.map((article, index) => (
            <Reveal key={article.slug} delay={index * 70}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
