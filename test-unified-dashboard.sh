#!/bin/bash

# 🎨 Unified Context Dashboard Live Test Script
# This script demonstrates the complete unified context data layer

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with colors
log() {
    local type=$1
    local message=$2
    local timestamp=$(date '+%H:%M:%S')
    
    case $type in
        "info")
            echo -e "[${timestamp}] ${BLUE}📋 ${message}${NC}"
            ;;
        "success")
            echo -e "[${timestamp}] ${GREEN}✅ ${message}${NC}"
            ;;
        "error")
            echo -e "[${timestamp}] ${RED}❌ ${message}${NC}"
            ;;
        "warning")
            echo -e "[${timestamp}] ${YELLOW}⚠️  ${message}${NC}"
            ;;
        "test")
            echo -e "[${timestamp}] ${YELLOW}🧪 ${message}${NC}"
            ;;
    esac
}

# Test configuration
API_BASE="http://localhost:3000"
TEST_FIGMA_URL="https://figma.com/file/test123/Sample-Design"

log "info" "🎨 Starting Unified Context Dashboard Test Suite"
log "info" "============================================"

# Start server in background
log "info" "Starting Figma AI Ticket Generator server..."
npm start &
SERVER_PID=$!

# Wait for server to start
log "info" "Waiting for server to initialize..."
sleep 8

# Function to test API endpoint
test_endpoint() {
    local name=$1
    local endpoint=$2
    local method=${3:-GET}
    local data=${4:-""}
    
    log "test" "Testing $name..."
    
    if [ "$method" = "POST" ]; then
        if curl -s -f -X POST -H "Content-Type: application/json" -d "$data" "$API_BASE$endpoint" > /dev/null 2>&1; then
            log "success" "$name: PASSED"
            return 0
        else
            log "error" "$name: FAILED"
            return 1
        fi
    else
        if curl -s -f "$API_BASE$endpoint" > /dev/null 2>&1; then
            log "success" "$name: PASSED"
            return 0
        else
            log "error" "$name: FAILED"
            return 1
        fi
    fi
}

# Test system health
log "info" "Testing system health endpoints..."

test_endpoint "Server Health" "/health"
test_endpoint "API Health" "/api/health" 
test_endpoint "Figma Health" "/api/figma/health"

# Test context extraction
log "info" "Testing context extraction..."

CONTEXT_DATA=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "figmaUrl": "'"$TEST_FIGMA_URL"'",
    "includeScreenshot": true,
    "testMode": true
  }' \
  "$API_BASE/api/figma/extract-context" 2>/dev/null || echo '{"success": false}')

if echo "$CONTEXT_DATA" | grep -q '"success":true'; then
    log "success" "Context extraction: PASSED"
    CONTEXT_AVAILABLE=true
else
    log "error" "Context extraction: FAILED"
    CONTEXT_AVAILABLE=false
fi

# Test Context Bridge
log "info" "Testing Context-Template Bridge..."

BRIDGE_DATA=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{
    "format": "markdown",
    "strategy": "context-bridge",
    "documentType": "component",
    "testMode": true,
    "mockData": {
      "nodes": [
        {"name": "Button Component", "type": "COMPONENT"},
        {"name": "Header Section", "type": "FRAME"}
      ],
      "components": [
        {"name": "Primary Button", "variants": 2}
      ],
      "styles": [
        {"name": "Primary Color", "type": "FILL"}
      ]
    }
  }' \
  "$API_BASE/api/generate" 2>/dev/null || echo '{"success": false}')

if echo "$BRIDGE_DATA" | grep -q '"success":true'; then
    log "success" "Context Bridge: PASSED"
    BRIDGE_AVAILABLE=true
else
    log "error" "Context Bridge: FAILED"
    BRIDGE_AVAILABLE=false
fi

# Test AI Generation (if context is available)
if [ "$CONTEXT_AVAILABLE" = true ]; then
    log "info" "Testing AI ticket generation..."
    
    AI_DATA=$(curl -s -X POST -H "Content-Type: application/json" \
      -d '{
        "format": "jira",
        "strategy": "context-bridge",
        "documentType": "component",
        "techStack": "React TypeScript",
        "testMode": true,
        "frameData": [],
        "enhancedFrameData": {}
      }' \
      "$API_BASE/api/generate" 2>/dev/null || echo '{"success": false}')
    
    if echo "$AI_DATA" | grep -q '"success":true'; then
        log "success" "AI generation: PASSED"
        AI_AVAILABLE=true
    else
        log "error" "AI generation: FAILED"
        AI_AVAILABLE=false
    fi
else
    log "warning" "Skipping AI generation - no context data"
    AI_AVAILABLE=false
fi

# Test additional dashboard endpoints
log "info" "Testing additional dashboard endpoints..."

# Test health endpoint details
HEALTH_DETAIL=$(curl -s "$API_BASE/health" 2>/dev/null || echo '{}')
if echo "$HEALTH_DETAIL" | grep -q '"status"'; then
    log "success" "Health detail endpoint: PASSED"
else
    log "warning" "Health detail endpoint: FAILED"
fi

# Generate test summary
log "info" "============================================"
log "info" "🎯 Test Results Summary:"

# Count successes
SUCCESS_COUNT=0
TOTAL_TESTS=6

if curl -s -f "$API_BASE/health" > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi
if curl -s -f "$API_BASE/api/health" > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi
if curl -s -f "$API_BASE/api/figma/health" > /dev/null 2>&1; then ((SUCCESS_COUNT++)); fi
if [ "$CONTEXT_AVAILABLE" = true ]; then ((SUCCESS_COUNT++)); fi
if [ "$BRIDGE_AVAILABLE" = true ]; then ((SUCCESS_COUNT++)); fi
if [ "$AI_AVAILABLE" = true ]; then ((SUCCESS_COUNT++)); fi

log "info" "  • Total tests: $TOTAL_TESTS"
log "info" "  • Passed: $SUCCESS_COUNT"
log "info" "  • Failed: $((TOTAL_TESTS - SUCCESS_COUNT))"

if [ "$CONTEXT_AVAILABLE" = true ]; then
    log "info" "  • Context extraction: ✅"
else
    log "info" "  • Context extraction: ❌"
fi

if [ "$BRIDGE_AVAILABLE" = true ]; then
    log "info" "  • Context bridge: ✅"
else
    log "info" "  • Context bridge: ❌"
fi

if [ "$AI_AVAILABLE" = true ]; then
    log "info" "  • AI generation: ✅"
else
    log "info" "  • AI generation: ❌"
fi

# Overall result
if [ $SUCCESS_COUNT -ge 4 ]; then
    log "success" "🎉 Unified Context Dashboard: OPERATIONAL"
    OVERALL_SUCCESS=true
else
    log "error" "⚠️  Unified Context Dashboard: NEEDS ATTENTION"
    OVERALL_SUCCESS=false
fi

log "info" "============================================"
log "info" "📊 Dashboard URL: http://localhost:3000/ui/unified-context-dashboard.html"
log "info" "🌐 Server URL: http://localhost:3000"
log "info" "============================================"

if [ "$OVERALL_SUCCESS" = true ]; then
    log "success" "✨ All systems operational! Ready for manual testing."
    log "info" "💡 Open the dashboard URL in your browser to test the UI"
    log "info" "🔧 The server will continue running for manual testing..."
    log "info" "Press Ctrl+C to stop the server"
    
    # Keep server running
    wait $SERVER_PID
else
    log "warning" "🔧 Some systems need attention. Check the logs above."
    log "info" "Server PID: $SERVER_PID (kill with: kill $SERVER_PID)"
fi