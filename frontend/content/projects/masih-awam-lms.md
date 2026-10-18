---
id: "03"
order: 3
slug: masih-awam-lms
year: "2026"
title: "Masih Awam LMS: Game-Based Learning Platform"
cardTitle: "Masih Awam LMS"
subtitle: "Game-Based Learning Platform"
role: "Backend"
category: "Learning · Rust"
description: "A learning platform where courses become worlds, quests, and lessons."
image: "/images/projects/featured/masih-awam-lms.png"
tech: [Rust, Axum, PostgreSQL, HTML, SCSS, JavaScript, OpenTelemetry, Prometheus]
productUrl: ""
repoUrl: ""
---
## What it is

A learning platform where courses become worlds, quests, and lessons. A normal course list tells you what exists. This one tries to tell the learner what to do next.

The learning structure stays familiar: courses, modules, lessons. The learner moves through worlds, quests, and checkpoints instead of a flat catalog.

```mermaid
journey
    title A learner moves through a world
    section Discover
      Enter a learning world: 5: Learner
      Understand the current quest: 4: Learner
    section Learn
      Complete a lesson: 4: Learner
      Reach a checkpoint: 5: Learner
    section Progress
      See progress update: 5: Learner
      Unlock the next stage: 5: Learner
```

## How it is built

Progress is simple on purpose: completed lessons divided by total lessons, at the lesson, quest, world, and overall level.
The story gives context for why the next lesson matters, but it never decides what counts as complete.

The product keeps three layers apart.
The experience layer holds worlds, quests, and scenes.
The learning domain holds courses, modules, lessons, and enrollment.
The progress state records what the learner actually finished.
Story and presentation can change without touching completion.

Pages are rendered according to who owns their data. Public course pages are prerendered, a learner's dashboard is rendered privately on the server, and interactive state stays in the browser.

## Stack

A Rust backend with Axum and PostgreSQL, a lightweight browser interface, and observability through OpenTelemetry, Prometheus, Loki, Tempo, and Grafana.
