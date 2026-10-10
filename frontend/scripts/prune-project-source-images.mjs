import { readFile, stat, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDir = resolve(new URL('../dist', import.meta.url).pathname);
const manifest = resolve(distDir, 'project-source-images.txt');
const paths = (await readFile(manifest, 'utf8'))
  .split(/\r?\n/)
  .map((value) => value.trim())
  .filter(Boolean);

let removedBytes = 0;
for (const path of paths) {
  const target = resolve(distDir, path);
  removedBytes += (await stat(target)).size;
  await unlink(target);
}
await unlink(manifest);

process.stdout.write(
  `Pruned ${paths.length} source project images from dist (${removedBytes}B); responsive WebPs remain.\n`
);
