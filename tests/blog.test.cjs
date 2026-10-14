const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('article text keeps formatting and never lets markup or unsafe links through', async () => {
  const { parseBlocks, parseInline, plainText } = await import('../lib/markdown.js');
  const blocks = parseBlocks('## Titre\n\nUn **gras**, de l’*italique* et un [lien](/contact).\n\n> Citation\n\n* un\n* deux\n\n1. a\n2. b\n\n![Photo](/uploads/a.jpg)\n\n---');
  assert.deepEqual(blocks.map(b => b.type), ['heading', 'paragraph', 'quote', 'list', 'list', 'figure', 'rule']);
  assert.equal(blocks[0].level, 2);
  assert.deepEqual(parseBlocks('# Grand titre')[0].level, 2, 'the page title stays the only h1');
  assert.deepEqual(blocks[1].children.map(n => n.type), ['text', 'strong', 'text', 'em', 'text', 'link', 'text']);
  assert.equal(blocks[4].ordered, true);
  assert.deepEqual(blocks[5].image, { type: 'image', src: '/uploads/a.jpg', alt: 'Photo' });

  // Raw HTML is shown as text; dangerous addresses are dropped, keeping their words.
  assert.deepEqual(parseInline('<script>alert(1)</script>'), [{ type: 'text', value: '<script>alert(1)</script>' }]);
  assert.deepEqual(parseInline('[clic](javascript:alert(1))'), [{ type: 'text', value: 'clic' }]);
  assert.deepEqual(parseInline('![x](javascript:alert(1))'), [{ type: 'text', value: 'x' }]);
  assert.deepEqual(parseInline('[a](//evil.example)'), [{ type: 'text', value: 'a' }]);

  // Escapes, intraword underscores and stray asterisks are left as written.
  assert.deepEqual(parseInline('\\*pas\\* snake_case 2 * 3'), [{ type: 'text', value: '*pas* snake_case 2 * 3' }]);
  assert.deepEqual(parseInline('ligne\\\nsuite').map(n => n.type), ['text', 'break', 'text']);
  assert.equal(plainText('Un **mot** et [un lien](https://example.com)'), 'Un mot et un lien');
});

test('articles are read from their files, sorted newest first, and invalid ones skipped', async () => {
  const { getPosts, getPost } = await import('../lib/blog.js');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'essentia-blog-')), cwd = process.cwd();
  process.chdir(root);
  assert.deepEqual(getPosts(), [], 'no folder means no articles');
  const dir = path.join(root, 'content', 'blog');
  fs.mkdirSync(dir, { recursive: true });
  const write = (name, data) => fs.writeFileSync(path.join(dir, name), typeof data === 'string' ? data : JSON.stringify(data));
  write('ancien.json', { title: 'Ancien', date: '2026-01-02', body: 'Texte' });
  write('recent.json', { title: 'Récent', date: '2026-03-04T10:00:00Z', summary: ' Résumé ', image: 'javascript:alert(1)', imageAlt: 'x', body: 'Texte' });
  write('sans-titre.json', { title: ' ', body: 'x' });
  write('casse.json', '{ pas du json');
  write('Mauvais nom!.json', { title: 'Ignoré' });
  write('note.txt', 'ignoré');
  const posts = getPosts();
  assert.deepEqual(posts.map(p => p.slug), ['recent', 'ancien']);
  assert.equal(posts[0].date, '2026-03-04');
  assert.equal(posts[0].summary, 'Résumé');
  assert.equal(posts[0].image, '', 'unsafe cover image dropped');
  assert.equal(posts[0].imageAlt, '');
  assert.equal(getPost('ancien').title, 'Ancien');
  assert.equal(getPost('../secret'), null);
  process.chdir(cwd);
  fs.rmSync(root, { recursive: true });
});

test('published articles in the repository are all valid', async () => {
  const { getPosts } = await import('../lib/blog.js');
  const files = fs.readdirSync('content/blog').filter(name => name.endsWith('.json'));
  assert.equal(getPosts().length, files.length, 'every article file has a title and a valid name');
});
