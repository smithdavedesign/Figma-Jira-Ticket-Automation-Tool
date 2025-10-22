# Project Structure

This document outlines the organized structure of the Figma AI Ticket Generator plugin.

## Root Files
- `package.json` - Main project configuration and scripts
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `manifest.json` - Figma plugin manifest
- `code.js` - Compiled plugin code (main entry point)
- `code.ts` - Plugin source code (TypeScript)
- `README.md` - Main project documentation
- `LICENSE` - Project license
- `.gitignore` - Git ignore rules
- `.env.example` - Environment variables template

## Directory Structure

### `/src/` - Source Code
Main TypeScript source code organized by functionality:
- `ai-orchestrator/` - AI workflow orchestration
- `core/` - Core plugin functionality
- `design-intelligence/` - Design analysis and intelligence
- `plugin/` - Plugin-specific code
- `shared/` - Shared utilities and types
  - `fetchScreenshot.ts` - Screenshot utility functions
- `ui/` - UI components and logic
- `validation/` - Data validation logic
- `precise-screenshot-logic.js` - Screenshot capture logic
- `index.ts` - Main source entry point

### `/server/` - Backend Server
MCP server and backend services:
- `src/` - Server source code
- `dist/` - Compiled server code
- `package.json` - Server dependencies

### `/ui/` - User Interface
Plugin UI components and assets:
- `index.html` - Main UI template
- `components/` - UI components
- `plugin/` - Plugin-specific UI
- `test/` - UI testing files

### `/scripts/` - Development & Build Scripts
All development, build, and automation scripts:
- `build.sh` - Build script
- `deploy-production.sh` - Production deployment
- `health-check.sh` - System health checks
- `dev-start.js` - Development server starter
- `debug-plugin-integration.js` - Plugin debugging tools
- `setup.sh` - Project setup
- `test-e2e.sh` - End-to-end testing

### `/tools/` - Development Tools
Analysis and validation tools:
- `cleanup-analysis.js` - Code cleanup analysis
- `project-structure.js` - Project structure validation
- `system-evaluation.js` - System evaluation tools

### `/tests/` - Test Suite
Comprehensive testing infrastructure:
- `unit/` - Unit tests
- `integration/` - Integration tests
- `system/` - System tests
- `performance/` - Performance tests
- `live/` - Live testing files

### `/docs/` - Documentation
Comprehensive project documentation:
- `deployment/` - Deployment guides
- `architecture/` - Architecture documentation
- `guides/` - User and developer guides
- `api/` - API documentation

### `/config/` - Configuration Files
Project configuration:
- `eslint.config.js` - ESLint configuration

### `/dist/` - Build Output
Compiled plugin files ready for deployment:
- `code.js` - Compiled plugin code
- `manifest.json` - Plugin manifest
- `ui/` - Compiled UI files

### `/production-bundle/` - Production Bundle
Production-ready plugin bundle with all necessary files for distribution.

### `/logs/` - Log Files
Runtime logs and debugging output:
- `server.log` - Server runtime logs

### `/browser-tests/` - Browser Testing
Playwright and browser-based testing infrastructure.

### `/releases/` - Release Packages
Versioned releases and distribution packages.

## Key Scripts

### Development
- `npm run dev:all` - Start all development services
- `npm run build` - Build the project
- `npm run watch` - Watch for changes and rebuild

### Testing  
- `npm run test:all` - Run all tests
- `npm run test:browser` - Run browser tests
- `npm run test:unit` - Run unit tests

### Production
- `npm run deploy` - Deploy to production
- `npm run bundle` - Create production bundle
- `npm run validate:prod` - Validate production build

## File Organization Principles

1. **Separation of Concerns**: Each directory has a specific purpose
2. **Development vs Production**: Clear separation between dev tools and production code
3. **Source vs Build**: Source code in `/src/`, compiled output in `/dist/`
4. **Documentation**: Comprehensive docs in `/docs/` directory
5. **Testing**: All tests organized in `/tests/` with clear subcategories
6. **Scripts**: All automation in `/scripts/` directory
7. **Configuration**: All configs either in root or `/config/`

This organization ensures maintainability, scalability, and clear separation of development and production concerns.