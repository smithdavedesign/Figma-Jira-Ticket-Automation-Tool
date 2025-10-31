/**
 * API Routes Module
 *
 * Handles core API endpoints extracted from main server.
 * Routes: /api/generate-ticket, /api/generate-ai-ticket-direct, /api/figma/screenshot
 *
 * Phase 8: Server Architecture Refactoring - Phase 3
 */

import { BaseRoute } from './BaseRoute.js';

export class APIRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('API', serviceContainer);
  }

  /**
   * Register API routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Core API endpoints
    router.post('/api/generate-ticket', this.asyncHandler(this.handleGenerateTicket.bind(this)));
    router.post('/api/generate-ai-ticket-direct', this.asyncHandler(this.handleDirectAIGeneration.bind(this)));
    router.get('/api/figma/screenshot', this.asyncHandler(this.handleFigmaScreenshot.bind(this)));

    this.logger.info('✅ API routes registered');
  }

  /**
   * Handle ticket generation requests from UI
   * Extracted from main server handleGenerateTicket method
   */
  async handleGenerateTicket(req, res) {
    this.logAccess(req, 'generateTicket');

    const requestData = req.body;
    const { platform, documentType } = requestData;

    // Validate required fields
    this.validateRequired(requestData, ['platform', 'documentType']);

    this.logger.info(`🎫 Generating ticket for ${platform}-${documentType}`, {
      platform,
      documentType,
      techStack: requestData.teamStandards?.tech_stack
    });

    // Get ticket generation service
    const ticketService = this.getService('ticketService');

    // Convert request to service format
    const serviceRequest = {
      frameData: requestData.frameData,
      platform,
      documentType,
      techStack: requestData.teamStandards?.tech_stack,
      teamStandards: requestData.teamStandards,
      figmaUrl: requestData.figmaUrl,
      screenshot: requestData.screenshot
    };

    // Generate ticket using unified service
    const result = await ticketService.generateTicket(serviceRequest, 'template');

    // Send standardized response
    this.sendSuccess(res, {
      ticket: result.content,
      metadata: result.metadata
    }, 'Ticket generated successfully', 200, {
      platform,
      documentType,
      techStack: requestData.teamStandards?.tech_stack || 'Not specified'
    });
  }

  /**
   * Handle direct AI ticket generation (bypasses MCP server)
   * Extracted from main server handleDirectAIGeneration method
   */
  async handleDirectAIGeneration(req, res) {
    this.logAccess(req, 'directAIGeneration');

    const {
      enhancedFrameData,
      screenshot,
      figmaUrl,
      techStack,
      documentType,
      platform,
      teamStandards,
      projectName,
      fileContext,
      useAI = true
    } = req.body;

    this.logger.info('🤖 Direct AI Generation Request:', {
      hasFrameData: !!enhancedFrameData?.length,
      techStack,
      documentType,
      hasScreenshot: !!screenshot,
      useAI
    });

    // Validate required fields
    if (!enhancedFrameData || !enhancedFrameData.length) {
      return this.sendError(res, 'Enhanced frame data is required', 400, {
        details: 'No frame data provided for AI generation'
      });
    }

    // Get ticket generation service
    const ticketService = this.getService('ticketService');

    // Convert request to service format
    const serviceRequest = {
      enhancedFrameData,
      screenshot,
      figmaUrl,
      techStack,
      documentType,
      platform,
      teamStandards,
      projectName,
      fileContext,
      useAI
    };

    // Generate ticket using AI strategy (with fallback)
    const result = await ticketService.generateTicket(serviceRequest, useAI ? 'ai' : 'enhanced');

    // Send standardized response
    this.sendSuccess(res, {
      generatedTicket: result.content,
      source: result.metadata.strategy,
      confidence: result.metadata.confidence || 0.75,
      metadata: result.metadata
    }, 'AI ticket generated successfully', 200, {
      strategy: result.metadata.strategy,
      techStack,
      documentType,
      platform: platform || 'jira'
    });
  }

  /**
   * Handle Figma screenshot requests using consolidated session management
   * Extracted from main server handleFigmaScreenshot method
   */
  async handleFigmaScreenshot(req, res) {
    this.logAccess(req, 'figmaScreenshot');

    const { fileKey, nodeId, scale = '2', format = 'png' } = req.query;

    // Validate required parameters
    this.validateRequired(req.query, ['fileKey', 'nodeId']);

    // Handle test scenarios with mock responses
    if (this.isTestRequest(req) || fileKey === 'test' || nodeId.includes('test')) {
      this.logger.info('🧪 [Test Mode] Returning mock screenshot response');

      return this.sendSuccess(res, {
        fileKey,
        nodeId,
        screenshotUrl: this.createMockScreenshot(),
        testMode: true
      }, 'Mock screenshot generated for testing', 200, {
        scale: parseInt(scale),
        format
      });
    }

    this.logger.info('🔍 [Screenshot] Processing request:', {
      fileKey,
      nodeId,
      scale,
      format
    });

    // Get screenshot service (to be created in Phase 4)
    const screenshotService = this.getService('screenshotService');

    // Capture screenshot
    const screenshotResult = await screenshotService.captureScreenshot(fileKey, nodeId, {
      scale: parseInt(scale),
      format
    });

    if (!screenshotResult.success) {
      return this.sendError(res, screenshotResult.error, screenshotResult.status || 500, {
        figmaStatus: screenshotResult.status,
        message: screenshotResult.message,
        fileKey,
        nodeId
      });
    }

    // Send successful screenshot response
    this.sendSuccess(res, {
      imageUrl: screenshotResult.imageUrl,
      dimensions: screenshotResult.dimensions,
      performance: screenshotResult.performance
    }, 'Screenshot captured successfully', 200, {
      fileKey,
      nodeId,
      scale: parseInt(scale),
      format
    });
  }

  /**
   * Create mock screenshot for testing
   * @returns {string} Base64 encoded mock screenshot
   */
  createMockScreenshot() {
    const mockSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="#10b981"/>
        <text x="50" y="50" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dy="4">
          MOCK
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${Buffer.from(mockSvg).toString('base64')}`;
  }

  /**
   * Get API routes health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      endpoints: [
        '/api/generate-ticket',
        '/api/generate-ai-ticket-direct',
        '/api/figma/screenshot'
      ],
      serviceRequirements: [
        'ticketService',
        'screenshotService'
      ]
    };
  }
}
export default APIRoutes;
