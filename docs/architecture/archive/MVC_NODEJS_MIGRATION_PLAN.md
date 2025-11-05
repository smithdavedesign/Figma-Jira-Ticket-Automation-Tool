# 🏗️ MVC + Node.js Migration Plan

**Date:** October 23, 2025  
**Status:** Phase 7 Architecture Modernization  
**Goal:** Convert TypeScript complexity to clean MVC Node.js architecture

## 🎯 **Migration Philosophy**

### **Core Principles**
- **Convert, Don't Remove**: Preserve all working logic by converting TypeScript → JavaScript
- **MVC Organization**: Clear separation of Controllers (app/), Models (core/), Views (ui/)
- **Node.js First**: Pure JavaScript with ES6 modules, minimal compilation
- **Redis Ready**: Architecture prepared for persistent storage integration

### **What We're Solving**
- **67 TypeScript files** creating confusion and compilation complexity
- **Dual server architecture** (TypeScript dev vs compiled production)
- **Scattered logic** across multiple directories without clear organization
- **Build complexity** slowing development and deployment

## 📁 **Target MVC Architecture**

### **Complete Directory Structure** (Actual Implementation)
```
figma-ticket-generator/
├── app/                          # 🎮 CONTROLLERS (Entry Points)
│   ├── plugin/                  # Figma Plugin Application Layer
│   │   ├── main.js              # Main plugin entry (→ dist/code.js) ✅
│   │   ├── handlers/            # Plugin event handlers
│   │   └── utils/               # Plugin-specific utilities
│   ├── server/                  # MCP Server Application Layer
│   │   └── main.js              # MCP server entry (localhost:3000) ✅
│   ├── cli/                     # Command Line Interface (Future)
│   └── legacy/                  # Legacy application code
│
├── core/                         # 🧠 MODELS (Business Logic) - DEEP STRUCTURE
│   ├── ai/                      # AI Processing & Orchestration
│   │   ├── adapters/            # AI Provider Adapters ✅
│   │   │   ├── claude-adapter.js      # Anthropic Claude integration
│   │   │   ├── gemini-adapter.js      # Google Gemini API wrapper  
│   │   │   └── gpt4-adapter.js        # OpenAI GPT-4 integration
│   │   ├── models/              # AI Model Definitions ✅
│   │   │   └── ai-models.js           # AI model types and templates
│   │   ├── templates/           # Content Generation Templates ✅
│   │   │   ├── jira/                  # Jira ticket templates
│   │   │   │   ├── code.yml           # Code task templates
│   │   │   │   ├── component.yml      # Component templates
│   │   │   │   ├── feature.yml        # Feature templates
│   │   │   │   ├── code-simple.yml    # Simple code templates
│   │   │   │   └── [*-aem.yml]        # AEM-specific templates
│   │   │   ├── github/                # GitHub issue templates
│   │   │   │   └── issue.yml
│   │   │   ├── linear/                # Linear ticket templates
│   │   │   │   └── feature.yml
│   │   │   ├── notion/                # Notion page templates
│   │   │   │   └── component-page.yml
│   │   │   ├── confluence/            # Confluence documentation
│   │   │   │   └── component-docs.yml
│   │   │   ├── wiki/                  # Wiki documentation
│   │   │   │   └── component-guide.yml
│   │   │   ├── figma/                 # Figma handoff templates
│   │   │   │   └── design-handoff.yml
│   │   │   ├── template-config.js     # Template configuration
│   │   │   └── template-types.js      # Template type definitions
│   │   ├── orchestrator.js      # AI provider routing and fallbacks ✅
│   │   ├── advanced-service.js  # Advanced AI processing services ✅
│   │   ├── template-integration.js # Template processing engine ✅
│   │   ├── visual-enhanced-ai-service.js # Visual analysis AI ✅
│   │   └── figma-mcp-gemini-orchestrator.js # Figma-specific AI ✅
│   │
│   ├── design-intelligence/     # Design Analysis & Intelligence ✅
│   │   ├── adapters/            # Framework-specific adapters
│   │   │   └── react-mcp-adapter.js   # React component adapter
│   │   ├── generators/          # Design specification generators
│   │   │   └── design-spec-generator.js # Spec generation engine
│   │   ├── schema/              # Design specification schemas
│   │   │   └── design-spec.js         # Universal design spec schema
│   │   └── validators/          # Design validation systems
│   │       └── design-spec-validator.js # Spec validation engine
│   │
│   ├── figma/                   # Figma Integration Layer ✅
│   │   ├── figma-mcp-client.js  # Figma MCP integration layer
│   │   └── mcp-client.js        # Base MCP client functionality
│   │
│   ├── data/                    # Data Management & Storage ✅
│   │   ├── cache.js             # Multi-level caching system
│   │   ├── extractor.js         # Data extraction utilities
│   │   ├── redis-client.js      # Redis connection and utilities
│   │   ├── session-manager.js   # User session management
│   │   └── validator.js         # Data validation and schemas
│   │
│   ├── tools/                   # MCP SERVER TOOLS (Business Logic) ✅
│   │   ├── ticket-generator.js  # MCP ticket generation tool
│   │   ├── project-analyzer.js  # MCP project analysis tool
│   │   ├── batch-processor.js   # MCP batch processing tool
│   │   ├── effort-estimator.js  # MCP effort estimation tool
│   │   ├── compliance-checker.js # MCP compliance checking tool
│   │   └── relationship-mapper.js # MCP relationship mapping tool
│   │
│   ├── compliance/              # Design System Compliance ✅
│   │   └── design-system-compliance-checker.js # Compliance validation
│   │
│   ├── shared/                  # Shared Type Definitions & Utilities ✅
│   │   ├── design-system.js     # Design system type definitions
│   │   ├── figma-api.js         # Figma API type definitions  
│   │   ├── plugin-messages.js   # Plugin message type definitions
│   │   └── types/               # Additional shared types
│   │
│   ├── utils/                   # Core Utilities ✅
│   │   ├── logger.js            # Centralized logging system
│   │   └── error-handler.js     # Error handling utilities
│   │
│   ├── design-system/           # Design System Analysis (Empty - Needs Files)
│   ├── types/                   # Core Type Definitions (Empty - Needs Files)
│   └── validation/              # Validation Systems (Empty - Needs Files)
│
├── ui/                          # 🖼️ VIEWS (Frontend)
│   ├── components/              # UI Components
│   ├── plugin/                  # Plugin-specific UI
│   ├── test/                    # UI Testing
│   │   ├── test-ui.html         # Enhanced test interface ✅
│   │   └── template-combinations.html # Template testing page ✅
│   └── index.html               # Main plugin UI entry ✅
│
├── config/                      # ⚙️ CONFIGURATION ✅
│   ├── ai.config.js             # AI provider configurations
│   ├── manifest-dev.json        # Development plugin manifest
│   ├── redis.config.js          # Redis connection settings
│   └── server.config.js         # Server settings and environment
│
│
├── archive/                     # 📁 ARCHIVED CODE ✅
│   ├── server-typescript/       # Original TypeScript server (49 files)
│   └── src-typescript/          # Original TypeScript src (37 files)
│
├── docs/                        # 📚 DOCUMENTATION ✅
├── tests/                       # 🧪 TESTING ✅
├── scripts/                     # 🔧 BUILD & DEPLOYMENT SCRIPTS ✅
├── tools/                       # 🛠️ PROJECT ANALYSIS UTILITIES ✅
├── browser-tests/               # 🌐 BROWSER INTEGRATION TESTS ✅
├── package.json                 # Node.js project configuration ✅
└── README.md                    # Project documentation ✅
```

