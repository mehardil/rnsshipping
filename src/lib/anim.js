import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)
gsap.config({ nullTargetWarn: false })

export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null

export function getLenis() {
  return lenis
}

/* Smooth-scroller wired into GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll() {
  if (prefersReducedMotion || lenis) return () => {}

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  })

  const raf = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  lenis.on('scroll', ScrollTrigger.update)

  return () => {
    gsap.ticker.remove(raf)
    lenis.destroy()
    lenis = null
  }
}

/* Split an element's text into words wrapped in overflow-hidden shells.
 * Recurses through child elements (e.g. <em>) so inline styling survives.
 * Saves original HTML on the element; restoreSplit() puts it back. */
export function splitWords(el, { clip = true } = {}) {
  if (!el || el.dataset.split === 'done') return []

  el.dataset.splitHTML = el.innerHTML
  el.dataset.split = 'done'

  const wrapWord = (text) => {
    const outer = document.createElement('span')
    outer.style.cssText = clip
      ? 'display:inline-block;overflow:hidden;vertical-align:top'
      : 'display:inline-block;vertical-align:top'
    const inner = document.createElement('span')
    inner.textContent = text
    inner.style.cssText = 'display:inline-block;will-change:transform'
    outer.appendChild(inner)
    return [outer, inner]
  }

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = node.textContent.split(/(\s+)/)
      const frag = document.createDocumentFragment()
      parts.forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '))
        } else {
          const [outer, inner] = wrapWord(part)
          frag.appendChild(outer)
          words.push(inner)
        }
      })
      node.replaceWith(frag)
      return
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      node.style.display = 'inline-block'
      Array.from(node.childNodes).forEach(processNode)
    }
  }

  const words = []
  Array.from(el.childNodes).forEach(processNode)
  return words
}

/* Undo a splitWords call (used in cleanups so React StrictMode can re-run). */
export function restoreWords(el) {
  if (!el || el.dataset.split !== 'done') return
  el.innerHTML = el.dataset.splitHTML
  delete el.dataset.split
  delete el.dataset.splitHTML
}

/* Resolve a target that may be an element or a selector string. */
export function resolveEl(target, scope = document) {
  if (!target) return null
  if (typeof target === 'string') {
    const el = (scope || document).querySelector(target)
    if (!el) return null
    if (import.meta.env?.DEV) {
      el.setAttribute('data-anim-selector', target)
    }
    return el
  }
  return target
}

/* Word-by-word rise of a heading. Returns a cleanup fn. */
export function animateSplitHeading(target, { trigger, start = 'top 88%', scrub = false, delay = 0 } = {}) {
  const el = resolveEl(target)
  if (!el || prefersReducedMotion) return () => {}
  if (!trigger) trigger = el
  const targets = splitWords(el)
  if (!targets.length) return () => {}

  gsap.set(targets, { yPercent: 110, rotate: 2 })

  const tween = gsap.to(targets, {
    yPercent: 0,
    rotate: 0,
    duration: scrub ? 1 : 0.9,
    delay,
    stagger: 0.045,
    ease: 'power3.out',
    paused: !!scrub,
    scrollTrigger: scrub
      ? { trigger, start: 'top bottom', end: 'top 55%', scrub: 0.6 }
      : { trigger, start },
  })

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
    restoreWords(el)
  }
}

/* Curtain-style unmask for images. */
export function curtainReveal(target, { delay = 0, start = 'top 85%' } = {}) {
  const imgWrap = resolveEl(target)
  if (!imgWrap || prefersReducedMotion) return () => {}
  const curtain = imgWrap.querySelector('.curtain')
  if (!curtain) return () => {}

  gsap.set(imgWrap.querySelector('img'), { scale: 1.18 })
  gsap.set(curtain, { yPercent: 0 })

  const tl = gsap.timeline({
    scrollTrigger: { trigger: imgWrap, start },
  })

  tl.to(curtain, { yPercent: -101, duration: 1.05, delay, ease: 'power4.inOut' }).to(
    imgWrap.querySelector('img'),
    { scale: 1, duration: 1.5, ease: 'power3.out' },
    '-=0.85'
  )

  return () => {
    tl.scrollTrigger?.kill()
    tl.kill()
  }
}

/* Parallax float: element drifts slower/faster than scroll. */
export function parallax(target, { y = '12%', start = 'top bottom', end = 'bottom top' } = {}) {
  const el = resolveEl(target)
  if (!el || prefersReducedMotion) return () => {}
  const move = parseFloat(y) * (y.endsWith('%') ? -1 : 1) * -1
  const tween = gsap.fromTo(
    el,
    { yPercent: move * 0.5 },
    {
      yPercent: -move * 0.5,
      ease: 'none',
      scrollTrigger: { trigger: el, start, end, scrub: true },
    }
  )
  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
  }
}

/* Split text into per-character spans grouped in word shells. */
export function splitChars(el) {
  if (!el || el.dataset.split === 'done') return []
  el.dataset.splitHTML = el.innerHTML
  el.dataset.split = 'done'

  const chars = []
  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment()
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '))
          return
        }
        const word = document.createElement('span')
        word.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top'
        Array.from(part).forEach((ch) => {
          const c = document.createElement('span')
          c.textContent = ch
          c.style.cssText = 'display:inline-block;will-change:transform'
          word.appendChild(c)
          chars.push(c)
        })
        frag.appendChild(word)
      })
      node.replaceWith(frag)
      return
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      node.style.display = 'inline-block'
      Array.from(node.childNodes).forEach(processNode)
    }
  }

  Array.from(el.childNodes).forEach(processNode)
  return chars
}

