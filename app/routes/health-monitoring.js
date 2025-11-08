/**
 * Health Monitoring Routes Module
 *
 * Provides comprehensive system health monitoring endpoints.
 * Routes: /api/health-monitoring/*
 *
 * Phase 3: Health Monitoring System
 */

import { BaseRoute } from './BaseRoute.js';

export class HealthMonitoringRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('HealthMonitoring', serviceContainer);
  }

  /**
   * Register health monitoring routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Health monitoring endpoints
    router.get('/api/health-monitoring/status', this.asyncHandler(this.getHealthStatus.bind(this)));
    router.get('/api/health-monitoring/realtime', this.asyncHandler(this.getRealtimeMetrics.bind(this)));
    router.get('/api/health-monitoring/components', this.asyncHandler(this.getComponentStatus.bind(this)));
    router.get('/api/health-monitoring/alerts', this.asyncHandler(this.getAlerts.bind(this)));
    router.get('/api/health-monitoring/metrics/history', this.asyncHandler(this.getMetricsHistory.bind(this)));
    router.post('/api/health-monitoring/check/:component', this.asyncHandler(this.runManualCheck.bind(this)));
    router.get('/api/health-monitoring/summary', this.asyncHandler(this.getHealthSummary.bind(this)));
    router.get('/api/health-monitoring/dashboard', this.asyncHandler(this.getDashboardData.bind(this)));

    this.logger.info('✅ Health monitoring routes registered');
  }

  /**
   * Get overall health status
   */
  async getHealthStatus(req, res) {
    this.logAccess(req, 'getHealthStatus');

    try {
      const healthMonitoringService = this.getService('healthMonitoringService');
      const status = await healthMonitoringService.getHealthStatus();

      res.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Error getting health status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get health status',
        details: error.message
      });
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealtimeMetrics(req, res) {
    this.logAccess(req, 'getRealtimeMetrics');

    try {
      const healthMonitoringService = this.getService('healthMonitoringService');
      const metrics = await healthMonitoringService.getRealTimeMetrics();

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Error getting realtime metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get realtime metrics',
        details: error.message
      });
    }
  }

  /**
   * Get component status
   */
  async getComponentStatus(req, res) {
    this.logAccess(req, 'getComponentStatus');

    try {
      const healthMonitoringService = this.getService('healthMonitoringService');
      const status = await healthMonitoringService.getHealthStatus();

      res.json({
        success: true,
        data: status.components || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Error getting component status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get component status',
        details: error.message
      });
    }
  }

  /**
   * Get active alerts
   */
  async getAlerts(req, res) {
    this.logAccess(req, 'getAlerts');

    try {
      const healthMonitoringService = this.getService('healthMonitoringService');
      const status = await healthMonitoringService.getHealthStatus();

      res.json({
        success: true,
        data: status.alerts || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Error getting alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get alerts',
        details: error.message
      });
    }
  }

  /**
   * Get metrics history
   */
  async getMetricsHistory(req, res) {
    this.logAccess(req, 'getMetricsHistory');

    try {
      const healthMonitoringService = this.getService('healthMonitoringService');
      const timeRange = req.query.timeRange || '1h';
      const status = await healthMonitoringService.getHealthStatus();

      res.json({
        success: true,
        data: status.metrics || {},
        timestamp: new Date().toISOString(),
        timeRange
      });
    } catch (error) {
      this.logger.error('Error getting metrics history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get metrics history',
        details: error.message
      });
    }
  }

  /**
   * Run manual health check for specific component
   */
  async runManualCheck(req, res) {
    this.logAccess(req, 'runManualCheck');

    try {
      const healthMonitoringService = this.getService('healthMonitoringService');
      const component = req.params.component;

      if (!component) {
        return res.status(400).json({
          success: false,
          error: 'Component parameter is required'
        });
      }

      const result = await healthMonitoringService.checkComponent(component);

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        component
      });
    } catch (error) {
      this.logger.error(`Error running manual check for ${req.params.component}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to run manual check',
        details: error.message,
        component: req.params.component
      });
    }
  }

  /**
   * Get health summary for dashboard
   */
  async getHealthSummary(req, res) {
    this.logAccess(req, 'getHealthSummary');

    try {
      const healthMonitoringService = this.getService('healthMonitoringService');
      const summary = await healthMonitoringService.getHealthStatus();

      res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Error getting health summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get health summary',
        details: error.message
      });
    }
  }

  /**
   * Get all dashboard data in one request
   */
  async getDashboardData(req, res) {
    this.logAccess(req, 'getDashboardData');

    try {
      const healthMonitoringService = this.getService('healthMonitoringService');

      // Get all data needed for the dashboard
      const [status, metrics] = await Promise.all([
        healthMonitoringService.getHealthStatus(),
        healthMonitoringService.getRealTimeMetrics()
      ]);

      const components = status.components || [];
      const alerts = status.alerts || [];
      const summary = status;

      res.json({
        success: true,
        data: {
          status,
          metrics,
          components,
          alerts,
          summary
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get dashboard data',
        details: error.message
      });
    }
  }

  /**
   * Get health monitoring routes health status
   * @returns {Object} Health status
   */
  getHealthStatusDetails() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      endpoints: [
        '/status',
        '/realtime',
        '/components',
        '/alerts',
        '/metrics/history',
        '/check/:component',
        '/summary',
        '/dashboard'
      ],
      serviceRequirements: [
        'healthMonitoringService'
      ]
    };
  }
}

export default HealthMonitoringRoutes;