/**
 * Figma Core Routes Module
 *
 * Core Figma API endpoints with consolidated screenshot logic.
 * Handles basic file operations, screenshots, and legacy compatibility.
 */

import { BaseFigmaRoute } from './base.js';

export class FigmaCoreRoutes extends BaseFigmaRoute {
  constructor(serviceContainer) {
    super('FigmaCore', serviceContainer);
  }

  /**
   * Register core Figma routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Health check endpoint
    router.get('/api/figma/health', this.handleHealthCheck.bind(this));

    // Consolidated Screenshot Endpoints
    router.get('/api/figma/screenshot', this.handleFigmaScreenshotGET.bind(this)); // Legacy
    router.post('/api/figma/screenshot', this.handleFigmaScreenshotPOST.bind(this));
    router.post('/api/screenshot', this.handleScreenshotWrapper.bind(this)); // Simplified wrapper

    // Core API endpoints expected by unified dashboard
    router.get('/api/figma/core', this.handleFigmaCore.bind(this));
    router.post('/api/figma/core', this.handleFigmaCore.bind(this));
    router.post('/api/figma/file-info', this.handleFileInfo.bind(this));
    router.post('/api/figma/analyze-design', this.handleAnalyzeDesign.bind(this));
    router.post('/api/figma/extract-components', this.handleExtractComponents.bind(this));

    this.logger.info('✅ Figma core routes registered');
  }

  /**
   * Consolidated screenshot capture logic
   * @param {Object} params - Screenshot parameters
   * @returns {Object} Screenshot result
   */
  async captureScreenshot(params) {
    const {
      fileKey,
      nodeId,
      figmaUrl,
      scale = '2',
      format = 'png',
      isTestMode = false
    } = params;

    // Handle test scenarios
    if (isTestMode || fileKey === 'test' || nodeId?.includes('test')) {
      this.logger.debug('🧪 [Test Mode] Returning mock screenshot response');

      return {
        success: true,
        imageUrl: this.createMockScreenshot(scale, format),
        dimensions: { width: 800, height: 600 },
        performance: { captureTime: 50 },
        testMode: true,
        fileKey,
        nodeId
      };
    }

    // Validate services
    this.validateServices(['screenshotService']);
    const screenshotService = this.getService('screenshotService');

    // Construct full Figma URL
    const fullFigmaUrl = figmaUrl || `https://www.figma.com/file/${fileKey}`;

    // Capture screenshot using service
    const screenshotResult = await screenshotService.captureScreenshot(fullFigmaUrl, nodeId, {
      scale: parseInt(scale),
      format
    });

    if (!screenshotResult.success) {
      throw new Error(`Screenshot capture failed: ${screenshotResult.error}`);
    }

    return {
      success: true,
      imageUrl: screenshotResult.imageUrl,
      dimensions: screenshotResult.dimensions,
      performance: screenshotResult.performance,
      fileKey,
      nodeId,
      scale: parseInt(scale),
      format
    };
  }

  /**
   * Extract Figma file info from URL or parameters
   * @param {Object} params - Parameters object
   * @returns {Object} Extracted file info
   */
  extractFigmaInfo(params) {
    let { fileKey, nodeId, figmaUrl } = params;

    // Extract fileKey from figmaUrl if provided
    if (figmaUrl && !fileKey) {
      fileKey = this.extractFileKeyFromURL(figmaUrl);

      // Extract nodeId from URL if not provided
      if (!nodeId) {
        nodeId = this.extractNodeIdFromURL(figmaUrl);
      }
    }

    // Set default nodeId for test scenarios
    if (!nodeId && (fileKey === 'test' || figmaUrl?.includes('test'))) {
      nodeId = 'test:1';
    }

    return { fileKey, nodeId, figmaUrl };
  }

  /**
   * Handle GET screenshot requests (Legacy support)
   * @deprecated Use POST /api/figma/screenshot or /api/screenshot instead
   */
  async handleFigmaScreenshotGET(req, res) {
    this.logAccess(req, 'screenshotGET', { legacy: true });

    try {
      const params = this.extractFigmaInfo({ ...req.query });
      const { fileKey, nodeId } = params;

      // Validate required parameters
      this.validateRequired({ fileKey, nodeId }, ['fileKey', 'nodeId']);

      const result = await this.captureScreenshot({
        ...params,
        ...req.query,
        isTestMode: this.isTestRequest(req)
      });

      this.sendSuccess(res, {
        fileKey: result.fileKey,
        nodeId: result.nodeId,
        screenshotUrl: result.imageUrl,
        testMode: result.testMode
      }, 'Screenshot captured successfully (legacy endpoint)', 200, {
        scale: result.scale,
        format: result.format,
        deprecated: 'Use POST /api/figma/screenshot instead'
      });

    } catch (error) {
      this.handleFigmaError(error, res, 'capture screenshot (GET)');
    }
  }

