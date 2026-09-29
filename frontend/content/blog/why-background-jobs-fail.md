---
slug: why-background-jobs-fail
title: Why Background Jobs Fail
excerpt: Common failure modes in background processing and patterns for resilient job architectures.
category: Backend
published: 2026-04-09
readTime: 8 min read
cover: https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=85
featured: false
---

## The hidden request path

Moving work to a queue does not make it reliable. It only moves the reliability problem somewhere else.

## Failure model

Jobs can be duplicated, delayed, retried, partially completed, or permanently poisoned.

## Retry design

```mermaid
flowchart LR
    Queue --> Worker
    Worker -->|success| Done
    Worker -->|transient failure| Retry
    Retry --> Queue
    Worker -->|permanent failure| DLQ
```

## Idempotency

The job handler needs a stable identity and durable checkpoints when the work has multiple side effects.

## Operations

Queue age is often more useful than queue length because it tells you whether user-visible work is becoming stale.
