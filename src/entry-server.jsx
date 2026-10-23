import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { SeoContext, renderHead } from './components/Seo'
import { ArticleDataContext } from './lib/articleContext'

export function render(url, options = {}) {
  const metadata = { current: null }
  const article = options.article || null
  const html = renderToString(
    <ArticleDataContext.Provider value={article}>
      <SeoContext.Provider value={metadata}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </SeoContext.Provider>
    </ArticleDataContext.Provider>
  )
  return { html, head: renderHead(metadata.current), article }
}
