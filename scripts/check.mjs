import { readdir, readFile } from 'node:fs/promises';
import { transform, loadBindings } from 'next/dist/build/swc/index.js';
await loadBindings();
let count = 0;
async function check(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await check(path);
    else if (/\.jsx?$/.test(path)) {
      await transform(await readFile(path, 'utf8'), { filename: path, jsc: { parser: { syntax: 'ecmascript', jsx: true } } });
      count++;
    } else if (path.endsWith('.json')) JSON.parse(await readFile(path, 'utf8'));
  }
}
for (const dir of ['app', 'components', 'lib', 'content']) await check(dir);
console.log(`Syntax and content check passed: ${count} JavaScript files. This is not an ESLint audit.`);

// Every enabled locale must expose the same content shape.
const french = JSON.parse(await readFile('content/global/fr.json', 'utf8'));
const keys = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' && !Array.isArray(child) ? keys(child, path) : [path];
}).sort();
for (const lang of ['en', 'it', 'es']) {
  const translated = JSON.parse(await readFile(`content/global/${lang}.json`, 'utf8'));
  if (JSON.stringify(keys(french)) !== JSON.stringify(keys(translated))) throw new Error(`Translation key mismatch: ${lang}`);
}
console.log('Translation keys match across all four languages.');
