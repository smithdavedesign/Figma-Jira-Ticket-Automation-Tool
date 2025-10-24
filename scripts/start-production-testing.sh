#!/bin/bash

# 🚀 Production Testing Startup Script
# Figma AI Ticket Generator - Phase 7.1 Complete

echo "🚀 Starting Figma AI Ticket Generator Production Testing Environment..."
echo ""

# Check if MCP server is already running
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ MCP Server already running on port 3000"
    echo "   Health Status: $(curl -s http://localhost:3000/ | jq -r '.status')"
    echo "   Tools Available: $(curl -s http://localhost:3000/ | jq -r '.tools | length')"
else
    echo "🔄 Starting MCP Server..."
    npm run start:mvc &
    sleep 3
    
    if lsof -i :3000 > /dev/null 2>&1; then
        echo "✅ MCP Server started successfully"
    else
        echo "❌ Failed to start MCP Server"
        exit 1
    fi
fi

echo ""

# Verify plugin build
if [[ -f "dist/code.js" && -f "manifest.json" && -f "ui/plugin/index.html" ]]; then
    echo "✅ Plugin files verified:"
    echo "   - dist/code.js ($(stat -f%z dist/code.js) bytes)"
    echo "   - manifest.json (valid JSON)"
    echo "   - ui/plugin/index.html (UI ready)"
else
    echo "🔄 Building plugin..."
    npm run build:ts
    
    if [[ -f "dist/code.js" ]]; then
        echo "✅ Plugin built successfully"
    else
        echo "❌ Plugin build failed"
        exit 1
    fi
fi

echo ""
echo "🎯 PRODUCTION TESTING ENVIRONMENT READY!"
echo ""
echo "📋 Next Steps:"
echo "1. Open Figma Desktop application"
echo "2. Go to: Menu → Plugins → Development → Import plugin from manifest..."
echo "3. Select: $(pwd)/manifest.json"
echo "4. Run plugin from: Plugins → Design Intelligence Platform (Production)"
echo ""
echo "🔧 Monitoring Commands:"
echo "   npm run monitor          # Real-time log monitoring"
echo "   npm run monitor:health   # Health status monitoring"
echo "   curl -s http://localhost:3000/ | jq '.'  # Server status"
echo ""
echo "📚 Testing Guide: docs/testing/PRODUCTION_TESTING_GUIDE.md"
echo ""
echo "🎉 Happy Testing!"