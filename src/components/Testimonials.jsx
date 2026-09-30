import { useMotionEnabled } from './MotionContext'
import { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Autoplay } from 'swiper/modules'
import 'swiper/css'
import '../styles/testimonials.css'
import { testimonials } from '../data/site'
import { Icon } from './Icons'

const initials = (name) =>
  (name.replace(/^(Chief Engineer|Purchase Manager|Capt\.|Captain)\s*/i, '') || name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

// Six visual slots reuse approved quotes; the source retains four unique reviews.
const cards = Array.from({ length: 6 }, (_, index) => testimonials[index % testimonials.length])

export default function Testimonials() {
  const root = useRef(null)
  const [carousel, setCarousel] = useState(null)
  const motionEnabled = useMotionEnabled()
  useEffect(() => {
    if (!carousel || carousel.destroyed) return
    const element = root.current
    let visible = false
    let frame
    const sync = () => {
      if (carousel.destroyed) return
      const hovering = window.matchMedia('(hover: hover)').matches && element.matches(':hover')
      const keyboardFocus = element.matches(':focus-visible') || !!element.querySelector(':focus-visible')
      if (!motionEnabled || document.hidden || !visible || hovering || keyboardFocus) carousel.autoplay.stop()
      else if (!carousel.autoplay.running) carousel.autoplay.start()
    }
    const afterFocus = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(sync) }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync() })
    observer.observe(element)
    const events = ['mouseenter', 'mouseleave', 'focusin', 'focusout']
    events.forEach(event => element.addEventListener(event, afterFocus))
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('pageshow', sync)
    sync()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      events.forEach(event => element.removeEventListener(event, afterFocus))
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pageshow', sync)
      if (!carousel.destroyed) carousel.autoplay.stop()
    }
  }, [carousel, motionEnabled])
  const onKeyDown = event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const speed = document.documentElement.dataset.motion === 'paused' ? 0 : 500
    if (event.key === 'ArrowRight') carousel?.slideNext(speed)
    else carousel?.slidePrev(speed)
  }
  return (
    <div ref={root} className="testi testi--ribbon" tabIndex={0} role="region" aria-label="Client reviews. Hover to pause; swipe or use arrow keys to browse." onKeyDown={onKeyDown}>
      <Swiper modules={[A11y, Autoplay]} onSwiper={setCarousel}
        loop slidesPerView={1} spaceBetween={20} speed={500} grabCursor
        autoplay={{ enabled: false, delay: 1000, disableOnInteraction: false }}
        breakpoints={{ 700: { slidesPerView: 2 }, 1120: { slidesPerView: 3 } }}>
        {cards.map((review, index) => (
          <SwiperSlide key={index}>
            <article className="testi-card">
              <p className="testi-card__quote">{review.quote}</p>
              <div className="testi-card__stars" role="img" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map(star => <Icon key={star} name="star" size={18} />)}
              </div>
              <div className="testi-card__author">
                <span className="testi-card__avatar">{initials(review.name)}</span>
                <span><b>{review.name}</b><small>{review.role}</small></span>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
