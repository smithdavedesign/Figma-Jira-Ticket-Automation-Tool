#!/usr/bin/env node

/**
 * 🧪 Enhanced Test Runner with Express Logging Integration
 * 
 * Integrates with our Express middleware logging system to provide
 * comprehensive test execution monitoring and result tracking.
 */

import { spawn } from 'child_process';
import { logTestResult } from '../core/logging/middleware.js';
import logger from '../core/logging/logger.js';

class EnhancedTestRunner {
  constructor() {
    this.results = new Map();
    this.currentTests = new Set();
  }

  /**
   * Run a test suite with full logging integration
   */
  async runTestSuite(suiteName, command, options = {}) {
    const startTime = Date.now();
    const testId = `${suiteName}_${startTime}`;
    
    logger.info('🧪 Starting test suite', { 
      suite: suiteName, 
      command, 
      testId 
    });

    this.currentTests.add(testId);

    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const testProcess = spawn(cmd, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: {
          ...process.env,
          TEST_SUITE_NAME: suiteName,
          TEST_ID: testId,
          TEST_LOGGING: 'true'
        }
      });

      let output = '';
      let errorOutput = '';
      let testStats = {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0
      };

      testProcess.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        
        // Parse test output for statistics
        this.parseTestOutput(message, testStats);
        
