/**
 * 🧪 Logging System Test
 * Quick verification that the comprehensive logging system works
 */

import logger from '../../core/logging/logger.js';
import { info, error, debug, warn, startTimer, endTimer } from '../../core/logging/index.js';

console.log('🚀 Testing Comprehensive Logging System...\n');

// Test 1: Basic logging levels
console.log('📝 Test 1: Basic Logging Levels');
logger.debug('This is a debug message', { testId: 1 });
logger.info('This is an info message', { testId: 1 });
logger.warn('This is a warning message', { testId: 1 });
logger.error('This is an error message', { testId: 1 });
logger.critical('This is a critical message', { testId: 1 });

console.log('\n📝 Test 2: Convenience Functions');
info('Using convenience info function', { feature: 'convenience' });
error('Using convenience error function', { feature: 'convenience' });
debug('Using convenience debug function', { feature: 'convenience' });
warn('Using convenience warn function', { feature: 'convenience' });

console.log('\n📝 Test 3: Performance Timing');
const timer1 = startTimer('test_operation');
// Simulate some work
await new Promise(resolve => setTimeout(resolve, 100));
endTimer('test_operation', { operationType: 'simulation' });

console.log('\n📝 Test 4: System Health Check');
logger.logSystemHealth();

console.log('\n📝 Test 5: AI Service Logging');
logger.logAIRequest('gemini', 'Generate a test response for logging', { model: 'gemini-pro' });
logger.logAIResponse('gemini', 'This is a mock AI response', 250, { tokens: 15 });

console.log('\n📝 Test 6: Storage Operation Logging');
logger.logStorageOperation('SET', 'test:key', { value: 'test data', size: 20 });
logger.logStorageOperation('GET', 'test:key', { found: true, size: 20 });

console.log('\n📝 Test 7: Test Execution Logging');
logger.logTestExecution('sample_test', 'pass', 150, { assertions: 3 });
logger.logTestExecution('failing_test', 'fail', 75, { error: 'Expected true but got false' });

console.log('\n📝 Test 8: Error Logging');
try {
  throw new Error('Test error for logging');
} catch (error) {
  logger.logError(error, { context: 'testing', severity: 'expected' });
}

console.log('\n📝 Test 9: Multiple Context Data');
logger.info('Complex context logging', {
  user: { id: 123, name: 'test_user' },
  request: { method: 'POST', url: '/api/test' },
  performance: { duration: 45, memory: '23MB' },
  metadata: { version: '1.0.0', build: 'test' }
});

console.log('\n✅ Logging system test completed!');
console.log('📁 Check the logs/ directory for file output (if LOG_TO_FILE=true)');
console.log('🎯 Review console output above for structured logging format');

export default true;