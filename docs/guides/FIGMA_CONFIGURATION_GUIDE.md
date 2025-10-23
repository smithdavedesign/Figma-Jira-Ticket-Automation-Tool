# 🎯 Figma Plugin Configuration Guide

## 🔧 **Pre-Testing Setup (Already Done!)**

✅ **Plugin Built:** Your plugin is already compiled and ready  
✅ **Servers Running:** MCP server (3000), HTTP Logger (3001), UI Server (8080)  
✅ **Monitoring Ready:** Real-time request logging is active

## 📱 **Step 1: Import Plugin into Figma**

1. **Open Figma Desktop** (not browser version - plugins need the desktop app)

2. **Go to Plugins Menu:**
   - Click `Plugins` in the top menu
   - Select `Development` > `Import plugin from manifest...`

3. **Import Your Plugin:**
   - Navigate to: `/Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator/`
   - Select `manifest.json`
   - Click `Open`

4. **Plugin Should Appear:**
   - Your plugin "Design Intelligence Platform (Production)" will appear in the plugins list
   - You can now run it from `Plugins` > `Development` > `Design Intelligence Platform (Production)`

## 🎮 **Step 2: Testing Options**

### Option A: Direct Testing (Standard)
- **Server URL:** `http://localhost:3000`
- **Monitoring:** Basic server logs
- **Best For:** Quick functionality testing

### Option B: Monitored Testing (Recommended)
- **Server URL:** `http://localhost:3001` (HTTP Request Logger)
- **Monitoring:** Full request/response logging with timing
- **Best For:** Debugging and detailed analysis

## 🔄 **Step 3: Configure for Monitoring (Optional)**

If you want to see detailed request logs, you need to temporarily update the plugin UI:

```javascript
// In the plugin UI, change:
const MCP_SERVER_URL = 'http://localhost:3000';
// To:
const MCP_SERVER_URL = 'http://localhost:3001';
```

## 🧪 **Step 4: Test the Plugin**

1. **Create a Test Design:**
   - Open a Figma file
   - Create a simple component (button, card, etc.)
   - Select the component

2. **Run the Plugin:**
   - Go to `Plugins` > `Development` > `Design Intelligence Platform (Production)`
   - The plugin UI will open in a panel

3. **Generate a Ticket:**
   - Enter your tech stack (e.g., "React with TypeScript")
   - Select document type (Jira, Confluence, etc.)
   - Click "Generate Enhanced Ticket"

4. **Watch the Monitoring:**
   - Check the HTTP Request Logger terminal for detailed logs
   - View the monitoring dashboard at: http://localhost:8080/figma-testing-dashboard.html

## 📊 **Step 5: Monitor Results**

### Terminal Monitoring
The HTTP Request Logger shows:
```
[10:43:53 AM] 📥 POST /
[10:43:53 AM]    📋 Request Body: { "method": "generate_enhanced_ticket", ... }
[10:43:53 AM] 📤 Response: 200 (11ms)
[10:43:53 AM]    📋 Response Body: { "content": [...], "metadata": {...} }
[10:43:53 AM] ✅ Request completed in 11ms
```

### Dashboard Monitoring
- **URL:** http://localhost:8080/figma-testing-dashboard.html
- Real-time server status
- Request counting
- Quick test buttons

## 🚨 **Troubleshooting**

### Plugin Won't Load
- ✅ Check that Figma Desktop is running (not browser)
- ✅ Verify manifest.json path is correct
- ✅ Check that files exist: `manifest.json`, `code.js`, `dist/ui/index.html`

### No Server Response
- ✅ Verify MCP server is running: `curl http://localhost:3000`
- ✅ Check network permissions in manifest.json
- ✅ Look for CORS errors in browser console

### Plugin UI Issues
- ✅ Check browser console in plugin panel (F12)
- ✅ Verify UI file exists: `dist/ui/index.html`
- ✅ Check that build completed successfully

## 🎯 **Expected Test Flow**

1. **Plugin Loads** → UI appears in Figma panel
2. **User Input** → Enter tech stack and select document type  
3. **Generate Click** → Request sent to server
4. **Server Processing** → AI generates enhanced ticket
5. **Response Display** → Formatted ticket appears in UI
6. **Copy/Export** → User can copy result to clipboard

## 📈 **Success Indicators**

### In Plugin UI:
- ✅ Plugin panel opens without errors
- ✅ Form fields are interactive
- ✅ Generate button triggers request
- ✅ Results display properly formatted

### In Monitoring:
- ✅ HTTP requests appear in logger
- ✅ Response times under 2000ms
- ✅ Status codes 200 (success)
- ✅ Valid JSON responses with content

### In Dashboard:
- ✅ Server status shows "Running"
- ✅ Request count increases
- ✅ No error messages in activity log

---

**🚀 Ready to test!** Import the plugin and start generating tickets while monitoring the real-time logs!