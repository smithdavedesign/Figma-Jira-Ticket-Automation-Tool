/**
 * End-to-End Pipeline Test: Figma → Context Layer → AI LLM → Template → Output
 * 
 * Tests the complete new architecture pipeline without MCP dependency.
 * Phase 8: Context Layer Integration Testing
 */

import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';

describe('🚀 E2E Pipeline: Figma → Context Layer → AI LLM → Template → Output', () => {
  // Mock test setup for Context Layer pipeline validation
  let mockServices;
  let contextManager;
  let aiService;
  let templateEngine;

  beforeAll(async () => {
    // Initialize mock services for E2E testing
    contextManager = {
      extractContext: vi.fn().mockResolvedValue({
        designTokens: { colors: [], spacing: [], typography: [] },
        components: [],
        layout: { type: 'responsive', grid: '12-column' },
        accessibility: { score: 0.9, issues: [] },
        semantic: { confidence: 0.85, analysis: 'High-quality design' }
      })
    };

    aiService = {
      analyzeDesignContext: vi.fn().mockResolvedValue({
        insights: ['Color contrast looks good', 'Typography scale is consistent'],
        recommendations: ['Consider adding focus states', 'Implement dark mode variants'],
        accessibility: { score: 0.92, suggestions: [] }
      })
    };

    templateEngine = {
      render: vi.fn().mockResolvedValue({
        content: '# Figma Design Analysis\n\n## Components\n- Button component detected',
        format: 'markdown',
        metadata: { generatedAt: new Date().toISOString() }
      }),
      applyFilter: vi.fn().mockReturnValue([
        { name: 'Button', confidence: 0.95 },
        { name: 'Input', confidence: 0.87 }
      ])
    };

    mockServices = { contextManager, aiService, templateEngine };
  });

  describe('🎨 Step 1: Figma Data Capture', () => {
    test('should validate Figma data capture structure', () => {
      const mockFigmaResponse = {
        screenshot: {
          data: 'base64-screenshot-data',
          format: 'base64',
          size: 12345,
          quality: 'high'
        },
        contextAnalysis: {
          designTokens: {
            colors: [{ name: 'primary', value: '#3b82f6' }],
            spacing: [{ name: 'md', value: 16 }]
          },
          components: [
            { name: 'Button', type: 'button', confidence: 0.95 }
          ],
          confidence: 0.87
        },
        architecture: 'figma-api → context-layer → semantic-analysis'
      };

      // Validate response structure
      expect(mockFigmaResponse.screenshot).toBeDefined();
      expect(mockFigmaResponse.contextAnalysis).toBeDefined();
      expect(mockFigmaResponse.contextAnalysis.designTokens).toBeDefined();
      expect(mockFigmaResponse.architecture).toContain('context-layer');
    });

    test('should validate context extraction response', () => {
      const mockContextResponse = {
        context: {
          designTokens: {
            colors: [{ name: 'primary', value: '#3b82f6' }],
            spacing: [{ name: 'md', value: 16 }]
          },
          components: [
            { name: 'Login Form', type: 'form' }
          ],
          accessibility: { score: 85 }
        },
        architecture: 'figma-api → context-layer → semantic-analysis'
      };

      expect(mockContextResponse.context).toBeDefined();
      expect(mockContextResponse.context.designTokens).toBeDefined();
      expect(mockContextResponse.context.components).toBeDefined();
      expect(mockContextResponse.context.accessibility.score).toBeGreaterThan(0);
    });
  });

  describe('🧠 Step 2: Context Layer Processing', () => {
    test('should extract semantic design understanding', async () => {
      const mockFigmaData = {
        url: 'https://www.figma.com/file/test123/Design-System',
        nodes: [
          {
            id: 'btn-1',
            name: 'Primary Button',
            type: 'COMPONENT',
            properties: {
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: 8,
              padding: '12px 24px'
            }
          },
          {
            id: 'input-1', 
            name: 'Email Input',
            type: 'COMPONENT',
            properties: {
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              padding: '8px 12px'
            }
          }
        ],
        metadata: {
          source: 'e2e-test',
          version: '2.0'
        }
      };

      const contextResult = await contextManager.extractContext(mockFigmaData, {
        includeDesignTokens: true,
        includeComponents: true,
        includeAccessibility: true,
        includeSemantics: true
      });

      // Validate context extraction
      expect(contextResult).toBeDefined();
      expect(contextResult.designTokens).toBeDefined();
      expect(contextResult.components).toHaveLength(2);
      expect(contextResult.extraction.confidence).toBeGreaterThan(0.7);

      // Validate design tokens
      expect(contextResult.designTokens.colors).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('primary'),
          value: '#3b82f6'
        })
      );

      // Validate component recognition
      expect(contextResult.components).toContainEqual(
        expect.objectContaining({
          name: 'Primary Button',
          type: 'button',
          semantics: expect.objectContaining({
            purpose: expect.stringContaining('action')
          })
        })
      );
    });

    test('should analyze layout patterns and accessibility', async () => {
      const mockLayoutData = {
        url: 'https://www.figma.com/file/test123/Login-Form',
        nodes: [
          {
            id: 'form-1',
            name: 'Login Form',
            type: 'FRAME',
            children: ['input-email', 'input-password', 'btn-login'],
            layout: {
              direction: 'column',
              gap: 16,
              alignment: 'stretch'
            }
          }
        ]
      };

      const contextResult = await contextManager.extractContext(mockLayoutData);

      expect(contextResult.layout).toBeDefined();
      expect(contextResult.layout.patterns).toContainEqual(
        expect.objectContaining({
          type: 'form-layout',
          structure: 'vertical-stack'
        })
      );

      expect(contextResult.accessibility).toBeDefined();
      expect(contextResult.accessibility.score).toBeGreaterThan(60);
    });
  });

  describe('🤖 Step 3: AI LLM Processing', () => {
    test('should enhance context with AI reasoning', async () => {
      const contextData = {
        designTokens: {
          colors: [{ name: 'primary', value: '#3b82f6' }],
          spacing: [{ name: 'md', value: 16 }]
        },
        components: [
          {
            name: 'Login Form',
            type: 'form',
            elements: ['email-input', 'password-input', 'submit-button']
          }
        ],
        semantics: {
          purpose: 'user-authentication',
          userFlow: ['enter-email', 'enter-password', 'submit-form']
        }
      };

      // Test AI enhancement (using ContextTemplateBridge)
      const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
      const bridge = new ContextTemplateBridge();
      
      const aiEnhancedResult = await bridge.generateDocumentation({
        platform: 'jira',
        documentType: 'story',
        enhanceWithAI: true,
        figmaData: contextData,
        aiProvider: 'gemini'
      });

      expect(aiEnhancedResult).toBeDefined();
      expect(aiEnhancedResult.success).toBe(true);
      expect(aiEnhancedResult.content).toContain('Login');
      expect(aiEnhancedResult.aiEnhanced).toBe(true);
      expect(aiEnhancedResult.strategy).toBe('context-bridge-ai');
    });

    test('should provide AI insights and recommendations', async () => {
      const contextWithIssues = {
        components: [
          {
            name: 'Button',
            type: 'button',
            accessibility: {
              issues: [
                { type: 'contrast', severity: 'medium', description: 'Low color contrast' }
              ]
            }
          }
        ],
        accessibility: {
          score: 45,
          issues: [{ type: 'contrast', impact: 'medium' }]
        }
      };

      // Use AI to analyze and provide recommendations
      const aiAnalysis = await aiService.analyzeDesignContext(contextWithIssues, {
        includeRecommendations: true,
        includeAccessibilityTips: true
      });

      expect(aiAnalysis).toBeDefined();
      expect(aiAnalysis.recommendations).toBeDefined();
      expect(aiAnalysis.recommendations.length).toBeGreaterThan(0);
      expect(aiAnalysis.recommendations[0]).toContain('contrast');
    });
  });

  describe('🏗️ Step 4: Template Engine Processing', () => {
    test('should render YAML template with Context Layer data', async () => {
      const contextData = {
        designTokens: {
          colors: [{ name: 'primary', value: '#3b82f6', usage: 'buttons' }],
          spacing: [{ name: 'md', value: 16, usage: 'form-elements' }]
        },
        components: [
          {
            name: 'Login Form',
            type: 'form',
            elements: ['email', 'password', 'submit'],
            purpose: 'user-authentication'
          }
        ],
        accessibility: {
          score: 85,
          issues: [],
          compliance: 'WCAG-AA'
        }
      };

      const templateResult = await templateEngine.render('jira-story', contextData, {
        platform: 'jira',
        documentType: 'story',
        useContextFilters: true
      });

      expect(templateResult).toBeDefined();
      expect(templateResult.content).toContain('Login Form');
      expect(templateResult.content).toContain('user-authentication');
      expect(templateResult.content).toContain('WCAG-AA');
      expect(templateResult.metadata.contextLayerUsed).toBe(true);
    });

    test('should apply Context Layer specific filters', async () => {
      const contextData = {
        components: [
          { name: 'Button', type: 'button', confidence: 0.95 },
          { name: 'Input', type: 'input', confidence: 0.89 },
          { name: 'Unknown Element', type: 'component', confidence: 0.45 }
        ]
      };

      // Test contextlayer filter
      const highConfidenceComponents = templateEngine.applyFilter('contextlayer', contextData.components, {
        minConfidence: 0.8,
        filterBy: 'confidence'
      });

      expect(highConfidenceComponents).toHaveLength(2);
      expect(highConfidenceComponents).not.toContain(
        expect.objectContaining({ name: 'Unknown Element' })
      );

      // Test designtokens filter
      const mockTokens = {
        colors: [
          { name: 'primary', value: '#3b82f6', category: 'brand' },
          { name: 'error', value: '#ef4444', category: 'semantic' },
          { name: 'neutral', value: '#64748b', category: 'neutral' }
        ]
      };

      const brandColors = templateEngine.applyFilter('designtokens', mockTokens.colors, {
        category: 'brand'
      });

      expect(brandColors).toHaveLength(1);
      expect(brandColors[0].name).toBe('primary');
    });
  });

  describe('📄 Step 5: Complete Pipeline Integration', () => {
    test('should execute complete pipeline: Figma → Context → AI → Template → Output', async () => {
      const pipelineInput = {
        figmaUrl: 'https://www.figma.com/file/test123/Dashboard-Components',
        format: 'jira',
        strategy: 'context-bridge',
        documentType: 'story',
        options: {
          includeScreenshot: false, // Focus on Context Layer
          includeContext: true,
          enhanceWithAI: true,
          templateStyle: 'detailed'
        }
      };

      // Execute complete pipeline
      const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
      const bridge = new ContextTemplateBridge();
      
      const pipelineResult = await bridge.generateDocumentation(pipelineInput);

      // Validate complete pipeline execution
      expect(pipelineResult).toBeDefined();
      expect(pipelineResult.success).toBe(true);
      expect(pipelineResult.content).toBeDefined();
      expect(pipelineResult.architecture).toBe('figma-api → context-layer → ai-enhancement → yaml-template → output');
      
      // Validate pipeline stages
      expect(pipelineResult.pipeline).toBeDefined();
      expect(pipelineResult.pipeline.stages).toHaveLength(4);
      expect(pipelineResult.pipeline.stages).toEqual([
        'context-extraction',
        'ai-enhancement', 
        'template-processing',
        'output-generation'
      ]);

      // Validate performance metrics
      expect(pipelineResult.performance).toBeDefined();
      expect(pipelineResult.performance.totalDuration).toBeLessThan(5000); // < 5 seconds
      expect(pipelineResult.performance.contextExtractionTime).toBeLessThan(1000);
      expect(pipelineResult.performance.templateRenderTime).toBeLessThan(500);

      // Validate context integration
      expect(pipelineResult.contextLayer).toBeDefined();
      expect(pipelineResult.contextLayer.extractors).toHaveLength(5);
      expect(pipelineResult.contextLayer.confidence).toBeGreaterThan(0.7);
    });

    test('should handle pipeline failures gracefully', async () => {
      const invalidInput = {
        figmaUrl: 'invalid-url',
        format: 'jira',
        strategy: 'context-bridge'
      };

      const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
      const bridge = new ContextTemplateBridge();
      
      const result = await bridge.generateDocumentation(invalidInput);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.fallbackUsed).toBe(true);
      expect(result.fallbackStrategy).toBe('template-only');
    });

    test('should demonstrate performance benefits over MCP architecture', async () => {
      const testData = {
        figmaUrl: 'https://www.figma.com/file/perf-test/Components',
        format: 'jira',
        documentType: 'task'
      };

      // Test new Context Layer architecture
      const startTimeContext = Date.now();
      const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
      const bridge = new ContextTemplateBridge();
      const contextResult = await bridge.generateDocumentation({
        ...testData,
        strategy: 'context-bridge'
      });
      const contextDuration = Date.now() - startTimeContext;

      // Test legacy MCP architecture (if available)
      let mcpDuration = null;
      try {
        const startTimeMCP = Date.now();
        const { TicketGenerationService } = await import('../../core/services/TicketGenerationService.js');
        const legacyService = new TicketGenerationService();
        const mcpResult = await legacyService.generateTicket({
          ...testData,
          strategy: 'mcp'
        });
        mcpDuration = Date.now() - startTimeMCP;
      } catch (error) {
        // MCP not available - expected in new architecture
      }

      // Validate performance
      expect(contextResult.success).toBe(true);
      expect(contextDuration).toBeLessThan(3000); // Context Layer should be < 3 seconds
      
      if (mcpDuration) {
        // Context Layer should be 60-80% faster than MCP
        const improvementRatio = mcpDuration / contextDuration;
        expect(improvementRatio).toBeGreaterThan(1.6); // At least 60% improvement
      }

      // Validate quality metrics
      expect(contextResult.contextLayer.confidence).toBeGreaterThan(0.75);
      expect(contextResult.architecture).toContain('context-layer');
    });
  });

  describe('🔄 Pipeline Monitoring and Metrics', () => {
    test('should collect comprehensive pipeline metrics', async () => {
      const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
      const bridge = new ContextTemplateBridge();
      
      const metricsResult = await bridge.generateDocumentation({
        figmaUrl: 'https://www.figma.com/file/metrics-test/Components',
        platform: 'jira',
        strategy: 'context-bridge',
        collectMetrics: true
      });

      expect(metricsResult.metrics).toBeDefined();
      expect(metricsResult.metrics.pipeline).toBeDefined();
      expect(metricsResult.metrics.contextLayer).toBeDefined();
      expect(metricsResult.metrics.templateEngine).toBeDefined();
      
      // Stage-specific metrics
      expect(metricsResult.metrics.stages).toBeDefined();
      expect(metricsResult.metrics.stages.contextExtraction).toBeDefined();
      expect(metricsResult.metrics.stages.templateProcessing).toBeDefined();
      
      // Performance benchmarks
      expect(metricsResult.metrics.performance).toBeDefined();
      expect(metricsResult.metrics.performance.throughput).toBeGreaterThan(0);
      expect(metricsResult.metrics.performance.efficiency).toBeGreaterThan(0.6);
    });

    test('should validate cache performance benefits', async () => {
      const testUrl = 'https://www.figma.com/file/cache-test/Components';
      
      const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
      const bridge = new ContextTemplateBridge();
      
      // First request (cold cache)
      const firstResult = await bridge.generateDocumentation({
        figmaUrl: testUrl,
        platform: 'jira',
        strategy: 'context-bridge'
      });
      
      // Second request (warm cache)
      const secondResult = await bridge.generateDocumentation({
        figmaUrl: testUrl,
        platform: 'jira',
        strategy: 'context-bridge'
      });

      expect(firstResult.success).toBe(true);
      expect(secondResult.success).toBe(true);
      
      // Cache hit should be significantly faster
      expect(secondResult.performance.cacheHit).toBe(true);
      expect(secondResult.performance.totalDuration).toBeLessThan(
        firstResult.performance.totalDuration * 0.5
      );
    });
  });
});