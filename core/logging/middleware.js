/**
 * 🚀 Express Logging Middleware
 * Integrates comprehensive logging with Express.js server
 */

import logger from './logger.js';

// Request logging middleware
export function requestLogger(req, res, next) {
  const startTime = Date.now();
  const requestId = logger.logRequest(req);

  // Store requestId for later use
  req.requestId = requestId;
  req.startTime = startTime;

  // Intercept response to log completion
  const originalSend = res.send;
  const originalJson = res.json;

  res.send = function(body) {
    const responseTime = Date.now() - startTime;
    logger.logResponse(requestId, res, responseTime, {
      bodySize: Buffer.byteLength(body || '', 'utf8')
    });
    return originalSend.call(this, body);
  };

  res.json = function(obj) {
    const responseTime = Date.now() - startTime;
    logger.logResponse(requestId, res, responseTime, {
      bodySize: JSON.stringify(obj).length,
      responseType: 'json'
    });
    return originalJson.call(this, obj);
  };

  next();
}

// Error logging middleware
export function errorLogger(err, req, res, next) {
  logger.logError(err, {
    requestId: req.requestId,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  next(err);
}

// Performance monitoring middleware
export function performanceLogger(req, res, next) {
  const timerLabel = `request_${req.requestId || Date.now()}`;
  logger.startTimer(timerLabel);

  res.on('finish', () => {
    logger.endTimer(timerLabel, {
      statusCode: res.statusCode,
      method: req.method,
      url: req.url
    });
  });

  next();
}

// Health check endpoint middleware
export function healthCheckLogger(req, res, next) {
  if (req.path === '/health' || req.path === '/') {
    logger.logSystemHealth();
  }
  next();
}

// AI service logging helper
export function logAIServiceCall(service, operation, startTime, response, error = null) {
  const duration = Date.now() - startTime;

  if (error) {
    logger.error(`🤖 AI Service Error: ${service}`, {
      type: 'ai',
      service,
      operation,
      duration: `${duration}ms`,
      error: error.message
    });
  } else {
    logger.logAIResponse(service, response, duration, { operation });
  }
}

// Redis operation logging helper
export function logRedisOperation(operation, key, value = null, error = null) {
  if (error) {
    logger.error(`💾 Redis Error: ${operation}`, {
      type: 'storage',
      operation,
      key,
      error: error.message
    });
  } else {
    logger.logStorageOperation(operation, key, {
      valueSize: value ? JSON.stringify(value).length : 0,
      success: true
    });
  }
}

// Test execution logging helper
export function logTestResult(testName, result, startTime, details = {}) {
  const duration = Date.now() - startTime;
  logger.logTestExecution(testName, result, duration, details);
}

export default {
  requestLogger,
  errorLogger,
  performanceLogger,
  healthCheckLogger,
  logAIServiceCall,
  logRedisOperation,
  logTestResult
};