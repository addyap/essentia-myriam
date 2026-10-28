const { test } = require('node:test');
const assert = require('node:assert/strict');

test('sync: one passphrase gives the same secrets everywhere, however it is typed', async () => {
  const { deriveSecrets, phraseProblem } = await import('../lib/ecrire-sync.js');
  const a = await deriveSecrets('Le jardin de ma grand-mère en avril');
  const b = await deriveSecrets('  le jardin  de ma Grand-mère en avril ');
  assert.deepEqual(a, b);
  assert.notEqual(a.key, a.access, 'the lock key and the access secret are unrelated');
  assert.match(a.access, /^[\w-]{43}$/);
  assert.notDeepEqual(await deriveSecrets('le jardin de ma grand-mère en mai'), a);
  assert.ok(phraseProblem('trop court'));
  assert.ok(phraseProblem('un deux trois six')); // 4 words but under 20 characters
  assert.equal(phraseProblem('le jardin de ma grand-mère'), null);
});

test('sync: a locked notebook opens only with its own key and hides its words', async () => {
  const { deriveSecrets, lockVault, unlockVault } = await import('../lib/ecrire-sync.js');
  const { key } = await deriveSecrets('le jardin de ma grand-mère en avril');
  const other = await deriveSecrets('une autre phrase tout à fait différente');
  const vault = { version: 1, docs: [{ id: 'a', title: 'Confidentiel', html: '<p>Mon secret</p>', updatedAt: 1 }], deleted: {} };
  const locked = await lockVault(vault, key);
  assert.equal(locked[0], 1);
  assert.ok(!Buffer.from(locked).toString('latin1').includes('secret'));
  assert.notDeepEqual(await lockVault(vault, key), locked, 'a fresh nonce every time');
  assert.deepEqual(await unlockVault(locked, key), vault);
  await assert.rejects(unlockVault(locked, other.key));
  const tampered = new Uint8Array(locked); tampered[20] ^= 1;
  await assert.rejects(unlockVault(tampered, key));
});

test('sync: merging keeps the newest version of each text and honours deletions', async () => {
  const { mergeVaults, vaultStamp } = await import('../lib/ecrire-sync.js');
  const now = Date.now();
  const doc = (id, t, title = id) => ({ id, title, html: '', updatedAt: now - 1000 + t });
  const laptop = { docs: [doc('a', 5, 'A laptop'), doc('b', 1), doc('c', 1)], deleted: {} };
  const phone = { docs: [doc('a', 9, 'A phone'), doc('b', 1), doc('d', 2)], deleted: { c: now - 500 } };
  const merged = mergeVaults(laptop, phone, now);
  assert.deepEqual(merged.docs.map((d) => d.id).sort(), ['a', 'b', 'd']);
  assert.equal(merged.docs.find((d) => d.id === 'a').title, 'A phone');
  // A text edited after it was deleted elsewhere comes back.
  const revived = mergeVaults({ docs: [doc('c', 900)], deleted: {} }, phone, now);
  assert.ok(revived.docs.some((d) => d.id === 'c'));
  assert.equal(vaultStamp(mergeVaults(merged, merged, now)), vaultStamp(merged));
});

test('sync route: stores only locked copies, refuses other sites, and never lets one device overwrite another', async () => {
  process.env.ECRIRE_MEMORY_STORE = '1';
  delete process.env.BLOB_READ_WRITE_TOKEN;
  const { GET, PUT } = await import('../app/api/ecrire/route.js');
  const access = 'A'.repeat(43);
  const req = (method, headers = {}, body) => new Request('https://www.essentiademdb.com/api/ecrire', { method, body, headers: { 'x-ecrire-access': access, ...headers } });
  const locked = (n) => { const b = new Uint8Array(40); b[0] = 1; b[5] = n; return b; };

  assert.equal((await GET(req('GET'))).status, 404);
  assert.equal((await GET(req('GET', { 'x-ecrire-access': 'short' }))).status, 400);
  assert.equal((await GET(req('GET', { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }))).status, 403);
  assert.equal((await PUT(req('PUT', {}, '{"plain":"text"}'))).status, 400, 'unlocked data refused');

  const first = await PUT(req('PUT', {}, locked(1)));
  assert.equal(first.status, 200);
  const v1 = first.headers.get('x-ecrire-version');
  assert.equal((await PUT(req('PUT', {}, locked(2)))).status, 409, 'a second new copy cannot replace the first');
  const read = await GET(req('GET'));
  assert.equal(read.headers.get('x-ecrire-version'), v1);
  assert.equal(new Uint8Array(await read.arrayBuffer())[5], 1);
  assert.equal((await GET(req('GET', { 'x-ecrire-known': v1 }))).status, 204, 'nothing new to download');

  const second = await PUT(req('PUT', { 'x-ecrire-base': v1 }, locked(3)));
  assert.equal(second.status, 200);
  assert.equal((await PUT(req('PUT', { 'x-ecrire-base': v1 }, locked(4)))).status, 409, 'a device working from an old copy must merge first');
  assert.equal((await PUT(req('PUT', {}, new Uint8Array(4_000_001)))).status, 413);
  delete process.env.ECRIRE_MEMORY_STORE;
  assert.equal((await GET(req('GET'))).status, 503, 'without storage configured, sync says so');
});