  /**
   * Handle POST screenshot requests (Enhanced endpoint)
   */
  async handleFigmaScreenshotPOST(req, res) {
    this.logAccess(req, 'screenshotPOST');

    try {
      const params = this.extractFigmaInfo({ ...req.body });
      const { fileKey, nodeId } = params;

      // Validate required parameters
      this.validateRequired({ fileKey, nodeId }, ['fileKey', 'nodeId']);

      const result = await this.captureScreenshot({
        ...params,
        ...req.body,
        isTestMode: this.isTestRequest(req)
      });

      this.sendSuccess(res, {
        imageUrl: result.imageUrl,
        dimensions: result.dimensions,
        performance: result.performance,
        testMode: result.testMode
      }, 'Screenshot captured successfully', 200, {
        fileKey: result.fileKey,
        nodeId: result.nodeId,
        scale: result.scale,
        format: result.format
      });

    } catch (error) {
      this.handleFigmaError(error, res, 'capture screenshot');
    }
  }

  /**
   * Handle simplified screenshot wrapper (Plugin compatibility)
   * POST /api/screenshot - Simplified wrapper calling Figma screenshot logic
   */
  async handleScreenshotWrapper(req, res) {
    this.logAccess(req, 'screenshotWrapper', { wrapper: true });

    try {
      const params = this.extractFigmaInfo({ ...req.body });
      const { fileKey, nodeId } = params;

      // Validate required parameters
      this.validateRequired({ fileKey, nodeId }, ['fileKey', 'nodeId']);

      const result = await this.captureScreenshot({
        ...params,
        ...req.body,
        isTestMode: this.isTestRequest(req)
      });

      // Plugin expects imageUrl format
      this.sendSuccess(res, {
        imageUrl: result.imageUrl,
        dimensions: result.dimensions,
        performance: result.performance
      }, 'Screenshot captured successfully', 200, {
        fileKey: result.fileKey,
        nodeId: result.nodeId,
        scale: result.scale,
        format: result.format
      });

    } catch (error) {
      this.handleFigmaError(error, res, 'capture screenshot (wrapper)');
    }
  }

