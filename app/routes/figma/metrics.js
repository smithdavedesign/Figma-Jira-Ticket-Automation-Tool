/**
 * Figma Metrics Routes Module
 * 
 * Performance monitoring and metrics endpoints for Figma operations.
 * Uses Redis hashes for efficient atomic operations.
 */

import { BaseFigmaRoute } from './base.js';

export class FigmaMetricsRoutes extends BaseFigmaRoute {
  constructor(serviceContainer) {
    super('FigmaMetrics', serviceContainer);
  }

  /**
   * Register metrics routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Metrics endpoints
    router.get('/api/figma/metrics', this.asyncHandler(this.handleGetMetrics.bind(this)));
    router.get('/api/figma/metrics/:operation', this.asyncHandler(this.handleGetOperationMetrics.bind(this)));
    router.post('/api/figma/metrics/reset', this.asyncHandler(this.handleResetMetrics.bind(this)));

    this.logger.info('✅ Figma metrics routes registered');
  }

  /**
   * Update performance metrics using Redis hashes for atomic operations
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   * @param {boolean} success - Whether operation was successful
   */
  async updatePerformanceMetrics(operation, duration, success) {
    try {
      const redis = this.getService('redis');
      const metricsKey = `metrics:figma:${operation}`;
      const globalKey = 'metrics:figma:global';

      // Use Redis hashes for atomic operations
      const pipeline = redis.pipeline();

      // Update operation-specific metrics
      pipeline.hincrby(metricsKey, 'totalRequests', 1);
      pipeline.hincrby(metricsKey, 'totalDuration', duration);
      
      if (success) {
        pipeline.hincrby(metricsKey, 'successfulRequests', 1);
      } else {
        pipeline.hincrby(metricsKey, 'failedRequests', 1);
      }

      // Update global metrics
      pipeline.hincrby(globalKey, 'totalRequests', 1);
      pipeline.hincrby(globalKey, 'totalDuration', duration);
      
      if (success) {
        pipeline.hincrby(globalKey, 'successfulRequests', 1);
      } else {
        pipeline.hincrby(globalKey, 'failedRequests', 1);
      }

      // Set TTL for metrics (24 hours)
      pipeline.expire(metricsKey, 86400);
      pipeline.expire(globalKey, 86400);

      await pipeline.exec();

      // Update calculated fields (averages, rates) periodically
      await this._updateCalculatedMetrics(operation);

    } catch (error) {
      this.logger.warn('Failed to update performance metrics:', error.message);
    }
  }

  /**
   * Get comprehensive metrics
   * GET /api/figma/metrics
   */
  async handleGetMetrics(req, res) {
    this.logAccess(req, 'getMetrics');

    try {
      const redis = this.getService('redis');
      const { timeRange = '24h', operations } = req.query;

      // Get global metrics
      const globalMetrics = await redis.hgetall('metrics:figma:global');
      
      // Get all operation metrics
      const pattern = 'metrics:figma:*';
      const keys = await redis.keys(pattern);
      const operationKeys = keys.filter(key => !key.endsWith(':global'));

      const operationMetrics = {};
      
      for (const key of operationKeys) {
        const operation = key.replace('metrics:figma:', '');
        const metrics = await redis.hgetall(key);
        
        if (Object.keys(metrics).length > 0) {
          operationMetrics[operation] = this._processMetrics(metrics);
        }
      }

      // Calculate summary statistics
      const summary = this._calculateSummaryStats(globalMetrics, operationMetrics);

      const responseData = {
        timeRange,
        timestamp: new Date().toISOString(),
        summary,
        global: this._processMetrics(globalMetrics),
        operations: operationMetrics,
        metadata: {
          totalOperations: Object.keys(operationMetrics).length,
          metricsVersion: '2.0',
          storageType: 'redis-hashes'
        }
      };

      this.sendSuccess(res, responseData, 'Metrics retrieved successfully');

    } catch (error) {
      this.handleFigmaError(error, res, 'get metrics');
    }
  }

