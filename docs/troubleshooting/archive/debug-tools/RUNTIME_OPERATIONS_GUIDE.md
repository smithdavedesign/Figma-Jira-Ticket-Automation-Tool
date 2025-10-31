# 🚀 Runtime Operations Guide

**Essential operational procedures for the Figma AI Ticket Generator**

## 🎯 **Quick Start - No More Crashes**

### **The Golden Rule**
**ALWAYS USE THE STABLE SERVER**: `server/server.js`
**NEVER USE**: `server/src/server.ts` (development only, crashes with templates)

### **1-Minute Startup**
```bash
# 1. Go to server directory
cd server

# 2. Ensure .env exists with Gemini key
ls -la .env || echo "GEMINI_API_KEY=your-key-here" > .env

# 3. Start STABLE server
node server.js

# 4. Verify in another terminal
curl -s http://localhost:3000/ | head -3
```

## 🔄 **Server Management Commands**

### **Start Server (Production)**
```bash
cd server
node server.js
```

### **Check Server Status**
```bash
# Quick health check
curl -s http://localhost:3000/ --max-time 2 | head -3

# Port status
lsof -i :3000 || echo "No process on port 3000"

# Process details
ps aux | grep "node server.js" | grep -v grep
```

### **Stop Server**
```bash
# Graceful stop
pkill -f "node server.js"

# Force kill if hung
lsof -ti :3000 | xargs kill -9
```

### **Restart Server**
```bash
# Combined stop and start
lsof -ti :3000 | xargs kill -9 && sleep 2 && cd server && node server.js
```

## 🛠️ **Crash Recovery Procedures**

### **Server Crashed - Emergency Recovery**
```bash
#!/bin/bash
echo "🚨 Emergency server recovery..."

# 1. Kill any hung processes
lsof -ti :3000 | xargs kill -9 || echo "No processes to kill"

# 2. Wait for port to be available
sleep 3

# 3. Start stable server
cd server && node server.js &

# 4. Verify startup
sleep 5
curl -s http://localhost:3000/ --max-time 2 && echo "✅ Server recovered" || echo "❌ Recovery failed"
```

### **Template Generation Crashes**
When template generation causes crashes (like AEM HTL requests):

```bash
# 1. Stop crashed server
lsof -ti :3000 | xargs kill -9

# 2. Start server with error handling
cd server && node server.js

# 3. Test with safe endpoint first
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"method":"analyze_project","params":{"figmaUrl":"test"}}' \
  --max-time 5

# 4. If safe endpoint works, use generate_enhanced_ticket instead of generate_template_tickets
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{
    "method": "generate_enhanced_ticket",
    "params": {
      "frameData": [{"id": "test", "name": "test"}],
      "platform": "jira"
    }
  }' --max-time 10
```

## 🔍 **Debugging Common Issues**

### **Issue 1: Server Won't Start**
```bash
# Check port conflicts
lsof -i :3000
# If occupied: lsof -ti :3000 | xargs kill -9

# Check environment
cd server && ls -la .env
# If missing: echo "GEMINI_API_KEY=your-key" > .env

# Check file permissions
ls -la server.js
# If not executable: chmod +x server.js
```

### **Issue 2: AI Services Failing**
```bash
# Check Gemini API key
cd server && grep GEMINI .env

# Test Gemini directly
node -e "
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('API Key loaded:', !!process.env.GEMINI_API_KEY);
"
```

### **Issue 3: Template System Crashes**
```bash
# DON'T USE: generate_template_tickets (crashes with complex templates)
# USE INSTEAD: generate_enhanced_ticket (stable fallback)

# Safe template request
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{
    "method": "generate_enhanced_ticket",
    "params": {
      "frameData": [{"id": "123", "name": "Button"}],
      "platform": "jira",
      "teamStandards": {
        "tech_stack": "AEM 6.5 with HTL"
      }
    }
  }'
```

## 📊 **Health Monitoring**

