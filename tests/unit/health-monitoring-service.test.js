/**
 * HealthMonitoringService Unit Tests
 * 
 * Tests for the comprehensive health monitoring service including:
 * - 8 component health checks (redis, figmaApi, contextManager, templateManager, sessionManager, mcpServer, aiOrchestrator, screenshotService)
 * - Real-time metrics collection (memory, CPU, response times, error rates)
 * - Alert system and threshold monitoring
 * - Service lifecycle management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HealthMonitoringService } from '../../core/services/health-monitoring-service.js';

// Mock dependencies
vi.mock('../../core/utils/logger.js');
vi.mock('../../core/utils/error-handler.js');

// Mock service container
const mockServiceContainer = {
  get: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
  initialize: vi.fn()
};

// Mock Redis client
const mockRedisClient = {
  ping: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
  isReady: true,
  connected: true,
  isConnected: vi.fn(() => true)
};

// Mock fetch for external API calls
global.fetch = vi.fn();

describe('🧮 HealthMonitoringService Unit Tests', () => {
  let healthService;
  let consoleSpy;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Suppress console output during tests
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleSpy.mockRestore = vi.fn();
    
    // Setup service container mocks
    mockServiceContainer.get.mockImplementation((serviceName) => {
      switch (serviceName) {
        case 'redis':
          return mockRedisClient;
        case 'contextManager':
        case 'templateManager':
        case 'sessionManager':
          return { initialized: true, status: 'healthy' };
        default:
          return null;
      }
    });

    // Setup fetch mock for external services
    global.fetch.mockImplementation((url) => {
      if (url.includes('figma.com')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ user: { id: 'test' } })
        });
      }
      if (url.includes('localhost:3000')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ status: 'ok' })
        });
      }
      return Promise.resolve({ ok: true, status: 200 });
    });

    healthService = new HealthMonitoringService(mockServiceContainer);
  });

  afterEach(() => {
    if (healthService?.monitoringInterval) {
      clearInterval(healthService.monitoringInterval);
    }
    if (consoleSpy?.mockRestore) {
      consoleSpy.mockRestore();
    }
  });

  describe('🏗️ Service Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(healthService).toBeDefined();
      expect(healthService.componentStatuses).toBeDefined();
      expect(healthService.alerts).toEqual([]);
      expect(healthService.metrics).toBeDefined();
      expect(healthService.config.checkInterval).toBe(30000);
    });

    it('should initialize component tracking correctly', async () => {
      await healthService.initializeComponentTracking();

      expect(healthService.componentStatuses.size).toBe(8);
      expect(healthService.componentStatuses.has('redis')).toBe(true);
      expect(healthService.componentStatuses.has('figmaApi')).toBe(true);
      expect(healthService.componentStatuses.has('contextManager')).toBe(true);
      expect(healthService.componentStatuses.has('templateManager')).toBe(true);
      expect(healthService.componentStatuses.has('sessionManager')).toBe(true);
      expect(healthService.componentStatuses.has('mcpServer')).toBe(true);
      expect(healthService.componentStatuses.has('aiOrchestrator')).toBe(true);
      expect(healthService.componentStatuses.has('screenshotService')).toBe(true);
    });

    it('should complete full initialization successfully', async () => {
      const result = await healthService.initialize();

      expect(result.success).toBe(true);
      expect(result.components).toBe(8);
      expect(healthService.initialized).toBe(true);
    });
  });

  describe('💊 Component Health Checks', () => {
    beforeEach(async () => {
      await healthService.initializeComponentTracking();
    });

    describe('Redis Health Check', () => {
      it('should return healthy when Redis is connected', async () => {
        mockRedisClient.isConnected.mockReturnValue(true);

        const status = await healthService.checkRedis();
        expect(status).toBe('healthy');
      });

      it('should return error when Redis is disconnected', async () => {
        mockRedisClient.isConnected.mockReturnValue(false);

        const status = await healthService.checkRedis();
        expect(status).toBe('error');
      });

      it('should return error when Redis is not available', async () => {
        mockServiceContainer.get.mockImplementation((serviceName) => {
          if (serviceName === 'redis') return null;
          return mockServiceContainer.get.wrappedMethod?.(serviceName);
        });

        const status = await healthService.checkRedis();
        expect(status).toBe('error');
      });
    });

    describe('Figma API Health Check', () => {
      it('should return healthy when Figma API returns 200', async () => {
        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ user: { id: 'test-user' } })
        });

        const status = await healthService.checkFigmaApi();
        expect(status).toBe('healthy');
      });

      it('should return healthy when Figma API returns 401 (valid response)', async () => {
        global.fetch.mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Unauthorized' })
        });

        const status = await healthService.checkFigmaApi();
        expect(status).toBe('healthy');
      });

      it('should return error when Figma API is inaccessible', async () => {
        global.fetch.mockRejectedValue(new Error('Network error'));

        const status = await healthService.checkFigmaApi();
        expect(status).toBe('error');
      });

      it('should return degraded when Figma API returns other status', async () => {
        global.fetch.mockResolvedValue({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal Server Error' })
        });

        const status = await healthService.checkFigmaApi();
        expect(status).toBe('degraded');
      });
    });

    describe('Service Container Health Checks', () => {
      it('should check contextManager health correctly', async () => {
        mockServiceContainer.get.mockImplementation((serviceName) => {
          if (serviceName === 'contextManager') return { initialized: true };
          return mockServiceContainer.get.wrappedMethod?.(serviceName);
        });

        const status = await healthService.checkContextManager();
        expect(status).toBe('healthy');
      });

      it('should check templateManager health correctly', async () => {
        mockServiceContainer.get.mockImplementation((serviceName) => {
          if (serviceName === 'templateManager') return null;
          return mockServiceContainer.get.wrappedMethod?.(serviceName);
        });

        const status = await healthService.checkTemplateManager();
        expect(status).toBe('error');
      });

      it('should check sessionManager health correctly', async () => {
        mockServiceContainer.get.mockImplementation((serviceName) => {
          if (serviceName === 'sessionManager') return { initialized: true };
          return mockServiceContainer.get.wrappedMethod?.(serviceName);
        });

        const status = await healthService.checkSessionManager();
        expect(status).toBe('healthy');
      });
    });

    describe('External Service Health Checks', () => {
      it('should check MCP server health correctly', async () => {
        global.fetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ tools: [] })
        });

        const status = await healthService.checkMcpServer();
        expect(status).toBe('healthy');
      });

      it('should handle MCP server connection errors', async () => {
        global.fetch.mockRejectedValue(new Error('Connection refused'));

        const status = await healthService.checkMcpServer();
        expect(status).toBe('error');
      });

      it('should check AI orchestrator health correctly', async () => {
        const status = await healthService.checkAiOrchestrator();
        expect(['healthy', 'unknown', 'error']).toContain(status);
      });

      it('should check screenshot service health correctly', async () => {
        const status = await healthService.checkScreenshotService();
        expect(['healthy', 'unknown', 'error']).toContain(status);
      });
    });

    describe('Component Health Check Integration', () => {
      it('should update component status after health check', async () => {
        mockRedisClient.isConnected.mockReturnValue(true);

        await healthService.checkComponent('redis');

        const redisStatus = healthService.componentStatuses.get('redis');
        expect(redisStatus.status).toBe('healthy');
        expect(redisStatus.lastCheck).toBeDefined();
        expect(redisStatus.responseTime).toBeDefined();
      });

      it('should handle component health check errors gracefully', async () => {
        mockServiceContainer.get.mockImplementation(() => {
          throw new Error('Service container error');
        });

        await healthService.checkComponent('contextManager');

        const status = healthService.componentStatuses.get('contextManager');
        expect(status.status).toBe('error');
        expect(status.details.error).toBe('Service container error');
      });

      it('should handle failed health checks correctly', async () => {
        mockRedisClient.isConnected.mockReturnValue(false);

        await healthService.checkComponent('redis');
        
        // Get the component after the check
        const updatedComponent = healthService.componentStatuses.get('redis');
        expect(updatedComponent.status).toBe('error');
        expect(updatedComponent.lastCheck).toBeDefined();
        expect(updatedComponent.responseTime).toBeDefined();
      });
    });
  });

  describe('📊 Metrics Collection', () => {
    beforeEach(async () => {
      await healthService.initializeComponentTracking();
    });

    it('should collect system metrics successfully', async () => {
      await healthService.collectSystemMetrics();

      expect(healthService.metrics.memoryUsage.length).toBeGreaterThan(0);
      expect(healthService.metrics.cpuUsage.length).toBeGreaterThan(0);
      expect(healthService.metrics.lastUpdate).toBeDefined();
    });

      it('should maintain metrics retention limit', async () => {
        // Start with exactly the retention limit
        healthService.metrics.memoryUsage = [];
        healthService.metrics.cpuUsage = [];
        
        for (let i = 0; i < 100; i++) {
          healthService.metrics.memoryUsage.push({ timestamp: Date.now(), value: Math.random() });
          healthService.metrics.cpuUsage.push({ timestamp: Date.now(), value: Math.random() });
        }

        // This should trigger the retention limit shift before adding new data
        await healthService.collectSystemMetrics();

        // Should maintain the 100 limit by shifting before adding
        expect(healthService.metrics.memoryUsage.length).toBe(100);
        expect(healthService.metrics.cpuUsage.length).toBe(100);
      });    it('should record request metrics correctly', () => {
      const initialRequests = healthService.metrics.requests;

      healthService.recordRequest(true, 150);
      expect(healthService.metrics.requests).toBe(initialRequests + 1);
      expect(healthService.metrics.responseTime.some(entry => entry.value === 150)).toBe(true);

      healthService.recordRequest(false, 300);
      expect(healthService.metrics.errors).toBeGreaterThan(0);
    });

    it('should calculate error rate correctly', () => {
      healthService.metrics.requests = 100;
      healthService.metrics.errors = 5;

      const errorRate = healthService.calculateErrorRate();
      expect(errorRate).toBe(0.05);
    });
  });

  describe('🚨 Alert System', () => {
    beforeEach(async () => {
      await healthService.initializeComponentTracking();
    });

    it('should generate alerts when thresholds are exceeded', async () => {
      // Simulate high error rate
      healthService.metrics.requests = 100;
      healthService.metrics.errors = 10; // 10% error rate, above 5% threshold

      await healthService.checkAlertConditions();

      expect(healthService.alerts.length).toBeGreaterThan(0);
      expect(healthService.alerts.some(alert => 
        alert.type === 'critical' && alert.component === 'system'
      )).toBe(true);
    });

    it('should generate memory usage alerts', async () => {
      // Add high memory usage data directly
      healthService.metrics.memoryUsage.push({
        timestamp: Date.now(),
        value: 0.85, // 85% memory usage, above 80% threshold
        details: {
          heapUsed: 850,
          heapTotal: 1000,
          external: 100
        }
      });

      await healthService.checkAlertConditions();

      const memoryAlert = healthService.alerts.find(alert => alert.type === 'warning');
      expect(memoryAlert).toBeDefined();
    });

    it('should clear old alerts correctly', () => {
      // Add old alert
      healthService.alerts.push({
        id: 'old-alert',
        timestamp: Date.now() - 7200000, // 2 hours ago
        type: 'test',
        message: 'Old alert'
      });

      // Add recent alert
      healthService.alerts.push({
        id: 'recent-alert',
        timestamp: Date.now(),
        type: 'test',
        message: 'Recent alert'
      });

      healthService.clearOldAlerts(3600000); // 1 hour max age

      expect(healthService.alerts.length).toBe(1);
      expect(healthService.alerts[0].id).toBe('recent-alert');
    });
  });

  describe('🎯 Health Status Reporting', () => {
    beforeEach(async () => {
      await healthService.initializeComponentTracking();
    });

    it('should return comprehensive health status', () => {
      const status = healthService.getHealthStatus();

      expect(status.overall).toBeDefined();
      expect(status.overall.status).toBeDefined();
      expect(status.overall.score).toBeDefined();
      expect(status.components).toHaveLength(8);
      expect(status.metrics).toBeDefined();
    });

    it('should calculate overall health score correctly', () => {
      // Set all components to healthy
      for (const [name, component] of healthService.componentStatuses) {
        healthService.componentStatuses.set(name, {
          ...component,
          status: 'healthy'
        });
      }

      const status = healthService.getHealthStatus();
      expect(status.overall.score).toBe(100);
      expect(status.overall.status).toBe('healthy');
    });

    it('should detect degraded system status', () => {
      // Set half components to degraded
      let count = 0;
      for (const [name, component] of healthService.componentStatuses) {
        healthService.componentStatuses.set(name, {
          ...component,
          status: count < 4 ? 'healthy' : 'degraded'
        });
        count++;
      }

      const status = healthService.getHealthStatus();
      expect(status.overall.status).toBe('degraded');
      expect(status.overall.score).toBe(50);
    });

    it('should detect critical system status', () => {
      // Set most components to error
      let count = 0;
      for (const [name, component] of healthService.componentStatuses) {
        healthService.componentStatuses.set(name, {
          ...component,
          status: count < 2 ? 'healthy' : 'error'
        });
        count++;
      }

      const status = healthService.getHealthStatus();
      expect(status.overall.status).toBe('critical');
      expect(status.overall.score).toBe(25);
    });

    it('should return real-time metrics', () => {
      // Add some metrics first
      healthService.metrics.memoryUsage.push({ timestamp: Date.now(), value: 0.5 });
      healthService.metrics.cpuUsage.push({ timestamp: Date.now(), value: 0.3 });

      const metrics = healthService.getRealTimeMetrics();

      expect(metrics.timestamp).toBeDefined();
      expect(metrics.uptime).toBeDefined();
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.cpuUsage).toBeDefined();
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('🔄 Service Lifecycle', () => {
    it('should start monitoring correctly', () => {
      healthService.startMonitoring();

      expect(healthService.monitoringInterval).toBeDefined();
    });

    it('should stop existing monitoring before starting new one', () => {
      healthService.startMonitoring();
      const firstInterval = healthService.monitoringInterval;

      healthService.startMonitoring();
      const secondInterval = healthService.monitoringInterval;

      expect(secondInterval).not.toBe(firstInterval);
    });

    it('should shutdown gracefully', async () => {
      healthService.startMonitoring();
      
      await healthService.shutdown();

      expect(healthService.monitoringInterval).toBe(null);
    });

    it('should perform comprehensive health check on all components', async () => {
      // Make sure components are initialized first
      await healthService.initializeComponentTracking();
      
      const checkComponentSpy = vi.spyOn(healthService, 'checkComponent');

      await healthService.performHealthCheck();

      expect(checkComponentSpy).toHaveBeenCalledTimes(8);
      expect(checkComponentSpy).toHaveBeenCalledWith('redis');
      expect(checkComponentSpy).toHaveBeenCalledWith('figmaApi');
      expect(checkComponentSpy).toHaveBeenCalledWith('contextManager');
      expect(checkComponentSpy).toHaveBeenCalledWith('templateManager');
      expect(checkComponentSpy).toHaveBeenCalledWith('sessionManager');
      expect(checkComponentSpy).toHaveBeenCalledWith('mcpServer');
      expect(checkComponentSpy).toHaveBeenCalledWith('aiOrchestrator');
      expect(checkComponentSpy).toHaveBeenCalledWith('screenshotService');
    });
  });

  describe('🔧 Error Handling', () => {
    beforeEach(async () => {
      await healthService.initializeComponentTracking();
    });

    it('should handle service container errors gracefully', async () => {
      mockServiceContainer.get.mockImplementation(() => {
        throw new Error('Service not found');
      });

      await expect(healthService.checkComponent('contextManager')).resolves.not.toThrow();

      const status = healthService.componentStatuses.get('contextManager');
      expect(status.status).toBe('error');
    });

    it('should handle network errors in external checks', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(healthService.checkComponent('figmaApi')).resolves.not.toThrow();

      const status = healthService.componentStatuses.get('figmaApi');
      expect(status.status).toBe('error');
    });

    it('should continue monitoring after errors', async () => {
      // Reduce interval for faster testing
      healthService.config.checkInterval = 10; // 10ms

      const performHealthCheckSpy = vi.spyOn(healthService, 'performHealthCheck')
        .mockRejectedValueOnce(new Error('Check failed'))
        .mockResolvedValueOnce();

      healthService.startMonitoring();

      // Wait for monitoring cycles to run
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(performHealthCheckSpy).toHaveBeenCalled();
      expect(healthService.metrics.errors).toBeGreaterThan(0);
    });
  });
});