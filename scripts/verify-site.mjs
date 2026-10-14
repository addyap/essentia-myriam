import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const origin = process.argv[2] || 'http://localhost:3114';
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
  if (path === '/contact' || path === '/rendez-vous') {
    assert.match(html, /href="mailto:mdbchandale@gmail.com"/);
    assert.match(html, /href="tel:\+33601300642"/);
    assert.match(html, /href="https:\/\/wa.me\/(33601300642|33649829826)/);
  }
}
assert.equal((await fetch(new URL('/this-page-does-not-exist', origin))).status, 404);
const sitemap = await (await fetch(new URL('/sitemap.xml', origin))).text();
for (const path of paths.filter(path => path !== '/ressources')) assert.ok(sitemap.includes(`https://www.essentiademdb.com${path === '/' ? '' : path}`));
assert.ok(!sitemap.includes('/ressources'), 'unpublished resources excluded from sitemap');
const resources = await (await fetch(new URL('/ressources', origin))).text();
assert.match(resources, /name="robots" content="noindex, follow"/);
assert.match(await (await fetch(new URL('/robots.txt', origin))).text(), /Sitemap: https:\/\/www.essentiademdb.com\/sitemap.xml/);
for (const path of ['/og-image.jpg', '/favicon.png', '/images/nature/home.webp']) assert.equal((await fetch(new URL(path, origin))).status, 200);
console.log(`Passed: ${paths.length} routes, metadata, headers, server-rendered contacts, 404, robots, sitemap and key assets.`);
