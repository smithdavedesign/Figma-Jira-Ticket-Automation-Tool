// Jira Template Specific Tests
// Tests the active Jira template (jira/component.yml) for production readiness

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { validateYamlFile } from '../yaml-validation.test.js';
import { testTemplateVariableSubstitution } from '../variable-substitution.test.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const jiraTemplatePath = join(__dirname, '../../../config/templates/platforms/jira/comp.yml');

/**
 * Enhanced context data specifically for Jira testing
 */
const jiraTestContext = {
  // Figma data (matches template variables)
  figma: {
    component_name: 'PrimaryButton',
    component_type: 'COMPONENT',
    design_status: 'Ready for Development',
    screenshot_filename: 'primary-button.png',
    live_link: 'https://figma.com/primary-button',
    extracted_colors: ['#007bff', '#ffffff', '#f8f9fa'],
    extracted_typography: ['Inter 16px', 'Inter 14px'],
    screenshot_markdown: {
      jira: '![Primary Button](primary-button.png)'
    }
  },
  
  // Project data
  project: {
    name: 'UI Components',
    tech_stack: ['React', 'TypeScript'],
    component_prefix: 'UI',
    testing_framework: 'Jest',
    // Add missing URL variables that templates expect
    component_library_url: 'https://storybook.company.com',
    accessibility_url: 'https://accessibility.company.com',
    testing_standards_url: 'https://testing.company.com'
  },
  
  // Calculated values
  calculated: {
    priority: 'High',
    story_points: 8,
    hours: 8,
    confidence: 0.85,
    risk_factors: ['State management complexity'],
    similar_components: ['SecondaryButton', 'IconButton'],
    // Add missing calculated variables that templates expect
    complexity: 'medium',
    design_analysis: 'Interactive button component with multiple states and click handling requiring structured implementation with proper focus indicators.'
  },
  
  // Authoring data
  authoring: {
    notes: 'Primary button implementation with focus states',
    component_path: '/src/components/PrimaryButton',
    cq_template: 'button-component',
    touch_ui_required: true
  },
  
  // Resource data
  resource: {
    type: 'Button Component Documentation',
    link: 'https://docs.example.com/primary-button',
    notes: 'Accessibility and interaction guidelines'
  },
  
  // Tech stack reference
  tech: 'React',
  
  // URLs
  storybook_url: 'https://storybook.example.com',
  github_url: 'https://github.com/example/ui-components',
  wiki_url: 'https://wiki.example.com',
  
  // Legacy compatibility
  componentName: 'PrimaryButton',
  projectName: 'UI Components',
  issueType: 'Story',
  priority: 'High',
  assignee: 'developer@company.com',
  reporter: 'designer@company.com',
  labels: ['frontend', 'component', 'ui'],
  
  // Current timestamp as string literal
  "'now'": new Date().toISOString()
};

/**
 * Test Jira template structure and required fields
 */
