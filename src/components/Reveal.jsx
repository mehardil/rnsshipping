import { useEffect, useRef, useState } from 'react'

export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
  variant = 'up',
  staggerSelector,
}) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    if (el.getBoundingClientRect().top < window.innerHeight) { setShown(true); return }
    el.dataset.revealReady = 'true'
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0, rootMargin: '0px 0px -16px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

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
