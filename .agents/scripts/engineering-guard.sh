#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CODEBASE="${1:-}"
MODE="${2:-}"
if [[ $# -ne 2 || "$CODEBASE" != "portfolio" ]]; then
  echo 'usage: ./.agents/scripts/engineering-guard.sh portfolio <fast|full|release>' >&2
  exit 64
fi
case "$MODE" in fast|full|release) ;; *) echo 'mode must be fast, full, or release' >&2; exit 64 ;; esac
cd "$ROOT"
step() { printf '\n==> %s\n' "$1"; shift; "$@"; }
run_fast() {
  step 'portfolio policy' ./.agents/scripts/codebase-policy.sh portfolio
  step 'portfolio lint' npm run lint
  step 'portfolio typecheck' npm run typecheck
}
run_full() {
  step 'portfolio static prerender build' npm run build
  step 'portfolio dependency audit' npm run audit
  if node -e 'const p=require("./package.json"); process.exit(p.scripts?.["test:e2e"] ? 0 : 1)' 2>/dev/null; then
    if [[ "${PORTFOLIO_GUARD_RUN_E2E:-0}" == 1 ]]; then
      step 'portfolio browser E2E' npm run test:e2e
    else
      echo 'NOTE: test:e2e exists but was not auto-started; set PORTFOLIO_GUARD_RUN_E2E=1 in a prepared runtime.'
    fi
  fi
}
run_release() {
  for artifact in dist/index.html dist/404.html dist/sitemap.xml dist/robots.txt; do
    [[ -f "$artifact" ]] || { echo "release check failed: $artifact is missing" >&2; exit 1; }
  done
  [[ ! -e .ssr ]] || { echo 'release check failed: temporary .ssr directory was not cleaned' >&2; exit 1; }
  echo 'static release artifacts present'
}
run_fast
[[ "$MODE" == full || "$MODE" == release ]] && run_full
[[ "$MODE" == release ]] && run_release
printf '\nPORTFOLIO_ENGINEERING_GUARD_PASS codebase=%s mode=%s\n' "$CODEBASE" "$MODE"
