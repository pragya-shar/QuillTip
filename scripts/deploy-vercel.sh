#!/bin/bash

# Vercel deployment script with pre-deployment checks
# Usage: ./scripts/deploy-vercel.sh

set -e

echo "🚀 Starting Vercel deployment process..."

# Check if required tools are installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  You have uncommitted changes. It's recommended to commit them first."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if .env.local exists for local testing
if [[ ! -f .env.local ]]; then
    echo "⚠️  .env.local not found. Make sure your environment variables are set in Vercel dashboard."
fi

# Verify database connection
echo "📊 Checking database connection..."
if command -v npx &> /dev/null; then
    npx prisma db push --skip-generate || {
        echo "⚠️  Database connection check failed. Make sure DATABASE_URL is correct."
    }
fi

# Build the project locally to catch any build errors
echo "🔨 Testing local build..."
npm run build || {
    echo "❌ Local build failed. Fix the errors before deploying."
    exit 1
}

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

# Deploy to preview first
echo "Deploying to preview environment..."
vercel --prod=false

echo "✅ Preview deployment successful!"
echo ""
echo "🎯 To deploy to production, run:"
echo "vercel --prod"
echo ""
echo "📋 After deployment, test these URLs:"
echo "- /{username} (profile pages)"
echo "- /{username}/{slug} (article pages)"  
echo "- /api/health (health check)"
echo ""
echo "🐛 If you encounter 404 errors:"
echo "1. Check Vercel function logs: vercel logs"
echo "2. Verify environment variables in Vercel dashboard"
echo "3. Test routes locally with: node scripts/test-routes.js"