import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import { Icon } from '../components/Icons'
import { services, faqs } from '../data/site'
import { animateSplitHeading, disposeAll, gsap, mm, prefersReducedMotion } from '../lib/anim'

export default function Services() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      }
    }
  }, [hash])

  /* Services-only scroll flow */
  useEffect(() => {
    if (prefersReducedMotion) return

    const cleanups = []
    const ctx = gsap.context(() => {
      /* big service numbers drift against scroll */
      gsap.utils.toArray('.service-detail__num').forEach((el) =>
        cleanups.push(
          gsap.fromTo(
            el,
            { yPercent: 14 },
            { yPercent: -14, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
          )
        )
      )

      /* media frames: curtain unmask + slow zoom */
      gsap.utils.toArray('.service-detail .frame').forEach((frame, i) => {
        const img = frame.querySelector('img')
        gsap.set(img, { scale: 1.16, yPercent: -6 })
        cleanups.push(
          gsap.to(img, {
            scale: 1,
            yPercent: 0,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        )
        gsap.from(frame, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.1,
          ease: 'power4.inOut',
          delay: (i % 2) * 0.05,
          scrollTrigger: { trigger: frame, start: 'top 80%', once: true },
        })
      })

      /* split headings in detail blocks */
      gsap.utils.toArray('.service-detail h2').forEach((el) => {
        cleanups.push(animateSplitHeading(el))
      })

      /* checklist items stagger in */
      gsap.utils.toArray('.service-detail .checklist').forEach((list) => {
        gsap.from(list.children, {
          y: 22,
          opacity: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: list, start: 'top 85%', once: true },
        })
      })

      /* Desktop (>=1200px): sticky cascading service deck + serial highlight */
      cleanups.push(
        mm('(min-width: 1200px)', () => {
          const items = gsap.utils.toArray('.services-deck .service-detail')

          items.forEach((el, i) => {
            const num = el.querySelector('.service-detail__num')
            ScrollTrigger.create({
              trigger: el,
              start: 'top 42%',
              end: 'bottom 42%',
              onToggle: (self) => {
                if (num) num.classList.toggle('active', self.isActive)
              },
            })

            /* each card eases in as the deck scrolls (Logiver scrub stagger) */
            gsap.from(el, {
              y: -80,
              opacity: 0,
              duration: 1,
              transformOrigin: 'top',
              ease: 'power2.out',
              immediateRender: false,
              scrollTrigger: {
                trigger: el,
                start: 'top 95%',
                end: 'top 60%',
                scrub: 1,
              },
            })

            /* subtle horizontal cascade depth */
            gsap.set(el, { xPercent: i * 1.6 })
          })

          return () => {
            items.forEach((el) => el.querySelector('.service-detail__num')?.classList.remove('active'))
          }
        })
      )
    })

    return () => {
      disposeAll(cleanups)
      ctx.revert()
    }
  }, [])

  return (
    <>
      <Seo
        title="Marine Services in Dubai & Khorfakkan | Ship Repair, Chandelling & Logistics"
        description="RNS Shipping services: technical servicing and ship repair, ship chandelling, ship spare parts logistics, and marine automation across Dubai, Jebel Ali and Khorfakkan, UAE."
        path="/services"
        keywords="ship repair services Dubai, marine engineering Jebel Ali, ship chandelling Dubai, ship spare parts logistics UAE, marine automation Dubai"
        image="/images/ship-technical.png"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: services.map((s, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: s.title,
            description: s.short,
          })),
        }}
      />

      <section className="page-hero">
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
                  <Link to="/contact" className="btn btn--primary mt-40">
                    Enquire About {s.title}
                    <Icon name="arrow" size={18} className="btn__arrow" />
                  </Link>
                </Reveal>
              </div>
            </div>
          ))}
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
