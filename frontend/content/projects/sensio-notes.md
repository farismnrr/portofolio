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
image: "/images/projects/sensio-notes/meetings.png"
images: ["/images/projects/sensio-notes/meetings.png", "/images/projects/sensio-notes/meeting-overview.png", "/images/projects/sensio-notes/processing-pipeline.png", "/images/projects/sensio-notes/knowledge-graph.png"]
imageAlts: ["Sensio Notes meetings list with status filters and search.", "Sensio Notes meeting overview with recording playback and action items.", "Sensio Notes processing stages from queueing through mind mapping.", "Knowledge graph with 48 entities, 68 relations and 8 communities."]
techGroups: [Languages & Runtime::TypeScript|Node.js, Frontend::React|Vite|Tailwind CSS|Zustand|Capacitor, Backend::NestJS|Drizzle ORM|REST API, AI & RAG::LangGraph|LLM Tool Calling|Voyage AI Embeddings|Graph RAG|Hybrid Search, Database & Infrastructure::PostgreSQL|TimescaleDB|pgvector|Redis|S3-compatible Object Storage|Docker|OpenTelemetry]
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
- Built cross-platform meeting recording capabilities and browser-based meeting integrations.
- Implemented AI-powered transcription, speaker identification, meeting summaries, action items, and decision extraction.
- Developed agentic AI chat with tool calling and retrieval-augmented generation to enable contextual search across meeting data.
- Built meeting intelligence features including interactive knowledge graphs, mind maps, searchable transcripts, and AI chat with source references.
- Implemented background processing, reliable audio uploads, real-time status updates, and containerized deployment.

## Links

- Product: [sensio.id](https://sensio.id)
