const { test } = require('node:test');
const assert = require('node:assert/strict');

async function load() {
  const { proxy, limits, resetGuessLimits } = await import('../proxy.js');
  limits.wrongDelayMs = 0; resetGuessLimits();
  process.env.FORM_SECRET = 'x'.repeat(40);
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
    assert.ok(html.includes('Bientôt <em>en ligne</em>') && html.includes('Presto <em>online</em>'), path);
  }
});

test('the CMS, its preview frame and Myriam’s writing page stay reachable', async () => {
  process.env.SITE_PASSWORD = 'mot-de-passe-test';
  const { call } = await load();
  for (const path of ['/cms/index.html', '/admin', '/api/cms-config', '/ecrire', '/api/ecrire', '/uploads/photo.jpg', '/robots.txt', '/prelaunch/forest.webp', '/prelaunch/didot.woff2'])
    assert.equal(await isSoon(await call(path)), false, path);
  const framed = await call('/cms-preview', { headers: { 'sec-fetch-dest': 'iframe', 'sec-fetch-site': 'same-origin' } });
  assert.equal(await isSoon(framed), false);
  // The hero videos play in the preview, but are not handed out to a visitor typing their address.
  const media = { 'sec-fetch-site': 'same-origin' };
  assert.equal(await isSoon(await call('/videos/fog-hillside.mp4', { headers: { ...media, 'sec-fetch-dest': 'video' } })), false);
  assert.equal(await isSoon(await call('/images/nature/home.webp', { headers: { ...media, 'sec-fetch-dest': 'image' } })), false);
  assert.equal(await isSoon(await call('/videos/fog-hillside.mp4', { headers: { 'sec-fetch-dest': 'document', 'sec-fetch-site': 'none' } })), true);
});

test('only the right password opens the site, and only towards this site', async () => {
  process.env.SITE_PASSWORD = 'mot-de-passe-test';
  const { call } = await load();
  const post = (password, next) => call('/acces-prive', { method: 'POST', body: new URLSearchParams({ password, next }) });
  assert.equal((await post('faux', '/')).status, 401);
  assert.equal((await post('  mot-de-passe-test\n', '/')).status, 303, 'spaces around the password are ignored');
  const ok = await post('mot-de-passe-test', '/ressources');
  assert.equal(ok.status, 303);
  assert.equal(ok.headers.get('location'), 'https://www.essentiademdb.com/ressources');
  const cookie = ok.headers.get('set-cookie').split(';')[0];
  assert.equal(await isSoon(await call('/ressources', { headers: { cookie } })), false);
  assert.equal((await post('mot-de-passe-test', '//evil.example')).headers.get('location'), 'https://www.essentiademdb.com/');
  // Forged, tampered, expired and old-style cookies are refused.
  const [, , value] = cookie.match(/^([^=]+)=(.*)$/);
  const parts = value.split('.');
  for (const bad of ['v2.9999999999.forged', `v2.${Number(parts[1]) + 1}.${parts[2]}`, 'v2.1000000000.' + parts[2], 'a'.repeat(64)])
    assert.equal(await isSoon(await call('/ressources', { headers: { cookie: `essentia-preview=${bad}` } })), true, bad);
  // Without the server secret, a cookie cannot be made even knowing the password.
  process.env.FORM_SECRET = 'y'.repeat(40);
  assert.equal(await isSoon(await call('/ressources', { headers: { cookie } })), true, 'secret change revokes cookies');
  process.env.FORM_SECRET = 'x'.repeat(40);
  assert.equal(await isSoon(await call('/ressources', { headers: { cookie } })), false);
  // A cookie from an old password no longer works once the password changes.
  process.env.SITE_PASSWORD = 'nouveau';
  assert.equal(await isSoon(await call('/ressources', { headers: { cookie } })), true);
});

test('a deployment without a password stays closed to everyone', async () => {
  delete process.env.SITE_PASSWORD;
  const env = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
  const { call } = await load();
  assert.equal(await isSoon(await call('/')), true);
  const post = await call('/acces-prive', { method: 'POST', body: new URLSearchParams({ password: 'x', next: '/' }) });
  assert.equal(post.status, 503, 'a missing password is reported, not mistaken for a wrong one');
  assert.equal(post.headers.get('x-private-access'), 'not-configured');
  assert.match(await post.text(), /non configuré/);
  process.env.NODE_ENV = env;
});

test('repeated wrong guesses from one address are refused for a while', async () => {
  process.env.SITE_PASSWORD = 'mot-de-passe-test';
  const { call } = await load();
  const post = (password, ip) => call('/acces-prive', { method: 'POST', headers: { 'x-real-ip': ip }, body: new URLSearchParams({ password, next: '/' }) });
  for (let i = 0; i < 5; i++) assert.equal((await post('faux', '1.1.1.1')).status, 401);
  const refused = await post('mot-de-passe-test', '1.1.1.1');
  assert.equal(refused.status, 429, 'even the right password waits once the limit is hit');
  assert.match(await refused.text(), /Trop d’essais/);
  assert.equal((await post('mot-de-passe-test', '2.2.2.2')).status, 303, 'other addresses are unaffected');
});
