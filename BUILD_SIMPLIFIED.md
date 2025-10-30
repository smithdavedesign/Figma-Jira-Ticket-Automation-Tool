# 🏗️ Simplified Build Structure

## Overview
The project has been simplified to focus on **Figma Desktop** usage only, eliminating redundant build artifacts and multiple index.html files.

## Structure

### Essential Files (Figma Desktop)
```
📁 figma-ticket-generator/
├── 📄 manifest.json           # Main manifest (points to simplified paths)
├── 📄 code.js                  # Compiled plugin logic
├── 📁 ui/
│   └── 📄 index.html          # Single UI file with team parameter auto-extraction
└── 📁 scripts/
    └── 📄 build-simple.sh     # Simple build script
```

### Legacy Files (For Complex Builds)
```
📄 manifest.json               # Points to dist/ files
📁 dist/                       # Build artifacts directory
📁 production-bundle/          # Production packaging
📄 scripts/build.sh           # Complex build script
📄 scripts/bundle-production.sh
```

## Usage

### Simple Build (Recommended)
```bash
# Build for Figma Desktop
npm run build                  # Uses build-simple.sh
./scripts/build-simple.sh      # Direct usage

# Import into Figma
# Use manifest.json in Figma Desktop (now points to simplified paths)
```

### Legacy Build (If needed)
```bash
npm run build:legacy          # Uses original build.sh
./scripts/build.sh            # Complex build with dist/
```

## Cleanup Redundant Files

If you want to remove the redundant directories and simplify completely:

```bash
./scripts/cleanup-redundant.sh
```

This will remove:
- `dist/` directory
- `production-bundle/` directory
- Complex build scripts

## Benefits of Simplified Structure

1. **Single Source of Truth**: One `ui/index.html` file
2. **Faster Builds**: No complex file copying
3. **Easier Development**: Direct file editing
4. **Less Confusion**: Clear file purpose
5. **CI Compatibility**: Works with existing CI tests

## Team Parameter Auto-Extraction

The `ui/index.html` file now includes automatic team parameter extraction:
- Extracts `t=XXXXX` from current Figma URL
- Auto-populates team parameter input field
- Preserves team context in generated URLs

## Testing

Both build approaches work with the existing test suite:
```bash
npm run test:browser:smoke    # CI tests pass with either build
```

---

**Recommendation**: Use the simplified build (`build-simple.sh` + `manifest.json`) - the main manifest now points to simplified paths.