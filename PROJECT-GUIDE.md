# RNS Shipping — Complete Project Guide

This is the single reference for the redesigned RNS Shipping website, the Insights article system and the private editorial portal.

---

## 1. What this project is

A React 18 + Vite marketing website for **RNS Shipping LLC**, a Dubai-based marine services company.

It contains:

- The public marketing site: Home, About, Services, Contact.
- Six service detail pages, including two new SEO pillars for **ship repair & maintenance** and **ship cleaning & tank cleaning**.
- A public **Insights** library at `/insights`.
- Five fully written SEO articles, including the demo article for **ship repairing companies in Dubai**.
- A private **Insights Studio** portal at `/portal` for writing, editing and publishing articles.
- Static prerendering for every public page, with title, description, canonical, Open Graph, Twitter cards and JSON-LD schema in the initial HTML.
- Generated `sitemap.xml` and `rss.xml`.
- Netlify Functions for login and Git-backed publishing. No database.
- WordPress migration redirects for the old indexed URLs.

Canonical domain: `https://rnsshipping.com`

---

## 2. Architecture

```text
Visitor / Google
      │
      ▼
Static HTML in dist/
  ├── /, /about, /services, /contact
  ├── /services/<slug>
  ├── /insights
  └── /insights/<slug>
      │
      │  React hydrates and handles navigation, motion, filters and forms
      ▼
Portal user
      │
      ▼
/portal  (lazy-loaded React chunk)
      │
      ▼
/api/login, /api/publish, /api/upload
      │
      ├── Local dev / local preview: Vite API plugin writes to src/content/articles/
      └── Production: Netlify Functions commit to GitHub
                        │
                        ▼
                  Netlify rebuild
                        │
                        ▼
                  New prerendered article
```

There is no SQL or NoSQL database. The content source of truth is the Markdown files in `src/content/articles/`. In production, the portal commits new articles and images to Git, and Netlify rebuilds automatically.

---

## 3. Tech stack

| Layer | Technology |
|---|---|
| UI | React 18, React Router 7 |
| Build | Vite 7 |
| Styling | Custom CSS + design tokens, Tailwind base/components |
| Animation | GSAP, Lenis, CSS transitions, IntersectionObserver |
| SEO | Custom `Seo` component + `scripts/prerender.mjs` |
| Content | Markdown files with JSON frontmatter |
| Portal | React, lazy-loaded route, private CSS chunk |
| API | Netlify Functions (production), Vite middleware (local) |
| Auth | Signed HttpOnly cookie, 8-hour session |
| Storage | Git repository, not a database |
| Hosting | Netlify (`netlify.toml`) |

---

## 4. Run the project

### Development

```sh
npm install
npm run dev
```

Open the URL shown in the terminal, usually:

```text
http://localhost:5173/
http://localhost:5173/portal
```

If port 5173 is busy, Vite prints the next port, for example `5174`.

The development server runs the portal API locally, so login and publishing work.

### Production preview

```sh
npm run build
npm run preview -- --port 4173
```

Open:

```text
http://localhost:4173/
http://localhost:4173/insights
http://localhost:4173/portal
```

The preview server also runs the portal API. Publishing in preview writes to `src/content/articles/`; run `npm run build` again to see the new page in the static preview.

### Build only

```sh
npm run build
```

This runs:

1. `node scripts/content.mjs` — validates articles and regenerates the metadata index.
2. `vite build` — builds the client bundles.
3. `node scripts/prerender.mjs` — writes static HTML for every route, the portal shell, sitemap and RSS.

### Regenerate the article index

```sh
npm run content
```

---

## 5. Important environment variables

### Local development

Create `.env.local` (already created locally and ignored by Git):

```env
PORTAL_EMAIL=info@rns-shipping.com
PORTAL_PASSWORD=your-local-password
SESSION_SECRET=a-long-random-string
GITHUB_TOKEN=
GITHUB_REPO=
GITHUB_BRANCH=main
NETLIFY_BUILD_HOOK=
```

`.env.example` documents the same variables without real secrets.

