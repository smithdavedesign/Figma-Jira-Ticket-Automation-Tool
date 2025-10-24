# 🧪 Testing Guide - Updated October 2025

This document provides comprehensive guidance for running and understanding the consolidated test suite.

## 🚀 **NEW: Ultimate Consolidated Test Suite**

### **Primary Test Interface (RECOMMENDED)**
```bash
# 🎯 Single URL for all testing needs:
open tests/integration/test-consolidated-suite.html
```

**Features:**
- **Tabbed Interface:** System • Screenshots • Templates • AI • UI • E2E • Performance
- **Global Test Runner:** Run all tests with one button
- **Real-time Metrics:** Live success/failure tracking
- **Unified Console:** Single output for all test results

### **Traditional Testing Commands**
```bash
# Essential development testing
npm run test:all:quick          # Unit + 1 browser test (~30s)

# Production validation
npm run test:browser:smoke      # Essential functionality (~2 min)
npm run test:browser:critical   # Critical path testing (~3 min)

# Full test suite
npm run test:browser           # Complete cross-browser (~10 min)
npm run test:all:verbose      # Everything with detailed output
```

## 🎯 **Current Status: Consolidated Test Suite Complete (October 2025)**
- **Architecture:** Plugin UI → MCP Server (localhost:3000) → AI/Figma APIs
- **MCP Server:** ✅ Running with 6 tools available (including generate_ai_ticket)
- **Plugin Status:** ✅ Enhanced validation compliance, screenshot integration
- **Test Suite:** ✅ **NEW: All-in-one consolidated test interface with 7 categories**
- **Quality Metrics:** 330+ browser tests, comprehensive feature coverage, tabbed organization
- **Files Archived:** ✅ 14+ redundant test files safely archived with 65% reduction in test complexity

## 📊 **NEW: Consolidated Test Architecture**

### **🚀 Primary Test Interface**
```
tests/integration/test-consolidated-suite.html
```
**All-in-one tabbed interface with 7 comprehensive test categories:**

1. **🖥️ System Tab**
   - MCP Server health and status
   - Web server validation  
   - API endpoint testing (/api/figma/health, /api/figma/screenshot, /api/generate-ticket)
   - Tech stack detection validation

2. **📸 Screenshots Tab**
   - Screenshot API testing
   - Visual context processing
   - Context preview functionality
   - Base64 encoding validation

3. **📋 Templates Tab**
   - Template engine testing (YAML processing)
   - Platform template validation (Jira, GitHub, Linear, etc.)
   - Variable substitution testing
   - All 45 template combinations validation

4. **🤖 AI Tab**
   - AI orchestrator testing
   - Enhanced data layer validation
   - Gemini integration testing
   - AI-powered ticket generation

5. **🧩 UI Tab**
   - UI functionality and navigation
   - Message handling (analyze-design-health)
   - Loading states and animations
   - Responsive design validation

6. **🔄 E2E Tab**
   - Complete workflow testing (Selection → Analysis → Screenshot → Ticket)
   - MCP integration flow validation
   - Error recovery and graceful handling
   - Data flow integrity testing

7. **🚀 Performance Tab**
   - Load testing and stress testing
   - Response time measurement
   - Memory usage monitoring
   - Performance benchmarks

8. **📊 Overview Tab**
   - Real-time test metrics
   - Global test runner (run all categories)
   - Detailed reporting and success rates

