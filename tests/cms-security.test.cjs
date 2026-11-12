const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('CMS uses scoped DecapBridge PKCE and editorial publishing', async () => {
  const { makeCmsConfig } = await import('../cms/config.js');
  const schema = require('../cms/schema.json');
  const french = Object.fromEntries(fs.readdirSync('content/fr').filter(n => n.endsWith('.json')).map(n => [n.slice(0, -5), require('../content/fr/' + n)]));
  const config = makeCmsConfig(schema, french, require('../content/launch-placeholders.json'), '00000000-0000-0000-0000-000000000001');
  assert.equal(config.backend.repo, 'addyap/essentia-myriam');
  assert.equal(config.backend.branch, 'main');
  assert.equal(config.backend.auth_type, 'pkce');
  assert.equal(config.backend.base_url, 'https://auth.decapbridge.com');
  assert.equal(config.backend.gateway_url, 'https://gateway.decapbridge.com');
  assert.equal(config.publish_mode, 'editorial_workflow');
  assert.equal(config.backend.token, undefined);
  assert.equal(config.backend.access_token, undefined);
});

test('demo CMS cannot use production Git gateway', async () => {
  const { makeCmsConfig } = await import('../cms/config.js');
  const schema = require('../cms/schema.json');
  const french = Object.fromEntries(fs.readdirSync('content/fr').filter(n => n.endsWith('.json')).map(n => [n.slice(0, -5), require('../content/fr/' + n)]));
  const demo = makeCmsConfig(schema, french, require('../content/launch-placeholders.json'), null, true);
  assert.deepEqual(demo.backend, { name: 'essentia-demo' });
  assert.equal(demo.publish_mode, 'simple');
  const editor = fs.readFileSync('public/cms/editor.js', 'utf8');
  assert.match(editor, /if \(data\.demoFiles\)/);
  assert.match(editor, /registerBackend\('essentia-demo'/);
});

test('CMS and uploads retain security response headers', async () => {
  const { default: nextConfig } = await import('../next.config.mjs');
  const rules = await nextConfig.headers();
  const cms = rules.find(r => r.source === '/cms/:path*');
  const uploads = rules.find(r => r.source === '/uploads/:path*');
  const preview = rules.find(r => r.source === '/cms-preview');
  const value = (rule, key) => rule.headers.find(h => h.key === key)?.value || '';
  assert.match(value(cms, 'X-Robots-Tag'), /noindex/);
  assert.match(value(uploads, 'Content-Security-Policy'), /(?:^|;)\s*sandbox(?:;|$)/);
  assert.match(value(uploads, 'Content-Security-Policy'), /default-src 'none'/);
  assert.match(value(preview, 'Content-Security-Policy'), /frame-ancestors 'self'/);
});

test('CMS files do not embed a literal GitHub personal access token', () => {
  const paths = ['cms/config.js', 'cms/environment.js', 'public/cms/editor.js', 'app/api/cms-config/route.js', 'app/admin/page.js'];
  for (const path of paths) {
    const source = fs.readFileSync(path, 'utf8');
    assert.doesNotMatch(source, /\bgh[pousr]_[A-Za-z0-9_]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/, path);
  }
});
