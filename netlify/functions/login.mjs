import { createSession, json, sameOrigin, sessionCookie, verifyCredentials } from '../lib/auth.mjs'

const attempts = new Map()

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!sameOrigin(request)) return json({ error: 'Invalid origin' }, 403)
  const ip = request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const record = attempts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 }
  if (record.reset < now) { record.count = 0; record.reset = now + 15 * 60 * 1000 }
  if (record.count >= 10) return json({ error: 'Too many attempts. Try again later.' }, 429)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  const result = verifyCredentials(body.email, body.password)
  if (!result.ok) {
    record.count += 1
    attempts.set(ip, record)
    return json({ error: result.error }, 401)
  }

  attempts.delete(ip)
  const token = createSession(result.email)
  return json({ ok: true, email: result.email }, 200, { 'set-cookie': sessionCookie(token) })
}
