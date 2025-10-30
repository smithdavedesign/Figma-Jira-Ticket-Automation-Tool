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
    this.config = redisConfig.sessions;

    // In-memory fallback for sessions when Redis is unavailable
    this.memoryStore = new Map();
    this.sessionTimers = new Map();
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
  async createSession(userId, userData = {}) {
    try {
      const sessionId = this.generateSessionId();
      const sessionData = {
        userId,
        userData,
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        userAgent: userData.userAgent || null,
        ipAddress: userData.ipAddress || null
      };

      // Store in Redis or memory
      const stored = await this.redis.set(
        sessionId,
        sessionData,
        this.config.ttl,
        'session'
      );

      if (!stored) {
        // Fallback to memory storage
        this.memoryStore.set(sessionId, sessionData);
        this.setMemoryExpiration(sessionId, this.config.ttl * 1000);
      }

      this.logger.info('Session created', {
        sessionId: sessionId.substring(0, 8) + '...',
        userId,
        storage: stored ? 'redis' : 'memory'
      });

      return sessionId;

    } catch (error) {
      this.errorHandler.handleToolError('session_manager', error, { userId });
    }
  }

  /**
   * Get session data
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>} Session data or null
   */
  async getSession(sessionId) {
    try {
      if (!sessionId) {
        return null;
      }

      // Try Redis first
      let sessionData = await this.redis.get(sessionId, 'session');

      // Fallback to memory
      if (!sessionData && this.memoryStore.has(sessionId)) {
        sessionData = this.memoryStore.get(sessionId);
      }

      if (!sessionData) {
        this.logger.debug('Session not found', { sessionId: sessionId.substring(0, 8) + '...' });
        return null;
      }

      // Update last accessed time
      sessionData.lastAccessedAt = new Date().toISOString();
      await this.updateSession(sessionId, sessionData);

      this.logger.debug('Session retrieved', {
        sessionId: sessionId.substring(0, 8) + '...',
        userId: sessionData.userId
      });

      return sessionData;

    } catch (error) {
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
   * Get session manager status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      redisConnected: this.redis.isConnected,
      memorySessions: this.memoryStore.size,
      activeTimers: this.sessionTimers.size,
      config: {
        ttl: this.config.ttl,
        maxSessions: this.config.maxSessions
      }
    };
  }
}