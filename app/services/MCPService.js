/**
 * MCP Service - Model Context Protocol Server Implementation
 *
 * Provides Model Context Protocol server capabilities alongside the main REST API.
 * This allows the server to function as both a REST API and an MCP server,
 * offering design context and Figma integration tools via MCP protocol.
 *
 * Phase 8: Server Architecture Refactoring - Business Service
 *
 * NOTE: Currently disabled due to MCP SDK compatibility issue.
 * MCP functionality is available via REST API routes instead.
 */

// import { Server } from '@modelcontextprotocol/sdk/server/index.js';
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Logger } from '../../core/utils/logger.js';
import { BaseService } from './BaseService.js';

/**
 * MCP Service
 *
 * Provides MCP tools for Figma design context extraction and integration
 * Follows the Phase 8 service architecture pattern
 */
export class FigmaMCPServer extends BaseService {
  constructor(options = {}) {
    super('MCPService');

    this.options = {
      port: options.port || 3845,
      services: options.services || null,
      name: 'figma-ai-ticket-generator',
      version: '1.0.0',
      ...options
    };

    this.server = null;
    this.isStarted = false;
  }

  /**
   * Initialize the MCP service (BaseService interface)
   */
  async initialize() {
    await this.start();
  }

  /**
   * Start the MCP server
   */
  async start() {
    try {
      this.logger.info('🔌 Starting Figma MCP Server...');

      // NOTE: MCP SDK currently disabled due to compatibility issues
      // MCP functionality is available via REST API routes instead
      this.logger.warn('⚠️ MCP SDK disabled, using REST API compatibility mode');
      this.logger.info('🔗 MCP tools available via REST API at /api/mcp/*');

      // Register tools and resources for REST API compatibility
      this.registerTools();
      this.registerResources();

      this.isStarted = true;
      this.logger.info('✅ MCP server started in REST API compatibility mode');

    } catch (error) {
      this.logger.error('❌ Failed to start MCP server:', error);
      throw error;
    }
  }

  /**
   * Register MCP tools (disabled - using REST API compatibility mode)
   */
  registerTools() {
    this.logger.info('ℹ️ MCP tools available via REST API at /api/mcp/tools/*');
  }

  /**
   * Register MCP resources (disabled - using REST API compatibility mode)
   */
  registerResources() {
    this.logger.info('ℹ️ MCP resources available via REST API at /api/mcp/resources/*');
  }

  /**
   * Get available MCP tools
   */
  getAvailableTools() {
    return [
      {
        name: 'capture_figma_screenshot',
        description: 'Capture screenshots from Figma URLs for design context',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: {
              type: 'string',
              description: 'Figma URL to capture'
            },
            includeMetadata: {
              type: 'boolean',
              default: true,
              description: 'Include design metadata'
            },
            format: {
              type: 'string',
              enum: ['base64', 'buffer'],
              default: 'base64'
            },
            quality: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'high'
            }
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
            figmaUrl: {
              type: 'string',
              description: 'Figma URL to analyze'
            },
            contextType: {
              type: 'string',
              enum: ['design-tokens', 'components', 'structure', 'full'],
              default: 'full'
            },
            includeFrameData: {
              type: 'boolean',
              default: true
            }
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
            figmaUrl: {
              type: 'string',
              description: 'Figma URL to analyze'
            },
            tokenTypes: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['colors', 'typography', 'spacing', 'effects', 'all']
              },
              default: ['all']
            }
          },
          required: ['figmaUrl']
        }
      }
    ];
  }

  /**
   * Get available MCP resources
   */
  getAvailableResources() {
    return [
      {
        uri: 'figma://design-tokens/current',
        name: 'Current Design Tokens',
        description: 'Currently extracted design tokens from active Figma context',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://context/current',
        name: 'Current Design Context',
        description: 'Currently active Figma design context and metadata',
        mimeType: 'application/json'
      },
      {
        uri: 'figma://screenshots/latest',
        name: 'Latest Screenshots',
        description: 'Most recently captured Figma screenshots',
        mimeType: 'application/json'
      }
    ];
  }

  /**
   * Handle capture screenshot tool
   */
  async handleCaptureScreenshot(args) {
    try {
      this.logger.info('📸 MCP: Capturing Figma screenshot', { url: args.figmaUrl });

      const screenshotService = this.options.services?.get('screenshotService');
      if (!screenshotService) {
        throw new Error('Screenshot service not available');
      }

      const result = await screenshotService.captureFromUrl(args.figmaUrl, {
        format: args.format || 'base64',
        quality: args.quality || 'high',
        includeMetadata: args.includeMetadata !== false
      });

      return {
        content: [
          {
            type: 'text',
            text: `Screenshot captured from ${args.figmaUrl}`,
          },
          {
            type: 'image',
            data: result.screenshot,
            mimeType: 'image/png'
          }
        ]
      };

    } catch (error) {
      this.logger.error('❌ MCP screenshot capture failed:', error);
      throw error;
    }
  }

  /**
   * Handle extract context tool
   */
  async handleExtractContext(args) {
    try {
      this.logger.info('🔍 MCP: Extracting Figma context', { url: args.figmaUrl });

      const contextManager = this.options.services?.get('contextManager');
      if (!contextManager) {
        throw new Error('Context manager service not available');
      }

      const context = await contextManager.extractFromUrl(args.figmaUrl, {
        contextType: args.contextType || 'full',
        includeFrameData: args.includeFrameData !== false
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(context, null, 2)
          }
        ]
      };

    } catch (error) {
      this.logger.error('❌ MCP context extraction failed:', error);
      throw error;
    }
  }

  /**
   * Handle get design tokens tool
   */
  async handleGetDesignTokens(args) {
    try {
      this.logger.info('🎨 MCP: Getting design tokens', { url: args.figmaUrl });

      // This would integrate with your existing design token extraction logic
      const tokens = {
        colors: [],
        typography: [],
        spacing: [],
        effects: [],
        message: 'Design token extraction would be implemented here'
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tokens, null, 2)
          }
        ]
      };

    } catch (error) {
      this.logger.error('❌ MCP design token extraction failed:', error);
      throw error;
    }
  }

  /**
   * Handle read design tokens resource
   */
  async handleReadDesignTokens(uri) {
    // Implementation would read cached/current design tokens
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ message: 'Design tokens resource implementation' })
        }
      ]
    };
  }

  /**
   * Handle read context resource
   */
  async handleReadContext(uri) {
    // Implementation would read cached/current context
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ message: 'Context resource implementation' })
        }
      ]
    };
  }

  /**
   * Shutdown the MCP server
   */
  async shutdown() {
    if (!this.isStarted) {
      return;
    }

    try {
      this.logger.info('🛑 Shutting down MCP server...');

      // No actual server to close in REST API compatibility mode
      this.isStarted = false;
      this.logger.info('✅ MCP server shut down successfully');

    } catch (error) {
      this.logger.error('❌ Error shutting down MCP server:', error);
      throw error;
    }
  }

  /**
   * Check if server is running
   */
  isRunning() {
    return this.isStarted;
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      isRunning: this.isStarted,
      name: this.options.name,
      version: this.options.version,
      port: this.options.port,
      tools: this.getAvailableTools().length,
      resources: this.getAvailableResources().length
    };
  }
}

export default FigmaMCPServer;