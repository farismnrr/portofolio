# Repository Rules

These rules apply to repository work unless the user explicitly requests otherwise.

## Branch workflow

- `dev` is the only default working branch for development, fixes, refactors, content edits, documentation changes, and CI/CD changes.
- Start repository work from `dev` and commit/push changes to `dev`. Do not develop directly on `main`.
- `main` is the production release branch. It may only be updated by merging a pull request from `dev` to `main` as part of the explicit full production release workflow.
- Do not directly commit, push, force-push, or otherwise edit `main` during normal development.
- Do not delete `dev`, `main`, or any other branch as part of the release workflow. In particular, never use automatic head-branch deletion when merging the `dev` -> `main` release pull request.
- After a successful release merge, continue subsequent development on the existing `dev` branch.

## CI/CD

- Keep exactly two GitHub Actions workflow files under `.github/workflows/` unless the user explicitly requests another structure.
- `fast-guardrail-build-deploy.yml` is the automatic development workflow for `dev`.
- The fast workflow runs automatically only when application/runtime inputs change (`frontend/**`, `server/**`, `Dockerfile`, `compose.yaml`, the shared CI scripts, or the fast workflow itself). Documentation-only repository changes must not pay for an application build.
- The fast workflow may also support manual dispatch from `dev`.
- The fast workflow is the pre-release validation loop on the X64 self-hosted runner. It must catch frontend architecture/content/type/build failures and Rust format/clippy/test failures before the manual full release is attempted.
- Keep fast validation/build/deploy in one self-hosted job so the same filesystem and machine-local caches are reused instead of passing artifacts between fresh runners.
- The fast frontend path must run the architecture/SOLID/DRY guard, Markdown/Mermaid content validation, the writing-style/slop guard for changed portfolio Markdown, strict Svelte/TypeScript diagnostics, and the production frontend build including prerender/SEO verification.
- The writing-style guard is an editorial lint, not an AI-authorship detector. It blocks em dashes in changed visible copy plus a small high-confidence set of overused AI-style phrases, while softer structural/style patterns remain warnings. Factual date/period metadata and fenced code/diagram content are exempt from the em-dash rule.
- The fast Rust path must run `cargo fmt --check`, clippy with warnings denied, and the Rust test suite before building the AMD64 MUSL runtime with Zig/cargo-zigbuild.
- The private `Match a role` utility is development-only. Fast builds must enable the Rust `role-match` feature and `VITE_ROLE_MATCH_ENABLED=true`, and fast verification must prove the development endpoint is mounted.
- Fast Rust builds must use a persistent `CARGO_TARGET_DIR` outside the checkout so unchanged crates are reused across workflow runs.
- Frontend fast builds should reuse the machine-local npm cache and preserved `frontend/node_modules` rather than using `npm ci` on every development push.
- Fast frontend builds should keep heavy prebuilt browser runtimes out of Vite's transform graph when the upstream package provides an official standalone bundle. Mermaid is staged from its local installed package into `frontend/public/vendor/` before build and lazy-loaded from there; do not replace this with a CDN dependency or rebundle the full Mermaid module graph without an explicit reason.
- The self-hosted fast build must not require passwordless `sudo`; use user-local tooling such as Zig/cargo-zigbuild for the MUSL runtime build.
- Reuse the installed Rust/Zig/cargo-zigbuild toolchain on subsequent fast runs. Toolchain installation is a warm-up operation, not normal per-push work.
- Fast AMD64 container packaging should use the local Docker daemon and its layer cache. Do not push to GHCR and pull the same image back merely to deploy it on the same self-hosted machine.
- Fast deployment verification must prove the homepage is reachable, `/api/cv/retrieve` returns nonempty evidence with backend `pgvector+postgres-fts`, `/api/ai/chat` returns a nonempty answer, and the development Role Match route is mounted.
- Fast validation still intentionally skips ARM64 production compilation, QEMU, multi-architecture container validation, GHCR publishing, `dev` -> `main` merging, and Orange Pi production deployment. Those remain full-release responsibilities.
- On pull requests targeting `dev`, the fast workflow validates/builds but must not deploy. Do not run untrusted fork pull-request code on the self-hosted runner.
- On pushes to `dev` and manual runs from `dev`, the fast workflow builds a local AMD64 image and deploys that local image directly to the X64 self-hosted host.
- `full-guardrail-build-deploy.yml` is the explicit production release workflow. It remains manual-only via `workflow_dispatch` and must only be run from `dev`.
- The production release workflow contains the complete full validation inline: frontend guardrail/build (including the writing-style guard), Rust format/clippy/tests, AI smoke check, AMD64/ARM64 production builds, and multi-architecture container build.
- Full production builds must keep the Rust `role-match` feature disabled and `VITE_ROLE_MATCH_ENABLED=false`. The production frontend must not render `Match a role`, and the production runtime must not expose `/api/role-match/report`.
- Only after full validation succeeds may the production release workflow create or reuse the `dev` -> `main` pull request, merge that PR into `main`, and publish the production multi-architecture image to GHCR.
- The release workflow must not delete the `dev` branch after the PR merge.
- Do not add automatic triggers to `full-guardrail-build-deploy.yml` unless the user explicitly requests a release-policy change.
- Do not recreate a standalone `full-guardrail-build.yml` workflow unless explicitly requested.
- Keep the fast and full paths intentionally different: fast validates all normal source/content/Rust test gates and the AMD64 development runtime with live database/AI checks plus the private Role Match utility; full remains the clean cross-architecture, container, merge, publish, and production deployment boundary without Role Match.

