# MCP Data Layer Testing Options

Your MCP data layer can now be tested in multiple ways without requiring a Figma file:

## 🚀 Quick Start

```bash
# Complete production deployment workflow
npm run deploy              # Build → Bundle → Validate → Optional server start

# Individual workflow steps
npm start                   # Start production server
npm run bundle              # Create production bundle
npm run validate:prod       # Validate all files
npm run test:e2e            # End-to-end integration testing

# Legacy MCP testing
npm run test:integration:mcp # Or: node tests/integration/test-standalone.mjs
```

## 📋 Testing Methods Available

### 1. **End-to-End Integration Testing** (Recommended)
- **Command**: `npm run test:e2e`
- **Script**: `scripts/test-e2e.sh`
- **Features**:
  - ✅ Complete plugin + server integration testing
  - ✅ Production server health validation
  - ✅ AI endpoint testing with real responses
  - ✅ Bundle integrity verification
  - ✅ Comprehensive system validation

### 2. **Production Deployment Workflow**
- **Command**: `npm run deploy`
- **Script**: `scripts/deploy-production.sh`
- **Features**:
  - ✅ Automated build → bundle → validate → test workflow
  - ✅ Uses existing production scripts
  - ✅ Optional server startup
  - ✅ Complete deployment verification

### 3. **Node.js Standalone Testing** (Legacy)
- **File**: `tests/integration/test-standalone.mjs`
- **Command**: `npm run test:integration:mcp`
- **Features**:
  - ✅ MCP Server health checks
  - ✅ Schema validation testing
  - ✅ Mock data generation
  - ✅ AI ticket generation via MCP
  - ✅ Gemini API direct testing (with API key)
  - ✅ No external dependencies required

### 4. **Browser-Based Testing**
- **File**: `tests/integration/test-standalone.html`
- **Access**: Open file in browser
- **Features**:
  - ✅ Visual test interface
  - ✅ Real-time results display
  - ✅ Interactive mock data testing
  - ✅ Schema validation visualization

### 5. **Professional Test Dashboard**
- **File**: `tests/integration/test-mcp-data-layer.html`
- **Access**: Open file in browser
- **Features**:
  - ✅ Comprehensive MCP validation suite
  - ✅ Server connectivity testing
  - ✅ AI integration testing
  - ✅ Professional UI with detailed reporting

### 6. **Plugin UI Integration Testing**
- **File**: `ui/index.html`
- **Features**:
  - ✅ AI button with mock data
  - ✅ Debug panel with real-time validation
  - ✅ Schema validation display
  - ✅ Mock ticket generation

## 🧪 Test Results

### Current Status
```
🚀 Production Server: ✅ OPERATIONAL - Stable Node.js with live logging
📦 Production Bundle: ✅ READY - v4.0.0 distribution package
🔍 Live Debugging: ✅ ACTIVE - Session tracking & debug endpoints
🤖 AI Generation: ✅ WORKING - 6,223-char responses in 11.95s
💎 Gemini Integration: ✅ PRODUCTION - 1,466 tokens, working free tier
📊 Session Tracking: ✅ COMPLETE - End-to-end user journey monitoring
```

### What's Being Tested

1. **MCP Server Connection**
   - Server health and availability
   - Tool inventory verification
   - Response time checking

2. **Data Layer Validation**
   - Enhanced frame data schema compliance
   - Required field validation
   - Data type checking
   - Warning/error categorization

3. **AI Integration Pipeline**
   - Mock data → MCP → AI processing
   - Ticket generation functionality
   - Response format validation

4. **Schema Compliance**
   - Complete EnhancedFrameDataSchema validation
   - Accessibility checks
   - Component hierarchy validation
   - Metadata structure verification

## 🔧 Configuration

### Environment Variables
```bash
# Required: In server/.env file
GEMINI_API_KEY="your-api-key-here"
MCP_PORT=3000
```

### Production Server
- **URL**: `http://localhost:3000`
- **Start**: `npm start` (uses stable Node.js server)
- **Debug Endpoints**: 
  - `/debug/health` - Server health & stats
  - `/debug/sessions` - Live session tracking
- **Live Logging**: Real-time request/response monitoring

## 📊 Understanding Test Output

### Success Indicators
- ✅ Green checkmarks indicate passing tests
- 📊 Data metrics show validation details
- 🎯 Preview shows generated content

### Common Issues
- ❌ MCP Server not running: Start your MCP server  
- ✅ Gemini API: Now working with billing-enabled free tier
- 📋 Schema validation warnings: Data structure improvements needed
- 🎯 AI Generation: Now produces real AI content instead of fallback responses

## 🎯 Best Practices

1. **Complete deployment workflow**
   ```bash
   npm run deploy              # Full workflow: build → bundle → validate
   ```

2. **Individual testing steps**
   ```bash
   npm run test:e2e            # End-to-end integration testing
   npm run validate:prod       # Production file validation
   npm run bundle              # Create distribution bundle
   ```

3. **Development workflow**
   ```bash
   npm start                   # Start server with live debugging
   # Watch real-time logs for session tracking
   ```

4. **Debug and monitor**
   ```bash
   curl http://localhost:3000/debug/health     # Server health
   curl http://localhost:3000/debug/sessions   # Session tracking
   ```

## 🔄 Integration with Development

The enhanced testing system supports the complete development lifecycle:

1. **Code Changes** → `npm run test:e2e` → Validate complete integration
2. **Production Ready** → `npm run deploy` → Full deployment workflow  
3. **Real-time Debugging** → `npm start` → Live session monitoring
4. **Bundle Distribution** → `npm run bundle` → Create v4.0.0 package
5. **Figma Testing** → Import `manifest.json` → Test in Figma Desktop

## 🚀 Production Deployment Ready

The system now includes:
- ✅ **Stable Node.js Server**: Production-ready with live debugging
- ✅ **Session Tracking**: Complete user journey monitoring
- ✅ **Distribution Bundle**: v4.0.0 ready for Figma Plugin Store
- ✅ **End-to-End Testing**: Comprehensive integration validation
- ✅ **Live Debugging**: Real-time monitoring with debug endpoints

This comprehensive system ensures production-ready deployment with full debugging capabilities.