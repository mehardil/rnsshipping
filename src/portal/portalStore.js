const DRAFT_KEY = 'rns.portal.drafts.v1'

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function blankArticle() {
  return {
    title: '',
    slug: '',
    seoTitle: '',
    description: '',
    excerpt: '',
    body: '',
    cover: '/images/marine-engine-room.webp',
    coverAlt: '',
    tags: [],
    author: 'RNS Shipping Editorial Team',
    publishedAt: today(),
    updatedAt: today(),
    featured: false,
    keywords: '',
    takeaways: [],
    faqs: [],
    status: 'draft',
    originalSlug: '',
    updatedAtLocal: new Date().toISOString(),
  }
}

export function loadDrafts() {
  if (typeof localStorage === 'undefined') return []
  try {
    const value = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}')
    return Object.values(value).sort((a, b) => new Date(b.updatedAtLocal || 0) - new Date(a.updatedAtLocal || 0))
  } catch {
    return []
  }
}

export function getDraft(slug) {
  return loadDrafts().find(draft => draft.slug === slug || draft.originalSlug === slug) || null
}

export function saveDraft(article) {
  const drafts = Object.fromEntries(loadDrafts().map(draft => [draft.slug, draft]))
  const next = { ...article, status: 'draft', updatedAtLocal: new Date().toISOString() }
  drafts[next.slug] = next
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
  return next
}

export function deleteDraft(slug) {
  const drafts = Object.fromEntries(loadDrafts().map(draft => [draft.slug, draft]))
  delete drafts[slug]
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
}

export function draftFromPublished(article) {
  return {
    ...article,
    originalSlug: article.slug,
    status: 'draft',
    updatedAt: today(),
    updatedAtLocal: new Date().toISOString(),
  }
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  let data = null
  try { data = await response.json() } catch { data = null }
  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (${response.status})`)
    error.data = data
    error.status = response.status
    throw error
  }
  return data
}

export function checkSeo(article, publishedSlugs = []) {
  const title = String(article.seoTitle || article.title || '')
  const description = String(article.description || '')
  const body = String(article.body || '')
  const words = body.trim().split(/\s+/).filter(Boolean).length
  const internalLinks = (body.match(/\]\(\/(?!\/)/g) || []).length
  const headings = (body.match(/^##\s+/gm) || []).length
  const items = [
    { label: 'Title is 40–65 characters', ok: title.length >= 40 && title.length <= 65, hint: `${title.length} characters` },
    { label: 'Meta description is 120–165 characters', ok: description.length >= 120 && description.length <= 165, hint: `${description.length} characters` },
    { label: 'Slug is clean and unique', ok: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) && (!publishedSlugs.includes(article.slug) || article.originalSlug === article.slug), hint: article.slug || 'Add a slug' },
    { label: 'At least 700 words', ok: words >= 700, hint: `${words} words` },
    { label: 'At least 3 main sections', ok: headings >= 3, hint: `${headings} H2 sections` },
    { label: 'At least 2 internal links', ok: internalLinks >= 2, hint: `${internalLinks} internal links` },
    { label: 'Cover alt text is descriptive', ok: String(article.coverAlt || '').length >= 20, hint: `${String(article.coverAlt || '').length} characters` },
    { label: 'At least 2 topic tags', ok: Array.isArray(article.tags) && article.tags.length >= 2, hint: `${article.tags?.length || 0} tags` },
    { label: 'At least 3 FAQs for FAQ schema', ok: Array.isArray(article.faqs) && article.faqs.filter(faq => faq.q && faq.a).length >= 3, hint: `${article.faqs?.filter(faq => faq.q && faq.a).length || 0} FAQs` },
    { label: 'Excerpt is present', ok: String(article.excerpt || '').length >= 60, hint: `${String(article.excerpt || '').length} characters` },
  ]
  const passed = items.filter(item => item.ok).length
  return { items, passed, total: items.length, score: Math.round((passed / items.length) * 100) }
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
