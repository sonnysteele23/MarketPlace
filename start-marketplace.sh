#!/bin/bash

echo "🚀 Washington Artisan Marketplace - Emergency Startup"
echo "======================================================"
echo ""

# Change to project directory
cd "$(dirname "$0")"

# Kill port 5000
echo "1️⃣ Killing any process on port 5000..."
npx kill-port 5000 2>/dev/null || echo "   (No process found on port 5000)"
sleep 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "2️⃣ Installing dependencies..."
    npm install
else
    echo "2️⃣ Dependencies already installed ✅"
fi

# Run diagnostic
echo ""
echo "3️⃣ Running diagnostics..."
echo ""
node backend/test-server.js
