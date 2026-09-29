---
id: "04"
order: 4
slug: sensio-iot
year: "2026"
title: "Sensio IoT: Smart-Space Platform"
cardTitle: "Sensio IoT"
subtitle: "Smart-Space Platform"
role: "Software Engineer · IoT / Backend / AI"
category: "IoT · AI"
description: "An end-to-end smart-space platform for controlling real Tasmota and Tuya devices across rooms and organizations, with telemetry, scenes, automations, and agentic AI control."
image: "/images/projects/featured/sensio-iot.png"
tech: [React, NestJS, PostgreSQL, Redis, Tasmota, Tuya, MQTT, OpenTelemetry]
productUrl: ""
repoUrl: ""
---

## Overview

**Sensio IoT** is a smart-space platform I worked on end to end across frontend, backend services, AI tooling, IoT integrations, and runtime infrastructure.

The system controls and monitors real devices across explicit organization and room boundaries. Rather than treating IoT as a flat list of switches, Sensio keeps device actions connected to people, rooms, permissions, telemetry, and the operational services behind them.

## Device and Space Control

The product brings together the main workflows required to operate connected spaces:

- **room- and organization-scoped device control**
- **live telemetry** for connected devices and spaces
- **Tasmota and Tuya device integration**
- **scenes and automations** for coordinated behavior
- **device mapping and lifecycle management**
- **guest and role-scoped access** for shared environments
- **MQTT-backed communication** with explicit broker authorization

Organization and room context stay explicit throughout the frontend and backend so device actions remain scoped and attributable.

## Agentic AI Control

Sensio also includes an AI control layer that can reason over user intent and live device context, then call structured tools to operate supported devices and services.

The backend keeps AI access bounded by the same room and authorization context as direct device operations. The result is an assistant that can participate in physical control without bypassing the product's tenancy and permission model.

## Platform Architecture

The system spans more than a dashboard:

- **React 19 + Vite frontend** for room control, telemetry, guest flows, and AI chat/voice
- **NestJS backend** owning HTTP, SSE/WebSocket APIs, organization/room authorization, persistence, and AI tooling
- **PostgreSQL + Drizzle** for durable application data
- **Redis** for ephemeral coordination
- **Tuya Manager** for Tuya Cloud synchronization and local device helpers
- **broker-auth** for MQTT/AMQP authentication and topic-level ACL decisions
- **plugin supervisor** for constrained supporting-service lifecycle management

Operational telemetry and environment configuration are treated as first-class parts of the platform rather than separate afterthoughts.

## Real-World Safety Boundaries

Physical actions have a higher cost than updating a UI. Sensio therefore keeps control paths explicit around organization membership, room access, guest scope, broker permissions, and purpose-bound streaming/ticket flows.

Native delivery also uses fail-closed OTA verification so an update cannot silently weaken the device-control surface.

## Stack

React 19, Vite, NestJS 11, TypeScript, PostgreSQL, Drizzle, Redis, Tasmota, Tuya, MQTT/RabbitMQ, SSE/WebSocket, Capacitor, Docker, Go services, Rust services, and OpenTelemetry-compatible observability.
