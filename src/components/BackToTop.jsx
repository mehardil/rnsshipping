import { useEffect, useState } from 'react'
import { getLenis } from '../lib/anim'
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
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1.1 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
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
