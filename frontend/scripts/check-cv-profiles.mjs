import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(
  await readFile(path.join(directory, '..', 'content', 'cv-profiles.json'), 'utf8')
);

const expected = {
  general: {
    maxPages: 2,
    scopes: 6,
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
  if (new Set(profile.technicalScopes.map((scope) => scope.key)).size !== policy.scopes) {
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
}

console.log(`Validated ${actualIds.length} CV profiles in cv-contract/v1`);