  /**
   * Create mock screenshot for testing with scale and format support
   * @param {string} scale - Image scale
   * @param {string} format - Image format
   * @returns {string} Base64 encoded mock screenshot
   */
  createMockScreenshot(scale = '2', format = 'png') {
    const size = parseInt(scale) * 50; // Base size 50px

    const mockSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#grad)" rx="8"/>
        <text x="${size/2}" y="${size/2-8}" font-family="Inter, Arial" font-size="${Math.max(10, size/8)}" fill="white" text-anchor="middle">
          MOCK
        </text>
        <text x="${size/2}" y="${size/2+8}" font-family="Inter, Arial" font-size="${Math.max(8, size/10)}" fill="white" text-anchor="middle" opacity="0.8">
          ${scale}x ${format.toUpperCase()}
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${Buffer.from(mockSvg).toString('base64')}`;
  }

  /**
   * Handle health check requests
   */
  async handleHealthCheck(req, res) {
    this.logAccess(req, 'healthCheck');

    try {
      const healthStatus = this.getFigmaHealthStatus();

      const responseData = {
        status: 'healthy',
        service: 'Figma Core Routes',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        architecture: 'consolidated-screenshot-logic',
        endpoints: {
          '/api/figma/health': 'Service health check',
          '/api/figma/mock': 'Mock data for testing',
          '/api/figma/file/:fileKey': 'Get Figma file data',
          '/api/figma/screenshot (GET)': 'Legacy screenshot endpoint',
          '/api/figma/screenshot (POST)': 'Enhanced screenshot endpoint',
          '/api/screenshot (POST)': 'Plugin-compatible wrapper'
        },
        consolidatedFeatures: [
          'unified-screenshot-logic',
          'legacy-compatibility',
          'plugin-wrapper-support',
          'enhanced-mock-generation'
        ],
        ...healthStatus
      };

      this.sendSuccess(res, responseData, 'Figma core service is healthy');
    } catch (error) {
      this.logger.error('Health check failed:', error);
      this.sendError(res, `Health check failed: ${error.message}`, 500);
    }
  }

  /**
   * Handle Figma core API requests
   */
  async handleFigmaCore(req, res) {
    this.logAccess(req, 'figmaCore');

    try {
      const figmaApiKey = process.env.FIGMA_API_KEY || req.headers.authorization?.replace('Bearer ', '');

      if (!figmaApiKey) {
        return this.sendError(res, 'Figma API key is required', 400, {
          configurationRequired: true,
          hint: 'Set FIGMA_API_KEY environment variable or include in Authorization header'
        });
      }

      // Basic Figma API validation
      const testUrl = 'https://api.figma.com/v1/me';
      try {
        const response = await fetch(testUrl, {
          headers: { 'X-Figma-Token': figmaApiKey }
        });

        if (response.ok) {
          const userData = await response.json();
          this.sendSuccess(res, {
            status: 'connected',
            user: userData,
            capabilities: ['file-access', 'node-access', 'image-export']
          }, 'Figma API connection successful');
        } else {
          this.sendError(res, 'Invalid Figma API key', 401);
        }
      } catch (error) {
        this.sendError(res, 'Failed to connect to Figma API', 500, { originalError: error.message });
      }
    } catch (error) {
      this.handleFigmaError(error, res, 'core API');
    }
  }

  /**
   * Handle file info requests
   */
  async handleFileInfo(req, res) {
    this.logAccess(req, 'fileInfo');

    try {
      const { fileId } = req.body;
      const figmaApiKey = process.env.FIGMA_API_KEY || req.headers.authorization?.replace('Bearer ', '');

      if (!figmaApiKey) {
        return this.sendError(res, 'Figma API key is required', 400);
      }

      if (!fileId) {
        return this.sendError(res, 'File ID is required', 400);
      }

      // Test mode
      if (fileId === 'test' || this.isTestRequest(req)) {
        return this.sendSuccess(res, {
          name: 'Test Figma File',
          lastModified: new Date().toISOString(),
          version: '1.0',
          nodes: {
            'test:1': { type: 'FRAME', name: 'Test Frame' }
          },
          testMode: true
        }, 'File info retrieved (test mode)');
      }

      // Real Figma API call
      const fileUrl = `https://api.figma.com/v1/files/${fileId}`;
      const response = await fetch(fileUrl, {
        headers: { 'X-Figma-Token': figmaApiKey }
      });

      if (response.ok) {
        const fileData = await response.json();
        this.sendSuccess(res, fileData, 'File info retrieved successfully');
      } else {
        this.sendError(res, 'Failed to retrieve file info', response.status);
      }
    } catch (error) {
      this.handleFigmaError(error, res, 'get file info');
    }
  }

  /**
   * Handle design analysis requests
   */
  async handleAnalyzeDesign(req, res) {
    this.logAccess(req, 'analyzeDesign');

    try {
      const { fileId, nodeId } = req.body;

      if (!fileId) {
        return this.sendError(res, 'File ID is required', 400);
      }

      // Test mode
      if (fileId === 'test' || this.isTestRequest(req)) {
        return this.sendSuccess(res, {
          analysis: {
            components: 5,
            colors: ['#007acc', '#ffffff', '#f5f5f5'],
            typography: ['Inter', 'Helvetica'],
            layout: 'responsive',
            accessibility: { score: 85, issues: 2 }
          },
          recommendations: [
            'Consider increasing color contrast',
            'Add alt text to images'
          ],
          testMode: true
        }, 'Design analysis completed (test mode)');
      }

      // For real implementation, integrate with analysis service
      const analysisService = this.getService('analysisService');
      if (analysisService) {
        const analysis = await analysisService.analyzeDesign({ fileId, nodeId });
        this.sendSuccess(res, analysis, 'Design analysis completed');
      } else {
        this.sendError(res, 'Analysis service not available', 503);
      }
    } catch (error) {
      this.handleFigmaError(error, res, 'analyze design');
    }
  }

  /**
   * Handle component extraction requests
   */
  async handleExtractComponents(req, res) {
    this.logAccess(req, 'extractComponents');

    try {
      const { fileId } = req.body;

      if (!fileId) {
        return this.sendError(res, 'File ID is required', 400);
      }

      // Test mode
      if (fileId === 'test' || this.isTestRequest(req)) {
        return this.sendSuccess(res, {
          components: [
            { id: 'comp1', name: 'Button', type: 'COMPONENT', instances: 12 },
            { id: 'comp2', name: 'Input Field', type: 'COMPONENT', instances: 8 },
            { id: 'comp3', name: 'Card', type: 'COMPONENT', instances: 6 }
          ],
          summary: {
            totalComponents: 3,
            totalInstances: 26,
            coverage: '85%'
          },
          testMode: true
        }, 'Components extracted (test mode)');
      }

      // For real implementation, integrate with context service
      const contextManager = this.getService('contextManager');
      if (contextManager) {
        const components = await contextManager.extractComponents({ fileId });
        this.sendSuccess(res, components, 'Components extracted successfully');
      } else {
        this.sendError(res, 'Context manager not available', 503);
      }
    } catch (error) {
      this.handleFigmaError(error, res, 'extract components');
    }
  }

  // Mock data and basic API endpoints
  async handleMockData(req, res) {
    this.logAccess(req, 'mockData');

    this.sendSuccess(res, {
      mockData: true,
      timestamp: new Date().toISOString(),
      figmaFile: {
        id: 'mock-file-id',
        name: 'Mock Figma File',
        nodes: ['mock-node-1', 'mock-node-2']
      }
    }, 'Mock data generated');
  }
}

export default FigmaCoreRoutes;