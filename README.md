# Portfolio

Personal portfolio for Faris Munir Mahdi.

The site uses Svelte for the frontend and a small Rust + Axum runtime for production delivery. Public pages are prerendered at build time, then hydrated in the browser for client-side navigation and interaction.

## What lives here

- Portfolio pages and UI: `frontend/src/`
- Portfolio content: `frontend/content/`
- Static media and generated public assets: `frontend/public/`
- Rust server: `server/`
- Development and release workflows: `.github/workflows/`
- Orange Pi production deployment files: `deploy/orangepi/`

Most portfolio data is Markdown-driven. Projects, experience, education, skills, certifications, gallery entries, page copy, and CV profiles can be updated without hardcoding new UI data. CV profile files live in `frontend/content/cv-profiles/`; the Rust server embeds a JSON registry generated from those Markdown files during `npm run build` and `npm run cv:check`. The generated `server/generated/cv-profiles.json` file is gitignored and is never hand-authored.

## Main stack

- Svelte 5 + Vite
- TypeScript
- Markdown + Mermaid
- Rust + Axum
- Docker
- PostgreSQL + pgvector for portfolio retrieval
- GitHub Actions

## Local frontend development

From `frontend/`:

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run guard
npm run content:check
npm run check
npm run build
```

`npm run build` also generates the prerendered HTML, SEO/discovery files, responsive media, CV evidence corpus, and Mermaid runtime assets used by production.

## Editing portfolio content

Content is stored under `frontend/content/`.

Projects are regular Markdown files with frontmatter. The same content collection drives the project cards, project modal, and homepage selections, so adding or changing a project normally does not require a project-specific Svelte component.

Visible Markdown copy is checked by the repository writing-style guard. It catches a small set of high-confidence style problems and reports softer warnings such as overly long sentences or repeated writing patterns.

## CV and retrieval

The reviewed CV PDF is stored at:

`frontend/public/downloads/Faris_Munir_Mahdi_CV.pdf`

The About page downloads that file directly.

Portfolio evidence for `/api/cv/retrieve` is generated from the same published content rather than maintained as a separate manual dataset. Retrieval uses PostgreSQL full-text search with local deterministic vectors and does not call an external model service.

## Branches

Development happens on `dev`.

`main` is reserved for production releases and is updated through the explicit release workflow. Normal fixes, content changes, refactors, documentation, and CI work should go to `dev`.

See `AGENTS.md` for the repository working rules.

## CI and deployment

There are two workflows:

### Fast AMD64 Build + Deploy

Runs automatically for application/runtime changes on `dev`.

It validates the frontend and content, runs Rust formatting/clippy/tests, builds the AMD64 runtime and local Docker image, deploys it to the Arch development host, then verifies the live application and database-backed CV retrieval. AI chat and role-match features are not included.

Documentation-only changes do not trigger this application pipeline.

### Full Guardrail + Build + Publish

Manual production release from `dev`.

It performs the full validation and cross-architecture build, merges `dev` into `main` through the release flow, publishes the immutable production image, and deploys the exact release SHA to the Orange Pi. Failed deployment or verification restores the previous application SHA and Compose definition, then verifies the rollback.

## Runtime environments

### Development

The Arch development deployment reuses the infrastructure-managed `shared-postgres` instance. The fast workflow provides the application database URL through repository secrets. CV retrieval uses that database; no model service is required.

### Production

Production runs on the ARM64 Orange Pi under `/opt/portfolio/` with:

- Portfolio application
- PostgreSQL 17 + pgvector

The production `.env` stays on the host and is not committed to the repository. The next release removes the retired model-service container as an orphan while retaining its host data directory and host-only configuration for rollback. PostgreSQL data is preserved. Rollback restores the previous Compose definition and application image.

## SEO and discovery

The production build prerenders public routes and generates crawlable assets including:

- `sitemap.xml`
- `robots.txt`
- `feed.xml`
- `llms.txt`
- `llms-full.txt`

Route metadata and JSON-LD are included in prerendered HTML so the core site content does not depend on client-side JavaScript for indexing.

## More detail

Operational rules and repository conventions live in `AGENTS.md`. The active workflow files are the source of truth for CI/CD behavior.
