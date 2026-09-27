SHELL := /bin/bash
.DEFAULT_GOAL := help

IMAGE := ghcr.io/farismnrr/portofolio/portfolio-app:latest
CONTAINER := faris-portfolio

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
	docker pull $(IMAGE)

recreate: image-pull ## Recreate the local production container from the CI image
	-docker rm -f $(CONTAINER)
	docker run -d --name $(CONTAINER) --restart unless-stopped -p 3001:3001 $(IMAGE)

stop: ## Stop and remove the local production container
	-docker rm -f $(CONTAINER)

logs: ## Follow local production container logs
	docker logs -f $(CONTAINER)
