# 🧪 Complete Testing Guide

**Last Updated:** October 24, 2025  
**Status:** Production Ready with Comprehensive Test Runner & Live Monitoring ✅

## 🚀 **Quick Start - Enhanced Testing Infrastructure**

### **🎯 Comprehensive Test Runner (NEW - Recommended)**
```bash
# Run ALL tests with single command
npm run test:all

# OR execute the comprehensive test runner directly
./scripts/run-all-tests.sh
```

**✨ Features:**
- 🧪 **8+ Test Categories:** ESLint, Unit Tests, Build Tests, MCP Integration, E2E Tests, Playwright Browser Tests, Health Checks, Production Validation
- 📊 **Detailed Reporting:** Success/failure tracking with comprehensive metrics
- ⚡ **Single Command Execution:** One command runs everything
- 🔄 **Progress Tracking:** Real-time execution status

### **📊 Live Development Monitoring (NEW)**
```bash
# Start live server monitoring with nodemon
npm run monitor

# OR start development monitoring  
npm run dev:monitor
```

**✨ Live Monitor Features:**
- 📡 **Real-time Server Monitoring:** Health checks every 30 seconds
- 🪵 **Live Log Streaming:** Real-time log output with filtering
- 📈 **Performance Metrics:** CPU, memory, response time tracking
- 🔧 **Graceful Shutdown:** Proper cleanup and restart handling

### **🎛️ Enhanced Test Suite Interface**
```bash
# Open comprehensive test suite with new capabilities
open tests/integration/test-consolidated-suite.html
```

**✨ Enhanced Features:**
- 🎯 **9 Test Categories:** System • Screenshots • Templates • AI • UI • E2E • Performance • Overview • **Live Monitor** • **Comprehensive Runner**
- 📊 **Live Server Status:** Real-time MCP server and test server monitoring
- 🎭 **Mock Environment:** Complete local testing without external dependencies  
- 📋 **Professional Reporting:** Downloadable test reports with detailed metrics
- 🪵 **System Logging:** Live log filtering, export, and performance tracking
- 🚀 **Integrated Test Runner:** Direct access to comprehensive test execution
- 📡 **Live Monitoring Dashboard:** Real-time server status and performance metrics

## 🎯 **Test Categories Overview**

### **1. System Tests**
- **MCP Server Health:** 6 production tools validation
- **Redis Integration:** Connection, caching, fallback behavior
- **API Endpoints:** Health checks, tool availability
- **Server Status:** Port availability, response times

### **2. Redis Tests** 
```bash
# Redis-specific testing
cd tests/redis/
node test-redis-client.js        # RedisClient wrapper tests
node test-direct-redis.js        # Direct ioredis connection tests  
node test-caching-integration.js # Integration with main server
```

**Redis Test Coverage:**
- ✅ Connection management and health checks
- ✅ Basic operations (SET, GET, DEL, EXISTS, KEYS, EXPIRE)
- ✅ JSON serialization for complex objects
- ✅ TTL (time-to-live) support for cache expiration
- ✅ Graceful fallback to memory mode
- ✅ Ticket generation caching with performance validation

### **3. Comprehensive Test Runner (NEW)**
```bash
npm run test:all        # Run ALL test categories in sequence
./scripts/run-all-tests.sh  # Direct script execution
```

**Complete Test Coverage:**
- **ESLint:** Code quality and style validation
- **Unit Tests:** Vitest framework with 12/12 tests passing
- **Build Tests:** Plugin compilation and production builds
- **MCP Integration:** Server tools and API validation
- **E2E Tests:** Complete workflow testing
- **Playwright Browser Tests:** Cross-browser compatibility
- **Health Checks:** System status validation
- **Production Validation:** Deployment readiness

### **4. Unit Tests (Vitest)**
```bash
npm test              # Interactive test runner
npm run test:run      # Single test run
npm run test:coverage # Coverage reports with HTML output
npm run test:ui       # Visual test dashboard
```

**Coverage:**
- **Tech Stack Parsing:** 11/11 tests passing (82-98% confidence)
- **Core Business Logic:** Model layer validation
- **AI Integration:** Service availability and fallback handling

### **5. Live Server Monitoring (NEW)**
```bash
npm run monitor         # Start live server monitoring
npm run dev:monitor     # Development monitoring with auto-restart
```

**Monitoring Features:**
- **Server Health Checks:** MCP server (port 3000) and test server (port 8101)
- **Real-time Metrics:** CPU usage, memory consumption, response times
- **Live Log Streaming:** Real-time log output with filtering capabilities
- **Performance Tracking:** Request/minute, uptime, error rates
- **Graceful Management:** Proper startup, shutdown, and restart handling

### **6. Browser Tests (Playwright)**
```bash
npm run test:browser         # Full browser test suite (80+ tests)
npm run test:browser:smoke   # Essential smoke tests (~10 min)
npm run test:browser:quick   # Quick validation (~2 min)
```

**Browser Test Results:**
- **Total:** 80 tests executed across multiple browsers
- **Expected:** 52 core tests passing
- **Coverage:** UI functionality, cross-browser compatibility
- **Report Location:** `tests/test-results/playwright-reports/`

### **7. Integration Tests**
```bash
npm run test:integration:mcp  # MCP server integration
npm run test:integration     # All integration tests
```