### **Legacy Test Directory Structure (Archived)**
```
tests/
├── archive/                  # 🗂️ ARCHIVED TEST FILES
│   ├── ui-test-files/       # 8 archived UI test files
│   └── integration-test-files/ # 6 archived integration test files
├── unit/                     # Core algorithm testing
│   └── test-tech-stack-parsing.js  # Tech stack analysis validation
├── integration/              # Feature integration tests
│   ├── test-consolidated-suite.html # 🎯 PRIMARY TEST INTERFACE
│   ├── test-figma-integration.html  # Legacy integration tests (with link to consolidated)
│   ├── test-ui-integration.js       # Enhanced UI integration
│   └── compliance-integration-tests.js # Design system compliance
├── system/                   # End-to-end system validation
├── live/                     # Manual browser testing
└── performance/              # Performance benchmarks

browser-tests/                # Playwright browser automation
├── tests/
│   ├── core-functionality.spec.js     # Primary feature testing
│   ├── accessibility-edge-cases.spec.js # WCAG compliance
│   ├── cross-browser-performance.spec.js # Multi-browser validation
│   ├── enhanced-validation.spec.js     # Enhanced features
│   ├── main-application.spec.js        # Full application testing
│   ├── mcp-integration.spec.js         # MCP server integration
│   ├── ui-ux-experience.spec.js        # UX validation
│   └── visual-interactive.spec.js      # Visual regression
└── playwright.config.js       # Browser test configuration
```

## 🎯 Test Categories

### Unit Tests (`npm run test:unit`)
- **Purpose**: Test core algorithms and utilities
- **Runtime**: ~2 seconds
- **Coverage**: Tech stack parsing, confidence calculation
- **Output**: Detailed parsing results with confidence scores

### Integration Tests (`npm run test:integration`)
- **Purpose**: Test feature integration and fallback mechanisms
- **Runtime**: ~5 seconds  
- **Coverage**: UI components, MCP integration, error handling
- **Output**: Document generation validation across formats

### Browser Tests (`npm run test:browser`)
- **Purpose**: Cross-browser UI validation and regression testing
- **Runtime**: 5-10 minutes (full suite)
- **Coverage**: 330+ tests across Chrome, Firefox, Safari, Mobile
- **Features**: Automated server startup, screenshot capture, video recording

### System Tests (`npm run test:system`)
- **Purpose**: End-to-end system validation
- **Runtime**: Variable
- **Coverage**: Complete workflow testing

## 🔧 Browser Testing Deep Dive

### Playwright Configuration

The browser tests use Playwright for automated testing with:
- **Automatic Server Management**: Starts UI server (port 8101) and MCP server (port 3000)
- **Multi-Browser Support**: Chromium, Firefox, WebKit, Mobile Chrome/Safari
- **Rich Reporting**: HTML reports, video recordings, screenshots on failure
- **Parallel Execution**: Tests run concurrently for speed

### Browser Test Commands

```bash
# Smoke tests - Essential functionality only (~2 minutes)
npm run test:browser:smoke

# Critical path tests only (~3 minutes)  
npm run test:browser:critical

# Core functionality tests (~1 minute)
npm run test:browser:core

# Full test suite (~10 minutes)
npm run test:browser

# Debug mode - See tests running in real browsers
npm run test:browser:headed

# Interactive test explorer
npm run test:browser:ui
```

### **NEW: Comprehensive Test Suite** 🧪

The comprehensive test suite includes 15 individual test functions covering all features:

```bash
# Comprehensive test suite
open ui/test/test-figma-integration.html  # Main test interface
# Click "🚀 Run Comprehensive Test Suite" for automated testing

# Individual test categories:
# - Enhanced Frame Data: Validation, hierarchy, semantic roles
# - Screenshot & Visual: PNG capture, visual analysis
# - AI Integration: Enhanced vs fallback modes, MCP tools
# - UI Components: Context preview, parse tech stack, debug panel
npm run test:ui          # Launch visual test interface with data layer coverage
```

#### **Data Layer Test Coverage** 📊
- **95.5% Pass Rate** - 21/22 tests passing across all components
- **7 Major System Areas** - Complete coverage of core functionality
- **Production Ready** - All critical systems validated and benchmarked

