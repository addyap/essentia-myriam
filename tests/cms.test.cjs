const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const definitions = require('../cms/schema.json');
const french = Object.fromEntries(fs.readdirSync('content/fr').map(name => [name.slice(0,-5), require('../content/fr/'+name)]));
test('Live CMS access requires a valid bridge ID', async () => {
  const { cmsEnvironment, EDITOR_EMAIL } = await import('../cms/environment.js');
  assert.equal(EDITOR_EMAIL,'mdbchandale@gmail.com');
  assert.equal(cmsEnvironment({ DECAPBRIDGE_SITE_ID:'../bad' }).configured,false);
  assert.equal(cmsEnvironment({ DECAPBRIDGE_SITE_ID:'00000000-0000-0000-0000-000000000001' }).configured,true);
});
test('French editor schema covers every text without exposing translations', async () => {
  const { makeCmsConfig } = await import('../cms/config.js');
  const config = makeCmsConfig(definitions,french,require('../content/launch-placeholders.json'),'00000000-0000-0000-0000-000000000001');
  assert.equal(config.locale,'fr'); assert.equal(config.publish_mode,'editorial_workflow');
  assert.equal(config.backend.name,'git-gateway');
  assert.equal(config.backend.auth_type,'pkce');
  assert.equal(config.backend.base_url,'https://auth.decapbridge.com');
  assert.equal(config.backend.auth_endpoint,'/sites/00000000-0000-0000-0000-000000000001/pkce');
  assert.equal(config.backend.auth_token_endpoint,'/sites/00000000-0000-0000-0000-000000000001/token');
  assert.equal(config.backend.identity_url,undefined);
  const files=config.collections.flatMap(c=>c.files);
  assert.equal(files.length,Object.keys(french).length+1);
  assert.ok(files.every(f=>f.file.startsWith('content/fr/') || f.file==='content/launch-placeholders.json'));
  const home=files.find(f=>f.name==='home');
  const title=home.fields.find(f=>f.name==='heroTitle');assert.equal(title.min,3);assert.equal(title.max,3);assert.equal(title.allow_add,false);assert.equal(title.field.required,false);
  assert.equal(home.fields.find(f=>f.name==='pillars').fields.find(f=>f.name==='ic').widget,'hidden');
});
test('Draft preview applies only known text and preserves icons and section sizes', async () => {
  const { mergePreview } = await import('../cms/preview.js');
  const base={title:'Avant',items:[{ic:'heart',t:'Écoute'}]};
  assert.deepEqual(mergePreview(base,{title:'Après',items:[{ic:'bad',t:'Respect'}],extra:'ignored'}),{title:'Après',items:[{ic:'heart',t:'Respect'}]});
  assert.deepEqual(mergePreview(base,{items:[]}),base);
});

test('Demonstration config has no gateway or identity endpoint and uses only browser memory', async () => {
  const { makeCmsConfig } = await import('../cms/config.js');
  const demo = makeCmsConfig(definitions, french, require('../content/launch-placeholders.json'), null, true);
  assert.deepEqual(demo.backend, {name:'essentia-demo'});
  assert.equal(demo.locale,'fr');
});
