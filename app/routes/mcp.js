/**
 * MCP Routes Module
 *
 * Handles Model Context Protocol endpoints and integrations.
 * Routes: /api/mcp/*, MCP-specific endpoints
 *
 * Phase 8: Server Architecture Refactoring - Phase 3
 */

import { BaseRoute } from './BaseRoute.js';

export class MCPRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('MCP', serviceContainer);
  }

  /**
   * Register MCP routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // MCP status and initialization
    router.get('/api/mcp/status', this.asyncHandler(this.handleMCPStatus.bind(this)));
    router.post('/api/mcp/initialize', this.asyncHandler(this.handleMCPInitialize.bind(this)));

    // MCP tool and resource endpoints
    router.get('/api/mcp/tools', this.asyncHandler(this.handleMCPTools.bind(this)));
    router.post('/api/mcp/tools/call', this.asyncHandler(this.handleMCPToolCall.bind(this)));
    router.get('/api/mcp/resources', this.asyncHandler(this.handleMCPResources.bind(this)));

    // MCP context and memory endpoints (Phase 7 preparation)
    router.get('/api/mcp/context', this.asyncHandler(this.handleMCPContext.bind(this)));
    router.post('/api/mcp/context/update', this.asyncHandler(this.handleMCPContextUpdate.bind(this)));

    this.logger.info('✅ MCP routes registered');
  }

  /**
   * Handle MCP status requests
   * Provides comprehensive MCP server status information
   */
  async handleMCPStatus(req, res) {
    this.logAccess(req, 'mcpStatus');

    try {
      const mcpAdapter = this.getService('mcpAdapter');
      const contextManager = this.getService('contextManager', false); // Optional for Phase 7
      const memoryManager = this.getService('memoryManager', false); // Optional for Phase 8

      const statusData = {
        server: {
          name: 'Figma AI Ticket Generator MCP Server',
          version: '1.0.0',
          protocol: 'Model Context Protocol',
          architecture: 'Refactored Service Architecture',
          phase: 'Phase 8: Server Architecture Refactoring',
          status: 'active'
        },
        capabilities: {
          tools: true,
          resources: true,
          prompts: true,
          contextManagement: !!contextManager, // Phase 7 feature
          memoryPersistence: !!memoryManager, // Phase 8 feature
          multiModalSupport: true,
          visualAI: true
        },
        services: {
          mcpAdapter: !!mcpAdapter,
          contextManager: !!contextManager,
          memoryManager: !!memoryManager,
          ticketService: !!this.getService('ticketService', false),
          screenshotService: !!this.getService('screenshotService', false),
          visualAIService: !!this.getService('visualAIService', false)
        },
        tools: await this.getMCPTools(),
        resources: await this.getMCPResources(),
        context: contextManager ? await contextManager.getStatus() : null,
        memory: memoryManager ? await memoryManager.getStatus() : null,
        timestamp: new Date().toISOString()
      };

      this.sendSuccess(res, statusData, 'MCP status retrieved successfully');

    } catch (error) {
      this.logger.error('Error getting MCP status:', error);
      this.sendError(res, 500, 'Failed to get MCP status', error.message);
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
      const mcpAdapter = this.getService('mcpAdapter');

      const initResult = await mcpAdapter.initialize({
        clientCapabilities: clientCapabilities || {},
        protocolVersion: protocolVersion || '1.0.0',
        serverCapabilities: {
          tools: { listChanged: true },
          resources: { subscribe: true, listChanged: true },
          prompts: { listChanged: true },
          logging: { level: 'info' }
        }
      });

      this.logger.info('✅ MCP server initialized successfully');

      this.sendSuccess(res, initResult, 'MCP server initialized successfully');

    } catch (error) {
      this.logger.error('Error initializing MCP server:', error);
      this.sendError(res, 500, 'Failed to initialize MCP server', error.message);
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
      this.sendError(res, 500, 'Failed to get MCP tools', error.message);
    }
  }

  /**
   * Handle MCP tool call requests
   * Execute MCP tool with provided arguments
   */
  async handleMCPToolCall(req, res) {
    this.logAccess(req, 'mcpToolCall');

    const { tool, arguments: toolArgs } = req.body;

    // Validate required fields
    const validation = this.validateRequired(req.body, ['tool']);
    if (!validation.valid) {
      return this.sendError(res, 400, 'Validation failed', validation.errors);
    }

    try {
      const mcpAdapter = this.getService('mcpAdapter');
      const result = await mcpAdapter.callTool(tool, toolArgs || {});

      this.logger.info(`✅ MCP tool '${tool}' executed successfully`);

      this.sendSuccess(res, result, `MCP tool '${tool}' executed successfully`);

    } catch (error) {
      this.logger.error(`Error executing MCP tool '${tool}':`, error);
      this.sendError(res, 500, `Failed to execute MCP tool '${tool}'`, error.message);
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
      this.sendError(res, 500, 'Failed to get MCP resources', error.message);
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
      this.sendError(res, 500, 'Failed to get MCP context', error.message);
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
      this.sendError(res, 500, 'Failed to update MCP context', error.message);
    }
  }

  /**
   * Get available MCP tools
   * @returns {Array} Array of MCP tools
   */
  async getMCPTools() {
    return [
      {
        name: 'generate_ticket',
        description: 'Generate JIRA tickets from Figma designs using AI',
        inputSchema: {
          type: 'object',
          properties: {
            description: { type: 'string', description: 'Ticket description' },
            strategy: { type: 'string', enum: ['AI', 'Template', 'Enhanced', 'Legacy'] },
            includeScreenshot: { type: 'boolean', default: false },
            figmaUrl: { type: 'string', description: 'Optional Figma URL for context' }
          },
          required: ['description']
        }
      },
      {
        name: 'capture_figma_screenshot',
        description: 'Capture screenshots from Figma URLs',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: { type: 'string', description: 'Figma URL to capture' },
            includeAnalysis: { type: 'boolean', default: false },
            format: { type: 'string', enum: ['base64', 'buffer'], default: 'base64' },
            quality: { type: 'string', enum: ['low', 'medium', 'high'], default: 'high' }
          },
          required: ['figmaUrl']
        }
      },
      {
        name: 'analyze_visual_design',
        description: 'Perform AI-powered visual analysis of designs',
        inputSchema: {
          type: 'object',
          properties: {
            imageData: { type: 'string', description: 'Base64 encoded image data' },
            analysisType: { type: 'string', enum: ['comprehensive', 'accessibility', 'design-insights'] },
            includeElementDetails: { type: 'boolean', default: true }
          },
          required: ['imageData']
        }
      },
      {
        name: 'test_ai_scenario',
        description: 'Run AI testing scenarios for validation',
        inputSchema: {
          type: 'object',
          properties: {
            scenario: { type: 'string', description: 'Test scenario description' },
            strategy: { type: 'string', enum: ['AI', 'Template', 'Enhanced', 'Legacy'] },
            includeScreenshot: { type: 'boolean', default: false }
          },
          required: ['scenario']
        }
      }
    ];
  }

  /**
   * Get available MCP resources
   * @returns {Array} Array of MCP resources
   */
  async getMCPResources() {
    return [
      {
        uri: 'figma://templates',
        name: 'Ticket Templates',
        description: 'JIRA ticket templates for different scenarios',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://test-scenarios',
        name: 'Test Scenarios',
        description: 'AI testing scenarios and test cases',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://performance-metrics',
        name: 'Performance Metrics',
        description: 'System performance and usage metrics',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://context-intelligence',
        name: 'Context Intelligence (Phase 7)',
        description: 'Context management and intelligence features',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://memory-persistence',
        name: 'Memory Persistence (Phase 8)',
        description: 'Long-term memory and learning capabilities',
        mimeType: 'application/json'
      }
    ];
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
        '/api/mcp/initialize',
        '/api/mcp/tools',
        '/api/mcp/tools/call',
        '/api/mcp/resources',
        '/api/mcp/context',
        '/api/mcp/context/update'
      ],
      serviceRequirements: [
        'mcpAdapter',
        'ticketService',
        'screenshotService',
        'visualAIService'
      ],
      optionalServices: [
        'contextManager', // Phase 7
        'memoryManager' // Phase 8
      ],
      capabilities: [
        'mcp-protocol-support',
        'tool-execution',
        'resource-management',
        'context-intelligence-ready', // Phase 7 preparation
        'memory-persistence-ready' // Phase 8 preparation
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
