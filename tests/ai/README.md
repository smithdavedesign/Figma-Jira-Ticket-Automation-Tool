# AI Architecture Test Suite

Comprehensive testing suite for the Visual Enhanced AI Service architecture with dummy data and real component screenshots.

## 🎯 Purpose

This test suite allows you to validate the AI architecture without needing live Figma connections by providing:

- **Dummy Figma data** that matches common design patterns
- **Real component screenshots** downloaded from the internet
- **Multiple tech stack scenarios** (React, Vue, Angular, AEM, Svelte)
- **Various document types** (Jira, Linear, Asana)
- **Performance benchmarking** and confidence scoring

## 🚀 Quick Start

### 1. Interactive Web Dashboard
The easiest way to test the AI architecture:

```bash
# Start the MCP server
npm run start:mvc

# Open the AI Test Dashboard in your browser
npm run test:ai:dashboard
```

This opens a beautiful web interface at `http://localhost:3000/api/ai-test-dashboard` where you can:
- ✅ Run individual test scenarios
- 🖼️ Test with real component screenshots
- 📊 View detailed results and metrics
- 🎨 See AI confidence scores and processing details

### 2. Command Line Tests

Run the basic AI architecture tests:
```bash
npm run test:ai
```

Run tests with real component screenshots:
```bash
npm run test:ai:screenshots
```

Run all AI tests:
```bash
npm run test:ai:all
```

## 🧪 Test Scenarios

### Basic Architecture Tests
- **Card Component - AEM**: Product card for Adobe Experience Manager
- **Button Component - React TypeScript**: Primary button with proper typing
- **Navigation Component - Vue.js**: Main navigation bar
- **Form Component - Angular**: Contact form with validation
- **Modal Component - Svelte**: Confirmation dialog

### Real Screenshot Tests
- **Material Design Button - AEM**: Using actual Material Design screenshots
- **Bootstrap Card - React TypeScript**: Real Bootstrap component images
- **Ant Design Form - Vue.js**: Actual Ant Design component screenshots
- **Chakra UI Modal - Angular**: Real Chakra UI component images

## 📊 What Gets Tested

### Visual Enhanced AI Service
- ✅ Screenshot processing and analysis
- ✅ Visual context building from dummy data
- ✅ Multimodal prompt engineering
- ✅ AI confidence scoring
- ✅ Processing metrics tracking

### AI Orchestrator Integration
- ✅ Provider management (Gemini, GPT-4, Claude)
- ✅ Rate limiting and error handling
- ✅ Intelligent fallback mechanisms
- ✅ Redis caching integration

### Template System Fallback
- ✅ Graceful degradation when AI unavailable
- ✅ Template generation with enhanced context
- ✅ Error recovery and logging

## 📁 Generated Files

### Test Reports
- `tests/ai/test-report.json` - Basic architecture test results
- `tests/ai/real-screenshot-report.json` - Screenshot test results

### Downloaded Screenshots
- `tests/ai/screenshots/` - Real component images used for testing

### Example Results
```json
{
  "testSuite": "AI Architecture Test Suite",
  "summary": {
    "totalTests": 5,
    "successful": 5,
    "aiEnhanced": 4,
    "templateFallback": 1
  },
  "results": [
    {
      "scenario": "Card Component - AEM",
      "success": true,
      "confidence": 87,
      "processingMetrics": {
        "screenshotProcessed": true,
        "dataStructuresAnalyzed": 3
      }
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables Required
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional Environment Variables
```bash
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
```

## 🎨 Test Data Structure

### Dummy Frame Data Format
```javascript
{
  component_name: 'ProductCard',
  nodeCount: 8,
  type: 'COMPONENT',
  name: 'Product Card',
  fills: [
    { type: 'SOLID', color: { r: 0.15, g: 0.38, b: 0.92 } }
  ],
  style: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 500
  },
  children: [
    { name: 'Image Container', type: 'FRAME' },
    { name: 'Content', type: 'FRAME' }
  ]
}
```

### Visual Context Structure
```javascript
{
  screenshot: {
    base64: '...',
    format: 'PNG',
    size: 1024,
    resolution: { width: 400, height: 300 }
  },
  visualDesignContext: {
    colorPalette: [...],
    typography: {...},
    spacing: {...},
    designPatterns: [...]
  },
  hierarchicalData: {
    components: [...],
    designSystemLinks: {...}
  }
}
```

## 🚨 Troubleshooting

### No AI Responses
- ✅ Check `GEMINI_API_KEY` is set correctly
- ✅ Verify internet connectivity for API calls
- ✅ Check server logs for specific error messages

### Screenshot Download Failures
- ✅ Check internet connectivity
- ✅ Some test URLs may be blocked by firewalls
- ✅ Tests will use placeholders if downloads fail

### Low Confidence Scores
- ✅ Normal for placeholder screenshots
- ✅ Real screenshots should score 70%+ confidence
- ✅ Check visual context building logic

## 📈 Performance Benchmarks

Expected performance on M1 MacBook Pro:

| Test Type | Duration | Confidence | Screenshot |
|-----------|----------|------------|------------|
| Basic AI Test | ~2-3s | 60-75% | Placeholder |
| Real Screenshot | ~5-8s | 75-90% | Downloaded |
| Template Fallback | ~500ms | N/A | Any |

## 🎉 Success Indicators

✅ **All tests pass**: AI architecture is working correctly  
✅ **High confidence scores**: Visual analysis is effective  
✅ **Fast processing**: Performance is optimized  
✅ **Graceful fallbacks**: Error handling is robust  

## 🔗 Integration with Main System

These tests validate the same AI services used by:
- 🎨 Figma plugin Advanced Context Dashboard
- 🎫 MCP server ticket generation
- 📊 Visual Enhanced AI Service
- 🤖 AI Orchestrator provider management

**Perfect for testing AI improvements without needing live Figma data!**