> **État au 12 octobre 2026** — Le rapport ci-dessous décrit un audit historique. Les chiffres et observations de cette photographie ne sont pas tous l’état actuel du site. Voir `LAUNCH-RECORD.md` pour le suivi et `MYRIAM-LAUNCH-QUESTIONS.md` pour les informations encore attendues. Le dernier contrôle automatisé comprend 18 tests, tous réussis.

# Essentia: launch audit and remediation

Audit date: 11 October 2026. Scope: actual Next.js implementation, four-language content, eleven public routes, assets and production-build behaviour. This report distinguishes fixes made in this pass from earlier design work and outstanding owner/device checks. It does not certify legal compliance or complete WCAG conformance.

## Release decision

The technical fixes below are implemented and locally verified. **Do not declare the launch complete yet:** the legal notice still contains missing business status, SIRET and professional address. Owner approval of professional claims, appointment terms and data-handling details is also needed. Production verification follows deployment of this commit; physical devices, Safari, Firefox and screen readers remain untested in this pass.

Severity: Critical = potential security exposure or essential journey blocked; High = significant exclusion, misleading information or launch gate; Medium = material discoverability, confidence or resilience issue; Low = polish/maintenance. Dependency severity reflects the registry report; exploitability depends on which features and hosting environment are used.

## Findings, impact and precise fixes

