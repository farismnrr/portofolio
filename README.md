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

Most portfolio data is Markdown-driven. Projects, experience, education, skills, certifications, gallery entries, and page copy can be updated without hardcoding new UI data.

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

Project pages are regular Markdown files with frontmatter. The same content collection drives project listings, homepage selections, and detail pages, so adding or changing a project normally does not require a project-specific Svelte component.

Visible Markdown copy is checked by the repository writing-style guard. It catches a small set of high-confidence style problems and reports softer warnings such as overly long sentences or repeated writing patterns.

## CV and role matching

The reviewed CV PDF is stored at:

`frontend/public/downloads/Faris_Munir_Mahdi_CV.pdf`

The About page downloads that file directly.

`Match a role` is a private development utility. It is enabled only by the Fast AMD64 development build on `dev`, where it compares a supplied job description with published portfolio evidence and produces a source-backed PDF report. The production build does not render the Role Match UI and does not compile or expose the `/api/role-match/report` endpoint.

Portfolio evidence for retrieval and development role matching is generated from the same published content rather than maintained as a separate manual dataset.

## Branches

Development happens on `dev`.

`main` is reserved for production releases and is updated through the explicit release workflow. Normal fixes, content changes, refactors, documentation, and CI work should go to `dev`.

See `AGENTS.md` for the repository working rules.

## CI and deployment

There are two workflows:

### Fast AMD64 Build + Deploy

Runs automatically for application/runtime changes on `dev`.

It validates the frontend and content, runs Rust formatting/clippy/tests, builds the AMD64 runtime and local Docker image, deploys it to the Arch development host, then verifies the live application, database-backed retrieval, AI endpoint, and dev-only Role Match route. The Fast build enables the Rust `role-match` feature and the Role Match frontend panel.

Documentation-only changes do not trigger this application pipeline.

### Full Guardrail + Build + Publish

Manual production release from `dev`.

It performs the full validation and cross-architecture build, merges `dev` into `main` through the release flow, publishes the immutable production image, and deploys the exact release SHA to the Orange Pi. Production builds leave the Rust `role-match` feature disabled and hide the Role Match panel. Production verification also checks that the Role Match endpoint is absent. Failed verification rolls the application back to the previous known-good SHA.

## Runtime environments

### Development

The Arch development deployment reuses the infrastructure-managed `shared-postgres` instance. The fast workflow provides the application database URL through repository secrets. `Match a role` is available only in this development deployment.

### Production

Production runs on the ARM64 Orange Pi under `/opt/portfolio/` with:

- Portfolio application
- PostgreSQL 17 + pgvector
- 9router

The production `.env` stays on the host and is not committed to the repository. Application releases recreate only the Portfolio service; PostgreSQL and 9router remain persistent. Role Match is intentionally not part of the production runtime.

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
