#!/bin/bash

# Sync script to keep dist/ and source files in sync
# This ensures Figma plugin always uses the latest code

echo "🔄 Syncing source files to dist..."

# Create dist directory if it doesn't exist
mkdir -p dist/ui

# Sync main plugin code
echo "📦 Syncing code.js..."
cp code.js dist/code.js
echo "   ✅ code.js synced"

# Sync UI files
echo "🎨 Syncing UI files..."
cp ui/index.html dist/ui/index.html
echo "   ✅ ui/index.html synced"

# Sync manifest
echo "📝 Syncing manifest..."
cp manifest.json dist/manifest.json
echo "   ✅ manifest.json synced"

# Optional: Sync other UI components if they exist
if [ -d "ui/components" ]; then
    cp -r ui/components dist/ui/
    echo "   ✅ ui/components/ synced"
fi

if [ -d "ui/plugin" ]; then
    cp -r ui/plugin dist/ui/
    echo "   ✅ ui/plugin/ synced"
fi

# Show sync status
echo ""
echo "✅ Sync complete!"
echo "📁 Files synced:"
echo "   🎯 code.js → dist/code.js"
echo "   🎨 ui/index.html → dist/ui/index.html"
echo "   📝 manifest.json → dist/manifest.json"
echo ""
echo "🔌 Figma plugin ready to test!"
echo "   Import: manifest.json (points to dist/ files)"