  /**
   * Get metrics for a specific operation
   * GET /api/figma/metrics/:operation
   */
  async handleGetOperationMetrics(req, res) {
    this.logAccess(req, 'getOperationMetrics');

    try {
      const { operation } = req.params;
      const { includeHistory = false } = req.query;

      const redis = this.getService('redis');
      const metricsKey = `metrics:figma:${operation}`;

      const metrics = await redis.hgetall(metricsKey);
      
      if (Object.keys(metrics).length === 0) {
        return this.sendError(res, `No metrics found for operation: ${operation}`, 404);
      }

      const processedMetrics = this._processMetrics(metrics);

      const responseData = {
        operation,
        timestamp: new Date().toISOString(),
        metrics: processedMetrics,
        performance: {
          grade: this._calculatePerformanceGrade(processedMetrics),
          recommendations: this._getPerformanceRecommendations(processedMetrics)
        }
      };

      // Optionally include historical data
      if (includeHistory) {
        responseData.history = await this._getHistoricalMetrics(operation);
      }

      this.sendSuccess(res, responseData, `Metrics for ${operation} retrieved successfully`);

    } catch (error) {
      this.handleFigmaError(error, res, 'get operation metrics');
    }
  }

  /**
   * Reset metrics
   * POST /api/figma/metrics/reset
   */
  async handleResetMetrics(req, res) {
    this.logAccess(req, 'resetMetrics');

    try {
      const { operations, confirm } = req.body;

      if (!confirm) {
        return this.sendError(res, 'Reset confirmation required', 400);
      }

      const redis = this.getService('redis');

      if (operations && Array.isArray(operations)) {
        // Reset specific operations
        const pipeline = redis.pipeline();
        for (const operation of operations) {
          pipeline.del(`metrics:figma:${operation}`);
        }
        await pipeline.exec();

        this.logger.info(`🔄 Reset metrics for operations: ${operations.join(', ')}`);
        
        return this.sendSuccess(res, {
          message: 'Operation metrics reset successfully',
          operations,
          timestamp: new Date().toISOString()
        });

      } else {
        // Reset all metrics
        const pattern = 'metrics:figma:*';
        const keys = await redis.keys(pattern);
        
        if (keys.length > 0) {
          await redis.del(...keys);
        }

        this.logger.info('🔄 Reset all Figma metrics');

        return this.sendSuccess(res, {
          message: 'All Figma metrics reset successfully',
          resetCount: keys.length,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      this.handleFigmaError(error, res, 'reset metrics');
    }
  }

  /**
   * Process raw metrics into calculated values
   * @private
   */
  _processMetrics(rawMetrics) {
    const totalRequests = parseInt(rawMetrics.totalRequests || 0);
    const successfulRequests = parseInt(rawMetrics.successfulRequests || 0);
    const failedRequests = parseInt(rawMetrics.failedRequests || 0);
    const totalDuration = parseInt(rawMetrics.totalDuration || 0);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalDuration,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests * 100).toFixed(2) : '0.00',
      errorRate: totalRequests > 0 ? (failedRequests / totalRequests * 100).toFixed(2) : '0.00',
      averageDuration: totalRequests > 0 ? (totalDuration / totalRequests).toFixed(2) : '0.00',
      requestsPerMinute: rawMetrics.requestsPerMinute || '0.00',
      lastUpdated: rawMetrics.lastUpdated || new Date().toISOString()
    };
  }

  /**
   * Calculate summary statistics
   * @private
   */
  _calculateSummaryStats(globalMetrics, operationMetrics) {
    const operations = Object.keys(operationMetrics);
    const totalOps = operations.length;

    // Find best and worst performing operations
    let bestOperation = null;
    let worstOperation = null;
    let bestSuccessRate = 0;
    let worstSuccessRate = 100;

    for (const [operation, metrics] of Object.entries(operationMetrics)) {
      const successRate = parseFloat(metrics.successRate);
      
      if (successRate > bestSuccessRate) {
        bestSuccessRate = successRate;
        bestOperation = operation;
      }
      
      if (successRate < worstSuccessRate) {
        worstSuccessRate = successRate;
        worstOperation = operation;
      }
    }

    return {
      totalOperations: totalOps,
      bestPerforming: bestOperation ? {
        operation: bestOperation,
        successRate: `${bestSuccessRate}%`
      } : null,
      worstPerforming: worstOperation ? {
        operation: worstOperation,
        successRate: `${worstSuccessRate}%`
      } : null,
      overallHealth: this._calculateOverallHealth(globalMetrics)
    };
  }

  /**
   * Calculate overall system health grade
   * @private
   */
  _calculateOverallHealth(globalMetrics) {
    const processed = this._processMetrics(globalMetrics);
    const successRate = parseFloat(processed.successRate);
    const avgDuration = parseFloat(processed.averageDuration);

    let healthScore = 0;
    
    // Success rate component (0-50 points)
    if (successRate >= 99) healthScore += 50;
    else if (successRate >= 95) healthScore += 40;
    else if (successRate >= 90) healthScore += 30;
    else if (successRate >= 80) healthScore += 20;
    else healthScore += 10;

    // Performance component (0-30 points)
    if (avgDuration <= 500) healthScore += 30;
    else if (avgDuration <= 1000) healthScore += 25;
    else if (avgDuration <= 2000) healthScore += 20;
    else if (avgDuration <= 5000) healthScore += 15;
    else healthScore += 10;

    // Volume component (0-20 points)
    const totalRequests = parseInt(globalMetrics.totalRequests || 0);
    if (totalRequests > 1000) healthScore += 20;
    else if (totalRequests > 100) healthScore += 15;
    else if (totalRequests > 10) healthScore += 10;
    else healthScore += 5;

    // Convert to grade
    if (healthScore >= 90) return { grade: 'A', score: healthScore, status: 'excellent' };
    if (healthScore >= 80) return { grade: 'B', score: healthScore, status: 'good' };
    if (healthScore >= 70) return { grade: 'C', score: healthScore, status: 'fair' };
    if (healthScore >= 60) return { grade: 'D', score: healthScore, status: 'poor' };
    return { grade: 'F', score: healthScore, status: 'critical' };
  }

  /**
   * Calculate performance grade for specific operation
   * @private
   */
  _calculatePerformanceGrade(metrics) {
    const successRate = parseFloat(metrics.successRate);
    const avgDuration = parseFloat(metrics.averageDuration);

    if (successRate >= 99 && avgDuration <= 500) return 'A+';
    if (successRate >= 95 && avgDuration <= 1000) return 'A';
    if (successRate >= 90 && avgDuration <= 2000) return 'B';
    if (successRate >= 80 && avgDuration <= 5000) return 'C';
    return 'D';
  }

  /**
   * Get performance recommendations
   * @private
   */
  _getPerformanceRecommendations(metrics) {
    const recommendations = [];
    const successRate = parseFloat(metrics.successRate);
    const avgDuration = parseFloat(metrics.averageDuration);

    if (successRate < 95) {
      recommendations.push('Consider implementing retry logic for failed requests');
    }
    
    if (avgDuration > 2000) {
      recommendations.push('Optimize request processing time - consider caching or parallel processing');
    }
    
    if (parseInt(metrics.totalRequests) < 10) {
      recommendations.push('Low usage detected - consider promoting this endpoint');
    }

    return recommendations;
  }

  /**
   * Update calculated metrics fields
   * @private
   */
  async _updateCalculatedMetrics(operation) {
    try {
      const redis = this.getService('redis');
      const metricsKey = `metrics:figma:${operation}`;

      // Get current metrics
      const metrics = await redis.hgetall(metricsKey);
      const totalRequests = parseInt(metrics.totalRequests || 0);
      const totalDuration = parseInt(metrics.totalDuration || 0);

      if (totalRequests > 0) {
        // Calculate and store average duration
        const avgDuration = (totalDuration / totalRequests).toFixed(2);
        await redis.hset(metricsKey, 'averageDuration', avgDuration);
        
        // Update last updated timestamp
        await redis.hset(metricsKey, 'lastUpdated', new Date().toISOString());
      }

    } catch (error) {
      this.logger.warn('Failed to update calculated metrics:', error.message);
    }
  }

  /**
   * Get historical metrics (placeholder for future implementation)
   * @private
   */
  async _getHistoricalMetrics(operation) {
    // Placeholder - could implement time-series data collection
    return {
      note: 'Historical metrics not yet implemented',
      suggestion: 'Consider implementing time-series data collection for trends'
    };
  }
}

export default FigmaMetricsRoutes;