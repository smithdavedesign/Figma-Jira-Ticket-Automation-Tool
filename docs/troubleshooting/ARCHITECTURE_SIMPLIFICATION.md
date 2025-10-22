# 🏗️ Server Architecture Simplification Plan

**Eliminating dual server confusion and crash-prone components**

## 🎯 **Current Problem Analysis**

### **Confusing Dual Architecture**
```
Current Structure (CONFUSING):
figma-ticket-generator/
├── src/                    # 😕 Plugin code (misleading name)
├── server/
│   ├── server.js          # ✅ STABLE production server
│   └── src/server.ts      # ❌ CRASH-PRONE development server
```

### **Problems This Causes**
1. **Developer Confusion**: Two `src/` folders with different purposes
2. **Script Confusion**: Multiple server start commands pointing to different servers
3. **Production Issues**: TypeScript server crashes, JavaScript server works
4. **Template Crashes**: Complex YAML templates cause TypeScript server to hang/crash
5. **Environment Conflicts**: Two servers loading environments differently

## 🚀 **Recommended: Single Server Architecture**

### **Simplified Structure**
```
figma-ticket-generator/
├── plugin/                 # ✅ Clear: Figma plugin code
│   ├── code.ts            # Plugin sandbox code
│   └── ui/                # Plugin UI
├── mcp-server/            # ✅ Clear: MCP server only
│   ├── server.js          # Main production server
│   ├── lib/               # Compiled utilities
│   │   ├── templates.js   # Simple template system
│   │   └── ai-service.js  # AI integration
│   └── config/            # Configuration files
└── docs/                  # Documentation
```

### **Benefits of Single Server**
- ✅ **No confusion**: One server, one purpose
- ✅ **Crash-resistant**: Proven stable server as foundation
- ✅ **Simple templates**: Basic template system without complex YAML parsing
- ✅ **Clear separation**: Plugin code vs server code obviously separate
- ✅ **Easy deployment**: Single server binary

## 🔧 **Migration Plan**

### **Phase 1: Immediate Stability (No Code Changes)**
**Just use documentation and scripts to clarify usage:**

1. **Update package.json scripts**:
```json
{
  "scripts": {
    "server:start": "cd server && node server.js",
    "server:status": "curl -s http://localhost:3000/ | head -3",
    "server:stop": "lsof -ti :3000 | xargs kill -9",
    "server:restart": "npm run server:stop && sleep 2 && npm run server:start",
    
    "dev:server": "npm run server:start",
    "dev:plugin": "npm run build && echo 'Load dist/manifest.json in Figma'",
    
    "DEPRECATED:dev": "echo 'DEPRECATED: Use npm run dev:server instead'",
    "DEPRECATED:start:dev": "echo 'DEPRECATED: Crashes with templates, use npm run server:start'"
  }
}
```

2. **Create server management script**:
```bash
# scripts/server-manager.sh
#!/bin/bash
case "$1" in
  start)
    echo "🚀 Starting STABLE server..."
    cd server && node server.js
    ;;
  stop)
    echo "⏹️ Stopping server..."
    lsof -ti :3000 | xargs kill -9 || echo "No process found"
    ;;
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    curl -s http://localhost:3000/ --max-time 2 | head -3
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac
```

### **Phase 2: Architectural Cleanup (Future)**
**When you have time for larger refactoring:**

1. **Rename directories for clarity**:
```bash
mv src plugin-src
mv server mcp-server
```

2. **Consolidate server implementations**:
   - Keep stable `server.js` as main server
   - Extract useful TypeScript utilities into `lib/` as compiled JavaScript
   - Remove crash-prone TypeScript server

3. **Simplify template system**:
   - Replace complex YAML templates with simple JavaScript template literals
   - Keep AEM HTL templates as static strings
   - Remove template parsing that causes crashes

## 🎯 **Immediate Actions (Today)**

### **1. Use ONLY the Stable Server**
```bash
# ✅ ALWAYS use this command:
cd server && node server.js

# ❌ NEVER use these (they crash):
cd server && npx tsx src/server.ts
npm run start:dev
```

### **2. Update Your Development Workflow**
```bash
# Terminal 1: Start stable server
cd server && node server.js

# Terminal 2: Develop plugin
npm run build
# Then import dist/manifest.json in Figma
```

### **3. For AEM HTL Code Generation**
Use the stable server with safe endpoint:
```bash
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{
    "method": "generate_enhanced_ticket",
    "params": {
      "frameData": [{"id": "test", "name": "Component"}],
      "platform": "jira",
      "teamStandards": {
        "tech_stack": "AEM 6.5 with HTL (HTML Template Language), Apache Sling framework, OSGi bundles, JCR repository, Touch UI components"
      }
    }
  }'
```

## 🔍 **Template System Simplification**

### **Current Problem**
Complex YAML templates in TypeScript server cause crashes:
```typescript
// This crashes the server:
const template = await templateEngine.loadTemplate(platform, documentType);
const renderedTicket = await templateEngine.renderTemplate(template, context);
```

### **Simple Solution**
Use JavaScript template literals in stable server:
```javascript
// This works reliably:
function generateAEMTemplate(frameData, teamStandards) {
  return `
# AEM HTL Component Implementation

## Component: ${frameData.name}

## HTL Template
\`\`\`html
<div data-sly-use.model="${frameData.name}Model"
     class="cmp-${frameData.name.toLowerCase()}">
    <!-- Component content -->
</div>
\`\`\`

## Sling Model
\`\`\`java
@Model(adaptables = Resource.class)
public class ${frameData.name}Model {
    // Implementation
}
\`\`\`

Tech Stack: ${teamStandards.tech_stack}
`;
}
```

## 📋 **Quick Reference Commands**

### **Server Management**
```bash
# Start (stable server only)
cd server && node server.js

# Health check
curl -s http://localhost:3000/ | head -3

# Stop if needed
lsof -ti :3000 | xargs kill -9

# Logs
tail -f server/server.log
```

### **Development Workflow**
```bash
# 1. Start server in one terminal
cd server && node server.js

# 2. Build plugin in another terminal
npm run build

# 3. Test in Figma with server running
# Load dist/manifest.json in Figma
```

### **Troubleshooting**
```bash
# If server crashes during template generation:
lsof -ti :3000 | xargs kill -9
cd server && node server.js

# Test with safe endpoint:
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"method":"generate_enhanced_ticket","params":{"frameData":[]}}'
```

## ✅ **Success Metrics**

### **Architecture is Simplified When:**
- ✅ Only one server command needed: `cd server && node server.js`
- ✅ No confusion about which `src/` folder to use
- ✅ Template generation works without crashes
- ✅ Clear separation between plugin code and server code
- ✅ Stable development workflow

### **Crash Issues Are Resolved When:**
- ✅ Server responds to health checks consistently
- ✅ Template generation completes without hanging
- ✅ AEM HTL requests return actual code instead of generic content
- ✅ No "connection refused" errors during development
- ✅ Figma plugin connects reliably to MCP server

---

**Key Takeaway**: Use the stable server (`server/server.js`) exclusively. The TypeScript server causes all the crash issues you're experiencing.