import { Link } from 'react-router-dom'
import { Icon } from './Icons'

const highlights = [
  'Ship repair, tank cleaning & technical servicing',
  'Ship chandelling and provisions, delivered on time',
  'Caterpillar & Yanmar spares logistics worldwide',
  'Marine automation & control systems',
]

export default function ShipShowcase() {
  return (
    <section className="showcase">
      <div className="showcase__bg" aria-hidden="true">
        <img src="/images/rns-ship-dramatic.webp" alt="" loading="lazy" />
      </div>
      <span className="showcase__word" aria-hidden="true">
        RNS Shipping
      </span>

      <div className="container showcase__grid">
        <div className="showcase__copy">
          <span className="eyebrow">Global Marine Logistics</span>
          <h2>Professional Marine Support, Wherever Your Vessel Calls</h2>
          <p className="lead">
            From urgent technical repairs and tank cleaning to spares, chandelling and automation —
            our teams mobilise across the UAE and the Gulf, keeping your vessels safe, compliant and
            on schedule.
          </p>
          <ul className="showcase__list">
            {highlights.map((h) => (
              <li key={h}>
                <Icon name="check" size={18} />
                {h}
              </li>
            ))}
          </ul>
          <Link to="/contact" className="btn btn--accent">
            Request a Quote
            <Icon name="arrow" size={18} className="btn__arrow" />
          </Link>
        </div>

        <div className="showcase__visual">
          <div className="showcase__ring" aria-hidden="true">
            <img src="/images/rns-circle.webp" alt="" loading="lazy" />
          </div>
          <img
            className="showcase__ship"
            src="/images/rns-ship-side.webp"
            alt="Vessel supported by RNS Shipping"
            loading="lazy"
          />
          <span className="showcase__chip showcase__chip--a">35+ Years</span>
          <span className="showcase__chip showcase__chip--b">24/7 Support</span>
          <span className="showcase__chip showcase__chip--c">Global Network</span>
        </div>
      </div>
    </section>
  )
}
