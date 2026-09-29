import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import mermaid from 'mermaid';

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
process.stdout.write(`Content validation passed: ${files.length} project case studies, ${diagrams} Mermaid diagrams.\n`);
