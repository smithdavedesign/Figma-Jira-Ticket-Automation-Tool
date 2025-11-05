/**
 * AI Routes Module
 *
 * Handles AI-specific endpoints including health checks and orchestration.
 * Routes: /api/ai/*
 *
 * Phase 8: Server Architecture Refactoring - Route Consolidation
 */

import { BaseRoute } from '../BaseRoute.js';

export class AIRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('AI', serviceContainer);
  }

  /**
   * Register AI routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // AI health endpoint for dashboard monitoring
    router.get('/api/ai/health', this.asyncHandler(this.handleAIHealth.bind(this)));

    // Additional AI endpoints can be added here in the future
    // router.get('/api/ai/providers', this.asyncHandler(this.handleAIProviders.bind(this)));
    // router.post('/api/ai/analyze', this.asyncHandler(this.handleAIAnalyze.bind(this)));

    this.logger.info('✅ AI routes registered');
  }

  /**
   * Handle AI health check requests
   * Moved from api.js for better organization
   */
  async handleAIHealth(req, res) {
    this.logAccess(req, 'aiHealth');

    try {
      const aiOrchestrator = this.getService('aiOrchestrator');
      const visualAIService = this.getService('visualAIService');

      const aiStatus = {
        orchestrator: !!aiOrchestrator,
        visualService: !!visualAIService,
        providers: [],
        timestamp: new Date().toISOString()
      };

      // Get AI provider info if available
      if (aiOrchestrator && typeof aiOrchestrator.getProviders === 'function') {
        aiStatus.providers = aiOrchestrator.getProviders().map(provider => ({
          name: provider.name,
          model: provider.model,
          available: provider.available !== false
        }));
      }

      // Check if visual AI service is initialized
      if (visualAIService) {
        aiStatus.geminiInitialized = true;
      }

      this.sendSuccess(res, aiStatus, 'AI services health check', 200);

    } catch (error) {
      this.sendError(res, `AI health check failed: ${error.message}`, 500);
    }
  }

  /**
   * Get AI routes health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      endpoints: [
        '/api/ai/health'
      ],
      serviceRequirements: [
        'aiOrchestrator',
        'visualAIService'
      ],
      optionalServices: [
        'geminiAdapter'
      ]
    };
  }
}

export default AIRoutes;