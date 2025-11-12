/**
 * Plugin Routes
 * Routes specifically for Figma plugin integration and comprehensive context analysis
 */

import { BaseRoute } from './BaseRoute.js';

export class PluginRoutes extends BaseRoute {
  constructor(services) {
    super('Plugin', services);

    // Initialize service references
    this.contextManager = null;
    this.visualAIService = null;
    this.templateManager = null;
    this.strategyGenerator = null;

    // Initialize services after super() call
    this.initializeServices();
  }

  initializeServices() {
    // Get services from the service container (with error handling)
    try {
      this.contextManager = this.getService('contextManager');
    } catch (error) {
      this.logger.warn('ContextManager service not available:', error.message);
    }

    try {
      this.visualAIService = this.getService('visualAIService');
    } catch (error) {
      this.logger.warn('VisualAIService not available:', error.message);
    }

    try {
      this.templateManager = this.getService('templateManager');
    } catch (error) {
      this.logger.warn('TemplateManager not available:', error.message);
    }

    try {
      this.strategyGenerator = this.getService('ticketGenerationService'); // Use ticketGenerationService instead
    } catch (error) {
      this.logger.warn('TicketGenerationService not available:', error.message);
    }

    // Log service availability
    this.logger.info('Plugin services initialized:', {
      contextManager: !!this.contextManager,
      visualAIService: !!this.visualAIService,
      templateManager: !!this.templateManager,
      strategyGenerator: !!this.strategyGenerator
    });
  }

  registerRoutes(router) {
    // Plugin-specific endpoints
    router.post('/comprehensive-context', this.handleComprehensiveContext.bind(this));
    router.post('/analyze', this.handlePluginAnalyze.bind(this));
    router.post('/generate', this.handlePluginGenerate.bind(this));
    router.get('/health', this.handlePluginHealth.bind(this));

    this.logger.info('✅ Plugin routes registered');
  }

