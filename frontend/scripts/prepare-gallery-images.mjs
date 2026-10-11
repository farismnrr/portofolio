import sharp from 'sharp';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceDir = resolve(new URL('../assets-source/gallery', import.meta.url).pathname);
const outputDir = resolve(new URL('../public/images/gallery', import.meta.url).pathname);
await mkdir(outputDir, { recursive: true });
let sourceBytes = 0;
let outputBytes = 0;
let count = 0;
for (const file of (await readdir(sourceDir)).sort()) {
  if (!/\.jpe?g$/i.test(file)) continue;
  const source = resolve(sourceDir, file);
  const stem = file.replace(/\.jpe?g$/i, '');
  sourceBytes += (await stat(source)).size;
  for (const width of [640, 1280]) {
    const output = resolve(outputDir, `${stem}-${width}.webp`);
    await sharp(source).autoOrient()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 }).toFile(output);
    const bytes = (await stat(output)).size;
    if (bytes > 400_000) throw new Error(`${file} ${width}w exceeds 400 KB budget: ${bytes}`);
    outputBytes += bytes;
    count++;
  }
}
if (outputBytes > 2_000_000) throw new Error(`Gallery WebP set exceeds 2 MB budget: ${outputBytes}`);
process.stdout.write(`Prepared ${count} gallery WebPs: source=${sourceBytes}B, output=${outputBytes}B.\n`);