### Production on Netlify

Set these in **Site settings → Environment variables**:

| Variable | Required | Purpose |
|---|---|---|
| `PORTAL_EMAIL` | Yes | Portal login email |
| `PORTAL_PASSWORD` | Yes | Portal login password |
| `SESSION_SECRET` | Yes | Signs the session cookie |
| `GITHUB_TOKEN` | Yes for publishing | Fine-grained token with Contents read/write |
| `GITHUB_REPO` | Yes for publishing | `owner/repo` |
| `GITHUB_BRANCH` | No | Defaults to `main` |
| `NETLIFY_BUILD_HOOK` | Optional | Only needed if Git auto-deploy is not enabled |

Without these, login on Netlify returns a configuration error. On a plain static host with no functions, `/api/login` returns 404.

---

## 6. Complete URL map

### Public pages

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
| `/contact` | Contact |
| `/404` | Not found |

### Published articles

| URL | Article |
|---|---|
| `/insights/ship-repairing-companies-in-dubai` | Ship Repairing Companies in Dubai: How to Choose the Right Partner |
| `/insights/ship-cleaning-services-in-dubai` | Ship Cleaning Services in Dubai: What the Scope Actually Includes |
| `/insights/ship-tank-cleaning-jebel-ali-guide` | Ship Tank Cleaning at Jebel Ali: A Practical Guide for Ship Managers |
| `/insights/ship-repair-companies-in-uae` | Ship Repair Companies in UAE: How to Compare Providers |
| `/insights/emergency-ship-repair-in-dubai` | Emergency Ship Repair in Dubai: First Steps When a Vessel Breaks Down |

### Portal pages

| URL | Screen |
|---|---|
| `/portal` | Login |
| `/portal/dashboard` | Dashboard |
| `/portal/articles` | All articles |
| `/portal/articles/new` | New article |
| `/portal/articles/:slug/edit` | Edit article |
| `/portal/articles/:slug/preview` | Private draft preview |

### System URLs

| URL | Purpose |
|---|---|
| `/sitemap.xml` | Generated sitemap |
| `/rss.xml` | Generated RSS feed |
| `/robots.txt` | Crawl rules, portal disallowed |
| `/api/session` | Check login state |
| `/api/login` | Sign in |
| `/api/logout` | Sign out |
| `/api/articles` | List articles |
| `/api/publish` | Publish or update article |
| `/api/upload` | Upload cover image |
| `/api/delete` | Delete an article after email/password re-authorisation |

---

## 7. How the article system works

### Article source files

```text
src/content/articles/
├── emergency-ship-repair-in-dubai.md
├── ship-cleaning-services-in-dubai.md
├── ship-repair-companies-in-uae.md
├── ship-repairing-companies-in-dubai.md
└── ship-tank-cleaning-jebel-ali-guide.md
```

Each file starts with a JSON frontmatter block, followed by Markdown:

```md
---
{
  "title": "Article title",
  "slug": "lowercase-hyphenated-slug",
  "seoTitle": "SEO title",
  "description": "Meta description, 180 characters or fewer.",
  "excerpt": "Short summary for cards and the hero.",
  "cover": "/images/rns-ship-bow.webp",
  "coverAlt": "Descriptive alt text",
  "tags": ["Ship Repair Dubai", "Ship Maintenance Dubai"],
  "author": "RNS Shipping Editorial Team",
  "publishedAt": "2026-10-20",
  "updatedAt": "2026-10-20",
  "featured": true,
  "keywords": "ship repair Dubai, ship maintenance Dubai",
  "takeaways": ["One takeaway", "Another takeaway"],
  "faqs": [{ "q": "Question?", "a": "Answer." }]
}
---

## First section

Article body in Markdown.
```

### Content pipeline files

