# RNS Insights Studio

Private editorial portal for publishing SEO articles at `/insights`.

## Local development

```sh
npm run dev
```

Open `http://localhost:5173/portal`.

The Vite development server runs the portal API locally and writes published articles to
`src/content/articles/`.

## Local production preview

```sh
npm run build
npm run preview -- --port 4173
```

Open `http://localhost:4173/portal`.

The preview server also runs the portal API. Publishing in preview writes to
`src/content/articles/`; run `npm run build` again to see the new page in the static preview.

## Production on Netlify

Set these environment variables in Netlify:

| Variable | Purpose |
|---|---|
| `PORTAL_EMAIL` | Portal login email |
| `PORTAL_PASSWORD` | Portal login password |
| `SESSION_SECRET` | Long random string used to sign sessions |
| `GITHUB_TOKEN` | Fine-grained GitHub token with Contents read/write |
| `GITHUB_REPO` | Repository in `owner/repo` format |
| `GITHUB_BRANCH` | Branch to publish to, usually `main` |
| `NETLIFY_BUILD_HOOK` | Optional build hook if auto-deploy is not enabled |

Netlify functions handle `/api/*`. A static host without functions will return 404 for login
and publishing. This is the cause of "Request failed (404)" on a plain static deployment.

## Public URLs

| URL | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/services` | Services hub |
| `/services/ship-repair-maintenance` | Ship repair & maintenance |
| `/services/ship-cleaning` | Ship cleaning & tank cleaning |
| `/services/technical-services` | Technical servicing |
| `/services/ship-chandelling` | Ship chandelling |
| `/services/spare-parts-logistics` | Spare parts & logistics |
| `/services/marine-automation` | Marine automation |
| `/insights` | Article hub |
| `/insights/ship-repairing-companies-in-dubai` | Ship repairing companies in Dubai |
| `/insights/ship-cleaning-services-in-dubai` | Ship cleaning services in Dubai |
| `/insights/ship-tank-cleaning-jebel-ali-guide` | Tank cleaning at Jebel Ali |
| `/insights/ship-repair-companies-in-uae` | Ship repair companies in UAE |
| `/insights/emergency-ship-repair-in-dubai` | Emergency ship repair in Dubai |
| `/contact` | Contact |
| `/404` | Not found |
| `/sitemap.xml` | Generated sitemap |
| `/rss.xml` | Generated article feed |
| `/robots.txt` | Crawl rules |

## Portal URLs

| URL | Screen |
|---|---|
| `/portal` | Login |
| `/portal/dashboard` | Dashboard |
| `/portal/articles` | All articles |
| `/portal/articles/new` | New article |
| `/portal/articles/:slug/edit` | Edit article |
| `/portal/articles/:slug/preview` | Private preview |

## API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/session` | GET | Check the current session |
| `/api/login` | POST | Sign in |
| `/api/logout` | POST | Sign out |
| `/api/articles` | GET | List articles |
| `/api/publish` | POST | Publish or update an article |
| `/api/upload` | POST | Upload a cover image |
| `/api/delete` | POST | Delete an article after email/password re-authorisation |

## Publishing flow

1. Sign in at `/portal`.
2. Create a new article or open an existing one.
3. Add the title, slug, excerpt, cover image and body.
4. Complete the SEO tab: SEO title, meta description, keywords and tags.
5. Add at least three FAQs for FAQ schema.
6. Check the SEO readiness score in the right sidebar.
7. Save a draft or publish.
8. In production, the article is committed to GitHub and Netlify rebuilds the static page.
9. The public URL is available immediately after the build completes, usually in 60–90 seconds.

## Delete an article

Use the trash icon in the dashboard, article library, or editor sidebar. The dialog asks for the
portal email and password again. On success the server deletes the article Markdown file and, in
production, triggers a Netlify rebuild so the public URL is removed. Local drafts for that article
are removed from the browser.

## Article source format

Each article is a Markdown file in `src/content/articles/` with a JSON frontmatter block:

```md
---
{
  "title": "...",
  "slug": "lowercase-hyphenated",
  "description": "...",
  "excerpt": "...",
  "cover": "/images/insights/...",
  "coverAlt": "...",
  "tags": ["..."],
  "author": "RNS Shipping Editorial Team",
  "publishedAt": "2026-10-20",
  "updatedAt": "2026-10-20",
  "featured": true,
  "faqs": [{ "q": "...", "a": "..." }]
}
---
Markdown body...
```

`npm run content` regenerates `src/generated/articles-index.json`.

## SEO output

Every public article is prerendered with:

- One H1 and semantic headings
- Unique title, description and canonical
- Open Graph and Twitter metadata
- `BlogPosting`, `FAQPage`, `BreadcrumbList` and `Organization` JSON-LD
- Sitemap and RSS entries
- Internal links to relevant service pages
- Code-split article bodies to keep the main bundle small

## Security notes

- Portal credentials are checked on the server, not in the React bundle.
- Sessions use an HttpOnly, SameSite=Strict cookie and expire after 8 hours.
- Change the supplied password before public launch.
- The GitHub token must be fine-grained and limited to this repository's contents.
- Never commit `.env.local` or real secrets.
