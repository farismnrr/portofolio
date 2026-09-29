---
id: "06"
order: 6
slug: multitenant-user-management
year: "2026"
title: "Multi-Tenant User Management Service"
cardTitle: "User Management"
subtitle: "Multi-Tenant Authentication Service"
role: "Lead Engineer"
category: "Backend · Security"
description: "A production-ready user authentication and management service built with Rust and Actix-web, featuring JWT authentication, RBAC, and multi-tenancy support."
image: "/images/projects/user-management/cover.png"
tech: [Rust, Actix-web, PostgreSQL, RocksDB, JWT, Docker]
productUrl: ""
repoUrl: "https://github.com/farismnrr/Multitenant-User-Management-Service"
---

## Overview

A **production-ready** user authentication and management service designed to be easily plugged into any application. Built with Rust for performance and safety, this service provides secure user management, JWT authentication, and role-based access control with multi-tenancy support.

## The Challenge

Modern applications require robust authentication systems that can:
- Handle multiple tenants with isolated data
- Provide secure token-based authentication
- Scale efficiently under load
- Maintain high security standards

Traditional solutions often lack flexibility or require significant integration effort.

## Solution

This service provides a **standalone authentication microservice** that can be integrated into any application stack. It handles all user management complexity while exposing clean REST APIs for seamless integration.

## Key Features

- **Authentication**: JWT-based auth with access and refresh tokens, session management
- **Multi-Tenancy**: Tenant-scoped users with complete data isolation
- **Security**: Argon2 password hashing, rate limiting, API key protection
- **Performance**: RocksDB local caching with TTL for reduced database load
- **Operations**: Structured logging, health checks, graceful shutdown, soft deletes
- **Testing**: Comprehensive E2E and integration test suites

## Architecture

The service exposes two API scopes:

### Public API (/api prefix)
- Protected by API Key (X-API-Key header)
- Endpoints: Login, Register, Token Refresh
- Used for initial authentication

### Protected API (root scope)
- Protected by JWT Bearer tokens
- Endpoints: User management, Tenant operations, Profile updates
- Full CRUD operations with RBAC

## Tech Stack

### Frontend
- **Framework**: Vue
- **Build Tool**: Vite

### Backend
- **Language**: Rust
- **Framework**: Actix-web (high-performance async web framework)
- **Database**: PostgreSQL
- **Caching**: RocksDB (local persistent cache with TTL)
- **Authentication**: JWT (jsonwebtoken crate)
- **Password Hashing**: Argon2

### DevOps
- **Containerization**: Docker and Docker Compose
- **CI/CD**: GitHub Actions
- **Migrations**: SQLx migrations
- **Testing**: Playwright (E2E), Rust integration tests

## API Structure

The service provides comprehensive REST APIs for:
- User authentication (login, register, refresh, logout)
- User management (CRUD operations)
- Tenant management (multi-tenancy support)
- Profile management (password changes, user details)

All endpoints support proper error handling with structured JSON responses.

## Documentation

Complete integration guides available for multiple frontend frameworks:
- SSO Integration guide
- Frontend implementation examples (Next.js, React, Vue.js, vanilla JS)
- Token handling and storage
- API reference with examples
- Troubleshooting common issues
