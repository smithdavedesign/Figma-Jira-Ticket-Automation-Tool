# 🎯 Figma Plugin Testing Guide

## 🚀 **How to Test the Enhanced Figma Plugin**

### **Step 1: Load the Plugin in Figma**

1. **Open Figma Desktop App** (plugin requires desktop version)
2. **Go to Plugins → Development → Import plugin from manifest**
3. **Navigate to:** `/Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator/`
4. **Select:** `manifest.json`
5. **Click "Import"**

### **Step 2: Start Required Servers**

Before testing, ensure these servers are running:

```bash
# Terminal 1: Web Server (for UI assets)
cd /Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator
python3 -m http.server 8085

# Terminal 2: MCP Server (for enhanced generation)
cd /Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator/mcp-server
npm run dev
```

### **Step 3: Run the Plugin**

1. **In Figma:** Right-click → Plugins → Development → AI Ticket Generator (Enhanced)
2. **The plugin UI should open** with enhanced context preview functionality

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Basic Context Collection**

**What to Test:**
- Select any frame or component in Figma
- Click "🚀 Generate Enhanced Document"
- Verify context preview appears before generation

**Expected Results:**
- ✅ Context preview displays selected frame data
- ✅ Tech stack analysis shows confidence score
- ✅ Visual context shows screenshot/mockup
- ✅ Quality metrics are calculated

### **Scenario 2: Enhanced Generation Flow**

**What to Test:**
- Fill in tech stack description (e.g., "React 18 with TypeScript")
- Select multiple components
- Generate content and review context

**Expected Results:**
- ✅ Multiple frames processed successfully
- ✅ Context preview shows comprehensive data
- ✅ Generation includes Figma-specific context
- ✅ Results indicate context quality

### **Scenario 3: Design System Integration**

**What to Test:**
- Select design system components (buttons, cards, etc.)
- Check the "📊 Design Health" tab
- Generate tickets with design context

**Expected Results:**
- ✅ Design health metrics appear
- ✅ Component analysis shows compliance
- ✅ Recommendations for improvement
- ✅ Context includes design system data

### **Scenario 4: Error Handling**

**What to Test:**
- Select no elements and try to generate
- Select overly complex frames
- Test with network offline

**Expected Results:**
- ✅ Clear error messages displayed
- ✅ Graceful fallbacks for complex selections
- ✅ Offline mode with fallback generation

---

## 🔧 **Troubleshooting**

### **Plugin Won't Load**
- Check that `manifest.json` and `code.js` are in the same directory
- Verify Figma Desktop is being used (not browser version)
- Try restarting Figma and re-importing

### **UI Not Loading**
- Ensure web server is running on port 8085
- Check browser console in Figma plugin window (right-click → Inspect)
- Verify `ui/plugin/index.html` exists

### **Context Preview Not Working**
- Check that `ui/components/context-preview.js` is accessible
- Verify network access to localhost:8085 in manifest
- Look for JavaScript errors in console

### **MCP Server Issues**
- Ensure MCP server is running on port 3000
- Check server logs for errors
- Test server directly: `curl http://localhost:3000`

---

## 📊 **Expected Features in Figma**

### **Enhanced UI Elements:**
- 🎨 **Enhanced context preview** showing what data will be sent to AI
- 📊 **Quality metrics** with confidence scoring and optimization suggestions  
- 🖼️ **Visual context** with screenshot capture from Figma selections
- 🔗 **MCP integration** with server status and enhanced analysis
- 📝 **Interactive editing** of context before submission

### **Message Flow:**
```
Figma Selection → Plugin Code → Frame Data Extraction → 
Context Preview → User Review → Enhanced Generation → Results
```

### **Data Flow:**
```
1. User selects elements in Figma
2. Plugin extracts frame data, text, components, colors
3. UI shows context preview with quality metrics
4. User can edit/optimize context
5. Enhanced generation with visual + technical context
6. Results show context quality and suggestions
```

---

## 🎯 **Testing Checklist**

- [ ] Plugin loads successfully in Figma
- [ ] Enhanced UI displays with context preview
- [ ] Frame data extraction works for selections
- [ ] Context preview shows collected data
- [ ] Quality metrics are calculated correctly
- [ ] Tech stack analysis provides confidence scores
- [ ] Screenshot capture works (or shows mock)
- [ ] MCP server integration functions
- [ ] Generation flow works end-to-end
- [ ] Error handling is graceful
- [ ] Design health tab is functional
- [ ] Multiple frame selection works
- [ ] Context editing capabilities work

---

## 🚀 **Success Indicators**

✅ **Context Transparency**: Users can see exactly what data is being sent  
✅ **Quality Feedback**: Real-time analysis and optimization suggestions  
✅ **Visual Intelligence**: Screenshots provide design grounding for AI  
✅ **Figma Integration**: Deep connection with actual design data  
✅ **Enhanced Results**: Better AI generation with comprehensive context  

---

## 📞 **Support**

If you encounter issues:
1. Check console output in both terminals
2. Look for JavaScript errors in plugin window
3. Verify all required files are present
4. Test individual components via web browser first

**Ready to test the enhanced Figma integration! 🎨✨**