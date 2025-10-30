/**
 * Logger Utility
 *
 * Centralized logging system for the MCP server with
 * different log levels and formatting.
 */

import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export class Logger {
  /**
   * Create a logger instance
   * @param {string} context - Logger context (e.g., 'MCPServer', 'ToolExecutor')
   */
  constructor(context = 'Default') {
    this.context = context;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    // Get log level from environment or default to 'info'
    this.currentLevel = this.levels[process.env.LOG_LEVEL] ?? this.levels.info;

    // Configure file logging
    this.logToFile = process.env.LOG_TO_FILE !== 'false'; // Default: true
    this.logDir = process.env.LOG_DIR || join(process.cwd(), 'logs');
    this.logFile = join(this.logDir, 'server.log');

    // Ensure log directory exists
    this.ensureLogDir();
  }

  /**
   * Ensure log directory exists
   */
  async ensureLogDir() {
    if (this.logToFile && !existsSync(this.logDir)) {
      try {
        await mkdir(this.logDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create log directory:', error);
        this.logToFile = false;
      }
    }
  }

  /**
   * Format log message with timestamp and context
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any} data - Additional data to log
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);
    const contextFormatted = `[${this.context}]`;

    let logMessage = `${timestamp} ${levelUpper} ${contextFormatted} ${message}`;

    if (data !== null) {
      if (typeof data === 'object') {
        logMessage += '\n' + JSON.stringify(data, null, 2);
      } else {
        logMessage += ` ${data}`;
      }
    }

    return logMessage;
  }

  /**
   * Write log to file if file logging is enabled
   * @param {string} logMessage - Formatted log message
   */
  async writeToFile(logMessage) {
    if (this.logToFile) {
      try {
        await appendFile(this.logFile, logMessage + '\n');
      } catch (error) {
        // Fallback to console if file write fails
        console.error('Failed to write to log file:', error);
      }
    }
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {any} data - Error data or object
   */
  error(message, data = null) {
    if (this.currentLevel >= this.levels.error) {
      const logMessage = this.formatMessage('error', message, data);
      console.error(logMessage);
      this.writeToFile(logMessage);
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {any} data - Warning data
   */
  warn(message, data = null) {
    if (this.currentLevel >= this.levels.warn) {
      const logMessage = this.formatMessage('warn', message, data);
      console.warn(logMessage);
      this.writeToFile(logMessage);
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {any} data - Info data
   */
  info(message, data = null) {
    if (this.currentLevel >= this.levels.info) {
      const logMessage = this.formatMessage('info', message, data);
      console.log(logMessage);
      this.writeToFile(logMessage);
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {any} data - Debug data
   */
  debug(message, data = null) {
    if (this.currentLevel >= this.levels.debug) {
      const logMessage = this.formatMessage('debug', message, data);
      console.log(logMessage);
      this.writeToFile(logMessage);
    }
  }

  /**
   * Create a child logger with extended context
   * @param {string} childContext - Additional context
   * @returns {Logger} New logger instance
   */
  child(childContext) {
    return new Logger(`${this.context}:${childContext}`);
  }

  /**
   * Log performance timing
   * @param {string} operation - Operation name
   * @param {number} startTime - Start time from performance.now()
   */
  timing(operation, startTime) {
    const duration = performance.now() - startTime;
    this.info(`⏱️ ${operation} completed in ${duration.toFixed(2)}ms`);
  }

  /**
   * Log API call information
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} statusCode - Response status code
   * @param {number} duration - Request duration in ms
   */
  apiCall(method, url, statusCode, duration) {
    const statusEmoji = statusCode >= 200 && statusCode < 300 ? '✅' : '❌';
    this.info(`${statusEmoji} ${method} ${url} - ${statusCode} (${duration}ms)`);
  }
}