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

## API Endpoints

### Health Check
- `GET /health` - Returns server health status

### API v1 Status
- `GET /v1/status` - API status check

### Authentication (SSO Proxy)
- `POST /v1/auth/login` - Login via SSO
- `POST /v1/auth/refresh` - Refresh access token
- `GET /v1/auth/user` - Get current user info
- `POST /v1/auth/logout` - Logout

### Page Authentication (Password-based)
- `POST /v1/page-auth/authenticate` - Authenticate with password
- `GET /v1/page-auth/check` - Check authentication status

### Content (Open Graph)
- `GET /v1/og/fetch` - Fetch OG metadata from URL
- `GET /v1/og/proxy` - Proxy image from URL

### About Section (Protected - Requires Admin)
- `GET /v1/about` - Get about information
- `PATCH /v1/about` - Update about (admin only)
- `PATCH /v1/about/avatar` - Update avatar (admin only)

#### Social Links
- `GET /v1/about/social-links` - List social links
- `POST /v1/about/social-links` - Create social link (admin only)
- `PATCH /v1/about/social-links/:id` - Update social link (admin only)
- `DELETE /v1/about/social-links/:id` - Delete social link (admin only)

#### Work Experience
- `GET /v1/about/work-experiences` - List work experiences
- `POST /v1/about/work-experiences` - Create work experience (admin only)
- `PATCH /v1/about/work-experiences/:id` - Update work experience (admin only)
- `DELETE /v1/about/work-experiences/:id` - Delete work experience (admin only)

#### Education
- `GET /v1/about/education` - List education
- `POST /v1/about/education` - Create education (admin only)
- `PATCH /v1/about/education/:id` - Update education (admin only)
- `DELETE /v1/about/education/:id` - Delete education (admin only)

#### Skills
- `GET /v1/about/skills` - List skill categories
- `POST /v1/about/skills` - Create skill category (admin only)
- `PATCH /v1/about/skills/:id` - Update skill category (admin only)
- `DELETE /v1/about/skills/:id` - Delete skill category (admin only)
- `POST /v1/about/skills/:id/tags` - Add skill tag (admin only)
- `DELETE /v1/about/skills/tags/:tag_id` - Delete skill tag (admin only)

### Interactions (Works & Blogs)
- `GET /v1/interactions/works` - List all works
- `GET /v1/interactions/works/:slug` - Get work by slug
- `POST /v1/interactions/works` - Create work (admin only)
- `PUT /v1/interactions/works/:id` - Update work (admin only)
- `DELETE /v1/interactions/works/:id` - Delete work (admin only)
- `PATCH /v1/interactions/works/:slug/view` - Record work view
- `PATCH /v1/interactions/works/:slug/like` - Like work
- `PATCH /v1/interactions/works/:slug` - Update work metadata (admin only)

- `GET /v1/interactions/blogs` - List all blogs
- `GET /v1/interactions/blogs/:slug` - Get blog by slug
- `POST /v1/interactions/blogs` - Create blog (admin only)
- `PUT /v1/interactions/blogs/:id` - Update blog (admin only)
- `DELETE /v1/interactions/blogs/:id` - Delete blog (admin only)
- `PATCH /v1/interactions/blogs/:slug/view` - Record blog view
- `PATCH /v1/interactions/blogs/:slug/like` - Like blog
- `PATCH /v1/interactions/blogs/:slug` - Update blog metadata (admin only)

#### Comments
- `POST /v1/interactions/comments` - Create comment
- `GET /v1/interactions/:post_type/:post_slug/comments` - Get comments for post
- `DELETE /v1/interactions/comments/:id` - Delete comment (admin only)

### Dashboard (Protected - Requires Admin)
- `GET /v1/dashboard` - Get dashboard data

### API Documentation
- `GET /swagger` - Swagger UI documentation

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
