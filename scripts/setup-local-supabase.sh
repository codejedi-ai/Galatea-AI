#!/bin/bash

# Complete Developer Environment Setup Script for Galatea AI
# This script sets up the complete local development environment

set -e

echo "🚀 Starting complete developer environment setup..."
echo ""

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 22.x and try again."
  exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install npm and try again."
  exit 1
fi
echo "✅ npm found: $(npm --version)"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi
echo "✅ Docker is running"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "📦 Supabase CLI not found. Will use npx to run it..."
  SUPABASE_CMD="npx supabase"
else
  echo "✅ Supabase CLI found"
  SUPABASE_CMD="supabase"
fi

echo ""

# Step 2: Install npm dependencies
echo "📦 Installing npm dependencies..."
if [ ! -d "node_modules" ]; then
  npm install
  echo "✅ Dependencies installed"
else
  echo "✅ Dependencies already installed (node_modules exists)"
fi

echo ""

# Step 3: Set up environment file
echo "🔧 Setting up environment configuration..."
if [ ! -f ".env.local" ]; then
  if [ -f "env.example" ]; then
    cp env.example .env.local
    echo "✅ Created .env.local from env.example"
    echo "⚠️  Please update .env.local with your OpenAI API key and other required values"
  else
    echo "⚠️  env.example not found. Please create .env.local manually"
  fi
else
  echo "✅ .env.local already exists"
fi

echo ""

# Step 4: Set up shared Supabase backend
echo "🗄️  Setting up shared Supabase backend..."
SUPABASE_DIR="../Galatea-AI-Supabase"
if [ ! -d "$SUPABASE_DIR" ]; then
  echo "❌ Shared Supabase backend not found at $SUPABASE_DIR"
  echo "   Please ensure Galatea-AI-Supabase directory exists"
  exit 1
fi

cd "$SUPABASE_DIR"

# Check if Supabase is initialized
if [ ! -f "config.toml" ]; then
  echo "📝 Initializing Supabase project..."
  $SUPABASE_CMD init
  echo "✅ Supabase project initialized"
else
  echo "✅ Supabase project already initialized"
fi

echo ""

# Step 5: Start Supabase services and apply migrations
echo "🔄 Starting Supabase services..."
$SUPABASE_CMD start

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""

# Step 6: Apply migrations automatically (create all tables)
echo "🗃️  Applying database migrations (creating tables)..."
if $SUPABASE_CMD db reset; then
  echo "✅ Database tables created successfully"
else
  echo "⚠️  Could not apply migrations automatically. Please run 'supabase db reset' manually."
  exit 1
fi

echo ""

# Step 7: Display Supabase status and connection info
echo "📊 Supabase Status:"
$SUPABASE_CMD status

# Return to original directory
cd - > /dev/null

echo ""
echo "✅ Complete developer environment setup finished!"
echo ""
echo "📝 Next steps:"
echo "1. Update .env.local with your OpenAI API key (required for AI features)"
echo "2. Run 'npm run dev' to start the Next.js development server"
echo "3. Access Supabase Studio at http://127.0.0.1:54323 to manage your database"
echo ""
echo "🌐 Access points:"
echo "   - API URL: http://127.0.0.1:54321"
echo "   - Studio URL: http://127.0.0.1:54323"
echo "   - Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo "   - Inbucket (Email): http://127.0.0.1:54324"
echo ""
echo "💡 All database tables have been created automatically from migrations."
echo "💡 Supabase backend is managed in: Galatea-AI-Supabase/"
echo ""

