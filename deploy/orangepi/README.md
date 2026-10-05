# Orange Pi production layout

The full release workflow copies this directory's Compose and shell files to `/opt/portfolio/` on the Orange Pi. The host-local `.env` is created separately and is never tracked.

The Compose project contains three services:

- `postgres`: `pgvector/pgvector:pg17`, with persistent named volume `portfolio_portfolio-postgres-data` and loopback-only port `5432`;
- `nine-router`: pinned `decolua/9router:0.5.95`, with the migrated `9router-data` directory and loopback-only port `20128`;
- `portfolio`: the immutable GHCR image selected by `PORTFOLIO_IMAGE`, published through loopback port `3001` for the existing Cloudflare route.

The required `.env` names are:

```text
POSTGRES_DB
POSTGRES_SUPERUSER
POSTGRES_SUPERUSER_PASSWORD
POSTGRES_PORT
PORTFOLIO_DATABASE_URL
PORTFOLIO_IMAGE
PORTFOLIO_PORT
NINE_ROUTER_URL
NINE_ROUTER_MODEL
NINE_ROUTER_CONNECT_TIMEOUT_SECONDS
NINE_ROUTER_TIMEOUT_SECONDS
NINE_ROUTER_API_KEY
AI_EMBEDDING_MODEL
NINE_ROUTER_PORT
```

`deploy.sh` accepts only a 40-character GHCR SHA tag, records the previous application SHA, updates the image reference, pulls the exact tag, and recreates only `portfolio`. `verify.sh` checks the architecture, image identity, service health, loopback bindings, public site, retrieval backend/evidence, authenticated 9router, AI response, and recent application logs. `rollback.sh` restores the last SHA in `state/previous-sha` without touching PostgreSQL or 9router.

The original Arch database, Arch 9router state, old Orange Pi container, old image, and legacy deployment directories remain rollback sources until a separate cleanup decision.
