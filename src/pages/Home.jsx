import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import Counter from '../components/Counter'
import Testimonials from '../components/Testimonials'
import ClientMarquee from '../components/ClientMarquee'
import MarqueeBand from '../components/MarqueeBand'
import ShipShowcase from '../components/ShipShowcase'
import { Icon } from '../components/Icons'
import { services, stats, whyChoose, company, clients } from '../data/site'
import {
  ScrollTrigger,
  animateSplitHeading,
  charSplitReveal,
  disposeAll,
  flyIn,
  gsap,
  lineDropReveal,
  prefersReducedMotion,
  scrubCharsReveal,
} from '../lib/anim'

const wasPreloaded = () =>
  typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rns-preloaded') === '1'

export default function Home() {
  const featureCards = services.slice(0, 3)

  /* Home-only scroll flow */
  useEffect(() => {
    if (prefersReducedMotion) return
    const delays = wasPreloaded() ? 0.15 : 2.55

    const cleanups = []
    const html = document.documentElement
    const q = (sel, root = html) => Array.from(root.querySelectorAll(sel))

    const ctx = gsap.context(() => {
      /* hero text entrance — title uses the Logiver char-rise */
      gsap.set('.hero__badge', { y: 24, opacity: 0 })
      gsap.set('.hero__inner .lead', { y: 24, opacity: 0 })
      gsap.set('.hero__actions .btn', { y: 24, opacity: 0 })
      gsap.set('.hero__hint', { opacity: 0 })

      cleanups.push(charSplitReveal('.hero__title', { delay: delays + 0.25 }))

      const tl = gsap.timeline({ delay: delays, defaults: { ease: 'power3.out' } })
      tl.to('.hero__badge', { y: 0, opacity: 1, duration: 0.6 })
        .to('.hero__inner .lead', { y: 0, opacity: 1, duration: 0.8 }, '-=0.15')
        .to('.hero__actions .btn', { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, '-=0.55')
        .to('.hero__hint', { opacity: 1, duration: 0.5 }, '-=0.3')
        .add(() => ScrollTrigger.refresh(), delays + 1)

      /* hero cards rise after curtain */
      gsap.set('.hero-card', { y: 40, opacity: 0 })
      gsap.to('.hero-card', {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.09,
        delay: delays + 0.35,
        ease: 'power3.out',
      })

      /* section headings: scrub-fill characters (Logiver .lg-itm-title) */
      q('.section-head h2').forEach((el) => {
        cleanups.push(scrubCharsReveal(el))
      })
      /* split headings keep the word-rise */
      q('.split__content h2').forEach((el) => {
        cleanups.push(animateSplitHeading(el))
      })

      /* story paragraphs drop in line by line */
      q('.split__content p').forEach((el) => {
        cleanups.push(lineDropReveal(el))
      })

      /* why-cards fly in from alternating sides */
      q('.why-card').forEach((el, i) => {
        cleanups.push(flyIn(el, { from: i % 2 === 0 ? 'left' : 'right', distance: 140, start: 'top 85%', end: 'top 45%', scrub: 1.2 }))
      })

      /* parallax floats (wrapper-level so CSS hover zooms keep working) */
      const heroPhoto = document.querySelector('.hero__photo img')
      if (heroPhoto) {
        cleanups.push(
          gsap.fromTo(
            heroPhoto,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
            }
          )
        )
      }
      q('.media-stack__main').forEach((el) =>
        cleanups.push(
          gsap.fromTo(
            el,
            { yPercent: -4 },
            { yPercent: 4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
          )
        )
      )
      q('.media-stack__inset').forEach((el) =>
        cleanups.push(
          gsap.fromTo(
            el,
            { yPercent: 10 },
            { yPercent: -10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
          )
        )
      )
      q('.service-card__media').forEach((el) =>
        cleanups.push(
          gsap.fromTo(
            el,
            { yPercent: -6 },
            { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
          )
        )
      )

      /* idle floats */
      q('.hero__badge .dot').forEach((el) =>
        cleanups.push(
          gsap.to(el, { yPercent: -30, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
        )
      )
      q('.hero-card__icon').forEach((el, i) =>
        cleanups.push(
          gsap.to(el, { y: -5, duration: 2 + (i % 5) * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.15 })
        )
      )

      /* why-card numbers drift */
      q('.why-card__num').forEach((el) =>
        cleanups.push(
          gsap.fromTo(
            el,
            { yPercent: 18 },
            { yPercent: -18, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }
          )
        )
      )

      /* counters section float-in */
      gsap.set('.counter', { y: 30, opacity: 0 })
      ScrollTrigger.create({
        trigger: '.counters',
        start: 'top 82%',
        once: true,
        onEnter: () =>
          gsap.to('.counter', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', overwrite: true }),
      })

      /* Container showcase: ship bg parallax, drifting word, lifted container */
      if (document.querySelector('.showcase')) {
        const bg = document.querySelector('.showcase__bg img')
        if (bg) {
          cleanups.push(
            gsap.fromTo(
              bg,
              { yPercent: -12 },
              {
                yPercent: 12,
                ease: 'none',
                scrollTrigger: { trigger: '.showcase', start: 'top bottom', end: 'bottom top', scrub: true },
              }
            )
          )
        }
        cleanups.push(
          gsap.fromTo(
            '.showcase__word',
            { xPercent: 6 },
            {
              xPercent: -6,
              ease: 'none',
              scrollTrigger: { trigger: '.showcase', start: 'top bottom', end: 'bottom top', scrub: true },
            }
          )
        )

        /* Ship pops in from the right edge, then idles on the water */
        const ship = document.querySelector('.showcase__ship')
        if (ship) {
          let floatTween
          gsap.set(ship, { xPercent: 130, rotate: 6, opacity: 0 })
          cleanups.push(
            gsap.to(ship, {
              xPercent: 0,
              rotate: 0,
              opacity: 1,
              duration: 1.4,
              ease: 'power3.out',
              scrollTrigger: { trigger: '.showcase__visual', start: 'top 82%', once: true },
              onComplete: () => {
                floatTween = gsap.to(ship, {
                  y: -16,
                  rotate: 1.2,
                  duration: 3.2,
                  yoyo: true,
                  repeat: -1,
                  ease: 'sine.inOut',
                })
              },
            })
          )
          cleanups.push(() => floatTween?.kill())
        }

        q('.showcase__chip').forEach((el, i) => {
          gsap.set(el, { scale: 0.6, opacity: 0 })
          cleanups.push(
            gsap.to(el, {
              scale: 1,
              opacity: 1,
              duration: 0.6,
              delay: 0.5 + i * 0.15,
              ease: 'back.out(1.6)',
              scrollTrigger: { trigger: '.showcase__visual', start: 'top 80%', once: true },
            })
          )
          cleanups.push(
            gsap.to(el, { y: -9, duration: 2 + i * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.2 })
          )
        })

        const showCopy = document.querySelector('.showcase__copy')
        if (showCopy) {
          cleanups.push(lineDropReveal('.showcase__copy p'))
          cleanups.push(animateSplitHeading('.showcase__copy h2'))
          cleanups.push(flyIn('.showcase__list', { from: 'left', distance: 90, start: 'top 88%', end: 'top 60%', scrub: 1.2 }))
        }
      }

      /* CTA panel curtain reveal */
      if (document.querySelector('.cta')) {
        gsap.set('.cta', { clipPath: 'inset(0 0 100% 0)' })
        gsap.to('.cta', {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.1,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.cta', start: 'top 82%', once: true },
        })
      }

      /* link arrows nudge */
      q('.hero-card__link, .service-card__link').forEach((el) => {
        const arrow = el.querySelector('svg')
        if (!arrow) return
        cleanups.push(
          gsap.to(arrow, { x: 4, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() })
        )
      })
    })

    return () => {
      disposeAll(cleanups)
      ctx.revert()
    }
  }, [])

  return (
    <>
      <Seo
        title="Ship Tank Cleaning Jebel Ali | Marine Tank Cleaning Khorfakkan"
        description="Professional ship tank cleaning service in Jebel Ali, Dubai & Khorfakkan. RNS Shipping delivers expert marine tank cleaning, ship repair, chandelling and spare parts logistics across the UAE."
        path="/"
        keywords="ship repair in UAE, ship repair Dubai, marine tank cleaning Jebel Ali, vessel tank cleaning Khorfakkan, ship chandelling Dubai, marine engineering Jebel Ali"
        image="/images/ship-technical.png"
      />

      {/* ---------------- HERO ---------------- */}
      <section className="hero">
        <div className="hero__photo" aria-hidden="true">
          <img src="/images/rns-ship-hero.webp" alt="" />
        </div>
        <div className="hero__overlay" />
        <div className="container">
          <div className="hero__inner">
            <span className="hero__badge">
              <span className="dot" />
              UAE Marine Services · Est. {new Date().getFullYear() - company.experience}
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
        <span className="hero__hint">Drag to rotate the vessel</span>
      </section>

      {/* ---------------- HERO CARDS ---------------- */}
      <div className="container hero__cards">
        <div className="grid grid-3">
          {featureCards.map((s, i) => (
            <Reveal key={s.slug} delay={i * 90}>
              <Link to={`/services#${s.slug}`} className="hero-card">
                <span className="hero-card__icon">
                  <Icon name={s.icon} size={26} />
                </span>
                <h3>{s.title}</h3>
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
                  src="/images/ship-technical.png"
                  alt="RNS Shipping engineers carrying out technical servicing aboard a vessel"
                  loading="lazy"
                />
              </div>
              <div className="media-stack__inset">
                <img src="/images/ship-2.jpg" alt="Marine engineers at work on deck" loading="lazy" />
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
                    <h4>Quality Assured</h4>
                    <p>Independently assessed under BQC quality standards.</p>
                  </div>
                </div>
                <div className="feature-row">
                  <span className="feature-row__icon">
                    <Icon name="headset" size={22} />
                  </span>
                  <div>
                    <h4>24/7 Support</h4>
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
                    <Link to={`/services#${s.slug}`} className="service-card__link">
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
                    <h4>{w.title}</h4>
                    <p>{w.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
