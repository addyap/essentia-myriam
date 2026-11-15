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

const COOKIE = 'essentia-preview';
const UNLOCK_PATH = '/acces-prive';
const NOINDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex';

const encoder = new TextEncoder();
async function token(password) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`essentia-preview:${password}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
// Only a path on this site may follow a successful unlock.
const safeNext = (value) => (typeof value === 'string' && /^\/(?![/\\])/.test(value) ? value : '/');
const escape = (text) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function soonPage({ next = '/', error = false } = {}) {
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
    ${error ? '<p class="error" id="error" role="alert">Mot de passe incorrect.</p>' : ''}
  </details>
</main>
</body>
</html>`;
}

function soon(request, { error = false, status = 200 } = {}) {
  const { pathname, search } = new URL(request.url);
  const next = pathname === UNLOCK_PATH ? '/' : `${pathname}${search}`;
  return new Response(soonPage({ next, error }), { status, headers: {
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
  const password = process.env.SITE_PASSWORD || '';
  // Local development without a password stays open; a deployment without one stays locked.
  if (!password && process.env.NODE_ENV !== 'production') return;
  if (open(request)) return;

  const url = new URL(request.url);
  const expected = password ? await token(password) : null;
  if (url.pathname === UNLOCK_PATH && request.method === 'POST') {
    let form;
    try { form = await request.formData(); } catch { return soon(request, { error: true, status: 400 }); }
    const given = String(form.get('password') || '');
    if (!expected || !same(await token(given), expected)) return soon(request, { error: true, status: 401 });
    const secure = url.protocol === 'https:' ? '; Secure' : '';
    return new Response(null, { status: 303, headers: {
      Location: new URL(safeNext(form.get('next')), url).href,
      'Set-Cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${60 * 60 * 24 * 90}; HttpOnly; SameSite=Lax${secure}`,
      'Cache-Control': 'no-store',
      'X-Robots-Tag': NOINDEX,
    } });
  }
  if (expected && same(cookieValue(request, COOKIE), expected)) return;
  return soon(request);
}

// Everything except Next's built files, which carry no page of their own.
export const config = { matcher: ['/((?!_next/static).*)'] };
