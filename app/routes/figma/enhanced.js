/**
 * Figma Enhanced Routes Module
 * 
 * Advanced Figma operations with Context Layer integration.
 * Handles enhanced capture, context extraction, and AI analysis.
 */

import crypto from 'crypto';
import { z } from 'zod';
import { BaseFigmaRoute } from './base.js';

// Schema validation for enhanced endpoints
const EnhancedCaptureSchema = z.object({
  figmaUrl: z.string().url(),
  frameData: z.array(z.any()).optional(),
  format: z.enum(['base64', 'png', 'jpg']).default('base64'),
  quality: z.enum(['low', 'medium', 'high']).default('high'),
  includeScreenshot: z.boolean().default(true),
  includeContext: z.boolean().default(true),
  includeVisualAI: z.boolean().default(false),
  options: z.object({}).optional().default({})
});

const ContextExtractionSchema = z.object({
  figmaUrl: z.string().url(),
  frameData: z.array(z.any()).optional(),
  options: z.object({}).optional().default({})
});

const StoreContextSchema = z.object({
  context: z.object({}),
  nodeId: z.string().optional(),
  metadata: z.object({}).optional().default({})
});

export class FigmaEnhancedRoutes extends BaseFigmaRoute {
  constructor(serviceContainer) {
    super('FigmaEnhanced', serviceContainer);
  }

