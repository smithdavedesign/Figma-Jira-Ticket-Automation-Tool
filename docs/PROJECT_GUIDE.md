# 📁 Project Structure & Production Guide

## 🚀 Production-Ready Files (Use These!)

### **For Figma Plugin Development:**
```json
{
  "main": "code.js",           // ✅ ROOT: Latest compiled plugin code
  "ui": "ui/index.html"        // ✅ UI: Production-ready with all features
}
```

### **Key Production Files:**
- **`manifest.json`** - Plugin configuration (ROOT)
- **`code.js`** - Main plugin code (ROOT) 
- **`ui/index.html`** - Full-featured UI (103KB+, includes ContextPreview)
- **`server/dist/server.js`** - MCP server build
- **`server/src/ai/templates/`** - Template system

## 📁 Complete Project Structure

### **Root Files**
- `package.json` - Main project configuration and scripts
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `manifest.json` - Figma plugin manifest
- `code.js` - Compiled plugin code (main entry point)
- `code.ts` - Plugin source code (TypeScript)
- `README.md` - Main project documentation
- `LICENSE` - Project license

### **Directory Structure**

#### `/src/` - Source Code
Main TypeScript source code organized by functionality:
- `core/` - Core business logic and types
- `plugin/` - Figma plugin-specific code
- `shared/` - Shared utilities and interfaces
- `ui/` - UI-related TypeScript code

#### `/ui/` - User Interface
- `index.html` - Main UI file (production-ready)
- `test/` - UI testing files
- `components/` - Reusable UI components

#### `/server/` - MCP Server
- `src/` - Server source code
  - `ai/` - AI integration and templates
  - `figma/` - Figma API integration
  - `data/` - Data processing
- `dist/` - Compiled server code
- `package.json` - Server dependencies

#### `/tests/` - Testing
- `unit/` - Unit tests
- `integration/` - Integration tests
- `performance/` - Performance tests
- `system/` - System tests
- `live/` - Live environment tests

#### `/browser-tests/` - Browser Testing
- Playwright-based browser automation
- Cross-browser compatibility tests
- UI interaction validation

#### `/docs/` - Documentation
- Comprehensive project documentation
- User guides and technical specifications

## ❌ **Files to Avoid**

### **Build Artifacts:**
- `dist/code.js` - May be outdated build output
- Old `ui/plugin/index.html` - Removed during cleanup

### **Legacy Files:**
- Removed completion status files
- Consolidated documentation duplicates

## 🛠️ Development Workflow

### **Starting Development:**
1. Install dependencies: `npm install`
2. Start MCP server: `cd server && npm run dev`
3. Build plugin: `npm run build`
4. Test in Figma: Load plugin from root directory

### **Testing:**
1. Unit tests: `npm test`
2. Browser tests: `cd browser-tests && npm test`
3. Integration tests: `npm run test:integration`

### **Production Deployment:**
1. Build all components: `npm run build`
2. Verify server build: `cd server && npm run build`
3. Test production build: Browser tests
4. Deploy server: Use built `server/dist/server.js`

## 📊 Current Status

### ✅ **Production Ready Features**
- **API Timeout Protection** - 30s timeouts with retry logic
- **Memory Protection** - Smart processing limits for large selections
- **Error Handling** - Comprehensive error classes and recovery
- **Progress Tracking** - Professional step-by-step indicators
- **Data Integrity** - Serialization validation and safety
- **Smart Figma Links** - Multi-method file key detection
- **Centralized Logging** - Structured logging with UI integration
- **Testing Framework** - Comprehensive automated testing

### 🎯 **Architecture Highlights**
- Clean separation of concerns
- Modular component architecture
- Enterprise-grade error handling
- Professional user experience
- Comprehensive testing coverage

---

**Version**: 1.2.0 | **Status**: Production Ready 🚀 | **Last Updated**: October 22, 2025