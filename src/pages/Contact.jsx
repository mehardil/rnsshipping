import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import { Icon } from '../components/Icons'
import { company, services, faqs } from '../data/site'
import { disposeAll, flyIn, gsap, prefersReducedMotion } from '../lib/anim'

const initial = {
  name: '',
  email: '',
  phone: '',
  subject: services[0].title,
  message: '',
}

export default function Contact() {
  const [form, setForm] = useState(initial)
  const [sent, setSent] = useState(false)

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  /* Contact-only scroll flow */
  useEffect(() => {
    if (prefersReducedMotion) return
    const cleanups = []
    const ctx = gsap.context(() => {
      /* info cards fly in from the right, form from the left */
      gsap.utils.toArray('.info-card').forEach((el, i) => {
        cleanups.push(
          flyIn(el, { from: 'right', distance: 120, start: 'top 88%', end: 'top 55%', scrub: 1.2 })
        )
        cleanups.push(
          gsap.to(el, { y: -6, duration: 2 + (i % 4) * 0.25, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.12 })
        )
      })

      cleanups.push(
        flyIn('.form', { from: 'left', distance: 120, start: 'top 88%', end: 'top 55%', scrub: 1.2 })
      )

      cleanups.push(
        gsap.fromTo(
          '.map-embed',
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.1,
            ease: 'power4.out',
            immediateRender: false,
            scrollTrigger: { trigger: '.map-embed', start: 'top 85%', once: true },
          }
        )
      )
    })
    return () => {
      disposeAll(cleanups)
      ctx.revert()
    }
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <Seo
        title="Contact RNS Shipping | Marine Services Dubai & Khorfakkan"
        description="Contact RNS Shipping for ship repair, tank cleaning, chandelling and marine logistics in Dubai and the UAE. Call +971 55 539 6858 or email info@rnsshipping.com."
        path="/contact"
        keywords="contact RNS Shipping, ship repair company Dubai contact, marine services UAE"
        image="/images/marine-2.jpg"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact RNS Shipping',
          description: 'Get in touch with RNS Shipping for marine services in the UAE.',
        }}
      />

      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Contact Us</span>
          <h1>We’d Love to Hear From You</h1>
          <p className="lead">
            Tell us about your vessel, port and requirements. Our 24/7 operations desk responds
            promptly with clear, competitive quotations.
          </p>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link> / <span>Contact</span>
          </nav>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div>
            <Reveal>
              <span className="eyebrow">Reach Us</span>
              <h2>Contact Information</h2>
              <p>Available around the clock for port calls across the UAE and the Gulf.</p>
            </Reveal>
            <Reveal delay={80}>
              <div className="info-card">
                <span className="info-card__icon">
                  <Icon name="mail" size={22} />
                </span>
                <div>
                  <b>Email Us</b>
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </div>
              </div>
              <div className="info-card">
                <span className="info-card__icon">
                  <Icon name="phone" size={22} />
                </span>
                <div>
                  <b>Call Us</b>
                  <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
                </div>
              </div>
              {company.offices.map((o) => (
                <div className="info-card" key={o.label}>
                  <span className="info-card__icon">
                    <Icon name="pin" size={22} />
                  </span>
                  <div>
                    <b>{o.label}</b>
                    <span>{o.address}</span>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <Reveal delay={120}>
            {sent ? (
              <div className="form">
                <div className="form__success">
                  <Icon name="check" size={26} />
                  <div>
                    <h3 style={{ marginBottom: 4 }}>Thank you, {form.name || 'there'}!</h3>
                    <p style={{ margin: 0 }}>
                      Your enquiry has been received. Our operations team will be in touch shortly.
                      For urgent matters, call{' '}
                      <a href={`tel:${company.phoneHref}`} style={{ color: 'var(--navy-700)' }}>
                        {company.phone}
                      </a>
                      .
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost mt-40"
                  onClick={() => {
                    setForm(initial)
                    setSent(false)
                  }}
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={onSubmit}>
                <h3>Contact Us Now</h3>
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={update}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={update}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="phone">Mobile Number</label>
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={update}
                      placeholder="United Arab Emirates +971"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="subject">Service Required</label>
                    <select id="subject" name="subject" value={form.subject} onChange={update}>
                      {services.map((s) => (
                        <option key={s.slug} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                      <option value="Other">Other Enquiry</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={update}
                    placeholder="Vessel name, port, and your requirements…"
                    required
                  />
                </div>
                <button type="submit" className="btn btn--primary">
                  Send Enquiry
                  <Icon name="arrow" size={18} className="btn__arrow" />
                </button>
                <p className="form__note">
                  Prefer email? Write to us at{' '}
                  <a href={`mailto:${company.email}`} style={{ color: 'var(--navy-700)' }}>
                    {company.email}
                  </a>
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <section className="section section--tint" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="map-embed">
              <iframe
                title="RNS Shipping location — Business Bay, Dubai"
                src="https://www.google.com/maps?q=Damac+XL+Tower+Business+Bay+Dubai&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">FAQ</span>
            <h2>Common Questions</h2>
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
    </>
  )
}
