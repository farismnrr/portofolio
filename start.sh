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

# Wait for backend to be ready (optional, but good practice)
# sleep 5

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
