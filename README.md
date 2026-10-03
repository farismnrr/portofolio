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

- `Fast Guardrail + Build` runs automatically for pushes to `dev` and pull requests targeting `dev`, and may also be started manually from `dev`. It runs the fast architecture/content/type guardrail and builds the frontend and server without publishing, merging into `main`, or deploying.
- `Full Guardrail + Build + Deploy` is manual-only via `workflow_dispatch` and must be dispatched from `dev`. It runs the full guardrail and tests, performs the configured AI smoke check, builds the production runtime, then creates or reuses the `dev` -> `main` release pull request and merges it without deleting `dev`. After the merge succeeds, it publishes the multi-architecture runtime image and deploys the merged production revision through the configured self-hosted runner.

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
