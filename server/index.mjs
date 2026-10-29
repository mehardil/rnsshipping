import { createServer } from 'node:http'
import { createReadStream, readFileSync } from 'node:fs'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  clearSessionCookie,
  createSession,
  sessionCookie,
  sessionTokenFromHeader,
  verifyCredentials,
  verifySession,
} from '../netlify/lib/auth.mjs'
import { serializeArticle, validateArticle } from '../src/lib/articleParser.js'
import { ARTICLES_DIR, loadArticles, writeIndex } from '../scripts/content.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const PUBLIC = path.join(ROOT, 'public')
const MAX_BODY = 6 * 1024 * 1024
const MAX_UPLOAD = 3 * 1024 * 1024
const ALLOWED_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function loadEnvFile(file) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    return
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index === -1) continue
    const key = line.slice(0, index).trim()
    let value = line.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key && !(key in process.env)) process.env[key] = value
  }
}

for (const file of [
  process.env.ENV_FILE,
  path.join(ROOT, '.env.local'),
  path.join(ROOT, '.env'),
].filter(Boolean)) {
  loadEnvFile(file)
}

const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '127.0.0.1'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
}

const loginAttempts = new Map()
const deleteAttempts = new Map()

function securityHeaders() {
  return {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'SAMEORIGIN',
    'referrer-policy': 'strict-origin-when-cross-origin',
  }
}

function sendJson(res, status, data, headers = {}) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    ...securityHeaders(),
    ...headers,
  })
  res.end(body)
}

function readBody(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', chunk => {
      size += chunk.length
      if (size > limit) {
        reject(Object.assign(new Error('Request body is too large'), { status: 413 }))
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
  try {
    return JSON.parse(raw)
  } catch {
    throw Object.assign(new Error('Invalid request body'), { status: 400 })
  }
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return String(forwarded).split(',')[0].trim()
  return req.socket.remoteAddress || 'unknown'
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

function secureCookie(req) {
  if (process.env.COOKIE_SECURE === 'true') return true
  if (process.env.COOKIE_SECURE === 'false') return false
  return req.headers['x-forwarded-proto'] === 'https'
}

function requestOrigin(req) {
  const proto = req.headers['x-forwarded-proto'] || (secureCookie(req) ? 'https' : 'http')
  return `${proto}://${req.headers.host || `localhost:${PORT}`}`
}

function rateLimit(map, ip, limit = 10) {
  const now = Date.now()
  const record = map.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 }
  if (record.reset < now) {
    record.count = 0
    record.reset = now + 15 * 60 * 1000
  }
  map.set(ip, record)
  return {
    blocked: record.count >= limit,
    fail() {
      record.count += 1
    },
    reset() {
      map.delete(ip)
    },
  }
}

function currentSession(req) {
  return verifySession(sessionTokenFromHeader(req.headers.cookie || ''))
}

let building = false
let buildAgain = false

function scheduleBuild() {
  if (building) {
    buildAgain = true
    return
  }
  building = true
  const npm = process.env.NPM_BIN || 'npm'
  console.log(`[portal] rebuilding static site with ${npm}`)
  const child = spawn(npm, ['run', 'build'], {
    cwd: ROOT,
    env: process.env,
    stdio: ['ignore', 'inherit', 'inherit'],
  })
  child.on('error', error => {
    building = false
    console.error('[portal] build failed to start:', error.message)
  })
  child.on('exit', code => {
    building = false
    if (code !== 0) console.error(`[portal] build exited with code ${code}`)
    if (buildAgain) {
      buildAgain = false
      scheduleBuild()
    }
  })
}

async function fileExists(file) {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

async function apiHandler(req, res, url) {
  const route = url.pathname

  if (route === '/api/session') {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })
    const session = currentSession(req)
    return sendJson(res, 200, session ? { authenticated: true, email: session.email } : { authenticated: false })
  }

  if (route === '/api/login') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Invalid origin' })
    const limiter = rateLimit(loginAttempts, clientIp(req))
    if (limiter.blocked) return sendJson(res, 429, { error: 'Too many attempts. Try again later.' })
    const body = await parseJson(req)
    const result = verifyCredentials(body.email, body.password)
    if (!result.ok) {
      limiter.fail()
      return sendJson(res, 401, { error: result.error })
    }
    limiter.reset()
    const token = createSession(result.email)
    return sendJson(res, 200, { ok: true, email: result.email }, {
      'set-cookie': sessionCookie(token, secureCookie(req)),
    })
  }

  if (route === '/api/logout') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Invalid origin' })
    return sendJson(res, 200, { ok: true }, { 'set-cookie': clearSessionCookie(secureCookie(req)) })
  }

  if (route === '/api/articles') {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' })
    if (!currentSession(req)) return sendJson(res, 401, { error: 'Please sign in again.' })
    const articles = await loadArticles()
    return sendJson(res, 200, { articles: articles.map(({ body, ...article }) => article) })
  }

  if (route === '/api/publish') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Invalid origin' })
    if (!currentSession(req)) return sendJson(res, 401, { error: 'Please sign in again.' })
    const body = await parseJson(req)
    const article = body.article
    const originalSlug = String(body.originalSlug || '')
    const errors = validateArticle(article)
    if (errors.length) return sendJson(res, 422, { error: 'Please fix the article fields.', errors })
    if (originalSlug && originalSlug !== article.slug) {
      return sendJson(res, 422, { error: 'The slug of a published article cannot be changed. Duplicate the article to create a new URL.' })
    }
    const file = path.join(ARTICLES_DIR, `${article.slug}.md`)
    if (!originalSlug && (await fileExists(file))) {
      return sendJson(res, 409, { error: 'That slug is already used by another article.' })
    }
    await mkdir(ARTICLES_DIR, { recursive: true })
    await writeFile(file, serializeArticle(article))
    await writeIndex()
    scheduleBuild()
    return sendJson(res, 200, {
      ok: true,
      mode: 'server',
      liveUrl: `${requestOrigin(req)}/insights/${article.slug}`,
      message: 'Saved to src/content/articles. The static site is rebuilding; the live page will appear shortly.',
    })
  }

  if (route === '/api/upload') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Invalid origin' })
    if (!currentSession(req)) return sendJson(res, 401, { error: 'Please sign in again.' })
    const body = await parseJson(req)
    const slug = String(body.slug || '')
    if (!SLUG.test(slug)) return sendJson(res, 422, { error: 'Save a valid slug before uploading an image.' })
    const match = String(body.dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
    if (!match) return sendJson(res, 422, { error: 'Invalid image data.' })
    if (!ALLOWED_IMAGES.has(match[1])) return sendJson(res, 422, { error: 'Use JPG, PNG, WebP, AVIF or GIF.' })
    const buffer = Buffer.from(match[2], 'base64')
    if (buffer.length > MAX_UPLOAD) return sendJson(res, 413, { error: 'Image must be 3 MB or smaller.' })
    const original = String(body.filename || 'cover').replace(/\.[^.]+$/, '')
    const extension = match[1].split('/')[1].replace('jpeg', 'jpg')
    const safeName = `${original.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cover'}.${extension}`
    const relative = path.join('images/insights', slug, safeName)
    for (const base of [PUBLIC, DIST]) {
      const file = path.join(base, relative)
      await mkdir(path.dirname(file), { recursive: true })
      await writeFile(file, buffer)
    }
    return sendJson(res, 200, { ok: true, path: `/images/insights/${slug}/${safeName}` })
  }

  if (route === '/api/delete') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Invalid origin' })
    const limiter = rateLimit(deleteAttempts, clientIp(req))
    if (limiter.blocked) return sendJson(res, 429, { error: 'Too many attempts. Try again later.' })
    const body = await parseJson(req)
    const credentials = verifyCredentials(body.email, body.password)
    if (!credentials.ok) {
      limiter.fail()
      return sendJson(res, 401, { error: credentials.error })
    }
    const slug = String(body.slug || '')
    if (!SLUG.test(slug)) return sendJson(res, 422, { error: 'Invalid article slug.' })
    const file = path.join(ARTICLES_DIR, `${slug}.md`)
    if (!(await fileExists(file))) {
      return sendJson(res, 200, { ok: true, deleted: false, message: 'No published file found. The local draft can be removed.' })
    }
    await rm(file)
    await writeIndex()
    scheduleBuild()
    limiter.reset()
    return sendJson(res, 200, {
      ok: true,
      deleted: true,
      message: 'Article deleted from the repository. The static site is rebuilding to remove the live page.',
    })
  }

  return sendJson(res, 404, { error: 'Not found' })
}

