import { useEffect, useRef, useState } from 'react'
import { useMotionEnabled } from './MotionContext'

export default function Counter({ value, suffix = '', duration = 1600 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(value)
  const motionEnabled = useMotionEnabled()
  useEffect(() => {
    const el = ref.current
    if (!el || !motionEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined') {
      setDisplay(value)
      return
    }
    let frame
    let visible = false
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting === visible) return
        visible = entry.isIntersecting
        cancelAnimationFrame(frame)
        if (!visible) { setDisplay(value); return }
        const start = performance.now()
        setDisplay(0)
        const tick = now => {
          const progress = Math.min((now - start) / Math.max(1, duration), 1)
          setDisplay(Math.round((1 - Math.pow(1 - progress, 3)) * value))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      })
    }, { threshold: 0.1 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(frame) }
  }, [value, duration, motionEnabled])
  return <b ref={ref} className="block font-head text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none text-accent">{display}{suffix}</b>
}