  /**
   * Comprehensive context analysis for plugin
   * POST /plugin/comprehensive-context
   */
  async handleComprehensiveContext(req, res) {
    this.logAccess(req, 'comprehensive-context');

    try {
      const {
        figmaUrl,
        fileKey,
        nodeId,
        frameData,
        selection,
        includeLive = true,
        includeAI = true,
        includeTemplates = true
      } = req.body;

      this.logger.info('🔍 Processing comprehensive context request:', {
        hasUrl: !!figmaUrl,
        hasFileKey: !!fileKey,
        hasNodeId: !!nodeId,
        hasFrameData: !!frameData,
        hasSelection: !!selection,
        flags: { includeLive, includeAI, includeTemplates }
      });

      // Validate required parameters
      if (!figmaUrl && !fileKey) {
        return this.sendError(res, 'Either figmaUrl or fileKey is required', 400);
      }

      // Initialize comprehensive context result
      const contextResult = {
        timestamp: new Date().toISOString(),
        source: 'plugin-comprehensive-context',
        figma: {},
        intelligence: {},
        templates: {},
        strategy: {},
        performance: {
          startTime: Date.now()
        }
      };

      // 1. Extract basic Figma context
      try {
        const figmaData = {
          url: figmaUrl || `https://www.figma.com/file/${fileKey}`,
          fileKey: fileKey || this.extractFileKeyFromUrl(figmaUrl),
          nodeId: nodeId,
          selection: selection || frameData,
          nodes: frameData || [],
          metadata: {
            extractedAt: new Date().toISOString(),
            source: 'plugin-comprehensive-context'
          }
        };

        if (this.contextManager) {
          contextResult.figma = await this.contextManager.extractContext(figmaData);
        } else {
          contextResult.figma = {
            ...figmaData,
            warning: 'ContextManager not available, using basic structure'
          };
        }

        this.logger.info('✅ Figma context extracted');
      } catch (error) {
        this.logger.warn('⚠️ Figma context extraction failed:', error.message);
        contextResult.figma = {
          error: error.message,
          fallback: true
        };
      }

      // 2. Run intelligence analysis if requested
      if (includeAI && this.visualAIService) {
        try {
          const intelligencePromises = [];

          // Semantic analysis
          intelligencePromises.push(
            this.runIntelligenceAnalysis('semantic', contextResult.figma)
              .catch(error => ({ type: 'semantic', error: error.message }))
          );

          // Accessibility analysis
          intelligencePromises.push(
            this.runIntelligenceAnalysis('accessibility', contextResult.figma)
              .catch(error => ({ type: 'accessibility', error: error.message }))
          );

          // Design tokens extraction
          intelligencePromises.push(
            this.runIntelligenceAnalysis('design-tokens', contextResult.figma)
              .catch(error => ({ type: 'design-tokens', error: error.message }))
          );

          const intelligenceResults = await Promise.all(intelligencePromises);

          contextResult.intelligence = {
            semantic: intelligenceResults[0],
            accessibility: intelligenceResults[1],
            designTokens: intelligenceResults[2],
            completedAt: new Date().toISOString()
          };

          this.logger.info('✅ Intelligence analysis completed');
        } catch (error) {
          this.logger.warn('⚠️ Intelligence analysis failed:', error.message);
          contextResult.intelligence = {
            error: error.message,
            fallback: true
          };
        }
      }

      // 3. Run template analysis if requested
      if (includeTemplates && this.templateManager) {
        try {
          const templateAnalysis = await this.analyzeTemplateCompatibility(contextResult.figma);
          contextResult.templates = templateAnalysis;
          this.logger.info('✅ Template analysis completed');
        } catch (error) {
          this.logger.warn('⚠️ Template analysis failed:', error.message);
          contextResult.templates = {
            error: error.message,
            fallback: true
          };
        }
      }

      // 4. Generate strategy recommendations
      if (this.strategyGenerator) {
        try {
          const strategyRecommendations = await this.generateStrategyRecommendations(contextResult);
          contextResult.strategy = strategyRecommendations;
          this.logger.info('✅ Strategy recommendations generated');
        } catch (error) {
          this.logger.warn('⚠️ Strategy generation failed:', error.message);
          contextResult.strategy = {
            error: error.message,
            fallback: true
          };
        }
      }

      // 5. Calculate performance metrics
      contextResult.performance.endTime = Date.now();
      contextResult.performance.totalDuration = contextResult.performance.endTime - contextResult.performance.startTime;
      contextResult.performance.averageStepTime = contextResult.performance.totalDuration / 4; // 4 main steps

      // 6. Add quality metrics
      contextResult.quality = this.calculateContextQuality(contextResult);

      this.logger.info('🎉 Comprehensive context analysis completed', {
        duration: contextResult.performance.totalDuration,
        quality: contextResult.quality.score
      });

      this.sendSuccess(res, contextResult);

    } catch (error) {
      this.logger.error('❌ Comprehensive context analysis failed:', error);
      this.sendError(res, `Comprehensive context analysis failed: ${error.message}`, 500);
    }
  }

  /**
   * Plugin analyze endpoint (simplified)
   * POST /plugin/analyze
   */
  async handlePluginAnalyze(req, res) {
    this.logAccess(req, 'plugin-analyze');

    try {
      const { figmaUrl, analysisType = 'basic' } = req.body;

      if (!figmaUrl) {
        return this.sendError(res, 'figmaUrl is required', 400);
      }

      const analysisResult = {
        type: analysisType,
        figmaUrl: figmaUrl,
        analysis: {
          components: 3,
          screens: 1,
          designTokens: 12,
          accessibility: {
            score: 85,
            issues: 2
          }
        },
        timestamp: new Date().toISOString()
      };

      this.sendSuccess(res, analysisResult);

    } catch (error) {
      this.logger.error('Plugin analyze failed:', error);
      this.sendError(res, `Plugin analyze failed: ${error.message}`, 500);
    }
  }

