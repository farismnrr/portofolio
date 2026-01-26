#!/bin/sh
set -e

echo "🚀 Starting Portfolio Backend Service..."

# Database configuration
DB_HOST="${CORE_DB_HOST:-postgres}"
DB_PORT="${CORE_DB_PORT:-5432}"
DB_USER="${CORE_DB_USER:-postgres}"
DB_PASS="${CORE_DB_PASS:-postgres}"
DB_NAME="${CORE_DB_NAME:-portfolio_db}"

# Wait for database to be ready
echo "⏳ Waiting for database at ${DB_HOST}:${DB_PORT}..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "✅ Database is up!"

# Run migrations
if [ "$CORE_DB_TYPE" = "postgres" ]; then
    DATABASE_URL="postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable&x-migrations-table="
    
    echo "⬆️  Running migrations for About domain..."
    migrate -path migration/about -database "${DATABASE_URL}about_schema_migrations" up
    
    echo "⬆️  Running migrations for Interaction domain..."
    migrate -path migration/interaction -database "${DATABASE_URL}interaction_schema_migrations" up
    
    echo "✅ Migrations completed"
fi

# Start the application
echo "🚀 Starting server..."
exec ./portfolio-backend-service
