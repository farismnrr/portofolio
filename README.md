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

## Branch workflow

Development happens on `dev`.

- Use `dev` for feature work, fixes, refactors, content edits, documentation, and CI/CD changes.
- Do not develop directly on `main`.
- `main` is the production release branch and is only updated by the explicit full production release workflow through a pull request from `dev` to `main`.
- The release flow never deletes `dev` after merge, so development continues on the same branch after every release.

## CI / deployment

The repository has two CI/CD workflows with deliberately different responsibilities:

- `Fast Guardrail + AMD64 Build + Deploy` is the normal development loop. It runs as one job on the X64 self-hosted runner and is change-aware. Frontend source/config edits run the fast architecture/type guardrail, content validation, and production frontend build; Markdown/static-content-only edits skip Svelte/type/architecture source checks and run only content validation plus the production frontend build. Frontend edits then perform only an incremental Rust runtime rebuild/relink because the Axum binary embeds `frontend/dist` through `rust_embed`; Rust format/clippy are skipped when server source itself did not change. Server-only edits reuse the last valid frontend `dist`, while Docker/Compose-only edits avoid unrelated compiler work when cached runtime artifacts are still valid. Documentation-only repository edits do not trigger the application pipeline. The runner preserves `frontend/node_modules`, `frontend/dist`, Cargo build output, Docker layers, and a portfolio-specific isolated Rust/Cargo toolchain under `~/.cache/portfolio-ci`, so normal follow-up builds reuse previous work instead of starting from zero. Mermaid remains a local lazy-loaded runtime, but its official prebuilt ESM bundle is staged into `frontend/public/vendor/` before Vite builds so Vite copies it as a static asset instead of transforming Mermaid's full dependency graph on every frontend build. The fast path builds only AMD64, skips Rust tests/AI smoke/ARM64/multi-arch work, and deploys the local `portfolio-app:dev` image directly without a GHCR push/pull round trip.
- `Full Guardrail + Build + Deploy` is the explicit production release workflow. It remains manual-only via `workflow_dispatch` from `dev`. Its full validation is defined inline: frontend guardrail/build, Rust format/clippy/tests, configured AI smoke check, AMD64 and ARM64 production builds, and a multi-architecture container build. Only after all full checks pass does it create or reuse the `dev` -> `main` release pull request, merge it without deleting `dev`, publish the validated multi-architecture runtime image to GHCR, and deploy the merged production revision.

There is no standalone `Full Guardrail + Build` workflow. The fast path is intentionally incremental and machine-local for quick iteration; the full release path remains the clean comprehensive verification boundary.

Production container image:

`ghcr.io/farismnrr/portofolio/portfolio-app:latest`

Fast development deployment uses the local `portfolio-app:dev` AMD64 image on the Arch Linux X64 self-hosted runner. Full production release additionally verifies and publishes ARM64 compatibility for future ARM deployments.

The application is exposed on port `3001` by the repository Compose configuration.

## AI runtime configuration

AI runtime configuration is supplied by GitHub Actions Repository Variables and deployment secrets. The server intentionally has no URL, model, or timeout fallback.

Required repository variables:

- `NINE_ROUTER_URL`
- `NINE_ROUTER_MODEL`
- `NINE_ROUTER_CONNECT_TIMEOUT_SECONDS`
- `NINE_ROUTER_TIMEOUT_SECONDS`

The 9router API key remains a repository secret.
