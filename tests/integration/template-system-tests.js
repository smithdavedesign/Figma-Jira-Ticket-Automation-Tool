/**
 * Template System Integration Tests
 * 
 * Comprehensive testing for TemplateManager, YAML parsing,
 * Redis caching, error context, and fallback systems.
 * 
 * Updated: October 24, 2025 - Enhanced with error context testing
 */

import { TemplateManager } from '../../core/data/template-manager.js';
import { RedisClient } from '../../core/data/redis-client.js';
import { Logger } from '../../core/utils/logger.js';

const logger = new Logger('TemplateSystemTests');

class TemplateSystemTestSuite {
  constructor() {
    this.templateManager = new TemplateManager();
    this.redis = new RedisClient();
    this.results = [];
  }

  async runAllTests() {
    logger.info('🧪 Starting Template System Integration Tests...');
    
    const tests = [
      // Core functionality tests
      this.testTemplateManagerInitialization,
      this.testTemplateLoading,
      this.testTemplateGeneration,
      
      // YAML parsing tests
      this.testValidYamlParsing,
      this.testInvalidYamlHandling,
      this.testTemplateVariableSubstitution,
      
      // Redis caching tests
      this.testTemplateCaching,
      this.testCacheHitMiss,
      this.testCacheEviction,
      
      // Error context tests
      this.testErrorContextGeneration,
      this.testErrorContextCaching,
      this.testFallbackWithContext,
      
      // Template system specific tests
      this.testPlatformTemplateRouting,
      this.testDocumentTypeHandling,
      this.testTechStackIntegration,
      
      // Performance tests
      this.testCachingPerformance,
      this.testMemoryUsage,
      this.testConcurrentAccess
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const result = await test.call(this);
        const duration = Date.now() - startTime;
        
        this.results.push({
          name: test.name,
          status: result.success ? 'PASS' : 'FAIL',
          duration,
          message: result.message,
          details: result.details || {}
        });
        
        logger.info(`${result.success ? '✅' : '❌'} ${test.name} (${duration}ms)`);
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'ERROR',
          duration: 0,
          message: error.message,
          details: { stack: error.stack }
        });
        
