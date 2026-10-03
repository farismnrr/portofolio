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
- The fast workflow runs automatically only when application/runtime inputs change (`frontend/**`, `server/**`, `Dockerfile`, `compose.yaml`, or the fast workflow itself). Documentation-only repository changes must not pay for an application build.
- The fast workflow may also support manual dispatch from `dev`.
- The fast workflow is intentionally optimized as a persistent developer loop on the X64 self-hosted runner, not as a clean-room release build.
- Keep fast validation/build/deploy in one self-hosted job so the same filesystem and machine-local caches are reused instead of passing artifacts between fresh runners.
- Detect which application area changed and run only the relevant expensive work. Frontend-only changes must not rebuild Rust when a valid cached server binary exists; server-only changes should reuse the last valid frontend `dist`; Docker/Compose-only changes should avoid unrelated compiler work.
- Keep tracked source clean between runs while preserving intentional incremental outputs such as `frontend/node_modules`, `frontend/dist`, and the staged AMD64 runtime when safe to reuse.
- Persist development caches under the runner user's home directory. The fast workflow uses a portfolio-specific cache root under `~/.cache/portfolio-ci` for npm downloads, Cargo build output, Cargo-installed tools, and an isolated Rustup toolchain.
- Do not depend on or mutate the developer's global Rust toolchain for fast CI. Use the isolated portfolio Rustup/Cargo homes so interrupted CI setup cannot corrupt local tooling.
- Fast validation runs frontend architecture/content/type checks and frontend build only when frontend inputs changed. Rust format/clippy and AMD64 runtime build run only when server inputs changed or the cached runtime is missing.
- Fast validation intentionally skips the expensive Rust test suite, AI smoke check, ARM64 build, QEMU, and multi-architecture container build.
- Rust fast builds must use a persistent `CARGO_TARGET_DIR` outside the checkout so unchanged crates are reused across workflow runs.
- Frontend fast builds should reuse the machine-local npm cache and preserved `frontend/node_modules` rather than using `npm ci` on every development push.
- Fast Rust clippy should validate the normal runtime target only; exhaustive `--all-targets` validation belongs to the full release workflow.
- The self-hosted fast build must not require passwordless `sudo`; use user-local tooling such as Zig/cargo-zigbuild for the MUSL runtime build.
- Reuse the installed Rust/Zig/cargo-zigbuild toolchain on subsequent fast runs. Toolchain installation is a warm-up operation, not normal per-push work.
- Fast AMD64 container packaging should use the local Docker daemon and its layer cache. Do not push to GHCR and pull the same image back merely to deploy it on the same self-hosted machine.
- On pull requests targeting `dev`, the fast workflow validates/builds but must not deploy. Do not run untrusted fork pull-request code on the self-hosted runner.
- On pushes to `dev` and manual runs from `dev`, the fast workflow builds a local AMD64 image only when required and deploys that local image directly to the X64 self-hosted host.
- `full-guardrail-build-deploy.yml` is the explicit production release workflow. It remains manual-only via `workflow_dispatch` and must only be run from `dev`.
- The production release workflow contains the complete full validation inline: frontend guardrail/build, Rust format/clippy/tests, AI smoke check, AMD64/ARM64 production builds, and multi-architecture container build.
- Only after full validation succeeds may the production release workflow create or reuse the `dev` -> `main` pull request, merge that PR into `main`, publish the production multi-architecture image to GHCR, and deploy it.
- The release workflow must not delete the `dev` branch after the PR merge.
- Do not add automatic triggers to `full-guardrail-build-deploy.yml` unless the user explicitly requests a release-policy change.
- Do not recreate a standalone `full-guardrail-build.yml` workflow unless explicitly requested.
- Keep the fast and full paths intentionally different: fast optimizes normal development feedback and X64 deployment with persistent incremental caches and change-aware execution; full protects explicit production releases with clean comprehensive validation and ARM64 compatibility.

## Documentation

- `README.md`, `AGENTS.md`, the active workflow files, and the current implementation must describe the same branch, CI, and deployment behavior.
- Do not keep duplicated legacy documentation that states behavior which no longer exists.
- If historical or legacy documentation is introduced, clearly mark it as non-authoritative and ensure it does not conflict with current repository rules.
- When branch or CI/CD behavior changes, update the relevant documentation in the same repository change.

## Source of truth

- Current implementation and active workflow files are the operational source of truth.
- `AGENTS.md` defines repository-local working rules.
- `README.md` documents the current behavior for humans using the repository.
