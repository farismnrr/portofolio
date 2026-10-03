# Repository Rules

These rules apply to repository work unless the user explicitly requests otherwise.

## Branch workflow

- `dev` is the only default working branch for development, fixes, refactors, content edits, documentation changes, and CI/CD changes.
- Start repository work from `dev` and commit/push changes to `dev`. Do not develop directly on `main`.
- `main` is the production branch. It may only be updated by merging a pull request from `dev` to `main` as part of the explicit production release workflow.
- Do not directly commit, push, force-push, or otherwise edit `main` during normal development.
- Do not delete `dev`, `main`, or any other branch as part of the release workflow. In particular, never use automatic head-branch deletion when merging the `dev` -> `main` release pull request.
- After a successful release merge, continue subsequent development on the existing `dev` branch.

## CI/CD

- Keep exactly two GitHub Actions workflow files under `.github/workflows/`.
- `fast-guardrail-build.yml` is the automatic development validation workflow. It runs for pushes to `dev` and pull requests targeting `dev`, may also support manual dispatch from `dev`, and must never publish images, merge into `main`, or deploy.
- `full-guardrail-build-deploy.yml` is the production release workflow. It must remain manual-only via `workflow_dispatch` and must only be run from `dev`.
- The full release workflow must run the full guardrail/tests and production build first. Only after those succeed may it create or reuse the `dev` -> `main` pull request, merge that PR into `main`, publish the production image, and deploy it.
- The full release workflow is the only workflow allowed to merge the release PR, publish the production image, or deploy.
- The release workflow must not delete the `dev` branch after the PR merge.
- Do not add `push`, `pull_request`, `schedule`, `workflow_run`, or other automatic triggers to the full deployment workflow.
- Keep guardrail/build/release/deploy responsibilities separated according to the two workflows above. Do not recreate legacy CI workflows or split the pipeline into additional YAML files unless explicitly requested.

## Documentation

- `README.md`, `AGENTS.md`, the active workflow files, and the current implementation must describe the same branch, CI, and deployment behavior.
- Do not keep duplicated legacy documentation that states behavior which no longer exists.
- If historical or legacy documentation is introduced, clearly mark it as non-authoritative and ensure it does not conflict with current repository rules.
- When branch or CI/CD behavior changes, update the relevant documentation in the same repository change.

## Source of truth

- Current implementation and active workflow files are the operational source of truth.
- `AGENTS.md` defines repository-local working rules.
- `README.md` documents the current behavior for humans using the repository.
