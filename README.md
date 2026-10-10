# Portfolio

Personal portfolio implemented with Svelte and served by a Rust + Axum application. Public routes are prerendered at build time to crawlable HTML, then hydrated by Svelte in the browser; Axum embeds and serves the generated route documents and static assets.

## Stack

- Svelte + Vite with build-time prerendering and hydration
- Rust + Axum
- Repository-local Markdown content
- Docker
- GitHub Actions
- GitHub Container Registry (GHCR)

Portfolio data lives under `frontend/content/`. Profile, experience, education, publications, skills, projects, blog posts, certifications, gallery entries, navigation, and page copy are loaded from Markdown at build time.

The production frontend build generates per-route HTML plus search/discovery assets such as `sitemap.xml`, `robots.txt`, `feed.xml`, `llms.txt`, and `llms-full.txt`. Route-specific title, description, canonical, Open Graph/Twitter metadata, and JSON-LD are included in the prerendered HTML so crawlers do not depend on client-side JavaScript for core content or metadata.

Static media lives under `frontend/public/`.

## Writing-style guardrail

Visible portfolio copy is checked by `frontend/scripts/check-writing-style.mjs`. The checker is an editorial guardrail, not an AI-authorship detector. It blocks a small set of strongly overused AI-style phrases and em dashes in changed visible copy, while reporting softer warnings for repetitive transitions, marketing-heavy vocabulary, repeated contrast templates, and very long sentence-like lines.

`npm run content:check` runs both Markdown/Mermaid validation and the writing-style guard against Markdown changed between `main` and the current `dev` head. This keeps existing historical copy from blocking unrelated work while preventing new or touched content from reintroducing the guarded patterns. `npm run content:style` can be run manually to audit all repository content.

Date/period metadata and similar factual range fields are intentionally exempt from the em-dash rule; code and Mermaid fences are also ignored so the guard only evaluates visible prose.

## Latest CV and AI role matching

The About page downloads the reviewed, versioned PDF at `frontend/public/downloads/Faris_Munir_Mahdi_CV.pdf` directly. Downloading the CV does not call AI or the PDF renderer. Editorial summary and project copy live in `frontend/content/cv-editorial.json`; identity, work history, dates, programs, education, and credentials are attached from portfolio Markdown. Layout and skills follow `frontend/content/cv-profiles.json`.

To publish an updated CV, run `CV_RENDER_URL=http://127.0.0.1:PORT/api/cv/render npm run cv:publish` from `frontend`, visually inspect both PDF pages, and commit the PDF with its editorial/source changes. The publishing script builds source-backed content without AI and replaces the PDF only after its two-page/text checks succeed. The CV keeps justified paragraphs, readable typography of at least 10pt, and separate employment and technical programs.

`Match a role` sends a job description to `POST /api/role-match/report`. A bounded server workflow extracts requirements, compares them against the entire embedded portfolio corpus (including every project section, academic work, engineering articles, and principles), validates exact source quotations and requirement coverage, computes a fixed evidence score, and renders a downloadable PDF. It reuses the configured 9router provider in the Rust runtime. Job descriptions and portfolio records are treated as data, not executable instructions. Invalid structured output gets one repair attempt per stage; there is no invented fallback report.

The report separates direct evidence, transferable/partial evidence, and requirements not evidenced in the portfolio. Must-have requirements have weight 3 and preferred requirements weight 1; direct evidence receives full credit and partial evidence half credit. The report includes mandatory coverage, unresolved must-haves, requirement explanations, exact portfolio quotes and links, verification questions, the scoring method, a portfolio snapshot hash, and the submitted JD. The score is evidence coverage rather than a hiring probability. Classification is AI-assisted and should be reviewed by a person. The request has a 180-second limit and at most two reports run concurrently; PDFs are returned with `no-store` and are not persisted by the application.

The existing `/api/cv/retrieve` hybrid retrieval route and `/api/ai/chat` remain available for runtime health checks. CV downloading and role matching do not use the old browser AI CV-generation flow.

## Branch workflow

Development happens on `dev`.

- Use `dev` for feature work, fixes, refactors, content edits, documentation, and CI/CD changes.
- Do not develop directly on `main`.
- `main` is the production release branch and is only updated by the explicit full production release workflow through a pull request from `dev` to `main`.
- The release flow never deletes `dev` after merge, so development continues on the same branch after every release.

## CI / deployment

The repository has two CI/CD workflows with deliberately different responsibilities:

