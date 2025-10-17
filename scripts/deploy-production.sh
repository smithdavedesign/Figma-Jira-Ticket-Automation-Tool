#!/bin/bash

# Production Deployment Workflow
# Leverages existing scripts without duplication

set -e

echo "🚀 Production Deployment Workflow..."
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Build Plugin
echo -e "${BLUE}Step 1: Building Plugin${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Plugin build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Plugin built${NC}"

# Step 2: Create Production Bundle (using your existing script)
echo -e "${BLUE}Step 2: Creating Production Bundle${NC}"
npm run bundle
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Bundle creation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Bundle created${NC}"

# Step 3: Validate Bundle (using your existing script)
echo -e "${BLUE}Step 3: Validating Bundle${NC}"
npm run validate:prod
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Validation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Bundle validated${NC}"

# Step 4: Health Check Server
echo -e "${BLUE}Step 4: Testing Server Health${NC}"
if [ -f "scripts/health-check.sh" ]; then
    ./scripts/health-check.sh --quick || echo "⚠️  Server not running (will start later)"
fi

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "======================================="
echo "📦 Bundle: $(ls -1 figma-design-intelligence-platform-*.zip 2>/dev/null | head -1)"
echo "� Files: production-bundle/"
echo "🚀 Ready for Figma Desktop testing"
echo ""
echo "Quick commands:"
echo "  npm start           # Start server"
echo "  npm run bundle      # Rebuild bundle"
echo "  npm run validate:prod # Validate files"
echo ""

# Optional: Start server
read -p "Start server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Starting server...${NC}"
    npm start
fi