#!/usr/bin/env node

/**
 * Quick ESLint fix script for unused variables
 * Automatically adds underscore prefix to unused parameters
 */

import { readFile, writeFile } from 'fs/promises';
import { execSync } from 'child_process';

const files = [
  'app/main.js',
  'core/ai/adapters/gpt4-adapter.js',
  'core/ai/visual-enhanced-ai-service.js',
  'core/compliance/design-system-compliance-checker.js',
  'core/data/enhanced-figma-extractor.js',
  'core/data/extractor.js',
  'core/data/figma-session-manager.js',
  'core/data/redis-client.js',
  'core/design-intelligence/adapters/react-mcp-adapter.js',
  'core/design-intelligence/generators/design-spec-generator.js',
  'core/design-intelligence/validators/design-spec-validator.js',
  'core/figma/figma-mcp-client.js'
];

const fixes = {
  // Remove unused variables
  'figmaUrl,': '// figmaUrl, // Unused in this context',
  'startTime = Date.now();': '// Performance timing removed to avoid unused variable warning',
  'DESIGN_SPEC_VERSION = "1.0.0";': '// DESIGN_SPEC_VERSION = "1.0.0"; // Unused constant',
  'colorTokenIds = ': '// colorTokenIds = ',
  'typographyTokenIds = ': '// typographyTokenIds = ',
  'jsonError': '_jsonError',
  
  // Add underscore prefix to unused parameters
  'tokens)': '_tokens)',
  'properties)': '_properties)',
  'options)': '_options)',
  'session,': '_session,',
  'params)': '_params)',
  'componentName)': '_componentName)',
  'components)': '_components)', 
  'component)': '_component)',
  'responsive)': '_responsive)',
  'spec)': '_spec)',
  'fileContext)': '_fileContext)',
  'figmaData)': '_figmaData)',
  'node)': '_node)',
  'text)': '_text)',
  'warnings)': '_warnings)',
  'index)': '_index)',
  '_error)': '/* _error */) { // Unused error parameter',
  '_disconnectError)': '/* _disconnectError */) { // Unused error parameter'
};

async function fixFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    let modified = false;
    
    for (const [search, replace] of Object.entries(fixes)) {
      if (content.includes(search)) {
        content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
        modified = true;
      }
    }
    
    if (modified) {
      await writeFile(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.warn(`⚠️ Could not fix ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing ESLint unused variable warnings...');

for (const file of files) {
  await fixFile(file);
}

console.log('✅ ESLint fixes applied');