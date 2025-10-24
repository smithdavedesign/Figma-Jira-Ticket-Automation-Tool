# Test Organization Rules

## 🚨 CRITICAL RULES FOR TEST FILE PLACEMENT

**NEVER place test files in the root directory!** All tests must go in the appropriate subdirectory.

## 📁 Directory Structure

### `tests/` - Main Test Directory
```
tests/
├── unit/           # Unit tests for individual functions/modules
├── integration/    # Integration tests (MCP, API, component integration)
├── system/         # Full system tests
├── live/           # Live/manual tests requiring external services
├── performance/    # Performance and load tests
└── phase*/         # Phase-specific test suites
```

### `browser-tests/` - Playwright Browser Tests
```
browser-tests/
├── tests/          # Playwright test specs
├── playwright.config.js
└── package.json    # Separate test dependencies
```

### `docs/testing/` - Test Documentation
```
docs/testing/
├── guides/         # Testing guides and procedures
├── reports/        # Test reports and results
└── *.md           # Test documentation files
```

## 🎯 File Placement Rules

### Unit Tests (`tests/unit/`)
- **Pattern**: `*.test.js`, `*.spec.js`
- **Purpose**: Test individual functions, classes, utilities
- **Examples**: 
  - `schema-validation.test.js`
  - `data-extraction.test.js`
  - `ai-prompt-generation.test.js`

### Integration Tests (`tests/integration/`)
- **Pattern**: `test-*.js`, `*-integration.test.js`, `*.html` (for browser-based)
- **Purpose**: Test component interactions, API integrations
- **Examples**:
  - `test-standalone.mjs` (MCP data layer testing)
  - `test-mcp-data-layer.html` (Browser-based MCP testing)
  - `figma-api-integration.test.js`

### System Tests (`tests/system/`)
- **Pattern**: `system-*.js`, `e2e-*.js`
- **Purpose**: End-to-end workflow testing
- **Examples**:
  - `system-figma-to-jira.test.js`
  - `e2e-plugin-workflow.test.js`

### Live Tests (`tests/live/`)
- **Pattern**: `live-*.js`, `manual-*.html`
- **Purpose**: Tests requiring live services (Figma API, Gemini API)
- **Examples**:
  - `live-figma-integration.test.js`
  - `manual-ai-generation.html`

### Browser Tests (`browser-tests/tests/`)
- **Pattern**: `*.spec.js` (Playwright convention)
- **Purpose**: UI automation, cross-browser testing
- **Examples**:
  - `core-functionality.spec.js`
  - `accessibility.spec.js`

## 📋 NPM Script Naming Convention

### Pattern: `test:[category]:[subcategory]`

```json
{
  "test:unit": "Run unit tests",
  "test:integration": "Run integration tests", 
  "test:integration:mcp": "Run MCP integration tests",
  "test:system": "Run system tests",
  "test:live": "Run live tests",
  "test:browser": "Run browser tests",
  "test:browser:smoke": "Run smoke tests",
  "test:all": "Run all tests",
  "test:watch": "Run tests in watch mode"
}
```

## 🔧 File Creation Guidelines

### Before Creating Any Test File:

1. **Determine the test type**: Unit, Integration, System, Live, or Browser?
2. **Check the appropriate directory**: Use the structure above
3. **Follow naming conventions**: Use consistent patterns
4. **Update npm scripts**: Add to package.json if needed
5. **Update documentation**: Document new tests

### Test File Template:

```javascript
/**
 * [Test Type] Test: [Description]
 * 
 * Location: tests/[category]/[filename]
 * Purpose: [What this test validates]
 * Dependencies: [External services/files required]
 * 
 * Usage: npm run test:[category] or node tests/[category]/[filename]
 */
```

## 🚨 Common Mistakes to Avoid

1. **❌ DON'T**: Create test files in root directory
2. **❌ DON'T**: Mix test types in wrong directories
3. **❌ DON'T**: Forget to update npm scripts
4. **❌ DON'T**: Skip documentation updates
5. **❌ DON'T**: Use inconsistent naming patterns

## ✅ Quality Checklist

Before committing test files:

- [ ] File is in correct directory
- [ ] Follows naming convention
- [ ] NPM script updated (if needed)
- [ ] Documentation updated
- [ ] Test runs successfully
- [ ] No files left in root directory

## 🔄 Refactoring Existing Tests

When moving existing test files:

1. **Move to correct directory**
2. **Update all npm scripts**
3. **Update import paths**
4. **Update documentation**
5. **Test all scripts work**
6. **Clean up old references**

## 📊 Current Test Structure Status

```
✅ tests/unit/ - Organized
✅ tests/integration/ - Reorganized (moved from root)
✅ tests/system/ - Organized  
✅ tests/live/ - Organized
✅ browser-tests/ - Separate framework (OK)
❌ Root directory - Must stay clean!
```

## 🎯 Enforcement

This document serves as the definitive guide for test organization. Any deviation from these rules should be immediately corrected to maintain project organization and prevent technical debt.