const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { transform, loadBindings } = require('next/dist/build/swc');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
async function component() {
  await loadBindings();
  const { code } = await transform(fs.readFileSync('components/RevealContact.js', 'utf8'), {
    filename: 'RevealContact.js', jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' },
  });
  const exports = {};
  vm.runInNewContext(code, { exports, require, Buffer });
  return exports.RevealContact;
}
test('public contact links render actionable destinations before hydration', async () => {
  const Contact = await component();
  const render = (kind, value, extra = {}) => renderToStaticMarkup(React.createElement(Contact, {
    kind, enc: Buffer.from(value).toString('base64'), ...extra,
  }, 'Contact'));
  assert.match(render('tel', '+33 (0)6 01 30 06 42'), /href="tel:\+33601300642"/);
  assert.match(render('email', 'mdbchandale@gmail.com'), /href="mailto:mdbchandale@gmail.com"/);
  const wa = render('wa', '+33 6 01 30 06 42', { waText: 'Bonjour Myriam' });
  assert.match(wa, /href="https:\/\/wa.me\/33601300642\?text=Bonjour%20Myriam"/);
  assert.match(wa, /rel="noopener noreferrer"/);
});
