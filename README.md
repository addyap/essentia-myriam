# Essentia — Myriam Diougoan Blanch

Next.js App Router website for coaching, psychotherapy and HR consulting. French server-rendered content with on-demand English, Italian and Spanish translations. Forest, ivory and gold identity; GFS Didot, Mulish and Parisienne fonts bundled by `next/font`.

## Development and verification

Use Node.js 22 LTS and the committed lockfile.

```sh
npm ci
npm run dev
npm run check
npm test
npm audit --omit=dev
npm run build
npm start
node scripts/verify-site.mjs http://localhost:3000
```

`check` validates JavaScript syntax and JSON content; it is not ESLint. `test:motion` remains available for motion lifecycle tests alone. The production build currently warns that React 18 support is deprecated; plan a separately tested React 19 migration before Next.js 17.

## Editing

| Content | Location |
|---|---|
| Four-language copy | `content/global/{fr,en,it,es}.json` |
| Design tokens, responsive layout, motion | `app/globals.css` |
| Handwriting and 3D logo | `components/LogoMarkDraw.js`, `HeroCrest.js`, `GoldLogo3D.js` |
| Navigation | `lib/routes.js` |
| Site origin | `lib/config.js` |
| Public contact destinations | `lib/contact.js`, `components/RevealContact.js` |
| SEO metadata | `app/layout.js`, route `layout.js` files |
| Asset credits | `public/images/nature/credits.json` |

Contact and appointment pages use real email, phone and WhatsApp links. There is no connected calendar, payment flow, newsletter, CMS, analytics or contact form. Contact links are rendered server-side; their base64 configuration is encoding, not a security boundary.

## Release

GitHub repository: `addyap/essentia-myriam`. Production origin: `https://www.essentiademdb.com`. The existing Vercel Git integration deploys pushes to `main`. Review the generated deployment and test its public alias after release; a successful local build alone does not confirm production health.

See **LAUNCH-AUDIT.md** for ranked findings, verification evidence and the release checklist. **DESIGN-AUDIT.md** and **MOTION-SYSTEM.md** describe the visual direction and motion specification. Missing legal business details and owner validation of claims remain release gates. Multilingual SEO needs distinct locale URLs; current translations are a visitor feature at shared French URLs.
