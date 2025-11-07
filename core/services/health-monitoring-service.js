/**
 * Health Monitoring Service
 *
 * Comprehensive system health monitoring with real-time metrics collection,
 * status indicators, and alert system for critical system components.
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class HealthMonitoringService {
  constructor(serviceContainer = null) {
    this.logger = new Logger('HealthMonitoringService');
    this.errorHandler = new ErrorHandler();
    this.serviceContainer = serviceContainer;

    // Health status tracking
    this.componentStatuses = new Map();
    this.alerts = [];
    this.metrics = {
      uptime: Date.now(),
      errors: 0,
      warnings: 0,
      requests: 0,
      responseTime: [],
      memoryUsage: [],
      cpuUsage: [],
      lastUpdate: Date.now()
    };

    // Configuration
    this.config = {
      checkInterval: 30000, // 30 seconds
      alertThresholds: {
        errorRate: 0.05, // 5% error rate
        responseTime: 2000, // 2 seconds
        memoryUsage: 0.8, // 80% memory usage
        cpuUsage: 0.8 // 80% CPU usage
      },
      metricsRetention: 100, // Keep last 100 data points
      criticalServices: ['redis', 'figmaApi', 'contextManager', 'templateManager']
    };

    this.monitoringInterval = null;
    this.initialized = false;
  }

  /**
   * Initialize health monitoring service
   */
  async initialize() {
    try {
      this.logger.info('Initializing Health Monitoring Service...');

      // Initialize component status tracking
      await this.initializeComponentTracking();

      // Start monitoring interval
      this.startMonitoring();

      this.initialized = true;
      this.logger.info('✅ Health Monitoring Service initialized successfully');

      return {
        success: true,
        message: 'Health monitoring initialized',
        components: this.componentStatuses.size,
        alertsConfigured: Object.keys(this.config.alertThresholds).length
      };
    } catch (error) {
      this.logger.error('Failed to initialize Health Monitoring Service:', error);
      this.errorHandler.handle(error, { service: 'HealthMonitoringService', operation: 'initialize' });
      throw error;
    }
  }

  /**
   * Initialize component status tracking
   */
  async initializeComponentTracking() {
    const components = [
      { name: 'redis', type: 'database', critical: true },
      { name: 'figmaApi', type: 'external', critical: true },
      { name: 'contextManager', type: 'service', critical: true },
      { name: 'templateManager', type: 'service', critical: true },
      { name: 'sessionManager', type: 'service', critical: false },
      { name: 'mcpServer', type: 'service', critical: false },
      { name: 'aiOrchestrator', type: 'service', critical: false },
      { name: 'screenshotService', type: 'service', critical: false }
    ];

    for (const component of components) {
      this.componentStatuses.set(component.name, {
        ...component,
        status: 'unknown',
        lastCheck: null,
        lastSuccess: null,
        errors: 0,
        responseTime: null,
        details: {}
      });
    }

    this.logger.info(`Component tracking initialized for ${components.length} components`);
  }

  /**
   * Start health monitoring
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
        await this.collectSystemMetrics();
        await this.checkAlertConditions();
        this.metrics.lastUpdate = Date.now();
      } catch (error) {
        this.logger.error('Health monitoring cycle failed:', error);
        this.metrics.errors++;
      }
    }, this.config.checkInterval);

    this.logger.info('Health monitoring started');
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const checkPromises = [];

    for (const [componentName] of this.componentStatuses) {
      checkPromises.push(this.checkComponent(componentName));
    }

    await Promise.allSettled(checkPromises);
  }

  /**
   * Check individual component health
   */
  async checkComponent(componentName) {
    const startTime = Date.now();
    const component = this.componentStatuses.get(componentName);

    try {
      let status = 'healthy';
      const details = {};

      switch (componentName) {
      case 'redis':
        status = await this.checkRedis();
        break;
      case 'figmaApi':
        status = await this.checkFigmaApi();
        break;
      case 'contextManager':
        status = await this.checkContextManager();
        break;
      case 'templateManager':
        status = await this.checkTemplateManager();
        break;
      case 'sessionManager':
        status = await this.checkSessionManager();
        break;
      case 'mcpServer':
        status = await this.checkMcpServer();
        break;
      case 'aiOrchestrator':
        status = await this.checkAiOrchestrator();
        break;
      case 'screenshotService':
        status = await this.checkScreenshotService();
        break;
      default:
        status = 'unknown';
      }

      const responseTime = Date.now() - startTime;

      // Update component status
      this.componentStatuses.set(componentName, {
        ...component,
        status,
        lastCheck: Date.now(),
        lastSuccess: status === 'healthy' ? Date.now() : component.lastSuccess,
        responseTime,
        details
      });

      if (status !== 'healthy') {
        component.errors++;
      }

    } catch (error) {
      this.componentStatuses.set(componentName, {
        ...component,
        status: 'error',
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
        details: { error: error.message }
      });

      component.errors++;
      this.logger.error(`Health check failed for ${componentName}:`, error);
    }
  }

  /**
   * Component-specific health checks
   */
  async checkRedis() {
    if (this.serviceContainer) {
      const redis = this.serviceContainer.get('redis');
      if (redis && redis.isConnected && redis.isConnected()) {
        return 'healthy';
      }
    }
    return 'error';
  }

  async checkFigmaApi() {
    try {
      // Simple API connectivity check
      const response = await fetch('https://api.figma.com/v1/me', {
        method: 'GET',
        headers: {
          'X-Figma-Token': process.env.FIGMA_TOKEN || 'test'
        }
      });

      return response.status === 200 || response.status === 401 ? 'healthy' : 'degraded';
    } catch (error) {
      return 'error';
    }
  }

  async checkContextManager() {
    if (this.serviceContainer) {
      const contextManager = this.serviceContainer.get('contextManager');
      return contextManager ? 'healthy' : 'error';
    }
    return 'unknown';
  }

  async checkTemplateManager() {
    if (this.serviceContainer) {
      const templateManager = this.serviceContainer.get('templateManager');
      return templateManager ? 'healthy' : 'error';
    }
    return 'unknown';
  }

  async checkSessionManager() {
    if (this.serviceContainer) {
      const sessionManager = this.serviceContainer.get('sessionManager');
      return sessionManager ? 'healthy' : 'error';
    }
    return 'unknown';
  }

  async checkMcpServer() {
    try {
      const response = await fetch('http://localhost:3000/api/mcp/tools', {
        method: 'GET',
        timeout: 5000
      });
      return response.ok ? 'healthy' : 'degraded';
    } catch (error) {
      return 'error';
    }
  }

  async checkAiOrchestrator() {
    if (this.serviceContainer) {
      const aiOrchestrator = this.serviceContainer.get('aiOrchestrator');
      return aiOrchestrator ? 'healthy' : 'error';
    }
    return 'unknown';
  }

  async checkScreenshotService() {
    if (this.serviceContainer) {
      const screenshotService = this.serviceContainer.get('screenshotService');
      return screenshotService ? 'healthy' : 'error';
    }
    return 'unknown';
  }

  /**
   * Collect system metrics
   */
  async collectSystemMetrics() {
    try {
      // Memory usage
      const memUsage = process.memoryUsage();
      const memoryUsage = memUsage.heapUsed / memUsage.heapTotal;

      // Add to metrics with retention limit
      if (this.metrics.memoryUsage.length >= this.config.metricsRetention) {
        this.metrics.memoryUsage.shift();
      }
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        value: memoryUsage,
        details: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memUsage.external / 1024 / 1024) // MB
        }
      });

      // CPU usage (simplified)
      const cpuUsage = process.cpuUsage();
      if (this.metrics.cpuUsage.length >= this.config.metricsRetention) {
        this.metrics.cpuUsage.shift();
      }
      this.metrics.cpuUsage.push({
        timestamp: Date.now(),
        value: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
        details: cpuUsage
      });

    } catch (error) {
      this.logger.error('Failed to collect system metrics:', error);
    }
  }

  /**
   * Check alert conditions
   */
  async checkAlertConditions() {
    const newAlerts = [];

    // Check error rate
    const errorRate = this.calculateErrorRate();
    if (errorRate > this.config.alertThresholds.errorRate) {
      newAlerts.push({
        id: `error-rate-${Date.now()}`,
        type: 'critical',
        component: 'system',
        message: `High error rate: ${(errorRate * 100).toFixed(2)}%`,
        threshold: this.config.alertThresholds.errorRate,
        value: errorRate,
        timestamp: Date.now()
      });
    }

    // Check memory usage
    const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    if (latestMemory && latestMemory.value > this.config.alertThresholds.memoryUsage) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        component: 'system',
        message: `High memory usage: ${(latestMemory.value * 100).toFixed(2)}%`,
        threshold: this.config.alertThresholds.memoryUsage,
        value: latestMemory.value,
        timestamp: Date.now()
      });
    }

    // Check critical services
    for (const serviceName of this.config.criticalServices) {
      const service = this.componentStatuses.get(serviceName);
      if (service && service.status === 'error') {
        newAlerts.push({
          id: `critical-service-${serviceName}-${Date.now()}`,
          type: 'critical',
          component: serviceName,
          message: `Critical service ${serviceName} is down`,
          timestamp: Date.now()
        });
      }
    }

    // Add new alerts
    this.alerts.push(...newAlerts);

    // Keep only recent alerts (last 50)
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    if (newAlerts.length > 0) {
      this.logger.warn(`Generated ${newAlerts.length} new alerts`);
    }
  }

  /**
   * Calculate system error rate
   */
  calculateErrorRate() {
    const total = this.metrics.requests;
    const errors = this.metrics.errors;
    return total > 0 ? errors / total : 0;
  }

  /**
   * Get comprehensive health status
   */
  getHealthStatus() {
    const components = Array.from(this.componentStatuses.entries()).map(([name, status]) => ({
      name,
      ...status
    }));

    const healthyCount = components.filter(c => c.status === 'healthy').length;
    const totalCount = components.length;
    const overallHealth = healthyCount / totalCount;

    let overallStatus = 'healthy';
    if (overallHealth < 0.5) {
      overallStatus = 'critical';
    } else if (overallHealth < 0.8) {
      overallStatus = 'degraded';
    }

    return {
      overall: {
        status: overallStatus,
        score: Math.round(overallHealth * 100),
        uptime: Date.now() - this.metrics.uptime,
        lastUpdate: this.metrics.lastUpdate
      },
      components,
      metrics: {
        errors: this.metrics.errors,
        warnings: this.metrics.warnings,
        requests: this.metrics.requests,
        errorRate: this.calculateErrorRate(),
        memoryUsage: this.metrics.memoryUsage.slice(-10), // Last 10 points
        cpuUsage: this.metrics.cpuUsage.slice(-10)
      },
      alerts: this.alerts.slice(-10) // Last 10 alerts
    };
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics() {
    return {
      timestamp: Date.now(),
      uptime: Date.now() - this.metrics.uptime,
      memoryUsage: this.metrics.memoryUsage.slice(-1)[0],
      cpuUsage: this.metrics.cpuUsage.slice(-1)[0],
      errorRate: this.calculateErrorRate(),
      activeAlerts: this.alerts.filter(a => Date.now() - a.timestamp < 300000).length, // 5 minutes
      componentStatuses: Object.fromEntries(
        Array.from(this.componentStatuses.entries()).map(([name, status]) => [
          name,
          { status: status.status, lastCheck: status.lastCheck, responseTime: status.responseTime }
        ])
      )
    };
  }

  /**
   * Record request for metrics
   */
  recordRequest(success = true, responseTime = null) {
    this.metrics.requests++;

    if (!success) {
      this.metrics.errors++;
    }

    if (responseTime !== null) {
      if (this.metrics.responseTime.length >= this.config.metricsRetention) {
        this.metrics.responseTime.shift();
      }
      this.metrics.responseTime.push({
        timestamp: Date.now(),
        value: responseTime,
        success
      });
    }
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge = 3600000) { // 1 hour
    const cutoff = Date.now() - maxAge;
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Shutdown health monitoring
   */
  async shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.logger.info('Health monitoring stopped');
  }
}