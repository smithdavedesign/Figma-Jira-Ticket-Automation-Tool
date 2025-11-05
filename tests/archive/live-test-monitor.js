#!/usr/bin/env node

/**
 * 🧪 Live Test Suite Monitor with Express Logging Integration
 * 
 * Advanced Features:
 * - Real-time test execution logging via Express middleware
 * - Live test result streaming
 * - Performance monitoring for tests
 * - Automatic test re-run on file changes
 * - Test coverage tracking
 * - Integration with MCP server logging
 * - Visual test dashboard in terminal
 */

import { spawn, fork } from 'child_process';
import { createReadStream, watchFile, existsSync, watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { WebSocketServer } from 'ws';

// Import our logging middleware for test integration
import { logTestResult, logAIServiceCall } from '../core/logging/middleware.js';
import logger from '../core/logging/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class LiveTestMonitor {
  constructor() {
    this.mcpProcess = null;
    this.testProcesses = new Map();
    this.testResults = new Map();
    this.websocketServer = null;
    this.clients = new Set();
    
    // Test execution tracking
    this.currentTests = new Map();
    this.testHistory = [];
    this.coverage = {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    };
    
    // Configuration
    this.config = {
      mcpServer: {
        script: 'app/main.js',
        port: 3000,
        name: 'MCP Server'
      },
      testSuites: {
        unit: {
          command: 'npm run test:run',
          name: 'Unit Tests (Vitest)',
          pattern: ['tests/unit/**/*.test.js', 'tests/unit/**/*.test.mjs']
        },
        integration: {
          command: 'npm run test:mcp',
          name: 'Integration Tests',
          pattern: ['tests/integration/**/*.js', 'tests/integration/**/*.mjs']
        },
        browser: {
          command: 'npm run test:browser:smoke',
          name: 'Browser Tests (Playwright)',
          pattern: ['tests/playwright/**/*.spec.js']
        },
        performance: {
          command: 'npm run test:performance', 
          name: 'Performance Tests',
          pattern: ['tests/performance/**/*.mjs']
        }
      },
      websocket: {
        port: 8102,
        name: 'Test Monitor WebSocket'
      },
      monitoring: {
        autoRerun: true,
        watchPattern: ['app/**/*.js', 'core/**/*.js', 'tests/**/*.js'],
        healthCheckInterval: 15000
      }
    };
    
    // Bind methods
    this.handleExit = this.handleExit.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    
    // Setup graceful shutdown
    process.on('SIGINT', this.handleExit);
    process.on('SIGTERM', this.handleExit);
  }
  
  /**
   * Start the live test monitoring system
   */
  async start() {
    logger.info('🧪 Starting Live Test Suite Monitor...');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║               🧪 LIVE TEST SUITE MONITOR                   ║');
    console.log('║          Integrated with Express Logging Middleware       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Start WebSocket server for real-time updates
    await this.startWebSocketServer();
    
    // Start MCP server with logging integration
    await this.startMCPServer();
    
    // Setup file watchers for auto-rerun
    this.setupFileWatchers();
    
    // Run initial test suite
    await this.runAllTestSuites();
    
    // Start continuous monitoring
    this.startContinuousMonitoring();
    
    // Display interactive dashboard
    this.displayInteractiveDashboard();
    
    logger.info('🎯 Live test monitoring active. Press Ctrl+C to stop.');
  }
  
  /**
   * Start WebSocket server for real-time test updates
   */
  async startWebSocketServer() {
    const wss = new WebSocketServer({ port: this.config.websocket.port });
    
    wss.on('connection', (ws) => {
      this.clients.add(ws);
      logger.info('🔗 Test monitor client connected', { 
        clientCount: this.clients.size 
      });
      
      // Send current test state
      ws.send(JSON.stringify({
        type: 'initial_state',
        data: {
          testResults: Array.from(this.testResults.entries()),
          testHistory: this.testHistory.slice(-50),
          coverage: this.coverage
        }
      }));
      
      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('🔌 Test monitor client disconnected', { 
          clientCount: this.clients.size 
        });
      });
    });
    
    this.websocketServer = wss;
    logger.info('🌐 WebSocket server started', { 
      port: this.config.websocket.port 
    });
  }
  
  /**
   * Start MCP server with test logging integration
   */
  async startMCPServer() {
    logger.info('🤖 Starting MCP Server with test integration...');
    
    const nodemonArgs = [
      '--watch', 'app/',
      '--watch', 'core/',
      '--watch', 'config/',
      '--ext', 'js,mjs,json',
      '--ignore', 'logs/',
      '--ignore', 'tests/',
      '--ignore', 'dist/',
      this.config.mcpServer.script
    ];
    
    this.mcpProcess = spawn('npx', ['nodemon', ...nodemonArgs], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        NODE_ENV: 'development',
        TEST_MONITOR_ENABLED: 'true',
        TEST_MONITOR_WS_PORT: this.config.websocket.port
      }
    });
    
    // Capture and analyze MCP server output
    this.mcpProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.analyzeMCPOutput(message);
        this.broadcastToClients('mcp_log', { 
          timestamp: new Date().toISOString(),
          message: message 
        });
      }
    });
    
    this.mcpProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('[nodemon]')) {
        logger.error('🚨 MCP Server Error', { message });
        this.broadcastToClients('mcp_error', { 
          timestamp: new Date().toISOString(),
          error: message 
        });
      }
    });
    
    // Wait for server to be ready
    await this.waitForServer('http://localhost:3000', 'MCP Server');
  }
  
  /**
   * Setup file watchers for automatic test re-runs
   */
  setupFileWatchers() {
    if (!this.config.monitoring.autoRerun) return;
    
    logger.info('👁️  Setting up file watchers for auto-rerun...');
    
    this.config.monitoring.watchPattern.forEach(pattern => {
      // Simple directory watching (can be enhanced with chokidar for better patterns)
      const baseDir = pattern.split('/**')[0];
      if (existsSync(baseDir)) {
        watch(baseDir, { recursive: true }, (eventType, filename) => {
          if (filename && (filename.endsWith('.js') || filename.endsWith('.mjs'))) {
            this.onFileChange(join(baseDir, filename), eventType);
          }
        });
      }
    });
  }
  
  /**
   * Handle file changes and trigger appropriate test re-runs
   */
  async onFileChange(filePath, eventType) {
    logger.info('📁 File changed', { filePath, eventType });
    
    // Debounce rapid file changes
    if (this.fileChangeTimeout) {
      clearTimeout(this.fileChangeTimeout);
    }
    
    this.fileChangeTimeout = setTimeout(async () => {
      // Determine which test suites to run based on file path
      const suitesToRun = this.determineSuitesToRun(filePath);
      
      logger.info('🔁 Auto-rerunning tests', { 
        filePath, 
        suites: suitesToRun 
      });
      
      for (const suite of suitesToRun) {
        await this.runTestSuite(suite);
      }
      
      this.broadcastToClients('auto_rerun', {
        trigger: filePath,
        suites: suitesToRun,
        timestamp: new Date().toISOString()
      });
    }, 1000); // 1 second debounce
  }
  
  /**
   * Determine which test suites to run based on changed file
   */
  determineSuitesToRun(filePath) {
    const suites = [];
    
    if (filePath.includes('app/') || filePath.includes('core/')) {
      // Core changes should run unit and integration tests
      suites.push('unit', 'integration');
    }
    
    if (filePath.includes('tests/')) {
      // Test file changes should run the corresponding suite
      if (filePath.includes('unit/')) suites.push('unit');
      if (filePath.includes('integration/')) suites.push('integration');
      if (filePath.includes('playwright/')) suites.push('browser');
      if (filePath.includes('performance/')) suites.push('performance');
    }
    
    if (filePath.includes('ui/') || filePath.includes('plugin/')) {
      // UI changes should run browser tests
      suites.push('browser');
    }
    
    return suites.length > 0 ? suites : ['unit']; // Default to unit tests
  }
  
  /**
   * Run all test suites
   */
  async runAllTestSuites() {
    logger.info('🚀 Running all test suites...');
    
    const results = [];
    for (const [suiteName, suiteConfig] of Object.entries(this.config.testSuites)) {
      const result = await this.runTestSuite(suiteName);
      results.push({ suite: suiteName, ...result });
    }
    
    this.generateTestSummary(results);
    return results;
  }
  
  /**
   * Run a specific test suite with logging integration
   */
  async runTestSuite(suiteName) {
    const suiteConfig = this.config.testSuites[suiteName];
    if (!suiteConfig) {
      logger.error('❌ Unknown test suite', { suiteName });
      return null;
    }
    
    const startTime = Date.now();
    logger.info(`🧪 Starting ${suiteConfig.name}...`);
    
    // Use our logging middleware to track test execution
    const testId = `${suiteName}_${Date.now()}`;
    this.currentTests.set(testId, {
      suite: suiteName,
      startTime,
      status: 'running'
    });
    
    return new Promise((resolve) => {
      const [command, ...args] = suiteConfig.command.split(' ');
      const testProcess = spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: {
          ...process.env,
          TEST_MONITOR_ID: testId,
          TEST_SUITE_NAME: suiteName
        }
      });
      
      let output = '';
      let errorOutput = '';
      
      testProcess.stdout.on('data', (data) => {
        const message = data.toString();
        output += message;
        this.analyzeTestOutput(suiteName, message, 'stdout');
      });
      
      testProcess.stderr.on('data', (data) => {
        const message = data.toString();
        errorOutput += message;
        this.analyzeTestOutput(suiteName, message, 'stderr');
      });
      
      testProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        const success = code === 0;
        
        // Use our middleware logging helper
        logTestResult(suiteConfig.name, success ? 'PASSED' : 'FAILED', startTime, {
          suite: suiteName,
          exitCode: code,
          outputLength: output.length,
          errorLength: errorOutput.length
        });
        
        const result = {
          success,
          duration,
          exitCode: code,
          output: output.slice(-2000), // Keep last 2KB
          error: errorOutput.slice(-1000) // Keep last 1KB
        };
        
        this.testResults.set(suiteName, result);
        this.currentTests.delete(testId);
        
        // Add to history
        this.testHistory.push({
          suite: suiteName,
          timestamp: new Date().toISOString(),
          ...result
        });
        
        // Broadcast to clients
        this.broadcastToClients('test_complete', {
          suite: suiteName,
          ...result
        });
        
        logger.info(`${success ? '✅' : '❌'} ${suiteConfig.name} completed`, {
          duration: `${duration}ms`,
          exitCode: code
        });
        
        resolve(result);
      });
      
      this.testProcesses.set(suiteName, testProcess);
    });
  }
  
  /**
   * Analyze test output for insights
   */
  analyzeTestOutput(suiteName, output, stream) {
    // Extract test results, coverage info, performance metrics
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Parse coverage information
      if (line.includes('coverage') || line.includes('Coverage')) {
        this.parseCoverageInfo(line);
      }
      
      // Parse test counts
      if (line.includes('passing') || line.includes('failing') || line.includes('Tests:')) {
        this.parseTestCounts(suiteName, line);
      }
      
      // Parse performance metrics
      if (line.includes('ms') && (line.includes('slow') || line.includes('fast'))) {
        this.parsePerformanceMetrics(suiteName, line);
      }
      
      // Broadcast interesting lines to clients
      if (this.isInterestingLogLine(line)) {
        this.broadcastToClients('test_log', {
          suite: suiteName,
          stream,
          message: line.trim()
        });
      }
    }
  }
  
  /**
   * Parse coverage information from test output
   */
  parseCoverageInfo(line) {
    const coverageMatch = line.match(/(\d+\.?\d*)%/g);
    if (coverageMatch && coverageMatch.length >= 4) {
      this.coverage = {
        statements: parseFloat(coverageMatch[0]),
        branches: parseFloat(coverageMatch[1]),
        functions: parseFloat(coverageMatch[2]), 
        lines: parseFloat(coverageMatch[3])
      };
      
      this.broadcastToClients('coverage_update', this.coverage);
    }
  }
  
  /**
   * Parse test counts from output
   */
  parseTestCounts(suiteName, line) {
    const testCounts = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
    
    // Try to extract numbers from various test runner formats
    const numbers = line.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      // This is a simplified parser - can be enhanced for specific test runners
      if (line.includes('passing')) testCounts.passed = parseInt(numbers[0]);
      if (line.includes('failing')) testCounts.failed = parseInt(numbers[0]);
      
      this.broadcastToClients('test_counts', {
        suite: suiteName,
        counts: testCounts
      });
    }
  }
  
  /**
   * Parse performance metrics
   */
  parsePerformanceMetrics(suiteName, line) {
    const timeMatch = line.match(/(\d+)ms/);
    if (timeMatch) {
      const duration = parseInt(timeMatch[1]);
      this.broadcastToClients('performance_metric', {
        suite: suiteName,
        duration,
        line: line.trim()
      });
    }
  }
  
  /**
   * Check if a log line is interesting enough to broadcast
   */
  isInterestingLogLine(line) {
    const interesting = [
      'passing', 'failing', 'error', 'warning', 'coverage',
      '✓', '✗', '⚠', '📊', '🚨', '✅', '❌'
    ];
    
    return interesting.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  /**
   * Analyze MCP server output for test-related information
   */
  analyzeMCPOutput(message) {
    // Look for test-related endpoints being called
    if (message.includes('📥 Incoming Request') && message.includes('test')) {
      this.broadcastToClients('mcp_test_request', {
        timestamp: new Date().toISOString(),
        message: message
      });
    }
    
    // Look for middleware logging test results
    if (message.includes('logTestResult') || message.includes('Test execution')) {
      this.broadcastToClients('mcp_test_log', {
        timestamp: new Date().toISOString(),
        message: message
      });
    }
  }
  
  /**
   * Generate comprehensive test summary
   */
  generateTestSummary(results) {
    const summary = {
      timestamp: new Date().toISOString(),
      totalSuites: results.length,
      passedSuites: results.filter(r => r.success).length,
      failedSuites: results.filter(r => !r.success).length,
      totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
      coverage: this.coverage
    };
    
    logger.info('📊 Test Summary Generated', summary);
    
    this.broadcastToClients('test_summary', summary);
    this.displayTestSummary(summary);
    
    return summary;
  }
  
  /**
   * Display test summary in terminal
   */
  displayTestSummary(summary) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 TEST EXECUTION SUMMARY               ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Total Suites: ${summary.totalSuites.toString().padEnd(10)} Passed: ${summary.passedSuites.toString().padEnd(10)} Failed: ${summary.failedSuites.toString().padEnd(8)} ║`);
    console.log(`║  Duration: ${(summary.totalDuration/1000).toFixed(2)}s${' '.repeat(20)}Coverage: ${summary.coverage.lines.toFixed(1)}%${' '.repeat(8)} ║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    
    // Show individual suite results
    this.testResults.forEach((result, suiteName) => {
      const status = result.success ? '✅' : '❌';
      const duration = `${(result.duration/1000).toFixed(2)}s`;
      console.log(`║  ${status} ${suiteName.padEnd(15)} ${duration.padStart(8)} ${' '.repeat(20)} ║`);
    });
    
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  }
  
  /**
   * Start continuous monitoring
   */
  startContinuousMonitoring() {
    // Health check interval
    setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3000', { timeout: 5000 });
        const isHealthy = response.ok;
        
        this.broadcastToClients('health_check', {
          timestamp: new Date().toISOString(),
          healthy: isHealthy,
          status: response.status
        });
        
        if (!isHealthy) {
          logger.warn('🏥 MCP Server health check failed', { 
            status: response.status 
          });
        }
      } catch (error) {
        logger.error('🏥 MCP Server unreachable', { error: error.message });
        this.broadcastToClients('health_check', {
          timestamp: new Date().toISOString(),
          healthy: false,
          error: error.message
        });
      }
    }, this.config.monitoring.healthCheckInterval);
  }
  
  /**
   * Display interactive dashboard
   */
  displayInteractiveDashboard() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              🧪 LIVE TEST MONITORING DASHBOARD             ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  🤖 MCP Server: http://localhost:3000                      ║');
    console.log('║  🌐 WebSocket Monitor: ws://localhost:8102                 ║');
    console.log('║  📊 Test Results: Live streaming                           ║');
    console.log('║  🔄 Auto-rerun: File change detection enabled             ║');
    console.log('║  🏥 Health Monitoring: Every 15 seconds                   ║');    
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  Available Commands:                                       ║');
    console.log('║  • Press r: Rerun all tests                               ║');
    console.log('║  • Press u: Run unit tests only                           ║');
    console.log('║  • Press i: Run integration tests                         ║');
    console.log('║  • Press b: Run browser tests                             ║');
    console.log('║  • Press p: Run performance tests                         ║');
    console.log('║  • Press s: Show test summary                             ║');
    console.log('║  • Press c: Show coverage report                          ║');
    console.log('║  • Press Ctrl+C: Stop monitoring                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Setup interactive commands
    this.setupInteractiveCommands();
  }
  
  /**
   * Setup interactive keyboard commands
   */
  setupInteractiveCommands() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (key) => {
      switch (key.toLowerCase()) {
        case 'r':
          console.log('🔄 Rerunning all test suites...');
          await this.runAllTestSuites();
          break;
        case 'u':
          console.log('🧪 Running unit tests...');
          await this.runTestSuite('unit');
          break;
        case 'i':
          console.log('🔗 Running integration tests...');
          await this.runTestSuite('integration');
          break;
        case 'b':
          console.log('🌐 Running browser tests...');
          await this.runTestSuite('browser');
          break;
        case 'p':
          console.log('⚡ Running performance tests...');
          await this.runTestSuite('performance');
          break;
        case 's':
          this.displayCurrentSummary();
          break;
        case 'c':
          this.displayCoverageReport();
          break;
        case '\u0003': // Ctrl+C
          await this.handleExit();
          break;
      }
    });
  }
  
  /**
   * Display current test summary
   */
  displayCurrentSummary() {
    const results = Array.from(this.testResults.entries()).map(([suite, result]) => ({
      suite,
      ...result
    }));
    
    if (results.length > 0) {
      this.generateTestSummary(results);
    } else {
      console.log('📊 No test results available yet. Run some tests first!');
    }
  }
  
  /**
   * Display coverage report
   */
  displayCoverageReport() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    📊 COVERAGE REPORT                      ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Statements: ${this.coverage.statements.toFixed(1)}%${' '.repeat(35)} ║`);
    console.log(`║  Branches:   ${this.coverage.branches.toFixed(1)}%${' '.repeat(35)} ║`);
    console.log(`║  Functions:  ${this.coverage.functions.toFixed(1)}%${' '.repeat(35)} ║`);
    console.log(`║  Lines:      ${this.coverage.lines.toFixed(1)}%${' '.repeat(35)} ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  }
  
  /**
   * Broadcast message to all connected WebSocket clients
   */
  broadcastToClients(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
        } catch (error) {
          logger.warn('📡 Failed to send message to client', { error: error.message });
          this.clients.delete(client);
        }
      }
    });
  }
  
  /**
   * Wait for server to be ready
   */
  async waitForServer(url, name, timeout = 30000) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(url, { timeout: 2000 });
        if (response.ok) {
          logger.info(`✅ ${name} is ready`, { url });
          return true;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    logger.warn(`⚠️ ${name} did not start within timeout`, { timeout });
    return false;
  }
  
  /**
   * Cleanup and stop all processes
   */
  async handleExit() {
    logger.info('🛑 Stopping Live Test Monitor...');
    
    // Stop all test processes
    this.testProcesses.forEach((process, name) => {
      logger.info(`🛑 Stopping ${name} tests...`);
      process.kill('SIGTERM');
    });
    
    // Stop MCP server
    if (this.mcpProcess) {
      logger.info('🛑 Stopping MCP server...');
      this.mcpProcess.kill('SIGTERM');
    }
    
    // Close WebSocket server
    if (this.websocketServer) {
      logger.info('🛑 Closing WebSocket server...');
      this.websocketServer.close();
    }
    
    logger.info('✅ Live Test Monitor stopped');
    process.exit(0);
  }
}

// Start the live test monitor
const monitor = new LiveTestMonitor();
monitor.start().catch(error => {
  console.error('❌ Failed to start Live Test Monitor:', error);
  process.exit(1);
});