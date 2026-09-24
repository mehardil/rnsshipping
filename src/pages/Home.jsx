import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import Counter from '../components/Counter'
import Testimonials from '../components/Testimonials'
import ClientMarquee from '../components/ClientMarquee'
import MarqueeBand from '../components/MarqueeBand'
import ShipShowcase from '../components/ShipShowcase'
import PortSupport from '../components/PortSupport'
import { Icon } from '../components/Icons'
import { services, stats, whyChoose, company, clients } from '../data/site'

export default function Home() {
  const featureCards = services.slice(0, 3)

  return (
    <>
      <Seo
        title="Marine Services, Ship Repair & Tank Cleaning UAE"
        description="Professional ship tank cleaning service in Jebel Ali, Dubai & Khorfakkan. RNS Shipping delivers expert marine tank cleaning, ship repair, chandelling and spare parts logistics across the UAE."
        path="/"
        keywords="ship repair in UAE, ship repair Dubai, marine tank cleaning Jebel Ali, vessel tank cleaning Khorfakkan, ship chandelling Dubai, marine engineering Jebel Ali"
        image="/images/ship-technical-optimized.webp"
      />

      {/* ---------------- HERO ---------------- */}
      <section className="hero">
        <div className="hero__photo" aria-hidden="true">
          <img src="/images/harbour-evening.webp" srcSet="/images/harbour-evening-small.webp 800w, /images/harbour-evening.webp 1800w" sizes="100vw" width="1800" height="1200" fetchpriority="high" alt="" />
        </div>
        <div className="hero__overlay" />
        <div className="container">
          <div className="hero__inner">
            <span className="hero__badge">
              <span className="dot" />
              UAE Marine Services · {company.experience}+ Years of Experience
            </span>
            <h1 className="hero__title">
              Marine Excellence, <em>Delivered</em> Worldwide.
            </h1>
            <p className="lead" style={{ color: 'var(--on-dark-muted)' }}>
              RNS Shipping is a UAE-based marine service company with over {company.experience} years
              of seafaring and technical experience — ship repairs, tank cleaning, chandelling and
              marine supplies for ship owners and managers worldwide.
            </p>
            <div className="hero__actions">
              <Link to="/contact" className="btn btn--accent">
                Request a Quote
                <Icon name="arrow" size={18} className="btn__arrow" />
              </Link>
              <Link to="/services" className="btn btn--ghost-light">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
        <a href="#marine-services" className="hero__hint">Explore our expertise <Icon name="arrow" size={16} /></a>
      </section>

      {/* ---------------- HERO CARDS ---------------- */}
      <div className="container hero__cards" id="marine-services">
        <div className="grid grid-3">
          {featureCards.map((s, i) => (
            <Reveal key={s.slug} delay={i * 90}>
              <Link to={`/services/${s.slug}`} className="hero-card">
                <span className="hero-card__icon">
                  <Icon name={s.icon} size={26} />
                </span>
                <h2>{s.title}</h2>
                <p>{s.short}</p>
                <span className="hero-card__link">
                  Learn more <Icon name="arrow" size={16} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ---------------- ABOUT SPLIT ---------------- */}
      <section className="section">
        <div className="container split">
          <div className="split__media">
            <Reveal className="media-stack">
              <div className="media-stack__main">
                <img
                  src="/images/ship-technical-optimized.webp"
                  alt="RNS Shipping engineers carrying out technical servicing aboard a vessel"
                  loading="lazy"
                />
              </div>
              <div className="media-stack__inset">
                <img src="/images/technical-gear-optimized.webp" alt="Marine mechanical components and precision gear assembly" loading="lazy" />
              </div>
              <div className="media-stack__badge">
                <b>{company.experience}+</b>
                <span>Years at Sea</span>
              </div>
            </Reveal>
          </div>
          <div className="split__content">
            <Reveal>
              <span className="eyebrow">Who We Are</span>
              <h2>Trusted Marine Tank Cleaning &amp; Ship Repair in the UAE</h2>
              <p>
                RNS Shipping specialises in ship repairs, maintenance and marine supplies,
                delivering reliable, efficient and cost-effective solutions to ship owners and
                management companies worldwide.
              </p>
              <p>
                Our team’s deep industry expertise and strong global network — including trusted
                makers, suppliers and logistics partners — ensure your vessel stays compliant,
                efficient and on schedule.
              </p>
              <div className="grid grid-2" style={{ marginTop: 34 }}>
                <div className="feature-row">
                  <span className="feature-row__icon">
                    <Icon name="shield" size={22} />
                  </span>
                  <div>
                    <h3>Quality Assured</h3>
                    <p>Independently assessed under BQC quality standards.</p>
                  </div>
                </div>
                <div className="feature-row">
                  <span className="feature-row__icon">
                    <Icon name="headset" size={22} />
                  </span>
                  <div>
                    <h3>24/7 Support</h3>
                    <p>Rapid mobilisation, any port, any hour.</p>
                  </div>
                </div>
              </div>
              <Link to="/about" className="btn btn--primary mt-40">
                More About Us
                <Icon name="arrow" size={18} className="btn__arrow" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- SHIP SHOWCASE ---------------- */}
      <ShipShowcase />

      {/* ---------------- SERVICES ---------------- */}
      <section className="section section--tint">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">What We Offer</span>
            <h2>Comprehensive Marine Services &amp; Solutions</h2>
            <p className="lead">
              Precision. Performance. Reliability. From technical servicing to automation, we keep
              vessels operating at peak performance.
            </p>
          </Reveal>
          <div className="grid grid-4">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 80}>
                <article className="service-card">
                  <div className="service-card__media">
                    <img src={s.image} alt={s.title} loading="lazy" />
                    <span className="service-card__icon">
                      <Icon name={s.icon} size={26} />
                    </span>
                  </div>
                  <div className="service-card__body">
                    <h3>{s.title}</h3>
                    <p>{s.short}</p>
                    <Link to={`/services/${s.slug}`} className="service-card__link">
                      View Details <Icon name="arrow" size={16} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- COUNTERS ---------------- */}
      <section className="section section--dark">
        <div className="container">
          <Reveal>
            <div className="counters">
              {stats.map((s) => (
                <div className="counter" key={s.label}>
                  <Counter value={s.value} suffix={s.suffix} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- MARQUEE BAND ---------------- */}
      <MarqueeBand items={services.map((s) => s.title)} />

      {/* ---------------- WHY CHOOSE ---------------- */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">Why Choose RNS</span>
            <h2>Why Ship Owners Trust RNS Shipping</h2>
            <p className="lead">
              Three and a half decades of hands-on marine experience, a global supplier network and
              a commitment to quality workmanship.
            </p>
          </Reveal>
          <div className="grid grid-2">
            {whyChoose.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 90}>
                <div className="why-card">
                  <span className="why-card__num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{w.title}</h3>
                    <p>{w.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <PortSupport />

      {/* ---------------- CLIENTS ---------------- */}
      <section className="section section--tint">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">Our Valued Clients</span>
            <h2>Trusted by Leading Maritime Names</h2>
            <p className="lead">
              We are proud to serve some of the most respected names in the maritime and industrial
              sectors — {clients.length}+ partners whose trust reflects our commitment to quality.
            </p>
          </Reveal>
        </div>
        <Reveal>
          <ClientMarquee />
        </Reveal>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">Testimonials</span>
            <h2>What Our Clients Say</h2>
            <p className="lead">
              Our long-standing partnerships with leading global companies reflect our dedication to
              excellence and service reliability.
            </p>
          </Reveal>
          <Testimonials />
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="cta">
            <div>
              <span className="eyebrow">Ready to Mobilise</span>
              <h2>Need a technical team or spares at your next port call?</h2>
              <p>
                Share your vessel details and our 24/7 operations desk will respond with a clear,
                competitive quotation.
              </p>
              <Link to="/contact" className="btn btn--accent" style={{ marginTop: 14 }}>
                Contact Us Now
                <Icon name="arrow" size={18} className="btn__arrow" />
              </Link>
            </div>
            <ul className="cta__list">
              <li>
                <Icon name="check" size={18} /> Tank cleaning, repairs &amp; overhauling
              </li>
              <li>
                <Icon name="check" size={18} /> Caterpillar &amp; Yanmar spares logistics
              </li>
              <li>
                <Icon name="check" size={18} /> Chandelling &amp; provisions, delivered on time
              </li>
              <li>
                <Icon name="check" size={18} /> Marine automation &amp; control systems
              </li>
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  )
}
