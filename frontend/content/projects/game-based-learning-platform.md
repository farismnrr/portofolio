---
id: "04"
order: 4
slug: game-based-learning-platform
year: "2023"
title: Learning Worlds
cardTitle: Game-Based Learning Platform
subtitle: Learning through systems and exploration
role: Software Engineer · EdTech / Gaming
category: EdTech · Gaming
description: An interactive learning platform that uses simulated worlds to teach programming and problem-solving through experimentation.
image: https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85
tech: [Next.js, Python, PostgreSQL, WebRTC, Three.js]
productUrl: https://example.com
repoUrl: https://github.com
---

## Project overview

Learning Worlds turns programming exercises into environments where a learner can manipulate systems and immediately see the consequences.

## Learning model

Lessons are expressed as goals and constraints. A simulation engine evaluates the learner code and emits observable world state.

```mermaid
flowchart LR
    Lesson --> Editor
    Editor --> Runner
    Runner --> Simulation
    Simulation --> Feedback
    Feedback --> Editor
```

## Multiplayer sessions

WebRTC supports small collaborative rooms while server-side state keeps progress and assessment authoritative.

## Content authoring

Lesson definitions are data-driven, allowing educators to change objectives, hints, and world parameters without touching the core application.

## Outcome and learnings

Fast feedback mattered more than elaborate graphics. The strongest loops made cause and effect obvious within seconds.
