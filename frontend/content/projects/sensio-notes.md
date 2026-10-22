---
id: "01"
order: 1
slug: sensio-notes
year: "2026"
title: "Sensio Notes: Meeting Intelligence Platform"
cardTitle: "Sensio Notes"
subtitle: "Meeting assistant"
role: "Fullstack"
kind: Professional
category: "PT Perkasa Pilar Utama · Product Development"
description: "A meeting assistant that turns recordings into summaries and action items. I worked on recording, upload, and progress."
image: "/images/projects/sensio-notes/showcase.png"
tech: [TypeScript, Node.js, React, Vite, Tailwind CSS, Zustand, Capacitor, NestJS, Drizzle ORM, REST API, LangGraph, OpenAI API, Voyage AI Embeddings, Graph RAG, Hybrid Search, Tool Calling, PostgreSQL, TimescaleDB, pgvector, Redis, BullMQ, S3-compatible Object Storage, Docker, OpenTelemetry]
productUrl: "https://sensio.id"
repoUrl: ""
---
## What it is

Sensio Notes records or imports a meeting and turns it into a summary, decisions, and action items you can search later.
I work on it as part of a team with AI, infrastructure, security, and UI/UX engineers.

```mermaid
flowchart LR
    R[Record or upload a meeting] --> P[Follow progress]
    P --> V[Review meeting results]
    V --> F[Find decisions and follow-up work]
```

## What I Did

- Developed Sensio Notes end-to-end, covering frontend, backend, AI integration, and infrastructure.
- Built cross-platform meeting recording for web and mobile, including a Chrome extension for Google Meet.
- Implemented AI-powered transcription, speaker identification, meeting summaries, action items, and decision extraction.
- Developed agentic AI chat using LangGraph, tool calling, and Graph RAG with hybrid search across meeting data.
- Built meeting intelligence features including interactive knowledge graphs, mind maps, searchable transcripts, and AI chat with source references.
- Implemented background processing, reliable audio uploads, real-time status updates, and containerized deployment.

## Links

- Product: [sensio.id](https://sensio.id)
