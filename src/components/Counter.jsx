import { useEffect, useRef, useState } from 'react'

export default function Counter({ value, suffix = '', duration = 1600 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(value)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame
    if (typeof IntersectionObserver === 'undefined') {
      setDisplay(value)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now) => {
              const p = Math.min((now - start) / duration, 1)
              const eased = 1 - Math.pow(1 - p, 3)
              setDisplay(Math.round(eased * value))
              if (p < 1) frame = requestAnimationFrame(tick)
            }
            frame = requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(frame); started.current = false }
  }, [value, duration])

  return (
    <b ref={ref} className="block font-head text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none text-accent">
      {display}
      {suffix}
    </b>
  )
}