| # | Severity | Issue and impact | Fix / status |
|---|---|---|---|
| 1 | Critical | Installed dependency tree reported five vulnerable packages, including critical Next.js advisories. Leaving old image-processing/framework versions creates avoidable exposure. | **Fixed:** Next 16.4.0, sharp 0.35.5, PostCSS 8.5.29 and compatible transitive updates; floors and lockfile updated. Production dependency audit now reports zero known vulnerabilities. No claim that every advisory was exploitable here. |
| 2 | High | Contact CTAs were spans until hydration. Failed or disabled JavaScript could block the site's only conversion channel. | **Fixed:** `RevealContact` renders genuine email/tel/WhatsApp anchors in initial HTML. SSR regression test checks exact destinations, optional French `(0)` removal and external-link isolation. |
| 3 | High | Legal notice has three “à compléter” fields. Visitors cannot identify the complete business entity. | **Owner required:** provide legal status, SIRET and professional address; insert into legal notice and validate required business disclosures before launch. Do not invent identifiers or addresses. |
| 4 | High | Privacy copy claimed contact forms, newsletter signup and no automatic technical collection; those flows do not exist. | **Partly resolved:** describes direct contact channels, language storage, potential hosting logs and third-party messaging. **Owner required:** confirm controller details, purposes/legal bases, processors/transfers, retention periods and actual host logging configuration. Validate the final notice against real practice. |
| 5 | High | Skip link target could be obscured by the sticky masthead, and main was not an explicit focus target. | **Fixed:** `tabIndex=-1` and responsive scroll margins. Keyboard activation verified to focus `main-content`. |
| 6 | High | Small-screen menu depended on JavaScript, leaving navigation hidden if scripts never ran. | **Fixed:** a no-script stylesheet exposes normal-flow navigation and hides unavailable switcher/menu/motion controls. Server HTML includes all route links. Full JS-disabled browser testing remains on the release checklist. |
| 7 | Medium | Rapid locale requests could finish out of order; failed downloads caused unhandled rejections. | **Fixed:** latest-request token, invalid-locale guard, unmount invalidation and an announced retry notice while retaining current content. Two component regression tests cover stale response and failure. |
| 8 | Medium | Motion controls stayed French after translation; English hero added a longer, different value proposition and an experience claim. | **Fixed:** translated replay/pause/resume labels and equivalent concise service/benefit copy in all four locales. Owner should still review the complete translations and professional claims elsewhere. |
| 9 | Medium | Legal content is French even when document language changes, and legal headings skipped from h1 to h3. | **Fixed:** legal sections declare `lang=fr`; subheadings now h2 with existing styling. Shared navigation remains in selected language. |
| 10 | Medium | White WhatsApp icon on bright green had weak contrast. Focus rings also needed treatment on dark surfaces. | **Fixed:** dark green `#167640` produces 5.68:1 against white; gold focus indicators on footer and hero controls. Brand logo remains requested `#FCC200`. |
| 11 | Medium | Inline prose links relied on colour to look interactive. | **Fixed:** visible underline and offset in legal/prose content; hover effects remain supplementary. |
| 12 | Medium | Reduced-motion CSS made the decorative mobile logo fully opaque behind the copy. | **Fixed:** static mobile crest retains discreet 20% opacity; handwriting/WebGL stay disabled. Lifecycle tests cover reduced-motion entry and live preference changes; physical OS testing remains required. |
| 13 | Medium | Home and handwriting observers had no missing-API fallback. | **Fixed:** absent IntersectionObserver no longer aborts these effects. 3D still falls back to SVG on initialization failure. The supported browser baseline remains modern evergreen browsers. |
| 14 | Medium | Deprecated Three.js shape helper generated console warnings. | **Fixed:** use `path.toShapes()`, identical to the installed deprecated wrapper's implementation. Existing WebGL fallback and lifecycle tests pass. |
| 15 | Medium | Root sharing metadata was inherited on subpages, weakening relevance when links are shared. | **Fixed:** every route sets its own Open Graph/Twitter title, description and canonical share URL; root sets origin and French locale. Verified OG image really is 1200×630. |
| 16 | Medium | Sitemap regenerated “last modified” timestamps without actual content changes. | **Fixed:** removed fabricated dates; retains real route URLs and canonical origin. Add truthful per-page timestamps only when backed by content history. |
| 17 | Medium | No explicit anti-framing, MIME-sniffing or browser-permission policy. | **Fixed:** response headers for frame prevention, nosniff, referrer restriction and unused camera/mic/location permissions; framework signature disabled. CSP is intentionally limited to frame ancestors, objects and base URI, not a full script XSS policy. |
| 18 | Medium | No route/root error recovery UI. A runtime failure could strand a visitor. | **Fixed:** route and root error boundaries provide retry and direct email/contact recovery. No stack traces or sensitive details shown. Failure injection and external error monitoring remain release checks. |
| 19 | Medium | Hero background initially faded from zero opacity over 1.5 seconds, delaying visual usefulness. | **Fixed:** background is visible immediately; modest text and image motion remain. First CTA is never gated on logo completion. No field LCP claim made. |
| 20 | Medium | `next lint` script did not work on this Next.js release; README still described mock forms, old fonts and an empty photo slot. | **Fixed:** honest `npm run check` syntax/content validation, consolidated `npm test`, repeatable HTTP verifier and rewritten operational README. This is not a full static-analysis/lint audit. |
| 21 | Medium | Four languages share URLs and French server HTML/metadata. Translated pages are not independently indexable or shareable. | **Open, architectural:** if multilingual acquisition matters, introduce `/en`, `/it`, `/es` routes with server locale selection, reciprocal hreflang, self-canonicals and localized sitemap. Redirect existing French URLs deliberately; test persisted-language behaviour. Avoid misleading hreflang on identical URLs. |
| 22 | Medium | First-session duration, pricing/payment/cancellation terms and confirmed practice location are not clearly supplied. This creates hesitation before contact. | **Owner required:** provide actual terms; add a short “Votre premier échange” block to booking and service pages, including duration, format, cost and how confirmation happens. Do not invent “free” or guaranteed response times. |
| 23 | Medium | Professional titles, experience and therapeutic claims need owner confirmation. Generic reassurance alone cannot establish credentials. | **Owner required:** verify qualifications and entitlement to titles, provide exact training/registration details where relevant, then add a restrained credentials block beside the founder story. Obtain consent before publishing client stories. |
| 24 | Medium | No conversion analytics or external error alerting is integrated. Performance and failures cannot yet be tracked in real use. | **Open decision:** select an owner-controlled privacy-appropriate analytics/error-monitoring setup. Measure page views and CTA type only; never transmit message text, email addresses, phone numbers or sensitive session details. Update privacy/consent handling for the chosen tool and verify events once. |
| 25 | Medium | WebGL still has nontrivial download/GPU cost, particularly for a decorative mobile watermark. | **Current mitigation verified in code:** separate dynamic imports, DPR cap 1.5, finite 24s pivots, offscreen/tab suspension and reduced-motion SVG. **Next step if mobile measurements fail:** omit WebGL on constrained devices and retain drawing/static SVG. Profile before adding heuristics; do not sacrifice the requested desktop experience without evidence. |
| 26 | Low | Resources contain clearly marked forthcoming previews rather than published content. This route can feel thin. | **Owner/editorial:** publish at least one complete useful resource with a real destination, author/date and relevant contact CTA, or remove Resources from primary navigation until ready. No fake articles/newsletter added. |
| 27 | Low | React 18 support now carries a Next.js deprecation warning. | **Open maintenance:** migrate React/ReactDOM together to supported React 19 in a separate verified release before Next 17; retest hydration, portals, dynamic 3D and hooks. Current build succeeds. |
| 28 | Medium | Accessibility and browser confidence is incomplete without assistive-tech and physical-browser checks. | **Release gate:** run VoiceOver/Safari and NVDA/Firefox, actual 200% zoom, keyboard-only journeys, reduced motion and low-powered Android/iOS tests. Do not label the site WCAG-certified based on DOM inspection. |

