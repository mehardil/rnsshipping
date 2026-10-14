import { useEffect, useState } from 'react'
import { Icon } from './Icons'

export default function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      className={`to-top ${show ? 'to-top--show' : ''}`}
      onClick={toTop}
      aria-label="Back to top"
    >
      <Icon name="arrow" size={20} style={{ transform: 'rotate(-90deg)' }} />
    </button>
  )
}
