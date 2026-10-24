import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { readCvProfileRegistry, cvProfileScriptsDirectory } from './lib/cv-profile-registry.mjs';

const repositoryRoot = path.resolve(cvProfileScriptsDirectory, '..', '..');
const outputPath = path.join(repositoryRoot, 'server', 'generated', 'cv-profiles.json');
const registry = await readCvProfileRegistry();

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Generated Rust CV profile registry at ${path.relative(repositoryRoot, outputPath)}`);
