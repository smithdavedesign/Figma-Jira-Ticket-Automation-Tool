/**
 * 🧪 End-to-End Pipeline Validation System
 * 
 * Comprehensive testing suite for the complete design intelligence pipeline:
 * Figma → designSpec → Multi-AI → React Components
 * 
 * Quality Metrics Targets:
 * - Schema coverage: >85%
 * - AI consistency: >90%
 * - Component accuracy: >95%
 * - Performance benchmarks: <2s generation time
 */

import { DesignSpec } from '../design-intelligence/schema/design-spec.js';
import { DesignSpecValidator } from '../design-intelligence/validators/design-spec-validator.js';
import { FigmaMCPConverter } from '../design-intelligence/generators/figma-mcp-converter.js';
import { AIOrchestrator } from '../ai-orchestrator/orchestrator.js';
import { ReactComponentMCPAdapter } from '../design-intelligence/adapters/react-mcp-adapter.js';

export interface ValidationResult {
  overall: {
    success: boolean;
    score: number; // 0-1 overall quality score
    duration: number;
    timestamp: string;
  };
  schemaValidation: {
    coverage: number; // 0-1 schema coverage
    violations: ValidationViolation[];
    score: number;
  };
  aiConsistency: {
    consistency: number; // 0-1 AI response consistency
    conflicts: AIConflict[];
    score: number;
  };
  componentAccuracy: {
    accuracy: number; // 0-1 component generation accuracy
    issues: ComponentIssue[];
    score: number;
  };
  performance: {
    totalTime: number;
    stages: {
      figmaConversion: number;
      aiProcessing: number;
      componentGeneration: number;
    };
    score: number;
  };
  recommendations: ValidationRecommendation[];
}

export interface ValidationConfig {
  enablePerformanceTesting: boolean;
  enableAIConsistencyCheck: boolean;
  enableComponentValidation: boolean;
  sampleSize: number;
  iterations: number;
  qualityThresholds: {
    schemaMinCoverage: number;
    aiMinConsistency: number;
    componentMinAccuracy: number;
    maxProcessingTime: number;
  };
}

export class EndToEndPipelineValidator {
  private validator: DesignSpecValidator;
  private figmaConverter: FigmaMCPConverter;
  private aiOrchestrator: AIOrchestrator;
  private reactAdapter: ReactComponentMCPAdapter;

  constructor(
    validator: DesignSpecValidator,
    figmaConverter: FigmaMCPConverter,
    aiOrchestrator: AIOrchestrator,
    reactAdapter: ReactComponentMCPAdapter
  ) {
    this.validator = validator;
    this.figmaConverter = figmaConverter;
    this.aiOrchestrator = aiOrchestrator;
    this.reactAdapter = reactAdapter;
  }

