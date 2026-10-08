---
id: "04"
order: 4
slug: sensio-iot
year: "2026"
title: "Sensio IoT: Smart-Space Platform"
cardTitle: "Sensio IoT"
subtitle: "Local Control Organized Around Real Spaces"
role: "Backend & Systems Engineer · Rust / IoT / Platform Architecture"
category: "PT Perkasa Pilar Utama · Product Development"
description: "A production on-premises smart-space platform that organizes users, rooms, device state, telemetry, and hardware control around the physical spaces people manage."
image: "/images/projects/featured/sensio-iot.png"
tech: [Rust, Axum, NestJS, TypeScript, React, PostgreSQL, TimescaleDB, MQTT, Zigbee2MQTT, Docker, Linux, OpenTelemetry, LangGraph]
productUrl: "https://iot.sensio.id"
repoUrl: ""
---

## The Problem

People managing a room do not think in broker topics, hardware addresses, or database identifiers.

They think in physical language: *the lights in this meeting room, the sensor in that office, the devices this operator is allowed to control.*

**Sensio IoT** is built around translating those real-world boundaries into software boundaries.

The product has evolved through more than one implementation, but the underlying idea has stayed consistent: organize control around **sites and rooms**, keep device protocols behind an integration layer, and make local hardware state understandable from a human-facing interface.

## Product Approach

A user first enters the physical scope they are responsible for, then works with the devices and automation inside that scope.

```mermaid
flowchart LR
    U[User / HMI] --> S[Select site]
    S --> R[Select room]
    R --> D[View device state]
    D --> A[Request action or automation]
    A --> P[Device provider / protocol]
    P --> H[Physical hardware]
    H --> T[State and telemetry]
    T --> D
```

That hierarchy matters more than any particular protocol. The same product-level action can eventually be translated to different providers without making the user learn how each device communicates.

## How the Platform Evolved

Sensio IoT has gone through two main production architectures.

The initial implementation used a fullstack React HMI with a NestJS backend. It centered the UI around physical rooms, synchronized device state through REST, WebSockets, and SSE, stored high-frequency sensor telemetry in PostgreSQL and TimescaleDB, and integrated a room-scoped LangGraph assistant capable of evaluating context and dispatching device automation routines.

The newer implementation is a high-performance Rust rewrite designed for edge efficiency. Axum serves both HTTP APIs and server-rendered Askama templates, SQLx manages PostgreSQL connection pooling and transactional persistence, and the entire domain—identity, site memberships, rooms, device state, and local configuration—is unified into a single lightweight binary.

```mermaid
flowchart TD
    LEGACY[Earlier React + NestJS platform]
    CURRENT[Current Rust platform]

    LEGACY --> IDEA[Room-based HMI, telemetry, realtime state, conversational control]
    IDEA --> CURRENT

    CURRENT --> AUTH[Identity + site membership]
    CURRENT --> SPACE[Site + room model]
    CURRENT --> DEVICE[Device integration]
    CURRENT --> OPS[On-prem runtime + observability]
```

I treat those as iterations of the same product rather than pretending they were one unchanged architecture. The rewrite built directly on the lessons of the earlier stack.

## Identity and Physical Scope

The platform makes physical scope an integral part of authorization.

Users do not receive one global role that automatically applies everywhere. Site membership is the role boundary, and room access is evaluated through that site relationship. Permission to operate one office never grants access to another site.

Authentication is designed for an on-premises control surface: provisioned users sign in, short-lived access tokens pair with rotating refresh tokens, and browser sessions keep security credentials isolated from client-side scripts.

The result is a strict conceptual chain:

```text
identity
→ site membership
→ room scope
→ device action
```

## Device Integration

The device communication layer is separated cleanly from the site and room domain model.

In the Rust implementation, Zigbee2MQTT support is organized into dedicated mapping, adapter, repository, listener, service, and HTTP boundaries. Discovery and status messages are ingested from MQTT topics, normalized into application state, and commands are translated into provider-specific payloads when an authorized user actuates hardware.

```mermaid
sequenceDiagram
    participant U as User
    participant A as Sensio IoT
    participant Z as Zigbee2MQTT
    participant D as Device

    U->>A: Control a device in the selected room
    A->>A: Check site / room scope
    A->>Z: Publish provider command
    Z->>D: Send device command
    D-->>Z: Report resulting state
    Z-->>A: State / telemetry event
    A-->>U: Show current state
```

This decoupled boundary absorbs protocol-specific quirks and network retries instead of leaking them into the user interface or database schema.

## On-Prem as Part of the Product

For a smart-space system, deployment location directly impacts reliability and latency.

Lighting, room controls, telemetry, and local automation cannot depend on distant cloud round-trips. Sensio IoT treats local on-premises deployment as a core architectural requirement.

The Rust service is packaged as a multi-architecture Docker container (supporting both AMD64 and ARM64) and runs on edge hardware including NVIDIA Jetson and Linux single-board computers. OpenTelemetry tracing, health checks, and container lifecycle monitoring ensure rock-solid uptime next to the physical equipment it manages.

## My Contribution

My work on Sensio IoT spans backend systems engineering, fullstack interfaces, device integrations, and production operations:

- **Fullstack & Backend Engineering**: Built both the initial React + NestJS fullstack platform and the high-performance Rust (Axum + SQLx) rewrite, implementing relational schemas, connection pooling, and real-time state synchronization.
- **Physical RBAC Authorization**: Designed site- and room-scoped access control with secure JWT/refresh token rotation, preventing unauthorized command dispatch across multi-tenant physical spaces.
- **Hardware & Protocol Integration**: Engineered asynchronous MQTT message consumers and Zigbee2MQTT adapters that handle real-time sensor ingestion, device discovery, and low-latency command publishing.
- **Conversational AI & Automation**: Developed room-scoped LangGraph assistant workflows to parse contextual commands and trigger device state changes within verified safety constraints.
- **Production Edge Deployment**: Packaged containerized multi-architecture images (AMD64 / ARM64), deployed services to on-premise edge hardware (Jetson / Linux servers), and established OpenTelemetry observability for production reliability.

## What I Took From It

The recurring lesson in Sensio IoT is that the hardest part of connected-device software is not sending a command to a broker.

The harder question is how to keep **identity, physical scope, device state, protocol translation, and local operations** consistent while the system evolves. Once those boundaries are clear, individual device integrations become much easier to reason about.

## Product Links

- Sensio IoT: [iot.sensio.id](https://iot.sensio.id)
- Sensio Platform: [sensio.id](https://sensio.id)