        // Log interesting lines
        message.split('\n').forEach(line => {
          if (this.isImportantLogLine(line)) {
            logger.info(`[${suiteName}] ${line.trim()}`);
          }
        });
      });

      testProcess.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        
        // Log errors immediately
        message.split('\n').forEach(line => {
          if (line.trim()) {
            logger.error(`[${suiteName}] ${line.trim()}`);
          }
        });
      });

      testProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        const success = code === 0;
        
        // Use our middleware logging helper
        logTestResult(suiteName, success ? 'PASSED' : 'FAILED', startTime, {
          exitCode: code,
          testStats,
          outputLength: output.length,
          errorLength: errorOutput.length,
          testId
        });

        const result = {
          success,
          duration,
          exitCode: code,
          testStats,
          output: output.slice(-5000), // Keep last 5KB
          error: errorOutput.slice(-2000), // Keep last 2KB
          timestamp: new Date().toISOString()
        };

        this.results.set(suiteName, result);
        this.currentTests.delete(testId);

        logger.info(`${success ? '✅' : '❌'} Test suite completed`, {
          suite: suiteName,
          duration: `${duration}ms`,
          passed: testStats.passed,
          failed: testStats.failed,
          total: testStats.total
        });

        resolve(result);
      });
    });
  }

  /**
   * Parse test output to extract statistics
   */
  parseTestOutput(output, stats) {
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Vitest format
      if (line.includes('Test Files') && line.includes('passed')) {
        const matches = line.match(/(\d+) passed/);
        if (matches) stats.passed = parseInt(matches[1]);
        
        const failedMatches = line.match(/(\d+) failed/);
        if (failedMatches) stats.failed = parseInt(failedMatches[1]);
      }
      
      // Jest format
      if (line.includes('Tests:')) {
        const passedMatch = line.match(/(\d+) passed/);
        if (passedMatch) stats.passed = parseInt(passedMatch[1]);
        
        const failedMatch = line.match(/(\d+) failed/);
        if (failedMatch) stats.failed = parseInt(failedMatch[1]);
        
        const skippedMatch = line.match(/(\d+) skipped/);
        if (skippedMatch) stats.skipped = parseInt(skippedMatch[1]);
      }
      
      // Playwright format
      if (line.includes('passing') || line.includes('failing')) {
        const numbers = line.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          if (line.includes('passing')) stats.passed = parseInt(numbers[0]);
          if (line.includes('failing')) stats.failed = parseInt(numbers[0]);
        }
      }
    }
    
    stats.total = stats.passed + stats.failed + stats.skipped;
  }

  /**
   * Check if a log line is important enough to log
   */
  isImportantLogLine(line) {
    const importantKeywords = [
      '✓', '✗', 'passed', 'failed', 'error', 'warning',
      'coverage', 'PASS', 'FAIL', 'ERROR', 'WARN',
      '🧪', '✅', '❌', '⚠️', '📊'
    ];
    
    return importantKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Run all configured test suites
   */
  async runAll() {
    logger.info('🚀 Running all test suites with enhanced logging...');
    
    const suites = [
      { name: 'unit', command: 'npm run test:run' },
      { name: 'integration', command: 'npm run test:mcp' },
      { name: 'browser-smoke', command: 'npm run test:browser:smoke' }
    ];

    const results = [];
    const startTime = Date.now();

    for (const suite of suites) {
      try {
        const result = await this.runTestSuite(suite.name, suite.command);
        results.push({ suite: suite.name, ...result });
      } catch (error) {
        logger.error(`Failed to run ${suite.name} tests`, { error: error.message });
        results.push({
          suite: suite.name,
          success: false,
          error: error.message,
          duration: 0
        });
      }
    }

    const totalDuration = Date.now() - startTime;
    const summary = this.generateSummary(results, totalDuration);
    
    this.displaySummary(summary);
    return summary;
  }

  /**
   * Generate test execution summary
   */
  generateSummary(results, totalDuration) {
    const summary = {
      timestamp: new Date().toISOString(),
      totalSuites: results.length,
      passedSuites: results.filter(r => r.success).length,
      failedSuites: results.filter(r => !r.success).length,
      totalDuration,
      totalTests: results.reduce((sum, r) => sum + (r.testStats?.total || 0), 0),
      passedTests: results.reduce((sum, r) => sum + (r.testStats?.passed || 0), 0),
      failedTests: results.reduce((sum, r) => sum + (r.testStats?.failed || 0), 0),
      results
    };

    // Log summary using our middleware
    logTestResult('ALL_SUITES', summary.failedSuites === 0 ? 'PASSED' : 'FAILED', 
      Date.now() - totalDuration, summary);

    return summary;
  }

  /**
   * Display test summary in terminal
   */
  displaySummary(summary) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              🧪 ENHANCED TEST EXECUTION SUMMARY            ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Total Suites: ${summary.totalSuites.toString().padEnd(8)} Total Tests: ${summary.totalTests.toString().padEnd(8)} Duration: ${(summary.totalDuration/1000).toFixed(1)}s${' '.repeat(8)} ║`);
    console.log(`║  Passed Suites: ${summary.passedSuites.toString().padEnd(7)} Passed Tests: ${summary.passedTests.toString().padEnd(7)} Success Rate: ${((summary.passedTests/summary.totalTests)*100).toFixed(1)}%${' '.repeat(6)} ║`);
    console.log(`║  Failed Suites: ${summary.failedSuites.toString().padEnd(7)} Failed Tests: ${summary.failedTests.toString().padEnd(7)} ${' '.repeat(20)} ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    
    summary.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const duration = `${(result.duration/1000).toFixed(2)}s`;
      const tests = result.testStats ? `${result.testStats.passed}/${result.testStats.total}` : 'N/A';
      console.log(`║  ${status} ${result.suite.padEnd(15)} ${duration.padStart(8)} ${tests.padStart(8)} ${' '.repeat(12)} ║`);
    });
    
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    logger.info('📊 Test execution completed', {
      totalSuites: summary.totalSuites,
      passedSuites: summary.passedSuites,
      failedSuites: summary.failedSuites,
      totalDuration: summary.totalDuration,
      successRate: (summary.passedTests / summary.totalTests * 100).toFixed(1)
    });
  }

  /**
   * Get current test status
   */
  getStatus() {
    return {
      running: Array.from(this.currentTests),
      completed: Array.from(this.results.keys()),
      results: Object.fromEntries(this.results)
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const testRunner = new EnhancedTestRunner();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'all':
      testRunner.runAll().catch(error => {
        logger.error('Test execution failed', { error: error.message });
        process.exit(1);
      });
      break;
      
    case 'suite':
      const suiteName = process.argv[3];
      const suiteCommand = process.argv[4];
      
      if (!suiteName || !suiteCommand) {
        console.error('Usage: enhanced-test-runner.js suite <name> <command>');
        process.exit(1);
      }
      
      testRunner.runTestSuite(suiteName, suiteCommand).catch(error => {
        logger.error('Test suite execution failed', { 
          suite: suiteName, 
          error: error.message 
        });
        process.exit(1);
      });
      break;
      
    default:
      console.log('🧪 Enhanced Test Runner with Express Logging Integration');
      console.log('');
      console.log('Usage:');
      console.log('  node enhanced-test-runner.js all                    - Run all test suites');
      console.log('  node enhanced-test-runner.js suite <name> <cmd>     - Run specific suite');
      console.log('');
      console.log('Examples:');
      console.log('  node enhanced-test-runner.js all');
      console.log('  node enhanced-test-runner.js suite unit "npm run test:run"');
      console.log('  node enhanced-test-runner.js suite browser "npm run test:browser:smoke"');
  }
}

export { EnhancedTestRunner };