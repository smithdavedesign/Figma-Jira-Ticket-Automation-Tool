#!/bin/bash

# Pre-Test Validation for Playwright Browser Tests
# Prevents wasting 10+ minutes on tests when endpoints are broken

set -e

echo "🧪 Pre-Test Validation for Browser Tests"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Quick endpoint check
echo "🔍 Quick endpoint validation..."

# Check if UI endpoint is reachable
echo -n "📡 UI endpoint (localhost:8101)... "
if curl -s -f "http://localhost:8101/ui/standalone/index.html" --connect-timeout 3 --max-time 5 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo
    echo "🚨 UI server not responding!"
    echo "💡 Start UI server: python3 -m http.server 8101"
    echo "💡 Or run: ./scripts/health-check.sh --start-servers"
    exit 1
fi

# Check if essential UI elements are present
echo -n "🎨 UI content validation... "
UI_CONTENT=$(curl -s "http://localhost:8101/ui/standalone/index.html" --connect-timeout 3 --max-time 5)
if echo "$UI_CONTENT" | grep -q "Enhanced Figma Plugin" && echo "$UI_CONTENT" | grep -q "techStackInput"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "🚨 UI content appears corrupted or incomplete!"
    exit 1
fi

# Check MCP server
echo -n "🧠 MCP server (localhost:3000)... "
if curl -s "http://localhost:3000" --connect-timeout 3 --max-time 5 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ RESPONDING${NC}"
else
    echo -e "${YELLOW}⚠️  NOT RESPONDING${NC}"
    echo "   (Browser tests will use fallback mode)"
fi

echo
echo -e "${GREEN}🎯 Pre-test validation passed!${NC}"
echo "✅ Ready for Playwright browser tests"

# If running from npm script, continue to actual test
if [ "$1" = "--continue" ]; then
    shift
    cd browser-tests
    exec npx playwright test "$@"
fi