#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CODEBASE="${1:-}"

if [[ $# -ne 1 || "$CODEBASE" != "portfolio" ]]; then
  echo 'usage: ./.agents/scripts/codebase-policy.sh portfolio' >&2
  exit 64
fi

cd "$ROOT"
errors=()

# Static-only application architecture.
[[ -f next.config.mjs ]] || errors+=("missing next.config.mjs")
grep -Eq 'output:[[:space:]]*"export"' next.config.mjs || errors+=("next.config.mjs must keep output: \"export\"")

for forbidden in 'src/app/api' 'src/app/login' 'src/app/callback' 'src/app/(dashboard)'; do
  [[ ! -e "$forbidden" ]] || errors+=("forbidden runtime/auth surface exists: $forbidden")
done

if rg -n --glob '!node_modules/**' --glob '!out/**' --glob 'src/app/**/*.{ts,tsx,js,jsx}' \
  'export[[:space:]]+const[[:space:]]+dynamic[[:space:]]*=[[:space:]]*"force-dynamic"' src/app >/dev/null 2>&1; then
  errors+=("force-dynamic route found; portfolio routes must remain static/SSG")
fi

if rg -n --glob '!node_modules/**' --glob '!out/**' --glob 'src/**/*.{ts,tsx,js,jsx}' \
  '(^|[^A-Za-z])fetch\(' src >/dev/null 2>&1; then
  errors+=("runtime fetch() found under src; portfolio content should remain build-time/static unless explicitly approved")
fi

# Dynamic marketing routes must enumerate static params.
while IFS= read -r route; do
  grep -q 'generateStaticParams' "$route" || errors+=("dynamic route missing generateStaticParams(): $route")
done < <(find 'src/app/(marketing)' -type f -path '*[*]*' -name 'page.tsx' 2>/dev/null | sort)

# Permanent isolated unit-test inventory is intentionally forbidden.
while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  errors+=("permanent unit test is forbidden: $path; use integration/E2E/smoke/regression coverage")
done < <(find src -type f \( \
  -name '*.unit.test.ts' -o -name '*.unit.test.tsx' -o -name '*.unit.spec.ts' -o -name '*.unit.spec.tsx' -o \
  -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.spec.ts' -o -name '*.spec.tsx' \
\) 2>/dev/null | sort)

# Generated/local files must not be tracked.
for path in .env .next out node_modules coverage playwright-report test-results .vscode; do
  if git ls-files --error-unmatch "$path" >/dev/null 2>&1 || git ls-files "$path/**" | grep -q .; then
    errors+=("local/generated path must not be tracked: $path")
  fi
done

if ((${#errors[@]})); then
  echo 'codebase policy failed: portfolio' >&2
  printf -- '- %s\n' "${errors[@]}" >&2
  exit 1
fi

echo 'codebase policy passed: portfolio'
