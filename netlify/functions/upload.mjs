import { json, sameOrigin, sessionTokenFromHeader, verifySession } from '../lib/auth.mjs'
import { githubConfigured, putFile, triggerBuild } from '../lib/github.mjs'

const MAX_BYTES = 3 * 1024 * 1024
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!sameOrigin(request)) return json({ error: 'Invalid origin' }, 403)
  const session = verifySession(sessionTokenFromHeader(request.headers.get('cookie') || ''))
  if (!session) return json({ error: 'Please sign in again.' }, 401)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  if (!githubConfigured()) return json({ error: 'Image uploads are not configured yet. Add GITHUB_TOKEN and GITHUB_REPO to Netlify.' }, 503)

  const slug = String(body.slug || '')
  if (!SLUG.test(slug)) return json({ error: 'Save a valid slug before uploading an image.' }, 422)
  const match = String(body.dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return json({ error: 'Invalid image data.' }, 422)
  if (!ALLOWED.has(match[1])) return json({ error: 'Use JPG, PNG, WebP, AVIF or GIF.' }, 422)

  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > MAX_BYTES) return json({ error: 'Image must be 3 MB or smaller.' }, 413)

  const original = String(body.filename || 'cover').replace(/\.[^.]+$/, '')
  const extension = match[1].split('/')[1].replace('jpeg', 'jpg')
  const safeName = `${original.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cover'}.${extension}`
  const path = `public/images/insights/${slug}/${safeName}`
  const result = await putFile(path, buffer, `Upload article image: ${safeName}`)
  await triggerBuild()
  return json({ ok: true, path: `/images/insights/${slug}/${safeName}`, commitUrl: result?.commitUrl || null })
}