**Integration Coverage:**
- **MCP Protocol:** Tool calls, data flow validation
- **AI Services:** Gemini, GPT-4, Claude integration patterns
- **Redis Caching:** Server-level caching integration

## 📊 **Current Test Status**

### ✅ **Production Ready Systems**
- **Comprehensive Test Runner:** 8+ test categories with single-command execution ✅
- **Live Server Monitoring:** Real-time health checks and performance tracking ✅
- **Enhanced Test Suite Interface:** 9 integrated test tabs with live monitoring ✅
- **MCP Server:** 6/6 tools loaded, healthy status, MVC architecture ✅
- **Redis Integration:** Connection, caching, fallback operational ✅
- **Vitest Framework:** 12 tests in 121ms, modern testing infrastructure ✅
- **Code Quality:** 0 ESLint errors, clean JavaScript codebase ✅

### 📈 **Performance Metrics** 
- **Comprehensive Test Execution:** All 8+ categories complete in ~5-10 minutes
- **Live Monitoring:** Health checks every 30 seconds with real-time metrics
- **Test Suite Integration:** Seamless switching between 9 test categories
- **Startup Time:** MCP server loads in <2 seconds
- **Test Execution:** Vitest tests run in 121ms
- **Cache Performance:** 50-80% faster response times with Redis
- **Browser Tests:** 80 tests complete in ~10 minutes
- **Build Time:** Plugin compilation optimized for MVC structure

### 🆕 **Latest Enhancements (October 2025)**
- **Comprehensive Test Runner:** Single command (`npm run test:all`) runs all test categories
- **Live Server Monitoring:** Real-time monitoring with `npm run monitor`
- **Enhanced Test Interface:** Added Live Monitor and Comprehensive Runner tabs
- **Production Scripts:** Integrated into package.json with proper npm scripts
- **Method Documentation:** Clear distinction between three ticket generation methods
- **Organized Test Results:** Playwright reports properly organized in `tests/test-results/`

## 🔧 **Advanced Testing Scenarios**

### **Live Figma Integration Testing**
```bash
# Prerequisites: Figma Desktop app installed
npm run build:plugin        # Build latest plugin
# Load manifest.json in Figma Desktop
# Follow tests/live/LIVE_FIGMA_INTEGRATION_TEST.md
```

### **Performance & Load Testing**
```bash
npm run test:performance    # Performance benchmarks
npm run test:stress        # Stress testing with large datasets
```

### **End-to-End Workflow Testing**
1. **Complete Ticket Generation Flow**
2. **MCP Integration with AI Services**
3. **Error Recovery and Fallback Scenarios**
4. **Data Flow Validation**

## 📋 **Test Report Generation**

### **Automated Reporting**
The Ultimate Test Suite generates comprehensive reports including:
- **System Health:** All services status and performance
- **Redis Metrics:** Memory usage, cache hit rates, session data
- **Test Results:** Pass/fail rates across all categories
- **Performance Data:** Response times, memory usage, error rates

### **Export Options**
- **JSON Download:** Machine-readable test results
- **Text Report:** Human-readable summary with recommendations
- **Clipboard Copy:** Quick sharing and documentation
- **Live Dashboard:** Real-time monitoring during development

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Server Not Starting:** Check port 3000 availability with `lsof -i :3000`
2. **Redis Connection Failed:** Verify Redis server with `redis-cli ping`
3. **Test Failures:** Check server logs and Redis status in Ultimate Test Suite
4. **Browser Tests Failing:** Ensure test server is running on port 8080

### **Debug Commands**
```bash
# Health check all systems
npm run health
curl -s http://localhost:3000/ | jq '.'

# Redis status
redis-cli ping
redis-cli info memory

# Server logs
tail -f logs/server.log

# Kill stuck processes
lsof -ti:3000 | xargs kill -9 2>/dev/null
```

## 🎯 **Enhanced Testing Workflow for Development**

### **🚀 Recommended Daily Development Workflow (NEW)**
```bash
# 1. Start live monitoring for development
npm run dev:monitor &       # Live server monitoring with auto-restart

# 2. Comprehensive validation (single command)
npm run test:all            # Run ALL test categories (~5-10 min)

# 3. Open enhanced test suite interface
open tests/integration/test-consolidated-suite.html
```

### **⚡ Quick Development Testing**
```bash
# Option 1: Traditional approach
npm run start:mvc &         # Start MCP server
npm run test:unit           # Fast unit tests (2s)
npm run test:integration:mcp # MCP integration (10s)

# Option 2: NEW - Comprehensive approach
npm run test:all            # Single command for all tests
```

### **📊 Live Development Monitoring (NEW)**
```bash
# Start live monitoring during development
npm run monitor             # Basic monitoring
npm run dev:monitor         # Development mode with auto-restart

# Benefits:
# - Real-time server health checks
# - Live log streaming
# - Performance metrics tracking
# - Automatic restart on changes
```

### **Pre-Commit Testing**
```bash
npm run test:all            # NEW: Complete test suite validation
npm run test:coverage       # Ensure coverage thresholds
npm run test:browser:smoke  # Essential browser tests
```

### **Release Testing**
```bash
npm run test:all            # NEW: Comprehensive test runner
npm run test:performance    # Performance validation
npm run build:production    # Production build validation
npm run monitor             # Final monitoring validation
```

---

**✅ All testing infrastructure is production-ready with Redis integration, modern frameworks, and comprehensive monitoring capabilities.**