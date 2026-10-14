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
| Blog articles (written in the CMS) | `content/blog/<slug>.json`, images in `public/uploads` |
| Blog and podcast pages | `components/Blog.js`, `components/Markdown.js`, `lib/blog.js`, `lib/markdown.js` |
| Site origin | `lib/config.js` |
| Public contact destinations | `lib/contact.js`, `components/RevealContact.js` |
| Contact form | `components/ContactForm.js`, `app/api/contact/route.js`, `lib/contact-form.js`, `lib/contact-rules.js` |
| SEO metadata | `app/layout.js`, route `layout.js` files |
| Asset credits | `public/images/nature/credits.json` |

Contact and appointment pages use real email, phone and WhatsApp links. There is no connected calendar, payment flow or newsletter. Contact details are stored scrambled in `lib/contact.js` and only become real links in the visitor's browser when a link is used; this deters spam harvesters but is encoding, not a security boundary.

## Blog and podcast

"Blog & podcast" in the navigation leads to `/ressources`, which lists every article, newest first, followed by a "Coming soon" podcast section. Each article has its own page at `/blog/<slug>`; `/blog` redirects to `/ressources`. `/podcast` is a "Coming soon" page and stays out of search results and the sitemap until the first episode is published (`app/podcast/layout.js`, `app/sitemap.js`).

Myriam writes articles in the CMS "Blog" collection; each is one JSON file in `content/blog` with a title, date, summary, optional cover image and Markdown body. Articles are built into static pages at deployment, so a published article appears once Vercel has redeployed. Bodies are parsed by `lib/markdown.js`, which supports only the editor's toolbar (headings, bold, italic, links, quotes, lists, images) and never renders raw HTML. Articles are French only; visitors using another language see a notice. Interface text for these pages is in `content/fr/{resources,blog,podcast}.json` and the translation files.

## Contact form

The Contact page form posts to `/api/contact`, which sends the message to Myriam through [Resend](https://resend.com) with the visitor's address as reply-to, then emails the visitor an HTML acknowledgement in the language they used. The acknowledgement repeats nothing the visitor typed. Field rules live in `lib/contact-rules.js`, shared by the browser and the server. A hidden honeypot field, a three-second minimum fill time and a per-instance limit of five messages per address in ten minutes deter spam.

Set `RESEND_API_KEY` in Vercel → Settings → Environment Variables (never in a committed file); without it the endpoint answers 503. `CONTACT_FROM` optionally overrides the sender, which must be on the domain verified in Resend; the default is `contact@essentiademdb.com`. Redeploy after changing either variable. Form labels, the thank-you panel, the confirmation email and the wording of the email Myriam receives are editable in the CMS (French) and in `content/global/{en,it,es}.json`.

## Release

GitHub repository: `addyap/essentia-myriam`. Production origin: `https://www.essentiademdb.com`. The production branch is `main`. Check Vercel after each push: recent releases needed a manual deployment, so automatic delivery must not be assumed. Review the generated deployment and test its public alias after release; a successful local build alone does not confirm production health.

See **LAUNCH-AUDIT.md** for ranked findings, verification evidence and the release checklist. **DESIGN-AUDIT.md** and **MOTION-SYSTEM.md** describe the visual direction and motion specification. Missing legal business details and owner validation of claims remain release gates. Multilingual SEO needs distinct locale URLs; current translations are a visitor feature at shared French URLs.

## Details awaiting owner confirmation

Visible, explicitly marked placeholders now appear on About, Appointment, Legal Notice and Privacy pages. Edit legal/privacy values in `content/launch-placeholders.json` and French credentials/appointment fields in `content/fr/launchDetails.json` and translated `launchDetails` fields in `content/global/{en,it,es}.json`. `LAUNCH-RECORD.md` contains fill-in fields for business approvals, browser/accessibility testing, performance, analytics and deployment evidence. Placeholders do not close launch gates.

## French text editor

The database-free Decap editor is available at `/admin` once DecapBridge email/password authentication is connected. French page content now lives in `content/fr/*.json`; other languages are unchanged. See [CMS-GUIDE.md](CMS-GUIDE.md) for Myriam’s editing workflow and the one-time owner setup. Never deploy local filesystem editing or commit CMS credentials.
