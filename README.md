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

The repository has two CI/CD workflows with separate development and release responsibilities:

- `Fast Guardrail + AMD64 Build + Deploy` is the default development path. It runs automatically for pushes to `dev` and pull requests targeting `dev`. It runs frontend architecture/content/type checks, builds the frontend, runs Rust format/clippy, builds the AMD64 production binary, and builds an AMD64-only container. Pull requests stop after validation/build. Pushes to `dev` publish `ghcr.io/farismnrr/portofolio/portfolio-app:latest` as an AMD64 image and deploy it to the X64 self-hosted host.
- `Full Guardrail + Build + Deploy` is the explicit production release workflow. It remains manual-only via `workflow_dispatch` from `dev`. Its full validation is defined inline: frontend guardrail/build, Rust format/clippy/tests, configured AI smoke check, AMD64 and ARM64 production builds, and a multi-architecture container build. Only after all full checks pass does it create or reuse the `dev` -> `main` release pull request, merge it without deleting `dev`, publish the validated multi-architecture runtime image, and deploy the merged production revision.

There is no standalone `Full Guardrail + Build` workflow. This keeps normal edits fast and keeps the expensive full validation attached only to an explicit production release.

Container image:

`ghcr.io/farismnrr/portofolio/portfolio-app:latest`

The automatic development deployment targets the Arch Linux `X64` self-hosted runner with an AMD64-only image. The manual full release additionally verifies and publishes ARM64 compatibility for future ARM deployments.

The application is exposed on port `3001` by the repository Compose configuration.

## AI runtime configuration

AI runtime configuration is supplied by GitHub Actions Repository Variables and deployment secrets. The server intentionally has no URL, model, or timeout fallback.

Required repository variables:

- `NINE_ROUTER_URL`
- `NINE_ROUTER_MODEL`
- `NINE_ROUTER_CONNECT_TIMEOUT_SECONDS`
- `NINE_ROUTER_TIMEOUT_SECONDS`

The 9router API key remains a repository secret.
