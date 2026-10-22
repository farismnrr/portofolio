# Ok kita fokus di portofolio. Ikuti guide gw aja ya. Gw nau n…

Task: 06b48b6a63cb3571a5e6193ddaea648d
Status: working
Updated: 2026-10-22T11:20:39Z

Reference material; confirm applicability before reusing.

**Summary:** The current Projects page renders Markdown-backed cards that link to nine project detail routes.  
Each project has one cover image and the requested fields in some form, but there is no dedicated Personal/Professional field or image gallery.

## Data

- `frontend/src/lib/project-content.ts` reads `frontend/content/projects/*.md`. Every project requires `id`, `order`, `slug`, `year`, `title`, `cardTitle`, `subtitle`, `role`, `category`, `description`, `image`, `tech`, `productUrl`, and `repoUrl`. The image field is optimized to a WebP path when it uses `/images/projects/`.
- The nine sources are in `frontend/content/projects/`. Each supplies one `image`, a short `description`, a `role`, a `category`, `tech`, and both URL fields. An empty URL is stored as `""`; the card’s requested `"-"` display would need to be presentation logic.
- Personal/Professional is **not an explicit field**. `category` contains mixed labels such as `Personal · AI · Open Source`, employer/program names, and project types. `frontend/src/lib/cv.ts` infers “Personal” only when category starts with “Personal”; it can infer company from linked experience records. That is not a normalized classification for every project.
- `role` is a brief label (for example, “Backend” or “Solo Developer”). Project contribution details are in Markdown bodies, with headings and sometimes bullet lists, but `project-markdown.ts` only returns the body as a string. The content varies by project; the data model has no dedicated contributions/bullets field.
- Current project bodies and frontmatter can be checked in each `frontend/content/projects/*.md` file. Some bodies contain contribution bullets, but they are not consistently structured as one list.
- There are no carousel images in the project data model or project Markdown. The repository contains one referenced cover image per project under `frontend/public/images/projects/`; `prepare-project-images.mjs` creates responsive variants from that cover.

## Pages, routes, SEO, and links

- `frontend/src/pages/ProjectsPage.svelte` lays out `ProjectCard` components in a responsive grid.
- `frontend/src/lib/ui/ProjectCard.svelte` displays the cover, card title, year, and short description. Its image, title, and “View project” link all navigate to `/projects/:slug`.
- `frontend/src/pages/ProjectDetailPage.svelte` loads the project and Markdown body, then renders `ProjectHero`, a table of contents, and the Markdown article.
- `frontend/src/lib/ui/ProjectHero.svelte` displays year/category, title, description, cover image, and available product/repository links.
- `frontend/src/lib/ui/MediaImage.svelte` provides a lazy-loaded image with a loading placeholder and `cover`/`contain` fit. It is used by both project components.
- `frontend/src/lib/routes.ts` lazy-loads the detail page and maps known `/projects/:slug` paths to it. `frontend/src/lib/router.ts` owns client-side navigation and path state.
- `frontend/src/lib/seo.ts` emits project detail metadata and structured data, and gives each project-list item a `/projects/:slug` URL.
- `frontend/scripts/generate-seo-assets.mjs` adds every project detail path to generated `routes.txt` and `sitemap.xml`. `frontend/scripts/verify-prerender.mjs` checks every generated route for page metadata, an H1, JSON-LD, and sitemap coverage. Removing detail pages requires adjusting both route generation and verification expectations.
- Other direct references found: `frontend/src/lib/ui/TimelineEntry.svelte` links related projects to detail routes; `frontend/src/lib/cv.ts` puts those routes into generated CV project links; `server/src/role_match.rs` formats project evidence URLs as detail routes. `server/src/cv.rs` contains fixture URLs, and `.github/workflows/fast-guardrail-build-deploy.yml` checks a detail route in deployment verification.
- `frontend/src/lib/ui/CredentialViewer.svelte` uses a native `<dialog>` modal. No existing carousel component or project image-carousel data was found.

## Guards and implications

- `AGENTS.md` requires the architecture/SOLID/DRY guard, Markdown/Mermaid validation, writing-style guard, strict Svelte/TypeScript diagnostics, and production build with prerender/SEO verification.
- `frontend/scripts/guard-ui.mjs` currently requires `ProjectCard`, `ProjectHero`, and detail-page primitives, and validates required project Markdown frontmatter and case-study body structure. Removing detail pages means this guard’s current requirements are directly relevant and may need updating as part of the implementation.
- `AGENTS.md` says the writing-style guard blocks em dashes in changed visible copy, with factual date/period metadata and fenced code/diagram content exempt. `frontend/scripts/check-writing-style.mjs` implements the changed-Markdown check. Keep new visible copy free of em dashes.

## Not found

- An explicit project Personal/Professional classification.
- Structured, consistent project contribution bullets.
- More than one project image per project, or an existing carousel component.

## Suggestions

