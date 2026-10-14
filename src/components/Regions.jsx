import Reveal from './Reveal'
import { Icon } from './Icons'
import { regions } from '../data/site'

export default function Regions() {
  return (
    <section className="section section--dark regions">
      <span className="regions__glow" aria-hidden="true" />
      <div className="container">
        <Reveal className="section-head center">
          <span className="eyebrow eyebrow--center">Global Reach</span>
          <h2>Marine Services Across the Globe</h2>
          <p className="lead">
            From our UAE base in Dubai, RNS Shipping supports ship owners and managers across the
            Gulf and worldwide — GCC, Saudi Arabia, India, Pakistan, the UK, Estonia, Europe and the
            USA.
          </p>
        </Reveal>
        <div className="regions__grid">
          {regions.map((r, i) => {
            const featured = r.name === 'United Arab Emirates'
            return (
              <Reveal key={r.name} delay={(i % 3) * 70}>
                <article className={`region-card ${featured ? 'is-featured' : ''}`}>
                  <span className="region-card__icon">
                    <Icon name={featured ? 'globe' : 'pin'} size={20} />
                  </span>
                  <h3>{r.name}</h3>
                  <p>{r.note}</p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
