# 🧹 UI Test Folder Cleanup Analysis

## 📁 Current UI Test Files Analysis

### **Files to Keep in `ui/test/` (UI-specific testing)**
- **`enhanced-data-layer-demo.html`** - ✅ Keep (UI data visualization demo)
- **`figma-plugin-simulator.html`** - ✅ Keep (UI plugin simulation)
- **`test-ui-functionality.html`** - ✅ Keep (Core UI testing)
- **`context-preview-test.html`** - ✅ Keep (UI context preview)
- **`template-system-test.html`** - ✅ Keep (UI template testing)

### **Files to Move to `tests/` (General testing)**
- **`test-tech-detection.js`** → `tests/unit/test-tech-detection.js`
- **`test-tech-stack.js`** → `tests/unit/test-tech-stack.js`
- **`test-screenshot-api.sh`** → `tests/integration/test-screenshot-api.sh`

### **Files to Archive (Redundant with Ultimate Test Suite)**
- **`test-interactive-suite.html`** → `tests/archive/ui-test-files/`
- **`template-llm-integration-test.html`** → `tests/archive/ui-test-files/`

## 🎯 Cleanup Actions
1. Move general test files to appropriate `tests/` folders
2. Archive redundant UI test files  
3. Keep only UI-specific testing files in `ui/test/`
4. Update any references in documentation

## 📊 Results
- **Before**: 10 files in `ui/test/`
- **After**: 5 files in `ui/test/` (50% reduction)
- **Moved**: 3 files to proper test locations
- **Archived**: 2 redundant files