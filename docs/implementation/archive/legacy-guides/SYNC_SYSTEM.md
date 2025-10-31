# 🔄 Figma Plugin Sync System

## Overview

This project now has a robust sync system to keep the `dist/` directory and source files synchronized for Figma plugin development.

## File Structure

```
figma-ticket-generator/
├── manifest.json           # Points to dist/ files (main: dist/code.js, ui: dist/ui/index.html)
├── code.js                 # Source plugin logic
├── ui/index.html          # Source UI file
├── dist/                  # Distribution directory (what Figma actually uses)
│   ├── code.js           # Synced plugin logic
│   ├── manifest.json     # Synced manifest
│   └── ui/
│       ├── index.html    # Synced UI file
│       ├── components/   # Additional UI components
│       └── plugin/       # Modular UI components
└── scripts/
    ├── sync-dist.sh      # Manual sync script
    ├── sync-watch.sh     # Auto-sync watcher
    └── build.sh          # Full build process
```

## Sync Commands

### Manual Sync
```bash
npm run sync
# or
./scripts/sync-dist.sh
```

### Watch Mode (Auto-sync)
```bash
npm run sync:watch
# or 
./scripts/sync-watch.sh
```

### Full Build
```bash
npm run build
# or
./scripts/build.sh
```

## Workflow

### Development Workflow
1. **Edit source files**: `code.js`, `ui/index.html`, `manifest.json`
2. **Sync to dist**: `npm run sync` (or use watch mode)
3. **Test in Figma**: Import `manifest.json` (points to `dist/` files)

### Watch Mode Workflow (Recommended)
1. **Start watcher**: `npm run sync:watch`
2. **Edit any source file** - auto-syncs to `dist/`
3. **Refresh plugin in Figma** - sees latest changes immediately

## Key Benefits

✅ **Consistent State**: `dist/` always matches source files
✅ **Figma Compatibility**: `manifest.json` correctly points to `dist/` files  
✅ **Auto-sync**: Watch mode eliminates manual sync steps
✅ **Build Integration**: Full build process includes sync
✅ **Development Speed**: Fast iteration with auto-sync

## Troubleshooting

### Plugin Not Updating in Figma
1. Check if `npm run sync` was run after changes
2. Verify `manifest.json` points to `dist/ui/index.html` (not `ui/index.html`)
3. In Figma: Remove and re-import the plugin

### Sync Issues
1. Run `npm run sync` manually to force sync
2. Check file permissions on scripts: `chmod +x scripts/*.sh`
3. Verify source files exist: `code.js`, `ui/index.html`, `manifest.json`

### Build Failures
1. Use `npm run sync` as fallback if TypeScript compilation fails
2. Check that `code.js` exists (compiled or manual version)
3. Verify all source files are present

## Scripts Summary

### **🔄 Basic Sync Scripts**
| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run sync` | Manual sync | After making changes |
| `npm run sync:watch` | Auto-sync watcher | During development |
| `npm run build` | Full build + sync | Before distribution |
| `npm run bundle` | Production bundle | For release |

### **🚀 Production Deployment Scripts** (NEW)
| Command | Purpose | Duration | When to Use |
|---------|---------|----------|-------------|
| `npm run deploy:prod` | Full production deployment | 3-5 min | First-time setup, releases |
| `npm run deploy:dev` | Development deployment | 2-3 min | Daily development |
| `npm run deploy:quick` | Quick development deploy | 1-2 min | Rapid iteration |
| `npm run validate:prod` | Comprehensive validation | 30s | Check system health |
| `npm run package` | Package for release | 3-5 min | Distribution preparation |
| `npm run release` | Complete release workflow | 5-7 min | Final release preparation |

📚 **For complete production scripts reference, see:** `docs/deployment/PRODUCTION_SCRIPTS_REFERENCE.md`

---

**Note**: Always use the sync system to keep `dist/` and source files synchronized. Direct edits to `dist/` files will be overwritten.