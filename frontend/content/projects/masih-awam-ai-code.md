---
id: "02"
order: 2
slug: masih-awam-ai-code
year: "2026"
title: "Masih Awam AI Code: Agentic Coding Workspace"
cardTitle: "Masih Awam AI Code"
subtitle: "Agentic Coding Workspace"
role: "Builder"
category: "Agentic AI · Developer Tools"
description: "A self-hosted agentic coding workspace where agents inspect and modify repositories, call MCP tools, run sandboxed commands through a native Rust relay, and coordinate bounded subagents."
image: "/images/projects/featured/masih-awam-ai-code.png"
tech: [Nuxt, Rust, MCP, Bubblewrap, OAuth/OIDC, OpenTelemetry]
productUrl: ""
repoUrl: "https://github.com/farismnrr/agentic-ai-code"
---

## Overview

**Masih Awam AI Code** is a self-hosted coding workspace built around agents that can inspect repositories, reason over context, call tools, execute bounded work, and leave durable evidence behind.

Instead of treating AI as a chat panel beside an editor, the product is centered on an execution loop: understand the workspace, choose tools, perform constrained work, and surface the resulting activity and diffs for review.

## Agentic Workflow

The workspace supports the pieces needed for agents to do real repository work:

- **tool and function calling** across first-party and connected capabilities
- **MCP orchestration** for remote and local tools
- **repository inspection and mutation** through bounded workspace tools
- **multi-agent orchestration** with dependency-aware child work
- **isolated writer worktrees** for safer concurrent mutations
- **approval boundaries** for sensitive or effectful tool calls
- **evidence reconciliation** before delegated work is treated as complete
- **durable activity history** and exact supported mutation diffs

The UI exposes task, tool, subagent, background, and orchestration state without presenting hidden model reasoning as if it were execution evidence.

## Native Execution Boundary

The system deliberately separates model reasoning from trusted native execution.

A Rust-based `ai-tools` relay owns command execution and workspace mutation. In production it runs on Linux, refuses root execution, and uses **Bubblewrap** as the filesystem and process containment boundary. Dedicated MCP capabilities are preferred for known operations, while terminal execution remains the bounded fallback for builds, tests, package managers, interpreters, and scripts.

## MCP and Remote Access

The relay exposes MCP over Streamable HTTP and can be used both by the first-party web application and compatible external MCP clients.

Remote access is protected through explicit authentication boundaries, including OAuth/OIDC support, while MCP connections are verified before their tools are offered to models.

## Architecture

The product is split into two trust zones:

- **Nuxt 4 / Vue application** — authenticated chat, workspaces, provider/model configuration, persistence, MCP management, orchestration, and telemetry
- **Rust native relay** — sandboxed workspace access, command execution, repository mutation, and execution evidence

PostgreSQL + Drizzle back application state, while OpenTelemetry-compatible telemetry covers the web and relay paths.

## Stack

Nuxt 4, Vue, TypeScript, AI SDK/LangChain integrations, MCP, PostgreSQL, Drizzle, Rust, Bubblewrap, OAuth/OIDC, and OpenTelemetry.
