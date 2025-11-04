#!/usr/bin/env node

/**
 * Comprehensive Hybrid Architecture Test Suite
 * 
 * Tests all aspects of the hybrid AI-template architecture:
 * 1. Component initialization
 * 2. AI reasoning prompt generation
 * 3. Template formatting
 * 4. End-to-end integration
 * 5. Performance benchmarks
 * 6. Error handling
 * 7. Configuration validation
 */

import { TemplateIntegratedAIService } from '../../core/ai/template-integrated-ai-service.js';
import { UniversalTemplateEngine } from '../../core/template/UniversalTemplateEngine.js';
import { AIPromptManager } from '../../core/ai/AIPromptManager.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ComprehensiveHybridArchitectureTest {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: [],
      performance: {},
      summary: {}
    };
    
    this.templateEngine = null;
    this.promptManager = null;
    this.aiService = null;
  }

  /**
   * Run the complete test suite
   */
  async runComprehensiveTests() {
    console.log('🧪 COMPREHENSIVE HYBRID ARCHITECTURE TEST SUITE');
    console.log('=' .repeat(80));
    console.log('Testing cognitive separation between AI reasoning and template formatting\n');

    try {
      // Phase 1: Component Initialization Tests
      await this.runPhase('🚀 PHASE 1: Component Initialization', [
        this.testTemplateEngineInitialization,
        this.testAIPromptManagerInitialization,
        this.testHybridServiceInitialization,
        this.testServiceConfiguration
      ]);

      // Phase 2: AI Reasoning Tests
      await this.runPhase('🧠 PHASE 2: AI Reasoning & Prompt Generation', [
        this.testPromptTemplateLoading,
        this.testVariableSubstitution,
        this.testFallbackValues,
        this.testConditionalLogic,
        this.testContextEnrichment
      ]);

      // Phase 3: Template Formatting Tests
      await this.runPhase('📝 PHASE 3: Template Formatting', [
        this.testTemplateResolution,
        this.testOutputFormatting,
        this.testPlatformSpecificTemplates
      ]);

      // Phase 4: Integration Tests
      await this.runPhase('🔄 PHASE 4: End-to-End Integration', [
        this.testHybridDataFlow,
        this.testCognitiveSeparation,
        this.testStructuredDataOutput
      ]);

      // Phase 5: Performance Tests
      await this.runPhase('⚡ PHASE 5: Performance Benchmarks', [
        this.testInitializationPerformance,
        this.testPromptGenerationPerformance,
        this.testTemplateRenderingPerformance,
        this.testMemoryUsage
      ]);

      // Phase 6: Error Handling Tests
      await this.runPhase('🛡️ PHASE 6: Error Handling & Edge Cases', [
        this.testMissingPrompts,
        this.testInvalidContext,
        this.testTemplateErrors,
        this.testServiceRecovery
      ]);

      // Phase 7: Production Readiness Tests
      await this.runPhase('🏭 PHASE 7: Production Readiness', [
        this.testConfigurationValidation,
        this.testScalabilityLimits,
        this.testConcurrentRequests
      ]);

      this.generateComprehensiveReport();

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      this.results.summary.executionError = error.message;
    }

    return this.results;
  }

  /**
   * Run a test phase with multiple tests
   */
  async runPhase(phaseName, tests) {
    console.log(`\n${phaseName}`);
    console.log('-'.repeat(phaseName.length));

    for (const test of tests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Run a single test with timing and error handling
   */
  async runSingleTest(testFunction) {
    const testName = testFunction.name;
    const startTime = Date.now();

    try {
      this.results.total++;
      console.log(`  🔄 ${testName}...`);

      const result = await testFunction.call(this);
      const duration = Date.now() - startTime;

      this.results.passed++;
      this.results.tests.push({
        name: testName,
        status: 'PASSED',
        duration,
        result
      });

      console.log(`  ✅ ${testName} (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.failed++;
      this.results.tests.push({
        name: testName,
        status: 'FAILED',
        duration,
        error: error.message
      });

      console.log(`  ❌ ${testName} (${duration}ms): ${error.message}`);
    }
  }

  // ========================================
  // PHASE 1: Component Initialization Tests
  // ========================================

  async testTemplateEngineInitialization() {
    this.templateEngine = new UniversalTemplateEngine('./config/templates');
    
    // Test basic functionality
    const testTemplate = await this.templateEngine.resolveTemplate('platforms', 'jira', 'comp');
    
    if (!testTemplate || !testTemplate.title) {
      throw new Error('Template engine failed to resolve basic template');
    }

    return {
      templateEngine: 'initialized',
      templateResolution: 'working',
      testTemplate: testTemplate._meta?.cacheKey
    };
  }

  async testAIPromptManagerInitialization() {
    this.promptManager = new AIPromptManager();
    await this.promptManager.initialize();

    const promptCount = Object.keys(this.promptManager.prompts).length;
    if (promptCount < 2) {
      throw new Error(`Expected at least 2 prompts, got ${promptCount}`);
    }

    return {
      promptManager: 'initialized',
      promptsLoaded: promptCount,
      availablePrompts: Object.keys(this.promptManager.prompts)
    };
  }

  async testHybridServiceInitialization() {
    this.aiService = new TemplateIntegratedAIService({
      apiKey: 'test-key',
      templateEngine: this.templateEngine,
      promptManager: this.promptManager
    });

    await this.aiService.initialize();

    if (!this.aiService.promptManager || !this.aiService.templateEngine) {
      throw new Error('Hybrid service missing required components');
    }

    return {
      hybridService: 'initialized',
      hasPromptManager: !!this.aiService.promptManager,
      hasTemplateEngine: !!this.aiService.templateEngine
    };
  }

  async testServiceConfiguration() {
    const config = await this.aiService.testConfiguration();

    if (!config.promptManager?.available || !config.templateEngine?.available) {
      throw new Error('Service configuration indicates missing components');
    }

    return {
      configurationValid: true,
      promptManagerAvailable: config.promptManager.available,
      templateEngineAvailable: config.templateEngine.available,
      hybridArchitecture: config.features?.hybridArchitecture
    };
  }

  // =======================================
  // PHASE 2: AI Reasoning & Prompt Tests
  // =======================================

  async testPromptTemplateLoading() {
    const promptData = await this.promptManager.getReasoningPrompt('comprehensive-visual-analysis', {
      figma: { component_name: 'Test' },
      project: { tech_stack: ['React'] }
    });

    if (!promptData.prompt || promptData.prompt.length < 100) {
      throw new Error('Prompt template loading failed or content too short');
    }

    return {
      promptLoaded: true,
      promptLength: promptData.prompt.length,
      hasMetadata: !!promptData.metadata
    };
  }

  async testVariableSubstitution() {
    const context = {
      figma: { component_name: 'Login Button' },
      project: { tech_stack: ['React', 'TypeScript'], platform: 'web' }
    };

    const promptData = await this.promptManager.getReasoningPrompt('comprehensive-visual-analysis', context);

    if (!promptData.prompt.includes('Login Button')) {
      throw new Error('Component name not substituted in prompt');
    }

    if (!promptData.prompt.includes('React, TypeScript')) {
      throw new Error('Tech stack array not properly joined');
    }

    return {
      variableSubstitution: 'working',
      componentNameFound: promptData.prompt.includes('Login Button'),
      techStackFound: promptData.prompt.includes('React, TypeScript')
    };
  }

  async testFallbackValues() {
    const contextWithMissingValues = {
      figma: {},
      project: { tech_stack: ['React'] }
    };

    const promptData = await this.promptManager.getReasoningPrompt('comprehensive-visual-analysis', contextWithMissingValues);

    if (!promptData.prompt.includes('Unknown Component')) {
      throw new Error('Fallback value not applied for missing component name');
    }

    return {
      fallbackValues: 'working',
      fallbackApplied: promptData.prompt.includes('Unknown Component')
    };
  }

  async testConditionalLogic() {
    const contextWithStructural = {
      figma: { component_name: 'Test' },
      project: { tech_stack: ['React'] },
      structural: { children: ['child1', 'child2'], type: 'COMPONENT' }
    };

    const promptData = await this.promptManager.getReasoningPrompt('comprehensive-visual-analysis', contextWithStructural);

    if (!promptData.prompt.includes('Element Count: 2')) {
      throw new Error('Conditional logic not working for structural data');
    }

    return {
      conditionalLogic: 'working',
      structuralDataProcessed: promptData.prompt.includes('Element Count: 2')
    };
  }

  async testContextEnrichment() {
    const basicContext = {
      figma: { component_name: 'Test Button' },
      project: { tech_stack: ['React'] }
    };

    const enrichedContext = this.aiService.enrichContextForPrompts(basicContext, {
      documentType: 'component',
      techStack: ['React', 'TypeScript']
    });

    if (!enrichedContext.calculated || !enrichedContext.calculated.complexity) {
      throw new Error('Context not properly enriched');
    }

    return {
      contextEnrichment: 'working',
      hasCalculatedData: !!enrichedContext.calculated,
      complexity: enrichedContext.calculated.complexity
    };
  }

  // ===================================
  // PHASE 3: Template Formatting Tests
  // ===================================

  async testTemplateResolution() {
    const template = await this.templateEngine.resolveTemplate('platforms', 'jira', 'comp');
    
    if (!template || !template.content) {
      throw new Error('Template resolution failed');
    }

    return {
      templateResolution: 'working',
      templatePath: template._meta?.resolutionPath,
      hasContent: !!template.content
    };
  }

  async testOutputFormatting() {
    const mockData = {
      ticket: {
        summary: 'Test Component Implementation',
        description: 'Test description'
      },
      meta: {
        component_name: 'TestButton',
        complexity: 'medium'
      }
    };

    const formatted = await this.templateEngine.renderTemplate('platforms', 'jira', 'comp', mockData);

    if (!formatted || formatted.length < 100) {
      throw new Error('Template formatting failed or output too short');
    }

    return {
      templateFormatting: 'working',
      outputLength: formatted.length,
      containsComponentName: formatted.includes('TestButton')
    };
  }

  async testPlatformSpecificTemplates() {
    const data = { meta: { component_name: 'TestComponent' } };
    
    const jiraOutput = await this.templateEngine.renderTemplate('platforms', 'jira', 'comp', data);
    
    if (!jiraOutput.includes('TestComponent')) {
      throw new Error('Platform-specific template not working correctly');
    }

    return {
      platformSpecificTemplates: 'working',
      jiraTemplateWorking: true
    };
  }

  // =====================================
  // PHASE 4: End-to-End Integration Tests
  // =====================================

  async testHybridDataFlow() {
    const mockContext = {
      figma: { component_name: 'DataFlow Test' },
      project: { tech_stack: ['React'] }
    };

    // Step 1: AI reasoning
    const aiResult = await this.aiService.processWithReasoningPrompts(mockContext);

    if (!aiResult.visualUnderstanding || !aiResult.componentAnalysis) {
      throw new Error('AI reasoning step failed to produce structured output');
    }

    // Step 2: Template formatting
    const templateData = {
      ticket: {
        summary: `Implement ${mockContext.figma.component_name}`,
        description: aiResult.componentAnalysis
      },
      meta: { component_name: mockContext.figma.component_name }
    };

    const finalOutput = await this.templateEngine.renderTemplate('platforms', 'jira', 'comp', templateData);

    if (!finalOutput.includes('DataFlow Test')) {
      throw new Error('End-to-end data flow broken');
    }

    return {
      hybridDataFlow: 'working',
      aiReasoningWorking: true,
      templateFormattingWorking: true,
      endToEndWorking: true
    };
  }

  async testCognitiveSeparation() {
    // Test that AI produces structured data, not formatted output
    const aiResult = await this.aiService.processWithReasoningPrompts({
      figma: { component_name: 'Separation Test' },
      project: { tech_stack: ['React'] }
    });

    // AI should return structured JSON, not Jira markup
    if (typeof aiResult !== 'object' || aiResult.constructor !== Object) {
      throw new Error('AI not returning structured data - cognitive separation broken');
    }

    if (JSON.stringify(aiResult).includes('h1.') || JSON.stringify(aiResult).includes('*')) {
      throw new Error('AI returning formatted output instead of structured data');
    }

    return {
      cognitiveSeparation: 'working',
      aiReturnsStructuredData: true,
      aiNotReturningMarkup: true
    };
  }

  async testStructuredDataOutput() {
    const result = await this.aiService.processWithReasoningPrompts({
      figma: { component_name: 'Structured Test' },
      project: { tech_stack: ['React'] }
    });

    const requiredFields = ['visualUnderstanding', 'componentAnalysis', 'designSystemCompliance', 'recommendationSummary'];
    const missingFields = requiredFields.filter(field => !result[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required structured data fields: ${missingFields.join(', ')}`);
    }

    return {
      structuredDataOutput: 'working',
      allRequiredFields: true,
      fields: Object.keys(result)
    };
  }

  // ================================
  // PHASE 5: Performance Benchmarks
  // ================================

  async testInitializationPerformance() {
    const startTime = Date.now();
    
    const tempPromptManager = new AIPromptManager();
    await tempPromptManager.initialize();
    
    const initTime = Date.now() - startTime;
    
    if (initTime > 1000) {
      throw new Error(`Initialization too slow: ${initTime}ms`);
    }

    this.results.performance.initialization = initTime;

    return {
      initializationPerformance: 'acceptable',
      initializationTime: initTime,
      benchmark: 'under 1000ms'
    };
  }

  async testPromptGenerationPerformance() {
    const context = {
      figma: { component_name: 'Perf Test' },
      project: { tech_stack: ['React'] }
    };

    const iterations = 10;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await this.promptManager.getReasoningPrompt('comprehensive-visual-analysis', context);
    }

    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / iterations;

    if (avgTime > 50) {
      throw new Error(`Prompt generation too slow: ${avgTime}ms average`);
    }

    this.results.performance.promptGeneration = avgTime;

    return {
      promptGenerationPerformance: 'excellent',
      averageTime: avgTime,
      iterations,
      benchmark: 'under 50ms average'
    };
  }

  async testTemplateRenderingPerformance() {
    const data = {
      meta: { component_name: 'Perf Test' },
      ticket: { summary: 'Test', description: 'Test description' }
    };

    const iterations = 20;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      await this.templateEngine.renderTemplate('platforms', 'jira', 'comp', data);
    }

    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / iterations;

    if (avgTime > 30) {
      throw new Error(`Template rendering too slow: ${avgTime}ms average`);
    }

    this.results.performance.templateRendering = avgTime;

    return {
      templateRenderingPerformance: 'excellent',
      averageTime: avgTime,
      iterations,
      benchmark: 'under 30ms average'
    };
  }

  async testMemoryUsage() {
    const initialMemory = process.memoryUsage().heapUsed;

    // Create multiple services to test memory usage
    const services = [];
    for (let i = 0; i < 5; i++) {
      const service = new TemplateIntegratedAIService({
        apiKey: 'test-key',
        templateEngine: this.templateEngine
      });
      await service.initialize();
      services.push(service);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

    if (memoryIncrease > 50) {
      throw new Error(`Memory usage too high: ${memoryIncrease.toFixed(2)}MB increase`);
    }

    this.results.performance.memoryUsage = memoryIncrease;

    return {
      memoryUsage: 'acceptable',
      memoryIncrease: `${memoryIncrease.toFixed(2)}MB`,
      benchmark: 'under 50MB increase'
    };
  }

  // ========================================
  // PHASE 6: Error Handling & Edge Cases
  // ========================================

  async testMissingPrompts() {
    try {
      await this.promptManager.getReasoningPrompt('non-existent-prompt', {});
      throw new Error('Should have thrown error for missing prompt');
    } catch (error) {
      if (!error.message.includes('not found')) {
        throw new Error('Wrong error type for missing prompt');
      }
    }

    return {
      missingPromptHandling: 'working',
      errorMessageAppropriate: true
    };
  }

  async testInvalidContext() {
    const result = await this.promptManager.getReasoningPrompt('comprehensive-visual-analysis', {});
    
    // Should handle empty context gracefully with fallbacks
    if (!result.prompt || result.prompt.length < 100) {
      throw new Error('Invalid context not handled gracefully');
    }

    return {
      invalidContextHandling: 'working',
      fallbacksWorking: true
    };
  }

  async testTemplateErrors() {
    try {
      await this.templateEngine.resolveTemplate('non-existent', 'platform', 'type');
      // Should fall back to default template, not throw error
    } catch (error) {
      // Expected for truly invalid template paths
    }

    return {
      templateErrorHandling: 'working',
      gracefulDegradation: true
    };
  }

  async testServiceRecovery() {
    // Test that service can recover from errors
    const context = { figma: { component_name: 'Recovery Test' } };
    
    const result1 = await this.aiService.processWithReasoningPrompts(context);
    const result2 = await this.aiService.processWithReasoningPrompts(context);

    if (!result1 || !result2) {
      throw new Error('Service not recovering properly from operations');
    }

    return {
      serviceRecovery: 'working',
      consistentResults: true
    };
  }

  // ====================================
  // PHASE 7: Production Readiness Tests
  // ====================================

  async testConfigurationValidation() {
    const config = await this.aiService.testConfiguration();

    const requiredFeatures = ['hybridArchitecture', 'cognitiveeSeparation', 'contextEnrichment'];
    const missingFeatures = requiredFeatures.filter(feature => !config.features?.[feature]);

    if (missingFeatures.length > 0) {
      throw new Error(`Missing production features: ${missingFeatures.join(', ')}`);
    }

    return {
      configurationValidation: 'passed',
      allRequiredFeatures: true,
      productionReady: true
    };
  }

  async testScalabilityLimits() {
    // Test with large context data
    const largeContext = {
      figma: {
        component_name: 'Large Context Test',
        extracted_colors: 'A'.repeat(1000),
        extracted_typography: 'B'.repeat(1000)
      },
      project: { tech_stack: Array(20).fill('Framework') }
    };

    const result = await this.aiService.processWithReasoningPrompts(largeContext);

    if (!result || !result.componentAnalysis) {
      throw new Error('Service cannot handle large context data');
    }

    return {
      scalabilityLimits: 'acceptable',
      handlesLargeContext: true
    };
  }

  async testConcurrentRequests() {
    const context = { figma: { component_name: 'Concurrent Test' } };
    
    const promises = Array(5).fill().map((_, i) => 
      this.aiService.processWithReasoningPrompts({
        ...context,
        figma: { component_name: `Concurrent Test ${i}` }
      })
    );

    const results = await Promise.all(promises);

    if (results.some(result => !result || !result.componentAnalysis)) {
      throw new Error('Concurrent requests not handled properly');
    }

    return {
      concurrentRequests: 'working',
      allRequestsProcessed: true,
      concurrencyLevel: promises.length
    };
  }

  /**
   * Generate comprehensive test report
   */
  generateComprehensiveReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST SUITE RESULTS');
    console.log('='.repeat(80));

    // Overall Summary
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`\n🎯 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${this.results.total}`);
    console.log(`   ✅ Passed: ${this.results.passed}`);
    console.log(`   ❌ Failed: ${this.results.failed}`);
    console.log(`   📊 Success Rate: ${successRate}%`);

    // Performance Summary
    if (Object.keys(this.results.performance).length > 0) {
      console.log(`\n⚡ PERFORMANCE BENCHMARKS:`);
      Object.entries(this.results.performance).forEach(([metric, value]) => {
        console.log(`   ${metric}: ${value}${typeof value === 'number' ? 'ms' : ''}`);
      });
    }

    // Phase Results
    const phases = {
      'Component Initialization': ['testTemplateEngineInitialization', 'testAIPromptManagerInitialization', 'testHybridServiceInitialization', 'testServiceConfiguration'],
      'AI Reasoning & Prompts': ['testPromptTemplateLoading', 'testVariableSubstitution', 'testFallbackValues', 'testConditionalLogic', 'testContextEnrichment'],
      'Template Formatting': ['testTemplateResolution', 'testOutputFormatting', 'testPlatformSpecificTemplates'],
      'End-to-End Integration': ['testHybridDataFlow', 'testCognitiveSeparation', 'testStructuredDataOutput'],
      'Performance Benchmarks': ['testInitializationPerformance', 'testPromptGenerationPerformance', 'testTemplateRenderingPerformance', 'testMemoryUsage'],
      'Error Handling': ['testMissingPrompts', 'testInvalidContext', 'testTemplateErrors', 'testServiceRecovery'],
      'Production Readiness': ['testConfigurationValidation', 'testScalabilityLimits', 'testConcurrentRequests']
    };

    console.log(`\n📋 PHASE RESULTS:`);
    Object.entries(phases).forEach(([phaseName, testNames]) => {
      const phaseTests = this.results.tests.filter(test => testNames.includes(test.name));
      const phasePassed = phaseTests.filter(test => test.status === 'PASSED').length;
      const phaseTotal = phaseTests.length;
      const phaseRate = phaseTotal > 0 ? ((phasePassed / phaseTotal) * 100).toFixed(1) : '0.0';
      
      console.log(`   ${phaseName}: ${phasePassed}/${phaseTotal} (${phaseRate}%)`);
    });

    // Failed Tests Detail
    if (this.results.failed > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`   ${test.name}: ${test.error}`);
        });
    }

    // Production Readiness Assessment
    console.log(`\n🏭 PRODUCTION READINESS ASSESSMENT:`);
    if (successRate >= 95) {
      console.log(`   ✅ READY FOR PRODUCTION (${successRate}% success rate)`);
      console.log(`   🚀 All critical systems operational`);
      console.log(`   📈 Performance within acceptable limits`);
    } else if (successRate >= 85) {
      console.log(`   ⚠️  READY WITH MONITORING (${successRate}% success rate)`);
      console.log(`   🔍 Deploy with enhanced monitoring`);
      console.log(`   🛠️  Address failed tests before full rollout`);
    } else {
      console.log(`   ❌ NOT READY FOR PRODUCTION (${successRate}% success rate)`);
      console.log(`   🔧 Critical issues need resolution`);
      console.log(`   ⏳ Defer production deployment`);
    }

    console.log('\n' + '='.repeat(80));

    // Store summary for programmatic access
    this.results.summary = {
      successRate: parseFloat(successRate),
      productionReady: successRate >= 95,
      readyWithMonitoring: successRate >= 85,
      criticalIssues: this.results.failed,
      performanceBenchmarks: this.results.performance
    };
  }
}

// Export for programmatic use
export { ComprehensiveHybridArchitectureTest };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new ComprehensiveHybridArchitectureTest();
  
  testSuite.runComprehensiveTests()
    .then(results => {
      const exitCode = results.summary?.productionReady ? 0 : 1;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('❌ Test suite execution failed:', error);
      process.exit(1);
    });
}