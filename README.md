# Portfolio

Personal portfolio implemented with Svelte and served by a Rust + Axum application.

## Stack

- Svelte + Vite
- Rust + Axum
- Repository-local Markdown content
- Docker
- GitHub Actions
- GitHub Container Registry (GHCR)

Portfolio data lives under `frontend/content/`. Profile, experience, education, skills, projects, blog posts, certifications, gallery entries, navigation, and page copy are loaded from Markdown at build time.

Static media lives under `frontend/public/`.

## Generate CV with AI

The About page uses one evidence-grounded CV pipeline with a deterministic General profile. The shared registry lives in [`frontend/content/cv-profiles.json`](frontend/content/cv-profiles.json) and is consumed by the Svelte workflow and Rust retrieval/PDF renderer.

The pipeline keeps portfolio Markdown as the source of truth, then performs hybrid retrieval, metadata reranking, evidence planning, AI wording, grounding validation, deterministic source enrichment, and validated PDF rendering. AI cannot choose technical-scope labels or provide factual identity fields; those come from the profile and portfolio content. The output uses a deterministic filename and page budget, with a minimum 10pt body typography floor.

## Branch workflow

Development happens on `dev`.

- Use `dev` for feature work, fixes, refactors, content edits, documentation, and CI/CD changes.
- Do not develop directly on `main`.
- `main` is the production release branch and is only updated by the explicit full production release workflow through a pull request from `dev` to `main`.
- The release flow never deletes `dev` after merge, so development continues on the same branch after every release.

## CI / deployment

The repository has two CI/CD workflows with deliberately different responsibilities:

- `Fast Guardrail + AMD64 Build + Deploy` is the normal development loop. It runs as one job on the X64 self-hosted runner and is change-aware. Frontend source/config edits run the fast architecture/type guardrail, content validation, and production frontend build; Markdown/static-content-only edits skip Svelte/type/architecture source checks and run only content validation plus the production frontend build. Frontend edits then perform only an incremental Rust runtime rebuild/relink because the Axum binary embeds `frontend/dist` through `rust_embed`; Rust format/clippy are skipped when server source itself did not change. Server-only edits reuse the last valid frontend `dist`, while Docker/Compose-only edits avoid unrelated compiler work when cached runtime artifacts are still valid. Documentation-only repository edits do not trigger the application pipeline. The runner preserves `frontend/node_modules`, `frontend/dist`, Cargo build output, Docker layers, and a portfolio-specific isolated Rust/Cargo toolchain under `~/.cache/portfolio-ci`, so normal follow-up builds reuse previous work instead of starting from zero. Mermaid remains a local lazy-loaded runtime, but its official prebuilt ESM bundle is staged into `frontend/public/vendor/` before Vite builds so Vite copies it as a static asset instead of transforming Mermaid's full dependency graph on every frontend build. The fast path builds only AMD64, skips Rust tests/AI smoke/ARM64/multi-arch work, and deploys the local `portfolio-app:dev` image directly without a GHCR push/pull round trip.
- `Full Guardrail + Build + Publish` is the explicit production release workflow. It remains manual-only via `workflow_dispatch` from `dev`. Its full validation is defined inline: frontend guardrail/build, Rust format/clippy/tests, configured AI smoke check, AMD64 and ARM64 production builds, and a multi-architecture container build. Only after all full checks pass does it create or reuse the `dev` -> `main` release pull request, merge it without deleting `dev`, publish the validated multi-architecture runtime image (AMD64 + ARM64) to GHCR, and deploy the exact immutable `main` SHA to the Orange Pi. The release job then verifies the live application, PostgreSQL/pgvector retrieval, 9router, AI response, public site, and error-free startup; a failed verification restores the previous known-good application SHA and fails the workflow.

There is no standalone `Full Guardrail + Build` workflow. The fast path is intentionally incremental and machine-local for quick iteration; the full release path remains the clean comprehensive verification boundary.

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
 
The fast deploy workflow requires `shared-postgres` to be healthy and checks `/api/cv/retrieve` after deployment. The check requires nonempty evidence and backend `pgvector+postgres-fts`; HTTP 200 with `memory-fallback` fails the deployment verification. This shared Arch database is a development/fast-run dependency only; production uses the Orange Pi database described above. Removing the old `cv-db` service allows Compose to remove its orphan container. Remove the old `portofolio_portfolio-cv-pgdata` volume only after backing up, migrating, and verifying the shared database.
