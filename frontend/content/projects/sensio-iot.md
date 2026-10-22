---
id: "04"
order: 4
slug: sensio-iot
year: "2026"
title: "Sensio IoT: Smart-Space Platform"
cardTitle: "Sensio IoT"
subtitle: "Smart-room controls"
role: "Backend"
kind: Professional
category: "PT Perkasa Pilar Utama · Product Development"
description: "Smart-room controls and automation, built by a team. I built the backend."
image: "/images/projects/featured/sensio-iot.png"
techGroups: [Languages::Rust|JavaScript|SQL, Frontend::Vanilla JavaScript|HTML|SCSS|Askama, Backend::Rust|Axum|Tokio|SQLx, AI & Automation::Node.js|LangGraph|LLM Tool Calling|Speech-to-Text|Text-to-Speech, IoT & Communication::MQTT|Mosquitto|Zigbee2MQTT|Tuya Cloud API|WebSocket|HTTP, Database::PostgreSQL|TimescaleDB, Mobile::Tauri 2|Android, Infrastructure::Docker|Docker Compose|GitHub Actions|GHCR|OpenTelemetry]
productUrl: "https://sensio.id"
repoUrl: ""
---
## What it is

Sensio IoT lets people control a room: lights, temperature, and equipment, with sensor readings and automation in one view. A team builds it across application engineering, device integration, infrastructure, security, and UI/UX.

```mermaid
flowchart LR
    R[Choose a room] --> V[Review controls and readings]
    V --> A[Request an action]
    A --> F[Follow the feedback]
```

## What I Did

- Developed Sensio IoT end-to-end, covering frontend, Rust backend, device integrations, AI orchestration, and infrastructure.
- Built a smart device management platform supporting MQTT, HTTP, Zigbee2MQTT, and Tuya Cloud integrations.
- Implemented real-time device monitoring, telemetry collection, remote control, and device availability tracking.
- Developed an automation engine with scheduled and device-state triggers, conditional rules, and scene execution.
- Integrated an AI assistant using LangGraph and tool calling for natural-language device monitoring, control, and automation management.
- Built a responsive dashboard, voice assistant features, and Android application integration using Tauri.
- Implemented secure authentication, site-based access control, HMI device pairing, and automated deployment using Docker and GitHub Actions.

## Links

- Product: [sensio.id](https://sensio.id)
