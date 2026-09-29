---
id: "07"
order: 7
slug: portfolio-website
year: "2026"
title: "Personal Portfolio Website"
cardTitle: "Portfolio"
subtitle: "Personal Portfolio Website"
role: "Developer"
category: "Web · Portfolio"
description: "A lightweight portfolio with repository-local Markdown content, responsive presentation, and automated deployment."
image: "/images/projects/portfolio/cover.png"
tech: [Vue 3, Vite, TypeScript, SCSS, Markdown]
productUrl: "https://farismnrr.com"
repoUrl: "https://github.com/farismnrr/portofolio"
---

## Overview

A lightweight personal portfolio for presenting software projects, technical writing, professional experience, certifications, and photography. The application intentionally avoids a production server runtime: Vue handles the interface, Vite handles development and bundling, and a repository-owned prerender step emits every route as static HTML.

## Solution

The portfolio keeps content and presentation deliberately simple. Project, blog, experience, education, and skill data live in repository-local Markdown/MDX files, are normalized at build time, and are rendered into a responsive Vue interface styled entirely with SCSS.

## Key Features

- **Static by default**: Every known route is prerendered to HTML and can be served from any static host or CDN.
- **Repository-local content**: Projects, blog posts, work history, studies, and skills remain version-controlled alongside the site.
- **Responsive design**: Desktop and mobile layouts use custom SCSS rather than an external component framework.
- **Dark mode**: Theme preference is stored locally with system preference fallback.
- **SEO output**: Build-time metadata, canonical URLs, Open Graph fields, sitemap, robots file, and static 404 page.
- **Low runtime overhead**: No backend, database, authentication layer, server components, or production SSR server.

## Tech Stack

### Frontend

- **UI**: Vue 3
- **Routing**: Vue Router
- **Language**: TypeScript
- **Styling**: SCSS and CSS custom properties
- **Build tool / dev server**: Vite

### Content and SSG

- **Content**: Markdown/MDX with frontmatter
- **Parsing**: gray-matter and markdown-it
- **Prerendering**: Vite SSR build plus `@vue/server-renderer`, used only during `npm run build`
- **Output**: Plain HTML/CSS/JS in `dist/`

## Architecture

The build has four stages:

1. Repository content is normalized into generated TypeScript data.
2. Vite produces the browser bundle.
3. Vite produces a temporary server-render bundle used only by the build script.
4. Every root and content-derived route is rendered to `dist/{route}/index.html`; the temporary SSR bundle is then removed.

The deployed artifact contains no Node server and no Vue SSR runtime service.

## Design Philosophy

The visual language stays intentionally light, airy, and content-first: a compact floating navigation pill, restrained cyan ambient lighting, large typography, and spacious project imagery. All design tokens and responsive behavior are owned by this repository so dependency upgrades cannot silently change component behavior.

## Deployment

`npm run build` produces `dist/`. That directory can be uploaded directly to a static hosting platform or copied into nginx using the repository Dockerfile.
