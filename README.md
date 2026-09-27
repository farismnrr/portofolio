# Faris Munir Mahdi — Portfolio

A fully static personal portfolio built with **Vue 3, Vuetify 4, Vite, TypeScript, SCSS, and repository-local Markdown/MDX content**.

There is intentionally no backend runtime, authentication, dashboard, database, or API service. Development is served directly by Vite; production is prerendered into plain HTML/CSS/JS under `dist/` and served by a lightweight Node static SPA server with history fallback.

## Stack

- Vue 3 + Vue Router
- Vuetify 4 for reusable UI primitives and theme integration
- Vite
- TypeScript + `vue-tsc`
- SCSS for portfolio-specific layout, typography, ambient visuals, prose, and focused component overrides
- Markdown/MDX content parsed at build time
- `@vue/server-renderer` used **only during build** to prerender static HTML
- Dependency-free Node static server for production SPA fallback on port `3001`
- Biome for source checks

## Commands

```bash
npm ci
npm run dev       # development: http://localhost:3006
npm run typecheck
npm run lint
npm run build     # static output -> dist/
npm run preview   # build + production SPA server: http://localhost:3001
npm run audit
```

Development uses port `3006`. The production container and SPA server expose port `3001`.

## Static build pipeline

1. `scripts/content-plugin.ts` reads repository-local Markdown/MDX and asset indexes directly during Vite compilation.
2. Each domain is exposed as an in-memory virtual module (`virtual:content/about`, `virtual:content/skills`, `virtual:content/projects`, etc.); no generated content file is written to the repository.
3. Vite creates the browser bundle and a temporary SSR bundle used only for build-time rendering.
4. `scripts/build.mjs` prerenders every known route to `dist/<route>/index.html`.
5. `robots.txt`, `sitemap.xml`, and `404.html` are emitted into `dist/`.
6. Temporary `.ssr/` output is deleted.
7. Production serves `dist/` directly and falls back to `dist/index.html` for unknown client-side routes.

## Content

The content source of truth remains under `src/content/`:

- `about/`, `work/`, `studies/`, `skills/`
- `projects/`
- `blog/`

Images and certification/gallery assets live under `public/`.

## Architecture rules

See [`AGENTS.md`](./AGENTS.md) and [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). The important invariants are: static production only, no runtime content API, Vue without a meta-framework, Vuetify as the approved UI component system, SCSS reserved for bespoke visual/layout work, build-time prerendering of dynamic project/blog routes, and SPA history fallback when serving the built output.
