---
title: "Sensio Notes: Meeting Intelligence Platform"
projectName: "Sensio Notes"
publishedAt: "2026-09-07"
order: 1
organization: "PT Perkasa Pilar Utama"
role: "Software Engineer"
summary: "End-to-end meeting intelligence across recording, asynchronous processing, RAG retrieval, structured generation, storage, and observability—using LangGraph/LangChain, Voyage embeddings, pgvector, graph-based context, PostgreSQL, S3, and SSE."
images:
  - "/images/projects/featured/sensio-notes.png"
tag:
  - "Meeting Intelligence"
  - "RAG"
  - "LangGraph"
  - "Voyage"
  - "pgvector"
  - "NestJS"
  - "React"
team:
  - name: "Faris Munir Mahdi"
    role: "Software Engineer"
    avatar: "/images/profile/faris-munir.png"
    linkedIn: "https://www.linkedin.com/in/farismnrr"
---

## Overview

**Sensio Notes** is a cross-platform meeting intelligence platform I worked on end to end across the frontend, backend, AI processing, storage, and infrastructure.

The product is built around two requirements that have to work together: the recording and upload path must remain reliable under real-world interruptions, and the AI layer must produce useful meeting knowledge that stays grounded in the source evidence.

## AI and Retrieval

The meeting intelligence pipeline goes beyond one-shot summarization. Finished transcripts are processed through a structured retrieval and generation flow that combines:

- **LangChain and LangGraph** for stateful AI workflows
- **Voyage embeddings** stored alongside transcript chunks
- **pgvector retrieval** over PostgreSQL-backed meeting knowledge
- **Graph-based context** for additional relationship and provenance signals
- **Prompt engineering and grounding rules** that keep generated outputs tied to meeting evidence
- **Structured generation** for summaries, decisions, action items, insights, and searchable meeting knowledge

The backend also contains evaluation paths for summary quality and output behavior, so AI work is treated as an engineering system rather than just a prompt attached to a transcript.

## Media and Processing Reliability

Before retrieval can be useful, the underlying meeting data needs to survive real usage. Sensio Notes includes:

- durable web/PWA recording state and interrupted-recording recovery
- native background recording through Capacitor
- atomic browser uploads and recoverable S3 multipart uploads
- multiple ordered recording sources under one meeting
- asynchronous transcription and processing jobs
- authoritative progress snapshots delivered through authenticated SSE
- retry and reconciliation paths for interrupted media processing

PostgreSQL remains the durable authority for meeting and processing state, while object storage owns the media artifacts.

## Product Outputs

The platform turns meetings into structured, evidence-aware outputs including:

- searchable meeting knowledge
- summaries and key discussion points
- decisions and action items
- discussion timelines
- citations and evidence-linked insights
- speaker-resolution and transcript-cleanup workflows

Structured decisions and action items remain first-class data instead of being flattened into presentation-only text.

## Platform and Security

The product also includes the operational pieces required to ship the system as a real application: authentication and session security, transactional email, asynchronous workers, deployment configuration, OpenTelemetry-compatible tracing, and native OTA integrity controls.

## Stack

React 19, Vite, Capacitor, NestJS 11, TypeScript, LangChain, LangGraph, Voyage embeddings, PostgreSQL + pgvector, Drizzle ORM, Redis/BullMQ, S3-compatible storage, SSE, OpenTelemetry, and Playwright.
