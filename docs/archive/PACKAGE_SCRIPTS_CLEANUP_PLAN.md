# 📦 Package.json Scripts Cleanup Plan

## 🎯 **Essential Scripts to Keep**

### **Core Development**
- `start` / `start:server` - Start MCP server
- `start:dev` - Development mode with file watching
- `build` - Build plugin
- `build:ts` - TypeScript compilation
- `dev` - Development alias
- `clean` - Clean build artifacts
- `lint` - Code linting

### **Testing (Streamlined)**
- `test` - Primary test command (Vitest)
- `test:run` - Run tests once
- `test:watch` - Watch mode testing
- `test:coverage` - Coverage reports
- `test:mcp` - MCP integration tests
- `health` - System health check

### **Production**
- `deploy` - Production deployment
- `validate` - Complete validation
- `bundle` - Production bundle

## ❌ **Scripts to Remove (Too Many/Redundant)**

### **Redundant Test Scripts**
- `test:unit` (use `test` instead)
- `test:integration` (covered by Ultimate Test Suite)
- `test:system` (covered by Ultimate Test Suite)  
- `test:performance` (covered by Ultimate Test Suite)
- `test:browser:*` (12 variations! Use Ultimate Test Suite)
- `test:phase5*` (legacy phase testing)
- `test:all*` (redundant variations)
- `test:data:ui` (legacy)
- `test:ui` (legacy)
- `test:standalone` (duplicate of test:mcp)

### **Legacy Development Scripts**
- `dev:all` (redundant)
- `dev:watch` (redundant with start:dev)
- `watch` (redundant)
- `test:watch` (redundant echo command)

### **Server Scripts (Move to server/package.json)**
- `server:*` scripts should be in server package
- `mcp:*` scripts should be in server package

## 📊 **Result: ~60% Reduction**
- **Before**: ~50 scripts
- **After**: ~20 essential scripts
- **Removed**: ~30 redundant/legacy scripts