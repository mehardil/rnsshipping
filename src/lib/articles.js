import index from '../generated/articles-index.json'
import { parseArticle } from './articleParser'

const sources = import.meta.glob('../content/articles/*.md', { query: '?raw', import: 'default' })
const loaders = Object.fromEntries(
  Object.entries(sources).map(([file, load]) => [file.split('/').pop().replace(/\.md$/, ''), load])
)
const cache = new Map()

export const articles = index

export function getArticleMeta(slug) {
  return index.find(article => article.slug === slug) || null
}

export async function loadArticle(slug) {
  if (cache.has(slug)) return cache.get(slug)
  const load = loaders[slug]
  if (!load) return null
  const source = await load()
  const article = parseArticle(source, `${slug}.md`)
  cache.set(slug, article)
  return article
}

export function getAllTags() {
  const counts = new Map()
  index.forEach(article => article.tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)))
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export function relatedArticles(article, limit = 3) {
  if (!article) return index.slice(0, limit)
  const tags = new Set(article.tags || [])
  return index
    .filter(item => item.slug !== article.slug)
    .map(item => ({ item, score: item.tags.filter(tag => tags.has(tag)).length }))
    .sort((a, b) => b.score - a.score || new Date(b.item.publishedAt) - new Date(a.item.publishedAt))
    .slice(0, limit)
    .map(entry => entry.item)
}

export function formatDate(value, options = {}) {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
    ...options,
  }).format(date)
}

export function articleHref(article) {
  return `/insights/${article.slug}`
}
