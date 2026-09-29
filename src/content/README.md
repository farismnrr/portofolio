# Portfolio content guide

This directory is the human-maintained source of truth for portfolio content.

The rule is intentionally simple: **one logical piece of content should be understandable from one Markdown file**. Frontmatter contains only metadata needed to sort, link, or summarize the content. The readable explanation belongs in the Markdown body.

## Where each folder is used

| Folder | Meaning | Consumed by |
| --- | --- | --- |
| `about/index.md` | Single profile/introduction document | Home and About pages |
| `work/*.md` | One work experience per file | Home experience preview and About page |
| `studies/*.md` | One education entry per file | About page |
| `skills/*.md` | One skill group per file | About page |
| `projects/*.md` | One project per file | Home selected projects, Projects page, Project detail pages, prerender route discovery |
| `blog/*.md` | One article per file | Blog listing, Blog detail pages, prerender route discovery |

Certifications and gallery entries are asset-driven and are indexed from `public/images/certifications/` and `public/images/gallery/`.

At build time, `scripts/content-plugin.ts` reads these files and exposes them through the in-memory `virtual:content/*` modules. There is no generated content database and no runtime content API.

## Naming rules

- Use plain `.md` files.
- For collection content, the filename is the stable slug.
- Keep project files directly under `projects/`: `projects/sensio-notes.md`, not `projects/sensio-notes/sensio-notes.md`.
- Keep blog files directly under `blog/` for the same reason.
- Rename a file only when you intentionally want to change its URL slug.

## Project format

```md
---
title: "Long project title"
projectName: "Short card title"
publishedAt: "2026-09-07"
order: 1
organization: "Optional organization"
role: "Optional role"
summary: "Short text used on cards and previews."
images:
  - "/images/projects/example/cover.png"
link: "https://example.com"
repository: "https://github.com/example/repo"
tag:
  - "Rust"
  - "PostgreSQL"
team:
  - name: "Person"
    role: "Engineer"
    avatar: "/images/profile/person.png"
---

## Overview

Write the project here as an actual case study.

## Problem

Explain context and constraints.

## Solution

Explain what was built and why.

## Architecture

Diagrams, code blocks, lists, and normal Markdown belong here.
```

## Blog format

```md
---
title: "Article title"
publishedAt: "2026-09-29"
summary: "Short listing description."
image: "/images/blog/example.png"
tag:
  - "Engineering"
---

## Introduction

The complete article lives in this file.
```

## Work format

Work experience deliberately keeps achievement text out of YAML:

```md
---
company: Example Company
role: Software Engineer
timeframe: Jan 2026 - Present
order: 1
summary: Short sentence used by the Home page.
---

## Highlights

- Human-readable achievement.
- Another achievement.
```

The About page renders the Markdown body. The Home page uses `summary` for the compact preview.

## Maintenance rules

When adding a field that affects rendering, update both:

1. `scripts/content-plugin.ts` for normalization.
2. `src/content/types.ts` for the TypeScript contract.

Do not add hardcoded project/blog/work lists in Vue pages when ordering or selection can come from content metadata.
