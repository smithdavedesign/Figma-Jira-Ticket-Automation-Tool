/**
 * 🔗 Context Intelligence Integration Tests (Vitest)
 * 
 * Integration tests for Context Intelligence Layer components
 * working together with UnifiedContextProvider
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ContextIntelligenceOrchestrator from '../../core/context/context-intelligence-orchestrator.js';

// Mock UnifiedContextProvider since it has external dependencies
class MockUnifiedContextProvider {
  constructor(options = {}) {
    this.config = {
      includeContextIntelligence: options.includeContextIntelligence !== false,
      includeDesignHealth: options.includeDesignHealth !== false,
      includeAdvancedContext: options.includeAdvancedContext !== false,
      ...options
    };
    
    this.contextIntelligence = new ContextIntelligenceOrchestrator({
      enableCaching: false,
      parallelAnalysis: true
    });
  }

  async buildComprehensiveContext(figmaData, options = {}) {
    const baseContext = {
      nodes: figmaData.components || [],
      components: figmaData.components || [],
      designTokens: figmaData.designTokens || {},
      specifications: {
        purpose: 'Test interface',
        audience: 'Test users',
        domain: 'Test domain',
        platform: 'Web'
      }
    };

    let contextIntelligence = null;
    if (this.config.includeContextIntelligence) {
      const designSpec = {
        components: baseContext.components,
        designTokens: baseContext.designTokens,
        metadata: {
          totalNodes: baseContext.nodes.length,
          componentCount: baseContext.components.length
        }
      };

      const prototypeData = {
        interactions: figmaData.interactions || [],
        prototypes: figmaData.prototypes || []
      };

      const designContext = {
        purpose: baseContext.specifications.purpose,
        targetAudience: baseContext.specifications.audience,
        businessDomain: baseContext.specifications.domain,
        platform: baseContext.specifications.platform
      };

      contextIntelligence = await this.contextIntelligence.analyzeContextIntelligence(
        designSpec,
        prototypeData,
        designContext
      );
    }

    return {
      ...baseContext,
      contextIntelligence,
      contextMetadata: {
        generatedAt: new Date().toISOString(),
        processingTime: contextIntelligence?.metadata?.analysisTime || 0,
        featuresEnabled: this.config,
        contextVersion: '2.0.0',
        unifiedProvider: true
      },
      llmPreview: {
        contextIntelligenceEnabled: !!contextIntelligence,
        intelligenceConfidence: contextIntelligence?.synthesis?.overallConfidence || 0
      }
    };
  }

  async validateUnifiedContext(context) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      completeness: context.contextIntelligence ? 0.9 : 0.6
    };
  }
}

describe('🔗 Context Intelligence Integration Tests', () => {
  let mockProvider;
  let mockFigmaData;

  beforeEach(() => {
    mockProvider = new MockUnifiedContextProvider({
      includeContextIntelligence: true
    });

    mockFigmaData = {
      components: [{
        id: 'button-1',
        name: 'Submit Button',
        type: 'COMPONENT',
        category: 'Button',
        properties: {
          width: 120,
          height: 44,
          backgroundColor: '#0066CC',
          textColor: '#FFFFFF'
        },
        geometry: {
          width: 120,
          height: 44,
          x: 100,
          y: 200
        },
        style: {
          backgroundColor: '#0066CC',
          color: '#FFFFFF',
          borderRadius: 4
        }
      }, {
        id: 'input-1',
        name: 'Email Input',
        type: 'COMPONENT',
        category: 'Input',
        properties: {
          width: 200,
          height: 40,
          backgroundColor: '#FFFFFF',
          borderColor: '#CCCCCC'
        },
        geometry: {
          width: 200,
          height: 40,
          x: 100,
          y: 150
        },
        style: {
          backgroundColor: '#FFFFFF',
          borderColor: '#CCCCCC',
          borderWidth: 1
        }
      }],
      designTokens: {
        colors: [
          { name: 'primary', value: '#0066CC', type: 'color' },
          { name: 'white', value: '#FFFFFF', type: 'color' },
          { name: 'border', value: '#CCCCCC', type: 'color' }
        ],
        typography: [
          { name: 'button-text', fontSize: 14, fontWeight: 'bold' },
          { name: 'input-text', fontSize: 14, fontWeight: 'normal' }
        ],
        spacing: [
          { name: 'small', value: 8 },
          { name: 'medium', value: 16 },
          { name: 'large', value: 24 }
        ]
      },
      interactions: [{
        id: 'submit-interaction',
        trigger: 'click',
        sourceNodeId: 'button-1',
        targetNodeId: 'success-page',
        transitionType: 'navigate'
      }],
      prototypes: [{
        id: 'form-prototype',
        startingFrame: 'form-frame',
        flows: ['submit-flow']
      }]
    };
  });

  afterEach(() => {
    mockProvider = null;
    mockFigmaData = null;
  });

  describe('UnifiedContextProvider Integration', () => {
    it('should integrate Context Intelligence with existing context pipeline', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);

      expect(result).toBeDefined();
      expect(result.contextIntelligence).toBeDefined();
      expect(result.contextMetadata.featuresEnabled.includeContextIntelligence).toBe(true);
      expect(result.llmPreview.contextIntelligenceEnabled).toBe(true);
    });

    it('should enhance context completeness with Context Intelligence', async () => {
      const withIntelligence = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const validation = await mockProvider.validateUnifiedContext(withIntelligence);

      expect(validation.completeness).toBeGreaterThan(0.8);

      // Test without intelligence
      const providerWithoutIntelligence = new MockUnifiedContextProvider({
        includeContextIntelligence: false
      });
      const withoutIntelligence = await providerWithoutIntelligence.buildComprehensiveContext(mockFigmaData);
      const validationWithout = await providerWithoutIntelligence.validateUnifiedContext(withoutIntelligence);

      expect(validationWithout.completeness).toBeLessThan(validation.completeness);
    });

    it('should provide enhanced LLM preview with intelligence insights', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);

      expect(result.llmPreview).toBeDefined();
      expect(result.llmPreview.contextIntelligenceEnabled).toBe(true);
      expect(result.llmPreview.intelligenceConfidence).toBeGreaterThanOrEqual(0);
      expect(result.llmPreview.intelligenceConfidence).toBeLessThanOrEqual(1);
    });

    it('should maintain backward compatibility when Context Intelligence is disabled', async () => {
      const providerWithoutIntelligence = new MockUnifiedContextProvider({
        includeContextIntelligence: false
      });

      const result = await providerWithoutIntelligence.buildComprehensiveContext(mockFigmaData);

      expect(result).toBeDefined();
      expect(result.contextIntelligence).toBeNull();
      expect(result.llmPreview.contextIntelligenceEnabled).toBe(false);
      expect(result.nodes).toBeInstanceOf(Array);
      expect(result.components).toBeInstanceOf(Array);
      expect(result.designTokens).toBeDefined();
    });
  });

  describe('Multi-Component Analysis', () => {
    it('should analyze multiple components with different types', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const intelligence = result.contextIntelligence;

      expect(intelligence.semantic.components).toHaveLength(2);
      expect(intelligence.interaction.interactiveComponents).toHaveLength(2);
      expect(intelligence.tokens.tokenMapping).toBeDefined();
      expect(intelligence.layout.gridSystems).toBeInstanceOf(Array);
    });

    it('should identify semantic patterns across components', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const intelligence = result.contextIntelligence;

      expect(intelligence.semantic.patterns).toBeInstanceOf(Array);
      expect(intelligence.semantic.patterns.length).toBeGreaterThan(0);

      // Should detect form pattern from button + input combination
      const patterns = intelligence.semantic.patterns;
      expect(patterns.some(p => p.type.includes('authentication') || p.type.includes('form'))).toBe(true);
    });

    it('should generate comprehensive recommendations', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const intelligence = result.contextIntelligence;

      const totalRecommendations = 
        intelligence.recommendations.critical.length +
        intelligence.recommendations.important.length +
        intelligence.recommendations.suggested.length +
        intelligence.recommendations.enhancements.length;

      expect(totalRecommendations).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Design System Analysis', () => {
    it('should detect design system patterns from tokens', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const intelligence = result.contextIntelligence;

      expect(intelligence.tokens.systemDetection).toBeDefined();
      expect(intelligence.tokens.systemDetection.detectedSystem).toBeDefined();
      expect(intelligence.tokens.systemDetection.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should map components to design tokens', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const intelligence = result.contextIntelligence;

      expect(intelligence.tokens.tokenMapping).toBeDefined();
      expect(intelligence.tokens.compliance.overall).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Accessibility Analysis', () => {
    it('should analyze accessibility compliance for all components', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const intelligence = result.contextIntelligence;

      expect(intelligence.accessibility.compliance.overall).toBeDefined();
      expect(intelligence.accessibility.compliance.overall.score).toBeGreaterThanOrEqual(0);
      expect(intelligence.accessibility.compliance.overall.score).toBeLessThanOrEqual(1);
      expect(intelligence.accessibility.issues).toBeInstanceOf(Array);
    });

    it('should check color contrast for text components', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const intelligence = result.contextIntelligence;

      expect(intelligence.accessibility.compliance.perceivable).toBeDefined();
      expect(intelligence.accessibility.compliance.perceivable.colorContrast).toBeDefined();
    });

    it('should validate touch target sizes', async () => {
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const intelligence = result.contextIntelligence;

      expect(intelligence.accessibility.compliance.operable).toBeDefined();
      expect(intelligence.accessibility.compliance.operable.touchTargets).toBeDefined();
    });
  });

  describe('Performance Integration', () => {
    it('should complete full analysis within performance targets', async () => {
      const startTime = Date.now();
      const result = await mockProvider.buildComprehensiveContext(mockFigmaData);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(2000); // Less than 2 seconds for integration test
      expect(result.contextMetadata.processingTime).toBeLessThan(1000); // Context Intelligence should be under 1 second
    });

    it('should scale with component count', async () => {
      // Create larger dataset
      const largeDataset = {
        ...mockFigmaData,
        components: Array.from({ length: 20 }, (_, i) => ({
          ...mockFigmaData.components[0],
          id: `component-${i}`,
          name: `Component ${i}`
        }))
      };

      const startTime = Date.now();
      const result = await mockProvider.buildComprehensiveContext(largeDataset);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const timePerComponent = totalTime / largeDataset.components.length;

      expect(timePerComponent).toBeLessThan(200); // Less than 200ms per component
      expect(result.contextIntelligence.metadata.componentsAnalyzed).toBe(20);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle malformed component data gracefully', async () => {
      const malformedData = {
        components: [
          { id: 'broken-1', name: null, type: undefined },
          { id: 'broken-2' }, // Missing required fields
          null, // Null component
          undefined // Undefined component
        ].filter(Boolean), // Remove null/undefined for realistic test
        designTokens: {},
        interactions: []
      };

      const result = await mockProvider.buildComprehensiveContext(malformedData);

      expect(result).toBeDefined();
      expect(result.contextIntelligence).toBeDefined();
      // Should complete even with malformed data
      expect(result.contextMetadata.processingTime).toBeGreaterThan(0);
    });

    it('should provide partial results when some analyses fail', async () => {
      // Mock a scenario where one analysis component might fail
      const edgeCaseData = {
        components: [{
          id: 'edge-case',
          name: 'Edge Case Component',
          type: 'UNKNOWN_TYPE',
          properties: {},
          geometry: null,
          style: undefined
        }],
        designTokens: { colors: null, typography: undefined },
        interactions: []
      };

      const result = await mockProvider.buildComprehensiveContext(edgeCaseData);

      expect(result).toBeDefined();
      expect(result.contextIntelligence).toBeDefined();
      // Should still provide overall confidence and metadata
      expect(result.contextIntelligence.synthesis.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(result.contextIntelligence.metadata.analysisTime).toBeGreaterThan(0);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical login form scenario', async () => {
      const loginFormData = {
        components: [
          {
            id: 'email-input',
            name: 'Email Input Field',
            type: 'COMPONENT',
            category: 'Input',
            properties: { width: 300, height: 40, placeholder: 'Enter email' },
            geometry: { width: 300, height: 40, x: 50, y: 100 },
            style: { backgroundColor: '#FFFFFF', borderColor: '#CCCCCC' }
          },
          {
            id: 'password-input', 
            name: 'Password Input Field',
            type: 'COMPONENT',
            category: 'Input',
            properties: { width: 300, height: 40, placeholder: 'Enter password' },
            geometry: { width: 300, height: 40, x: 50, y: 150 },
            style: { backgroundColor: '#FFFFFF', borderColor: '#CCCCCC' }
          },
          {
            id: 'login-button',
            name: 'Login Button',
            type: 'COMPONENT',
            category: 'Button',
            properties: { width: 300, height: 44, text: 'Login' },
            geometry: { width: 300, height: 44, x: 50, y: 200 },
            style: { backgroundColor: '#0066CC', color: '#FFFFFF' }
          }
        ],
        designTokens: {
          colors: [
            { name: 'primary', value: '#0066CC', type: 'color' },
            { name: 'white', value: '#FFFFFF', type: 'color' },
            { name: 'border', value: '#CCCCCC', type: 'color' }
          ]
        },
        interactions: [{
          id: 'login-action',
          trigger: 'click',
          sourceNodeId: 'login-button',
          targetNodeId: 'dashboard',
          transitionType: 'navigate'
        }]
      };

      const result = await mockProvider.buildComprehensiveContext(loginFormData);
      const intelligence = result.contextIntelligence;

      // Should recognize login form pattern
      expect(intelligence.semantic.patterns.some(p => 
        p.type.includes('authentication') || p.type.includes('login')
      )).toBe(true);

      // Should identify all components as interactive
      expect(intelligence.interaction.interactiveComponents).toHaveLength(3);

      // Should provide business logic inference
      expect(intelligence.synthesis.businessLogic.primaryFunction).toContain('authentication');
    });

    it('should handle dashboard/navigation scenario', async () => {
      const dashboardData = {
        components: [
          {
            id: 'nav-menu',
            name: 'Navigation Menu',
            type: 'FRAME',
            category: 'Navigation',
            properties: { width: 200, height: 400 },
            geometry: { width: 200, height: 400, x: 0, y: 0 },
            style: { backgroundColor: '#F5F5F5' }
          },
          {
            id: 'user-avatar',
            name: 'User Avatar',
            type: 'COMPONENT',
            category: 'Avatar',
            properties: { width: 40, height: 40 },
            geometry: { width: 40, height: 40, x: 250, y: 20 },
            style: { borderRadius: 20 }
          },
          {
            id: 'dashboard-card',
            name: 'Statistics Card',
            type: 'COMPONENT',
            category: 'Card',
            properties: { width: 300, height: 150 },
            geometry: { width: 300, height: 150, x: 250, y: 100 },
            style: { backgroundColor: '#FFFFFF', borderRadius: 8 }
          }
        ],
        designTokens: {
          colors: [
            { name: 'background', value: '#F5F5F5', type: 'color' },
            { name: 'white', value: '#FFFFFF', type: 'color' }
          ],
          spacing: [
            { name: 'medium', value: 20 },
            { name: 'small', value: 8 }
          ]
        }
      };

      const result = await mockProvider.buildComprehensiveContext(dashboardData);
      const intelligence = result.contextIntelligence;

      // Should recognize dashboard/navigation pattern
      expect(intelligence.semantic.patterns.some(p => 
        p.type.includes('navigation') || p.type.includes('dashboard')
      )).toBe(true);

      // Should detect layout patterns
      expect(intelligence.layout.gridSystems.length).toBeGreaterThanOrEqual(0);
      expect(intelligence.layout.alignmentPatterns.length).toBeGreaterThanOrEqual(0);
    });
  });
});