#!/bin/bash

# Real-time Figma Testing Monitor
# Monitors localhost:3000 for incoming requests during Figma plugin testing

echo "🔍 Starting Real-time Figma Testing Monitor"
echo "============================================"
echo ""
echo "This monitor will watch for:"
echo "- HTTP requests to localhost:3000"
echo "- MCP server responses"
echo "- Error logs and debugging info"
echo "- Performance metrics"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to log with timestamp
log_with_time() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%H:%M:%S')] ${message}${NC}"
}

# Check server status
echo -e "${BLUE}🔍 Checking server status...${NC}"
if curl -s http://localhost:3000/ --max-time 2 > /dev/null; then
    SERVER_INFO=$(curl -s http://localhost:3000/ --max-time 2)
    echo -e "${GREEN}✅ MCP Server is running on localhost:3000${NC}"
    echo "Server Info: $SERVER_INFO" | head -1
else
    echo -e "${RED}❌ MCP Server is not responding on localhost:3000${NC}"
    echo "Please start the server first: cd server && node server.js"
    exit 1
fi

echo ""
echo -e "${CYAN}🚀 Starting monitoring... Test your Figma plugin now!${NC}"
echo "======================================================"

# Start monitoring in background processes
{
    # Monitor access logs if they exist
    if [ -f "server.log" ]; then
        tail -f server.log | while read line; do
            log_with_time "$GREEN" "SERVER: $line"
        done
    fi
} &

{
    # Monitor network connections to port 3000
    while true; do
        CONNECTIONS=$(lsof -i :3000 2>/dev/null | grep -v COMMAND | wc -l)
        if [ "$CONNECTIONS" -gt 1 ]; then
            log_with_time "$YELLOW" "NETWORK: $((CONNECTIONS-1)) active connections to port 3000"
        fi
        sleep 2
    done
} &

{
    # Test server every 5 seconds and log responses
    while true; do
        RESPONSE=$(curl -s http://localhost:3000/ --max-time 2 2>/dev/null)
        STATUS=$?
        
        if [ $STATUS -eq 0 ]; then
            # Extract key info from response
            if echo "$RESPONSE" | grep -q "status"; then
                STATUS_INFO=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
                REQUESTS=$(echo "$RESPONSE" | grep -o '"requests":[0-9]*' | cut -d':' -f2)
                log_with_time "$BLUE" "HEALTH: Status=$STATUS_INFO, Requests=$REQUESTS"
            fi
        else
            log_with_time "$RED" "HEALTH: Server not responding (exit code: $STATUS)"
        fi
        
        sleep 5
    done
} &

{
    # Monitor for POST requests by checking server load
    PREV_REQUESTS=0
    while true; do
        CURRENT_RESPONSE=$(curl -s http://localhost:3000/ --max-time 2 2>/dev/null)
        if echo "$CURRENT_RESPONSE" | grep -q "requests"; then
            CURRENT_REQUESTS=$(echo "$CURRENT_RESPONSE" | grep -o '"requests":[0-9]*' | cut -d':' -f2)
            
            if [ "$CURRENT_REQUESTS" -gt "$PREV_REQUESTS" ]; then
                DIFF=$((CURRENT_REQUESTS - PREV_REQUESTS))
                log_with_time "$PURPLE" "🚀 ACTIVITY: $DIFF new request(s) detected! Total: $CURRENT_REQUESTS"
            fi
            
            PREV_REQUESTS=$CURRENT_REQUESTS
        fi
        sleep 1
    done
} &

# Wait for user input or interruption
trap 'echo -e "\n${YELLOW}🛑 Stopping monitor...${NC}"; kill $(jobs -p) 2>/dev/null; exit 0' INT

# Keep the script running
while true; do
    sleep 1
done