#!/bin/sh
set -e

# Start Backend in the background
# Start Backend in the background
echo "🚀 Starting Backend Service..."

# Run Migrations
echo "🔄 Running Database Migrations..."
if [ "$CORE_DB_TYPE" = "postgres" ]; then
    DATABASE_URL="postgres://$CORE_DB_USER:$CORE_DB_PASS@$CORE_DB_HOST:$CORE_DB_PORT/$CORE_DB_NAME?sslmode=disable&x-migrations-table="
    
    echo "Migrating About domain..."
    ./migrate -path migration/about -database "${DATABASE_URL}about_schema_migrations" up
    
    echo "Migrating Interaction domain..."
    ./migrate -path migration/interaction -database "${DATABASE_URL}interaction_schema_migrations" up
fi

./portfolio-backend-service &
BACKEND_PID=$!

# Generate Frontend Runtime Configuration
echo "🔧 Generating Frontend Runtime Configuration..."
cat <<EOF > public/runtime-config.js
window.config = {
  ssoUrl: "${NEXT_PUBLIC_SSO_URL:-$SSO_URL}",
  apiKey: "${NEXT_PUBLIC_API_KEY:-$API_KEY}",
  tenantId: "${NEXT_PUBLIC_TENANT_ID:-$TENANT_ID}",
  backendUrl: "${NEXT_PUBLIC_BACKEND_URL:-$BACKEND_URL}"
};
EOF
echo "✅ Runtime configuration generated in public/runtime-config.js"

# Start Frontend in the foreground (or background and wait for both)
echo "🚀 Starting Frontend App..."
# Next.js standalone server
HOSTNAME=0.0.0.0 PORT=3000 node server.js &
FRONTEND_PID=$!

# Signal handler to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
