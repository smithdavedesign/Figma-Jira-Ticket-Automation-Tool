#!/bin/bash

# Batch migration script for src/ directory TypeScript files
# This script will help migrate the remaining 35+ TypeScript files

echo "🚀 Starting batch migration of src/ directory TypeScript files..."

# Source directory
SRC_DIR="/Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator/src"
TARGET_BASE="/Users/david/Documents/Figa-Jira-Automations-Tool/figma-ticket-generator"

# Create target directories
echo "📁 Creating target directory structure..."

# Core directories
mkdir -p "$TARGET_BASE/core/shared/types"
mkdir -p "$TARGET_BASE/core/design-intelligence/adapters"
mkdir -p "$TARGET_BASE/core/design-intelligence/schema"
mkdir -p "$TARGET_BASE/core/design-intelligence/validators"
mkdir -p "$TARGET_BASE/core/design-intelligence/generators"
mkdir -p "$TARGET_BASE/core/ai/adapters"
mkdir -p "$TARGET_BASE/core/ai/models"
mkdir -p "$TARGET_BASE/core/compliance"
mkdir -p "$TARGET_BASE/core/design-system"

# App directories
mkdir -p "$TARGET_BASE/app/plugin/handlers"
mkdir -p "$TARGET_BASE/app/plugin/utils"

# Archive directories
mkdir -p "$TARGET_BASE/archive/src-typescript"

echo "✅ Directory structure created"

# Copy TypeScript files to archive for preservation
echo "📦 Archiving original TypeScript files..."
cp -r "$SRC_DIR"/* "$TARGET_BASE/archive/src-typescript/"

echo "✅ Original TypeScript files archived"

# List files that need migration
echo "📋 TypeScript files requiring migration:"
find "$SRC_DIR" -name "*.ts" -o -name "*.tsx" | while read file; do
    echo "  - $file"
done

echo ""
echo "🎯 Migration targets:"
echo "  • 37 TypeScript files found"
echo "  • Core types and utilities → core/shared/"
echo "  • Design intelligence → core/design-intelligence/"
echo "  • AI orchestrator → core/ai/"
echo "  • Plugin files → app/plugin/"
echo "  • Shared utilities → core/shared/"
echo "  • Legacy files → archive/"

echo ""
echo "⚠️  Manual conversion required for proper JSDoc and error handling"
echo "📚 See MVC_NODEJS_MIGRATION_PLAN.md for conversion guidelines"

echo "✅ Batch migration preparation complete"