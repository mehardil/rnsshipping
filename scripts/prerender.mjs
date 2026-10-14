import { createServer } from 'vite'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { services } from '../src/data/site.js'

const routes = ['/', '/about', '/services', '/contact', ...services.map(s => `/services/${s.slug}`)]
const template = (await readFile('dist/index.html','utf8')).replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta\s+name="description"[\s\S]*?\/>/, '')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', ssr: { noExternal: ['gsap', 'lenis', 'swiper'] } })
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
  for (const route of [...routes, '/404']) {
    const { html, head } = render(route)
    const document = template.replace('</head>', head + '</head>').replace('<div id="root"></div>', `<div id="root" data-route="${route}">${html}</div>`)
    const directory = route === '/' ? 'dist' : `dist${route}`
    await mkdir(directory, { recursive: true })
    await writeFile(`${directory}/index.html`, document)
    if (route !== '/') await writeFile(`dist${route}.html`, document)
    if (route === '/404') await writeFile('dist/404.html', document)
    console.log('Rendered', route)
  }
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>https://rnsshipping.com${route}</loc></url>`).join('')}</urlset>`)
} finally { await server.close() }
