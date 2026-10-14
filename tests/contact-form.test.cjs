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
  assert.deepEqual(await response.json(), { ok: true, confirmed: true });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer re_test_key');
  const { RECIPIENT } = await import('../lib/contact-form.js');
  assert.deepEqual(calls[0].body.to, [RECIPIENT]);
  assert.equal(calls[0].body.cc, undefined);
  assert.equal(calls[0].body.from, 'Essentia de Myriam Diougoan Blanch <contact@essentiademdb.com>');
  assert.equal(calls[0].body.reply_to, 'claire@example.com');
  assert.match(calls[0].body.subject, /Claire Martin$/);
  assert.match(calls[0].body.text, /je souhaite un premier échange/);
  // The visitor's acknowledgement: their language, nothing they typed, replies to Myriam.
  const confirmation = calls[1].body;
  assert.deepEqual(confirmation.to, ['claire@example.com']);
  assert.equal(confirmation.cc, undefined);
  assert.equal(confirmation.reply_to, RECIPIENT);
  assert.equal(confirmation.from, 'Essentia de Myriam Diougoan Blanch <contact@essentiademdb.com>');
  assert.equal(confirmation.subject, 'Votre message à Essentia de Myriam Diougoan Blanch');
  assert.doesNotMatch(confirmation.text, /Claire|premier échange/);
  assert.match(confirmation.text, /Cet e-mail automatique/);
  assert.match(confirmation.html, /email\/monogram\.png/);
  assert.match(confirmation.html, />Merci</);
  assert.doesNotMatch(confirmation.html, /Claire|premier échange|claire@example/);
});

test('the confirmation follows the visitor\'s language', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  await POST(post({ ...valid, lang: 'en' }));
  assert.equal(calls[1].body.subject, 'Your message to Essentia de Myriam Diougoan Blanch');
  assert.match(calls[1].body.text, /^Hello,/);
});

test('a failed confirmation does not undo a delivered message', async () => {
  let n = 0;
  global.fetch = async () => (++n === 1 ? new Response('{}', { status: 200 }) : new Response('{}', { status: 500 }));
  const { POST } = await import('../app/api/contact/route.js');
  const realError = console.error; console.error = () => {};
  try {
    const response = await POST(post(valid));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, confirmed: false });
  } finally { console.error = realError; }
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
  assert.equal(calls.length, 10);
});

test('the email wording edited in the CMS is used, with safe fallbacks', async () => {
  const { composeEmail } = await import('../lib/contact-form.js');
  const data = { name: 'Claire Martin', email: 'claire@example.com', message: 'Bonjour Myriam, un message de test.' };
  const custom = composeEmail(data, { wording: { senderName: 'Myriam "Essentia" <x>', subject: 'Demande de {nom}\nvia le site', labelName: 'Personne', footer: 'Merci.' } });
  assert.equal(custom.from, 'Myriam Essentia x <contact@essentiademdb.com>');
  assert.equal(custom.subject, 'Demande de Claire Martin via le site');
  assert.match(custom.text, /^Personne : Claire Martin\n/);
  assert.match(custom.text, /Merci\.$/);
  const empty = composeEmail(data, { wording: { subject: '   ' } });
  assert.equal(empty.subject, 'Nouveau message du site Essentia de Myriam Diougoan Blanch — Claire Martin');
  const contact = require('../content/fr/contact.json');
  assert.equal(composeEmail(data, { wording: contact.email }).subject, contact.email.subject.replace('{nom}', 'Claire Martin'));
});

test('confirmation HTML escapes CMS text', async () => {
  const { composeConfirmation } = await import('../lib/contact-form.js');
  const m = composeConfirmation({ email: 'a@example.com' }, { title: '<b>Merci</b>', subject: 'S', body: 'Un <script>x</script>\n\nFin', notice: 'Note & co' });
  assert.doesNotMatch(m.html, /<script>|<b>Merci/);
  assert.match(m.html, /&lt;script&gt;/);
  assert.match(m.html, /Note &amp; co/);
});

test('test mode routes email and WhatsApp to Antony, and Myriam otherwise', async () => {
  const { TEST_MODE } = await import('../lib/config.js');
  const { RECIPIENT } = await import('../lib/contact-form.js');
  const { CONTACT, reveal } = await import('../lib/contact.js');
  assert.equal(RECIPIENT, TEST_MODE ? ['formations', 'antonyaddy.com'].join('@') : ['mdbchandale', 'gmail.com'].join('@'));
  assert.equal(reveal(CONTACT.wa), TEST_MODE ? ['336', '4982', '9826'].join('') : ['336', '0130', '0642'].join(''));
});
