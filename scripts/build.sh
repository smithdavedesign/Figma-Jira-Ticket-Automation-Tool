#!/bin/bash

# Build script for the simplified Figma AI Ticket Generator

echo "🏗️  Building Figma AI Ticket Generator..."

# Build TypeScript plugin code
echo "📦 Compiling TypeScript plugin..."
npx tsc -p config/tsconfig.json

# Validate build artifacts
echo "🔍 Validating build artifacts..."
if [ ! -f "code.js" ]; then
    echo "❌ Error: code.js not found after TypeScript compilation"
    exit 1
fi

if [ ! -f "ui/index.html" ]; then
    echo "❌ Error: ui/index.html not found"
    exit 1
fi

if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found"
    exit 1
fi

echo "✅ All required Figma plugin files present"

echo "✅ Build complete!"
echo ""
echo "📁 Figma Plugin Files Ready:"
echo "   📋 manifest.json - Plugin configuration"
echo "   🧠 code.js - Plugin logic (compiled from TypeScript)"
echo "   🎨 ui/index.html - Plugin interface"
echo ""
echo "� Server Files Ready:"
echo "   🖥️  app/server.js - Express server"
echo "   🔧 All dependencies in app/ directory"
echo ""
echo "🧪 To test:"
echo "   1. Figma: Import manifest.json from root directory"
echo "   2. Server: Run 'node app/server.js' or 'npm start'"