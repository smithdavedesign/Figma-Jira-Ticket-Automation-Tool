/**
 * Base Route Class
 *
 * Provides common functionality for all route modules.
 * Includes logging, error handling, and response formatting.
 *
 * Phase 8: Server Architecture Refactoring - Phase 3
 */

import { Logger } from '../../core/utils/logger.js';

export class BaseRoute {
  constructor(routeName, serviceContainer) {
    this.routeName = routeName || this.constructor.name;
    this.logger = new Logger(`Route:${this.routeName}`);
    this.services = serviceContainer;
  }

  /**
   * Get service from container
   * @param {string} serviceName - Service name
   * @returns {*} Service instance
   */
  getService(serviceName, required = true) {
    if (!this.services) {
      throw new Error(`Service container not available in ${this.routeName}`);
    }

    try {
      return this.services.get(serviceName);
    } catch (error) {
      if (!required) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Register routes (to be implemented by child classes)
   * @param {Express.Router} _router - Express router instance
   */
  registerRoutes(_router) {
    throw new Error(`${this.routeName} must implement registerRoutes() method`);
  }

  /**
   * Standardized success response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @param {Object} metadata - Additional metadata
   */
  sendSuccess(res, data, message = 'Success', statusCode = 200, metadata = {}) {
    const response = {
      success: true,
      message,
      data,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        route: this.routeName
      }
    };

    res.status(statusCode).json(response);
  }

  /**
   * Standardized error response
   * @param {Object} res - Express response object
   * @param {Error|string} error - Error object or message
   * @param {number} statusCode - HTTP status code
   * @param {Object} context - Additional error context
   */
  sendError(res, error, statusCode = 500, context = {}) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : null;

    const response = {
      success: false,
      error: errorMessage,
      metadata: {
        ...context,
        timestamp: new Date().toISOString(),
        route: this.routeName,
        statusCode
      }
    };

    // Log error details
    this.logger.error(`❌ ${this.routeName} error:`, {
      error: errorMessage,
      statusCode,
      context,
      stack: errorStack
    });

    res.status(statusCode).json(response);
  }

  /**
   * Async route handler wrapper with error handling
   * @param {Function} handler - Route handler function
   * @returns {Function} Wrapped handler
   */
  asyncHandler(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next);
      } catch (error) {
        this.handleRouteError(error, req, res);
      }
    };
  }

  /**
   * Handle route errors consistently
   * @param {Error} error - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  handleRouteError(error, req, res) {
    // Log request context
    const requestContext = {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body ? Object.keys(req.body) : [],
      userAgent: req.get('User-Agent')
    };

    this.logger.error(`Route error in ${this.routeName}:`, {
      error: error.message,
      stack: error.stack,
      request: requestContext
    });

    // Determine appropriate status code
    let statusCode = 500;
    if (error.name === 'ValidationError') {statusCode = 400;}
    if (error.name === 'UnauthorizedError') {statusCode = 401;}
    if (error.name === 'ForbiddenError') {statusCode = 403;}
    if (error.name === 'NotFoundError') {statusCode = 404;}

    this.sendError(res, error, statusCode, { request: requestContext });
  }

  /**
   * Validate required parameters
   * @param {Object} data - Data to validate
   * @param {Array<string>} requiredFields - Required field names
   * @throws {Error} If validation fails
   */
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => {
      const value = data[field];
      return value === null || value === undefined || value === '';
    });

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Log route access with metadata
   * @param {Object} req - Express request object
   * @param {string} action - Action being performed
   * @param {Object} context - Additional context
   */
  logAccess(req, action, context = {}) {
    // Determine API type for enhanced logging
    const apiType = this.getAPIType(req);
    const protocolIcon = this.getProtocolIcon(apiType);

    this.logger.info(`${protocolIcon} ${this.routeName} [${apiType}] - ${action}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      apiType,
      ...context
    });
  }

  /**
   * Determine API type based on route and request
   * @param {Object} req - Express request object
   * @returns {string} API type identifier
   */
  getAPIType(req) {
    if (req.url.includes('/api/mcp/')) {return 'MCP';}
    if (req.url.includes('/api/figma/')) {return 'REST';}
    if (req.url.includes('/api/screenshot')) {return 'REST';}
    if (this.routeName === 'MCP') {return 'MCP';}
    if (this.routeName === 'Figma') {return 'REST';}
    return 'GENERIC';
  }

  /**
   * Get protocol-specific icon for logging
   * @param {string} apiType - API type
   * @returns {string} Icon for protocol
   */
  getProtocolIcon(apiType) {
    switch (apiType) {
    case 'MCP': return '🔌'; // MCP Protocol
    case 'REST': return '🌐'; // REST API
    case 'GENERIC': return '🔗'; // Generic endpoint
    default: return '🔗';
    }
  }

  /**
   * Check if request is from test environment
   * @param {Object} req - Express request object
   * @returns {boolean}
   */
  isTestRequest(req) {
    return (
      process.env.NODE_ENV === 'test' ||
      req.query.test === 'true' ||
      req.body?.mode === 'test' ||
      req.get('X-Test-Mode') === 'true'
    );
  }

  /**
   * Get route health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      route: this.routeName,
      status: 'healthy',
      services: this.services ? this.services.getHealthStatus() : null,
      timestamp: new Date().toISOString()
    };
  }
}