## Art direction and interaction assessment

The forest/ivory/gold palette, GFS Didot headings, founder portrait and signature monogram form a coherent identity. The service kicker communicates the offer before the poetic headline; a concise practical benefit and direct appointment CTA complete the opening story. Preserve this hierarchy and the requested leitmotif and gold colour. Previous generic testimonials, unconnected forms and fake booking calendar have already been removed; this pass does not claim those earlier changes as new work.

The strongest remaining visual improvement is authentic evidence: confirmed credentials, a useful first-session explanation and real editorial content. More glow, parallax or pinned scrolling would not solve those trust gaps. Typography and spacing now have a consistent hierarchy, and the inspected 320/390px layouts reflow without horizontal overflow. The small header tagline truncates intentionally on narrow screens; the full message remains in hero/footer. Do not shrink body text to make the hero artificially short. Mobile CTA reachability is more important than a fixed hero height.

Motion remains an enhancement: roughly 7.28s continuous drawing, 900ms handoff, three slow broad pivots over 24s, then settle. Pause/replay are keyboard controls. No scroll hijacking or pinned reading sections are needed. Motion tests verify clocks and fallbacks, not rendered GPU quality. Keep reduced-motion composition static and readable; test live preference changes on real devices.

## Verification evidence

- Production build succeeds on Next 16.4.0; all public pages statically prerender. React 18 deprecation is the remaining build warning.
- `npm run check` passes: JavaScript syntax and content JSON validation; not ESLint.
- `npm test`: **12 passed**, covering nine motion lifecycle cases, one server-rendered contact contract and two language failure/race cases.
- `npm audit --omit=dev`: **0 known vulnerabilities** at audit time. Re-run before each release.
- `node scripts/verify-site.mjs http://localhost:3115`: **11 routes passed**, including canonical/description/share-title presence, security headers, no-JS contact destinations, real 404 status, robots, sitemap and key assets.
- In-app Chromium: desktop composition inspected; keyboard skip link reaches main; mobile menu opens, Escape closes and returns focus. English contact copy reflows; contact links are at least 48px high, menu/language buttons 44px.
- Responsive checks: home at 320px and 640×422 constrained reflow (not actual browser zoom); contact, about, coaching, RH and booking at 390px. No horizontal overflow observed. This does not establish universal device/browser compatibility.
- Solid-colour contrast calculations: body `#626158` on `#FAF6EF` **5.78:1**; deep-gold text **6.07:1**; WhatsApp white-on-green **5.68:1**; footer text **8.95:1**; gold CTA text **10.01:1**. Image-backed text requires visual/assistive checks; these samples are not a complete contrast audit.
- Source asset checks: OG 149KB/1200×630; portrait 128KB/1122×1402; home source WebP 404KB/1800×1579; booking source WebP 429KB/1600×1000. Next Image supplies responsive delivery for hero/portrait. These source sizes are not measured wire transfer or Core Web Vitals.
- No Lighthouse, throttled-network metrics, field Core Web Vitals, actual 200% browser zoom, physical devices or screen-reader session were available in this pass. Do not infer scores from successful build times. Production aliases have not been verified for this new commit until it is pushed/deployed.