/* matchMedia-scoped setup: only runs inside a breakpoint, auto-reverts. */
export function mm(query, setup) {
  if (typeof window === 'undefined') return () => {}
  const ctx = gsap.matchMedia()
  ctx.add(query, () => setup())
  return () => ctx.revert()
}

/* Logiver-style hero: chars rise with scaleX + rotationX (optionally bounce). */
export function charSplitReveal(target, { delay = 0, start = 'top 88%', bounce = false } = {}) {
  const el = resolveEl(target)
  if (!el || prefersReducedMotion) return () => {}
  const chars = splitChars(el)
  if (!chars.length) return () => {}

  gsap.set(el, { perspective: 400 })
  gsap.set(chars, { y: 100, opacity: 0, scaleX: 0, rotationX: 15, transformOrigin: '50% 100%' })

  const tween = gsap.to(chars, {
    y: 0,
    opacity: 1,
    scaleX: 1,
    rotationX: 0,
    duration: bounce ? 1.6 : 1.1,
    stagger: bounce ? 0.05 : 0.03,
    delay,
    ease: bounce ? 'bounce.out' : 'power3.out',
    scrollTrigger: { trigger: el, start },
  })

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
    restoreWords(el)
  }
}

/* Scrub-driven char reveal: chars at 30% opacity fill in as you scroll. */
export function scrubCharsReveal(target, { start = 'top 92%', end = 'top 60%', scrub = 1 } = {}) {
  const el = resolveEl(target)
  if (!el || prefersReducedMotion) return () => {}
  const chars = splitChars(el)
  if (!chars.length) return () => {}

  gsap.set(chars, { opacity: 0.3 })

  const tween = gsap.to(chars, {
    opacity: 1,
    duration: 0.7,
    stagger: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: el, start, end, scrub },
  })

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
    restoreWords(el)
  }
}

/* Paragraph reveal: words drop in with rotationX, perspective 400. */
export function lineDropReveal(target, { start = 'top 90%', end = 'bottom 60%', stagger = 0.06 } = {}) {
  const el = resolveEl(target)
  if (!el || prefersReducedMotion) return () => {}
  const words = splitWords(el, { clip: false })
  if (!words.length) return () => {}

  gsap.set(el, { perspective: 400 })

  const tween = gsap.from(words, {
    opacity: 0,
    rotationX: -80,
    yPercent: 60,
    transformOrigin: 'top center -50',
    force3D: true,
    duration: 1,
    stagger,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start, end, toggleActions: 'play none none none' },
  })

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
    restoreWords(el)
  }
}

/* Directional scrub fly-in (left_view / right_view / plane_land). */
export function flyIn(
  target,
  { from = 'left', distance = 300, scale = 1, start = 'top 80%', end = 'top 30%', scrub = 1.5 } = {}
) {
  const el = resolveEl(target)
  if (!el || prefersReducedMotion) return () => {}

  const fromVars = { opacity: 0 }
  if (from === 'left') fromVars.x = -distance
  else if (from === 'right') fromVars.x = distance
  else if (from === 'top') {
    fromVars.y = -70
    fromVars.scale = 0.2
  } else if (from === 'bottom') {
    fromVars.y = 70
    fromVars.scale = 0.2
  }

  const tween = gsap.from(el, {
    ...fromVars,
    scale,
    duration: 1,
    ease: 'power2.out',
    immediateRender: false,
    scrollTrigger: { trigger: el, start, end, scrub },
  })

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
  }
}

/* Image drift inside a masked container: yPercent -amount → +amount. */
export function imageParallax(target, { amount = 30, start = 'top bottom', end = 'bottom top' } = {}) {
  const wrap = resolveEl(target)
  if (!wrap || prefersReducedMotion) return () => {}
  const img = wrap.querySelector('img')
  if (!img) return () => {}

  const tween = gsap.fromTo(
    img,
    { yPercent: -amount },
    {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: { trigger: wrap, start, end, scrub: true },
    }
  )

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
  }
}

/* Footer big-text scrub reveal: scale .2 → 1 rising from bottom. */
export function footerTextReveal(target, { start = 'top 70%', end = 'top 40%' } = {}) {
  const el = resolveEl(target)
  if (!el || prefersReducedMotion) return () => {}

  const tween = gsap.from(el, {
    opacity: 0,
    scale: 0.2,
    yPercent: -100,
    transformOrigin: 'bottom',
    duration: 1,
    ease: 'power2.out',
    immediateRender: false,
    scrollTrigger: { trigger: el, start, end, scrub: 1.5 },
  })

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
  }
}

/* Safe disposal: accepts a cleanup fn, tween, timeline or ScrollTrigger. */
export function dispose(entry) {
  if (!entry) return
  if (typeof entry === 'function') {
    entry()
    return
  }
  if (entry.scrollTrigger) entry.scrollTrigger.kill()
  if (typeof entry.kill === 'function') entry.kill()
}

export function disposeAll(list = []) {
  ;(Array.isArray(list) ? list : []).forEach((entry) => dispose(entry))
}

export { gsap, ScrollTrigger }
