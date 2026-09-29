import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.SVGElement = dom.window.SVGElement;

const { default: mermaid } = await import('mermaid');
const contentRoot = resolve(new URL('../content/projects', import.meta.url).pathname);
const files = (await readdir(contentRoot)).filter((file) => file.endsWith('.md')).sort();
let diagrams = 0;
mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', logLevel: 'fatal' });
for (const file of files) {
  const source = await readFile(join(contentRoot, file), 'utf8');
  for (const match of source.matchAll(/```mermaid\s*\r?\n([\s\S]*?)```/g)) {
    diagrams += 1;
    try { await mermaid.parse(match[1]); }
    catch (error) { const message = error instanceof Error ? error.message : String(error); throw new Error(`${file}: invalid Mermaid diagram: ${message}`); }
  }
}
dom.window.close();
process.stdout.write(`Content validation passed: ${files.length} project case studies, ${diagrams} Mermaid diagrams.\n`);
