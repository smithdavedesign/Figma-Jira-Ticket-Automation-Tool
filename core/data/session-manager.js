/**
 * Session Manager
 *
 * Manages user sessions with Redis persistence, providing
 * session creation, validation, and cleanup functionality.
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { RedisClient } from './redis-client.js';
import { redisConfig } from '../../config/redis.config.js';

export class SessionManager {
  constructor() {
    this.logger = new Logger('SessionManager');
    this.errorHandler = new ErrorHandler();
    this.redis = new RedisClient();

    // Memory-based session storage (fallback)
    this.memoryStore = new Map();
    this.sessionTimers = new Map();

    // Performance tracking metrics
    this.metrics = {
      sessionCreated: 0,
      sessionRetrieved: 0,
      cacheHits: 0,
      cacheMisses: 0,
      redisHits: 0,
      redisMisses: 0,
      responseTimes: [],
      errors: 0,
      startTime: Date.now()
    };

    // Configuration
    this.config = {
      ttl: 3600, // 1 hour
      cleanupInterval: 300000, // 5 minutes
      maxSessions: 10000,
      metricsWindowSize: 100 // Keep last 100 response times
    };

    this.startTime = Date.now();
    this.setupCleanupInterval();
  }

  /**
   * Setup cleanup interval for expired sessions
   */
  setupCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredSessions().catch(error => {
        this.logger.error('Cleanup interval error:', error);
      });
    }, this.config.cleanupInterval);

    this.logger.info('Session cleanup interval started');
  }

  /**
   * Initialize session manager
   */
  async initialize() {
    const redisConnected = await this.redis.connect();

    if (!redisConnected) {
      this.logger.warn('Redis unavailable, using in-memory session storage');
      this.startMemoryCleanup();
    }

    this.logger.info('Session manager initialized');
  }

  /**
   * Create a new session
   * @param {string} userId - User identifier
   * @param {Object} userData - Additional user data
   * @returns {Promise<string>} Session ID
   */
  async createSession(sessionId = null, data = {}, ttl = null) {
    const startTime = Date.now();

    try {
      const id = sessionId || this.generateSessionId();
      const expiresAt = Date.now() + ((ttl || this.config.defaultTTL) * 1000);

      const session = {
        id,
        data,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        expiresAt,
        ttl: ttl || this.config.defaultTTL,
        metrics: {
          accessCount: 1,
          cacheHits: 0,
          redisHits: 0,
          averageResponseTime: 0
        }
      };

      // Store in memory
      this.sessions.set(id, session);

      // Store in Redis if available
      if (this.redis.isConnected()) {
        await this.redis.setex(
          `${this.config.sessionPrefix}${id}`,
          ttl || this.config.defaultTTL,
          JSON.stringify(session)
        );
      }

      // Update metrics
      this.metrics.sessionCreated++;
      this.updateResponseTime(startTime);

      this.logger.info(`Session created: ${id} (${Date.now() - startTime}ms)`);
      return session;

    } catch (error) {
      this.metrics.errors++;
      this.logger.error('Failed to create session:', error);
      return this.errorHandler.handle(error, { context: 'createSession' });
    }
  }

  /**
   * Get session data
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>} Session data or null
   */
  async getSession(sessionId) {
    const startTime = Date.now();

    try {
      if (!sessionId) {
        return null;
      }

      this.metrics.sessionRetrieved++;

      // Try Redis first
      let sessionData = await this.redis.get(sessionId, 'session');
      let source = 'none';

      if (sessionData) {
        this.metrics.redisHits++;
        source = 'redis';
      } else {
        this.metrics.redisMisses++;

        // Fallback to memory
        if (this.memoryStore.has(sessionId)) {
          sessionData = this.memoryStore.get(sessionId);
          this.metrics.cacheHits++;
          source = 'memory';
        } else {
          this.metrics.cacheMisses++;
        }
      }

      if (!sessionData) {
        this.updateResponseTime(startTime);
        this.logger.debug('Session not found', { sessionId: sessionId.substring(0, 8) + '...' });
        return null;
      }

      // Update session metrics
      if (!sessionData.metrics) {
        sessionData.metrics = { accessCount: 0, sources: { redis: 0, memory: 0 } };
      }
      sessionData.metrics.accessCount++;
      sessionData.metrics.sources[source] = (sessionData.metrics.sources[source] || 0) + 1;

      // Update last accessed time
      sessionData.lastAccessedAt = new Date().toISOString();
      await this.updateSession(sessionId, sessionData);

      this.updateResponseTime(startTime);
      this.logger.debug('Session retrieved', {
        sessionId: sessionId.substring(0, 8) + '...',
        userId: sessionData.userId,
        source,
        responseTime: Date.now() - startTime
      });

      return sessionData;

    } catch (error) {
      this.metrics.errors++;
      this.updateResponseTime(startTime);
      this.logger.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Update session data
   * @param {string} sessionId - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise<boolean>} Success status
   */
  async updateSession(sessionId, sessionData) {
    try {
      const updated = await this.redis.set(
        sessionId,
        sessionData,
        this.config.ttl,
        'session'
      );

      if (!updated) {
        // Fallback to memory
        this.memoryStore.set(sessionId, sessionData);
        this.setMemoryExpiration(sessionId, this.config.ttl * 1000);
      }

      return true;

    } catch (error) {
      this.logger.error('Failed to update session:', error);
      return false;
    }
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteSession(sessionId) {
    try {
      const redisDeleted = await this.redis.delete(sessionId, 'session');
      const memoryDeleted = this.memoryStore.delete(sessionId);

      // Clear memory timer
      if (this.sessionTimers.has(sessionId)) {
        clearTimeout(this.sessionTimers.get(sessionId));
        this.sessionTimers.delete(sessionId);
      }

      this.logger.info('Session deleted', {
        sessionId: sessionId.substring(0, 8) + '...',
        redis: redisDeleted,
        memory: memoryDeleted
      });

      return redisDeleted || memoryDeleted;

    } catch (error) {
      this.logger.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Validate session and check expiration
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} Validation status
   */
  async validateSession(sessionId) {
    try {
      const sessionData = await this.getSession(sessionId);

      if (!sessionData) {
        return false;
      }

      // Check if session is expired (additional validation)
      const createdAt = new Date(sessionData.createdAt);
      const now = new Date();
      const ageInSeconds = (now - createdAt) / 1000;

      if (ageInSeconds > this.config.ttl) {
        this.logger.info('Session expired by age', {
          sessionId: sessionId.substring(0, 8) + '...',
          ageInSeconds
        });
        await this.deleteSession(sessionId);
        return false;
      }

      return true;

    } catch (error) {
      this.logger.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Get all sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object[]>} User sessions
   */
  async getUserSessions(userId) {
    try {
      const sessions = [];

      // Search Redis sessions
      const redisKeys = await this.redis.keys('*', 'session');

      for (const key of redisKeys) {
        const sessionData = await this.redis.get(key, 'session');
        if (sessionData && sessionData.userId === userId) {
          sessions.push({
            sessionId: key,
            ...sessionData
          });
        }
      }

      // Search memory sessions
      for (const [sessionId, sessionData] of this.memoryStore.entries()) {
        if (sessionData.userId === userId) {
          sessions.push({
            sessionId,
            ...sessionData
          });
        }
      }

      return sessions;

    } catch (error) {
      this.logger.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   * @returns {Promise<number>} Number of cleaned sessions
   */
  async cleanupExpiredSessions() {
    try {
      let cleanedCount = 0;

      // Clean Redis sessions (Redis handles TTL automatically)
      // Clean memory sessions
      const now = Date.now();

      for (const [sessionId, sessionData] of this.memoryStore.entries()) {
        const createdAt = new Date(sessionData.createdAt).getTime();
        const ageInMs = now - createdAt;

        if (ageInMs > this.config.ttl * 1000) {
          this.memoryStore.delete(sessionId);

          if (this.sessionTimers.has(sessionId)) {
            clearTimeout(this.sessionTimers.get(sessionId));
            this.sessionTimers.delete(sessionId);
          }

          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.info(`Cleaned ${cleanedCount} expired sessions from memory`);
      }

      return cleanedCount;

    } catch (error) {
      this.logger.error('Session cleanup failed:', error);
      return 0;
    }
  }

  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const randomBytes = Math.random().toString(36).substring(2, 15);
    const moreRandomBytes = Math.random().toString(36).substring(2, 15);
    return `sess_${timestamp}_${randomBytes}${moreRandomBytes}`;
  }

  /**
   * Set memory expiration timer
   * @param {string} sessionId - Session ID
   * @param {number} ttlMs - TTL in milliseconds
   */
  setMemoryExpiration(sessionId, ttlMs) {
    // Clear existing timer
    if (this.sessionTimers.has(sessionId)) {
      clearTimeout(this.sessionTimers.get(sessionId));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.memoryStore.delete(sessionId);
      this.sessionTimers.delete(sessionId);
      this.logger.debug('Memory session expired', {
        sessionId: sessionId.substring(0, 8) + '...'
      });
    }, ttlMs);

    this.sessionTimers.set(sessionId, timer);
  }

  /**
   * Start periodic memory cleanup
   */
  startMemoryCleanup() {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 300000); // Clean every 5 minutes
  }

  /**
   * Update response time metrics
   * @param {number} startTime - Request start time
   */
  updateResponseTime(startTime) {
    const responseTime = Date.now() - startTime;
    this.metrics.responseTimes.push(responseTime);

    // Keep only last N response times to prevent memory growth
    if (this.metrics.responseTimes.length > this.config.metricsWindowSize) {
      this.metrics.responseTimes.shift();
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    const responseTimes = this.metrics.responseTimes;
    const totalRequests = this.metrics.sessionCreated + this.metrics.sessionRetrieved;
    const cacheHitRate = totalRequests > 0 ? (this.metrics.cacheHits / totalRequests) * 100 : 0;
    const redisHitRate = this.metrics.redisMisses > 0 ?
      (this.metrics.redisHits / (this.metrics.redisHits + this.metrics.redisMisses)) * 100 : 0;

    return {
      sessions: {
        created: this.metrics.sessionCreated,
        retrieved: this.metrics.sessionRetrieved,
        active: this.memoryStore.size
      },
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRate: Math.round(cacheHitRate * 100) / 100
      },
      redis: {
        hits: this.metrics.redisHits,
        misses: this.metrics.redisMisses,
        hitRate: Math.round(redisHitRate * 100) / 100,
        connected: this.redis.isConnected()
      },
      performance: {
        averageResponseTime: responseTimes.length > 0 ?
          Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100) / 100 : 0,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        recentRequests: responseTimes.length
      },
      errors: this.metrics.errors,
      uptime: Date.now() - this.metrics.startTime
    };
  }

  /**
   * Get session manager status with enhanced metrics
   * @returns {Object} Status information
   */
  getStatus() {
    const baseStatus = {
      totalSessions: this.memoryStore.size,
      redisConnected: this.redis.isConnected(),
      memoryUsage: process.memoryUsage(),
      uptime: Date.now() - this.startTime,
      config: {
        ttl: this.config.ttl,
        cleanupInterval: this.config.cleanupInterval,
        maxSessions: this.config.maxSessions
      }
    };

    // Add performance metrics
    const performanceMetrics = this.getPerformanceMetrics();

    return {
      ...baseStatus,
      metrics: performanceMetrics,
      health: {
        status: this.redis.isConnected() ? 'healthy' : 'degraded',
        issues: [
          ...(this.redis.isConnected() ? [] : ['Redis connection unavailable']),
          ...(performanceMetrics.errors > 10 ? ['High error rate detected'] : []),
          ...(performanceMetrics.performance.averageResponseTime > 100 ? ['Slow response times detected'] : [])
        ]
      }
    };
  }
}