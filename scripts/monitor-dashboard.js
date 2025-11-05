#!/usr/bin/env node

/**
 * 🖥️ Unified Monitoring Dashboard
 * 
 * Consolidates system health, performance monitoring, and live testing
 * into a single comprehensive monitoring interface.
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MonitoringDashboard {
  constructor() {
    this.monitors = new Map();
    this.isRunning = false;
    this.startTime = Date.now();
  }

  /**
   * Start comprehensive monitoring
   */
  async start(options = {}) {
    console.log('🖥️ Starting Unified Monitoring Dashboard...');
    
    this.isRunning = true;
    
    try {
      // Start core monitors
      await this.startSystemHealth();
      if (options.performance) await this.startPerformanceMonitoring();
      if (options.live) await this.startLiveMonitoring();
      
      // Open monitoring interfaces
      if (options.dashboard) await this.openDashboards();
      
      // Start monitoring loop
      await this.monitoringLoop();
      
    } catch (error) {
      console.error('❌ Monitoring failed:', error.message);
      await this.stop();
    }
  }

  /**
   * System health monitoring
   */
  async startSystemHealth() {
    console.log('🏥 Starting system health monitoring...');
    
    const healthCheck = setInterval(async () => {
      try {
        const health = await this.checkSystemHealth();
        await this.logHealthStatus(health);
      } catch (error) {
        console.error('⚠️ Health check failed:', error.message);
      }
    }, 30000); // Every 30 seconds

    this.monitors.set('health', healthCheck);
  }

  /**
   * Performance monitoring  
   */
  async startPerformanceMonitoring() {
    console.log('📈 Starting performance monitoring...');
    
    const perfMonitor = setInterval(async () => {
      try {
        const metrics = await this.collectPerformanceMetrics();
        await this.logPerformanceMetrics(metrics);
      } catch (error) {
        console.error('⚠️ Performance monitoring failed:', error.message);
      }
    }, 60000); // Every minute

    this.monitors.set('performance', perfMonitor);
  }

  /**
   * Live test monitoring
   */
  async startLiveMonitoring() {
    console.log('🔴 Starting live test monitoring...');
    
    // Monitor test results directory for changes
    const testResultsDir = path.join(__dirname, '../tests/test-results');
    
    try {
      const watcher = await import('fs').then(fs => 
        fs.watch(testResultsDir, { recursive: true }, (eventType, filename) => {
          if (filename && filename.endsWith('.json')) {
            console.log(`📊 Test result updated: ${filename}`);
            this.processTestResult(path.join(testResultsDir, filename));
          }
        })
      );
      
      this.monitors.set('liveTests', watcher);
    } catch (error) {
      console.warn('⚠️ Live test monitoring unavailable:', error.message);
    }
  }

  /**
   * Check system health
   */
  async checkSystemHealth() {
    const checks = [];

    // MCP Server check
    checks.push(this.checkMCPServer());
    
    // Redis check
    checks.push(this.checkRedis());
    
    // File system check
    checks.push(this.checkFileSystem());

    const results = await Promise.allSettled(checks);
    
    return {
      timestamp: new Date().toISOString(),
      overall: results.every(r => r.status === 'fulfilled' && r.value.healthy),
      checks: results.map((r, i) => ({
        name: ['MCP Server', 'Redis', 'File System'][i],
        healthy: r.status === 'fulfilled' && r.value.healthy,
        message: r.status === 'fulfilled' ? r.value.message : r.reason.message,
        responseTime: r.status === 'fulfilled' ? r.value.responseTime : null
      }))
    };
  }

  /**
   * Check MCP server status
   */
  async checkMCPServer() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      exec('curl -s http://localhost:3000/ --max-time 3', (error, stdout) => {
        const responseTime = Date.now() - startTime;
        
        if (error) {
          resolve({
            healthy: false,
            message: 'MCP Server not responding',
            responseTime
          });
        } else {
          try {
            const response = JSON.parse(stdout);
            resolve({
              healthy: true,
              message: `MCP Server ${response.name || 'unknown'} responding`,
              responseTime
            });
          } catch {
            resolve({
              healthy: true,
              message: 'MCP Server responding (non-JSON)',
              responseTime
            });
          }
        }
      });
    });
  }

  /**
   * Check Redis status
   */
  async checkRedis() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Simple Redis check - try to connect
      exec('node -e "import(\'ioredis\').then(Redis => { const r = new Redis.default(); r.ping().then(() => { console.log(\'OK\'); r.quit(); }).catch(e => { console.error(e.message); process.exit(1); }); })"', 
        (error, stdout) => {
          const responseTime = Date.now() - startTime;
          
          resolve({
            healthy: !error && stdout.includes('OK'),
            message: error ? 'Redis not available' : 'Redis responding',
            responseTime
          });
        });
    });
  }

  /**
   * Check file system health
   */
  async checkFileSystem() {
    const startTime = Date.now();
    
    try {
      // Check critical directories exist and are writable
      const criticalPaths = [
        'tests/test-results',
        'logs',
        'core',
        'ui'
      ];

      for (const p of criticalPaths) {
        const fullPath = path.join(__dirname, '..', p);
        await fs.access(fullPath, fs.constants.R_OK | fs.constants.W_OK);
      }

      return {
        healthy: true,
        message: 'File system accessible',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        healthy: false,
        message: `File system issue: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Collect performance metrics
   */
  async collectPerformanceMetrics() {
    const process = await import('process');
    const os = await import('os');
    
    return {
      timestamp: new Date().toISOString(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024), // MB
        external: Math.round(process.memoryUsage().external / 1024 / 1024), // MB
      },
      cpu: {
        usage: process.cpuUsage(),
        loadAvg: os.loadavg()
      },
      uptime: Math.round(process.uptime()),
      monitoringDuration: Math.round((Date.now() - this.startTime) / 1000)
    };
  }

  /**
   * Log health status
   */
  async logHealthStatus(health) {
    const status = health.overall ? '✅' : '❌';
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`${status} [${timestamp}] System Health: ${health.overall ? 'HEALTHY' : 'ISSUES DETECTED'}`);
    
    health.checks.forEach(check => {
      const icon = check.healthy ? '✅' : '❌';
      const time = check.responseTime ? `(${check.responseTime}ms)` : '';
      console.log(`   ${icon} ${check.name}: ${check.message} ${time}`);
    });

    // Save to log file
    const logPath = path.join(__dirname, '../logs/monitoring.log');
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.appendFile(logPath, `${JSON.stringify(health)}\n`);
  }

  /**
   * Log performance metrics
   */
  async logPerformanceMetrics(metrics) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`📊 [${timestamp}] Performance: Memory ${metrics.memory.used}MB, Uptime ${metrics.uptime}s`);
    
    // Save detailed metrics
    const metricsPath = path.join(__dirname, '../logs/performance.log');
    await fs.appendFile(metricsPath, `${JSON.stringify(metrics)}\n`);
  }

  /**
   * Process test result changes
   */
  async processTestResult(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const result = JSON.parse(content);
      
      console.log(`🧪 Test Update: ${result.testName || path.basename(filePath)}`);
      if (result.success !== undefined) {
        console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
      }
    } catch (error) {
      // Ignore parsing errors for non-test files
    }
  }

  /**
   * Open monitoring dashboards
   */
  async openDashboards() {
    console.log('🚀 Opening monitoring dashboards...');
    
    const dashboards = [
      'tests/integration/test-consolidated-suite.html',
      // Add other dashboard URLs as needed
    ];

    for (const dashboard of dashboards) {
      try {
        exec(`open ${dashboard}`, { cwd: path.join(__dirname, '..') });
      } catch (error) {
        console.warn(`⚠️ Could not open ${dashboard}:`, error.message);
      }
    }
  }

  /**
   * Main monitoring loop
   */
  async monitoringLoop() {
    console.log('🔄 Monitoring loop started. Press Ctrl+C to stop.');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down monitoring...');
      await this.stop();
      process.exit(0);
    });

    // Keep process alive
    while (this.isRunning) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  /**
   * Stop all monitoring
   */
  async stop() {
    console.log('🛑 Stopping monitoring dashboard...');
    
    this.isRunning = false;
    
    // Clear all intervals and watchers
    for (const [name, monitor] of this.monitors) {
      try {
        if (typeof monitor === 'object' && monitor.close) {
          monitor.close(); // File watcher
        } else {
          clearInterval(monitor); // Interval timer
        }
        console.log(`✅ Stopped ${name} monitor`);
      } catch (error) {
        console.warn(`⚠️ Error stopping ${name} monitor:`, error.message);
      }
    }
    
    this.monitors.clear();
    console.log('🏁 Monitoring stopped');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = {
    performance: !process.argv.includes('--no-performance'),
    live: !process.argv.includes('--no-live'),
    dashboard: !process.argv.includes('--no-dashboard')
  };

  const monitor = new MonitoringDashboard();
  
  monitor.start(options).catch(error => {
    console.error('💥 Fatal monitoring error:', error);
    process.exit(1);
  });
}

export { MonitoringDashboard };