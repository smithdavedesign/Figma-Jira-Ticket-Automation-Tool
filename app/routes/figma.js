/**
 * Figma Routes Module
 *
 * Handles Figma-specific endpoints including screenshots.
 * Routes: /api/figma/screenshot
 *
 * Phase 8: Server Architecture Refactoring - Phase 3
 */

import { BaseRoute } from './BaseRoute.js';

export class FigmaRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Figma', serviceContainer);
  }

  /**
   * Register Figma routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Figma screenshot endpoint
    router.post('/api/figma/screenshot', this.asyncHandler(this.handleFigmaScreenshot.bind(this)));

    this.logger.info('✅ Figma routes registered');
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
    if (!testMode) {
      const validation = this.validateRequired(req.body, ['figmaUrl']);
      if (!validation.valid) {
        return this.sendError(res, 400, 'Validation failed', validation.errors);
      }
    }

    const screenshotService = this.getService('screenshotService');
    const visualAIService = this.getService('visualAIService');
    const redis = this.getService('redis');

    try {
      this.logger.info(`📸 Processing Figma screenshot request - testMode: ${testMode}`);

      let screenshotData;
      let analysisData = null;
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

      // Perform visual analysis if requested
      if (includeAnalysis && visualAIService) {
        try {
          analysisData = await visualAIService.analyzeScreenshot(screenshotData, {
            includeElementDetails: true,
            includeDesignInsights: true,
            includeAccessibilityCheck: true
          });
          this.logger.info('✅ Visual analysis completed');
        } catch (analysisError) {
          this.logger.warn('Visual analysis failed:', analysisError.message);
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
        analysis: analysisData ? {
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
          testMode: testMode
        }
      };

      // Cache screenshot result if not in test mode
      if (!testMode) {
        const cacheKey = `figma-screenshot-${Buffer.from(figmaUrl).toString('base64').slice(0, 20)}`;
        await redis.setex(cacheKey, 3600, JSON.stringify({
          screenshot: screenshotData,
          analysis: analysisData,
          timestamp: new Date().toISOString()
        }));
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

      this.sendError(res, errorCode, errorMessage, error.message);
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

      await redis.setex(metricsKey, 86400, JSON.stringify(metrics));

    } catch (error) {
      this.logger.warn('Failed to update performance metrics:', error.message);
    }
  }

  /**
   * Get Figma routes health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      endpoints: [
        '/api/figma/screenshot'
      ],
      serviceRequirements: [
        'screenshotService',
        'visualAIService',
        'redis'
      ],
      capabilities: [
        'figma-screenshot-capture',
        'test-screenshot-generation',
        'visual-analysis',
        'performance-tracking',
        'result-caching'
      ],
      supportedFormats: ['base64', 'buffer'],
      supportedQualities: ['low', 'medium', 'high']
    };
  }
}
export default FigmaRoutes;
