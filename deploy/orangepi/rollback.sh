#!/usr/bin/env bash
set -euo pipefail

ROOT="${PORTFOLIO_ROOT:-/opt/portfolio}"
cd "$ROOT"
test -f compose.yaml
test -f .env
test -f state/previous-sha

previous_sha="$(<state/previous-sha)"
if [[ ! "$previous_sha" =~ ^[0-9a-fA-F]{40}$ ]]; then
  echo "no known-good immutable SHA is available for rollback" >&2
  exit 2
fi

image="ghcr.io/farismnrr/portofolio/portfolio-app:${previous_sha}"
compose() {
  docker compose --env-file "$ROOT/.env" -f "$ROOT/compose.yaml" "$@"
}

failed_sha=""
if [[ -f state/deployed-sha ]]; then
  failed_sha="$(<state/deployed-sha)"
fi
printf '%s\n' "$failed_sha" > state/failed-sha
chmod 600 state/failed-sha
printf '%s\n' "$(date --iso-8601=seconds)" > state/deploy-start
chmod 600 state/deploy-start

tmp_env="$(mktemp "$ROOT/.env.XXXXXX")"
trap 'rm -f "$tmp_env"' EXIT
awk -v image="$image" '
  BEGIN { replaced = 0 }
  /^PORTFOLIO_IMAGE=/ {
    if (!replaced) {
      print "PORTFOLIO_IMAGE=" image
      replaced = 1
    }
    next
  }
  { print }
  END {
    if (!replaced) print "PORTFOLIO_IMAGE=" image
  }
' "$ROOT/.env" > "$tmp_env"
chmod 600 "$tmp_env"
mv -f "$tmp_env" "$ROOT/.env"

echo "rolling_back_to=${previous_sha}"
compose pull portfolio
compose up -d --no-deps portfolio
container="$(compose ps -q portfolio)"
test -n "$container"
actual_ref="$(docker inspect --format '{{.Config.Image}}' "$container")"
[[ "$actual_ref" == "$image" ]]
printf '%s\n' "$previous_sha" > state/deployed-sha
chmod 600 state/deployed-sha
echo "rollback_running=${previous_sha}"