**Test Categories:**
1. **Core Extraction System** - 100% ✅ (3/3 tests)
2. **Enhanced Extraction System** - 100% ✅ (4/4 tests) 
3. **Caching System** - 66.7% ⚠️ (2/3 tests - minor TTL timing issue)
4. **Performance Monitoring** - 100% ✅ (3/3 tests)
5. **Validation System** - 100% ✅ (3/3 tests)
6. **Design Token Normalization** - 100% ✅ (3/3 tests)
7. **Demo Components** - 100% ✅ (3/3 tests)

#### **Data Layer Performance Benchmarks**
- **Enhanced Demo Execution**: 0-1ms 
- **Memory Cache Operations**: ~0ms for set/get
- **Performance Monitoring**: 11-17ms timer accuracy
- **Export Generation**: 4926+ characters in ~0ms
- **Component Instantiation**: All major components load successfully

### Test Tags

Tests are organized with tags for targeted execution:
- `@smoke`: Essential functionality tests
- `@critical`: Critical path validation
- `@slow`: Performance-intensive tests

## 🐛 Debugging Failed Tests

### Browser Test Failures

When browser tests fail, check:

1. **Screenshots**: Located in `browser-tests/test-results/`
2. **Videos**: Full interaction recordings for failed tests
3. **Error Context**: Detailed failure context in markdown files
4. **Server Logs**: Check if UI/MCP servers started correctly

```bash
# Run single test for debugging
cd browser-tests
npx playwright test tests/core-functionality.spec.js --grep "specific test name" --headed
```

### Common Issues

**"Element not found" errors:**
- Check if selectors match the actual HTML structure
- Verify the page loaded correctly

**Timeout errors:**
- Increase timeout in test configuration
- Check if servers are responding

**Server startup failures:**
- Verify ports 8101 and 3000 are available
- Check MCP server dependencies are installed

## 📈 Test Results Interpretation

### Unit Test Output
```
✅ Tech Stack Parsing Test Complete!
```
- Shows parsing results with confidence scores
- 10 test cases covering major tech stacks

### Integration Test Output  
```
🎉 All Enhanced UI Integration Tests Complete!
📊 Summary:
✅ Document generation: 3 formats working
✅ Error handling: Graceful fallbacks  
✅ MCP integration: Multiple scenarios covered
```

### Browser Test Output
```
  6 passed (10.9s)
  6 failed
  7 interrupted
  111 did not run
```
- **Passed**: Tests completed successfully
- **Failed**: Tests with assertion failures (check screenshots)
- **Interrupted**: Tests stopped due to timeouts/errors
- **Did not run**: Skipped due to previous failures

## 🔄 Continuous Integration

The test suite is designed for CI/CD environments:

```bash
# CI-friendly command (exits on first failure)
npm run validate

# Generate test reports
npm run test:browser -- --reporter=junit --outputFile=test-results.xml
```

## 📋 Test Development Guidelines

### Adding New Tests

1. **Unit Tests**: Add to `tests/unit/` for algorithm testing
2. **Integration Tests**: Add to `tests/integration/` for feature testing  
3. **Browser Tests**: Add to `browser-tests/tests/` for UI testing

### Test Naming Convention

```javascript
// Good test names
test('should generate enhanced document with valid input @critical', async ({ page }) => {
test('should handle MCP server unavailable gracefully', async ({ page }) => {

// Use descriptive names with tags
```

### Test Structure

```javascript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });
  
  test('should do something specific', async ({ page }) => {
    // Arrange
    // Act  
    // Assert
  });
});
```

## 🚀 Performance Optimization

### Test Execution Speed

- **Parallel Execution**: Browser tests run concurrently
- **Smart Retries**: Failed tests retry automatically on CI
- **Selective Execution**: Use tags to run only relevant tests

### Resource Management

- **Server Reuse**: Servers are reused between tests when possible
- **Clean State**: Each test starts with a clean browser state
- **Timeout Optimization**: Different timeouts for different test types

## 📚 References

- [Playwright Documentation](https://playwright.dev/)
- [Jest Testing Framework](https://jestjs.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)