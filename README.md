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

- `Fast Guardrail + AMD64 Build + Deploy` is the normal development loop. It runs on the X64 self-hosted runner as one job so frontend validation, Rust compilation, AMD64 image packaging, and deployment stay on the same machine. The checkout is refreshed while preserving `frontend/node_modules`; npm downloads and Cargo build output are also cached locally, so subsequent runs reuse unchanged work rather than rebuilding from a fresh hosted runner. Rust uses a persistent `CARGO_TARGET_DIR`; fast clippy checks normal runtime targets only; portable AMD64 MUSL binaries are produced with Zig/cargo-zigbuild without requiring `sudo`; Docker uses the machine-local layer cache. Pushes to `dev` build `portfolio-app:dev` locally and deploy that same local image directly, without a GHCR push/pull round trip. Pull requests validate/build but do not deploy, and untrusted fork PR code is not executed on the self-hosted runner.
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
