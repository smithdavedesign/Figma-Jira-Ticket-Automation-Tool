#!/bin/bash

echo "📦 Creating Production Bundle..."

# Clean previous builds
rm -rf dist
rm -rf production-bundle

# Run the standard build
echo "🔨 Running standard build..."
./scripts/build.sh

# Create production bundle directory
mkdir -p production-bundle

# Copy essential files for production
echo "📁 Copying production files..."
cp manifest.json production-bundle/
cp code.js production-bundle/
cp -r dist/ui production-bundle/ui
cp README.md production-bundle/
cp LICENSE production-bundle/

# Create a package.json for the bundle
echo "📝 Creating bundle metadata..."
cat > production-bundle/package.json << EOF
{
  "name": "figma-design-intelligence-platform",
  "version": "4.0.0",
  "description": "AI-powered Figma plugin for intelligent design-to-code generation",
  "main": "code.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/figma-design-intelligence-platform"
  },
  "keywords": [
    "figma",
    "plugin",
    "ai",
    "design-to-code",
    "automation",
    "jira",
    "documentation"
  ],
  "author": "Design Intelligence Platform",
  "license": "MIT",
  "engines": {
    "figma": ">=1.0.0"
  }
}
EOF

# Create installation instructions
cat > production-bundle/INSTALL.md << EOF
# 🚀 Design Intelligence Platform - Installation Guide

## Installation in Figma Desktop

1. **Download** this plugin bundle
2. **Unzip** the files to a folder
3. **Open Figma Desktop** (not browser version)
4. Go to **Plugins > Development > Import plugin from manifest...**
5. **Select** the \`manifest.json\` file from the unzipped folder
6. **Click Open** to install

## Usage

1. **Open** any Figma design file
2. **Select** frames, components, or elements you want to analyze
3. **Run** the plugin from **Plugins > Development > Design Intelligence Platform**
4. **Enter** your tech stack information
5. **Preview** the captured context
6. **Generate** documentation, tickets, or code specifications

## Features

- 🎨 **Smart Context Capture**: Screenshots + design data
- 🧠 **AI-Powered Generation**: Intelligent document creation
- 📊 **Design System Analysis**: Compliance checking
- 🔄 **Multi-Format Output**: Jira tickets, documentation, code specs
- 🎯 **Production Ready**: Enterprise-grade reliability

## Support

For issues, feature requests, or questions:
- Check the troubleshooting guide in README.md
- Submit issues on the project repository
- Review the testing guide for common solutions

---
Design Intelligence Platform v4.0.0
EOF

# Create a compressed bundle
echo "🗜️  Creating compressed bundle..."
cd production-bundle
zip -r "../figma-design-intelligence-platform-v4.0.0.zip" .
cd ..

# Create checksums for integrity
echo "🔐 Creating checksums..."
shasum -a 256 figma-design-intelligence-platform-v4.0.0.zip > figma-design-intelligence-platform-v4.0.0.zip.sha256

echo "✅ Production bundle created!"
echo ""
echo "📦 Bundle Contents:"
echo "   📁 production-bundle/ - Uncompressed bundle"
echo "   📦 figma-design-intelligence-platform-v4.0.0.zip - Distribution package"
echo "   🔐 figma-design-intelligence-platform-v4.0.0.zip.sha256 - Checksum"
echo ""
echo "🚀 Ready for:"
echo "   • Figma Plugin Store submission"
echo "   • Enterprise distribution"
echo "   • Client delivery"
echo "   • GitHub releases"