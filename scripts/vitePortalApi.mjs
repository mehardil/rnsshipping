import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createSession, clearSessionCookie, sessionCookie, sessionTokenFromHeader, verifyCredentials, verifySession } from '../netlify/lib/auth.mjs'
import { serializeArticle, validateArticle } from '../src/lib/articleParser.js'
import { loadArticles, writeIndex } from './content.mjs'

const root = process.cwd()
const MAX_BODY = 4 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const attempts = new Map()

function send(res, status, data, headers = {}) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value))
  res.end(JSON.stringify(data))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', chunk => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(new Error('Request body is too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

async function parseJson(req) {
  const raw = await readBody(req)
  if (!raw) return {}
  return JSON.parse(raw)
}

function sameOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

function requestOrigin(req) {
  if (req.headers.origin) return req.headers.origin
  return `http://${req.headers.host || 'localhost:5173'}`
}

function createApiMiddleware(mode) {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return next()
    const url = new URL(req.url, 'http://localhost')
    const route = url.pathname

    try {
      if (route === '/api/session' && req.method === 'GET') {
        const session = verifySession(sessionTokenFromHeader(req.headers.cookie || ''))
        return send(res, 200, session ? { authenticated: true, email: session.email } : { authenticated: false })
      }

      if (route === '/api/login' && req.method === 'POST') {
        if (!sameOrigin(req)) return send(res, 403, { error: 'Invalid origin' })
        const now = Date.now()
        const ip = req.socket.remoteAddress || 'local'
        const record = attempts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 }
        if (record.reset < now) { record.count = 0; record.reset = now + 15 * 60 * 1000 }
        if (record.count >= 10) return send(res, 429, { error: 'Too many attempts. Try again later.' })
        const body = await parseJson(req)
        const result = verifyCredentials(body.email, body.password)
        if (!result.ok) {
          record.count += 1
          attempts.set(ip, record)
          return send(res, 401, { error: result.error })
        }
        attempts.delete(ip)
        const token = createSession(result.email)
        return send(res, 200, { ok: true, email: result.email }, { 'set-cookie': sessionCookie(token, false) })
      }

      if (route === '/api/logout' && req.method === 'POST') {
        return send(res, 200, { ok: true }, { 'set-cookie': clearSessionCookie(false) })
      }

      if (route === '/api/delete' && req.method === 'POST') {
        if (!sameOrigin(req)) return send(res, 403, { error: 'Invalid origin' })
        const body = await parseJson(req)
        const slug = String(body.slug || '')
        if (!SLUG.test(slug)) return send(res, 422, { error: 'Invalid article slug.' })
        const credentials = verifyCredentials(body.email, body.password)
        if (!credentials.ok) return send(res, 401, { error: credentials.error })
        const file = path.join(root, 'src/content/articles', `${slug}.md`)
        let deleted = false
        try {
          await rm(file)
          deleted = true
        } catch (error) {
          if (error.code !== 'ENOENT') throw error
        }
        if (deleted) await writeIndex()
        return send(res, 200, {
          ok: true,
          deleted,
          mode,
          message: deleted
            ? mode === 'preview' ? 'Article file deleted. Run npm run build to remove the page from preview.' : 'Article file deleted. The dev library will refresh.'
            : 'No published file found. The local draft can be removed.',
        })
      }

      const session = verifySession(sessionTokenFromHeader(req.headers.cookie || ''))
      if (!session) return send(res, 401, { error: 'Please sign in again.' })

      if (route === '/api/articles' && req.method === 'GET') {
        const articles = await loadArticles()
        return send(res, 200, { articles: articles.map(({ body, ...article }) => article) })
      }

      if (route === '/api/publish' && req.method === 'POST') {
        if (!sameOrigin(req)) return send(res, 403, { error: 'Invalid origin' })
        const body = await parseJson(req)
        const article = body.article
        const originalSlug = body.originalSlug || ''
        const errors = validateArticle(article)
        if (errors.length) return send(res, 422, { error: 'Please fix the article fields.', errors })
        if (originalSlug && originalSlug !== article.slug) {
          return send(res, 422, { error: 'The slug of a published article cannot be changed.' })
        }
        if (!originalSlug) {
          const existing = await loadArticles()
          if (existing.some(item => item.slug === article.slug)) return send(res, 409, { error: 'That slug is already used by another article.' })
        }
        const file = path.join(root, 'src/content/articles', `${article.slug}.md`)
        await mkdir(path.dirname(file), { recursive: true })
        await writeFile(file, serializeArticle(article))
        await writeIndex()
        return send(res, 200, {
          ok: true,
          mode,
          liveUrl: `${requestOrigin(req)}/insights/${article.slug}`,
          message: mode === 'preview'
            ? 'Saved to src/content/articles. Run npm run build to see it in preview.'
            : 'Saved to src/content/articles. The dev server will reload with the new article.',
        })
      }

      if (route === '/api/upload' && req.method === 'POST') {
        if (!sameOrigin(req)) return send(res, 403, { error: 'Invalid origin' })
        const body = await parseJson(req)
        const slug = String(body.slug || '')
        if (!SLUG.test(slug)) return send(res, 422, { error: 'Save a valid slug before uploading an image.' })
        const match = String(body.dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
        if (!match) return send(res, 422, { error: 'Invalid image data.' })
        if (!ALLOWED.has(match[1])) return send(res, 422, { error: 'Use JPG, PNG, WebP, AVIF or GIF.' })
        const buffer = Buffer.from(match[2], 'base64')
        if (buffer.length > 3 * 1024 * 1024) return send(res, 413, { error: 'Image must be 3 MB or smaller.' })
        const original = String(body.filename || 'cover').replace(/\.[^.]+$/, '')
        const extension = match[1].split('/')[1].replace('jpeg', 'jpg')
        const safeName = `${original.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cover'}.${extension}`
        const directory = path.join(root, 'public/images/insights', slug)
        await mkdir(directory, { recursive: true })
        await writeFile(path.join(directory, safeName), buffer)
        return send(res, 200, { ok: true, path: `/images/insights/${slug}/${safeName}`, mode })
      }

      return send(res, 404, { error: 'Not found' })
    } catch (error) {
      console.error('[portal-api]', error)
      return send(res, 500, { error: error.message || 'Portal API error' })
    }
  }
}

export function portalApiPlugin() {
  return {
    name: 'rns-portal-api',
    configureServer(server) {
      server.middlewares.use(createApiMiddleware('local'))
    },
    configurePreviewServer(server) {
      server.middlewares.use(createApiMiddleware('preview'))
    },
  }
}
