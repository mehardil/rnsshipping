import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/anim'

const SESSION_KEY = 'rns-preloaded'

export default function Preloader({ onDone }) {
  const rootRef = useRef(null)
  const labelRef = useRef(null)
  const barRef = useRef(null)
  const [gone, setGone] = useState(!!sessionStorage.getItem(SESSION_KEY))

  useEffect(() => {
    if (gone) {
      onDone?.()
      return
    }

    document.body.style.overflow = 'hidden'

    const progress = { value: 0 }
    const tl = gsap.timeline()

    if (prefersReducedMotion) {
      setGone(true)
      sessionStorage.setItem(SESSION_KEY, '1')
      document.body.style.overflow = ''
      onDone?.()
      return
    }

    tl.fromTo(
      rootRef.current.querySelector('.pl__logo'),
      { opacity: 0, y: 26, scale: 0.85 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    ).to(progress, {
      value: 100,
      duration: 1.15,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (labelRef.current) {
          labelRef.current.textContent = `${Math.round(progress.value)}%`
        }
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${progress.value / 100})`
        }
      },
    })

    tl.to(rootRef.current.querySelector('.pl__panel-top'), {
      yPercent: -100,
      duration: 0.9,
      ease: 'power4.inOut',
    })
    tl.to(
      rootRef.current.querySelector('.pl__panel-bottom'),
      { yPercent: 100, duration: 0.9, ease: 'power4.inOut' },
      '<0.12'
    )
    tl.to(
      rootRef.current.querySelector('.pl__center'),
      { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' },
      '-=0.95'
    )
    tl.add(() => {
      sessionStorage.setItem(SESSION_KEY, '1')
      document.body.style.overflow = ''
      setGone(true)
      onDone?.()
    })

    return () => {
      tl.kill()
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <span className="pl__panel pl__panel-top" />
      <span className="pl__panel pl__panel-bottom" />
      <div className="pl__center">
        <img src="/images/logo.png" alt="" className="pl__logo" width="72" height="72" />
        <span className="pl__name">
          RNS Shipping
          <small>Marine Services · UAE</small>
        </span>
        <span className="pl__track">
          <span className="pl__bar" ref={barRef} />
        </span>
        <span className="pl__label" ref={labelRef}>
          0%
        </span>
      </div>
    </div>
  )
}
