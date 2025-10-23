# Browser Tests (Playwright)

This directory contains **browser automation tests** using Playwright for comprehensive UI and cross-browser testing.

## Purpose

These tests validate the **actual user experience** in real browsers, including:
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Accessibility with screen readers
- Visual regression testing
- UI interaction testing
- Performance in browser environments

## Test Categories

### `tests/`
- `accessibility-edge-cases.spec.js` - Screen reader and a11y testing
- `core-functionality.spec.js` - Core UI functionality testing
- `cross-browser-performance.spec.js` - Performance across browsers
- `enhanced-validation.spec.js` - UI validation and error handling
- `main-application.spec.js` - Main application workflows
- `mcp-integration.spec.js` - MCP server integration in browser
- `ui-ux-experience.spec.js` - User experience validation
- `visual-interactive.spec.js` - Visual and interaction testing

## Running Tests

```bash
# Install dependencies (if not already done)
npm install

# Run all browser tests
npm test

# Run specific test file
npx playwright test core-functionality.spec.js

# Run with UI mode for debugging
npx playwright test --ui

# Generate test report
npx playwright show-report
```

## Distinction from `/tests/`

- **`/browser-tests/`** (this directory): Browser automation with Playwright
  - Tests actual UI in real browsers
  - Visual regression testing
  - Cross-browser compatibility
  - Accessibility testing

- **`/tests/`** (root level): Node.js system testing
  - API and MCP server testing
  - System integration testing
  - Unit and integration tests
  - Performance benchmarking

Both are essential but serve different testing needs!