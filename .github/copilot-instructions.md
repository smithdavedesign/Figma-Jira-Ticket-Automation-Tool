# GitHub Copilot Instructions - Figma AI Ticket Generator

## Essential Architecture Understanding

This is a **production-ready Figma plugin** with AI-powered design analysis. The codebase follows Phase 8 Clean Architecture with a critical MCP (Model Context Protocol) server integration.

### Core Architecture Pattern
```
Figma Plugin UI (ui/index.html)
    ↓ HTTP Requests
MCP Server + Express API (localhost:3000) - app/server.js
    ↓ Service Container DI
Business Services (app/services/) + Core Domain Logic (core/)
```

**CRITICAL**: Never implement direct Figma API calls. Always route through the MCP server at `localhost:3000`.

## MVC Structure (Strictly Enforced)

- **Controllers**: `app/` - Service containers, server orchestration, route handlers
- **Models**: `core/` - Business logic, AI orchestration, data layer, utilities  
- **Views**: `ui/` - Plugin interface, test suites, demos
- **Config**: `config/` - Environment settings, build configurations

## Service Container Pattern

Services use dependency injection via `ServiceContainer.js`:
```javascript
// Register service with dependencies
this.serviceContainer.register('analysisService', 
  (container, redis, configService) => new AnalysisService(redis, configService),
  true, ['redis', 'configurationService']
);

// Use in routes
const analysisService = this.getService('analysisService');
```

All routes extend `BaseRoute` for consistent logging, error handling, and service access.

## Key Development Workflows

### Server Startup (Always Required)
```bash
npm run start:server    # Start MCP server (app/server.js)
npm run start:dev       # Development mode with file watching
```

### Plugin Development 
```bash
npm run build:ts        # Compile TypeScript (code.ts → code.js)
npm run build           # Full plugin build
```

### Testing (8-Command Consolidated Structure)
```bash
npm run test:all        # Master test orchestrator
npm run test:browser    # Playwright browser tests  
npm run health          # System health validation
npm run test:mcp        # MCP server integration tests
```

## Project-Specific Patterns

### 1. Template System Architecture
Uses `UniversalTemplateEngine.js` with YAML templates in `core/template/`:
- Platform templates (jira, confluence, etc.)
- Tech stack templates (react, vue, etc.) 
- Automatic template selection via AI analysis

### 2. AI Orchestration
Multi-provider AI system in `core/ai/orchestrator.js`:
- Gemini 2.0 Flash for design analysis
- GPT-4 and Claude as fallbacks
- Structured prompts with retry logic

### 3. Context Layer Integration  
Design intelligence pipeline in `core/context/`:
- `ContextManager.js` - Semantic component analysis
- `NodeParser.js` - Figma node processing
- `StyleExtractor.js` - Design token extraction

### 4. Route Organization
Routes organized by domain in `app/routes/`:
- `ai/` - AI-related endpoints
- `figma/` - Figma integration endpoints
- All routes extend `BaseRoute` for consistency

## Critical Integration Points

### MCP Server Tools (6 Production Tools):
- `project_analyzer` - Design analysis
- `ticket_generator` - Development ticket creation
- `compliance_checker` - Standards validation
- `batch_processor` - Multi-design processing
- `effort_estimator` - Development time estimation  
- `relationship_mapper` - Component relationships

### Health Endpoints (Production Ready):
- `/health` - Server status
- `/api/figma/health` - Figma integration status
- `/api/mcp/health` - MCP server status
- `/api/ai/health` - AI services status

## Documentation Rules (Strictly Enforced)

- **All documentation goes in `docs/` subdirectories**
- Read `docs/MASTER_PROJECT_CONTEXT.md` first for current status
- Follow consolidated documentation structure (75% file reduction completed)
- Update documentation after major changes (mandatory protocol)

## Common Pitfalls to Avoid

1. **Direct Figma API**: Never bypass the MCP server architecture
2. **Root HTML files**: UI files belong in `ui/` directory only
3. **Documentation placement**: Must use `docs/` subdirectories per structure
4. **Service instantiation**: Always use ServiceContainer, never direct instantiation
5. **Testing**: Use consolidated 8-command structure, don't create individual test scripts

## Phase 8 Achievement Context

