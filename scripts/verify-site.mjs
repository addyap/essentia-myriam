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
  if (path === '/contact' || path === '/rendez-vous') assert.match(html, /<a[^>]*target="_blank"[^>]*href="\/contact"|<a[^>]*href="\/contact"[^>]*target="_blank"/, `${path}: WhatsApp link present`);
}
assert.equal((await fetch(new URL('/this-page-does-not-exist', origin))).status, 404);
const sitemap = await (await fetch(new URL('/sitemap.xml', origin))).text();
for (const path of paths.filter(path => path !== '/ressources')) assert.ok(sitemap.includes(`https://www.essentiademdb.com${path === '/' ? '' : path}`));
assert.ok(!sitemap.includes('/ressources'), 'unpublished resources excluded from sitemap');
const resources = await (await fetch(new URL('/ressources', origin))).text();
assert.match(resources, /name="robots" content="noindex, follow"/);
assert.match(await (await fetch(new URL('/robots.txt', origin))).text(), /Sitemap: https:\/\/www.essentiademdb.com\/sitemap.xml/);
for (const path of ['/og-image.jpg', '/favicon.png', '/images/nature/home.webp']) assert.equal((await fetch(new URL(path, origin))).status, 200);
console.log(`Passed: ${paths.length} routes, metadata, headers, contact details absent from page code, 404, robots, sitemap and key assets.`);
