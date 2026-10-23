import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.SVGElement = dom.window.SVGElement;

const { default: mermaid } = await import('mermaid');
const contentRoots = [
  resolve(new URL('../content/projects', import.meta.url).pathname),
  resolve(new URL('../content/blog', import.meta.url).pathname),
  resolve(new URL('../content/experience', import.meta.url).pathname),
  resolve(new URL('../content/education', import.meta.url).pathname),
  resolve(new URL('../content/skills', import.meta.url).pathname),
  resolve(new URL('../content/principles', import.meta.url).pathname),
  resolve(new URL('../content/certifications', import.meta.url).pathname),
  resolve(new URL('../content/gallery', import.meta.url).pathname),
  resolve(new URL('../content/pages', import.meta.url).pathname),
  resolve(new URL('../content/profile', import.meta.url).pathname),
  resolve(new URL('../content/navigation', import.meta.url).pathname),
  resolve(new URL('../content/cv-profiles', import.meta.url).pathname),
  resolve(new URL('../content/cv/editorial', import.meta.url).pathname)
];
const files = [];
for (const root of contentRoots) {
  for (const file of (await readdir(root)).filter((entry) => entry.endsWith('.md')).sort()) {
    files.push({ root, file });
  }
}
let diagrams = 0;
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', logLevel: 'fatal' });
for (const { root, file } of files) {
  const source = await readFile(join(root, file), 'utf8');
  for (const match of source.matchAll(/```mermaid\s*\r?\n([\s\S]*?)```/g)) {
    diagrams += 1;
    try { await mermaid.parse(match[1]); }
    catch (error) { const message = error instanceof Error ? error.message : String(error); throw new Error(`${file}: invalid Mermaid diagram: ${message}`); }
  }
}
const profileFiles = files.filter(({ root }) => root.endsWith('/cv-profiles'));
if (profileFiles.length !== 1) throw new Error('CV content must contain exactly one Markdown profile.');
for (const { root, file } of profileFiles) {
  const source = await readFile(join(root, file), 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: CV profile needs Markdown frontmatter and a body.`);
  const keys = new Set(match[1].split(/\r?\n/).map((line) => line.slice(0, line.indexOf(':')).trim()));
  for (const key of ['id', 'label', 'headline', 'maxPages', 'filename', 'preferredSignals', 'budgets']) {
    if (!keys.has(key)) throw new Error(`${file}: CV profile is missing ${key}.`);
  }
  if (!/^## Technical scopes/m.test(match[2]) || !/^## Writing policy/m.test(match[2])) {
    throw new Error(`${file}: CV profile needs technical scopes and a writing policy.`);
  }
}
async function findNonMarkdownContent(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await findNonMarkdownContent(absolute));
    else if (/\.(json|ya?ml)$/i.test(entry.name)) found.push(absolute);
  }
  return found;
}
const nonMarkdownContent = await findNonMarkdownContent(resolve(new URL('../content', import.meta.url).pathname));
if (nonMarkdownContent.length) {
  throw new Error(`Static content must use Markdown: ${nonMarkdownContent.join(', ')}`);
}
const editorialFiles = files.filter(({ root }) => root.endsWith('/cv/editorial'));
if (!editorialFiles.length) throw new Error('CV editorial content must contain Markdown entries.');
const editorialOrders = new Set();
for (const { root, file } of editorialFiles) {
  const source = await readFile(join(root, file), 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: CV editorial entry needs Markdown frontmatter and a body.`);
  const values = new Map(match[1].split(/\r?\n/).map((line) => {
    const separator = line.indexOf(':');
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  const order = Number(values.get('order'));
  if (!Number.isInteger(order) || editorialOrders.has(order)) throw new Error(`${file}: CV editorial order must be unique and numeric.`);
  editorialOrders.add(order);
  if (!values.has('kind')) throw new Error(`${file}: CV editorial kind is required.`);
  const kind = values.get('kind');
  if (['project', 'experience', 'certification'].includes(kind) && !values.has('sourceId')) {
    throw new Error(`${file}: ${kind} entries need a sourceId.`);
  }
  if (['project', 'experience', 'profile-summary'].includes(kind) && !match[2].trim()) {
    throw new Error(`${file}: ${kind} entries need Markdown body content.`);
  }
}
dom.window.close();
process.stdout.write(`Content validation passed: ${files.length} Markdown documents, ${diagrams} Mermaid diagrams.\n`);
