#!/bin/bash

# Build script for the restructured Figma AI Ticket Generator

echo "🏗️  Building Figma AI Ticket Generator..."

# Clean dist directory
rm -rf dist
mkdir -p dist

# Build TypeScript
echo "📦 Compiling TypeScript..."
npx tsc

# Copy UI assets to dist
echo "🎨 Copying UI assets..."
mkdir -p dist/ui
cp ui/index.html dist/ui/
cp -r ui/components/ dist/ui/ 2>/dev/null || true
cp -r ui/plugin/ dist/ui/ 2>/dev/null || true
cp -r ui/test/ dist/ui/ 2>/dev/null || true

# Inline CSS for Figma compatibility (if needed)
echo "🎨 Inlining CSS..."
# The HTML already has inline CSS, so this step is optional
echo "CSS already inlined in HTML file"

# Create distribution manifest (for packaging)
echo "📝 Creating distribution manifest..."
sed 's|dist/ui/index.html|ui/index.html|g' manifest.json > dist/manifest.json

# Copy code.js to root for development (Figma expects it there)
echo "🔧 Setting up development files..."
cp dist/code.js code.js

echo "✅ Build complete!"
echo "📁 Output:"
echo "   🎯 FOR FIGMA TESTING:"
echo "      - manifest.json (Import this into Figma)"
echo "      - code.js (Plugin logic)"
echo "      - dist/ui/ (Built UI with inlined CSS)"
echo ""
echo "   📦 FOR DISTRIBUTION:"
echo "      - dist/ (Complete package for publishing)"
echo ""
echo "🧪 To test: Import manifest.json from root directory into Figma"