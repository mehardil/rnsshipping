import { useMotionEnabled } from './MotionContext'
import { useEffect, useRef, useState } from 'react'

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
  variant = 'up',
  staggerSelector,
}) {
  const motionEnabled = useMotionEnabled()
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!motionEnabled || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    el.dataset.revealReady = 'true'
    const bounds = el.getBoundingClientRect()
    setShown(bounds.bottom > 0 && bounds.top < window.innerHeight - 16)
    const io = new IntersectionObserver(
      entries => entries.forEach(entry => setShown(entry.isIntersecting)),
      { threshold: 0, rootMargin: '0px 0px -16px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [motionEnabled])

  const base = variant === 'mask' ? 'reveal reveal--mask' : 'reveal'
  const state = shown ? 'reveal-in' : ''
  const stagger = staggerSelector ? 'reveal-stagger' : ''

  return (
    <Tag
      ref={ref}
      className={`${state} ${base} ${stagger} ${className}`.trim()}
      data-variant={variant}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
