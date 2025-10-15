#!/bin/bash

# 🚀 Gemini AI Setup Script - FREE Google AI Integration
# This script helps you set up Google Gemini for free AI-powered design analysis

echo "🤖 Setting up FREE Google Gemini AI Integration"
echo "=" * 50

# Check if GEMINI_API_KEY is already set
if [ ! -z "$GEMINI_API_KEY" ]; then
    echo "✅ Gemini API key is already configured!"
    echo "   Testing connection..."
    
    # Test the API key
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$GEMINI_API_KEY" \
        -H "Content-Type: application/json" \
        -d '{"contents":[{"parts":[{"text":"test"}]}],"generationConfig":{"maxOutputTokens":1}}')
    
    if [ "$response" = "200" ]; then
        echo "🎉 Gemini API is working perfectly!"
    else
        echo "⚠️ Gemini API key may be invalid (HTTP $response)"
    fi
else
    echo "🔑 No Gemini API key found. Setting up FREE tier..."
    echo
    echo "📋 Follow these steps to get your FREE Gemini API key:"
    echo
    echo "1️⃣ Visit: https://makersuite.google.com/app/apikey"
    echo "2️⃣ Sign in with your Google account"
    echo "3️⃣ Click 'Create API Key'"
    echo "4️⃣ Copy the generated API key"
    echo
    echo "💰 FREE TIER LIMITS (very generous):"
    echo "   • 60 requests per minute"
    echo "   • 100,000 tokens per day"
    echo "   • No credit card required!"
    echo
    echo "🔒 SECURITY: Keep your API key private!"
    echo
    
    # Prompt for API key
    echo -n "📝 Paste your Gemini API key here (or press Enter to skip): "
    read -r api_key
    
    if [ ! -z "$api_key" ]; then
        # Add to environment (for current session)
        export GEMINI_API_KEY="$api_key"
        
        # Add to shell profile for persistence
        shell_profile=""
        if [ -f "$HOME/.zshrc" ]; then
            shell_profile="$HOME/.zshrc"
        elif [ -f "$HOME/.bashrc" ]; then
            shell_profile="$HOME/.bashrc"
        elif [ -f "$HOME/.bash_profile" ]; then
            shell_profile="$HOME/.bash_profile"
        fi
        
        if [ ! -z "$shell_profile" ]; then
            echo "export GEMINI_API_KEY=\"$api_key\"" >> "$shell_profile"
            echo "✅ Added GEMINI_API_KEY to $shell_profile"
            echo "   Restart your terminal or run: source $shell_profile"
        fi
        
        # Test the API key
        echo "🧪 Testing your API key..."
        response=$(curl -s -w "%{http_code}" -o /dev/null \
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$api_key" \
            -H "Content-Type: application/json" \
            -d '{"contents":[{"parts":[{"text":"Hello"}]}],"generationConfig":{"maxOutputTokens":5}}')
        
        if [ "$response" = "200" ]; then
            echo "🎉 SUCCESS! Gemini AI is now configured and working!"
        else
            echo "❌ API key test failed (HTTP $response)"
            echo "   Please check your API key and try again"
        fi
    else
        echo "⏭️ Skipping API key setup"
        echo "   You can set it later with: export GEMINI_API_KEY='your-key'"
    fi
fi

echo
echo "🚀 AI Service Priority (when configured):"
echo "   1. 🆓 Google Gemini (FREE) - Your primary AI service"
echo "   2. 🤖 Claude (Paid) - Premium fallback"  
echo "   3. 🧠 GPT-4 (Paid) - Final fallback"
echo "   4. 📄 Standard Generation - Always works"
echo
echo "✨ What you get with Gemini (FREE):"
echo "   • 🖼️ Design screenshot analysis"
echo "   • 🎨 Component identification"
echo "   • 📋 Intelligent document generation"
echo "   • 🔍 Design system compliance checking"
echo "   • ♿ Accessibility analysis"
echo
echo "🏃‍♂️ Next steps:"
echo "   1. npm run mcp:build    # Build the server"
echo "   2. npm run mcp:start    # Start with Gemini AI"
echo "   3. Test: curl -X POST http://localhost:3000 -H 'Content-Type: application/json' \\"
echo "      -d '{\"method\":\"test_ai_services\"}'"
echo
echo "🎯 Ready to generate AI-powered tickets with FREE Google AI!"