### **🔄 MVC Pattern Mapping**

| **MVC Layer** | **Directory** | **Responsibility** | **Examples** |
|---------------|---------------|-------------------|--------------|
| **Controller** | `app/` | Handle requests, coordinate between Model/View | Plugin entry, server routes, CLI commands |
| **Model** | `core/` | Business logic, data processing, external APIs | AI orchestration, Figma parsing, design analysis |
| **View** | `ui/` | User interface, presentation, user interaction | Plugin UI, forms, preview panels |

## 🔄 **TypeScript → JavaScript Conversion Strategy**

### **Conversion Principles**
1. **Preserve All Logic**: Convert types to JSDoc comments for documentation
2. **Simplify Imports**: Convert ES6 imports/exports, remove complex type imports
3. **Maintain Interfaces**: Convert TypeScript interfaces to JSDoc type definitions
4. **Keep Validation**: Convert Zod schemas to runtime validation functions
5. **Document Types**: Add comprehensive JSDoc for type safety

### **File-by-File Conversion Plan**

#### **Priority 1: Server Core (Immediate)**
```bash
# Current TypeScript → Target JavaScript
server/src/server.ts                 → app/server/main.js
server/src/tools/*.ts               → core/tools/*.js
server/src/ai/*.ts                  → core/ai/*.js
server/src/figma/*.ts               → core/figma/*.js
server/src/data/*.ts                → core/data/*.js
```

