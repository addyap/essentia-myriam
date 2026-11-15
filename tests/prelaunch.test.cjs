const { test } = require('node:test');
const assert = require('node:assert/strict');

async function load() {
  const { proxy } = await import('../proxy.js');
  const call = async (path, init = {}) => (await proxy(new Request(new URL(path, 'https://www.essentiademdb.com'), init))) || new Response('site');
  return { call };
}
const isSoon = async (response) => (await response.text()).includes('Bientôt en ligne');

test('before launch every page shows "launching soon" in French and Italian, never listed', async () => {
  process.env.SITE_PASSWORD = 'mot-de-passe-test';
  const { call } = await load();
  for (const path of ['/', '/ressources', '/blog/un-article', '/sitemap.xml', '/myriam.jpg', '/cms-preview']) {
    const response = await call(path);
    assert.equal(response.headers.get('x-robots-tag')?.startsWith('noindex'), true, path);
    assert.equal(response.headers.get('cache-control'), 'no-store', path);
    const html = await response.text();
    assert.ok(html.includes('Bientôt en ligne') && html.includes('Presto online'), path);
  }
});

test('the CMS, its preview frame and Myriam’s writing page stay reachable', async () => {
  process.env.SITE_PASSWORD = 'mot-de-passe-test';
  const { call } = await load();
  for (const path of ['/cms/index.html', '/admin', '/api/cms-config', '/ecrire', '/api/ecrire', '/uploads/photo.jpg', '/robots.txt'])
    assert.equal(await isSoon(await call(path)), false, path);
  const framed = await call('/cms-preview', { headers: { 'sec-fetch-dest': 'iframe', 'sec-fetch-site': 'same-origin' } });
  assert.equal(await isSoon(framed), false);
});

test('only the right password opens the site, and only towards this site', async () => {
  process.env.SITE_PASSWORD = 'mot-de-passe-test';
  const { call } = await load();
  const post = (password, next) => call('/acces-prive', { method: 'POST', body: new URLSearchParams({ password, next }) });
  assert.equal((await post('faux', '/')).status, 401);
  const ok = await post('mot-de-passe-test', '/ressources');
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get('location'), 'https://www.essentiademdb.com/ressources');
  const cookie = ok.headers.get('set-cookie').split(';')[0];
  assert.equal(await isSoon(await call('/ressources', { headers: { cookie } })), false);
  assert.equal((await post('mot-de-passe-test', '//evil.example')).headers.get('location'), 'https://www.essentiademdb.com/');
  // A cookie from an old password no longer works once the password changes.
  process.env.SITE_PASSWORD = 'nouveau';
  assert.equal(await isSoon(await call('/ressources', { headers: { cookie } })), true);
});

test('a deployment without a password stays closed to everyone', async () => {
  delete process.env.SITE_PASSWORD;
  const env = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
  const { call } = await load();
  assert.equal(await isSoon(await call('/')), true);
  const post = await call('/acces-prive', { method: 'POST', body: new URLSearchParams({ password: '', next: '/' }) });
  assert.equal(post.status, 401);
  process.env.NODE_ENV = env;
});
