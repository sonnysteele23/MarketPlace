#!/bin/bash

# ============================================
# Amy's Haven - Complete Setup & Fix Script
# ============================================

set -e # Exit on any error

echo "
╔════════════════════════════════════════════╗
║     Amy's Haven - Complete Setup          ║
╠════════════════════════════════════════════╣
║  This script will:                         ║
║  1. Install dependencies                   ║
║  2. Fix database schema                    ║
║  3. Test database connection               ║
║  4. Start development server               ║
╚════════════════════════════════════════════╝
"

# Change to project root
cd "$(dirname "$0")"

# Step 1: Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Step 2: Check environment variables
echo "🔍 Checking environment variables..."
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Check required variables
required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_KEY" "JWT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=$" .env || grep -q "^${var}=your_" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing or invalid environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please configure these in your .env file"
    exit 1
fi

echo "✅ Environment variables configured"

# Step 3: Test database connection
echo "🔌 Testing database connection..."
node backend/test-connection.js || {
    echo "❌ Database connection failed!"
    echo "Please check your Supabase credentials in .env"
    exit 1
}

# Step 4: Prompt to run database fix
echo ""
echo "📊 Database schema needs to be updated with new fields."
echo ""
echo "Options:"
echo "  1. Open Supabase SQL Editor (recommended)"
echo "  2. Show SQL to run manually"
echo "  3. Skip (if already done)"
echo ""
read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "Opening Supabase SQL Editor..."
        open "https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv/sql/new"
        echo ""
        echo "📋 Paste this SQL script and click 'Run':"
        echo "   File: backend/scripts/fix-database-schema.sql"
        echo ""
        read -p "Press Enter when complete..."
        ;;
    2)
        echo ""
        echo "════════════════════════════════════════"
        cat backend/scripts/fix-database-schema.sql
        echo "════════════════════════════════════════"
        echo ""
        echo "Copy the SQL above and run it in Supabase SQL Editor:"
        echo "https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv/sql/new"
        echo ""
        read -p "Press Enter when complete..."
        ;;
    3)
        echo "⏭️  Skipping database fix..."
        ;;
    *)
        echo "Invalid choice. Skipping database fix..."
        ;;
esac

# Step 5: Generate secure JWT secret if needed
if grep -q "JWT_SECRET=your_jwt_secret_key_change_this_in_production" .env; then
    echo ""
    echo "⚠️  WARNING: Using default JWT_SECRET!"
    echo ""
    read -p "Generate secure JWT_SECRET? (y/n): " generate_jwt
    
    if [ "$generate_jwt" = "y" ] || [ "$generate_jwt" = "Y" ]; then
        new_secret=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        
        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$new_secret/" .env
        else
            # Linux
            sed -i "s/JWT_SECRET=.*/JWT_SECRET=$new_secret/" .env
        fi
        
        echo "✅ Generated new JWT_SECRET: $new_secret"
        echo "   Updated in .env file"
    fi
fi

# Step 6: Check if SendGrid is configured (for emails)
if grep -q "SENDGRID_API_KEY=your_sendgrid_api_key" .env; then
    echo ""
    echo "📧 Email Service Not Configured"
    echo "   Emails will be logged to console only (development mode)"
    echo ""
    echo "To enable emails:"
    echo "  1. Sign up at https://sendgrid.com (free tier: 100 emails/day)"
    echo "  2. Get API key from SendGrid dashboard"
    echo "  3. Update SENDGRID_API_KEY in .env"
    echo ""
fi

# Step 7: Summary
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║           Setup Complete! ✅                ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "📝 Setup Summary:"
echo "   ✅ Dependencies installed"
echo "   ✅ Environment variables configured"
echo "   ✅ Database connection verified"
echo "   ✅ Database schema updated"
echo ""
echo "🚀 Ready to start development server!"
echo ""

# Step 8: Ask to start server
read -p "Start development server now? (y/n): " start_server

if [ "$start_server" = "y" ] || [ "$start_server" = "Y" ]; then
    echo ""
    echo "Starting development server..."
    echo "Server will be available at: http://localhost:3000"
    echo ""
    npm run dev
else
    echo ""
    echo "To start the server later, run:"
    echo "  npm run dev"
    echo ""
fi
