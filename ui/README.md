# Design Intelligence Platform - UI Architecture

## 🎯 MVC Architecture Clarification

This directory contains **UI Views** (presentation layer) following proper MVC architecture:

- **`app/plugin/`** = **Controllers** (Plugin business logic, message handlers, Figma API integration)
- **`ui/plugin/`** = **Views** (HTML, CSS, client-side JavaScript for presentation)
- **`core/`** = **Models** (Business logic, AI processing, data management)

## 📁 UI Structure (Views Layer)

### `/ui/plugin/` - **Main Plugin UI** ✅
**Modular MVC View Layer:**
- `index.html` - Clean plugin UI that references modular JS/CSS
- `js/` - Client-side presentation JavaScript (utils, health-metrics, ticket-generator, main)
- `styles/` - Clean CSS for plugin styling
- **Used by:** Figma plugin (manifest.json points here)
- **Communicates with:** `app/plugin/` controllers via postMessage

### Active UI Files



### 📁 Structure### `/ui/unified/index.html` 

**✅ MASTER FILE** - The single source of truth with ALL features:

```- Both Design Health AND Ticket Generator tabs

ui/- MCP Server and OpenAI API mode selection

├── plugin/- Complete token metrics and component analysis

│   ├── index.html          # Main plugin UI (clean, modular)- Used for both web testing and Figma plugin development

│   ├── js/

│   │   ├── main.js         # Main UI controller### `/ui/standalone/index.html`

│   │   ├── utils.js        # Shared utilities**✅ WEB TESTING** - Copy of unified file for E2E testing:

│   │   ├── health-metrics.js  # Health metrics functionality- Served at `http://localhost:8101/ui/standalone/index.html`

│   │   └── ticket-generator.js # AI ticket generation- Used by Playwright tests for automated validation

│   └── styles/- Should be kept in sync with unified file

│       └── main.css        # Clean CSS styles

├── index.html              # Comprehensive standalone UI (5K+ lines)### `/ui/index.html`

├── components/             # Reusable UI components**✅ MAIN PLUGIN ENTRY POINT** - Enhanced UI with context preview:

└── test/                   # UI testing files- Self-contained HTML with all dependencies inlined

```- Enhanced context preview functionality

- Used directly by Figma plugin (manifest points here)

### 🚀 Key Benefits

### `/ui/plugin/index.html`

**✅ Modular Architecture****⚠️ LEGACY BACKUP** - Old plugin structure (for reference only):

- Clean separation of concerns- Used by build script to create `dist/ui/index.html`

- Individual JavaScript modules for each feature- Processed with CSS inlining for Figma compatibility

- Easy to maintain and debug- Should be kept in sync with unified file

- Follows MVC patterns

## 📁 Archived Files

**✅ Clean HTML**

- Semantic, accessible HTML structure### `/ui/legacy/`

- Proper Figma plugin CSS variablesOld HTML files moved here to avoid confusion:

- Dark theme support- `enhanced-ui.html` - Old enhanced version

- Responsive 50/50 panel layout- `ui.html` - Original basic UI

- `ui-standalone.html` - Old standalone version

**✅ Well-Structured JavaScript**- `smart-ticket-generator*.html` - Frontend experiments

- `main.js` - Application initialization and message handling- `src-ui-index.html` - Old src/ui file

- `utils.js` - Shared utilities, element caching, clipboard functions

- `health-metrics.js` - Design system health monitoring### `/ui/test/`

- `ticket-generator.js` - AI-powered ticket generation with MCP integrationTest-specific HTML files:

- `test-ui.html` - Basic test interface

**✅ Professional CSS**- `test-interactive-suite.html` - Interactive test suite

- Clean, maintainable styles- `test-figma-plugin.html` - Built plugin copy for testing

- Figma design system colors- `test-figma-integration.html` - Figma integration testing

- Responsive grid layouts- `test-ui-functionality.html` - UI functionality validation

- Consistent component styling- `context-preview-test.html` - Context preview testing



### 🔧 Development### `/ui/demos/`

Demonstration and simulation files:

**Build Process:**- `enhanced-data-layer-demo.html` - Enhanced data layer demonstration

```bash- `figma-plugin-simulator.html` - Figma plugin simulation environment

# Build the plugin

bash scripts/build.sh## 🔄 Sync Strategy



# Output:**To maintain consistency:**

# - ui/plugin/ - Modular source files

# - dist/ui/plugin/ - Built files for distribution1. **Edit the master file**: Always edit `/ui/unified/index.html` first

# - dist/ui/standalone.html - Comprehensive standalone version2. **Copy to active files**: 

```   ```bash

   cp ui/unified/index.html ui/standalone/index.html

**Testing:**   cp ui/unified/index.html ui/plugin/index.html

1. Import `manifest.json` into Figma   ```

2. Plugin will load `ui/plugin/index.html`3. **Rebuild plugin**: Run `npm run build` to update `dist/ui/index.html`

3. All JavaScript modules load automatically

## 🚫 What NOT to do

### 📊 Features

- ❌ Don't edit `ui/standalone/` or `ui/plugin/` directly

**Health Metrics Panel:**- ❌ Don't create new HTML files in project root

- Real-time design system compliance monitoring- ❌ Don't read from `/ui/legacy/` files (they're outdated)

- Component usage analysis- ❌ Don't edit built files in `dist/ui/`

- Token adoption tracking

- Personalized recommendations## ✅ What TO do



**AI Ticket Generator:**- ✅ Always edit `/ui/unified/index.html` as the master

- Multiple ticket templates (Component, Feature, Page, Bug Fix)- ✅ Keep all HTML files in `/ui/` subdirectories

- Multi-model AI support (GPT-4, Claude, Gemini)- ✅ Use the sync strategy above to maintain consistency

- MCP server integration with fallback- ✅ Test both web and plugin deployments after changes
- Design system context integration

### 🎨 UI Components

**Main Container:**
- 50/50 split layout (Health Metrics | Ticket Generation)
- Responsive design
- Dark theme support

**Health Metrics:**
- Metric cards with score visualization
- Detailed compliance breakdown
- Real-time recommendations
- Component analysis

**Ticket Generation:**
- Configuration panel
- Template selection
- AI model selection
- Custom instructions
- Output with copy-to-clipboard

### 🔗 Integration

**Plugin Communication:**
- Clean message handling system
- Event-driven architecture
- Proper error handling
- Status feedback

**MCP Integration:**
- Primary: MCP server for enhanced analysis
- Fallback: Direct AI API calls
- Graceful degradation for offline use

---

*This modular structure replaces the previous monolithic 5000+ line HTML file with clean, maintainable, and professional code organization.*