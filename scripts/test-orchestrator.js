#!/usr/bin/env node

/**
 * 🧪 Master Test Orchestrator
 * 
 * Unified test runner that consolidates multiple test categories
 * into intelligent, streamlined commands.
 * 
 * Features:
 * - Smart routing based on test type and flags
 * - Parallel execution for compatible tests
 * - Comprehensive logging and reporting
 * - Progress tracking with real-time updates
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TestOrchestrator {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.logBuffer = [];
  }

  /**
   * Main orchestration method
   */
  async run(testType = 'all', options = {}) {
    console.log(`🧪 Starting ${testType} tests...`);
    
    const testConfig = this.getTestConfig(testType, options);
    
    try {
      if (testConfig.parallel) {
        await this.runParallel(testConfig.tests);
      } else {
        await this.runSequential(testConfig.tests);
      }
      
      await this.generateReport();
      return this.getExitCode();
      
    } catch (error) {
      console.error('❌ Test orchestration failed:', error.message);
      return 1;
    }
  }

  /**
   * Get test configuration based on type
   */
  getTestConfig(testType, options) {
    const configs = {
      // Essential daily commands
      'unit': {
        tests: ['vitest run'],
        parallel: false,
        timeout: 60000
      },
      
      'browser': {
        tests: [
          'playwright test --config=tests/playwright/smoke.config.js',
          ...(options.full ? [
            'playwright test --config=tests/playwright/regression.config.js',
            'playwright test --config=tests/playwright/visual.config.js'
          ] : [])
        ],
        parallel: true,
        timeout: 180000
      },
      
      'templates': {
        tests: [
          'node tests/templates/yaml-validation.test.js',
          'node tests/templates/variable-substitution.test.js',
          'node tests/templates/platform-specific/jira.test.js',
          'node tests/templates/integration/ai-template-flow.test.js'
        ],
        parallel: true,
        timeout: 120000
      },
      
      'ai': {
        tests: [
          'node tests/ai/ai-architecture-test-suite.js',
          'node tests/ai/real-screenshot-test-suite.js'
        ],
        parallel: false, // AI tests may have rate limits
        timeout: 300000
      },
      
      'integration': {
        tests: [
          'node tests/integration/test-standalone.mjs',
          'node tests/integration/design-system-compliance-tests.mjs'
        ],
        parallel: false,
        timeout: 180000
      },
      
      'performance': {
        tests: ['node tests/performance/test-performance-benchmarking.mjs'],
        parallel: false,
        timeout: 300000
      },
      
      // Comprehensive test suite
      'all': {
        tests: [
          'vitest run',
          'node tests/integration/test-standalone.mjs',
          'node tests/templates/template-test-runner.js',
          'playwright test --config=tests/playwright/smoke.config.js',
          ...(options.full ? [
            'node tests/ai/ai-architecture-test-suite.js',
            'node tests/performance/test-performance-benchmarking.mjs'
          ] : [])
        ],
        parallel: false, // Sequential for comprehensive testing
        timeout: 600000
      }
    };

    return configs[testType] || configs['all'];
  }

  /**
   * Run tests in parallel
   */
  async runParallel(tests) {
    console.log(`🚀 Running ${tests.length} test suites in parallel...`);
    
    const promises = tests.map((test, index) => 
      this.runSingleTest(test, `parallel-${index}`)
    );
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`❌ Parallel test ${index + 1} failed:`, result.reason);
      }
    });
  }

  /**
   * Run tests sequentially
   */
  async runSequential(tests) {
    console.log(`📋 Running ${tests.length} test suites sequentially...`);
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      console.log(`\n🔄 [${i + 1}/${tests.length}] ${test}`);
      
      try {
        await this.runSingleTest(test, `sequential-${i}`);
        console.log(`✅ [${i + 1}/${tests.length}] Completed`);
      } catch (error) {
        console.error(`❌ [${i + 1}/${tests.length}] Failed:`, error.message);
        
        // Continue with other tests unless critical failure
        if (!error.message.includes('CRITICAL')) {
          continue;
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Run a single test command
   */
  async runSingleTest(command, testId) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const child = exec(command, { 
        cwd: path.resolve(__dirname, '..'),
        timeout: 300000 // 5 minute timeout per test
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data;
        // Real-time output for long-running tests
        if (process.env.VERBOSE || command.includes('vitest')) {
          process.stdout.write(data);
        }
      });

      child.stderr?.on('data', (data) => {
        stderr += data;
        if (process.env.VERBOSE) {
          process.stderr.write(data);
        }
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        const result = {
          testId,
          command,
          code,
          duration,
          stdout: stdout.slice(-1000), // Keep last 1000 chars
          stderr: stderr.slice(-1000)
        };
        
        this.results.push(result);
        
        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Test failed with code ${code}: ${command}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start test: ${error.message}`));
      });
    });
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport() {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.code === 0).length;
    const failed = this.results.filter(r => r.code !== 0).length;
    const successRate = Math.round((passed / this.results.length) * 100);

    const report = {
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        total: this.results.length,
        passed,
        failed,
        successRate
      },
      results: this.results.map(r => ({
        command: r.command,
        status: r.code === 0 ? 'PASSED' : 'FAILED',
        duration: `${r.duration}ms`,
        testId: r.testId
      }))
    };

    // Write JSON report
    const reportPath = path.join(__dirname, '../tests/test-results/master-test-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Console summary
    console.log('\n' + '='.repeat(60));
    console.log('🧪 TEST ORCHESTRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${successRate}%`); 
    console.log(`⏱️  Total Duration: ${Math.round(duration / 1000)}s`);
    console.log(`📄 Report: ${reportPath}`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.code !== 0)
        .forEach(r => console.log(`   • ${r.command}`));
    }
  }

  /**
   * Get exit code based on results
   */
  getExitCode() {
    const failed = this.results.filter(r => r.code !== 0).length;
    return failed > 0 ? 1 : 0;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const testType = process.argv[2] || 'all';
  const options = {
    full: process.argv.includes('--full'),
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
  };

  if (options.verbose) {
    process.env.VERBOSE = '1';
  }

  const orchestrator = new TestOrchestrator();
  
  orchestrator.run(testType, options)
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { TestOrchestrator };