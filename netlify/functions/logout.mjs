import { clearSessionCookie, json, sameOrigin } from '../lib/auth.mjs'

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!sameOrigin(request)) return json({ error: 'Invalid origin' }, 403)
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() })
}
