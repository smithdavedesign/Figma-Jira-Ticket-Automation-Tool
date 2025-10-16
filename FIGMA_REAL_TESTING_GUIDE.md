# 🎯 Figma Plugin Loading & Testing Guide

## 🚀 **Step-by-Step Instructions for Real Figma Testing**

### **Prerequisites ✅ COMPLETED**
- ✅ Web server running on port 8085
- ✅ MCP server running on port 3000  
- ✅ Enhanced plugin UI with context preview ready
- ✅ Plugin code enhanced with screenshot capture

---

## 📋 **Step 1: Load Plugin into Figma Desktop**

### **1.1 Open Figma Desktop Application**
- ⚠️ **IMPORTANT**: Must use Figma Desktop app (not browser version)
- Plugins with local file access only work in desktop app

### **1.2 Access Plugin Development Menu**
- In Figma, go to **Plugins** in the main menu
- Select **Development** 
- Click **Import plugin from manifest...**

### **1.3 Import the Plugin**
- Navigate to: `/Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator/`
- Select: `manifest.json`
- Click **"Open"** or **"Import"**

### **1.4 Verify Plugin Loaded**
- You should see "AI Ticket Generator (Enhanced)" in the Development plugins list
- If there are errors, check the Figma console (View → Developer → Console)

---

## 🧪 **Step 2: Basic Plugin Testing**

### **2.1 Create a Test Design**
Create a simple test design in Figma:
- **Frame**: "Login Form" (400x300px)
- **Text elements**: "Welcome", "Email", "Password"  
- **Button component**: "Sign In"
- **Input components**: Email and password fields

### **2.2 Run the Plugin**
- Select your test frame
- Right-click → **Plugins** → **Development** → **AI Ticket Generator (Enhanced)**
- The plugin UI should open in a panel

### **2.3 Verify UI Loading**
Expected behavior:
- ✅ Plugin UI loads with enhanced interface
- ✅ Context preview section is visible
- ✅ Tech stack input field is available
- ✅ "Generate Enhanced Document" button is present
- ✅ Design Health tab is accessible

---

## 🎨 **Step 3: Test Enhanced Context Preview**

### **3.1 Test Selection Detection**
- With frame selected, the plugin should detect the selection
- Context preview should show frame information
- You should see selection count and frame details

### **3.2 Test Tech Stack Analysis**
- Enter tech stack: "React 18 with TypeScript, Material-UI v5"
- Click "Parse Tech Stack" or wait for auto-analysis
- Verify confidence score appears (should be 80%+)
- Check that detected frameworks show: React, TypeScript

### **3.3 Test Context Preview Display**
- Fill in tech stack description
- Click "🚀 Generate Enhanced Document"
- **CRITICAL**: Context preview should appear before generation
- Verify sections show:
  - 🛠️ Tech Stack Analysis (with confidence score)
  - 📸 Visual Context (with selection info)
  - 🔗 MCP Server Data (connection status)

---

## 📸 **Step 4: Test Visual Context Features**

### **4.1 Test Screenshot Simulation**
- Select multiple elements (frame + components)
- Trigger generation
- In context preview, verify "Visual Context" section shows:
  - Mock screenshot representation
  - Selection dimensions
  - Element count

### **4.2 Test Multiple Selection**
- Select 2-3 different frames
- Verify plugin handles multiple selections
- Check that context preview shows all selected items

---

## 🎯 **Step 5: Test Complete Generation Flow**

### **5.1 Test MCP Server Integration**
- Ensure "MCP Server (Enhanced)" mode is selected
- Verify MCP status shows connected or available
- Test generation with MCP server

### **5.2 Test Fallback Mode**
- If MCP fails, verify fallback generation works
- Check that fallback notice is displayed
- Confirm content is still generated

### **5.3 Test Context Optimization**
- In context preview, test editing capabilities
- Try adding custom context
- Verify quality metrics update

---

## 🔧 **Troubleshooting Common Issues**

### **Plugin Won't Load**
```bash
# Check file paths
ls -la /Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator/manifest.json

# Verify web server
curl http://localhost:8085/ui/index.html
```

### **UI Doesn't Appear**
- Check Figma console for JavaScript errors
- Verify network access in manifest.json
- Ensure web server is serving on port 8085

### **Context Preview Not Working**
- Check browser console in plugin window (right-click → Inspect)
- Verify context-preview.js is loading
- Test message passing between plugin and UI

### **MCP Server Issues**
```bash
# Test MCP server directly
curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"method":"generate_ticket","params":{}}'
```

---

## ✅ **Expected Test Results**

### **Successful Plugin Loading:**
- Plugin appears in Development menu
- UI loads without JavaScript errors
- All UI sections are visible and functional

### **Enhanced Context Preview:**
- Selection detection works
- Tech stack analysis provides confidence scores
- Context preview shows before generation
- Quality metrics are calculated
- Visual context displays selection info

### **Generation Flow:**
- Complete flow from selection → preview → generation
- MCP server integration works or graceful fallback
- Results include context confidence information
- User feedback is clear and helpful

---

## 🎉 **Success Indicators**

### **🟢 Everything Working:**
- Plugin loads cleanly in Figma
- Context preview appears before generation
- Tech stack analysis shows confidence scores
- Visual context captures selection data
- Generation produces enhanced results
- Error handling is graceful

### **🟡 Partial Success:**
- Plugin loads but some features fail gracefully
- Fallback mode works when MCP unavailable
- Basic generation works without enhanced features

### **🔴 Issues to Address:**
- Plugin fails to load (manifest/file issues)
- UI doesn't appear (network/path issues)  
- JavaScript errors prevent functionality
- Context preview doesn't show

---

## 📞 **Need Help?**

### **Check These First:**
1. Figma Desktop app (not browser)
2. Web server running on port 8085
3. Plugin files in correct directory
4. No JavaScript console errors

### **Debug Commands:**
```bash
# Check servers
lsof -i :8085 && lsof -i :3000

# Test endpoints
curl http://localhost:8085/ui/index.html
curl http://localhost:3000

# Verify files
ls -la manifest.json code.js ui/index.html
```

---

## 🚀 **Ready to Test!**

**Everything is set up and ready for real Figma testing. The enhanced context preview will provide unprecedented transparency into what data is being sent to AI systems.**

**Let's see the magic happen in Figma! 🎨✨**