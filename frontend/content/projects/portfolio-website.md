---
id: "07"
order: 7
slug: portfolio-website
year: "2026"
title: "Personal Portfolio Website"
cardTitle: "Portfolio"
subtitle: "Markdown-driven portfolio"
role: "Solo Developer"
kind: Personal
category: "Web · Portfolio"
description: "This site. Projects, experience, and certifications are Markdown files, not hardcoded UI data."
image: "/images/projects/portfolio/cover.png"
tech: [Svelte 5, Vite, TypeScript, Markdown, Mermaid, Rust, Axum, GitHub Actions]
productUrl: "https://farismnrr.com"
repoUrl: "https://github.com/farismnrr/portofolio"
---
## What it is

This site.
Projects, experience, certifications, and blog posts are Markdown files, and one content collection drives the project cards, project modal, and homepage selections.
Adding a project means writing a file, not editing a component.

## How it is built

```mermaid
flowchart TD
    M[Markdown collections] --> B[Build process]
    S[Svelte UI] --> B
    B --> P[Prerendered route HTML]
    B --> A[Static assets]
    P --> R[Rust + Axum runtime]
    A --> R
    R --> U[Visitor]
```

Public routes are prerendered at build time, so crawlers and browsers get real HTML right away.
Svelte then hydrates the page for client-side navigation.
A small Rust and Axum server embeds the generated pages and assets for production.

The site keeps ordinary web behavior: normal link handling, lazy route loading, hash links that wait for the page before scrolling, separate desktop and mobile navigation, and a skip link to the main content.

## Tradeoffs

Markdown is comfortable for me and works well with Git history, but it is harder for non-technical editors.
Content changes are versioned and reviewable, but they still need a build and a deployment.
Every project can tell a different story, so a writing check in the build keeps the copy consistent.

## Stack

Svelte 5 and Vite, Markdown with Mermaid for diagrams, prerendering at build time, Rust with Axum in production, and GitHub Actions for validation, build, and deployment.

## Links

- Site: [farismnrr.com](https://farismnrr.com)
- Source: [github.com/farismnrr/portofolio](https://github.com/farismnrr/portofolio)
