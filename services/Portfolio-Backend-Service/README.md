# Portfolio Backend Service

Backend service for the portfolio application, built with Go and Echo framework.

## Features

- **Auth Proxy**: Proxies authentication requests to SSO service
- **Page Authentication**: Simple password-based auth for protected pages
- **Config API**: Returns SSO configuration to frontend
- **Open Graph**: Fetches and proxies OG metadata and images

## Tech Stack

- **Go 1.21+**
- **Echo v4** - HTTP framework
- **Zap** - Structured logging
- **godotenv** - Environment variable loading

## Project Structure

```
.
├── cmd/
│   └── server/          # Application entry point
├── internal/
│   ├── config/          # Configuration management
│   ├── domain/          # Domain entities and interfaces
│   ├── usecase/         # Business logic
│   ├── handler/         # HTTP handlers
│   ├── repository/      # Data access layer
│   └── server/          # Server setup and routing
├── pkg/
│   ├── logger/          # Logging utilities
│   ├── httpclient/      # HTTP client wrapper
│   └── response/        # Response helpers
└── deployments/         # Docker and deployment configs
```

## Getting Started

### Prerequisites

- Go 1.21 or higher
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your configuration

### Running Locally

```bash
# Install dependencies
go mod tidy

# Run the server
make run

# Or use go run directly
go run cmd/server/main.go
```

The server will start on `http://localhost:8080` (or the port specified in `.env`).

### Available Commands

```bash
make help              # Show all available commands
make run               # Run the application
make build             # Build binary
make test              # Run tests
make test-coverage     # Run tests with coverage
make docker-build      # Build Docker image
make docker-up         # Start with docker-compose
make docker-down       # Stop docker-compose services
make clean             # Clean build artifacts
```

## Configuration

All configuration is done via environment variables. See `.env.example` for available options:

- `PORT` - Server port (default: 8080)
- `ENV` - Environment (development/production)
- `SSO_URL` - SSO service URL
- `API_KEY` - API key for SSO service
- `TENANT_ID` - Tenant ID
- `PAGE_ACCESS_PASSWORD` - Password for protected pages
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `LOG_LEVEL` - Logging level (debug/info/warn/error)

## Documentation

### API Reference
→ [API-REFERENCE.md](./docs/API-REFERENCE.md) - Complete endpoint documentation

### Contracts
→ [api/docs/contracts/](./api/docs/contracts/) - Contract-driven specifications for all endpoints

### Swagger UI
Access interactive API documentation at:
- **Development**: http://localhost:8080/swagger
- **Production**: https://api.example.com/swagger

## Testing

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage
```

## Deployment

### Docker

```bash
# Build image
make docker-build

# Start services
make docker-up
```

### Production

1. Set `ENV=production` in environment
2. Configure proper `ALLOWED_ORIGINS`
3. Use HTTPS (set secure cookie flag)
4. Set appropriate `LOG_LEVEL`

## Development

### Hot Reload

Install Air for hot reloading:

```bash
make install-tools
make dev
```

### Linting

```bash
make lint
```

## License

MIT
