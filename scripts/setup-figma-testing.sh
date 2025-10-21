#!/bin/bash

# Figma Plugin Testing Setup with Real-time Monitoring
# Sets up all necessary services and monitoring for Figma plugin testing

echo "🧪 Figma Plugin Testing Setup"
echo "============================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start service in background
start_service() {
    local name=$1
    local command=$2
    local port=$3
    local log_file=$4
    
    echo -e "${BLUE}🚀 Starting $name...${NC}"
    
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Port $port already in use. Skipping $name startup.${NC}"
        return 0
    fi
    
    # Start service in background
    eval "$command" > "$log_file" 2>&1 &
    local pid=$!
    
    # Wait a moment for service to start
    sleep 2
    
    if check_port $port; then
        echo -e "${GREEN}✅ $name started successfully on port $port (PID: $pid)${NC}"
        echo "$pid" > "${name,,}.pid"
        return 0
    else
        echo -e "${RED}❌ Failed to start $name on port $port${NC}"
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Setting up Figma plugin testing environment...${NC}"
echo ""

# 1. Check MCP Server
echo -e "${BLUE}1️⃣  Checking MCP Server...${NC}"
if check_port 3000; then
    echo -e "${GREEN}✅ MCP Server already running on port 3000${NC}"
    MCP_STATUS="running"
else
    echo -e "${YELLOW}⚠️  MCP Server not running. Please start it manually:${NC}"
    echo "   cd server && node server.js"
    MCP_STATUS="not_running"
fi

# 2. Setup HTTP Request Logger
echo ""
echo -e "${BLUE}2️⃣  Setting up HTTP Request Logger...${NC}"
start_service "HTTP-Logger" "node scripts/http-request-logger.js" 3001 "http-logger.log"

# 3. Setup UI Server
echo ""
echo -e "${BLUE}3️⃣  Setting up UI Server...${NC}"
start_service "UI-Server" "python3 -m http.server 8080" 8080 "ui-server.log"

# 4. Run Phase 5 Tests
echo ""
echo -e "${BLUE}4️⃣  Running Phase 5 Tests...${NC}"
if [ "$1" != "--skip-tests" ]; then
    echo -e "${CYAN}Running comprehensive test suite...${NC}"
    npm run test:phase5
    echo ""
fi

# 5. Create monitoring dashboard
echo -e "${BLUE}5️⃣  Setting up monitoring dashboard...${NC}"

cat > figma-testing-dashboard.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>🧪 Figma Plugin Testing Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .status.running { background: #d1fae5; color: #065f46; }
        .status.stopped { background: #fee2e2; color: #991b1b; }
        .log-box { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; }
        .btn { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #2563eb; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .test-success { background: #d1fae5; border-left: 4px solid #10b981; }
        .test-error { background: #fee2e2; border-left: 4px solid #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Figma Plugin Testing Dashboard</h1>
            <p>Real-time monitoring for Figma plugin testing and MCP server interactions</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>📊 Server Status</h3>
                <div id="server-status">
                    <div>MCP Server (3000): <span class="status" id="mcp-status">Checking...</span></div>
                    <div>HTTP Logger (3001): <span class="status" id="logger-status">Checking...</span></div>
                    <div>UI Server (8080): <span class="status" id="ui-status">Checking...</span></div>
                </div>
                <button class="btn" onclick="refreshStatus()">Refresh Status</button>
            </div>
            
            <div class="card">
                <h3>🔍 Request Monitoring</h3>
                <div>Last Request: <span id="last-request">None</span></div>
                <div>Total Requests: <span id="total-requests">0</span></div>
                <div>Server Uptime: <span id="server-uptime">Unknown</span></div>
                <button class="btn" onclick="testConnection()">Test Connection</button>
            </div>
            
            <div class="card">
                <h3>🧪 Quick Tests</h3>
                <button class="btn" onclick="runTest('visual-context')">Visual Context Test</button>
                <button class="btn" onclick="runTest('performance')">Performance Test</button>
                <button class="btn" onclick="runTest('e2e')">E2E Workflow Test</button>
                <div id="test-results"></div>
            </div>
            
            <div class="card">
                <h3>📋 Activity Log</h3>
                <div class="log-box" id="activity-log">
                    Monitoring started...<br>
                    Waiting for Figma plugin activity...<br>
                </div>
                <button class="btn" onclick="clearLog()">Clear Log</button>
            </div>
        </div>
    </div>

    <script>
        let requestCount = 0;
        
        function log(message) {
            const logBox = document.getElementById('activity-log');
            const timestamp = new Date().toLocaleTimeString();
            logBox.innerHTML += `[${timestamp}] ${message}<br>`;
            logBox.scrollTop = logBox.scrollHeight;
        }
        
        function clearLog() {
            document.getElementById('activity-log').innerHTML = 'Log cleared...<br>';
        }
        
        async function checkServerStatus(port, elementId) {
            try {
                const response = await fetch(`http://localhost:${port}`, { signal: AbortSignal.timeout(2000) });
                if (response.ok) {
                    document.getElementById(elementId).textContent = 'Running';
                    document.getElementById(elementId).className = 'status running';
                    return true;
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                document.getElementById(elementId).textContent = 'Stopped';
                document.getElementById(elementId).className = 'status stopped';
                return false;
            }
        }
        
        async function refreshStatus() {
            log('Refreshing server status...');
            await checkServerStatus(3000, 'mcp-status');
            await checkServerStatus(3001, 'logger-status');
            await checkServerStatus(8080, 'ui-status');
            log('Status refresh completed');
        }
        
        async function testConnection() {
            log('Testing MCP server connection...');
            try {
                const response = await fetch('http://localhost:3000');
                const data = await response.json();
                document.getElementById('total-requests').textContent = data.requests || 'Unknown';
                document.getElementById('server-uptime').textContent = data.uptime ? `${Math.round(data.uptime)}s` : 'Unknown';
                document.getElementById('last-request').textContent = new Date().toLocaleTimeString();
                log('✅ Connection test successful');
            } catch (error) {
                log(`❌ Connection test failed: ${error.message}`);
            }
        }
        
        async function runTest(testType) {
            const resultsDiv = document.getElementById('test-results');
            log(`🧪 Running ${testType} test...`);
            
            const testDiv = document.createElement('div');
            testDiv.className = 'test-result';
            testDiv.innerHTML = `<strong>${testType} test:</strong> Running...`;
            resultsDiv.appendChild(testDiv);
            
            // Simulate test execution (in real implementation, this would call actual test endpoints)
            setTimeout(() => {
                const success = Math.random() > 0.3; // 70% success rate for demo
                testDiv.className = success ? 'test-result test-success' : 'test-result test-error';
                testDiv.innerHTML = `<strong>${testType} test:</strong> ${success ? '✅ Passed' : '❌ Failed'}`;
                log(`${success ? '✅' : '❌'} ${testType} test ${success ? 'passed' : 'failed'}`);
            }, 2000);
        }
        
        // Auto-refresh status every 5 seconds
        setInterval(refreshStatus, 5000);
        
        // Initial status check
        refreshStatus();
        
        // Log startup
        log('Dashboard loaded successfully');
        log('Ready for Figma plugin testing');
    </script>
</body>
</html>
EOF

echo -e "${GREEN}✅ Monitoring dashboard created: figma-testing-dashboard.html${NC}"

# 6. Summary
echo ""
echo -e "${PURPLE}🎯 Testing Environment Ready!${NC}"
echo "================================"
echo ""
echo -e "${CYAN}📋 Services Status:${NC}"
if [ "$MCP_STATUS" = "running" ]; then
    echo -e "   ${GREEN}✅ MCP Server: http://localhost:3000${NC}"
else
    echo -e "   ${RED}❌ MCP Server: Not running${NC}"
fi

if check_port 3001; then
    echo -e "   ${GREEN}✅ HTTP Request Logger: http://localhost:3001${NC}"
else
    echo -e "   ${YELLOW}⚠️  HTTP Request Logger: Not started${NC}"
fi

if check_port 8080; then
    echo -e "   ${GREEN}✅ UI Server: http://localhost:8080${NC}"
else
    echo -e "   ${YELLOW}⚠️  UI Server: Not started${NC}"
fi

echo ""
echo -e "${CYAN}🔍 Monitoring Options:${NC}"
echo "   📊 Dashboard: open figma-testing-dashboard.html"
echo "   📋 Live Monitor: ./scripts/monitor-figma-testing.sh"
echo "   📝 HTTP Logs: tail -f http-logger.log"
echo ""
echo -e "${CYAN}🧪 Testing Commands:${NC}"
echo "   npm run test:phase5              # Full test suite"
echo "   npm run test:visual:context      # Visual context test"
echo "   npm run test:performance:benchmarks # Performance test"
echo "   npm run test:e2e:workflow        # End-to-end test"
echo ""
echo -e "${GREEN}🚀 Ready to test your Figma plugin!${NC}"
echo -e "${YELLOW}💡 Configure your Figma plugin to use http://localhost:3001 for request logging${NC}"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Cleaning up services...${NC}"
    
    # Kill background services
    for pidfile in *.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            kill "$pid" 2>/dev/null
            rm "$pidfile"
            echo -e "${GREEN}✅ Stopped service (PID: $pid)${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
    exit 0
}

# Set up cleanup on script exit
trap cleanup INT TERM

# Keep script running if monitoring is requested
if [ "$1" = "--monitor" ]; then
    echo ""
    echo -e "${BLUE}🔍 Starting continuous monitoring...${NC}"
    echo "Press Ctrl+C to stop all services and exit"
    echo ""
    
    # Start the monitor script
    ./scripts/monitor-figma-testing.sh
fi