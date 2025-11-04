/**
 * 📝 Logging Usage Examples
 * How to use the comprehensive logging system across the application
 */

// ========================================
// 1. BASIC USAGE
// ========================================

import logger from '../../core/logging/logger.js';
// OR import { logger, info, error } from '../../core/logging/index.js';

// Simple logging
logger.info('Server started successfully');
logger.error('Database connection failed');
logger.debug('Processing user request', { userId: 123 });

// ========================================
// 2. EXPRESS SERVER INTEGRATION
// ========================================

import express from 'express';
import { requestLogger, errorLogger, performanceLogger } from '../../core/logging/index.js';

const app = express();

// Add logging middleware
app.use(requestLogger); // Log all requests/responses
app.use(performanceLogger); // Track response times
app.use(errorLogger); // Log errors

// ========================================
// 3. MCP SERVER USAGE
// ========================================

export class MCPServer {
  async handleRequest(method, params) {
    logger.startTimer(`mcp_${method}`);

    try {
      logger.info('🔄 MCP Request', {
        method,
        paramsSize: JSON.stringify(params).length
      });

      const result = await this.processRequest(method, params);

      logger.endTimer(`mcp_${method}`, {
        success: true,
        resultSize: JSON.stringify(result).length
      });

      return result;
    } catch (error) {
      logger.endTimer(`mcp_${method}`, { success: false });
      logger.logError(error, { method, params });
      throw error;
    }
  }
}

// ========================================
// 4. AI SERVICE INTEGRATION
// ========================================

import { logAIServiceCall } from '../../core/logging/index.js';

export class AIService {
  async callGemini(prompt) {
    const startTime = Date.now();

    logger.logAIRequest('gemini', prompt, {
      modelVersion: 'gemini-pro',
      temperature: 0.7
    });

    try {
      const response = await this.makeRequest(prompt);
      logAIServiceCall('gemini', 'generate', startTime, response);
      return response;
    } catch (error) {
      logAIServiceCall('gemini', 'generate', startTime, null, error);
      throw error;
    }
  }
}

// ========================================
// 5. REDIS/STORAGE OPERATIONS
// ========================================

import { logRedisOperation } from '../../core/logging/index.js';

export class StorageService {
  async set(key, value) {
    try {
      const result = await this.redis.set(key, JSON.stringify(value));
      logRedisOperation('SET', key, value);
      return result;
    } catch (error) {
      logRedisOperation('SET', key, value, error);
      throw error;
    }
  }
}

// ========================================
// 6. TEST EXECUTION LOGGING
// ========================================

import { logTestResult } from '../../core/logging/index.js';

export class TestRunner {
  async runTest(testName, testFn) {
    const startTime = Date.now();

    try {
      await testFn();
      logTestResult(testName, 'pass', startTime, { assertions: 5 });
    } catch (error) {
      logTestResult(testName, 'fail', startTime, {
        error: error.message,
        stack: error.stack
      });
    }
  }
}

// ========================================
// 7. SYSTEM HEALTH MONITORING
// ========================================

import { logSystemHealth } from '../../core/logging/index.js';

// Log system health every 5 minutes
setInterval(() => {
  logSystemHealth();
}, 5 * 60 * 1000);

// ========================================
// 8. CUSTOM CONTEXT LOGGING
// ========================================

// Helper function for demo
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export class PluginService {
  processFrames(frames) {
    const sessionId = generateSessionId();

    logger.info('🎨 Processing Figma frames', {
      sessionId,
      frameCount: frames.length,
      totalSize: frames.reduce((sum, f) => sum + f.width * f.height, 0),
      documentId: frames[0]?.documentId
    });

    frames.forEach((frame, index) => {
      logger.debug('Processing frame', {
        sessionId,
        frameIndex: index,
        frameName: frame.name,
        frameSize: `${frame.width}x${frame.height}`
      });
    });
  }
}

// ========================================
// 9. ENVIRONMENT-BASED CONFIGURATION
// ========================================

// In production: LOG_LEVEL=WARN LOG_TO_FILE=true
// In development: LOG_LEVEL=DEBUG LOG_TO_FILE=false
// In testing: LOG_LEVEL=ERROR LOG_TO_FILE=false

export default {
  // Re-export for convenience
  info: (msg, ctx) => logger.info(msg, ctx),
  error: (msg, ctx) => logger.error(msg, ctx),
  debug: (msg, ctx) => logger.debug(msg, ctx),
  warn: (msg, ctx) => logger.warn(msg, ctx)
};