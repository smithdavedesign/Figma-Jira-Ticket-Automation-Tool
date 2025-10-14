# 🎨 Figma AI Ticket Generator

A sophisticated Figma plugin that automatically generates Jira tickets from design frames using AI, with advanced design system integration and compliance analysis.

## 🏗️ Architecture

```
figma-ticket-generator/
├── src/                    # Source code
│   ├── plugin/            # Figma plugin code (sandbox)
│   │   ├── main.ts       # Entry point
│   │   ├── handlers/     # Message handlers
│   │   └── utils/        # Plugin utilities
│   ├── core/             # Core business logic
│   │   ├── design-system/    # Design system detection & analysis
│   │   ├── compliance/       # Compliance scoring
│   │   ├── ai/              # AI ticket generation
│   │   └── types/           # TypeScript definitions
│   ├── ui/               # User interface
│   │   ├── components/   # UI components
│   │   ├── styles/       # CSS styles
│   │   ├── js/           # JavaScript logic
│   │   └── index.html    # Main HTML
│   └── shared/           # Shared utilities
├── docs/                 # Documentation
├── dist/                 # Built files
├── config/               # Configuration files
└── build.sh              # Build script
```

## 🚀 Features

### Phase 1: Design System Integration ✅
- **Automatic Design System Detection**: Scans Figma files to identify design systems
- **Token Extraction**: Extracts colors, typography, spacing, and effect tokens
- **Component Library Analysis**: Identifies and catalogs design system components

### Phase 2: Health Metrics Dashboard 🚧
- **Overall Compliance Scoring**: Real-time design system adherence analysis
- **Component Usage Statistics**: Track which components are used and how frequently
- **Token Adoption Rates**: Monitor color, typography, and spacing token usage
- **Consistency Recommendations**: AI-powered suggestions for design improvements

### Phase 3: AI Ticket Generation
- **Smart Frame Analysis**: Extracts comprehensive data from selected Figma frames
- **Multiple AI Models**: Support for GPT-4o, GPT-4o-mini, and GPT-3.5-turbo
- **Template System**: Pre-built templates for components, features, bugs, and pages
- **Design System Context**: Includes compliance data in generated tickets

## 🛠️ Development

### Prerequisites
- Node.js 16+
- TypeScript 5+
- Figma Desktop App

### Setup
```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Development with watch mode
npm run dev
```

### Project Structure

#### Core Modules
- **`src/core/types/`**: Centralized TypeScript definitions
- **`src/core/design-system/`**: Design system detection and analysis
- **`src/core/compliance/`**: Compliance scoring algorithms
- **`src/core/ai/`**: AI integration and prompt templates

#### Plugin Architecture
- **`src/plugin/main.ts`**: Main entry point, coordinates all functionality
- **`src/plugin/handlers/`**: Message handling between plugin and UI
- **`src/plugin/utils/`**: Figma API adapters and utilities

#### UI Architecture
- **`src/ui/index.html`**: Main HTML structure
- **`src/ui/styles/main.css`**: Comprehensive styling system
- **`src/ui/js/`**: Modular JavaScript components
- **`src/ui/components/`**: Reusable UI components

### Build System
The project uses a custom build script (`build.sh`) that:
1. Compiles TypeScript using the configured tsconfig.json
2. Copies UI assets to the dist folder
3. Updates manifest paths for production

## 📊 Health Metrics Implementation

### Overall Compliance Scoring
- **Color Compliance**: Checks if fills match design system color tokens
- **Typography Compliance**: Validates text styles against design system standards
- **Component Compliance**: Identifies design system vs. custom components
- **Spacing Compliance**: Validates spacing follows standard increments

### Scoring Algorithm
```typescript
overallScore = (colorScore * 0.3) + 
               (typographyScore * 0.25) + 
               (componentScore * 0.3) + 
               (spacingScore * 0.15)
```

### Real-time Analysis
- Automatic compliance calculation when design system is detected
- Smart throttling to prevent performance issues
- Detailed breakdown with actionable recommendations

## 🔧 Configuration

### TypeScript Configuration
- Modular compilation with path mapping
- Separate compilation for plugin and UI code
- Type-safe imports with barrel exports

### Figma Plugin Manifest
- Dynamic page access for design system scanning
- Network access for OpenAI API integration
- Current user permissions for personalized features

## 📖 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)**: Get up and running quickly
- **[Design System Integration](docs/DESIGN_SYSTEM_INTEGRATION.md)**: Technical details
- **[Health Metrics Roadmap](docs/HEALTH_METRICS_ROADMAP.md)**: Feature planning
- **[Phase 1 Complete](docs/PHASE_1_COMPLETE.md)**: Implementation summary
- **[Prompt Templates](docs/PROMPT_TEMPLATES.md)**: AI prompt engineering

## 🤝 Contributing

1. Follow the established architecture patterns
2. Add TypeScript definitions for new features
3. Update documentation for significant changes
4. Test with real Figma files before submitting

## 📜 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the design and development community**