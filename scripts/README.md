````markdown
# Scripts Directory - Production Ready

**Last Updated:** November 12, 2025  
**Status:** ✅ Cleaned & Organized - Essential Scripts Only

This directory contains essential production scripts for the Figma AI Ticket Generator.

## 🚀 **Production Scripts**

### **Build & Development**
- **`build-simple.sh`** - Main build script that compiles TypeScript to JavaScript for Figma Desktop
  - Usage: `npm run build`
  - Output: `code.js`, `manifest.json`, `ui/index.html`

- **`dev-start.js`** - Development server with hot reload
  - Usage: `npm run start:dev`
  - Watches for changes in app/, core/, config/ directories

### **Testing & Validation**
- **`quick-test-suite.js`** - Master test orchestrator with 279/279 tests passing
  - Usage: Direct execution or via Ultimate Test Suite
  - Validates all critical systems in ~4 seconds

- **`browser-test-suite.js`** - Browser compatibility testing
  - Playwright-based smoke tests
  - UI element validation

- **`test-e2e.sh`** - End-to-end testing pipeline
  - Complete workflow validation
  - Production readiness testing

### **Monitoring & Health**
- **`health-check.sh`** - System health validation
  - Server status verification
  - Service availability checks

- **`monitor-dashboard.js`** - Live monitoring dashboard
  - Real-time system metrics
  - Performance monitoring

### **Configuration & Utilities**
- **`setup-test-env.js`** - Test environment configuration
  - Environment variable setup
  - Test data preparation

- **`validate-yaml.js`** - YAML template validation
  - Template syntax checking
  - Configuration validation

- **`fix-yaml.js`** - YAML template repair utility
  - Automatic syntax fixing
  - Template standardization

### **Deployment**
- **`deploy-production.sh`** - Production deployment automation
  - Docker container deployment
  - Environment configuration
  - Health verification

## 📁 **Archive**
Development and research scripts moved to `archive/` folder:
- Log monitoring utilities
- Legacy test scripts  
- Development validation tools
- UI integration test scripts

## 🎯 **Usage Guidelines**
1. **Build**: Use `npm run build` for plugin compilation
2. **Testing**: Use `npm run test:all` for comprehensive testing
3. **Health**: Use `npm run health` for system verification
4. **Monitoring**: Use `npm run monitor` for live dashboard

### Testing & Validation
- **`test-orchestrator.js`** - Coordinates all test suites (main testing controller)
  - Usage: `npm run test:all`, `npm run test:templates`, `npm run test:ai`
  - Provides comprehensive test coordination and reporting

- **`browser-test-suite.js`** - Browser-based integration tests
  - Usage: `npm run test:browser`
  - Tests live Figma plugin functionality with Playwright

- **`test-e2e.sh`** - End-to-end workflow testing
  - Usage: `npm run test:e2e`
  - Tests complete plugin + server integration

- **`validate-yaml.js`** - YAML template validation
  - Usage: `npm run validate:yaml`
  - Validates structure and content of AI templates

- **`fix-yaml.js`** - YAML template repair utility
  - Usage: `npm run fix:yaml`
  - Fixes common YAML formatting issues

### Monitoring & Health
- **`health-check.sh`** - System health validation
  - Usage: `npm run health`
  - Checks server status, dependencies, and configuration

- **`monitor-dashboard.js`** - Unified monitoring dashboard
  - Usage: `npm run monitor`
  - Real-time system metrics, health monitoring, and log analysis

### Setup & Deployment
- **`setup-figma-testing.sh`** - Figma testing environment setup
  - Prepares local environment for Figma plugin testing

- **`setup-test-env.js`** - Test environment configuration
  - Initializes testing dependencies and configurations

- **`deploy-production.sh`** - Production deployment script
  - Handles production build and deployment workflow

## Quick Commands

```bash
# Essential Commands
npm run build          # Build for Figma Desktop  
npm start              # Start development server
npm run health         # System health check
npm run test:all       # Run comprehensive test suite

# Testing Commands
npm run test:templates # Test AI templates
npm run test:browser   # Browser integration tests
npm run test:e2e       # End-to-end workflow tests

# Monitoring
npm run monitor        # Start monitoring dashboard
npm run validate:yaml  # Validate YAML templates
```

## Recent Consolidation

This directory has been streamlined to remove redundant scripts:
- ✅ Removed duplicate build scripts  
- ✅ Consolidated monitoring utilities into unified dashboard
- ✅ Removed obsolete debug utilities
- ✅ Eliminated unused demo and testing scripts

All remaining scripts are actively used and serve distinct purposes.
````