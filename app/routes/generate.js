/**
 * 🚀 Unified Generation Routes
 *
 * Single endpoint for all documentation generation:
 * - JIRA tickets
 * - Wiki pages
 * - Code documentation
 * - Markdown files
 *
 * Replaces multiple scattered endpoints with one unified, flexible API.
 */

import { BaseRoute } from './BaseRoute.js';

export class GenerateRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Generate', serviceContainer);

    // Initialize Context-Template Bridge for direct flow
    this.contextBridge = null;
  }

  async initialize() {
    // Lazy-load Context-Template Bridge
    const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
    this.contextBridge = new ContextTemplateBridge();
    await this.contextBridge.initialize();

    this.logger.info('🌉 Context-Template Bridge initialized for direct flow');
  }

  /**
   * Register unified generation routes
   */
  registerRoutes(router) {
    // 🎯 Single unified endpoint for all documentation generation
    router.post('/api/generate', this.asyncHandler(this.handleGenerate.bind(this)));

    // 🧠 Strategy selection information endpoint
    router.get('/api/generate/strategy-info', this.asyncHandler(this.handleStrategyInfo.bind(this)));

    this.logger.info('✅ Generate routes registered with Context-Template Bridge');
  }

  /**
   * 🎯 Unified documentation generation handler
   * Supports: JIRA tickets, Wiki pages, Code documentation, Markdown
   */
  async handleGenerate(req, res) {
    this.logAccess(req, 'generate');

    try {
      // 1. Normalize request from any input format
      const generateRequest = this._normalizeGenerateRequest(req.body);

      // 2. Validate normalized request
      const validation = this._validateGenerateRequest(generateRequest);
      if (!validation.valid) {
        return this.sendError(res, 'Validation failed', 400, { errors: validation.errors });
      }

      // 3. Log generation request
      this.logger.info(`🎯 Generating ${generateRequest.format} documentation:`, {
        format: generateRequest.format,
        strategy: generateRequest.strategy,
        documentType: generateRequest.documentType,
        hasFrameData: !!generateRequest.frameData?.length,
        hasScreenshot: !!generateRequest.screenshot
      });

      // 4. Generate documentation using unified helper
      const result = await this._generateDocumentationUnified(generateRequest);

      // 5. Send success response
      this.sendSuccess(res, result, 'Documentation generated successfully', 200, {
        format: generateRequest.format,
        strategy: result.strategy,
        documentType: generateRequest.documentType
      });

    } catch (error) {
      this.logger.error('❌ Generation failed:', error);
      this.sendError(res, 'Generation failed', 500, {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }



  /**
   * 🎯 Unified documentation generation helper
   * @param {Object} request - Normalized generation request
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated documentation result
   */
  async _generateDocumentationUnified(request, options = {}) {
    // 1. FIRST: Determine the optimal strategy based on user intent and context
    const determinedStrategy = this._determineStrategy(request, options);

    this.logger.info(`🎯 Strategy Decision: ${request.strategy} → ${determinedStrategy}`, {
      originalStrategy: request.strategy,
      determinedStrategy: determinedStrategy,
      frameDataLength: request.frameData?.length || 0,
      hasScreenshot: !!request.screenshot
    });

    // 2. ARCHITECTURE ROUTING: Based on determined strategy, not original request

    // Use Context-Template Bridge for fast, template-based strategies
    if (this.contextBridge && ['context-bridge', 'template', 'auto'].includes(determinedStrategy)) {
      this.logger.info('🌉 Using Context-Template Bridge (MCP-free architecture)');

      try {
        // Direct path: Context Layer → Template Engine
        const result = await this.contextBridge.generateDocumentation({
          ...request,
          platform: request.format // Map format to platform for template selection
        });

        return this._formatGenerationResponse(result, 'context-bridge', request.format);

      } catch (error) {
        this.logger.warn('⚠️ Context-Template Bridge failed, falling back to legacy:', error.message);
        // Fall through to legacy MCP-based generation
      }
    }

    // Use Legacy MCP-based flow for AI-powered strategies
    this.logger.info(`🔄 Using legacy MCP-based generation for strategy: ${determinedStrategy}`);

    // 3. Get appropriate service based on output format
    const service = this._getGenerationService(request.format);

    // 4. Ensure service is initialized
    if (service.initialize && typeof service.initialize === 'function') {
      await service.initialize();
    }

    // 5. Generate content using the service with determined strategy
    let result;
    if (request.format === 'jira') {
      // Use existing ticket generation service with the determined strategy
      result = await service.generateTicket(request, determinedStrategy);
    } else {
      // Future: Use format-specific generation methods
      throw new Error(`Format ${request.format} not yet implemented`);
    }

    // 6. Format response consistently
    return this._formatGenerationResponse(result, determinedStrategy, request.format);
  } /**
   * 📝 Normalize different input formats to unified format
   */
  _normalizeGenerateRequest(rawRequest) {
    return {
      // Core data (normalized from frameData/enhancedFrameData)
      frameData: rawRequest.enhancedFrameData || rawRequest.frameData || [],
      enhancedFrameData: rawRequest.enhancedFrameData || rawRequest.frameData || [],

      // Output format selection
      format: rawRequest.format || rawRequest.platform || 'jira', // jira, wiki, code, markdown

      // Strategy selection (user preference)
      strategy: rawRequest.strategy || 'auto', // ai, template, enhanced, legacy, auto

      // Context data
      figmaUrl: rawRequest.figmaUrl,
      screenshot: rawRequest.screenshot,
      documentType: rawRequest.documentType || rawRequest.templateType || 'task',

      // Technical requirements
      techStack: rawRequest.techStack || rawRequest.teamStandards?.tech_stack,
      teamStandards: rawRequest.teamStandards,
      projectName: rawRequest.projectName,
      fileContext: rawRequest.fileContext,

      // Options
      includeScreenshot: rawRequest.includeScreenshot || false,
      testMode: rawRequest.testMode || false,

      // Preserve any additional fields
      ...rawRequest
    };
  }

  /**
   * ✅ Validate normalized generation request
   */
  _validateGenerateRequest(request) {
    const errors = [];

    // Validate format
    const supportedFormats = ['jira', 'wiki', 'code', 'markdown'];
    if (!supportedFormats.includes(request.format)) {
      errors.push(`Unsupported format: ${request.format}. Supported: ${supportedFormats.join(', ')}`);
    }

    // Validate strategy (context-bridge is internal, not user-selectable)
    const userSelectableStrategies = ['ai', 'template', 'enhanced', 'legacy', 'auto'];
    const internalStrategies = ['context-bridge']; // System-selected only
    const allStrategies = [...userSelectableStrategies, ...internalStrategies];

    if (!allStrategies.includes(request.strategy)) {
      errors.push(`Unsupported strategy: ${request.strategy}. User-selectable: ${userSelectableStrategies.join(', ')}`);
    }

    // Validate frame data (at least some content needed)
    const hasValidFrameData = request.frameData &&
      (Array.isArray(request.frameData) ? request.frameData.length > 0 : request.frameData);
    const hasScreenshot = request.screenshot;
    const hasFigmaUrl = request.figmaUrl;
    const isMockMode = request.mockMode;

    if (!hasValidFrameData && !hasScreenshot && !hasFigmaUrl && !isMockMode) {
      errors.push('At least one of frameData, screenshot, figmaUrl is required (or mockMode for testing)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * � Determine the best generation strategy
   */
  /**
   * 🎯 Determine the best generation strategy
   * Users don't choose strategies - we intelligently select based on context
   */
  _determineStrategy(request, _options) {
    // INTELLIGENT AUTO-SELECTION: Based on user context, not user choice

    // If user clicked "Generate AI Ticket" in UI (strategy: 'ai' hardcoded in UI)
    if (request.strategy === 'ai') {
      // Honor user's implicit AI preference, but choose best AI approach
      if (request.frameData?.length > 5 && request.screenshot) {
        this.logger.info('🤖 User wants AI → Using enhanced strategy (Template + AI hybrid)');
        return 'enhanced'; // Better than pure AI: template reliability + AI insights
      } else {
        this.logger.info('🤖 User wants AI → Using ai strategy (pure AI analysis)');
        return 'ai'; // User specifically wants AI, give them AI
      }
    }

    // User explicitly chose non-AI strategy (ALWAYS respect explicit API choice!)
    if (request.strategy && request.strategy !== 'auto' && request.strategy !== 'ai') {
      this.logger.info(`🎯 Using explicitly requested strategy: ${request.strategy}`);
      return request.strategy;
    }

    // For 'auto' or no strategy (API consumers), use intelligent selection
    if (request.strategy === 'auto' || !request.strategy) {
      // PRIORITY: Check if AI is explicitly requested
      if (request.useAI === true) {
        this.logger.info('🤖 Auto-selecting AI strategy (useAI: true explicitly set)');
        return 'ai'; // User wants AI generation
      }

      // NEW ARCHITECTURE: Prefer Context-Template Bridge for fast, reliable generation
      if (this.contextBridge) {
        this.logger.info('🌉 Auto-selecting context-bridge strategy (fast, semantic-aware)');
        return 'context-bridge'; // Direct Context Layer → Template flow
      }

      // LEGACY FALLBACK: Auto-detect based on input richness when Context Bridge unavailable
      if (request.frameData?.length > 10 && request.screenshot) {
        return 'enhanced'; // Rich data, use hybrid approach (better than pure AI)
      } else if (request.frameData?.length > 5) {
        return 'template'; // Medium data, use reliable templates
      } else if (request.frameData?.length > 0) {
        return 'template'; // Basic data, use template
      } else {
        return 'legacy'; // Minimal data, use legacy
      }
    }

    // Should never reach here, but fallback to user's choice
    return request.strategy;
  }

  /**
   * 🔧 Get appropriate generation service based on output format
   */
  _getGenerationService(format) {
    switch (format) {
    case 'jira':
      return this.getService('ticketService'); // Current JIRA ticket service
    case 'wiki':
      // Future: Wiki service for confluence/notion pages
      this.logger.warn('⚠️ Wiki format not yet implemented, using JIRA service');
      return this.getService('ticketService');
    case 'code':
      // Future: Code documentation service for README/docs
      this.logger.warn('⚠️ Code format not yet implemented, using JIRA service');
      return this.getService('ticketService');
    case 'markdown':
      // Future: Markdown service for generic markdown output
      this.logger.warn('⚠️ Markdown format not yet implemented, using JIRA service');
      return this.getService('ticketService');
    default:
      return this.getService('ticketService'); // Default to JIRA for backward compatibility
    }
  }

  /**
   * 📄 Format response consistently across all strategies and formats
   */
  _formatGenerationResponse(result, strategy, format) {
    // 🔍 DEBUG: Log what we're formatting to identify the indexed format issue
    this.logger.info('🔍 DEBUG: Formatting generation response:', {
      strategy,
      format,
      resultType: typeof result,
      resultIsString: typeof result === 'string',
      resultKeys: typeof result === 'object' && result !== null ? Object.keys(result) : null,
      contentType: typeof result?.content,
      contentFirst50: typeof result === 'string' ? result.substring(0, 50) : (typeof result?.content === 'string' ? result.content.substring(0, 50) : 'N/A'),
      hasMetadata: !!result?.metadata,
      metadataArchitecture: result?.metadata?.architecture
    });

    // Handle Context-Template Bridge responses (already well-formatted)
    if (strategy === 'context-bridge' && result.metadata?.architecture) {
      return {
        ...(typeof result === 'object' && result !== null ? result : { content: result }),
        // Ensure consistent format
        format: format,
        strategy: 'context-bridge',
        architecture: result.metadata.architecture,
        mcpBypass: true
      };
    }

    // Handle service-based responses (determine architecture based on actual service used)
    const generationType = result.metadata?.generationType;
    const isVisualEnhancedAI = ['visual-enhanced-ai', 'ai-powered-enhanced', 'ai-powered-pure'].includes(generationType);
    const isTemplateGuided = ['template-guided-ai', 'template-guided-ai-fallback'].includes(generationType);

    let actualArchitecture;
    if (isTemplateGuided) {
      actualArchitecture = 'template-guided-ai-service';
    } else if (isVisualEnhancedAI) {
      actualArchitecture = 'visual-enhanced-ai-service';
    } else {
      actualArchitecture = 'legacy-mcp-based';
    }

    return {
      // Core generated content
      content: result.content,
      format: format, // jira, wiki, code, markdown

      // Metadata at top level for UI access
      strategy: result.metadata?.strategy || strategy,
      confidence: result.metadata?.confidence || result.metadata?.ai_confidence || 0.75,
      source: result.metadata?.source || 'unified',
      generationType: generationType,
      architecture: actualArchitecture,
      mcpBypass: isTemplateGuided, // Template-guided bypasses MCP
      visualEnhancedAI: isVisualEnhancedAI,

      // Performance info
      performance: {
        duration: result.metadata?.duration || result.performance?.duration || 0,
        cacheHit: result.metadata?.cacheHit || result.performance?.fromCache || false
      },

      // Full metadata for debugging (also includes top-level metadata)
      metadata: {
        ...(result.metadata && typeof result.metadata === 'object' ? result.metadata : {}),
        architecture: actualArchitecture,
        mcpBypass: isTemplateGuided,
        visualEnhancedAI: isVisualEnhancedAI,
        strategy: result.metadata?.strategy || strategy,
        generationType: generationType
      },

      // Timestamp
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 🧠 Strategy Selection Information Handler
   * Explains how the system intelligently chooses strategies
   */
  async handleStrategyInfo(req, res) {
    this.logAccess(req, 'strategy-info');

    try {
      const strategyInfo = {
        success: true,
        data: {
          strategies: {
            available: [
              {
                name: 'ai',
                description: 'Pure AI analysis with intelligent insights',
                userSelectable: true,
                performance: { speed: 'slow', accuracy: 'best' },
                useCase: 'Simple components (≤5 frames) where AI creativity is valuable'
              },
              {
                name: 'enhanced',
                description: 'Template + AI hybrid for complex components',
                userSelectable: false,
                performance: { speed: 'medium', accuracy: 'better' },
                useCase: 'Complex components (>5 frames + screenshot) needing reliability + insights'
              },
              {
                name: 'template',
                description: 'Fast, reliable YAML template generation',
                userSelectable: true,
                performance: { speed: 'fast', accuracy: 'good' },
                useCase: 'Quick generation when speed matters most'
              },
              {
                name: 'legacy',
                description: 'Basic fallback for minimal data',
                userSelectable: true,
                performance: { speed: 'fast', accuracy: 'basic' },
                useCase: 'Fallback when other strategies fail'
              },
              {
                name: 'auto',
                description: 'Intelligent auto-selection based on context',
                userSelectable: true,
                performance: { speed: 'variable', accuracy: 'optimal' },
                useCase: 'Let system choose best strategy automatically'
              },
              {
                name: 'context-bridge',
                description: 'Internal Context-Template Bridge flow',
                userSelectable: false,
                performance: { speed: 'very fast', accuracy: 'good' },
                useCase: 'Internal system optimization (6ms generation)'
              }
            ]
          },
          decisionLogic: {
            aiStrategyRules: [
              {
                condition: 'frameData.length > 5 && screenshot exists',
                result: 'enhanced',
                reason: 'Complex components benefit from template reliability combined with AI enhancement'
              },
              {
                condition: 'frameData.length <= 5',
                result: 'ai',
                reason: 'Simple components work well with pure AI analysis and creativity'
              }
            ],
            autoDetectionRules: [
              {
                condition: 'Rich data (10+ frames + screenshot)',
                result: 'ai',
                reason: 'Comprehensive context enables high-quality AI generation'
              },
              {
                condition: 'Medium data (5+ frames)',
                result: 'enhanced',
                reason: 'Balanced approach combining template reliability with AI insights'
              },
              {
                condition: 'Basic data (1+ frames)',
                result: 'template',
                reason: 'Fast, reliable template generation for standard cases'
              },
              {
                condition: 'Minimal data',
                result: 'legacy',
                reason: 'Fallback approach when other strategies lack sufficient context'
              }
            ]
          },
          userExperience: {
            figmaUI: 'Users click single "Generate AI Ticket" button in Figma plugin',
            systemBehavior: 'Intelligent strategy selection happens automatically behind the scenes',
            resultQuality: 'Users get optimal results without needing to understand strategy complexity',
            transparency: 'Strategy used is returned in response metadata for debugging'
          },
          architecture: {
            flow: 'User Request → Strategy Analysis → Intelligent Selection → Optimal Execution → Results',
            philosophy: 'User simplicity masks system sophistication',
            benefits: [
              'Users get optimal results without complexity',
              'System can evolve strategies without breaking user experience',
              'Debugging transparency through response metadata',
              'Performance optimization through intelligent routing'
            ]
          },
          examples: {
            simpleComponent: {
              input: { frameData: [{ name: 'Button', type: 'INSTANCE' }], strategy: 'ai' },
              decision: 'ai',
              reason: '1 frame ≤ 5, pure AI works well for simple components'
            },
            complexComponent: {
              input: {
                frameData: [
                  { name: 'Header', type: 'FRAME' },
                  { name: 'Nav', type: 'INSTANCE' },
                  { name: 'Search', type: 'COMPONENT' },
                  { name: 'Avatar', type: 'ELLIPSE' },
                  { name: 'Notification', type: 'VECTOR' },
                  { name: 'Settings', type: 'FRAME' }
                ],
                screenshot: 'data:image/png;base64,...',
                strategy: 'ai'
              },
              decision: 'enhanced',
              reason: '6 frames > 5 + screenshot present, enhanced strategy provides template reliability with AI insights'
            }
          }
        }
      };

      res.json(strategyInfo);

    } catch (error) {
      this.logger.error('Strategy info request failed:', error);
      this.sendError(res, error, 'Failed to get strategy information');
    }
  }

  /**
   * 📊 Get route health status
   */
  getRouteHealth() {
    return {
      name: 'Generate',
      status: 'healthy',
      architecture: 'figma-api → context-layer → yaml-templates → docs',
      mcpBypass: !!this.contextBridge,
      endpoints: [
        '/api/generate',
        '/api/generate/strategy-info'
      ],
      supportedFormats: ['jira', 'wiki (planned)', 'code (planned)', 'markdown (planned)'],
      supportedStrategies: [
        'auto (intelligent selection - recommended)',
        'ai (user-requested AI analysis)',
        'enhanced (template + AI hybrid)',
        'template (reliable YAML-based)',
        'legacy (basic fallback)',
        'context-bridge (internal system-selected)'
      ],
      contextBridge: this.contextBridge ? this.contextBridge.getHealthStatus() : null
    };
  }
}

export default GenerateRoutes;