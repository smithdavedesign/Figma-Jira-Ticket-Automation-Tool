# 🚀 Complete Deployment Guide

**Last Updated:** October 24, 2025  
**Status:** Production Ready with Redis Integration ✅

## 📋 **Deployment Overview**

### **Architecture Status**
- **MVC Architecture:** ✅ Controllers (app/), Models (core/), Views (ui/), Configuration (config/)
- **MCP Server:** ✅ 6 production tools on localhost:3000
- **Redis Integration:** ✅ Caching layer with graceful fallback
- **AI Services:** ✅ Multi-provider orchestration (Gemini, GPT-4, Claude)
- **Plugin System:** ✅ Production-ready Figma plugin

## 🎯 **Quick Deployment**

### **1. Local Development Deployment**
```bash
# Install dependencies
npm install

# Start MCP server (Controllers)
npm run start:mvc        # Starts app/main.js on port 3000

# Build Figma plugin (Views)
npm run build:plugin     # Compiles to dist/code.js

# Start Redis (optional - graceful fallback available)
brew services start redis

# Validate deployment
npm run health           # System health check
npm run test:integration # Integration validation
```

### **2. Production Deployment**
```bash
# Complete validation
npm run validate         # Lint + all tests

# Build production bundle
npm run build:production

# Deploy MCP server
node app/main.js         # Production server

# Load in Figma Desktop
# File → Plugins → Development → Load manifest.json
```

## 🏗️ **Deployment Components**

### **MCP Server Deployment (Controllers)**
**Location:** `app/main.js`  
**Port:** 3000 (configurable via process.env.PORT)

**Features:**
- ✅ 6 production MCP tools loaded
- ✅ Redis caching with memory fallback
- ✅ Professional logging with file rotation
- ✅ AI orchestration with multiple providers
- ✅ HTTP API endpoints for plugin communication
- ✅ Health checks and status monitoring

**Environment Variables:**
```bash
# Optional - defaults provided
PORT=3000                # Server port
REDIS_HOST=localhost     # Redis host
REDIS_PORT=6379         # Redis port
GEMINI_API_KEY=xxx      # AI service keys
```

### **Figma Plugin Deployment (Views)**
**Files:** `manifest.json`, `dist/code.js`, `ui/index.html`

**Build Process:**
```bash
npm run build:plugin    # TypeScript → JavaScript compilation
npm run build:ts        # Alternative build command
```

**Deployment:**
1. Build plugin files with `npm run build:plugin`
2. Open Figma Desktop app
3. Go to Plugins → Development → Load plugin from manifest
4. Select `manifest.json` from project root

### **Redis Deployment (Data Layer)**
**Installation:**
```bash
# macOS
brew install redis
brew services start redis

# Verify
redis-cli ping          # Should return PONG
```

**Configuration:** Automatic with environment defaults
- **Host:** localhost  
- **Port:** 6379
- **Fallback:** Memory-only mode if Redis unavailable

## 📊 **Deployment Validation**

### **System Health Checks**
```bash
# MCP Server Health
curl -s http://localhost:3000/ | jq '.'

# Redis Health  
redis-cli ping

# Plugin Build Status
ls -la dist/code.js manifest.json

# Complete System Validation
npm run health
```

### **Integration Testing**
```bash
# Core integration tests
npm run test:integration:mcp

# Browser testing
npm run test:browser:smoke

# Redis integration
cd tests/redis && node test-redis-client.js

# Ultimate test suite
open tests/integration/test-consolidated-suite.html
```

## 🔧 **Production Configuration**

### **Server Configuration**
**File:** `config/server.config.js`

**Key Settings:**
- **Default Port:** 3000
- **Timeout:** 30s API timeout with retry logic
- **Memory Protection:** Smart processing limits for large selections
- **Error Handling:** Comprehensive error classes and recovery

### **Redis Configuration**  
**File:** `config/redis.config.js`

**Settings:**
- **Connection Pool:** Single connection with retry logic
- **Timeout:** 5s connection, 3s command timeout
- **Retry Strategy:** 3 attempts with 100ms delay
- **Cache TTL:** 2 hours for tickets, 30 minutes for analysis

### **AI Service Configuration**
**File:** `config/ai.config.js`

**Providers:**
- **Gemini:** Primary provider for design analysis
- **GPT-4:** Secondary provider for complex reasoning
- **Claude:** Specialized for code generation
- **Fallback:** Template-only generation when AI unavailable

## 📈 **Performance Optimization**

### **Deployment Performance**
- **Startup Time:** MCP server loads in <2 seconds
- **Memory Usage:** Optimized for large design file processing
- **Cache Performance:** 50-80% faster response times with Redis
- **API Response:** 30s timeout protection with retry logic

### **Production Metrics**
- **Server Uptime:** Stable with graceful shutdown handling
- **API Response Time:** ~240-475ms average
- **Error Rate:** <1% with comprehensive error handling  
- **Cache Hit Rate:** 60-90% for repeated operations

## 🚨 **Troubleshooting**

### **Common Deployment Issues**

**1. Server Won't Start**
```bash
# Check port availability
lsof -i :3000

# Kill existing processes
lsof -ti:3000 | xargs kill -9

# Check import paths
npm run build:plugin
```

**2. Redis Connection Issues**
```bash
# Check Redis status
brew services list | grep redis

# Start Redis if stopped
brew services start redis

# Test connection
redis-cli ping
```

**3. Plugin Not Loading in Figma**
```bash
# Verify build files exist
ls -la dist/code.js manifest.json ui/index.html

# Rebuild if missing
npm run build:plugin

# Check manifest.json validity
cat manifest.json | jq '.'
```

**4. AI Services Not Working**
```bash
# Check API keys (don't expose full keys)
echo $GEMINI_API_KEY | cut -c1-10

# Test AI integration
npm run test:integration:mcp | grep -i gemini
```

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] All tests passing (`npm run validate`)
- [ ] Redis server running (`redis-cli ping`)
- [ ] Environment variables set
- [ ] Build files generated (`npm run build:plugin`)

### **Deployment Steps**
- [ ] Start MCP server (`npm run start:mvc`)
- [ ] Verify server health (`curl http://localhost:3000/`)
- [ ] Load plugin in Figma Desktop
- [ ] Test basic functionality in Figma
- [ ] Run integration tests (`npm run test:integration`)

### **Post-Deployment**
- [ ] Monitor server logs (`tail -f logs/server.log`)
- [ ] Check Redis metrics (Ultimate Test Suite)
- [ ] Validate AI service integration
- [ ] Confirm plugin functionality in Figma

## 🎯 **Release Process**

### **Version Management**
```bash
# Update version in package.json and manifest.json
npm version patch|minor|major

# Create release build
npm run build:production

# Tag release
git tag -a v1.x.x -m "Release version 1.x.x"
git push origin v1.x.x
```

### **Release Validation**
```bash
# Complete test suite
npm run test:all

# Performance testing
npm run test:performance  

# Browser compatibility
npm run test:browser

# Live Figma testing
# Follow tests/live/LIVE_FIGMA_INTEGRATION_TEST.md
```

---

**✅ Production deployment is fully validated with Redis integration, modern MVC architecture, and comprehensive monitoring capabilities.**