### **Server Health Indicators**
```bash
# ✅ Healthy server response:
$ curl -s http://localhost:3000/ | head -3
🚀 Figma AI Ticket Generator Test Server started
📋 Server running at http://localhost:3000
🔗 Available tools: analyze_project, generate_tickets, check_compliance

# ❌ Unhealthy indicators:
# - No response within 2 seconds
# - "Connection refused" errors
# - HTML error pages instead of JSON
# - Process not found in ps aux
```

### **Performance Monitoring**
```bash
# Response time test
time curl -s http://localhost:3000/ > /dev/null
# Should be < 1 second

# Memory usage
ps aux | grep "node server.js" | awk '{print $6}' # RSS memory
# Should be < 200MB typically

# CPU usage
top -p $(pgrep -f "node server.js") -n 1 | tail -1
```

## 🎯 **Figma Plugin Integration**

### **Plugin Connection Settings**
```javascript
// In your Figma plugin code
const MCP_SERVER_URL = 'http://localhost:3000';

// Safe request pattern
async function generateTicket(frameData) {
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000, // 15 second timeout
      body: JSON.stringify({
        method: 'generate_enhanced_ticket', // Use this, not generate_template_tickets
        params: {
          frameData: frameData,
          platform: 'jira',
          teamStandards: {
            tech_stack: 'Your tech stack here'
          }
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('MCP Server connection failed:', error);
    // Show user-friendly error in Figma
    figma.notify('Server connection failed. Please check if the MCP server is running.');
    return null;
  }
}
```

### **Plugin Error Handling**
```javascript
// Check server availability before requests
async function checkServerHealth() {
  try {
    const response = await fetch(MCP_SERVER_URL, { 
      method: 'GET',
      timeout: 3000 
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Use in plugin
if (!(await checkServerHealth())) {
  figma.notify('⚠️ MCP Server not available. Please start server with: cd server && node server.js');
  return;
}
```

## 📋 **Automated Scripts**

### **Server Watchdog Script**
Create `server/watchdog.sh`:
```bash
#!/bin/bash
while true; do
  if ! curl -s http://localhost:3000/ --max-time 2 > /dev/null; then
    echo "$(date): Server down, restarting..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 3
    nohup node server.js > server.log 2>&1 &
    echo "$(date): Server restarted"
  fi
  sleep 30
done
```

### **Pre-Development Check**
Create `scripts/dev-check.sh`:
```bash
#!/bin/bash
echo "🔍 Pre-development server check..."

# Check if server is running
if curl -s http://localhost:3000/ --max-time 2 > /dev/null; then
  echo "✅ Server is running"
else
  echo "❌ Server not running, starting..."
  cd server && nohup node server.js > server.log 2>&1 &
  sleep 5
  if curl -s http://localhost:3000/ --max-time 2 > /dev/null; then
    echo "✅ Server started successfully"
  else
    echo "❌ Server failed to start, check logs"
    exit 1
  fi
fi

# Test core functionality
echo "🧪 Testing core functionality..."
if curl -X POST http://localhost:3000/ \
   -H "Content-Type: application/json" \
   -d '{"method":"analyze_project","params":{"figmaUrl":"test"}}' \
   --max-time 5 > /dev/null; then
  echo "✅ Core functionality working"
else
  echo "❌ Core functionality failed"
  exit 1
fi

echo "🎉 All checks passed, ready for development!"
```

## 🚨 **Emergency Contacts & Escalation**

### **When All Else Fails**
1. **Check logs**: `tail -f server/server.log`
2. **Full reset**: `rm -rf server/node_modules && cd server && npm install`
3. **Port conflicts**: `netstat -tulpn | grep :3000`
4. **System resources**: `free -h && df -h`

### **Known Working Configuration**
```bash
# Environment that definitely works:
NODE_VERSION=18.x
SERVER_FILE=server/server.js (NOT server/src/server.ts)
PORT=3000
GEMINI_API_KEY=valid-key-from-google
```

---

**Remember**: The stable server (`server.js`) handles all production use cases. The TypeScript server is for development only and causes template crashes.