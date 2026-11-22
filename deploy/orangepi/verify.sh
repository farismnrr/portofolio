#!/usr/bin/env bash
set -euo pipefail

ROOT="${PORTFOLIO_ROOT:-/opt/portfolio}"
EXPECTED_SHA="${1:-}"
cd "$ROOT"
test -f compose.yaml
test -f .env

compose() {
  docker compose --env-file "$ROOT/.env" -f "$ROOT/compose.yaml" "$@"
}

if [[ -z "$EXPECTED_SHA" && -f state/deployed-sha ]]; then
  EXPECTED_SHA="$(<state/deployed-sha)"
fi
if [[ ! "$EXPECTED_SHA" =~ ^[0-9a-fA-F]{40}$ ]]; then
  echo "an immutable expected Portfolio SHA is required" >&2
  exit 2
fi

[[ "$(uname -m)" == "aarch64" ]]
expected_image="ghcr.io/farismnrr/portofolio/portfolio-app:${EXPECTED_SHA}"
container="$(compose ps -q portfolio)"
test -n "$container"
[[ "$(docker inspect --format '{{.State.Status}}' "$container")" == "running" ]]
[[ "$(docker inspect --format '{{.Config.Image}}' "$container")" == "$expected_image" ]]
actual_image_id="$(docker inspect --format '{{.Image}}' "$container")"
restart_count="$(docker inspect --format '{{.RestartCount}}' "$container")"
[[ "$restart_count" == "0" ]]

db_container="$(compose ps -q postgres)"
test -n "$db_container"
[[ "$(docker inspect --format '{{.State.Status}}' "$db_container")" == "running" ]]
[[ "$(docker inspect --format '{{.State.Health.Status}}' "$db_container")" == "healthy" ]]

compose_services="$(compose config --services)"
legacy_ai_service=0
if printf '%s\n' "$compose_services" | grep -qx 'nine-router'; then
  legacy_ai_service=1
  router_container="$(compose ps -q nine-router)"
  test -n "$router_container"
  [[ "$(docker inspect --format '{{.State.Status}}' "$router_container")" == "running" ]]
  grep -Eq '127\.0\.0\.1:20128[[:space:]]' <(ss -ltn)
fi

app_env="$(docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' "$container")"
db_url="$(printf '%s\n' "$app_env" | sed -n 's/^DATABASE_URL=//p')"
case "$db_url" in *\@postgres:5432/portfolio*) ;; *) echo "Portfolio is not using the local PostgreSQL service" >&2; exit 1 ;; esac
if [[ "$legacy_ai_service" == 1 ]]; then
  router_url="$(printf '%s\n' "$app_env" | sed -n 's/^NINE_ROUTER_URL=//p')"
  case "$router_url" in http://nine-router:20128/v1) ;; *) echo "Rollback app is not using its backed-up model service" >&2; exit 1 ;; esac
fi

grep -Eq '127\.0\.0\.1:5432[[:space:]]' <(ss -ltn)
grep -Eq '127\.0\.0\.1:3001[[:space:]]' <(ss -ltn)

curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-connrefused \
  http://127.0.0.1:3001/ > "$ROOT/state/homepage.html"
python3 - "$ROOT/state/homepage.html" <<'PY'
import re, sys
from urllib.parse import urljoin
import urllib.request

html = open(sys.argv[1], encoding="utf-8").read()
if not html.strip():
    raise SystemExit("homepage is empty")
asset = re.search(r'(?:src|href)="([^\"]*assets/[^\"]+)"', html)
if not asset:
    raise SystemExit("homepage has no asset reference")
url = urljoin("http://127.0.0.1:3001/", asset.group(1))
with urllib.request.urlopen(url, timeout=10) as response:
    if response.status != 200 or not response.read(64):
        raise SystemExit("static asset check failed")
PY
curl --fail --silent --show-error --retry 5 --retry-delay 2 \
  https://farismnrr.com/ > /dev/null

for retired_endpoint in /api/role-match/report; do
  status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
    -X POST "http://127.0.0.1:3001${retired_endpoint}" \
    -H 'Content-Type: application/json' \
    --data '{}')"
  if [[ "$status" != "404" ]]; then
    echo "retired endpoint ${retired_endpoint} must return 404, got ${status}" >&2
    exit 1
  fi
  printf 'retired_endpoint=%s status=%s\n' "$retired_endpoint" "$status"
done

if [[ "$legacy_ai_service" == 1 ]]; then
  api_key="$(grep '^NINE_ROUTER_API_KEY=' .env | cut -d= -f2-)"
  test -n "$api_key"
  router_models="$(curl --fail --silent --show-error \
    http://127.0.0.1:20128/v1/models \
    -H "Authorization: Bearer ${api_key}")"
  printf '%s\n' "$router_models" | python3 -c '
import json, sys
d=json.load(sys.stdin)
if not d.get("data"):
    raise SystemExit("rollback model service returned no models")
print("rollback_model_count=" + str(len(d["data"])))
'
  ai_response="$(curl --fail --silent --show-error --retry 3 --retry-delay 2 \
    -X POST http://127.0.0.1:3001/api/ai/chat \
    -H 'Content-Type: application/json' \
    --data '{"message":"Reply with exactly one word: OK","reasoning_effort":"low"}')"
  printf '%s\n' "$ai_response" | python3 -c 'import json,sys; d=json.load(sys.stdin); size=len(d.get("message", "").strip()); print("rollback_ai_response_chars=" + str(size)); size > 0 or (print("rollback model response was empty"), sys.exit(1))'
else
  ai_status="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' \
    -X POST http://127.0.0.1:3001/api/ai/chat \
    -H 'Content-Type: application/json' \
    --data '{}')"
  if [[ "$ai_status" != "404" ]]; then
    echo "retired AI chat endpoint must return 404, got ${ai_status}" >&2
    exit 1
  fi
  printf 'retired_endpoint=/api/ai/chat status=%s\n' "$ai_status"
fi

retrieve="$(curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-connrefused \
  -X POST http://127.0.0.1:3001/api/cv/retrieve \
  -H 'Content-Type: application/json' \
  --data '{"target":"general","query":"backend PostgreSQL Rust Docker","limit":6}')"
printf '%s\n' "$retrieve" | python3 -c '
import json, sys
d=json.load(sys.stdin)
if d.get("backend") != "pgvector+postgres-fts":
    raise SystemExit("retrieval backend is not pgvector+postgres-fts")
if not d.get("evidence"):
    raise SystemExit("retrieval evidence is empty")
print("retrieval_backend=" + d["backend"])
print("retrieval_evidence_count=" + str(len(d["evidence"])))
'

if [[ -f state/deploy-start ]]; then
  since="$(<state/deploy-start)"
  logs="$(docker logs --since "$since" "$container" 2>&1 || true)"
  if printf '%s\n' "$logs" | grep -Eiq 'panic|failed to bind|memory-fallback|database.*(error|unavailable)'; then
    echo "application logs contain startup/database errors" >&2
    exit 1
  fi
fi

echo "architecture=$(uname -m)"
echo "image=${expected_image}"
echo "image_id=${actual_image_id}"
echo "portfolio_container=${container}"
echo "postgres_container=${db_container}"
echo "legacy_model_service=${legacy_ai_service}"
echo "verification=passed"
