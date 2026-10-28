import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const origin = process.argv[2] || 'http://localhost:3114';
// Contact details must never appear in page code; numbers are built from parts
// so this public file does not contain them either.
const digits = [['6', '0130', '0642']].map(parts => parts.join(''));
const HARVESTABLE = new RegExp(['mailto:', 'tel:\\+', 'wa\\.me\\/', '@gmail\\.com', ...digits, ...digits.map(d => d.slice(1).replace(/(\d{2})(?=\d)/g, '$1 '))].join('|'));
const paths = [...(await readFile('lib/routes.js', 'utf8')).matchAll(/\w+: '([^']+)'/g)].map(m => m[1]);
for (const path of paths) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${path}: one h1`);
  assert.ok(html.includes(`rel="canonical" href="https://www.essentiademdb.com${path === '/' ? '' : path}`), `${path}: canonical`);
  assert.match(html, /property="og:title" content="[^\"]+"/, `${path}: share title`);
  assert.match(html, /name="description" content="[^\"]+"/, `${path}: description`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  // Contact details are assembled only when a visitor uses a link, never in page code.
  assert.doesNotMatch(html, HARVESTABLE, `${path}: no harvestable contact details`);
  assert.ok(html.includes('href="https://www.instagram.com/mbdchandale/"'), `${path}: Instagram link`);
  if (path === '/contact' || path === '/rendez-vous') assert.match(html, /<a[^>]*target="_blank"[^>]*href="\/contact"|<a[^>]*href="\/contact"[^>]*target="_blank"/, `${path}: WhatsApp link present`);
}
assert.equal((await fetch(new URL('/this-page-does-not-exist', origin))).status, 404);
// The contact form's signed token (503 only where no Resend key is configured, e.g. a local build).
const tokenResponse = await fetch(new URL('/api/contact/token', origin));
assert.ok([200, 503].includes(tokenResponse.status), 'contact token endpoint');
if (tokenResponse.status === 200) assert.match((await tokenResponse.json()).token, /^\d{13}\.[\w-]+\.[\w-]+$/);
assert.equal((await fetch(new URL('/api/contact', origin), { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' }, body: '{}' })).status === 403 || tokenResponse.status === 503, true, 'cross-site posts refused');
const sitemap = await (await fetch(new URL('/sitemap.xml', origin))).text();
for (const path of paths.filter(path => path !== '/podcast')) assert.ok(sitemap.includes(`<loc>https://www.essentiademdb.com${path}</loc>`), `${path}: in sitemap`);
assert.ok(!sitemap.includes('/podcast'), 'podcast awaiting its first episode excluded from sitemap');
assert.match(await (await fetch(new URL('/podcast', origin))).text(), /name="robots" content="noindex, follow"/);
assert.doesNotMatch(await (await fetch(new URL('/ressources', origin))).text(), /name="robots" content="noindex/);
// Every published article is listed in the sitemap and answers on its own page.
const articles = [...sitemap.matchAll(/https:\/\/www\.essentiademdb\.com(\/blog\/[^<]+)</g)].map(m => m[1]);
for (const path of articles) {
  const html = await (await fetch(new URL(path, origin))).text();
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${path}: one h1`);
  assert.ok(html.includes(`rel="canonical" href="https://www.essentiademdb.com${path}"`), `${path}: canonical`);
  assert.match(html, /"@type":"BlogPosting"/, `${path}: structured data`);
}
const blogIndex = await fetch(new URL('/blog', origin), { redirect: 'manual' });
assert.equal(blogIndex.status, 308); assert.equal(new URL(blogIndex.headers.get('location'), origin).pathname, '/ressources');
assert.equal((await fetch(new URL('/blog/article-inexistant', origin))).status, 404);
assert.match(await (await fetch(new URL('/robots.txt', origin))).text(), /Sitemap: https:\/\/www.essentiademdb.com\/sitemap.xml/);
// Myriam's private writing page answers, but is never listed or advertised.
const ecrire = await fetch(new URL('/ecrire', origin));
assert.equal(ecrire.status, 200, '/ecrire');
assert.match(ecrire.headers.get('x-robots-tag') || '', /noindex/, '/ecrire: noindex header');
assert.equal(ecrire.headers.get('referrer-policy'), 'no-referrer', '/ecrire: no referrer');
assert.match(await ecrire.text(), /name="robots" content="noindex, nofollow/, '/ecrire: noindex tag');
assert.ok(!sitemap.includes('/ecrire'), '/ecrire not in sitemap');
assert.ok(!(await (await fetch(new URL('/robots.txt', origin))).text()).includes('ecrire'), '/ecrire not revealed in robots.txt');
for (const path of ['/og-image.jpg', '/favicon.png', '/images/nature/home.webp']) assert.equal((await fetch(new URL(path, origin))).status, 200);
console.log(`Passed: ${paths.length} routes, ${articles.length} articles, metadata, headers, contact details absent from page code, 404, robots, sitemap and key assets.`);
