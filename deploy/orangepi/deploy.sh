#!/usr/bin/env bash
set -euo pipefail

ROOT="${PORTFOLIO_ROOT:-/opt/portfolio}"
IMAGE="${1:?usage: deploy.sh ghcr.io/farismnrr/portofolio/portfolio-app:<40-char-main-sha>}"

if [[ ! "$IMAGE" =~ ^ghcr\.io/farismnrr/portofolio/portfolio-app:[0-9a-fA-F]{40}$ ]]; then
  echo "refusing a non-immutable Portfolio image reference" >&2
  exit 2
fi

cd "$ROOT"
test -f compose.yaml
test -f .env

compose() {
  docker compose --env-file "$ROOT/.env" -f "$ROOT/compose.yaml" "$@"
}

mkdir -p "$ROOT/state" "$ROOT/backup"
chmod 750 "$ROOT/state" "$ROOT/backup"

timestamp="$(date +%Y%m%d-%H%M%S)"
previous_sha=""
if [[ -f "$ROOT/state/deployed-sha" ]]; then
  previous_sha="$(<"$ROOT/state/deployed-sha")"
fi
printf '%s\n' "$previous_sha" > "$ROOT/state/previous-sha"
chmod 600 "$ROOT/state/previous-sha"

cp --preserve=mode "$ROOT/.env" "$ROOT/backup/env-before-${timestamp}"
chmod 600 "$ROOT/backup/env-before-${timestamp}"
printf '%s\n' "$(date --iso-8601=seconds)" > "$ROOT/state/deploy-start"
chmod 600 "$ROOT/state/deploy-start"

tmp_env="$(mktemp "$ROOT/.env.XXXXXX")"
trap 'rm -f "$tmp_env"' EXIT
awk -v image="$IMAGE" '
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

echo "previous_sha=${previous_sha:-none}"
echo "pulling=${IMAGE}"
compose pull portfolio
compose up -d --no-deps portfolio

container="$(compose ps -q portfolio)"
test -n "$container"
actual_ref="$(docker inspect --format '{{.Config.Image}}' "$container")"
actual_id="$(docker inspect --format '{{.Image}}' "$container")"
if [[ "$actual_ref" != "$IMAGE" ]]; then
  echo "running image reference mismatch: ${actual_ref}" >&2
  exit 1
fi

printf '%s\n' "${IMAGE##*:}" > "$ROOT/state/deployed-sha"
chmod 600 "$ROOT/state/deployed-sha"
echo "deployed_sha=${IMAGE##*:}"
echo "container_image_id=${actual_id}"
