# Documentation Guide

The portfolio is now a single static Next.js application.

## Core documents

- [README.md](../README.md) — setup, build, preview, deployment, content editing.
- [ARCHITECTURE.md](./ARCHITECTURE.md) — static-export architecture and rendering rules.

## Source of truth

Public portfolio data is repository content, not API/database state.

```text
src/content/
├── about/
├── blog/
├── projects/
├── studies/
├── technical/
└── work/
```

Site configuration, routes, design tokens, and metadata defaults live under `src/resources/`.

## Build validation

Run:

```bash
npm run lint
npm run build
```

A successful build must report only static (`○`) and SSG (`●`) routes. The generated deployable site is `out/`.

## Deployment

Use any static host/CDN, or build the included nginx container:

```bash
make docker-build
make docker-run
```

No API, database, login, SSO, migration, or backend service documentation is required because those systems are no longer part of this repository.
