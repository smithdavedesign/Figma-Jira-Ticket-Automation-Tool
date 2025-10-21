#!/bin/bash

# Quick Plugin Configuration Switcher
# Switches between direct server connection and monitoring proxy

echo "🔧 Figma Plugin Configuration Switcher"
echo "======================================"

UI_FILE="ui/index.html"
BACKUP_FILE="ui/index.html.backup"

if [ "$1" = "monitor" ]; then
    echo "🔍 Configuring for MONITORING mode (port 3001)..."
    
    # Backup original if not exists
    if [ ! -f "$BACKUP_FILE" ]; then
        cp "$UI_FILE" "$BACKUP_FILE"
        echo "✅ Created backup: $BACKUP_FILE"
    fi
    
    # Replace localhost:3000 with localhost:3001
    sed -i '' 's/localhost:3000/localhost:3001/g' "$UI_FILE"
    
    echo "✅ Plugin configured for monitoring"
    echo "📊 Requests will be logged via HTTP Request Logger"
    echo "🚀 Rebuild and reimport plugin to Figma"
    
elif [ "$1" = "direct" ]; then
    echo "🎯 Configuring for DIRECT mode (port 3000)..."
    
    if [ -f "$BACKUP_FILE" ]; then
        cp "$BACKUP_FILE" "$UI_FILE"
        echo "✅ Restored from backup"
    else
        # Replace localhost:3001 with localhost:3000
        sed -i '' 's/localhost:3001/localhost:3000/g' "$UI_FILE"
        echo "✅ Plugin configured for direct connection"
    fi
    
    echo "🎯 Requests will go directly to MCP server"
    echo "🚀 Rebuild and reimport plugin to Figma"
    
else
    echo "Usage:"
    echo "  $0 monitor   # Configure for monitoring (port 3001)"
    echo "  $0 direct    # Configure for direct connection (port 3000)"
    echo ""
    echo "Current configuration:"
    if grep -q "localhost:3001" "$UI_FILE"; then
        echo "  📊 MONITORING mode (port 3001)"
    else
        echo "  🎯 DIRECT mode (port 3000)"
    fi
fi