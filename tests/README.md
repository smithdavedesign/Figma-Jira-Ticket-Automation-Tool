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

### 📁 `e2e/`
End-to-end tests for full system validation:
- `comprehensive-e2e-test.mjs` - Complete system E2E testing
- `test-results/` - E2E test execution results
- `../e2e-tests/` - Playwright E2E test suite (separate structure)

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

# E2E tests
node tests/e2e/comprehensive-e2e-test.mjs

# Live tests (requires running servers)
node tests/live/live-system-test.js

# Performance tests
node tests/performance/stress-test-suite.mjs
```

### Playwright E2E Tests
```bash
cd e2e-tests
npm test
```

## Test Requirements

- **Unit Tests**: No external dependencies
- **Integration Tests**: May require MCP server
- **E2E Tests**: Require full system running
- **Live Tests**: Require MCP server (port 3000) and web server
- **Performance Tests**: Require full system under load

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
- ✅ Cross-browser compatibility
- ✅ Accessibility standards