/**
 * Redis Client - Data Layer
 *
 * Provides Redis connectivity with graceful fallback to memory-only mode.
 * Handles connection management, health checks, and basic operations.
 */

import Redis from 'ioredis';
import { Logger } from '../utils/logger.js';

export class RedisClient {
  constructor() {
    this.logger = new Logger('RedisClient');
    this.client = null;
    this.connected = false;
    this.config = this.getRedisConfig();

    // Hybrid caching: In-memory fallback cache
    this.memoryCache = new Map();
    this.cleanupInterval = 60000; // 1 minute
    this.cleanupTimer = null;
    this.startMemoryCleanup();
  }

  /**
   * Get Redis configuration from environment or defaults
   */
  getRedisConfig() {
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB) || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: false,
      connectionName: 'figma-ticket-generator',
      // Graceful degradation settings
      enableOfflineQueue: true,
      connectTimeout: 5000,
      commandTimeout: 3000
    };
  }

  /**
   * Connect to Redis server
   * @returns {Promise<boolean>} - True if connected, false if fallback to memory mode
   */
  async connect() {
    try {
      this.logger.info('🔗 Attempting Redis connection...');

      // Check if Redis is available by attempting connection
      this.client = new Redis(this.config);

      // Test connection with ping
      await this.client.ping();

      this.connected = true;
      this.logger.info(`✅ Redis connected: ${this.config.host}:${this.config.port}`);

      // Set up event handlers
      this.setupEventHandlers();

      return true;

    } catch (error) {
      this.logger.warn('⚠️ Redis connection failed, falling back to memory mode:', error.message);

      // Clean up failed connection attempt
      if (this.client) {
        try {
          await this.client.disconnect();
        } catch (error) {
          // Ignore disconnect errors during cleanup
        }
        this.client = null;
      }

      this.connected = false;
      return false;
    }
  }

  /**
   * Set up Redis event handlers
   */
  setupEventHandlers() {
    if (!this.client) {return;}

    this.client.on('connect', () => {
      this.logger.info('📡 Redis connection established');
      this.connected = true;
    });

    this.client.on('ready', () => {
      this.logger.info('🚀 Redis client ready');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Redis error:', error.message);
      this.connected = false;
    });

    this.client.on('close', () => {
      this.logger.warn('🔌 Redis connection closed');
      this.connected = false;
    });

    this.client.on('reconnecting', () => {
      this.logger.info('🔄 Redis reconnecting...');
    });
  }

  /**
   * Disconnect from Redis and cleanup
   */
  async disconnect() {
    if (this.client && this.connected) {
      try {
        await this.client.quit();
        this.logger.info('👋 Redis disconnected gracefully');
      } catch (error) {
        this.logger.error('Error during Redis disconnect:', error);
      }
    }

    this.client = null;
    this.connected = false;

    // Clean up memory cache
    this.destroyMemoryCache();
  }

  /**
   * Check Redis health
   * @returns {Object} Health status object
   */
  async healthCheck() {
    if (!this.connected || !this.client) {
      return {
        status: 'disconnected',
        connected: false,
        message: 'Redis client not connected',
        config: {
          host: this.config.host,
          port: this.config.port,
          db: this.config.db
        }
      };
    }

    try {
      const start = Date.now();
      const pong = await this.client.ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        connected: true,
        latency: `${latency}ms`,
        response: pong,
        config: {
          host: this.config.host,
          port: this.config.port,
          db: this.config.db
        }
      };

    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error.message,
        config: {
          host: this.config.host,
          port: this.config.port,
          db: this.config.db
        }
      };
    }
  }

  /**
   * Set a key-value pair with hybrid caching
   * @param {string} key - The key
   * @param {any} value - The value to store
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = null) {
    const effectiveTTL = ttl || 3600; // Default 1 hour

    // Always set in memory cache for fast access
    const memoryTTL = Math.min(effectiveTTL, 300); // Max 5 minutes in memory
    this.setMemoryCache(key, value, memoryTTL);

    // Try Redis for persistence
    if (this.connected && this.client) {
      try {
        const serializedValue = JSON.stringify(value);

        if (ttl) {
          await this.client.setex(key, ttl, serializedValue);
        } else {
          await this.client.set(key, serializedValue);
        }

        this.logger.debug(`💾 Hybrid cache SET: ${key} (Redis + Memory)`);
        return true;
      } catch (error) {
        this.logger.error('Redis SET error, using memory only:', error);
        return true; // Still success because we have memory cache
      }
    } else {
      this.logger.debug(`🧠 Memory cache SET: ${key} (Redis unavailable)`);
      return true; // Memory cache fallback
    }
  } /**
   * Get a value by key with hybrid caching
   * @param {string} key - The key
   * @returns {Promise<any>} - The parsed value or null
   */
  async get(key) {
    // Try memory cache first (fastest)
    const memoryResult = this.getMemoryCache(key);
    if (memoryResult !== null) {
      this.logger.debug(`🧠 Memory cache HIT: ${key}`);
      return memoryResult;
    }

    // Try Redis for persistent data
    if (this.connected && this.client) {
      try {
        const value = await this.client.get(key);
        if (value) {
          const parsedValue = JSON.parse(value);

          // Restore to memory cache for next access
          this.setMemoryCache(key, parsedValue, 300); // 5 minutes

          this.logger.debug(`💾 Redis cache HIT: ${key} (restored to memory)`);
          return parsedValue;
        }
      } catch (error) {
        this.logger.error('Redis GET error:', error);
      }
    }

    this.logger.debug(`❌ Cache MISS: ${key}`);
    return null;
  }

  /**
   * Delete a key
   * @param {string} key - The key to delete
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    if (!this.connected || !this.client) {
      this.logger.warn('Redis not connected, operation skipped:', key);
      return false;
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error('Redis DEL error:', error);
      return false;
    }
  }

  /**
   * Check if a key exists
   * @param {string} key - The key
   * @returns {Promise<boolean>} - True if key exists
   */
  async exists(key) {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Get all keys matching a pattern
   * @param {string} pattern - Key pattern (e.g., "session:*")
   * @returns {Promise<string[]>} - Array of matching keys
   */
  async keys(pattern) {
    if (!this.connected || !this.client) {
      return [];
    }

    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error('Redis KEYS error:', error);
      return [];
    }
  }

  /**
   * Set expiration time for a key
   * @param {string} key - The key
   * @param {number} seconds - Expiration time in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async expire(key, seconds) {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      this.logger.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  /**
   * Get Redis info
   * @returns {Promise<Object>} - Redis server info
   */
  async info() {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const info = await this.client.info();
      return this.parseRedisInfo(info);
    } catch (error) {
      this.logger.error('Redis INFO error:', error);
      return null;
    }
  }

  /**
   * Parse Redis INFO command output
   * @param {string} infoString - Raw info string
   * @returns {Object} - Parsed info object
   */
  parseRedisInfo(infoString) {
    const info = {};
    const sections = infoString.split('\r\n\r\n');

    sections.forEach(section => {
      const lines = section.split('\r\n');
      const sectionName = lines[0].replace('# ', '').toLowerCase();

      if (sectionName && lines.length > 1) {
        info[sectionName] = {};

        lines.slice(1).forEach(line => {
          if (line && line.includes(':')) {
            const [key, value] = line.split(':');
            info[sectionName][key] = value;
          }
        });
      }
    });

    return info;
  }

  /**
   * Get connection status
   * @returns {boolean} - True if connected
   */
  isConnected() {
    return this.connected && this.client && this.client.status === 'ready';
  }

  /**
   * Get Redis client instance (for advanced operations)
   * @returns {Redis|null} - Redis client or null if not connected
   */
  getClient() {
    return this.connected ? this.client : null;
  }

  // ==========================================
  // HYBRID CACHING: Memory Cache Fallback
  // ==========================================

  /**
   * Start memory cache cleanup timer
   */
  startMemoryCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.memoryCache.entries()) {
        if (now > entry.expires) {
          this.memoryCache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        this.logger.debug(`🧹 Memory cache cleanup: removed ${cleaned} expired entries`);
      }
    }, this.cleanupInterval);
  }

  /**
   * Stop memory cache cleanup and clear memory
   */
  destroyMemoryCache() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.memoryCache.clear();
    this.logger.debug('🗑️ Memory cache destroyed');
  }

  /**
   * Set data in memory cache with TTL
   */
  setMemoryCache(key, value, ttl = 300) {
    const expires = Date.now() + (ttl * 1000);
    this.memoryCache.set(key, { data: value, expires });
  }

  /**
   * Get data from memory cache
   */
  getMemoryCache(key) {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Delete from memory cache
   */
  deleteMemoryCache(key) {
    return this.memoryCache.delete(key);
  }

  /**
   * Get memory cache stats
   */
  getMemoryCacheStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;

    for (const [, entry] of this.memoryCache.entries()) {
      if (now > entry.expires) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.memoryCache.size,
      active,
      expired,
      memoryUsage: this.memoryCache.size * 100 // rough estimate
    };
  }
}