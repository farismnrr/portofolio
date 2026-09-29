---
slug: running-iot-systems-in-the-real-world
title: Running IoT Systems in the Real World
excerpt: Practical lessons from unreliable networks, device state, reconnect storms, and cloud boundaries.
category: IoT
published: 2026-05-21
readTime: 9 min read
cover: https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85
featured: false
---

## Devices are distributed systems

Every device can disconnect, reboot, lag, or report state later than expected.

## Desired and observed state

```mermaid
sequenceDiagram
    participant UI
    participant API
    participant Device
    UI->>API: Set desired state
    API->>Device: Publish command
    Device-->>API: Report observed state
    API-->>UI: Confirm actual state
```

## Reconnect behavior

Reconnect storms are a capacity problem. Backoff and jitter matter as much as the happy-path protocol.

## Local resilience

Critical local behavior should continue during short cloud outages whenever the product allows it.

## Lesson

Never model a device command as complete until the device has reported the resulting state.
