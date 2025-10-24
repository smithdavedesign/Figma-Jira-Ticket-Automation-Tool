/**
 * 🧪 Pipeline Validation Test Runner
 * 
 * Demonstrates and validates the complete Design Intelligence Pipeline
 * with sample test data and comprehensive reporting.
 */

import { 
  EndToEndPipelineValidator,
  ValidationConfig,
  ValidationResult,
  createPipelineValidator,
  runPipelineValidation
} from './end-to-end-validator.js';
import { DesignSpecValidator } from '../design-intelligence/validators/design-spec-validator.js';
import { FigmaMCPConverter } from '../design-intelligence/generators/figma-mcp-converter.js';
import { AIOrchestrator } from '../ai-orchestrator/orchestrator.js';
import { ReactComponentMCPAdapter } from '../design-intelligence/adapters/react-mcp-adapter.js';

interface TestSuite {
  name: string;
  description: string;
  testData: Array<{
    name: string;
    figmaData: {
      frames: any[];
      context: any;
    };
    expectedOutput?: any;
  }>;
  config?: Partial<ValidationConfig>;
}

export class PipelineTestRunner {
  private validator: EndToEndPipelineValidator;

  constructor(
    validator: DesignSpecValidator,
    figmaConverter: FigmaMCPConverter,
    aiOrchestrator: AIOrchestrator,
    reactAdapter: ReactComponentMCPAdapter
  ) {
    this.validator = createPipelineValidator(
      validator,
      figmaConverter,
      aiOrchestrator,
      reactAdapter
    );
  }

  /**
   * Run all validation test suites
   */
  async runAllTests(): Promise<TestRunResult> {
    console.log('🚀 Starting Design Intelligence Pipeline Validation');
    console.log('=' .repeat(60));

    const startTime = Date.now();
    const testSuites = this.getTestSuites();
    const results: ValidationResult[] = [];

    for (const suite of testSuites) {
      console.log(`\n📋 Running Test Suite: ${suite.name}`);
      console.log(`   Description: ${suite.description}`);
      console.log(`   Test Cases: ${suite.testData.length}`);

      try {
        const result = await runPipelineValidation(
          suite.testData,
          this.validator,
          suite.config
        );

        results.push(result);
        this.printSuiteResults(suite, result);

      } catch (error) {
        console.error(`❌ Test Suite "${suite.name}" failed:`, error);
      }
    }

    const totalTime = Date.now() - startTime;
    const summary = this.generateTestSummary(results, totalTime);
    
    this.printFinalSummary(summary);
    return summary;
  }

