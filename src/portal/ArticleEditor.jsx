import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PortalShell from './PortalShell'
import ArticlePreview from './ArticlePreview'
import DeleteArticleDialog from './DeleteArticleDialog'
import { Icon } from '../components/Icons'
import { articles, getArticleMeta, loadArticle } from '../lib/articles'
import { validateArticle } from '../lib/articleParser'
import {
  apiFetch,
  blankArticle,
  checkSeo,
  deleteDraft,
  downloadJson,
  draftFromPublished,
  getDraft,
  saveDraft,
  slugify,
  today,
} from './portalStore'

const publishedSlugs = articles.map(article => article.slug)

export default function ArticleEditor({ email, onLogout, notify }) {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('content')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState([])
  const [result, setResult] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [slugTouched, setSlugTouched] = useState(Boolean(slug))
  const bodyRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      if (!slug) {
        if (active) { setArticle(blankArticle()); setLoading(false) }
        return
      }
      const draft = getDraft(slug)
      if (draft) {
        if (active) { setArticle(draft); setLoading(false) }
        return
      }
      const meta = getArticleMeta(slug)
      if (!meta) { navigate('/portal/dashboard', { replace: true }); return }
      const full = await loadArticle(slug)
      if (active) {
        setArticle(full ? draftFromPublished(full) : null)
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [slug, navigate])

  useEffect(() => {
    if (!dirty) return
    const handler = event => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const seo = useMemo(() => article ? checkSeo(article, publishedSlugs) : null, [article])
  const words = useMemo(() => (article?.body || '').trim().split(/\s+/).filter(Boolean).length, [article?.body])
  const isPublished = Boolean(article?.originalSlug)
  const liveUrl = article?.originalSlug ? `https://rnsshipping.com/insights/${article.originalSlug}` : ''

  function update(field, value) {
    setArticle(prev => {
      if (!prev) return prev
      const next = { ...prev, [field]: value }
      if (field === 'title' && !prev.originalSlug && !slugTouched) next.slug = slugify(value)
      return next
    })
    setDirty(true)
    setResult(null)
  }

  function addTag() {
    const value = tagInput.trim().replace(/,+$/, '')
    if (!value) return
    if (article.tags.some(tag => tag.toLowerCase() === value.toLowerCase())) { setTagInput(''); return }
    update('tags', [...article.tags, value])
    setTagInput('')
  }

  function removeTag(tag) {
    update('tags', article.tags.filter(item => item !== tag))
  }

  function addFaq() {
    update('faqs', [...(article.faqs || []), { q: '', a: '' }])
  }

  function updateFaq(index, field, value) {
    const faqs = article.faqs.map((faq, faqIndex) => faqIndex === index ? { ...faq, [field]: value } : faq)
    update('faqs', faqs)
  }

  function removeFaq(index) {
    update('faqs', article.faqs.filter((_, faqIndex) => faqIndex !== index))
  }

  function addTakeaway() {
    update('takeaways', [...(article.takeaways || []), ''])
  }

  function updateTakeaway(index, value) {
    update('takeaways', article.takeaways.map((item, itemIndex) => itemIndex === index ? value : item))
  }

  function removeTakeaway(index) {
    update('takeaways', article.takeaways.filter((_, itemIndex) => itemIndex !== index))
  }

  function insertMarkdown(before, after = '', placeholder = '') {
    const element = bodyRef.current
    if (!element) return
    const start = element.selectionStart
    const end = element.selectionEnd
    const selected = article.body.slice(start, end) || placeholder
    const next = `${article.body.slice(0, start)}${before}${selected}${after}${article.body.slice(end)}`
    update('body', next)
    requestAnimationFrame(() => {
      element.focus()
      const position = start + before.length + selected.length
      element.setSelectionRange(position, position)
    })
  }

  function save() {
    if (!article) return
    if (!article.title.trim()) { setErrors(['Add a title before saving.']); return }
    const next = { ...article, slug: article.slug || slugify(article.title), updatedAt: today() }
    saveDraft(next)
    setArticle(next)
    setDirty(false)
    setErrors([])
    setSaving(true)
    setTimeout(() => setSaving(false), 700)
    notify('Draft saved on this device')
  }

  async function publish() {
    if (!article) return
    const next = { ...article, slug: article.slug || slugify(article.title), updatedAt: today() }
    const validation = validateArticle(next)
    if (validation.length) {
      setErrors(validation)
      setTab('seo')
      return
    }
    setErrors([])
    setPublishing(true)
    try {
      const response = await apiFetch('/api/publish', {
        method: 'POST',
        body: JSON.stringify({ article: next, originalSlug: next.originalSlug || '' }),
      })
      deleteDraft(next.slug)
      if (next.originalSlug && next.originalSlug !== next.slug) deleteDraft(next.originalSlug)
      setArticle({ ...next, status: 'published' })
      setDirty(false)
      setResult(response)
      notify(response.mode === 'local' ? 'Article saved. The dev site will refresh.' : response.mode === 'preview' ? 'Article saved. Run npm run build to see it in preview.' : 'Article published. Your site is rebuilding.')
    } catch (error) {
      const messages = error.data?.errors?.length ? error.data.errors : [error.message]
      if (error.status === 503) messages.push('You can use “Download JSON” and add the article to src/content/articles manually.')
      setErrors(messages)
    } finally {
      setPublishing(false)
    }
  }

  async function uploadImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErrors([])
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const response = await apiFetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ slug: article.slug || slugify(article.title), filename: file.name, dataUrl }),
      })
      update('cover', response.path)
      notify('Cover image uploaded')
    } catch (error) {
      setErrors([error.message])
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(result?.liveUrl || liveUrl)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function handleDeleted(result) {
    deleteDraft(article.slug)
    if (article.originalSlug) deleteDraft(article.originalSlug)
    notify(result?.message || 'Article deleted')
    navigate('/portal/dashboard', { replace: true })
  }

  if (loading || !article) {
    return <PortalShell email={email} onLogout={onLogout} eyebrow="Editor" title="Loading article"><div className="portal-loading-card">Loading editor…</div></PortalShell>
  }

  const displayTitle = article.title || 'New article'

  return (
    <PortalShell
      email={email}
      onLogout={onLogout}
      eyebrow={isPublished ? 'Edit published article' : 'New article'}
      title={displayTitle}
      actions={
        <>
          <button type="button" className="btn btn--ghost portal-save-btn" onClick={save} disabled={saving}>
            <Icon name="save" size={17} /> {saving ? 'Saved' : 'Save draft'}
          </button>
          <button type="button" className="btn btn--primary" onClick={publish} disabled={publishing}>
            {publishing ? 'Publishing…' : isPublished ? 'Publish update' : 'Publish article'}
          </button>
        </>
      }
    >
      {result ? (
        <div className="portal-success" role="status">
          <span className="portal-success__icon"><Icon name="check" size={20} /></span>
          <div>
            <h3>{result.mode === 'git' ? 'Article published' : 'Article saved to content'}</h3>
            <p>{result.mode === 'local' ? 'Your dev site will reload with the new article.' : result.mode === 'preview' ? 'Run npm run build, then reload the preview to see the new page.' : 'Netlify is rebuilding. The live page will update in about 60–90 seconds.'}</p>
            <div className="portal-success__actions">
              <a href={result.liveUrl || liveUrl} target="_blank" rel="noopener noreferrer" className="text-link"><Icon name="globe" size={16} /> Open article</a>
              <button type="button" className="text-link" onClick={copyLink}><Icon name={copied ? 'check' : 'link'} size={16} /> {copied ? 'Copied' : 'Copy link'}</button>
              <Link to="/portal/dashboard" className="text-link">Back to dashboard</Link>
            </div>
          </div>
        </div>
      ) : null}

      {errors.length ? (
        <div className="portal-alert portal-alert--error" role="alert">
          <strong>Please review the article</strong>
          <ul>{errors.map(error => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}

      {dirty ? <p className="portal-unsaved"><span /> Unsaved changes</p> : null}

      <div className="portal-editor">
        <div className="portal-editor__main">
          <section className="portal-card">
            <label className="portal-field portal-field--title">
              <span>Article title</span>
              <input value={article.title} onChange={event => update('title', event.target.value)} placeholder="Ship repairing companies in Dubai: how to choose" />
            </label>
            <div className="portal-grid-2">
              <label className="portal-field">
                <span>Slug</span>
                <input
                  value={article.slug}
                  onChange={event => { setSlugTouched(true); update('slug', slugify(event.target.value)) }}
                  placeholder="ship-repairing-companies-in-dubai"
                  disabled={isPublished}
                  aria-describedby="slug-help"
                />
                <small id="slug-help">{isPublished ? 'The slug of a published article is locked.' : `Live URL: /insights/${article.slug || 'your-slug'}`}</small>
              </label>
              <label className="portal-field">
                <span>Publish date</span>
                <input type="date" value={article.publishedAt} onChange={event => update('publishedAt', event.target.value)} />
              </label>
            </div>
            <label className="portal-field">
              <span>Excerpt <em>{article.excerpt.length}/240</em></span>
              <textarea rows="3" maxLength="240" value={article.excerpt} onChange={event => update('excerpt', event.target.value)} placeholder="A short summary used on cards and at the top of the article." />
            </label>
            <div className="portal-field">
              <span>Topics and tags</span>
              <div className="portal-tags">
                {article.tags.map(tag => (
                  <span key={tag} className="portal-tag">{tag}<button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}><Icon name="close" size={13} /></button></span>
                ))}
                <input
                  value={tagInput}
                  onChange={event => setTagInput(event.target.value)}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addTag() } }}
                  onBlur={addTag}
                  placeholder="Add a topic and press Enter"
                  aria-label="Add a tag"
                />
              </div>
            </div>
          </section>

          <div className="portal-tabs" role="tablist" aria-label="Editor sections">
            <button type="button" role="tab" aria-selected={tab === 'content'} className={tab === 'content' ? 'is-active' : ''} onClick={() => setTab('content')}>Content</button>
            <button type="button" role="tab" aria-selected={tab === 'seo'} className={tab === 'seo' ? 'is-active' : ''} onClick={() => setTab('seo')}>SEO</button>
            <button type="button" role="tab" aria-selected={tab === 'preview'} className={tab === 'preview' ? 'is-active' : ''} onClick={() => setTab('preview')}>Preview</button>
          </div>

          {tab === 'content' ? (
            <>
              <section className="portal-card">
                <div className="portal-card__head">
                  <div><h2>Article body</h2><p>{words} words · Markdown supported</p></div>
                </div>
                <div className="portal-toolbar" role="toolbar" aria-label="Markdown formatting">
                  <button type="button" onClick={() => insertMarkdown('## ', '', 'Section heading')}>H2</button>
                  <button type="button" onClick={() => insertMarkdown('### ', '', 'Subheading')}>H3</button>
                  <button type="button" onClick={() => insertMarkdown('**', '**', 'bold text')}><b>B</b></button>
                  <button type="button" onClick={() => insertMarkdown('*', '*', 'italic text')}><i>I</i></button>
                  <button type="button" onClick={() => insertMarkdown('[', '](https://)', 'link text')}><Icon name="link" size={16} /></button>
                  <button type="button" onClick={() => insertMarkdown('- ', '', 'List item')}>List</button>
                  <button type="button" onClick={() => insertMarkdown('> ', '', 'Quote')}>Quote</button>
                  <button type="button" onClick={() => insertMarkdown('![', '](/images/insights/)', 'Image description')}><Icon name="image" size={16} /></button>
                </div>
                <textarea
                  ref={bodyRef}
                  className="portal-body-input"
                  value={article.body}
                  onChange={event => update('body', event.target.value)}
                  placeholder={'Start writing…\n\n## Why Dubai is a practical repair location\n\nUse short paragraphs, clear headings and internal links to service pages.'}
                  rows="24"
                />
              </section>

              <section className="portal-card">
                <div className="portal-card__head">
                  <div><h2>Cover image</h2><p>Recommended 1600 × 900, WebP or JPG.</p></div>
                </div>
                <div className="portal-cover">
                  <div className="portal-cover__preview">
                    {article.cover ? <img src={article.cover} alt="" /> : <span><Icon name="image" size={28} /> No cover selected</span>}
                  </div>
                  <div className="portal-cover__fields">
                    <label className="portal-field">
                      <span>Image path or URL</span>
                      <input value={article.cover} onChange={event => update('cover', event.target.value)} placeholder="/images/insights/article/cover.webp" />
                    </label>
                    <label className="portal-field">
                      <span>Alt text</span>
                      <input value={article.coverAlt} onChange={event => update('coverAlt', event.target.value)} placeholder="Engineer inspecting a ship engine room" />
                    </label>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" onChange={uploadImage} hidden />
                    <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      <Icon name="image" size={17} /> {uploading ? 'Uploading…' : 'Upload image'}
                    </button>
                  </div>
                </div>
              </section>

              <section className="portal-card">
                <div className="portal-card__head">
                  <div><h2>Key takeaways</h2><p>Shown in a highlight box at the top of the article.</p></div>
                  <button type="button" className="portal-add" onClick={addTakeaway}><Icon name="plus" size={15} /> Add point</button>
                </div>
                <div className="portal-repeater">
                  {(article.takeaways || []).map((item, index) => (
                    <div className="portal-repeater__row" key={index}>
                      <input value={item} onChange={event => updateTakeaway(index, event.target.value)} placeholder="A practical takeaway" />
                      <button type="button" onClick={() => removeTakeaway(index)} aria-label="Remove takeaway"><Icon name="trash" size={16} /></button>
                    </div>
                  ))}
                  {!article.takeaways?.length ? <p className="portal-muted">No takeaways yet.</p> : null}
                </div>
              </section>

              <section className="portal-card">
                <div className="portal-card__head">
                  <div><h2>FAQs</h2><p>Each completed FAQ is added to Google&apos;s FAQ schema.</p></div>
                  <button type="button" className="portal-add" onClick={addFaq}><Icon name="plus" size={15} /> Add FAQ</button>
                </div>
                <div className="portal-repeater">
                  {(article.faqs || []).map((faq, index) => (
                    <div className="portal-faq" key={index}>
                      <div className="portal-faq__head"><span>FAQ {index + 1}</span><button type="button" onClick={() => removeFaq(index)} aria-label="Remove FAQ"><Icon name="trash" size={16} /></button></div>
                      <input value={faq.q} onChange={event => updateFaq(index, 'q', event.target.value)} placeholder="Question" />
                      <textarea rows="2" value={faq.a} onChange={event => updateFaq(index, 'a', event.target.value)} placeholder="Answer" />
                    </div>
                  ))}
                  {!article.faqs?.length ? <p className="portal-muted">No FAQs yet. Add at least three for the best schema coverage.</p> : null}
                </div>
              </section>
            </>
          ) : null}

          {tab === 'seo' ? (
            <>
              <section className="portal-card">
                <div className="portal-card__head"><div><h2>Search appearance</h2><p>This is what the page can look like in Google results.</p></div></div>
                <div className="serp-preview">
                  <span>https://rnsshipping.com › insights › {article.slug || 'your-slug'}</span>
                  <h3>{article.seoTitle || article.title || 'Article title'}</h3>
                  <p>{article.description || 'Add a meta description to control how this article appears in search results.'}</p>
                </div>
                <label className="portal-field">
                  <span>SEO title <em>{String(article.seoTitle || article.title).length}/65</em></span>
                  <input value={article.seoTitle} onChange={event => update('seoTitle', event.target.value)} placeholder={article.title || 'SEO title'} />
                </label>
                <label className="portal-field">
                  <span>Meta description <em>{article.description.length}/180</em></span>
                  <textarea rows="3" value={article.description} onChange={event => update('description', event.target.value)} placeholder="How to choose a ship repairing company in Dubai: services, response times, compliance and the questions to ask." />
                </label>
                <label className="portal-field">
                  <span>Keywords</span>
                  <input value={article.keywords} onChange={event => update('keywords', event.target.value)} placeholder="ship repair Dubai, ship maintenance Dubai, vessel repair" />
                </label>
              </section>

              <section className="portal-card">
                <div className="portal-card__head"><div><h2>Article settings</h2><p>Author, dates and feature placement.</p></div></div>
                <div className="portal-grid-2">
                  <label className="portal-field">
                    <span>Author</span>
                    <input value={article.author} onChange={event => update('author', event.target.value)} />
                  </label>
                  <label className="portal-field">
                    <span>Last updated</span>
                    <input type="date" value={article.updatedAt} onChange={event => update('updatedAt', event.target.value)} />
                  </label>
                </div>
                <label className="portal-check">
                  <input type="checkbox" checked={article.featured} onChange={event => update('featured', event.target.checked)} />
                  <span>Feature this article at the top of /insights</span>
                </label>
              </section>

              <section className="portal-card">
                <div className="portal-card__head"><div><h2>SEO checklist</h2><p>{seo.passed} of {seo.total} checks passing</p></div><span className={`portal-score ${seo.score >= 80 ? 'is-good' : seo.score >= 50 ? 'is-ok' : 'is-low'}`}>{seo.score}%</span></div>
                <ul className="portal-checklist">
                  {seo.items.map(item => (
                    <li key={item.label} className={item.ok ? 'is-pass' : 'is-fail'}>
                      <Icon name={item.ok ? 'check' : 'close'} size={15} />
                      <span>{item.label}<small>{item.hint}</small></span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : null}

          {tab === 'preview' ? (
            <section className="portal-card portal-card--preview">
              <div className="portal-card__head"><div><h2>Live preview</h2><p>This uses the exact typography and article styles used on the public site.</p></div><button type="button" className="portal-add" onClick={() => setTab('content')}><Icon name="edit" size={15} /> Edit content</button></div>
              <ArticlePreview article={article} />
            </section>
          ) : null}
        </div>

        <aside className="portal-editor__aside">
          <section className="portal-publish-card">
            <span className="portal-publish-card__eyebrow">{isPublished ? 'Published article' : 'New article'}</span>
            <h2>{isPublished ? 'Publish an update' : 'Ready to publish?'}</h2>
            <p>{isPublished ? 'Changes are saved as a draft until you publish the update.' : 'The article will be committed to the site and rebuilt in about 60–90 seconds.'}</p>
            <div className="portal-publish-card__score">
              <span className={`portal-score ${seo.score >= 80 ? 'is-good' : seo.score >= 50 ? 'is-ok' : 'is-low'}`}>{seo.score}%</span>
              <span>SEO readiness<br /><small>{seo.passed}/{seo.total} checks</small></span>
            </div>
            <ul className="portal-checklist portal-checklist--compact">
              {seo.items.slice(0, 5).map(item => (
                <li key={item.label} className={item.ok ? 'is-pass' : 'is-fail'}><Icon name={item.ok ? 'check' : 'close'} size={14} /><span>{item.label}</span></li>
              ))}
            </ul>
            <button type="button" className="btn btn--primary portal-publish" onClick={publish} disabled={publishing}>{publishing ? 'Publishing…' : isPublished ? 'Publish update' : 'Publish article'}</button>
            <button type="button" className="btn btn--ghost portal-publish" onClick={save} disabled={saving}><Icon name="save" size={16} /> Save draft</button>
            {isPublished ? <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="portal-view-live"><Icon name="eye" size={16} /> View live article</a> : null}
            <button type="button" className="portal-download" onClick={() => downloadJson(`${article.slug || 'article'}.json`, article)}><Icon name="save" size={15} /> Download JSON backup</button>
            <button type="button" className="portal-download portal-download--danger" onClick={() => setDeleteOpen(true)}><Icon name="trash" size={15} /> Delete article</button>
          </section>

          <section className="portal-publish-card portal-publish-card--help">
            <span className="portal-publish-card__eyebrow">Writing for search</span>
            <ul className="portal-help-list">
              <li>Lead with the answer in the first 100 words.</li>
              <li>Use one H2 per major question.</li>
              <li>Link to the relevant service page twice.</li>
              <li>Add real photos and descriptive alt text.</li>
              <li>Finish with 5 practical FAQs.</li>
            </ul>
          </section>
        </aside>
      </div>

      {deleteOpen ? (
        <DeleteArticleDialog
          article={{ ...article, isPublished }}
          onClose={() => setDeleteOpen(false)}
          onDeleted={handleDeleted}
        />
      ) : null}
    </PortalShell>
  )
}
