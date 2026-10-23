import { createContext, useContext, useEffect } from 'react'

export const SeoContext = createContext(null)

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

function removeMeta(attr, key) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
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
  image = '/images/marine-engine-room.webp',
  keywords,
  jsonLd,
  extraJsonLd,
  noindex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}) {
  const collector = useContext(SeoContext)
  if (collector) collector.current = { title, description, path, image, keywords, jsonLd, extraJsonLd, noindex, type, publishedTime, modifiedTime, author, section, tags }
  useEffect(() => {
    const fullTitle = title.includes(SITE) ? title : `${title} | ${SITE}`
    document.title = fullTitle
    const url = `${ORIGIN}${path}`
    setMeta('name', 'description', description)
    if (keywords) setMeta('name', 'keywords', keywords)
    else removeMeta('name', 'keywords')
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
    setLink('canonical', url)

    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', SITE)
    setMeta('property', 'og:image', `${ORIGIN}${image}`)
    setMeta('property', 'og:image:alt', title)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', `${ORIGIN}${image}`)

    if (type === 'article' && publishedTime) setMeta('property', 'article:published_time', publishedTime)
    else removeMeta('property', 'article:published_time')
    if (type === 'article' && modifiedTime) setMeta('property', 'article:modified_time', modifiedTime)
    else removeMeta('property', 'article:modified_time')
    if (type === 'article' && author) setMeta('property', 'article:author', author)
    else removeMeta('property', 'article:author')
    if (type === 'article' && section) setMeta('property', 'article:section', section)
    else removeMeta('property', 'article:section')
    document.head.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove())
    if (type === 'article') tags.forEach(tag => {
      const el = document.createElement('meta')
      el.setAttribute('property', 'article:tag')
      el.setAttribute('content', tag)
      document.head.appendChild(el)
    })

    setJsonLd(
      'ld-organization',
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${ORIGIN}/#organization`,
        name: 'RNS Shipping LLC',
        url: ORIGIN,
        logo: `${ORIGIN}/images/logo.png`,
        email: 'info@rns-shipping.com',
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
    else document.getElementById('ld-page')?.remove()
    if (extraJsonLd) setJsonLd('ld-page-extra', extraJsonLd)
    else document.getElementById('ld-page-extra')?.remove()
    if (path !== '/' && !noindex) setJsonLd('ld-breadcrumb', breadcrumbs(path, title))
    else document.getElementById('ld-breadcrumb')?.remove()
  }, [title, description, path, image, keywords, jsonLd, extraJsonLd, noindex, type, publishedTime, modifiedTime, author, section, tags])

  return null
}

function breadcrumbs(path, title) {
  const parts = path.split('/').filter(Boolean)
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' },
    ...parts.map((part, index) => ({ '@type': 'ListItem', position: index + 2, name: index === parts.length - 1 ? title.split('|')[0].trim() : part.charAt(0).toUpperCase() + part.slice(1), item: ORIGIN + '/' + parts.slice(0,index+1).join('/') })),
  ] }
}

// Used by the static build so metadata is available before JavaScript executes.
export function renderHead({
  title,
  description,
  path = '/',
  image = '/images/rns-ship-hero.webp',
  keywords,
  jsonLd,
  extraJsonLd,
  noindex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}) {
  const fullTitle = title.includes(SITE) ? title : `${title} | ${SITE}`
  const url = ORIGIN + path
  const escape = text => String(text).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const meta = (name, content, attr = 'name') => `<meta ${attr}="${name}" content="${escape(content)}" />`
  const ld = (id, data) => `<script id="${id}" type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`
  return `<title>${escape(fullTitle)}</title><link rel="canonical" href="${escape(url)}" />` +
    meta('description', description) + (keywords ? meta('keywords', keywords) : '') + meta('robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large') +
    meta('og:title', fullTitle, 'property') + meta('og:description', description, 'property') + meta('og:url', url, 'property') + meta('og:type', type, 'property') + meta('og:site_name',SITE,'property') + meta('og:image',ORIGIN + image,'property') + meta('og:image:alt', title, 'property') +
    (type === 'article' && publishedTime ? meta('article:published_time', publishedTime, 'property') : '') +
    (type === 'article' && modifiedTime ? meta('article:modified_time', modifiedTime, 'property') : '') +
    (type === 'article' && author ? meta('article:author', author, 'property') : '') +
    (type === 'article' && section ? meta('article:section', section, 'property') : '') +
    (type === 'article' ? tags.map(tag => meta('article:tag', tag, 'property')).join('') : '') +
    meta('twitter:card','summary_large_image') + meta('twitter:title',fullTitle) + meta('twitter:description',description) + meta('twitter:image',ORIGIN+image) +
    ld('ld-organization', { '@context':'https://schema.org','@type':'Organization','@id':ORIGIN+'/#organization',name:'RNS Shipping LLC',url:ORIGIN,logo:ORIGIN+'/images/logo.png',email:'info@rns-shipping.com',telephone:'+971 55 539 6858',address:{'@type':'PostalAddress',streetAddress:'2209, Damac XL Tower, Business Bay',addressLocality:'Dubai',addressCountry:'AE'},department:[{'@type':'Place',name:'RNS Shipping Head Office',address:{'@type':'PostalAddress',streetAddress:'2209, Damac XL Tower, Business Bay',addressLocality:'Dubai',addressCountry:'AE'}},{'@type':'Place',name:'RNS Shipping Warehouse',address:{'@type':'PostalAddress',streetAddress:'Warehouse - Umm Hurair 2, Office 13, DMC W-341, Dubai Maritime City',addressLocality:'Dubai',addressCountry:'AE'},geo:{'@type':'GeoCoordinates',latitude:25.2433831,longitude:55.3104438},hasMap:'https://www.google.com/maps/search/?api=1&query=RNS+SHIPPING&query_place_id=ChIJ1_yucPVDXz4RcLjmV38H98o'}] }) +
    (jsonLd ? ld('ld-page',jsonLd) : '') +
    (extraJsonLd ? ld('ld-page-extra', extraJsonLd) : '') +
    (path !== '/' && !noindex ? ld('ld-breadcrumb',breadcrumbs(path,title)) : '')
}