  /**
   * Generate test data suites
   */
  private getTestSuites(): TestSuite[] {
    return [
      {
        name: 'Basic Component Generation',
        description: 'Test basic Figma component to React component conversion',
        testData: [
          {
            name: 'Simple Button Component',
            figmaData: {
              frames: [
                {
                  id: 'btn-001',
                  name: 'Primary Button',
                  type: 'FRAME',
                  x: 0, y: 0, width: 120, height: 40,
                  fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.6, b: 1.0 }, opacity: 1 }],
                  children: [
                    {
                      id: 'txt-001',
                      name: 'Button Text',
                      type: 'TEXT',
                      characters: 'Click Me',
                      style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 500 }
                    }
                  ]
                }
              ],
              context: {
                fileId: 'test-file-001',
                fileName: 'Button Components',
                pageId: 'page-001',
                pageName: 'Components',
                nodeIds: ['btn-001'],
                designSystemData: { system: 'Material Design' },
                techStack: ['React', 'TypeScript'],
                confidence: 0.95
              }
            },
            expectedOutput: {
              componentCount: 1,
              componentName: 'PrimaryButton',
              hasTypeScript: true,
              hasAccessibility: true
            }
          },
          {
            name: 'Card Component',
            figmaData: {
              frames: [
                {
                  id: 'card-001',
                  name: 'Product Card',
                  type: 'FRAME',
                  x: 0, y: 0, width: 300, height: 400,
                  fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }],
                  effects: [{ type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 0.1 } }],
                  children: [
                    {
                      id: 'img-001',
                      name: 'Product Image',
                      type: 'RECTANGLE',
                      width: 300, height: 200
                    },
                    {
                      id: 'txt-002',
                      name: 'Product Title',
                      type: 'TEXT',
                      characters: 'Amazing Product'
                    }
                  ]
                }
              ],
              context: {
                fileId: 'test-file-002',
                fileName: 'E-commerce Components',
                pageId: 'page-002',
                pageName: 'Product Cards',
                nodeIds: ['card-001'],
                designSystemData: { system: 'Custom' },
                techStack: ['React', 'TypeScript', 'Styled Components']
              }
            }
          }
        ],
        config: {
          sampleSize: 2,
          iterations: 2,
          qualityThresholds: {
            schemaMinCoverage: 0.80,
            aiMinConsistency: 0.85,
            componentMinAccuracy: 0.90,
            maxProcessingTime: 3000
          }
        }
      },
      {
        name: 'Complex Layout Validation',
        description: 'Test complex layout structures and nested components',
        testData: [
          {
            name: 'Dashboard Layout',
            figmaData: {
              frames: [
                {
                  id: 'dashboard-001',
                  name: 'Dashboard Layout',
                  type: 'FRAME',
                  x: 0, y: 0, width: 1200, height: 800,
                  children: [
                    {
                      id: 'header-001',
                      name: 'Header',
                      type: 'FRAME',
                      width: 1200, height: 60,
                      children: [
                        { id: 'logo-001', name: 'Logo', type: 'FRAME' },
                        { id: 'nav-001', name: 'Navigation', type: 'FRAME' }
                      ]
                    },
                    {
                      id: 'sidebar-001',
                      name: 'Sidebar',
                      type: 'FRAME',
                      width: 250, height: 740,
                      children: [
                        { id: 'menu-001', name: 'Menu Items', type: 'FRAME' }
                      ]
                    },
                    {
                      id: 'content-001',
                      name: 'Main Content',
                      type: 'FRAME',
                      width: 950, height: 740,
                      children: [
                        { id: 'widgets-001', name: 'Dashboard Widgets', type: 'FRAME' }
                      ]
                    }
                  ]
                }
              ],
              context: {
                fileId: 'test-file-003',
                fileName: 'Dashboard Layouts',
                pageId: 'page-003',
                pageName: 'Complex Layouts',
                nodeIds: ['dashboard-001'],
                designSystemData: { system: 'Enterprise Design System' },
                techStack: ['React', 'TypeScript', 'CSS Grid']
              }
            }
          }
        ],
        config: {
          sampleSize: 1,
          iterations: 1,
          enablePerformanceTesting: true,
          qualityThresholds: {
            schemaMinCoverage: 0.85,
            aiMinConsistency: 0.88,
            componentMinAccuracy: 0.92,
            maxProcessingTime: 4000
          }
        }
      },
      {
        name: 'Performance Benchmark',
        description: 'Test pipeline performance with various component sizes',
        testData: [
          {
            name: 'Large Component Set',
            figmaData: {
              frames: Array.from({ length: 10 }, (_, i) => ({
                id: `comp-${i}`,
                name: `Component ${i}`,
                type: 'FRAME',
                x: i * 150, y: 0, width: 120, height: 80,
                children: [
                  {
                    id: `txt-${i}`,
                    name: `Text ${i}`,
                    type: 'TEXT',
                    characters: `Component ${i} Content`
                  }
                ]
              })),
              context: {
                fileId: 'test-file-004',
                fileName: 'Performance Test',
                pageId: 'page-004',
                pageName: 'Bulk Components',
                nodeIds: Array.from({ length: 10 }, (_, i) => `comp-${i}`),
                designSystemData: { system: 'Performance Test System' },
                techStack: ['React', 'TypeScript']
              }
            }
          }
        ],
        config: {
          sampleSize: 1,
          iterations: 1,
          enablePerformanceTesting: true,
          enableAIConsistencyCheck: false,
          enableComponentValidation: true,
          qualityThresholds: {
            schemaMinCoverage: 0.75,
            aiMinConsistency: 0.80,
            componentMinAccuracy: 0.85,
            maxProcessingTime: 5000
          }
        }
      }
    ];
  }

  /**
   * Print results for a test suite
   */
  private printSuiteResults(suite: TestSuite, result: ValidationResult): void {
    const { overall, schemaValidation, aiConsistency, componentAccuracy, performance } = result;

    console.log(`\n   📊 Results for "${suite.name}":`);
    console.log(`      Overall Score: ${(overall.score * 100).toFixed(1)}% ${overall.success ? '✅' : '❌'}`);
    console.log(`      Processing Time: ${overall.duration}ms`);
    
    console.log(`\n      🔍 Detailed Metrics:`);
    console.log(`         Schema Coverage: ${(schemaValidation.coverage * 100).toFixed(1)}%`);
    console.log(`         AI Consistency: ${(aiConsistency.consistency * 100).toFixed(1)}%`);
    console.log(`         Component Accuracy: ${(componentAccuracy.accuracy * 100).toFixed(1)}%`);
    console.log(`         Performance Score: ${(performance.score * 100).toFixed(1)}%`);

    if (result.recommendations.length > 0) {
      console.log(`\n      💡 Recommendations:`);
      result.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`         ${priority} ${rec.message}`);
      });
    }
  }

  /**
   * Generate comprehensive test summary
   */
  private generateTestSummary(results: ValidationResult[], totalTime: number): TestRunResult {
    const successfulTests = results.filter(r => r.overall.success).length;
    const totalTests = results.length;
    
    const avgScores = {
      overall: results.reduce((sum, r) => sum + r.overall.score, 0) / results.length,
      schema: results.reduce((sum, r) => sum + r.schemaValidation.score, 0) / results.length,
      ai: results.reduce((sum, r) => sum + r.aiConsistency.score, 0) / results.length,
      component: results.reduce((sum, r) => sum + r.componentAccuracy.score, 0) / results.length,
      performance: results.reduce((sum, r) => sum + r.performance.score, 0) / results.length
    };

    const allRecommendations = results.flatMap(r => r.recommendations);
    const criticalRecommendations = allRecommendations.filter(r => r.priority === 'high');

    return {
      timestamp: new Date().toISOString(),
      totalTime,
      testSuites: results.length,
      successRate: successfulTests / totalTests,
      averageScores: avgScores,
      recommendations: {
        total: allRecommendations.length,
        critical: criticalRecommendations.length,
        items: criticalRecommendations
      },
      results,
      passed: successfulTests >= totalTests * 0.8 // 80% pass rate required
    };
  }

  /**
   * Print final summary
   */
  private printFinalSummary(summary: TestRunResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 PIPELINE VALIDATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n📈 Overall Results:`);
    console.log(`   Success Rate: ${(summary.successRate * 100).toFixed(1)}% ${summary.passed ? '✅' : '❌'}`);
    console.log(`   Total Test Suites: ${summary.testSuites}`);
    console.log(`   Total Processing Time: ${summary.totalTime}ms`);
    
    console.log(`\n📊 Average Scores:`);
    console.log(`   Overall Quality: ${(summary.averageScores.overall * 100).toFixed(1)}%`);
    console.log(`   Schema Coverage: ${(summary.averageScores.schema * 100).toFixed(1)}%`);
    console.log(`   AI Consistency: ${(summary.averageScores.ai * 100).toFixed(1)}%`);
    console.log(`   Component Accuracy: ${(summary.averageScores.component * 100).toFixed(1)}%`);
    console.log(`   Performance: ${(summary.averageScores.performance * 100).toFixed(1)}%`);

    if (summary.recommendations.critical > 0) {
      console.log(`\n🚨 Critical Recommendations (${summary.recommendations.critical}):`);
      summary.recommendations.items.forEach(rec => {
        console.log(`   • ${rec.message}`);
        console.log(`     Action: ${rec.action}`);
      });
    }

    console.log(`\n${summary.passed ? '🎉 PIPELINE VALIDATION PASSED!' : '❌ PIPELINE VALIDATION FAILED'}`);
    console.log('='.repeat(60));
  }
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

interface TestRunResult {
  timestamp: string;
  totalTime: number;
  testSuites: number;
  successRate: number;
  averageScores: {
    overall: number;
    schema: number;
    ai: number;
    component: number;
    performance: number;
  };
  recommendations: {
    total: number;
    critical: number;
    items: Array<{
      type: string;
      priority: string;
      message: string;
      action: string;
    }>;
  };
  results: ValidationResult[];
  passed: boolean;
}

// =============================================================================
// QUICK TEST RUNNER FUNCTION
// =============================================================================

export async function runQuickValidation(): Promise<TestRunResult> {
  console.log('🚀 Initializing Quick Pipeline Validation...');

  // Initialize components (normally these would be injected)
  const validator = new DesignSpecValidator();
  const figmaConverter = new FigmaMCPConverter();
  const aiOrchestrator = new AIOrchestrator();
  const reactAdapter = new ReactComponentMCPAdapter({
    outputDirectory: './output',
    generateStories: true,
    generateTests: true,
    cssFramework: 'vanilla',
    componentFormat: 'functional',
    propsInterface: 'separate-file',
    includeDocumentation: true,
    accessibility: {
      enforceAria: true,
      includeScreenReaderText: true,
      validateColorContrast: true
    },
    performance: {
      lazyLoading: true,
      memoization: true,
      bundleSplitting: true
    }
  });

  const testRunner = new PipelineTestRunner(
    validator,
    figmaConverter,
    aiOrchestrator,
    reactAdapter
  );

  return await testRunner.runAllTests();
}

export default PipelineTestRunner;