SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help dev install lint typecheck audit guard-fast guard-full guard-release build preview clean docker-build docker-run

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'

dev: ## Run Next.js development server
	npm run dev

install: ## Install dependencies from the lockfile
	npm ci

lint: ## Run Biome checks
	npm run lint

typecheck: ## Run TypeScript without emitting files
	npm run typecheck

audit: ## Require zero known npm vulnerabilities
	npm run audit

guard-fast: ## Run policy, lint, and typecheck
	./.agents/scripts/engineering-guard.sh portfolio fast

guard-full: ## Run full static-site engineering guard
	./.agents/scripts/engineering-guard.sh portfolio full

guard-release: ## Run release static-site engineering guard
	./.agents/scripts/engineering-guard.sh portfolio release

build: ## Generate fully static site into ./out
	npm run build

preview: build ## Preview the exported static site on http://localhost:3000
	python3 -m http.server 3000 --directory out

clean: ## Remove generated output
	rm -rf .next out

docker-build: ## Build static nginx image
	docker build -t faris-portfolio-static .

docker-run: ## Serve the static nginx image on http://localhost:8080
	docker run --rm -p 8080:80 faris-portfolio-static
