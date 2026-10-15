const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const valid = { name: 'Claire Martin', email: 'claire@example.com', message: 'Bonjour Myriam, je souhaite un premier échange.', lang: 'fr' };
let ip = 0;
// Every visitor gets a different email address unless a test says otherwise,
// so the one-acknowledgement-per-day rule does not leak between tests.
let visitor = 0;
const fresh = (body) => ({ ...body, email: body.email === valid.email ? `claire${++visitor}@example.com` : body.email });
// Signs a token opened `age` ms ago and solves the puzzle for this message, as the browser does.
async function signed(body, { age = 10000, proof = true } = {}) {
  const { formSecret, issueToken } = await import('../lib/form-token.js');
  const { validateContact } = await import('../lib/contact-rules.js');
  const { messageDigest, solveProof } = await import('../lib/proof.js');
  const token = issueToken(formSecret(), Date.now() - age);
  const { data } = validateContact(body);
  return { ...body, token, proof: proof ? await solveProof(token.split('.')[1], await messageDigest(data)) : 0 };
}
const request = (body, address = `203.0.113.${++ip}`, headers = {}) => new Request('https://www.essentiademdb.com/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-forwarded-for': address, ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});
const post = async (body, address, headers) => request(typeof body === 'string' ? body : await signed(body), address, headers);

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
  const response = await POST(await post(valid));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, confirmed: true });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer re_test_key');
  const { CONTACT_TO } = await import('../lib/contact-form.js');
  assert.deepEqual(calls[0].body.to, [CONTACT_TO]);
  assert.equal(calls[0].body.cc, undefined);
  assert.equal(calls[0].body.from, 'Essentia de Myriam Diougoan Blanch <contact@essentiademdb.com>');
  assert.equal(calls[0].body.reply_to, 'claire@example.com');
  assert.match(calls[0].body.subject, /Claire Martin$/);
  assert.match(calls[0].body.text, /je souhaite un premier échange/);
  // The visitor's acknowledgement: their language, nothing they typed, replies to Myriam.
  const confirmation = calls[1].body;
  assert.deepEqual(confirmation.to, ['claire@example.com']);
  assert.equal(confirmation.cc, undefined);
  assert.equal(confirmation.reply_to, CONTACT_TO);
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
  await POST(await post(fresh({ ...valid, lang: 'en' })));
  assert.equal(calls[1].body.subject, 'Your message to Essentia de Myriam Diougoan Blanch');
  assert.match(calls[1].body.text, /^Hello,/);
});

test('a failed confirmation does not undo a delivered message', async () => {
  let n = 0;
  global.fetch = async () => (++n === 1 ? new Response('{}', { status: 200 }) : new Response('{}', { status: 500 }));
  const { POST } = await import('../app/api/contact/route.js');
  const realError = console.error; console.error = () => {};
  try {
    const response = await POST(await post(fresh(valid)));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, confirmed: false });
  } finally { console.error = realError; }
});

test('without an API key the form reports unavailable and sends nothing', async () => {
  delete process.env.RESEND_API_KEY;
  const { POST } = await import('../app/api/contact/route.js');
  assert.equal((await POST(request(valid))).status, 503);
  assert.equal(calls.length, 0);
});

test('bots are answered as if sent, but nothing is sent', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const bodies = [
    await signed({ ...valid, website: 'https://spam.example' }), // hidden field filled
    valid, // never loaded the page: no token
    { ...valid, token: '1760000000000.abc.forged', proof: 1 }, // forged token
    await signed(valid, { age: 800 }), // sent within three seconds of opening
    await signed(valid, { proof: false }), // puzzle not solved
  ];
  for (const body of bodies) assert.equal((await POST(request(body))).status, 200);
  assert.equal(calls.length, 0);
});

test('a puzzle solved for one message cannot carry another', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const body = await signed(valid);
  assert.equal((await POST(request({ ...body, message: 'Un tout autre message, envoyé en masse.' }))).status, 200);
  assert.equal(calls.length, 0);
});

test('a token can be used only once', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const body = await signed(valid);
  await POST(request(body)); const sent = calls.length;
  assert.equal((await POST(request(body))).status, 200);
  assert.equal(calls.length, sent, 'replayed submission sends nothing');
});

test('an expired token asks the form to fetch a new one', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const response = await POST(request(await signed(valid, { age: 25 * 60 * 60 * 1000 })));
  assert.equal(response.status, 409);
  assert.equal(calls.length, 0);
});

