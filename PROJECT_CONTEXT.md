# 🎯 PROJECT CONTEXT & SCRIPT PATHS

## 📋 TESTING SCRIPT PATHS

### Unit Tests
- `tests/unit/test-tech-stack-parsing.js` - Core tech stack parsing logic
- Command: `npm run test:unit`

### Integration Tests  
- `tests/integration/test-standalone.mjs` - MCP data layer testing (standalone)
- `tests/integration/test-standalone.html` - Browser-based MCP testing
- `tests/integration/test-mcp-data-layer.html` - Professional MCP test dashboard
- `tests/integration/compliance-integration-tests.js` - Design system compliance
- `tests/integration/design-system-compliance-tests.mjs` - Design system suite
- Commands: 
  - `npm run test:integration` - All integration tests
  - `npm run test:integration:mcp` - MCP-specific testing

### System Tests
- `tests/system/` - End-to-end system validation
- Command: `npm run test:system`

### Live Tests
- `tests/live/LIVE_FIGMA_INTEGRATION_TEST.md` - Live Figma testing guide
- `tests/live/live-figma-test.js` - Live Figma plugin testing
- Command: `npm run test:live`

### Browser Tests (Playwright)
- `browser-tests/` - Playwright browser automation
- `browser-tests/tests/core-functionality.spec.js` - Core UI testing
- `browser-tests/playwright.config.js` - Playwright configuration
- Commands:
  - `npm run test:browser` - Full browser suite
  - `npm run test:browser:smoke` - Essential functionality
  - `npm run test:browser:quick` - Single UI test

### Performance Tests
- `tests/performance/` - Performance and load tests
- Command: `npm run test:performance`

## 🚀 STARTUP SCRIPT PATHS

### MCP Server
- **Directory**: `mcp-server/`
- **Source**: `mcp-server/src/server.ts`
- **Environment**: `mcp-server/.env`
- **Startup Commands**:
  - `cd mcp-server && npx tsx src/server.ts` - Direct TypeScript execution
  - `cd mcp-server && npm run dev` - Development mode
  - `cd mcp-server && npm run build && npm start` - Production build

### Plugin Development
- **Main Code**: `code.ts` - Main plugin TypeScript code
- **UI**: `ui/index.html` - Plugin user interface
- **Manifest**: `manifest.json` - Figma plugin configuration
- **Build Commands**:
  - `npm run build:ts` - Build TypeScript to dist/
  - `npm run watch` - Watch mode for development

### System Health & Validation
- `npm run health` - System health check (no servers needed)
- `npm run health:start` - Health check + auto-start servers
- `npm run validate:quick` - Quick complete validation

## 📁 KEY DIRECTORIES

### Source Code
- `src/` - TypeScript source code
- `ui/` - Plugin UI components
- `dist/` - Built plugin files (auto-generated)

### Testing
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests (reorganized from root)
- `tests/system/` - System tests
- `tests/live/` - Live testing guides
- `tests/performance/` - Performance tests
- `browser-tests/` - Playwright browser tests (separate framework)

### Documentation
- `docs/` - All project documentation
- `docs/testing/` - Testing documentation
- `docs/testing/TEST_ORGANIZATION_RULES.md` - Test file placement rules
- `docs/testing/TESTING_OPTIONS.md` - MCP testing guide

### Configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - NPM scripts and dependencies
- `config/eslint.config.js` - ESLint configuration
- `.env` - Environment variables (Gemini API key)

## 🔧 DEVELOPMENT WORKFLOW

### Quick Development Cycle
```bash
# 1. Build plugin
npm run build:ts

# 2. Test MCP integration
npm run test:integration:mcp  

# 3. Health check
npm run health
```

### Full Testing Cycle
```bash
# 1. System validation
npm run validate:quick

# 2. All tests
npm run test:all:quick

# 3. Browser tests
npm run test:browser:smoke
```

### Live Figma Testing
```bash
# 1. Start MCP server
cd mcp-server && npx tsx src/server.ts

# 2. Build plugin
npm run build:ts

# 3. Load plugin in Figma and test AI integration
# (See tests/live/LIVE_FIGMA_INTEGRATION_TEST.md)
```

## 🎯 CRITICAL PATHS FOR AI INTEGRATION TESTING

### MCP Server Startup
- **Path**: `mcp-server/src/server.ts`
- **Command**: `cd mcp-server && npx tsx src/server.ts`
- **Port**: 3000
- **Health Check**: `curl -s http://localhost:3000/`

### Plugin Build & Load
- **Build**: `npm run build:ts`
- **Manifest**: `manifest.json`
- **Load in Figma**: Plugins → Development → Import plugin from manifest

### Data Layer Testing
- **Standalone**: `npm run test:integration:mcp`
- **Browser**: Open `tests/integration/test-standalone.html`
- **Dashboard**: Open `tests/integration/test-mcp-data-layer.html`

### Live Integration Testing
- **Guide**: `tests/live/LIVE_FIGMA_INTEGRATION_TEST.md`
- **Process**: Select frame → Open plugin → Click "AI Ticket" → Verify data flow

## 🚨 ORGANIZATIONAL RULES

### Test File Placement (NEVER BREAK THESE)
- **Unit tests**: `tests/unit/`
- **Integration tests**: `tests/integration/`
- **System tests**: `tests/system/`
- **Live tests**: `tests/live/`
- **Browser tests**: `browser-tests/`
- **Documentation**: `docs/testing/`
- **❌ NEVER place tests in root directory!**

### NPM Script Conventions
- `test:[category]` - Run category tests
- `test:[category]:[specific]` - Run specific test
- `build:*` - Build operations
- `health*` - System health checks

## 🔍 DEBUGGING & MONITORING

### Server Checks
- **Port check**: `lsof -i :3000`
- **Health**: `curl -s http://localhost:3000/`
- **MCP tools**: `curl -s http://localhost:3000/ | jq '.tools'`

### Plugin Debug
- **Build check**: Verify `dist/` has updated files
- **Console**: Check Figma console for debug messages
- **UI**: Monitor debug panel in plugin interface

### Test Validation
- **MCP**: `npm run test:integration:mcp`
- **Schema**: Check validation output in tests
- **AI**: Verify Gemini API responses in server logs

This comprehensive context ensures all team members know exactly where to find and how to run every aspect of the testing and development system.