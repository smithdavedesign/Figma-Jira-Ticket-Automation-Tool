/**
 * Base Service Class
 *
 * Provides common functionality for all services in the system.
 * Includes logging, health checks, and lifecycle management.
 *
 * Phase 8: Server Architecture Refactoring
 */

import { Logger } from '../../core/utils/logger.js';

export class BaseService {
  constructor(serviceName) {
    this.serviceName = serviceName || this.constructor.name;
    this.logger = new Logger(this.serviceName);
    this.initialized = false;
    this.startTime = Date.now();
  }

  /**
   * Initialize the service
   * Override in subclasses for specific initialization logic
   */
  async initialize() {
    if (this.initialized) {
      this.logger.warn('Service already initialized');
      return;
    }

    this.logger.info(`Initializing ${this.serviceName}...`);

    try {
      await this.onInitialize();
      this.initialized = true;
      this.logger.info(`✅ ${this.serviceName} initialized successfully`);
    } catch (error) {
      this.logger.error(`❌ Failed to initialize ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Override this method in subclasses for specific initialization logic
   */
  async onInitialize() {
    // Default implementation - no-op
  }

  /**
   * Health check for the service
   * Override in subclasses for specific health checks
   * @returns {Object} Health status
   */
  healthCheck() {
    return {
      status: this.initialized ? 'healthy' : 'not-initialized',
      service: this.serviceName,
      uptime: Date.now() - this.startTime,
      initialized: this.initialized
    };
  }

  /**
   * Shutdown the service gracefully
   * Override in subclasses for specific cleanup logic
   */
  async shutdown() {
    this.logger.info(`Shutting down ${this.serviceName}...`);

    try {
      await this.onShutdown();
      this.initialized = false;
      this.logger.info(`✅ ${this.serviceName} shutdown complete`);
    } catch (error) {
      this.logger.error(`❌ Error during ${this.serviceName} shutdown:`, error);
      throw error;
    }
  }

  /**
   * Override this method in subclasses for specific shutdown logic
   */
  async onShutdown() {
    // Default implementation - no-op
  }

  /**
   * Validate service state
   */
  validateInitialized() {
    if (!this.initialized) {
      throw new Error(`${this.serviceName} not initialized. Call initialize() first.`);
    }
  }

  /**
   * Log service metrics
   * @param {string} operation - Operation name
   * @param {Object} metrics - Metrics data
   */
  logMetrics(operation, metrics) {
    this.logger.info(`📊 ${this.serviceName} metrics [${operation}]:`, metrics);
  }

  /**
   * Handle service errors consistently
   * @param {string} operation - Operation that failed
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  handleError(operation, error, context = {}) {
    this.logger.error(`❌ ${this.serviceName} error in ${operation}:`, {
      error: error.message,
      stack: error.stack,
      ...context
    });

    // Re-throw with service context
    const serviceError = new Error(`${this.serviceName} failed: ${error.message}`);
    serviceError.originalError = error;
    serviceError.service = this.serviceName;
    serviceError.operation = operation;
    serviceError.context = context;

    throw serviceError;
  }

  /**
   * Execute operation with error handling and metrics
   * @param {string} operationName - Name of operation
   * @param {Function} operation - Operation function
   * @param {Object} context - Operation context
   */
  async executeOperation(operationName, operation, context = {}) {
    const startTime = Date.now();

    try {
      this.validateInitialized();
      this.logger.debug(`Starting ${operationName}`, context);

      const result = await operation();

      const duration = Date.now() - startTime;
      this.logMetrics(operationName, { duration, success: true });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logMetrics(operationName, { duration, success: false, error: error.message });

      this.handleError(operationName, error, context);
    }
  }
}