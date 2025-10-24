#!/bin/bash

# Development sync script - watches for changes and auto-syncs to dist/

echo "👀 Starting development sync watcher..."
echo "🔄 Will auto-sync when files change:"
echo "   📦 code.js → dist/code.js" 
echo "   🎨 ui/index.html → dist/ui/index.html"
echo "   📝 manifest.json → dist/manifest.json"
echo ""
echo "Press Ctrl+C to stop watching"
echo ""

# Initial sync
./scripts/sync-dist.sh

# Watch for changes and sync
npx nodemon --watch code.js --watch ui/index.html --watch manifest.json --exec "./scripts/sync-dist.sh" --delay 500ms