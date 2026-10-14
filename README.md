# RNS Shipping

A responsive marine services website, preserving the established navy/cyan palette and original company content.

## Run locally

Use Node.js 22.12+ (tested with Node.js 24) and an installed Google Chrome browser for tests.

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The build generates static HTML for Home, About, Services, Contact and four individual service guides. Every route includes its content, title, description, canonical, social metadata and structured data before JavaScript runs. React hydrates these pages for interactive navigation and motion. Both `route.html` and `route/index.html` are generated for clean-URL hosts. The canonical domain is `https://rnsshipping.com`.

Deploy the contents of `dist/` to a static host. Serve each route's own generated HTML; do not rewrite all known routes to the home page. Configure unknown URLs to return `404.html` with HTTP status 404. For Nginx, use `try_files $uri $uri.html $uri/ =404;` with `error_page 404 /404.html;`. The local Vite preview is not a production host and uses an SPA fallback for unknown paths. Submit `/sitemap.xml` in the verified Search Console property after deployment. Live indexing, ranking, field performance and host response headers are not verified by local tests.

## Contact enquiries

The contact form validates details and prepares a `mailto:` draft addressed to `info@rnsshipping.com`. Visitors review and send from their own email app. It does not claim delivery, store messages or contact a third-party form service. Direct telephone and email links remain available. An email/backend service can replace this handoff once one is supplied.

## Verification

With the production preview running on port 4173:

```sh
npx playwright install firefox webkit
npm run test:responsive
npm run test:accessibility
npm run test:integration
```

`npm test` runs focused regressions against the development server on port 5173. Set `BASE_URL` to use a different server for smoke and integration tests. Responsive checks cover eight pages at 320, 390, 768, 1024, 1440 and 1920 pixels. Cross-browser checks use Chrome, Firefox and WebKit, covering navigation, form handoff, deep links, landscape, reduced motion and static content without JavaScript. Accessibility checks use axe-core. Browser engines and emulated viewports are not a substitute for testing every physical device.

Screenshots and machine-readable reports are written to `artifacts/`. The image sources and licensing notes are in [ASSET-SOURCES.md](ASSET-SOURCES.md). Existing company claims, testimonials and certifications have been retained as requested; new guide content explains the existing service scope and how to make a useful enquiry.

## Content and styling

- `src/data/site.js`: supplied company details, service scope, testimonials and FAQs.
- `src/data/serviceGuides.js`: additional service-specific guidance and enquiry checklists.
- `src/styles/refinement.css`: responsive visual refinements using existing palette tokens.
- `src/components/Layout.jsx`: coordinated scroll motion and user motion controls.
- `src/components/Seo.jsx` and `scripts/prerender.mjs`: rendered and static SEO metadata.
