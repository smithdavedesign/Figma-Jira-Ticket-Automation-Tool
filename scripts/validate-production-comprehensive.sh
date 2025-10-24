#!/bin/bash

# 🔍 COMPREHENSIVE PRODUCTION VALIDATION
# Thorough validation of all files and systems before deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}🔍 COMPREHENSIVE PRODUCTION VALIDATION${NC}"
echo "========================================"
echo "Project: $(basename "$PROJECT_ROOT")"
echo "Time: $(date)"
echo ""

cd "$PROJECT_ROOT"

VALIDATION_ERRORS=0
VALIDATION_WARNINGS=0

# Helper function to report errors
report_error() {
    echo -e "${RED}❌ $1${NC}"
    ((VALIDATION_ERRORS++))
}

# Helper function to report warnings
report_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
    ((VALIDATION_WARNINGS++))
}

# Helper function to report success
report_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Essential Files Validation
echo -e "${BLUE}📁 Step 1: Essential Files Validation${NC}"

# Check manifest.json
if [ -f "manifest.json" ]; then
    if command -v jq > /dev/null; then
        if jq empty manifest.json 2>/dev/null; then
            MANIFEST_NAME=$(jq -r '.name' manifest.json 2>/dev/null)
            MANIFEST_API=$(jq -r '.api' manifest.json 2>/dev/null)
            MANIFEST_MAIN=$(jq -r '.main' manifest.json 2>/dev/null)
            MANIFEST_UI=$(jq -r '.ui' manifest.json 2>/dev/null)
            
            report_success "manifest.json is valid JSON"
            echo "  Plugin Name: $MANIFEST_NAME"
            echo "  API Version: $MANIFEST_API"
            echo "  Main File: $MANIFEST_MAIN"
            echo "  UI File: $MANIFEST_UI"
            
            # Validate referenced files exist
            if [ ! -f "$MANIFEST_MAIN" ]; then
                report_error "manifest.json references missing main file: $MANIFEST_MAIN"
            fi
            
            if [ ! -f "$MANIFEST_UI" ]; then
                report_error "manifest.json references missing UI file: $MANIFEST_UI"
            fi
        else
            report_error "manifest.json contains invalid JSON"
        fi
    else
        # Fallback to python
        if python3 -m json.tool manifest.json > /dev/null 2>&1; then
            report_success "manifest.json is valid JSON (verified with Python)"
        else
            report_error "manifest.json contains invalid JSON"
        fi
    fi
else
    report_error "manifest.json not found"
fi

# Check main code file
if [ -f "code.js" ]; then
    CODE_SIZE=$(wc -c < code.js)
    if [ $CODE_SIZE -gt 1000 ]; then
        report_success "code.js found (${CODE_SIZE} bytes)"
        
        # Check for common issues
        if grep -q "console.error\|throw new Error" code.js; then
            echo "  Contains error handling: ✅"
        else
            report_warning "code.js may lack comprehensive error handling"
        fi
        
        if grep -q "figma\." code.js; then
            echo "  Contains Figma API calls: ✅"
        else
            report_warning "code.js may not contain Figma API integration"
        fi
    else
        report_error "code.js is too small (${CODE_SIZE} bytes) - likely empty or corrupted"
    fi
else
    report_error "code.js not found"
fi

# Check TypeScript source (if exists)
if [ -f "code.ts" ]; then
    TS_SIZE=$(wc -c < code.ts)
    report_success "code.ts source found (${TS_SIZE} bytes)"
    
    # Check if JS is newer than TS
    if [ "code.js" -ot "code.ts" ]; then
        report_warning "code.js is older than code.ts - may need recompilation"
    fi
else
    echo "  code.ts source: Not found (using JS directly)"
fi

# Check UI file
if [ -f "ui/index.html" ]; then
    UI_SIZE=$(wc -c < ui/index.html)
    if [ $UI_SIZE -gt 5000 ]; then
        report_success "ui/index.html found (${UI_SIZE} bytes)"
        
        # Check for essential HTML elements
        if grep -q "<html\|<head\|<body" ui/index.html; then
            echo "  Contains proper HTML structure: ✅"
        else
            report_warning "ui/index.html may lack proper HTML structure"
        fi
        
        if grep -q "script\|javascript" ui/index.html; then
            echo "  Contains JavaScript functionality: ✅"
        else
            report_warning "ui/index.html may lack JavaScript functionality"
        fi
        
        if grep -q "MCP\|localhost:3000" ui/index.html; then
            echo "  Contains MCP server integration: ✅"
        else
            report_warning "ui/index.html may lack MCP server integration"
        fi
    else
        report_error "ui/index.html is too small (${UI_SIZE} bytes) - likely empty or corrupted"
    fi