#### **Priority 2: Plugin System**
```bash
code.ts                             → app/plugin/main.js
src/plugin/*.ts                     → app/plugin/*.js
src/core/*.ts                       → core/utils/*.js
```

#### **Priority 3: Shared Logic**
```bash
src/shared/*.ts                     → core/utils/*.js
src/design-intelligence/*.ts        → core/design-intelligence/*.js
src/ai-orchestrator/*.ts           → core/ai/*.js
```

### **TypeScript Conversion Template**

#### **Before (TypeScript):**
```typescript
import { FigmaNode, ComponentData } from './types';
import { z } from 'zod';

interface AnalysisResult {
  score: number;
  components: ComponentData[];
}

const ComponentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['COMPONENT', 'INSTANCE']),
});

export class DesignAnalyzer {
  private config: AnalysisConfig;
  
  constructor(config: AnalysisConfig) {
    this.config = config;
  }
  
  async analyze(nodes: FigmaNode[]): Promise<AnalysisResult> {
    // Implementation
  }
}
```

#### **After (JavaScript + JSDoc):**
```javascript
/**
 * @typedef {Object} ComponentData
 * @property {string} id - Component identifier
 * @property {string} name - Component name
 * @property {'COMPONENT'|'INSTANCE'} type - Component type
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {number} score - Analysis score
 * @property {ComponentData[]} components - Analyzed components
 */

/**
 * Validates component data structure
 * @param {Object} data - Component data to validate
 * @returns {boolean} - Validation result
 */
function validateComponentData(data) {
  return data && 
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    ['COMPONENT', 'INSTANCE'].includes(data.type);
}

/**
 * Design analysis engine for Figma components
 */
export class DesignAnalyzer {
  /**
   * @param {Object} config - Analysis configuration
   */
  constructor(config) {
    this.config = config;
  }
  
  /**
   * Analyze Figma nodes for design patterns
   * @param {Object[]} nodes - Figma node data
   * @returns {Promise<AnalysisResult>} Analysis results
   */
  async analyze(nodes) {
    // Implementation preserved from TypeScript
  }
}
```

## 🚀 **Migration Execution Plan**

### **Phase 1: Server Consolidation (This Week)**

#### **Step 1: Create MVC Directory Structure**
```bash
mkdir -p app/plugin app/server app/cli
mkdir -p core/ai core/figma core/design-intelligence core/data core/tools core/utils
mkdir -p config archive/server-typescript
```

#### **Step 2: Convert Server Files**
1. **Extract working logic** from `server/dist/server.js` (stable compiled version)
2. **Convert `server/src/server.ts`** → `app/server/main.js`
3. **Move and convert tools** → `core/tools/*.js`
4. **Move AI logic** → `core/ai/*.js`
5. **Archive original** → `archive/server-typescript/`

#### **Step 3: Update Package Scripts**
```json
{
  "scripts": {
    "start": "node app/server/main.js",
    "dev": "nodemon app/server/main.js",
    "build:plugin": "node scripts/build-plugin.js",
    "test:server": "node tests/integration/test-server.js"
  }
}
```

### **Phase 2: Plugin System (Next Week)**

#### **Convert Plugin Files**
1. **`code.ts`** → `app/plugin/main.js`
2. **`src/plugin/*.ts`** → `app/plugin/*.js`
3. **Update build system** to compile from new location

### **Phase 3: Redis Integration (Phase 7)**

#### **Add Persistent Storage**
1. **Create `core/data/redis-client.js`**
2. **Add session management** in `core/data/session-manager.js`
3. **Implement caching** in `core/data/cache.js`

## 📊 **Benefits & Validation**

### **✅ Expected Benefits**
- **Zero TypeScript compilation** for server development
- **Faster iteration** - no build step for server changes
- **Clearer architecture** - MVC makes responsibilities obvious
- **Easier debugging** - direct JavaScript, no source maps
- **Better maintainability** - logical file organization
- **Redis readiness** - clean integration points prepared

