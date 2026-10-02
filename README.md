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

Every push to `main` validates the frontend content and Svelte/TypeScript application, validates and builds the Rust server, publishes the runtime image to GHCR, and deploys through the configured self-hosted runner.

Container image:

`ghcr.io/farismnrr/portofolio/portfolio-app:latest`

The application is exposed on port `3001` by the repository Compose configuration.


## AI runtime configuration

AI runtime configuration is supplied by GitHub Actions Repository Variables and deployment secrets. The server intentionally has no URL, model, or timeout fallback.

Required repository variables:

- `NINE_ROUTER_URL`
- `NINE_ROUTER_MODEL`
- `NINE_ROUTER_CONNECT_TIMEOUT_SECONDS`
- `NINE_ROUTER_TIMEOUT_SECONDS`

The 9router API key remains a repository secret.
