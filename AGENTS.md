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

- Keep exactly three GitHub Actions workflow files under `.github/workflows/` unless the user explicitly requests another structure.
- `fast-guardrail-build-deploy.yml` is the automatic development workflow for `dev`.
- The fast workflow runs automatically for pushes to `dev` and pull requests targeting `dev`, and may also support manual dispatch from `dev`.
- Fast validation runs the frontend architecture/content/type checks, frontend build, Rust format/clippy, and an AMD64 production build. It intentionally skips the expensive Rust test suite, AI smoke check, ARM64 build, QEMU, and multi-architecture container build.
- On pull requests targeting `dev`, the fast workflow validates and builds the AMD64 container without publishing or deploying.
- On pushes to `dev` and manual runs from `dev`, the fast workflow publishes an AMD64-only `ghcr.io/farismnrr/portofolio/portfolio-app:latest` image and deploys it to the X64 self-hosted host.
- `full-guardrail-build.yml` is the full validation workflow. It retains the complete frontend guardrail, Rust format/clippy/tests, AI smoke check, AMD64/ARM64 production builds, and multi-architecture container build without publishing or deploying.
- `full-guardrail-build.yml` is not an automatic development trigger. It supports manual dispatch from `dev` and `workflow_call` reuse by the production release workflow.
- `full-guardrail-build-deploy.yml` is the explicit production release workflow. It remains manual-only via `workflow_dispatch` and must only be run from `dev`.
- The production release workflow must reuse `full-guardrail-build.yml` for full validation instead of duplicating the complete validation implementation.
- Only after shared full validation succeeds may the production release workflow create or reuse the `dev` -> `main` pull request, merge that PR into `main`, publish the production multi-architecture image, and deploy it.
- The release workflow must not delete the `dev` branch after the PR merge.
- Do not add automatic triggers to `full-guardrail-build-deploy.yml` unless the user explicitly requests a release-policy change.
- Keep the fast and full paths intentionally different: fast optimizes normal development feedback and X64 deployment; full protects explicit production releases and ARM64 compatibility.

## Documentation

- `README.md`, `AGENTS.md`, the active workflow files, and the current implementation must describe the same branch, CI, and deployment behavior.
- Do not keep duplicated legacy documentation that states behavior which no longer exists.
- If historical or legacy documentation is introduced, clearly mark it as non-authoritative and ensure it does not conflict with current repository rules.
- When branch or CI/CD behavior changes, update the relevant documentation in the same repository change.

## Source of truth

- Current implementation and active workflow files are the operational source of truth.
- `AGENTS.md` defines repository-local working rules.
- `README.md` documents the current behavior for humans using the repository.
