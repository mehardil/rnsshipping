import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import BackToTop from './BackToTop'

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
    const startMotion = async () => {
      if (!window.matchMedia('(min-width: 961px) and (prefers-reduced-motion: no-preference)').matches) return
      const { gsap } = await import('../lib/anim')
      if (!active) return
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
    }
    // Load the desktop parallax engine only when someone starts scrolling.
    if (window.scrollY > 0) startMotion()
    else window.addEventListener('scroll', startMotion, { once: true, passive: true })
    return () => { active = false; window.removeEventListener('scroll', startMotion); media?.revert(); videos.forEach(video => video.pause()) }

  }, [pathname, paused])
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <Navbar />
    <main id="main-content" tabIndex={-1}><Outlet /></main>
    <div className="motion-bar" role="region" aria-label="Display preferences"><div className="container"><span>RNS Shipping · Marine Services, UAE</span><button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? 'Resume motion' : 'Pause motion'}</button></div></div>
    <Footer />
    <BackToTop />
  </>
}
