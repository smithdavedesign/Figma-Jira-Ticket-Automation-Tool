# 🏗️ Server Architecture Clarification & Crash Resolution

**Critical Documentation** - Resolves server crashes and architecture confusion

## 🚨 **URGENT: Dual Server Architecture Issues**

### **Root Cause Analysis**
Your project has **TWO SEPARATE SERVERS** causing confusion and crashes:

1. **`/server/server.js`** - Production Node.js server (STABLE)
2. **`/server/src/server.ts`** - TypeScript development server (CRASH-PRONE)

**The crashes occur because:**
- Template system in TypeScript server has complex YAML parsing
- Multiple environment loading conflicts
- Uncaught exceptions in template generation
- No proper error boundaries for AI service failures

## 🔍 **Current Architecture Problems**

### **Confusing Structure**
```
figma-ticket-generator/
├── src/                    # ❌ Plugin code (NOT server)
│   ├── plugin/            # Figma plugin sandbox code
│   └── core/              # Business logic
├── server/                # ❌ ACTUAL MCP SERVER
│   ├── server.js          # ✅ STABLE production server
│   └── src/server.ts      # ❌ CRASH-PRONE dev server
```

### **Script Confusion**
```json
// Root package.json
"start": "cd server && node server.js",           // ✅ STABLE
"start:dev": "cd server && PORT=3001 npx tsx src/server.ts", // ❌ CRASHES
```

## 🛠️ **Immediate Fix: Use STABLE Server Only**

### **1. Always Use Production Server**
```bash
# ✅ CORRECT - Use this command
cd server && node server.js

# ❌ WRONG - This crashes with templates
cd server && npx tsx src/server.ts
```

### **2. Environment Setup**
```bash
cd server
cp .env.example .env
# Add your Gemini API key:
echo "GEMINI_API_KEY=your-key-here" >> .env
```

### **3. Server Health Check**
```bash
# Check if server is running
curl -s http://localhost:3000/ | head -3

# Kill crashed processes
lsof -ti :3000 | xargs kill -9

# Restart stable server
cd server && node server.js
```

## 🎯 **Template System Fix**

### **Problem with TypeScript Server**
The TypeScript server crashes on template generation because:
1. Complex YAML parsing in `template-config.ts`
2. Uncaught exceptions in `template-integration.ts`
3. No error boundaries for AI failures

### **Solution: Use Production Server Templates**
The production server (`server.js`) has:
- ✅ Simple fallback templates
- ✅ Error handling for AI failures
- ✅ Graceful degradation
- ✅ No complex YAML parsing

## 📋 **Step-by-Step Server Recovery**

### **When Server Crashes During Template Generation:**

1. **Kill Crashed Processes**
   ```bash
   lsof -ti :3000 | xargs kill -9 || echo "No process found"
   ```

2. **Start STABLE Server**
   ```bash
   cd server && node server.js
   ```

3. **Test Server Health**
   ```bash
   curl -s http://localhost:3000/ --max-time 2 | head -3
   ```

4. **Test Template Generation (Safe)**
   ```bash
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

## 🔧 **Long-term Architecture Recommendations**

### **Option 1: Single Server Approach (RECOMMENDED)**
Merge the stable server features with essential TypeScript functionality:

```
server/
├── server.js              # Main server (keep stable features)
├── lib/                   # Compiled TypeScript modules
│   ├── templates.js       # Simplified template system
│   └── ai-service.js      # AI integration
└── src/                   # TypeScript source (build only)
    ├── templates/         # Simple templates
    └── ai/               # AI services
```

### **Option 2: Clear Server Separation**
Rename servers for clarity:

```
servers/
├── production-server/     # Stable Node.js server
│   └── server.js
└── development-server/    # TypeScript development server
    └── src/server.ts
```

## 🚨 **Emergency Commands Reference**

### **Server Crashed - Quick Recovery**
```bash
# 1. Kill everything on port 3000
lsof -ti :3000 | xargs kill -9

# 2. Start stable server
cd server && node server.js

# 3. Verify it's working
curl -s http://localhost:3000/ | head -3
```

### **Template Generation Fails**
```bash
# Test with safe endpoint first
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"method":"analyze_project","params":{"figmaUrl":"test"}}'

# If that works, try simple ticket generation
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"method":"generate_enhanced_ticket","params":{"frameData":[]}}'
```

### **Environment Issues**
```bash
cd server
echo "Current environment:"
env | grep -E "(GEMINI|PORT|NODE)"

# Check .env file exists
ls -la .env || echo "Missing .env file"
```

## 🎯 **Figma Plugin Integration**

### **Use Stable Server for Plugin**
In your Figma plugin code, always connect to:
- **URL**: `http://localhost:3000`
- **Server**: Production server (`server.js`)
- **Method**: Use `generate_enhanced_ticket` (not `generate_template_tickets`)

### **Plugin-Safe Template Request**
```javascript
// In Figma plugin
const response = await fetch('http://localhost:3000/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'generate_enhanced_ticket',
    params: {
      frameData: selectedFrames,
      platform: 'jira',
      // Don't use documentType: 'code-simple' - this crashes
    }
  })
});
```

## ✅ **Success Indicators**

### **Server is Healthy When:**
- ✅ `curl -s http://localhost:3000/` responds within 2 seconds
- ✅ Returns `"Figma AI Ticket Generator Test Server started"`
- ✅ Shows available tools list
- ✅ No "Request failed" errors in logs

### **Template Generation Works When:**
- ✅ No crashes on POST requests
- ✅ Returns ticket content (even if fallback)
- ✅ Handles missing AI gracefully
- ✅ Doesn't hang for >10 seconds

## 🔗 **Related Documentation**
- [Production Deployment Guide](../PRODUCTION-READINESS.md)
- [MCP Server Setup](../Technical%20Implementation/MCP-IMPLEMENTATION-PLAN.md)
- [Testing Framework](../LOGGING-AND-TESTING.md)

---

**Key Takeaway:** Always use `server/server.js` for stability. The TypeScript server (`server/src/server.ts`) is development-only and crash-prone with templates.