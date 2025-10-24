# 🔗 Phase 2: Figma MCP Connection - Design Document

## **Branch**: `feature/phase2-figma-mcp-connection`

## **Objective**
Establish robust integration between our enhanced UI smart parser and the Figma MCP server, enabling seamless communication and data flow for design-aware code generation.

## **Prerequisites**
- ✅ Phase 1: Enhanced tech stack analysis with design context
- ✅ MCP server operational on localhost:3000 with Gemini AI
- ✅ Sophisticated UI with suggestion pills and confidence scoring

## **Integration Architecture**

### **1. Communication Pipeline**
**Objective**: Create seamless data flow from UI parser to MCP server

**Data Flow**:
```
UI Smart Parser → Enhanced Analysis → Figma MCP Server → Response Processing
     ↓                    ↓                   ↓                    ↓
Tech Stack Input → Design Context → Frame Analysis → Enhanced Results
```

**Technical Implementation**:
```javascript
// Enhanced MCP communication layer
class FigmaMCPConnector {
  constructor(mcpEndpoint = 'http://localhost:3000') {
    this.endpoint = mcpEndpoint;
    this.connected = false;
  }

  async connect() {
    try {
      const response = await fetch(this.endpoint);
      const status = await response.json();
      this.connected = status.status === 'running';
      return this.connected;
    } catch (error) {
      console.warn('MCP server not available:', error.message);
      return false;
    }
  }

  async sendEnhancedAnalysis(enhancedTechStack, figmaUrl = null) {
    if (!this.connected && !(await this.connect())) {
      throw new Error('MCP server unavailable');
    }

    const payload = {
      method: 'analyze_project_with_context',
      params: {
        figmaUrl,
        techStack: enhancedTechStack.stack,
        designContext: enhancedTechStack.designContext,
        confidence: enhancedTechStack.confidence,
        patterns: enhancedTechStack.patterns,
        components: enhancedTechStack.components
      }
    };

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return await response.json();
  }
}
```

### **2. Enhanced MCP Server Methods**
**Objective**: Extend MCP server to handle design-aware requests

**New MCP Methods**:
```javascript
// In server/src/server.ts
export class FigmaAnalysisServer {
  
  async analyzeProjectWithContext(params) {
    const { figmaUrl, techStack, designContext, confidence, patterns, components } = params;
    
    try {
      // Get Figma data if URL provided
      const figmaData = figmaUrl ? await this.fetchFigmaData(figmaUrl) : null;
      
      // Combine tech stack analysis with design context
      const enhancedAnalysis = await this.performEnhancedAnalysis({
        techStack,
        designContext,
        figmaData,
        patterns,
        components
      });
      
      // Generate framework-specific recommendations
      const recommendations = await this.generateContextualRecommendations(
        enhancedAnalysis,
        confidence
      );
      
      return {
        success: true,
        analysis: enhancedAnalysis,
        recommendations,
        codeGeneration: await this.generateEnhancedCode(enhancedAnalysis)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: await this.generateFallbackAnalysis(techStack)
      };
    }
  }

  async performEnhancedAnalysis({ techStack, designContext, figmaData, patterns, components }) {
    // Use Gemini AI to analyze the combined context
    const prompt = this.buildEnhancedAnalysisPrompt(techStack, designContext, patterns, components);
    
    const aiAnalysis = await this.geminiService.generateContent(prompt);
    
    return {
      techStackAnalysis: aiAnalysis.techStack,
      designPatternAnalysis: aiAnalysis.patterns,
      componentArchitecture: aiAnalysis.components,
      implementationStrategy: aiAnalysis.strategy,
      confidence: this.calculateCombinedConfidence(designContext, aiAnalysis)
    };
  }
}
```

### **3. Enhanced UI Integration**
**Objective**: Seamlessly integrate MCP responses into the smart parser UI

**UI Enhancements**:
```javascript
// Enhanced parse function with MCP integration
const enhancedParseWithMCP = async () => {
  const input = document.getElementById('techStackInput').value;
  const figmaUrl = document.getElementById('figmaUrlInput')?.value;
  
  try {
    // Phase 1: Enhanced local analysis
    showLoadingState('Analyzing tech stack and design patterns...');
    const enhancedStack = await enhancedParseTechStack(input, figmaContext);
    
    // Update UI with local analysis
    updateEnhancedSuggestions(enhancedStack);
    updateDesignContext(enhancedStack.designContext);
    
    // Phase 2: MCP server analysis
    showLoadingState('Connecting to Figma MCP server...');
    const mcpConnector = new FigmaMCPConnector();
    
    if (await mcpConnector.connect()) {
      showLoadingState('Performing enhanced analysis...');
      const mcpResponse = await mcpConnector.sendEnhancedAnalysis(enhancedStack, figmaUrl);
      
      if (mcpResponse.success) {
        // Update UI with MCP-enhanced results
        updateWithMCPResults(mcpResponse);
        showSuccessMessage('Enhanced analysis complete!');
      } else {
        handleMCPError(mcpResponse.error);
      }
    } else {
      showWarningMessage('MCP server unavailable - using local analysis');
    }
    
  } catch (error) {
    handleAnalysisError(error);
  } finally {
    hideLoadingState();
  }
};

const updateWithMCPResults = (mcpResponse) => {
  // Update confidence scores with MCP insights
  updateConfidenceScores(mcpResponse.analysis.confidence);
  
  // Show enhanced recommendations
  displayEnhancedRecommendations(mcpResponse.recommendations);
  
  // Display generated code preview
  displayCodeGeneration(mcpResponse.codeGeneration);
  
  // Update design analysis with MCP insights
  updateDesignAnalysis(mcpResponse.analysis.designPatternAnalysis);
};
```

