/**
 * Base Figma Routes Module
 *
 * Shared functionality for all Figma route modules.
 * Provides common utilities, validation, and base endpoint handlers.
 */

import crypto from 'crypto';
import { BaseRoute } from '../BaseRoute.js';

export class BaseFigmaRoute extends BaseRoute {
  constructor(serviceName, serviceContainer) {
    super(serviceName, serviceContainer);
  }

  /**
   * Get ContextManager from service container
   * @returns {ContextManager|null}
   */
  getContextManager() {
    try {
      return this.getService('contextManager', false);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract fileKey from Figma URL
   * @param {string} figmaUrl - Full Figma URL
   * @returns {string|null}
   */
  extractFileKeyFromURL(figmaUrl) {
    if (!figmaUrl) {return null;}

    if (figmaUrl.startsWith('https://www.figma.com')) {
      const match = figmaUrl.match(/\/(?:file|design)\/([A-Za-z0-9]+)/);
      return match ? match[1] : null;
    }

    if (/^[A-Za-z0-9]+$/.test(figmaUrl)) {
      return figmaUrl;
    }

    return null;
  }

  /**
   * Extract nodeId from Figma URL
   * @param {string} figmaUrl - Full Figma URL
   * @returns {string|null}
   */
  extractNodeIdFromURL(figmaUrl) {
    if (!figmaUrl) {return null;}

    const match = figmaUrl.match(/node-id=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * Generate secure cache key using SHA-1 hash
   * @param {string} prefix - Cache key prefix
   * @param {string} url - URL to hash
   * @returns {string} Secure cache key
   */
  generateCacheKey(prefix, url) {
    const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 16);
    return `${prefix}-${hash}`;
  }

  /**
   * Batch Redis get operations for better performance
   * @param {Array<string>} keys - Redis keys to fetch
   * @returns {Promise<Array>} Array of parsed results
   */
  async batchRedisGet(keys) {
    const redis = this.getService('redis');
    const promises = keys.map(key => redis.get(key));
    const results = await Promise.all(promises);

    return results.map((result, index) => {
      try {
        return result ? JSON.parse(result) : null;
      } catch (error) {
        this.logger.warn(`Failed to parse Redis data for key ${keys[index]}:`, error.message);
        return null;
      }
    });
  }

  /**
   * Enhanced error handling for Figma operations
   * @param {Error} error - Error object
   * @param {Object} res - Express response
   * @param {string} operation - Operation name
   */
  handleFigmaError(error, res, operation) {
    let errorMessage = `Failed to ${operation}`;
    let errorCode = 500;

    if (error.message.includes('Invalid Figma URL')) {
      errorMessage = 'Invalid Figma URL provided';
      errorCode = 400;
    } else if (error.message.includes('timeout')) {
      errorMessage = `${operation} timed out`;
      errorCode = 408;
    } else if (error.message.includes('Access denied')) {
      errorMessage = 'Cannot access Figma file - check permissions';
      errorCode = 403;
    } else if (error.message.includes('Context Manager')) {
      errorMessage = 'Context Layer unavailable';
      errorCode = 503;
    }

    this.logger.error(`${operation} failed:`, error);
    this.sendError(res, `${errorMessage}: ${error.message}`, errorCode);
  }

  /**
   * Validate required services for Figma operations
   * @param {Array<string>} requiredServices - Service names to check
   * @throws {Error} If required services are missing
   */
  validateServices(requiredServices = []) {
    const missing = [];

    for (const serviceName of requiredServices) {
      try {
        this.getService(serviceName);
      } catch (error) {
        missing.push(serviceName);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Required services not available: ${missing.join(', ')}`);
    }
  }

  /**
   * Get standard Figma health status
   * @returns {Object}
   */
  getFigmaHealthStatus() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      architecture: 'figma-api → context-layer → semantic-analysis',
      contextLayerEnabled: !!this.getContextManager(),

      serviceRequirements: [
        'screenshotService',
        'redis',
        'contextManager (optional)'
      ],

      contextManager: this.getContextManager() ? {
        status: 'available',
        extractors: 5,
        capabilities: [
          'node-parsing',
          'style-extraction',
          'component-mapping',
          'layout-analysis',
          'prototype-mapping'
        ]
      } : {
        status: 'unavailable',
        reason: 'Context Manager not initialized'
      }
    };
  }
}

export default BaseFigmaRoute;