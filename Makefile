# Portfolio - Makefile for Development Automation

.PHONY: help dev start build build-docker start-docker push push-local clean lint install

# Default target
help:
	@echo "Portfolio - Available Commands:"
	@echo ""
	@echo "  make dev              - Run development server (npm run dev)"
	@echo "  make start            - Run production server (npm run start)"
	@echo "  make build            - Build application (npm run build)"
	@echo "  make lint             - Run linting (npm run lint)"
	@echo "  make install          - Install dependencies (npm install)"
	@echo "  make clean            - Clean build artifacts"
	@echo "  make dev-docker       - Run development environment in Docker (Fast)"
	@echo "  make dev-docker-build - Run development environment in Docker (Build)"
	@echo "  make dev-docker-stop  - Stop development environment and clean volumes"
	@echo "  make dev-docker-rebuild-frontend - Rebuild frontend only (when env vars change)"
	@echo ""

# Run development server
dev:
	@echo "🚀 Starting development server..."
	npm run dev

# Run production server
start:
	@echo "🚀 Starting production server (Standalone Mode)..."
	@# Copy static assets required for standalone mode
	@rm -rf .next/standalone/.next/static .next/standalone/public
	@mkdir -p .next/standalone/.next/static
	@cp -r public .next/standalone/public
	@cp -r .next/static .next/standalone/.next/
	@PORT=3000 node .next/standalone/server.js

# Build application
build:
	@echo "🔨 Building application..."
	npm run build

# Run linting
lint:
	@echo "🔍 Running linter..."
	npm run lint

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf .next node_modules out

# --- Docker Configuration ---
DOCKER_IMAGE_NAME = portfolio
GHCR_REPO = ghcr.io/farismnrr/portfolio

# Build Docker image
docker: build-docker
build-docker:
	@read -p "Enter Docker tag (default: latest): " tag; \
	tag=$${tag:-latest}; \
	echo "🐳 Building Docker image with tag: $$tag..."; \
	docker build -t $(DOCKER_IMAGE_NAME):$$tag -t $(GHCR_REPO):$$tag .; \
	echo "✅ Image tagged as $(DOCKER_IMAGE_NAME):$$tag and $(GHCR_REPO):$$tag"

# Run via Docker
start-docker:
	@read -p "Enter Docker tag to run (default: latest): " tag; \
	tag=$${tag:-latest}; \
	echo "🚀 Starting Docker container with tag: $$tag..."; \
	docker run --rm -p 3000:3000 $(DOCKER_IMAGE_NAME):$$tag

# Push to GHCR (reads env vars) - Multi-arch build
push-local: build-docker
	@read -p "Enter Docker tag to push (default: latest): " tag; \
	tag=$${tag:-latest}; \
	echo "🚀 Pushing to GHCR with multi-arch build (amd64, arm64) - tag: $$tag..."; \
	export $$(grep -v '^#' .env 2>/dev/null | grep -v '^$$' | xargs); \
	if [ -n "$${CR_PAT}" ] || [ -n "$${GITHUB_TOKEN}" ]; then \
		echo "🔐 Logging in to GHCR..."; \
		echo "$${CR_PAT:-$$GITHUB_TOKEN}" | docker login ghcr.io -u farismnrr --password-stdin; \
	else \
		echo "⚠️  No CR_PAT or GITHUB_TOKEN found. Skipping login (assuming already logged in)..."; \
	fi; \
	docker buildx build --platform linux/amd64,linux/arm64 -t $(GHCR_REPO):$$tag --push .; \
	echo "✅ Image pushed to $(GHCR_REPO):$$tag"

# Trigger GitHub Action for push
push:
	@echo "🚀 Triggering GitHub Actions workflow for Docker push..."
	@command -v gh >/dev/null 2>&1 || ( \
		echo "❌ GitHub CLI 'gh' not found."; \
		exit 1; \
	)
	@REF=$${REF:-main}; \
	echo "📦 Triggering workflow with ref: $$REF..."; \
	gh workflow run docker-publish.yml --ref $$REF || echo "⚠️  Workflow triggers might need configuration."

kill:
	@echo "🔪 Killing processes on ports 3000-3010..."
	@for port in $$(seq 3000 3010); do \
		pids=$$(lsof -ti:$$port 2>/dev/null); \
		if [ -n "$$pids" ]; then \
			echo "$$pids" | xargs -r kill -9 2>/dev/null || true; \
			echo "✅ Killed processes on port $$port"; \
		fi; \
	done
	@echo "🧹 Cleaning Next.js cache and lock files..."
	@rm -rf .next/dev .next/cache .next/server .next/static .next/trace 2>/dev/null || true

# Run development environment with Docker Compose (fast start, uses cache/existing images)
dev-docker:
	@echo "🚀 Starting development environment in Docker (Fast Mode)..."
	@trap 'echo "🛑 Cleaning up..."; docker compose --env-file .env.dev -f docker-compose.dev.yml down --remove-orphans --volumes' EXIT INT TERM; \
	docker compose --env-file .env.dev -f docker-compose.dev.yml down --remove-orphans --volumes; \
	docker compose --env-file .env.dev -f docker-compose.dev.yml up