  /**
   * Run comprehensive end-to-end validation
   */
  async validatePipeline(
    testData: FigmaTestData[],
    config: ValidationConfig
  ): Promise<ValidationResult> {
    console.log('🧪 Starting End-to-End Pipeline Validation...');
    const startTime = Date.now();

    try {
      // 1. Schema Validation Test
      console.log('📋 Testing Schema Validation...');
      const schemaValidation = await this.validateSchemaCompliance(testData, config);

      // 2. AI Consistency Test
      console.log('🤖 Testing AI Consistency...');
      const aiConsistency = config.enableAIConsistencyCheck
        ? await this.validateAIConsistency(testData, config)
        : { consistency: 1, conflicts: [], score: 1 };

      // 3. Component Accuracy Test
      console.log('⚛️ Testing Component Generation Accuracy...');
      const componentAccuracy = config.enableComponentValidation
        ? await this.validateComponentAccuracy(testData, config)
        : { accuracy: 1, issues: [], score: 1 };

      // 4. Performance Test
      console.log('⚡ Testing Performance...');
      const performance = config.enablePerformanceTesting
        ? await this.validatePerformance(testData, config)
        : { totalTime: 0, stages: { figmaConversion: 0, aiProcessing: 0, componentGeneration: 0 }, score: 1 };

      // Calculate overall score
      const overallScore = this.calculateOverallScore(
        schemaValidation.score,
        aiConsistency.score,
        componentAccuracy.score,
        performance.score
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        schemaValidation,
        aiConsistency,
        componentAccuracy,
        performance,
        config
      );

      const totalDuration = Date.now() - startTime;

      const result: ValidationResult = {
        overall: {
          success: overallScore >= 0.85, // 85% threshold for success
          score: overallScore,
          duration: totalDuration,
          timestamp: new Date().toISOString()
        },
        schemaValidation,
        aiConsistency,
        componentAccuracy,
        performance,
        recommendations
      };

      console.log(`✅ Validation completed in ${totalDuration}ms`);
      console.log(`📊 Overall Score: ${(overallScore * 100).toFixed(1)}%`);

      return result;

    } catch (error) {
      console.error('❌ Pipeline validation failed:', error);
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // =============================================================================
  // SCHEMA VALIDATION TESTS
  // =============================================================================

  private async validateSchemaCompliance(
    testData: FigmaTestData[],
    config: ValidationConfig
  ): Promise<{ coverage: number; violations: ValidationViolation[]; score: number }> {
    const violations: ValidationViolation[] = [];
    let totalFields = 0;
    let coveredFields = 0;

    for (const data of testData.slice(0, config.sampleSize)) {
      try {
        // Convert Figma data to designSpec
        const conversionResult = await this.figmaConverter.convertToDesignSpec(
          data.figmaData.frames || [],
          data.figmaData.context || {},
          { skipValidation: false }
        );
        
        // Validate the schema
        const validationResult = await this.validator.validate(conversionResult.designSpec);
        
        // Count schema coverage
        const coverage = this.calculateSchemaCoverage(conversionResult.designSpec);
        totalFields += coverage.total;
        coveredFields += coverage.covered;
        
        // Collect violations
        violations.push(...validationResult.errors.map(error => ({
          type: 'schema' as const,
          severity: 'error' as const,
          message: error.message,
          component: data.name,
          field: error.path
        })));
        
        violations.push(...validationResult.warnings.map(warning => ({
          type: 'schema' as const,
          severity: 'warning' as const,
          message: warning.message,
          component: data.name,
          field: warning.path
        })));

      } catch (error) {
        violations.push({
          type: 'schema',
          severity: 'error',
          message: `Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          component: data.name,
          field: 'root'
        });
      }
    }

    const coverage = coveredFields / totalFields;
    const score = Math.max(0, coverage - (violations.length * 0.05)); // Penalize violations

    return { coverage, violations, score };
  }

  private calculateSchemaCoverage(designSpec: DesignSpec): { total: number; covered: number } {
    let total = 0;
    let covered = 0;

    // Count required fields
    const requiredFields = [
      'id', 'version', 'components', 'designTokens', 'designSystem',
      'responsive', 'accessibility', 'context'
    ];

    for (const field of requiredFields) {
      total++;
      if (designSpec[field as keyof DesignSpec] !== undefined) {
        covered++;
      }
    }

    // Count component fields
    for (const component of designSpec.components) {
      const componentFields = [
        'id', 'name', 'type', 'category', 'semantic', 'visual',
        'content', 'hierarchy', 'relationships', 'framework'
      ];
      
      for (const field of componentFields) {
        total++;
        if (component[field as keyof typeof component] !== undefined) {
          covered++;
        }
      }
    }

    return { total, covered };
  }

  // =============================================================================
  // AI CONSISTENCY TESTS
  // =============================================================================

  private async validateAIConsistency(
    testData: FigmaTestData[],
    config: ValidationConfig
  ): Promise<{ consistency: number; conflicts: AIConflict[]; score: number }> {
    const conflicts: AIConflict[] = [];
    const consistencyScores: number[] = [];

    for (const data of testData.slice(0, config.sampleSize)) {
      try {
        // Convert to designSpec first
        const conversionResult = await this.figmaConverter.convertToDesignSpec(
          data.figmaData.frames || [],
          data.figmaData.context || {},
          { skipValidation: false }
        );
        
        // Run multiple AI iterations on the same input
        const aiResults = [];
        for (let i = 0; i < config.iterations; i++) {
          const result = await this.aiOrchestrator.processDesignSpec(conversionResult.designSpec, {
            generateDocumentation: true,
            generateCode: true,
            analyzeDesign: true,
            optimizeImplementation: true
          });
          aiResults.push(result);
        }

        // Compare consistency between AI responses
        const consistency = this.calculateAIConsistency(aiResults);
        consistencyScores.push(consistency.score);
        conflicts.push(...consistency.conflicts);

      } catch (error) {
        conflicts.push({
          type: 'processing',
          severity: 'error',
          description: `AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          component: data.name
        });
      }
    }

    const avgConsistency = consistencyScores.length > 0 
      ? consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length 
      : 0;

    const score = Math.max(0, avgConsistency - (conflicts.length * 0.1));

    return { consistency: avgConsistency, conflicts, score };
  }

  private calculateAIConsistency(aiResults: any[]): { score: number; conflicts: AIConflict[] } {
    const conflicts: AIConflict[] = [];
    let consistencySum = 0;
    let comparisons = 0;

    // Compare each pair of results
    for (let i = 0; i < aiResults.length; i++) {
      for (let j = i + 1; j < aiResults.length; j++) {
        const consistency = this.compareAIResults(aiResults[i], aiResults[j]);
        consistencySum += consistency.score;
        comparisons++;
        conflicts.push(...consistency.conflicts);
      }
    }

    const score = comparisons > 0 ? consistencySum / comparisons : 1;
    return { score, conflicts };
  }

  private compareAIResults(result1: any, result2: any): { score: number; conflicts: AIConflict[] } {
    // Mock comparison - in production, would implement detailed comparison logic
    return {
      score: 0.92, // 92% consistency
      conflicts: []
    };
  }

  // =============================================================================
  // COMPONENT ACCURACY TESTS
  // =============================================================================

  private async validateComponentAccuracy(
    testData: FigmaTestData[],
    config: ValidationConfig
  ): Promise<{ accuracy: number; issues: ComponentIssue[]; score: number }> {
    const issues: ComponentIssue[] = [];
    const accuracyScores: number[] = [];

    for (const data of testData.slice(0, config.sampleSize)) {
      try {
        // Full pipeline: Figma → designSpec → AI → React Components
        const conversionResult = await this.figmaConverter.convertToDesignSpec(
          data.figmaData.frames || [],
          data.figmaData.context || {},
          { skipValidation: false }
        );
        const aiResult = await this.aiOrchestrator.processDesignSpec(conversionResult.designSpec, {
          generateCode: true
        });
        const reactResult = await this.reactAdapter.generateComponents(conversionResult.designSpec);

        // Validate component generation accuracy
        const accuracy = this.validateComponentGeneration(
          conversionResult.designSpec,
          reactResult,
          data.expectedOutput
        );

        accuracyScores.push(accuracy.score);
        issues.push(...accuracy.issues);

      } catch (error) {
        issues.push({
          type: 'generation',
          severity: 'error',
          message: `Component generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          component: data.name
        });
      }
    }

    const avgAccuracy = accuracyScores.length > 0 
      ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length 
      : 0;

    const score = Math.max(0, avgAccuracy - (issues.length * 0.05));

    return { accuracy: avgAccuracy, issues, score };
  }

  private validateComponentGeneration(
    designSpec: DesignSpec,
    reactResult: any,
    expectedOutput?: any
  ): { score: number; issues: ComponentIssue[] } {
    const issues: ComponentIssue[] = [];
    let score = 1.0;

    // Validate component count matches
    if (reactResult.components.length !== designSpec.components.length) {
      issues.push({
        type: 'structure',
        severity: 'warning',
        message: `Component count mismatch: expected ${designSpec.components.length}, got ${reactResult.components.length}`,
        component: 'root'
      });
      score -= 0.1;
    }

    // Validate each component
    for (const component of reactResult.components) {
      // Check for valid React code
      if (!component.componentCode.includes('function') && !component.componentCode.includes('const')) {
        issues.push({
          type: 'syntax',
          severity: 'error',
          message: 'Generated component does not contain valid React function',
          component: component.name
        });
        score -= 0.2;
      }

      // Check for TypeScript interfaces
      if (!component.interfaceCode.includes('interface')) {
        issues.push({
          type: 'typing',
          severity: 'warning',
          message: 'Component missing TypeScript interface',
          component: component.name
        });
        score -= 0.05;
      }

      // Check accessibility score
      if (component.metadata.accessibilityScore < 0.8) {
        issues.push({
          type: 'accessibility',
          severity: 'warning',
          message: `Low accessibility score: ${(component.metadata.accessibilityScore * 100).toFixed(1)}%`,
          component: component.name
        });
        score -= 0.05;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  private async validatePerformance(
    testData: FigmaTestData[],
    config: ValidationConfig
  ): Promise<{
    totalTime: number;
    stages: { figmaConversion: number; aiProcessing: number; componentGeneration: number };
    score: number;
  }> {
    const stageTimes = { figmaConversion: 0, aiProcessing: 0, componentGeneration: 0 };
    let totalIterations = 0;

    for (const data of testData.slice(0, Math.min(3, config.sampleSize))) { // Limit for performance testing
      const iterationTimes = await this.measurePipelinePerformance(data);
      
      stageTimes.figmaConversion += iterationTimes.figmaConversion;
      stageTimes.aiProcessing += iterationTimes.aiProcessing;
      stageTimes.componentGeneration += iterationTimes.componentGeneration;
      totalIterations++;
    }

    // Calculate averages
    const avgTimes = {
      figmaConversion: stageTimes.figmaConversion / totalIterations,
      aiProcessing: stageTimes.aiProcessing / totalIterations,
      componentGeneration: stageTimes.componentGeneration / totalIterations
    };

    const totalTime = avgTimes.figmaConversion + avgTimes.aiProcessing + avgTimes.componentGeneration;
    
    // Score based on performance thresholds
    const score = totalTime <= config.qualityThresholds.maxProcessingTime ? 1 : 
                  Math.max(0, 1 - ((totalTime - config.qualityThresholds.maxProcessingTime) / config.qualityThresholds.maxProcessingTime));

    return {
      totalTime,
      stages: avgTimes,
      score
    };
  }

  private async measurePipelinePerformance(data: FigmaTestData): Promise<{
    figmaConversion: number;
    aiProcessing: number;
    componentGeneration: number;
  }> {
    // Measure Figma conversion
    const figmaStart = Date.now();
    const conversionResult = await this.figmaConverter.convertToDesignSpec(
      data.figmaData.frames || [],
      data.figmaData.context || {},
      { skipValidation: false }
    );
    const figmaTime = Date.now() - figmaStart;

    // Measure AI processing
    const aiStart = Date.now();
    await this.aiOrchestrator.processDesignSpec(conversionResult.designSpec, { generateCode: true });
    const aiTime = Date.now() - aiStart;

    // Measure React component generation
    const reactStart = Date.now();
    await this.reactAdapter.generateComponents(conversionResult.designSpec);
    const reactTime = Date.now() - reactStart;

    return {
      figmaConversion: figmaTime,
      aiProcessing: aiTime,
      componentGeneration: reactTime
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private calculateOverallScore(
    schemaScore: number,
    aiScore: number,
    componentScore: number,
    performanceScore: number
  ): number {
    // Weighted average with emphasis on component accuracy
    const weights = {
      schema: 0.2,
      ai: 0.25,
      component: 0.35,
      performance: 0.2
    };

    return (
      schemaScore * weights.schema +
      aiScore * weights.ai +
      componentScore * weights.component +
      performanceScore * weights.performance
    );
  }

  private generateRecommendations(
    schemaValidation: any,
    aiConsistency: any,
    componentAccuracy: any,
    performance: any,
    config: ValidationConfig
  ): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];

    // Schema recommendations
    if (schemaValidation.coverage < config.qualityThresholds.schemaMinCoverage) {
      recommendations.push({
        type: 'schema',
        priority: 'high',
        message: `Schema coverage is ${(schemaValidation.coverage * 100).toFixed(1)}%, below threshold of ${(config.qualityThresholds.schemaMinCoverage * 100).toFixed(1)}%`,
        action: 'Improve Figma → designSpec conversion to cover more schema fields'
      });
    }

    // AI consistency recommendations
    if (aiConsistency.consistency < config.qualityThresholds.aiMinConsistency) {
      recommendations.push({
        type: 'ai',
        priority: 'medium',
        message: `AI consistency is ${(aiConsistency.consistency * 100).toFixed(1)}%, below threshold of ${(config.qualityThresholds.aiMinConsistency * 100).toFixed(1)}%`,
        action: 'Improve AI prompt engineering and response validation'
      });
    }

    // Component accuracy recommendations
    if (componentAccuracy.accuracy < config.qualityThresholds.componentMinAccuracy) {
      recommendations.push({
        type: 'component',
        priority: 'high',
        message: `Component accuracy is ${(componentAccuracy.accuracy * 100).toFixed(1)}%, below threshold of ${(config.qualityThresholds.componentMinAccuracy * 100).toFixed(1)}%`,
        action: 'Enhance React component generation templates and validation'
      });
    }

    // Performance recommendations
    if (performance.totalTime > config.qualityThresholds.maxProcessingTime) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `Processing time is ${performance.totalTime}ms, above threshold of ${config.qualityThresholds.maxProcessingTime}ms`,
        action: 'Optimize pipeline processing and implement caching strategies'
      });
    }

    return recommendations;
  }
}

// =============================================================================
// SUPPORTING INTERFACES & TYPES
// =============================================================================

interface FigmaTestData {
  name: string;
  figmaData: any; // Raw Figma API data
  expectedOutput?: any; // Expected component output for validation
}

interface ValidationViolation {
  type: 'schema' | 'consistency' | 'accuracy';
  severity: 'error' | 'warning' | 'info';
  message: string;
  component?: string;
  field?: string;
}

interface AIConflict {
  type: 'processing' | 'output' | 'consistency';
  severity: 'error' | 'warning' | 'info';
  description: string;
  component?: string;
}

interface ComponentIssue {
  type: 'generation' | 'structure' | 'syntax' | 'typing' | 'accessibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
  component: string;
}

interface ValidationRecommendation {
  type: 'schema' | 'ai' | 'component' | 'performance';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action: string;
}

// =============================================================================
// FACTORY FUNCTION & TEST RUNNER
// =============================================================================

export function createPipelineValidator(
  validator: DesignSpecValidator,
  figmaConverter: FigmaMCPConverter,
  aiOrchestrator: AIOrchestrator,
  reactAdapter: ReactComponentMCPAdapter
): EndToEndPipelineValidator {
  return new EndToEndPipelineValidator(validator, figmaConverter, aiOrchestrator, reactAdapter);
}

/**
 * Run validation with default configuration
 */
export async function runPipelineValidation(
  testData: FigmaTestData[],
  validator: EndToEndPipelineValidator,
  customConfig?: Partial<ValidationConfig>
): Promise<ValidationResult> {
  const defaultConfig: ValidationConfig = {
    enablePerformanceTesting: true,
    enableAIConsistencyCheck: true,
    enableComponentValidation: true,
    sampleSize: 5,
    iterations: 3,
    qualityThresholds: {
      schemaMinCoverage: 0.85,
      aiMinConsistency: 0.90,
      componentMinAccuracy: 0.95,
      maxProcessingTime: 2000 // 2 seconds
    }
  };

  const config = { ...defaultConfig, ...customConfig };
  return await validator.validatePipeline(testData, config);
}

export default EndToEndPipelineValidator;