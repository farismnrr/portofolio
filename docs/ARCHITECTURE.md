# Portfolio Microservices Architecture

This monorepo contains the complete portfolio application built with a microservices architecture.

## Services

### 1. Frontend Application
**Location**: `/` (root)  
**Technology**: Next.js 16 + React 19  
**Port**: 3000

Portfolio web application with project showcase, blog, and profile sections.

**Documentation**:
- [README.md](./README.md) - Frontend setup and development
- [src/](./src/) - Application source code

---

### 2. Portfolio Backend Service
**Location**: `services/Portfolio-Backend-Service/`  
**Technology**: Go + Echo Framework  
**Port**: 8080

Backend API service providing:
- Authentication proxy to SSO service
- Page access management
- Content delivery (Open Graph metadata)
- Portfolio data management (about, skills, work, education)
- Interactions (works, blogs, comments)
- Dashboard endpoints

**Documentation**:
- [README.md](./services/Portfolio-Backend-Service/README.md) - Backend setup
- [docs/API-REFERENCE.md](./services/Portfolio-Backend-Service/docs/API-REFERENCE.md) - Complete API endpoints
- [api/docs/contracts/](./services/Portfolio-Backend-Service/api/docs/contracts/) - Contract-driven specifications

---

### 3. Multitenant User Management Service (SSO)
**Location**: `services/Multitenant-User-Management-Service/`  
**Technology**: Rust + Actix-web  
**Port**: 5500

Central authentication service handling:
- User registration and authentication
- JWT token management
- Multi-tenant support
- MQTT user management
- API key management

**Documentation**:
- [README.md](./services/Multitenant-User-Management-Service/README.md) - Service setup
- [docs/](./services/Multitenant-User-Management-Service/docs/) - Complete integration guide
- [tests/e2e/contracts/](./services/Multitenant-User-Management-Service/tests/e2e/contracts/) - Contract specifications

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                        │
│                  Port 3000 (User UI)                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────────┐  ┌─────────────────────┐
│  Backend Service     │  │  SSO Service        │
│  (Go/Echo)           │  │  (Rust/Actix-web)   │
│  Port 8080           │  │  Port 5500          │
├──────────────────────┤  ├─────────────────────┤
│ • Auth Proxy         │  │ • Auth Management   │
│ • Portfolio Data     │◀─┤ • JWT Tokens        │
│ • Content Delivery   │  │ • Multi-tenancy     │
│ • Interactions       │  │ • MQTT Management   │
└──────────────────────┘  └─────────────────────┘
```

---

## Development Workflow

### Prerequisites
- Go 1.21+
- Rust 1.23+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15

### Quick Start

```bash
# Install root dependencies
npm install

# Start all services (dev mode with hot reload)
make dev

# Or use docker-compose for containerized stack
make dev-docker

# Check service health
make health-check
```

See [Makefile](./Makefile) for all available commands.

### Service-Specific Setup

**Backend Service**:
```bash
cd services/Portfolio-Backend-Service
make run
```

**SSO Service**:
```bash
cd services/Multitenant-User-Management-Service
make dev
```

---

## API Documentation

- **Frontend API**: Internal Next.js API routes
- **Backend API**: [docs/API-REFERENCE.md](./services/Portfolio-Backend-Service/docs/API-REFERENCE.md)
- **SSO API**: [services/Multitenant-User-Management-Service/docs/](./services/Multitenant-User-Management-Service/docs/)
- **Swagger UI**: Available at `http://localhost:8080/swagger` (development)

---

## Contract-Driven Development

All services use contract-driven development:

### Backend Service Contracts
Located at: `services/Portfolio-Backend-Service/api/docs/contracts/`

```
contracts/
├── about/               # Profile, skills, work, education
├── auth/                # SSO integration
├── content/             # Open Graph endpoints
├── dashboard/           # Admin dashboard
├── interaction/         # Works, blogs, comments
└── site/                # Page authentication
```

### SSO Service Contracts
Located at: `services/Multitenant-User-Management-Service/tests/e2e/contracts/`

```
contracts/
├── 2_auth_test/         # Authentication endpoints
├── 5_mqtt_test/         # MQTT management
├── 3_tenant_test/       # Tenant management
└── ...
```

---

## Database

PostgreSQL is used for data persistence:
- **Backend Database**: `portfolio_db`
- **SSO Database**: `sso_db`

Migrations are run automatically during service startup.

---

## Deployment

### Docker Stack
All services are containerized and can be deployed using:

```bash
make prod-up        # Start production stack
make prod-down      # Stop production stack
make prod-restart   # Restart all services
```

### Environment Configuration
- Development: `.env.dev`
- Production: `.env.prod`

---

## Repository Structure

```
.
├── src/                              # Frontend Next.js app
├── services/
│   ├── Portfolio-Backend-Service/    # Go backend
│   └── Multitenant-User-Management-Service/  # Rust SSO
├── deployments/                      # Docker configs
├── docs/                             # Documentation (this file)
├── Makefile                          # Root orchestration
├── docker-compose.yml                # Dev stack
├── docker-compose.prod.yml           # Prod stack
└── README.md                         # Root README
```

---

## Key Features

✅ **Microservices Architecture**: Independent services with clear boundaries  
✅ **Contract-Driven Development**: Contracts as single source of truth  
✅ **Multi-tenant Support**: SSO service handles multiple tenants  
✅ **Type Safety**: TypeScript, Rust, Go with full type checking  
✅ **API Documentation**: Comprehensive contracts and API references  
✅ **Docker Ready**: Complete containerization for all services  
✅ **Hot Reload**: Development mode with automatic reloading  
✅ **PostgreSQL**: Persistent storage with migrations  

---

## Troubleshooting

See individual service READMEs:
- [Backend Troubleshooting](./services/Portfolio-Backend-Service/README.md#troubleshooting)
- [SSO Troubleshooting](./services/Multitenant-User-Management-Service/docs/07-troubleshooting.md)

---

## License

MIT - See [LICENSE](./LICENSE) for details
