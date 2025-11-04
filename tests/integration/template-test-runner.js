// Master Template Test Runner
// Comprehensive test execution for all template validation suites

import { runYamlValidationTests } from './yaml-validation.test.js';
import { runVariableSubstitutionTests } from './variable-substitution.test.js';
import { runJiraTemplateTests } from './platform-specific/jira.test.js';
import { runAITemplateIntegrationTests } from './integration/ai-template-flow.test.js';

/**
 * Run all template tests in sequence
 */
async function runAllTemplateTests() {
  console.log('🧪 COMPREHENSIVE TEMPLATE TEST SUITE');
  console.log('=====================================');
  console.log('Running all template validation tests...');
  console.log('');
  
  const startTime = Date.now();
  const results = {
    yamlValidation: null,
    variableSubstitution: null,
    jiraTemplate: null,
    aiIntegration: null,
    overall: false,
    totalTime: 0
  };
  
  try {
    // Test 1: YAML Validation
    console.log('🟦 PHASE 1: YAML SYNTAX VALIDATION');
    console.log('==================================');
    results.yamlValidation = await runYamlValidationTests();
    console.log('');
    
    // Test 2: Variable Substitution
    console.log('🟩 PHASE 2: VARIABLE SUBSTITUTION');
    console.log('=================================');
    results.variableSubstitution = await runVariableSubstitutionTests();
    console.log('');
    
    // Test 3: Jira Template (Primary Template)
    console.log('🟨 PHASE 3: JIRA TEMPLATE VALIDATION');
    console.log('====================================');
    results.jiraTemplate = await runJiraTemplateTests();
    console.log('');
    
    // Test 4: AI Integration (Requires Server)
    console.log('🟪 PHASE 4: AI INTEGRATION TESTING');
    console.log('==================================');
    try {
      results.aiIntegration = await runAITemplateIntegrationTests();
    } catch (error) {
      console.log('⚠️  AI Integration tests skipped (server may not be running)');
      console.log(`   Error: ${error.message}`);
      results.aiIntegration = { overall: false, error: error.message };
    }
    
    results.totalTime = Date.now() - startTime;
    
    // Calculate overall success
    const criticalTests = [
      results.yamlValidation?.success,
      results.variableSubstitution?.success, 
      results.jiraTemplate?.overall
      // AI integration is not critical as it depends on server
    ];
    
    results.overall = criticalTests.every(test => test === true);
    
    // Final Report
    console.log('\\n');
    console.log('📊 COMPREHENSIVE TEMPLATE TEST RESULTS');
    console.log('======================================');
    
    const formatResult = (result, label) => {
      if (!result) return `❓ ${label}: Skipped`;
      if (result.success === true || result.overall === true) return `✅ ${label}: Passed`;
      if (result.success === false || result.overall === false) return `❌ ${label}: Failed`;
      return `⚠️  ${label}: Partial`;
    };
    
    console.log(formatResult(results.yamlValidation, 'YAML Validation'));
    console.log(formatResult(results.variableSubstitution, 'Variable Substitution'));
    console.log(formatResult(results.jiraTemplate, 'Jira Template'));
    console.log(formatResult(results.aiIntegration, 'AI Integration'));
    
    console.log('\\n📈 DETAILED METRICS:');
    
    if (results.yamlValidation) {
      console.log(`   📋 YAML Files: ${results.yamlValidation.validFiles}/${results.yamlValidation.totalFiles} valid`);
    }
    
    if (results.variableSubstitution) {
      console.log(`   🔧 Variable Substitution: ${results.variableSubstitution.successfulFiles}/${results.variableSubstitution.totalFiles} successful`);
      
      if (Object.keys(results.variableSubstitution.unresolvedVariables || {}).length > 0) {
        const unresolvedCount = Object.keys(results.variableSubstitution.unresolvedVariables).length;
        console.log(`   ⚠️  Unresolved Variables: ${unresolvedCount} unique variables need attention`);
      }
    }
    
    if (results.jiraTemplate) {
      const jiraStatus = results.jiraTemplate.overall ? 'Production Ready' : 'Needs Work';
      console.log(`   🎫 Jira Template: ${jiraStatus}`);
    }
    
    if (results.aiIntegration && !results.aiIntegration.error) {
      const aiStatus = results.aiIntegration.overall ? 'Fully Functional' : 'Issues Detected';
      console.log(`   🤖 AI Integration: ${aiStatus}`);
    }
    
    console.log(`\\n⏱️  Total Test Time: ${results.totalTime}ms`);
    
    console.log(`\\n${results.overall ? '🎉' : '⚠️'} ${results.overall ? 'ALL CRITICAL TESTS PASSED!' : 'SOME TESTS NEED ATTENTION'}`);
    
    if (results.overall) {
      console.log('\\n🚀 RECOMMENDATIONS:');
      console.log('   ✅ Template system is production-ready');
      console.log('   ✅ Jira template validated and functional');
      console.log('   🎯 Ready for Figma Desktop testing');
      
      if (results.aiIntegration?.overall) {
        console.log('   🤖 AI integration fully operational');
      } else {
        console.log('   🔧 Ensure MCP server is running for AI features');
      }
    } else {
      console.log('\\n🔧 NEXT STEPS:');
      
      if (!results.yamlValidation?.success) {
        console.log('   📋 Fix YAML syntax errors in template files');
      }
      
      if (!results.variableSubstitution?.success) {
        console.log('   🔧 Update templates to resolve variable substitution issues');
      }
      
      if (!results.jiraTemplate?.overall) {
        console.log('   🎫 Address Jira template structure or format issues');
      }
      
      console.log('   🧪 Re-run tests after fixes: npm run test:templates');
    }
    
  } catch (error) {
    console.error('❌ Template test suite execution failed:', error);
    results.error = error.message;
    results.overall = false;
  }
  
  return results;
}

/**
 * Quick template validation (YAML + Variables only)
 */
async function runQuickTemplateTests() {
  console.log('⚡ QUICK TEMPLATE VALIDATION');
  console.log('============================');
  
  const results = {
    yaml: null,
    variables: null,
    overall: false
  };
  
  try {
    results.yaml = await runYamlValidationTests();
    results.variables = await runVariableSubstitutionTests();
    
    results.overall = results.yaml.success && results.variables.success;
    
    console.log(`\\n⚡ Quick Test Results: ${results.overall ? '✅ PASSED' : '❌ FAILED'}`);
    
  } catch (error) {
    console.error('❌ Quick template tests failed:', error);
    results.error = error.message;
  }
  
  return results;
}

// Command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const isQuick = args.includes('--quick') || args.includes('-q');
  
  const testFunction = isQuick ? runQuickTemplateTests : runAllTemplateTests;
  
  testFunction()
    .then(result => {
      process.exit(result.overall ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runAllTemplateTests, runQuickTemplateTests };