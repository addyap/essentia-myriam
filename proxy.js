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

// The page is built from the site's own brand: GFS Didot headings with a gold
// italic word, Mulish text, the Parisienne signature, the gold monogram and the
// misty forest of the home page. Those few files are copied into
// public/prelaunch, the only folder open before launch, so nothing else of the
// site is served to visitors.
export function soonPage({ next = '/', error = false, unset = false, tooMany = false } = {}) {
  const message = unset ? 'Accès privé non configuré : le mot de passe SITE_PASSWORD est introuvable sur ce déploiement.'
    : tooMany ? 'Trop d’essais. Réessayez dans 15 minutes.' : 'Mot de passe incorrect.';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="${NOINDEX}">
<meta name="theme-color" content="#1b2620">
<title>Essentia de Myriam Diougoan Blanch · Bientôt en ligne</title>
<meta name="description" content="Coaching, psychothérapie, conseil RH et formations. Le site ouvre très prochainement.">
<link rel="icon" href="/favicon.png">
<link rel="preload" href="/prelaunch/didot.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/prelaunch/parisienne.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/prelaunch/forest.webp" as="image">
<style>
  @font-face{font-family:"GFS Didot";src:url(/prelaunch/didot.woff2) format("woff2");font-weight:400;font-display:swap}
  @font-face{font-family:Mulish;src:url(/prelaunch/mulish.woff2) format("woff2");font-weight:300 700;font-display:swap}
  @font-face{font-family:Parisienne;src:url(/prelaunch/parisienne.woff2) format("woff2");font-weight:400;font-display:swap}
  :root{--gold:#FCC200;--gold-soft:#E8D8A6;--ivory:#FAF6EF;--ink:#1b2620;--serif:"GFS Didot",Georgia,serif;--sans:Mulish,system-ui,sans-serif;--script:Parisienne,cursive}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{min-height:100%}
  body{min-height:100vh;min-height:100svh;background:var(--ink);color:var(--ivory);font-family:var(--sans);font-weight:300;line-height:1.7;-webkit-font-smoothing:antialiased;display:flex;flex-direction:column;position:relative;overflow-x:hidden}
  .scene{position:fixed;inset:0;z-index:0;background:#1b2620 url(/prelaunch/forest.webp) center 35%/cover no-repeat;transform:scale(1.04);animation:drift 24s ease-in-out infinite alternate}
  .scene::after{content:"";position:absolute;inset:0;background:
    radial-gradient(ellipse 70% 55% at 50% 42%,rgba(27,38,32,.35),rgba(27,38,32,.82) 70%,rgba(20,28,24,.94)),
    linear-gradient(180deg,rgba(20,28,24,.55),rgba(20,28,24,.2) 35%,rgba(20,28,24,.75))}
  @keyframes drift{to{transform:scale(1.1) translate(-1%,-1%)}}
  .frame{position:fixed;inset:16px;z-index:1;pointer-events:none;border:1px solid rgba(252,194,0,.18)}
  .frame i{position:absolute;width:15px;height:15px;border:0 solid rgba(252,194,0,.8)}
  .frame i:nth-child(1){top:-1px;left:-1px;border-top-width:2px;border-left-width:2px}
  .frame i:nth-child(2){top:-1px;right:-1px;border-top-width:2px;border-right-width:2px}
  .frame i:nth-child(3){bottom:-1px;left:-1px;border-bottom-width:2px;border-left-width:2px}
  .frame i:nth-child(4){bottom:-1px;right:-1px;border-bottom-width:2px;border-right-width:2px}
  header,main,footer{position:relative;z-index:2}
  header{display:flex;justify-content:center;padding:44px 24px 0}
  .brand{display:flex;align-items:center;gap:14px;line-height:1}
  .brand img{width:38px;height:47px;filter:drop-shadow(0 0 14px rgba(252,194,0,.35))}
  .brand .name{font-family:var(--script);font-size:38px;color:var(--ivory);line-height:1.15}
  .brand .byline{font-family:var(--script);font-size:19px;color:var(--gold-soft);margin-left:6px}
  main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:56px 24px}
  .mark{width:92px;height:auto;margin-bottom:34px;filter:drop-shadow(0 0 28px rgba(252,194,0,.45));animation:rise 1.2s ease both}
  .kicker{display:inline-flex;align-items:center;gap:14px;font-size:11.5px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);animation:rise 1.2s .1s ease both}
  .kicker::before,.kicker::after{content:"";width:40px;height:1px;background:linear-gradient(90deg,transparent,var(--gold))}
  .kicker::after{background:linear-gradient(90deg,var(--gold),transparent)}
  h1{font-family:var(--serif);font-weight:400;font-size:clamp(46px,9vw,92px);line-height:1.04;letter-spacing:.005em;margin:26px 0 22px;animation:rise 1.2s .2s ease both}
  h1 em,h2 em{font-style:italic;color:var(--gold);text-shadow:0 0 36px rgba(252,194,0,.4)}
  .lead{max-width:34em;font-size:clamp(16px,2.2vw,18.5px);color:rgba(250,246,239,.86);animation:rise 1.2s .3s ease both}
  .tagline{font-family:var(--serif);font-style:italic;font-size:clamp(18px,2.6vw,22px);color:var(--gold-soft);margin-top:14px;animation:rise 1.2s .35s ease both}
  .rule{width:64px;height:1px;border:0;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:44px auto 36px;animation:rise 1.2s .4s ease both}
  section[lang=it]{animation:rise 1.2s .45s ease both}
  h2{font-family:var(--serif);font-weight:400;font-size:clamp(28px,4.6vw,40px);line-height:1.1;margin-bottom:12px}
  section[lang=it] p{max-width:34em;font-size:clamp(15px,2vw,17px);color:rgba(250,246,239,.78)}
  .follow{display:inline-flex;align-items:center;gap:10px;margin-top:44px;padding:13px 26px;border:1px solid rgba(252,194,0,.55);border-radius:4px;color:var(--ivory);text-decoration:none;font-size:14px;font-weight:600;letter-spacing:.04em;transition:background .25s,border-color .25s,transform .25s;animation:rise 1.2s .55s ease both}
  .follow:hover{background:rgba(252,194,0,.12);border-color:var(--gold);transform:translateY(-2px)}
  .follow svg{width:18px;height:18px;color:var(--gold)}
  .follow:focus-visible,summary:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
  footer{padding:0 24px 40px;text-align:center;font-size:12.5px;color:rgba(250,246,239,.55)}
  footer .sig{font-family:var(--script);font-size:21px;color:var(--gold-soft);margin-bottom:12px}
  details{display:inline-block}
  summary{cursor:pointer;list-style:none;display:inline-block;padding:8px 10px;letter-spacing:.08em;border-bottom:1px solid rgba(250,246,239,.18);transition:color .2s}
  summary:hover{color:var(--ivory)}
  summary::-webkit-details-marker{display:none}
  form{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:14px}
  input{font:inherit;font-size:16px;padding:11px 14px;border:1px solid rgba(250,246,239,.25);background:rgba(20,28,24,.55);color:var(--ivory);border-radius:4px;width:230px;max-width:100%}
  input::placeholder{color:rgba(250,246,239,.5)}
  button{font:inherit;font-size:14px;font-weight:600;padding:11px 22px;border:0;border-radius:4px;cursor:pointer;color:#201603;background:linear-gradient(135deg,#FFD758,#FCC200 48%,#E7A500)}
  .error{color:#FFB4A2;margin-top:12px}
  .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  @media (max-width:560px){
    .frame{inset:10px}
    header{padding-top:34px}
    .brand img{width:30px;height:37px}
    .brand .name{font-size:32px}
    .brand .byline{display:none}
    main{padding:40px 20px}
    .mark{width:72px;margin-bottom:26px}
    .kicker{display:block;max-width:270px;margin:0 auto;font-size:10px;letter-spacing:.2em;line-height:2;text-wrap:balance}
    .kicker::before,.kicker::after{display:none}
    h1{font-size:clamp(38px,11vw,46px);margin:20px 0 18px}
  }
  @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.scene{transform:none}}
</style>
</head>
<body>
<div class="scene" aria-hidden="true"></div>
<div class="frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<header>
  <p class="brand"><img src="/prelaunch/monogram.svg" alt="" width="38" height="47"><span class="name">Essentia</span><span class="byline">de Myriam Diougoan Blanch</span></p>
</header>
<main>
  <img class="mark" src="/prelaunch/monogram.svg" alt="Monogramme MDB" width="92" height="114">
  <section lang="fr">
    <p class="kicker">Coaching&nbsp;· Psychothérapie&nbsp;· Conseil&nbsp;RH&nbsp;· Formations</p>
    <h1>Bientôt <em>en ligne</em></h1>
    <p class="lead">Un accompagnement humain et pragmatique pour vous réaligner avec clarté, sens et authenticité. Le site d’Essentia ouvre très prochainement.</p>
    <p class="tagline">Un voyage suspendu où le temps murmure à votre véritable essence</p>
  </section>
  <hr class="rule">
  <section lang="it">
    <h2>Presto <em>online</em></h2>
    <p>Un accompagnamento umano e concreto per ritrovare chiarezza, senso e autenticità. Il sito di Essentia aprirà molto presto.</p>
  </section>
  <a class="follow" href="https://www.instagram.com/mbdchandale/" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
    Suivre Myriam sur Instagram<span class="sr-only"> (nouvel onglet)</span>
  </a>
</main>
<footer>
  <p class="sig">accompagner l’humain, en profondeur</p>
  <details${error ? ' open' : ''}>
    <summary>Accès privé</summary>
    <form method="post" action="${UNLOCK_PATH}">
      <input type="hidden" name="next" value="${escape(next)}">
      <label class="sr-only" for="password">Mot de passe</label>
      <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Mot de passe" required${error ? ' autofocus aria-describedby="error"' : ''}>
      <button type="submit">Entrer</button>
    </form>
    ${error ? `<p class="error" id="error" role="alert">${message}</p>` : ''}
  </details>
</footer>
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
  if (/^\/(cms|admin|api\/cms-config|ecrire|api\/ecrire|uploads|prelaunch)(\/|$)/.test(pathname)) return true;
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