## Shared database deployment

- Arch deployments reuse the infrastructure-owned `shared-postgres` container; do not provision an application-specific PostgreSQL container or volume.
- The fast deploy workflow must supply the `PORTFOLIO_DATABASE_URL` repository secret to Compose. The server requires `DATABASE_URL`.
- Deployment verification must check nonempty `/api/cv/retrieve` evidence with backend `pgvector+postgres-fts`; HTTP 200 with memory fallback does not prove database success.
- Preserve shared infrastructure and other applications when migrating or cleaning up Portfolio database resources.

## Orange Pi production deployment

- The full release workflow deploys only the immutable `main` SHA tag after GHCR publish. It never deploys `latest`.
- Orange Pi production lives under `/opt/portfolio/` and runs the Portfolio application, PostgreSQL 17 with pgvector, and 9router 0.5.95 in the versioned Compose definition under `deploy/orangepi/`.
- The Orange Pi `.env` is host-local, mode `600`, and must never be committed or copied into CI artifacts. It contains the production database URL and AI configuration.
- The deployment job recreates only the Portfolio service. PostgreSQL and 9router are persistent services and must not be recreated on an application release.
- Verification must prove ARM64 execution, exact SHA image identity, loopback-only ports, homepage and public-site success, nonempty `pgvector+postgres-fts` retrieval evidence, authenticated 9router models, nonempty `/api/ai/chat`, the absence of the dev-only Role Match UI/API, and clean startup/database/AI logs.
- A failed verification restores the SHA stored in `state/previous-sha`, verifies that rollback, and fails the release job. Database rollback is a separate operation.
- The current deployment transport is the existing Arch self-hosted runner over its private SSH/Tailscale path. This is a transport dependency for CI only; production runtime must not point at Arch PostgreSQL or Arch 9router.

## Documentation

- `README.md`, `AGENTS.md`, the active workflow files, and the current implementation must describe the same branch, CI, and deployment behavior.
- Do not keep duplicated legacy documentation that states behavior which no longer exists.
- If historical or legacy documentation is introduced, clearly mark it as non-authoritative and ensure it does not conflict with current repository rules.
- When branch or CI/CD behavior changes, update the relevant documentation in the same repository change.

## Source of truth

- Current implementation and active workflow files are the operational source of truth.
- `AGENTS.md` defines repository-local working rules.
- `README.md` documents the current behavior for humans using the repository.
