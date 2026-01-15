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
	@echo "  make build-docker     - Build Docker image"
	@echo "  make start-docker     - Run Docker image locally"
	@echo "  make push             - Push Docker image to GHCR"
	@echo "  make kill             - Kill processes running on ports 3000-3010"
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
	@echo "✅ All processes killed and cache cleaned"
