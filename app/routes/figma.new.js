/**
 * Consolidated Figma Routes Module
 * 
 * Unified Figma routes combining all specialized modules.
 * This replaces the monolithic figma.js with modular architecture.
 */

import FigmaCoreRoutes from './figma/core.js';
import FigmaEnhancedRoutes from './figma/enhanced.js';
import FigmaContextRoutes from './figma/context.js';
import FigmaMetricsRoutes from './figma/metrics.js';
import { BaseRoute } from './BaseRoute.js';

export class FigmaRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Figma', serviceContainer);
    
    // Initialize specialized route modules
    this.coreRoutes = new FigmaCoreRoutes(serviceContainer);
    this.enhancedRoutes = new FigmaEnhancedRoutes(serviceContainer);
    this.contextRoutes = new FigmaContextRoutes(serviceContainer);
    this.metricsRoutes = new FigmaMetricsRoutes(serviceContainer);

    this.logger.info('✅ Figma routes initialized with modular architecture');
  }

  /**
   * Register all Figma routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Register routes from all modules
    this.coreRoutes.registerRoutes(router);
    this.enhancedRoutes.registerRoutes(router);
    this.contextRoutes.registerRoutes(router);
    this.metricsRoutes.registerRoutes(router);

    this.logger.info('✅ All Figma routes registered successfully');
  }

  /**
   * Get consolidated health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const baseHealth = super.getHealthStatus();
    
    return {
      ...baseHealth,
      architecture: 'modular-figma-routes',
      modules: [
        'figma-core-routes (basic operations, consolidated screenshots)',
        'figma-enhanced-routes (context layer, AI analysis)',
        'figma-context-routes (CRUD operations, search)',
        'figma-metrics-routes (performance monitoring)'
      ],
      consolidatedFeatures: [
        'unified-screenshot-logic',
        'secure-cache-keys',
        'batched-redis-operations',
        'schema-validation',
        'dependency-aware-processing',
        'enhanced-search-relevance',
        'atomic-metrics-operations'
      ],
      improvements: [
        'Eliminated code duplication between api.js and figma.js',
        'Implemented secure SHA-1 cache keys to prevent collisions',
        'Added Zod schema validation for request safety',
        'Fixed parallel task dependencies in enhanced capture',
        'Optimized Redis operations with batching',
        'Enhanced search relevance with field weighting',
        'Migrated to Redis hashes for atomic metrics'
      ]
    };
  }

  /**
   * Update performance metrics (delegates to metrics module)
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds  
   * @param {boolean} success - Whether operation was successful
   */
  async updatePerformanceMetrics(operation, duration, success) {
    return this.metricsRoutes.updatePerformanceMetrics(operation, duration, success);
  }
}

export default FigmaRoutes;