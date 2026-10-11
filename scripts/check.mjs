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
