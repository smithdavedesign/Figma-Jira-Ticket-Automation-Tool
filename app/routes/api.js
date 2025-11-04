/**
 * API Routes Module
 *
 * Handles core API endpoints extracted from main server.
 * Routes: /api/figma/screenshot (Figma integration only)
 *
 * Phase 8: Server Architecture Refactoring - Phase 3
 * Note: Ticket generation routes moved to generate.js
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
    // Figma integration endpoint (legacy GET endpoint)
    router.get('/api/figma/screenshot', this.asyncHandler(this.handleFigmaScreenshot.bind(this)));

    // POST endpoint for screenshot API (required by Figma plugin)
    router.post('/api/screenshot', this.asyncHandler(this.handleScreenshotPost.bind(this)));

    this.logger.info('✅ API routes registered');
  }



  /**
   * Handle POST screenshot requests (expects parameters in request body)
   * Used by Figma plugin and tests
   */
  async handleScreenshotPost(req, res) {
    this.logAccess(req, 'screenshotPost');

    let { fileKey, nodeId } = req.body;
    const { scale = '2', format = 'png', figmaUrl } = req.body;

    // Extract fileKey from figmaUrl if provided
    if (figmaUrl && !fileKey) {
      const urlMatch = figmaUrl.match(/\/file\/([^/]+)\//);
      if (urlMatch) {
        fileKey = urlMatch[1];
        // Set default nodeId for test scenarios if not provided
        if (!nodeId) {
          nodeId = 'test:1';
        }
      }
    }

    // Validate required parameters
    try {
      this.validateRequired({ fileKey, nodeId }, ['fileKey', 'nodeId']);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }

    // Handle test scenarios with mock responses
    if (this.isTestRequest(req) || fileKey === 'test' || nodeId.includes('test')) {
      this.logger.info('🧪 [Test Mode] Returning mock screenshot response');

      return this.sendSuccess(res, {
        imageUrl: this.createMockScreenshot(),
        fileKey,
        nodeId,
        testMode: true
      }, 'Mock screenshot generated for testing', 200, {
        scale: parseInt(scale),
        format
      });
    }

    this.logger.info('🔍 [Screenshot] Processing POST request:', {
      fileKey,
      nodeId,
      scale,
      format
    });

    // Get screenshot service
    const screenshotService = this.getService('screenshotService');

    // Construct full Figma URL from file key (if not already provided)
    const fullFigmaUrl = figmaUrl || `https://www.figma.com/file/${fileKey}`;

    // Capture screenshot using the service
    const screenshotResult = await screenshotService.captureScreenshot(fullFigmaUrl, nodeId, {
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

    // Send successful screenshot response (with imageUrl as expected by plugin)
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
   * Handle Figma screenshot requests using consolidated session management
   * Extracted from main server handleFigmaScreenshot method (GET endpoint)
   */
  async handleFigmaScreenshot(req, res) {
    this.logAccess(req, 'figmaScreenshot');

    let { fileKey, nodeId } = req.query;
    const { scale = '2', format = 'png', figmaUrl } = req.query;

    // Extract fileKey from figmaUrl if provided
    if (figmaUrl && !fileKey) {
      const urlMatch = figmaUrl.match(/\/file\/([^/]+)\//);
      if (urlMatch) {
        fileKey = urlMatch[1];
        // Set default nodeId for test scenarios if not provided
        if (!nodeId) {
          nodeId = 'test:1';
        }
      }
    }

    // Validate required parameters
    try {
      this.validateRequired({ fileKey, nodeId }, ['fileKey', 'nodeId']);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }

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

    // Construct full Figma URL from file key (if not already provided)
    const fullFigmaUrl = figmaUrl || `https://www.figma.com/file/${fileKey}`;

    // Capture screenshot
    const screenshotResult = await screenshotService.captureScreenshot(fullFigmaUrl, nodeId, {
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
        '/api/figma/screenshot (GET)',
        '/api/screenshot (POST)'
      ],
      serviceRequirements: [
        'screenshotService'
      ],
      note: 'Ticket generation routes moved to generate.js'
    };
  }
}
export default APIRoutes;
