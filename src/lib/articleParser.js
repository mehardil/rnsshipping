const REQUIRED = ['title', 'slug', 'description', 'excerpt', 'cover', 'coverAlt', 'author', 'publishedAt']
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function wordCount(markdown) {
  const text = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|~-]/g, ' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function readingTime(markdown) {
  return Math.max(1, Math.ceil(wordCount(markdown) / 220))
}

export function parseArticle(source, file = '') {
  const text = String(source).replace(/^\uFEFF/, '')
  if (!text.startsWith('---')) throw new Error(`${file}: missing JSON frontmatter block`)
  const end = text.indexOf('\n---', 3)
  if (end === -1) throw new Error(`${file}: frontmatter is not closed`)
  let meta
  try {
    meta = JSON.parse(text.slice(3, end).trim())
  } catch (error) {
    throw new Error(`${file}: invalid JSON frontmatter — ${error.message}`)
  }
  const body = text.slice(end + 4).replace(/^\r?\n/, '').trim()
  for (const key of REQUIRED) {
    if (!meta[key]) throw new Error(`${file}: missing required field "${key}"`)
  }
  if (!SLUG_PATTERN.test(meta.slug)) throw new Error(`${file}: slug must be lowercase-hyphenated`)
  if (meta.description.length > 180) throw new Error(`${file}: description is longer than 180 characters`)
  if (!Array.isArray(meta.tags)) meta.tags = []
  if (!Array.isArray(meta.faqs)) meta.faqs = []
  if (!Array.isArray(meta.takeaways)) meta.takeaways = []
  meta.featured = Boolean(meta.featured)
  meta.updatedAt = meta.updatedAt || meta.publishedAt
  meta.keywords = meta.keywords || [meta.title, ...meta.tags].join(', ')
  meta.seoTitle = meta.seoTitle || meta.title
  return {
    ...meta,
    body,
    file,
    readingTime: readingTime(body),
    wordCount: wordCount(body),
  }
}

export function validateArticle(article) {
  const errors = []
  if (!String(article?.title || '').trim()) errors.push('Title is required')
  if (!SLUG_PATTERN.test(String(article?.slug || ''))) errors.push('Slug must be lowercase, hyphenated and contain only letters and numbers')
  if (!String(article?.description || '').trim()) errors.push('Meta description is required')
  if (String(article?.description || '').length > 180) errors.push('Meta description must be 180 characters or fewer')
  if (!String(article?.excerpt || '').trim()) errors.push('Excerpt is required')
  if (!String(article?.body || '').trim()) errors.push('Article body is required')
  if (!String(article?.cover || '').trim()) errors.push('Cover image is required')
  if (!String(article?.coverAlt || '').trim()) errors.push('Cover image alt text is required')
  if (!String(article?.author || '').trim()) errors.push('Author is required')
  if (!String(article?.publishedAt || '').trim()) errors.push('Publish date is required')
  if (!Array.isArray(article?.tags) || !article.tags.length) errors.push('Add at least one tag')
  return errors
}

export function serializeArticle(article) {
  const meta = {
    title: article.title,
    slug: article.slug,
    seoTitle: article.seoTitle || article.title,
    description: article.description,
    excerpt: article.excerpt,
    cover: article.cover,
    coverAlt: article.coverAlt,
    tags: article.tags,
    author: article.author,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt || article.publishedAt,
    featured: Boolean(article.featured),
    keywords: article.keywords || '',
    takeaways: article.takeaways || [],
    faqs: article.faqs || [],
  }
  return `---\n${JSON.stringify(meta, null, 2)}\n---\n\n${String(article.body).trim()}\n`
}

export function publicMeta(article) {
  return {
    slug: article.slug,
    title: article.title,
    seoTitle: article.seoTitle,
    description: article.description,
    excerpt: article.excerpt,
    cover: article.cover,
    coverAlt: article.coverAlt,
    tags: article.tags,
    author: article.author,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    featured: article.featured,
    keywords: article.keywords,
    readingTime: article.readingTime,
    wordCount: article.wordCount,
    faqCount: article.faqs.length,
    file: article.file,
  }
}
