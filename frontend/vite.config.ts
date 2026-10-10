import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

function markdownMetadata(): Plugin {
  return {
    name: 'markdown-frontmatter-only',
    enforce: 'pre',
    load(id) {
      const queryIndex = id.indexOf('?');
      if (queryIndex < 0) return null;

      const filePath = id.slice(0, queryIndex);
      const query = new URLSearchParams(id.slice(queryIndex + 1));
      if (!filePath.endsWith('.md') || !query.has('meta')) return null;

      const source = readFileSync(filePath, 'utf8');
      const match = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
      if (!match) throw new Error(`${filePath}: missing frontmatter`);

      return `export default ${JSON.stringify(match[0])};`;
    }
  };
}

export default defineConfig({
  plugins: [markdownMetadata(), tailwindcss(), svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'INVALID_ANNOTATION' &&
          warning.id?.includes('/node_modules/zod/')
        ) {
          return;
        }

        warn(warning);
      }
    }
  }
});