async function sendFile(req, res, file, status = 200) {
  const info = await stat(file)
  const extension = path.extname(file).toLowerCase()
  const headers = {
    'content-type': MIME[extension] || 'application/octet-stream',
    'content-length': info.size,
    ...securityHeaders(),
  }
  if (file.includes(`${path.sep}assets${path.sep}`)) {
    headers['cache-control'] = 'public, max-age=31536000, immutable'
  } else if (extension === '.html') {
    headers['cache-control'] = 'no-cache'
  } else if (/\.(webp|avif|png|jpe?g|gif|svg|ico|woff2?|ttf|mp4|webm)$/i.test(extension)) {
    headers['cache-control'] = 'public, max-age=2592000'
  } else {
    headers['cache-control'] = 'public, max-age=86400'
  }
  res.writeHead(status, headers)
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  createReadStream(file).on('error', () => res.destroy()).pipe(res)
}

async function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { error: 'Method not allowed' })
  }
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    return sendJson(res, 400, { error: 'Invalid path' })
  }
  if (pathname.includes('\0')) return sendJson(res, 400, { error: 'Invalid path' })

  const candidates = []
  if (pathname === '/') {
    candidates.push('/index.html')
  } else if (pathname.endsWith('/')) {
    candidates.push(`${pathname}index.html`)
  } else {
    candidates.push(pathname, `${pathname}.html`, `${pathname}/index.html`)
  }

  for (const candidate of candidates) {
    const file = path.join(DIST, candidate)
    if (!file.startsWith(`${DIST}${path.sep}`)) continue
    if (await fileExists(file)) return sendFile(req, res, file)
  }

  if (pathname === '/portal' || pathname.startsWith('/portal/')) {
    const portalIndex = path.join(DIST, 'portal/index.html')
    if (await fileExists(portalIndex)) return sendFile(req, res, portalIndex)
  }

  const notFound = path.join(DIST, '404.html')
  if (await fileExists(notFound)) return sendFile(req, res, notFound, 404)
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', ...securityHeaders() })
  res.end('Not found')
}

if (!(await fileExists(path.join(DIST, 'index.html')))) {
  console.error('[portal] dist/index.html is missing. Run "npm run build" before starting the server.')
  process.exit(1)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  try {
    if (url.pathname.startsWith('/api/')) {
      await apiHandler(req, res, url)
      return
    }
    await serveStatic(req, res, url)
  } catch (error) {
    if (!error.status) console.error('[portal]', error)
    if (!res.headersSent) {
      sendJson(res, error.status || 500, { error: error.message || 'Server error' })
    } else {
      res.destroy()
    }
  }
})

server.listen(PORT, HOST, () => {
  console.log(`[portal] RNS Shipping server listening on http://${HOST}:${PORT}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}
