import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { testimonials } from '../data/site'
import { Icon } from './Icons'

const initials = (name) =>
  name
    .replace(/^(Chief Engineer|Purchase Manager|Capt\.|Captain)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export default function Testimonials() {
  return (
    <div className="testi">
      <Swiper
        modules={[A11y, Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        speed={450}
        a11y={{ enabled: true }}
        navigation={{ nextEl: '.testi__next', prevEl: '.testi__prev' }}
        pagination={{ el: '.testi__pagi', clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 },
          900: { slidesPerView: 2 },
          1200: { slidesPerView: 2 },
        }}
        className="testi__swiper"
      >
        {testimonials.map((t) => (
          <SwiperSlide key={`${t.name}-${t.role}`}>
            <article className="testi-card">
              <div className="testi-card__stars" role="img" aria-label="5 out of 5 stars">
                {[0, 1, 2, 3, 4].map((s) => (
                  <Icon key={s} name="star" size={16} />
                ))}
              </div>
              <p className="testi-card__quote">{t.quote}</p>
              <div className="testi-card__author">
                <span className="testi-card__avatar">{initials(t.name)}</span>
                <span>
                  <b>{t.name}</b>
                  <small>{t.role}</small>
                </span>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="testi__controls">
        <button type="button" className="testi__nav testi__prev" aria-label="Previous testimonial">
          <Icon name="arrow" size={18} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <div className="testi__pagi" />
        <button type="button" className="testi__nav testi__next" aria-label="Next testimonial">
          <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  )
}
