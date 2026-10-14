const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const valid = { name: 'Claire Martin', email: 'claire@example.com', message: 'Bonjour Myriam, je souhaite un premier échange.', lang: 'fr', elapsedMs: 9000 };
let ip = 0;
const post = (body, address = `203.0.113.${++ip}`) => new Request('https://www.essentiademdb.com/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-forwarded-for': address },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

let calls, realFetch, realKey;
beforeEach(() => {
  calls = []; realFetch = global.fetch; realKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test_key';
  global.fetch = async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return new Response('{"id":"x"}', { status: 200 }); };
});
afterEach(() => {
  global.fetch = realFetch;
  if (realKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = realKey;
});

test('validation trims input, keeps names on one line and rejects bad fields', async () => {
  const { validateContact } = await import('../lib/contact-form.js');
  const ok = validateContact({ name: '  Claire\nMartin ', email: ' claire@example.com ', message: ' Un message assez long. ' });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.data, { name: 'Claire Martin', email: 'claire@example.com', message: 'Un message assez long.' });
  assert.deepEqual(Object.keys(validateContact({ name: '', email: 'nope', message: 'court' }).errors).sort(), ['email', 'message', 'name']);
  assert.equal(validateContact({ ...valid, message: 'x'.repeat(5001) }).ok, false);
});

test('a valid message is sent to Myriam, with the visitor as reply-to', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const response = await POST(post(valid));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer re_test_key');
  assert.deepEqual(calls[0].body.to, ['mdbchandale@gmail.com']);
  assert.equal(calls[0].body.from, 'Essentia <contact@essentiademdb.com>');
  assert.equal(calls[0].body.reply_to, 'claire@example.com');
  assert.match(calls[0].body.subject, /Claire Martin$/);
  assert.match(calls[0].body.text, /je souhaite un premier échange/);
});

test('without an API key the form reports unavailable and sends nothing', async () => {
  delete process.env.RESEND_API_KEY;
  const { POST } = await import('../app/api/contact/route.js');
  assert.equal((await POST(post(valid))).status, 503);
  assert.equal(calls.length, 0);
});

test('bots are answered as if sent, but nothing is sent', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  for (const body of [{ ...valid, website: 'https://spam.example' }, { ...valid, elapsedMs: 800 }]) {
    const response = await POST(post(body));
    assert.equal(response.status, 200);
  }
  assert.equal(calls.length, 0);
});

test('invalid input and malformed JSON are rejected without sending', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const bad = await POST(post({ ...valid, email: 'not-an-email' }));
  assert.equal(bad.status, 400);
  assert.deepEqual((await bad.json()).fields, ['email']);
  assert.equal((await POST(post('{oops'))).status, 400);
  assert.equal(calls.length, 0);
});

test('a Resend failure is reported so the visitor can use the direct links', async () => {
  global.fetch = async () => new Response('{"message":"domain not verified"}', { status: 403 });
  const { POST } = await import('../app/api/contact/route.js');
  const realError = console.error; console.error = () => {};
  try { assert.equal((await POST(post(valid))).status, 502); } finally { console.error = realError; }
});

test('one address is limited to five messages in ten minutes', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push((await POST(post(valid, '198.51.100.7'))).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
  assert.equal(calls.length, 5);
});
