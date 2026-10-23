import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const profilesDir = path.join(directory, '..', 'content', 'cv-profiles');
const profileFiles = (await readdir(profilesDir))
  .filter((file) => file.endsWith('.md'))
  .sort();
const registry = {};
for (const file of profileFiles) {
  const source = await readFile(path.join(profilesDir, file), 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing Markdown frontmatter`);
  const values = Object.fromEntries(match[1].split(/\r?\n/).map((line) => {
    const separator = line.indexOf(':');
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  const body = match[2];
  const section = (heading) => body.match(new RegExp(`### ${heading}\\n\\n([\\s\\S]*?)(?=\\n### |$)`))?.[1]?.trim() ?? '';
  const scopes = body.match(/^## Technical scopes[ \t]*\r?\n([\s\S]*?)(?=\r?\n## |$)/)?.[1]
    .split(/\r?\n/).filter((line) => line.startsWith('- ')) ?? [];
  const list = (key) => {
    const raw = values[key] ?? '';
    const matchList = raw.match(/^\[(.*)\]$/);
    if (!matchList) return [];
    return matchList[1].split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  };
  const numberMap = (key) => Object.fromEntries(list(key).map((entry) => {
    const [name, value] = entry.split('=');
    return [name, Number(value)];
  }));
  const id = values.id;
  registry[id] = {
    id,
    maxPages: Number(values.maxPages),
    filename: values.filename,
    technicalScopes: scopes,
    scopeKeys: scopes.map((line) => line.match(/^-\s+([^|]+)/)?.[1].trim()),
    budgets: numberMap('budgets'),
    layoutPolicy: { minBodySizePt: Number(values.minBodySizePt) },
    writingPolicy: {
      identity: section('Identity'),
      focus: section('Focus'),
      summaryRange: section('Summary range'),
      projectRange: section('Project range'),
      avoid: section('Avoid').split(/\r?\n/).filter(Boolean).map((line) => line.replace(/^-\s+/, ''))
    }
  };
}

const expected = {
  general: {
    maxPages: 2,
    scopes: 4,
    filename: 'Faris_Munir_Mahdi_CV.pdf'
  }
};

const actualIds = Object.keys(registry).sort();
const expectedIds = Object.keys(expected).sort();
if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
  throw new Error(`CV profile ids do not match: ${actualIds.join(', ')}`);
}

for (const [id, policy] of Object.entries(expected)) {
  const profile = registry[id];
  if (profile.id !== id) throw new Error(`${id}: id must match its registry key`);
  if (profile.maxPages !== policy.maxPages) {
    throw new Error(`${id}: expected maxPages=${policy.maxPages}`);
  }
  if (profile.filename !== policy.filename) {
    throw new Error(`${id}: filename is not deterministic`);
  }
  if (profile.technicalScopes.length !== policy.scopes) {
    throw new Error(`${id}: expected ${policy.scopes} technical scopes`);
  }
  if (new Set(profile.scopeKeys).size !== policy.scopes) {
    throw new Error(`${id}: technical scope keys must be unique`);
  }
  for (const field of ['projects', 'experiences', 'certifications']) {
    if (!Number.isInteger(profile.budgets[field]) || profile.budgets[field] < 1) {
      throw new Error(`${id}: ${field} budget must be a positive integer`);
    }
  }
  if (profile.layoutPolicy.minBodySizePt < 10) {
    throw new Error(`${id}: body typography floor must be at least 10pt`);
  }
  for (const field of ['identity', 'focus', 'summaryRange', 'projectRange']) {
    if (!profile.writingPolicy[field]) throw new Error(`${id}: writing policy ${field} is required`);
  }
}

console.log(`Validated ${actualIds.length} CV profiles in cv-contract/v1`);
