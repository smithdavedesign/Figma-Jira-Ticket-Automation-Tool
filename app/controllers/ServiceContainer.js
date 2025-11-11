/**
 * Service Container - Dependency Injection
 *
 * Manages service instantiation and dependencies for the MCP server.
 * Supports singleton and transient service lifetimes.
 *
 * Phase 8: Server Architecture Refactoring
 * Prepares for Phase 7-9 roadmap integration
 */

import { Logger } from '../../core/utils/logger.js';

export class ServiceContainer {
  constructor() {
    this.services = new Map();
    this.instances = new Map();
    this.logger = new Logger('ServiceContainer');
  }

  /**
   * Register a service factory
   * @param {string} name - Service name
   * @param {Function} factory - Factory function that creates the service
   * @param {boolean} singleton - Whether to create singleton instance
   * @param {Array<string>} dependencies - Service dependencies
   */
  register(name, factory, singleton = true, dependencies = []) {
    this.services.set(name, {
      factory,
      singleton,
      dependencies
    });

    this.logger.debug(`Registered service: ${name}`, {
      singleton,
      dependencies: dependencies.length
    });
  }

  /**
   * Get service instance
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  get(name) {
    // Return existing singleton instance if available
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    const serviceConfig = this.services.get(name);
    if (!serviceConfig) {
      throw new Error(`Service '${name}' not registered`);
    }

    this.logger.debug(`Creating service instance: ${name}`);

    try {
      // Resolve dependencies first
      const resolvedDependencies = this.resolveDependencies(serviceConfig.dependencies);

      // Create service instance
      const instance = serviceConfig.factory(this, ...resolvedDependencies);

      // Store singleton instance
      if (serviceConfig.singleton) {
        this.instances.set(name, instance);
      }

      this.logger.info(`✅ Service created: ${name}`);
      return instance;

    } catch (error) {
      this.logger.error(`❌ Failed to create service '${name}':`, error);
      throw error;
    }
  }

  /**
   * Resolve service dependencies
   * @param {Array<string>} dependencies - Dependency names
   * @returns {Array} Resolved dependency instances
   */
  resolveDependencies(dependencies) {
    return dependencies.map(dep => this.get(dep));
  }

  /**
   * Check if service is registered
   * @param {string} name - Service name
   * @returns {boolean}
   */
  has(name) {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   * @returns {Array<string>}
   */
  getRegisteredServices() {
    return Array.from(this.services.keys());
  }

  /**
   * Get service health status
   * @returns {Object} Health status of all services
   */
  getHealthStatus() {
    const status = {
      totalServices: this.services.size,
      instantiatedServices: this.instances.size,
      services: {}
    };

    for (const [name, instance] of this.instances) {
      status.services[name] = {
        status: 'instantiated',
        hasHealthCheck: typeof instance.healthCheck === 'function'
      };

      // Call health check if available
      if (instance.healthCheck) {
        try {
          status.services[name].health = instance.healthCheck();
        } catch (error) {
          status.services[name].health = { status: 'error', error: error.message };
        }
      }
    }

    return status;
  }

  /**
   * Initialize all services that have an initialize method
   */
  async initializeServices() {
    this.logger.info('Initializing all services...');

    const initPromises = [];

    for (const [name, instance] of this.instances) {
      // Skip self-reference to prevent infinite recursion
      if (instance === this) {
        this.logger.debug(`Skipping self-reference: ${name}`);
        continue;
      }

      if (typeof instance.initialize === 'function') {
        this.logger.debug(`Initializing service: ${name}`);
        initPromises.push(
          instance.initialize().catch(error => {
            this.logger.error(`Error initializing ${name}:`, error);
            throw error;
          })
        );
      }
    }

    await Promise.all(initPromises);
    this.logger.info('✅ All services initialized');
  }

  /**
   * Shutdown all services gracefully
   */
  async shutdown() {
    this.logger.info('Shutting down service container...');

    const shutdownPromises = [];

    for (const [name, instance] of this.instances) {
      // Skip self-reference to prevent infinite recursion
      if (instance === this) {
        this.logger.debug(`Skipping self-reference: ${name}`);
        continue;
      }

      if (typeof instance.shutdown === 'function') {
        this.logger.debug(`Shutting down service: ${name}`);
        shutdownPromises.push(
          instance.shutdown().catch(error => {
            this.logger.error(`Error shutting down ${name}:`, error);
          })
        );
      }
    }

    await Promise.all(shutdownPromises);

    this.instances.clear();
    this.logger.info('✅ Service container shutdown complete');
  }

  /**
   * Create a child container with additional services
   * Useful for testing or scoped operations
   * @returns {ServiceContainer} Child container
   */
  createChild() {
    const child = new ServiceContainer();

    // Copy service registrations
    for (const [name, config] of this.services) {
      child.services.set(name, config);
    }

    // Copy singleton instances
    for (const [name, instance] of this.instances) {
      child.instances.set(name, instance);
    }

    return child;
  }
}

/**
 * Service factory helper for creating services with dependencies
 * @param {Function} ServiceClass - Service class constructor
 * @param {Array<string>} dependencies - Service dependencies
 * @returns {Function} Factory function
 */
export function createServiceFactory(ServiceClass, _dependencies = []) {
  return (container, ...resolvedDeps) => {
    return new ServiceClass(...resolvedDeps);
  };
}

/**
 * Create factory for existing instance (useful for configuration objects)
 * @param {*} instance - Existing instance
 * @returns {Function} Factory function
 */
export function createInstanceFactory(instance) {
  return () => instance;
}