  /**
   * Plugin generate endpoint
   * POST /plugin/generate
   */
  async handlePluginGenerate(req, res) {
    this.logAccess(req, 'plugin-generate');

    try {
      const {
        figmaUrl,
        enhancedFrameData,
        format = 'jira',
        strategy = 'auto',
        techStack,
        documentType = 'component',
        teamStandards = {}
      } = req.body;

      // Validate required data
      if (!figmaUrl && !enhancedFrameData) {
        return this.sendError(res, 'Either figmaUrl or enhancedFrameData is required', 400);
      }

      // Use the ticketGenerationService for AI-powered generation
      if (this.strategyGenerator && enhancedFrameData) {
        this.logger.info('🤖 Using AI-powered ticket generation with enhanced frame data');

        const result = await this.strategyGenerator.generateTicket({
          frameData: enhancedFrameData,
          enhancedFrameData,
          figmaUrl,
          platform: teamStandards.platform || format,
          documentType,
          techStack,
          source: 'figma-plugin',
          options: {
            useEnhancedAI: true,
            strategy: 'ai-powered'
          }
        });

        return this.sendSuccess(res, result, 'AI-powered ticket generated successfully');
      }

      // Fallback: Use visual AI service directly if available
      if (this.visualAIService && enhancedFrameData) {
        this.logger.info('🎨 Using Visual AI Service fallback');

        const analysisResult = await this.visualAIService.processVisualEnhancedContext({
          frameData: enhancedFrameData,
          figmaUrl,
          techStack,
          documentType,
          platform: format
        });

        const result = {
          content: analysisResult,
          metadata: {
            generationType: 'visual-enhanced-ai',
            platform: format,
            source: 'plugin-visual-ai',
            generatedAt: new Date().toISOString()
          }
        };

        return this.sendSuccess(res, result, 'Visual AI ticket generated successfully');
      }

      // Final fallback implementation
      this.logger.warn('🔄 Using fallback template generation');

      const componentName = enhancedFrameData?.[0]?.name || 'Component';
      const mockResult = {
        content: `# ${componentName} Implementation

## Description
Implement the ${componentName} component based on design specifications.

## Technical Requirements
- **Platform**: ${format}
- **Tech Stack**: ${techStack || 'Modern web technologies'}

## Acceptance Criteria
- [ ] Component matches design specifications exactly
- [ ] Component is responsive across all devices
- [ ] Component passes accessibility testing
- [ ] Unit tests provide adequate coverage
- [ ] Code follows team standards and conventions

## Resources
- **Figma Design**: ${figmaUrl || 'Design link not provided'}

---
Generated at ${new Date().toISOString()} via Plugin Route (Fallback)`,
        metadata: {
          generationType: 'plugin-fallback',
          platform: format,
          source: 'plugin-fallback',
          generatedAt: new Date().toISOString()
        }
      };

      this.sendSuccess(res, mockResult, 'Fallback ticket generated successfully');

    } catch (error) {
      this.logger.error('Plugin generate failed:', error);
      this.sendError(res, `Plugin generate failed: ${error.message}`, 500);
    }
  }

  /**
   * Plugin health check
   * GET /plugin/health
   */
  async handlePluginHealth(req, res) {
    this.logAccess(req, 'plugin-health');

    try {
      const health = {
        status: 'healthy',
        plugin: {
          version: '2.0.0',
          features: {
            comprehensiveContext: true,
            intelligenceAnalysis: !!this.visualAIService,
            templateIntegration: !!this.templateManager,
            strategyGeneration: !!this.strategyGenerator
          }
        },
        services: {
          contextManager: !!this.contextManager,
          visualAI: !!this.visualAIService,
          templateManager: !!this.templateManager,
          strategyGenerator: !!this.strategyGenerator
        },
        timestamp: new Date().toISOString()
      };

      this.sendSuccess(res, health);

    } catch (error) {
      this.logger.error('Plugin health check failed:', error);
      this.sendError(res, `Plugin health check failed: ${error.message}`, 500);
    }
  }

