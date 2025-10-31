/**
 * Health Routes Module
 *
 * Handles health check and monitoring endpoints.
 * Routes: /, /api/figma/health
 *
 * Phase 8: Server Architecture Refactoring - Phase 3
 */

import { BaseRoute } from './BaseRoute.js';

export class HealthRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Health', serviceContainer);
  }

  /**
   * Register health routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Main health check endpoint
    router.get('/', this.asyncHandler(this.handleHealthCheck.bind(this)));

    // Figma service health check
    router.get('/api/figma/health', this.asyncHandler(this.handleFigmaHealth.bind(this)));

    this.logger.info('✅ Health routes registered');
  }

  /**
   * Handle main health check requests
   * Extracted from main server handleHealthCheck method
   */
  async handleHealthCheck(req, res) {
    this.logAccess(req, 'healthCheck');

    // Get services for health checks
    const redis = this.getService('redis');
    const sessionManager = this.getService('sessionManager');

    // Perform health checks
    const redisHealth = await redis.healthCheck();
    const sessionStatus = sessionManager.getStatus();

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      server: 'Figma AI Ticket Generator MCP Server (Refactored Architecture)',
      architecture: 'MVC + Node.js + Redis + Gemini 2.0 Flash + Service Container',
      phase: 'Phase 8: Server Architecture Refactoring',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      storage: {
        redis: redisHealth,
        sessions: sessionStatus
      },
      ai: this.getAIHealthStatus(),
      testing: this.getTestingHealthStatus(),
      features: this.getFeaturesHealthStatus(redisHealth),
      services: this.services.getHealthStatus()
    };

    // Use custom JSON response for health check (matches original format)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthData, null, 2));
  }

  /**
   * Handle Figma service health check
   * Extracted from main server handleFigmaHealth method
   */
  async handleFigmaHealth(req, res) {
    this.logAccess(req, 'figmaHealth');

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Figma Screenshot API',
      version: '1.0.0',
      endpoints: {
        screenshot: '/api/figma/screenshot',
        health: '/api/figma/health'
      },
      architecture: 'Refactored Service Architecture'
    };

    this.sendSuccess(res, healthData, 'Figma service is healthy');
  }

  /**
   * Get AI services health status
   * @returns {Object} AI health status
   */
  getAIHealthStatus() {
    try {
      const aiOrchestrator = this.getService('aiOrchestrator');
      const visualAIService = this.getService('visualAIService');
      const geminiAdapter = this.getService('geminiAdapter');

      return {
        geminiModel: 'gemini-2.0-flash',
        visualEnhancedAI: !!visualAIService,
        aiOrchestrator: !!aiOrchestrator,
        geminiAdapter: !!geminiAdapter,
        providers: ['gemini', 'gpt4', 'claude'],
        capabilities: [
          'multimodal-analysis',
          'screenshot-processing',
          'visual-enhanced-context',
          'provider-fallback',
          'rate-limiting',
          'redis-caching'
        ]
      };
    } catch (error) {
      this.logger.warn('AI services not fully initialized:', error.message);
      return {
        status: 'initializing',
        error: error.message
      };
    }
  }

  /**
   * Get testing framework health status
   * @returns {Object} Testing health status
   */
  getTestingHealthStatus() {
    return {
      aiTestDashboard: '/api/ai-test-dashboard',
      aiTestScenarios: '/api/test-ai-scenario',
      screenshotTests: '/api/test-ai-screenshots',
      consolidatedSuite: '/tests/integration/test-consolidated-suite.html',
      capabilities: [
        'visual-ai-testing',
        'multimodal-scenarios',
        'real-screenshot-analysis',
        'integrated-dashboard',
        'comprehensive-e2e'
      ]
    };
  }

  /**
   * Get features health status
   * @param {Object} redisHealth - Redis health status
   * @returns {Object} Features health status
   */
  getFeaturesHealthStatus(redisHealth) {
    return {
      aiIntegration: process.env.GEMINI_API_KEY ? true : false,
      templateSystem: true,
      visualAnalysis: true,
      persistentStorage: redisHealth.status === 'healthy',
      testMonitoring: process.env.TEST_MONITOR_ENABLED === 'true',
      aiTestSuite: true,
      gemini2Flash: true,
      multiModalAI: true,
      serviceArchitecture: true,
      dependencyInjection: true
    };
  }

  /**
   * Get health routes health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      endpoints: [
        '/',
        '/api/figma/health'
      ],
      serviceRequirements: [
        'redis',
        'sessionManager',
        'aiOrchestrator',
        'visualAIService',
        'geminiAdapter'
      ]
    };
  }
}

export default HealthRoutes;