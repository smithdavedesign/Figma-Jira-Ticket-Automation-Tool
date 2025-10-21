# 🚀 Production-Ready Files Guide

## ✅ **FIGMA PLUGIN FILES** (Use These!)

### **For manifest.json:**
```json
{
  "main": "code.js",           // ✅ ROOT: Latest compiled plugin code
  "ui": "ui/index.html"        // ✅ UI: Production-ready with all features
}
```

### **Key Production Files:**
- **`manifest.json`** - Plugin configuration (ROOT)
- **`code.js`** - Main plugin code (ROOT) 
- **`ui/index.html`** - Full-featured UI (103KB+, includes ContextPreview)

## ❌ **AVOID These Build Artifacts:**

### **dist/ directory:**
- `dist/code.js` - May be outdated build output
- `dist/ui/index.html` - Often missing latest features (58KB, incomplete)
- `dist/manifest.json` - Build artifact, not source of truth

### **Other Build Outputs:**
- `production-bundle/` - Bundled for deployment, not plugin dev
- `server/dist/` - Server build artifacts
- Any `build/` or `output/` directories

## 🔍 **How to Identify Production Files:**

### **File Size Check:**
```bash
ls -la ui/index.html dist/ui/index.html
# Production: 103KB+ (full features)
# Build artifact: 58KB (incomplete)
```

### **Feature Check:**
```bash
grep -c "ContextPreview\|showContextPreview" ui/index.html
# Should return 6+ matches for production file
```

## 🛠 **Build Process:**

### **What npm run build does:**
1. Compiles TypeScript → `code.js` 
2. May create `dist/` outputs (DON'T use for plugin)
3. **ALWAYS use ROOT files for Figma plugin**

### **Before Testing:**
1. ✅ Check `manifest.json` points to ROOT files
2. ✅ Verify `ui/index.html` has latest features
3. ✅ Run `npm run build` to ensure `code.js` is current

## 🎯 **Quick Verification:**
```bash
# Check manifest points to correct files
cat manifest.json | grep -E '"main"|"ui"'

# Should show:
# "main": "code.js",
# "ui": "ui/index.html",
```

## 📝 **Remember:**
- **ROOT `code.js`** = Plugin main file
- **ROOT `ui/index.html`** = Production UI with all features  
- **`dist/` directory** = Build artifacts (may be outdated)
- **Always verify feature count before testing**