import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Reveal from '../components/Reveal'
import { Icon } from '../components/Icons'
import { company, services, faqs } from '../data/site'

const initial = {
  name: '',
  email: '',
  phone: '',
  subject: services[0].title,
  message: '',
}

export default function Contact() {
  const [params] = useSearchParams()
  const [form, setForm] = useState(initial)
  useEffect(() => {
    const subject = params.get('service')
    if (services.some(service => service.title === subject)) setForm(value => ({ ...value, subject }))
  }, [params])
  const [sent, setSent] = useState(false)
  const [activeOffice, setActiveOffice] = useState(0)

  const update = (e) => { e.target.setCustomValidity(''); setForm((f) => ({ ...f, [e.target.name]: e.target.value })) }

  const onSubmit = (e) => {
    e.preventDefault()
    for (const name of ['name', 'message']) {
      const field = e.currentTarget.elements.namedItem(name)
      if (!field.value.trim()) { field.setCustomValidity('Please enter your ' + name + '.'); field.reportValidity(); return }
    }
    setSent(true)
  }

  return (
    <>
      <Seo
        title="Contact RNS Shipping | Marine Services Dubai & Khorfakkan"
        description="Contact RNS Shipping for ship repair, tank cleaning, chandelling and marine logistics in Dubai and the UAE. Call +971 55 539 6858, message us on WhatsApp or email info@rns-shipping.com."
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

      <section className="page-hero page-hero--media">
        <div className="page-hero__bg" aria-hidden="true">
          <video
            className="page-hero__bg-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/contact-poster.jpg"
          >
            <source src="/images/contact_video.mp4" media="(min-width: 768px)" type="video/mp4" />
          </video>
        </div>
        <div className="page-hero__overlay" />
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
              <div className="info-card">
                <span className="info-card__icon">
                  <Icon name="whatsapp" size={22} />
                </span>
                <div>
                  <b>WhatsApp</b>
                  <a href={company.whatsapp} target="_blank" rel="noopener noreferrer">
                    Chat with us — fastest reply
                  </a>
                </div>
              </div>
              {company.offices.map((o) => (
                <div className="info-card" key={o.label}>
                  <span className="info-card__icon">
                    <Icon name="pin" size={22} />
                  </span>
                  <div>
                    <b>{o.label}</b>
                    <a href={o.map} target="_blank" rel="noopener noreferrer" className="info-card__address">
                      {o.address}
                    </a>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          <Reveal delay={120}>
            {sent ? (
              <div className="form">
                <div className="form__success" role="status">
                  <Icon name="check" size={26} />
                  <div>
                    <h3 style={{ marginBottom: 4 }}>Your enquiry is ready, {form.name || 'there'}.</h3>
                    <p style={{ margin: 0 }}>
                      Send it straight to our operations team on WhatsApp for the fastest reply, or open
                      it as an email draft. For urgent matters, call{' '}
                      <a href={`tel:${company.phoneHref}`} style={{ color: 'var(--navy-700)' }}>
                        {company.phone}
                      </a>
                      .
                    </p>
                  </div>
                </div>
                <a
                  className="btn btn--whatsapp mt-40"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent('Name: ' + form.name + '\nEmail: ' + form.email + '\nPhone: ' + form.phone + '\nService: ' + form.subject + '\n\n' + form.message)}`}
                >
                  <Icon name="whatsapp" size={19} /> Send on WhatsApp
                </a>
                <a className="btn btn--primary mt-40" href={`mailto:${company.email}?subject=${encodeURIComponent(form.subject + ' enquiry - ' + form.name)}&body=${encodeURIComponent('Name: ' + form.name + '\nEmail: ' + form.email + '\nPhone: ' + form.phone + '\nService: ' + form.subject + '\n\n' + form.message)}`}>Open email draft <Icon name="arrow" size={18} /></a>
                <button
                  type="button"
                  className="btn btn--ghost mt-40"
                  onClick={() => {
                    setSent(false)
                  }}
                >
                  Edit enquiry
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={onSubmit}>
                <h3>Contact Us Now</h3>
                <p className="form__intro">Share your vessel name, port and required date. This form prepares an email draft; nothing is sent until you send it from your email app.</p>
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      maxLength={120}
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
                      autoComplete="email"
                      maxLength={254}
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
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
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
                    maxLength={3000}
                    value={form.message}
                    onChange={update}
                    placeholder="Vessel name, port, and your requirements…"
                    required
                  />
                </div>
                <button type="submit" className="btn btn--primary">
                  Prepare Enquiry
                  <Icon name="arrow" size={18} className="btn__arrow" />
                </button>
                <a
                  className="btn btn--whatsapp mt-40"
                  href={`${company.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="whatsapp" size={19} /> Chat on WhatsApp — fastest reply
                </a>
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
          <Reveal className="section-head center">
            <span className="eyebrow eyebrow--center">Our Locations</span>
            <h2>Find Us in Dubai</h2>
            <p className="lead">
              Visit our head office in Business Bay or our warehouse at Dubai Maritime City — tap a
              location to highlight it, or open live directions in Google Maps.
            </p>
          </Reveal>
          <div className="locations">
            <Reveal className="locations__list">
              {company.offices.map((o, i) => (
                <div className={`location-card ${i === activeOffice ? 'is-active' : ''}`} key={o.label}>
                  <span className="location-card__icon">
                    <Icon name="pin" size={22} />
                  </span>
                  <div className="location-card__body">
                    <b>{o.label}</b>
                    <a
                      className="location-card__address"
                      href={o.map}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {o.address}
                    </a>
                  </div>
                  <button
                    type="button"
                    className="location-card__select"
                    onClick={() => setActiveOffice(i)}
                    aria-pressed={i === activeOffice}
                  >
                    {i === activeOffice ? 'On map' : 'View on map'}
                  </button>
                </div>
              ))}
              <a
                className="location-card__directions"
                href={company.offices[activeOffice].map}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="pin" size={16} /> Open {company.offices[activeOffice].label} in Google Maps
                <Icon name="arrow" size={16} className="btn__arrow" />
              </a>
            </Reveal>
            <Reveal className="locations__map" delay={90}>
              <div className="locations__canvas">
                <iframe
                  title={`RNS Shipping — ${company.offices[activeOffice].label}, Dubai`}
                  key={activeOffice}
                  src={company.offices[activeOffice].embed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <span className="locations__badge">
                  <Icon name="pin" size={14} /> {company.offices[activeOffice].label}
                </span>
                <a
                  className="locations__cta"
                  href={company.offices[activeOffice].map}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="pin" size={15} /> Get directions
                  <Icon name="arrow" size={15} className="btn__arrow" />
                </a>
              </div>
            </Reveal>
          </div>
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
