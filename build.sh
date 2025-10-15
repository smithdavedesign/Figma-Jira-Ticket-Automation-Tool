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
cp -r ui/plugin/* dist/ui/

# Inline CSS for Figma compatibility
echo "🎨 Inlining CSS..."
# Use a more robust method to inline CSS
node -e "
const fs = require('fs');
const css = fs.readFileSync('ui/plugin/styles/main.css', 'utf8');
let html = fs.readFileSync('dist/ui/index.html', 'utf8');
html = html.replace('<link rel=\"stylesheet\" href=\"styles/main.css\">', \`<style>\${css}</style>\`);
fs.writeFileSync('dist/ui/index.html', html);
"

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