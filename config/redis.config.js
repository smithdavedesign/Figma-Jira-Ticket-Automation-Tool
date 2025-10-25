/**
 * Redis Configuration
 *
 * Configuration for Redis persistence layer including
 * connection settings, caching strategies, and session management.
 */

export const redisConfig = {
  // Connection settings
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: 100,
    retryDelayOnClusterDown: 300,
    retryDelayOnConnect: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 10000,
    commandTimeout: 5000,
    family: 4 // Use IPv4
  },

  // Caching strategies
  cache: {
    // Template cache settings
    templates: {
      prefix: 'template:',
      ttl: 3600, // 1 hour
      maxSize: 1000
    },

    // Figma data cache
    figmaData: {
      prefix: 'figma:',
      ttl: 1800, // 30 minutes
      maxSize: 500
    },

    // AI analysis cache
    aiAnalysis: {
      prefix: 'ai:',
      ttl: 7200, // 2 hours
      maxSize: 200
    },

    // Component analysis cache
    componentAnalysis: {
      prefix: 'component:',
      ttl: 3600, // 1 hour
      maxSize: 1000
    }
  },

  // Session management
  sessions: {
    prefix: 'session:',
    ttl: 86400, // 24 hours
    maxSessions: 10000
  },

  // Rate limiting
  rateLimiting: {
    prefix: 'rate:',
    windowMs: 900000, // 15 minutes
    maxRequests: 100
  },

  // User data storage
  userData: {
    prefix: 'user:',
    ttl: 604800, // 1 week
    maxUsers: 50000
  },

  // Health check settings
  healthCheck: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 5000
  },

  // Environment-specific settings
  development: {
    keyPrefix: 'dev:figma-ai:',
    flushOnStart: false,
    showDebugLogs: true
  },

  production: {
    keyPrefix: 'prod:figma-ai:',
    flushOnStart: false,
    showDebugLogs: false,
    persistence: true,
    backup: {
      enabled: true,
      interval: 3600000 // 1 hour
    }
  }
};