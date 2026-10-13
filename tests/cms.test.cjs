const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const definitions = require('../cms/schema.json');
test('CMS local writes are disabled in production and every Vercel environment', async () => {
  const { cmsEnvironment } = await import('../cms/environment.js');
  for (const env of [ { NODE_ENV: 'production', NEXT_PUBLIC_KEYSTATIC_LOCAL: 'true' }, { NODE_ENV: 'development', VERCEL: '1', NEXT_PUBLIC_KEYSTATIC_LOCAL: 'true' } ]) {
    assert.equal(cmsEnvironment(env).local, false);
    assert.equal(cmsEnvironment(env).available, false);
  }
  assert.equal(cmsEnvironment({ NODE_ENV: 'development', NEXT_PUBLIC_KEYSTATIC_LOCAL: 'true' }).local, true);
  assert.equal(cmsEnvironment({ KEYSTATIC_GITHUB_CLIENT_ID: 'id', KEYSTATIC_GITHUB_CLIENT_SECRET: 'secret', NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: 'app', KEYSTATIC_SECRET: 'short' }).available, false);
});
test('French-only editor schema covers every existing text and preserves section sizes', () => {
  function validate(schema, value) {
    if (schema.type === 'ignored') return;
    if (schema.type === 'text') { assert.equal(typeof value, 'string'); return; }
    if (schema.type === 'array') { assert.equal(schema.length, value.length); value.forEach(item => validate(schema.element, item)); return; }
    assert.deepEqual(Object.keys(schema.fields).sort(), Object.keys(value).sort());
    for (const [key, child] of Object.entries(schema.fields)) validate(child, value[key]);
  }
  const names = fs.readdirSync('content/fr').map(name => name.slice(0,-5));
  assert.deepEqual(names.sort(), Object.keys(definitions).filter(name => name !== 'legalDetails').sort());
  for (const name of names) validate(definitions[name], require('../content/fr/'+name+'.json'));
  validate(definitions.legalDetails, require('../content/launch-placeholders.json'));
  assert.equal(definitions.home.fields.pillars.element.fields.ic.type, 'ignored');
  assert.equal(definitions.home.fields.heroTitle.length, 3);
});
test('Draft preview rejects unsafe refs, keeps icons and ignores structural replacement', async () => {
  const { mergePreview, validBranch } = await import('../cms/preview.js');
  for (const ref of ['main', 'myriam/corrections', 'draft-123']) assert.ok(validBranch(ref));
  for (const ref of ['../secrets', 'https://evil.test', 'x?token=y', 'x//y', 'x\ny']) assert.equal(validBranch(ref), false);
  const base = { title: 'Avant', items: [{ ic: 'heart', t: 'Écoute' }] };
  assert.deepEqual(mergePreview(base, { title: 'Après', items: [{ ic: 'bad', t: 'Respect' }], extra: 'ignored' }), { title: 'Après', items: [{ ic: 'heart', t: 'Respect' }] });
  assert.deepEqual(mergePreview(base, { items: [] }), base);
});

test("CMS serialization preserves intentionally empty text", async () => {
  const { textField } = await import("../cms/fields.js");
  const field = textField({ label: "Texte" });
  assert.deepEqual(field.serialize(""), { value: "" });
  assert.deepEqual(field.serialize(" texte avec espace "), { value: " texte avec espace " });
});
