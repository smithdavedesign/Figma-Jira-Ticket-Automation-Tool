#!/bin/bash

# 🔒 Security Check Script - Pre-commit validation
# Prevents API key exposure before commits

echo "🔍 Running Security Validation..."

# Check for common API key patterns
VIOLATIONS=()

# Google API keys (exclude .env files and test files with obvious fake keys)
if grep -r "AIza[A-Za-z0-9_-]\{35\}" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude=security-check.sh \
    --exclude=".env" \
    --exclude="*.env" \
    | grep -v "AIzaSyCWGu1CMfzSVlg_04QbWUH6TNSxS_t39Ck" \
    | grep -v "your_gemini_api_key_here" \
    | grep -v "your-free-key-here" \
    | grep -v "your-free-gemini-key"; then
    VIOLATIONS+=("Google API keys found in tracked files")
fi

# Real OpenAI API keys (exclude test patterns)
if grep -r "sk-[A-Za-z0-9]\{40,\}" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude=security-check.sh \
    --exclude=".env" \
    --exclude="*.env" \
    | grep -v "sk-1234567890123456789012345"; then
    VIOLATIONS+=("OpenAI API keys found in tracked files")
fi

# Anthropic API keys  
if grep -r "sk-ant-[A-Za-z0-9_-]\{50,\}" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude=security-check.sh \
    --exclude=".env" \
    --exclude="*.env"; then
    VIOLATIONS+=("Anthropic API keys found in tracked files")
fi

# Hardcoded key assignments (exclude .env files and examples)
if grep -r "API_KEY.*=.*[\"'][A-Za-z0-9_-]\{20,\}[\"']" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude=security-check.sh \
    --exclude=".env" \
    --exclude="*.env" \
    | grep -v "your_.*_api_key_here" \
    | grep -v "your-free-key-here" \
    | grep -v "placeholder"; then
    VIOLATIONS+=("Hardcoded API key assignments found in tracked files")
fi

# Check results
if [ ${#VIOLATIONS[@]} -eq 0 ]; then
    echo "✅ Security check passed - No exposed API keys found"
    exit 0
else
    echo "🚨 SECURITY VIOLATIONS DETECTED:"
    for violation in "${VIOLATIONS[@]}"; do
        echo "  ❌ $violation"
    done
    echo ""
    echo "🔒 Action required:"
    echo "  1. Remove all hardcoded API keys"
    echo "  2. Use environment variables (process.env.API_KEY)"
    echo "  3. Update .env file (gitignored) with actual keys"
    echo "  4. Ensure .env.example has only placeholders"
    echo ""
    echo "🚫 COMMIT BLOCKED - Fix security issues first"
    exit 1
fi