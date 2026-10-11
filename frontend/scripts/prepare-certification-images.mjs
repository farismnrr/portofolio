import { mkdir, readdir } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import sharp from 'sharp';

const sourceDir = resolve(new URL('../assets-source/certifications', import.meta.url).pathname);
const outputDir = resolve(new URL('../public/images/certifications', import.meta.url).pathname);
const variants = [480, 800, 1600];
let total = 0;
let count = 0;

async function prepare(directory, relative = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = resolve(directory, entry.name);
    const target = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await prepare(source, target);
      continue;
    }
    if (!/\.(jpe?g|png)$/i.test(entry.name)) continue;
    const stem = target.slice(0, -extname(target).length);
    for (const width of variants) {
      const output = resolve(outputDir, `${stem}-${width}.webp`);
      await mkdir(resolve(output, '..'), { recursive: true });
      const info = await sharp(source).autoOrient()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: width === 1600 ? 88 : 82, effort: 5 }).toFile(output);
      const maxBytes = width === 1600 ? 800_000 : 160_000;
      if (info.size > maxBytes) {
        throw new Error(`${stem} ${width}w WebP exceeds ${maxBytes} byte budget: ${info.size}`);
      }
      total += info.size;
      count++;
    }
  }
}

await prepare(sourceDir);
if (total > 10_000_000) throw new Error(`Certification WebP set exceeds 10 MB budget: ${total}`);
process.stdout.write(`Prepared ${count} certification WebP images (${total} bytes).\n`);
