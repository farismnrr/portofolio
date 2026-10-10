import { mkdir, stat } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import sharp from 'sharp';

const images = [
  'alibaba-cloud-certified-associate',
  'alibaba-cloud-certified-professional'
];
const variants = [480, 800];
const defaultVariantMaxBytes = 120_000;
const totalVariantsMaxBytes = 320_000;
const sourceDir = resolve(new URL('../assets-source/certifications/alibaba', import.meta.url).pathname);
const outputDir = resolve(new URL('../public/images/certifications/alibaba', import.meta.url).pathname);

await mkdir(outputDir, { recursive: true });
let total = 0;
const summaries = [];

for (const name of images) {
  const source = resolve(sourceDir, `${name}.jpg`);
  const sourceInfo = await stat(source);
  const results = [];

  for (const width of variants) {
    const output = resolve(outputDir, `${name}-${width}.webp`);
    const info = await sharp(source)
      .autoOrient()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(output);
    results.push({ width, size: info.size });
  }

  const defaultVariant = results.find((item) => item.width === 800);
  if (!defaultVariant || defaultVariant.size > defaultVariantMaxBytes) {
    throw new Error(
      `${basename(source)} 800w WebP exceeds ${defaultVariantMaxBytes}B budget: ${defaultVariant?.size ?? 'missing'}B`
    );
  }

  const imageTotal = results.reduce((sum, item) => sum + item.size, 0);
  total += imageTotal;
  summaries.push(
    `${name}: source=${sourceInfo.size}B, ${results.map((item) => `${item.width}w=${item.size}B`).join(', ')}`
  );
}

if (total > totalVariantsMaxBytes) {
  throw new Error(`Alibaba certification preview WebP set exceeds ${totalVariantsMaxBytes}B budget: ${total}B`);
}

process.stdout.write(`Prepared Alibaba certification WebP previews: ${summaries.join('; ')}, total=${total}B\n`);