- The current data supports cards, descriptions, tech labels, role labels, and optional product links. The Planner should resolve how Personal/Professional is assigned where category or experience does not make it unambiguous.
- A carousel needs additional image data or a defined fallback for projects that currently have only one cover.
- Removing detail pages affects routes, SEO output, sitemap/prerender checks, related-project links, CV links, role-match evidence URLs, and a workflow smoke check. The exact behavior desired for old detail URLs is not specified here.

---

**Summary:** The existing `CredentialViewer.svelte` is a useful starting point: it opens a native dialog with `showModal()`, labels it, provides a close button, and uses buttons for image navigation.  
For project images, follow the WAI carousel semantics and test dialog focus, mobile behavior, and reduced motion; static hosting may limit redirects to client-side behavior.

### Technical references

- **Existing pattern:** [CredentialViewer.svelte](/workspace/frontend/src/lib/ui/CredentialViewer.svelte) calls `showModal()`, closes via `dialog.close()`, labels the dialog with `aria-labelledby`, and only shows previous/next buttons when there is more than one image. It also handles left/right arrows. This is a local pattern to adapt.
- **Native dialog:** Use `showModal()` to get modal behavior, including making the rest of the page inert; provide a visible close button and an accessible name. The browser handles Escape for modal dialogs. Focus moves into the dialog on open; check that it returns to the invoking card control on close. [MDN dialog reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog), [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- **Backdrop and scroll:** The native `::backdrop` is available when using `showModal()`. Clicking the backdrop is not automatically the same as closing the dialog; implement and test that behavior if required. The existing dialog does not implement backdrop dismissal or body scroll locking. Avoid adding a separate scroll lock without checking native behavior on target mobile browsers. [MDN dialog reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).
- **Carousel:** Give the carousel a labeled `region` or `group` with `aria-roledescription="carousel"` and label each slide as a group with `aria-roledescription="slide"` and a useful name or position. Use native buttons for previous, next, and slide selectors. The APG notes that a separate tab stop per dot is less friendly for keyboard users; if using dots, consider a tabbed picker pattern or keep the group small. No autoplay is needed for this project viewer. [WAI carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/).
- **Redirect and generated routes:** The current route generator adds every project slug to `routes.txt` and `sitemap.xml` ([generate-seo-assets.mjs](/workspace/frontend/scripts/generate-seo-assets.mjs)); prerender verification checks each listed route for metadata, H1, JSON-LD, and sitemap presence ([verify-prerender.mjs](/workspace/frontend/scripts/verify-prerender.mjs)). Remove project detail paths from both generated lists and update verification expectations. A real HTTP redirect is preferred, but a static client-side redirect requires a page to load and JavaScript to run; a meta refresh is another fallback if the host serves an HTML file for the old path. [MDN redirections](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections).
- **Reduced motion:** If the modal or carousel uses transitions, respect `prefers-reduced-motion` and provide a non-animated state. [MDN reduced-motion media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion).

### Quality checks

- Open and close the modal using the card, close button, Escape, and backdrop click. Confirm the card trigger regains focus after closing, focus remains usable inside the dialog, and the page cannot be interacted with behind it.
- Check a one-image project (no carousel controls) and a multi-image project (previous/next and dots). Verify first/last bounds, arrow keys, button labels, slide position announcements, meaningful image alternatives, and keyboard-only operation.
- On narrow mobile viewports, confirm the dialog fits the screen, its content can scroll without trapping the page, controls have usable touch targets, and opening/closing does not leave the page scroll locked.
- With reduced motion enabled, confirm there is no unwanted slide or modal animation.
- After route removal, verify an old `/projects/:slug` URL reaches `/projects` on the deployed static host, and check that `routes.txt` and `sitemap.xml` contain `/projects` but no project detail URLs. The project’s route generator and prerender verifier are local evidence; actual old-URL behavior depends on hosting configuration.

### Not found

- The project notes and inspected component do not establish whether the deployment host supports per-path HTTP redirects or serves the SPA fallback for removed project URLs.
- The existing dialog does not show explicit focus restoration, backdrop dismissal, or body scroll-lock logic.

### Suggestions

- **Inference:** Reuse the existing dialog’s native `showModal()` structure and one-image control condition. Add the carousel semantics and verify focus restoration and backdrop behavior as explicit checks.
- **Needs DevOps:** confirm deployed-host behavior for old project URLs; client-side redirect success depends on the host serving the app for those paths.
- No files were changed and no project checks were run.

---

**Summary:** I checked all 10 project entries and their linked public repositories where available.  
The table separates repository-confirmed stacks from stacks inferred only from project descriptions; no files were changed.

| Slug | Current tech | Proposed tech (up to 6 items) | Source (URL or file) | Status |
|---|---|---|---|---|
| `sensio-notes` | Backend Development, Web Applications, Mobile Integration, Application Reliability | Backend development, web applications, mobile integration, application reliability | [Project file](frontend/content/projects/sensio-notes.md); no repo URL | **Unverified** |
| `ai-workspace` | Go, Svelte, Docker, MCP | Go, Fiber, Svelte 5, TypeScript, SQLite, MCP | [Project file](frontend/content/projects/ai-workspace.md); [GitHub repository](https://github.com/farismnrr/agentic-ai-workspace) (README, `go.mod`, `web/package.json`) | **Verified** |
| `masih-awam-lms` | Rust, Axum, PostgreSQL, HTML, SCSS, JavaScript, OpenTelemetry, Prometheus | Rust, Axum, PostgreSQL, HTML, SCSS, JavaScript, OpenTelemetry, Prometheus | [Project file](frontend/content/projects/masih-awam-lms.md); no repo URL | **Unverified** |
| `sensio-iot` | Backend Development, Systems Engineering, IoT Integration, Application Reliability | Backend development, systems engineering, IoT integration, application reliability | [Project file](frontend/content/projects/sensio-iot.md); no repo URL | **Unverified** |
| `iotnet` | Nuxt, Vue, TypeScript, Hapi, Bun, PostgreSQL, MQTT, EMQX, OpenTelemetry | Nuxt, Vue, TypeScript, Hapi, Bun, PostgreSQL, MQTT/EMQX, OpenTelemetry | [Project file](frontend/content/projects/iotnet.md); product URL only, no repo URL | **Unverified** |
| `multitenant-user-management` | Rust, Actix-web, PostgreSQL, RocksDB, JWT, Argon2, Docker | Rust, Actix Web, SeaORM, PostgreSQL/SQLite, RocksDB, JWT, Argon2, Docker | [Project file](frontend/content/projects/multitenant-user-management.md); [GitHub repository](https://github.com/farismnrr/Multitenant-User-Management-Service) (README, `Cargo.toml`, `docker-compose.yml`) | **Verified**. `Cargo.toml` confirms SeaORM and PostgreSQL/SQLite support; SQLite is not in the current label. |
| `portfolio-website` | Svelte 5, Vite, TypeScript, Markdown, Mermaid, Rust, Axum, GitHub Actions | Vue 3, Vue Router, Vite, TypeScript, SCSS, Markdown/MDX, static prerendering | [Project file](frontend/content/projects/portfolio-website.md); [GitHub repository](https://github.com/farismnrr/portofolio) (README and repository files) | **Verified, with a mismatch**. The repository README describes a Vue 3 static site and says there is no runtime backend; this differs from the project file’s Svelte and Rust/Axum stack. |
| `parentify` | Google Cloud, Node.js, Express, MySQL, JWT, Kotlin, Android, CameraX, Retrofit, Room, Hilt, Firebase Auth, TensorFlow, Keras, TensorFlow Lite | Node.js, Express, MySQL, Kotlin, Android, TensorFlow/Keras/TensorFlow Lite | [Project file](frontend/content/projects/parentify.md); [Cloud Computing](https://github.com/Parentify/Parentify-Cloud-Computing), [Mobile Development](https://github.com/Parentify/Parentify-Mobile-Development), [Machine Learning](https://github.com/Parentify/Parentify-Machine-Learning) | **Verified** at repository level: GitHub reports JavaScript, Kotlin, and Jupyter Notebook respectively; the project file supplies the framework and service details. |
| `askin` | Python, FastAPI, Svelte, TypeScript, Ollama, OpenAI API, RAG, Docker | SvelteKit, Svelte, TypeScript, Python/FastAPI, Go/Gin, Docker | [Project file](frontend/content/projects/askin.md); [GitHub repository](https://github.com/farismnrr/askin) (README, `package.json`, `backend/requirements.txt`, `backend-go/go.mod`) | **Verified, with a mismatch**. The repo README identifies SvelteKit; the repo retains Python and Go backend code. The current README says the development frontend demo uses mock endpoints and needs no backend process. |
| `gizilens` | TypeScript, Bun, Hapi, Nuxt, PostgreSQL, Redis, Docker, Nginx, TensorFlow | TypeScript, Vue, plus backend/database/deployment items from the project description pending a specific backend repository check | [Project file](frontend/content/projects/gizilens.md); [linked GitHub organization repositories](https://github.com/orgs/Group-CC25-CF047/repositories), including [Web-App](https://github.com/Group-CC25-CF047/Web-App) | **Partially verified**. The Web-App repository’s language breakdown includes TypeScript and Vue, but the repository link in the project file is an organization listing, and I could not confirm the listed Bun, Hapi, PostgreSQL, or Redis stack from the accessible repository page. |

### Not found

- No repository URL was supplied for Sensio Notes, Sensio IoT, Masih Awam LMS, or IoTnet, so their stacks could not be checked against source code.
- GiziLens links to an organization repository listing rather than a specific repository. The Web-App page confirms TypeScript and Vue in its language breakdown, but not the full backend stack.
- The GitHub search results did not surface several exact repositories. I used repository pages and manifests where accessible, plus GitHub’s public repository API for repository metadata and language breakdowns.

### Suggestions

- Update `portfolio-website` and `askin` to reflect their repositories’ current descriptions, or have the project owner confirm whether the portfolio content refers to an earlier architecture and AskIn’s deployed configuration.
- Keep the Sensio, Masih Awam LMS, and IoTnet labels marked unverified until repository access is available.
- For GiziLens, link the specific Web-App repository and verify its backend manifests before listing Bun, Hapi, PostgreSQL, or Redis as confirmed technologies.