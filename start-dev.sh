#!/bin/bash
set -e

# Function to cleanup
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

# We use /app/.dev_data for the volume mount
DEV_DATA="/app/.dev_data"
echo "🔗 Preparing Dev Cache in $DEV_DATA..."
mkdir -p "$DEV_DATA/node_modules" "$DEV_DATA/next" "$DEV_DATA/go-build" "$DEV_DATA/go-mod" "$DEV_DATA/backend-tmp"

# --- Go (Backend) Symlinking ---
echo "🔗 Linking Go Cache and Temp directories..."

# Link Go Build Cache
mkdir -p /root/.cache
ln -sfn "$DEV_DATA/go-build" /root/.cache/go-build

# Link Go Mod Cache
mkdir -p /go/pkg
ln -sfn "$DEV_DATA/go-mod" /go/pkg/mod

# Link Backend Temp (used by Air)
BACKEND_DIR="services/Portfolio-Backend-Service"
mkdir -p "$BACKEND_DIR"
ln -sfn /app/.dev_data/backend-tmp "/app/$BACKEND_DIR/tmp"

# Link .env for Backend
ln -sfn /app/.env.dev "/app/$BACKEND_DIR/.env"

# Start Backend with Air (Go hot reloading)
echo "🚀 Starting Backend (Go with Air)..."
cd "$BACKEND_DIR"
air &
BACKEND_PID=$!
cd ../..

# --- Node.js (Frontend) Symlinking ---
echo "🔗 Linking Node.js and Next.js directories..."
for dir in node_modules .next; do
    target_name="${dir#.}"
    target_dir="$DEV_DATA/$target_name"
    
    # If it's a directory but not a link, migrate content
    if [ -d "$dir" ] && [ ! -L "$dir" ]; then
        echo "📦 Migrating $dir content to volume..."
        cp -au "$dir/." "$target_dir/"
        rm -rf "$dir"
    fi
    
    # Ensure it is a link pointing to the volume target
    ln -sfn ".dev_data/$target_name" "$dir"
done

# Check if dependencies are installed in the volume
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "📦 Installing dependencies into volume..."
    npm install --no-audit --no-fund
fi

export NODE_PATH=/app/node_modules

echo "🚀 Starting Frontend App (Next.js Dev)..."
# Double check the .next/dev target exists before starting
mkdir -p "$DEV_DATA/next/dev"
PORT=3000 exec npx next dev --turbopack
