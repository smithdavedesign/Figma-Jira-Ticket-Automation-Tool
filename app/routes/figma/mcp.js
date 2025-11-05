/**
 * MCP Routes Module
 *
 * Handles Model Context Protocol endpoints and integrations.
 * Routes: /api/mcp/*, MCP-specific endpoints
 *
 * Phase 8: Server Architecture Refactoring - Phase 3
 */

import { BaseRoute } from '../BaseRoute.js';

export class MCPRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('MCP', serviceContainer);
  }

  /**
   * Register MCP routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // MCP status and health endpoints
    router.get('/api/mcp/status', this.asyncHandler(this.handleMCPStatus.bind(this)));
    router.get('/api/mcp/health', this.asyncHandler(this.handleMCPHealth.bind(this)));
    router.post('/api/mcp/initialize', this.asyncHandler(this.handleMCPInitialize.bind(this)));

    // MCP tool and resource endpoints
    router.get('/api/mcp/tools', this.asyncHandler(this.handleMCPTools.bind(this)));
    router.post('/api/mcp/tools/call', this.asyncHandler(this.handleMCPToolCall.bind(this)));
    router.get('/api/mcp/resources', this.asyncHandler(this.handleMCPResources.bind(this)));

    // MCP context and memory endpoints (Phase 7 preparation)
    router.get('/api/mcp/context', this.asyncHandler(this.handleMCPContext.bind(this)));
    router.post('/api/mcp/context/update', this.asyncHandler(this.handleMCPContextUpdate.bind(this)));

    // Additional routes for Swagger UI compatibility (without /api prefix)
    router.get('/mcp/status', this.asyncHandler(this.handleMCPStatus.bind(this)));
    router.get('/mcp/tools', this.asyncHandler(this.handleMCPTools.bind(this)));
    router.get('/mcp/resources', this.asyncHandler(this.handleMCPResources.bind(this)));

    this.logger.info('✅ MCP routes registered');
  }

  /**
   * Handle MCP status requests
   * Provides comprehensive MCP server status information
   */
  async handleMCPStatus(req, res) {
    this.logAccess(req, 'mcpStatus');

    try {
      // Get required services for design context
      const screenshotService = this.getService('screenshotService', false);
      const figmaSessionManager = this.getService('figmaSessionManager', false);
      const visualAIService = this.getService('visualAIService', false);

      const statusData = {
        server: {
          name: 'Figma Design Context MCP Server',
          version: '1.0.0',
          protocol: 'Model Context Protocol',
          architecture: 'Design Context Only - No Ticket Generation',
          phase: 'Phase 8: Server Architecture Refactoring',
          status: 'active'
        },
        capabilities: {
          tools: true,
          resources: true,
          prompts: false, // Not used for design context
          figmaIntegration: true,
          screenshotCapture: true,
          designContextExtraction: true,
          designTokenAnalysis: true
        },
        services: {
          screenshotService: !!this.getService('screenshotService', false),
          figmaSessionManager: !!this.getService('figmaSessionManager', false),
          visualAIService: !!this.getService('visualAIService', false) // For design analysis only
        },
        tools: await this.getMCPTools(),
        resources: await this.getMCPResources(),
        timestamp: new Date().toISOString()
      };

      this.sendSuccess(res, statusData, 'MCP status retrieved successfully');

    } catch (error) {
      this.logger.error('Error getting MCP status:', error);
      this.sendError(res, 'Failed to get MCP status', 500, { originalError: error.message });
    }
  }

  /**
   * Handle MCP health check requests
   * Provides health status information for dashboard monitoring
   */
  async handleMCPHealth(req, res) {
    this.logAccess(req, 'mcpHealth');

    try {
      const healthData = this.getHealthStatus();
      this.sendSuccess(res, healthData, 'MCP health status retrieved successfully');

    } catch (error) {
      this.logger.error('Error getting MCP health:', error);
      this.sendError(res, 'Failed to get MCP health status', 500, { originalError: error.message });
    }
  }

  /**
   * Handle MCP initialization requests
   * Initialize MCP server with client capabilities
   */
  async handleMCPInitialize(req, res) {
    this.logAccess(req, 'mcpInitialize');

    const { clientCapabilities, protocolVersion } = req.body;

    try {
      // Initialize MCP server capabilities for design context only
      const initResult = {
        protocolVersion: protocolVersion || '2024-11-05',
        capabilities: {
          tools: { listChanged: true },
          resources: { subscribe: true, listChanged: true },
          logging: { level: 'info' }
        },
        serverInfo: {
          name: 'Figma Design Context MCP Server',
          version: '1.0.0',
          description: 'Provides Figma design context and metadata for MCP clients'
        },
        instructions: 'This MCP server provides Figma design context only. Use capture_figma_screenshot and extract_figma_context tools for design analysis.'
      };

      this.logger.info('✅ MCP server initialized successfully');

      this.sendSuccess(res, initResult, 'MCP server initialized successfully');

    } catch (error) {
      this.logger.error('Error initializing MCP server:', error);
      this.sendError(res, 'Failed to initialize MCP server', 500, { originalError: error.message });
    }
  }

  /**
   * Handle MCP tools list requests
   * Returns available MCP tools
   */
  async handleMCPTools(req, res) {
    this.logAccess(req, 'mcpTools');

    try {
      const tools = await this.getMCPTools();
      this.sendSuccess(res, { tools }, 'MCP tools retrieved successfully');

    } catch (error) {
      this.logger.error('Error getting MCP tools:', error);
      this.sendError(res, 'Failed to get MCP tools', 500, { originalError: error.message });
    }
  }

  /**
   * Handle MCP tool call requests
   * Execute MCP tool with provided arguments - Design Context Only
   */
  async handleMCPToolCall(req, res) {
    const { tool, arguments: toolArgs } = req.body;

    this.logAccess(req, 'mcpToolCall', {
      mcpTool: tool,
      hasArguments: !!toolArgs,
      protocolVersion: 'MCP-2024-11-05'
    });

    // Validate required fields
    try {
      this.validateRequired(req.body, ['tool']);
    } catch (error) {
      return this.sendError(res, 'Validation failed: ' + error.message, 400);
    }

    try {
      let result;

      // Execute design context tools directly
      switch (tool) {
      case 'capture_figma_screenshot':
        result = await this.executeCaptureScreenshot(toolArgs);
        break;
      case 'extract_figma_context':
        result = await this.executeExtractContext(toolArgs);
        break;
      case 'get_figma_design_tokens':
        result = await this.executeGetDesignTokens(toolArgs);
        break;
      default:
        return this.sendError(res, `Unknown MCP tool: ${tool}`, 400,
          'Available tools: capture_figma_screenshot, extract_figma_context, get_figma_design_tokens');
      }

      this.logger.info(`✅ MCP tool '${tool}' executed successfully`, {
        tool,
        resultType: typeof result,
        hasContent: result && (result.content || result.data || result.image),
        protocolType: 'MCP',
        executionTime: Date.now() - req.startTime || 0
      });
      this.sendSuccess(res, result, `MCP tool '${tool}' executed successfully`);

    } catch (error) {
      this.logger.error(`Error executing MCP tool '${tool}':`, error);
      this.sendError(res, `Failed to execute MCP tool '${tool}'`, 500, { originalError: error.message });
    }
  }

  /**
   * Handle MCP resources list requests
   * Returns available MCP resources
   */
  async handleMCPResources(req, res) {
    this.logAccess(req, 'mcpResources');

    try {
      const resources = await this.getMCPResources();
      this.sendSuccess(res, { resources }, 'MCP resources retrieved successfully');

    } catch (error) {
      this.logger.error('Error getting MCP resources:', error);
      this.sendError(res, 'Failed to get MCP resources', 500, { originalError: error.message });
    }
  }

  /**
   * Handle MCP context requests
   * Phase 7: Context Intelligence feature preparation
   */
  async handleMCPContext(req, res) {
    this.logAccess(req, 'mcpContext');

    try {
      const contextManager = this.getService('contextManager', false);

      if (!contextManager) {
        return this.sendError(res, 501, 'Context management not implemented',
          'Phase 7: Context Intelligence features are not yet available');
      }

      const contextData = await contextManager.getCurrentContext();

      this.sendSuccess(res, contextData, 'MCP context retrieved successfully');

    } catch (error) {
      this.logger.error('Error getting MCP context:', error);
      this.sendError(res, 'Failed to get MCP context', 500, { originalError: error.message });
    }
  }

  /**
   * Handle MCP context update requests
   * Phase 7: Context Intelligence feature preparation
   */
  async handleMCPContextUpdate(req, res) {
    this.logAccess(req, 'mcpContextUpdate');

    const { context, operation = 'update' } = req.body;

    try {
      const contextManager = this.getService('contextManager', false);

      if (!contextManager) {
        return this.sendError(res, 501, 'Context management not implemented',
          'Phase 7: Context Intelligence features are not yet available');
      }

      const result = await contextManager.updateContext(context, operation);

      this.sendSuccess(res, result, 'MCP context updated successfully');

    } catch (error) {
      this.logger.error('Error updating MCP context:', error);
      this.sendError(res, 'Failed to update MCP context', 500, { originalError: error.message });
    }
  }

  /**
   * Get available MCP tools (Design Context Only)
   * @returns {Array} Array of MCP tools focused on Figma design context
   */
  async getMCPTools() {
    return [
      {
        name: 'capture_figma_screenshot',
        description: 'Capture screenshots from Figma URLs for design context',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: { type: 'string', description: 'Figma URL to capture' },
            includeMetadata: { type: 'boolean', default: true, description: 'Include design metadata' },
            format: { type: 'string', enum: ['base64', 'buffer'], default: 'base64' },
            quality: { type: 'string', enum: ['low', 'medium', 'high'], default: 'high' }
          },
          required: ['figmaUrl']
        }
      },
      {
        name: 'extract_figma_context',
        description: 'Extract design context and metadata from Figma URLs',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: { type: 'string', description: 'Figma URL to analyze' },
            contextType: { type: 'string', enum: ['design-tokens', 'components', 'structure', 'full'], default: 'full' },
            includeFrameData: { type: 'boolean', default: true }
          },
          required: ['figmaUrl']
        }
      },
      {
        name: 'get_figma_design_tokens',
        description: 'Extract design tokens and system variables from Figma',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: { type: 'string', description: 'Figma URL to analyze' },
            tokenTypes: {
              type: 'array',
              items: { type: 'string', enum: ['colors', 'typography', 'spacing', 'effects', 'all'] },
              default: ['all']
            }
          },
          required: ['figmaUrl']
        }
      }
    ];
  }

  /**
   * Get available MCP resources (Design Context Only)
   * @returns {Array} Array of MCP resources focused on Figma design context
   */
  async getMCPResources() {
    return [
      {
        uri: 'figma://design-system',
        name: 'Design System Context',
        description: 'Design system components, tokens, and guidelines',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://component-library',
        name: 'Component Library',
        description: 'Figma component definitions and specifications',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://design-tokens',
        name: 'Design Tokens',
        description: 'Design system tokens (colors, typography, spacing)',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://frame-metadata',
        name: 'Frame Metadata',
        description: 'Frame structure and component relationships',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://accessibility-context',
        name: 'Accessibility Context',
        description: 'Design accessibility guidelines and annotations',
        mimeType: 'application/json'
      }
    ];
  }

  /**
   * Execute capture screenshot tool
   * @private
   */
  async executeCaptureScreenshot(args) {
    const { figmaUrl, includeMetadata = true, format = 'base64', quality = 'high' } = args;

    if (!figmaUrl) {
      throw new Error('figmaUrl is required');
    }

    this.logger.info('📸 [MCP PROTOCOL] Screenshot tool execution started', {
      protocol: 'MCP',
      tool: 'capture_figma_screenshot',
      figmaUrl: figmaUrl.substring(0, 50) + '...',
      format,
      quality
    });

    try {
      const screenshotService = this.getService('screenshotService');

      // Use the correct API format for ScreenshotService
      const result = await screenshotService.captureScreenshot(figmaUrl, null, {
        format,
        quality,
        includeMetadata
      });

      return {
        tool: 'capture_figma_screenshot',
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Handle errors gracefully and provide meaningful feedback
      return {
        tool: 'capture_figma_screenshot',
        success: false,
        error: `Screenshot capture failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute extract context tool
   * @private
   */
  async executeExtractContext(args) {
    const { figmaUrl, contextType = 'full', includeFrameData = true } = args;

    if (!figmaUrl) {
      throw new Error('figmaUrl is required');
    }

    try {
      const figmaSessionManager = this.getService('figmaSessionManager');
      const visualAIService = this.getService('visualAIService', false);

      // Extract basic Figma context
      const context = await figmaSessionManager.extractContext({
        url: figmaUrl,
        contextType,
        includeFrameData
      });

      // Add visual analysis if available
      if (visualAIService && contextType === 'full') {
        try {
          const visualAnalysis = await visualAIService.analyzeDesign(context);
          context.visualAnalysis = visualAnalysis;
        } catch (error) {
          this.logger.warn('Visual analysis failed, continuing without it:', error.message);
        }
      }

      return {
        tool: 'extract_figma_context',
        success: true,
        data: context,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Handle errors gracefully
      return {
        tool: 'extract_figma_context',
        success: false,
        error: `Context extraction failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute get design tokens tool
   * @private
   */
  async executeGetDesignTokens(args) {
    const { figmaUrl, tokenTypes = ['all'] } = args;

    if (!figmaUrl) {
      throw new Error('figmaUrl is required');
    }

    try {
      const figmaSessionManager = this.getService('figmaSessionManager');
      const tokens = await figmaSessionManager.extractDesignTokens({
        url: figmaUrl,
        tokenTypes
      });

      return {
        tool: 'get_figma_design_tokens',
        success: true,
        data: tokens,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Handle errors gracefully
      return {
        tool: 'get_figma_design_tokens',
        success: false,
        error: `Design token extraction failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get MCP routes health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      endpoints: [
        '/api/mcp/status',
        '/api/mcp/health',
        '/api/mcp/initialize',
        '/api/mcp/tools',
        '/api/mcp/tools/call',
        '/api/mcp/resources',
        '/api/mcp/context',
        '/api/mcp/context/update'
      ],
      serviceRequirements: [
        'screenshotService',
        'figmaSessionManager'
      ],
      optionalServices: [
        'visualAIService' // For design analysis only
      ],
      capabilities: [
        'figma-screenshot-capture',
        'design-context-extraction',
        'design-token-analysis',
        'component-metadata-extraction',
        'accessibility-context-support'
      ],
      protocolVersion: '1.0.0',
      roadmapPhases: {
        current: 'Phase 8: Server Architecture Refactoring',
        next: 'Phase 7: Context Intelligence',
        future: 'Phase 9: Integration Connectors'
      }
    };
  }
}
export default MCPRoutes;
