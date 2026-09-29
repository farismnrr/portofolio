---
id: "06"
order: 6
slug: multitenant-user-management
year: "2026"
title: "Multi-Tenant User Management Service"
cardTitle: "User Management"
subtitle: "Authentication and Tenant Identity Service"
role: "Lead Engineer"
category: "Backend · Security"
description: "A reusable identity service that centralizes authentication, tenant membership, roles, and session logic across multiple applications."
image: "/images/projects/user-management/cover.png"
tech: [Rust, Actix-web, PostgreSQL, RocksDB, JWT, Argon2, Docker]
productUrl: ""
repoUrl: "https://github.com/farismnrr/Multitenant-User-Management-Service"
---

## The Story

User management looks simple when an application is small.

You create a users table, add login, store a role, and move on.

Then the product grows.

A second tenant appears.

A user needs access to both tenants.

The same person is an admin in one organization and a normal user in another.

Another application needs the same login system.

Suddenly, “users” is no longer one table.

That is the problem this service was built to solve.

## The Core Idea

The service separates **identity** from **context**.

A person has one global account.

That account can participate in multiple tenants.

Each tenant membership can carry its own roles.

```mermaid
erDiagram
    ACCOUNT ||--o{ TENANT_MEMBERSHIP : has
    TENANT ||--o{ TENANT_MEMBERSHIP : contains
    TENANT_MEMBERSHIP ||--o{ ROLE_ASSIGNMENT : receives
    ROLE ||--o{ ROLE_ASSIGNMENT : defines
```

That means the answer to “who are you?” stays stable, while the answer to “what can you do here?” depends on the tenant context.

## Why This Matters

Without this separation, applications often duplicate identity.

The same person may end up with different user rows, different passwords, and different role logic across products.

That creates security drift.

One application rotates sessions correctly while another does not.

One product uses tenant-scoped roles while another stores one global role field.

Centralizing identity gives all consuming applications one consistent model.

## The Authentication Story

From the user's point of view, login should still feel ordinary.

They enter credentials.

The system identifies the account.

Then the tenant context determines what that account is allowed to do.

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Identity as Identity service
    participant DB

    User->>App: Sign in
    App->>Identity: Authenticate
    Identity->>DB: Load account and memberships
    DB-->>Identity: Identity, tenants, roles
    Identity-->>App: Session and claims
    App-->>User: Authorized experience
```

The extra complexity exists so the user does not have to think about it.

## The General Authorization Algorithm

Every protected action can be described with the same logic.

```text
Who is this?
Which tenant are they acting in?
Do they belong to that tenant?
Which roles do they have there?
Does one of those roles allow this action?
```

Or more compactly:

```text
identity
→ tenant
→ membership
→ role
→ permission
→ allow / deny
```

This is the heart of the system.

## Why Authentication and Authorization Are Separate

A successful login only proves identity.

It does not prove permission.

A user may be valid but still have no access to a specific tenant, resource, or action.

That distinction prevents a common design mistake:

```text
logged in ≠ allowed to do everything
```

The service treats authorization as a separate decision.

## General System Design

```mermaid
flowchart LR
    A[Client applications] --> I[Identity service]
    I --> D[(Identity database)]
    I --> S[Session layer]
    I --> P[Permission decisions]
    S --> A
    P --> A
```

Applications do not need to reimplement the same account logic.

They ask one identity system for consistent answers.

## The SSO Idea

Once identity is centralized, multiple applications can share the same account.

The user authenticates once, then moves between products while the consuming application applies its own tenant context.

The mental model is:

```text
one person
→ one identity
→ many tenant contexts
→ many applications
```

## Product Tradeoffs

**Central consistency vs dependency.** A shared identity service reduces duplication, but consuming applications now depend on it being available.

**Global accounts vs strict isolation.** Reusing one identity is convenient, but tenant boundaries must remain explicit everywhere.

**Flexible roles vs simple permissions.** Rich role models support more cases, but become harder to reason about if they are not kept disciplined.

## Implementation Notes

The current service uses Rust, PostgreSQL, JWT-based sessions, tenant-aware APIs, and a local cache for frequently accessed data.

## Stack

Rust, Actix-web, PostgreSQL, RocksDB, JWT, Argon2, and Docker.
