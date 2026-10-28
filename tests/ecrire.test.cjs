const { test } = require('node:test');
const assert = require('node:assert/strict');

test('writing page: transfer links carry the text and reject damaged links', async () => {
  const { encodeShare, decodeShare } = await import('../lib/ecrire.js');
  const text = { title: 'Été — « essai »', html: '<p>Bonjour <b>Myriam</b> 🌿</p>'.repeat(50) };
  const code = await encodeShare(text);
  assert.match(code, /^[\w-]+$/, 'safe to put in a link');
  assert.ok(code.length < JSON.stringify(text).length, 'compressed');
  assert.deepEqual(await decodeShare(code), text);
  assert.equal(await decodeShare(code.slice(0, -6)), null);
  assert.equal(await decodeShare('not a code!'), null);
  assert.equal(await decodeShare(''), null);
});

test('writing page: backups are read safely and never overwrite texts', async () => {
  const { readLibrary, mergeLibraries } = await import('../lib/ecrire.js');
  assert.equal(readLibrary(null), null);
  assert.equal(readLibrary({ hello: 1 }), null);
  // Gemini's backup format (an array with "content") is accepted.
  const old = readLibrary([{ id: 'doc_1', title: 'Ancien', content: '<p>x</p>', updatedAt: 5, sources: [
    { type: 'image', name: 'a', data: 'data:image/png;base64,AAAA' },
    { type: 'image', name: 'b', data: 'javascript:alert(1)' },
    { type: 'note', name: 'n', data: 'https://example.com' },
    { type: 'weird', data: 'x' },
  ] }]);
  assert.equal(old.docs[0].html, '<p>x</p>');
  assert.deepEqual(old.docs[0].sources.map((s) => s.name), ['a', 'n'], 'only safe photos and known kinds kept');
  const merged = mergeLibraries([{ id: 'doc_1', title: 'Actuel' }], old.docs);
  assert.equal(merged.length, 2);
  assert.notEqual(merged[0].id, 'doc_1');
  assert.equal(merged[0].title, 'Ancien (copie)');
  assert.equal(merged[1].title, 'Actuel');
});

test('writing page: word counts, daily goal, settings and file names', async () => {
  const { countWords, dailyProgress, readSettings, safeFileName, isWebLink } = await import('../lib/ecrire.js');
  assert.equal(countWords('  Un  deux\ntrois '), 3);
  assert.equal(countWords(''), 0);
  const day = new Date(2026, 9, 28);
  const start = dailyProgress(null, 1200, day);
  assert.deepEqual(start, { daily: { date: '2026-10-28', baseline: 1200 }, written: 0 });
  assert.equal(dailyProgress(start.daily, 1450, day).written, 250);
  assert.equal(dailyProgress(start.daily, 900, day).written, 0, 'deleting a text never goes negative');
  assert.equal(dailyProgress(start.daily, 1450, new Date(2026, 9, 29)).written, 0, 'a new day starts at zero');
  assert.deepEqual(readSettings({ theme: 'nuit', font: 'x', size: 'l', goal: 3 }), { theme: 'nuit', font: 'didot', size: 'l', goal: 500 });
  assert.equal(safeFileName('a/b: c?'), 'a b c');
  assert.equal(safeFileName('   '), 'texte');
  assert.ok(isWebLink('https://essentiademdb.com/a'));
  assert.ok(!isWebLink('javascript:alert(1)'));
});
