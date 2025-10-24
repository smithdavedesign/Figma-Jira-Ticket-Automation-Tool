# 🚀 Production Deployment Scripts Reference

**Last Updated:** October 24, 2025  
**Purpose:** Quick reference for all production deployment scripts and npm commands

## 📋 Quick Reference Table

| Command | Purpose | Duration | Description |
|---------|---------|----------|-------------|
| `npm run deploy:prod` | **Full Production** | 3-5 min | Complete production build, test, bundle, validate |
| `npm run deploy:dev` | **Development** | 2-3 min | Development build with server auto-start |
| `npm run deploy:staging` | **Staging** | 2-3 min | Staging build (skip tests) |
| `npm run deploy:quick` | **Quick Deploy** | 1-2 min | Fast development deploy (skip tests, auto-start) |
| `npm run deploy:full` | **Full with Server** | 3-5 min | Production build + auto-start server |
| `npm run validate:prod` | **Comprehensive Validation** | 30s | Thorough validation of all files and systems |
| `npm run validate:basic` | **Basic Validation** | 10s | Quick essential files check |
| `npm run package` | **Package for Release** | 3-5 min | Full production + validation |
| `npm run release` | **Release Ready** | 5-7 min | Complete release preparation |
| `npm run quick-deploy` | **Sync & Validate** | 20s | Quick sync and validation only |

## 🎯 Deployment Scenarios

### **🚀 First-Time Production Setup**
```bash
npm run deploy:prod              # Complete production setup
# ✅ Builds, tests, validates, creates bundle
# ✅ Ready for Figma Desktop import
```

### **⚡ Quick Development Testing**
```bash
npm run deploy:quick             # Fast development deploy
# ✅ Skips lengthy tests, auto-starts server
# ✅ Perfect for rapid iteration
```

### **🔍 Validation Only**
```bash
npm run validate:prod            # Comprehensive validation
# ✅ Checks all files, dependencies, server status
# ✅ No building or deployment
```

### **📦 Release Preparation**
```bash
npm run release                  # Complete release workflow
# ✅ Full production build + validation
# ✅ Creates distribution bundle
# ✅ Ready for Figma Plugin Store
```

## 📁 Script Details

### **deploy-production-comprehensive.sh**
**Location:** `scripts/deploy-production-comprehensive.sh`  
**Purpose:** Master production deployment script

**11 Step Process:**
1. Pre-flight Validation
2. Clean Build Environment  
3. Dependencies Check
4. Code Quality & Linting
5. TypeScript Compilation
6. File Synchronization
7. File & Manifest Validation
8. Testing Suite (optional)
9. Production Bundle Creation
10. Development Server Setup
11. Final Report

**Parameters:**
- `BUILD_MODE`: development, staging, production
- `SKIP_TESTS`: true/false
- `AUTO_START`: true/false

### **validate-production-comprehensive.sh**
**Location:** `scripts/validate-production-comprehensive.sh`  
**Purpose:** Comprehensive validation of all systems

**6 Step Validation:**
1. Essential Files Validation
2. Distribution Directory Validation
3. Dependencies and Environment
4. Server and Port Validation
5. Build and Sync Scripts Validation
6. Production Bundle Validation

## 🔧 Behind the Scenes

### **What Gets Built:**
- ✅ `dist/code.js` - Compiled plugin logic
- ✅ `dist/ui/index.html` - Synced UI interface
- ✅ `dist/manifest.json` - Plugin manifest
- ✅ `production-bundle/` - Complete distribution package
- ✅ `figma-plugin-production-*.zip` - Compressed bundle

### **What Gets Validated:**
- ✅ File sizes and integrity
- ✅ JSON syntax validation
- ✅ File synchronization status
- ✅ Server connectivity (MCP on port 3000)
- ✅ Dependencies and environment
- ✅ Script permissions and executability

### **What Gets Tested:** (when not skipped)
- ✅ Unit tests (`npm run test:run`)
- ✅ MCP integration tests (`npm run test:mcp`)
- ✅ System health check (`scripts/health-check.sh`)
- ✅ Code quality linting (`npm run lint`)

## 🚨 Troubleshooting

### **Common Issues & Fixes:**

#### **"MCP server not running"**
```bash
npm run start:mvc               # Start MCP server
# or
npm run deploy:dev              # Deploy with auto-start
```

#### **"Files out of sync"**
```bash
npm run sync                    # Sync source to dist/
# or
npm run quick-deploy            # Sync + validate
```

#### **"TypeScript compilation issues"**
```bash
npm run build:ts                # Recompile TypeScript
# or
npm run deploy:prod             # Full rebuild
```

#### **"Validation errors"**
```bash
npm run validate:prod           # See detailed error report
# Fix issues, then:
npm run deploy:prod             # Retry deployment
```

## 🎯 Development Workflow

### **Daily Development:**
```bash
# Morning startup
npm run deploy:dev              # Setup development environment

# During development
npm run quick-deploy            # Quick sync & validate

# Before commit
npm run validate:prod           # Check everything is good
```

### **Pre-Release Checklist:**
```bash
npm run deploy:prod             # Full production build
npm run validate:prod           # Comprehensive validation
npm run package                 # Package for distribution
npm run release                 # Final release preparation
```

## 📊 Performance Expectations

| Script | Typical Duration | Network Required | Server Required |
|--------|------------------|------------------|-----------------|
| `deploy:quick` | 1-2 minutes | No | Optional |
| `deploy:dev` | 2-3 minutes | No | Yes (auto-starts) |
| `deploy:prod` | 3-5 minutes | Optional (for tests) | Optional |
| `validate:prod` | 20-30 seconds | Optional | Optional |
| `package` | 3-5 minutes | Optional | No |
| `release` | 5-7 minutes | Optional | Yes |

## 🔗 Integration with Existing Scripts

**These scripts work with existing infrastructure:**
- ✅ `npm run sync` - File synchronization
- ✅ `npm run build` - Standard build process
- ✅ `npm run test:*` - All testing scripts
- ✅ `npm run start:mvc` - MCP server startup
- ✅ `npm run health` - System health checking

**File Structure:**
```
scripts/
├── deploy-production-comprehensive.sh    # Master deployment
├── validate-production-comprehensive.sh  # Master validation
├── sync-dist.sh                         # File sync (existing)
├── build.sh                             # Build process (existing)
├── health-check.sh                      # Health check (existing)
└── bundle-production.sh                 # Bundle creation (existing)
```

---

## 🚀 Quick Start

**New to the project?**
```bash
npm run deploy:dev              # One command to get started
```

**Ready for production?**
```bash
npm run release                 # One command for release
```

**Just want to validate?**
```bash
npm run validate:prod           # One command to check everything
```

---
**📚 For more details, see the main SYNC_SYSTEM.md documentation.**