  /**
   * Register enhanced Figma routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Enhanced screenshot endpoint with Context Layer
    router.post('/api/figma/screenshot', this.asyncHandler(this.handleFigmaScreenshot.bind(this)));

    // New endpoint: Extract advanced context from Figma data
    router.post('/api/figma/extract-context', this.asyncHandler(this.handleContextExtraction.bind(this)));

    // New endpoint: Combined screenshot + context extraction  
    router.post('/api/figma/enhanced-capture', this.asyncHandler(this.handleEnhancedCapture.bind(this)));

    this.logger.info('✅ Figma enhanced routes registered');
  }

  /**
   * Handle enhanced Figma screenshot requests
   */
  async handleFigmaScreenshot(req, res) {
    this.logAccess(req, 'figmaScreenshot', { 
      protocolType: 'REST',
      endpoint: 'enhancedScreenshot'
    });

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

    try {
      this.validateServices(['screenshotService', 'redis']);
      const screenshotService = this.getService('screenshotService');
      const redis = this.getService('redis');

      this.logger.debug(`📸 Processing enhanced Figma screenshot request - testMode: ${testMode}`);

      let screenshotData;
      let analysisData = null;
      let contextData = null;
      const startTime = Date.now();

      if (testMode) {
        // Generate test screenshot for development/testing
        screenshotData = await screenshotService.generateTestScreenshot();
        this.logger.debug('✅ Generated test screenshot for development');
      } else {
        // Generate real screenshot from Figma URL
        screenshotData = await screenshotService.captureFromFigma(figmaUrl, {
          format,
          quality,
          waitForLoad: true,
          viewport: { width: 1200, height: 800 }
        });
        this.logger.debug('✅ Captured screenshot from Figma URL');
      }

      // Enhanced analysis using Context Layer + Visual AI
      if (includeAnalysis) {
        try {
          // 1. Context Layer analysis (semantic understanding)
          const contextManager = this.getContextManager();
          if (contextManager && !testMode) {
            contextData = await this._extractFigmaContext(figmaUrl, screenshotData);
            this.logger.debug('✅ Context Layer analysis completed');
          }

          // 2. Legacy visual analysis (fallback/supplementary)
          const analysisService = this.getService('analysisService', false);
          if (analysisService) {
            if (!analysisService.initialized) {
              await analysisService.initialize();
            }

            analysisData = await analysisService.analyzeScreenshot(screenshotData, {
              includeElementDetails: true,
              includeDesignInsights: true,
              includeAccessibilityCheck: true
            });
            this.logger.debug('✅ Legacy visual analysis completed');
          }
        } catch (analysisError) {
          this.logger.warn('Analysis failed:', analysisError.message);
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

      // Enhanced caching with secure keys
      if (!testMode) {
        const cacheKey = this.generateCacheKey('figma-enhanced', figmaUrl);
        await redis.set(cacheKey, JSON.stringify({
          screenshot: screenshotData,
          contextAnalysis: contextData,
          legacyAnalysis: analysisData,
          timestamp: new Date().toISOString(),
          architecture: 'context-layer-integrated'
        }), 3600);
      }

      this.sendSuccess(res, responseData, 'Figma screenshot captured successfully');

    } catch (error) {
      this.handleFigmaError(error, res, 'capture enhanced screenshot');
    }
  }

  /**
   * Handle advanced context extraction from Figma data
   */
  async handleContextExtraction(req, res) {
    try {
      const validatedBody = ContextExtractionSchema.parse(req.body);
      const { figmaUrl, frameData, options } = validatedBody;
      
      this.logAccess(req, 'contextExtraction', {
        figmaUrl: `${figmaUrl.substring(0, 50)}...`,
        hasFrameData: !!frameData,
        protocolType: 'REST',
        endpoint: 'contextExtraction'
      });

      const contextManager = this.getContextManager();
      if (!contextManager) {
        return this.sendError(res, 'Context Layer unavailable - Context Manager not initialized', 503);
      }

      this.logger.debug('🎨 Processing Figma context extraction request');
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

      // Cache context result with secure key
      const redis = this.getService('redis');
      const cacheKey = this.generateCacheKey('figma-context', figmaUrl);
      await redis.set(cacheKey, JSON.stringify({
        context: contextData,
        timestamp: new Date().toISOString()
      }), 1800);

      this.sendSuccess(res, responseData, 'Context extraction completed successfully');

    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.sendError(res, `Validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      this.handleFigmaError(error, res, 'extract context');
    }
  }

  /**
   * Handle enhanced capture (screenshot + context extraction) with fixed dependencies
   */
  async handleEnhancedCapture(req, res) {
    try {
      const validatedBody = EnhancedCaptureSchema.parse(req.body);
      
      this.logAccess(req, 'enhancedCapture');

      const {
        figmaUrl,
        frameData,
        format,
        quality,
        includeScreenshot,
        includeContext,
        includeVisualAI,
        options
      } = validatedBody;

      this.validateServices(['screenshotService', 'redis']);
      const screenshotService = this.getService('screenshotService');
      const redis = this.getService('redis');

      this.logger.debug('🚀 Processing enhanced Figma capture request');
      const startTime = Date.now();

      let screenshotData = null;
      let contextData = null;
      let visualAnalysis = null;

      // Sequential processing with proper dependencies
      const tasks = [];

      // 1. Screenshot capture (if needed)
      if (includeScreenshot) {
        const screenshotTask = screenshotService.captureFromFigma(figmaUrl, {
          format,
          quality,
          waitForLoad: true,
          viewport: { width: 1200, height: 800 }
        });
        tasks.push(screenshotTask);
      }

      // 2. Context Layer analysis (independent)
      const contextManager = this.getContextManager();
      if (includeContext && contextManager) {
        const contextTask = this._extractFigmaContext(figmaUrl, null, frameData, options);
        tasks.push(contextTask);
      }

      // Execute independent tasks in parallel
      const results = await Promise.allSettled(tasks);
      
      // Process results
      if (includeScreenshot && results[0]?.status === 'fulfilled') {
        screenshotData = results[0].value;
      }
      
      if (includeContext && results[1]?.status === 'fulfilled') {
        contextData = results[1].value;
      }

      // 3. Visual AI analysis (depends on screenshot)
      if (includeVisualAI && screenshotData) {
        try {
          const analysisService = this.getService('analysisService', false);
          if (analysisService) {
            if (!analysisService.initialized) {
              await analysisService.initialize();
            }
            visualAnalysis = await analysisService.analyzeScreenshot(screenshotData, options);
          }
        } catch (analysisError) {
          this.logger.warn('Visual AI analysis failed:', analysisError.message);
        }
      }

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
        architecture: 'sequential-dependency-processing → context-layer + screenshot + visual-ai',

        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: processingTime,
          includeScreenshot: includeScreenshot,
          includeContext: includeContext,
          includeVisualAI: includeVisualAI,
          contextLayerEnabled: !!this.getContextManager(),
          dependencyProcessing: true
        }
      };

      // Enhanced caching with secure key
      const cacheKey = this.generateCacheKey('figma-enhanced-capture', figmaUrl);
      await redis.set(cacheKey, JSON.stringify({
        ...responseData,
        timestamp: new Date().toISOString()
      }), 3600);

      this.sendSuccess(res, responseData, 'Enhanced capture completed successfully');

    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.sendError(res, `Validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      this.handleFigmaError(error, res, 'enhanced capture');
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
          source: 'figma-enhanced-routes',
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

      this.logger.debug('✅ Context extraction successful', {
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
}

export default FigmaEnhancedRoutes;