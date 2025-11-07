/**
 * Service Container Server Integration Tests
 * 
 * Tests real-world service registration patterns from server.js
 * and complex dependency scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceContainer } from '../../app/controllers/ServiceContainer.js';

describe('🚀 Service Container Server Integration Tests', () => {
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
    vi.spyOn(container, 'logger', 'get').mockReturnValue(mockLogger);
  });

  afterEach(() => {
    if (container) {
      container.instances.clear();
      container.services.clear();
    }
    vi.restoreAllMocks();
  });

  describe('🏗️ Real Server Service Patterns', () => {
    it('should handle Redis service registration pattern', () => {
      // Mock Redis client like in server.js
      const mockRedis = {
        isConnected: vi.fn().mockReturnValue(true),
        get: vi.fn().mockResolvedValue('value'),
        set: vi.fn().mockResolvedValue('OK'),
        disconnect: vi.fn().mockResolvedValue(undefined)
      };

      container.register('redis', () => mockRedis, true, []);

      const redis = container.get('redis');
      expect(redis).toBe(mockRedis);
      expect(redis.isConnected()).toBe(true);
    });

    it('should handle ConfigurationService with Redis dependency', () => {
      const mockRedis = {
        get: vi.fn().mockResolvedValue('{"value": "config"}'),
        set: vi.fn().mockResolvedValue('OK')
      };

      // Mock ConfigurationService pattern
      class MockConfigurationService {
        constructor(redis) {
          this.redis = redis;
          this.cache = new Map();
        }

        get(key) {
          return `config-${key}`;
        }

        async set(key, value) {
          this.cache.set(key, value);
          return this.redis.set(`config:${key}`, JSON.stringify(value));
        }
      }

      container.register('redis', () => mockRedis, true, []);
      container.register('configurationService', 
        (container, redis) => new MockConfigurationService(redis), 
        true, 
        ['redis']
      );

      const configService = container.get('configurationService');
      expect(configService).toBeInstanceOf(MockConfigurationService);
      expect(configService.redis).toBe(mockRedis);
      expect(configService.get('test')).toBe('config-test');
    });

    it('should handle TemplateManager with complex dependencies', () => {
      const mockRedis = { type: 'redis' };
      const mockConfigService = { type: 'config' };

      class MockTemplateManager {
        constructor({ redis, configService }) {
          this.redis = redis;
          this.configService = configService;
          this.templates = new Map();
        }

        getTemplate(name) {
          return this.templates.get(name);
        }
      }

      container.register('redis', () => mockRedis, true, []);
      container.register('configurationService', () => mockConfigService, true, []);
      container.register('templateManager', 
        (container, redis, configService) => new MockTemplateManager({ redis, configService }), 
        true, 
        ['redis', 'configurationService']
      );

      const templateManager = container.get('templateManager');
      expect(templateManager).toBeInstanceOf(MockTemplateManager);
      expect(templateManager.redis).toBe(mockRedis);
      expect(templateManager.configService).toBe(mockConfigService);
    });

    it('should handle HealthMonitoringService with container reference', () => {
      const mockRedis = { type: 'redis' };
      const mockConfig = { type: 'config' };

      class MockHealthMonitoringService {
        constructor(redis, config, container) {
          this.redis = redis;
          this.config = config;
          this.container = container;
          this.componentStatuses = new Map();
        }

        checkAllServices() {
          const services = this.container.getRegisteredServices();
          return services.map(name => ({
            name,
            status: this.container.instances.has(name) ? 'active' : 'registered'
          }));
        }

        getHealthStatus() {
          return {
            overall: { status: 'healthy', score: 95 },
            services: this.checkAllServices()
          };
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
      expect(healthService).toBeInstanceOf(MockHealthMonitoringService);
      expect(healthService.container).toBe(container);
      
      const status = healthService.getHealthStatus();
      expect(status.overall.status).toBe('healthy');
      expect(status.services).toHaveLength(3); // redis, config, health
    });

    it('should handle service alias pattern like ticketService', () => {
      const originalTicketService = { 
        generateTicket: vi.fn().mockReturnValue({ id: 'ticket-123' })
      };

      container.register('ticketGenerationService', () => originalTicketService, true, []);
      container.register('ticketService', 
        (container) => container.get('ticketGenerationService'), 
        true, 
        ['ticketGenerationService']
      );

      const aliasedService = container.get('ticketService');
      expect(aliasedService).toBe(originalTicketService);
      expect(aliasedService.generateTicket()).toEqual({ id: 'ticket-123' });
    });
  });

  describe('🔧 Complex Dependency Scenarios', () => {
    it('should handle circular-like dependencies with conditional injection', () => {
      let serviceAInstance = null;
      let serviceBInstance = null;

      // ServiceA depends on ServiceB but gets it lazily
      class ServiceA {
        constructor(container) {
          this.container = container;
          this._serviceB = null;
        }

        get serviceB() {
          if (!this._serviceB) {
            this._serviceB = this.container.get('serviceB');
          }
          return this._serviceB;
        }

        callB() {
          return this.serviceB.method();
        }
      }

      class ServiceB {
        constructor() {
          this.value = 'B-value';
        }

        method() {
          return this.value;
        }
      }

      container.register('serviceA', (container) => new ServiceA(container), true, []);
      container.register('serviceB', () => new ServiceB(), true, []);

      const serviceA = container.get('serviceA');
      expect(serviceA.callB()).toBe('B-value');
    });

    it('should handle services with optional dependencies', () => {
      class ServiceWithOptionalDeps {
        constructor(redis, optionalService = null) {
          this.redis = redis;
          this.optionalService = optionalService;
        }

        hasOptional() {
          return this.optionalService !== null;
        }
      }

      const mockRedis = { type: 'redis' };

      container.register('redis', () => mockRedis, true, []);
      container.register('serviceWithOptional', 
        (container, redis) => {
          // Try to get optional service, fallback to null
          let optionalService = null;
          try {
            optionalService = container.get('optionalService');
          } catch (e) {
            // Service not available, continue with null
          }
          return new ServiceWithOptionalDeps(redis, optionalService);
        },
        true,
        ['redis']
      );

      const service = container.get('serviceWithOptional');
      expect(service.redis).toBe(mockRedis);
      expect(service.hasOptional()).toBe(false);

      // Now register the optional service
      container.register('optionalService', () => ({ type: 'optional' }), true, []);
      
      // Create a new instance to test with optional service
      container.instances.delete('serviceWithOptional');
      const serviceWithOptional = container.get('serviceWithOptional');
      expect(serviceWithOptional.hasOptional()).toBe(true);
    });

    it('should handle environment-conditional service registration', () => {
      const originalEnv = process.env.ENABLE_MCP_SERVER;

      // Test with MCP disabled
      process.env.ENABLE_MCP_SERVER = 'false';

      const coreService = { type: 'core' };
      container.register('coreService', () => coreService, true, []);

      // MCP service would not be registered when disabled
      const services = container.getRegisteredServices();
      expect(services).toContain('coreService');
      expect(services).not.toContain('mcpServer');

      // Test with MCP enabled
      process.env.ENABLE_MCP_SERVER = 'true';

      let mcpInstanceCount = 0;
      container.register('mcpServer', () => ({ 
        type: 'mcp', 
        port: 3845, 
        id: ++mcpInstanceCount 
      }), false, []); // Non-singleton

      const mcpInstance1 = container.get('mcpServer');
      const mcpInstance2 = container.get('mcpServer');

      expect(mcpInstance1).not.toBe(mcpInstance2); // Transient
      expect(mcpInstance1.type).toBe('mcp');
      expect(mcpInstance1.id).toBe(1);
      expect(mcpInstance2.id).toBe(2);

      // Restore original environment
      process.env.ENABLE_MCP_SERVER = originalEnv;
    });
  });

  describe('🎯 Service Lifecycle Integration', () => {
    it('should initialize services in dependency order', async () => {
      const initOrder = [];

      class ServiceA {
        async initialize() {
          initOrder.push('A');
        }
      }

      class ServiceB {
        constructor(serviceA) {
          this.serviceA = serviceA;
        }

        async initialize() {
          initOrder.push('B');
        }
      }

      class ServiceC {
        constructor(serviceA, serviceB) {
          this.serviceA = serviceA;
          this.serviceB = serviceB;
        }

        async initialize() {
          initOrder.push('C');
        }
      }

      container.register('serviceA', () => new ServiceA(), true, []);
      container.register('serviceB', (container, a) => new ServiceB(a), true, ['serviceA']);
      container.register('serviceC', (container, a, b) => new ServiceC(a, b), true, ['serviceA', 'serviceB']);

      // Instantiate services (dependency resolution happens here)
      container.get('serviceA');
      container.get('serviceB');
      container.get('serviceC');

      // Initialize all services
      await container.initializeServices();

      // All services should be initialized
      expect(initOrder).toEqual(['A', 'B', 'C']);
    });

    it('should aggregate health from all services', () => {
      class HealthyService {
        healthCheck() {
          return { status: 'healthy', uptime: 1000 };
        }
      }

      class DegradedService {
        healthCheck() {
          return { status: 'degraded', issues: ['high_latency'] };
        }
      }

      class ErrorService {
        healthCheck() {
          return { status: 'error', error: 'Connection failed' };
        }
      }

      container.register('healthy', () => new HealthyService(), true, []);
      container.register('degraded', () => new DegradedService(), true, []);
      container.register('error', () => new ErrorService(), true, []);

      // Instantiate all services
      container.get('healthy');
      container.get('degraded');
      container.get('error');

      const healthStatus = container.getHealthStatus();

      expect(healthStatus.totalServices).toBe(3);
      expect(healthStatus.instantiatedServices).toBe(3);
      expect(healthStatus.services.healthy.health.status).toBe('healthy');
      expect(healthStatus.services.degraded.health.status).toBe('degraded');
      expect(healthStatus.services.error.health.status).toBe('error');
    });

    it('should handle graceful shutdown with dependencies', async () => {
      const shutdownOrder = [];

      class ServiceA {
        async shutdown() {
          shutdownOrder.push('A');
        }
      }

      class ServiceB {
        constructor(serviceA) {
          this.serviceA = serviceA;
        }

        async shutdown() {
          shutdownOrder.push('B');
        }
      }

      container.register('serviceA', () => new ServiceA(), true, []);
      container.register('serviceB', (container, a) => new ServiceB(a), true, ['serviceA']);

      // Instantiate services
      container.get('serviceA');
      container.get('serviceB');

      await container.shutdown();

      expect(shutdownOrder).toEqual(['A', 'B']);
      expect(container.instances.size).toBe(0);
    });
  });

  describe('📊 Performance and Memory Management', () => {
    it('should not create unnecessary instances for singletons', () => {
      let creationCount = 0;

      class ExpensiveService {
        constructor() {
          creationCount++;
          this.data = new Array(1000).fill('expensive');
        }
      }

      container.register('expensive', () => new ExpensiveService(), true, []);

      // Multiple gets should reuse the same instance
      const instance1 = container.get('expensive');
      const instance2 = container.get('expensive');
      const instance3 = container.get('expensive');

      expect(creationCount).toBe(1);
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should properly clean up instances on shutdown', async () => {
      const cleanupTasks = [];

      class ResourceService {
        constructor() {
          this.resource = 'allocated';
        }

        async shutdown() {
          cleanupTasks.push('ResourceService cleaned');
          this.resource = null;
        }
      }

      container.register('resource', () => new ResourceService(), true, []);
      const service = container.get('resource');

      expect(service.resource).toBe('allocated');
      expect(container.instances.size).toBe(1);

      await container.shutdown();

      expect(cleanupTasks).toContain('ResourceService cleaned');
      expect(container.instances.size).toBe(0);
    });
  });
});