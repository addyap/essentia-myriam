const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { transform, loadBindings } = require('next/dist/build/swc');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Built from parts so this public file holds no harvestable address or number.
const MYRIAM_EMAIL = ['mdbchandale', 'gmail.com'].join('@');
const MYRIAM_PHONE = ['+33 (0)6', '01 30', '06 42'].join(' ');
const MYRIAM_WA = ['336', '0130', '0642'].join('');
const ANTONY_WA = ['336', '4982', '9826'].join('');

async function load() {
  await loadBindings();
  const { reveal, scramble } = await import('../lib/contact.js');
  const { code } = await transform(fs.readFileSync('components/RevealContact.js', 'utf8'), {
    filename: 'RevealContact.js', jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' },
  });
  const exports = {};
  const shim = (name) => (name === '@/lib/contact' ? { reveal } : require(name));
  vm.runInNewContext(code, { exports, require: shim, atob, btoa });
  return { ...exports, scramble };
}

test('page code holds a contact-page link and no address or number', async () => {
  const { RevealContact, RevealText, scramble } = await load();
  const html = [
    renderToStaticMarkup(React.createElement(RevealContact, { kind: 'email', enc: scramble(MYRIAM_EMAIL) })),
    renderToStaticMarkup(React.createElement(RevealContact, { kind: 'wa', enc: scramble(MYRIAM_WA), waText: 'Bonjour' }, 'WhatsApp')),
    renderToStaticMarkup(React.createElement(RevealText, { kind: 'tel', enc: scramble(MYRIAM_PHONE) })),
  ].join('');
  assert.doesNotMatch(html, /mdbchandale|gmail|mailto:|tel:|wa\.me/);
  for (const detail of [MYRIAM_WA, MYRIAM_PHONE.slice(-11)]) assert.ok(!html.includes(detail));
  assert.match(html, /href="\/contact"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('links become the real destinations when used', async () => {
  const { contactUrl, displayValue } = await load();
  assert.equal(contactUrl('tel', MYRIAM_PHONE), `tel:+${MYRIAM_WA}`);
  assert.equal(contactUrl('email', MYRIAM_EMAIL), `mailto:${MYRIAM_EMAIL}`);
  assert.equal(contactUrl('wa', MYRIAM_WA, 'Bonjour Myriam'), `https://wa.me/${MYRIAM_WA}?text=Bonjour%20Myriam`);
  assert.equal(contactUrl('wa', ''), '/contact');
  assert.equal(displayValue('tel', MYRIAM_PHONE), MYRIAM_PHONE.replace('(0)', '').replace(/\s+/g, ' '));
});

test('stored contact details unscramble to the right values', async () => {
  const { CONTACT, reveal } = await import('../lib/contact.js');
  const { TEST_MODE } = await import('../lib/config.js');
  assert.equal(reveal(CONTACT.email), MYRIAM_EMAIL);
  assert.equal(reveal(CONTACT.phone), MYRIAM_PHONE);
  assert.equal(reveal(CONTACT.wa), TEST_MODE ? ANTONY_WA : MYRIAM_WA);
});
