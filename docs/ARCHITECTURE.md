# Architecture

## Runtime model

The portfolio is a static Vue application. Vite is the development server and bundler, but no Node/Vue server is required in production.

```text
src/content + public assets
          |
          v
scripts/content-plugin.ts
          |
          v
virtual:content/* modules (memory only)
          |
          +--> Vite client build
          |
          +--> Vite temporary SSR build
                    |
                    v
             @vue/server-renderer
                    |
                    v
             dist/**/*.html
```

The SSR bundle is a build implementation detail only. `scripts/build.mjs` removes `.ssr/` after prerendering.

## Routes

Static root routes are `/`, `/about`, `/projects`, `/blog`, `/certifications`, and `/gallery`. Project and blog detail routes are enumerated from local content at build time and emitted as static `index.html` files. A static `404.html`, `robots.txt`, and `sitemap.xml` are also generated.

## UI

Vue 3 is used directly with Vue Router. There is no Nuxt, React/Next, Tailwind, or third-party UI component system. Shared visual rules live in `src/styles/`; reusable site components live in `src/components/`. SCSS/CSS variables own the light/dark design tokens.

## Content

`src/content/` is the durable source of truth. Vite parses Markdown/MDX into in-memory `virtual:content/*` modules during dev/build; no generated content source file is written to disk. Portfolio pages must not fetch repository content at runtime.

## Hosting

Run `npm run build` and publish the contents of `dist/` to any static host or CDN. The provided Dockerfile copies `dist/` into nginx; it does not ship Node or Vue SSR infrastructure.
