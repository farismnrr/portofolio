import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

const frontendRoot = resolve(new URL('..', import.meta.url).pathname);
const srcRoot = join(frontendRoot, 'src');
const failures = [];

const normalize = (value) => value.split(sep).join('/');
const lineCount = (source) => source.split('\n').length;

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else files.push(absolute);
  }
  return files;
}

function importsOf(source) {
  return [...source.matchAll(/(?:import|export)\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

const requiredTopLevel = new Set(['App.svelte', 'app.css', 'main.ts', 'lib', 'pages']);
const topLevel = await readdir(srcRoot);
for (const entry of topLevel) {
  if (!requiredTopLevel.has(entry)) failures.push(`src/${entry}: unexpected top-level entry; keep code inside pages/ or lib/.`);
}
for (const entry of requiredTopLevel) {
  if (!topLevel.includes(entry)) failures.push(`src/${entry}: required architecture entry is missing.`);
}

const packageJson = JSON.parse(await readFile(join(frontendRoot, 'package.json'), 'utf8'));
const deps = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
if (deps['lucide-svelte']) failures.push('Deprecated lucide-svelte dependency is forbidden; use @lucide/svelte.');
if (!deps['@lucide/svelte']) failures.push('Missing @lucide/svelte icon dependency.');
if (!deps['@icons-pack/svelte-simple-icons']) failures.push('Missing Simple Icons Svelte package for brand icons.');

const files = await collectFiles(srcRoot);
for (const absolute of files) {
  const extension = extname(absolute);
  if (!['.svelte', '.ts', '.js'].includes(extension)) continue;

  const rel = normalize(relative(srcRoot, absolute));
  const source = await readFile(absolute, 'utf8');
  const imports = importsOf(source);

  if (source.includes('<style')) failures.push(`${rel}: local <style> blocks are forbidden; use DaisyUI/Tailwind utilities and shared primitives.`);
  if (/\sstyle\s*=/.test(source)) failures.push(`${rel}: inline style= is forbidden; keep presentation in reusable utilities/components.`);
  if (/<svg(?:\s|>)/i.test(source)) failures.push(`${rel}: raw SVG is forbidden; icons must come through AppIcon.svelte.`);
  if (/\b(?:TODO|FIXME|HACK)\b/.test(source)) failures.push(`${rel}: unresolved TODO/FIXME/HACK marker is forbidden in committed product code.`);
  if (/\bconsole\.(?:log|warn|error)\s*\(/.test(source)) failures.push(`${rel}: console logging is forbidden in production UI code.`);

  const directIconImport = imports.some((specifier) =>
    specifier.startsWith('@lucide/svelte') || specifier.startsWith('@icons-pack/svelte-simple-icons')
  );
  if (directIconImport && rel !== 'lib/ui/AppIcon.svelte') {
    failures.push(`${rel}: icon libraries may only be imported by lib/ui/AppIcon.svelte (dependency inversion / single icon boundary).`);
  }

  if (rel === 'App.svelte') {
    if (lineCount(source) > 100) failures.push('App.svelte exceeds 100 lines; keep the app shell single-purpose and delegate page logic.');
    if (!source.includes('loadRoute')) failures.push('App.svelte must use the shared lazy route loader.');
    if (imports.some((specifier) => specifier.includes('/pages/') || specifier.startsWith('./pages/'))) {
      failures.push('App.svelte must not import pages directly; routes must stay lazy-loaded through lib/routes.ts.');
    }
  }

  if (rel.startsWith('pages/')) {
    if (lineCount(source) > 220) failures.push(`${rel}: page exceeds 220 lines; extract cohesive sections into reusable UI components.`);
    if (imports.length > 12) failures.push(`${rel}: page has more than 12 imports; split responsibilities into cohesive components/modules.`);
    if (!source.includes('PageShell')) failures.push(`${rel}: every page must compose the shared PageShell rather than duplicate shell geometry.`);
    if (/<img(?:\s|>)/i.test(source)) failures.push(`${rel}: direct <img> is forbidden; use MediaImage for consistent lazy-loading UX.`);
    if (imports.some((specifier) => specifier.startsWith('./') && specifier.includes('Page'))) {
      failures.push(`${rel}: page-to-page imports are forbidden; shared behavior belongs in lib/.`);
    }
  }

  if (rel.startsWith('lib/ui/')) {
    if (lineCount(source) > 180) failures.push(`${rel}: UI component exceeds 180 lines; split responsibilities (SRP).`);
    if (imports.some((specifier) => specifier.includes('/pages/') || specifier.startsWith('../../pages'))) {
      failures.push(`${rel}: reusable UI must not depend on pages (dependency direction violation).`);
    }
  }

  if (rel.startsWith('lib/') && !rel.startsWith('lib/ui/') && imports.some((specifier) => specifier.includes('/pages/'))) {
    failures.push(`${rel}: library logic must not depend on page modules.`);
  }
}

const requiredShared = [
  'lib/ui/PageShell.svelte',
  'lib/ui/SiteHeader.svelte',
  'lib/ui/SiteFooter.svelte',
  'lib/ui/PageIntro.svelte',
  'lib/ui/SectionHeader.svelte',
  'lib/ui/TechChips.svelte',
  'lib/ui/TimelineEntry.svelte',
  'lib/ui/ProjectCard.svelte',
  'lib/ui/ArchitectureDiagram.svelte',
  'lib/ui/ProcessFlow.svelte',
  'lib/ui/MediaImage.svelte',
  'lib/ui/RouteLoading.svelte',
  'lib/ui/AppIcon.svelte',
  'lib/routes.ts',
  'lib/router.ts',
  'lib/data.ts'
];

for (const file of requiredShared) {
  try {
    await readFile(join(srcRoot, file), 'utf8');
  } catch {
    failures.push(`Missing required shared architecture primitive: src/${file}`);
  }
}

const routes = await readFile(join(srcRoot, 'lib/routes.ts'), 'utf8');
const dynamicImports = [...routes.matchAll(/=>\s*import\(/g)].length;
if (dynamicImports < 6) failures.push('lib/routes.ts must keep page-level dynamic imports; route lazy loading appears to be disabled.');

if (failures.length) {
  console.error('Architecture guard failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('Architecture guard passed: structure, dependency direction, SRP/DRY heuristics, icon/media boundaries, and lazy routing are clean.');
