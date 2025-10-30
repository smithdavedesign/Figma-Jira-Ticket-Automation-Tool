#!/bin/bash

# Cleanup Script - Remove Redundant Build Artifacts
# Simplifies project structure for single Figma Desktop target

echo "🧹 Cleaning up redundant build artifacts..."

# Confirm with user
read -p "This will remove dist/ and production-bundle/ directories. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

# Remove redundant directories
echo "🗑️  Removing dist/ directory..."
rm -rf dist/

echo "🗑️  Removing production-bundle/ directory..."
rm -rf production-bundle/

# Remove redundant scripts
echo "🗑️  Removing complex build scripts..."
rm -f scripts/bundle-production.sh
rm -f scripts/sync-dist.sh

# Keep these essential files in root:
echo "✅ Keeping essential files:"
echo "   📁 ui/index.html (Single UI file)"
echo "   📄 code.js (Compiled plugin logic)"
echo "   📄 manifest.json (Original manifest)"
echo "   📄 manifest-simple.json (Simplified manifest)"

# Update package.json scripts
echo "📝 You may want to update package.json scripts to use:"
echo "   'build': './scripts/build-simple.sh'"
echo ""

echo "✅ Cleanup complete!"
echo "📁 Simplified structure:"
echo "   🎯 For Figma Desktop: Use manifest-simple.json"
echo "   🏗️  To build: ./scripts/build-simple.sh"
echo "   🧪 To test: Import manifest-simple.json into Figma"