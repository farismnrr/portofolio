import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../src/', import.meta.url);
const app = await readFile(new URL('../src/App.svelte', import.meta.url), 'utf8');
const failures = [];

if (app.split('\n').length > 140) failures.push('App.svelte must stay below 140 lines; move page/UI logic into reusable modules.');
if (app.includes('<style')) failures.push('App.svelte must not contain local CSS. Use DaisyUI/Tailwind utilities and shared primitives.');

async function walk(dir, rel = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const nextRel = join(rel, entry.name);
    const next = new URL(nextRel, root);
    if (entry.isDirectory()) {
      await walk(next, nextRel + '/');
      continue;
    }
    if (!entry.name.endsWith('.svelte')) continue;
    const source = await readFile(next, 'utf8');
    if (source.includes('<style')) failures.push(`${nextRel}: local <style> blocks are not allowed; prefer DaisyUI/Tailwind utilities.`);
  }
}

await walk(root);

for (const file of ['lib/ui/SiteHeader.svelte','lib/ui/SiteFooter.svelte','lib/ui/PageIntro.svelte','lib/ui/TechChips.svelte','lib/ui/TimelineEntry.svelte','lib/ui/ProjectCard.svelte']) {
  try { await readFile(new URL(file, root), 'utf8'); }
  catch { failures.push(`Missing required shared UI primitive: ${file}`); }
}

if (failures.length) {
  console.error('UI architecture guard failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('UI architecture guard passed.');
