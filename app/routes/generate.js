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
    // NEW ARCHITECTURE: Direct Context-Template Bridge Flow
    // Figma API → Context Layer → YAML Templates → Docs

    if (this.contextBridge && request.strategy !== 'legacy-mcp') {
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

    // LEGACY FALLBACK: Original MCP-based flow (when Context Bridge fails or explicitly requested)
    this.logger.info('🔄 Using legacy MCP-based generation as fallback');

    // 1. Determine strategy (user choice or auto-detect)
    const strategy = this._determineStrategy(request, options);

    // 2. Get appropriate service based on output format
    const service = this._getGenerationService(request.format);

    // 3. Ensure service is initialized
    if (service.initialize && typeof service.initialize === 'function') {
      await service.initialize();
    }

    // 4. Generate content using the service
    let result;
    if (request.format === 'jira') {
      // Use existing ticket generation service
      result = await service.generateTicket(request, strategy);
    } else {
      // Future: Use format-specific generation methods
      throw new Error(`Format ${request.format} not yet implemented`);
    }

    // 5. Format response consistently
    return this._formatGenerationResponse(result, strategy, request.format);
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
      documentType: rawRequest.documentType || 'task',

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

    // Validate strategy
    const supportedStrategies = ['ai', 'template', 'enhanced', 'legacy', 'auto', 'context-bridge'];
    if (!supportedStrategies.includes(request.strategy)) {
      errors.push(`Unsupported strategy: ${request.strategy}. Supported: ${supportedStrategies.join(', ')}`);
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
   * 🧠 Determine best strategy based on input and user preference
   */
  _determineStrategy(request, options) {
    // User explicitly chose strategy
    if (request.strategy && request.strategy !== 'auto') {
      return request.strategy;
    }

    // NEW ARCHITECTURE: Prefer Context-Template Bridge for all requests
    if (this.contextBridge) {
      return 'context-bridge'; // Direct Context Layer → Template flow
    }

    // LEGACY FALLBACK: Auto-detect based on input richness when Context Bridge unavailable
    if (request.frameData?.length > 10 && request.screenshot) {
      return 'ai'; // Rich data, use AI
    } else if (request.frameData?.length > 5) {
      return 'enhanced'; // Medium data, use enhanced
    } else if (request.frameData?.length > 0) {
      return 'template'; // Basic data, use template
    } else {
      return 'legacy'; // Minimal data, use legacy
    }
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
    // Handle Context-Template Bridge responses (already well-formatted)
    if (strategy === 'context-bridge' && result.metadata?.architecture) {
      return {
        ...result,
        // Ensure consistent format
        format: format,
        strategy: 'context-bridge',
        architecture: result.metadata.architecture,
        mcpBypass: true
      };
    }

    // Handle legacy responses (MCP-based)
    return {
      // Core generated content
      content: result.content,
      format: format, // jira, wiki, code, markdown

      // Metadata
      strategy: result.metadata?.strategy || strategy,
      confidence: result.metadata?.confidence || 0.75,
      source: result.metadata?.source || 'unified',

      // Performance info
      performance: {
        duration: result.metadata?.duration || 0,
        cacheHit: result.metadata?.cacheHit || false
      },

      // Full metadata for debugging
      metadata: result.metadata || {},

      // Architecture info
      architecture: 'legacy-mcp-based',
      mcpBypass: false,

      // Timestamp
      generatedAt: new Date().toISOString()
    };
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
        '/api/generate'
      ],
      supportedFormats: ['jira', 'wiki (planned)', 'code (planned)', 'markdown (planned)'],
      supportedStrategies: [
        'context-bridge (default)',
        'ai (legacy)',
        'template (legacy)',
        'enhanced (legacy)',
        'legacy (legacy)',
        'auto'
      ],
      contextBridge: this.contextBridge ? this.contextBridge.getHealthStatus() : null
    };
  }
}

export default GenerateRoutes;