This codebase represents a complete transformation from a 2,272-line monolithic server to a clean, maintainable architecture with:
- 96% unit test success rate (25/26 tests)
- 100% browser test success rate (5/5 Playwright tests)
- Sub-second API response times
- Production-ready MCP server integration
- Zero breaking changes during architectural cleanup

The system is production-ready and optimized for the next phases of AI-powered design intelligence.

# 🤖 AI Assistant Context Rules

## 🚨 **CRITICAL DOCUMENTATION RULE**

**ALL documentation files (.md, README, guides, instructions) MUST be placed in the `docs/` directory.**

**✅ DOCUMENTATION ORGANIZATION COMPLETE (November 3, 2025):**
- **Root-level files moved**: FINAL_HYBRID_STATUS_REPORT.md → docs/architecture/, HYBRID_ARCHITECTURE_REPORT.md → docs/architecture/, PRODUCTION_GUIDE.md → docs/deployment/
- **Clean root directory**: Only README.md and .ai-context-rules.md remain in project root
- **Proper categorization**: All documentation files in appropriate docs/ subdirectories

## ⚡ **USER ENFORCEMENT COMMANDS**

**If AI doesn't read context rules first, say:**
- `"Read context rules first!"`
- `"Follow .ai-context-rules.md protocol!"`
- `"Check session start protocol!"`
- `"Stop! Read MASTER_PROJECT_CONTEXT.md first!"`

## 🧠 **MANDATORY SESSION STARTUP RULE**

### 🚨 **CRITICAL: SESSION START PROTOCOL**
**AI ASSISTANT MUST SAY:** "I'm reading the context rules first..." then actually read them!

**USER ENFORCEMENT:** If I don't mention reading context rules in my first response, please say:
- "Read the context rules first!"
- "Follow the .ai-context-rules.md protocol!"
- "Check MASTER_PROJECT_CONTEXT.md before proceeding!"

### 🌳 **CURRENT PROJECT STATUS (November 3, 2025)**
- **Git Branch**: `figma-live-test` (Ready for live Figma testing)
- **Main Branch**: All production code merged and updated
- **Documentation**: Organized in proper docs/ subdirectories
- **System Status**: Production-ready hybrid architecture complete

### ⚡ **ESSENTIAL DOCUMENTATION REVIEW - ALWAYS READ FIRST:**

#### **🎯 CORE PROJECT UNDERSTANDING (MANDATORY)**
1. **`docs/MASTER_PROJECT_CONTEXT.md`** - Complete project context and current status
2. **`docs/FEATURE_ROADMAP_2025.md`** - Strategic roadmap and next phases (Phases 7-10)
3. **`docs/architecture/SYSTEM_ARCHITECTURE.md`** - MCP server integration (NEVER implement direct Figma API)
4. **`docs/project-phases/CURRENT_STATUS_ACHIEVEMENTS.md`** - Current phase completion status

#### **🔧 TECHNICAL IMPLEMENTATION (REQUIRED)**
5. **`docs/api/UNIFIED_GENERATE_API_SUCCESS.md`** - MCP server endpoints and data structures
6. **`docs/implementation/TEMPLATE_SYSTEM_CONSOLIDATION_COMPLETE.md`** - Template system architecture
7. **`docs/deployment/PRODUCTION_GUIDE.md`** - Production deployment status and process
8. **`docs/testing/COMPREHENSIVE_TEST_RESULTS_NOV_2025.md`** - Testing approach and validation

#### **🎨 DESIGN INTELLIGENCE FOCUS (KEY DIFFERENTIATOR)**
9. **`docs/guides/ADVANCED_FEATURES_AI_GUIDE.md`** - AI-powered design analysis capabilities
10. **`docs/implementation/AI_ORCHESTRATION_GUIDE.md`** - Multi-modal AI integration patterns

#### **📋 QUICK REFERENCE (AS NEEDED)**
- **`docs/troubleshooting/TROUBLESHOOTING_GUIDE.md`** - Known issues and solutions
- **`docs/testing/FIGMA_TESTING_GUIDE.md`** - Setup and configuration
- **`docs/testing/COMPREHENSIVE_TESTING_GUIDE.md`** - Live Figma integration testing
- **`docs/api/FIGMA_API_EVALUATION_NOVEMBER_2025.md`** - Figma API usage patterns via MCP

