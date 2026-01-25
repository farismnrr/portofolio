.PHONY: help run build test clean docker-build docker-up docker-down tidy lint kill migrate-up migrate-down migrate-fresh swagger

# Variables
APP_NAME=portfolio-backend-service
MAIN_PATH=./cmd/server
BUILD_DIR=./bin
DOCKER_IMAGE=$(APP_NAME):latest

swagger: ## Generate swagger documentation
	@echo "Generating swagger..."
	@~/go/bin/swag init -g cmd/server/main.go -o api/docs
	@echo "Swagger generated"

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

run: ## Run the application locally
	@echo "Starting server..."
	@go run $(MAIN_PATH)

kill: ## Kill processes running on port 8080
	@echo "Killing processes on port 8080..."
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || fuser -k 8080/tcp 2>/dev/null || echo "No process running on port 8080"
	@echo "Done"

build: ## Build the application binary
	@echo "Building $(APP_NAME)..."
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_PATH)
	@echo "Build complete: $(BUILD_DIR)/$(APP_NAME)"

test: ## Run tests
	@echo "Running tests..."
	@go test -v ./cmd/... ./internal/...

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./cmd/... ./internal/...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)
	@rm -f coverage.out coverage.html
	@echo "Clean complete"

tidy: ## Tidy and verify go.mod
	@echo "Tidying go.mod..."
	@go mod tidy
	@go mod verify

lint: ## Run linter (requires golangci-lint)
	@echo "Running linter..."
	@go vet ./cmd/... ./internal/...

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	@docker build -t $(DOCKER_IMAGE) -f Dockerfile .

docker-up: ## Start services with docker-compose
	@echo "Starting services..."
	@docker-compose -f docker-compose.yml up -d

docker-down: ## Stop services with docker-compose
	@echo "Stopping services..."
	@docker-compose -f docker-compose.yml down

docker-logs: ## Show docker-compose logs
	@docker-compose -f docker-compose.yml logs -f

dev: ## Run in development mode with hot reload (requires air)
	@air

install-tools: ## Install development tools
	@echo "Installing development tools..."
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@go install github.com/air-verse/air@latest
	@go install -tags 'postgres sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@echo "Tools installed"

# Database migration commands
migrate-up: ## Run database migrations
	@echo "⬆️  Running migrations..."
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs); \
	if [ "$$CORE_DB_TYPE" = "sqlite" ]; then \
		DB_NAME=$${CORE_DB_NAME:-portfolio.sqlite}; \
		case "$$DB_NAME" in \
			*.sqlite|*.db) ;; \
			*) DB_NAME="$$DB_NAME.sqlite";; \
		esac; \
		DATABASE_URL="sqlite3://$$DB_NAME?x-migrations-table="; \
	else \
		DATABASE_URL="postgres://$$CORE_DB_USER:$$CORE_DB_PASS@$$CORE_DB_HOST:$$CORE_DB_PORT/$$CORE_DB_NAME?sslmode=disable&x-migrations-table="; \
	fi; \
	echo "Migrating About domain..."; \
	$$HOME/go/bin/migrate -path migration/about -database "$${DATABASE_URL}about_schema_migrations" up; \
	echo "Migrating Interaction domain..."; \
	$$HOME/go/bin/migrate -path migration/interaction -database "$${DATABASE_URL}interaction_schema_migrations" up; \
	if [ "$$CORE_DB_SEED_DUMMY" = "true" ]; then \
		echo "🌱 Seeding dummy data..."; \
		go run cmd/seed/main.go; \
	fi
	@echo "✅ Migrations completed"

migrate-down: ## Rollback last migration
	@echo "⬇️  Rolling back migrations..."
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs); \
	if [ "$$CORE_DB_TYPE" = "sqlite" ]; then \
		DB_NAME=$${CORE_DB_NAME:-portfolio.sqlite}; \
		case "$$DB_NAME" in \
			*.sqlite|*.db) ;; \
			*) DB_NAME="$$DB_NAME.sqlite";; \
		esac; \
		DATABASE_URL="sqlite3://$$DB_NAME?x-migrations-table="; \
	else \
		DATABASE_URL="postgres://$$CORE_DB_USER:$$CORE_DB_PASS@$$CORE_DB_HOST:$$CORE_DB_PORT/$$CORE_DB_NAME?sslmode=disable&x-migrations-table="; \
	fi; \
	echo "Rolling back Interaction domain..."; \
	$$HOME/go/bin/migrate -path migration/interaction -database "$${DATABASE_URL}interaction_schema_migrations" down 1; \
	echo "Rolling back About domain..."; \
	$$HOME/go/bin/migrate -path migration/about -database "$${DATABASE_URL}about_schema_migrations" down 1; \
	@echo "✅ Rollback completed"

migrate-fresh: ## Drop all tables and re-run migrations
	@echo "🔄 Running fresh migrations..."
	@export $$(grep -v '^#' .env | grep -v '^$$' | xargs); \
	if [ "$$CORE_DB_TYPE" = "sqlite" ]; then \
		DB_NAME=$${CORE_DB_NAME:-portfolio.sqlite}; \
		case "$$DB_NAME" in \
			*.sqlite|*.db) ;; \
			*) DB_NAME="$$DB_NAME.sqlite";; \
		esac; \
		DATABASE_URL="sqlite3://$$DB_NAME?x-migrations-table="; \
	else \
		DATABASE_URL="postgres://$$CORE_DB_USER:$$CORE_DB_PASS@$$CORE_DB_HOST:$$CORE_DB_PORT/$$CORE_DB_NAME?sslmode=disable&x-migrations-table="; \
	fi; \
	echo "Dropping all tables..."; \
	$$HOME/go/bin/migrate -path migration/interaction -database "$${DATABASE_URL}interaction_schema_migrations" drop -f; \
	$$HOME/go/bin/migrate -path migration/about -database "$${DATABASE_URL}about_schema_migrations" drop -f; \
	echo "Migrating About domain..."; \
	$$HOME/go/bin/migrate -path migration/about -database "$${DATABASE_URL}about_schema_migrations" up; \
	echo "Migrating Interaction domain..."; \
	$$HOME/go/bin/migrate -path migration/interaction -database "$${DATABASE_URL}interaction_schema_migrations" up; \
	if [ "$$CORE_DB_SEED_DUMMY" = "true" ]; then \
		echo "🌱 Seeding dummy data..."; \
		go run cmd/seed/main.go; \
	fi
	@echo "✅ Fresh migrations completed"