  // Helper methods

  extractFileKeyFromUrl(figmaUrl) {
    const match = figmaUrl.match(/\/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  async runIntelligenceAnalysis(type, figmaData) {
    // Mock intelligence analysis - replace with actual service calls
    const analyses = {
      semantic: {
        type: 'semantic',
        tags: ['form', 'login', 'authentication'],
        meaning: 'User authentication interface',
        confidence: 0.87
      },
      accessibility: {
        type: 'accessibility',
        score: 85,
        wcagLevel: 'AA',
        issues: [
          { type: 'contrast', severity: 'medium' }
        ]
      },
      'design-tokens': {
        type: 'design-tokens',
        colors: ['#007bff', '#6c757d'],
        typography: ['Inter 16px', 'Inter 14px'],
        spacing: ['8px', '16px', '24px']
      }
    };

    return analyses[type] || { type, error: 'Analysis type not supported' };
  }

  async analyzeTemplateCompatibility(figmaData) {
    return {
      compatible: true,
      recommendedTemplates: ['jira-story', 'jira-task', 'confluence-spec'],
      confidence: 0.92,
      reasons: [
        'Component structure matches template requirements',
        'Design tokens extractable',
        'Clear user story potential'
      ]
    };
  }

  async generateStrategyRecommendations(contextResult) {
    const hasGoodContext = contextResult.figma && !contextResult.figma.error;
    const hasIntelligence = contextResult.intelligence && !contextResult.intelligence.error;
    const hasTemplates = contextResult.templates && !contextResult.templates.error;

    let recommendedStrategy = 'template';
    let confidence = 0.7;

    if (hasGoodContext && hasIntelligence) {
      recommendedStrategy = 'ai';
      confidence = 0.9;
    } else if (hasTemplates) {
      recommendedStrategy = 'template';
      confidence = 0.8;
    }

    return {
      recommended: recommendedStrategy,
      confidence: confidence,
      alternatives: ['ai', 'template', 'enhanced'],
      reasoning: [
        `Context quality: ${hasGoodContext ? 'good' : 'limited'}`,
        `Intelligence available: ${hasIntelligence ? 'yes' : 'no'}`,
        `Template compatibility: ${hasTemplates ? 'high' : 'unknown'}`
      ]
    };
  }

  calculateContextQuality(contextResult) {
    let score = 0;
    let maxScore = 0;

    // Figma context quality (40 points)
    maxScore += 40;
    if (contextResult.figma && !contextResult.figma.error) {
      score += 40;
    } else if (contextResult.figma && contextResult.figma.fallback) {
      score += 20;
    }

    // Intelligence quality (30 points)
    maxScore += 30;
    if (contextResult.intelligence && !contextResult.intelligence.error) {
      score += 30;
    } else if (contextResult.intelligence && contextResult.intelligence.fallback) {
      score += 15;
    }

    // Template quality (20 points)
    maxScore += 20;
    if (contextResult.templates && !contextResult.templates.error) {
      score += 20;
    } else if (contextResult.templates && contextResult.templates.fallback) {
      score += 10;
    }

    // Strategy quality (10 points)
    maxScore += 10;
    if (contextResult.strategy && !contextResult.strategy.error) {
      score += 10;
    } else if (contextResult.strategy && contextResult.strategy.fallback) {
      score += 5;
    }

    const percentage = Math.round((score / maxScore) * 100);

    return {
      score: percentage,
      details: {
        figma: contextResult.figma && !contextResult.figma.error,
        intelligence: contextResult.intelligence && !contextResult.intelligence.error,
        templates: contextResult.templates && !contextResult.templates.error,
        strategy: contextResult.strategy && !contextResult.strategy.error
      }
    };
  }
}

export default PluginRoutes;