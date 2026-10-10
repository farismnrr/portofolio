---
id: "01"
order: 1
slug: sensio-notes
year: "2026"
title: "Sensio Notes: Meeting Intelligence Platform"
cardTitle: "Sensio Notes"
subtitle: "From Long Recordings to Reusable Meeting Knowledge"
role: "Backend & Fullstack Engineer · Architecture / Platform / AI Workflows"
category: "PT Perkasa Pilar Utama · Product Development"
description: "A production meeting intelligence platform that captures long audio sessions, processes them asynchronously, and converts transcripts into structured notes, action items, and searchable knowledge."
image: "/images/projects/sensio-notes/showcase.png"
tech: [NestJS, TypeScript, React, Capacitor, PostgreSQL, Redis, S3, WebSocket, LangGraph, OpenTelemetry, Docker, Jira]
productUrl: "https://notes.sensio.id"
repoUrl: ""
---

## Protect the recording before asking AI to interpret it

A meeting recording is useful evidence, but it is rarely useful by itself.

The questions people come back with are usually smaller and more practical: *what was decided, who needs to follow up, what problem was raised, and where in the conversation did that come from?*

**Sensio Notes** is built around that gap. It treats the recording and transcript as the source material, then turns them into meeting information that can be reviewed and reused without replaying the entire conversation.

There is another problem underneath that product idea: the recording has to survive long sessions, mobile operating-system constraints, and unreliable networks before any AI processing becomes useful.

That makes the product a combination of two different concerns:

```text
preserve the meeting reliably
then
interpret it carefully
```

## The meeting lifecycle

From the user's point of view, the flow stays simple: record or upload a meeting, wait while it is processed, then review the transcript and the structures derived from it.

```mermaid
flowchart LR
    U[User] --> C[Web or mobile client]
    C --> R[Recording / upload]
    R --> S[Durable media storage]
    S --> B[Meeting backend]
    B --> T[Asynchronous transcription]
    T --> A[Structured AI processing]
    A --> M[Meeting knowledge]
    M --> C
    B -. progress updates .-> C
```

The important boundary is that capture, transcription, and interpretation are separate stages. A summary should not be treated as the original evidence, and a failed processing step should not make the recording itself disappear.

## Capture before interpretation

The client supports both browser/PWA and native-mobile recording because those environments fail in different ways.

On the web, recording uses browser media APIs and a wake-lock strategy so long sessions are less likely to be interrupted by background throttling.

On native mobile, Capacitor bridges to a native audio-recorder path. That lets recording continue under mobile constraints that a normal browser tab cannot handle as reliably.

After recording, the client does not rely on one large request. Audio is divided into small chunks and queued through the upload flow so a long file can move into object storage more safely over an unstable connection.

That design keeps the first promise of the product deliberately boring: **do not lose the meeting**.

## Processing after the media is durable

Once media is durable, the backend becomes an orchestration layer rather than a synchronous request handler.

The NestJS backend owns the application-side meeting lifecycle and authentication, coordinates presigned S3 multipart uploads, tracks asynchronous processing state, receives callbacks from services maintained elsewhere in the product team, persists application state in PostgreSQL, and sends live progress updates to clients through real-time WebSocket channels.

```mermaid
sequenceDiagram
    participant C as Client
    participant B as NestJS backend
    participant S as S3
    participant W as Ingestion / transcription service
    participant A as Graph / RAG service

    C->>B: Create meeting / request upload
    B-->>C: Upload instructions
    C->>S: Upload recording chunks
    C->>B: Finish upload
    B->>W: Start processing work
    W-->>B: Processing status / transcript callback
    B-->>C: Real-time progress
    B->>A: Send completed transcript
    A-->>B: Structured meeting output
    B-->>C: Meeting becomes reviewable
```

PostgreSQL stores durable product data with relational schemas, indexed queries, and migration versioning. Redis handles background job queues and pub/sub events.

The client and backend are kept as separate repositories so recording UX and client performance can change without coupling that work to persistence and service coordination.

