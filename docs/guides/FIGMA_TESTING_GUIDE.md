# 🎨 Figma Plugin Testing Guide - Context-Aware Ticket Generation

## 🚀 **Quick Start (2 minutes)**

### Step 1: Import Plugin into Figma
1. **Open Figma Desktop** (or web app)
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to: `/Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator/`
4. Select **`manifest.json`** 
5. Click **"Save"**

### Step 2: Test Basic Functionality
1. **Open any Figma file** with components/frames
2. **Run the plugin**: Plugins → Development → "Figma AI Ticket Generator"
3. **Verify UI loads** with all features visible

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Context-Aware Generation** ⭐
**Goal**: Verify plugin generates specific tickets based on selected frames

**Steps**:
1. **Select 1-2 specific frames** (e.g., "LoginModal", "NavigationBar", "ProductCard")
2. **Enter tech stack**: "React TypeScript" 
3. **Click Parse Tech** → Verify confidence indicator shows
4. **Click Generate** → Wait for "Requesting Figma context..." message
5. **Check output** for:
   - ✅ Green banner: "Figma Context Used: X selected items"
   - ✅ Specific component names in ticket content
   - ✅ Component complexity (Simple/Medium/Complex)
   - ✅ Effort estimates (2-4 hours, 4-6 hours, etc.)

**Expected Result**: 
```
✅ Figma Context Used: 2 selected item(s)
• LoginModal (Medium complexity, ~4-6 hours)
• NavigationBar (Simple complexity, ~2-4 hours)

Ticket content mentions specific selected components
```

### **Scenario 2: Popular Tech Stacks** 🎯
**Goal**: Test pre-configured combinations work with context

**Steps**:
1. **Select diverse components** (buttons, forms, cards)
2. **Click any Popular Combination** (e.g., "React + TypeScript", "Vue.js + Nuxt")
3. **Generate ticket**
4. **Verify context integration** works with auto-filled tech stack

**Expected Result**: Higher confidence scores + context-specific tickets

### **Scenario 3: No Selection Fallback** 🔄
**Goal**: Ensure graceful handling when nothing is selected

**Steps**:
1. **Clear selection** (click empty canvas area)
2. **Enter tech stack**: "Angular + Material UI"
3. **Generate ticket**
4. **Verify fallback behavior**: Generic but functional ticket

**Expected Result**: No context banner, generic ticket content

### **Scenario 4: Complex Component Analysis** 🔍
**Goal**: Test complexity detection with nested components

**Steps**:
1. **Select complex frame** with multiple nested layers
2. **Use tech stack**: "Next.js + Tailwind CSS"
3. **Generate ticket**
4. **Check complexity analysis**: Should detect "Complex" for frames with many children

---

## 🎯 **What to Look For**

### **✅ Success Indicators**
- **Green context banner** appears when selection exists
- **Component names** appear in generated tickets
- **Realistic effort estimates** (2-4h, 4-6h, 6-8h)
- **Higher confidence scores** when context matches tech stack
- **Specific implementation details** related to selected components

### **🚨 Issues to Report**
- Context banner not appearing with valid selection
- Generic tickets despite having selection
- Incorrect complexity detection
- MCP server connection failures
- UI not loading or broken functionality

---

## 🔧 **Debugging Commands**

If you encounter issues, run these in terminal:

```bash
# Check MCP server status
ps aux | grep "node.*server" | grep -v grep

# Test MCP server directly
curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d '{"method":"test"}'

# Restart MCP server if needed
cd /Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator/mcp-server
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
node dist/server.js &

# Rebuild plugin if needed
cd /Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator
npm run build
```

---

## 📊 **Test Results Template**

### **Test 1: Context-Aware Generation**
- [ ] Plugin loads successfully
- [ ] Selection detection works
- [ ] Context banner appears
- [ ] Component names in tickets
- [ ] Realistic effort estimates

### **Test 2: Popular Tech Stacks**
- [ ] All 10 combinations load
- [ ] Parse Tech button works
- [ ] Confidence indicators show
- [ ] Context integration works

### **Test 3: Edge Cases**
- [ ] No selection fallback
- [ ] Empty tech stack handling
- [ ] MCP server offline fallback
- [ ] Complex nested components

---

## 🎨 **Recommended Test Files**

### **Best Test Scenarios**:
1. **UI Kit Files**: Components with clear naming (Button, Modal, Card)
2. **App Wireframes**: Realistic complexity mix
3. **Design Systems**: Multiple related components
4. **Landing Pages**: Mixed simple/complex components

### **Frame Naming for Best Results**:
- Use descriptive names: "LoginModal", "ProductCard", "NavigationHeader"
- Avoid generic names: "Frame 1", "Rectangle 2", "Group"
- Include component type: "Button", "Form", "Modal", "Card"

---

**🚀 Ready to test! The plugin should now generate context-aware tickets that reference your actual selected design components instead of generic descriptions.**

**Expected Experience**: Select "LoginModal" frame → Get ticket about implementing a specific login modal with estimated complexity and effort, not a generic "React component"!