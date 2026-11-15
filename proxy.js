// Pre-launch lock. Until the site opens, every visitor sees a short
// "launching soon" page in French and Italian; the real site appears only
// after the private password (SITE_PASSWORD) is entered once on that page.
// Search engines are told never to list anything (here, and site-wide in
// next.config.mjs). On launch day, delete this
// file: nothing else depends on it.
//
// Left open so Myriam keeps working: the CMS (/cms, /admin and its API), her
// private writing page (/ecrire and its API), uploaded images, and the editor's
// live preview when the CMS itself frames it.
// Written with plain web Request/Response so it runs (and is tested) anywhere;
// returning nothing lets the request carry on to the site.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'essentia-preview';
const UNLOCK_PATH = '/acces-prive';
const NOINDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex';

// The access cookie holds an expiry date and a signature. The signature uses a
// server secret (FORM_SECRET, already set in Vercel for the contact form) mixed
// with the password, so a cookie cannot be forged, reveals nothing about the
// password, stops working after 90 days whatever the browser does, and every
// cookie dies as soon as the password changes.
const MAX_AGE_S = 60 * 60 * 24 * 90;
let warned = false;
function cookieKey(password, env = process.env) {
  const secret = env.FORM_SECRET && env.FORM_SECRET.length >= 32 ? env.FORM_SECRET
    : env.RESEND_API_KEY ? createHmac('sha256', env.RESEND_API_KEY).update('essentia-preview-secret').digest('base64url')
    : null;
  if (!secret && !warned) warned = true, console.warn('proxy.js: FORM_SECRET is not set; the access cookie is signed with the password alone.');
  return createHmac('sha256', secret || 'essentia-preview').update(`essentia-preview:${password}`).digest();
}
const sign = (key, expires) => createHmac('sha256', key).update(`v2.${expires}`).digest('base64url');
const issueCookie = (key, now = Date.now()) => { const expires = Math.floor(now / 1000) + MAX_AGE_S; return `v2.${expires}.${sign(key, expires)}`; };
function validCookie(value, key, now = Date.now()) {
  const parts = typeof value === 'string' && value.length < 200 ? value.split('.') : [];
  if (parts.length !== 3 || parts[0] !== 'v2' || !/^\d{10}$/.test(parts[1])) return false;
  if (Number(parts[1]) * 1000 <= now) return false;
  return same(parts[2], sign(key, parts[1]));
}
const digest = (text) => createHash('sha256').update(text).digest();
// Compares through fixed-length digests so neither length nor content leaks through timing.
const same = (a, b) => typeof a === 'string' && typeof b === 'string' && timingSafeEqual(digest(a), digest(b));

