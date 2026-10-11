const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mount, find } = require('./helpers/mount.cjs');
const fr = require('../content/global/fr.json');
const en = require('../content/global/en.json');
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function provider(pending) {
  return mount('components/Providers.js', 'Providers', { modules: {
    '@/lib/config': { ENABLED_LANGS: ['fr', 'en', 'it', 'es'] },
    '@/content/global/fr.json': fr,
    '@/content/global/en.json': { __esModule: true, default: pending.promise },
  } });
}
test('a late language download cannot overwrite the latest French selection', async () => {
  const pending = deferred(), app = await provider(pending);
  const setLang = app.tree.props.value.setLang;
  const old = setLang('en');
  await setLang('fr'); app.flush();
  pending.resolve(en); await old; app.flush();
  assert.equal(app.tree.props.value.lang, 'fr');
  assert.equal(app.document.documentElement.lang, 'fr');
  app.unmount();
});
test('a failed language download keeps existing content and announces retry', async () => {
  const pending = deferred(), app = await provider(pending);
  const attempt = app.tree.props.value.setLang('en');
  pending.reject(Error('offline')); await attempt; app.flush();
  assert.equal(app.tree.props.value.lang, 'fr');
  assert.ok(find(app.tree, n => n.props.role === 'alert'));
  await app.tree.props.value.setLang('unknown'); app.flush();
  assert.equal(app.tree.props.value.lang, 'fr');
  app.unmount();
});
