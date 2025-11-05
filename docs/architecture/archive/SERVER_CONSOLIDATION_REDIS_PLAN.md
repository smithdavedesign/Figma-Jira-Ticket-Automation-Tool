# 🔄 Server Consolidation & Redis Integration Plan

**Branch**: `feature/server-consolidation-redis`  
**Goal**: Consolidate dual server architecture and add Redis for persistent storage

## 📊 **Current Architecture Analysis**

### **What We Have:**
- **`server/app/server.ts`** - 129KB TypeScript server (development, crash-prone)
- **Dual architecture confusion** - Multiple npm scripts pointing to different servers

### **What We Need:**
- **Single stable server** with Redis integration
- **Persistent storage** for sessions, templates, user data
- **Scalable architecture** for multi-user support
- **Clean development workflow**

## 🎯 **Consolidation Strategy**

### **Phase 1: Server Consolidation (This Branch)**
1. **Archive complex TypeScript server**
2. **Create new hybrid server** combining best features
3. **Add Redis integration** for persistence
4. **Update all scripts** to use single server
5. **Maintain MCP tool compatibility**

### **Phase 2: Redis Integration**
1. **Session management** - User sessions, authentication states
2. **Template caching** - Fast template retrieval
3. **Component data storage** - Persistent Figma component analysis
4. **Rate limiting** - API usage tracking
5. **Multi-user support** - User-specific data isolation

## 🏗️ **New Architecture Design**

### **Target Structure:**
```
server/
├── server.js                 # 🆕 New hybrid server (Node.js + Redis)
├── lib/                     # 🆕 Compiled utilities from TypeScript
│   ├── redis-client.js      # Redis connection and utilities
│   ├── session-manager.js   # Session management
│   ├── template-cache.js    # Template caching system
│   └── mcp-tools.js         # MCP tool implementations
├── config/
│   ├── redis.config.js      # Redis configuration
│   └── server.config.js     # Server configuration
├── archive/
│   └── src/                 # 📁 Archived complex TypeScript server
└── package.json             # Updated dependencies with Redis
```

### **Redis Data Structure:**
```
Sessions:
  session:{sessionId} -> { userId, created, lastAccess, data }

Templates:
  template:{platform}:{type} -> { content, version, cached }

Components:
  component:{figmaId} -> { analysis, screenshots, metadata }

Users:
  user:{userId} -> { preferences, history, settings }

Rate Limits:
  ratelimit:{userId}:{endpoint} -> { count, resetTime }
```

## 🚀 **Implementation Steps**

### **Step 1: Setup Redis (10 min)**
- Install Redis locally
- Add Redis client dependencies
- Create Redis configuration

### **Step 2: Archive Current Server (5 min)**
- Move `server/src/` to `server/archive/`
- Extract useful utilities to `server/lib/`
- Update documentation

### **Step 3: Create New Hybrid Server (30 min)**
- Base on stable compiled server
- Add Redis integration
- Implement session management
- Add template caching
- Maintain MCP tool compatibility

### **Step 4: Update Scripts & Docs (10 min)**
- Update package.json scripts
- Update documentation
- Create migration guide

## 🎯 **Redis Integration Features**

### **Session Management**
```javascript
// Session creation and management
const session = await redis.createSession(userId, figmaData);
const sessionData = await redis.getSession(sessionId);
```

### **Template Caching**
```javascript
// Fast template retrieval
const template = await redis.getTemplate(platform, documentType);
if (!template) {
  template = await generateTemplate(platform, documentType);
  await redis.cacheTemplate(platform, documentType, template);
}
```

### **Component Analysis Storage**
```javascript
// Persistent component data
await redis.storeComponentAnalysis(figmaId, {
  analysis: designIntelligence,
  screenshot: base64Image,
  metadata: componentMetadata
});
```

## 📋 **Success Criteria**

### **Immediate (This Branch):**
- [ ] Single server startup command
- [ ] Redis integration working
- [ ] All MCP tools functional
- [ ] Session persistence
- [ ] Template caching active

### **Validation Tests:**
- [ ] Server starts without crashes
- [ ] Redis connection established
- [ ] Template generation works
- [ ] Session management functional
- [ ] All existing functionality preserved

## 🎉 **Expected Benefits**

1. **No More Crashes** - Single stable server foundation
2. **Persistent Storage** - Sessions and data survive restarts
3. **Better Performance** - Template caching, faster responses
4. **Scalability Ready** - Multi-user support foundation
5. **Clear Architecture** - No confusion about which server to use
6. **Phase 7 Ready** - Architecture prepared for live integration

---

**Next Actions:**
1. Install and configure Redis
2. Archive complex TypeScript server
3. Create new hybrid server with Redis
4. Test all functionality
5. Update documentation and scripts