| File | Purpose |
|---|---|
| `scripts/content.mjs` | Reads all article files, validates them, writes the metadata index |
| `src/lib/articleParser.js` | Shared parsing, validation, reading time and serialization |
| `src/generated/articles-index.json` | Generated metadata used by the listing and related articles |
| `src/lib/articles.js` | Loads article metadata and code-split article bodies |
| `src/lib/markdown.jsx` | Small safe Markdown renderer used by article pages and preview |
| `scripts/prerender.mjs` | Generates static HTML, schema, sitemap, RSS and the portal shell |

Article bodies are code-split. The main bundle stays small because each article is loaded as its own chunk only when needed. The metadata index is small and used by `/insights`, Home and related articles.

### Add an article manually

1. Create a new `.md` file in `src/content/articles/`.
2. Copy the frontmatter format above.
3. Use a unique lowercase-hyphenated slug.
4. Add at least two tags and three FAQs.
5. Run `npm run content`.
6. Run `npm run build`.
7. The article appears at `/insights/<slug>` and in the sitemap.

---

## 8. How the portal works

### Login

Open `/portal` and sign in with the account configured in `.env.local` (local) or Netlify environment variables (production).

The password is checked on the server, not in the React bundle. Sessions use an HttpOnly, SameSite=Strict cookie and expire after 8 hours.

### Dashboard

Shows:

- Published article count.
- Draft count.
- Number of tags.
- Last update.
- Searchable article table.
- Links to edit and view live.
- Delete button on every article and draft.
- Deleting requires the portal email and password again before the server removes the article.

### Editor

Tabs:

- **Content** — title, slug, excerpt, tags, Markdown body, cover image, key takeaways, FAQs.
- **SEO** — SEO title, meta description, keywords, article settings, SERP preview, checklist.
- **Preview** — the article rendered with the public article styles.

Right sidebar:

- SEO readiness score.
- Passing and failing checks.
- Publish, save draft, view live, download JSON backup.

### Publish flow

1. Sign in at `/portal`.
2. Click **New article** or open an existing article.
3. Fill the title, slug, excerpt, body and cover image.
4. Complete the SEO tab.
5. Add at least three FAQs.
6. Check the SEO score.
7. Click **Publish**.

Local development/preview:

- The article is written to `src/content/articles/<slug>.md`.
- The metadata index is regenerated.
- In dev, Vite reloads the app.
- In preview, run `npm run build` again to see the page.

Production:

- The publish function commits the article to GitHub.
- Netlify rebuilds automatically.
- The page is live in about 60–90 seconds.
- The sitemap, RSS feed, internal links and schema update on build.

### Image upload

- The cover field accepts a path such as `/images/insights/<slug>/cover.webp`.
- You can upload JPG, PNG, WebP, AVIF or GIF up to 3 MB.
- Local dev/preview writes the image to `public/images/insights/<slug>/`.
- Production commits it to the same path in the repository.

### Delete an article

1. Click the trash icon on a dashboard row, article card, or in the editor sidebar.
2. A confirmation dialog shows the article title and a warning.
3. Enter the portal email and password.
4. Click **Authorise and delete**.
5. The server verifies the credentials, deletes `src/content/articles/<slug>.md`, and triggers a rebuild.
6. Local drafts for that article are removed from the browser.
7. In production, Netlify rebuilds and the public URL is removed.

Deleting a published article uses the same credentials as login, so it works even if the portal session has expired. The action cannot be undone.

### Slug rules

- Lowercase only.
- Hyphens, no spaces.
- Maximum 72 characters.
- Unique across articles.
- A published article's slug is locked to protect its indexed URL.

---

## 9. SEO system

Every public page includes:

- One `H1`.
- Unique `<title>`.
- Meta description.
- Canonical URL.
- `robots` meta.
- Open Graph tags.
- Twitter card tags.
- Keywords where appropriate.
- `Organization` JSON-LD.
- `BreadcrumbList` JSON-LD.
- Page-specific schema.

Article pages additionally include:

- `BlogPosting` schema.
- `FAQPage` schema when FAQs exist.
- Author, published date, modified date and reading time.
- `article:published_time`, `article:modified_time`, `article:author`, `article:section` and `article:tag`.
- Internal links to service pages.
- Related articles.
- Cover image in the sitemap.

