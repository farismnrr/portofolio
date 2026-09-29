---
id: "07"
order: 7
slug: portfolio-website
year: "2026"
title: "Personal Portfolio Website"
cardTitle: "Portfolio"
subtitle: "Markdown-Driven Portfolio"
role: "Developer"
category: "Web · Portfolio"
description: "A portfolio designed as a content system, where projects, writing, experience, certifications, and media are maintained as structured Markdown instead of hardcoded UI data."
image: "/images/projects/portfolio/cover.png"
tech: [Svelte 5, Vite, TypeScript, Markdown, Mermaid, Rust, Axum, GitHub Actions]
productUrl: "https://farismnrr.com"
repoUrl: "https://github.com/farismnrr/portofolio"
---

## What It Is

This portfolio is a personal publishing system for professional work.

The main design goal is to keep content independent from presentation.

Projects, work experience, writing, certifications, gallery items, and profile information are all maintained as repository content rather than embedded into page components.

## Problem It Solves

Portfolio sites often become difficult to maintain because every content update requires editing application code.

That creates unnecessary friction:

- adding a project means changing components;
- changing experience means touching layout code;
- ordering sections becomes hardcoded;
- content structure becomes coupled to UI structure.

This project tries to make portfolio maintenance behave more like editing a publication.

## Core Concept

```mermaid
flowchart LR
    C[Content] --> M[Markdown model]
    M --> P[Presentation]
    P --> U[User experience]
```

The content model is the source of truth.

The UI reads from it.

## General Content Flow

```mermaid
flowchart TD
    A[Create or edit Markdown] --> B[Build-time parsing]
    B --> C[Structured content model]
    C --> D[Svelte pages]
    D --> E[Production site]
```

Adding a project should mostly mean adding one Markdown file.

## General Page Model

Each content item has two parts:

```text
metadata
+ long-form body
```

Metadata controls things such as title, date, image, category, and ordering.

The Markdown body contains the human-readable content.

That separation allows pages to stay flexible without growing large TypeScript data objects.

## General System Design

```mermaid
flowchart TD
    M[Markdown collections] --> B[Build system]
    U[Svelte interface] --> B
    B --> S[Static frontend assets]
    S --> R[Small runtime server]
    R --> V[Visitor]
```

The browser experience is fully content-driven, while deployment remains simple.

## Why Markdown

Markdown provides a useful middle ground:

- readable by humans;
- version-controlled;
- easy to diff;
- flexible enough for long-form writing;
- supports diagrams through Mermaid;
- does not require a CMS.

## Important Product Decisions

### Content must not depend on page code

The home page, project list, and detail pages should derive from content collections.

### Long-form project pages should behave like articles

A project detail page should be able to evolve freely without needing a new component every time a new section is added.

### Assets should remain repository-owned

Images, certificates, and gallery media live beside the project and are referenced through stable paths.

## Tradeoffs

- **Markdown simplicity vs CMS convenience**;
- **repository ownership vs non-technical editing**;
- **static content model vs highly dynamic authoring tools**.

## Implementation Notes

The current site uses Svelte for presentation, Markdown for content, Mermaid for diagrams, and a small Rust server for production delivery.

## Stack

Svelte, Vite, Markdown, Mermaid, Rust, Axum, and GitHub Actions.
