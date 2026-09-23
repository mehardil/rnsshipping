import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { company, navLinks, services } from '../data/site'
import { Icon } from './Icons'
import { disposeAll, footerTextReveal, prefersReducedMotion } from '../lib/anim'

const socialIcon = {
  LinkedIn: 'linkedin',
  Facebook: 'facebook',
  Instagram: 'instagram',
  WhatsApp: 'whatsapp',
}

export default function Footer() {
  useEffect(() => {
    if (prefersReducedMotion) return
    const cleanups = [footerTextReveal('.footer__bigtext')]
    return () => disposeAll(cleanups)
  }, [])

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__about">
            <Link to="/" className="brand">
              <img src="/images/logo.png" alt="RNS Shipping LLC logo" width="50" height="50" />
              <span>
                RNS Shipping
                <small>Marine Services · UAE</small>
              </span>
            </Link>
            <p style={{ marginTop: 20 }}>
              A UAE-based marine service company with over {company.experience} years of seafaring
              and technical experience, delivering ship repair, maintenance and marine supplies
              worldwide.
            </p>
            <div className="social">
              {company.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                >
                  <Icon name={socialIcon[s.label]} size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>Useful Links</h4>
            <ul className="footer__links">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Our Services</h4>
            <ul className="footer__links">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link to={`/services#${s.slug}`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Contact Us</h4>
            <ul className="footer__contact">
              {company.offices.map((o) => (
                <li key={o.label}>
                  <Icon name="pin" size={18} />
                  <span>
                    <strong style={{ color: '#fff' }}>{o.label}:</strong> {o.address}
                  </span>
                </li>
              ))}
              <li>
                <Icon name="phone" size={18} />
                <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
              </li>
              <li>
                <Icon name="mail" size={18} />
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bigtext" aria-hidden="true">
          RNS Shipping
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} RNS Shipping LLC. All rights reserved.</span>
          <span>Ship Repair · Tank Cleaning · Chandelling · Marine Logistics — UAE</span>
        </div>
      </div>
    </footer>
  )
}