## Practical launch checklist

### Mobile, accessibility and browsers

- [ ] Test current Safari/iOS, Chrome/Android, desktop Chrome/Edge, Firefox and Safari; include a low-powered phone, landscape, 320px width and actual 200% zoom.
- [ ] Complete every navigation/contact journey with keyboard, VoiceOver and NVDA; verify focus visibility, menu trap/Escape, heading announcements and legal French pronunciation.
- [ ] Disable JavaScript: confirm mobile navigation and direct contact work; disable WebGL/context loss: SVG remains; enable reduced motion before load and during drawing: static readable composition remains.
- [ ] Check safe-area placement, touch targets, fixed WhatsApp overlap and translated long labels on real devices.

### CTAs, content and assets

- [ ] Owner confirms email/phone/WhatsApp ownership and receives one authorized test message/call through each channel; browser href checks do not prove delivery.
- [ ] Publish confirmed first-session format, duration, pricing/cancellation terms and credentials; appointment requests must not imply a confirmed slot.
- [ ] Supply legal status, SIRET and professional address; review privacy purposes/legal bases, retention, processors, transfers and business disclosures.
- [ ] Verify portrait/logo permissions and nature-photo licence/credits; review hero crops on each device. Check OG card and favicon in actual sharing/browser surfaces.
- [ ] Publish useful Resources content or defer that primary-nav entry.

### Performance and resilience

- [ ] Run mobile Lighthouse on the deployed URL with cold cache and throttling; inspect request waterfall, JS long tasks and 3D GPU cost. Investigate before applying more compression or animation.
- [ ] Target field p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 once traffic exists; a lab score alone does not establish field performance.
- [ ] Test slow/offline locale downloads, blocked fonts, missing images and error-boundary recovery. Add monitoring under the owner's account; ensure private data never enters events/logs.
- [x] Production build, syntax/content checks, 12 regression tests, HTTP route/header checks and dependency audit pass locally.

### SEO, analytics and deployment

- [x] Canonicals, per-route share metadata, robots, sitemap, truthful structured business facts and correctly sized OG asset verified locally.
- [ ] Validate live HTML and JSON-LD; submit sitemap through the owner's Search Console account. Add locale routes/hreflang if translated organic acquisition is required.
- [ ] Decide analytics provider and consent requirements; document data handling, exclude sensitive payloads, verify one event per CTA activation and honour applicable privacy preferences.
- [ ] Push reviewed commit to `main`; confirm Vercel reports that exact SHA as Ready, TLS and apex/www redirect are correct, and production routes/assets/headers pass the HTTP verifier.
- [ ] Keep previous known-good deployment available for rollback; check production logs and contact journeys after deployment. Never expose development servers or secrets.

## References

- [GitHub-reviewed Next.js image optimization advisory](https://github.com/advisories/GHSA-cjq9-62q9-8jv4): the SSRF case requires remote allow-listed images; this project has no remotePatterns configured. Dependency patching still addresses the wider audit findings.
- [CNIL: respecting individuals’ rights](https://www.cnil.fr/fr/respecter-les-droits-des-personnes): notices and rights-handling must reflect the real processing; owner validation remains necessary.
- Existing project records: `DESIGN-AUDIT.md`, `MOTION-SYSTEM.md`.

### Placeholder follow-up

At the owner's request, explicit placeholders have been added for missing legal, privacy, qualification and first-appointment details. About and appointment blocks are translated in all four locales; legal/privacy blocks remain labelled French. `LAUNCH-RECORD.md` provides fields for every outstanding approval and verification category above. These are draft slots, not verified claims or completed launch checks.
