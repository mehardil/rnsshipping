import { json, sessionTokenFromHeader, verifySession } from '../lib/auth.mjs'

export default async function handler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405)
  const session = verifySession(sessionTokenFromHeader(request.headers.get('cookie') || ''))
  return json(session ? { authenticated: true, email: session.email } : { authenticated: false })
}
