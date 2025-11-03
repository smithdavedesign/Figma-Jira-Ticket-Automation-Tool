/**
 * Figma Routes Module
 *
 * Enhanced Figma endpoints with Context Layer integration.
 *
 * Routes:
 * - /api/figma/screenshot (enhanced with Context Layer)
 * - /api/figma/extract-context (NEW: direct context extraction)
 * - /api/figma/enhanced-capture (NEW: screenshot + context + AI analysis)
 *
 * Architecture: Figma API → Context Layer → Semantic Analysis → Structured Output
 * Phase 8: Server Architecture Refactoring - Context Layer Integration
 */

import { BaseRoute } from './BaseRoute.js';

export class FigmaRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Figma', serviceContainer);

    // Context Layer integration will be accessed via service container
    this.logger.info('✅ Figma routes initialized with Context Layer integration');
  }

  /**
   * Get ContextManager from service container
   * @returns {ContextManager|null} Context manager instance or null if not available
   */
  getContextManager() {
    try {
      return this.getService('contextManager', false);
    } catch (error) {
      return null;
    }
  }

  /**
   * Register Figma routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Health check endpoint
    router.get('/api/figma/health', this.asyncHandler(this.handleHealthCheck.bind(this)));

    // Mock endpoint for testing without API calls
    router.get('/api/figma/mock', this.asyncHandler(this.handleMockData.bind(this)));

    // Basic Figma API endpoints (fileKey-based)
    router.get('/api/figma/file/:fileKey', this.asyncHandler(this.handleGetFile.bind(this)));
    router.get('/api/figma/node/:fileKey/:nodeId', this.asyncHandler(this.handleGetNode.bind(this)));
    router.get('/api/figma/styles/:fileKey', this.asyncHandler(this.handleGetStyles.bind(this)));
    router.get('/api/figma/components/:fileKey', this.asyncHandler(this.handleGetComponents.bind(this)));
    router.get('/api/figma/comments/:fileKey', this.asyncHandler(this.handleGetComments.bind(this)));
    router.get('/api/figma/versions/:fileKey', this.asyncHandler(this.handleGetVersions.bind(this)));

    // URL-based endpoints (accepts full Figma URLs via query parameters)
    router.get('/api/figma/file-from-url', this.asyncHandler(this.handleGetFileFromURLQuery.bind(this)));
    router.get('/api/figma/node-from-url', this.asyncHandler(this.handleGetNodeFromURLQuery.bind(this)));
    router.get('/api/figma/styles-from-url', this.asyncHandler(this.handleGetStylesFromURLQuery.bind(this)));
    router.get('/api/figma/components-from-url', this.asyncHandler(this.handleGetComponentsFromURLQuery.bind(this)));
    router.get('/api/figma/comments-from-url', this.asyncHandler(this.handleGetCommentsFromURLQuery.bind(this)));
    router.get('/api/figma/versions-from-url', this.asyncHandler(this.handleGetVersionsFromURLQuery.bind(this)));

    // Enhanced Figma screenshot endpoint with Context Layer
    router.post('/api/figma/screenshot', this.asyncHandler(this.handleFigmaScreenshot.bind(this)));

    // New endpoint: Extract advanced context from Figma data
    router.post('/api/figma/extract-context', this.asyncHandler(this.handleContextExtraction.bind(this)));

    // New endpoint: Combined screenshot + context extraction
    router.post('/api/figma/enhanced-capture', this.asyncHandler(this.handleEnhancedCapture.bind(this)));

    // Context Layer Management Endpoints for UI
    router.get('/api/figma/context/:fileKey', this.asyncHandler(this.handleGetContextData.bind(this)));
    router.post('/api/figma/context/:fileKey', this.asyncHandler(this.handleStoreContextData.bind(this)));
    router.put('/api/figma/context/:fileKey', this.asyncHandler(this.handleUpdateContextData.bind(this)));
    router.delete('/api/figma/context/:fileKey', this.asyncHandler(this.handleDeleteContextData.bind(this)));

    // Context Layer Utilities
    router.get('/api/figma/context-summary/:fileKey', this.asyncHandler(this.handleGetContextSummary.bind(this)));
    router.post('/api/figma/context-search', this.asyncHandler(this.handleSearchContext.bind(this)));

    this.logger.info('✅ Figma routes registered with Context Layer integration');
  }

  /**
   * Handle health check requests
   */
  async handleHealthCheck(req, res) {
    this.logAccess(req, 'healthCheck');

    try {
      const healthStatus = this.getHealthStatus();

      const responseData = {
        status: 'healthy',
        service: 'Figma Routes',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        architecture: 'figma-api → context-layer → semantic-analysis',
        endpoints: {
          '/api/figma/health': 'Service health check',
          '/api/figma/mock': 'Mock data for testing',
          '/api/figma/file/:fileKey': 'Get Figma file data',
          '/api/figma/node/:fileKey/:nodeId': 'Get specific node data',
          '/api/figma/styles/:fileKey': 'Get file styles',
          '/api/figma/components/:fileKey': 'Get file components',
          '/api/figma/comments/:fileKey': 'Get file comments',
          '/api/figma/versions/:fileKey': 'Get file versions',
          '/api/figma/file-from-url?url=': 'Get file data from full URL',
          '/api/figma/node-from-url?url=&nodeId=': 'Get node data from full URL',
          '/api/figma/styles-from-url?url=': 'Get styles from full URL',
          '/api/figma/components-from-url?url=': 'Get components from full URL',
          '/api/figma/comments-from-url?url=': 'Get comments from full URL',
          '/api/figma/versions-from-url?url=': 'Get versions from full URL',
          '/api/figma/screenshot': 'Enhanced screenshot capture',
          '/api/figma/extract-context': 'Context extraction',
          '/api/figma/enhanced-capture': 'Combined capture and analysis'
        },
        contextLayer: this.getContextManager() ? 'available' : 'unavailable',
        ...healthStatus
      };

      this.sendSuccess(res, responseData, 'Figma service is healthy');
    } catch (error) {
      this.logger.error('Health check failed:', error);
      this.sendError(res, `Health check failed: ${error.message}`, 500);
    }
  }

  /**
   * Handle mock data requests for testing
   */
  async handleMockData(req, res) {
    this.logAccess(req, 'mockData');

    try {
      const mockData = {
        // Mock Figma file data
        file: {
          key: 'mock123test456',
          name: 'Design System Mock',
          lastModified: new Date().toISOString(),
          version: '1.2.3',
          nodes: {
            '1:1': {
              id: '1:1',
              name: 'Design System',
              type: 'CANVAS',
              children: ['2:1', '3:1', '4:1']
            },
            '2:1': {
              id: '2:1',
              name: 'Components',
              type: 'FRAME',
              backgroundColor: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
              width: 800,
              height: 600
            },
            '3:1': {
              id: '3:1',
              name: 'Button Primary',
              type: 'COMPONENT',
              backgroundColor: { r: 0.2, g: 0.6, b: 1, a: 1 },
              width: 120,
              height: 40,
              cornerRadius: 8
            },
            '4:1': {
              id: '4:1',
              name: 'Text Input',
              type: 'COMPONENT',
              backgroundColor: { r: 1, g: 1, b: 1, a: 1 },
              width: 200,
              height: 36,
              cornerRadius: 4
            }
          }
        },

        // Mock styles
        styles: {
          fills: {
            'primary-blue': { r: 0.2, g: 0.6, b: 1, a: 1 },
            'secondary-gray': { r: 0.5, g: 0.5, b: 0.5, a: 1 },
            'background-light': { r: 0.98, g: 0.98, b: 0.98, a: 1 }
          },
          typography: {
            'heading-1': {
              fontFamily: 'Inter',
              fontSize: 32,
              fontWeight: 600,
              lineHeight: 1.2
            },
            'body-text': {
              fontFamily: 'Inter',
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.5
            }
          }
        },

        // Mock components
        components: [
          {
            key: 'comp-123',
            name: 'Button Primary',
            description: 'Primary call-to-action button',
            componentSetId: null,
            documentationLinks: []
          },
          {
            key: 'comp-456',
            name: 'Text Input',
            description: 'Standard text input field',
            componentSetId: null,
            documentationLinks: []
          }
        ],

        // Mock screenshot data
        screenshot: {
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          format: 'base64',
          size: 68,
          quality: 'high'
        },

        // Mock context analysis
        contextAnalysis: {
          designTokens: {
            colors: {
              primary: '#3366FF',
              secondary: '#808080',
              background: '#FAFAFA'
            },
            spacing: {
              xs: '4px',
              sm: '8px',
              md: '16px',
              lg: '24px'
            },
            typography: {
              headingLarge: { size: '32px', weight: '600', family: 'Inter' },
              bodyText: { size: '16px', weight: '400', family: 'Inter' }
            }
          },
          components: [
            {
              name: 'Button Primary',
              type: 'component',
              usage: 'call-to-action',
              states: ['default', 'hover', 'pressed', 'disabled']
            },
            {
              name: 'Text Input',
              type: 'component',
              usage: 'form-input',
              states: ['default', 'focus', 'error']
            }
          ],
          layoutPatterns: [
            { type: 'grid', columns: 12, gutter: '16px' },
            { type: 'flexbox', direction: 'column', gap: '8px' }
          ],
          accessibility: {
            score: 0.85,
            issues: ['Missing alt text on decorative icons'],
            recommendations: ['Add ARIA labels to interactive elements']
          }
        },

        metadata: {
          source: 'mock-data',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          testMode: true,
          architecture: 'mock-generator'
        }
      };

      this.sendSuccess(res, mockData, 'Mock data generated successfully');
    } catch (error) {
      this.logger.error('Mock data generation failed:', error);
      this.sendError(res, `Mock data generation failed: ${error.message}`, 500);
    }
  }

  /**
   * Handle get file requests
   */
  async handleGetFile(req, res) {
    this.logAccess(req, 'getFile');

    const { fileKey } = req.params;

    if (!fileKey) {
      return this.sendError(res, 'File key is required', 400);
    }

    try {
      // For now, return mock data - in production this would call Figma API
      const mockFileData = {
        key: fileKey,
        name: `File ${fileKey}`,
        lastModified: new Date().toISOString(),
        version: '1.0.0',
        thumbnailUrl: `https://s3-alpha.figma.com/thumbnails/${fileKey}`,
        document: {
          id: '0:0',
          name: 'Document',
          type: 'DOCUMENT',
          children: [
            {
              id: '1:1',
              name: 'Page 1',
              type: 'CANVAS'
            }
          ]
        }
      };

      this.sendSuccess(res, mockFileData, 'File data retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting file:', error);
      this.sendError(res, `Failed to get file data: ${error.message}`, 500);
    }
  }

  /**
   * Handle get node requests
   */
  async handleGetNode(req, res) {
    this.logAccess(req, 'getNode');

    const { fileKey, nodeId } = req.params;

    if (!fileKey || !nodeId) {
      return this.sendError(res, 'File key and node ID are required', 400);
    }

    try {
      // Mock node data
      const mockNodeData = {
        nodes: {
          [nodeId]: {
            id: nodeId,
            name: `Node ${nodeId}`,
            type: 'FRAME',
            backgroundColor: { r: 0.95, g: 0.95, b: 0.95, a: 1 },
            width: 800,
            height: 600,
            x: 0,
            y: 0
          }
        }
      };

      this.sendSuccess(res, mockNodeData, 'Node data retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting node:', error);
      this.sendError(res, `Failed to get node data: ${error.message}`, 500);
    }
  }

  /**
   * Handle get styles requests
   */
  async handleGetStyles(req, res) {
    this.logAccess(req, 'getStyles');

    const { fileKey } = req.params;

    if (!fileKey) {
      return this.sendError(res, 'File key is required', 400);
    }

    try {
      const mockStylesData = {
        meta: {
          styles: [
            {
              key: 'style-1',
              name: 'Primary Blue',
              description: 'Primary brand color',
              styleType: 'FILL'
            },
            {
              key: 'style-2',
              name: 'Heading Large',
              description: 'Large heading text style',
              styleType: 'TEXT'
            }
          ]
        }
      };

      this.sendSuccess(res, mockStylesData, 'Styles retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting styles:', error);
      this.sendError(res, `Failed to get styles: ${error.message}`, 500);
    }
  }

  /**
   * Handle get components requests
   */
  async handleGetComponents(req, res) {
    this.logAccess(req, 'getComponents');

    const { fileKey } = req.params;

    if (!fileKey) {
      return this.sendError(res, 'File key is required', 400);
    }

    try {
      const mockComponentsData = {
        meta: {
          components: [
            {
              key: 'comp-1',
              name: 'Button Primary',
              description: 'Primary call-to-action button'
            },
            {
              key: 'comp-2',
              name: 'Text Input',
              description: 'Standard text input field'
            }
          ]
        }
      };

      this.sendSuccess(res, mockComponentsData, 'Components retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting components:', error);
      this.sendError(res, `Failed to get components: ${error.message}`, 500);
    }
  }

  /**
   * Handle get comments requests
   */
  async handleGetComments(req, res) {
    this.logAccess(req, 'getComments');

    const { fileKey } = req.params;

    if (!fileKey) {
      return this.sendError(res, 'File key is required', 400);
    }

    try {
      const mockCommentsData = {
        comments: [
          {
            id: 'comment-1',
            message: 'Great design! Love the color scheme.',
            user: { handle: 'designer1' },
            created_at: new Date().toISOString()
          }
        ]
      };

      this.sendSuccess(res, mockCommentsData, 'Comments retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting comments:', error);
      this.sendError(res, `Failed to get comments: ${error.message}`, 500);
    }
  }

  /**
   * Handle get versions requests
   */
  async handleGetVersions(req, res) {
    this.logAccess(req, 'getVersions');

    const { fileKey } = req.params;

    if (!fileKey) {
      return this.sendError(res, 'File key is required', 400);
    }

    try {
      const mockVersionsData = {
        versions: [
          {
            id: 'version-1',
            created_at: new Date().toISOString(),
            label: 'Initial design',
            description: 'First version of the design system'
          }
        ]
      };

      this.sendSuccess(res, mockVersionsData, 'Versions retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting versions:', error);
      this.sendError(res, `Failed to get versions: ${error.message}`, 500);
    }
  }

  // =============================================================================
  // URL-BASED ENDPOINTS (Handle full Figma URLs as path parameters)
  // =============================================================================

  /**
   * Extract fileKey from Figma URL
   * @param {string} figmaUrl - Full Figma URL
   * @returns {string|null} Extracted fileKey or null if invalid
   */
  extractFileKeyFromURL(figmaUrl) {
    if (!figmaUrl) return null;
    
    // Handle URLs that start with https://www.figma.com
    if (figmaUrl.startsWith('https://www.figma.com')) {
      const match = figmaUrl.match(/\/(?:file|design)\/([A-Za-z0-9]+)/);
      return match ? match[1] : null;
    }
    
    // If it's already just a fileKey, return it
    if (/^[A-Za-z0-9]+$/.test(figmaUrl)) {
      return figmaUrl;
    }
    
    return null;
  }

  /**
   * Extract nodeId from Figma URL
   * @param {string} figmaUrl - Full Figma URL  
   * @returns {string|null} Extracted nodeId or null if not found
   */
  extractNodeIdFromURL(figmaUrl) {
    if (!figmaUrl) return null;
    
    const match = figmaUrl.match(/node-id=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * Handle file requests from full URL via query parameter
   * GET /api/figma/file-from-url?url=https://figma.com/...
   */
  async handleGetFileFromURLQuery(req, res) {
    this.logAccess(req, 'getFileFromURLQuery');

    const { url: figmaUrl } = req.query;
    
    if (!figmaUrl) {
      return this.sendError(res, 'url query parameter is required', 400);
    }
    
    this.logger.info('📄 Processing file request from URL query:', { figmaUrl });

    const fileKey = this.extractFileKeyFromURL(figmaUrl);
    
    if (!fileKey) {
      return this.sendError(res, 'Invalid Figma URL - could not extract file key', 400, {
        providedUrl: figmaUrl,
        extractedFileKey: fileKey
      });
    }

    // Delegate to the existing handleGetFile method
    req.params.fileKey = fileKey;
    return this.handleGetFile(req, res);
  }

  /**
   * Handle node requests from full URL via query parameter
   * GET /api/figma/node-from-url?url=https://figma.com/...&nodeId=123
   */
  async handleGetNodeFromURLQuery(req, res) {
    this.logAccess(req, 'getNodeFromURLQuery');

    const { url: figmaUrl, nodeId: providedNodeId } = req.query;
    
    if (!figmaUrl) {
      return this.sendError(res, 'url query parameter is required', 400);
    }

    // Try to get nodeId from query parameter or extract from URL
    let nodeId = providedNodeId || this.extractNodeIdFromURL(figmaUrl);

    this.logger.info('🎯 Processing node request from URL query:', { 
      figmaUrl, 
      nodeId, 
      providedNodeId 
    });

    const fileKey = this.extractFileKeyFromURL(figmaUrl);
    
    if (!fileKey) {
      return this.sendError(res, 'Invalid Figma URL - could not extract file key', 400, {
        providedUrl: figmaUrl,
        extractedFileKey: fileKey,
        nodeId
      });
    }

    if (!nodeId) {
      return this.sendError(res, 'Could not extract node ID from URL. Provide nodeId query parameter.', 400, {
        providedUrl: figmaUrl,
        extractedFileKey: fileKey
      });
    }

    // Delegate to the existing handleGetNode method
    req.params.fileKey = fileKey;
    req.params.nodeId = nodeId;
    return this.handleGetNode(req, res);
  }

  /**
   * Handle styles requests from full URL query
   */
  async handleGetStylesFromURLQuery(req, res) {
    this.logAccess(req, 'getStylesFromURLQuery');

    const { url: figmaUrl } = req.query;
    
    if (!figmaUrl) {
      return this.sendError(res, 'url query parameter is required', 400);
    }

    const fileKey = this.extractFileKeyFromURL(figmaUrl);
    
    if (!fileKey) {
      return this.sendError(res, 'Invalid Figma URL - could not extract file key', 400);
    }

    req.params.fileKey = fileKey;
    return this.handleGetStyles(req, res);
  }

  /**
   * Handle components requests from full URL query
   */
  async handleGetComponentsFromURLQuery(req, res) {
    this.logAccess(req, 'getComponentsFromURLQuery');

    const { url: figmaUrl } = req.query;
    
    if (!figmaUrl) {
      return this.sendError(res, 'url query parameter is required', 400);
    }

    const fileKey = this.extractFileKeyFromURL(figmaUrl);
    
    if (!fileKey) {
      return this.sendError(res, 'Invalid Figma URL - could not extract file key', 400);
    }

    req.params.fileKey = fileKey;
    return this.handleGetComponents(req, res);
  }

  /**
   * Handle comments requests from full URL query
   */
  async handleGetCommentsFromURLQuery(req, res) {
    this.logAccess(req, 'getCommentsFromURLQuery');

    const { url: figmaUrl } = req.query;
    
    if (!figmaUrl) {
      return this.sendError(res, 'url query parameter is required', 400);
    }

    const fileKey = this.extractFileKeyFromURL(figmaUrl);
    
    if (!fileKey) {
      return this.sendError(res, 'Invalid Figma URL - could not extract file key', 400);
    }

    req.params.fileKey = fileKey;
    return this.handleGetComments(req, res);
  }

  /**
   * Handle versions requests from full URL query
   */
  async handleGetVersionsFromURLQuery(req, res) {
    this.logAccess(req, 'getVersionsFromURLQuery');

    const { url: figmaUrl } = req.query;
    
    if (!figmaUrl) {
      return this.sendError(res, 'url query parameter is required', 400);
    }

    const fileKey = this.extractFileKeyFromURL(figmaUrl);
    
    if (!fileKey) {
      return this.sendError(res, 'Invalid Figma URL - could not extract file key', 400);
    }

    req.params.fileKey = fileKey;
    return this.handleGetVersions(req, res);
  }

  /**
   * Handle Figma screenshot requests
   * Extracted from main server handleFigmaScreenshot method
   */
  async handleFigmaScreenshot(req, res) {
    this.logAccess(req, 'figmaScreenshot');

    const {
      figmaUrl,
      includeAnalysis,
      testMode,
      format = 'base64',
      quality = 'high'
    } = req.body;

    // Validate required fields
    if (!testMode && !figmaUrl) {
      return this.sendError(res, 'figmaUrl is required when testMode is not enabled', 400);
    }

    const screenshotService = this.getService('screenshotService');
    const visualAIService = this.getService('visualAIService');
    const redis = this.getService('redis');

    try {
      this.logger.info(`📸 Processing enhanced Figma screenshot request - testMode: ${testMode}`);

      let screenshotData;
      let analysisData = null;
      let contextData = null;
      const startTime = Date.now();

      if (testMode) {
        // Generate test screenshot for development/testing
        screenshotData = await screenshotService.generateTestScreenshot();
        this.logger.info('✅ Generated test screenshot for development');
      } else {
        // Generate real screenshot from Figma URL
        screenshotData = await screenshotService.captureFromFigma(figmaUrl, {
          format,
          quality,
          waitForLoad: true,
          viewport: { width: 1200, height: 800 }
        });
        this.logger.info('✅ Captured screenshot from Figma URL');
      }

      // Enhanced analysis using Context Layer + Visual AI
      if (includeAnalysis) {
        try {
          // 1. Context Layer analysis (semantic understanding)
          const contextManager = this.getContextManager();
          if (contextManager && !testMode) {
            contextData = await this._extractFigmaContext(figmaUrl, screenshotData);
            this.logger.info('✅ Context Layer analysis completed');
          }

          // 2. Legacy visual analysis (fallback/supplementary)
          const analysisService = this.getService('analysisService');
          if (analysisService) {
            // Initialize analysis service if not already initialized
            if (!analysisService.initialized) {
              await analysisService.initialize();
            }

            analysisData = await analysisService.analyzeScreenshot(screenshotData, {
              includeElementDetails: true,
              includeDesignInsights: true,
              includeAccessibilityCheck: true
            });
            this.logger.info('✅ Legacy visual analysis completed');
          }
        } catch (analysisError) {
          this.logger.warn('Analysis failed:', analysisError.message);
          // Continue without analysis rather than failing the entire request
        }
      }

      const processingTime = Date.now() - startTime;

      const responseData = {
        screenshot: {
          data: screenshotData,
          format: format,
          size: screenshotData.length,
          quality: quality
        },
        source: testMode ? 'test-generation' : 'figma-capture',
        figmaUrl: testMode ? null : figmaUrl,

        // Enhanced Context Layer analysis (primary)
        contextAnalysis: contextData ? {
          designTokens: contextData.designTokens || {},
          components: contextData.components || [],
          layoutPatterns: contextData.layout?.patterns || [],
          styleSystem: contextData.styles || {},
          accessibility: contextData.accessibility || {},
          semantic: contextData.semantics || {},
          confidence: contextData.extraction?.confidence || 0.75,
          processingPipeline: 'figma-api → context-layer → semantic-analysis'
        } : null,

        // Legacy visual analysis (supplementary)
        legacyAnalysis: analysisData ? {
          elements: analysisData.elements || [],
          insights: analysisData.insights || [],
          designSuggestions: analysisData.designSuggestions || [],
          accessibilityIssues: analysisData.accessibilityIssues || [],
          colorPalette: analysisData.colorPalette || [],
          typography: analysisData.typography || []
        } : null,

        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: processingTime,
          includeAnalysis: includeAnalysis,
          testMode: testMode,
          contextLayerEnabled: !!this.getContextManager(),
          architecture: 'enhanced-context-integration'
        }
      };

      // Enhanced caching with Context Layer data
      if (!testMode) {
        const cacheKey = `figma-enhanced-${Buffer.from(figmaUrl).toString('base64').slice(0, 20)}`;
        await redis.set(cacheKey, JSON.stringify({
          screenshot: screenshotData,
          contextAnalysis: contextData,
          legacyAnalysis: analysisData,
          timestamp: new Date().toISOString(),
          architecture: 'context-layer-integrated'
        }), 3600);
      }

      // Update performance metrics
      await this.updatePerformanceMetrics('figma-screenshot', processingTime, true);

      this.sendSuccess(res, responseData, 'Figma screenshot captured successfully');

    } catch (error) {
      this.logger.error('Error capturing Figma screenshot:', error);

      // Update performance metrics for failure
      await this.updatePerformanceMetrics('figma-screenshot', Date.now() - Date.now(), false);

      // Provide specific error messages
      let errorMessage = 'Failed to capture Figma screenshot';
      let errorCode = 500;

      if (error.message.includes('Invalid Figma URL')) {
        errorMessage = 'Invalid Figma URL provided';
        errorCode = 400;
      } else if (error.message.includes('Screenshot timeout')) {
        errorMessage = 'Screenshot capture timed out';
        errorCode = 408;
      } else if (error.message.includes('Access denied')) {
        errorMessage = 'Cannot access Figma file - check permissions';
        errorCode = 403;
      }

      this.sendError(res, `${errorMessage}: ${error.message}`, errorCode);
    }
  }

  /**
   * Handle advanced context extraction from Figma data
   * NEW: Direct Context Layer integration endpoint
   */
  async handleContextExtraction(req, res) {
    const { figmaUrl, frameData, options = {} } = req.body;
    
    this.logAccess(req, 'contextExtraction', {
      figmaUrl: figmaUrl ? `${figmaUrl.substring(0, 50)}...` : null,
      hasFrameData: !!frameData,
      protocolType: 'REST',
      endpoint: 'contextExtraction'
    });

    // Validate required fields
    if (!figmaUrl) {
      return this.sendError(res, 'figmaUrl is required', 400);
    }

    const contextManager = this.getContextManager();
    if (!contextManager) {
      return this.sendError(res, 'Context Layer unavailable - Context Manager not initialized', 503);
    }

    try {
      this.logger.info('🎨 Processing Figma context extraction request');
      const startTime = Date.now();

      // Extract context using Context Layer
      const contextData = await this._extractFigmaContext(figmaUrl, null, frameData, options);

      const processingTime = Date.now() - startTime;

      const responseData = {
        context: contextData,
        source: 'context-layer',
        figmaUrl: figmaUrl,
        architecture: 'figma-api → context-layer → semantic-analysis',
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: processingTime,
          contextVersion: '2.0',
          extractorCount: 5
        }
      };

      // Cache context result
      const redis = this.getService('redis');
      const cacheKey = `figma-context-${Buffer.from(figmaUrl).toString('base64').slice(0, 20)}`;
      await redis.set(cacheKey, JSON.stringify({
        context: contextData,
        timestamp: new Date().toISOString()
      }), 1800);

      await this.updatePerformanceMetrics('figma-context-extraction', processingTime, true);
      this.sendSuccess(res, responseData, 'Context extraction completed successfully');

    } catch (error) {
      this.logger.error('Error extracting Figma context:', error);
      await this.updatePerformanceMetrics('figma-context-extraction', Date.now() - Date.now(), false);
      this.sendError(res, `Context extraction failed: ${error.message}`, 500);
    }
  }

  /**
   * Handle enhanced capture (screenshot + context extraction)
   * NEW: Combined endpoint for full Figma analysis
   */
  async handleEnhancedCapture(req, res) {
    this.logAccess(req, 'enhancedCapture');

    const {
      figmaUrl,
      frameData,
      format = 'base64',
      quality = 'high',
      includeScreenshot = true,
      includeContext = true,
      includeVisualAI = false,
      options = {}
    } = req.body;

    // Validate required fields
    if (!figmaUrl) {
      return this.sendError(res, 'figmaUrl is required', 400);
    }

    const screenshotService = this.getService('screenshotService');
    const redis = this.getService('redis');

    try {
      this.logger.info('🚀 Processing enhanced Figma capture request');
      const startTime = Date.now();

      let screenshotData = null;
      let contextData = null;
      let visualAnalysis = null;

      // Parallel processing for better performance
      const tasks = [];

      // 1. Screenshot capture
      if (includeScreenshot) {
        tasks.push(
          screenshotService.captureFromFigma(figmaUrl, {
            format,
            quality,
            waitForLoad: true,
            viewport: { width: 1200, height: 800 }
          }).then(data => { screenshotData = data; })
        );
      }

      // 2. Context Layer analysis
      const contextManager = this.getContextManager();
      if (includeContext && contextManager) {
        tasks.push(
          this._extractFigmaContext(figmaUrl, null, frameData, options)
            .then(data => { contextData = data; })
        );
      }

      // 3. Optional visual AI analysis
      if (includeVisualAI) {
        const analysisService = this.getService('analysisService');
        if (analysisService && screenshotData) {
          tasks.push(
            analysisService.analyzeScreenshot(screenshotData, options)
              .then(data => { visualAnalysis = data; })
          );
        }
      }

      // Wait for all tasks to complete
      await Promise.allSettled(tasks);
      const processingTime = Date.now() - startTime;

      const responseData = {
        screenshot: screenshotData ? {
          data: screenshotData,
          format: format,
          size: screenshotData.length,
          quality: quality
        } : null,

        contextAnalysis: contextData ? {
          designTokens: contextData.designTokens || {},
          components: contextData.components || [],
          layoutPatterns: contextData.layout?.patterns || [],
          styleSystem: contextData.styles || {},
          accessibility: contextData.accessibility || {},
          semantic: contextData.semantics || {},
          confidence: contextData.extraction?.confidence || 0.75
        } : null,

        visualAnalysis: visualAnalysis || null,

        source: 'enhanced-capture',
        figmaUrl: figmaUrl,
        architecture: 'parallel-processing → context-layer + screenshot + visual-ai',

        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: processingTime,
          includeScreenshot: includeScreenshot,
          includeContext: includeContext,
          includeVisualAI: includeVisualAI,
          contextLayerEnabled: !!this.getContextManager(),
          parallelProcessing: true
        }
      };

      // Enhanced caching
      const cacheKey = `figma-enhanced-capture-${Buffer.from(figmaUrl).toString('base64').slice(0, 20)}`;
      await redis.set(cacheKey, JSON.stringify({
        ...responseData,
        timestamp: new Date().toISOString()
      }), 3600);

      await this.updatePerformanceMetrics('figma-enhanced-capture', processingTime, true);
      this.sendSuccess(res, responseData, 'Enhanced capture completed successfully');

    } catch (error) {
      this.logger.error('Error in enhanced capture:', error);
      await this.updatePerformanceMetrics('figma-enhanced-capture', Date.now() - Date.now(), false);
      this.sendError(res, `Enhanced capture failed: ${error.message}`, 500);
    }
  }

  /**
   * Extract context from Figma data using Context Layer
   * @param {string} figmaUrl - Figma URL
   * @param {string} screenshotData - Screenshot data (optional)
   * @param {Array} frameData - Frame data (optional)
   * @param {Object} options - Extraction options
   * @returns {Object} Context data
   */
  async _extractFigmaContext(figmaUrl, screenshotData = null, frameData = null, options = {}) {
    const contextManager = this.getContextManager();
    if (!contextManager) {
      throw new Error('Context Manager not available');
    }

    try {
      // Prepare Figma data for Context Layer
      const figmaData = {
        url: figmaUrl,
        nodes: frameData || [],
        screenshot: screenshotData,
        metadata: {
          extractedAt: new Date().toISOString(),
          source: 'figma-routes',
          version: '2.0'
        }
      };

      // Add any additional context from Figma API if available
      if (frameData && Array.isArray(frameData)) {
        figmaData.nodes = frameData.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          ...node
        }));
      }

      // Extract context using Context Manager
      const contextResult = await contextManager.extractContext(figmaData, options);

      this.logger.info('✅ Context extraction successful', {
        nodesAnalyzed: contextResult.nodes?.length || 0,
        componentsFound: contextResult.components?.length || 0,
        stylesExtracted: Object.keys(contextResult.styles || {}).length,
        confidence: contextResult.extraction?.confidence
      });

      return contextResult;

    } catch (error) {
      this.logger.error('Context extraction failed:', error);
      throw error;
    }
  }

  /**
   * Update performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   * @param {boolean} success - Whether operation was successful
   */
  async updatePerformanceMetrics(operation, duration, success) {
    try {
      const redis = this.getService('redis');
      const metricsKey = 'performance-metrics';

      const currentMetrics = await redis.get(metricsKey) || {};
      const metrics = typeof currentMetrics === 'string' ? JSON.parse(currentMetrics) : currentMetrics;

      // Initialize metrics if needed
      if (!metrics[operation]) {
        metrics[operation] = {
          totalRequests: 0,
          successfulRequests: 0,
          totalDuration: 0,
          averageDuration: 0,
          successRate: 0
        };
      }

      // Update metrics
      const opMetrics = metrics[operation];
      opMetrics.totalRequests++;
      if (success) {opMetrics.successfulRequests++;}
      opMetrics.totalDuration += duration;
      opMetrics.averageDuration = opMetrics.totalDuration / opMetrics.totalRequests;
      opMetrics.successRate = (opMetrics.successfulRequests / opMetrics.totalRequests) * 100;

      // Update global metrics
      if (!metrics.global) {
        metrics.global = {
          totalRequests: 0,
          successfulRequests: 0,
          averageResponseTime: 0,
          successRate: 0
        };
      }

      metrics.global.totalRequests++;
      if (success) {metrics.global.successfulRequests++;}
      metrics.global.successRate = (metrics.global.successfulRequests / metrics.global.totalRequests) * 100;

      // Calculate global average response time
      const allDurations = Object.values(metrics)
        .filter(m => m.totalDuration)
        .reduce((acc, m) => acc + m.totalDuration, 0);
      const allRequests = Object.values(metrics)
        .filter(m => m.totalRequests)
        .reduce((acc, m) => acc + m.totalRequests, 0);

      if (allRequests > 0) {
        metrics.global.averageResponseTime = allDurations / allRequests;
      }

      await redis.set(metricsKey, JSON.stringify(metrics), 86400);

    } catch (error) {
      this.logger.warn('Failed to update performance metrics:', error.message);
    }
  }

  /**
   * Get Figma routes health status with Context Layer integration
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      architecture: 'figma-api → context-layer → semantic-analysis',
      contextLayerEnabled: !!this.getContextManager(),

      endpoints: [
        '/api/figma/screenshot (enhanced with Context Layer)',
        '/api/figma/extract-context (NEW)',
        '/api/figma/enhanced-capture (NEW)'
      ],

      serviceRequirements: [
        'screenshotService',
        'visualAIService (optional)',
        'redis',
        'contextManager (Context Layer)'
      ],

      capabilities: [
        'figma-screenshot-capture',
        'context-layer-analysis',
        'semantic-design-understanding',
        'design-token-extraction',
        'component-relationship-mapping',
        'layout-pattern-recognition',
        'accessibility-analysis',
        'parallel-processing',
        'enhanced-caching'
      ],

      newFeatures: [
        'Context Layer integration',
        'Semantic design analysis',
        'Design system intelligence',
        'Component pattern recognition',
        'Enhanced screenshot analysis'
      ],

      supportedFormats: ['base64', 'buffer'],
      supportedQualities: ['low', 'medium', 'high'],

      contextManager: this.getContextManager() ? {
        status: 'available',
        extractors: 5,
        capabilities: [
          'node-parsing',
          'style-extraction',
          'component-mapping',
          'layout-analysis',
          'prototype-mapping'
        ]
      } : {
        status: 'unavailable',
        reason: 'Context Manager not initialized'
      }
    };
  }

  // =============================================================================
  // CONTEXT LAYER MANAGEMENT ENDPOINTS FOR UI
  // =============================================================================

  /**
   * Get context data for a specific file
   * GET /api/figma/context/:fileKey
   */
  async handleGetContextData(req, res) {
    this.logAccess(req, 'getContextData');

    try {
      const { fileKey } = req.params;
      const { nodeId, includeMetadata = true } = req.query;

      const contextManager = this.getContextManager();
      if (!contextManager) {
        return this.sendError(res, 'Context Manager not available', 503);
      }

      // Get cached context data or extract fresh
      const redis = this.getService('redis');
      const cacheKey = `figma-context-${fileKey}${nodeId ? `-${nodeId}` : ''}`;

      let contextData = await redis.get(cacheKey);

      if (!contextData) {
        // Extract fresh context data
        const figmaUrl = `https://www.figma.com/file/${fileKey}`;
        const result = await this._extractFigmaContext(figmaUrl);
        contextData = result;

        // Cache for 1 hour
        await redis.set(cacheKey, JSON.stringify(contextData), 3600);
      } else {
        contextData = JSON.parse(contextData);
      }

      const responseData = {
        fileKey,
        nodeId: nodeId || null,
        context: contextData,
        cached: !!contextData.cached,
        timestamp: new Date().toISOString()
      };

      if (includeMetadata) {
        responseData.metadata = {
          extractors: contextData.extractors?.length || 0,
          confidence: contextData.confidence || 0,
          processingTime: contextData.processingTime || 0
        };
      }

      return this.sendSuccess(res, responseData);

    } catch (error) {
      this.logger.error('Error getting context data:', error);
      return this.sendError(res, `Failed to get context data: ${error.message}`, 500);
    }
  }

  /**
   * Store new context data for a file
   * POST /api/figma/context/:fileKey
   */
  async handleStoreContextData(req, res) {
    this.logAccess(req, 'storeContextData');

    try {
      const { fileKey } = req.params;
      const { context, nodeId, metadata = {} } = req.body;

      if (!context) {
        return this.sendError(res, 'Context data is required', 400);
      }

      const contextManager = this.getContextManager();
      if (!contextManager) {
        return this.sendError(res, 'Context Manager not available', 503);
      }

      // Store context data with metadata
      const redis = this.getService('redis');
      const cacheKey = `figma-context-${fileKey}${nodeId ? `-${nodeId}` : ''}`;

      const contextRecord = {
        fileKey,
        nodeId: nodeId || null,
        context,
        metadata: {
          ...metadata,
          stored: new Date().toISOString(),
          source: 'user-provided'
        },
        version: 1
      };

      await redis.set(cacheKey, JSON.stringify(contextRecord), 7200); // 2 hours

      return this.sendSuccess(res, {
        message: 'Context data stored successfully',
        fileKey,
        nodeId: nodeId || null,
        cacheKey,
        ttl: 7200
      });

    } catch (error) {
      this.logger.error('Error storing context data:', error);
      return this.sendError(res, `Failed to store context data: ${error.message}`, 500);
    }
  }

  /**
   * Update existing context data
   * PUT /api/figma/context/:fileKey
   */
  async handleUpdateContextData(req, res) {
    this.logAccess(req, 'updateContextData');

    try {
      const { fileKey } = req.params;
      const { context, nodeId, metadata = {}, merge = true } = req.body;

      const contextManager = this.getContextManager();
      if (!contextManager) {
        return this.sendError(res, 'Context Manager not available', 503);
      }

      const redis = this.getService('redis');
      const cacheKey = `figma-context-${fileKey}${nodeId ? `-${nodeId}` : ''}`;

      // Get existing context data
      let existingData = await redis.get(cacheKey);
      if (!existingData) {
        return this.sendError(res, 'Context data not found', 404);
      }

      existingData = JSON.parse(existingData);

      // Update context data
      const updatedContext = merge ?
        { ...existingData.context, ...context } :
        context;

      const updatedRecord = {
        ...existingData,
        context: updatedContext,
        metadata: {
          ...existingData.metadata,
          ...metadata,
          updated: new Date().toISOString(),
          version: (existingData.version || 1) + 1
        }
      };

      await redis.set(cacheKey, JSON.stringify(updatedRecord), 7200);

      return this.sendSuccess(res, {
        message: 'Context data updated successfully',
        fileKey,
        nodeId: nodeId || null,
        version: updatedRecord.version,
        updated: updatedRecord.metadata.updated
      });

    } catch (error) {
      this.logger.error('Error updating context data:', error);
      return this.sendError(res, `Failed to update context data: ${error.message}`, 500);
    }
  }

  /**
   * Delete context data for a file
   * DELETE /api/figma/context/:fileKey
   */
  async handleDeleteContextData(req, res) {
    this.logAccess(req, 'deleteContextData');

    try {
      const { fileKey } = req.params;
      const { nodeId } = req.query;

      const redis = this.getService('redis');
      const cacheKey = `figma-context-${fileKey}${nodeId ? `-${nodeId}` : ''}`;

      const exists = await redis.exists(cacheKey);
      if (!exists) {
        return this.sendError(res, 'Context data not found', 404);
      }

      await redis.del(cacheKey);

      return this.sendSuccess(res, {
        message: 'Context data deleted successfully',
        fileKey,
        nodeId: nodeId || null,
        deleted: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Error deleting context data:', error);
      return this.sendError(res, `Failed to delete context data: ${error.message}`, 500);
    }
  }

  /**
   * Get context summary for a file
   * GET /api/figma/context-summary/:fileKey
   */
  async handleGetContextSummary(req, res) {
    this.logAccess(req, 'getContextSummary');

    try {
      const { fileKey } = req.params;

      const redis = this.getService('redis');

      // Get all context keys for this file
      const pattern = `figma-context-${fileKey}*`;
      const keys = await redis.keys(pattern);

      const summary = {
        fileKey,
        totalContexts: keys.length,
        contexts: [],
        generated: new Date().toISOString()
      };

      // Get summary info for each context
      for (const key of keys.slice(0, 10)) { // Limit to first 10
        try {
          const data = await redis.get(key);
          if (data) {
            const parsed = JSON.parse(data);
            summary.contexts.push({
              nodeId: parsed.nodeId,
              cacheKey: key,
              version: parsed.version || 1,
              stored: parsed.metadata?.stored,
              updated: parsed.metadata?.updated,
              confidence: parsed.context?.confidence || 0,
              extractors: parsed.context?.extractors?.length || 0
            });
          }
        } catch (error) {
          this.logger.warn(`Failed to parse context data for key ${key}:`, error.message);
        }
      }

      return this.sendSuccess(res, summary);

    } catch (error) {
      this.logger.error('Error getting context summary:', error);
      return this.sendError(res, `Failed to get context summary: ${error.message}`, 500);
    }
  }

  /**
   * Search context data across files
   * POST /api/figma/context-search
   */
  async handleSearchContext(req, res) {
    this.logAccess(req, 'searchContext');

    try {
      const { query, fileKeys = [], nodeTypes = [], limit = 20 } = req.body;

      if (!query) {
        return this.sendError(res, 'Search query is required', 400);
      }

      const redis = this.getService('redis');
      const results = [];

      // Build search pattern
      const patterns = fileKeys.length > 0
        ? fileKeys.map(key => `figma-context-${key}*`)
        : ['figma-context-*'];

      for (const pattern of patterns) {
        const keys = await redis.keys(pattern);

        for (const key of keys.slice(0, limit)) {
          try {
            const data = await redis.get(key);
            if (data) {
              const parsed = JSON.parse(data);

              // Simple text search in context data
              const contextStr = JSON.stringify(parsed.context).toLowerCase();
              const queryLower = query.toLowerCase();

              if (contextStr.includes(queryLower)) {
                results.push({
                  fileKey: parsed.fileKey,
                  nodeId: parsed.nodeId,
                  cacheKey: key,
                  relevance: this._calculateRelevance(contextStr, queryLower),
                  preview: this._extractPreview(parsed.context, query),
                  metadata: {
                    version: parsed.version,
                    confidence: parsed.context?.confidence || 0,
                    updated: parsed.metadata?.updated || parsed.metadata?.stored
                  }
                });
              }
            }
          } catch (error) {
            this.logger.warn(`Failed to search context data for key ${key}:`, error.message);
          }
        }
      }

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);

      return this.sendSuccess(res, {
        query,
        totalResults: results.length,
        results: results.slice(0, limit),
        searched: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Error searching context data:', error);
      return this.sendError(res, `Failed to search context data: ${error.message}`, 500);
    }
  }

  /**
   * Calculate search relevance score
   * @private
   */
  _calculateRelevance(text, query) {
    const occurrences = (text.match(new RegExp(query, 'gi')) || []).length;
    const density = occurrences / text.length * 1000;
    return Math.min(density, 1);
  }

  /**
   * Extract preview text around search matches
   * @private
   */
  _extractPreview(context, query, maxLength = 200) {
    const contextStr = JSON.stringify(context, null, 2);
    const queryIndex = contextStr.toLowerCase().indexOf(query.toLowerCase());

    if (queryIndex === -1) {return '';}

    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(contextStr.length, queryIndex + maxLength);

    return contextStr.substring(start, end) + (end < contextStr.length ? '...' : '');
  }
}
export default FigmaRoutes;
