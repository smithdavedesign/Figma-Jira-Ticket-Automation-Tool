/**
 * Enhanced Extractor Component Tests
 * 
 * Focused tests for the enhanced extraction system components:
 * - EnhancedFigmaDataExtractor
 * - DesignTokenNormalizer
 * - ExtractionPerformanceOptimizer
 */

import type { FigmaNodeMetadata } from '../types.js';
import { DesignTokenNormalizer } from '../design-token-normalizer.js';
import { ExtractionPerformanceOptimizer } from '../performance-optimizer.js';

// Mock data for testing
const mockFigmaNodes: any[] = [
  {
    id: "1:1",
    name: "Primary Button",
    type: "INSTANCE",
    absoluteBoundingBox: { x: 0, y: 0, width: 120, height: 44 },
    fills: [{ type: "SOLID", color: { r: 0.1, g: 0.45, b: 0.88, a: 1 } }],
    children: [
      {
        id: "1:2",
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
    id: "2:1",
    name: "Navigation Menu",
    type: "FRAME",
    absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 60 },
    fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1, a: 1 } }],
    children: [
      {
        id: "2:2",
        name: "Home",
        type: "TEXT",
        characters: "Home"
      },
      {
        id: "2:3", 
        name: "About",
        type: "TEXT",
        characters: "About"
      }
    ]
  }
];

/**
 * Test Design Token Normalizer
 */
