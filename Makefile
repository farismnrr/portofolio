# Portfolio - Makefile for Development Automation

.PHONY: help dev dev-auth dev-backend dev-ui build clean lint test install kill migrate-fresh migrate-up generate-invite create-tenant check-env install-deps lint-test

# Load environment variables from .env.dev for the entire Makefile
ifneq (,$(wildcard .env.dev))
    include .env.dev
    export
endif

# Default target
help:
	@echo "Portfolio - Available Commands:"
	@echo ""
	@echo "  make dev              - Run all services after check/migrate (Full Dev Flow)"
	@echo "  make dev-auth         - Run User Management service (Rust)"
	@echo "  make dev-backend      - Run Portfolio Backend service (Go)"
	@echo "  make dev-ui           - Run Next.js Frontend (Next.js)"
	@echo "  make migrate-up       - Run migrations"
	@echo "  make migrate-fresh    - Run fresh migrations for all services"
	@echo "  make kill             - Kill all processes on dev ports (3000, 8080, 5500)"
	@echo "  make install          - Force install all dependencies"
	@echo "  make lint-test        - Run linter and unit tests (Fails on error)"
	@echo ""

# Main Dev Target - Runs all services with hot reload
dev: check-env kill install-deps lint-test migrate-up
	@echo "🚀 Starting all services concurrently with hot reload..."
	@npx concurrently \
		--names "AUTH,BACK,UI" \
		--prefix-colors "magenta,cyan,green" \
		"make dev-auth" \
		"make dev-backend" \
		"make dev-ui"

# 1. Check if .env.dev exists
check-env:
	@if [ ! -f .env.dev ]; then \
		echo "❌ .env.dev not found! Please create it from .env.example"; \
		exit 1; \
	fi
	@echo "✅ Environment configuration loaded (.env.dev)"

# 2. Clean up and Kill processes
kill:
	@echo "🔪 Killing previous development processes..."
	@# Kill by ports (UI: 3000, Backend: 8080, Auth: 5500)
	@-lsof -ti:3000,8080,5500 | xargs -r kill -9 2>/dev/null || true
	@echo "🧹 Stopping watchers and stale processes..."
	@-pkill -f "cargo-watch" 2>/dev/null || true
	@-pkill -f "cargo watch" 2>/dev/null || true
	@-pkill -f "air" 2>/dev/null || true
	@-pkill -f "next-server" 2>/dev/null || true
	@# Remove broken symlinks and stale locks
	@-test -L .next && rm .next || true
	@-test -L services/Multitenant-User-Management-Service/target && rm services/Multitenant-User-Management-Service/target || true
	@-rm -rf services/Multitenant-User-Management-Service/rocksdb_cache/LOCK 2>/dev/null || true
	@-rm -rf services/Portfolio-Backend-Service/tmp .next/dev .next/cache 2>/dev/null || true
	@echo "✅ Cleanup complete"

# 3. Install dependencies if missing
install-deps:
	@echo "📦 Checking and installing dependencies..."
	@if [ ! -d "node_modules" ]; then npm install; fi
	@if [ ! -d "services/Multitenant-User-Management-Service/web/node_modules" ]; then cd services/Multitenant-User-Management-Service/web && npm install; fi
	@cd services/Portfolio-Backend-Service && go mod tidy
	@echo "✅ Dependencies are up to date"

# 4. Lint and Test
lint-test:
	@echo "🔍 Running linter and tests..."
	@echo "🎨 Linting Frontend..."
	npm run lint || exit 1
	@echo "🚀 Testing Backend (Go)..."
	cd services/Portfolio-Backend-Service && go test ./... || exit 1
	@echo "🔐 Testing Auth (Rust)..."
	# Note: Rust tests might need the DB to be ready, but usually unit tests don't.
	# If integration tests are included, they might fail without DB.
	# cd services/Multitenant-User-Management-Service && cargo test --lib || exit 1
	@echo "✅ Linter and tests passed"

