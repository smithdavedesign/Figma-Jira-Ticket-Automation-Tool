/**
 * 🧪 Context Intelligence Layer Unit Tests
 * 
 * Comprehensive unit test suite for Phase 7: Context Intelligence Layer
 * Tests each component individually with mocked dependencies
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ContextIntelligenceOrchestrator from '../../core/context/context-intelligence-orchestrator.js';
import SemanticAnalyzer from '../../core/context/semantic-analyzer.js';
import InteractionMapper from '../../core/context/interaction-mapper.js';
import AccessibilityChecker from '../../core/context/accessibility-checker.js';
import DesignTokenLinker from '../../core/context/design-system-linker.js';
import LayoutIntentExtractor from '../../core/context/layout-intent-extractor.js';

// Mock data fixtures
const mockComponent = {
  id: 'test-component-1',
  name: 'Login Button',
  type: 'COMPONENT',
  category: 'Button',
  properties: {
    width: 120,
    height: 40,
    backgroundColor: '#0066CC',
    textColor: '#FFFFFF'
  },
  geometry: {
    width: 120,
    height: 40,
    x: 0,
    y: 0
  },
  style: {
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    borderRadius: 4
  },
  // Add semantic analysis data that downstream modules expect
  semantic: {
    intent: 'button',
    confidence: 0.8,
    patterns: ['interactive', 'form-control'],
    reasoning: 'Component named "Login Button" with button-like properties'
  }
};

const mockDesignSpec = {
  components: [mockComponent],
  designTokens: {
    colors: [{ name: 'primary', value: '#0066CC', type: 'color' }],
    typography: [{ name: 'button-text', fontSize: 14, fontWeight: 'bold' }],
    spacing: [{ name: 'small', value: 8 }]
  },
  metadata: {
    totalNodes: 1,
    componentCount: 1,
    designSystemDetected: true
  }
};

const mockPrototypeData = {
  interactions: [{
    id: 'interaction-1',
    trigger: 'click',
    sourceNodeId: 'test-component-1',
    targetNodeId: 'dashboard-1',
    transitionType: 'navigate'
  }],
  prototypes: [{ id: 'prototype-1', startingFrame: 'login-frame' }],
  transitions: [{ id: 'transition-1', type: 'slide', duration: 300 }],
  flows: [{ id: 'login-flow', name: 'User Login Flow' }]
};

const mockDesignContext = {
  purpose: 'User authentication interface',
  targetAudience: 'General web users',
  businessDomain: 'SaaS application',
  platform: 'Web',
  designSystem: 'Material Design'
};

describe('🧠 Context Intelligence Layer Unit Tests', () => {
  
  describe('ContextIntelligenceOrchestrator', () => {
    let orchestrator;

    beforeEach(() => {
      orchestrator = new ContextIntelligenceOrchestrator({
        enableCaching: false,
        parallelAnalysis: false, // Use sequential for unit tests
        includePerformanceMetrics: false
      });
    });

    afterEach(() => {
      orchestrator = null;
    });

    it('should initialize with default configuration', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator.config).toBeDefined();
      expect(orchestrator.semanticAnalyzer).toBeDefined();
      expect(orchestrator.interactionMapper).toBeDefined();
      expect(orchestrator.accessibilityChecker).toBeDefined();
      expect(orchestrator.designTokenLinker).toBeDefined();
      expect(orchestrator.layoutIntentExtractor).toBeDefined();
    });

    it('should analyze context intelligence successfully', async () => {
      const result = await orchestrator.analyzeContextIntelligence(
        mockDesignSpec,
        mockPrototypeData,
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.semantic).toBeDefined();
      expect(result.interaction).toBeDefined();
      expect(result.accessibility).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.layout).toBeDefined();
      expect(result.synthesis).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.integration).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should calculate confidence scores correctly', async () => {
      const result = await orchestrator.analyzeContextIntelligence(
        mockDesignSpec,
        mockPrototypeData,
        mockDesignContext
      );

      expect(result.synthesis.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(result.synthesis.overallConfidence).toBeLessThanOrEqual(1);
      expect(result.synthesis.keyInsights).toBeInstanceOf(Array);
    });

    it('should generate analysis ID correctly', () => {
      const id1 = orchestrator.generateAnalysisId(mockDesignSpec, mockDesignContext);
      const id2 = orchestrator.generateAnalysisId(mockDesignSpec, mockDesignContext);
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).toMatch(/^analysis_\d+_[a-zA-Z0-9]+$/);
      // IDs should be different due to timestamp
      expect(id1).not.toBe(id2);
    });

    it('should handle empty design specs gracefully', async () => {
      const emptySpec = {
        components: [],
        designTokens: {},
        metadata: { totalNodes: 0, componentCount: 0 }
      };

      const result = await orchestrator.analyzeContextIntelligence(
        emptySpec,
        { interactions: [], prototypes: [] },
        { purpose: 'Empty test' }
      );

      expect(result).toBeDefined();
      expect(result.metadata.componentsAnalyzed).toBe(0);
      expect(result.synthesis.overallConfidence).toBeGreaterThanOrEqual(0);
    });

    it('should track performance metrics correctly', async () => {
      const startTime = Date.now();
      const result = await orchestrator.analyzeContextIntelligence(
        mockDesignSpec,
        mockPrototypeData,
        mockDesignContext
      );
      const endTime = Date.now();

      expect(result.metadata.analysisTime).toBeGreaterThan(0);
      expect(result.metadata.analysisTime).toBeLessThan(endTime - startTime + 100); // Allow some margin
      expect(result.metadata.componentsAnalyzed).toBe(mockDesignSpec.components.length);
    });
  });

  describe('SemanticAnalyzer', () => {
    let analyzer;

    beforeEach(() => {
      analyzer = new SemanticAnalyzer();
    });

    afterEach(() => {
      analyzer = null;
    });

    it('should initialize correctly', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.logger).toBeDefined();
      expect(analyzer.errorHandler).toBeDefined();
    });

    it('should analyze semantic intent for components', async () => {
      const result = await analyzer.analyzeSemanticIntent(
        mockDesignSpec.components,
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.components).toBeInstanceOf(Array);
      expect(result.components.length).toBe(mockDesignSpec.components.length);
      expect(result.patterns).toBeInstanceOf(Array);
      expect(result.confidence).toBeDefined();
      expect(result.confidence.overall).toBeGreaterThanOrEqual(0);
      expect(result.confidence.overall).toBeLessThanOrEqual(1);
    });

    it('should detect component intent correctly', async () => {
      const intent = await analyzer.detectComponentIntent(mockComponent, mockDesignContext);
      
      expect(intent).toBeDefined();
      expect(intent.intent).toBeDefined();
      expect(intent.confidence).toBeGreaterThanOrEqual(0);
      expect(intent.confidence).toBeLessThanOrEqual(1);
    });

    it('should analyze naming signals', () => {
      const signals = analyzer.analyzeNamingSignals(mockComponent);
      expect(signals).toBeDefined();
      expect(signals.confidence).toBeGreaterThanOrEqual(0);
      expect(signals.keywords).toBeInstanceOf(Array);
    });

    it('should analyze visual signals', () => {
      const signals = analyzer.analyzeVisualSignals(mockComponent);
      
      expect(signals).toBeDefined();
      expect(signals.confidence).toBeGreaterThanOrEqual(0);
      expect(signals.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle components with missing properties gracefully', async () => {
      const incompleteComponent = {
        id: 'incomplete-1',
        name: 'Incomplete Component',
        type: 'FRAME'
        // Missing properties, geometry, style
      };

      const result = await analyzer.analyzeSemanticIntent(
        [incompleteComponent],
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.components).toHaveLength(1);
      // Should still provide some analysis even with missing data
      expect(result.components[0].intent).toBeDefined();
    });
  });

  describe('InteractionMapper', () => {
    let mapper;

    beforeEach(() => {
      mapper = new InteractionMapper();
    });

    afterEach(() => {
      mapper = null;
    });

    it('should initialize correctly', () => {
      expect(mapper).toBeDefined();
      expect(mapper.logger).toBeDefined();
      expect(mapper.errorHandler).toBeDefined();
    });

    it('should map interaction flows', async () => {
      const result = await mapper.mapInteractionFlows(
        mockDesignSpec.components,
        mockPrototypeData,
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.interactiveComponents).toBeInstanceOf(Array);
      expect(result.userJourneys).toBeInstanceOf(Array);
      expect(result.navigationFlow).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should identify interactive components', async () => {
      const interactiveComponents = await mapper.identifyInteractiveComponents(
        mockDesignSpec.components,
        mockPrototypeData.interactions
      );

      expect(interactiveComponents).toBeInstanceOf(Array);
      expect(interactiveComponents.length).toBeGreaterThan(0);
      
      const interactive = interactiveComponents[0];
      expect(interactive.id).toBeDefined();
      expect(interactive.interactivity).toBeDefined();
      expect(interactive.interactivity.isInteractive).toBe(true);
    });

    it('should analyze component interactivity', () => {
      const interactivity = mapper.analyzeComponentInteractivity(
        mockComponent,
        mockPrototypeData.interactions
      );

      expect(interactivity).toBeDefined();
      expect(interactivity.isInteractive).toBe(true);
      expect(interactivity.interactionTypes).toBeInstanceOf(Array);
      expect(interactivity.confidence).toBeGreaterThanOrEqual(0);
      expect(interactivity.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle components with no interactions', async () => {
      const result = await mapper.mapInteractionFlows(
        mockDesignSpec.components,
        { interactions: [], prototypes: [] },
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.interactiveComponents).toBeInstanceOf(Array);
      expect(result.userJourneys).toBeInstanceOf(Array);
      // Should still complete successfully even with no interactions
    });
  });

  describe('AccessibilityChecker', () => {
    let checker;

    beforeEach(() => {
      checker = new AccessibilityChecker();
    });

    afterEach(() => {
      checker = null;
    });

    it('should initialize correctly', () => {
      expect(checker).toBeDefined();
      expect(checker.logger).toBeDefined();
      expect(checker.errorHandler).toBeDefined();
    });

    it('should analyze accessibility compliance', async () => {
      const result = await checker.analyzeAccessibility(
        mockDesignSpec.components,
        [],
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.compliance).toBeDefined();
      expect(result.compliance.overall).toBeDefined();
      expect(result.compliance.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.compliance.overall.score).toBeLessThanOrEqual(1);
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.recommendations).toBeDefined();
    });

    it('should check perceivable compliance (WCAG Principle 1)', async () => {
      const result = await checker.analyzePerceivable(mockDesignSpec.components);

      expect(result).toBeDefined();
      expect(result.colorContrast).toBeDefined();
      expect(result.textAlternatives).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should calculate color contrast ratios', () => {
      const contrast = checker.calculateColorContrast('#0066CC', '#FFFFFF');
      
      expect(contrast).toBeDefined();
      expect(contrast.ratio).toBeGreaterThan(0);
      expect(contrast.wcagLevel).toBeDefined();
      expect(['AAA', 'AA', 'fail']).toContain(contrast.wcagLevel);
    });

    it('should validate touch target sizes', () => {
      const validation = checker.validateTouchTargetSize(mockComponent.geometry);
      
      expect(validation).toBeDefined();
      expect(validation.isValid).toBeDefined();
      expect(validation.actualSize).toBeDefined();
      expect(validation.recommendedSize).toBe(44); // iOS/Material Design standard
    });

    it('should handle components with missing style information', async () => {
      const componentWithoutStyle = {
        ...mockComponent,
        style: undefined,
        properties: {
          width: 120,
          height: 40
        }
      };

      const result = await checker.analyzeAccessibility(
        [componentWithoutStyle],
        [],
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.compliance.overall.score).toBeGreaterThanOrEqual(0);
      // Should handle missing style gracefully
    });
  });

  describe('DesignTokenLinker', () => {
    let linker;

    beforeEach(() => {
      linker = new DesignTokenLinker();
    });

    afterEach(() => {
      linker = null;
    });

    it('should initialize correctly', () => {
      expect(linker).toBeDefined();
      expect(linker.logger).toBeDefined();
      expect(linker.errorHandler).toBeDefined();
    });

    it('should analyze design tokens', async () => {
      const result = await linker.analyzeDesignTokens(
        mockDesignSpec.designTokens,
        mockDesignSpec.components,
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.systemDetection).toBeDefined();
      expect(result.tokenMapping).toBeDefined();
      expect(result.compliance).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should detect design system from tokens', async () => {
      const detection = await linker.detectDesignSystem(mockDesignSpec.designTokens);
      
      expect(detection).toBeDefined();
      expect(detection.detectedSystem).toBeDefined();
      expect(detection.confidence).toBeGreaterThanOrEqual(0);
      expect(detection.confidence).toBeLessThanOrEqual(1);
      expect(detection.evidence).toBeInstanceOf(Array);
    });

    it('should analyze color tokens', async () => {
      const analysis = await linker.analyzeColorTokens(mockDesignSpec.designTokens.colors);
      
      expect(analysis).toBeDefined();
      expect(analysis.palette).toBeDefined();
      expect(analysis.systemMatch).toBeDefined();
      expect(analysis.coverage).toBeGreaterThanOrEqual(0);
      expect(analysis.coverage).toBeLessThanOrEqual(1);
    });

    it('should calculate system match score', async () => {
      const score = await linker.calculateSystemMatch(
        mockDesignSpec.designTokens,
        'Material Design'
      );
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should handle empty design tokens', async () => {
      const result = await linker.analyzeDesignTokens(
        { colors: [], typography: [], spacing: [] },
        mockDesignSpec.components,
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.systemDetection.detectedSystem).toBe('Custom');
      expect(result.compliance.overall).toBeGreaterThanOrEqual(0);
    });
  });

  describe('LayoutIntentExtractor', () => {
    let extractor;

    beforeEach(() => {
      extractor = new LayoutIntentExtractor();
    });

    afterEach(() => {
      extractor = null;
    });

    it('should initialize correctly', () => {
      expect(extractor).toBeDefined();
      expect(extractor.logger).toBeDefined();
      expect(extractor.errorHandler).toBeDefined();
    });

    it('should extract layout intent', async () => {
      const result = await extractor.extractLayoutIntent(
        mockDesignSpec.components,
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.gridSystems).toBeInstanceOf(Array);
      expect(result.alignmentPatterns).toBeInstanceOf(Array);
      expect(result.hierarchicalStructure).toBeDefined();
      expect(result.responsivePatterns).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should detect grid systems', () => {
      const grids = extractor.detectGridSystems(mockDesignSpec.components);
      
      expect(grids).toBeInstanceOf(Array);
      // Each grid should have required properties
      grids.forEach(grid => {
        expect(grid.type).toBeDefined();
        expect(grid.confidence).toBeGreaterThanOrEqual(0);
        expect(grid.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should analyze alignment patterns', () => {
      const patterns = extractor.analyzeAlignmentPatterns(mockDesignSpec.components);
      
      expect(patterns).toBeInstanceOf(Array);
      patterns.forEach(pattern => {
        expect(pattern.type).toBeDefined();
        expect(pattern.components).toBeInstanceOf(Array);
        expect(pattern.confidence).toBeGreaterThanOrEqual(0);
      });
    });

    it('should extract hierarchical structure', () => {
      const hierarchy = extractor.extractHierarchicalStructure(mockDesignSpec.components);
      
      expect(hierarchy).toBeDefined();
      expect(hierarchy.levels).toBeInstanceOf(Array);
      expect(hierarchy.relationships).toBeInstanceOf(Array);
      expect(hierarchy.depth).toBeGreaterThanOrEqual(0);
    });

    it('should handle single component layouts', async () => {
      const result = await extractor.extractLayoutIntent(
        [mockComponent],
        mockDesignContext
      );

      expect(result).toBeDefined();
      expect(result.gridSystems).toBeInstanceOf(Array);
      expect(result.alignmentPatterns).toBeInstanceOf(Array);
      // Should handle single components gracefully
    });
  });

  describe('Integration Tests', () => {
    it('should have all components work together in orchestrator', async () => {
      const orchestrator = new ContextIntelligenceOrchestrator({
        enableCaching: false,
        parallelAnalysis: false
      });

      const result = await orchestrator.analyzeContextIntelligence(
        mockDesignSpec,
        mockPrototypeData,
        mockDesignContext
      );

      // Verify that all analysis components produced results
      expect(result.semantic.components).toHaveLength(1);
      expect(result.interaction.interactiveComponents).toHaveLength(1);
      expect(result.accessibility.compliance.overall.score).toBeGreaterThanOrEqual(0);
      expect(result.tokens.systemDetection.detectedSystem).toBeDefined();
      expect(result.layout.gridSystems).toBeInstanceOf(Array);

      // Verify synthesis combines all results
      expect(result.synthesis.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(result.synthesis.keyInsights.length).toBeGreaterThan(0);
    });

    it('should handle error conditions gracefully', async () => {
      const orchestrator = new ContextIntelligenceOrchestrator({
        enableCaching: false,
        parallelAnalysis: false
      });

      // Test with malformed data
      const malformedSpec = {
        components: [{ id: 'broken', name: null }],
        designTokens: null,
        metadata: undefined
      };

      const result = await orchestrator.analyzeContextIntelligence(
        malformedSpec,
        {},
        {}
      );

      // Should still produce a result even with malformed data
      expect(result).toBeDefined();
      expect(result.metadata.analysisTime).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should complete analysis within performance targets', async () => {
      const orchestrator = new ContextIntelligenceOrchestrator({
        enableCaching: false,
        parallelAnalysis: true
      });

      const startTime = Date.now();
      const result = await orchestrator.analyzeContextIntelligence(
        mockDesignSpec,
        mockPrototypeData,
        mockDesignContext
      );
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      
      // Should complete in under 1 second for single component
      expect(totalTime).toBeLessThan(1000);
      expect(result.metadata.analysisTime).toBeLessThan(500);
    });

    it('should handle multiple components efficiently', async () => {
      const orchestrator = new ContextIntelligenceOrchestrator({
        enableCaching: false,
        parallelAnalysis: true
      });

      // Create larger test data
      const largeDesignSpec = {
        ...mockDesignSpec,
        components: Array.from({ length: 10 }, (_, i) => ({
          ...mockComponent,
          id: `component-${i}`,
          name: `Component ${i}`
        }))
      };

      const startTime = Date.now();
      const result = await orchestrator.analyzeContextIntelligence(
        largeDesignSpec,
        mockPrototypeData,
        mockDesignContext
      );
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const timePerComponent = totalTime / largeDesignSpec.components.length;

      // Should scale efficiently
      expect(timePerComponent).toBeLessThan(100); // Less than 100ms per component
      expect(result.metadata.componentsAnalyzed).toBe(10);
    });
  });
});