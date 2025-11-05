#!/bin/bash

# Fix API Key Environment Variable Issue
# This script ensures the correct API key is used by unsetting the system override

echo "🔧 Fixing API Key Environment..."

# Unset the invalid system environment variable
unset GEMINI_API_KEY

# Verify it's unset
if [ -z "$GEMINI_API_KEY" ]; then
    echo "✅ Invalid system GEMINI_API_KEY unset successfully"
else
    echo "⚠️  System GEMINI_API_KEY still set: $GEMINI_API_KEY"
fi

# Show what will be loaded from .env
if [ -f ".env" ]; then
    echo "📄 .env file contains:"
    grep "GEMINI_API_KEY" .env || echo "❌ No GEMINI_API_KEY found in .env"
else
    echo "❌ No .env file found"
fi

echo "🎯 Environment fixed - ready to run with correct API key"