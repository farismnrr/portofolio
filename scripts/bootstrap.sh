#!/bin/bash
set -e

# Change directory to the root of the project if script is run from elsewhere
cd "$(dirname "$0")/.."

# Load environment variables
if [ -f .env.dev ]; then
    export $(grep -v '^#' .env.dev | xargs)
else
    echo "❌ .env.dev not found. Please run 'make check-env' first."
    exit 1
fi

# Check for dependencies
if ! command -v jq &> /dev/null; then
    echo "❌ 'jq' is not installed. Please install it to continue."
    exit 1
fi

echo "🔍 Checking if environment is fresh..."

# Check which database exists
DB_NAME="$UM_DB_NAME"
# Try to find a database that actually exists
EXISTING_DBS=$(docker exec postgres-sql psql -U $CORE_DB_USER -d postgres -t -c "SELECT datname FROM pg_database;" 2>/dev/null || echo "")

if ! echo "$EXISTING_DBS" | grep -qw "$DB_NAME"; then
    echo "⚠️  Database $DB_NAME not found, checking $CORE_DB_NAME instead..."
    DB_NAME="$CORE_DB_NAME"
fi

# Check if tenants table exists and has any data
TENANT_COUNT=$(docker exec postgres-sql psql -U $CORE_DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM tenants;" 2>/dev/null | tr -d '[:space:]' || echo "error")

if [ "$TENANT_COUNT" == "0" ]; then
    echo "🌱 Fresh environment detected! Bootstrapping..."
    sleep 2 # Give other services a moment to start binding ports if running concurrently

    # 1. Start Auth service in background (if not already running and not in wait-only mode)
    if [ "$BOOTSTRAP_WAIT_ONLY" != "true" ] && ! lsof -i:5500 > /dev/null 2>&1; then
        echo "🚀 Starting Auth service for bootstrapping..."
        cd services/Multitenant-User-Management-Service
        
        # Check if binary exists, if not build it
        if [ ! -f ./target/debug/user-auth-plugin ]; then
            echo "🔨 Building Auth service..."
            cargo build > /dev/null 2>&1
        fi

        # Run in background
        ./target/debug/user-auth-plugin > /dev/null 2>&1 &
        AUTH_PID=$!
        cd ../..
    else
        if [ "$BOOTSTRAP_WAIT_ONLY" == "true" ]; then
            echo "⏳ Wait-only mode enabled, waiting for external Auth service on port 5500..."
        else
            echo "🌐 Auth service already running on port 5500, using existing instance..."
        fi
        AUTH_PID=""
    fi

    # 2. Wait for Auth service to be ready
    MAX_RETRIES=120 # Increased timeout for slow builds/starts
    COUNT=0
    echo "⏳ Waiting for Auth service to respond..."
    while ! curl -s http://localhost:5500/health > /dev/null; do
        sleep 2 # Check every 2 seconds
        COUNT=$((COUNT+2))
        if [ $COUNT -ge $MAX_RETRIES ]; then
            echo "❌ Auth service failed to respond on port 5500 after ${MAX_RETRIES}s"
            if [ -n "$AUTH_PID" ]; then
                kill $AUTH_PID 2>/dev/null || true
            fi
            exit 1
        fi
    done

    # 3. Create Tenant
    echo "🏢 Creating default tenant..."
    RESPONSE=$(curl -s -X POST http://localhost:5500/api/tenants \
        -H "Content-Type: application/json" \
        -H "X-Tenant-Secret-Key: $TENANT_SECRET_KEY" \
        -d '{"name":"Default Tenant"}')

    TENANT_ID=$(echo $RESPONSE | jq -r '.data.tenant_id // empty')
    API_KEY=$(echo $RESPONSE | jq -r '.data.api_key // empty')

    if [ -z "$TENANT_ID" ]; then
        echo "❌ Failed to create tenant: $RESPONSE"
        kill $AUTH_PID 2>/dev/null || true
        exit 1
    fi

    # 4. Update .env.dev
    echo "📝 Updating .env.dev with NEW TENANT_ID and API_KEY..."
    # Update TENANT_ID
    if grep -q "^TENANT_ID=" .env.dev; then
        sed -i "s/^TENANT_ID=.*/TENANT_ID=$TENANT_ID/" .env.dev
    else
        echo "TENANT_ID=$TENANT_ID" >> .env.dev
    fi

    # Update API_KEY
    if grep -q "^API_KEY=" .env.dev; then
        sed -i "s/^API_KEY=.*/API_KEY=$API_KEY/" .env.dev
    else
        echo "API_KEY=$API_KEY" >> .env.dev
    fi

    # 5. Create Invitation Code
    echo "🎟️ Generating invitation code..."
    INVITE_RESPONSE=$(curl -s -X POST http://localhost:5500/auth/internal/invitations \
        -H "X-Tenant-Secret-Key: $TENANT_SECRET_KEY")
    INVITE_CODE=$(echo $INVITE_RESPONSE | jq -r '.code // empty')

    echo "=========================================="
    echo "✅ Bootstrapping complete!"
    echo "🏢 Tenant ID: $TENANT_ID"
    echo "🔑 API Key: $API_KEY"
    echo "🎟️ Invitation Code: $INVITE_CODE"
    echo "=========================================="

    # 6. Cleanup
    if [ -n "$AUTH_PID" ]; then
        kill $AUTH_PID 2>/dev/null || true
        # Wait a bit for the port to be released
        sleep 2
    fi
else
    if [ "$TENANT_COUNT" == "error" ]; then
        echo "⚠️  Could not check tenant count (database might still be starting). Skipping bootstrap."
    else
        echo "✅ Environment is already set up (Tenants found: $TENANT_COUNT)"
    fi
fi
