# UI Test Directory

This directory contains comprehensive test files for the Figma AI Ticket Generator UI components and functionality.

## Test Files

### 🧪 **test-figma-integration.html** - Main Test Suite
- **Enhanced Frame Data Tests**: Validation compliance, hierarchy analysis, semantic role detection
- **Screenshot & Visual Context Tests**: Screenshot capture simulation, visual analysis
- **AI Integration Tests**: AI ticket generation, enhanced vs fallback modes, MCP tool integration  
- **UI Component Tests**: Context preview, parse tech stack, debug panel, Figma message handling
- **End-to-End Flow Tests**: Complete generation workflow, plugin lifecycle testing
- **Server Status Tests**: Web server and MCP server connectivity

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