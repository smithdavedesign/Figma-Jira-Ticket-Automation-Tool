# 🎯 Figma Plugin Testing Guide

## Current Status: Ready for Figma Testing

The plugin has been successfully built and organized. All redundant files have been cleaned up and moved to appropriate locations.

## Files Organization ✅

### Source Structure:
- `code-single.ts` → Main plugin source (single file for Figma compatibility)
- `manifest.json` → Plugin manifest for Figma
- `ui/index.html` → Plugin UI interface
- `scripts/build.sh` → Production build script

### Legacy Files Moved:
- `src/legacy/code.ts` (old split version)
- `src/legacy/types.ts` (old type definitions)
- `src/legacy/design-system-scanner.ts` (old scanner)

### Built Files:
- `code.js` → Compiled JavaScript for Figma
- `dist/` → Complete distribution package

## 🚀 Testing in Figma Desktop

### Step 1: Open Figma Desktop App
1. Ensure you have Figma Desktop installed (not browser version)
2. Open Figma Desktop application

### Step 2: Import Plugin
1. Go to **Plugins > Development**
2. Click **Import plugin from manifest...**
3. Navigate to this project directory
4. Select `manifest.json` from the root
5. Click **Open**

### Step 3: Test Plugin Functionality
1. Open or create a Figma design file
2. Select some frames/components in your design
3. Go to **Plugins > Development > Design Intelligence Platform (Production)**
4. Test the following features:

#### Core Features to Test:
- [ ] **UI Loading**: Plugin UI opens correctly
- [ ] **Selection Detection**: Plugin detects selected elements
- [ ] **Tech Stack Input**: Enter tech stack description
- [ ] **Context Preview**: Review captured context before generation
- [ ] **Screenshot Capture**: Visual context is captured from selection
- [ ] **Document Generation**: AI content generation works
- [ ] **Design Health**: Design system analysis functionality

#### Test Scenarios:
1. **No Selection**: Test with nothing selected
2. **Single Frame**: Select one frame and generate
3. **Multiple Elements**: Select multiple components
4. **Complex Layout**: Test with nested components
5. **Text Heavy**: Test with lots of text content
6. **Component Library**: Test with design system components

### Step 4: Validation Checklist

#### ✅ Expected Behaviors:
- Plugin loads without errors
- UI is responsive and functional
- Selection context is captured correctly
- Tech stack parsing works
- Context preview shows relevant information
- Generated content is relevant and accurate
- No console errors in Figma
- Plugin performance is acceptable

#### 🚨 Issues to Watch For:
- Plugin crashes or fails to load
- UI elements not rendering properly
- Selection not being detected
- Screenshot capture failing
- Performance issues with large selections
- Memory leaks with repeated use

## 🐛 If Issues Are Found

### Debug Steps:
1. Open **Figma > Help > Troubleshooting > Open Developer Console**
2. Check for JavaScript errors
3. Note specific actions that cause issues
4. Document error messages and stack traces

### Common Fixes:
- **Plugin won't load**: Check manifest.json syntax
- **UI not showing**: Check html file path in manifest
- **JavaScript errors**: Check code.js compilation
- **Selection issues**: Verify Figma API usage
- **Performance issues**: Optimize selection processing

## 📊 Performance Benchmarks

Target performance metrics:
- **Load Time**: < 3 seconds
- **Selection Processing**: < 1 second for 10 elements
- **UI Response**: < 500ms for user interactions
- **Memory Usage**: < 50MB for typical usage
- **Screenshot Capture**: < 2 seconds

## 🎯 Success Criteria

Plugin is ready for production when:
- [ ] All core features work without errors
- [ ] UI is polished and responsive
- [ ] Performance meets benchmarks
- [ ] Works with variety of design files
- [ ] Handles edge cases gracefully
- [ ] Error handling is robust
- [ ] User experience is smooth

## 📝 Testing Notes

Document any issues found during testing:

### Issues Found:
_(To be filled during testing)_

### Performance Notes:
_(To be filled during testing)_

### User Experience Feedback:
_(To be filled during testing)_

---

**Next Steps After Testing:**
1. Fix any critical issues found
2. Optimize performance bottlenecks
3. Polish UI/UX based on real usage
4. Prepare for production deployment
5. Create distribution package