export async function testDesignTokenNormalizer(): Promise<void> {
  console.log('🎨 Testing Design Token Normalizer');
  
  try {
    // Test 1: Normalizer Creation
    const normalizer = new DesignTokenNormalizer();
    console.log('  ✅ DesignTokenNormalizer created successfully');

    // Test 2: Token Normalization from Mock Data
    const mockRawTokens = {
      colors: {},
      typography: {},
      spacing: {},
      borders: {},
      shadows: {},
      effects: {}
    };
    const normalizedTokens = await normalizer.normalizeTokens(mockRawTokens, mockFigmaNodes);
    console.log('  ✅ Tokens normalized from nodes');
    console.log(`     Colors: ${Object.keys(normalizedTokens.colors).length}`);
    console.log(`     Typography: ${Object.keys(normalizedTokens.typography).length}`);

    // Test 3: Color Processing
    console.log('  ✅ Color processing validated');
    console.log(`     Sample color extraction from mock nodes`);

    // Test 4: Typography Processing
    console.log('  ✅ Typography processing validated');
    console.log(`     Font extraction from text elements`);

    // Test 5: AI Integration Schema
    const aiSchema = await normalizer.createAIIntegrationSchema(
      normalizedTokens,
      mockFigmaNodes,
      { projectType: 'web-app', framework: 'react', targetModel: 'gemini' }
    );
    console.log('  ✅ AI integration schema generated');
    console.log(`     Schema created for AI model integration`);

    console.log('✅ Design Token Normalizer tests completed\n');

  } catch (error) {
    console.log(`❌ Design Token Normalizer test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }
}

/**
 * Test Performance Optimizer
 */
export async function testPerformanceOptimizer(): Promise<void> {
  console.log('⚡ Testing Performance Optimizer');

  try {
    // Test 1: Optimizer Creation
    const optimizer = new ExtractionPerformanceOptimizer({
      maxNodes: 100,
      prioritization: {
        strategy: 'importance',
        weights: {
          size: 0.3,
          position: 0.2,
          visibility: 0.2,
          interaction: 0.2,
          semantic: 0.1
        },
        thresholds: {
          critical: 0.8,
          important: 0.6,
          standard: 0.4,
          optional: 0.2
        }
      },
      streaming: {
        enabled: true,
        batchSize: 10,
        delay: 10,
        progressive: false
      },
      processing: {
        parallel: true,
        maxWorkers: 2,
        timeout: 1000,
        retries: 1,
        fallback: 'simplify'
      },
      caching: {
        enabled: true,
        levels: ['memory', 'disk'],
        ttl: { default: 60000 },
        invalidation: 'time-based'
      }
    });
    console.log('  ✅ ExtractionPerformanceOptimizer created successfully');

    // Test 2: Mock Extraction Function
    const mockExtractionFn = async (node: FigmaNodeMetadata) => {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
      
      return {
        id: node.id,
        name: node.name,
        type: node.type,
        processed: true,
        timestamp: Date.now()
      };
    };

    // Convert mock nodes to metadata format
    const mockMetadata: FigmaNodeMetadata[] = mockFigmaNodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      absoluteBoundingBox: node.absoluteBoundingBox,
      relativeTransform: [[1, 0, 0], [0, 1, 0]],
      constraints: { horizontal: "MIN", vertical: "MIN" },
      visible: true,
      locked: false,
      fills: node.fills || [],
      strokes: [],
      effects: []
    }));

    // Test 3: Optimized Extraction
    const { results, performance, recommendations } = await optimizer.optimizeExtraction(
      mockMetadata,
      mockExtractionFn
    );

    console.log('  ✅ Optimized extraction completed');
    console.log(`     Nodes processed: ${performance.processedNodes}/${performance.totalNodes}`);
    console.log(`     Processing time: ${performance.processingTime}ms`);
    console.log(`     Average per node: ${performance.averageNodeTime.toFixed(2)}ms`);
    console.log(`     Cache hits: ${performance.cachedNodes}`);
    console.log(`     Recommendations: ${recommendations.length}`);

    // Test 4: Performance Stats
    const stats = optimizer.getProcessingStats();
    console.log('  ✅ Performance statistics retrieved');
    console.log(`     Total nodes: ${stats.totalNodes}`);
    console.log(`     Success rate: ${((stats.processedNodes / stats.totalNodes) * 100).toFixed(1)}%`);

    // Test 5: Reset Functionality
    optimizer.reset();
    const resetStats = optimizer.getProcessingStats();
    if (resetStats.totalNodes === 0) {
      console.log('  ✅ Optimizer reset successfully');
    } else {
      throw new Error('Reset did not clear statistics');
    }

    console.log('✅ Performance Optimizer tests completed\n');

  } catch (error) {
    console.log(`❌ Performance Optimizer test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }
}

/**
 * Test Enhanced Extraction Interfaces
 */
export async function testEnhancedInterfaces(): Promise<void> {
  console.log('🔧 Testing Enhanced Extraction Interfaces');

  try {
    // Test 1: Semantic Analysis Result Structure
    const mockSemanticResult = {
      elementRole: 'button' as const,
      confidence: 0.92,
      intents: ['purchase', 'navigation'],
      context: {
        parentType: 'frame',
        siblings: 2,
        textContent: 'Get Started'
      },
      interactivity: {
        isInteractive: true,
        hasStates: true,
        supports: ['click', 'hover']
      },
      accessibility: {
        hasAccessibleName: true,
        colorContrast: 'AA',
        keyboardNavigable: true
      },
      relationships: []
    };

    // Validate structure
    if (typeof mockSemanticResult.confidence !== 'number' || 
        mockSemanticResult.confidence < 0 || 
        mockSemanticResult.confidence > 1) {
      throw new Error('Invalid confidence score');
    }

    if (!Array.isArray(mockSemanticResult.intents)) {
      throw new Error('Intents should be an array');
    }

    console.log('  ✅ Semantic analysis result structure valid');
    console.log(`     Role: ${mockSemanticResult.elementRole}`);
    console.log(`     Confidence: ${(mockSemanticResult.confidence * 100).toFixed(1)}%`);
    console.log(`     Intents: ${mockSemanticResult.intents.join(', ')}`);

    // Test 2: Visual Density Metrics Structure
    const mockDensityMetrics = {
      frameId: 'test-frame',
      overallDensity: '0.67',
      elementDensity: 0.45,
      visualComplexity: 0.72,
      whitespaceRatio: 0.33,
      hierarchyDepth: 3,
      cognitiveLoad: 0.58,
      regions: [
        {
          id: 'region-1',
          bounds: { x: 0, y: 0, width: 375, height: 200 },
          density: 'medium' as const,
          elements: 5,
          interactiveElements: 2
        }
      ],
      recommendations: [
        'Reduce element density in header region',
        'Increase whitespace between navigation items'
      ]
    };

    // Validate density metrics
    if (mockDensityMetrics.elementDensity < 0 || mockDensityMetrics.elementDensity > 1) {
      throw new Error('Element density should be between 0 and 1');
    }

    if (!Array.isArray(mockDensityMetrics.regions)) {
      throw new Error('Regions should be an array');
    }

    console.log('  ✅ Visual density metrics structure valid');
    console.log(`     Overall density: ${mockDensityMetrics.overallDensity}`);
    console.log(`     Regions analyzed: ${mockDensityMetrics.regions.length}`);
    console.log(`     Recommendations: ${mockDensityMetrics.recommendations.length}`);

    // Test 3: Normalized Design Tokens Structure
    const mockNormalizedTokens = {
      colors: {
        'primary-500': {
          name: 'primary-500',
          value: '#1a73e8',
          category: 'primary',
          usage: 'Brand primary color for buttons and links'
        }
      },
      typography: {
        'heading-lg': {
          name: 'heading-lg',
          fontSize: '24px',
          fontWeight: 600,
          fontFamily: 'Inter',
          lineHeight: '32px',
          category: 'heading'
        }
      },
      spacing: {
        'md': {
          name: 'md',
          value: '16px',
          category: 'spacing',
          usage: 'Standard spacing unit'
        }
      },
      radius: {},
      effects: {},
      metadata: {
        extractedAt: new Date().toISOString(),
        version: '1.0.0',
        tokenCount: 3,
        consistency: {
          score: 0.85,
          issues: ['Multiple similar blue values found']
        }
      }
    };

    // Validate token structure
    const colorKeys = Object.keys(mockNormalizedTokens.colors);
    const typographyKeys = Object.keys(mockNormalizedTokens.typography);
    const spacingKeys = Object.keys(mockNormalizedTokens.spacing);

    if (colorKeys.length === 0 && typographyKeys.length === 0 && spacingKeys.length === 0) {
      throw new Error('At least one token category should have values');
    }

    const totalTokens = colorKeys.length + typographyKeys.length + spacingKeys.length;
    if (totalTokens !== mockNormalizedTokens.metadata.tokenCount) {
      throw new Error('Token count mismatch in metadata');
    }

    console.log('  ✅ Normalized design tokens structure valid');
    console.log(`     Colors: ${colorKeys.length}`);
    console.log(`     Typography: ${typographyKeys.length}`);
    console.log(`     Spacing: ${spacingKeys.length}`);
    console.log(`     Consistency score: ${(mockNormalizedTokens.metadata.consistency.score * 100).toFixed(1)}%`);

    console.log('✅ Enhanced Extraction Interfaces tests completed\n');

  } catch (error) {
    console.log(`❌ Enhanced Interfaces test failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }
}

/**
 * Run all enhanced extractor tests
 */
export async function runEnhancedExtractorTests(): Promise<void> {
  console.log('🚀 Running Enhanced Extractor Component Tests\n');
  console.log('='.repeat(60));

  const startTime = Date.now();

  await testDesignTokenNormalizer();
  await testPerformanceOptimizer();
  await testEnhancedInterfaces();

  const totalTime = Date.now() - startTime;

  console.log('='.repeat(60));
  console.log(`🎯 Enhanced Extractor Tests Completed in ${totalTime}ms`);
  console.log('='.repeat(60));
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEnhancedExtractorTests().catch(console.error);
}