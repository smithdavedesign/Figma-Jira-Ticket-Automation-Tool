#!/bin/bash

# Figma AI Ticket Generator Setup Script

echo "🎫 Setting up Figma AI Ticket Generator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Project built successfully"

echo "
🎉 Setup complete! 

Next steps:
1. Open Figma Desktop App
2. Go to Plugins → Development → Import plugin from manifest...
3. Select the manifest.json file from this folder
4. Get your OpenAI API key from https://platform.openai.com/api-keys
5. Start generating tickets!

For development:
- Run 'npm run watch' to auto-rebuild on changes
- Check the README.md for detailed usage instructions
"