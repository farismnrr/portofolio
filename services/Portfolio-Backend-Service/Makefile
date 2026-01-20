.PHONY: help run build test clean docker-build docker-up docker-down tidy lint kill

# Variables
APP_NAME=portfolio-backend-service
MAIN_PATH=./cmd/server
BUILD_DIR=./bin
DOCKER_IMAGE=$(APP_NAME):latest

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

run: ## Run the application locally
	@echo "Starting server..."
	@go run $(MAIN_PATH)/main.go

kill: ## Kill processes running on port 8080
	@echo "Killing processes on port 8080..."
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || fuser -k 8080/tcp 2>/dev/null || echo "No process running on port 8080"
	@echo "Done"

build: ## Build the application binary
	@echo "Building $(APP_NAME)..."
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_PATH)/main.go
	@echo "Build complete: $(BUILD_DIR)/$(APP_NAME)"

test: ## Run tests
	@echo "Running tests..."
	@go test -v ./...

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	@go test -v -coverprofile=coverage.out ./...
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
	@golangci-lint run ./...

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	@docker build -t $(DOCKER_IMAGE) -f deployments/Dockerfile .

docker-up: ## Start services with docker-compose
	@echo "Starting services..."
	@docker-compose -f deployments/docker-compose.yml up -d

docker-down: ## Stop services with docker-compose
	@echo "Stopping services..."
	@docker-compose -f deployments/docker-compose.yml down

docker-logs: ## Show docker-compose logs
	@docker-compose -f deployments/docker-compose.yml logs -f

dev: ## Run in development mode with hot reload (requires air)
	@air

install-tools: ## Install development tools
	@echo "Installing development tools..."
	@go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	@go install github.com/air-verse/air@latest
	@echo "Tools installed"