### **🧪 Validation Checkpoints**
- [ ] Server starts with `node app/server/main.js`
- [ ] All MCP tools working at localhost:3000
- [ ] Plugin builds successfully from new structure
- [ ] All existing tests pass
- [ ] No functionality lost in conversion
- [ ] Performance equivalent or better

### **⚡ Rollback Strategy**
- **Archive preservation** - original TypeScript files saved
- **Git branch** - entire migration in feature branch
- **Incremental testing** - validate each conversion step
- **Fallback scripts** - quick revert to original structure if needed

## 🎯 **Success Metrics**

### **Technical Metrics**
- **File count reduction**: 67 TypeScript files → ~40 organized JavaScript files
- **Build time improvement**: Eliminate TypeScript compilation overhead
- **Development speed**: Faster server restart and debugging cycles
- **Code clarity**: Improved readability and maintainability

### **Functional Metrics**
- **All MCP tools working**: 6 tools functional at localhost:3000
- **Plugin compatibility**: Figma plugin loads and functions correctly
- **AI integration**: Gemini, Claude, GPT-4 routing working
- **Test suite passing**: All existing tests converted and passing

## 🔮 **Future Roadmap**

### **Phase 7: Redis Integration** (After MVC completion)
- Persistent user sessions
- Template caching system
- Multi-user support
- Rate limiting and usage tracking

### **Phase 8: Performance Optimization**
- Connection pooling
- Advanced caching strategies
- Database optimization
- Monitoring and alerting

### **Phase 9: Enterprise Features**
- Authentication and authorization
- Multi-tenant architecture
- Advanced analytics
- API rate limiting

## 🔍 **Holistic Migration Checklist**

### **Migration Philosophy: Ecosystem Alignment**
When doing a large migration like this TypeScript → Node.js MVC conversion, we need a **holistic view** — not just "does it compile," but "does the whole ecosystem still align." This comprehensive checklist ensures we modernize the entire development experience.

### **🧩 1. Core Build and Tooling**

#### **✔️ Node.js & npm/yarn/pnpm**
- [ ] Verify Node version alignment across local, CI/CD, and runtime
- [ ] Add `.nvmrc` to lock Node version for consistency
- [ ] Update `package-lock.json` with new dependency structure
- [ ] Test npm scripts work across different environments

#### **✔️ Build tools**
- [ ] Review build system (currently using TypeScript compiler)
- [ ] Migrate to simple Node.js require/ES modules
- [ ] Replace deprecated build plugins/loaders
- [ ] Enable ES module output if project supports `"type": "module"`

#### **✔️ Environment config**
- [ ] Review `.env` handling (dotenv configuration)
- [ ] Ensure secrets/config aren't accidentally committed
- [ ] Update environment-specific build scripts (dev, prod, staging)
- [ ] Verify GEMINI_API_KEY and other environment variables work

### **🧪 2. Linting & Formatting**

#### **✔️ ESLint**
- [ ] Move to latest unified ESLint setup (`eslint.config.js` instead of `.eslintrc`)
- [ ] Remove TypeScript-specific ESLint rules that are no longer needed
- [ ] Ensure Prettier integration still works
- [ ] Add JavaScript-specific linting rules for Node.js

#### **✔️ Scripts**
- [ ] Update `npm run lint` / `npm run format` commands
- [ ] Add pre-commit hooks for code quality
- [ ] Ensure linting works across new MVC directory structure

### **🧱 3. Testing Frameworks**

#### **✔️ Unit testing**
- [ ] Migrate existing TypeScript tests to JavaScript
- [ ] Ensure test framework supports ES modules if using `"type": "module"`
- [ ] Update test imports and module resolution
- [ ] Preserve all existing test functionality

#### **✔️ Integration/e2e**
- [ ] Review Playwright browser tests compatibility
- [ ] Check MCP server integration tests work with new structure
- [ ] Update test paths to new MVC directory structure
- [ ] Ensure Figma plugin tests still function

#### **✔️ Coverage**
- [ ] Migrate test coverage configuration
- [ ] Update coverage paths for new directory structure

### **🧠 4. TypeScript → JavaScript Migration**

#### **✔️ Type Safety Preservation**
- [ ] Convert TypeScript interfaces to JSDoc type definitions
- [ ] Migrate Zod schemas to runtime validation functions
- [ ] Preserve type safety through comprehensive JSDoc comments
- [ ] Document complex types in migration comments

