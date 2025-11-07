/**
 * Health Monitoring System Failure & Recovery Tests
 * 
 * Tests for comprehensive failure scenarios and system recovery:
 * - Service failure simulation and detection
 * - Alert system validation with different severities
 * - System recovery and resilience testing
 * - Cascading failure prevention
 * - Critical vs non-critical service failure handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HealthMonitoringService } from '../../core/services/health-monitoring-service.js';

// Mock dependencies
vi.mock('../../core/utils/logger.js');
vi.mock('../../core/utils/error-handler.js');

// Mock process for system metrics
const mockProcess = {
  memoryUsage: vi.fn(),
  cpuUsage: vi.fn()
};

global.fetch = vi.fn();

describe('🚨 Health Monitoring System Failure & Recovery Tests', () => {
  let healthService;
  let mockServiceContainer;
  let mockRedisClient;
  let consoleSpy;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Suppress console output during tests
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Setup mock Redis client with failure scenarios
    mockRedisClient = {
      ping: vi.fn(),
      get: vi.fn(),
      set: vi.fn(),
      isReady: true,
      connected: true
    };

    // Setup mock service container
    mockServiceContainer = {
      get: vi.fn(),
      has: vi.fn(),
      set: vi.fn(),
      initialize: vi.fn()
    };

    // Setup default service container responses
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

    // Setup default fetch responses
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
    await healthService.initializeComponentTracking();
  });

  afterEach(() => {
    if (healthService?.monitoringInterval) {
      clearInterval(healthService.monitoringInterval);
    }
    consoleSpy?.restore();
  });

  describe('🔴 Critical Service Failures', () => {
    describe('Redis Database Failure', () => {
      it('should detect Redis connection failure', async () => {
        mockRedisClient.ping.mockRejectedValue(new Error('Connection refused'));
        mockRedisClient.isReady = false;
        mockRedisClient.connected = false;

        await healthService.checkComponent('redis');

        const redisStatus = healthService.componentStatuses.get('redis');
        expect(redisStatus.status).toBe('error');
        expect(redisStatus.errors).toBeGreaterThan(0);
        expect(redisStatus.details.error).toBe('Connection refused');
      });

      it('should detect Redis performance degradation', async () => {
        mockRedisClient.ping.mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve('PONG'), 5000))
        );

        await healthService.checkComponent('redis');

        const redisStatus = healthService.componentStatuses.get('redis');
        expect(redisStatus.status).toBe('degraded');
        expect(redisStatus.responseTime).toBeGreaterThan(2000);
      });

      it('should trigger critical alert for Redis failure', async () => {
        mockRedisClient.ping.mockRejectedValue(new Error('Redis down'));

        await healthService.checkComponent('redis');
        await healthService.checkAlertConditions();

        const criticalAlerts = healthService.alerts.filter(
          alert => alert.severity === 'critical' && alert.component === 'redis'
        );
        expect(criticalAlerts.length).toBeGreaterThan(0);
      });
    });

    describe('Figma API Failure', () => {
      it('should detect Figma API authentication failure', async () => {
        global.fetch.mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Invalid token' })
        });

        await healthService.checkComponent('figmaApi');

        const figmaStatus = healthService.componentStatuses.get('figmaApi');
        expect(figmaStatus.status).toBe('degraded');
      });

      it('should detect Figma API network failure', async () => {
        global.fetch.mockRejectedValue(new Error('Network timeout'));

        await healthService.checkComponent('figmaApi');

        const figmaStatus = healthService.componentStatuses.get('figmaApi');
        expect(figmaStatus.status).toBe('error');
        expect(figmaStatus.details.error).toBe('Network timeout');
      });

      it('should handle Figma API rate limiting', async () => {
        global.fetch.mockResolvedValue({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: 'Rate limit exceeded' })
        });

        await healthService.checkComponent('figmaApi');

        const figmaStatus = healthService.componentStatuses.get('figmaApi');
        expect(figmaStatus.status).toBe('degraded');
      });
    });

    describe('Context Manager Failure', () => {
      it('should detect context manager unavailability', async () => {
        mockServiceContainer.get.mockImplementation((serviceName) => {
          if (serviceName === 'contextManager') {
            return null;
          }
          return mockServiceContainer.get.wrappedMethod(serviceName);
        });

        await healthService.checkComponent('contextManager');

        const contextStatus = healthService.componentStatuses.get('contextManager');
        expect(contextStatus.status).toBe('error');
      });

      it('should detect context manager initialization failure', async () => {
        mockServiceContainer.get.mockImplementation((serviceName) => {
          if (serviceName === 'contextManager') {
            throw new Error('Service initialization failed');
          }
          return mockServiceContainer.get.wrappedMethod(serviceName);
        });

        await healthService.checkComponent('contextManager');

        const contextStatus = healthService.componentStatuses.get('contextManager');
        expect(contextStatus.status).toBe('error');
        expect(contextStatus.details.error).toBe('Service initialization failed');
      });
    });
  });

  describe('🟡 Non-Critical Service Failures', () => {
    describe('MCP Server Failure', () => {
      it('should handle MCP server unavailability gracefully', async () => {
        global.fetch.mockImplementation((url) => {
          if (url.includes('localhost:3000')) {
            return Promise.reject(new Error('Connection refused'));
          }
          return global.fetch.wrappedMethod(url);
        });

        await healthService.checkComponent('mcpServer');

        const mcpStatus = healthService.componentStatuses.get('mcpServer');
        expect(mcpStatus.status).toBe('error');
        
        // Should not affect overall system health critically
        const healthStatus = healthService.getHealthStatus();
        expect(healthStatus.overall.status).not.toBe('critical');
      });

      it('should detect MCP server degraded performance', async () => {
        global.fetch.mockImplementation((url) => {
          if (url.includes('localhost:3000')) {
            return new Promise(resolve =>
              setTimeout(() => resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ tools: [] })
              }), 3000)
            );
          }
          return global.fetch.wrappedMethod(url);
        });

        await healthService.checkComponent('mcpServer');

        const mcpStatus = healthService.componentStatuses.get('mcpServer');
        expect(mcpStatus.status).toBe('degraded');
        expect(mcpStatus.responseTime).toBeGreaterThan(2000);
      });
    });

    describe('Screenshot Service Failure', () => {
      it('should handle screenshot service failure without system impact', async () => {
        // Screenshot service check typically returns unknown or error for non-critical services
        await healthService.checkComponent('screenshotService');

        const screenshotStatus = healthService.componentStatuses.get('screenshotService');
        expect(['unknown', 'error', 'healthy']).toContain(screenshotStatus.status);
        
        // Overall system should remain stable
        const healthStatus = healthService.getHealthStatus();
        expect(healthStatus.overall.status).not.toBe('critical');
      });
    });
  });

  describe('⚡ System Recovery Scenarios', () => {
    it('should recover from Redis failure when connection restored', async () => {
      // Simulate initial failure
      mockRedisClient.ping.mockRejectedValue(new Error('Connection failed'));
      await healthService.checkComponent('redis');

      let redisStatus = healthService.componentStatuses.get('redis');
      expect(redisStatus.status).toBe('error');

      // Simulate recovery
      mockRedisClient.ping.mockResolvedValue('PONG');
      mockRedisClient.isReady = true;
      await healthService.checkComponent('redis');

      redisStatus = healthService.componentStatuses.get('redis');
      expect(redisStatus.status).toBe('healthy');
      expect(redisStatus.lastSuccess).toBeDefined();
    });

    it('should update overall health score after recovery', async () => {
      // Simulate multiple service failures
      mockRedisClient.ping.mockRejectedValue(new Error('Redis down'));
      global.fetch.mockImplementation((url) => {
        if (url.includes('figma.com')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ ok: true });
      });

      await healthService.checkComponent('redis');
      await healthService.checkComponent('figmaApi');

      let healthStatus = healthService.getHealthStatus();
      expect(healthStatus.overall.status).toBe('critical');

      // Simulate recovery
      mockRedisClient.ping.mockResolvedValue('PONG');
      global.fetch.mockImplementation((url) => {
        if (url.includes('figma.com')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ user: { id: 'test' } })
          });
        }
        return Promise.resolve({ ok: true });
      });

      await healthService.checkComponent('redis');
      await healthService.checkComponent('figmaApi');

      healthStatus = healthService.getHealthStatus();
      expect(healthStatus.overall.status).toBe('healthy');
      expect(healthStatus.overall.score).toBeGreaterThan(80);
    });

    it('should clear alerts after service recovery', async () => {
      // Generate alerts from failures
      mockRedisClient.ping.mockRejectedValue(new Error('Redis failure'));
      await healthService.checkComponent('redis');
      await healthService.checkAlertConditions();

      expect(healthService.alerts.length).toBeGreaterThan(0);

      // Simulate recovery and wait
      mockRedisClient.ping.mockResolvedValue('PONG');
      await healthService.checkComponent('redis');
      
      // Clear old alerts (simulate time passing)
      healthService.clearOldAlerts(0); // Clear all alerts immediately for test

      expect(healthService.alerts.length).toBe(0);
    });
  });

  describe('🔄 Cascading Failure Prevention', () => {
    it('should continue monitoring other services when one fails', async () => {
      // Make Redis fail
      mockRedisClient.ping.mockRejectedValue(new Error('Redis failure'));

      // Perform comprehensive health check
      await healthService.performHealthCheck();

      // Check that other services were still monitored
      const figmaStatus = healthService.componentStatuses.get('figmaApi');
      const contextStatus = healthService.componentStatuses.get('contextManager');

      expect(figmaStatus.lastCheck).toBeDefined();
      expect(contextStatus.lastCheck).toBeDefined();
    });

    it('should isolate service failures without affecting monitoring cycle', async () => {
      const performHealthCheckSpy = vi.spyOn(healthService, 'performHealthCheck');
      const checkComponentSpy = vi.spyOn(healthService, 'checkComponent');

      // Make one service throw error
      checkComponentSpy.mockImplementation((componentName) => {
        if (componentName === 'figmaApi') {
          throw new Error('Catastrophic API failure');
        }
        return checkComponentSpy.wrappedMethod(componentName);
      });

      // Start monitoring
      healthService.startMonitoring();

      // Wait for monitoring cycle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Monitoring should continue despite individual service failures
      expect(performHealthCheckSpy).toHaveBeenCalled();
      expect(healthService.metrics.errors).toBeGreaterThan(0);

      checkComponentSpy.mockRestore();
    });
  });

  describe('🎚️ Alert System Validation', () => {
    it('should generate different alert severities correctly', async () => {
      // Critical alert: Redis failure
      mockRedisClient.ping.mockRejectedValue(new Error('Redis critical failure'));
      await healthService.checkComponent('redis');

      // Warning alert: High response time
      global.fetch.mockImplementation((url) => {
        if (url.includes('figma.com')) {
          return new Promise(resolve =>
            setTimeout(() => resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({ user: { id: 'test' } })
            }), 3000)
          );
        }
        return Promise.resolve({ ok: true });
      });
      await healthService.checkComponent('figmaApi');

      await healthService.checkAlertConditions();

      const criticalAlerts = healthService.alerts.filter(alert => alert.severity === 'critical');
      const warningAlerts = healthService.alerts.filter(alert => alert.severity === 'warning');

      expect(criticalAlerts.length).toBeGreaterThan(0);
      expect(warningAlerts.length).toBeGreaterThan(0);
    });

    it('should generate memory usage alerts', async () => {
      // Mock high memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = vi.fn().mockReturnValue({
        rss: 2000000000, // 2GB
        heapTotal: 1800000000,
        heapUsed: 1600000000,
        external: 100000000,
        arrayBuffers: 20000000
      });

      await healthService.collectSystemMetrics();
      await healthService.checkAlertConditions();

      const memoryAlerts = healthService.alerts.filter(alert => alert.type === 'memory_usage');
      expect(memoryAlerts.length).toBeGreaterThan(0);

      process.memoryUsage = originalMemoryUsage;
    });

    it('should generate error rate alerts', async () => {
      // Simulate high error rate
      healthService.metrics.requests = 100;
      healthService.metrics.errors = 10; // 10% error rate

      await healthService.checkAlertConditions();

      const errorRateAlerts = healthService.alerts.filter(alert => alert.type === 'error_rate');
      expect(errorRateAlerts.length).toBeGreaterThan(0);
      expect(errorRateAlerts[0].severity).toBe('warning');
    });

    it('should not duplicate alerts for ongoing issues', async () => {
      // Generate initial alert
      mockRedisClient.ping.mockRejectedValue(new Error('Ongoing Redis issue'));
      await healthService.checkComponent('redis');
      await healthService.checkAlertConditions();

      const initialAlertCount = healthService.alerts.length;

      // Run check again with same issue
      await healthService.checkComponent('redis');
      await healthService.checkAlertConditions();

      // Alert count should not increase significantly (some deduplication expected)
      expect(healthService.alerts.length).toBeLessThanOrEqual(initialAlertCount + 1);
    });
  });

  describe('📊 System Resilience Testing', () => {
    it('should maintain minimum service level during partial failures', async () => {
      // Fail non-critical services
      global.fetch.mockImplementation((url) => {
        if (url.includes('localhost:3000')) {
          return Promise.reject(new Error('MCP server down'));
        }
        return Promise.resolve({ ok: true, status: 200 });
      });

      await healthService.checkComponent('mcpServer');
      await healthService.checkComponent('screenshotService');

      const healthStatus = healthService.getHealthStatus();
      
      // System should still be operational (not critical)
      expect(healthStatus.overall.status).not.toBe('critical');
      expect(healthStatus.overall.score).toBeGreaterThan(50);
    });

    it('should handle rapid successive failures gracefully', async () => {
      const failurePromises = [];

      // Simulate rapid failures
      for (let i = 0; i < 5; i++) {
        mockRedisClient.ping.mockRejectedValue(new Error(`Failure ${i}`));
        failurePromises.push(healthService.checkComponent('redis'));
      }

      await Promise.allSettled(failurePromises);

      const redisStatus = healthService.componentStatuses.get('redis');
      expect(redisStatus.status).toBe('error');
      expect(redisStatus.errors).toBeGreaterThan(0);
    });

    it('should recover system health metrics after failures', async () => {
      // Record initial metrics
      const initialRequests = healthService.metrics.requests;

      // Simulate failures that increment error count
      healthService.recordRequest(false, 1000);
      healthService.recordRequest(false, 1500);
      healthService.recordRequest(true, 200);

      expect(healthService.metrics.errors).toBe(2);
      expect(healthService.metrics.requests).toBe(initialRequests + 3);

      // Error rate should be calculated correctly
      const errorRate = healthService.calculateErrorRate();
      expect(errorRate).toBeCloseTo(2/3, 2);
    });
  });

  describe('🔍 Monitoring Integrity', () => {
    it('should maintain monitoring even when individual checks fail', async () => {
      const monitoringCycleCount = 3;
      let cycleCount = 0;

      // Mock a service that fails every other time
      vi.spyOn(healthService, 'checkComponent').mockImplementation((componentName) => {
        cycleCount++;
        if (componentName === 'redis' && cycleCount % 2 === 0) {
          throw new Error('Intermittent failure');
        }
        return Promise.resolve();
      });

      healthService.startMonitoring();

      // Wait for multiple monitoring cycles
      await new Promise(resolve => setTimeout(resolve, 200));

      // Monitoring should have continued despite failures
      expect(cycleCount).toBeGreaterThan(monitoringCycleCount);
      expect(healthService.metrics.errors).toBeGreaterThan(0);
    });

    it('should maintain data consistency during concurrent operations', async () => {
      const concurrentChecks = Array.from({ length: 10 }, (_, i) =>
        healthService.checkComponent('redis').catch(() => {})
      );

      await Promise.allSettled(concurrentChecks);

      const redisStatus = healthService.componentStatuses.get('redis');
      expect(redisStatus).toBeDefined();
      expect(redisStatus.lastCheck).toBeDefined();
    });
  });
});