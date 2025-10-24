#!/bin/bash

# Figma AI Ticket Generator MCP Server Setup Script
echo "🚀 Setting up Figma AI Ticket Generator MCP Server..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node --version 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js version: $node_version"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the server directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful!"

# Get the absolute path to the server
server_path=$(realpath dist/server.js)

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Add to Claude Code:"
echo "   claude mcp add --transport stdio figma-ai-ticket-generator node $server_path"
echo ""
echo "2. Add to VS Code mcp.json:"
echo "   {"
echo "     \"inputs\": [],"
echo "     \"servers\": {"
echo "       \"figma-ai-ticket-generator\": {"
echo "         \"command\": \"node\","
echo "         \"args\": [\"$server_path\"],"
echo "         \"type\": \"stdio\""
echo "       }"
echo "     }"
echo "   }"
echo ""
echo "3. Test the server:"
echo "   npm run dev"
echo ""
echo "🔗 Available tools:"
echo "   • analyze_project - Comprehensive project analysis"
echo "   • batch_process_frames - Bulk frame processing"  
echo "   • generate_tickets - Automated ticket creation"
echo "   • check_compliance - Design system compliance"
echo "   • map_relationships - Component dependency mapping"
echo "   • estimate_effort - Development effort estimation"
echo ""
echo "📚 See README.md for detailed usage examples"
echo ""
echo "🚀 Ready to revolutionize your design-to-code workflow!"