---
id: "02"
order: 2
slug: smart-space-iot-platform
year: "2024"
title: Sensio IoT
cardTitle: Smart Space IoT Platform
subtitle: Connected spaces, from devices to cloud
role: Full Stack Engineer · IoT / Infrastructure
category: IoT · Infrastructure
description: An end-to-end control platform for connected spaces, combining device telemetry, automation rules, cloud services, and real-time dashboards.
image: https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85
tech: [Python, MQTT, AWS, InfluxDB, React, Docker]
productUrl: https://example.com
repoUrl: https://github.com
---

## Project overview

Sensio IoT connects room devices, automation rules, and cloud services behind one operational interface. The emphasis is reliability: devices can be intermittent while the product still needs a coherent view of state.

## Device and cloud boundary

MQTT provides the event transport between gateways and cloud consumers. Device commands and telemetry use explicit topics and versioned payloads.

```mermaid
flowchart LR
    Devices --> Gateway
    Gateway --> MQTT[[MQTT Broker]]
    MQTT --> Ingest[Telemetry Ingest]
    Ingest --> TimeSeries[(InfluxDB)]
    MQTT --> Rules[Automation Engine]
    Dashboard --> API
    API --> MQTT
```

## Real-time state

The dashboard distinguishes desired state from observed state so a command is not considered complete before the device confirms it.

```mermaid
sequenceDiagram
    participant U as Dashboard
    participant A as API
    participant B as MQTT
    participant D as Device
    U->>A: Set target temperature
    A->>B: Publish desired state
    B->>D: Deliver command
    D->>B: Publish observed state
    B-->>U: Stream confirmed state
```

## Reliability

Telemetry is append-oriented, while commands are idempotent and carry correlation identifiers. Reconnect storms are rate-limited and automation rules are evaluated from durable state.

## Outcome and learnings

Distributed-systems assumptions matter even more when one participant is a small device on an unreliable network.
