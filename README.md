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

## CI / deployment

CI is intentionally manual-only. Nothing runs automatically on push or pull request.

Two GitHub Actions workflows are available:

- `Fast Guardrail + Build` runs the fast architecture/content/type guardrail and builds the frontend and server without deploying.
- `Full Guardrail + Build + Deploy` runs the full guardrail and tests, performs the configured AI smoke check, builds and publishes the multi-architecture runtime image, then deploys through the configured self-hosted runner.

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
