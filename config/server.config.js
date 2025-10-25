/**
 * Server Configuration
 *
 * Central configuration for the MCP server including ports,
 * CORS settings, and environment-specific options.
 */

export const serverConfig = {
  // Server settings
  defaultPort: 3000,
  host: 'localhost',

  // Environment
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',

  // CORS settings
  cors: {
    enabled: true,
    origins: ['*'], // In production, specify exact origins
    methods: ['GET', 'POST', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization']
  },

  // Request limits
  requestLimits: {
    maxBodySize: '10mb',
    timeout: 30000, // 30 seconds
    maxConcurrentRequests: 100
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enabled: true,
    includeTimestamp: true,
    includeLevel: true
  },

  // Health check
  healthCheck: {
    enabled: true,
    includeSystemInfo: true,
    includeMemoryUsage: true
  }
};