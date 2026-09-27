# Architecture

## Runtime model

The portfolio is a production-only static Vue application.

There is no development-server workflow and no production Vue SSR runtime. Vite and `@vue/server-renderer` are build tools only. CI builds the site, packages the generated `dist/` output into a container, and publishes that image to GHCR.

```text
src/content + public assets
          |
          v
scripts/content-plugin.ts
          |
          v
virtual:content/* modules (memory only)
          |
          +--> Vite client production build + Vuetify
          |
          +--> temporary Vite SSR build + Vuetify
                    |
                    v
             @vue/server-renderer
                    |
                    v
             dist/**/*.html
                    |
                    v
          scripts/serve-spa.mjs
                    |
                    v
              port 3001
```

The SSR bundle is a build implementation detail only. `scripts/build.mjs` removes `.ssr/` after prerendering.

## Routes

Known root, project, and blog routes are prerendered into static HTML. The production server serves those files directly and falls back to `dist/index.html` for unknown client-side routes so Vue Router can handle SPA navigation.

A static `404.html`, `robots.txt`, and `sitemap.xml` are generated during the production build.

## UI

Vue 3 is used directly with Vue Router and Vuetify 4.

Vuetify owns reusable interface primitives such as buttons, chips, cards, navigation controls, overlays, form controls, and theme integration. The portfolio does not maintain parallel SCSS implementations of those primitives.

Custom SCSS under `src/styles/` remains responsible for page composition, responsive layout, typography, ambient effects, image treatments, prose styling, and focused Vuetify overrides.

## Content

`src/content/` is the durable source of truth. Markdown/MDX is parsed during the production build into in-memory `virtual:content/*` modules. Portfolio pages must not fetch repository content at runtime.

## Delivery

GitHub Actions is the image build authority.

- Image: `ghcr.io/farismnrr/portofolio/portfolio-app:latest`
- Production container port: `3001`
- Local deployment: pull the CI image and recreate the container
- Local Docker builds are not part of the normal deployment flow
- Nginx is not part of the runtime
- Production Vue SSR is not part of the runtime

The container runs `scripts/serve-spa.mjs`, which serves only the generated static `dist/` files and SPA history fallback.
