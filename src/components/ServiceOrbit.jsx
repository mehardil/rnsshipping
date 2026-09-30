import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { services } from '../data/site'
import { Icon } from './Icons'
import '../styles/service-orbit.css'

export default function ServiceOrbit() {
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)
  const [scrollMode, setScrollMode] = useState(false)
  const journey = useRef(null)
  const stage = useRef(null)
  const tabs = useRef([])

  useEffect(() => {
    setReady(true)
    const query = window.matchMedia('(min-width: 900px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)')
    const update = () => setScrollMode(query.matches && document.documentElement.dataset.motion !== 'paused')
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] })
    query.addEventListener('change', update)
    update()
    return () => { observer.disconnect(); query.removeEventListener('change', update) }
  }, [])

  useEffect(() => {
    if (!scrollMode) return
    let frame
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!journey.current || !stage.current) return
        const travel = journey.current.offsetHeight - stage.current.offsetHeight
        if (travel <= 0) return
        const progress = Math.max(0, Math.min(1, -journey.current.getBoundingClientRect().top / travel))
        stage.current.style.setProperty('--scroll-rotation', `${-54 + progress * 108}deg`)
        setActive(Math.round(progress * (services.length - 1)))
      })
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); stage.current?.style.removeProperty('--scroll-rotation') }
  }, [scrollMode])

  const select = index => {
    setActive(index)
    if (scrollMode) {
      const start = window.scrollY + journey.current.getBoundingClientRect().top
      const travel = journey.current.offsetHeight - stage.current.offsetHeight
      window.scrollTo({ top: start + travel * index / (services.length - 1), behavior: 'instant' })
    }
  }
  const onKeyDown = (event, index) => {
    let next
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % services.length
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index + services.length - 1) % services.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = services.length - 1
    if (next === undefined) return
    event.preventDefault()
    select(next)
    tabs.current[next]?.focus({ preventScroll: true })
  }

  return (
    <section className="service-orbit" aria-labelledby="service-orbit-title" data-enhanced={ready || undefined} data-scroll-mode={scrollMode || undefined}>
      <div className="container service-orbit__heading">
        <span className="eyebrow">What We Offer</span>
        <h2 id="service-orbit-title">Comprehensive Marine Services &amp; Solutions</h2>
        <p className="lead">Precision. Performance. Reliability. From technical servicing to automation, we keep vessels operating at peak performance.</p>
      </div>
      <div className="service-orbit__journey" ref={journey}>
        <div className="service-orbit__stage" ref={stage}>
          <div className="service-orbit__layout container">
            <div className="service-orbit__selector">
              <div className="service-orbit__dial" aria-hidden="true" style={{ '--rotation': `${-54 + active * 36}deg` }}>
                <div className="service-orbit__ring" />
                <div className="service-orbit__hub"><span>RNS / SERVICES</span><b>{services[active].num}</b><small>OF 04</small></div>
              </div>
              <div className="service-orbit__tabs" role="tablist" aria-label="Marine service divisions">
                {services.map((service, index) => (
                  <button key={service.slug} ref={el => { tabs.current[index] = el }} type="button" role="tab"
                    id={`orbit-tab-${service.slug}`} aria-controls={`orbit-panel-${service.slug}`} aria-selected={active === index}
                    tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => onKeyDown(event, index)}
                    style={{ '--x': `${Math.cos((-54 + index * 36) * Math.PI / 180) * 310}px`, '--y': `${Math.sin((-54 + index * 36) * Math.PI / 180) * 310}px` }}>
                    <span>{service.num}</span><strong>{service.title}</strong>
                  </button>
                ))}
              </div>
              <p className="service-orbit__hint"><Icon name="arrow" size={16} />{scrollMode ? 'Scroll to explore / select a division' : 'Select a division to explore'}</p>
            </div>
            <div className="service-orbit__panels">
              {services.map((service, index) => (
                <article className="service-orbit__panel" key={service.slug} role="tabpanel" id={`orbit-panel-${service.slug}`}
                  aria-labelledby={`orbit-tab-${service.slug}`} hidden={ready && active !== index} tabIndex={0}>
                  <div className="service-orbit__media">
                    <img src={service.image} alt={service.title} loading="lazy" width="900" height="600" />
                    <span className="service-orbit__badge"><Icon name={service.icon} size={24} />{service.num} / 04</span>
                  </div>
                  <div className="service-orbit__copy">
                    <h3>{service.title}</h3><p>{service.short}</p>
                    <Link to={`/services/${service.slug}`} className="text-link">View Details <Icon name="arrow" size={18} /></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