## Failure handling is part of the product flow

The difficult cases are not the clean request paths. They are the boundaries where the browser is backgrounded, a mobile recorder behaves differently from the web recorder, a network disappears during upload, or a background processing step finishes later than the request that started it.

The system handles those cases by keeping durable media, upload progress, processing state, and generated output as separate concerns. Chunked and resume-friendly uploads reduce the amount of work a weak connection can invalidate. Asynchronous processing state lets the client reconnect to a meeting without pretending the work belongs to one long-lived HTTP request.

When that flow misbehaves in production, I use OpenTelemetry and structured logs to follow work across the processing path rather than diagnosing each service in isolation. The important operational question is not only which component returned an error, but which stage of the meeting lifecycle stopped progressing and what durable state was already preserved.

## Turning transcripts into meeting knowledge

Sensio Notes does not stop at producing raw text.

Completed transcripts are passed to structured Graph/RAG services maintained by other members of the product team. Those services produce higher-level views such as summaries, action items, decisions, discussion structure, and PPP-style progress/issues/plans context, while the application backend owns the integration state around those outputs and makes them reviewable in the product.

The useful distinction is:

```text
recording = evidence
transcript = searchable representation of that evidence
AI output = interpretation built on top of it
```

Keeping those layers conceptually separate makes it easier for the product to expose useful automation without pretending generated text is more authoritative than the meeting itself. Extracted insights can be linked back to transcript timestamps so users can verify decisions against what was said.

## Ownership inside a cross-functional team

Sensio Notes is a team product, even where I have substantial ownership of the application flow.

My responsibility is centered on the application backend, recording and upload lifecycle, asynchronous state, integration boundaries, and the web/mobile behavior that connects those pieces into one product. The ingestion pipeline and Graph/RAG capabilities are external service boundaries maintained by other team members, so my work is to integrate them reliably rather than present their internal implementation as my own.

The same applies outside the backend. I work with infrastructure and security engineers on server operations, deployment, access, and production constraints. UI/UX designers define the product's visual and interaction direction; my responsibility is to translate that direction into production React and Capacitor behavior and connect it to the actual application state underneath.

That translation includes states that a static design cannot solve by itself: recording and upload progress, asynchronous processing, loading and failure feedback, recovery after interrupted work, and differences between browser and native-mobile behavior. I do not present that as independent UI/UX ownership. It is engineering work done in close collaboration with the designers who own the product design.

That division of responsibility is important to how I describe the project: substantial ownership does not mean pretending a production system is a one-person stack.

## What I worked on

Most of my work sits at the points where a long-running meeting flow can fail.

On the backend, I built and maintained the application-side meeting lifecycle in NestJS: data models, upload coordination, background processing state, callbacks, and the APIs used by the web and mobile clients.

For large recordings, I worked on chunked S3 uploads and resume-friendly flows so a weak connection would not force someone to start from zero.

I integrated the ingestion and Graph/RAG service boundaries into that lifecycle, including the state transitions around when processing starts, when callbacks arrive, when structured outputs are ready, and how those results become available to users.

On the client side, I connected the React and Capacitor recording paths to the same backend state machine.

That meant dealing with wake locks, native recording behavior, upload progress, and the awkward cases where the app is backgrounded or the network disappears halfway through a meeting.

The production work is part of the same job. I use Docker for packaging, OpenTelemetry and structured logs to trace failures across the processing path, and Jira to keep implementation work tied to the product issues we are actually trying to solve.

## The boundary that mattered most

Sensio Notes made one design rule especially clear: **capture reliability and AI quality are different problems**.

A clever summary cannot recover a recording that was never preserved, and a perfectly stored recording is still inconvenient if useful decisions remain buried inside an hour of audio. The system has to protect the evidence first and add interpretation second.

## Links

- Sensio Notes: [notes.sensio.id](https://notes.sensio.id)
- Sensio Platform: [sensio.id](https://sensio.id)