Article hub additionally includes:

- `Blog` schema with all published posts.
- Featured article.
- Tag filtering.
- Latest content links.

Generated on build:

- `dist/sitemap.xml` with all public pages and articles.
- `dist/rss.xml` with the latest articles.
- `dist/robots.txt` with `/portal` and `/api/` disallowed.
- Static HTML for every article, with content already in the page source.

---

## 10. Portal SEO checklist

The editor checks these before publishing:

- SEO title is 40–65 characters.
- Meta description is 120–165 characters.
- Slug is clean and unique.
- At least 700 words.
- At least 3 H2 sections.
- At least 2 internal links.
- Cover alt text is descriptive.
- At least 2 tags.
- At least 3 FAQs.
- Excerpt is present.

A score of 100% means the article has the technical foundations. It does not guarantee rankings. Content quality, authority, internal links, local signals and time still matter.

---

## 11. Design system

Main tokens live in `src/styles/index.css`:

| Token | Value |
|---|---|
| `--navy-950` | `#14163a` |
| `--navy-900` | `#1a1c42` |
| `--navy-700` | `#262760` |
| `--accent` | `#6ec1e4` |
| `--accent-deep` | `#3d9dc4` |
| `--tint` | `#f2f5f7` |
| `--line` | `#e3e8ef` |
| `--ink` | `#212d45` |
| `--body` | `#4b4f58` |

Typography:

- Montserrat for headings and UI labels.
- Roboto for body copy.

Design files:

- `src/styles/index.css` — base design system and components.
- `src/styles/refinement.css` — responsive refinements.
- `src/styles/insights.css` — Insights hub and article pages.
- `src/styles/portal.css` — portal only, code-split.
- `src/styles/service-orbit.css` — Home service orbit.

The article hero presents the cover as a clear image card beside the article introduction. The image is not blurred, dimmed or covered by a full-bleed overlay: it renders at full opacity with no CSS filter. On mobile the image sits above the article title. The demo article uses `/images/rns-ship-bow.webp` as a bright, clearly visible cover.

---

## 12. WordPress migration

The old WordPress URLs are redirected in `netlify.toml` with 301s:

| Old URL | New URL |
|---|---|
| `/about/` | `/about` |
| `/services/` | `/services` |
| `/contact-us/` | `/contact` |
| `/marine-services/` | `/services` |
| `/ship-repair-maintenance-services/` | `/services/ship-repair-maintenance` |
| `/ship-marine-engineering-services/` | `/services/ship-repair-maintenance` |
| `/ship-marine-tank-cleaning-services/` | `/services/ship-cleaning` |
| `/ship-repair-companies-in-uae/` | `/insights/ship-repair-companies-in-uae` |
| `/best-ship-repairing-services-in-dubai-.../` | `/insights/ship-repairing-companies-in-dubai` |
| `/best-ship-repair-in-dubai-uae-.../` | `/insights/ship-repairing-companies-in-dubai` |
| `/ship-cleaning-service-in-dubai/` | `/insights/ship-cleaning-services-in-dubai` |
| `/ship-tank-cleaning-jebel-ali-guide/` | `/insights/ship-tank-cleaning-jebel-ali-guide` |
| `/cache/` | `/` |
| `/category/uncategorized/` | `/insights` |
| `/author/maziz/` | `/about` |
| `/sitemap_index.xml` | `/sitemap.xml` |
| `/feed/` | `/rss.xml` |

After deployment:

1. Open Google Search Console.
2. Submit `https://rnsshipping.com/sitemap.xml`.
3. Check the old URLs return 301.
4. Monitor 404s for the first 90 days.
5. Resubmit the sitemap in Bing Webmaster Tools.

---

## 13. Key files and folders

