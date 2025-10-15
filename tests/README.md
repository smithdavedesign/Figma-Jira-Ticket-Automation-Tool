# Tests Directory

This directory contains all test files organized by test type and purpose.

## Structure

### 📁 `integration/`
Integration tests that verify component interactions:
- `compliance-integration-tests.js` - Design system compliance integration
- `design-system-compliance-tests.mjs` - Design system testing suite
- `test-figma-integration.js` - Figma API integration tests
- `test-ui-integration.js` - UI component integration tests

### 📁 `unit/`
Unit tests for individual components:
- `test-tech-stack-parsing.js` - Tech stack parsing logic tests
- `test-ai-final.mjs` - AI service unit tests
- `test-enhanced-figma-mcp.mjs` - MCP server unit tests

### 📁 `system/`
System integration tests for full pipeline validation:
- `comprehensive-e2e-test.mjs` - Complete system integration testing
- `test-results/` - System test execution results

### 📁 `../browser-tests/` (Playwright)
Browser automation and UI testing (separate from this directory):
- Cross-browser compatibility testing
- Accessibility testing with screen readers
- Visual regression testing
- UI interaction testing

### 📁 `live/`
Live system tests with real services:
- `live-figma-test.js` - Live Figma plugin testing
- `live-system-test.js` - Live system validation
- `test-plugin-connectivity.html` - Plugin connectivity testing

### 📁 `performance/`
Performance and stress testing:
- `stress-test-suite.mjs` - System stress testing
- `test-enhanced-generation.mjs` - Generation performance tests

## Running Tests

### All Tests
```bash
# Run all test categories
npm test
```

### Specific Test Categories
```bash
# Integration tests
node tests/integration/compliance-integration-tests.js

# Unit tests
node tests/unit/test-tech-stack-parsing.js

# System integration tests
node tests/system/comprehensive-e2e-test.mjs

# Live tests (requires running servers)
node tests/live/live-system-test.js

# Performance tests
node tests/performance/stress-test-suite.mjs
```

### Playwright Browser Tests
```bash
cd browser-tests
npm test
```

## Test Requirements

- **Unit Tests**: No external dependencies
- **Integration Tests**: May require MCP server
- **System Tests**: Require full system running (MCP + Web servers)
- **Live Tests**: Require MCP server (port 3000) and web server
- **Performance Tests**: Require full system under load
- **Browser Tests**: Require browsers installed, separate Playwright setup

## Test Coverage

The test suite covers:
- ✅ Core functionality
- ✅ AI integration
- ✅ Design system compliance
- ✅ Tech stack validation  
- ✅ UI/UX components
- ✅ MCP server integration
- ✅ Figma plugin functionality
- ✅ Performance under load
- ✅ Cross-browser compatibility (Playwright)
- ✅ Accessibility standards (Playwright)
- ✅ System integration and workflows