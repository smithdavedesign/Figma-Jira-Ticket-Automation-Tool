#!/bin/bash

# Build script for the restructured Figma AI Ticket Generator

echo "🏗️  Building Figma AI Ticket Generator..."

# Clean dist directory
rm -rf dist
mkdir -p dist

# Build TypeScript
echo "📦 Compiling TypeScript..."
npx tsc -p config/tsconfig.json

# Copy UI assets to dist
echo "🎨 Copying UI assets..."
mkdir -p dist/ui
cp -r ui/plugin dist/ui/ 2>/dev/null || true
cp -r ui/components dist/ui/ 2>/dev/null || true
cp -r ui/test dist/ui/ 2>/dev/null || true
# Keep comprehensive ui/index.html as standalone version
cp ui/index.html dist/ui/standalone.html 2>/dev/null || true

# Inline CSS for Figma compatibility (if needed)
echo "🎨 Inlining CSS..."
# The HTML already has inline CSS, so this step is optional
echo "CSS already inlined in HTML file"

# Create distribution manifest (for packaging)
echo "📝 Creating distribution manifest..."
sed 's|ui/plugin/index.html|ui/plugin/index.html|g' manifest.json > dist/manifest.json

# Copy code.js to root for development (Figma expects it there)
echo "🔧 Setting up development files..."
if [ -f "dist/code.js" ]; then
    cp dist/code.js code.js
else
    echo "⚠️  dist/code.js not found, using existing code.js"
fi

# Final sync to ensure everything is up to date
echo "🔄 Final sync..."
./scripts/sync-dist.sh

echo "✅ Build complete!"
echo "📁 Output:"
echo "   🎯 FOR FIGMA TESTING:"
echo "      - manifest.json (Import this into Figma)"
echo "      - code.js (Plugin logic)"
echo "      - ui/plugin/ (Modular UI with separate JS/CSS files)"
echo ""
echo "   📦 FOR DISTRIBUTION:"
echo "      - dist/ (Complete package for publishing)"
echo "      - dist/ui/plugin/ (Built modular UI)"
echo "      - dist/ui/standalone.html (Comprehensive standalone UI)"
echo ""
echo "🧪 To test: Import manifest.json from root directory into Figma"