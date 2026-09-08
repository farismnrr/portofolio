# Portfolio Copilot Instructions

Root `AGENTS.md` is the canonical operating policy for this repository. Follow it before making changes.

## Architecture

This repository is a **single static Next.js portfolio codebase**.

- Next.js App Router + React.
- `output: "export"`; production output is `out/`.
- Portfolio content is repository-local Markdown/MDX/resources evaluated at build time.
- There is no login, dashboard, backend API, database, SSO service, or runtime content service.
- Do not reintroduce server/runtime infrastructure unless the user explicitly changes the architecture.

## Quality workflow

Use the Sensio-derived governance surfaces:

```bash
make guard-fast
make guard-full
make guard-release
python3 .agents/scripts/maintainability.py portfolio
```

Normal implementation should use targeted checks rather than repeatedly running the full guard.

## Code conventions

- Keep routes statically prerenderable.
- Dynamic slugs require `generateStaticParams()`.
- Prefer repository-local build-time data over runtime fetches.
- Keep component-specific styling in existing Sass/CSS module patterns.
- Preserve Once UI conventions already used by the codebase.
- Do not add permanent isolated unit-test files; integration/E2E/smoke/regression coverage is allowed.

## Git safety

- Preserve unrelated dirty work.
- Stage explicit task-owned paths only.
- Never commit `.env`, build output, caches, editor-local settings, or test artifacts.
- Run the maintainability ratchet once at closure, then inspect the staged diff before committing.
