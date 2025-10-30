#!/bin/bash

# Simplified Build Script for Figma Desktop Plugin
# Single purpose: Build for Figma Desktop usage

echo "🏗️  Building Figma Plugin (Simplified)..."

# Build TypeScript to code.js
echo "📦 Compiling TypeScript..."
npx tsc -p config/tsconfig.json

# Copy compiled code.js to root (where Figma expects it)
if [ -f "dist/code.js" ]; then
    cp dist/code.js code.js
    echo "✅ code.js ready for Figma"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Verify manifest.json points to the right UI file 
echo "📝 Verifying manifest..."
if [ -f "manifest.json" ]; then
    echo "✅ manifest.json ready"
else
    echo "❌ manifest.json missing"
    exit 1
fi

# Verify UI exists
if [ -f "ui/index.html" ]; then
    echo "✅ ui/index.html ready"
else
    echo "❌ ui/index.html missing"
    exit 1
fi

echo "✅ Build complete!"
echo "📁 Files ready for Figma Desktop:"
echo "   🎯 manifest.json (Import this into Figma)"
echo "   🎯 code.js (Plugin logic)"
echo "   🎯 ui/index.html (Plugin UI)"
echo ""
echo "🧪 To test: Import manifest.json into Figma Desktop"
echo "📱 This build is optimized for Figma Desktop application only"