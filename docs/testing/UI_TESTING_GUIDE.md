# UI Testing Guide - Updated October 2025

**🚀 MAJOR UPDATE:** All UI tests have been consolidated into a single, comprehensive test suite for better organization and maintainability.

## 🎯 **NEW: Primary Test Interface (RECOMMENDED)**

### **🚀 Ultimate Consolidated Test Suite**
**Location:** `tests/integration/test-consolidated-suite.html`  
**URL:** `http://localhost:3000/tests/integration/test-consolidated-suite.html`

**Features:**
- **Tabbed Interface:** 7 organized test categories
- **Global Test Runner:** Run all tests with one button  
- **Real-time Metrics:** Live success/failure tracking
- **Unified Console:** Single output for all test results
- **Professional UI:** Modern, responsive design

### **🗂️ Test Categories Available:**

#### **🖥️ System Tab**
- MCP Server status and health
- Web server validation  
- API endpoint testing (/api/figma/health, /api/figma/screenshot, /api/generate-ticket)
- Tech stack detection validation

#### **📸 Screenshots Tab** 
- Screenshot API testing (replaces test-screenshot-api.html)
- Visual context processing
- Context preview functionality (replaces context-preview-test.html)
- Base64 encoding validation

#### **📋 Templates Tab**
- Template engine testing (replaces template-system-test.html)
- Platform template validation (Jira, GitHub, Linear, etc.)
- Variable substitution testing
- All 45 template combinations validation (replaces test-template-combinations.html)

#### **🤖 AI Tab**
- AI orchestrator testing
- Enhanced data layer validation (replaces enhanced-data-layer-demo.html)
- Gemini integration testing
- AI-powered ticket generation

#### **🧩 UI Tab**
- UI functionality and navigation (replaces test-ui-functionality.html)
- Message handling (analyze-design-health)
- Loading states and animations
- Responsive design validation

#### **🔄 E2E Tab**
- Complete workflow testing (Selection → Analysis → Screenshot → Ticket)
- MCP integration flow validation
- Error recovery and graceful handling
- Data flow integrity testing

#### **🚀 Performance Tab**
- Load testing and stress testing
- Response time measurement
- Memory usage monitoring
- Performance benchmarks

### 📊 **enhanced-data-layer-demo.html** - Data Layer Demo
- Visual demonstration of enhanced frame data extraction
- Shows hierarchy analysis, semantic roles, and design token extraction
- Interactive examples of component classification

### 🎭 **figma-plugin-simulator.html** - Plugin Simulator  
- Simulates Figma plugin environment for testing without Figma
- Mock Figma API responses and plugin message handling
- Isolated testing of plugin functionality

### 🎯 **template-system-test.html** - Template System Test Suite
- **Platform Template Tests**: Comprehensive testing for 10+ platforms (Jira, Confluence, Notion, etc.)
- **Variable Substitution Tests**: Test context variable replacement and template rendering
- **Integration Tests**: MCP server integration, Figma data integration, fallback system
- **Comprehensive Test Runner**: Automated test suite with metrics dashboard and reporting
- **Interactive Platform Switching**: Test templates across different platforms and document types

### 🧪 **Other Test Files**
- **`test-ui-functionality.html`** - UI functionality validation
- **`test-ui.html`** - Basic test interface  
- **`test-interactive-suite.html`** - Interactive test suite
- **`test-figma-plugin.html`** - Built plugin copy for testing
- **`context-preview-test.html`** - Context preview testing

## Key Features Tested

✅ **Enhanced Frame Data**: Dimensions, hierarchy, metadata validation  
✅ **Screenshot Capture**: PNG export with proper scaling  
✅ **AI Integration**: Enhanced vs fallback ticket generation  
✅ **Parse Tech Stack**: Technology detection and confidence scoring  
✅ **Context Preview**: Visual context display and editing  
✅ **Debug Panel**: Comprehensive debugging information  
✅ **MCP Server**: All 6 tools (analyze_project, generate_tickets, etc.)  
✅ **Semantic Roles**: Button, input, header, component detection  
✅ **Design Tokens**: Color, typography, spacing extraction  
✅ **Template System**: Parameterized ticket generation across 10+ platforms  
✅ **Variable Substitution**: Context-aware template rendering  
✅ **AI Integration**: Template-based AI assistant prompts and context markers  

## Usage

```bash
# Open main test suite
open ui/test/test-figma-integration.html

# Open template system test suite
open ui/test/template-system-test.html

# Run comprehensive test suite (in browser)
Click "🚀 Run Comprehensive Test Suite" button

# Individual feature testing
Click specific test buttons for targeted validation

# Template system testing
Click "🎯 Run All Template System Tests" in template test suite
```

## Test Coverage

- **Server Connectivity**: Web server and MCP server connectivity
- **Data Validation**: All required fields (dimensions, hierarchy, metadata)  
- **Visual Context**: Screenshot capture and analysis
- **AI Processing**: Enhanced context vs fallback generation
- **Component Analysis**: Semantic roles and design token extraction
- **End-to-End Workflows**: Complete plugin lifecycle testing

This test suite validates all core functionality and ensures production readiness.