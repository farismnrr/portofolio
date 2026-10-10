---
kind: employment
order: 1
year: July 2025 — Present
company: PT Perkasa Pilar Utama
role: Backend & Fullstack Developer
location: "Jakarta, Indonesia"
summary: Develops backend services, client integration, and production operations for meeting-processing and IoT products, covering asynchronous workflows, real-time state, authorization, and on-premise delivery.
tech: [NestJS, Rust, TypeScript, React, PostgreSQL, Redis, MQTT, S3, Docker, Linux, OpenTelemetry, Jira, LangGraph]
projects: [sensio-notes, sensio-iot]
---

- Built the **[Sensio Notes](/projects/sensio-notes)** backend flow for long meeting recordings with PostgreSQL data models, chunked S3 uploads, and background transcription; exposed WebSocket progress updates so clients can follow processing while work continues asynchronously.
- Connected transcripts to LangGraph workflows that produce reviewable meeting notes and action items, integrating AI-assisted processing into the application flow and keeping the outputs available for user review.
- Built and maintained **[Sensio IoT](/projects/sensio-iot)** services in Rust and NestJS, enforcing site- and room-scoped access before device commands and connecting telemetry ingestion with MQTT and Zigbee2MQTT for authorized device interaction.
- Integrated web and mobile clients with backend state, traced failures with OpenTelemetry and structured logs, and packaged services with Docker for on-premise operation; followed issues from development through production delivery.
