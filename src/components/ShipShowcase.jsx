import { useEffect, useRef, useState } from 'react'
import { useMotionEnabled } from './MotionContext'
import { Link } from 'react-router-dom'
import { Icon } from './Icons'

const highlights = [
  'Ship repair, tank cleaning & technical servicing',
  'Ship chandelling and provisions, delivered on time',
  'Caterpillar & Yanmar spares logistics worldwide',
  'Marine automation & control systems',
]

export default function ShipShowcase() {
  const visual = useRef(null)
  const ship = useRef(null)
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [enhanced, setEnhanced] = useState(false)
  const motionEnabled = useMotionEnabled()
  useEffect(() => {
    setEnhanced(true)
    if (ship.current?.complete && ship.current.naturalWidth) setLoaded(true)
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    // Observe the stationary frame, so the entrance transform cannot move the trigger.
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(visual.current)
    return () => observer.disconnect()
  }, [])
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

        <div className="showcase__visual" ref={visual}>
          <div className="showcase__arrival" data-waiting={enhanced && motionEnabled && !(visible && loaded) || undefined}>
          <img
            className="showcase__ship"
            ref={ship}
            onLoad={() => setLoaded(true)}
            src="/images/rns-ship-side.webp"
            alt="Vessel supported by RNS Shipping"
            loading="lazy"
          />
          </div>
          <span className="showcase__chip showcase__chip--a">35+ Years</span>
          <span className="showcase__chip showcase__chip--b">24/7 Support</span>
          <span className="showcase__chip showcase__chip--c">Global Network</span>
        </div>
      </div>
    </section>
  )
}
