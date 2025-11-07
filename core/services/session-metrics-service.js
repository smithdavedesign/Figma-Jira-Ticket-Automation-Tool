/**
 * Session Metrics Service
 *
 * Centralized service for collecting, aggregating, and providing session performance metrics
 * for both SessionManager and FigmaSessionManager across the application.
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class SessionMetricsService {
  constructor() {
    this.logger = new Logger('SessionMetricsService');
    this.errorHandler = new ErrorHandler();

    // Aggregated metrics across all session managers
    this.globalMetrics = {
      sessions: {
        total: 0,
        active: 0,
        created: 0,
        expired: 0
      },
      performance: {
        averageResponseTime: 0,
        responseTimes: [],
        slowQueries: [],
        errors: []
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        memoryUsage: 0,
        redisUsage: 0
      },
      services: {
        figmaApi: {
          available: false,
          requests: 0,
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        },
        mcpServer: {
          available: false,
          requests: 0,
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        },
        redis: {
          connected: false,
          hits: 0,
          misses: 0,
          errors: 0
        }
      },
      health: {
        overallScore: 100,
        status: 'healthy',
        issues: [],
        lastCheck: Date.now()
      },
      startTime: Date.now()
    };

    // Registered session managers
    this.sessionManagers = new Map();

    // Configuration
    this.config = {
      metricsUpdateInterval: 5000, // 5 seconds
      healthCheckInterval: 30000, // 30 seconds
      maxResponseTimes: 1000,
      maxSlowQueries: 100,
      maxErrors: 500,
      slowQueryThreshold: 100 // ms
    };

    // Start periodic tasks
    this.startPeriodicTasks();
  }

  /**
   * Register a session manager for metrics collection
   */
  registerSessionManager(name, sessionManager) {
    this.sessionManagers.set(name, sessionManager);
    this.logger.info(`📊 Registered session manager: ${name}`);
  }

  /**
   * Unregister a session manager
   */
  unregisterSessionManager(name) {
    this.sessionManagers.delete(name);
    this.logger.info(`📊 Unregistered session manager: ${name}`);
  }

  /**
   * Start periodic metrics collection and health checks
   */
  startPeriodicTasks() {
    // Metrics collection
    setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsUpdateInterval);

    // Health checks
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    this.logger.info('📊 Started periodic metrics collection');
  }

  /**
   * Collect metrics from all registered session managers
   */
  async collectMetrics() {
    try {
      let totalSessions = 0;
      const totalResponseTimes = [];
      let totalCacheHits = 0;
      let totalCacheMisses = 0;
      let totalErrors = 0;

      for (const [name, manager] of this.sessionManagers) {
        try {
          let metrics;

          // Get metrics based on manager type
          if (typeof manager.getPerformanceMetrics === 'function') {
            metrics = manager.getPerformanceMetrics();
          } else if (typeof manager.getStatus === 'function') {
            const status = manager.getStatus();
            metrics = status.metrics || {};
          }

          if (metrics) {
            // Aggregate session data
            if (metrics.sessions) {
              totalSessions += metrics.sessions.active || 0;
              this.globalMetrics.sessions.created += (metrics.sessions.created || 0) - (this.lastMetrics?.[name]?.sessions?.created || 0);
            }

            // Aggregate performance data
            if (metrics.performance && metrics.performance.responseTimes) {
              totalResponseTimes.push(...metrics.performance.responseTimes.slice(-10)); // Last 10 only
            }

            // Aggregate cache data
            if (metrics.cache) {
              totalCacheHits += (metrics.cache.hits || 0) - (this.lastMetrics?.[name]?.cache?.hits || 0);
              totalCacheMisses += (metrics.cache.misses || 0) - (this.lastMetrics?.[name]?.cache?.misses || 0);
            }

            // Track errors
            totalErrors += (metrics.errors || 0) - (this.lastMetrics?.[name]?.errors || 0);

            // Store for next comparison
            if (!this.lastMetrics) {this.lastMetrics = {};}
            this.lastMetrics[name] = metrics;
          }
        } catch (error) {
          this.logger.warn(`Failed to collect metrics from ${name}:`, error.message);
        }
      }

      // Update global metrics
      this.globalMetrics.sessions.active = totalSessions;
      this.globalMetrics.cache.hits += totalCacheHits;
      this.globalMetrics.cache.misses += totalCacheMisses;

      // Update cache hit rate
      const totalCacheRequests = this.globalMetrics.cache.hits + this.globalMetrics.cache.misses;
      this.globalMetrics.cache.hitRate = totalCacheRequests > 0 ?
        (this.globalMetrics.cache.hits / totalCacheRequests) * 100 : 0;

      // Update response times
      if (totalResponseTimes.length > 0) {
        this.globalMetrics.performance.responseTimes.push(...totalResponseTimes);

        // Keep only recent response times
        if (this.globalMetrics.performance.responseTimes.length > this.config.maxResponseTimes) {
          this.globalMetrics.performance.responseTimes =
            this.globalMetrics.performance.responseTimes.slice(-this.config.maxResponseTimes);
        }

        // Update average
        const times = this.globalMetrics.performance.responseTimes;
        this.globalMetrics.performance.averageResponseTime =
          times.reduce((a, b) => a + b, 0) / times.length;
      }

      // Track slow queries
      const slowQueries = totalResponseTimes.filter(time => time > this.config.slowQueryThreshold);
      if (slowQueries.length > 0) {
        this.globalMetrics.performance.slowQueries.push(...slowQueries.map(time => ({
          responseTime: time,
          timestamp: Date.now()
        })));

        // Keep only recent slow queries
        if (this.globalMetrics.performance.slowQueries.length > this.config.maxSlowQueries) {
          this.globalMetrics.performance.slowQueries =
            this.globalMetrics.performance.slowQueries.slice(-this.config.maxSlowQueries);
        }
      }

    } catch (error) {
      this.logger.error('Failed to collect metrics:', error);
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    try {
      const issues = [];
      let score = 100;

      // Check session managers
      for (const [name, manager] of this.sessionManagers) {
        try {
          let status;

          if (typeof manager.getStatus === 'function') {
            status = manager.getStatus();
          } else if (typeof manager.getPerformanceMetrics === 'function') {
            const metrics = manager.getPerformanceMetrics();
            status = { health: metrics.health };
          }

          if (status && status.health) {
            if (status.health.status === 'critical') {
              issues.push(`${name}: Critical status`);
              score -= 30;
            } else if (status.health.status === 'degraded') {
              issues.push(`${name}: Degraded performance`);
              score -= 15;
            }

            if (status.health.issues && status.health.issues.length > 0) {
              issues.push(...status.health.issues.map(issue => `${name}: ${issue}`));
              score -= 5 * status.health.issues.length;
            }
          }
        } catch (error) {
          issues.push(`${name}: Health check failed - ${error.message}`);
          score -= 10;
        }
      }

      // Check overall performance
      if (this.globalMetrics.performance.averageResponseTime > 500) {
        issues.push('High average response time');
        score -= 20;
      }

      if (this.globalMetrics.cache.hitRate < 50) {
        issues.push('Low overall cache hit rate');
        score -= 15;
      }

      if (this.globalMetrics.performance.slowQueries.length > 50) {
        issues.push('High number of slow queries');
        score -= 10;
      }

      // Update health status
      this.globalMetrics.health.overallScore = Math.max(0, Math.round(score));
      this.globalMetrics.health.issues = issues;
      this.globalMetrics.health.lastCheck = Date.now();

      if (score >= 90) {
        this.globalMetrics.health.status = 'healthy';
      } else if (score >= 70) {
        this.globalMetrics.health.status = 'degraded';
      } else if (score >= 40) {
        this.globalMetrics.health.status = 'poor';
      } else {
        this.globalMetrics.health.status = 'critical';
      }

      this.logger.debug(`Health check completed: ${this.globalMetrics.health.status} (${score}/100)`);

    } catch (error) {
      this.logger.error('Health check failed:', error);
      this.globalMetrics.health.status = 'unknown';
      this.globalMetrics.health.issues = ['Health check system failure'];
    }
  }

  /**
   * Get comprehensive metrics for dashboard
   */
  getMetrics() {
    return {
      ...this.globalMetrics,
      uptime: Date.now() - this.globalMetrics.startTime,
      timestamp: Date.now(),
      sessionManagers: Array.from(this.sessionManagers.keys())
    };
  }

  /**
   * Get real-time performance data
   */
  getRealTimeMetrics() {
    const recentResponseTimes = this.globalMetrics.performance.responseTimes.slice(-50);
    const recentSlowQueries = this.globalMetrics.performance.slowQueries.slice(-20);

    return {
      performance: {
        current: {
          averageResponseTime: recentResponseTimes.length > 0 ?
            recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length : 0,
          minResponseTime: recentResponseTimes.length > 0 ? Math.min(...recentResponseTimes) : 0,
          maxResponseTime: recentResponseTimes.length > 0 ? Math.max(...recentResponseTimes) : 0,
          requestsPerSecond: recentResponseTimes.length / 10 // Approximate
        },
        trends: {
          responseTimes: recentResponseTimes,
          slowQueries: recentSlowQueries
        }
      },
      sessions: {
        active: this.globalMetrics.sessions.active,
        total: this.globalMetrics.sessions.total,
        createdRecently: this.globalMetrics.sessions.created
      },
      cache: {
        hitRate: Math.round(this.globalMetrics.cache.hitRate * 100) / 100,
        recentHits: this.globalMetrics.cache.hits,
        recentMisses: this.globalMetrics.cache.misses
      },
      health: {
        score: this.globalMetrics.health.overallScore,
        status: this.globalMetrics.health.status,
        issueCount: this.globalMetrics.health.issues.length
      }
    };
  }

  /**
   * Get session persistence indicators
   */
  getSessionPersistenceIndicators() {
    const indicators = {};

    for (const [name, manager] of this.sessionManagers) {
      try {
        let status;

        if (typeof manager.getStatus === 'function') {
          status = manager.getStatus();
        }

        indicators[name] = {
          redisConnected: status?.redisConnected || false,
          memoryFallback: !status?.redisConnected,
          totalSessions: status?.totalSessions || 0,
          persistenceHealth: status?.redisConnected ? 'redis' : 'memory-only'
        };
      } catch (error) {
        indicators[name] = {
          redisConnected: false,
          memoryFallback: true,
          totalSessions: 0,
          persistenceHealth: 'unknown',
          error: error.message
        };
      }
    }

    return indicators;
  }

  /**
   * Record a session event for metrics
   */
  recordEvent(managerName, eventType, data = {}) {
    try {
      const timestamp = Date.now();

      switch (eventType) {
      case 'session_created':
        this.globalMetrics.sessions.created++;
        this.globalMetrics.sessions.total++;
        break;

      case 'session_expired':
        this.globalMetrics.sessions.expired++;
        break;

      case 'cache_hit':
        this.globalMetrics.cache.hits++;
        break;

      case 'cache_miss':
        this.globalMetrics.cache.misses++;
        break;

      case 'error':
        this.globalMetrics.performance.errors.push({
          manager: managerName,
          error: data.error,
          timestamp
        });

        // Keep only recent errors
        if (this.globalMetrics.performance.errors.length > this.config.maxErrors) {
          this.globalMetrics.performance.errors =
            this.globalMetrics.performance.errors.slice(-this.config.maxErrors);
        }
        break;
      }

      this.logger.debug(`📊 Recorded event: ${eventType} from ${managerName}`);
    } catch (error) {
      this.logger.warn(`Failed to record event ${eventType}:`, error);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    // Clear intervals
    if (this.metricsInterval) {clearInterval(this.metricsInterval);}
    if (this.healthInterval) {clearInterval(this.healthInterval);}

    this.logger.info('📊 Session metrics service cleaned up');
  }
}

// Export singleton instance
export const sessionMetricsService = new SessionMetricsService();