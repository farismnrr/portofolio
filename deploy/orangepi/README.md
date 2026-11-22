# Orange Pi production layout

The full release workflow copies this directory's Compose and shell files to `/opt/portfolio/` on the Orange Pi. The host-local `.env` is created separately and is never tracked.

The Compose project contains two services:

- `postgres`: `pgvector/pgvector:pg17`, with persistent named volume `portfolio_portfolio-postgres-data` and loopback-only port `5432`;
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
```

The next deployment removes the old model-service container as a Compose orphan. It does not delete the host-local `9router-data` directory or scrub legacy model-service keys from `.env`; both remain available if rollback is needed. PostgreSQL data is unchanged.

Before transferring the new Compose definition, the release workflow stores the current definition under `backup/` and records its relative path in `state/previous-compose`. `deploy.sh` accepts only a 40-character GHCR SHA tag, records the previous application SHA, updates the image reference, and recreates Portfolio while removing orphaned services. `verify.sh` checks the architecture, image identity, service health, loopback bindings, public site, and retrieval backend/evidence; on the new runtime it also checks that retired AI endpoints are absent. During rollback, it verifies the model service and AI path only when the restored legacy Compose definition includes them. `rollback.sh` restores the previous Compose definition and application SHA, then starts its required services and leaves persistent data untouched.

The original Arch database, Arch model-service state, old Orange Pi image, and legacy deployment directories remain separate rollback and infrastructure sources until separately cleaned up.
