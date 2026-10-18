---
id: "04"
order: 4
slug: sensio-iot
year: "2026"
title: "Sensio IoT: Smart-Space Platform"
cardTitle: "Sensio IoT"
subtitle: "Smart-room controls"
role: "Backend"
category: "PT Perkasa Pilar Utama · Product Development"
description: "Smart-room controls and automation, built by a team. I built the backend."
image: "/images/projects/featured/sensio-iot.png"
tech: [Backend Development, Systems Engineering, IoT Integration, Application Reliability]
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

## What I worked on

I build the backend side: commands, device-state feedback, and permissions.

- **Request and result are separate.** Sending a command is not the same as the device changing, so the app keeps the requested action apart from the state the device reports, and the interface shows what actually happened.
- **Clear feedback when a device is unavailable.** An interruption produces an understandable message instead of an action that looks finished.
- **Permissions on controls.** Users see which actions they may take, and get a useful reason when one cannot be completed.

I also test, troubleshoot with the device engineers, and work with the infrastructure and security engineers on releases.

## Links

- Product: [sensio.id](https://sensio.id)