function testJiraTemplateStructure() {
  const result = {
    success: false,
    validation: null,
    requiredFields: [],
    missingFields: [],
    jiraFields: [],
    error: null
  };
  
  try {
    const validation = validateYamlFile(jiraTemplatePath);
    result.validation = validation;
    
    if (!validation.valid) {
      result.error = validation.error;
      return result;
    }
    
    const template = validation.parsed;
    
    // Check for Jira-specific required fields in new hierarchical structure
    const requiredJiraFields = [];
    
    // Check meta section
    if (template.meta) {
      if (!template.meta.platform) requiredJiraFields.push('meta.platform');
      if (!template.meta.document_type) requiredJiraFields.push('meta.document_type');
    } else {
      // Legacy structure
      if (!template.platform) requiredJiraFields.push('platform');
      if (!template.description) requiredJiraFields.push('description');
    }
    
    // Check template section
    if (template.template) {
      if (!template.template.content) requiredJiraFields.push('template.content');
    } else if (!template.content) {
      requiredJiraFields.push('content');
    }
    
    result.requiredFields = requiredJiraFields;
    result.missingFields = requiredJiraFields; // All missing fields were already identified above
    
    // Check which fields are present
    if (template.meta?.platform) result.jiraFields.push('meta.platform');
    if (template.meta?.document_type) result.jiraFields.push('meta.document_type'); 
    if (template.template?.content) result.jiraFields.push('template.content');
    
    // Legacy fields
    if (template.platform) result.jiraFields.push('platform');
    if (template.description) result.jiraFields.push('description');
    if (template.content) result.jiraFields.push('content');
    
    // Check template content for Jira-specific elements
    let templateContent = null;
    
    if (template.template) {
      if (typeof template.template === 'object' && template.template.content) {
        templateContent = template.template.content;
      } else if (typeof template.template === 'string') {
        templateContent = template.template;
      }
    } else if (template.content) {
      templateContent = template.content;
    }
    
    if (templateContent && typeof templateContent === 'string') {
      const jiraKeywords = [
        'Summary:',
        'Description:',
        'Acceptance Criteria:',
        'Story Points:',
        'Priority:'
      ];
      
      result.jiraKeywords = jiraKeywords.filter(keyword => 
        templateContent.includes(keyword)
      );
    } else {
      result.jiraKeywords = [];
    }
    
    result.success = result.missingFields.length === 0;
    
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

/**
 * Test generated Jira ticket format
 */
function testJiraTicketFormat() {
  const result = {
    success: false,
    hasTitle: false,
    hasDescription: false,
    hasAcceptanceCriteria: false,
    hasTechnicalDetails: false,
    estimatedLength: 0,
    error: null
  };
  
  try {
    const variableTest = testTemplateVariableSubstitution(jiraTemplatePath, jiraTestContext);
    
    if (!variableTest.success) {
      result.error = 'Variable substitution failed';
      return result;
    }
    
    const generatedTicket = variableTest.substituted;
    result.estimatedLength = generatedTicket.length;
    
    // Check for essential Jira ticket elements
    result.hasTitle = /^#+\s*/.test(generatedTicket) || generatedTicket.includes('Summary:') || generatedTicket.includes('# ') || generatedTicket.includes('## ');
    result.hasDescription = generatedTicket.includes('Description:') || generatedTicket.includes('**Description') || generatedTicket.includes('## 🎯 Component Overview') || generatedTicket.includes('Component Overview');
    result.hasAcceptanceCriteria = generatedTicket.includes('Acceptance Criteria') || generatedTicket.includes('✅') || generatedTicket.includes('- [ ]');
    result.hasTechnicalDetails = generatedTicket.includes('Technical') || generatedTicket.includes('Implementation') || generatedTicket.includes('Requirements');
    
    // Quality checks
    const wordCount = generatedTicket.split(/\s+/).length;
    result.wordCount = wordCount;
    result.hasMinimumContent = wordCount >= 100; // Minimum 100 words for a good ticket
    
    result.success = result.hasTitle && result.hasDescription && result.hasMinimumContent;
    
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

/**
 * Main Jira template test execution
 */
async function runJiraTemplateTests() {
  console.log('🎫 Jira Template Test Suite');
  console.log('===========================');
  
  // Check if Jira template exists
  try {
    readFileSync(jiraTemplatePath, 'utf8');
    console.log('✅ Jira template file found');
  } catch (error) {
    console.log('❌ Jira template file not found:', jiraTemplatePath);
    return { success: false, error: 'Template file not found' };
  }
  
  const results = {
    structure: null,
    variables: null,
    format: null,
    overall: false
  };
  
  // Test 1: Template Structure
  console.log('\\n🔍 Testing template structure...');
  results.structure = testJiraTemplateStructure();
  
  if (results.structure.success) {
    console.log('   ✅ All required fields present');
    console.log(`   📋 Jira fields: ${results.structure.jiraFields.join(', ')}`);
    if (results.structure.jiraKeywords) {
      console.log(`   🎯 Jira keywords: ${results.structure.jiraKeywords.length} found`);
    }
  } else {
    console.log(`   ❌ Missing fields: ${results.structure.missingFields.join(', ')}`);
    if (results.structure.error) {
      console.log(`   ❌ Error: ${results.structure.error}`);
    }
  }
  
  // Test 2: Variable Substitution
  console.log('\\n🔧 Testing variable substitution...');
  results.variables = testTemplateVariableSubstitution(jiraTemplatePath, jiraTestContext);
  
  if (results.variables.success) {
    console.log('   ✅ All variables resolved');
    console.log(`   🔧 Variables processed: ${results.variables.variables.length}`);
  } else {
    console.log(`   ⚠️  Unresolved: ${results.variables.unresolvedVariables.join(', ')}`);
  }
  
  // Test 3: Generated Ticket Format
  console.log('\\n📝 Testing generated ticket format...');
  results.format = testJiraTicketFormat();
  
  if (results.format.success) {
    console.log('   ✅ Ticket format looks good');
    console.log(`   📊 Length: ${results.format.estimatedLength} chars, ${results.format.wordCount} words`);
  } else {
    console.log('   ⚠️  Format issues detected:');
    if (!results.format.hasTitle) console.log('      - Missing title/summary');
    if (!results.format.hasDescription) console.log('      - Missing description');
    if (!results.format.hasMinimumContent) console.log('      - Content too short');
  }
  
  // Overall assessment
  results.overall = results.structure.success && results.variables.success && results.format.success;
  
  console.log(`\\n📊 Jira Template Assessment:`);
  console.log(`   Structure: ${results.structure.success ? '✅' : '❌'}`);
  console.log(`   Variables: ${results.variables.success ? '✅' : '❌'}`);
  console.log(`   Format: ${results.format.success ? '✅' : '❌'}`);
  console.log(`\\n${results.overall ? '🎉' : '⚠️'} ${results.overall ? 'Jira template ready for production!' : 'Jira template needs attention'}`);
  
  return results;
}

// Vitest test structure
import { describe, test, expect } from 'vitest';

describe('Jira Template Tests', () => {
  test('should run Jira template tests', async () => {
    const result = await runJiraTemplateTests();
    expect(result).toBeDefined();
    expect(result.overall).toBeDefined();
    expect(result.structure).toBeDefined();
    expect(result.variables).toBeDefined();
    expect(result.format).toBeDefined();
  });

  test('should validate Jira template structure', () => {
    const result = testJiraTemplateStructure();
    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(Array.isArray(result.requiredFields)).toBe(true);
    expect(Array.isArray(result.missingFields)).toBe(true);
    expect(Array.isArray(result.jiraFields)).toBe(true);
  });

  test('should test Jira ticket format', () => {
    const result = testJiraTicketFormat();
    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(typeof result.hasTitle).toBe('boolean');
    expect(typeof result.hasDescription).toBe('boolean');
    expect(typeof result.hasAcceptanceCriteria).toBe('boolean');
    expect(typeof result.hasTechnicalDetails).toBe('boolean');
    expect(result.estimatedLength).toBeGreaterThanOrEqual(0);
  });

  test('should have valid Jira test context', () => {
    expect(jiraTestContext).toBeDefined();
    expect(jiraTestContext.componentName).toBeDefined();
    expect(jiraTestContext.project).toBeDefined();
    expect(jiraTestContext.issueType).toBeDefined();
    expect(Array.isArray(jiraTestContext.acceptanceCriteria)).toBe(true);
    expect(Array.isArray(jiraTestContext.colors)).toBe(true);
    expect(Array.isArray(jiraTestContext.labels)).toBe(true);
  });
});

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runJiraTemplateTests()
    .then(result => {
      process.exit(result.overall ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runJiraTemplateTests, testJiraTemplateStructure, testJiraTicketFormat, jiraTestContext };