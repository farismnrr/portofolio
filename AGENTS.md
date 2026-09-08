# AGENTS.md

This file is the single current operating policy for agents working in this portfolio repository. Product documentation and `.agents/` material may add factual context but must not override this workflow, testing, Git, or execution policy.

## Canonical Agent Lifecycle

1. Inspect `git status` and the smallest relevant source/docs before editing.
2. Read an active `.agents/plans/` entry only when the task has one.
3. Make the smallest coherent change and preserve unrelated/user-owned worktree changes.
4. During implementation, run targeted checks only.
5. Update durable docs/governance only when behavior, architecture, policy, or reusable knowledge changed.
6. Stage and commit only task-owned files. Never use `git add -A` in a dirty shared worktree.
7. Report briefly: what changed, what was verified, commit hash, and any real remaining risk.

Prefer execution over narration. Do not rerun the same expensive validation without new evidence.

## Working Boundaries

- Repository is a **single codebase** named `portfolio`.
- The product is a **static-exported Next.js portfolio**. There is no authentication, dashboard, application backend, database, or runtime API service.
- Production output is `out/` from `next build` with `output: "export"`.
- Do not add `/app/api`, login/callback/dashboard routes, server actions, runtime-only data dependencies, or backend/database services unless the user explicitly changes the architecture.
- Build-time reads of repository-local content/assets are allowed and preferred for SSG.
- Do not use `sudo`, destructive Git operations, force pushes, production deploys, or credential access.
- Never discard, reset, overwrite, stage, or commit unrelated dirty work from the user or another agent.

## Fast Development Loop

During normal implementation do not repeatedly run full builds or dependency audits. Prefer the narrowest check that covers the edit.

- Formatting/linting: `npm run lint`
- Type safety: `npm run typecheck`
- Static-export build: `npm run build`
- Dependency security: `npm run audit`
- Governance policy: `./.agents/scripts/codebase-policy.sh portfolio`

The full Engineering Guard is a closure/push concern, not an every-edit loop.

### Testing policy: no permanent unit tests

Do **not** add or restore a permanent isolated unit-test corpus. Temporary task-local unit tests may be used for debugging but must be deleted before staging or commit.

Permanent integration, E2E, contract, smoke, accessibility, visual-regression, and regression tests are allowed when they exercise meaningful browser/build/system boundaries. Prefer those boundary-level checks for this portfolio.

## Governance Layout

- `.agents/scripts/` — governance and quality automation only.
- `.agents/maintainability/` — maintainability ratchet baselines.
- `.agents/plans/` — substantial multi-step plans only.
- `.agents/memory/` and `.agents/knowledge/` — durable outcomes/reusable lessons, not tool-call diaries.
- `.githooks/` — Git dispatch hooks.
- Root/package scripts — normal product toolchain commands only.

Do not create parallel governance systems elsewhere in the repository.

## Engineering Guard Lifecycle

`./.agents/scripts/engineering-guard.sh portfolio <fast|full|release>` is the quality entry point.

- `fast`: policy + lint + typecheck.
- `full`: fast + static export build + dependency audit, plus E2E only if an existing `test:e2e` script is present.
- `release`: full plus checks that the expected static export exists.

`python3 .agents/scripts/maintainability.py portfolio` is a **closure-only** ratchet. Run it once after implementation is complete and before the requested final commit/closure. Do not wire maintainability into pre-commit or routine edit loops.

`.githooks/pre-push` runs the full guard when `main` is pushed. The pre-commit hook intentionally stays cheap.

Never weaken static-export, security, type, lint, or maintainability expectations merely to make a guard green.

## Static/SEO Architecture Contract

The following are repository invariants:

- `next.config.mjs` keeps `output: "export"`.
- Marketing routes must remain statically prerenderable.
- Dynamic `[slug]` routes must provide `generateStaticParams()`.
- `npm run build` must show only static (`○`) or SSG (`●`) application routes.
- `robots.txt` and `sitemap.xml` are statically generated.
- Content comes from repository-local Markdown/MDX/resources at build time.
- Remote/static images must remain compatible with export mode (`images.unoptimized: true` unless architecture changes).
- Do not reintroduce runtime API fetches for portfolio content that can be generated at build time.

## Git and Concurrent-Agent Safety

- Check status before editing and again before staging.
- Treat pre-existing modified/untracked files as someone else's unless the task explicitly owns them.
- Stage explicit paths only.
- Inspect `git diff --cached` before commit.
- Do not commit local `.env` files, generated build output, caches, test artifacts, or editor-local settings.
- Commit when requested; do not push unless explicitly requested.

## Completion Standard

A task is complete when requested behavior is implemented, the smallest meaningful verification passes, governance/docs are updated when needed, the maintainability ratchet passes at closure, and requested Git actions are complete.
