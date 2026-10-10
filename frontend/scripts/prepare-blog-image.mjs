import { mkdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const source = resolve(new URL('../assets-source/blog/iot-mesh-networks.png', import.meta.url).pathname);
const outputDir = resolve(new URL('../public/images/blog', import.meta.url).pathname);
const variants = [768, 1280, 1920];
const defaultVariantMaxBytes = 180_000;
const totalVariantsMaxBytes = 500_000;

await mkdir(outputDir, { recursive: true });
const sourceInfo = await stat(source);
const results = [];

for (const width of variants) {
  const output = resolve(outputDir, `iot-mesh-networks-${width}.webp`);
  const info = await sharp(source)
    .autoOrient()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(output);
  results.push({ width, size: info.size });
}

const defaultVariant = results.find((item) => item.width === 1280);
const total = results.reduce((sum, item) => sum + item.size, 0);
if (!defaultVariant || defaultVariant.size > defaultVariantMaxBytes) {
  throw new Error(
    `Blog cover 1280w WebP exceeds ${defaultVariantMaxBytes}B budget: ${defaultVariant?.size ?? 'missing'}B`
  );
}
if (total > totalVariantsMaxBytes) {
  throw new Error(`Blog cover responsive WebP set exceeds ${totalVariantsMaxBytes}B budget: ${total}B`);
}

const summary = results.map((item) => `${item.width}w=${item.size}B`).join(', ');
process.stdout.write(
  `Prepared responsive blog cover WebP: source=${sourceInfo.size}B, ${summary}, total=${total}B\n`
);
