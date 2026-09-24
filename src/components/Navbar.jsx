import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { company, navLinks } from '../data/site'
import { Icon } from './Icons'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const lastY = useRef(0)
  const toggleRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 10)
      /* hide while scrolling down past the hero, reveal on scroll up */
      if (!open && y > 140 && y > lastY.current) setHidden(true)
      else setHidden(false)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const background = [...document.querySelectorAll('main, footer, .topbar, .to-top')]
    background.forEach(el => { el.inert = true })
    const focusFrame = requestAnimationFrame(() => menuRef.current?.querySelector('a')?.focus())
    const onKey = (event) => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus() }
      if (event.key !== 'Tab') return
      const links = [...menuRef.current.querySelectorAll('a'), toggleRef.current]
      const first = links[0], last = links[links.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    const desktop = window.matchMedia('(min-width: 961px)')
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false) }
    desktop.addEventListener('change', closeOnDesktop)
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      background.forEach(el => { el.inert = false })
      document.removeEventListener('keydown', onKey)
      desktop.removeEventListener('change', closeOnDesktop)
    }
  }, [open])

  return (
    <>
      <div className="topbar" role="region" aria-label="Operations contact">
        <div className="container topbar__inner">
          <div className="topbar__items">
            <span className="topbar__item">
              <Icon name="pin" size={15} />
              <span className="topbar__hide">Business Bay, Dubai, UAE</span>
            </span>
            <span className="topbar__item topbar__hide">
              <Icon name="clock" size={15} />
              <span>24/7 Operations Support</span>
            </span>
          </div>
          <div className="topbar__items">
            <span className="topbar__item">
              <Icon name="phone" size={15} />
              <a href={`tel:${company.phoneHref}`}>{company.phone}</a>
            </span>
            <span className="topbar__item topbar__hide">
              <Icon name="mail" size={15} />
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </span>
          </div>
        </div>
      </div>

      <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${hidden && !open ? 'nav--hidden' : ''}`}>
        <div className="container nav__inner">
          <Link to="/" className="brand" aria-label="RNS Shipping home">
            <img src="/images/logo.png" alt="RNS Shipping LLC logo" width="50" height="50" />
            <span>
              RNS Shipping
              <small>Marine Services · UAE</small>
            </span>
          </Link>

          <nav ref={menuRef} id="main-navigation" className={`nav__links ${open ? 'open' : ''}`} aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/contact" className="btn btn--primary nav__cta">
              Request a Quote
            </Link>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            aria-controls="main-navigation"
            className="nav__toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </header>
      <div className={`nav__scrim ${open ? 'open' : ''}`} onClick={() => { setOpen(false); toggleRef.current?.focus() }} aria-hidden="true" />
    </>
  )
}
