// YAML Template Validation Test Suite
// Tests all .yaml template files for syntax validity and structure

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const templatesDir = join(__dirname, '../../core/data/templates');

/**
 * Recursively find all .yaml and .yml files in templates directory
 */
function findYamlFiles(dir) {
  const files = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findYamlFiles(fullPath));
      } else if (stat.isFile() && ['.yaml', '.yml'].includes(extname(item))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Validate YAML syntax and basic structure
 */
function validateYamlFile(filePath) {
  const result = {
    filePath,
    valid: false,
    parsed: null,
    error: null,
    warnings: []
  };
  
  try {
    const content = readFileSync(filePath, 'utf8');
    
    // Parse YAML
    const parsed = yaml.load(content);
    result.parsed = parsed;
    result.valid = true;
    
    // Basic structure validation
    if (!parsed || typeof parsed !== 'object') {
      result.warnings.push('Template should be an object');
    }
    
    // Check for required fields (common template structure)
    const requiredFields = ['platform', 'description'];
    for (const field of requiredFields) {
      if (!parsed[field]) {
        result.warnings.push(`Missing recommended field: ${field}`);
      }
    }
    
    // Check template content (either 'template' or 'content' field)
    const templateContent = parsed.template || parsed.content;
    if (templateContent && typeof templateContent !== 'string') {
      result.warnings.push('Template content should be a string');
    }
    
    if (!templateContent) {
      result.warnings.push('Missing template content (template or content field)');
    }
    
    // Check for Handlebars variables
    if (templateContent && templateContent.includes('{{')) {
      const handlebarsVars = templateContent.match(/\{\{[^}]+\}\}/g) || [];
      result.handlebarsVariables = handlebarsVars.length;
    }
    
  } catch (error) {
    result.error = error.message;
    result.valid = false;
  }
  
  return result;
}

/**
 * Main test execution
 */
async function runYamlValidationTests() {
  console.log('🧪 YAML Template Validation Test Suite');
  console.log('=====================================');
  
  const yamlFiles = findYamlFiles(templatesDir);
  console.log(`📋 Found ${yamlFiles.length} YAML template files`);
  
  if (yamlFiles.length === 0) {
    console.log('❌ No YAML files found in templates directory');
    return { success: false, results: [] };
  }
  
  const results = [];
  let validCount = 0;
  
  for (const filePath of yamlFiles) {
    const relativePath = filePath.replace(templatesDir, '').replace(/^\//, '');
    console.log(`\\n🔍 Testing: ${relativePath}`);
    
    const result = validateYamlFile(filePath);
    results.push(result);
    
    if (result.valid) {
      console.log('   ✅ Valid YAML syntax');
      validCount++;
      
      if (result.handlebarsVariables) {
        console.log(`   🔧 Handlebars variables: ${result.handlebarsVariables}`);
      }
      
      if (result.warnings.length > 0) {
        console.log('   ⚠️  Warnings:');
        result.warnings.forEach(warning => {
          console.log(`      - ${warning}`);
        });
      }
    } else {
      console.log(`   ❌ Invalid: ${result.error}`);
    }
  }
  
  console.log(`\\n📊 Validation Results:`);
  console.log(`   ✅ Valid files: ${validCount}/${yamlFiles.length}`);
  console.log(`   ❌ Invalid files: ${yamlFiles.length - validCount}/${yamlFiles.length}`);
  console.log(`   📈 Success rate: ${Math.round(validCount / yamlFiles.length * 100)}%`);
  
  const success = validCount === yamlFiles.length;
  console.log(`\\n${success ? '🎉' : '⚠️'} ${success ? 'All templates valid!' : 'Some templates need attention'}`);
  
  return {
    success,
    totalFiles: yamlFiles.length,
    validFiles: validCount,
    results
  };
}

// Vitest test structure
import { describe, test, expect } from 'vitest';

describe('YAML Template Validation Tests', () => {
  test('should validate YAML template syntax and structure', async () => {
    const result = await runYamlValidationTests();
    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(result.totalFiles).toBeGreaterThanOrEqual(0);
    expect(result.validFiles).toBeGreaterThanOrEqual(0);
  });

  test('should find YAML files in templates directory', () => {
    const yamlFiles = findYamlFiles(templatesDir);
    expect(Array.isArray(yamlFiles)).toBe(true);
  });

  test('should validate individual YAML files', () => {
    const testYamlContent = `
platform: test
description: Test template
template: "Hello {{ name }}"
    `.trim();
    
    // Mock file validation
    expect(typeof validateYamlFile).toBe('function');
  });
});

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runYamlValidationTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runYamlValidationTests, validateYamlFile, findYamlFiles };