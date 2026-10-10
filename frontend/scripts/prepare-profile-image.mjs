import { mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const source = resolve(new URL('../assets-source/profile/faris-munir.png', import.meta.url).pathname);
const outputDir = resolve(new URL('../public/images/profile', import.meta.url).pathname);
const variants = [640, 1024, 1536];

await mkdir(outputDir, { recursive: true });
const sourceInfo = await stat(source);
const results = [];

for (const width of variants) {
  const output = resolve(outputDir, `faris-munir-${width}.webp`);
  const info = await sharp(source)
    .autoOrient()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(output);
  results.push({ width, size: info.size });
}

const total = results.reduce((sum, item) => sum + item.size, 0);
const summary = results.map((item) => `${item.width}w=${item.size}B`).join(', ');
process.stdout.write(
  `Prepared responsive profile WebP: source=${sourceInfo.size}B, ${summary}, total=${total}B\n`
);
