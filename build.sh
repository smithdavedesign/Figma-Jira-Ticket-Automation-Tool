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
cp -r src/ui/* dist/ui/

# Inline CSS for Figma compatibility
echo "🎨 Inlining CSS..."
# Read the CSS content and escape it for sed
CSS_CONTENT=$(cat src/ui/styles/main.css | sed 's/\\/\\\\/g' | sed 's/&/\\&/g')
# Replace the link tag with inline styles
sed -i.bak "s|<link rel=\"stylesheet\" href=\"styles/main.css\">|<style>\n$CSS_CONTENT\n</style>|" dist/ui/index.html
rm -f dist/ui/index.html.bak

# Update manifest to point to correct relative paths for distribution
echo "📝 Creating distribution manifest..."
sed 's|dist/ui/index.html|ui/index.html|g' manifest.json > dist/manifest.json

# Copy code.js to root for development (Figma expects it there)
echo "🔧 Setting up development files..."
cp dist/code.js code.js

echo "✅ Build complete!"
echo "📁 Output:"
echo "   - dist/code.js (Plugin code)"
echo "   - dist/ui/ (UI assets)"
echo "   - dist/manifest.json (Distribution manifest)"
echo "   - code.js (Development code copy)"
echo "   - manifest.json (Development manifest pointing to dist/ui/)"
echo ""
echo "🧪 For Figma testing: Import manifest.json from root directory"