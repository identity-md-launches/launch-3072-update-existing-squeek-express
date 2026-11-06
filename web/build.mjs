import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

// A dependency-free production build: the release uses native browser modules.
// Keep the list explicit so temporary files can never enter the static export.
const root = new URL('../', import.meta.url);
const files = [
  ['index.html', 'src/index.html'],
  ['style.css', 'src/style.css'],
  ['app.js', 'src/app.js'],
  ['engine.mjs', 'src/engine.mjs'],
  ['profiles.mjs', 'src/profiles.mjs'],
  ['scene.mjs', 'src/scene.mjs'],
  ['favicon.svg', 'public/favicon.svg'],
  ['share.png', 'public/share.png'],
];

const inputs = await Promise.all(files.map(async ([name, source]) => {
  const data = await readFile(new URL(source, import.meta.url));
  assert(data.length, `Empty source: ${source}`);
  if (/\.(?:m?js)$/.test(name)) {
    const check = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(source, import.meta.url))], { encoding: 'utf8' });
    assert.equal(check.status, 0, check.stderr);
  }
  return { name, data };
}));

const html = inputs.find(file => file.name === 'index.html').data.toString();
for (const required of ['<title>', 'name="description"', 'property="og:title"', 'property="og:image"', 'rel="icon"']) {
  assert(html.includes(required), `Missing page metadata: ${required}`);
}
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const reference = match[1];
  assert(!reference.startsWith('/') && !/^[a-z]+:/i.test(reference), `Non-relative page asset: ${reference}`);
  if (reference !== './' && !reference.startsWith('#')) {
    assert(files.some(([name]) => name === reference.replace(/^\.\//, '')), `Missing page asset: ${reference}`);
  }
}
assert(!/fonts\.googleapis|fonts\.gstatic|@import/.test(inputs.find(file => file.name === 'style.css').data.toString()), 'External stylesheet dependency');
await mkdir(new URL('dist/', root), { recursive: true });
for (const { name, data } of inputs) await writeFile(new URL(`dist/${name}`, root), data);

const checksumPaths = [...files.map(([name]) => `dist/${name}`), 'check.mjs', 'check-profiles.mjs', 'scripts/serve.mjs', 'package.json'];
const checksums = await Promise.all(checksumPaths.map(async path => {
  const data = await readFile(new URL(path, root));
  return `${createHash('sha256').update(data).digest('hex')}  ${path}`;
}));
await writeFile(new URL('SHA256SUMS', root), checksums.join('\n') + '\n');
console.log(`Built dist/: ${inputs.length} files, ${inputs.reduce((size, file) => size + file.data.length, 0)} bytes. Relative assets and metadata checked; JavaScript syntax checked.`);
