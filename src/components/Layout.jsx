import { useEffect, useLayoutEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  ScrollTrigger,
  gsap,
  initSmoothScroll,
  prefersReducedMotion,
} from '../lib/anim'
import Navbar from './Navbar'
import Footer from './Footer'
import Preloader from './Preloader'
import BackToTop from './BackToTop'

/* Magnetic pull on buttons — pointer drags the pill toward itself slightly. */
function useMagneticButtons(enabled) {
  useEffect(() => {
    if (!enabled) return
    const buttons = Array.from(document.querySelectorAll('.btn'))
    const handlers = []

    buttons.forEach((btn) => {
      const strength = 14
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })

      const onMove = (e) => {
        const r = btn.getBoundingClientRect()
        xTo(((e.clientX - (r.left + r.width / 2)) / r.width) * strength)
        yTo(((e.clientY - (r.top + r.height / 2)) / r.height) * strength)
      }
      const onLeave = () => {
        xTo(0)
        yTo(0)
      }
      btn.addEventListener('mousemove', onMove)
      btn.addEventListener('mouseleave', onLeave)
      handlers.push({ btn, onMove, onLeave })
    })

    return () =>
      handlers.forEach(({ btn, onMove, onLeave }) => {
        btn.removeEventListener('mousemove', onMove)
        btn.removeEventListener('mouseleave', onLeave)
        gsap.set(btn, { x: 0, y: 0 })
      })
  }, [enabled])
}

export default function Layout() {
  const { pathname, hash } = useLocation()
  const [ready, setReady] = useState(false)

  /* Smooth scrolling — one instance for the whole app. */
  useEffect(() => initSmoothScroll(), [])

  /* Route change: reset scroll then let trigger positions recalc. */
  useEffect(() => {
    window.scrollTo(0, 0)
    const t = setTimeout(() => ScrollTrigger.refresh(), 450)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (!el) return
    const t = setTimeout(
      () => el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' }),
      80
    )
    return () => clearTimeout(t)
  }, [hash, pathname, ready])

  useMagneticButtons(ready && !prefersReducedMotion)

  /* Entrance once the preloader curtain lifts. */
  useLayoutEffect(() => {
    if (!ready || prefersReducedMotion) return
    gsap.from('.nav', { yPercent: -100, duration: 0.8, ease: 'power3.out' })
    gsap.from('.topbar', { opacity: 0, duration: 0.5, delay: 0.15 })
  }, [ready, pathname])

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
