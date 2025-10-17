# Live Figma Integration Testing Guide

## 🎯 Objective
Test the complete pipeline in live Figma to ensure Gemini receives:
- ✅ Data layer (enhanced frame data)
- ✅ Image (screenshot with base64 encoding) 
- ✅ Tech stack analysis
- ✅ Document type detection
- ✅ Template context

## 🚀 Pre-Testing Setup

### 1. Verify System Status
```bash
# Check MCP server is running
curl -s http://localhost:3000/ --max-time 3

# Build latest plugin code  
npm run build:ts

# Test MCP integration
npm run test:integration:mcp
```

### 2. Environment Setup
```bash
# Set Gemini API key (get free key at https://makersuite.google.com/app/apikey)
export GEMINI_API_KEY="your-gemini-api-key-here"

# Verify key is set
echo $GEMINI_API_KEY
```

## 📋 Testing Procedure

### Step 1: Load Plugin in Figma
1. Open Figma Desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select `manifest.json` from project root
4. Plugin should load successfully

### Step 2: Test Basic Functionality
1. **Select a frame or component** in Figma
2. **Open the plugin** from the plugins menu
3. **Verify UI loads** with file context displayed
4. **Check console** for any errors

### Step 3: Test Enhanced Data Extraction
1. **Click "AI Ticket" button** in plugin UI
2. **Monitor debug panel** for real-time data extraction
3. **Verify data includes**:
   - Enhanced frame data with hierarchy
   - Component analysis
   - Color extraction
   - Typography analysis  
   - Spacing measurements
   - Screenshot capture

### Step 4: Test MCP Data Layer
1. **Check MCP server receives data** properly formatted
2. **Verify schema validation** passes
3. **Monitor AI processing** pipeline
4. **Confirm ticket generation** completes

### Step 5: Test AI Integration
1. **Verify Gemini receives**:
   - Screenshot image (base64 encoded)
   - Enhanced frame data structure
   - Tech stack context
   - Document type information
   - Template context
2. **Check AI response quality**:
   - Technical accuracy
   - Design system understanding
   - Implementation details
   - Professional formatting

## 🔍 What to Look For

### Enhanced Data Layer Validation
```javascript
// Expected data structure sent to MCP/AI
{
  enhancedFrameData: [
    {
      id: "frame-id",
      name: "Button Component",
      type: "COMPONENT",
      description: "Primary action button",
      dimensions: { width: 120, height: 40 },
      hierarchy: {
        level: 1,
        parentId: null,
        childCount: 2,
        isTopLevel: true
      },
      components: [...],
      textContent: ["Sign Up", "CTA Button"],
      colors: ["#007AFF", "#FFFFFF"],
      accessibility: {
        hasLabel: true,
        role: "button",
        issues: []
      }
    }
  ],
  screenshot: "data:image/png;base64,iVBORw0KGgo...",
  fileContext: {
    fileKey: "BioUSVD6t51ZNeG0g9AcNz",
    fileName: "Design System",
    pageName: "Components"
  }
}
```

### AI Response Quality Indicators
- ✅ **Screenshot Analysis**: References visual elements seen in image
- ✅ **Technical Accuracy**: Correct component specifications
- ✅ **Design System Understanding**: Proper color, typography, spacing references
- ✅ **Implementation Details**: Specific code requirements and standards
- ✅ **Professional Formatting**: Well-structured ticket with clear sections

## 🛠️ Debugging Tips

### Plugin Console Logs
```javascript
// Look for these debug messages in Figma console:
"🤖 Starting AI-powered ticket generation..."
"✅ AI ticket data prepared and sent to UI for processing"
"📊 Enhanced data extracted: [object details]"
"🖼️ Screenshot captured: data:image/png;base64..."
```

### MCP Server Logs  
```bash
# Monitor MCP server responses
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"method":"generate_enhanced_ticket","params":{...}}' \
  --max-time 10
```

### Common Issues & Solutions

1. **Plugin UI not loading**
   - Check `npm run build:ts` completed successfully
   - Verify `dist/` directory has updated files
   - Reload plugin in Figma

2. **MCP server not responding**
   - Check server is running: `lsof -i :3000`
   - Restart server if needed: `cd server && npm run dev`

3. **AI generation failing**
   - Verify GEMINI_API_KEY is set correctly
   - Check API key has proper permissions
   - Monitor network requests in browser dev tools

4. **Screenshot not capturing**
   - Ensure selected node is visible frame/component
   - Check Figma export permissions
   - Verify base64 encoding working properly

## 📊 Success Metrics

### Complete Pipeline Test Success:
- ✅ Plugin loads without errors
- ✅ Enhanced data extraction completes
- ✅ Screenshot capture works
- ✅ MCP server receives data
- ✅ Schema validation passes
- ✅ AI processing completes
- ✅ High-quality ticket generated
- ✅ All data contexts included in AI response

### Expected AI Response Elements:
1. **Visual Analysis**: "Based on the screenshot, I can see a blue button component..."
2. **Data Layer Integration**: References specific dimensions, colors, typography
3. **Tech Stack Context**: Mentions appropriate frameworks/libraries
4. **Implementation Details**: Specific code requirements and standards
5. **Professional Structure**: Well-formatted ticket with clear sections

## 🎯 Next Steps

After successful live testing:
1. **Document results** in test reports
2. **Capture example outputs** for reference
3. **Optimize AI prompts** based on response quality
4. **Refine data extraction** if needed
5. **Update documentation** with findings

This comprehensive testing ensures the complete pipeline works flawlessly from Figma selection to AI-generated tickets with full context awareness.