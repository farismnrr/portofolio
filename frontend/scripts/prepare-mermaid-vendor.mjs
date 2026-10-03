import { copyFile, cp, mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(
  new URL('../node_modules/mermaid/dist/mermaid.esm.min.mjs', import.meta.url)
);
const destination = fileURLToPath(
  new URL('../public/vendor/mermaid.esm.min.mjs', import.meta.url)
);
const chunksSource = fileURLToPath(
  new URL('../node_modules/mermaid/dist/chunks/mermaid.esm.min/', import.meta.url)
);
const chunksDestination = fileURLToPath(
  new URL('../public/vendor/chunks/mermaid.esm.min/', import.meta.url)
);

await mkdir(dirname(destination), { recursive: true });
await copyFile(source, destination);

// Mermaid's ESM entrypoint lazy-loads diagram implementations from this
// sibling chunk directory. Copying only the entrypoint makes the browser
// import succeed initially and then fail as soon as a diagram is rendered.
await rm(chunksDestination, { recursive: true, force: true });
await cp(chunksSource, chunksDestination, { recursive: true });

console.log('Prepared Mermaid runtime and lazy chunks -> public/vendor/');