else
    report_error "ui/index.html not found"
fi

# 2. Dist Directory Validation
echo ""
echo -e "${BLUE}📦 Step 2: Distribution Directory Validation${NC}"

if [ -d "dist" ]; then
    report_success "dist/ directory exists"
    
    DIST_FILES=$(find dist -type f | wc -l)
    echo "  Files in dist/: $DIST_FILES"
    
    # Check dist file consistency
    if [ -f "dist/code.js" ] && [ -f "code.js" ]; then
        SOURCE_SIZE=$(wc -c < code.js)
        DIST_SIZE=$(wc -c < dist/code.js)
        if [ $SOURCE_SIZE -eq $DIST_SIZE ]; then
            echo "  code.js sync: ✅ (${SOURCE_SIZE} bytes)"
        else
            report_warning "dist/code.js (${DIST_SIZE}b) differs from source code.js (${SOURCE_SIZE}b)"
        fi
    else
        report_error "dist/code.js missing or source code.js missing"
    fi
    
    if [ -f "dist/ui/index.html" ] && [ -f "ui/index.html" ]; then
        SOURCE_UI_SIZE=$(wc -c < ui/index.html)
        DIST_UI_SIZE=$(wc -c < dist/ui/index.html)
        if [ $SOURCE_UI_SIZE -eq $DIST_UI_SIZE ]; then
            echo "  ui/index.html sync: ✅ (${SOURCE_UI_SIZE} bytes)"
        else
            report_warning "dist/ui/index.html (${DIST_UI_SIZE}b) differs from source (${SOURCE_UI_SIZE}b)"
        fi
    else
        report_error "dist/ui/index.html missing or source ui/index.html missing"
    fi
    
    if [ -f "dist/manifest.json" ] && [ -f "manifest.json" ]; then
        if cmp -s manifest.json dist/manifest.json; then
            echo "  manifest.json sync: ✅"
        else
            report_warning "dist/manifest.json differs from source manifest.json"
        fi
    else
        report_error "dist/manifest.json missing or source manifest.json missing"
    fi
else
    report_error "dist/ directory not found - run 'npm run sync' first"
fi

# 3. Dependencies and Environment
echo ""
echo -e "${BLUE}📋 Step 3: Dependencies and Environment${NC}"

# Check package.json
if [ -f "package.json" ]; then
    if command -v jq > /dev/null; then
        PKG_NAME=$(jq -r '.name' package.json 2>/dev/null)
        PKG_VERSION=$(jq -r '.version' package.json 2>/dev/null)
        report_success "package.json valid - $PKG_NAME v$PKG_VERSION"
    else
        report_success "package.json found"
    fi
else
    report_error "package.json not found"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    MODULE_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l)
    report_success "node_modules/ exists (${MODULE_COUNT} packages)"
else
    report_warning "node_modules/ not found - run 'npm install'"
fi

# Check for lock files
if [ -f "package-lock.json" ]; then
    echo "  package-lock.json: ✅"
elif [ -f "yarn.lock" ]; then
    echo "  yarn.lock: ✅"
else
    report_warning "No lock file found (package-lock.json or yarn.lock)"
fi

# 4. Server and Port Validation
echo ""
echo -e "${BLUE}🔧 Step 4: Server and Port Validation${NC}"

