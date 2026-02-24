/**
 * Health Routes — simple server health check.
 */

import { BaseRoute } from './BaseRoute.js';

export class HealthRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Health', serviceContainer);
  }

  registerRoutes(router) {
    router.get('/', this.asyncHandler(this.handleHealthCheck.bind(this)));
    router.get('/health', this.asyncHandler(this.handleHealthCheck.bind(this)));
    this.logger.info('✅ Health routes registered');
  }

  async handleHealthCheck(req, res) {
    this.logAccess(req, 'healthCheck');

    const redis = this.getService('redis');
    const redisHealth = await redis.healthCheck();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      redis: redisHealth,
      services: this.services.getHealthStatus()
    });
  }
}

export default HealthRoutes;