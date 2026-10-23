import { createContext } from 'react'

export const ArticleDataContext = createContext(null)

export function readEmbeddedArticle() {
  if (typeof document === 'undefined') return null
  const node = document.getElementById('article-data')
  if (!node) return null
  try {
    return JSON.parse(node.textContent || 'null')
  } catch {
    return null
  }
}
