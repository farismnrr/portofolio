# Portfolio Architecture

## Goal

The portfolio is a **static-first website**. It has no authentication boundary and no application backend. All public content is generated at build time so the deployed runtime can be a plain static web server or CDN.

## Runtime model

```text
Markdown / MDX + static resources
              │
              ▼
       Next.js build time
              │
              ▼
      prerendered ./out
              │
              ▼
        CDN / nginx / S3
              │
              ▼
            Browser
```

No database, API server, SSO service, login flow, refresh tokens, dashboard, migrations, or server-side request processing are required.

## Application structure

```text
src/
├── app/
│   ├── (marketing)/          # public static pages
│   ├── layout.tsx
│   ├── robots.ts             # static robots.txt
│   └── sitemap.ts            # static sitemap.xml
├── components/               # reusable React UI
├── content/                  # Markdown/MDX source of truth
├── context/                  # browser-only UI state
├── lib/                      # build-time/local utilities
├── resources/                # site config/design/content config
├── store/                    # browser UI state only
├── types/
└── utils/
```

## Rendering rules

`next.config.mjs` uses:

```js
output: "export"
```

This means `npm run build` must be able to resolve every page without a runtime server.

### Static pages

Pages without dynamic path segments are prerendered directly.

### Dynamic content pages

Blog and project detail routes provide `generateStaticParams()` from the repository's local content, so every known slug is generated during the build.

### Client components

Interactive UI such as theme switching can still use client-side React. Client components do not make the page SSR-dependent as long as they do not require request-time server data.

## Content source

Content lives in Git under `src/content/` and is read during the build. This replaces the previous database/API-backed editing model.

Changing portfolio content follows a simple flow:

```text
edit Markdown/MDX → commit → build → deploy static output
```

## SEO

The static architecture supports SEO through:

- prerendered HTML for every public page;
- per-page metadata generated at build time;
- static Open Graph fallback image;
- generated `robots.txt`;
- generated `sitemap.xml`;
- crawlable project and blog detail URLs;
- no login or auth gate around public content.

## Images

Next.js runtime image optimization is disabled because there is no Next.js server in production. The project still uses responsive image markup where applicable; production image transformation/compression can be handled at asset-generation time or by the hosting CDN.

## Deployment

### Static host

Upload the contents of `out/` to any static platform.

### Docker

The root `Dockerfile` has two stages:

1. Node builds the Next.js static export.
2. nginx serves only the generated `out/` files.

No application process runs beside nginx.

## Explicitly removed architecture

The following are no longer part of this repository's runtime model:

- `/login` and OAuth callback routes;
- authenticated dashboard routes;
- Next.js `/api/*` routes;
- Go portfolio backend;
- multitenant SSO/user-management service;
- PostgreSQL and migrations;
- runtime backend configuration;
- API proxy rewrites;
- dynamic OG image endpoint;
- auth state/bootstrap logic.

Any future feature should remain static/client-only unless there is a strong reason to reintroduce a server runtime.
