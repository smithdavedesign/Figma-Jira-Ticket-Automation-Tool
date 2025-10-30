/**
 * Error Handler Utility
 *
 * Centralized error handling for the MCP server with
 * proper HTTP responses and logging.
 */

import { Logger } from './logger.js';

export class ErrorHandler {
  constructor() {
    this.logger = new Logger('ErrorHandler');
  }

  /**
   * Handle server errors and send appropriate HTTP responses
   * @param {Error} error - The error that occurred
   * @param {Object} req - HTTP request object
   * @param {Object} res - HTTP response object
   */
  handleServerError(error, req, res) {
    this.logger.error('Server error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      headers: req.headers
    });

    // Determine error type and response
    const errorResponse = this.categorizeError(error);

    res.writeHead(errorResponse.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: {
        message: errorResponse.message,
        code: errorResponse.code,
        type: errorResponse.type,
        timestamp: new Date().toISOString()
      }
    }));
  }

  /**
   * Categorize errors and return appropriate response data
   * @param {Error} error - The error to categorize
   * @returns {Object} Error response data
   */
  categorizeError(error) {
    // Network/API errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        type: 'network_error',
        message: 'External service unavailable'
      };
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.message.includes('Invalid')) {
      return {
        status: 400,
        code: 'VALIDATION_ERROR',
        type: 'validation_error',
        message: error.message
      };
    }

    // Authentication errors
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return {
        status: 401,
        code: 'AUTHENTICATION_ERROR',
        type: 'auth_error',
        message: 'Authentication failed'
      };
    }

    // Rate limiting errors
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return {
        status: 429,
        code: 'RATE_LIMIT_ERROR',
        type: 'rate_limit_error',
        message: 'Rate limit exceeded'
      };
    }

    // Tool execution errors
    if (error.message.includes('Tool') || error.message.includes('MCP')) {
      return {
        status: 422,
        code: 'TOOL_EXECUTION_ERROR',
        type: 'tool_error',
        message: 'Tool execution failed'
      };
    }

    // Default server error
    return {
      status: 500,
      code: 'INTERNAL_SERVER_ERROR',
      type: 'server_error',
      message: 'Internal server error'
    };
  }

  /**
   * Handle async function errors with proper logging
   * @param {Function} fn - Async function to wrap
   * @returns {Function} Wrapped function with error handling
   */
  asyncHandler(fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.logger.error('Async operation failed:', error);
        throw error;
      }
    };
  }

  /**
   * Create a standardized error object
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {string} type - Error type
   * @param {Object} details - Additional error details
   * @returns {Error} Standardized error
   */
  createError(message, code = 'UNKNOWN_ERROR', type = 'generic_error', details = {}) {
    const error = new Error(message);
    error.code = code;
    error.type = type;
    error.details = details;
    error.timestamp = new Date().toISOString();

    return error;
  }

  /**
   * Validate required parameters and throw error if missing
   * @param {Object} params - Parameters to validate
   * @param {string[]} required - Array of required parameter names
   */
  validateRequired(params, required) {
    const missing = required.filter(key => !(key in params) || params[key] === null || params[key] === undefined);

    if (missing.length > 0) {
      throw this.createError(
        `Missing required parameters: ${missing.join(', ')}`,
        'MISSING_PARAMETERS',
        'validation_error',
        { missing, provided: Object.keys(params) }
      );
    }
  }

  /**
   * Handle tool execution errors with context
   * @param {string} toolName - Name of the tool that failed
   * @param {Error} error - Original error from tool execution
   * @param {Object} args - Arguments passed to the tool
   */
  handleToolError(toolName, error, args) {
    this.logger.error(`Tool ${toolName} execution failed:`, {
      tool: toolName,
      error: error.message,
      args: args,
      stack: error.stack
    });

    throw this.createError(
      `Tool execution failed: ${error.message}`,
      'TOOL_EXECUTION_FAILED',
      'tool_error',
      {
        tool: toolName,
        originalError: error.message,
        args: args
      }
    );
  }
}