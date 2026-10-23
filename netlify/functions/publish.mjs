import { json, sameOrigin, sessionTokenFromHeader, verifySession } from '../lib/auth.mjs'
import { getFile, githubConfigured, putFile, triggerBuild } from '../lib/github.mjs'
import { serializeArticle, validateArticle } from '../../src/lib/articleParser.js'

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

  if (!githubConfigured()) return json({ error: 'Publishing is not configured yet. Add GITHUB_TOKEN and GITHUB_REPO to Netlify.' }, 503)

  const article = body.article
  const originalSlug = body.originalSlug || ''
  const errors = validateArticle(article)
  if (errors.length) return json({ error: 'Please fix the article fields.', errors }, 422)

  if (originalSlug && originalSlug !== article.slug) {
    return json({ error: 'The slug of a published article cannot be changed. Duplicate the article to create a new URL.' }, 422)
  }

  if (!originalSlug) {
    const existing = await getFile(`src/content/articles/${article.slug}.md`)
    if (existing) return json({ error: 'That slug is already used by another article.' }, 409)
  }

  const file = `src/content/articles/${article.slug}.md`
  const content = serializeArticle(article)
  const action = originalSlug ? 'Update' : 'Publish'
  const result = await putFile(file, content, `${action} article: ${article.title}`)
  const buildTriggered = await triggerBuild()
  return json({
    ok: true,
    mode: 'git',
    liveUrl: `https://rnsshipping.com/insights/${article.slug}`,
    commitUrl: result?.commitUrl || null,
    buildTriggered,
  })
}
