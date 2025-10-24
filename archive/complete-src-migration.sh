#!/bin/bash

# 🚀 Complete src/ Directory Migration Script
# Converts ALL remaining TypeScript files to JavaScript with MVC organization

echo "🚀 Starting COMPLETE src/ TypeScript to JavaScript migration..."
echo "📊 Scope: 33 remaining TypeScript files"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator"

cd "$PROJECT_ROOT" || exit 1

# Create comprehensive MVC directory structure
echo "📁 Creating complete MVC directory structure..."

# Core directories (Models)
mkdir -p core/types
mkdir -p core/compliance
mkdir -p core/ai/models
mkdir -p core/design-intelligence/adapters
mkdir -p core/design-intelligence/generators
mkdir -p core/design-intelligence/schema
mkdir -p core/design-intelligence/validators
mkdir -p core/shared/types
mkdir -p core/validation

# App directories (Controllers)
mkdir -p app/plugin/handlers
mkdir -p app/plugin/utils
mkdir -p app/legacy

# UI directories (Views) - already exists
mkdir -p ui/production

# List all TypeScript files that need migration
echo "📋 TypeScript files to migrate:"
find src/ -name "*.ts" | sort | while read -r ts_file; do
    echo "  - $ts_file"
done

# Archive all original TypeScript files first
echo "📦 Archiving original TypeScript files..."
mkdir -p archive/src-typescript

# Copy entire src structure to archive
cp -r src/ archive/src-typescript/

echo "✅ Archive complete: archive/src-typescript/"

# Migration mappings - TypeScript to JavaScript with MVC organization
declare -A migration_map=(
    # Core Types (Models)
    ["src/core/types/figma-api.ts"]="core/types/figma-api.js"
    ["src/core/types/figma-data.ts"]="core/types/figma-data.js" 
    ["src/core/types/compliance.ts"]="core/types/compliance.js"
    ["src/core/types/plugin-messages.ts"]="core/types/plugin-messages.js"
    ["src/core/types/design-system.ts"]="core/types/design-system.js"
    ["src/shared/types/figma-api.ts"]="core/types/shared-figma-api.js"
    ["src/shared/types/ai-models.ts"]="core/types/shared-ai-models.js"
    ["src/shared/types/figma-data.ts"]="core/types/shared-figma-data.js"
    ["src/shared/types/compliance.ts"]="core/types/shared-compliance.js"
    ["src/shared/types/plugin-messages.ts"]="core/types/shared-plugin-messages.js"
    ["src/shared/types/design-system.ts"]="core/types/shared-design-system.js"

    # Core Business Logic (Models)
    ["src/core/compliance/analyzer.ts"]="core/compliance/analyzer.js"
    ["src/core/ai/models/ai-models.ts"]="core/ai/models/ai-models.js"
    ["src/core/design-system/scanner.ts"]="core/design-system/scanner.js"
    ["src/shared/fetchScreenshot.ts"]="core/shared/fetchScreenshot.js"
    ["src/validation/end-to-end-validator.ts"]="core/validation/end-to-end-validator.js"
    ["src/validation/pipeline-test-runner.ts"]="core/validation/pipeline-test-runner.js"

    # Design Intelligence System (Models)
    ["src/design-intelligence/adapters/react-mcp-adapter.ts"]="core/design-intelligence/adapters/react-mcp-adapter.js"
    ["src/design-intelligence/schema/design-spec.ts"]="core/design-intelligence/schema/design-spec.js"
    ["src/design-intelligence/validators/design-spec-validator.ts"]="core/design-intelligence/validators/design-spec-validator.js"
    ["src/design-intelligence/validators/migration-manager.ts"]="core/design-intelligence/validators/migration-manager.js"
    ["src/design-intelligence/generators/design-spec-generator.ts"]="core/design-intelligence/generators/design-spec-generator.js"
    ["src/design-intelligence/generators/figma-mcp-converter.ts"]="core/design-intelligence/generators/figma-mcp-converter.js"

    # Plugin System (Controllers)
    ["src/plugin/main.ts"]="app/plugin/main.js"
    ["src/plugin/utils/figma-api.ts"]="app/plugin/utils/figma-api.js"
    ["src/plugin/code-single.ts"]="app/plugin/code-single.js"
    ["src/plugin/handlers/design-system-handler.ts"]="app/plugin/handlers/design-system-handler.js"
    ["src/plugin/handlers/message-handler.ts"]="app/plugin/handlers/message-handler.js"

    # AI Orchestrator System (Models)
    ["src/ai-orchestrator/adapters/gemini-adapter.ts"]="core/ai/adapters/gemini-adapter.js"
    ["src/ai-orchestrator/adapters/claude-adapter.ts"]="core/ai/adapters/claude-adapter.js"
    ["src/ai-orchestrator/adapters/gpt4-adapter.ts"]="core/ai/adapters/gpt4-adapter.js"

    # Legacy Components (Controllers)
    ["src/legacy/design-system-scanner.ts"]="app/legacy/design-system-scanner.js"
    ["src/legacy/types.ts"]="app/legacy/types.js"
    ["src/legacy/code.ts"]="app/legacy/code.js"

    # Production System (Views)
    ["src/production/figma-integration.ts"]="ui/production/figma-integration.js"

    # Main Entry Point (Controller)
    ["src/index.ts"]="app/index.js"
)

# Execute migrations
echo "🔄 Starting TypeScript to JavaScript conversions..."

migration_count=0
for ts_file in "${!migration_map[@]}"; do
    js_file="${migration_map[$ts_file]}"
    
    if [ -f "$ts_file" ]; then
        echo -e "${BLUE}🔄 Converting:${NC} $ts_file -> $js_file"
        
        # Create target directory
        target_dir=$(dirname "$js_file")
        mkdir -p "$target_dir"
        
        # Note: Actual TypeScript conversion will be done by the AI agent
        # This script just sets up the structure and tracks what needs to be done
        echo "// TODO: Convert $ts_file to JavaScript" > "$js_file"
        echo "// Original file archived at: archive/src-typescript/$ts_file" >> "$js_file"
        
        ((migration_count++))
    else
        echo -e "${YELLOW}⚠️  File not found:${NC} $ts_file"
    fi
done

echo ""
echo -e "${GREEN}✅ Migration setup complete!${NC}"
echo "📊 Files prepared for conversion: $migration_count"
echo ""
echo "📋 MVC Organization Summary:"
echo "  📁 core/          - Business logic, types, design intelligence (Models)"
echo "  📁 app/           - Controllers, plugin entry points (Controllers)"  
echo "  📁 ui/            - User interfaces, production views (Views)"
echo ""
echo "🔧 Next steps:"
echo "  1. AI agent will convert each TypeScript file to JavaScript"
echo "  2. Preserve all functionality with JSDoc type annotations"
echo "  3. Update import/export statements for new structure"
echo "  4. Validate all conversions work correctly"
echo ""
echo "📦 Original files safely archived in: archive/src-typescript/"