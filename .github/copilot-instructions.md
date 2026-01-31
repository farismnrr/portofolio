# Portfolio - Copilot Instructions

## When to Apply

Reference these instructions when:
- Setting up development environment or troubleshooting build issues
- Working with microservices architecture (Frontend, Portfolio Backend, Auth service)
- Implementing features that require cross-service communication
- Debugging deployment or Docker-related problems
- Understanding authentication/authorization flow
- Working with database migrations or schema changes

## Quick Reference

### Critical Rules (PRIORITY: CRITICAL)
- **makefile-only**: Always use Makefile commands, never direct npm/docker/go/cargo
- **env-read-first**: Read `.env.dev` or `.env` files before making changes
- **volume-cleanup**: Use `make dev-docker-stop` for deep cleanup
- **port-conflicts**: Run `make kill` before starting dev server

### Development Workflows (PRIORITY: HIGH)
- **dev-local**: `make dev` for Next.js development
- **dev-full-stack**: `make dev-docker` for all services with live reload
- **service-specific**: cd into service dir, then use service Makefile
- **health-checks**: UI (3000), Backend (8080/health), Auth (5500/health)

### Architecture Patterns (PRIORITY: HIGH)
- **frontend-structure**: src/components/{domain}/, src/lib/, src/store/
- **styling-pattern**: Sass modules (`.module.scss`) for component-specific styles
- **backend-pattern**: Go/Echo with modular internal structure (Internal/Domain/Usecase)
- **auth-service**: Rust/Actix-web with tenant isolation

### Integration Points (PRIORITY: MEDIUM)
- **auth-docs**: Always reference `services/Multitenant-User-Management-Service/docs/`
- **tenant-management**: Use `make create-tenant` to register new tenants
- **api-keys**: Protected endpoints need `X-API-Key` and Bearer token

## Critical Rules

⚠️ **ALWAYS USE MAKEFILE COMMANDS** - Never run npm, docker, go, or cargo commands directly. All workflows are orchestrated through `Makefile` targets to ensure consistency, proper environment setup, and avoid common issues.

**Examples of what NOT to do:**
```bash
# ❌ WRONG - Don't do this
npm run dev
docker compose up
go run main.go
cargo run

# ✅ CORRECT - Always use Makefile
make dev
make dev-docker
cd services/Multitenant-User-Management-Service && make dev
cd services/Portfolio-Backend-Service && make run
```

**Why Makefile-first is critical:**
- Prevents environment variable mismatches
- Coordinates multi-service startup sequences
- Ensures consistent builds across dev/prod environments
- Handles Docker lifecycle management automatically

## Architecture Overview

Portfolio is a **microservices-based application** with three main components:

1. **Next.js Frontend** (`/src`) - Dashboard and portfolio UI, runs on port 3000
2. **Portfolio Backend** (`/services/Portfolio-Backend-Service`) - Go/Echo backend service on port 8080
3. **User Management Service** (`/services/Multitenant-User-Management-Service`) - Rust/Actix-web auth service on port 5500

### Service Communication
- Frontend → Portfolio Backend: Core functionality and configuration
- Frontend → User Management: SSO redirect flow with JWT tokens
- Portfolio Backend → User Management: Auth proxying and tenant verification

## Development Workflows

### Makefile-First Approach
**CRITICAL: Always use Makefile commands** instead of direct tool commands.

**Common workflows:**
```bash
make dev                          # Start Next.js development server
make dev-docker                   # Full stack in Docker (UI, Backend, Auth, DB)
make dev-docker-stop              # Stop and clean all volumes/containers
make dev-docker-rebuild-frontend  # Rebuild frontend only
make dev-docker-rebuild-backend   # Rebuild backend only
make build                        # Production build
make lint                         # Run linting (Biome for TS, Go lint)
make kill                         # Kill processes on ports 3000-3010
make create-tenant                # Create a new tenant and update .env
```

### Docker Development
- `docker-compose.dev.yml` - Development stack with volume mounts for hot reload
- `docker-compose.prod.yml` - Production-ready stack with GHCR images

### Service-Specific Commands

**Portfolio Backend (Go):**
```bash
cd services/Portfolio-Backend-Service
make run              # Start Go service
make test             # Run Go tests
```

**User Management (Rust):**
```bash
cd services/Multitenant-User-Management-Service
make dev              # Hot reload with cargo-watch
make migrate-up       # Run database migrations
```

## Code Conventions

### Frontend (Next.js)

**Component Organization:**
```
src/components/
  ├── about/           # About page components
  ├── blog/            # Blog components
  ├── dashboard/       # Dashboard specific UI
  ├── global/          # Global UI elements
  └── ...              # Other domain-specific components
```

**Styling:**
- Use Sass modules (`.module.scss`) for component-specific styles.
- Shared variables and breakpoints in Scss files.
- UI System based on `@once-ui-system/core`.

**State Management:**
- Zustand for global state management.

### Backend (Go)

**Modular Structure:**
- `cmd/server/` - Application entry point.
- `internal/` - Private application code (Handlers, Usecases, Repositories).
- `pkg/` - Public library code that can be used by other services.

### User Management (Rust)

**API Security:**
- Uses `X-API-Key` for service-to-service authentication.
- JWT-based user session management.

## Environment Configuration

**Environment Files:**
- `.env.dev` - Development environment configuration.
- `.env.prod` - Production environment configuration.
- `.env` - Local/Active configuration.

**Key Variables:**
- `NEXT_PUBLIC_SSO_URL`: URL for the auth service.
- `NEXT_PUBLIC_BACKEND_URL`: URL for the portfolio backend.
- `NEXT_PUBLIC_TENANT_ID`: Current active tenant ID.

## Deployment

**Docker Hub / GHCR:**
```bash
make prod-push-app   # Build and push frontend image
make prod-push-sso   # Build and push auth service image
make prod-push       # Push all images
```

**Production Deploy:**
```bash
make prod-deploy     # Pull and start production stack
```

## Common Pitfalls

1. **Direct Command Execution**: Never use `npm` or `go` directly; always use `make`.
2. **Environment Mismatch**: Ensure `NEXT_PUBLIC_TENANT_ID` matches between services.
3. **Port Conflicts**: If port 3000 or 8080 is blocked, use `make kill`.
4. **Volume Persistence**: Dev Docker volumes survive restarts; use `make dev-docker-stop` for cleanup.

## Key Files Reference

- [`Makefile`](../Makefile) - Root orchestration
- [`docker-compose.dev.yml`](../docker-compose.dev.yml) - Dev stack
- [`.env.dev`](../.env.dev) - Dev configuration
- [`services/Portfolio-Backend-Service/`](../services/Portfolio-Backend-Service/) - Go backend
- [`services/Multitenant-User-Management-Service/`](../services/Multitenant-User-Management-Service/) - Rust auth service
- [`src/components/`](../src/components/) - Frontend components
