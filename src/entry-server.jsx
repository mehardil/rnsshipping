import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { SeoContext, renderHead } from './components/Seo'

export function render(url) {
  const metadata = { current: null }
  const html = renderToString(<SeoContext.Provider value={metadata}><StaticRouter location={url}><App /></StaticRouter></SeoContext.Provider>)
  return { html, head: renderHead(metadata.current) }
}
