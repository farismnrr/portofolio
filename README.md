# Portfolio

Clean minimal portfolio UI implemented with Svelte and served as a SPA by Rust + Axum.

## Stack

- Svelte + Vite
- Rust + Axum
- Docker
- GitHub Actions
- GitHub Container Registry (GHCR)

The frontend builds to `frontend/dist`. The Axum server serves that directory with SPA fallback.

## Container image

On every push to `main` or `refactor/ui-tech-stack-reset`, CI validates the frontend and Rust server, then builds and pushes a container image to:

`ghcr.io/farismnrr/portofolio`

Published tags include:

- `sha-<commit>`
- the branch name
- `latest` for `main`

## Docker Compose

The repository includes a deployment-ready `compose.yaml`.

By default it uses:

`ghcr.io/farismnrr/portofolio:latest`

You can override the image and exposed port with:

- `PORTFOLIO_IMAGE`
- `PORTFOLIO_PORT`

Self-hosted runner deployment is intentionally not wired yet. The runner can later pull the CI-built image and recreate the Compose service without compiling anything on the host.
