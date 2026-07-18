#!/bin/bash

# PermBridge Database Setup Script
# This script creates the PostgreSQL database and runs migrations

set -e

echo "🔧 PermBridge Database Setup"
echo "=============================="

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo "✓ Loaded .env file"
else
  echo "✗ .env file not found. Please create it from .env.example"
  exit 1
fi

# Extract database connection details
DB_URL=${DATABASE_URL}
DB_NAME="permbridge"
DB_USER="permbridge_user"
DB_PASSWORD="permbridge_password"
DB_HOST="localhost"
DB_PORT="5432"

echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if PostgreSQL is running
echo "📡 Checking PostgreSQL connection..."
if ! command -v psql &> /dev/null; then
  echo "✗ psql not found. Please install PostgreSQL."
  exit 1
fi

# Create database if it doesn't exist
echo "📦 Creating database..."
psql -h $DB_HOST -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME"
echo "✓ Database ready"

# Run migrations
echo ""
echo "🚀 Running migrations..."
npm run db:migrate

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the backend: npm run dev"
echo "  2. Connect a Salesforce org via the web app"
echo "  3. Run your first sync!"
