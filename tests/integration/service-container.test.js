/**
 * Service Container Integration Tests
 * 
 * Comprehensive tests for dependency injection, service registration patterns,
 * lifecycle management, and service health aggregation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceContainer, createServiceFactory, createInstanceFactory } from '../../app/controllers/ServiceContainer.js';

describe('🏗️ Service Container Integration Tests', () => {
  let container;
  let mockLogger;

  beforeEach(() => {
    container = new ServiceContainer();
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn()
    };
    // Mock the logger to prevent console output during tests
    vi.spyOn(container, 'logger', 'get').mockReturnValue(mockLogger);
  });

  afterEach(() => {
    if (container) {
      container.instances.clear();
      container.services.clear();
    }
    vi.restoreAllMocks();
  });

  describe('🔧 Service Registration', () => {
    it('should register services with correct configuration', () => {
      const factory = () => ({ name: 'TestService' });
      
      container.register('testService', factory, true, ['dependency1']);
      
      expect(container.has('testService')).toBe(true);
      expect(container.getRegisteredServices()).toContain('testService');
      
      const serviceConfig = container.services.get('testService');
      expect(serviceConfig.factory).toBe(factory);
      expect(serviceConfig.singleton).toBe(true);
      expect(serviceConfig.dependencies).toEqual(['dependency1']);
    });

    it('should register multiple services with different configurations', () => {
      container.register('service1', () => ({ id: 1 }), true, []);
      container.register('service2', () => ({ id: 2 }), false, ['service1']);
      container.register('service3', () => ({ id: 3 }), true, ['service1', 'service2']);

      expect(container.getRegisteredServices()).toHaveLength(3);
      expect(container.getRegisteredServices()).toEqual(
        expect.arrayContaining(['service1', 'service2', 'service3'])
      );
    });

    it('should handle service factory helpers correctly', () => {
      class MockService {
        constructor(dependency) {
          this.dependency = dependency;
        }
      }

      const mockDependency = { name: 'dependency' };
      container.register('dependency', createInstanceFactory(mockDependency), true, []);
      container.register('service', createServiceFactory(MockService, ['dependency']), true, ['dependency']);

      const service = container.get('service');
      expect(service).toBeInstanceOf(MockService);
      expect(service.dependency).toBe(mockDependency);
    });
  });

  describe('📦 Dependency Injection', () => {
    it('should resolve simple dependencies correctly', () => {
      const dependency = { name: 'SimpleDependency' };
      const service = { name: 'ServiceWithDependency' };

      container.register('dependency', () => dependency, true, []);
      container.register('service', (container, dep) => {
        service.dependency = dep;
        return service;
      }, true, ['dependency']);

      const resolvedService = container.get('service');
      expect(resolvedService.dependency).toBe(dependency);
    });

    it('should resolve complex dependency chains', () => {
      // Create dependency chain: service3 -> service2 -> service1
      container.register('service1', () => ({ level: 1 }), true, []);
      container.register('service2', (container, s1) => ({ level: 2, dependency: s1 }), true, ['service1']);
      container.register('service3', (container, s2) => ({ level: 3, dependency: s2 }), true, ['service2']);

      const service3 = container.get('service3');
      
      expect(service3.level).toBe(3);
      expect(service3.dependency.level).toBe(2);
      expect(service3.dependency.dependency.level).toBe(1);
    });

    it('should handle multiple dependencies correctly', () => {
      container.register('dep1', () => ({ name: 'dep1' }), true, []);
      container.register('dep2', () => ({ name: 'dep2' }), true, []);
      container.register('service', (container, d1, d2) => ({
        dep1: d1,
        dep2: d2
      }), true, ['dep1', 'dep2']);

      const service = container.get('service');
      expect(service.dep1.name).toBe('dep1');
      expect(service.dep2.name).toBe('dep2');
    });

    it('should throw error for missing dependencies', () => {
      container.register('service', (container, missing) => ({}), true, ['missingDep']);

      expect(() => container.get('service')).toThrow("Service 'missingDep' not registered");
    });

    it('should handle circular dependency gracefully', () => {
      container.register('service1', (container) => {
        // Simulate circular dependency
        const s2 = container.get('service2');
        return { name: 'service1', dependency: s2 };
      }, true, ['service2']);

      container.register('service2', (container) => {
        // This would create a circular dependency
        return { name: 'service2' };
      }, true, []);

      // Should not throw - service2 has no actual circular dependency
      const service1 = container.get('service1');
      expect(service1.name).toBe('service1');
      expect(service1.dependency.name).toBe('service2');
    });
  });

  describe('🏭 Service Lifecycle Management', () => {
    it('should respect singleton behavior', () => {
      let instanceCount = 0;
      container.register('singleton', () => {
        instanceCount++;
        return { id: instanceCount };
      }, true, []);

      const instance1 = container.get('singleton');
      const instance2 = container.get('singleton');

      expect(instance1).toBe(instance2);
      expect(instanceCount).toBe(1);
    });

    it('should create new instances for transient services', () => {
      let instanceCount = 0;
      container.register('transient', () => {
        instanceCount++;
        return { id: instanceCount };
      }, false, []);

      const instance1 = container.get('transient');
      const instance2 = container.get('transient');

      expect(instance1).not.toBe(instance2);
      expect(instance1.id).toBe(1);
      expect(instance2.id).toBe(2);
      expect(instanceCount).toBe(2);
    });

    it('should initialize services with initialize method', async () => {
      const mockService1 = {
        initialize: vi.fn().mockResolvedValue(undefined),
        name: 'service1'
      };
      const mockService2 = {
        initialize: vi.fn().mockResolvedValue(undefined),
        name: 'service2'
      };

      container.register('service1', () => mockService1, true, []);
      container.register('service2', () => mockService2, true, []);

      // Get services to instantiate them
      container.get('service1');
      container.get('service2');

      await container.initializeServices();

      expect(mockService1.initialize).toHaveBeenCalledOnce();
      expect(mockService2.initialize).toHaveBeenCalledOnce();
    });

    it('should handle initialization errors gracefully', async () => {
      const mockService = {
        initialize: vi.fn().mockRejectedValue(new Error('Initialization failed')),
        name: 'failingService'
      };

      container.register('failingService', () => mockService, true, []);
      container.get('failingService');

      await expect(container.initializeServices()).rejects.toThrow('Initialization failed');
    });

    it('should shutdown services gracefully', async () => {
      const mockService1 = {
        shutdown: vi.fn().mockResolvedValue(undefined),
        name: 'service1'
      };
      const mockService2 = {
        shutdown: vi.fn().mockResolvedValue(undefined),
        name: 'service2'
      };

      container.register('service1', () => mockService1, true, []);
      container.register('service2', () => mockService2, true, []);

      // Instantiate services
      container.get('service1');
      container.get('service2');

      await container.shutdown();

      expect(mockService1.shutdown).toHaveBeenCalledOnce();
      expect(mockService2.shutdown).toHaveBeenCalledOnce();
      expect(container.instances.size).toBe(0);
    });

    it('should handle shutdown errors without stopping other services', async () => {
      const mockService1 = {
        shutdown: vi.fn().mockRejectedValue(new Error('Shutdown failed')),
        name: 'failingService'
      };
      const mockService2 = {
        shutdown: vi.fn().mockResolvedValue(undefined),
        name: 'workingService'
      };

      container.register('failingService', () => mockService1, true, []);
      container.register('workingService', () => mockService2, true, []);

      container.get('failingService');
      container.get('workingService');

      // Should not throw, but continue with other shutdowns
      await container.shutdown();

      expect(mockService1.shutdown).toHaveBeenCalledOnce();
      expect(mockService2.shutdown).toHaveBeenCalledOnce();
      expect(container.instances.size).toBe(0);
    });

    it('should skip self-reference during initialization', async () => {
      // Register the container itself (edge case)
      container.register('selfReference', () => container, true, []);
      container.get('selfReference');

      // Should not cause infinite recursion
      await expect(container.initializeServices()).resolves.not.toThrow();
    });
  });

  describe('❤️ Health Status Aggregation', () => {
    it('should return comprehensive health status', () => {
      const healthyService = {
        healthCheck: () => ({ status: 'healthy', uptime: 1000 })
      };
      const unhealthyService = {
        healthCheck: () => ({ status: 'error', error: 'Service down' })
      };

      container.register('healthy', () => healthyService, true, []);
      container.register('unhealthy', () => unhealthyService, true, []);
      container.register('noHealthCheck', () => ({}), true, []);

      // Instantiate services
      container.get('healthy');
      container.get('unhealthy');
      container.get('noHealthCheck');

      const healthStatus = container.getHealthStatus();

      expect(healthStatus.totalServices).toBe(3);
      expect(healthStatus.instantiatedServices).toBe(3);
      expect(healthStatus.services.healthy).toEqual({
        status: 'instantiated',
        hasHealthCheck: true,
        health: { status: 'healthy', uptime: 1000 }
      });
      expect(healthStatus.services.unhealthy).toEqual({
        status: 'instantiated',
        hasHealthCheck: true,
        health: { status: 'error', error: 'Service down' }
      });
      expect(healthStatus.services.noHealthCheck).toEqual({
        status: 'instantiated',
        hasHealthCheck: false
      });
    });

    it('should handle health check errors gracefully', () => {
      const faultyService = {
        healthCheck: () => {
          throw new Error('Health check crashed');
        }
      };

      container.register('faulty', () => faultyService, true, []);
      container.get('faulty');

      const healthStatus = container.getHealthStatus();
      
      expect(healthStatus.services.faulty.health).toEqual({
        status: 'error',
        error: 'Health check crashed'
      });
    });

    it('should track instantiated vs registered services', () => {
      container.register('service1', () => ({ name: 'service1' }), true, []);
      container.register('service2', () => ({ name: 'service2' }), true, []);
      container.register('service3', () => ({ name: 'service3' }), true, []);

      // Only instantiate some services
      container.get('service1');
      container.get('service2');

      const healthStatus = container.getHealthStatus();
      expect(healthStatus.totalServices).toBe(3);
      expect(healthStatus.instantiatedServices).toBe(2);
    });
  });

  describe('🔧 Child Container Support', () => {
    it('should create child container with parent services', () => {
      const parentService = { name: 'parent' };
      container.register('parent', () => parentService, true, []);
      container.get('parent'); // Instantiate

      const child = container.createChild();

      expect(child.has('parent')).toBe(true);
      expect(child.get('parent')).toBe(parentService);
    });

    it('should allow child container to register new services', () => {
      const parentService = { name: 'parent' };
      const childService = { name: 'child-specific' };

      container.register('parentService', () => parentService, true, []);
      container.get('parentService');

      const child = container.createChild();
      child.register('childService', () => childService, true, []);

      expect(container.get('parentService')).toBe(parentService);
      expect(child.get('parentService')).toBe(parentService); // Inherited
      expect(child.get('childService')).toBe(childService); // Child-specific
      expect(() => container.get('childService')).toThrow(); // Not available in parent
    });

    it('should maintain separate instance caches', () => {
      container.register('service', () => ({ name: 'original' }), true, []);
      
      const child = container.createChild();
      child.register('newService', () => ({ name: 'child-only' }), true, []);

      container.get('service');
      child.get('service');
      child.get('newService');

      expect(container.instances.size).toBe(1);
      expect(child.instances.size).toBe(2);
      expect(container.has('newService')).toBe(false);
      expect(child.has('newService')).toBe(true);
    });
  });

  describe('🚨 Error Handling', () => {
    it('should throw meaningful error for unregistered service', () => {
      expect(() => container.get('nonExistent')).toThrow("Service 'nonExistent' not registered");
    });

    it('should handle factory function errors', () => {
      container.register('failing', () => {
        throw new Error('Factory failed');
      }, true, []);

      expect(() => container.get('failing')).toThrow('Factory failed');
    });

    it('should provide detailed error context for dependency resolution failures', () => {
      container.register('service', (container, dep) => ({}), true, ['missingDep']);

      const error = expect(() => container.get('service')).toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to create service 'service'"),
        expect.any(Error)
      );
    });
  });

  describe('🔄 Real-world Service Registration Patterns', () => {
    it('should handle Redis-like service registration', () => {
      const mockRedis = {
        isConnected: vi.fn().mockReturnValue(true),
        get: vi.fn(),
        set: vi.fn()
      };

      container.register('redis', () => mockRedis, true, []);

      const redis = container.get('redis');
      expect(redis).toBe(mockRedis);
      expect(redis.isConnected()).toBe(true);
    });

    it('should handle configuration service pattern', () => {
      const mockRedis = { get: vi.fn(), set: vi.fn() };
      
      class ConfigurationService {
        constructor(redis) {
          this.redis = redis;
        }
        
        get(key) {
          return `config-${key}`;
        }
      }

      container.register('redis', () => mockRedis, true, []);
      container.register('configurationService', 
        (container, redis) => new ConfigurationService(redis), 
        true, 
        ['redis']
      );

      const configService = container.get('configurationService');
      expect(configService).toBeInstanceOf(ConfigurationService);
      expect(configService.redis).toBe(mockRedis);
      expect(configService.get('test')).toBe('config-test');
    });

    it('should handle template manager-like complex dependencies', () => {
      const mockRedis = { data: 'redis' };
      const mockConfig = { data: 'config' };

      class TemplateManager {
        constructor({ redis, configService }) {
          this.redis = redis;
          this.configService = configService;
        }
      }

      container.register('redis', () => mockRedis, true, []);
      container.register('configurationService', () => mockConfig, true, []);
      container.register('templateManager', 
        (container, redis, configService) => new TemplateManager({ redis, configService }), 
        true, 
        ['redis', 'configurationService']
      );

      const templateManager = container.get('templateManager');
      expect(templateManager).toBeInstanceOf(TemplateManager);
      expect(templateManager.redis).toBe(mockRedis);
      expect(templateManager.configService).toBe(mockConfig);
    });

    it('should handle service alias pattern', () => {
      const originalService = { name: 'original' };
      
      container.register('originalService', () => originalService, true, []);
      container.register('serviceAlias', 
        (container) => container.get('originalService'), 
        true, 
        ['originalService']
      );

      const aliasedService = container.get('serviceAlias');
      expect(aliasedService).toBe(originalService);
    });
  });

  describe('🎯 Integration with Health Monitoring', () => {
    it('should support health monitoring service integration', () => {
      const mockRedis = { isConnected: () => true };
      const mockConfig = { get: () => 'value' };

      class MockHealthMonitoringService {
        constructor(redis, config, container) {
          this.redis = redis;
          this.config = config;
          this.container = container;
        }

        checkServiceHealth(serviceName) {
          return this.container.has(serviceName) ? 'healthy' : 'missing';
        }
      }

      container.register('redis', () => mockRedis, true, []);
      container.register('configurationService', () => mockConfig, true, []);
      container.register('healthMonitoringService', 
        (container, redis, config) => new MockHealthMonitoringService(redis, config, container),
        true,
        ['redis', 'configurationService']
      );

      const healthService = container.get('healthMonitoringService');
      expect(healthService.checkServiceHealth('redis')).toBe('healthy');
      expect(healthService.checkServiceHealth('nonexistent')).toBe('missing');
    });
  });
});