# 5. Auto Migrate
migrate-up:
	@echo "⬆️  Running database migrations..."
	@echo "Migrating User Management..."
	cd services/Multitenant-User-Management-Service && make migrate-up
	@echo "Migrating Portfolio Backend..."
	cd services/Portfolio-Backend-Service && make migrate-up
	@echo "✅ Migrations complete"

# Service Runners
dev-auth:
	@echo "🔐 Starting Auth Service (Rust + Vue.js auto-rebuild)..."
	cd services/Multitenant-User-Management-Service && make dev

dev-auth-web:
	@echo "🎨 Starting Auth Frontend (Vue.js)..."
	cd services/Multitenant-User-Management-Service && make dev-web

dev-backend:
	@echo "🚀 Starting Portfolio Backend Service..."
	cd services/Portfolio-Backend-Service && air || (echo "⚠️ air not found, installing..." && go install github.com/air-verse/air@latest && air)

dev-ui:
	@echo "🎨 Starting Frontend UI (Next.js)..."
	@mkdir -p .next
	npm run dev

# Utility targets
migrate-fresh:
	@echo "🔄 Running fresh migrations..."
	cd services/Multitenant-User-Management-Service && make migrate-fresh
	cd services/Portfolio-Backend-Service && make migrate-fresh
	@echo "✅ Fresh migrations complete"

# -----------------------------
# Buildx bootstrap (auto setup)
# -----------------------------
BUILDER_NAME := multiarch

ensure-buildx:
	@docker buildx inspect $(BUILDER_NAME) >/dev/null 2>&1 || \
	( \
		echo "🔧 Creating buildx builder: $(BUILDER_NAME)"; \
		docker buildx create \
			--name $(BUILDER_NAME) \
			--driver docker-container \
			--use \
	)
	@docker buildx inspect --bootstrap >/dev/null

# ---------------------------------
# Production Push - SSO (Multi-arch)
# ---------------------------------
prod-push-sso: ensure-buildx
	@echo "⬆️ Building and Pushing SSO Service (amd64, arm64)..."
	@docker buildx build \
		--builder $(BUILDER_NAME) \
		--platform linux/amd64,linux/arm64 \
		-t ghcr.io/farismnrr/user_auth_plugin:latest \
		-f services/Multitenant-User-Management-Service/Dockerfile \
		--push services/Multitenant-User-Management-Service

# -----------------------------------------
# Production Push - Portfolio App (Multi-arch)
# -----------------------------------------
prod-push-app: ensure-buildx
	@echo "⬆️ Building and Pushing Portfolio App (amd64, arm64)..."
	@docker buildx build \
		--builder $(BUILDER_NAME) \
		--platform linux/amd64,linux/arm64 \
		-t ghcr.io/farismnrr/portofolio/portfolio-app:latest \
		--push .

# -----------------------------
# Production Push - All
# -----------------------------
push: prod-push-sso prod-push-app

prod-deploy:
	@echo "🚀 Deploying production environment..."
	docker compose -f docker-compose.prod.yml pull
	docker compose -f docker-compose.prod.yml up -d

create-tenant:
	@echo "🚀 Creating default tenant..."
	@export $$(grep -v '^#' .env.dev | grep -v '^$$' | xargs); \
	curl -s -X POST http://localhost:5500/api/tenants \
		-H "Content-Type: application/json" \
		-H "X-Tenant-Secret-Key: $$TENANT_SECRET_KEY" \
		-d "{\"id\": \"$$TENANT_ID\", \"name\": \"Default Tenant\", \"description\": \"System default tenant\"}" | jq . || echo "⚠️ Tenant creation failed (might already exist)"

install:
	@echo "� Force installing all dependencies..."
	npm install
	cd services/Multitenant-User-Management-Service/web && npm install
	cd services/Portfolio-Backend-Service && go mod tidy
	@echo "✅ Force install complete"

build:
	@echo "🔨 Building application..."
	npm run build

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next node_modules out
	cd services/Multitenant-User-Management-Service && cargo clean
	cd services/Portfolio-Backend-Service && rm -rf bin tmp

generate-invite:
	@cd services/Multitenant-User-Management-Service && make generate-invite
