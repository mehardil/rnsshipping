import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/anim'

export default function MarqueeBand({ items = [] }) {
  const trackRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track || prefersReducedMotion) return

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: 26,
      ease: 'none',
      repeat: -1,
    })

    const slow = () => tween.timeScale(0.3)
    const normal = () => tween.timeScale(1)
    track.addEventListener('mouseenter', slow)
    track.addEventListener('mouseleave', normal)

    return () => {
      track.removeEventListener('mouseenter', slow)
      track.removeEventListener('mouseleave', normal)
      tween.kill()
    }
  }, [])

  const row = [...items, ...items]

  return (
    <section className="marquee-band" aria-hidden="true">
      <div className="marquee-band__track" ref={trackRef}>
        {row.map((t, i) => (
          <span className="marquee-band__item" key={`${t}-${i}`}>
            {t}
            <i className="marquee-band__dot" />
          </span>
        ))}
      </div>
    </section>
  )
}
