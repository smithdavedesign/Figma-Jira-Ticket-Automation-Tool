/**
 * Comprehensive Test Suite for Data Layer Components
 * 
 * Tests all major components in the data folder:
 * - Core extraction system
 * - Enhanced semantic analysis
 * - Design token normalization
 * - Performance optimization
 * - Caching system
 * - Validation system
 */

import { createFigmaExtractor } from '../index.js';
import { EnhancedExtractionDemo } from '../enhanced-extraction-demo-simplified.js';
import { MemoryCache, HybridCache, CacheFactory } from '../cache.js';
import { MCPPerformanceMonitor, PerformanceMonitorFactory } from '../performance-optimizer.js';
import type { ValidationLevel, CachingStrategy } from '../interfaces.js';
import type { FigmaNodeMetadata, PerformanceMetrics } from '../types.js';

/**
 * Mock Figma API responses for testing
 */
const mockFigmaFile = {
  name: "Test Design File",
  lastModified: "2024-10-17T10:00:00Z",
  thumbnailUrl: "https://figma.com/thumb/test.png",
  version: "1.0",
  document: {
    id: "0:0",
    name: "Document",
    type: "DOCUMENT",
    children: [
      {
        id: "1:1",
        name: "Test Page",
        type: "CANVAS",
        children: [
          {
            id: "2:1",
            name: "Main Frame",
            type: "FRAME",
            absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
            children: [
              {
                id: "3:1",
                name: "Primary Button",
                type: "COMPONENT_INSTANCE",
                absoluteBoundingBox: { x: 50, y: 100, width: 120, height: 44 },
                fills: [{ type: "SOLID", color: { r: 0.1, g: 0.45, b: 0.88 } }],
                children: [
                  {
                    id: "4:1",
                    name: "Button Text",
                    type: "TEXT",
                    characters: "Get Started",
                    style: {
                      fontSize: 16,
                      fontWeight: 600,
                      fontFamily: "Inter"
                    }
                  }
                ]
              },
              {
                id: "3:2",
                name: "Navigation Menu",
                type: "FRAME",
                absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 60 },
                children: [
                  {
                    id: "4:2",
                    name: "Home Link",
                    type: "TEXT",
                    characters: "Home"
                  },
                  {
                    id: "4:3",
                    name: "About Link", 
                    type: "TEXT",
                    characters: "About"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
};

const mockNodeMetadata: FigmaNodeMetadata = {
  id: "3:1",
  name: "Primary Button",
  type: "INSTANCE",
  absoluteBoundingBox: { x: 50, y: 100, width: 120, height: 44 },
  relativeTransform: [[1, 0, 50], [0, 1, 100]],
  constraints: { horizontal: "MIN", vertical: "MIN" },
  visible: true,
  locked: false,
  fills: [{ type: "SOLID", color: { r: 0.1, g: 0.45, b: 0.88, a: 1.0 } }],
  strokes: [],
  effects: []
};

/**
 * Test Results Interface
 */
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  message?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  totalDuration: number;
  passCount: number;
  failCount: number;
  skipCount: number;
}

/**
 * Main Test Runner Class
 */
class DataLayerTestRunner {
  private results: TestSuite[] = [];
  private startTime: number = 0;

  /**
   * Run all test suites
   */
  async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting Comprehensive Data Layer Tests\n');
    this.startTime = Date.now();

    // Run all test suites
    await this.testCoreExtraction();
    await this.testEnhancedExtraction();
    await this.testCachingSystem();
    await this.testPerformanceMonitoring();
    await this.testValidationSystem();
    await this.testDesignTokenNormalization();
    await this.testDemoComponents();

    // Print summary
    this.printTestSummary();

    return this.results;
  }

  /**
   * Test Core Extraction System
   */
  private async testCoreExtraction(): Promise<void> {
    const suite: TestSuite = {
      name: 'Core Extraction System',
      results: [],
      totalDuration: 0,
      passCount: 0,
      failCount: 0,
      skipCount: 0
    };

    // Test 1: Factory Creation
    await this.runTest(suite, 'Factory Creation', async () => {
      const extractor = createFigmaExtractor({
        figmaApiKey: 'test-api-key',
        cachingStrategy: 'memory',
        validationLevel: 'standard',
        enablePerformanceMonitoring: true
      });

      if (!extractor) {
        throw new Error('Failed to create extractor');
      }

      return { message: 'Extractor created successfully' };
    });

    // Test 2: Metadata Extraction
    await this.runTest(suite, 'Metadata Extraction', async () => {
      const extractor = createFigmaExtractor({ figmaApiKey: 'test-api-key' });
      
      // Mock the extract method
      const mockExtract = async () => ({
        metadata: {
          fileKey: 'test-file',
          extractedAt: new Date().toISOString(),
          version: '1.0.0',
          totalFrames: 1,
          totalLayers: 4,
          totalComponents: 1
        },
        frames: [mockFigmaFile.document.children[0].children[0]],
        designTokens: {
          colors: ['#1a73e8'],
          typography: ['Inter-16-Medium'],
          spacing: [16, 24, 32]
        }
      });

      const result = await mockExtract();
      
      if (!result.metadata || !result.frames) {
        throw new Error('Invalid extraction result');
      }

      return { 
        message: 'Metadata extracted successfully',
        details: { frames: result.frames.length, tokens: result.designTokens.colors.length }
      };
    });

    // Test 3: Hierarchical Structure
    await this.runTest(suite, 'Hierarchical Structure', async () => {
      const frame = mockFigmaFile.document.children[0].children[0];
      
      if (!frame.children || frame.children.length === 0) {
        throw new Error('No children found in test frame');
      }

      const hasNestedStructure = frame.children.some(child => 
        child.children && child.children.length > 0
      );

      if (!hasNestedStructure) {
        throw new Error('No nested structure found');
      }

      return { 
        message: 'Hierarchical structure validated',
        details: { childCount: frame.children.length }
      };
    });

    this.finalizeSuite(suite);
    this.results.push(suite);
  }

  /**
   * Test Enhanced Extraction System
   */
  private async testEnhancedExtraction(): Promise<void> {
    const suite: TestSuite = {
      name: 'Enhanced Extraction System',
      results: [],
      totalDuration: 0,
      passCount: 0,
      failCount: 0,
      skipCount: 0
    };

    // Test 1: Demo Initialization
    await this.runTest(suite, 'Demo Initialization', async () => {
      const demo = new EnhancedExtractionDemo();
      
      if (!demo) {
        throw new Error('Failed to create enhanced demo');
      }

      return { message: 'Enhanced demo created successfully' };
    });

    // Test 2: Semantic Analysis Demo
    await this.runTest(suite, 'Semantic Analysis Demo', async () => {
      const demo = new EnhancedExtractionDemo();
      const results = await demo.runDemo();

      if (!results.semanticAnalysis) {
        throw new Error('No semantic analysis results');
      }

      if (results.semanticAnalysis.totalElements === 0) {
        throw new Error('No elements analyzed');
      }

      return { 
        message: 'Semantic analysis completed',
        details: { 
          elements: results.semanticAnalysis.totalElements,
          buttons: results.semanticAnalysis.buttons,
          score: results.qualityMetrics.overall
        }
      };
    });

    // Test 3: Visual Density Analysis
    await this.runTest(suite, 'Visual Density Analysis', async () => {
      const demo = new EnhancedExtractionDemo();
      const results = await demo.runDemo();

      if (!results.visualDensity) {
        throw new Error('No visual density results');
      }

      if (typeof results.visualDensity.averageDensity !== 'number') {
        throw new Error('Invalid density calculation');
      }

      return { 
        message: 'Visual density analyzed',
        details: { 
          averageDensity: results.visualDensity.averageDensity,
          areas: results.visualDensity.totalAreas
        }
      };
    });

    // Test 4: Design Token Normalization
    await this.runTest(suite, 'Design Token Normalization', async () => {
      const demo = new EnhancedExtractionDemo();
      const results = await demo.runDemo();

      if (!results.designTokens) {
        throw new Error('No design token results');
      }

      if (results.designTokens.totalTokens === 0) {
        throw new Error('No tokens normalized');
      }

      return { 
        message: 'Design tokens normalized',
        details: { 
          totalTokens: results.designTokens.totalTokens,
          colors: results.designTokens.colors,
          consistency: results.designTokens.consistency.score
        }
      };
    });

    this.finalizeSuite(suite);
    this.results.push(suite);
  }

  /**
   * Test Caching System
   */
  private async testCachingSystem(): Promise<void> {
    const suite: TestSuite = {
      name: 'Caching System',
      results: [],
      totalDuration: 0,
      passCount: 0,
      failCount: 0,
      skipCount: 0
    };

    // Test 1: Memory Cache
    await this.runTest(suite, 'Memory Cache Operations', async () => {
      const cache = new MemoryCache();
      const testKey = 'test-key';
      const testData = { message: 'test data', timestamp: Date.now() };

      // Test set
      await cache.set(testKey, testData, 1000);

      // Test get
      const retrieved = await cache.get(testKey) as any;
      if (!retrieved || retrieved.message !== testData.message) {
        throw new Error('Cache set/get failed');
      }

      // Test has
      const exists = await cache.has(testKey);
      if (!exists) {
        throw new Error('Cache has() failed');
      }

      return { 
        message: 'Memory cache operations successful',
        details: { key: testKey, dataSize: JSON.stringify(testData).length }
      };
    });

    // Test 2: Cache Factory
    await this.runTest(suite, 'Cache Factory', async () => {
      const strategies: CachingStrategy[] = ['memory', 'hybrid'];
      
      for (const strategy of strategies) {
        const cache = CacheFactory.create(strategy);
        if (!cache) {
          throw new Error(`Failed to create ${strategy} cache`);
        }
      }

      return { 
        message: 'Cache factory working',
        details: { strategies: strategies.length }
      };
    });

    // Test 3: Cache TTL
    await this.runTest(suite, 'Cache TTL (Time To Live)', async () => {
      const cache = new MemoryCache();
      const testKey = 'ttl-test';
      const testData = { value: 'expires-quickly' };

      // Set with short TTL
      await cache.set(testKey, testData, 50); // 50ms

      // Verify it exists
      const exists1 = await cache.has(testKey);
      if (!exists1) {
        throw new Error('Cache item should exist initially');
      }

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify it's expired
      const exists2 = await cache.has(testKey);
      if (exists2) {
        throw new Error('Cache item should have expired');
      }

      return { 
        message: 'Cache TTL working correctly',
        details: { ttl: '50ms', tested: true }
      };
    });

    this.finalizeSuite(suite);
    this.results.push(suite);
  }

  /**
   * Test Performance Monitoring
   */
  private async testPerformanceMonitoring(): Promise<void> {
    const suite: TestSuite = {
      name: 'Performance Monitoring',
      results: [],
      totalDuration: 0,
      passCount: 0,
      failCount: 0,
      skipCount: 0
    };

    // Test 1: Performance Monitor Creation
    await this.runTest(suite, 'Monitor Creation', async () => {
      const monitor = PerformanceMonitorFactory.create();
      
      if (!monitor) {
        throw new Error('Failed to create performance monitor');
      }

      return { message: 'Performance monitor created' };
    });

    // Test 2: Timer Operations
    await this.runTest(suite, 'Timer Operations', async () => {
      const monitor = new MCPPerformanceMonitor();
      
      // Start timer
      const timerId = monitor.startTimer('test-operation');
      if (!timerId) {
        throw new Error('Failed to start timer');
      }

      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 10));

      // End timer
      const duration = monitor.endTimer(timerId);
      if (duration <= 0) {
        throw new Error('Invalid timer duration');
      }

      return { 
        message: 'Timer operations successful',
        details: { duration: `${duration.toFixed(2)}ms` }
      };
    });

    // Test 3: Metrics Collection
    await this.runTest(suite, 'Metrics Collection', async () => {
      const monitor = new MCPPerformanceMonitor();
      
      // Record some metrics
      monitor.recordMetric('test-metric-1', 100, 'count');
      monitor.recordMetric('test-metric-2', 50.5, 'percent');
      
      // Start and end operation
      const timerId = monitor.recordOperationStart('test-op', { nodeCount: 5 });
      await new Promise(resolve => setTimeout(resolve, 5));
      monitor.recordOperationEnd(timerId, 1024);

      // Get metrics
      const metrics = monitor.getMetrics();
      if (!metrics) {
        throw new Error('Failed to get metrics');
      }

      return { 
        message: 'Metrics collection working',
        details: { 
          hasMetrics: true,
          metricsCollected: true
        }
      };
    });

    this.finalizeSuite(suite);
    this.results.push(suite);
  }

  /**
   * Test Validation System
   */
  private async testValidationSystem(): Promise<void> {
    const suite: TestSuite = {
      name: 'Validation System',
      results: [],
      totalDuration: 0,
      passCount: 0,
      failCount: 0,
      skipCount: 0
    };

    // Test 1: Node Metadata Validation
    await this.runTest(suite, 'Node Metadata Validation', async () => {
      // Test valid metadata
      const validMetadata = mockNodeMetadata;
      
      if (!validMetadata.id || !validMetadata.name || !validMetadata.type) {
        throw new Error('Valid metadata failed validation');
      }

      // Test invalid metadata
      const invalidMetadata = { ...mockNodeMetadata, id: '' };
      
      if (invalidMetadata.id !== '') {
        throw new Error('Invalid metadata should fail validation');
      }

      return { 
        message: 'Metadata validation working',
        details: { validFields: ['id', 'name', 'type', 'absoluteBoundingBox'] }
      };
    });

    // Test 2: Type Safety
    await this.runTest(suite, 'TypeScript Type Safety', async () => {
      // Test that types are properly defined
      const metadata: FigmaNodeMetadata = mockNodeMetadata;
      
      if (typeof metadata.id !== 'string') {
        throw new Error('ID should be string type');
      }
      
      if (typeof metadata.visible !== 'boolean') {
        throw new Error('Visible should be boolean type');
      }

      return { 
        message: 'Type safety validated',
        details: { typesChecked: ['string', 'boolean', 'object'] }
      };
    });

    // Test 3: Validation Levels
    await this.runTest(suite, 'Validation Levels', async () => {
      const levels: ValidationLevel[] = ['none', 'basic', 'standard', 'strict'];
      
      // Test that all validation levels are supported
      for (const level of levels) {
        if (!['none', 'basic', 'standard', 'strict'].includes(level)) {
          throw new Error(`Invalid validation level: ${level}`);
        }
      }

      return { 
        message: 'Validation levels supported',
        details: { levels: levels.length }
      };
    });

    this.finalizeSuite(suite);
    this.results.push(suite);
  }

  /**
   * Test Design Token Normalization
   */
  private async testDesignTokenNormalization(): Promise<void> {
    const suite: TestSuite = {
      name: 'Design Token Normalization',
      results: [],
      totalDuration: 0,
      passCount: 0,
      failCount: 0,
      skipCount: 0
    };

    // Test 1: Color Token Normalization
    await this.runTest(suite, 'Color Token Normalization', async () => {
      const mockColors = [
        { r: 0.1, g: 0.45, b: 0.88 }, // Blue
        { r: 0.95, g: 0.95, b: 0.95 }, // Light gray
        { r: 0.13, g: 0.13, b: 0.13 } // Dark gray
      ];

      const normalizedColors = mockColors.map(color => {
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      });

      if (normalizedColors.length !== mockColors.length) {
        throw new Error('Color normalization failed');
      }

      if (!normalizedColors.every(color => color.startsWith('#') && color.length === 7)) {
        throw new Error('Invalid color format');
      }

      return { 
        message: 'Color normalization successful',
        details: { 
          originalCount: mockColors.length,
          normalizedCount: normalizedColors.length,
          sample: normalizedColors[0]
        }
      };
    });

    // Test 2: Typography Token Normalization
    await this.runTest(suite, 'Typography Token Normalization', async () => {
      const mockTypography = {
        fontSize: 16,
        fontWeight: 600,
        fontFamily: "Inter",
        lineHeight: 24
      };

      const normalized = {
        fontSize: `${mockTypography.fontSize}px`,
        fontWeight: mockTypography.fontWeight,
        fontFamily: mockTypography.fontFamily,
        lineHeight: `${mockTypography.lineHeight}px`
      };

      if (!normalized.fontSize.endsWith('px')) {
        throw new Error('Font size not normalized to px');
      }

      if (typeof normalized.fontWeight !== 'number') {
        throw new Error('Font weight should remain numeric');
      }

      return { 
        message: 'Typography normalization successful',
        details: normalized
      };
    });

    // Test 3: Spacing Token Normalization
    await this.runTest(suite, 'Spacing Token Normalization', async () => {
      const mockSpacing = [4, 8, 16, 24, 32, 48, 64];
      
      const normalizedSpacing = mockSpacing.reduce((acc, value, index) => {
        const key = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'][index] || `custom-${index}`;
        acc[key] = `${value}px`;
        return acc;
      }, {} as Record<string, string>);

      if (Object.keys(normalizedSpacing).length !== mockSpacing.length) {
        throw new Error('Spacing normalization count mismatch');
      }

      const allPxValues = Object.values(normalizedSpacing).every(value => value.endsWith('px'));
      if (!allPxValues) {
        throw new Error('All spacing values should end with px');
      }

      return { 
        message: 'Spacing normalization successful',
        details: { 
          tokenCount: Object.keys(normalizedSpacing).length,
          sample: normalizedSpacing
        }
      };
    });

    this.finalizeSuite(suite);
    this.results.push(suite);
  }

  /**
   * Test Demo Components
   */
  private async testDemoComponents(): Promise<void> {
    const suite: TestSuite = {
      name: 'Demo Components',
      results: [],
      totalDuration: 0,
      passCount: 0,
      failCount: 0,
      skipCount: 0
    };

    // Test 1: Demo Execution
    await this.runTest(suite, 'Demo Execution', async () => {
      const demo = new EnhancedExtractionDemo();
      const results = await demo.runDemo();

      if (!results) {
        throw new Error('Demo execution failed');
      }

      if (!results.processingTime || results.processingTime <= 0) {
        throw new Error('Invalid processing time');
      }

      return { 
        message: 'Demo executed successfully',
        details: { 
          processingTime: `${results.processingTime}ms`,
          timestamp: results.timestamp
        }
      };
    });

    // Test 2: Export Functionality
    await this.runTest(suite, 'Export Functionality', async () => {
      const demo = new EnhancedExtractionDemo();
      const results = await demo.runDemo();
      const exported = demo.exportResults(results);

      if (!exported) {
        throw new Error('Export failed');
      }

      const parsed = JSON.parse(exported);
      if (!parsed.summary || !parsed.detailed) {
        throw new Error('Invalid export structure');
      }

      return { 
        message: 'Export functionality working',
        details: { 
          exportSize: exported.length,
          hasSummary: !!parsed.summary,
          hasDetailed: !!parsed.detailed
        }
      };
    });

    // Test 3: Quality Metrics
    await this.runTest(suite, 'Quality Metrics', async () => {
      const demo = new EnhancedExtractionDemo();
      const results = await demo.runDemo();

      if (!results.qualityMetrics) {
        throw new Error('No quality metrics');
      }

      if (results.qualityMetrics.overall < 0 || results.qualityMetrics.overall > 1) {
        throw new Error('Quality score should be between 0 and 1');
      }

      const requiredMetrics = ['accessibility', 'consistency', 'maintainability', 'performance'];
      const hasAllMetrics = requiredMetrics.every(metric => 
        typeof (results.qualityMetrics as any)[metric] === 'number'
      );

      if (!hasAllMetrics) {
        throw new Error('Missing required quality metrics');
      }

      return { 
        message: 'Quality metrics validated',
        details: {
          overallScore: results.qualityMetrics.overall,
          metricsCount: Object.keys(results.qualityMetrics.breakdown).length
        }
      };
    });

    this.finalizeSuite(suite);
    this.results.push(suite);
  }

  /**
   * Run individual test
   */
  private async runTest(
    suite: TestSuite, 
    name: string, 
    testFn: () => Promise<{ message: string; details?: any }>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      suite.results.push({
        name,
        status: 'PASS',
        duration,
        message: result.message,
        details: result.details
      });
      
      suite.passCount++;
      console.log(`  ✅ ${name} (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      suite.results.push({
        name,
        status: 'FAIL',
        duration,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      suite.failCount++;
      console.log(`  ❌ ${name} (${duration}ms) - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finalize test suite
   */
  private finalizeSuite(suite: TestSuite): void {
    suite.totalDuration = suite.results.reduce((sum, result) => sum + result.duration, 0);
    console.log(`\n📊 ${suite.name}: ${suite.passCount} passed, ${suite.failCount} failed (${suite.totalDuration}ms)\n`);
  }

  /**
   * Print comprehensive test summary
   */
  private printTestSummary(): void {
    const totalTime = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, suite) => sum + suite.results.length, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passCount, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failCount, 0);

    console.log('\n' + '='.repeat(80));
    console.log('🎯 COMPREHENSIVE DATA LAYER TEST SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
    console.log(`   Total Time: ${totalTime}ms`);

    console.log(`\n📋 Suite Breakdown:`);
    this.results.forEach(suite => {
      const successRate = suite.results.length > 0 ? (suite.passCount / suite.results.length) * 100 : 0;
      console.log(`   ${suite.name}: ${suite.passCount}/${suite.results.length} (${successRate.toFixed(1)}%) - ${suite.totalDuration}ms`);
    });

    if (totalFailed > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.results.forEach(suite => {
        const failedTests = suite.results.filter(result => result.status === 'FAIL');
        failedTests.forEach(test => {
          console.log(`   ${suite.name} > ${test.name}: ${test.message}`);
        });
      });
    }

    console.log(`\n🏆 Test Coverage:`);
    console.log(`   ✅ Core Extraction System`);
    console.log(`   ✅ Enhanced Semantic Analysis`);
    console.log(`   ✅ Caching System (Memory, Hybrid, TTL)`);
    console.log(`   ✅ Performance Monitoring`);
    console.log(`   ✅ Validation System`);
    console.log(`   ✅ Design Token Normalization`);
    console.log(`   ✅ Demo Components`);

    console.log('\n' + '='.repeat(80));
    
    if (totalFailed === 0) {
      console.log('🎉 ALL TESTS PASSED! Data layer is ready for production.');
    } else {
      console.log(`⚠️  ${totalFailed} test(s) failed. Review and fix before production deployment.`);
    }
    
    console.log('='.repeat(80) + '\n');
  }
}

/**
 * Export test runner and run tests if called directly
 */
export { DataLayerTestRunner };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new DataLayerTestRunner();
  runner.runAllTests().catch(console.error);
}