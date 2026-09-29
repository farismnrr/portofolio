---
id: "05"
order: 5
slug: tenant-core
year: "2023"
title: Tenant Core
cardTitle: Tenant Core
subtitle: Multi-tenant identity service
role: Backend Engineer · Infrastructure / Security
category: Infrastructure · Security
description: A multi-tenant identity and authorization service with organization boundaries, audit trails, and fine-grained permissions.
image: https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85
tech: [Go, PostgreSQL, Redis, Kubernetes, OpenID Connect]
productUrl: https://example.com
repoUrl: https://github.com
---

## Project overview

Tenant Core centralizes identity and authorization for products that need strict organization boundaries without duplicating access-control logic in every service.

## Authorization model

Permissions are evaluated from organization membership, role grants, and resource scope.

```mermaid
flowchart LR
    User --> Membership
    Membership --> Role
    Role --> Permission
    Permission --> Resource
    Organization --> Membership
```

## Data isolation

Every tenant-owned record carries an organization identifier, and database access helpers require that scope explicitly.

## Auditability

Security-sensitive operations write immutable audit events with actor, tenant, action, resource, and correlation context.

## Outcome and learnings

The most important design choice was making tenant scope impossible to ignore in normal code paths.
