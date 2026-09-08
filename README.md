# Faris Munir Mahdi — Portfolio

A fully static personal portfolio built with Next.js 16.3.4, React 19, Once UI, MDX, and local content files.

The application intentionally has **no login, dashboard, API routes, database, SSO service, or backend runtime**. Production builds are exported as static HTML/CSS/JS into `out/` for fast delivery, simple hosting, and strong crawlability.

## Architecture

- **Framework:** Next.js App Router
- **Rendering:** Static export (`output: "export"`)
- **Content:** Local Markdown/MDX and static assets
- **UI:** Once UI + React
- **SEO:** Static metadata, Open Graph image, `robots.txt`, `sitemap.xml`, prerendered project/blog detail routes
- **Deployment:** Any static host, CDN, object storage, or the provided nginx Docker image

## Routes

All public routes are generated at build time:

- `/`
- `/about/`
- `/blog/`
- `/blog/[slug]/`
- `/certifications/`
- `/gallery/`
- `/projects/`
- `/projects/[slug]/`
- `/robots.txt`
- `/sitemap.xml`

There are no authentication or server API routes.

## Development

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Static production build

```bash
npm run build
```

The production site is written to:

```text
out/
```

Preview the exact exported site:

```bash
make preview
```

## Docker

The Docker image builds the static export and serves it with nginx only:

```bash
make docker-build
make docker-run
```

Then open `http://localhost:8080`.

## Content editing

Portfolio content is versioned with the source code under `src/content/`:

```text
src/content/
├── about/
├── blog/
├── projects/
├── studies/
├── technical/
└── work/
```

Project and blog detail pages use `generateStaticParams`, so every known slug is prerendered during `npm run build`.

## SEO / performance model

The site is designed so the origin does not need Node.js at request time:

- HTML exists before a crawler requests a page.
- Project and blog routes are prerendered.
- `robots.txt` and `sitemap.xml` are statically generated.
- OG metadata uses a static image rather than a runtime image-generation API.
- Next Image optimization is disabled at runtime because the site is exported; image delivery can be handled by the CDN/static host.
- No auth/bootstrap API calls run in the browser.

## Governance and quality

The repository uses a Sensio-derived single-codebase governance workflow. Root `AGENTS.md` is canonical.

```bash
make guard-fast
make guard-full
make guard-release
python3 .agents/scripts/maintainability.py portfolio
```

The full guard enforces static-only architecture, Biome, TypeScript, static export, and a zero-vulnerability npm audit.

## License

See [LICENSE](LICENSE).
