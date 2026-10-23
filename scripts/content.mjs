import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArticle, publicMeta } from '../src/lib/articleParser.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const ARTICLES_DIR = path.join(root, 'src/content/articles')
export const GENERATED_INDEX = path.join(root, 'src/generated/articles-index.json')

export async function loadArticles() {
  let files
  try {
    files = (await readdir(ARTICLES_DIR)).filter(file => file.endsWith('.md'))
  } catch {
    return []
  }
  const articles = []
  const slugs = new Set()
  for (const file of files.sort()) {
    const source = await readFile(path.join(ARTICLES_DIR, file), 'utf8')
    const article = parseArticle(source, file)
    if (slugs.has(article.slug)) throw new Error(`Duplicate article slug: ${article.slug}`)
    slugs.add(article.slug)
    articles.push(article)
  }
  return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt) || a.title.localeCompare(b.title))
}

export async function writeIndex() {
  const articles = await loadArticles()
  await mkdir(path.dirname(GENERATED_INDEX), { recursive: true })
  await writeFile(GENERATED_INDEX, `${JSON.stringify(articles.map(publicMeta), null, 2)}\n`)
  return articles
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const articles = await writeIndex()
  console.log(`Indexed ${articles.length} article${articles.length === 1 ? '' : 's'}`)
}