// Guessing is slowed and capped: every wrong password waits a second, and an
// address with 5 wrong passwords in 15 minutes is refused until the window
// ends. A cap on all addresses together blunts guesses spread over many
// machines; you and Myriam stay in meanwhile, since your cookie still works.
// Counts live in this server instance's memory, so they reset when Vercel
// starts a fresh one: this slows a script down, it is not a wall on its own.
const WINDOW_MS = 15 * 60 * 1000, PER_ADDRESS = 5, ALL_ADDRESSES = 100;
export const limits = { wrongDelayMs: 1000 };
const failures = new Map();
let allFailures = { count: 0, since: 0 };
export function resetGuessLimits() { failures.clear(); allFailures = { count: 0, since: 0 }; }
const address = (request) => request.headers.get('x-real-ip') || (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
function blocked(ip, now = Date.now()) {
  const entry = failures.get(ip);
  if (entry && now - entry.since < WINDOW_MS && entry.count >= PER_ADDRESS) return true;
  return now - allFailures.since < WINDOW_MS && allFailures.count >= ALL_ADDRESSES;
}
function recordFailure(ip, now = Date.now()) {
  const entry = failures.get(ip);
  failures.set(ip, entry && now - entry.since < WINDOW_MS ? { count: entry.count + 1, since: entry.since } : { count: 1, since: now });
  allFailures = now - allFailures.since < WINDOW_MS ? { count: allFailures.count + 1, since: allFailures.since } : { count: 1, since: now };
  if (failures.size > 5000) for (const [key, value] of failures) if (now - value.since >= WINDOW_MS) failures.delete(key);
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Only a path on this site may follow a successful unlock.
const safeNext = (value) => (typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : '/');
const escape = (text) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function soonPage({ next = '/', error = false, unset = false, tooMany = false } = {}) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="${NOINDEX}">
<title>Essentia · Bientôt en ligne · Presto online</title>
<link rel="icon" href="/favicon.png">
<style>
  :root{--bg:#f7f1e6;--ink:#1f2a24;--soft:#5d665f;--gold:#a8853f;--line:#d9c9a6}
  @media (prefers-color-scheme:dark){:root{--bg:#16201b;--ink:#f3ecdf;--soft:#b9b3a6;--gold:#d2b072;--line:#4a4636}}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font-family:Georgia,"Times New Roman",serif;padding:32px 16px}
  main{max-width:560px;text-align:center}
  .brand{font-style:italic;font-size:clamp(34px,8vw,52px);letter-spacing:.01em;margin:0;color:var(--gold)}
  .who{font-family:system-ui,sans-serif;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--soft);margin:10px 0 0}
  .rule{width:56px;height:1px;background:var(--gold);margin:40px auto;border:0}
  h1{font-weight:400;font-size:clamp(26px,6vw,36px);margin:0 0 12px}
  p{font-size:18px;line-height:1.6;color:var(--soft);margin:0}
  section+section{margin-top:36px}
  details{margin-top:64px;font-family:system-ui,sans-serif;font-size:13px;color:var(--soft)}
  summary{cursor:pointer;list-style:none;display:inline-block;padding:10px;border-bottom:1px solid var(--line)}
  summary::-webkit-details-marker{display:none}
  form{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px}
  input{font:inherit;font-size:16px;padding:10px 12px;border:1px solid var(--line);background:transparent;color:var(--ink);border-radius:2px;min-width:0;width:220px}
  button{font:inherit;font-size:14px;padding:10px 18px;border:1px solid var(--gold);background:var(--gold);color:#fff;border-radius:2px;cursor:pointer}
  .error{color:#b3402f;margin-top:12px}
</style>
</head>
<body>
<main>
  <p class="brand">Essentia</p>
  <p class="who">Myriam Diougoan Blanch</p>
  <hr class="rule">
  <section lang="fr">
    <h1>Bientôt en ligne</h1>
    <p>Le site est en préparation. Merci de votre patience, nous ouvrons très prochainement.</p>
  </section>
  <section lang="it">
    <h1>Presto online</h1>
    <p>Il sito è in preparazione. Grazie per la pazienza, apriremo molto presto.</p>
  </section>
  <details${error ? ' open' : ''}>
    <summary>Accès privé</summary>
    <form method="post" action="${UNLOCK_PATH}">
      <input type="hidden" name="next" value="${escape(next)}">
      <label for="password" style="position:absolute;left:-9999px">Mot de passe</label>
      <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Mot de passe" required${error ? ' autofocus aria-describedby="error"' : ''}>
      <button type="submit">Entrer</button>
    </form>
    ${error ? `<p class="error" id="error" role="alert">${unset ? 'Accès privé non configuré : le mot de passe SITE_PASSWORD est introuvable sur ce déploiement.' : tooMany ? 'Trop d’essais. Réessayez dans 15 minutes.' : 'Mot de passe incorrect.'}</p>` : ''}
  </details>
</main>
</body>
</html>`;
}

function soon(request, { error = false, status = 200, unset = false, tooMany = false } = {}) {
  const { pathname, search } = new URL(request.url);
  const next = pathname === UNLOCK_PATH ? '/' : `${pathname}${search}`;
  return new Response(soonPage({ next, error, unset, tooMany }), { status, headers: {
    // Says only whether a password exists on this deployment, never what it is.
    'X-Private-Access': unset ? 'not-configured' : 'configured',
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Robots-Tag': NOINDEX,
  } });
}

function open(request) {
  const { pathname } = new URL(request.url);
  if (/^\/(cms|admin|api\/cms-config|ecrire|api\/ecrire|uploads)(\/|$)/.test(pathname)) return true;
  if (pathname === '/favicon.png' || pathname === '/robots.txt') return true;
  // The CMS shows drafts in /cms-preview inside its own frame, with the
  // pictures that page uses; typed directly into the address bar it stays locked.
  const dest = request.headers.get('sec-fetch-dest'), site = request.headers.get('sec-fetch-site');
  if (site === 'same-origin' && ((pathname === '/cms-preview' && dest === 'iframe') || dest === 'image')) return true;
  return false;
}

function cookieValue(request, name) {
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

export async function proxy(request) {
  // Spaces or a line break pasted around the password in Vercel or the form are ignored.
  const password = (process.env.SITE_PASSWORD || '').trim();
  // Local development without a password stays open; a deployment without one stays locked.
  if (!password && process.env.NODE_ENV !== 'production') return;
  if (open(request)) return;

  const url = new URL(request.url);
  const key = password ? cookieKey(password) : null;
  if (url.pathname === UNLOCK_PATH && request.method === 'POST') {
    if (!key) {
      console.error('proxy.js: SITE_PASSWORD is not set on this deployment, so private access is closed.');
      return soon(request, { error: true, status: 503, unset: true });
    }
    const ip = address(request);
    if (blocked(ip)) return soon(request, { error: true, status: 429, tooMany: true });
    let form;
    try { form = await request.formData(); } catch { return soon(request, { error: true, status: 400 }); }
    const given = String(form.get('password') || '').trim();
    if (!same(given, password)) {
      recordFailure(ip);
      await pause(limits.wrongDelayMs);
      return soon(request, { error: true, status: 401 });
    }
    failures.delete(ip);
    const secure = url.protocol === 'https:' ? '; Secure' : '';
    return new Response(null, { status: 303, headers: {
      Location: new URL(safeNext(form.get('next')), url).href,
      'Set-Cookie': `${COOKIE}=${issueCookie(key)}; Path=/; Max-Age=${MAX_AGE_S}; HttpOnly; SameSite=Lax${secure}`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': NOINDEX,
    } });
  }
  if (key && validCookie(cookieValue(request, COOKIE), key)) return;
  return soon(request, { unset: !key });
}

// Everything except Next's built files, which carry no page of their own.
export const config = { matcher: ['/((?!_next/static).*)'] };