test('submissions from other websites are refused', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  assert.equal((await POST(await post(valid, undefined, { 'sec-fetch-site': 'cross-site' }))).status, 403);
  assert.equal((await POST(await post(valid, undefined, { origin: 'https://evil.example', host: 'www.essentiademdb.com' }))).status, 403);
  assert.equal((await POST(await post(valid, undefined, { 'sec-fetch-site': 'same-origin', origin: 'https://www.essentiademdb.com', host: 'www.essentiademdb.com' }))).status, 200);
});

test('messages full of links are refused with a reason; a link skips the acknowledgement', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const spam = await POST(await post({ ...valid, message: 'Promo http://a.example http://b.example http://c.example' }));
  assert.equal(spam.status, 400);
  assert.deepEqual((await spam.json()).fields, ['links']);
  assert.equal(calls.length, 0);
  const one = await POST(await post(fresh({ ...valid, message: 'Bonjour, voici mon site : https://claire.example' })));
  assert.deepEqual(await one.json(), { ok: true, confirmed: false });
  assert.equal(calls.length, 1, 'Myriam gets the message, nobody gets an acknowledgement');
});

test('an address receives at most one acknowledgement a day', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const body = { ...valid, email: 'repeat@example.com' };
  assert.deepEqual(await (await POST(await post(body))).json(), { ok: true, confirmed: true });
  assert.deepEqual(await (await POST(await post(body))).json(), { ok: true, confirmed: false });
  assert.equal(calls.length, 3);
});

test('invalid input and malformed JSON are rejected without sending', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const bad = await POST(await post({ ...valid, email: 'not-an-email' }));
  assert.equal(bad.status, 400);
  assert.deepEqual((await bad.json()).fields, ['email']);
  assert.equal((await POST(await post('{oops'))).status, 400);
  assert.equal(calls.length, 0);
});

test('a Resend failure is reported so the visitor can use the direct links', async () => {
  global.fetch = async () => new Response('{"message":"domain not verified"}', { status: 403 });
  const { POST } = await import('../app/api/contact/route.js');
  const realError = console.error; console.error = () => {};
  try { assert.equal((await POST(await post(valid))).status, 502); } finally { console.error = realError; }
});

test('one address is limited to five messages in ten minutes', async () => {
  const { POST } = await import('../app/api/contact/route.js');
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push((await POST(await post(fresh(valid), '198.51.100.7'))).status);
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

test('form emails and WhatsApp go to Myriam', async () => {
  const { CONTACT_TO } = await import('../lib/contact-form.js');
  const { CONTACT, reveal } = await import('../lib/contact.js');
  assert.equal(CONTACT_TO, ['mdbchandale', 'gmail.com'].join('@'));
  assert.equal(reveal(CONTACT.wa), ['336', '0130', '0642'].join(''));
});

test('form tokens are signed, timed and tied to the server secret', async () => {
  const { issueToken, checkToken, formSecret } = await import('../lib/form-token.js');
  const now = Date.now();
  const token = issueToken('a'.repeat(32), now - 5000);
  assert.equal(checkToken(token, 'a'.repeat(32), now).ok, true);
  assert.equal(checkToken(token, 'b'.repeat(32), now).reason, 'forged');
  const [iat, nonce, sig] = token.split('.');
  assert.equal(checkToken(`${iat}.${nonce}x.${sig}`, 'a'.repeat(32), now).reason, 'forged');
  assert.equal(checkToken(`${Number(iat) - 60000}.${nonce}.${sig}`, 'a'.repeat(32), now).reason, 'forged', 'cannot backdate');
  assert.equal(checkToken(issueToken('a'.repeat(32), now - 1000), 'a'.repeat(32), now).reason, 'early');
  assert.equal(checkToken(undefined, 'a'.repeat(32), now).reason, 'forged');
  // A dedicated FORM_SECRET wins; otherwise one is derived from the Resend key.
  assert.equal(formSecret({ FORM_SECRET: 's'.repeat(40), RESEND_API_KEY: 're_x' }), 's'.repeat(40));
  assert.notEqual(formSecret({ RESEND_API_KEY: 're_x' }), 're_x');
  assert.equal(formSecret({}), null);
});

test('the token endpoint hands out fresh tokens and the puzzle size', async () => {
  const { GET } = await import('../app/api/contact/token/route.js');
  const a = await (await GET()).json(), b = await (await GET()).json();
  assert.match(a.token, /^\d{13}\.[\w-]+\.[\w-]+$/);
  assert.notEqual(a.token, b.token);
  assert.equal(a.bits, 13);
});
