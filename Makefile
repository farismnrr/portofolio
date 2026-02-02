# =====================================================
# Portfolio - Unified Makefile (Dev + CI + Prod)
# =====================================================

# -----------------------------
# Global Settings
# -----------------------------
SHELL := /bin/bash
.NOTPARALLEL:
.DEFAULT_GOAL := help

# -----------------------------
# Environment
# -----------------------------
ENV_FILE := .env.dev

ifneq (,$(wildcard $(ENV_FILE)))
	include $(ENV_FILE)
	export
endif

# -----------------------------
# Images / Tags
# -----------------------------
SSO_IMAGE ?= ghcr.io/farismnrr/user_auth_plugin
APP_IMAGE ?= ghcr.io/farismnrr/portofolio/portfolio-app
TAG ?= latest

# -----------------------------
# Buildx
# -----------------------------
BUILDER_NAME := multiarch

# -----------------------------
# Phony
# -----------------------------
.PHONY: \
	help dev check-env kill install-deps install-tools lint-test \
	dev-auth dev-backend dev-ui \
	migrate-up migrate-fresh \
	ensure-docker ensure-buildx \
	prod-push-sso prod-push-app push \
	ci build clean \
	prod-up prod-down prod-restart health-check \
	prod-deploy create-tenant

# =====================================================
# Help
# =====================================================
help: ## Show available commands
	@echo ""
	@echo "🚀 Portfolio Makefile"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  %-28s %s\n", $$1, $$2}'
	@echo ""

# =====================================================
# Dev Flow
# =====================================================
dev: check-env kill install-tools install-deps lint-test migrate-up bootstrap ## Run full dev environment
	@echo "🚀 Starting all services (AUTH, BACKEND, UI)..."
	@trap 'make kill' EXIT INT TERM; \
	npx concurrently \
		--names "AUTH,BACK,UI" \
		--prefix-colors "magenta,cyan,green" \
		"make dev-auth" \
		"make dev-backend" \
		"make dev-ui"

check-env: ## Ensure .env.dev exists
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "❌ $(ENV_FILE) not found"; exit 1; \
	fi
	@echo "✅ Environment loaded ($(ENV_FILE))"

# =====================================================
# Cleanup / Kill
# =====================================================
kill: ## Gracefully stop dev services
	@echo "🔪 Stopping services on ports 3000, 8080, 5500..."
	@-lsof -ti:3000,8080,5500 | xargs -r kill -15 || true
	@sleep 1
	@-lsof -ti:3000,8080,5500 | xargs -r kill -9 || true
	@echo "🧹 Cleaning caches..."
	@-rm -rf .next .next/cache .next/dev || true
	@-rm -rf services/Portfolio-Backend-Service/tmp || true
	@-rm -rf services/Multitenant-User-Management-Service/rocksdb_cache/LOCK || true
	@echo "🐳 Stopping postgres-sql container..."
	@-docker stop postgres-sql 2>/dev/null || true
	@-docker rm postgres-sql 2>/dev/null || true
	@echo "✅ Cleanup complete"

# =====================================================
# Install
# =====================================================
install-tools: ## Install required dev tools
	@command -v air >/dev/null 2>&1 || \
		(go install github.com/air-verse/air@latest && echo "✅ air installed")
	@if [ ! -f node_modules/.bin/concurrently ]; then \
		npm install --save-dev concurrently && echo "✅ concurrently installed"; \
	fi

install-deps: ## Install project dependencies
	@echo "📦 Installing dependencies..."
	@if [ ! -d node_modules ]; then npm install; fi
	@if [ ! -d services/Multitenant-User-Management-Service/web/node_modules ]; then \
		cd services/Multitenant-User-Management-Service/web && npm install; \
	fi
	@cd services/Portfolio-Backend-Service && go mod tidy
	@echo "✅ Dependencies ready"

# =====================================================
# Quality
# =====================================================
lint-test: ## Run linters & tests
	@echo "🔍 Linting frontend..."
	npm run lint
	@echo "🧪 Testing backend (Go)..."
	cd services/Portfolio-Backend-Service && go test ./...
	@echo "✅ Quality checks passed"

# =====================================================
# Migration
# =====================================================
migrate-up: ## Run migrations
	@echo "⬆️ Running migrations..."
	@if ! docker ps --format '{{.Names}}' | grep -q postgres-sql; then \
		echo "📦 Starting PostgreSQL container..."; \
		if [ ! -f .env.prod ]; then cp .env.dev .env.prod; fi; \
		docker run -d --name postgres-sql \
			-e POSTGRES_PASSWORD=$$(grep POSTGRES_PASSWORD .env.prod | cut -d'=' -f2) \
			-e POSTGRES_USER=$$(grep POSTGRES_USER .env.prod | cut -d'=' -f2) \
			-e POSTGRES_DB=$$(grep POSTGRES_DB .env.prod | cut -d'=' -f2) \
			-p 5432:5432 \
			postgres:15-alpine; \
		echo "⏳ Waiting for PostgreSQL to be ready..."; \
		sleep 5; \
		echo "🔑 Creating database user..."; \
		docker exec postgres-sql psql -U postgres -c "CREATE USER $$(grep CORE_DB_USER .env.prod | cut -d'=' -f2) WITH PASSWORD '$$(grep CORE_DB_PASS .env.prod | cut -d'=' -f2)';" 2>/dev/null || true; \
		docker exec postgres-sql psql -U postgres -c "ALTER USER $$(grep CORE_DB_USER .env.prod | cut -d'=' -f2) CREATEDB;" 2>/dev/null || true; \
	fi
	@cd services/Multitenant-User-Management-Service && make migrate-up
	@cd services/Portfolio-Backend-Service && make migrate-up
	@echo "✅ Migrations completed"

