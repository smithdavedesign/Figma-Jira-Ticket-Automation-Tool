#!/bin/bash

echo "🎯 LIVE TESTING MONITOR"
echo "=========================="
echo "📊 Dashboard: http://localhost:8080/advanced-context-dashboard.html"
echo "🖥️ Server: http://localhost:3000"
echo ""

# Function to test specific endpoints
test_endpoint() {
    echo "🔍 Testing $1..."
    curl -s "$1" | head -c 200
    echo ""
    echo "---"
}

# Function to monitor health
monitor_health() {
    while true; do
        STATUS=$(curl -s http://localhost:3000/health | jq -r .status 2>/dev/null || echo "unavailable")
        SERVICES=$(curl -s http://localhost:3000/health | jq -r '.services | length' 2>/dev/null || echo "0")
        echo "$(date '+%H:%M:%S') - Status: $STATUS, Services: $SERVICES"
        sleep 5
    done
}

echo "Ready to monitor! Available commands:"
echo "  ./monitor-testing.sh health    - Monitor health status"
echo "  ./monitor-testing.sh test      - Test key endpoints"
echo ""

case "$1" in
    "health")
        monitor_health
        ;;
    "test")
        test_endpoint "http://localhost:3000/health"
        test_endpoint "http://localhost:3000/api/figma/health"
        ;;
    *)
        echo "Use: ./monitor-testing.sh [health|test]"
        ;;
esac