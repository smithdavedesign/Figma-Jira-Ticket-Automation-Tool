# MCP Data Layer Testing Options

Your MCP data layer can now be tested in multiple ways without requiring a Figma file:

## 🚀 Quick Start

```bash
# Test the complete MCP pipeline
npm run test:integration:mcp

# Or run directly
node tests/integration/test-standalone.mjs
```

## 📋 Testing Methods Available

### 1. **Node.js Standalone Testing** (Recommended)
- **File**: `tests/integration/test-standalone.mjs`
- **Command**: `npm run test:integration:mcp`
- **Features**:
  - ✅ MCP Server health checks
  - ✅ Schema validation testing
  - ✅ Mock data generation
  - ✅ AI ticket generation via MCP
  - ✅ Gemini API direct testing (with API key)
  - ✅ No external dependencies required

### 2. **Browser-Based Testing**
- **File**: `tests/integration/test-standalone.html`
- **Access**: Open file in browser
- **Features**:
  - ✅ Visual test interface
  - ✅ Real-time results display
  - ✅ Interactive mock data testing
  - ✅ Schema validation visualization

### 3. **Professional Test Dashboard**
- **File**: `tests/integration/test-mcp-data-layer.html`
- **Access**: Open file in browser
- **Features**:
  - ✅ Comprehensive MCP validation suite
  - ✅ Server connectivity testing
  - ✅ AI integration testing
  - ✅ Professional UI with detailed reporting

### 4. **Plugin UI Integration Testing**
- **File**: `ui/index.html`
- **Features**:
  - ✅ AI button with mock data
  - ✅ Debug panel with real-time validation
  - ✅ Schema validation display
  - ✅ Mock ticket generation

## 🧪 Test Results

### Current Status
```
MCP Server Health: ✅ PASSING
Data Validation: ✅ PASSING  
AI Generation: ✅ PASSING - REAL AI CONTENT ✨
Gemini Direct: ✅ WORKING - FREE TIER ENABLED
AI Services: ✅ PRODUCTION READY - "🆓 Google Gemini: ✅ Available (FREE)"
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
# Optional: For direct Gemini API testing
export GEMINI_API_KEY="your-api-key-here"
```

### MCP Server
- **URL**: `http://localhost:3000`
- **Required**: Must be running for tests
- **Start**: Use your existing MCP server setup

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

1. **Run tests after code changes**
   ```bash
   npm run test:integration:mcp
   ```

2. **Validate schema compliance**
   - Check warnings in test output
   - Verify all required fields
   - Review data type consistency

3. **Test different scenarios**
   - Use different mock data patterns
   - Test error conditions
   - Validate edge cases

## 🔄 Integration with Development

The testing system is designed to work alongside your development workflow:

1. **Code Changes** → Run `npm run test:integration:mcp`
2. **Schema Updates** → Verify with browser tests
3. **UI Changes** → Test with plugin UI integration
4. **Production Ready** → All tests passing

This comprehensive testing system ensures your MCP data layer is robust and reliable without requiring access to Figma files.