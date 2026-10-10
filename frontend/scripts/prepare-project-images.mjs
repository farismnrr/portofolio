import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import sharp from 'sharp';

const projectDir = resolve(new URL('../content/projects', import.meta.url).pathname);
const publicDir = resolve(new URL('../public', import.meta.url).pathname);
const variants = [640, 1280];
const defaultVariantMaxBytes = 300_000;
const totalVariantsMaxBytes = 2_000_000;
const sourceManifest = resolve(publicDir, 'project-source-images.txt');

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function coverPath(source, file) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const imageLine = frontmatter?.[1].match(/^image:\s*(.+)$/m);
  if (!imageLine) throw new Error(`${file}: missing project image frontmatter`);
  const image = unquote(imageLine[1]);
  if (!/^\/images\/projects\/.+\.(?:png|jpe?g)$/i.test(image)) {
    throw new Error(`${file}: unsupported project cover source ${image}`);
  }
  if (source.split(image).length - 1 !== 1) {
    throw new Error(`${file}: project cover ${image} is also referenced in the Markdown body`);
  }
  return image;
}

const files = (await readdir(projectDir)).filter((file) => file.endsWith('.md')).sort();
const covers = [];
for (const file of files) {
  const source = await readFile(resolve(projectDir, file), 'utf8');
  covers.push({ file, image: coverPath(source, file) });
}

const uniqueCovers = [...new Map(covers.map((item) => [item.image, item])).values()];
let total = 0;
const summaries = [];

for (const { file, image } of uniqueCovers) {
  const source = resolve(publicDir, image.replace(/^\//, ''));
  const sourceInfo = await stat(source);
  const extension = extname(source);
  const stem = source.slice(0, -extension.length);
  const results = [];

  for (const width of variants) {
    const output = `${stem}-${width}.webp`;
    await mkdir(dirname(output), { recursive: true });
    const info = await sharp(source)
      .autoOrient()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 3 })
      .toFile(output);
    results.push({ width, size: info.size });
  }

  const defaultVariant = results.find((item) => item.width === 1280);
  if (!defaultVariant || defaultVariant.size > defaultVariantMaxBytes) {
    throw new Error(
      `${file}: 1280w project WebP exceeds ${defaultVariantMaxBytes}B budget: ${defaultVariant?.size ?? 'missing'}B`
    );
  }

  const imageTotal = results.reduce((sum, item) => sum + item.size, 0);
  total += imageTotal;
  summaries.push(
    `${file}: source=${sourceInfo.size}B, ${results.map((item) => `${item.width}w=${item.size}B`).join(', ')}`
  );
}

if (total > totalVariantsMaxBytes) {
  throw new Error(`Responsive project WebP set exceeds ${totalVariantsMaxBytes}B budget: ${total}B`);
}

await writeFile(
  sourceManifest,
  `${uniqueCovers.map(({ image }) => image.replace(/^\//, '')).join('\n')}\n`,
  'utf8'
);

process.stdout.write(`Prepared responsive project WebPs: ${summaries.join('; ')}, total=${total}B\n`);
