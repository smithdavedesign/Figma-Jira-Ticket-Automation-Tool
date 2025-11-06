````markdown
# Scripts Directory

This directory contains essential build, testing, and monitoring scripts for the Figma AI Ticket Generator.

## Available Scripts

### Build & Development
- **`build-simple.sh`** - Main build script that compiles TypeScript to JavaScript for Figma Desktop
  - Usage: `npm run build`
  - Output: `code.js`, `manifest.json`, `ui/index.html`

- **`dev-start.js`** - Development server with hot reload
  - Usage: `npm run start:dev`
  - Watches for changes in app/, core/, config/ directories

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