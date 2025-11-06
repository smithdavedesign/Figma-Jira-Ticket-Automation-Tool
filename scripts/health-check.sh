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
  local service_name=$2
  echo -n "🔌 Checking port $port ($service_name)... "
  
  # Use lsof for macOS compatibility
  if command -v lsof >/dev/null 2>&1; then
    if lsof -i :$port >/dev/null 2>&1; then
      echo "✅ OPEN"
      return 0
    else
      echo "❌ CLOSED"
      return 1
    fi
  elif command -v nc >/dev/null 2>&1; then
    if nc -z localhost $port 2>/dev/null; then
      echo "✅ OPEN"
      return 0
    else
      echo "❌ CLOSED"
      return 1
    fi
  elif command -v netstat >/dev/null 2>&1; then
    if netstat -an | grep -q ":$port.*LISTEN"; then
      echo "✅ OPEN"
      return 0
    else
      echo "❌ CLOSED"
      return 1
    fi
  else
    echo "⚠️ CANNOT CHECK (no lsof, nc, or netstat)"
    return 1
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
    
    # Start integrated server in background
    if ! check_port 3000 "Integrated Server" >/dev/null 2>&1; then
        echo "🧠 Starting integrated server on port 3000..."
        npm run start:server > /dev/null 2>&1 &
        SERVER_PID=$!
        sleep 3
    fi
}

# Function to cleanup servers on exit
cleanup() {
    if [ ! -z "$UI_SERVER_PID" ]; then
        echo "🛑 Stopping UI server..."
        kill $UI_SERVER_PID 2>/dev/null || true
    fi
    if [ ! -z "$SERVER_PID" ]; then
        echo "🛑 Stopping integrated server..."
        kill $SERVER_PID 2>/dev/null || true
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
if [ -f "ui/index.html" ]; then
    echo -e "   ${GREEN}✅${NC} UI files present"
else
    echo -e "   ${RED}❌${NC} UI files missing"
    ((HEALTH_ISSUES++))
fi

if [ -f "app/server.js" ]; then
    echo -e "   ${GREEN}✅${NC} Integrated server present"
else
    echo -e "   ${RED}❌${NC} Server files missing"
    ((HEALTH_ISSUES++))
fi

echo

# 2. Check if servers are running or start them
if [ "$START_SERVERS" = true ]; then
    start_servers
fi

# 3. Check ports
echo "🔌 Checking server ports..."
if ! check_port 3000 "Integrated Server (REST + MCP)"; then
    ((HEALTH_ISSUES++))
fi

echo

# 4. Check HTTP endpoints
echo "🌐 Checking HTTP endpoints..."
# Integrated server health check
echo -n "🧠 Checking integrated server health... "
if curl -s "http://localhost:3000/health" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ RESPONDING${NC}"
else
    echo -e "${RED}❌ NOT RESPONDING${NC}"
    ((HEALTH_ISSUES++))
fi

# Check if main server endpoints are working
echo -n "🔍 Checking Figma API endpoint... "
if curl -s "http://localhost:3000/api/figma/health" --connect-timeout 5 --max-time 10 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ RESPONDING${NC}"
else
    echo -e "${YELLOW}⚠️ API ENDPOINTS NOT RESPONDING${NC}"
fi

echo

# 5. Check dependencies
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "   ${GREEN}✅${NC} Node modules installed"
else
    echo -e "   ${YELLOW}⚠️${NC}  Node modules not found - run 'npm install'"
fi

if [ -d "tests/playwright" ]; then
    echo -e "   ${GREEN}✅${NC} Browser test setup present"
else
    echo -e "   ${YELLOW}⚠️${NC}  Browser tests not found in tests/ directory"
fi

# Check all dependencies are installed (consolidated architecture)
if [ -d "node_modules" ] && [ -f "node_modules/@playwright/test/package.json" ]; then
    echo -e "   ${GREEN}✅${NC} All dependencies installed (consolidated)"
else
    echo -e "   ${YELLOW}⚠️${NC}  Some dependencies missing - run 'npm install'"
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
    echo "   1. Ensure MCP server is running: npm run start:server"
    echo "   2. Install missing dependencies: npm install"
    echo "   3. Check that port 3000 is available"
    echo "   4. Re-run with --start-servers to auto-start services"
    echo
    echo "💡 Quick fix: ./scripts/health-check.sh --start-servers"
    exit 1
fi