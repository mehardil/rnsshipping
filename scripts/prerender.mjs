import { createServer } from 'vite'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { services } from '../src/data/site.js'
import { loadArticles } from './content.mjs'

const ORIGIN = 'https://rnsshipping.com'
const articles = await loadArticles()
const articleRoutes = articles.map(article => `/insights/${article.slug}`)
const routes = ['/', '/about', '/services', '/contact', '/insights', ...services.map(s => `/services/${s.slug}`), ...articleRoutes]

const template = (await readFile('dist/index.html', 'utf8'))
  .replace(/<title>[\s\S]*?<\/title>/, '')
  .replace(/<meta\s+name="description"[\s\S]*?\/>/, '')
  .replace(/<meta\s+name="keywords"[\s\S]*?\/>/, '')

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', ssr: { noExternal: ['gsap', 'lenis', 'swiper'] } })

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function articleScript(article) {
  if (!article) return ''
  const json = JSON.stringify(article).replace(/</g, '\\u003c')
  return `<script id="article-data" type="application/json">${json}</script>`
}

function sitemapEntry(route, { lastmod, changefreq = 'monthly', priority = '0.7', image } = {}) {
  return `<url><loc>${ORIGIN}${route}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority>${image ? `<image:image><image:loc>${ORIGIN}${image}</image:loc></image:image>` : ''}</url>`
}

try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
  const today = new Date().toISOString().slice(0, 10)

  for (const route of routes) {
    const article = route.startsWith('/insights/')
      ? articles.find(item => route === `/insights/${item.slug}`)
      : null
    const { html, head, article: renderedArticle } = render(route, { article })
    const embedded = articleScript(renderedArticle || article)
    let document = template
      .replace('</head>', `${head}</head>`)
      .replace('<div id="root"></div>', `<div id="root" data-route="${route}">${html}</div>`)
    if (embedded) document = document.replace('</body>', `${embedded}</body>`)
    const directory = route === '/' ? 'dist' : `dist${route}`
    await mkdir(directory, { recursive: true })
    await writeFile(`${directory}/index.html`, document)
    if (route !== '/') await writeFile(`dist${route}.html`, document)
    console.log('Rendered', route)
  }

  const notFound = render('/404', {})
  let notFoundDoc = template
    .replace('</head>', `${notFound.head}</head>`)
    .replace('<div id="root"></div>', `<div id="root" data-route="/404">${notFound.html}</div>`)
  await mkdir('dist/404', { recursive: true })
  await writeFile('dist/404/index.html', notFoundDoc)
  await writeFile('dist/404.html', notFoundDoc)

  const portalTemplate = template
    .replace('</head>', '<title>Insights Studio | RNS Shipping</title><meta name="robots" content="noindex, nofollow" /><meta name="description" content="Private editorial portal for RNS Shipping." /></head>')
    .replace('<div id="root"></div>', '<div id="root"></div>')
  await mkdir('dist/portal', { recursive: true })
  await writeFile('dist/portal/index.html', portalTemplate)
  await writeFile('dist/portal.html', portalTemplate)

  const latest = articles[0]?.updatedAt || today
  const entries = [
    sitemapEntry('/', { lastmod: today, changefreq: 'weekly', priority: '1.0', image: '/images/rns-ship-hero.webp' }),
    sitemapEntry('/services', { lastmod: today, priority: '0.9' }),
    sitemapEntry('/insights', { lastmod: latest, changefreq: 'weekly', priority: '0.9' }),
    sitemapEntry('/about', { lastmod: today, priority: '0.7' }),
    sitemapEntry('/contact', { lastmod: today, priority: '0.8' }),
    ...services.map(service => sitemapEntry(`/services/${service.slug}`, { lastmod: today, priority: '0.9', image: service.image })),
    ...articles.map(article => sitemapEntry(`/insights/${article.slug}`, { lastmod: article.updatedAt, changefreq: 'monthly', priority: '0.7', image: article.cover })),
  ]
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}</urlset>`)

  const rssItems = articles.slice(0, 30).map(article => `<item><title>${escapeXml(article.title)}</title><link>${ORIGIN}/insights/${article.slug}</link><guid isPermaLink="true">${ORIGIN}/insights/${article.slug}</guid><description>${escapeXml(article.description)}</description><pubDate>${new Date(`${article.publishedAt}T08:00:00Z`).toUTCString()}</pubDate></item>`).join('')
  const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>RNS Shipping Insights</title><link>${ORIGIN}/insights</link><description>Practical ship repair, cleaning, maintenance and compliance guidance for vessels in Dubai and the UAE.</description><language>en-AE</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${rssItems}</channel></rss>`
  await writeFile('dist/rss.xml', rss)
  console.log(`Sitemap: ${entries.length} URLs · RSS: ${articles.length} articles`)
} finally {
  await server.close()
}
