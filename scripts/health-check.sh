#!/bin/bash

# Health Check Script for Figma Ticket Generator
# Validates that UI and MCP servers are ready before running expensive tests

set -e

echo "🏥 Health Check: Validating System Endpoints"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall health
HEALTH_ISSUES=0

# Function to check HTTP endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "🔍 Checking $name ($url)... "
    
    if command -v curl >/dev/null 2>&1; then
        if curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 5 --max-time 10 | grep -q "$expected_status"; then
            echo -e "${GREEN}✅ OK${NC}"
            return 0
        else
            echo -e "${RED}❌ FAILED${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  curl not available, skipping${NC}"
        return 0
    fi
}

# Function to check if port is open
check_port() {
    local port=$1
    local name=$2
    
    echo -n "🔌 Checking port $port ($name)... "
    
    if command -v nc >/dev/null 2>&1; then
        if nc -z localhost "$port" 2>/dev/null; then
            echo -e "${GREEN}✅ OPEN${NC}"
            return 0
        else
            echo -e "${RED}❌ CLOSED${NC}"
            return 1
        fi
    elif command -v lsof >/dev/null 2>&1; then
        if lsof -i :"$port" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ OPEN${NC}"
            return 0
        else
            echo -e "${RED}❌ CLOSED${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  No port checking tool available${NC}"
        return 0
    fi
}

# Function to start servers if needed
start_servers() {
    echo "🚀 Starting servers..."
    
    # Start UI server in background
    if ! check_port 8101 "UI Server" >/dev/null 2>&1; then
        echo "📡 Starting UI server on port 8101..."
        python3 -m http.server 8101 > /dev/null 2>&1 &
        UI_SERVER_PID=$!
        sleep 2
    fi
    
    # Start MCP server in background
    if ! check_port 3000 "MCP Server" >/dev/null 2>&1; then
        echo "🧠 Starting MCP server on port 3000..."
        cd server && npm run dev > /dev/null 2>&1 &
        MCP_SERVER_PID=$!
        cd ..
        sleep 3
    fi
}

# Function to cleanup servers on exit
cleanup() {
    if [ ! -z "$UI_SERVER_PID" ]; then
        echo "🛑 Stopping UI server..."
        kill $UI_SERVER_PID 2>/dev/null || true
    fi
    if [ ! -z "$MCP_SERVER_PID" ]; then
        echo "🛑 Stopping MCP server..."
        kill $MCP_SERVER_PID 2>/dev/null || true
    fi
}

# Set up cleanup on exit
trap cleanup EXIT

# Check if we should start servers
START_SERVERS=false
if [ "$1" = "--start-servers" ] || [ "$1" = "-s" ]; then
    START_SERVERS=true
fi

echo "📋 Quick system check..."
echo

# 1. Check basic file structure
echo "📁 Checking file structure..."
if [ -f "ui/standalone/index.html" ]; then
    echo -e "   ${GREEN}✅${NC} UI files present"
else
    echo -e "   ${RED}❌${NC} UI files missing"
    ((HEALTH_ISSUES++))
fi

if [ -f "server/package.json" ]; then
    echo -e "   ${GREEN}✅${NC} MCP server present"
else
    echo -e "   ${RED}❌${NC} MCP server missing"
    ((HEALTH_ISSUES++))
fi

echo

# 2. Check if servers are running or start them
if [ "$START_SERVERS" = true ]; then
    start_servers
fi

# 3. Check ports
echo "🔌 Checking server ports..."
if ! check_port 8101 "UI Server"; then
    ((HEALTH_ISSUES++))
fi

if ! check_port 3000 "MCP Server"; then
    ((HEALTH_ISSUES++))
fi

echo

# 4. Check HTTP endpoints
echo "🌐 Checking HTTP endpoints..."
if ! check_endpoint "http://localhost:8101/ui/standalone/index.html" "UI Endpoint"; then
    ((HEALTH_ISSUES++))
fi

# MCP server health check (expect different response)
echo -n "🧠 Checking MCP server health... "
if curl -s "http://localhost:3000" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ RESPONDING${NC}"
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
    ((HEALTH_ISSUES++))
fi

echo

# 5. Check dependencies
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "   ${GREEN}✅${NC} Node modules installed"
else
    echo -e "   ${YELLOW}⚠️${NC}  Node modules not found - run 'npm install'"
fi

if [ -d "browser-tests/node_modules" ]; then
    echo -e "   ${GREEN}✅${NC} Browser test dependencies installed"
else
    echo -e "   ${YELLOW}⚠️${NC}  Browser test dependencies missing - run 'cd browser-tests && npm install'"
fi

if [ -d "server/node_modules" ]; then
    echo -e "   ${GREEN}✅${NC} MCP server dependencies installed"
else
    echo -e "   ${YELLOW}⚠️${NC}  MCP server dependencies missing - run 'cd server && npm install'"
fi

echo

# 6. Final health report
echo "📊 Health Report"
echo "==============="

if [ $HEALTH_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL SYSTEMS GO! ${NC}"
    echo "✅ Ready for testing"
    exit 0
else
    echo -e "${RED}⚠️  $HEALTH_ISSUES issue(s) detected${NC}"
    echo
    echo "🚨 Recommendations:"
    echo "   1. Ensure servers are running: npm run dev (in separate terminals)"
    echo "   2. Install missing dependencies: npm install"
    echo "   3. Check that ports 8101 and 3000 are available"
    echo "   4. Re-run with --start-servers to auto-start services"
    echo
    echo "💡 Quick fix: ./scripts/health-check.sh --start-servers"
    exit 1
fi