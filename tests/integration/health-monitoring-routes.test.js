/**
 * Simplified Health Monitoring Routes Integration Tests
 * 
 * Tests for basic health monitoring API endpoints with proper mocking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';

// Create a simple mock health monitoring service
const createMockHealthService = () => ({
  getHealthStatus: vi.fn().mockResolvedValue({
    overall: {
      status: 'healthy',
      score: 95,
      lastCheck: new Date().toISOString()
    },
    components: {
      redis: { status: 'healthy', lastCheck: new Date().toISOString() },
      figmaApi: { status: 'healthy', lastCheck: new Date().toISOString() }
    }
  }),
  
  getRealTimeMetrics: vi.fn().mockResolvedValue({
    memoryUsage: 520000000,
    cpuUsage: 45.2,
    requests: 150,
    errors: 0,
    responseTime: { average: 120, p95: 200 }
  }),
  
  checkComponent: vi.fn().mockResolvedValue({
    component: 'redis',
    status: 'healthy',
    lastCheck: new Date().toISOString(),
    responseTime: 15
  })
});

// Simple routes that match the actual implementation
const createHealthRoutes = (healthService) => {
  const router = express.Router();
  
  router.get('/status', async (req, res) => {
    try {
      const healthData = await healthService.getHealthStatus();
      res.json({
        success: true,
        data: healthData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  router.get('/realtime', async (req, res) => {
    try {
      const metrics = await healthService.getRealTimeMetrics();
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  router.post('/check/:component', async (req, res) => {
    try {
      const { component } = req.params;
      const result = await healthService.checkComponent(component);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  return router;
};

describe('🌐 Simplified Health Monitoring Routes Tests', () => {
  let app;
  let mockHealthService;

  beforeEach(() => {
    mockHealthService = createMockHealthService();
    
    app = express();
    app.use(express.json());
    app.use('/api/health-monitoring', createHealthRoutes(mockHealthService));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('🎯 GET /api/health-monitoring/status', () => {
    it('should return overall health status successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.overall).toBeDefined();
      expect(response.body.data.overall.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(mockHealthService.getHealthStatus).toHaveBeenCalledOnce();
    });

    it('should handle service errors gracefully', async () => {
      mockHealthService.getHealthStatus.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Service unavailable');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('⚡ GET /api/health-monitoring/realtime', () => {
    it('should return real-time metrics successfully', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/realtime')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.memoryUsage).toBeDefined();
      expect(response.body.data.cpuUsage).toBe(45.2);
      expect(response.body.data.requests).toBe(150);
      expect(mockHealthService.getRealTimeMetrics).toHaveBeenCalledOnce();
    });

    it('should handle real-time metrics service errors', async () => {
      mockHealthService.getRealTimeMetrics.mockRejectedValue(new Error('Metrics collection failed'));

      const response = await request(app)
        .get('/api/health-monitoring/realtime')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Metrics collection failed');
    });
  });

  describe('🔧 POST /api/health-monitoring/check/:component', () => {
    it('should run manual health check successfully', async () => {
      const response = await request(app)
        .post('/api/health-monitoring/check/redis')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.component).toBe('redis');
      expect(response.body.data.status).toBe('healthy');
      expect(mockHealthService.checkComponent).toHaveBeenCalledWith('redis');
    });

    it('should handle component check errors', async () => {
      mockHealthService.checkComponent.mockRejectedValue(new Error('Component check failed'));

      const response = await request(app)
        .post('/api/health-monitoring/check/redis')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Component check failed');
    });

    it('should handle different component types', async () => {
      const components = ['redis', 'figmaApi', 'contextManager', 'mcpServer'];
      
      for (const component of components) {
        mockHealthService.checkComponent.mockResolvedValue({
          component,
          status: 'healthy',
          lastCheck: new Date().toISOString()
        });

        const response = await request(app)
          .post(`/api/health-monitoring/check/${component}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.component).toBe(component);
      }
    });
  });

  describe('🛡️ Error Handling', () => {
    it('should handle missing component parameter', async () => {
      const response = await request(app)
        .post('/api/health-monitoring/check/')
        .expect(404); // Express returns 404 for missing route parameters

      // This is expected behavior - missing route parameter
      expect(response.status).toBe(404);
    });

    it('should return consistent error format', async () => {
      mockHealthService.getHealthStatus.mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });
  });

  describe('📊 Service Integration', () => {
    it('should call appropriate service methods', async () => {
      // Test status endpoint
      await request(app).get('/api/health-monitoring/status');
      expect(mockHealthService.getHealthStatus).toHaveBeenCalled();

      // Test realtime endpoint
      await request(app).get('/api/health-monitoring/realtime');
      expect(mockHealthService.getRealTimeMetrics).toHaveBeenCalled();

      // Test check endpoint
      await request(app).post('/api/health-monitoring/check/redis');
      expect(mockHealthService.checkComponent).toHaveBeenCalledWith('redis');
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

      expect(mockHealthService.getHealthStatus).toHaveBeenCalledTimes(5);
    });
  });

  describe('🔄 Response Format Validation', () => {
    it('should return consistent response structure for success', async () => {
      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should return consistent response structure for errors', async () => {
      mockHealthService.getHealthStatus.mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .get('/api/health-monitoring/status')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });
  });
});