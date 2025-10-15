# 🚀 Quick Start Guide

Get up and running with the Figma AI Ticket Generator in 5 minutes!

## 📋 Prerequisites

- Figma Desktop App (required for plugin development)
- Node.js 16+ and npm
- OpenAI API account and key

## ⚡ 5-Minute Setup

### 1. Run Setup Script
```bash
./setup.sh
```
*This installs dependencies and builds the plugin*

### 2. Import to Figma
1. Open **Figma Desktop App**
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select `manifest.json` from this folder
4. ✅ Plugin is now available in your Plugins menu

### 3. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### 4. First Use
1. Open any Figma file with design frames
2. Select a frame or component
3. Run **"AI Ticket Generator"** from Plugins menu
4. Enter your OpenAI API key
5. Click **"Generate Ticket from Selection"**
6. Copy the generated ticket and paste into Jira!

## 🎯 Pro Tips for Better Results

### Frame Naming Best Practices
- ✅ `Button / Primary / Default`
- ✅ `Navigation / Mobile / Expanded`
- ❌ `Frame 1` or `Rectangle 2`

### Selection Tips
- Select the main frame/component, not individual layers
- Include all relevant states (hover, active, disabled)
- Name frames descriptively

### Template Usage
- **Component**: For reusable UI elements
- **Feature**: For new functionality
- **Bug**: For fixing issues
- **Page**: For complete screens

## 🔧 Development Mode

### Watch Mode (Auto-rebuild)
```bash
npm run watch
```

### Manual Build
```bash
npm run build
```

### Reload Plugin
After code changes, reload the plugin in Figma:
1. Right-click plugin in menu
2. Select "Reload"

## 📖 Example Workflow

1. **Design Review**: Open Figma file with new designs
2. **Select Frames**: Choose the frame(s) you want tickets for
3. **Configure**: 
   - Set template type (Component/Feature/Bug/Page)
   - Add custom requirements if needed
4. **Generate**: Click generate button
5. **Review**: Check the generated ticket draft
6. **Copy & Paste**: Copy to clipboard and paste in Jira
7. **Refine**: Edit ticket as needed in Jira

## 🎨 Sample Generated Ticket

**Input**: Frame named "Button / Primary / Hover" (24x8px, blue background)

**Output**:
```
**Title:** Implement Primary Button Hover State

**Description:**
Create hover state for the primary button component matching the Figma design specifications.

**Acceptance Criteria:**
1. Button background changes to hover color on mouse over
2. Transition animation duration is 200ms
3. Maintains accessibility focus indicators
4. Works across all supported browsers

**Technical Notes:**
- Use CSS transitions for smooth hover effect
- Ensure proper color contrast ratios
- Include hover state in component documentation
```

## 🆘 Common Issues

**"No frame selected" error**
- Make sure you've selected a frame, not just clicked in empty space

**API key errors**
- Verify your OpenAI API key is correct
- Check your API usage limits

**Plugin won't load**
- Run `npm run build` first
- Make sure you're using Figma Desktop App (not browser)

**Empty results**
- Try more descriptive frame names
- Select larger frames with more content
- Add custom instructions for context

## 📞 Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Browse [PROMPT_TEMPLATES.md](PROMPT_TEMPLATES.md) for custom prompt ideas
- Open an issue in the repository for bugs or feature requests

---

Happy ticket generating! 🎫✨