#!/usr/bin/env node

/**
 * YAML Fixer Script
 * Fixes common YAML indentation issues in template files
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

async function fixYAMLFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf8');
    let modified = false;

    // Fix the specific pattern: "- [ ]" items should be indented consistently
    // Pattern: key:\n  - [ ] item  ->  key:\n    - "item"
    const badPattern = /^(\s+)([a-zA-Z_]+):\s*\n(\s+)- \[ \] (.+)$/gm;
    
    content = content.replace(badPattern, (match, keyIndent, keyName, listIndent, item) => {
      console.log(`  🔧 Fixing list under "${keyName}" in ${filePath}`);
      modified = true;
      // Properly indent the list items
      return `${keyIndent}${keyName}:\n${keyIndent}  - "${item}"`;
    });

    // Also fix multi-line patterns
    const multiLinePattern = /^(\s+)([a-zA-Z_]+):\s*\n((?:\s+- \[ \] .+\n?)+)/gm;
    
    content = content.replace(multiLinePattern, (match, keyIndent, keyName, listItems) => {
      console.log(`  🔧 Fixing multi-line list under "${keyName}" in ${filePath}`);
      modified = true;
      
      // Extract all list items and fix their indentation
      const items = listItems.match(/- \[ \] (.+)/g) || [];
      const fixedItems = items.map(item => {
        const text = item.replace(/- \[ \] /, '');
        return `${keyIndent}  - "${text}"`;
      }).join('\n');
      
      return `${keyIndent}${keyName}:\n${fixedItems}`;
    });

    if (modified) {
      await writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function fixAllYAMLFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let fixedCount = 0;
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      fixedCount += await fixAllYAMLFiles(fullPath);
    } else if (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')) {
      const fixed = await fixYAMLFile(fullPath);
      if (fixed) fixedCount++;
    }
  }
  
  return fixedCount;
}

// Main execution
async function main() {
  console.log('🔧 YAML Template Fixer');
  console.log('Fixing indentation issues in template files...\n');
  
  const templatesDir = './config/templates';
  const fixedCount = await fixAllYAMLFiles(templatesDir);
  
  console.log(`\n✅ Fixed ${fixedCount} files`);
  console.log('🧪 Run "npm run validate:yaml" to verify fixes');
}

main().catch(console.error);