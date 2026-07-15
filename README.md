# Essentia — Myriam Diougoan Blanch

A multilingual (FR · EN · IT · ES) website for Myriam Diougoan Blanch — coaching, therapy & HR consulting. Built with **Next.js (App Router)**, ready to deploy on **Vercel**.

- Elegant design system: gold + cream palette, sage-green accent, soft charcoal ink.
- Typography: Cormorant Garamond (headings) · Mulish (body) · Parisienne (script accents).
- Seven pages with real routes, a language switcher, and a photo-ready hero.

---

## 1. Run it locally (do this first)

> The project was authored in a cloud sandbox where the npm registry was blocked, so dependencies were **not** installed there. Installing and building on your machine is step one.

```bash
cd essentia
npm install
npm run dev          # http://localhost:3000
```

Then build to confirm everything compiles for production:

```bash
npm run build
npm start            # serves the production build locally
```

Requires **Node.js 18.17+** (Node 20 LTS recommended).

---

## 2. Push to GitHub

```bash
cd essentia
git init
git add .
git commit -m "Essentia — initial site"

# Create the repo and push (GitHub CLI):
gh repo create essentia --private --source=. --remote=origin --push
# …or create an empty repo on github.com and:
#   git remote add origin https://github.com/<you>/essentia.git
#   git branch -M main && git push -u origin main
```

---

## 3. Deploy to Vercel

1. Go to **vercel.com → Add New → Project** and import the `essentia` GitHub repo.
2. Vercel auto-detects **Next.js** — no configuration needed. Click **Deploy**.
3. You get a live URL like `essentia.vercel.app`. Every future `git push` to `main` auto-deploys, and pull requests get preview URLs.

**Custom domain:** in the Vercel project → **Settings → Domains**, add your domain (e.g. an `essentia` variant, since `essentia.com` is taken) and follow the DNS instructions.

---

## 4. Where to change things

| You want to change… | Edit… |
|---|---|
| Any text, in any of the 4 languages | `lib/content.js` (one object per language — `fr`, `en`, `it`, `es`) |
| Colours, spacing, fonts | `app/globals.css` (CSS variables at the top under `:root`) |
| The logo | `components/Logo.js` (inline SVG) and `public/logo.svg` (favicon) — swap in Myriam's final logo file |
| Navigation / URLs | `lib/routes.js` |
| Page structure | `app/<route>/page.js` |

---

## 5. Intentional "fill later" items

These are stubbed in the design and ready to be wired up:

- **Real photographs** — the hero has a photo-ready slot (`.hero-photo` in `app/page.js`; drop in a `background-image` or a `next/image` `<Image fill>`), and the About page has a portrait frame awaiting Myriam's professional photo.
- **Booking + online payment** — the `/rendez-vous` calendar and form are visual placeholders. Recommended integrations: **Cal.com** or **Calendly** for scheduling, **Stripe** for payment.
- **Contact / booking form submissions** — forms are non-functional mockups; connect to a service (e.g. Formspree, Resend, or a Next.js API route) to actually send.
- **Testimonials** — currently sample quotes in `lib/content.js`; replace with real client testimonials.
- **Legal pages** — Mentions légales / Confidentialité / RGPD / Charte éthique are footer links awaiting content.

---

## 6. Possible enhancements

- **SEO-friendly locale routing** (`/fr`, `/en`, …): the language switcher currently uses client-side React context (defaults to French, which is server-rendered for SEO). For per-language URLs and full multilingual SEO, migrate to locale routing (e.g. `next-intl`).
- **Self-hosted fonts** via `next/font/google` (currently loaded via `<link>` in `app/layout.js`) for zero layout shift.
- Set the real production URL in `metadataBase` (`app/layout.js`).

---

## Handing this to Claude Code

Open this folder in Claude Code and try, for example:
- "Run `npm install` then `npm run build` and fix anything that fails."
- "Wire the `/rendez-vous` page up to Cal.com and Stripe."
- "Add a real photo to the hero from `public/hero.jpg`."
- "Set up locale routing so each language has its own URL."
