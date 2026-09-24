import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import { Icon } from '../components/Icons'
import { services, faqs } from '../data/site'

export default function Services() {
  return (
    <>
      <Seo
        title="Marine Services in Dubai & Khorfakkan"
        description="RNS Shipping services: technical servicing and ship repair, ship chandelling, ship spare parts logistics, and marine automation across Dubai, Jebel Ali and Khorfakkan, UAE."
        path="/services"
        keywords="ship repair services Dubai, marine engineering Jebel Ali, ship chandelling Dubai, ship spare parts logistics UAE, marine automation Dubai"
        image="/images/ship-technical-optimized.webp"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: services.map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: s.title,
            url: `https://rnsshipping.com/services/${s.slug}`,
            description: s.short,
          })),
        }}
      />

      <section className="page-hero page-hero--media">
        <video
          className="page-hero__video"
          muted
          loop
          playsInline
          preload="none"
          poster="/images/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/drydock.mp4" type="video/mp4" />
        </video>
        <div className="page-hero__overlay" />
        <div className="container">
          <span className="eyebrow">Our Services</span>
          <h1>Comprehensive Marine Services &amp; Solutions</h1>
          <p className="lead">
            Precision. Performance. Reliability. Four specialist divisions covering everything your
            vessel needs — from tank cleaning and repairs to chandelling, spares and automation.
          </p>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> / <span>Services</span>
          </nav>
        </div>
      </section>

      <nav className="service-index container" aria-label="Service divisions">{services.map(s => <a key={s.slug} href={`#${s.slug}`}>{s.title}<Icon name="arrow" size={16} /></a>)}</nav>

      <section className="section">
        <div className="container services-deck">
          {services.map((s, i) => (
            <div className="service-detail" id={s.slug} key={s.slug} style={{ '--i': i }}>
              <div className="service-detail__media">
                <Reveal className="frame frame--wide">
                  <img src={s.image} alt={`${s.title} — RNS Shipping`} loading="lazy" />
                  <span className="frame__tag">{s.title}</span>
                </Reveal>
              </div>
              <div>
                <Reveal>
                  <div className="service-detail__num">{s.num}</div>
                  <h2>{s.title}</h2>
                  <p className="lead">{s.intro}</p>
                  <ul className={`checklist ${s.items.length > 6 ? 'checklist--two' : ''}`}>
                    {s.items.map((it) => (
                      <li key={it.name}>
                        <span>
                          <strong style={{ color: 'var(--heading)' }}>{it.name}</strong> — {it.desc}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/services/${s.slug}`} className="text-link service-guide-link">Explore {s.title} <Icon name="arrow" size={18} /></Link>
                  <Link to={`/contact?service=${encodeURIComponent(s.title)}`} className="btn btn--primary mt-40">
                    Enquire About {s.title}
                    <Icon name="arrow" size={18} className="btn__arrow" />
                  </Link>
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- ON-SITE EXPERTISE ---------------- */}
      <section className="section">
        <div className="container split split--reverse">
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
                <b>24/7</b>
                <span>On-Site Support</span>
              </div>
            </Reveal>
          </div>
          <div>
            <Reveal>
              <span className="eyebrow">On-Site Expertise</span>
              <h2>Technical Teams That Keep Your Vessel Moving</h2>
              <p className="lead">
                From routine maintenance to urgent repairs, our engineers mobilise to your vessel —
                alongside in Dubai, Jebel Ali or at anchor off Khorfakkan — with the parts and tools
                to get the job done.
              </p>
              <ul className="checklist">
                <li>
                  <span>
                    <strong style={{ color: 'var(--heading)' }}>Certified technicians</strong> —
                    experienced marine engineers across all four divisions.
                  </span>
                </li>
                <li>
                  <span>
                    <strong style={{ color: 'var(--heading)' }}>Rapid mobilisation</strong> — teams
                    on site within hours for urgent requirements.
                  </span>
                </li>
                <li>
                  <span>
                    <strong style={{ color: 'var(--heading)' }}>Global spares network</strong> —
                    Caterpillar, Yanmar and critical components sourced fast.
                  </span>
                </li>
              </ul>
              <Link to="/contact" className="btn btn--primary mt-40">
                Talk to an Engineer
                <Icon name="arrow" size={18} className="btn__arrow" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">FAQ</span>
            <h2>Marine Services — Frequently Asked Questions</h2>
          </Reveal>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={(i % 3) * 60}>
                <details className="faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="cta">
            <div>
              <span className="eyebrow">Get Started</span>
              <h2>Request a tailored quotation today</h2>
              <p>Tell us about your vessel and requirements — we’ll respond promptly.</p>
            </div>
            <div>
              <Link to="/contact" className="btn btn--accent">
                Request a Quote
                <Icon name="arrow" size={18} className="btn__arrow" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
