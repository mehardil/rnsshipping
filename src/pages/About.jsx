import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import Counter from '../components/Counter'
import ClientMarquee from '../components/ClientMarquee'
import { Icon } from '../components/Icons'
import { company, stats, whyChoose, certifications, services } from '../data/site'
import {
  animateSplitHeading,
  disposeAll,
  flyIn,
  gsap,
  lineDropReveal,
  prefersReducedMotion,
  scrubCharsReveal,
} from '../lib/anim'

export default function About() {
  /* About-only scroll flow */
  useEffect(() => {
    if (prefersReducedMotion) return

    const cleanups = []
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.split__content h2').forEach((el) => {
        cleanups.push(animateSplitHeading(el))
      })

      gsap.utils.toArray('.section-head h2').forEach((el) => {
        cleanups.push(scrubCharsReveal(el))
      })

      /* story paragraphs drop line by line */
      gsap.utils.toArray('.split__content p').forEach((el) => {
        cleanups.push(lineDropReveal(el))
      })

      /* media stack flies in from the left, inset from the right */
      gsap.utils.toArray('.media-stack').forEach((el) => {
        cleanups.push(flyIn(el, { from: 'left', distance: 160, start: 'top 85%', end: 'top 40%', scrub: 1.2 }))
      })

      /* value cards alternate directions */
      gsap.utils.toArray('.why-card').forEach((el, i) => {
        cleanups.push(
          flyIn(el, {
            from: i % 2 === 0 ? 'left' : 'right',
            distance: 140,
            start: 'top 88%',
            end: 'top 50%',
            scrub: 1.2,
          })
        )
      })

      gsap.utils.toArray('.media-stack__main img').forEach((el) =>
        cleanups.push(
          gsap.fromTo(
            el,
            { yPercent: -6, scale: 1.06 },
            { yPercent: 6, scale: 1.06, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
          )
        )
      )

      gsap.utils.toArray('.media-stack__inset').forEach((el) => {
        cleanups.push(
          gsap.from(el, {
            y: 60,
            opacity: 0,
            duration: 1,
            delay: 0.25,
            ease: 'power3.out',
            immediateRender: false,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        )
      })

      gsap.utils.toArray('.media-stack__badge').forEach((el, i) =>
        cleanups.push(
          gsap.to(el, { y: -7, duration: 1.9 + i * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut' })
        )
      )

      /* CTA slide-up */
      cleanups.push(
        gsap.fromTo(
          '.cta',
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.1,
            ease: 'power4.out',
            immediateRender: false,
            scrollTrigger: { trigger: '.cta', start: 'top 82%', once: true },
          }
        )
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
        title="About RNS Shipping | Marine Service Company in Dubai, UAE"
        description="RNS Shipping is a UAE-based marine service company with 35+ years of seafaring and technical experience in ship repairs, maintenance and marine supplies across Jebel Ali, Dubai and Khorfakkan."
        path="/about"
        keywords="marine service company Dubai, ship repair company in Dubai, marine engineering Khorfakkan, RNS Shipping"
        image="/images/ship-1.jpg"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About RNS Shipping',
          description:
            'UAE-based marine service company with over 35 years of seafaring and technical experience.',
        }}
      />

      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">About Us</span>
          <h1>Who We Are — Marine Tank Cleaning &amp; Ship Repair, Jebel Ali</h1>
          <p className="lead">
            A UAE-based marine service company built on {company.experience}+ years of seafaring
            and technical experience, serving ship owners and managers worldwide.
          </p>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> / <span>About</span>
          </nav>
        </div>
      </section>

      <section className="section">
        <div className="container split split--reverse">
          <div className="split__media">
            <Reveal className="media-stack">
              <div className="media-stack__main">
                <img
                  src="/images/rns-ship-bow.webp"
                  alt="Container ship underway, supported by RNS Shipping"
                  loading="lazy"
                />
              </div>
              <div className="media-stack__inset">
                <img
                  src="/images/rns-warehouse.webp"
                  alt="RNS Shipping marine stores and spare parts warehouse"
                  loading="lazy"
                />
              </div>
              <div className="media-stack__badge">
                <b>{company.experience}+</b>
                <span>Years Experience</span>
              </div>
            </Reveal>
          </div>
          <div>
            <Reveal>
              <span className="eyebrow">Our Story</span>
              <h2>Reliable, Efficient &amp; Cost-Effective Marine Solutions</h2>
              <p>
                RNS Shipping is a UAE-based marine service company with over {company.experience}{' '}
                years of seafaring and technical experience. We specialise in ship repairs,
                maintenance and marine supplies, delivering reliable, efficient and cost-effective
                solutions to ship owners and management companies worldwide.
              </p>
              <p>
                Our team’s deep industry expertise and strong global network — including trusted
                makers and suppliers — allow us to respond fast, work safely and deliver quality
                workmanship every time. Whether your vessel is alongside in Dubai or at anchor off
                Khorfakkan, we mobilise the right people, parts and equipment.
              </p>
              <ul className="pill-list">
                <li>Jebel Ali</li>
                <li>Dubai Maritime City</li>
                <li>Khorfakkan</li>
                <li>Business Bay, Dubai</li>
                <li>Gulf-wide mobilisation</li>
              </ul>
              <div className="grid grid-3" style={{ marginTop: 40 }}>
                {services.map((s) => (
                  <div className="feature-row" key={s.slug}>
                    <span className="feature-row__icon">
                      <Icon name={s.icon} size={20} />
                    </span>
                    <div>
                      <h4>{s.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

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

      <section className="section">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">Our Values</span>
            <h2>What Sets RNS Shipping Apart</h2>
          </Reveal>
          <div className="grid grid-2">
            {whyChoose.map((w, i) => (
              <Reveal key={w.title} delay={(i % 2) * 90}>
                <div className="why-card">
                  <span className="why-card__num">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h4>{w.title}</h4>
                    <p>{w.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container split">
          <div>
            <Reveal>
              <span className="eyebrow">Certification &amp; Quality</span>
              <h2>Assessed to International Quality Standards</h2>
              <p>
                Our quality management is independently assessed, giving ship owners and managers
                confidence that every job — from a valve overhaul to a full tank clean — is carried
                out safely, consistently and to spec.
              </p>
              <div className="grid grid-2" style={{ marginTop: 30 }}>
                <div className="feature-row">
                  <span className="feature-row__icon">
                    <Icon name="shield" size={22} />
                  </span>
                  <div>
                    <h4>Compliance First</h4>
                    <p>Work carried out to recognised maritime safety standards.</p>
                  </div>
                </div>
                <div className="feature-row">
                  <span className="feature-row__icon">
                    <Icon name="users" size={22} />
                  </span>
                  <div>
                    <h4>Experienced Crew</h4>
                    <p>Marine engineers and technicians with real sea time.</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
          <div className="split__media">
            {certifications.map((c) => (
              <Reveal key={c.name}>
                <div
                  className="why-card"
                  style={{ alignItems: 'center', flexDirection: 'column', textAlign: 'center' }}
                >
                  <img src={c.logo} alt={`${c.name} certification`} style={{ width: 130 }} loading="lazy" />
                  <div>
                    <h4>{c.name}</h4>
                    <p>{c.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">Our Valued Clients</span>
            <h2>Partners Who Trust RNS Shipping</h2>
          </Reveal>
        </div>
        <Reveal>
          <ClientMarquee />
        </Reveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="cta">
            <div>
              <span className="eyebrow">Work With Us</span>
              <h2>Let’s keep your fleet moving.</h2>
              <p>From urgent repairs to scheduled supplies, we’re ready when you are.</p>
            </div>
            <div>
              <Link to="/contact" className="btn btn--accent">
                Contact Our Team
                <Icon name="arrow" size={18} className="btn__arrow" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
