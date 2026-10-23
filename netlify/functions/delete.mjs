import { json, sameOrigin, verifyCredentials } from '../lib/auth.mjs'
import { deleteFile, getFile, githubConfigured, triggerBuild } from '../lib/github.mjs'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const attempts = new Map()

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!sameOrigin(request)) return json({ error: 'Invalid origin' }, 403)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request body' }, 400)
  }

  const ip = request.headers.get('x-nf-client-connection-ip') || 'unknown'
  const now = Date.now()
  const record = attempts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 }
  if (record.reset < now) { record.count = 0; record.reset = now + 15 * 60 * 1000 }
  if (record.count >= 10) return json({ error: 'Too many attempts. Try again later.' }, 429)

  const credentials = verifyCredentials(body.email, body.password)
  if (!credentials.ok) {
    record.count += 1
    attempts.set(ip, record)
    return json({ error: credentials.error }, 401)
  }

  const slug = String(body.slug || '')
  if (!SLUG.test(slug)) return json({ error: 'Invalid article slug.' }, 422)
  if (!githubConfigured()) return json({ error: 'Deleting is not configured yet. Add GITHUB_TOKEN and GITHUB_REPO to Netlify.' }, 503)

  const path = `src/content/articles/${slug}.md`
  const existing = await getFile(path)
  if (!existing) {
    return json({ ok: true, deleted: false, message: 'No published file found. The local draft can be removed.' })
  }

  const commitUrl = await deleteFile(path, `Delete article: ${slug}`)
  await triggerBuild()
  attempts.delete(ip)
  return json({
    ok: true,
    deleted: true,
    commitUrl,
    message: 'Article deleted from the repository. Netlify is rebuilding to remove the live page.',
  })
}
