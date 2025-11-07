/**
 * Session Management Integration
 *
 * Integration layer for connecting the SessionMetricsService with the existing
 * SessionManager and FigmaSessionManager instances.
 */

import { SessionManager } from '../data/session-manager.js';
import { FigmaSessionManager } from '../data/figma-session-manager.js';
import { sessionMetricsService } from '../services/session-metrics-service.js';
import { Logger } from '../utils/logger.js';

export class SessionManagementIntegration {
  constructor() {
    this.logger = new Logger('SessionManagementIntegration');
    this.sessionManager = null;
    this.figmaSessionManager = null;
    this.initialized = false;
  }

  /**
   * Initialize session management integration
   */
  async initialize() {
    try {
      this.logger.info('🔧 Initializing Session Management Integration...');

      // Initialize session managers
      this.sessionManager = new SessionManager();
      await this.sessionManager.initialize();

      this.figmaSessionManager = new FigmaSessionManager();
      await this.figmaSessionManager.initialize();

      // Register with metrics service
      sessionMetricsService.registerSessionManager('SessionManager', this.sessionManager);
      sessionMetricsService.registerSessionManager('FigmaSessionManager', this.figmaSessionManager);

      // Set up event listeners
      this.setupEventListeners();

      this.initialized = true;
      this.logger.info('✅ Session Management Integration initialized');

      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Session Management Integration:', error);
      return false;
    }
  }

  /**
   * Set up event listeners for session events
   */
  setupEventListeners() {
    // Hook into session manager events if they exist
    if (this.sessionManager && typeof this.sessionManager.on === 'function') {
      this.sessionManager.on('sessionCreated', (sessionData) => {
        sessionMetricsService.recordEvent('SessionManager', 'session_created', sessionData);
      });

      this.sessionManager.on('sessionExpired', (sessionId) => {
        sessionMetricsService.recordEvent('SessionManager', 'session_expired', { sessionId });
      });

      this.sessionManager.on('cacheHit', (sessionId) => {
        sessionMetricsService.recordEvent('SessionManager', 'cache_hit', { sessionId });
      });

      this.sessionManager.on('cacheMiss', (sessionId) => {
        sessionMetricsService.recordEvent('SessionManager', 'cache_miss', { sessionId });
      });

      this.sessionManager.on('error', (error) => {
        sessionMetricsService.recordEvent('SessionManager', 'error', { error: error.message });
      });
    }

    // Similar for FigmaSessionManager
    if (this.figmaSessionManager && typeof this.figmaSessionManager.on === 'function') {
      this.figmaSessionManager.on('sessionCreated', (sessionData) => {
        sessionMetricsService.recordEvent('FigmaSessionManager', 'session_created', sessionData);
      });

      this.figmaSessionManager.on('screenshotCaptured', (data) => {
        sessionMetricsService.recordEvent('FigmaSessionManager', 'screenshot_captured', data);
      });

      this.figmaSessionManager.on('apiCall', (data) => {
        sessionMetricsService.recordEvent('FigmaSessionManager', 'api_call', data);
      });

      this.figmaSessionManager.on('mcpCall', (data) => {
        sessionMetricsService.recordEvent('FigmaSessionManager', 'mcp_call', data);
      });

      this.figmaSessionManager.on('error', (error) => {
        sessionMetricsService.recordEvent('FigmaSessionManager', 'error', { error: error.message });
      });
    }

    this.logger.info('📡 Session event listeners configured');
  }

  /**
   * Get integrated session manager instance
   */
  getSessionManager() {
    return this.sessionManager;
  }

  /**
   * Get integrated Figma session manager instance
   */
  getFigmaSessionManager() {
    return this.figmaSessionManager;
  }

  /**
   * Get metrics service instance
   */
  getMetricsService() {
    return sessionMetricsService;
  }

  /**
   * Health check for all session components
   */
  async healthCheck() {
    const health = {
      sessionManager: false,
      figmaSessionManager: false,
      metricsService: true,
      overall: false
    };

    try {
      // Check SessionManager
      if (this.sessionManager && typeof this.sessionManager.getStatus === 'function') {
        const status = this.sessionManager.getStatus();
        health.sessionManager = status.redisConnected || status.totalSessions >= 0;
      }

      // Check FigmaSessionManager
      if (this.figmaSessionManager && typeof this.figmaSessionManager.getPerformanceMetrics === 'function') {
        const metrics = this.figmaSessionManager.getPerformanceMetrics();
        health.figmaSessionManager = metrics.health?.status !== 'critical';
      }

      // Overall health
      health.overall = health.sessionManager && health.figmaSessionManager && health.metricsService;

      return health;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return health;
    }
  }

  /**
   * Get comprehensive status report
   */
  async getStatusReport() {
    const report = {
      initialized: this.initialized,
      timestamp: Date.now(),
      sessionManager: null,
      figmaSessionManager: null,
      metricsService: null,
      health: null
    };

    try {
      // SessionManager status
      if (this.sessionManager && typeof this.sessionManager.getStatus === 'function') {
        report.sessionManager = this.sessionManager.getStatus();
      }

      // FigmaSessionManager status
      if (this.figmaSessionManager && typeof this.figmaSessionManager.getPerformanceMetrics === 'function') {
        report.figmaSessionManager = this.figmaSessionManager.getPerformanceMetrics();
      }

      // Metrics service status
      report.metricsService = sessionMetricsService.getMetrics();

      // Health check
      report.health = await this.healthCheck();

      return report;
    } catch (error) {
      this.logger.error('Failed to generate status report:', error);
      report.error = error.message;
      return report;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      this.logger.info('🛑 Shutting down Session Management Integration...');

      // Unregister from metrics service
      sessionMetricsService.unregisterSessionManager('SessionManager');
      sessionMetricsService.unregisterSessionManager('FigmaSessionManager');

      // Cleanup session managers
      if (this.figmaSessionManager && typeof this.figmaSessionManager.disconnect === 'function') {
        await this.figmaSessionManager.disconnect();
      }

      if (this.sessionManager && typeof this.sessionManager.cleanup === 'function') {
        await this.sessionManager.cleanup();
      }

      // Cleanup metrics service
      await sessionMetricsService.cleanup();

      this.initialized = false;
      this.logger.info('✅ Session Management Integration shut down');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}

// Export singleton instance
export const sessionManagementIntegration = new SessionManagementIntegration();