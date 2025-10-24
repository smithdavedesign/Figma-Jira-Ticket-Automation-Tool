# 🧪 Test Directory - Updated October 2025

This directory contains all test files for the Figma AI Ticket Generator project. **All test files have been organized, validated, and updated with latest infrastructure improvements.**

## ✅ Recent Test Infrastructure Updates (October 23, 2025)

### **🔧 Major Port & Endpoint Corrections:**
- **Fixed:** All test files updated from localhost:8081 → localhost:3000 ✅
- **Added:** /api/figma/health, /api/figma/screenshot, /api/generate-ticket endpoints ✅
- **Validated:** Screenshot API testing 5/5 tests passing ✅
- **Confirmed:** Template generation system 45/45 combinations working ✅
- **Enhanced:** Message handling for analyze-design-health ✅

### **🎯 Test Validation Results:**
- **MCP Server:** 6/6 tools operational on port 3000 ✅
- **Integration Tests:** All 25 test functions working with correct endpoints ✅  
- **UI Tests:** Navigation buttons and functionality validated ✅
- **API Tests:** All endpoints returning HTTP 200 OK ✅
- **System Health:** Comprehensive validation completed ✅

## 📁 Test Structure

### 🔧 Unit Tests (`unit/`)
- `core-tests.js` - Basic functionality tests
- `simple-test.js` - Simple unit test cases
- `test-tech-stack-parsing.js` - Tech stack parsing logic tests  
- `test-enhanced-figma-mcp.mjs` - MCP integration unit tests
- `test-ai-final.mjs` - AI processing unit tests
- `test-visual-context-validation.mjs` - Visual context validation tests
- `react-mcp-adapter.test.js` - React MCP adapter tests

### 🔗 Integration Tests (`integration/`) - ✅ ALL UPDATED
- `test-figma-integration.html` - **Main integration test interface** ✅ **UPDATED:**
  - Fixed all quick access links to localhost:3000
  - Updated API endpoint references for screenshot and health checks  
  - All 25 test functions now working with correct port references
  - Screenshot API testing: 5/5 tests passing
  - Template generation system: 45/45 combinations working
- `test-figma-integration.js` - Figma integration JavaScript tests ✅
- `test-screenshot-fix.html` - Screenshot functionality tests ✅
- `test-template-fix-validation.html` - Template system validation ✅  
- `test-template-selection-debug.html` - Template selection debugging ✅
- `test-parse-tech-stack.html` - Tech stack parsing tests ✅
- `test-mcp-data-layer.html` - MCP data layer integration ✅
- `test-standalone.html` - Standalone UI tests ✅
- `test-standalone.mjs` - Standalone MCP data layer testing ✅
- `test-end-to-end-workflow.mjs` - **Complete E2E workflow validation (100/100 score)** ✅
- `test-ui-integration.js` - UI integration tests ✅
- `ai-orchestrator-integration.test.js` - AI orchestration tests ✅
- `compliance-integration-tests.js` - Design system compliance ✅
- `design-system-compliance-tests.mjs` - Enhanced design system compliance ✅
- `phase3-functional-test.js` - Phase 3 functionality tests ✅
- `phase3-integration-test.js` - Phase 3 integration tests ✅

### 🚀 Performance Tests (`performance/`)
- `stress-test-suite.mjs` - Load and stress testing
- `test-enhanced-generation.mjs` - Generation performance tests
- `test-performance-benchmarking.mjs` - Performance benchmarks

### 🔴 Live Tests (`live/`)
- `live-figma-test.js` - Live Figma plugin tests
- `live-system-test.js` - Live system integration
- `test-plugin-connectivity.html` - Plugin connectivity tests

### 🏗️ System Tests (`system/`)
- `comprehensive-e2e-test.mjs` - End-to-end workflow tests
- `end-to-end-pipeline.test.js` - Full pipeline integration
- `phase4-production-integration.test.js` - Production environment tests

### 🌐 Browser Tests (`../browser-tests/`)
- `modern-ui-validation.spec.js` - **Modern UI validation with current elements**
- `e2e-workflow-improvements.spec.js` - **Enhanced E2E workflow browser testing**
- `playwright.config.js` - Playwright configuration with auto-start servers

### 📚 Legacy Phase Tests (`phase1/`)
- Historical test files from development phases

## 🎯 Key Test Files

### ⭐ Main Testing Interfaces - **ALL VALIDATED ✅**

#### **🚀 NEW: Ultimate Consolidated Test Suite** ✅
- **`integration/test-consolidated-suite.html`** - **PRIMARY TEST INTERFACE** ✅
  - **All-in-one tabbed interface** with 7 test categories
  - System Health • Screenshots • Templates • AI • UI • E2E • Performance
  - **Unified console output** and global test metrics
  - **Master test runner** for comprehensive validation
  - **Enhanced reporting** with detailed success/failure tracking

#### **Legacy Test Interfaces** (Still Active)
- **`integration/test-figma-integration.html`** - **Original integration tests** ✅
  - Complete Figma integration testing with 25 test functions
  - All quick access links working with localhost:3000
  - Now includes prominent link to consolidated suite
- **`integration/test-end-to-end-workflow.mjs`** - Complete E2E workflow validation (100/100 score) ✅
- **`../browser-tests/`** - 80 Playwright browser tests + integration + unit tests ✅
- **`../ui/test/test-ui-functionality.html`** - **UI COMPONENT TESTING** ✅
  - Fixed all navigation button port references (8081→3000)
  - testStandaloneUI(), testFigmaPlugin(), testContextPreview() working
  - All URLs return HTTP 200 OK with proper content

### 🚀 Top-Level Test Files - **PRODUCTION READY** ✅
- `comprehensive-e2e-test.js` - Comprehensive end-to-end testing ✅
- `figma-context-integration.test.js` - Figma context integration validation ✅

## 🎯 Test Command Reference (Updated MVC Architecture)

### **Start MCP Server (Required for Integration Tests):**
```bash
npm run start:mvc              # Start MCP server (app/server/main.js)
curl http://localhost:3000/    # Verify server health
```

### **Run Test Suites:**
```bash
# Integration Testing
npm run test:integration:mcp   # MCP server integration tests
curl http://localhost:3000/api/figma/health  # API health check

# Browser Testing (requires UI server)
python3 -m http.server 8101   # Start UI server for browser tests
npm run test:browser:quick    # 80 Playwright tests

# Unit Testing  
npm run test:unit             # Core business logic tests (11/11 passing)

# System Validation
npm run health                # System health validation
npm run validate              # Full system validation
```

### **Access Test UIs:**
```bash
# 🚀 NEW: Ultimate consolidated test suite (RECOMMENDED)
open tests/integration/test-consolidated-suite.html

# Legacy individual test interfaces
open tests/integration/test-figma-integration.html           # Original integration tests
open http://localhost:3000/ui/test/test-ui-functionality.html # UI functionality tests
open http://localhost:3000/ui/test/enhanced-data-layer-demo.html # Data layer demo
```

### **🎯 Recommended Testing Workflow:**
1. **Start with Consolidated Suite:** `tests/integration/test-consolidated-suite.html`
2. **Use tabbed interface** to run tests by category (System, Screenshots, Templates, etc.)
3. **Run "Complete Test Suite"** for comprehensive validation
4. **Check individual specialized tests** as needed for deeper analysis