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
  resolve(new URL('../content/profile', import.meta.url).pathname)
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
dom.window.close();
process.stdout.write(`Content validation passed: ${files.length} Markdown documents, ${diagrams} Mermaid diagrams.\n`);