```text
src/
├── App.jsx                     Routes, lazy portal
├── main.jsx                    Hydration, global CSS
├── entry-server.jsx            SSR entry for prerender
├── components/
│   ├── Seo.jsx                 Metadata, Open Graph, JSON-LD
│   ├── ArticleCard.jsx         Insight card
│   ├── LatestInsights.jsx      Home teaser
│   ├── ShareButtons.jsx        LinkedIn, WhatsApp, copy link
│   ├── Navbar.jsx              Navigation
│   └── Footer.jsx              Footer
├── pages/
│   ├── Insights.jsx            /insights
│   ├── InsightDetail.jsx       /insights/:slug
│   ├── Home.jsx                Home
│   ├── Services.jsx            /services
│   ├── ServiceDetail.jsx       /services/:slug
│   └── Contact.jsx             /contact
├── portal/
│   ├── Portal.jsx              Auth gate + routes
│   ├── PortalLogin.jsx         Split-screen login
│   ├── PortalShell.jsx         Sidebar and top bar
│   ├── Dashboard.jsx           Dashboard
│   ├── Articles.jsx            Article library
│   ├── ArticleEditor.jsx       Editor + SEO panel
│   ├── ArticlePreview.jsx      Rendered preview
│   ├── PreviewArticle.jsx      Preview route
│   └── portalStore.js          Drafts, validation, API helpers
├── content/articles/           Markdown articles
├── generated/                  Generated article index
├── lib/
│   ├── articleParser.js        Parse, validate, serialize
│   ├── articles.js             Metadata, lazy article loading
│   ├── markdown.jsx            Safe Markdown renderer
│   └── articleContext.js       SSR article context
├── data/
│   ├── site.js                 Company, services, nav, testimonials
│   └── serviceGuides.js        Service page content
└── styles/
    ├── index.css
    ├── refinement.css
    ├── insights.css
    └── portal.css

scripts/
├── content.mjs                 Article index generator
├── prerender.mjs               Static HTML, sitemap, RSS, portal shell
└── vitePortalApi.mjs           Local login/publish/upload API

netlify/
├── functions/login.mjs
├── functions/logout.mjs
├── functions/session.mjs
├── functions/publish.mjs
├── functions/upload.mjs
└── lib/auth.mjs, github.mjs

netlify.toml                    Build, functions, redirects
.env.example                    Environment template
PORTAL.md                       Portal-specific reference
PROJECT-GUIDE.md                This file
```

---

## 14. Build output

After `npm run build`:

```text
dist/
├── index.html
├── about/index.html
├── services/index.html
├── services/<slug>/index.html
├── insights/index.html
├── insights/<slug>/index.html
├── portal/index.html
├── 404.html
├── sitemap.xml
├── rss.xml
├── robots.txt
└── assets/
    ├── index-*.js
    ├── index-*.css
    ├── Portal-*.js
    ├── Portal-*.css
    ├── article-slug-*.js
    └── anim-*.js
```

The portal JavaScript and CSS are separate chunks. Article bodies are separate chunks. They do not slow the initial public page load.

---

## 15. Deploy to Netlify

1. Push the repository to GitHub.
2. Create a Netlify site from the repository.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Add the environment variables from section 5.
6. Create a fine-grained GitHub token:
   - Repository access: this repository only.
   - Permissions: Contents → Read and write.
7. Add the token as `GITHUB_TOKEN`.
8. Add `GITHUB_REPO=owner/repo` and `GITHUB_BRANCH=main`.
9. Deploy.
10. Open `/portal` and sign in.
11. Submit `/sitemap.xml` in Google Search Console.
12. Check the old WordPress URLs return 301.

Netlify reads `netlify.toml` for the build, functions and redirects.

---

## 16. Testing

```sh
npm test                  # Smoke tests against the dev server
npm run test:responsive   # Responsive audit at multiple widths
npm run test:accessibility
npm run test:integration
```

The smoke tests currently cover:

- Mobile horizontal overflow.
- Menu escape and focus restoration.
- Experience counter.
- Service detail content.
- Schema cleanup after navigation.
- Noindex on unknown pages.

Manual checks performed:

- Build completes.
- Static article HTML contains title, canonical, schema and body.
- Sitemap and RSS include articles.
- Portal login works in dev and preview.
- New article creation and publishing work.
- Slug auto-generation and locking work.
- SEO checklist works.
- Mobile and desktop layouts have no horizontal overflow.

