# Essentia — Myriam Diougoan Blanch

Next.js App Router website for coaching, psychotherapy and HR consulting. French server-rendered content with on-demand English, Italian and Spanish translations. Forest, ivory and gold identity; GFS Didot, Mulish and Parisienne fonts bundled by `next/font`.

## Development and verification

Use Node.js 24 LTS (matching Vercel and `.nvmrc`) and the committed lockfile.

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

`check` validates JavaScript syntax and JSON content; it is not ESLint. `test:motion` remains available for motion lifecycle tests alone. React and React DOM are pinned together to React 19; validate upgrades with the complete test suite and production build.

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

GitHub repository: `addyap/essentia-myriam`. Production origin: `https://www.essentiademdb.com`. The production branch is `main`. Check Vercel after each push: recent releases needed a manual deployment, so automatic delivery must not be assumed. Review the generated deployment and test its public alias after release; a successful local build alone does not confirm production health.

See **LAUNCH-AUDIT.md** for ranked findings, verification evidence and the release checklist. **DESIGN-AUDIT.md** and **MOTION-SYSTEM.md** describe the visual direction and motion specification. Missing legal business details and owner validation of claims remain release gates. Multilingual SEO needs distinct locale URLs; current translations are a visitor feature at shared French URLs.

## Details awaiting owner confirmation

Visible, explicitly marked placeholders now appear on About, Appointment, Legal Notice and Privacy pages. Edit legal/privacy values in `content/launch-placeholders.json` and French credentials/appointment fields in `content/fr/launchDetails.json` and translated `launchDetails` fields in `content/global/{en,it,es}.json`. `LAUNCH-RECORD.md` contains fill-in fields for business approvals, browser/accessibility testing, performance, analytics and deployment evidence. Placeholders do not close launch gates.

## French text editor

The database-free Keystatic editor is available at `/admin` once GitHub authentication is connected. French page content now lives in `content/fr/*.json`; other languages are unchanged. See [CMS-GUIDE.md](CMS-GUIDE.md) for Myriam’s editing workflow and the one-time owner setup. Never deploy local filesystem editing or commit CMS credentials.
