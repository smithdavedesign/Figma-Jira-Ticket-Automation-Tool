/**
 * 🪵 Logging System Exports
 * Clean interface for the comprehensive logging system
 */

// Main logger instance (singleton)
export { Logger, logger } from './logger.js';

// Express middleware
export {
  requestLogger,
  errorLogger,
  performanceLogger,
  healthCheckLogger,
  logAIServiceCall,
  logRedisOperation,
  logTestResult
} from './middleware.js';

// Log levels for external configuration
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

// Utility functions
export const createLogger = (options = {}) => {
  return new Logger(options);
};

// Quick logging functions for convenience
import logger, { Logger } from './logger.js';
export const debug = (message, context) => logger.debug(message, context);
export const info = (message, context) => logger.info(message, context);
export const warn = (message, context) => logger.warn(message, context);
export const error = (message, context) => logger.error(message, context);
export const critical = (message, context) => logger.critical(message, context);

// Performance helpers
export const startTimer = (label) => logger.startTimer(label);
export const endTimer = (label, context) => logger.endTimer(label, context);

// System health
export const logSystemHealth = () => logger.logSystemHealth();

export default logger;