### **4. Figma URL Input Integration**
**Objective**: Allow users to provide Figma URLs for enhanced analysis

**UI Addition**:
```html
<div class="figma-input-section">
  <label for="figmaUrlInput">🎨 Figma Design URL (Optional):</label>
  <input 
    type="url" 
    id="figmaUrlInput" 
    placeholder="https://www.figma.com/file/..."
    class="figma-url-input"
  />
  <div class="figma-help-text">
    Provide a Figma URL for enhanced design-aware analysis
  </div>
</div>
```

### **5. Error Handling & Fallbacks**
**Objective**: Graceful degradation when MCP is unavailable

**Fallback Strategy**:
```javascript
class RobustParsingStrategy {
  async parseWithFallback(input, figmaUrl = null) {
    try {
      // Primary: Enhanced parsing with MCP
      return await this.enhancedParseWithMCP(input, figmaUrl);
    } catch (mcpError) {
      console.warn('MCP analysis failed, falling back to local:', mcpError.message);
      
      try {
        // Secondary: Enhanced local parsing
        return await this.enhancedLocalParsing(input);
      } catch (localError) {
        console.warn('Enhanced parsing failed, using basic:', localError.message);
        
        // Tertiary: Basic parsing
        return await this.basicParseTechStack(input);
      }
    }
  }

  displayFallbackMessage(level) {
    const messages = {
      mcp: '⚠️ Enhanced analysis unavailable - using local processing',
      local: '⚠️ Advanced features unavailable - using basic parsing',
      basic: '✅ Basic tech stack analysis complete'
    };
    
    showStatusMessage(messages[level], level === 'basic' ? 'success' : 'warning');
  }
}
```

## **Real-time Features**

### **1. Connection Status Indicator**
```javascript
const updateConnectionStatus = (connected) => {
  const indicator = document.getElementById('mcpConnectionStatus');
  indicator.className = connected ? 'connection-status connected' : 'connection-status disconnected';
  indicator.textContent = connected ? '🟢 MCP Connected' : '🔴 MCP Offline';
};
```

### **2. Progressive Enhancement**
```javascript
const progressiveEnhancement = {
  async loadBasic() {
    // Load basic tech stack parsing
    await loadBasicParser();
    showFeatureLevel('basic');
  },

  async loadEnhanced() {
    // Load Phase 1 enhancements
    await loadDesignPatternRecognition();
    showFeatureLevel('enhanced');
  },

  async loadMCPIntegration() {
    // Load Phase 2 MCP integration
    if (await testMCPConnection()) {
      await loadMCPConnector();
      showFeatureLevel('full');
    }
  }
};
```

## **Implementation Plan**

### **Week 1: MCP Server Enhancement**
- [ ] Extend MCP server with design-context methods
- [ ] Implement `analyze_project_with_context` endpoint
- [ ] Add enhanced analysis with Gemini AI integration
- [ ] Create fallback mechanisms for server unavailability

### **Week 2: UI Integration**
- [ ] Create `FigmaMCPConnector` class for robust communication
- [ ] Add Figma URL input to the interface
- [ ] Implement progressive enhancement strategy
- [ ] Add connection status indicators

### **Week 3: Error Handling & Testing**
- [ ] Implement comprehensive fallback strategies
- [ ] Add real-time connection monitoring
- [ ] Create integration tests for UI ↔ MCP communication
- [ ] Performance optimization for response handling

## **Success Metrics**
- [ ] **Connection Reliability**: > 95% successful connections when MCP available
- [ ] **Response Time**: < 3 seconds for enhanced analysis requests
- [ ] **Fallback Effectiveness**: Graceful degradation maintains core functionality
- [ ] **User Experience**: Seamless integration feels like single, enhanced interface

## **Testing Strategy**

### **Integration Tests**
```javascript
describe('Figma MCP Integration', () => {
  test('should successfully connect to MCP server', async () => {
    const connector = new FigmaMCPConnector();
    const connected = await connector.connect();
    expect(connected).toBe(true);
  });

  test('should handle MCP server unavailable gracefully', async () => {
    const connector = new FigmaMCPConnector('http://localhost:9999');
    await expect(connector.sendEnhancedAnalysis(mockData)).rejects.toThrow('MCP server unavailable');
  });

  test('should send enhanced tech stack data to MCP', async () => {
    const connector = new FigmaMCPConnector();
    const response = await connector.sendEnhancedAnalysis(mockEnhancedStack);
    expect(response.success).toBe(true);
    expect(response.analysis).toBeDefined();
  });
});
```

### **End-to-End Tests**
- Complete workflow: Input → Enhanced Analysis → MCP Communication → UI Update
- Error scenarios: Server down, network issues, invalid responses
- Performance tests: Response times, concurrent requests

## **Dependencies**
- Phase 1: Enhanced tech stack analysis completed
- MCP server with Gemini AI integration operational
- Figma API access for URL processing

---
**Ready for Development**: This phase creates the crucial bridge between our enhanced smart parser and the powerful MCP server capabilities, enabling design-aware code generation.