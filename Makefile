SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help dev install lint typecheck audit guard-fast guard-full guard-release build preview clean docker-build docker-run

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\\n", $$1, $$2}'

dev: ## Run the Vite development server on port 3006
	npm run dev

install: ## Install dependencies from the lockfile
	npm ci

lint: ## Run Biome checks
	npm run lint

typecheck: ## Run Vue/TypeScript type checks
	npm run typecheck

audit: ## Require zero known npm vulnerabilities
	npm run audit

guard-fast: ## Run policy, lint, and typecheck
	./.agents/scripts/engineering-guard.sh portfolio fast

guard-full: ## Run full static-site engineering guard
	./.agents/scripts/engineering-guard.sh portfolio full

guard-release: ## Run release static-site engineering guard
	./.agents/scripts/engineering-guard.sh portfolio release

build: ## Prerender the fully static site into ./dist
	npm run build

preview: ## Build and serve the production SPA on port 3001
	npm run preview

clean: ## Remove generated output
	rm -rf dist .ssr .tmp-ui-check

docker-build: ## Build production SPA image
	docker build -t faris-portfolio-static .

docker-run: ## Serve the production SPA on http://localhost:3001
	docker run --rm -p 3001:3001 faris-portfolio-static
