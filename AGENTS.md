# Repository Rules

These rules apply to repository work unless the user explicitly requests otherwise.

## CI/CD

- Keep exactly two GitHub Actions workflow files under `.github/workflows/`.
- `fast-guardrail-build.yml` is the automatic validation workflow. It must run on every push and pull request, may also support manual dispatch, and must never publish images or deploy.
- `full-guardrail-build-deploy.yml` is the production workflow. It must remain manual-only via `workflow_dispatch` and is the only workflow allowed to publish the production image or deploy.
- Do not add `push`, `pull_request`, `schedule`, `workflow_run`, or other automatic triggers to the full deployment workflow.
- Keep guardrail/build/deploy responsibilities separated according to the two workflows above. Do not recreate legacy CI workflows or split the pipeline into additional YAML files unless explicitly requested.

## Documentation

- `README.md`, `AGENTS.md`, the active workflow files, and the current implementation must describe the same CI/deployment behavior.
- Do not keep duplicated legacy documentation that states behavior which no longer exists.
- If historical or legacy documentation is introduced, clearly mark it as non-authoritative and ensure it does not conflict with current repository rules.
- When CI/CD behavior changes, update the relevant documentation in the same repository change.

## Source of truth

- Current implementation and active workflow files are the operational source of truth.
- `AGENTS.md` defines repository-local working rules.
- `README.md` documents the current behavior for humans using the repository.
