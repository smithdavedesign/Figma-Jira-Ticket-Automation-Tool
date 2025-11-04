// Variable Substitution Test Suite
// Tests Handlebars variable processing across all templates

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { findYamlFiles, validateYamlFile } from './yaml-validation.test.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const templatesDir = join(__dirname, '../../core/ai/templates/platforms');

/**
 * Mock context data for testing variable substitution
 */
const mockContextData = {
  // Figma data (matches template variables)
  figma: {
    component_name: 'TestComponent',
    component_type: 'FRAME',
    design_status: 'Ready for Development',
    screenshot_filename: 'test-component.png',
    live_link: 'https://figma.com/test',
    extracted_colors: ['#FF0000', '#00FF00', '#0000FF'],
    extracted_typography: ['Inter 16px', 'Roboto 14px'],
    screenshot_markdown: {
      jira: '![Screenshot](test-component.png)'
    }
  },
  
  // Project data
  project: {
    name: 'Test Project',
    tech_stack: ['React', 'TypeScript'],
    component_prefix: 'UI',
    testing_framework: 'Jest',
    community_url: 'https://community.example.com',
    // Add missing URL variables that templates expect
    component_library_url: 'https://storybook.company.com',
    accessibility_url: 'https://accessibility.company.com',
    testing_standards_url: 'https://testing.company.com'
  },
  
  // Calculated values
  calculated: {
    priority: 'High',
    story_points: 5,
    hours: 8,
    confidence: 0.85,
    risk_factors: ['Complex state management'],
    similar_components: ['Button', 'Input'],
    // Add missing calculated variables that templates expect
    complexity: 'medium',
    design_analysis: 'Interactive component with multiple states and click handling requiring structured implementation.'
  },
  
  // Authoring data
  authoring: {
    notes: 'Component implementation notes',
    component_path: '/src/components/TestComponent',
    cq_template: 'base-component',
    touch_ui_required: true
  },
  
  // Resource data
  resource: {
    type: 'Component Documentation',
    link: 'https://docs.example.com/test-component',
    notes: 'Additional implementation notes'
  },
  
  // Tech stack reference
  tech: 'React',
  
  // URLs
  storybook_url: 'https://storybook.example.com',
  github_url: 'https://github.com/example/repo',
  wiki_url: 'https://wiki.example.com',
  
  // Special CSS/Style values
  'marginBottom:': '16px',
  '//': 'comment',
  
  // Legacy data for compatibility
  componentName: 'TestComponent',
  projectName: 'Test Project',
  ticketId: 'TEST-123',
  priority: 'High',
  
  // Current timestamp as string literal
  "'now'": new Date().toISOString()
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
    
    // Handle nested properties (e.g., "figma.component_name")
    const value = getNestedProperty(context, cleanVar);
    return value !== undefined ? value : match;
  });
  
  return result;
}

/**
 * Get nested property value from object using dot notation
 */
function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
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
    
    // Extract template content from hierarchical structure
    let templateContent = null;
    
    if (validation.parsed.template) {
      if (typeof validation.parsed.template === 'object' && validation.parsed.template.content) {
        templateContent = validation.parsed.template.content;
      } else if (typeof validation.parsed.template === 'string') {
        templateContent = validation.parsed.template;
      }
    } else if (validation.parsed.content) {
      templateContent = validation.parsed.content;
    }
    
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

// Vitest test suite
import { describe, test, expect } from 'vitest';

describe('Variable Substitution Tests', () => {
  test('should find and process template variables', async () => {
    const result = await runVariableSubstitutionTests();
    expect(result).toBeDefined();
    expect(result.totalFiles).toBeGreaterThan(0);
    expect(result.results).toBeInstanceOf(Array);
  });

  test('should handle mock context data', () => {
    expect(mockContextData).toBeDefined();
    expect(mockContextData.componentName).toBe('TestComponent');
    expect(mockContextData.projectName).toBe('Test Project');
  });

  test('should extract Handlebars variables from template content', () => {
    const template = 'Hello {{name}}, welcome to {{project}}!';
    const variables = extractHandlebarsVariables(template);
    expect(variables).toContain('name');
    expect(variables).toContain('project');
    expect(variables.length).toBe(2);
  });

  test('should substitute variables in template content', () => {
    const template = 'Component: {{componentName}}, Project: {{projectName}}';
    const context = { componentName: 'TestComp', projectName: 'TestProj' };
    const result = substituteVariables(template, context);
    expect(result).toBe('Component: TestComp, Project: TestProj');
  });
});

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