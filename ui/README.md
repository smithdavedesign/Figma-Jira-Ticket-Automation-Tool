# UI Files Organization

This directory contains all HTML user interface files, properly organized to avoid confusion.

## 📁 Current Active Files

### `/ui/unified/index.html` 
**✅ MASTER FILE** - The single source of truth with ALL features:
- Both Design Health AND Ticket Generator tabs
- MCP Server and OpenAI API mode selection
- Complete token metrics and component analysis
- Used for both web testing and Figma plugin development

### `/ui/standalone/index.html`
**✅ WEB TESTING** - Copy of unified file for E2E testing:
- Served at `http://localhost:8101/ui/standalone/index.html`
- Used by Playwright tests for automated validation
- Should be kept in sync with unified file

### `/ui/index.html`
**✅ MAIN PLUGIN ENTRY POINT** - Enhanced UI with context preview:
- Self-contained HTML with all dependencies inlined
- Enhanced context preview functionality
- Used directly by Figma plugin (manifest points here)

### `/ui/plugin/index.html`
**⚠️ LEGACY BACKUP** - Old plugin structure (for reference only):
- Used by build script to create `dist/ui/index.html`
- Processed with CSS inlining for Figma compatibility
- Should be kept in sync with unified file

## 📁 Archived Files

### `/ui/legacy/`
Old HTML files moved here to avoid confusion:
- `enhanced-ui.html` - Old enhanced version
- `ui.html` - Original basic UI
- `ui-standalone.html` - Old standalone version
- `smart-ticket-generator*.html` - Frontend experiments
- `src-ui-index.html` - Old src/ui file

### `/ui/test/`
Test-specific HTML files:
- `test-ui.html` - Basic test interface
- `test-interactive-suite.html` - Interactive test suite
- `test-figma-plugin.html` - Built plugin copy for testing

## 🔄 Sync Strategy

**To maintain consistency:**

1. **Edit the master file**: Always edit `/ui/unified/index.html` first
2. **Copy to active files**: 
   ```bash
   cp ui/unified/index.html ui/standalone/index.html
   cp ui/unified/index.html ui/plugin/index.html
   ```
3. **Rebuild plugin**: Run `npm run build` to update `dist/ui/index.html`

## 🚫 What NOT to do

- ❌ Don't edit `ui/standalone/` or `ui/plugin/` directly
- ❌ Don't create new HTML files in project root
- ❌ Don't read from `/ui/legacy/` files (they're outdated)
- ❌ Don't edit built files in `dist/ui/`

## ✅ What TO do

- ✅ Always edit `/ui/unified/index.html` as the master
- ✅ Keep all HTML files in `/ui/` subdirectories
- ✅ Use the sync strategy above to maintain consistency
- ✅ Test both web and plugin deployments after changes