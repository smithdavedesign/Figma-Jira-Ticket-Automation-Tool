/**
 * Health Monitoring Routes Integration Tests
 * 
 * Tests for the 8 health monitoring API endpoints:
 * - GET /api/health-monitoring/status - Overall system health status
 * - GET /api/health-monitoring/realtime - Real-time performance metrics
 * - GET /api/health-monitoring/components - Individual component status
 * - GET /api/health-monitoring/alerts - Active alerts and notifications
 * - GET /api/health-monitoring/metrics/history - Historical metrics data
 * - POST /api/health-monitoring/check/:component - Manual component health checks
 * - GET /api/health-monitoring/summary - Health summary for dashboard
 * - GET /api/health-monitoring/dashboard - Consolidated dashboard data
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { HealthMonitoringRoutes } from '../../app/routes/health-monitoring.js';

// Mock dependencies
vi.mock('../../core/utils/logger.js');

// Mock HealthMonitoringService
const mockHealthMonitoringService = {
  getOverallStatus: vi.fn(),
  getRealTimeMetrics: vi.fn(),
  getComponentStatus: vi.fn(),
  getAlerts: vi.fn(),
  getMetricsHistory: vi.fn(),
  runManualCheck: vi.fn(),
  getHealthSummary: vi.fn(),
  getDashboardData: vi.fn(),
  initialize: vi.fn(),
  shutdown: vi.fn()
};

// Mock ServiceContainer
const mockServiceContainer = {
  get: vi.fn().mockImplementation((serviceName) => {
    if (serviceName === 'healthMonitoringService') {
      return mockHealthMonitoringService;
    }
    return null;
  }),
  has: vi.fn(),
  set: vi.fn(),
  initialize: vi.fn()
};

describe('🌐 Health Monitoring Routes Integration Tests', () => {
  let app;
  let healthRoutes;
  let consoleSpy;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Suppress console output during tests
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Create Express app
    app = express();
    app.use(express.json());

    // Initialize routes
    healthRoutes = new HealthMonitoringRoutes(mockServiceContainer);
    const router = express.Router();
    healthRoutes.registerRoutes(router);
    app.use(router);

    // Setup default mock responses
    mockHealthMonitoringService.getOverallStatus.mockResolvedValue({
      overall: {
        status: 'healthy',
        score: 95,
        uptime: 86400000,
        lastUpdate: Date.now()
      },
      components: [
        { name: 'redis', status: 'healthy', lastCheck: Date.now() },
        { name: 'figmaApi', status: 'healthy', lastCheck: Date.now() }
      ],
      metrics: {
        errors: 0,
        warnings: 1,
        requests: 150
      }
    });

    mockHealthMonitoringService.getRealTimeMetrics.mockResolvedValue({
      timestamp: new Date().toISOString(),
      uptime: 86400000,
      memoryUsage: {
        used: 512000000,
        total: 2048000000,
        percentage: 25
      },
      cpuUsage: 45.2,
      requests: 150,
      errors: 0,
      responseTime: {
        average: 120,
        p95: 250
      }
    });

    mockHealthMonitoringService.getComponentStatus.mockResolvedValue([
      {
        name: 'redis',
        status: 'healthy',
        type: 'database',
        critical: true,
        lastCheck: Date.now(),
        responseTime: 15,
        details: {}
      },
      {
        name: 'figmaApi',
        status: 'healthy',
        type: 'external',
        critical: true,
        lastCheck: Date.now(),
        responseTime: 250,
        details: { user: { id: 'test' } }
      }
    ]);

    mockHealthMonitoringService.getAlerts.mockResolvedValue([
      {
        id: 'alert-1',
        type: 'response_time',
        severity: 'warning',
        message: 'Figma API response time above threshold',
        timestamp: Date.now(),
        component: 'figmaApi'
      }
    ]);

    mockHealthMonitoringService.getMetricsHistory.mockResolvedValue({
      memoryUsage: [
        { timestamp: Date.now() - 60000, value: 512000000 },
        { timestamp: Date.now(), value: 520000000 }
      ],
      cpuUsage: [
        { timestamp: Date.now() - 60000, value: 42.1 },
        { timestamp: Date.now(), value: 45.2 }
      ],
      responseTime: [
        { timestamp: Date.now() - 60000, value: 115 },
        { timestamp: Date.now(), value: 120 }
      ]
    });

    mockHealthMonitoringService.getHealthSummary.mockResolvedValue({
      overallScore: 95,
      componentsHealthy: 8,
      componentsTotal: 8,
      criticalIssues: 0,
      warnings: 1,
      uptime: 86400000,
      lastUpdate: Date.now()
    });

    mockHealthMonitoringService.getDashboardData.mockResolvedValue({
      status: 'healthy',
      components: 8,
      alerts: 1,
      uptime: '1d 0h 0m',
      metrics: {
        memory: 25,
        cpu: 45.2,
        requests: 150,
        errors: 0
      }
    });
  });

  afterEach(() => {
    consoleSpy?.restore();
  });

  describe('🎯 GET /api/health-monitoring/status', () => {
    it('should return overall health status successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overall).toBeDefined();
      expect(response.body.data.overall.status).toBe('healthy');
      expect(response.body.data.overall.score).toBe(95);
      expect(response.body.data.components).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(mockHealthMonitoringService.getOverallStatus).toHaveBeenCalledOnce();
    });

    it('should handle service errors gracefully', async () => {
      mockHealthMonitoringService.getOverallStatus.mockRejectedValue(
        new Error('Service unavailable')
      );

      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get health status');
      expect(response.body.details).toBe('Service unavailable');
    });

    it('should include proper response headers', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('⚡ GET /api/health-monitoring/realtime', () => {
    it('should return real-time metrics successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/realtime')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.timestamp).toBeDefined();
      expect(response.body.data.memoryUsage).toBeDefined();
      expect(response.body.data.cpuUsage).toBe(45.2);
      expect(response.body.data.requests).toBe(150);
      expect(response.body.data.errors).toBe(0);
      expect(mockHealthMonitoringService.getRealTimeMetrics).toHaveBeenCalledOnce();
    });

    it('should handle real-time metrics service errors', async () => {
      mockHealthMonitoringService.getRealTimeMetrics.mockRejectedValue(
        new Error('Metrics collection failed')
      );

      const response = await request(app)
        .get('/api/health-monitoring/realtime')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get real-time metrics');
    });

    it('should return metrics with proper structure', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/realtime')
        .expect(200);

      const metrics = response.body.data;
      expect(metrics.memoryUsage.percentage).toBeDefined();
      expect(metrics.responseTime.average).toBeDefined();
      expect(metrics.responseTime.p95).toBeDefined();
    });
  });

  describe('🧩 GET /api/health-monitoring/components', () => {
    it('should return component status successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/components')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('redis');
      expect(response.body.data[0].status).toBe('healthy');
      expect(response.body.data[1].name).toBe('figmaApi');
      expect(mockHealthMonitoringService.getComponentStatus).toHaveBeenCalledOnce();
    });

    it('should include component details', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/components')
        .expect(200);

      const components = response.body.data;
      expect(components[0].type).toBe('database');
      expect(components[0].critical).toBe(true);
      expect(components[0].responseTime).toBeDefined();
      expect(components[1].details).toBeDefined();
    });

    it('should handle component status errors', async () => {
      mockHealthMonitoringService.getComponentStatus.mockRejectedValue(
        new Error('Component check failed')
      );

      const response = await request(app)
        .get('/api/health-monitoring/components')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get component status');
    });
  });

  describe('🚨 GET /api/health-monitoring/alerts', () => {
    it('should return active alerts successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/alerts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe('response_time');
      expect(response.body.data[0].severity).toBe('warning');
      expect(response.body.data[0].component).toBe('figmaApi');
      expect(mockHealthMonitoringService.getAlerts).toHaveBeenCalledOnce();
    });

    it('should return empty array when no alerts', async () => {
      mockHealthMonitoringService.getAlerts.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/health-monitoring/alerts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should handle alerts service errors', async () => {
      mockHealthMonitoringService.getAlerts.mockRejectedValue(
        new Error('Alerts fetch failed')
      );

      const response = await request(app)
        .get('/api/health-monitoring/alerts')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get alerts');
    });
  });

  describe('📊 GET /api/health-monitoring/metrics/history', () => {
    it('should return metrics history successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/metrics/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.memoryUsage).toHaveLength(2);
      expect(response.body.data.cpuUsage).toHaveLength(2);
      expect(response.body.data.responseTime).toHaveLength(2);
      expect(mockHealthMonitoringService.getMetricsHistory).toHaveBeenCalledOnce();
    });

    it('should handle query parameters for time range', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/metrics/history?hours=6')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockHealthMonitoringService.getMetricsHistory).toHaveBeenCalledWith({ hours: '6' });
    });

    it('should handle metrics history errors', async () => {
      mockHealthMonitoringService.getMetricsHistory.mockRejectedValue(
        new Error('History fetch failed')
      );

      const response = await request(app)
        .get('/api/health-monitoring/metrics/history')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get metrics history');
    });
  });

  describe('🔧 POST /api/health-monitoring/check/:component', () => {
    it('should run manual health check successfully', async () => {
      mockHealthMonitoringService.runManualCheck.mockResolvedValue({
        component: 'redis',
        status: 'healthy',
        responseTime: 12,
        timestamp: Date.now()
      });

      const response = await request(app)
        .post('/api/health-monitoring/check/redis')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.component).toBe('redis');
      expect(response.body.data.status).toBe('healthy');
      expect(mockHealthMonitoringService.runManualCheck).toHaveBeenCalledWith('redis');
    });

    it('should handle missing component parameter', async () => {
      const response = await request(app)
        .post('/api/health-monitoring/check/')
        .expect(404); // Express returns 404 for missing route params

      // Alternative: if the route pattern catches empty params
      // expect(response.body.success).toBe(false);
    });

    it('should handle invalid component names', async () => {
      mockHealthMonitoringService.runManualCheck.mockRejectedValue(
        new Error('Component not found: invalidComponent')
      );

      const response = await request(app)
        .post('/api/health-monitoring/check/invalidComponent')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.component).toBe('invalidComponent');
      expect(response.body.error).toBe('Failed to run manual check');
    });

    it('should test all known components', async () => {
      const components = ['redis', 'figmaApi', 'contextManager', 'templateManager'];
      
      for (const component of components) {
        mockHealthMonitoringService.runManualCheck.mockResolvedValue({
          component,
          status: 'healthy',
          responseTime: 50,
          timestamp: Date.now()
        });

        const response = await request(app)
          .post(`/api/health-monitoring/check/${component}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.component).toBe(component);
      }
    });
  });

  describe('📋 GET /api/health-monitoring/summary', () => {
    it('should return health summary successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overallScore).toBe(95);
      expect(response.body.data.componentsHealthy).toBe(8);
      expect(response.body.data.componentsTotal).toBe(8);
      expect(response.body.data.criticalIssues).toBe(0);
      expect(mockHealthMonitoringService.getHealthSummary).toHaveBeenCalledOnce();
    });

    it('should handle summary service errors', async () => {
      mockHealthMonitoringService.getHealthSummary.mockRejectedValue(
        new Error('Summary generation failed')
      );

      const response = await request(app)
        .get('/api/health-monitoring/summary')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get health summary');
    });
  });

  describe('🏠 GET /api/health-monitoring/dashboard', () => {
    it('should return dashboard data successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.components).toBe(8);
      expect(response.body.data.metrics).toBeDefined();
      expect(response.body.data.metrics.memory).toBe(25);
      expect(response.body.data.metrics.cpu).toBe(45.2);
      expect(mockHealthMonitoringService.getDashboardData).toHaveBeenCalledOnce();
    });

    it('should handle dashboard data errors', async () => {
      mockHealthMonitoringService.getDashboardData.mockRejectedValue(
        new Error('Dashboard data fetch failed')
      );

      const response = await request(app)
        .get('/api/health-monitoring/dashboard')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to get dashboard data');
    });
  });

  describe('🔄 Service Integration', () => {
    it('should handle service container unavailable', async () => {
      mockServiceContainer.get.mockReturnValue(null);

      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should validate service container dependency', () => {
      expect(mockServiceContainer.get).toHaveBeenCalledWith('healthMonitoringService');
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/health-monitoring/status')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      expect(mockHealthMonitoringService.getOverallStatus).toHaveBeenCalledTimes(5);
    });
  });

  describe('🛡️ Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/health-monitoring/check/redis')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      // Express handles malformed JSON and returns 400
    });

    it('should return consistent error format', async () => {
      mockHealthMonitoringService.getOverallStatus.mockRejectedValue(
        new Error('Test error')
      );

      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });

    it('should handle timeout scenarios', async () => {
      mockHealthMonitoringService.getOverallStatus.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBe('Timeout');
    });
  });

  describe('📈 Performance', () => {
    it('should handle high-frequency requests', async () => {
      const startTime = Date.now();
      
      const requests = Array.from({ length: 20 }, () =>
        request(app).get('/api/health-monitoring/realtime')
      );

      await Promise.all(requests);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (5 seconds for 20 requests)
      expect(totalTime).toBeLessThan(5000);
    });

    it('should maintain response consistency under load', async () => {
      const requests = Array.from({ length: 10 }, () =>
        request(app).get('/api/health-monitoring/components')
      );

      const responses = await Promise.all(requests);

      // All responses should be identical
      const firstResponse = responses[0].body.data;
      responses.forEach(response => {
        expect(response.body.data).toEqual(firstResponse);
      });
    });
  });
});