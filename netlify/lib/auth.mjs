import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'rns_portal_session'
const SESSION_HOURS = 8

function isProduction() {
  return process.env.NETLIFY === 'true' || process.env.NODE_ENV === 'production'
}

export function portalConfig() {
  const production = isProduction()
  const email = process.env.PORTAL_EMAIL || ''
  const password = process.env.PORTAL_PASSWORD || ''
  const secret = process.env.SESSION_SECRET || ''
  return { email: email.toLowerCase(), password, secret, production }
}

function digest(value) {
  return createHash('sha256').update(String(value)).digest()
}

function safeEqual(a, b) {
  const left = digest(a)
  const right = digest(b)
  return timingSafeEqual(left, right)
}

export function verifyCredentials(email, password) {
  const config = portalConfig()
  if (!config.email || !config.password || !config.secret) {
    return { ok: false, error: 'Portal credentials are not configured on the server.' }
  }
  if (!safeEqual(String(email || '').toLowerCase(), config.email) || !safeEqual(password || '', config.password)) {
    return { ok: false, error: 'Email or password is incorrect.' }
  }
  return { ok: true, email: config.email }
}

function base64url(value) {
  return Buffer.from(value).toString('base64url')
}

function sign(payload) {
  const config = portalConfig()
  return createHmac('sha256', config.secret).update(payload).digest('base64url')
}

export function createSession(email) {
  const payload = base64url(JSON.stringify({
    email,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  }))
  return `${payload}.${sign(payload)}`
}

export function verifySession(token) {
  if (!token) return null
  const [payload, signature] = String(token).split('.')
  if (!payload || !signature) return null
  const expected = sign(payload)
  if (!safeEqual(signature, expected)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data?.email || !data?.exp || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export function parseCookies(header = '') {
  return String(header).split(';').reduce((cookies, part) => {
    const index = part.indexOf('=')
    if (index === -1) return cookies
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (key) cookies[key] = decodeURIComponent(value)
    return cookies
  }, {})
}

export function sessionTokenFromHeader(header) {
  return parseCookies(header)[SESSION_COOKIE] || ''
}

export function sessionCookie(token, secure = isProduction()) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 60 * 60}${secure ? '; Secure' : ''}`
}

export function clearSessionCookie(secure = isProduction()) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === request.headers.get('host')
  } catch {
    return false
  }
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  })
}
