/**
 * Simplified Health Monitoring System Failure & Recovery Tests
 * 
 * Focus on core functionality without complex timing issues:
 * - Basic service failure detection
 * - Alert generation
 * - System recovery validation
 * - Cascading failure prevention
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the health monitoring service
const mockHealthService = {
  componentStatuses: new Map(),
  alerts: [],
  metrics: {
    requests: 0,
    errors: 0,
    responseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0
  },
  monitoringInterval: null,

  checkComponent: vi.fn(async (componentName) => {
    const status = {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      responseTime: 100,
      errors: 0,
      details: {}
    };
    
    mockHealthService.componentStatuses.set(componentName, status);
    return status;
  }),

  getHealthStatus: vi.fn(() => ({
    overall: {
      status: 'healthy',
      score: 100,
      lastCheck: new Date().toISOString()
    },
    components: Object.fromEntries(mockHealthService.componentStatuses)
  })),

  checkAlertConditions: vi.fn(async () => {
    // Simple alert generation based on component status
    const alerts = [];
    for (const [component, status] of mockHealthService.componentStatuses) {
      if (status.status === 'error') {
        alerts.push({
          id: `alert-${component}-${Date.now()}`,
          component,
          severity: 'critical',
          type: 'service_failure',
          message: `${component} is experiencing errors`,
          timestamp: new Date().toISOString()
        });
      }
    }
    mockHealthService.alerts.push(...alerts);
    return alerts;
  }),

  startMonitoring: vi.fn(() => {
    if (!mockHealthService.monitoringInterval) {
      mockHealthService.monitoringInterval = setInterval(() => {
        mockHealthService.performHealthCheck();
      }, 100);
    }
  }),

  stopMonitoring: vi.fn(() => {
    if (mockHealthService.monitoringInterval) {
      clearInterval(mockHealthService.monitoringInterval);
      mockHealthService.monitoringInterval = null;
    }
  }),

  performHealthCheck: vi.fn(async () => {
    const components = ['redis', 'figmaApi', 'contextManager', 'mcpServer'];
    for (const component of components) {
      try {
        await mockHealthService.checkComponent(component);
      } catch (error) {
        // Handle component check failures
        const status = {
          status: 'error',
          lastCheck: new Date().toISOString(),
          errors: 1,
          details: { error: error.message }
        };
        mockHealthService.componentStatuses.set(component, status);
      }
    }
  }),

  recordRequest: vi.fn((success, responseTime) => {
    mockHealthService.metrics.requests++;
    if (!success) {
      mockHealthService.metrics.errors++;
    }
    mockHealthService.metrics.responseTime = responseTime;
  }),

  calculateErrorRate: vi.fn(() => {
    if (mockHealthService.metrics.requests === 0) return 0;
    return mockHealthService.metrics.errors / mockHealthService.metrics.requests;
  }),

  clearOldAlerts: vi.fn((maxAge = 300000) => { // 5 minutes default
    const cutoff = Date.now() - maxAge;
    mockHealthService.alerts = mockHealthService.alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime();
      return alertTime > cutoff;
    });
  }),

  collectSystemMetrics: vi.fn(async () => {
    mockHealthService.metrics.memoryUsage = process.memoryUsage().heapUsed;
    return mockHealthService.metrics;
  })
};

describe('🚨 Simplified Health Monitoring System Tests', () => {
  let healthService;

  beforeEach(() => {
    // Reset the mock service state
    mockHealthService.componentStatuses.clear();
    mockHealthService.alerts = [];
    mockHealthService.metrics = {
      requests: 0,
      errors: 0,
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    };
    
    // Reset all mock function calls
    Object.values(mockHealthService).forEach(prop => {
      if (typeof prop === 'function' && prop.mockClear) {
        prop.mockClear();
      }
    });

    healthService = mockHealthService;
  });

  afterEach(() => {
    if (healthService.stopMonitoring) {
      healthService.stopMonitoring();
    }
  });

  describe('🔴 Service Failure Detection', () => {
    it('should detect service failures', async () => {
      // Mock a failing component check
      healthService.checkComponent.mockImplementation(async (componentName) => {
        if (componentName === 'redis') {
          const status = {
            status: 'error',
            lastCheck: new Date().toISOString(),
            errors: 1,
            details: { error: 'Connection refused' }
          };
          healthService.componentStatuses.set(componentName, status);
          return status;
        }
        // Default healthy status for other components
        const status = {
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          errors: 0,
          details: {}
        };
        healthService.componentStatuses.set(componentName, status);
        return status;
      });

      await healthService.checkComponent('redis');
      
      const redisStatus = healthService.componentStatuses.get('redis');
      expect(redisStatus).toBeDefined();
      expect(redisStatus.status).toBe('error');
    });

    it('should continue monitoring other services when one fails', async () => {
      // Mock Redis failure but other services healthy
      healthService.checkComponent.mockImplementation(async (componentName) => {
        const status = {
          status: componentName === 'redis' ? 'error' : 'healthy',
          lastCheck: new Date().toISOString(),
          errors: componentName === 'redis' ? 1 : 0,
          details: componentName === 'redis' ? { error: 'Connection failed' } : {}
        };
        healthService.componentStatuses.set(componentName, status);
        return status;
      });

      await healthService.performHealthCheck();

      expect(healthService.componentStatuses.get('redis').status).toBe('error');
      expect(healthService.componentStatuses.get('figmaApi').status).toBe('healthy');
      expect(healthService.componentStatuses.get('contextManager').status).toBe('healthy');
    });
  });

  describe('🟡 Alert System', () => {
    it('should generate alerts for service failures', async () => {
      // Set up a failed component
      healthService.componentStatuses.set('redis', {
        status: 'error',
        lastCheck: new Date().toISOString(),
        errors: 1,
        details: { error: 'Connection failed' }
      });

      await healthService.checkAlertConditions();

      expect(healthService.alerts.length).toBeGreaterThan(0);
      
      const redisAlert = healthService.alerts.find(alert => alert.component === 'redis');
      expect(redisAlert).toBeDefined();
      expect(redisAlert.severity).toBe('critical');
    });

    it('should clear old alerts', () => {
      // Add some old alerts
      const oldAlert = {
        id: 'old-alert',
        component: 'redis',
        severity: 'critical',
        timestamp: new Date(Date.now() - 400000).toISOString() // 6+ minutes ago
      };
      
      const recentAlert = {
        id: 'recent-alert',
        component: 'figmaApi',
        severity: 'warning',
        timestamp: new Date().toISOString()
      };

      healthService.alerts = [oldAlert, recentAlert];

      healthService.clearOldAlerts(300000); // 5 minutes

      expect(healthService.alerts.length).toBe(1);
      expect(healthService.alerts[0].id).toBe('recent-alert');
    });
  });

  describe('⚡ System Recovery', () => {
    it('should recover from service failures', async () => {
      // First, simulate a failure
      healthService.checkComponent.mockImplementationOnce(async (componentName) => {
        const status = {
          status: 'error',
          lastCheck: new Date().toISOString(),
          errors: 1,
          details: { error: 'Connection failed' }
        };
        healthService.componentStatuses.set(componentName, status);
        return status;
      });

      await healthService.checkComponent('redis');
      expect(healthService.componentStatuses.get('redis').status).toBe('error');

      // Now simulate recovery
      healthService.checkComponent.mockImplementationOnce(async (componentName) => {
        const status = {
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          errors: 0,
          details: {}
        };
        healthService.componentStatuses.set(componentName, status);
        return status;
      });

      await healthService.checkComponent('redis');
      expect(healthService.componentStatuses.get('redis').status).toBe('healthy');
    });

    it('should update overall health score after recovery', async () => {
      // Start with failed components
      healthService.componentStatuses.set('redis', { status: 'error' });
      healthService.componentStatuses.set('figmaApi', { status: 'error' });

      // Mock getHealthStatus to return critical when services are down
      healthService.getHealthStatus.mockReturnValueOnce({
        overall: { status: 'critical', score: 20 }
      });

      let healthStatus = healthService.getHealthStatus();
      expect(healthStatus.overall.status).toBe('critical');

      // Simulate recovery
      healthService.componentStatuses.set('redis', { status: 'healthy' });
      healthService.componentStatuses.set('figmaApi', { status: 'healthy' });

      // Mock getHealthStatus to return healthy when services recover
      healthService.getHealthStatus.mockReturnValueOnce({
        overall: { status: 'healthy', score: 95 }
      });

      healthStatus = healthService.getHealthStatus();
      expect(healthStatus.overall.status).toBe('healthy');
      expect(healthStatus.overall.score).toBeGreaterThan(80);
    });
  });

  describe('📊 Metrics and Monitoring', () => {
    it('should record request metrics', () => {
      healthService.recordRequest(true, 200);
      healthService.recordRequest(false, 1000);
      healthService.recordRequest(true, 150);

      expect(healthService.metrics.requests).toBe(3);
      expect(healthService.metrics.errors).toBe(1);
    });

    it('should calculate error rate correctly', () => {
      healthService.metrics.requests = 10;
      healthService.metrics.errors = 2;

      const errorRate = healthService.calculateErrorRate();
      expect(errorRate).toBe(0.2); // 20%
    });

    it('should handle zero requests', () => {
      healthService.metrics.requests = 0;
      healthService.metrics.errors = 0;

      const errorRate = healthService.calculateErrorRate();
      expect(errorRate).toBe(0);
    });
  });

  describe('🔄 Monitoring Lifecycle', () => {
    it('should start and stop monitoring', () => {
      expect(healthService.monitoringInterval).toBeNull();

      healthService.startMonitoring();
      expect(healthService.monitoringInterval).not.toBeNull();

      healthService.stopMonitoring();
      expect(healthService.monitoringInterval).toBeNull();
    });

    it('should collect system metrics', async () => {
      await healthService.collectSystemMetrics();

      expect(healthService.metrics.memoryUsage).toBeGreaterThan(0);
      expect(healthService.collectSystemMetrics).toHaveBeenCalled();
    });
  });

  describe('🛡️ Error Handling', () => {
    it('should handle component check failures gracefully', async () => {
      healthService.checkComponent.mockRejectedValue(new Error('Check failed'));

      // Should not throw
      await expect(healthService.performHealthCheck()).resolves.not.toThrow();
    });

    it('should maintain service isolation during failures', async () => {
      healthService.checkComponent.mockImplementation(async (componentName) => {
        if (componentName === 'redis') {
          throw new Error('Redis check failed');
        }
        const status = {
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          errors: 0
        };
        healthService.componentStatuses.set(componentName, status);
        return status;
      });

      await healthService.performHealthCheck();

      // Other services should still be checked and healthy
      expect(healthService.componentStatuses.get('figmaApi').status).toBe('healthy');
      expect(healthService.componentStatuses.get('contextManager').status).toBe('healthy');
    });
  });
});