migrate-fresh: ## Drop & re-run migrations
	@echo "🔄 Fresh migrations..."
	@docker rm -f postgres-sql 2>/dev/null || true
	@make migrate-up
	@make bootstrap

# =====================================================
# Service Runners
# =====================================================
dev-auth: ## Run Auth service
	cd services/Multitenant-User-Management-Service && make dev

dev-backend: ## Run Portfolio Backend
	cd services/Portfolio-Backend-Service && air

dev-ui: ## Run Next.js frontend
	npm run dev

# =====================================================
# Docker / Buildx
# =====================================================
ensure-docker: ## Ensure Docker is running
	@docker info >/dev/null 2>&1 || \
		(echo "❌ Docker not running"; exit 1)

ensure-buildx: ensure-docker ## Ensure buildx builder exists
	@docker buildx inspect $(BUILDER_NAME) >/dev/null 2>&1 || \
		(docker buildx create --name $(BUILDER_NAME) --driver docker-container --use)
	@docker buildx inspect --bootstrap >/dev/null

prod-push-sso: ensure-buildx ## Build & push SSO (multi-arch)
	docker buildx build \
		--builder $(BUILDER_NAME) \
		--platform linux/amd64,linux/arm64 \
		-t $(SSO_IMAGE):$(TAG) \
		-f services/Multitenant-User-Management-Service/Dockerfile \
		--push services/Multitenant-User-Management-Service

prod-push-app: ensure-buildx ## Build & push Portfolio App (multi-arch)
	docker buildx build \
		--builder $(BUILDER_NAME) \
		--platform linux/amd64,linux/arm64 \
		-t $(APP_IMAGE):$(TAG) \
		--push .

# =====================================================
# PUSH (SEQUENTIAL – FIXED)
# =====================================================
push: ## Push all images (strictly sequential)
	@echo "🚀 Pushing SSO image..."
	@$(MAKE) prod-push-sso
	@echo "🚀 Pushing APP image..."
	@$(MAKE) prod-push-app
	@echo "✅ All images pushed sequentially"

# =====================================================
# CI / Build
# =====================================================
ci: check-env lint-test build ## CI pipeline entry

build: ## Local build
	npm run build

clean: ## Clean artifacts
	rm -rf .next node_modules out
	cd services/Multitenant-User-Management-Service && cargo clean
	cd services/Portfolio-Backend-Service && rm -rf bin tmp

# =====================================================
# Production Docker Stack
# =====================================================
prod-up: ensure-docker ## Start production stack
	@echo "🐳 Starting production stack..."
	@if [ ! -f .env.prod ]; then cp .env.dev .env.prod; fi
	@docker compose -f docker-compose.prod.yml --env-file .env.prod pull
	@docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
	@echo "⏳ Waiting for services to start..."
	@sleep 10
	@make health-check

prod-down: ## Stop and cleanup production stack
	@echo "🛑 Stopping production stack..."
	@docker compose -f docker-compose.prod.yml --env-file .env.prod down
	@echo "🧹 Removing volumes..."
	@docker volume rm portofolio_postgres_prod_data 2>/dev/null || true
	@echo "✅ Production stack stopped and cleaned"

prod-restart: prod-down prod-up ## Restart production stack

health-check: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo ""
	@echo "📊 Frontend Health (port 3000):"
	@curl -s -m 5 http://localhost:3000 > /dev/null && echo "✅ Running" || echo "❌ Not responding"
	@echo ""
	@echo "📊 Backend Health (port 8080):"
	@curl -s -m 5 http://localhost:8080/health | jq . 2>/dev/null || echo "❌ Health check failed"
	@echo ""
	@echo "📊 Auth Service Health (port 5500):"
	@curl -s -m 5 http://localhost:5500/health | jq . 2>/dev/null || echo "❌ Health check failed"
	@echo ""
	@echo "🐳 Running Containers:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "portfolio|sso" || echo "No containers found"
	@echo ""
	@echo "📋 Container Health Status:"
	@docker ps --format "table {{.Names}}\t{{.Status}}" --filter "health=healthy" | grep -E "portfolio|sso" || echo "⚠️  No healthy containers"

# =====================================================
# Deploy / Ops
# =====================================================
prod-deploy: prod-up ## Deploy production (alias for prod-up)

create-tenant: ## Create default tenant
	@export $$(grep -v '^#' $(ENV_FILE) | xargs); \
	curl -s -X POST http://localhost:5500/api/tenants \
		-H "Content-Type: application/json" \
		-H "X-Tenant-Secret-Key: $$TENANT_SECRET_KEY" \
		-d "{\"id\":\"$$TENANT_ID\",\"name\":\"Default Tenant\"}" | jq .

bootstrap: ## Run bootstrapping for fresh environment
	@echo "🧪 Bootstrapping environment..."
	@chmod +x scripts/bootstrap.sh
	@./scripts/bootstrap.sh

generate-invite: ## Generate a new invitation code
	@export $$(grep -v '^#' $(ENV_FILE) | xargs); \
	curl -s -X POST http://localhost:5500/auth/internal/invitations \
		-H "X-Tenant-Secret-Key: $$TENANT_SECRET_KEY" | jq .
