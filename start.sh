#!/bin/bash

# PermBridge startup script - runs backend and frontend

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting PermBridge..."
echo ""

# Check if Docker containers are running
echo "Checking Docker containers..."
if ! docker compose ps 2>/dev/null | grep -q "permbridge-db"; then
  echo "Starting Docker containers..."
  docker compose up -d
  sleep 3
else
  echo "✓ Docker containers already running"
fi

# Run backend migrations if needed
echo ""
echo "Running database migrations..."
cd "$PROJECT_ROOT/backend"
npm run db:migrate

echo ""
echo "=========================================="
echo "✅ Backend ready on http://localhost:3001"
echo "✅ Frontend will be on http://localhost:5173"
echo "=========================================="
echo ""

# Start both servers in background
cd "$PROJECT_ROOT/backend"
echo "Starting backend..."
npm run dev &
BACKEND_PID=$!

cd "$PROJECT_ROOT/frontend"
echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers running!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Open http://localhost:5173 in your browser"
echo ""
echo "To stop: Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep script running
wait
