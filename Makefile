SHELL := /bin/bash
.DEFAULT_GOAL := help

COMPOSE := docker compose

.PHONY: help install lint typecheck audit guard-fast guard-full guard-release build clean image-pull recreate stop logs

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\\n", $$1, $$2}'

install: ## Install dependencies for production build validation
	npm ci

lint: ## Run Biome checks
	npm run lint

typecheck: ## Run Vue/TypeScript type checks
	npm run typecheck

audit: ## Require zero known npm vulnerabilities
	npm run audit

guard-fast: ## Run policy, lint, and typecheck
	./.agents/scripts/engineering-guard.sh portfolio fast

guard-full: ## Run full production engineering guard
	./.agents/scripts/engineering-guard.sh portfolio full

guard-release: ## Run release production engineering guard
	./.agents/scripts/engineering-guard.sh portfolio release

build: ## Build the production static site into ./dist
	npm run build

clean: ## Remove generated output
	rm -rf dist .ssr .tmp-ui-check

image-pull: ## Pull the latest production image built by CI
	$(COMPOSE) pull

recreate: image-pull ## Recreate the local production service from the CI image
	$(COMPOSE) up -d --force-recreate --remove-orphans

stop: ## Stop and remove the local production service
	$(COMPOSE) down

logs: ## Follow local production service logs
	$(COMPOSE) logs -f