# Check if MCP server is running
if curl -s --max-time 3 http://localhost:3000/ > /dev/null 2>&1; then
    report_success "MCP server is running on port 3000"
    
    # Get server info
    if command -v jq > /dev/null; then
        SERVER_INFO=$(curl -s http://localhost:3000/ 2>/dev/null)
        TOOLS_COUNT=$(echo "$SERVER_INFO" | jq -r '.tools | length' 2>/dev/null || echo "unknown")
        echo "  Available tools: $TOOLS_COUNT"
        
        if [ "$TOOLS_COUNT" -gt 0 ] && [ "$TOOLS_COUNT" != "unknown" ]; then
            echo "  Tools list: $(echo "$SERVER_INFO" | jq -r '.tools | join(", ")' 2>/dev/null)"
        fi
    fi
else
    report_warning "MCP server not running on port 3000 - start with 'npm run start:mvc'"
fi

# Check for port conflicts
for PORT in 3000 8080 8101; do
    if lsof -i :$PORT > /dev/null 2>&1; then
        PROCESS=$(lsof -ti :$PORT | head -1)
        echo "  Port $PORT: In use (PID: $PROCESS)"
    else
        echo "  Port $PORT: Available"
    fi
done

# 5. Build and Sync Scripts Validation
echo ""
echo -e "${BLUE}🛠️ Step 5: Build and Sync Scripts Validation${NC}"

# Check essential scripts exist
ESSENTIAL_SCRIPTS=("sync-dist.sh" "build.sh" "health-check.sh")
for SCRIPT in "${ESSENTIAL_SCRIPTS[@]}"; do
    if [ -f "scripts/$SCRIPT" ]; then
        if [ -x "scripts/$SCRIPT" ]; then
            echo "  scripts/$SCRIPT: ✅ (executable)"
        else
            report_warning "scripts/$SCRIPT exists but not executable"
        fi
    else
        report_warning "scripts/$SCRIPT not found"
    fi
done

# 6. Production Bundle Validation (if exists)
echo ""
echo -e "${BLUE}📦 Step 6: Production Bundle Validation${NC}"

if [ -d "production-bundle" ]; then
    BUNDLE_FILES=$(find production-bundle -type f | wc -l)
    report_success "production-bundle/ exists ($BUNDLE_FILES files)"
    
    # Check essential bundle files
    for FILE in "manifest.json" "code.js"; do
        if [ -f "production-bundle/$FILE" ]; then
            echo "  production-bundle/$FILE: ✅"
        else
            report_error "production-bundle/$FILE missing"
        fi
    done
    
    if [ -d "production-bundle/ui" ]; then
        echo "  production-bundle/ui/: ✅"
    else
        report_error "production-bundle/ui/ directory missing"
    fi
else
    echo "  production-bundle/: Not found (run 'npm run bundle' to create)"
fi

# Check for ZIP bundles
ZIP_COUNT=$(find . -maxdepth 1 -name "*.zip" | wc -l)
if [ $ZIP_COUNT -gt 0 ]; then
    echo "  ZIP bundles found: $ZIP_COUNT"
    ls -1 *.zip 2>/dev/null | head -3 | while read -r ZIP_FILE; do
        ZIP_SIZE=$(wc -c < "$ZIP_FILE" 2>/dev/null || echo "0")
        echo "    $ZIP_FILE (${ZIP_SIZE} bytes)"
    done
else
    echo "  ZIP bundles: None found"
fi

# 7. Final Summary
echo ""
echo -e "${CYAN}📊 VALIDATION SUMMARY${NC}"
echo "========================================"

if [ $VALIDATION_ERRORS -eq 0 ] && [ $VALIDATION_WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 PERFECT! No issues found${NC}"
    echo "✅ All systems ready for production deployment"
elif [ $VALIDATION_ERRORS -eq 0 ]; then
    echo -e "${YELLOW}✅ GOOD! Minor warnings found${NC}"
    echo "⚠️ $VALIDATION_WARNINGS warning(s) found - review above"
    echo "✅ No critical errors - safe to proceed"
else
    echo -e "${RED}❌ ISSUES FOUND! Must fix before deployment${NC}"
    echo "❌ $VALIDATION_ERRORS critical error(s) found"
    echo "⚠️ $VALIDATION_WARNINGS warning(s) found"
    echo "🔧 Fix critical errors before proceeding"
fi

echo ""
echo "📋 Quick Fixes:"
if [ $VALIDATION_ERRORS -gt 0 ]; then
    echo "  npm run sync              # Sync files to dist/"
    echo "  npm run build:plugin      # Rebuild plugin files"
    echo "  npm run start:mvc         # Start MCP server"
fi
if [ $VALIDATION_WARNINGS -gt 0 ]; then
    echo "  npm install               # Install/update dependencies"
    echo "  npm run build:ts          # Recompile TypeScript"
    echo "  chmod +x scripts/*.sh     # Fix script permissions"
fi

echo ""
echo "🚀 Next Steps:"
if [ $VALIDATION_ERRORS -eq 0 ]; then
    echo "  npm run deploy:prod       # Full production deployment"
    echo "  npm run bundle            # Create distribution bundle"
    echo "  npm run package           # Package for release"
else
    echo "  Fix critical errors first, then re-run validation"
    echo "  npm run validate:prod     # Re-run this validation"
fi

echo ""
echo -e "${CYAN}=======================================${NC}"

# Exit with appropriate code
if [ $VALIDATION_ERRORS -gt 0 ]; then
    exit 1
else
    exit 0
fi