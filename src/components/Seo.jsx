import { useEffect } from 'react'

const SITE = 'RNS Shipping'
const ORIGIN = 'https://rnsshipping.com'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(id, data) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export default function Seo({
  title,
  description,
  path = '/',
  image = '/images/ship-technical.png',
  keywords,
  jsonLd,
}) {
  useEffect(() => {
    const fullTitle = title.includes(SITE) ? title : `${title} | ${SITE}`
    document.title = fullTitle
    const url = `${ORIGIN}${path}`
    setMeta('name', 'description', description)
    if (keywords) setMeta('name', 'keywords', keywords)
    setLink('canonical', url)

    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', SITE)
    setMeta('property', 'og:image', `${ORIGIN}${image}`)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', `${ORIGIN}${image}`)

    setJsonLd(
      'ld-organization',
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'RNS Shipping LLC',
        url: ORIGIN,
        logo: `${ORIGIN}/images/logo.png`,
        email: 'info@rnsshipping.com',
        telephone: '+971 55 539 6858',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '2209, Damac XL Tower, Business Bay',
          addressLocality: 'Dubai',
          addressCountry: 'AE',
        },
      }
    )

    if (jsonLd) setJsonLd('ld-page', jsonLd)
  }, [title, description, path, image, keywords, jsonLd])

  return null
}
