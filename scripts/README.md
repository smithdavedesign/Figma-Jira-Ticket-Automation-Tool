# Scripts Directory

This directory contains essential build and testing scripts for the Figma AI Ticket Generator.

## Available Scripts

### Build & Development
- **`build-simple.sh`** - Main build script that compiles TypeScript to JavaScript for Figma Desktop
  - Usage: `npm run build`
  - Output: `code.js`, `manifest.json`, `ui/index.html`

- **`dev-start.js`** - Development server with hot reload
  - Usage: `npm run start:dev`
  - Watches for changes in app/, core/, config/ directories

### Testing
- **`test-orchestrator.js`** - Coordinates all test suites
  - Usage: `npm run test:all`
  - Supports: `npm run test:templates`, `npm run test:ai`

- **`browser-test-suite.js`** - Browser-based integration tests
  - Usage: `npm run test:browser` (runs smoke tests by default)
  - Tests live Figma plugin functionality

### Monitoring
- **`health-check.sh`** - System health validation
  - Usage: `npm run health`
  - Checks server status, dependencies, and configuration

- **`monitor-dashboard.js`** - Real-time monitoring dashboard
  - Usage: `npm run monitor`
  - Displays system metrics and performance data

## Quick Commands

```bash
# Build for Figma Desktop
npm run build

# Start development server
npm start

# Run health check
npm run health

# Run all tests
npm run test:all

# Browser testing
npm run test:browser
```

## Note
This is a streamlined scripts directory. All production deployment scripts have been removed since the Live Figma plugin approach is now used instead of complex deployment pipelines.