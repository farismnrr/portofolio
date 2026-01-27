#!/bin/sh
set -e

# Start Backend in the background
echo "🚀 Starting Backend Service..."
./portfolio-backend-service &
BACKEND_PID=$!

# Wait for backend to be ready (optional, but good practice)
# sleep 5

# Start Frontend in the foreground (or background and wait for both)
echo "🚀 Starting Frontend App..."
# Next.js standalone server
PORT=3000 node server.js &
FRONTEND_PID=$!

# Signal handler to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