# Run development environment with forced rebuild
dev-docker-build:
	@echo "🚀 Starting development environment in Docker (Forced Rebuild)..."
	@trap 'echo "🛑 Cleaning up..."; docker compose --env-file .env.dev -f docker-compose.dev.yml down --remove-orphans --volumes' EXIT INT TERM; \
	docker compose --env-file .env.dev -f docker-compose.dev.yml down --remove-orphans --volumes; \
	docker compose --env-file .env.dev -f docker-compose.dev.yml up --build

# Stop development environment and clean up
dev-docker-stop:
	@echo "🛑 Stopping development environment..."
	docker compose --env-file .env.dev -f docker-compose.dev.yml down --remove-orphans --volumes

# Rebuild frontend only (useful when env vars change)
dev-docker-rebuild-frontend:
	@echo "🔨 Rebuilding frontend with latest environment variables..."
	docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build portofolio

# Rebuild backend only
dev-docker-rebuild-backend:
	@echo "🔨 Rebuilding backend..."
	docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build backend

# Rebuild user-management only
dev-docker-rebuild-user-management:
	@echo "🔨 Rebuilding user-management..."
	docker compose --env-file .env.dev -f docker-compose.dev.yml up -d --build user-management

# Deep clean Docker (Dangerous: restores disk space by removing ALL unused items)
docker-purge:
	@echo "⚠️  Deep cleaning Docker (Pruning all unused images, containers, networks, and volumes)..."
	docker system prune --all --volumes -f
	@if [ -d "/mnt/docker-volumes" ]; then \
		echo "🧹 Cleaning stuck volumes in /mnt/docker-volumes..."; \
		sudo rm -rf /mnt/docker-volumes/* 2>/dev/null || true; \
	fi

# Refresh base images to fix cache corruption
refresh-base-images:
	@echo "🔄 Pulling fresh base images..."
	docker pull golang:1.25-bookworm
	docker pull rust:bookworm
	docker pull node:22-bookworm

# Create tenant and update .env
create-tenant:
	@echo "🚀 Creating tenant..."
	@output=$$(cd services/Multitenant-User-Management-Service && make create-tenant --no-print-directory); \
	echo "$$output"; \
	tenant_id=$$(echo "$$output" | jq -r '.data.tenant_id'); \
	if [ -n "$$tenant_id" ] && [ "$$tenant_id" != "null" ]; then \
		echo "✅ Tenant ID found: $$tenant_id"; \
		if grep -q "NEXT_PUBLIC_TENANT_ID=" .env; then \
			sed -i "s/^NEXT_PUBLIC_TENANT_ID=.*/NEXT_PUBLIC_TENANT_ID=$$tenant_id/" .env; \
		else \
			echo "NEXT_PUBLIC_TENANT_ID=$$tenant_id" >> .env; \
		fi; \
		echo "✨ Updated NEXT_PUBLIC_TENANT_ID in root .env"; \
		if [ -f "services/Portfolio-Backend-Service/.env" ]; then \
			if grep -q "TENANT_ID=" services/Portfolio-Backend-Service/.env; then \
				sed -i "s/^TENANT_ID=.*/TENANT_ID=$$tenant_id/" services/Portfolio-Backend-Service/.env; \
				echo "✨ Updated TENANT_ID in backend .env"; \
			else \
				echo "TENANT_ID=$$tenant_id" >> services/Portfolio-Backend-Service/.env; \
				echo "✨ Added TENANT_ID to backend .env"; \
			fi; \
		fi; \
	else \
		echo "❌ Failed to parse tenant_id from output"; \
		exit 1; \
	fi

# Production Build
prod-build:
	@echo "🏗️ Building production images..."
	@# Load environment variables from .env.prod for frontend build
	@export $$(grep -v '^#' .env.prod | xargs) && \
	docker build -t ghcr.io/farismnrr/user_auth_plugin:latest -f services/Multitenant-User-Management-Service/Dockerfile services/Multitenant-User-Management-Service && \
	docker build -t ghcr.io/farismnrr/portofolio/portfolio-app:latest \
		--build-arg NEXT_PUBLIC_SSO_URL=$$NEXT_PUBLIC_SSO_URL \
		--build-arg NEXT_PUBLIC_BACKEND_URL=$$NEXT_PUBLIC_BACKEND_URL \
		--build-arg NEXT_PUBLIC_TENANT_ID=$$NEXT_PUBLIC_TENANT_ID \
		--build-arg NEXT_PUBLIC_API_KEY=$$NEXT_PUBLIC_API_KEY \
		.

# Production Push
prod-push:
	@echo "⬆️ Pushing production images to GHCR..."
	docker push ghcr.io/farismnrr/user_auth_plugin:latest
	docker push ghcr.io/farismnrr/portofolio/portfolio-app:latest

# Production Deploy
prod-deploy:
	@echo "🚀 Deploying production environment..."
	docker compose -f docker-compose.prod.yml pull
	docker compose -f docker-compose.prod.yml up -d

# Generate invite code
generate-invite:
	@echo "🚀 Generating invitation code..."
	@cd services/Multitenant-User-Management-Service && make generate-invite --no-print-directory