---

## 17. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `Request failed (404)` on login | Static preview or static host without the portal API | Use `npm run dev` or `npm run preview` locally, or deploy to Netlify with Functions |
| `Publishing is not configured yet` | Missing GitHub environment variables | Add `GITHUB_TOKEN` and `GITHUB_REPO` in Netlify |
| `Please sign in again` | Session expired or cookie missing | Sign in again |
| Image upload fails | File over 3 MB or wrong format | Use JPG, PNG, WebP, AVIF or GIF under 3 MB |
| New article not visible in preview | Preview serves the old static build | Run `npm run build` and reload preview |
| Article still visible after deletion in preview | Preview serves the old static build | Run `npm run build` and reload preview |
| Delete dialog rejects the password | Wrong portal credentials | Use the email/password from `.env.local` (local) or Netlify environment variables (production) |
| Article not visible after publishing on Netlify | Build still running or failed | Check the Netlify deploy log |
| Slug cannot be changed | Published article URL protection | Duplicate the article or keep the existing slug |
| Build fails on article | Invalid frontmatter JSON or missing required field | Read the error message and fix the `.md` file |
| Old WordPress URL 404s | Redirect missing | Add a 301 in `netlify.toml` |
| Portal appears in Google | `robots.txt` or meta missing | Confirm `/portal` has `noindex` and `Disallow: /portal` |

---

## 18. Security and limitations

- This is a single-admin portal. There is no multi-user role system.
- The password is checked in a serverless function, not in the React bundle.
- Sessions are signed and stored in an HttpOnly cookie.
- The GitHub token must stay in Netlify environment variables. Never commit it.
- `.env.local` is ignored by Git.
- Change the supplied password before public launch.
- A static host without serverless functions cannot run the portal API.
- Publishing is Git-backed, so each publish creates a commit and a Netlify build.
- No database is used.
- Google indexing is not instant. Publishing makes the URL live; search indexing can take hours to days.
- No one can guarantee top rankings. The technical and content foundations are in place; authority, local signals and content quality determine long-term positions.

---

## 19. What was added in this build

- Complete Insights article system with five published articles.
- Article hub with featured article, tag filters and related content.
- Article detail pages with reading progress, TOC, takeaways, FAQs, author box and share buttons.
- Two new SEO service pillars: ship repair & maintenance, ship cleaning & tank cleaning.
- Insights link in the main navigation and footer.
- Latest Insights section on the Home page.
- Private portal with login, dashboard, article library, editor, preview and SEO checklist.
- Delete button with email/password re-authorisation for every article and draft.
- Local Vite API and production Netlify Functions for login, publish and image upload.
- Git-backed publishing with no database.
- Static prerendering for articles, sitemap, RSS and portal shell.
- WordPress migration redirects.
- Updated SEO component with article metadata, keywords, FAQ schema and extra JSON-LD.
- Updated robots.txt and RSS discovery link.
- Responsive, mobile-first styling for the insights and portal experiences.

---

## 20. Quick reference

| Task | Command / file |
|---|---|
| Start development | `npm run dev` |
| Build | `npm run build` |
| Preview build | `npm run preview -- --port 4173` |
| Regenerate article index | `npm run content` |
| Add an article manually | `src/content/articles/<slug>.md` |
| Edit service content | `src/data/serviceGuides.js` |
| Add a service | `src/data/site.js` |
| Edit navigation | `src/data/site.js` → `navLinks` |
| Edit brand colours | `src/styles/index.css` → `:root` |
| Edit article styles | `src/styles/insights.css` |
| Edit portal styles | `src/styles/portal.css` |
| Portal URLs | `/portal`, `/portal/dashboard`, `/portal/articles/new` |
| Public article URL | `/insights/<slug>` |
| Sitemap | `/sitemap.xml` |
| RSS | `/rss.xml` |
| Redirects | `netlify.toml` |
| Production secrets | Netlify environment variables |
