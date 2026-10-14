import { MotionContext } from './MotionContext'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import BackToTop from './BackToTop'
import { Icon } from './Icons'
import { company } from '../data/site'

export default function Layout() {
  const { pathname, hash } = useLocation()
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPaused(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' })
    const timer = setTimeout(() => {
      if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'instant', block: 'start' })
    }, 120)
    return () => clearTimeout(timer)
  }, [pathname, hash])
  useEffect(() => {
    document.documentElement.dataset.motion = paused ? 'paused' : 'playing'
    const videos = [...document.querySelectorAll('video')]
    videos.forEach(video => { if (paused) video.pause(); else video.play().catch(() => {}) })
    if (paused) return
    let active = true
    let media
    let loading = false
    let refreshTriggers = () => {}
    let refreshFrame
    const desktop = window.matchMedia('(min-width: 961px) and (prefers-reduced-motion: no-preference)')
    const refresh = () => {
      cancelAnimationFrame(refreshFrame)
      refreshFrame = requestAnimationFrame(() => { if (active) refreshTriggers() })
    }
    const sizeObserver = new ResizeObserver(refresh)
    sizeObserver.observe(document.querySelector('main'))
    document.fonts?.ready.then(refresh)
    document.addEventListener('load', refresh, true)
    const startMotion = async () => {
      if (!active || loading || media || !desktop.matches) return
      loading = true
      // Reload/navigation can interrupt this optional module download.
      const animation = await import('../lib/anim').catch(() => null)
      if (!active || !animation) { loading = false; return }
      const { gsap, ScrollTrigger } = animation
      refreshTriggers = () => ScrollTrigger.refresh()
      media = gsap.matchMedia()
      media.add('(min-width: 961px) and (prefers-reduced-motion: no-preference)', () => {
        const context = gsap.context(() => {
          gsap.utils.toArray('.hero__photo img, .page-hero__photo').forEach(el => {
            gsap.fromTo(el, { yPercent: -3, scale: 1.08 }, { yPercent: 3, scale: 1.08, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: .6 } })
          })
          gsap.utils.toArray('.media-stack__main img, .port-support__image img').forEach(el => {
            gsap.fromTo(el, { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: .8 } })
          })
        })
        return () => context.revert()
      })
      refresh()
    }
    // Load the desktop parallax engine only when someone starts scrolling.
    if (window.scrollY > 0) startMotion()
    window.addEventListener('scroll', startMotion, { passive: true })
    desktop.addEventListener('change', startMotion)
    window.addEventListener('pageshow', refresh)
    return () => {
      active = false
      window.removeEventListener('scroll', startMotion)
      desktop.removeEventListener('change', startMotion)
      window.removeEventListener('pageshow', refresh)
      document.removeEventListener('load', refresh, true)
      sizeObserver.disconnect()
      cancelAnimationFrame(refreshFrame)
      media?.revert()
      videos.forEach(video => video.pause())
    }

  }, [pathname, paused])
  return <MotionContext.Provider value={!paused}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <Navbar />
    <main id="main-content" tabIndex={-1}><Outlet /></main>
    <div className="motion-bar" role="region" aria-label="Display preferences"><div className="container"><span>RNS Shipping · Marine Services, UAE</span><button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button></div></div>
    <Footer />
    <a className="floating-call" href={`tel:${company.phoneHref}`} aria-label={`Call RNS Shipping on ${company.phone}`} title={`Call ${company.phone}`}>
      <Icon name="phone" size={25} />
    </a>
    <a className="floating-whatsapp" href={company.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with RNS Shipping on WhatsApp" title="Chat on WhatsApp">
      <Icon name="whatsapp" size={27} />
    </a>
    <BackToTop />
  </MotionContext.Provider>
}
