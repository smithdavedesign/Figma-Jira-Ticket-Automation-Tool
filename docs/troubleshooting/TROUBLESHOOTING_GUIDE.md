# 🛠️ Troubleshooting Guide

**Last Updated:** October 24, 2025  
**Status:** Production Ready - Comprehensive Issue Resolution  
**Audience:** End Users, Developers, System Administrators

---

## 🎯 **Quick Issue Resolution**

### **🚨 Common Issues and Immediate Solutions**

| **Issue** | **Quick Fix** | **Details** |
|-----------|---------------|-------------|
| Plugin won't load | Check Figma permissions & refresh | See [Plugin Installation](#plugin-installation-issues) |
| AI service not responding | Verify API keys and service status | See [AI Service Issues](#ai-service-troubleshooting) |
| Screenshot capture fails | Check frame selection and permissions | See [Screenshot Issues](#screenshot-capture-problems) |
| Template not working | Validate YAML syntax and structure | See [Template Issues](#template-system-problems) |
| Performance slowdown | Clear cache and restart Figma | See [Performance Issues](#performance-optimization) |

---

## 🔧 **Plugin Installation Issues**

### **Plugin Won't Load or Install**
```
Installation Troubleshooting Steps
├── Check Figma Version        # Ensure Figma is up to date
├── Clear Browser Cache        # Clear Figma web cache
├── Verify Permissions        # Check plugin permissions
├── Restart Figma             # Full application restart
├── Check Network Connection   # Verify internet connectivity
└── Plugin File Integrity     # Validate plugin files
```

**Step-by-Step Resolution:**
```javascript
// Plugin Installation Verification
1. Figma Version Check
   - Minimum Required: Figma Desktop 116.0+
   - Current Version: Help → About Figma
   - Update: Figma → Check for Updates

2. Permission Verification
   - Plugins → Development → Check plugin permissions
   - Ensure "Allow network access" is enabled
   - Verify "Allow file system access" if needed

3. Cache Clearing Process
   - Desktop: Help → Troubleshooting → Clear Cache and Restart
   - Web: Browser settings → Clear browsing data
   - Plugin-specific: Remove and reinstall plugin

4. Network Connectivity
   - Test AI service endpoints
   - Verify firewall/proxy settings
   - Check corporate network restrictions
```

### **Plugin Activation Problems**
```
Activation Issue Resolution
├── Plugin Menu Access         # Plugins → Development → [Plugin Name]
├── Manifest Validation       # Check manifest.json syntax
├── Code Compilation         # Verify TypeScript/JavaScript compilation
├── Network Service Check     # Test external service connectivity
└── Error Log Analysis       # Check browser/Figma console for errors
```

**Activation Troubleshooting:**
```javascript
// Plugin Activation Checklist
const activationChecklist = {
  manifest: {
    check: "Validate manifest.json syntax",
    command: "JSON.parse() test",
    fix: "Correct JSON syntax errors"
  },
  compilation: {
    check: "Verify code.js compilation",
    command: "Check TypeScript build output",
    fix: "Run npm run build to recompile"
  },
  permissions: {
    check: "Confirm required permissions",
    command: "Review plugin permissions dialog",
    fix: "Grant all required permissions"
  },
  services: {
    check: "Test AI service connectivity",
    command: "Ping AI service endpoints",
    fix: "Verify API keys and service status"
  }
};
```

---

## 🤖 **AI Service Troubleshooting**

### **AI Service Connection Issues**
```
AI Service Diagnosis
├── API Key Validation        # Verify API keys are correct and active
├── Service Endpoint Check    # Test service availability
├── Rate Limit Assessment     # Check API rate limiting
├── Authentication Status     # Verify authentication tokens
├── Service Health Check      # Monitor service uptime
└── Network Configuration     # Check network and proxy settings
```

**AI Service Resolution Steps:**
```javascript
// AI Service Health Check
class AIServiceTroubleshooter {
  async diagnoseAIServices() {
    const diagnostics = {
      gemini: await this.checkGeminiService(),
      openai: await this.checkOpenAIService(),
      anthropic: await this.checkAnthropicService(),
      networking: await this.checkNetworkConnectivity()
    };
    
    return this.generateDiagnosticReport(diagnostics);
  }
  
  async checkGeminiService() {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
        headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY }
      });
      return { status: response.ok ? 'healthy' : 'error', response };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}
```

### **AI Response Quality Issues**
```
Quality Troubleshooting
├── Prompt Optimization       # Review and improve prompts
├── Context Enhancement       # Improve input context quality
├── Service Configuration     # Adjust AI service parameters
├── Template Validation      # Check template compatibility
└── Output Validation        # Implement response validation
```

**Quality Improvement Process:**
```javascript
// AI Quality Enhancement
const qualityTroubleshooting = {
  promptIssues: {
    symptoms: ["Generic responses", "Missing context", "Incorrect format"],
    solutions: [
      "Add more specific context to prompts",
      "Include design specifications in prompts",
      "Use structured prompt templates",
      "Validate prompt completeness before sending"
    ]
  },
  contextIssues: {
    symptoms: ["Irrelevant responses", "Missing design details"],
    solutions: [
      "Improve screenshot quality and context",
      "Add more descriptive frame names",
      "Include component specifications",
      "Enhance visual context analysis"
    ]
  }
};
```

---

## 📸 **Screenshot Capture Problems**

### **Screenshot Service Status Check**

#### **✅ Current Status: SERVER WORKING CORRECTLY**

Your server and plugin integration is working properly! Common "errors" are often expected behavior.

#### **Server Health Verification**
```bash
# Verify server health
curl -s http://localhost:3000/api/figma/health | jq

# Expected response:
{
  "status": "healthy",
  "service": "figma-screenshot-proxy", 
  "config": {
    "hasApiKey": true,
    "environment": "development"
  }
}
```

### **"Errors" That Are Actually Expected**

#### **📋 404 Errors for 'dev-file'**
```json
{
  "error": "Figma API error",
  "message": "Failed to fetch screenshot: 404 Not Found",
  "details": "{\"status\":404,\"err\":\"Not found\"}",
  "figmaStatus": 404,
  "requestTime": 565
}
```

**This is CORRECT behavior!** 
- `dev-file` is a placeholder, not a real Figma file key
- Real file keys look like: `ABC123def456` (alphanumeric)
- You get these from actual Figma URLs: `https://www.figma.com/file/ABC123def456/My-Design`

### **Screenshot Capture Troubleshooting**
```
Screenshot Troubleshooting
├── Frame Selection Issues     # Check frame selection logic
├── Canvas Access Problems     # Verify canvas access permissions
├── Image Processing Errors    # Debug image processing pipeline
├── Memory Limitations        # Check memory usage and limits
└── Browser Compatibility     # Verify browser support
```

**Proper Testing Process:**

1. **In Figma Plugin**:
   - Open a real Figma file (not a test/dev file)
   - Select a frame or component  
   - Run your plugin
   - The plugin will extract the real file key from `figma.fileKey`

2. **Manual API Testing**:
   ```bash
   # Get real file key from a Figma URL like:
   # https://www.figma.com/file/ABC123def456/My-Design
   
   # Test with real file key:
   curl "http://localhost:3000/api/figma/screenshot?fileKey=ABC123def456&nodeId=1:2"
   ```

3. **Server Log Monitoring**:
   ```
   📸 Fetching screenshot from Figma API: nodeId in fileKey
   🔗 API URL: https://api.figma.com/v1/images/fileKey?ids=nodeId&format=png&scale=2
   ```

**Screenshot Resolution Steps:**
```javascript
// Screenshot Capture Debugging
class ScreenshotTroubleshooter {
  async diagnoseScreenshotIssue(error) {
    const diagnostics = {
      frameSelection: this.validateFrameSelection(),
      canvasAccess: this.checkCanvasPermissions(),
      imageProcessing: this.testImageProcessing(),
      memoryUsage: this.checkMemoryUsage(),
      browserSupport: this.validateBrowserSupport()
    };
    
    return this.createResolutionPlan(diagnostics, error);
  }
  
  validateFrameSelection() {
    const selection = figma.currentPage.selection;
    return {
      hasSelection: selection.length > 0,
      selectionType: selection[0]?.type,
      isFrame: selection[0]?.type === 'FRAME',
      hasContent: selection[0]?.children?.length > 0
    };
  }
}
```

### **Success vs Problem Indicators**

#### **✅ Success Indicators:**
- Server logs show: `✅ Screenshot fetched successfully`
- API returns: `{"imageUrl": "https://figma-alpha-api.s3.us-west-2.amazonaws.com/..."}`
- Plugin receives valid Figma CDN URL

#### **❌ Real Problems** (vs expected 404s):
- Server not responding at all
- CORS errors in browser console
- Authentication errors (401/403)
- Server crashes or timeouts

---

## 📝 **Template System Problems**

### **Template Loading and Parsing Issues**
```
Template Troubleshooting
├── YAML Syntax Validation    # Check YAML syntax correctness
├── Template Structure Check  # Verify required template sections
├── Variable Resolution      # Debug template variable substitution
├── Conditional Logic       # Test conditional template sections
└── Platform Compatibility  # Ensure platform-specific compatibility
```

**Template Debugging Process:**
```yaml
# Template Validation Checklist
template_validation:
  syntax_check:
    tool: "YAML parser validation"
    command: "yaml.safe_load(template_content)"
    error_handling: "Report line number and syntax error"
    
  structure_validation:
    required_sections: ["metadata", "sections"]
    optional_sections: ["conditional_sections", "custom_fields"]
    validation_rules:
      - "metadata must include name and platform"
      - "sections must include at least title and description"
      - "all template variables must be defined"
      
  variable_resolution:
    test_variables:
      - "{{ component_name }}"
      - "{{ ai_generated_description }}"
      - "{{ technical_requirements }}"
    fallback_handling: "Use default values for missing variables"
    error_reporting: "Log undefined variable usage"
```

### **Template Customization Issues**
```javascript
// Template Customization Troubleshooting
class TemplateTroubleshooter {
  validateCustomTemplate(templateContent) {
    const validation = {
      syntax: this.validateYAMLSyntax(templateContent),
      structure: this.validateTemplateStructure(templateContent),
      variables: this.validateTemplateVariables(templateContent),
      logic: this.validateConditionalLogic(templateContent)
    };
    
    return this.generateValidationReport(validation);
  }
  
  fixCommonTemplateIssues(template) {
    const fixes = [
      this.fixYAMLIndentation,
      this.fixMissingRequiredFields,
      this.fixVariableReferences,
      this.fixConditionalSyntax
    ];
    
    return fixes.reduce((fixed, fixFunction) => fixFunction(fixed), template);
  }
}
```

---

## 🚀 **Performance Optimization**

### **Performance Issues and Solutions**
```
Performance Troubleshooting
├── Memory Usage Analysis     # Monitor memory consumption
├── Network Optimization     # Optimize API calls and data transfer
├── Cache Management        # Implement and manage caching
├── Concurrent Processing   # Optimize parallel operations
└── Resource Cleanup       # Proper resource disposal
```

**Performance Optimization Steps:**
```javascript
// Performance Monitoring and Optimization
class PerformanceTroubleshooter {
  async optimizePerformance() {
    const metrics = await this.gatherPerformanceMetrics();
    const optimizations = this.identifyOptimizations(metrics);
    
    return {
      currentMetrics: metrics,
      recommendations: optimizations,
      implementationPlan: this.createOptimizationPlan(optimizations)
    };
  }
  
  gatherPerformanceMetrics() {
    return {
      memoryUsage: performance.memory,
      apiResponseTimes: this.measureAPIResponseTimes(),
      screenshotProcessingTime: this.measureScreenshotTime(),
      templateProcessingTime: this.measureTemplateTime(),
      cacheHitRatio: this.calculateCacheHitRatio()
    };
  }
}
```

---

## 📞 **Support and Escalation**

### **Getting Additional Help**
```
Support Escalation Path
├── Self-Service Resources   # Documentation and guides
├── Community Support      # User community and forums
├── Technical Support      # Direct technical assistance
├── Emergency Support      # Critical issue escalation
└── Development Team       # Core development team contact
```

**Support Contact Information:**
- **Documentation:** Check comprehensive guides first
- **Community Forum:** User community for common questions
- **Technical Support:** Submit detailed issue reports
- **Emergency Hotline:** Critical production issues only

---

**🛠️ Troubleshooting Status: Comprehensive Issue Resolution Coverage ✅**  
**🎯 Next: Implement automated health monitoring and diagnostics**