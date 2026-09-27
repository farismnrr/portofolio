# Faris Munir Mahdi — Portfolio

A fully static personal portfolio built with **Vue 3, Vuetify 4, Vite, TypeScript, SCSS, and repository-local Markdown/MDX content**.

The repository has a production-only runtime model. There is no development server workflow, backend API, authentication service, dashboard, database, or production SSR server.

GitHub Actions validates the repository, builds the production container image, and publishes it to GitHub Container Registry. Local machines do not rebuild the container image; they pull the CI-produced image and recreate the production container.

## Production runtime

- CI image: `ghcr.io/farismnrr/portofolio/portfolio-app:latest`
- Container port: `3001`
- Runtime: dependency-free Node static SPA server
- SPA history fallback: unknown client-side routes fall back to `dist/index.html`
- Build-time prerendering is retained for known routes and SEO output

## Local deployment

```bash
make recreate
```

Equivalent commands:

```bash
docker pull ghcr.io/farismnrr/portofolio/portfolio-app:latest
docker rm -f faris-portfolio 2>/dev/null || true
docker run -d \
  --name faris-portfolio \
  --restart unless-stopped \
  -p 3001:3001 \
  ghcr.io/farismnrr/portofolio/portfolio-app:latest
```

The portfolio is then available at `http://localhost:3001`.

## Validation commands

These commands exist for CI and repository verification, not as a development runtime:

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run audit
./.agents/scripts/engineering-guard.sh portfolio full
```

## Static build pipeline

1. `scripts/content-plugin.ts` reads repository-local Markdown/MDX and asset indexes during the production build.
2. Content domains are exposed as in-memory `virtual:content/*` modules.
3. Vite creates the browser bundle and a temporary SSR bundle used only at build time.
4. `scripts/build.mjs` prerenders known routes into `dist/<route>/index.html`.
5. `robots.txt`, `sitemap.xml`, and `404.html` are emitted into `dist/`.
6. Temporary `.ssr/` output is removed.
7. The production container serves `dist/` on port `3001` with SPA history fallback.

## Content

The content source of truth remains under `src/content/`:

- `about/`, `work/`, `studies/`, `skills/`
- `projects/`
- `blog/`

Images and certification/gallery assets live under `public/`.

## Architecture rules

See [`AGENTS.md`](./AGENTS.md) and [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).
