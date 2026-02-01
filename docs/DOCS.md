# Documentation Guide

Quick reference for all documentation in this monorepo.

## 📚 Main Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Microservices architecture overview |
| [../README.md](../README.md) | Frontend application guide |

---

## 🎯 Service Documentation

### Portfolio Backend Service
**Location**: `services/Portfolio-Backend-Service/`

| Document | Purpose |
|----------|---------|
| [README.md](../services/Portfolio-Backend-Service/README.md) | Setup and development guide |
| [docs/API-REFERENCE.md](../services/Portfolio-Backend-Service/docs/API-REFERENCE.md) | Complete API endpoint documentation |
| [api/docs/contracts/](../services/Portfolio-Backend-Service/api/docs/contracts/) | Contract specifications for all endpoints |

**Quick Links**:
- API Status: `GET /v1/status`
- Swagger UI: `http://localhost:8080/swagger`
- Health Check: `GET /health`

### SSO Service (Multitenant User Management)
**Location**: `services/Multitenant-User-Management-Service/`

| Document | Purpose |
|----------|---------|
| [README.md](../services/Multitenant-User-Management-Service/README.md) | Service overview |
| [docs/01-overview.md](../services/Multitenant-User-Management-Service/docs/01-overview.md) | Architecture and flow |
| [docs/02-configuration.md](../services/Multitenant-User-Management-Service/docs/02-configuration.md) | Setup and configuration |
| [docs/03-redirect-parameters.md](../services/Multitenant-User-Management-Service/docs/03-redirect-parameters.md) | OAuth redirect parameters |
| [docs/04-frontend-implementation.md](../services/Multitenant-User-Management-Service/docs/04-frontend-implementation.md) | Integration examples |
| [docs/05-token-handling.md](../services/Multitenant-User-Management-Service/docs/05-token-handling.md) | Token management |
| [docs/06-api-reference.md](../services/Multitenant-User-Management-Service/docs/06-api-reference.md) | Complete API reference |
| [docs/07-troubleshooting.md](../services/Multitenant-User-Management-Service/docs/07-troubleshooting.md) | Common issues |
| [tests/e2e/contracts/](../services/Multitenant-User-Management-Service/tests/e2e/contracts/) | Contract specifications |

**Quick Links**:
- SSO Health: `GET http://localhost:5500/health`
- API Docs: `http://localhost:5500/swagger`

---

## 🔍 Finding Endpoint Documentation

### By Service

**Backend Service Contracts**:
```
services/Portfolio-Backend-Service/api/docs/contracts/
├── about/               → About/profile endpoints
├── auth/                → Authentication
├── content/             → Open Graph
├── dashboard/           → Admin dashboard
├── interaction/         → Works, blogs, comments
└── site/                → Page authentication
```

**SSO Service Contracts**:
```
services/Multitenant-User-Management-Service/tests/e2e/contracts/
├── 2_auth_test/         → Auth endpoints (login, refresh, logout)
├── 3_tenant_test/       → Tenant management
├── 5_mqtt_test/         → MQTT user management
└── ...
```

### By Endpoint Type

| Type | Location |
|------|----------|
| Authentication | Backend: `contracts/auth/` |
| Page Authentication | Backend: `contracts/site/` |
| User Management | SSO: `tests/e2e/contracts/2_auth_test/` |
| Portfolio Data | Backend: `contracts/about/` |
| Works & Blogs | Backend: `contracts/interaction/` |
| MQTT Management | SSO: `tests/e2e/contracts/5_mqtt_test/` |

---

## 📖 Reading Contracts

Each contract file follows this structure:

```markdown
# ENDPOINT: METHOD /path

## Description
What the endpoint does

## Test Scenarios
- Scenario 1: Description
  - Request details
  - Expected response
- Scenario 2: ...

## Error Cases
- Error condition and response
```

**Example Contract Locations**:
- Backend: `services/Portfolio-Backend-Service/api/docs/contracts/auth/login.md`
- SSO: `services/Multitenant-User-Management-Service/tests/e2e/contracts/2_auth_test/2a_register.md`

---

## 🛠️ Development Tips

### Finding Where Something is Documented

1. **Know the endpoint?** → Search in contracts directory
2. **Know the service?** → Check service README → Read contracts
3. **Know the feature?** → Check ARCHITECTURE.md → Find in contracts
4. **Not sure?** → Start with this guide (DOCS.md) then service README

### Updating Documentation

**Rules**:
- ✅ Update contracts when API behavior changes
- ✅ Update API-REFERENCE.md when adding new endpoints
- ✅ Keep README links fresh
- ❌ Don't duplicate content (use links instead)
- ❌ Don't add features not in contracts

**Process**:
1. Create branch: `docs/update-{feature}`
2. Update contracts AND docs
3. Verify consistency across files
4. Commit: `docs: update {feature} documentation`
5. Merge to main

---

## 📊 Document Map

```
.
├── docs/
│   ├── ARCHITECTURE.md          ← Microservices overview
│   └── DOCS.md                  ← This file
├── README.md                    ← Frontend guide
├── services/
│   ├── Portfolio-Backend-Service/
│   │   ├── README.md            ← Backend setup
│   │   ├── docs/
│   │   │   └── API-REFERENCE.md ← Backend API docs
│   │   └── api/docs/contracts/  ← Backend contracts (SOURCE OF TRUTH)
│   └── Multitenant-User-Management-Service/
│       ├── README.md            ← SSO overview
│       ├── docs/                ← SSO guides (01-07)
│       └── tests/e2e/contracts/ ← SSO contracts (SOURCE OF TRUTH)
└── Makefile                     ← Development commands
```

---

## 🔗 Quick Navigation

- [Architecture Overview](./ARCHITECTURE.md)
- [Backend API Reference](../services/Portfolio-Backend-Service/docs/API-REFERENCE.md)
- [Backend Contracts](../services/Portfolio-Backend-Service/api/docs/contracts/)
- [SSO API Reference](../services/Multitenant-User-Management-Service/docs/06-api-reference.md)
- [SSO Contracts](../services/Multitenant-User-Management-Service/tests/e2e/contracts/)
- [Frontend Guide](../README.md)

---

**Last Updated**: February 1, 2026