#### **✔️ Import/Export System**
- [ ] Convert TypeScript imports to ES6 or CommonJS
- [ ] Remove type-only imports (`import type`)
- [ ] Update module resolution paths
- [ ] Ensure dynamic imports work correctly

### **🧰 5. Project Automation and CI/CD**

#### **✔️ CI workflows**
- [ ] Remove TypeScript compilation from CI pipeline
- [ ] Update build steps to new Node.js process
- [ ] Add caching for `node_modules`
- [ ] Run linting and testing as preconditions to build

#### **✔️ Pre-commit hooks**
- [ ] Add or update Husky and lint-staged
- [ ] Ensure code quality locally: `npm run lint && npm run test`
- [ ] Add validation for new MVC structure compliance

### **🧩 6. Dependency Health**

#### **✔️ Update all dependencies**
- [ ] Remove TypeScript-specific dependencies (`typescript`, `@types/*`, `tsx`)
- [ ] Review breaking changes in remaining dependencies
- [ ] Remove unused packages from migration
- [ ] Add new dependencies for Node.js ecosystem

#### **✔️ Audit**
- [ ] Run `npm audit fix` after dependency cleanup
- [ ] Replace deprecated polyfills with native Node.js features
- [ ] Ensure all MCP server dependencies are compatible

### **🧠 7. Documentation & Developer Experience**

#### **✔️ Developer setup**
- [ ] Update `README.md` with new MVC structure instructions
- [ ] Document new startup commands (`node app/server/main.js`)
- [ ] Include build/lint/test instructions for JavaScript
- [ ] Update troubleshooting guides

#### **✔️ IDE Configuration**
- [ ] Update VS Code workspace settings for JavaScript
- [ ] Remove TypeScript-specific IDE configurations
- [ ] Add `.editorconfig` for consistent formatting
- [ ] Update import path configurations

#### **✔️ Communication**
- [ ] Document migration goals and timeline
- [ ] Update project status in `MASTER_PROJECT_CONTEXT.md`
- [ ] Communicate changes to stakeholders

### **🧮 8. MVC-Specific Modernization Opportunities**

#### **✅ Architecture Improvements**
- [ ] Implement clean separation of concerns (MVC pattern)
- [ ] Add centralized logging system (`core/utils/logger.js`)
- [ ] Create configuration management system (`config/`)
- [ ] Prepare Redis integration points (`core/data/`)

#### **✅ Development Experience**
- [ ] Add Node.js path aliases (`@core`, `@app`, `@ui`)
- [ ] Implement hot reload for development
- [ ] Add comprehensive error handling middleware
- [ ] Create development debugging utilities

#### **✅ Quality Assurance**
- [ ] Add comprehensive JSDoc documentation
- [ ] Implement runtime type validation
- [ ] Create integration test suite for MVC layers
- [ ] Add performance monitoring and logging

### **🚀 Migration Success Criteria**

#### **Functional Requirements**
- [ ] All 6 MCP tools working at localhost:3000
- [ ] Figma plugin loads and functions correctly
- [ ] AI integration (Gemini, Claude, GPT-4) working
- [ ] All existing tests passing
- [ ] No functionality lost in conversion

#### **Performance Requirements**
- [ ] Server startup time improved (no TypeScript compilation)
- [ ] Development iteration speed increased
- [ ] Memory usage equivalent or better
- [ ] Response times maintained or improved

#### **Maintainability Requirements**
- [ ] Code clarity and readability improved
- [ ] File organization follows MVC principles
- [ ] Documentation comprehensive and up-to-date
- [ ] New developer onboarding simplified

### **📋 Migration Game Plan Summary**

1. **Audit Current State** - Complete ecosystem analysis
2. **Create MVC Structure** - Implement new directory organization
3. **Convert TypeScript Files** - Preserve logic, improve structure
4. **Update Build System** - Simplify to Node.js native
5. **Migrate Tests** - Ensure all functionality validated
6. **Update Documentation** - Comprehensive developer experience
7. **Validate Ecosystem** - End-to-end testing and validation
8. **Deploy and Monitor** - Production readiness validation

---

**This document serves as the complete reference for the MVC + Node.js migration. All conversion decisions and architectural choices should reference this plan.**