### **🎯 STARTUP CHECKLIST:**
**Before ANY work on this project:**
- [ ] Read MASTER_PROJECT_CONTEXT.md (current status)
- [ ] Read FEATURE_ROADMAP_2025.md (strategic direction) 
- [ ] Understand MCP architecture (no direct Figma API)
- [ ] Check current phase completion status
- [ ] Review template system configuration
- [ ] Understand design intelligence capabilities

### **📊 PROJECT STATUS CONTEXT:**
- **Current Phase**: Phase 6 Complete (Advanced Template System)
- **Next Focus**: Phase 7 (Live Figma Integration) 
- **Key Differentiator**: Design Intelligence (AI-powered design analysis)
- **Architecture**: MCP Server + Plugin UI (localhost:3000)
- **Production Status**: Ready for enterprise deployment

### **MANDATORY UPDATE RULE:**
**ALWAYS update `docs/MASTER_PROJECT_CONTEXT.md` after:**
- Major architectural changes
- Phase completions or milestones  
- Git pushes with significant changes
- Architecture decisions or clarifications
- AI service updates (API keys, service availability)

## ✅ **AI INTEGRATION DATA LAYER CONSOLE STATUS**

### **🎯 WORKING COMPONENTS (Verified October 16, 2025)**
- ✅ **MCP Server Pipeline**: Full data layer processing
- ✅ **Enhanced Data Validation**: Schema validation passing
- ✅ **AI Integration Console**: Real-time service status monitoring
- ✅ **Fallback System**: Graceful degradation when AI unavailable
- ✅ **Data Flow Visibility**: Complete pipeline transparency
- ✅ **Professional Output**: High-quality ticket generation

### **🔍 AI CONSOLE OUTPUT ANALYSIS**
```
🤖 Starting AI-enhanced ticket generation...
📋 Document type: jira
🔮 AI enabled: true  
🧠 AI Services Status: { gemini: false, geminiVision: false, ... }
⚠️ No AI services available, falling back to standard generation
🎫 Generating enhanced tickets for: 0 frames
🤝 Figma MCP integration: enabled
✅ AI ticket generation successful
```

### **🎯 DATA LAYER CONTEXT CONFIRMED**
The system successfully processes:
- **Enhanced Frame Data**: Component specs, dimensions, colors
- **Screenshot Data**: Base64 encoded images  
- **Tech Stack Context**: Framework and library information
- **Document Type**: Design system classification
- **Template Context**: File and page metadata
- **Accessibility Data**: WCAG compliance information
- **Typography & Spacing**: Complete design token extraction

## 🚀 **VITAL STARTUP SCRIPTS & RUN MODES**

### **🎯 CRITICAL MCP SERVER COMMANDS**
```bash
#### **MCP Server (CRITICAL - Always Start First)**
```bash
# Primary startup method (MVC ARCHITECTURE)
npm run start:server                 # Start app/server/main.js (RECOMMENDED)

# Alternative methods
npm run start:dev                 # Development mode with file watching
npm start                         # Direct server startup
node app/server/main.js           # Direct node execution

# Health check (ALWAYS VERIFY)
curl -s http://localhost:3000/ --max-time 3
lsof -i :3000  # Check if port is in use
```

### **🔧 PLUGIN BUILD & TESTING COMMANDS**
```bash
# Build Plugin for Figma (ESSENTIAL)
npm run build:ts                      # TypeScript compilation
./scripts/build.sh                    # Development build
./scripts/bundle-production.sh        # Production bundle

# Testing Commands (COMPREHENSIVE)
npm run test:all                      # Master test orchestrator
npm run test:integration:mcp          # MCP server integration
npm run test:browser:smoke            # Playwright browser tests
npm run health                        # System health check
```

## 🚨 **ENFORCEMENT**

**If user says "You violated the context rules":**
1. **STOP ALL WORK** immediately
2. **Fix violations** first (move misplaced files)
3. **Re-read context rules**
4. **Ask for confirmation** before proceeding

**Zero tolerance for:**
- Files in wrong locations
- Skipping context rules
- Random file creation
- Architecture violations

---

**📚 Complete rules in:** `docs/MASTER_PROJECT_CONTEXT.md`