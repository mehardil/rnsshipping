# Verification notes

## Scope
Eight routes: Home, About, Services, Contact and four service guides. Original company copy and palette retained, with additional service guidance and clearer functional states.

## Checks
- Production build and static HTML generation completed.
- Responsive audit: 48 route/viewport combinations at 320, 390, 768, 1024, 1440 and 1920 px.
- Integration suite: Chrome, Firefox and WebKit at 320, 768 and 1440 px, plus mobile menu focus/Escape, enquiry validation and email draft encoding, service preselection, service anchors, landscape and reduced motion.
- All eight routes expose readable content without JavaScript.
- Axe-core: no reported violations on the eight checked routes (WCAG A/AA and best-practice rules).
- All referenced local image files exist. Static pages have one title and one description.
- Dependency audit: zero reported vulnerabilities. `git diff --check` passed.

## Lighthouse mobile lab result
Performance 82, accessibility 100, best practices 100, SEO 100. Initial performance was 71. Final measured FCP 1.9 s, LCP 4.2 s, total blocking time 180 ms, and cumulative layout shift 0. These are local simulated-mobile measurements, not field Core Web Vitals or a guarantee of rankings. Mobile LCP still has room to improve on the deployed host. JSON reports are in `artifacts/`; the Lighthouse CLI completed the report but encountered a Windows temporary-profile cleanup permission error afterward.

## Deployment and contact boundary
The site is built locally, not deployed. The static host must serve each generated route and return a real HTTP 404 for unknown URLs; see README.md. Enquiries prepare an email draft for the visitor to review and send. No backend delivery service was provided or configured.

## Evidence
Machine-readable reports and screenshots are in `artifacts/` (gitignored). Asset credits and font licenses are documented in ASSET-SOURCES.md and public/fonts/.
