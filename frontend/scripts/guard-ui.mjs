import { access, readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

const frontendRoot = resolve(new URL('..', import.meta.url).pathname);
const srcRoot = join(frontendRoot, 'src');
const contentRoot = join(frontendRoot, 'content', 'projects');
const blogRoot = join(frontendRoot, 'content', 'blog');
const publicRoot = join(frontendRoot, 'public');
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
if (deps['lucide-svelte'] || deps['@lucide/svelte'] || deps['@icons-pack/svelte-simple-icons']) failures.push('Multiple/legacy icon stacks are forbidden; use the single Tabler Svelte 5 icon library.');
if (!deps['@tabler/icons-svelte-runes']) failures.push('Missing @tabler/icons-svelte-runes icon dependency.');
if (!deps.marked || !deps.mermaid) failures.push('Markdown case studies require marked and mermaid.');
if (!deps['@tailwindcss/typography']) failures.push('Markdown prose requires @tailwindcss/typography.');

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
    specifier.startsWith('@tabler/icons-svelte-runes')
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
  'lib/ui/ProjectHero.svelte',
  'lib/ui/ContentToc.svelte',
  'lib/ui/MarkdownArticle.svelte',
  'lib/ui/MediaImage.svelte',
  'lib/ui/RouteLoading.svelte',
  'lib/ui/AppIcon.svelte',
  'lib/content.ts',
  'lib/project-content.ts',
  'lib/blog-content.ts',
  'lib/markdown.ts',
  'lib/mermaid.ts',
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

const projectDetail = await readFile(join(srcRoot, 'pages', 'ProjectDetailPage.svelte'), 'utf8');
for (const forbidden of ['Sensio Notes', 'ArchitectureDiagram', 'ProcessFlow', 'const architecture', 'const flow']) {
  if (projectDetail.includes(forbidden)) failures.push(`ProjectDetailPage.svelte: project-specific hardcode "${forbidden}" is forbidden; content belongs in Markdown.`);
}
for (const required of ['getProjectByPath', 'ProjectHero', 'ContentToc', 'MarkdownArticle']) {
  if (!projectDetail.includes(required)) failures.push(`ProjectDetailPage.svelte: missing generic case-study primitive "${required}".`);
}

const dataSource = await readFile(join(srcRoot, 'lib', 'data.ts'), 'utf8');
if (/export const projects\s*=/.test(dataSource)) failures.push('lib/data.ts must not own project data; Markdown frontmatter is the single source of truth.');
if (/export const articles\s*=/.test(dataSource)) failures.push('lib/data.ts must not own blog articles; Markdown frontmatter is the single source of truth.');

const contentFiles = (await readdir(contentRoot)).filter((file) => file.endsWith('.md')).sort();
if (!contentFiles.length) failures.push('content/projects must contain at least one Markdown case study.');
const allowedKeys = new Set(['id','order','slug','year','title','cardTitle','subtitle','role','category','description','image','tech','productUrl','repoUrl']);
const slugs = new Set();
for (const file of contentFiles) {
  const source = await readFile(join(contentRoot, file), 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) { failures.push(`${file}: missing --- frontmatter block.`); continue; }
  const values = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(':');
    if (separator < 1) { failures.push(`${file}: malformed frontmatter line "${line}".`); continue; }
    values.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  for (const key of values.keys()) if (!allowedKeys.has(key)) failures.push(`${file}: unknown frontmatter key "${key}".`);
  for (const key of allowedKeys) if (!values.has(key)) failures.push(`${file}: missing required frontmatter key "${key}".`);
  const rawSlug = (values.get('slug') ?? '').trim();
  const slug = ((rawSlug.startsWith('"') && rawSlug.endsWith('"')) || (rawSlug.startsWith("'") && rawSlug.endsWith("'"))) ? rawSlug.slice(1, -1) : rawSlug;
  const expectedSlug = file.replace(/\.md$/, '');
  if (slug !== expectedSlug) failures.push(`${file}: slug must match filename (${expectedSlug}).`);
  if (slugs.has(slug)) failures.push(`${file}: duplicate slug "${slug}".`);
  slugs.add(slug);
  const tech = values.get('tech') ?? '';
  if (!/^\[.+\]$/.test(tech.trim())) failures.push(`${file}: tech must be a non-empty inline list.`);
  const rawImage = (values.get('image') ?? '').trim();
  const image = ((rawImage.startsWith('"') && rawImage.endsWith('"')) || (rawImage.startsWith("'") && rawImage.endsWith("'"))) ? rawImage.slice(1, -1) : rawImage;
  if (image.startsWith('/')) {
    try { await access(join(publicRoot, image.replace(/^\//, ''))); }
    catch { failures.push(`${file}: referenced local image "${image}" does not exist under public/.`); }
  }
  const body = match[2];
  if (/^#\s+/m.test(body)) failures.push(`${file}: Markdown body must start at ## because ProjectHero owns the H1.`);
  const headings = [...body.matchAll(/^(#{2,6})\s+(.+)$/gm)];
  if (headings.filter((heading) => heading[1].length === 2).length < 3) failures.push(`${file}: case study needs at least three ## sections.`);
  let previousLevel = 1;
  for (const heading of headings) {
    const level = heading[1].length;
    if (level > previousLevel + 1) failures.push(`${file}: heading hierarchy jumps from H${previousLevel} to H${level}.`);
    previousLevel = level;
  }
  if (/<[A-Za-z][^>]*>/.test(body)) failures.push(`${file}: raw HTML is forbidden in Markdown content.`);
  const mermaidStarts = [...body.matchAll(/```mermaid\s*$/gm)].length;
  const mermaidBlocks = [...body.matchAll(/```mermaid\s*\r?\n([\s\S]*?)```/g)];
  if (mermaidStarts !== mermaidBlocks.length) failures.push(`${file}: unclosed Mermaid code fence.`);
}

const blogFiles = (await readdir(blogRoot)).filter((file) => file.endsWith('.md')).sort();
if (!blogFiles.length) failures.push('content/blog must contain at least one Markdown article.');
const blogKeys = new Set(['slug','title','excerpt','category','published','readTime','cover','featured']);
const blogSlugs = new Set();
let featuredCount = 0;

for (const file of blogFiles) {
  const source = await readFile(join(blogRoot, file), 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) { failures.push(`${file}: missing --- frontmatter block.`); continue; }

  const values = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(':');
    if (separator < 1) { failures.push(`${file}: malformed frontmatter line "${line}".`); continue; }
    values.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }

  for (const key of values.keys()) if (!blogKeys.has(key)) failures.push(`${file}: unknown blog frontmatter key "${key}".`);
  for (const key of blogKeys) if (!values.has(key)) failures.push(`${file}: missing required blog frontmatter key "${key}".`);

  const rawSlug = (values.get('slug') ?? '').trim();
  const slug = ((rawSlug.startsWith('"') && rawSlug.endsWith('"')) || (rawSlug.startsWith("'") && rawSlug.endsWith("'"))) ? rawSlug.slice(1, -1) : rawSlug;
  if (slug !== file.replace(/\.md$/, '')) failures.push(`${file}: blog slug must match filename.`);
  if (blogSlugs.has(slug)) failures.push(`${file}: duplicate blog slug "${slug}".`);
  blogSlugs.add(slug);

  const published = (values.get('published') ?? '').trim();
  if (Number.isNaN(Date.parse(published))) failures.push(`${file}: published must be a valid ISO date.`);
  if ((values.get('featured') ?? '').trim() === 'true') featuredCount += 1;

  const body = match[2];
  if (/^#\s+/m.test(body)) failures.push(`${file}: blog Markdown body must start at ## because ArticlePage owns H1.`);
  const headings = [...body.matchAll(/^(#{2,6})\s+(.+)$/gm)];
  if (headings.filter((heading) => heading[1].length === 2).length < 3) failures.push(`${file}: article needs at least three ## sections.`);
}

if (featuredCount > 1) failures.push('content/blog may contain at most one featured: true article.');

const homeSource = await readFile(join(srcRoot, 'pages', 'HomePage.svelte'), 'utf8');
if (homeSource.includes('projects.slice(0')) failures.push('HomePage must use getLatestProjects() rather than positional project slices.');
if (homeSource.includes('experiences.slice(0')) failures.push('HomePage must use getLatestExperiences() rather than positional experience slices.');
if (!homeSource.includes('getLatestProjects') || !homeSource.includes('getLatestExperiences')) {
  failures.push('HomePage must derive visible project and experience content from latest-content selectors.');
}

if (failures.length) {
  console.error('Architecture guard failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('Architecture/content guard passed: structure, dependency direction, SRP/DRY heuristics, Markdown schema, lazy media/routes, and diagram boundaries are clean.');
