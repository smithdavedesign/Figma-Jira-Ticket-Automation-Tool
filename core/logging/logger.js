/**
 * 🪵 Comprehensive Logging System
 * Professional logging with structured output, performance tracking, and multiple levels
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor() {
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };

    this.colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
      CRITICAL: '\x1b[35m', // Magenta
      RESET: '\x1b[0m'
    };

    this.currentLevel = process.env.LOG_LEVEL || 'INFO';
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logFile = path.join(__dirname, '../../logs/system.log');
    this.requestLogFile = path.join(__dirname, '../../logs/requests.log');
    this.performanceLogFile = path.join(__dirname, '../../logs/performance.log');

    this.initializeLogDirectory();
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.requestCounter = 0;
    this.performanceMetrics = new Map();

    // Log system startup
    this.info('🚀 Logger initialized', {
      sessionId: this.sessionId,
      logLevel: this.currentLevel,
      logToFile: this.logToFile,
      timestamp: new Date().toISOString()
    });
  }

  initializeLogDirectory() {
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  shouldLog(level) {
    return this.levels[level] >= this.levels[this.currentLevel];
  }

  formatLogEntry(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const sessionInfo = {
      sessionId: this.sessionId,
      uptime: Date.now() - this.startTime,
      requestCount: this.requestCounter
    };

    return {
      timestamp,
      level,
      message,
      context: { ...context, ...sessionInfo },
      pid: process.pid,
      memory: process.memoryUsage()
    };
  }

  writeToConsole(level, formattedEntry) {
    const color = this.colors[level] || this.colors.RESET;
    const resetColor = this.colors.RESET;

    console.log(
      `${color}[${formattedEntry.timestamp}] ${level}${resetColor} ${formattedEntry.message}`,
      formattedEntry.context
    );
  }

  writeToFile(formattedEntry, filename = this.logFile) {
    if (!this.logToFile) {return;}

    try {
      const logLine = JSON.stringify(formattedEntry) + '\n';
      fs.appendFileSync(filename, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  log(level, message, context = {}) {
    if (!this.shouldLog(level)) {return;}

    const formattedEntry = this.formatLogEntry(level, message, context);

    this.writeToConsole(level, formattedEntry);
    this.writeToFile(formattedEntry);

    // Also write to specific log files based on context
    if (context.type === 'request') {
      this.writeToFile(formattedEntry, this.requestLogFile);
    } else if (context.type === 'performance') {
      this.writeToFile(formattedEntry, this.performanceLogFile);
    }
  }

  debug(message, context = {}) {
    this.log('DEBUG', message, context);
  }

  info(message, context = {}) {
    this.log('INFO', message, context);
  }

  warn(message, context = {}) {
    this.log('WARN', message, context);
  }

  error(message, context = {}) {
    this.log('ERROR', message, context);
  }

  critical(message, context = {}) {
    this.log('CRITICAL', message, context);
  }

  // Request/Response Logging
  logRequest(req, context = {}) {
    this.requestCounter++;
    const requestId = `req_${this.requestCounter}_${Date.now()}`;

    this.info('📥 Incoming Request', {
      type: 'request',
      requestId,
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      ...context
    });

    return requestId;
  }

  logResponse(requestId, res, responseTime, context = {}) {
    this.info('📤 Outgoing Response', {
      type: 'request',
      requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      headers: res.getHeaders(),
      ...context
    });
  }

  // Performance Tracking
  startTimer(label) {
    const startTime = process.hrtime.bigint();
    this.performanceMetrics.set(label, startTime);

    this.debug('⏱️ Timer Started', {
      type: 'performance',
      label,
      startTime: startTime.toString()
    });

    return label;
  }

  endTimer(label, context = {}) {
    const startTime = this.performanceMetrics.get(label);
    if (!startTime) {
      this.warn('⏱️ Timer Not Found', { label });
      return null;
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    this.performanceMetrics.delete(label);

    this.info('⏱️ Timer Completed', {
      type: 'performance',
      label,
      duration: `${duration.toFixed(2)}ms`,
      ...context
    });

    return duration;
  }

  // System Health Monitoring
  logSystemHealth() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    this.info('💊 System Health Check', {
      type: 'health',
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      sessionUptime: Date.now() - this.startTime,
      requestCount: this.requestCounter
    });
  }

  // Error Tracking
  logError(error, context = {}) {
    this.error('💥 Error Occurred', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      ...context
    });
  }

  // AI Service Integration Logging
  logAIRequest(service, prompt, context = {}) {
    this.info('🤖 AI Request', {
      type: 'ai',
      service,
      promptLength: prompt?.length || 0,
      promptPreview: prompt?.substring(0, 100) + '...',
      ...context
    });
  }

  logAIResponse(service, response, responseTime, context = {}) {
    this.info('🤖 AI Response', {
      type: 'ai',
      service,
      responseTime: `${responseTime}ms`,
      responseLength: response?.length || 0,
      success: !!response,
      ...context
    });
  }

  // Redis/Storage Logging
  logStorageOperation(operation, key, context = {}) {
    this.debug('💾 Storage Operation', {
      type: 'storage',
      operation,
      key,
      ...context
    });
  }

  // Test Execution Logging
  logTestExecution(testName, result, duration, context = {}) {
    const level = result === 'pass' ? 'INFO' : result === 'fail' ? 'ERROR' : 'WARN';

    this.log(level, `🧪 Test ${result.toUpperCase()}: ${testName}`, {
      type: 'test',
      testName,
      result,
      duration: `${duration}ms`,
      ...context
    });
  }

  // Log Rotation
  rotateLogs() {
    const timestamp = new Date().toISOString().split('T')[0];
    const files = [this.logFile, this.requestLogFile, this.performanceLogFile];

    files.forEach(file => {
      if (fs.existsSync(file)) {
        const rotatedFile = file.replace('.log', `_${timestamp}.log`);
        fs.renameSync(file, rotatedFile);
        this.info('📁 Log Rotated', { from: file, to: rotatedFile });
      }
    });
  }

  // Export logs for analysis
  exportLogs(startDate, endDate) {
    // Implementation for log export/analysis
    this.info('📊 Log Export Requested', {
      type: 'export',
      startDate,
      endDate
    });
  }

  // Cleanup old logs
  cleanupOldLogs(daysToKeep = 30) {
    const logsDir = path.join(__dirname, '../../logs');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const files = fs.readdirSync(logsDir);
      let cleanedCount = 0;

      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      });

      this.info('🧹 Log Cleanup Completed', {
        type: 'maintenance',
        daysToKeep,
        filesRemoved: cleanedCount
      });
    } catch (error) {
      this.error('🧹 Log Cleanup Failed', { error: error.message });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Export both the class and instance
export { Logger, logger };
export default logger;