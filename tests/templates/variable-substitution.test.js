// Variable Substitution Test Suite
// Tests Handlebars variable processing across all templates

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { findYamlFiles, validateYamlFile } from './yaml-validation.test.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const templatesDir = join(__dirname, '../../core/data/templates');

/**
 * Mock context data for testing variable substitution
 */
const mockContextData = {
  // Component data
  componentName: 'TestComponent',
  componentDescription: 'A test component for validation',
  componentType: 'FRAME',
  
  // Design data
  colors: ['#FF0000', '#00FF00', '#0000FF'],
  fonts: ['Inter', 'Roboto'],
  spacing: [8, 16, 24, 32],
  
  // Project data
  projectName: 'Test Project',
  fileName: 'test-file.fig',
  pageName: 'Test Page',
  
  // Technical data
  techStack: 'React TypeScript',
  framework: 'React',
  platform: 'web',
  
  // Ticket data
  ticketId: 'TEST-123',
  priority: 'High',
  assignee: 'test@example.com',
  
  // Metadata
  timestamp: new Date().toISOString(),
  author: 'Test Suite',
  version: '1.0.0'
};

/**
 * Extract Handlebars variables from template content
 */
function extractHandlebarsVariables(templateContent) {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = new Set();
  let match;
  
  while ((match = regex.exec(templateContent)) !== null) {
    // Clean up variable name (remove spaces, helpers, etc.)
    const variable = match[1].trim().split(' ')[0].split('|')[0];
    variables.add(variable);
  }
  
  return Array.from(variables);
}

/**
 * Simple Handlebars variable substitution for testing
 */
function substituteVariables(template, context) {
  let result = template;
  
  // Replace simple variables {{variable}}
  const regex = /\{\{([^}]+)\}\}/g;
  result = result.replace(regex, (match, variable) => {
    const cleanVar = variable.trim().split(' ')[0].split('|')[0];
    return context[cleanVar] !== undefined ? context[cleanVar] : match;
  });
  
  return result;
}

/**
 * Test variable substitution for a single template
 */
function testTemplateVariableSubstitution(filePath, context = mockContextData) {
  const result = {
    filePath,
    success: false,
    templateValid: false,
    variables: [],
    substituted: null,
    unresolvedVariables: [],
    error: null
  };
  
  try {
    // First validate the template
    const validation = validateYamlFile(filePath);
    if (!validation.valid) {
      result.error = `Template validation failed: ${validation.error}`;
      return result;
    }
    
    result.templateValid = true;
    
    const templateContent = validation.parsed.template || validation.parsed.content;
    if (!templateContent) {
      result.error = 'No template content found';
      return result;
    }
    
    // Extract variables
    result.variables = extractHandlebarsVariables(templateContent);
    
    // Perform substitution
    result.substituted = substituteVariables(templateContent, context);
    
    // Check for unresolved variables
    result.unresolvedVariables = extractHandlebarsVariables(result.substituted);
    
    // Success if no unresolved variables remain
    result.success = result.unresolvedVariables.length === 0;
    
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

/**
 * Main test execution
 */
async function runVariableSubstitutionTests() {
  console.log('🔧 Variable Substitution Test Suite');
  console.log('===================================');
  
  const yamlFiles = findYamlFiles(templatesDir);
  console.log(`📋 Testing variable substitution in ${yamlFiles.length} templates`);
  
  if (yamlFiles.length === 0) {
    console.log('❌ No YAML files found');
    return { success: false, results: [] };
  }
  
  const results = [];
  let successCount = 0;
  
  for (const filePath of yamlFiles) {
    const relativePath = filePath.replace(templatesDir, '').replace(/^\//, '');
    console.log(`\\n🔍 Testing: ${relativePath}`);
    
    const result = testTemplateVariableSubstitution(filePath);
    results.push(result);
    
    if (!result.templateValid) {
      console.log(`   ❌ Template invalid: ${result.error}`);
      continue;
    }
    
    console.log(`   📊 Found ${result.variables.length} variables: ${result.variables.join(', ')}`);
    
    if (result.success) {
      console.log('   ✅ All variables resolved successfully');
      successCount++;
    } else {
      console.log(`   ⚠️  Unresolved variables: ${result.unresolvedVariables.join(', ')}`);
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
    }
  }
  
  console.log(`\\n📊 Variable Substitution Results:`);
  console.log(`   ✅ Successful: ${successCount}/${yamlFiles.length}`);
  console.log(`   ⚠️  Need attention: ${yamlFiles.length - successCount}/${yamlFiles.length}`);
  console.log(`   📈 Success rate: ${Math.round(successCount / yamlFiles.length * 100)}%`);
  
  // Show most common unresolved variables
  const allUnresolved = results.flatMap(r => r.unresolvedVariables);
  const unresolvedCounts = {};
  allUnresolved.forEach(v => unresolvedCounts[v] = (unresolvedCounts[v] || 0) + 1);
  
  if (Object.keys(unresolvedCounts).length > 0) {
    console.log(`\\n🔍 Most common unresolved variables:`);
    Object.entries(unresolvedCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([variable, count]) => {
        console.log(`   • ${variable}: ${count} template(s)`);
      });
  }
  
  const success = successCount === yamlFiles.length;
  console.log(`\\n${success ? '🎉' : '⚠️'} ${success ? 'All variables resolved!' : 'Some templates need variable updates'}`);
  
  return {
    success,
    totalFiles: yamlFiles.length,
    successfulFiles: successCount,
    results,
    unresolvedVariables: unresolvedCounts
  };
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runVariableSubstitutionTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runVariableSubstitutionTests, testTemplateVariableSubstitution, mockContextData };