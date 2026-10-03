import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(
  new URL('../node_modules/mermaid/dist/mermaid.esm.min.mjs', import.meta.url)
);
const destination = fileURLToPath(
  new URL('../public/vendor/mermaid.esm.min.mjs', import.meta.url)
);

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);
console.log('Prepared prebuilt Mermaid runtime -> public/vendor/mermaid.esm.min.mjs');
