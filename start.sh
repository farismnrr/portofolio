#!/bin/sh
set -e

echo "🚀 Starting Portfolio App"

# -------------------------------
# Optional Migrations
# -------------------------------
if [ "$RUN_MIGRATIONS" = "true" ] && [ "$CORE_DB_TYPE" = "postgres" ]; then
  echo "🔄 Running Database Migrations..."

  DATABASE_URL="postgres://${CORE_DB_USER}:${CORE_DB_PASS}@${CORE_DB_HOST}:${CORE_DB_PORT}/${CORE_DB_NAME}?sslmode=disable"

  echo "➡️ Migrating About domain..."
  ./migrate -path migration/about \
    -database "${DATABASE_URL}&x-migrations-table=about_schema_migrations" up

  echo "➡️ Migrating Interaction domain..."
  ./migrate -path migration/interaction \
    -database "${DATABASE_URL}&x-migrations-table=interaction_schema_migrations" up

  echo "✅ Migrations completed"
else
  echo "⏭️ Skipping migrations"
fi

# -------------------------------
# Generate Frontend Runtime Config
# -------------------------------
echo "🔧 Generating Frontend Runtime Configuration..."

cat <<EOF > public/runtime-config.js
window.config = {
  ssoUrl: "${NEXT_PUBLIC_SSO_URL:-$SSO_URL}",
  apiKey: "${NEXT_PUBLIC_API_KEY:-$API_KEY}",
  tenantId: "${NEXT_PUBLIC_TENANT_ID:-$TENANT_ID}",
  backendUrl: "${NEXT_PUBLIC_BACKEND_URL:-$BACKEND_URL}"
};
EOF

echo "✅ Runtime config ready"

# -------------------------------
# Start Services
# -------------------------------
echo "🚀 Starting Backend..."
./portfolio-backend-service &
BACKEND_PID=$!

echo "🚀 Starting Frontend..."
HOSTNAME=0.0.0.0 PORT=3000 node server.js &
FRONTEND_PID=$!

# -------------------------------
# Graceful Shutdown
# -------------------------------
shutdown() {
  echo "🛑 Shutting down services..."
  kill -TERM "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo "✅ Shutdown complete"
}

trap shutdown INT TERM

# -------------------------------
# Wait for processes
# -------------------------------
wait "$BACKEND_PID" "$FRONTEND_PID"
