# 🎫 Figma AI Ticket Generator

A Figma plugin that automatically generates Jira ticket drafts from selected design frames using AI. Perfect for on-premise Jira setups where you want automation benefits without API complications.

## ✨ Features

- **Smart Frame Analysis**: Extracts frame names, dimensions, components, text content, and colors
- **🎨 Design System Integration**: Auto-detects design systems and analyzes compliance
- **AI-Powered Generation**: Uses OpenAI to create structured ticket drafts with design system context
- **Compliance Scoring**: Real-time analysis of color, typography, and component compliance
- **Smart Recommendations**: Actionable suggestions for design system violations
- **Multiple Templates**: Support for UI components, features, bug fixes, and pages
- **Copy-Paste Workflow**: No direct Jira integration needed - just copy and paste
- **Custom Prompts**: Add specific requirements and instructions
- **Multi-Frame Support**: Generate tickets for multiple selected frames

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd figma-ticket-generator
npm install
```

### 2. Build the Plugin

```bash
npm run build
```

### 3. Install in Figma

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from this folder
4. The plugin will appear in your plugins list

### 4. Set Up OpenAI API

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open the plugin in Figma
3. Enter your API key in the configuration section

## 📖 How to Use

### Basic Workflow

1. **Select Frames**: Choose one or more frames/components in your Figma file
2. **Configure Template**: Select the appropriate ticket type (Component, Feature, Bug, Page)
3. **Add Instructions**: Optionally add custom requirements or notes
4. **Generate**: Click "Generate Ticket from Selection"
5. **Copy & Paste**: Copy the generated ticket and paste it into your Jira

### 🎨 Design System Features

The plugin automatically detects design systems in your Figma files and provides:

- **Auto-Discovery**: Scans for design system pages, published styles, and component libraries
- **Compliance Analysis**: Real-time scoring for color, typography, and component compliance
- **Smart Recommendations**: Actionable suggestions for maintaining design consistency
- **Token Integration**: Identifies and references specific design tokens in generated tickets
- **Violation Detection**: Highlights deviations from established design patterns

**Design System Information Panel:**
- Shows detected design system name and confidence level
- Displays counts of colors, typography styles, and components
- Real-time compliance scores for selected frames
- Recommendations for improving design system adherence

**Enhanced Tickets Include:**
- Design system compliance scores
- Specific design token references
- Violation descriptions and suggested fixes
- Recommendations for maintaining consistency

### Template Types

- **UI Component**: For implementing reusable UI elements
- **Feature**: For new functionality implementation
- **Bug Fix**: For addressing UI/UX issues
- **Page/Screen**: For complete page implementations
- **Custom**: For specialized requirements

### Example Output

```
**Title:** Implement Primary Button Component

**Description:**
Create a reusable primary button component based on the Figma design. The button should support multiple sizes and states including default, hover, pressed, and disabled.

**Acceptance Criteria:**
1. Button matches design specifications (24px height, 8px border-radius)
2. Implements all required states (default, hover, pressed, disabled)
3. Uses design system color tokens (#007AFF for primary)
4. Includes proper accessibility attributes and focus states
5. Supports different sizes (small, medium, large)

**Technical Notes:**
- Component should be built using the existing design system
- Ensure proper TypeScript types are defined
- Include unit tests for all interactive states
```

## 🛠️ Development

### Project Structure

```
figma-ticket-generator/
├── manifest.json       # Figma plugin manifest
├── code.ts            # Main plugin logic
├── ui.html            # Plugin UI interface
├── types.ts           # TypeScript type definitions
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # Documentation
```

### Development Workflow

1. **Watch Mode**: Run `npm run watch` to automatically rebuild on changes
2. **Test Changes**: Reload the plugin in Figma to test updates
3. **Debug**: Use `console.log()` statements - they appear in Figma's developer console

### Key Files

- **`code.ts`**: Runs in Figma's sandbox, handles frame selection and data extraction
- **`ui.html`**: Plugin interface with AI configuration and ticket generation
- **`types.ts`**: TypeScript definitions for Figma API and plugin messages

## 🔧 Configuration Options

### AI Settings

- **API Key**: Your OpenAI API key (stored locally)
- **Model**: Choose between GPT-4o Mini (recommended), GPT-4o, or GPT-3.5 Turbo
- **Template**: Pre-built prompts for different ticket types

### Custom Prompts

Add specific instructions like:
- "Include accessibility requirements"
- "Use Material Design guidelines"
- "Reference existing component library"
- "Include mobile responsive considerations"

## 🎯 Best Practices

### Frame Naming

Use descriptive frame names like:
- `Button / Primary / Default`
- `Navigation / Mobile / Collapsed`
- `Form / Contact / Validation States`

### Selection Tips

- Select the main frame/component, not individual elements
- Include all relevant states and variations
- Name frames consistently for better AI context

### Prompt Engineering

- Be specific about requirements
- Include relevant design system references
- Mention accessibility needs
- Specify technical constraints

## 🔐 Security & Privacy

- **API Keys**: Stored locally in browser localStorage, never transmitted to third parties
- **Design Data**: Only selected frame metadata is sent to OpenAI (names, dimensions, basic properties)
- **No File Upload**: Your actual design files are never uploaded or shared

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Figma
5. Submit a pull request

## 📄 License

MIT License - feel free to use and modify for your team's needs.

## 🆘 Troubleshooting

### Common Issues

**Plugin won't load**
- Ensure you've run `npm run build`
- Check that `dist/code.js` exists
- Verify manifest.json is valid

**API calls failing**
- Verify your OpenAI API key is correct
- Check your API usage limits
- Ensure you have internet connectivity

**Empty ticket generation**
- Make sure frames are properly selected
- Check that frame names are descriptive
- Try different template types

**TypeScript errors**
- Run `npm run build` to see detailed error messages
- Ensure all dependencies are installed
- Check tsconfig.json configuration

### Support

For issues and feature requests, please create an issue in the repository.

---

Built with ❤️ for design-development collaboration