- `Fast AMD64 Build + Deploy` is the development and pre-release validation loop on the X64 self-hosted runner. For application/runtime changes it reuses machine-local npm, Cargo, Rustup, Zig, and Docker caches, then runs the same frontend source/content gates that protect the full release (`guard`, Markdown/Mermaid plus writing-style content validation, strict Svelte/TypeScript diagnostics, and the production prerender build). It also runs Rust formatting, clippy with warnings denied, and the Rust test suite before producing the AMD64 MUSL runtime with `cargo-zigbuild`. After building the local `portfolio-app:dev` image it deploys to the Arch development host and verifies the homepage, PostgreSQL/pgvector retrieval with non-empty evidence, and a non-empty AI response through the application. Documentation-only changes do not trigger the application pipeline. This fast path still intentionally skips ARM64, QEMU, multi-architecture container validation, GHCR publishing, `dev` -> `main` merging, and Orange Pi production deployment.
- `Full Guardrail + Build + Publish` is the explicit production release workflow. It remains manual-only via `workflow_dispatch` from `dev`. Its full validation is defined inline: frontend guardrail/build (including the same writing-style content guard), Rust format/clippy/tests, configured AI smoke check, AMD64 and ARM64 production builds, and a multi-architecture container build. Only after all full checks pass does it create or reuse the `dev` -> `main` release pull request, merge it without deleting `dev`, publish the validated multi-architecture runtime image (AMD64 + ARM64) to GHCR, and deploy the exact immutable `main` SHA to the Orange Pi. The release job then verifies the live application, PostgreSQL/pgvector retrieval, 9router, AI response, public site, and error-free startup; a failed verification restores the previous known-good application SHA and fails the workflow.

There is no standalone `Full Guardrail + Build` workflow. The fast path now catches frontend, content/style, formatting, clippy, test, development database, and AI failures before a release is attempted; the full release remains the clean cross-architecture and production verification boundary.

Production container image:

`ghcr.io/farismnrr/portofolio/portfolio-app:latest`

Fast development deployment uses the local `portfolio-app:dev` AMD64 image on the Arch Linux X64 self-hosted runner. Full production release additionally verifies and publishes ARM64 compatibility for future ARM deployments.

The application is exposed on port `3001` by the repository Compose configuration. The Orange Pi production Compose definition lives at [`deploy/orangepi/compose.yaml`](deploy/orangepi/compose.yaml); it publishes only loopback ports for the application (`3001`), PostgreSQL (`5432`), and 9router (`20128`). Cloudflare continues to route the public site to the loopback application port.

## AI runtime configuration

AI runtime configuration is supplied by GitHub Actions Repository Variables and deployment secrets. The server intentionally has no URL, model, or timeout fallback.

Required repository variables:

- `NINE_ROUTER_URL`
- `NINE_ROUTER_MODEL`
- `NINE_ROUTER_CONNECT_TIMEOUT_SECONDS`
- `NINE_ROUTER_TIMEOUT_SECONDS`

The 9router API key remains a repository secret.

## Production runtime on Orange Pi

Production is self-contained on the ARM64 Orange Pi under `/opt/portfolio/`:

- the immutable Portfolio application image;
- PostgreSQL 17 with the `vector` extension and the `portfolio` database/role;
- 9router `0.5.95` with its persisted state;
- a mode-600 `.env`, Compose state, and deployment backups.

The production `.env` is created and maintained on the Orange Pi. It is never committed to Git. The deployment scripts in [`deploy/orangepi/`](deploy/orangepi/) update only the application image during a release, leave PostgreSQL and 9router running, and keep the previous application SHA for rollback.

The full workflow currently uses the existing Arch self-hosted runner as the SSH/Tailscale transport because this repository has no GitHub-hosted Tailscale/OIDC credentials configured. The Arch host is not a production database or AI dependency; the deployed application connects to the local Compose services on Orange Pi.

## Shared PostgreSQL on Arch (development)
 
The development deployment reuses the existing `shared-postgres` infrastructure container on Arch. The application uses host networking and connects through `127.0.0.1:5432` to the dedicated `portfolio` database using its own `portfolio` login role. Compose does not create a database container or database volume.
 
Set the repository secret `PORTFOLIO_DATABASE_URL` to the password-authenticated PostgreSQL connection URL for that database. The fast deploy workflow passes it to Compose, which supplies `DATABASE_URL` to the server. `DATABASE_URL` is required; the server does not fall back to the retired local database on port 5433. Keep credentials out of tracked files and repository variables.
 
Before deploying to a new host, provision the `portfolio` database and role and enable the `vector` extension as a database administrator. The runtime role owns its `cv_chunks` table and creates its GIN text-search and HNSW vector indexes. The shared infrastructure container and its data volume are managed separately from this application.
 
The fast deploy workflow requires `shared-postgres` to be healthy and checks `/api/cv/retrieve` after deployment. The check requires nonempty evidence and backend `pgvector+postgres-fts`; HTTP 200 with `memory-fallback` fails the deployment verification. It also checks a non-empty `/api/ai/chat` response. This shared Arch database is a development/fast-run dependency only; production uses the Orange Pi database described above. Removing the old `cv-db` service allows Compose to remove its orphan container. Remove the old `portofolio_portfolio-cv-pgdata` volume only after backing up, migrating, and verifying the shared database.