        logger.error(`💥 ${test.name} - ${error.message}`);
      }
    }

    return this.generateTestReport();
  }

  // Core Functionality Tests
  async testTemplateManagerInitialization() {
    await this.templateManager.initialize();
    const isInitialized = this.templateManager.templateEngine !== null;
    
    return {
      success: isInitialized,
      message: isInitialized ? 'Template Manager initialized successfully' : 'Initialization failed',
      details: {
        templateEngine: !!this.templateManager.templateEngine,
        redisConnected: await this.redis.isConnected()
      }
    };
  }

  async testTemplateLoading() {
    try {
      const template = await this.templateManager.loadTemplate('github', 'component');
      
      return {
        success: !!template,
        message: `Loaded template: ${template?.name || 'unknown'}`,
        details: {
          hasContent: !!template?.content,
          contentLength: template?.content?.length || 0,
          platform: template?.platform,
          documentType: template?.documentType
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Template loading failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async testTemplateGeneration() {
    const context = {
      frameName: 'TestComponent',
      frameId: 'test-123',
      dimensions: { width: 200, height: 100 },
      figmaContext: { fileName: 'Test File' }
    };

    try {
      const ticket = await this.templateManager.generateTicket('github', 'component', context);
      
      return {
        success: !!ticket && ticket.length > 0,
        message: `Generated ticket: ${ticket?.length || 0} characters`,
        details: {
          containsFrameName: ticket?.includes('TestComponent'),
          containsEmoji: ticket?.includes('🐙'),
          hasStructure: ticket?.includes('##'),
          contextIntegrated: ticket?.includes('Test File')
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Template generation failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  // YAML Parsing Tests
  async testValidYamlParsing() {
    const validYaml = `
platform: github
documentType: component
template:
  title: "# 🐙 Issue: {{frameName}}"
  sections:
    - title: "Description"
      content: "Implement {{frameName}} component"
`;

    try {
      const parsed = await this.templateManager.parseYamlTemplate(validYaml);
      
      return {
        success: !!parsed && parsed.platform === 'github',
        message: 'Valid YAML parsed successfully',
        details: {
          platform: parsed?.platform,
          hasTemplate: !!parsed?.template,
          hasTitle: !!parsed?.template?.title
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `YAML parsing failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async testInvalidYamlHandling() {
    const invalidYaml = `
platform: github
documentType: component
template:
  title: "Unclosed quote
  sections:
    - title: "Test"
`;

    try {
      const result = await this.templateManager.parseYamlTemplate(invalidYaml);
      
      return {
        success: false,
        message: 'Invalid YAML should have failed',
        details: { unexpectedResult: result }
      };
    } catch (error) {
      // This should fail - success case
      return {
        success: true,
        message: 'Invalid YAML properly rejected',
        details: {
          errorMessage: error.message,
          hasLineNumber: error.message.includes('line'),
          errorType: error.constructor.name
        }
      };
    }
  }

  async testTemplateVariableSubstitution() {
    const template = {
      content: "# {{frameName}} - {{dimensions.width}}x{{dimensions.height}}"
    };
    
    const context = {
      frameName: 'TestButton',
      dimensions: { width: 120, height: 40 }
    };

    try {
      const result = await this.templateManager.substituteVariables(template.content, context);
      const expected = '# TestButton - 120x40';
      
      return {
        success: result === expected,
        message: `Variable substitution: ${result}`,
        details: {
          result,
          expected,
          matches: result === expected,
          hasFrameName: result.includes('TestButton'),
          hasDimensions: result.includes('120x40')
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Variable substitution failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  // Redis Caching Tests
  async testTemplateCaching() {
    const cacheKey = 'template:github:component:test';
    const templateData = { platform: 'github', content: 'test template' };

    try {
      // Clear cache first
      await this.redis.delete(cacheKey);
      
      // Cache template
      await this.templateManager.cacheTemplate(cacheKey, templateData);
      
      // Retrieve from cache
      const cached = await this.templateManager.getCachedTemplate(cacheKey);
      
      return {
        success: !!cached && cached.platform === 'github',
        message: 'Template caching works',
        details: {
          cached: !!cached,
          platformMatch: cached?.platform === 'github',
          contentMatch: cached?.content === 'test template'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Template caching failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async testCacheHitMiss() {
    const hitKey = 'template:test:hit';
    const missKey = 'template:test:miss';
    
    try {
      // Ensure hit exists
      await this.redis.set(hitKey, JSON.stringify({ test: 'data' }), 3600);
      
      // Test cache hit
      const hit = await this.templateManager.getCachedTemplate(hitKey);
      
      // Test cache miss
      const miss = await this.templateManager.getCachedTemplate(missKey);
      
      return {
        success: !!hit && !miss,
        message: `Cache hit: ${!!hit}, Cache miss: ${!miss}`,
        details: {
          hitSuccess: !!hit,
          missSuccess: !miss,
          hitData: hit,
          missData: miss
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Cache hit/miss test failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async testCacheEviction() {
    const shortTtlKey = 'template:test:eviction';
    
    try {
      // Cache with very short TTL (1 second)
      await this.redis.set(shortTtlKey, JSON.stringify({ test: 'eviction' }), 1);
      
      // Immediate retrieval should work
      const immediate = await this.redis.get(shortTtlKey);
      
      // Wait for eviction
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be evicted now
      const afterEviction = await this.redis.get(shortTtlKey);
      
      return {
        success: !!immediate && !afterEviction,
        message: 'Cache eviction works correctly',
        details: {
          immediateRetrieved: !!immediate,
          afterEvictionMissing: !afterEviction,
          evictionWorking: !!immediate && !afterEviction
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Cache eviction test failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  // Error Context Tests
  async testErrorContextGeneration() {
    try {
      // Simulate template error
      const errorContext = await this.templateManager.generateErrorContext({
        platform: 'nonexistent',
        templateType: 'invalid',
        contextKeys: ['frameName', 'dimensions'],
        error: new Error('Template not found')
      });
      
      return {
        success: !!errorContext && !!errorContext.debugId,
        message: 'Error context generated successfully',
        details: {
          hasDebugId: !!errorContext?.debugId,
          hasPlatform: errorContext?.platform === 'nonexistent',
          hasTimestamp: !!errorContext?.timestamp,
          hasErrorDetails: !!errorContext?.error
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error context generation failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async testErrorContextCaching() {
    const errorContext = {
      debugId: 'test-debug-123',
      platform: 'github',
      failure: 'template_loading',
      timestamp: new Date().toISOString()
    };

    try {
      // Cache error context
      await this.templateManager.cacheErrorContext(errorContext);
      
      // Retrieve error context
      const retrieved = await this.templateManager.getErrorContext('test-debug-123');
      
      return {
        success: !!retrieved && retrieved.debugId === 'test-debug-123',
        message: 'Error context caching works',
        details: {
          cached: !!retrieved,
          debugIdMatch: retrieved?.debugId === 'test-debug-123',
          platformMatch: retrieved?.platform === 'github'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error context caching failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async testFallbackWithContext() {
    try {
      // Generate fallback with error context
      const fallback = await this.templateManager.generateContextualFallback({
        frameName: 'TestComponent',
        platform: 'github',
        templateType: 'component',
        failure: 'template_loading',
        templateError: {
          message: 'YAML parsing failed',
          yamlLine: 5
        }
      });
      
      const hasDebugInfo = fallback.includes('Debug Context');
      const hasTemplateError = fallback.includes('Template System Error');
      const hasFrameName = fallback.includes('TestComponent');
      
      return {
        success: hasDebugInfo && hasTemplateError && hasFrameName,
        message: 'Contextual fallback generated successfully',
        details: {
          length: fallback.length,
          hasDebugInfo,
          hasTemplateError,
          hasFrameName,
          hasYamlLine: fallback.includes('YAML Line: 5')
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Fallback generation failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  // Platform/Template Routing Tests
  async testPlatformTemplateRouting() {
    const platforms = ['github', 'jira', 'linear', 'notion'];
    const results = {};

    try {
      for (const platform of platforms) {
        const template = await this.templateManager.getTemplateForPlatform(platform, 'component');
        results[platform] = {
          found: !!template,
          platform: template?.platform,
          hasContent: !!template?.content
        };
      }

      const allFound = Object.values(results).every(r => r.found);
      
      return {
        success: allFound,
        message: `Platform routing: ${Object.keys(results).filter(p => results[p].found).length}/${platforms.length} platforms`,
        details: results
      };
    } catch (error) {
      return {
        success: false,
        message: `Platform routing failed: ${error.message}`,
        details: { error: error.message, results }
      };
    }
  }

  // Performance Tests
  async testCachingPerformance() {
    const iterations = 100;
    const key = 'perf:test:template';
    const data = { content: 'performance test template' };

    try {
      // Warm up cache
      await this.redis.set(key, JSON.stringify(data), 3600);

      // Test cache performance
      const startTime = Date.now();
      for (let i = 0; i < iterations; i++) {
        await this.redis.get(key);
      }
      const duration = Date.now() - startTime;
      const avgTime = duration / iterations;

      return {
        success: avgTime < 10, // Should be under 10ms average
        message: `Cache performance: ${avgTime.toFixed(2)}ms average`,
        details: {
          iterations,
          totalTime: duration,
          averageTime: avgTime,
          performanceGood: avgTime < 10
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Performance test failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  generateTestReport() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    const total = this.results.length;
    const passRate = (passed / total * 100).toFixed(1);

    const report = {
      summary: {
        total,
        passed,
        failed,
        errors,
        passRate: `${passRate}%`,
        timestamp: new Date().toISOString()
      },
      results: this.results,
      recommendations: this.generateRecommendations()
    };

    logger.info(`📊 Template System Tests Complete: ${passed}/${total} passed (${passRate}%)`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.results.filter(r => r.status !== 'PASS');

    if (failedTests.length > 0) {
      recommendations.push('Review failed tests and fix underlying issues');
    }

    const performanceTests = this.results.filter(r => r.name.includes('Performance'));
    const slowTests = performanceTests.filter(r => r.duration > 1000);
    if (slowTests.length > 0) {
      recommendations.push('Optimize performance for slow operations');
    }

    if (recommendations.length === 0) {
      recommendations.push('All tests passing - system is healthy!');
    }

    return recommendations;
  }
}

// Export for use in other test files
export { TemplateSystemTestSuite };

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new TemplateSystemTestSuite();
  const report = await testSuite.runAllTests();
  console.log('\n📋 Final Report:');
  console.log(JSON.stringify(report, null, 2));
}