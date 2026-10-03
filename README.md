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
- `main` is the production branch and is only updated by the production release workflow through a pull request from `dev` to `main`.
- The release flow never deletes `dev` after merge, so development continues on the same branch after every release.

## CI / deployment

The repository intentionally has exactly two CI/CD workflows:

- `Full Guardrail + Build` runs automatically for pushes to `dev` and pull requests targeting `dev`, and may also be started manually from `dev`. It runs the full frontend guardrail, Rust format/clippy/tests, the configured AI smoke check, AMD64 and ARM64 production builds, and a multi-architecture container build. It does not publish images, merge into `main`, or deploy.
- `Full Guardrail + Build + Deploy` is manual-only via `workflow_dispatch` and must be dispatched from `dev`. It reuses the same `Full Guardrail + Build` workflow rather than maintaining a separate validation implementation. Only after that shared validation succeeds does it create or reuse the `dev` -> `main` release pull request, merge it without deleting `dev`, publish the validated multi-architecture runtime image, and deploy the merged production revision through the configured self-hosted runner.

There is no separate fast CI path. Development validation and release validation intentionally use the same full pipeline so a change cannot pass a weaker CI path and then fail because production uses different checks.

Automatic CI never publishes an image or deploys. Production changes reach `main` only through the manual full release workflow.

Container image:

`ghcr.io/farismnrr/portofolio/portfolio-app:latest`

The deployment target remains the Arch Linux `X64` self-hosted runner. The ARM64 image is also published so the same image tag can be deployed to an Orange Pi later without changing the build pipeline.

The application is exposed on port `3001` by the repository Compose configuration.

## AI runtime configuration

AI runtime configuration is supplied by GitHub Actions Repository Variables and deployment secrets. The server intentionally has no URL, model, or timeout fallback.

Required repository variables:

- `NINE_ROUTER_URL`
- `NINE_ROUTER_MODEL`
- `NINE_ROUTER_CONNECT_TIMEOUT_SECONDS`
- `NINE_ROUTER_TIMEOUT_SECONDS`

The 9router API key remains a repository secret.
