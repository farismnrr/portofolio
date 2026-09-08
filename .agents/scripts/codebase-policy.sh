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

[[ -f vite.config.ts ]] || errors+=("missing vite.config.ts")
[[ -f scripts/build.mjs ]] || errors+=("missing static prerender build script")
[[ -f scripts/content-plugin.ts ]] || errors+=("missing build-time Vite content plugin")
[[ -f src/entry-server.ts ]] || errors+=("missing build-time Vue SSR entry used for prerendering")
[[ -f src/entry-client.ts ]] || errors+=("missing Vue client entry")

node - <<'NODE' || errors+=("package architecture must remain Vue + Vite without Next/Nuxt/React/UI frameworks")
const p = require('./package.json');
const all = {...p.dependencies, ...p.devDependencies};
const required = ['vue','vite','@vue/server-renderer'];
const forbidden = ['next','nuxt','react','react-dom','@once-ui-system/core','tailwindcss','@tailwindcss/vite'];
if (!required.every((name) => all[name])) process.exit(1);
if (forbidden.some((name) => all[name])) process.exit(1);
NODE

for forbidden in next.config.mjs next-env.d.ts src/app; do
  [[ ! -e "$forbidden" ]] || errors+=("obsolete framework surface exists: $forbidden")
done

if rg -n --glob 'src/**/*.{ts,vue,js}' '(^|[^A-Za-z])fetch\(' src >/dev/null 2>&1; then
  errors+=("runtime fetch() found under src; portfolio content must remain build-time/static unless explicitly approved")
fi

if rg -n --glob 'src/**/*.{vue,scss,css,ts}' '(tailwind|@once-ui|once-ui-system)' src >/dev/null 2>&1; then
  errors+=("external UI framework reference found; portfolio UI must remain Vue + SCSS")
fi

while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  errors+=("permanent unit test is forbidden: $path; use integration/E2E/smoke/regression coverage")
done < <(find src -type f \( -name '*.test.ts' -o -name '*.spec.ts' -o -name '*.test.tsx' -o -name '*.spec.tsx' \) 2>/dev/null | sort)

for path in .env .next out dist .ssr node_modules coverage playwright-report test-results .tmp-ui-check .vscode; do
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
