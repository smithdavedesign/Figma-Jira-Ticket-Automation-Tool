#!/usr/bin/env node

/**
 * 🔄 Live Server Monitor with Real-time Logs
 * 
 * Features:
 * - Nodemon-powered auto-restart
 * - Real-time log streaming
 * - Health monitoring
 * - Test integration
 * - Multi-server support
 */

import { spawn, fork } from 'child_process';
import { createReadStream, watchFile, existsSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';

class LiveServerMonitor {
  constructor() {
    this.mcpProcess = null;
    this.testServerProcess = null;
    this.logWatchers = [];
    this.healthCheckInterval = null;
    
    // Configuration
    this.config = {
      mcpServer: {
        script: 'app/main.js',
        port: 3000,
        name: 'MCP Server'
      },
      testServer: {
        port: 8101,
        name: 'Test Server'
      },
      logs: {
        mcp: 'logs/mcp-server.log',
        system: 'logs/system.log',
        test: 'logs/test.log'
      },
      healthCheck: {
        interval: 30000, // 30 seconds
        endpoints: [
          { url: 'http://localhost:3000', name: 'MCP Server' },
          { url: 'http://localhost:8101', name: 'Test Server' }
        ]
      }
    };
    
    // Bind methods
    this.startMCPServer = this.startMCPServer.bind(this);
    this.stopServers = this.stopServers.bind(this);
    this.handleExit = this.handleExit.bind(this);
    
    // Setup graceful shutdown
    process.on('SIGINT', this.handleExit);
    process.on('SIGTERM', this.handleExit);
  }
  
  /**
   * Start the live monitoring system
   */
  async start() {
    console.log('🚀 Starting Live Server Monitor...');
    console.log('===================================');
    
    // Create logs directory if it doesn't exist
    await this.ensureLogsDirectory();
    
    // Start MCP server with nodemon
    await this.startMCPServer();
    
    // Start log streaming
    this.startLogStreaming();
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    // Display dashboard
    this.displayDashboard();
    
    console.log('\n🎯 Live monitoring active. Press Ctrl+C to stop.\n');
  }
  
  /**
   * Start MCP server with nodemon for auto-restart
   */
  async startMCPServer() {
    console.log('🔄 Starting MCP Server with auto-restart...');
    
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
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    // Handle MCP server output
    this.mcpProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        this.logWithTimestamp('🤖 MCP', message);
      }
    });
    
    this.mcpProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('[nodemon]')) {
        this.logWithTimestamp('🚨 MCP ERROR', message);
      }
    });
    
    this.mcpProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`🔴 MCP Server exited with code ${code}`);
      }
    });
    
    // Wait for server to start
    await this.waitForServer('http://localhost:3000', 'MCP Server');
  }
  
  /**
   * Start real-time log streaming
   */
  startLogStreaming() {
    console.log('📋 Starting log streaming...');
    
    // Watch for log files and stream them
    Object.entries(this.config.logs).forEach(([type, logPath]) => {
      if (existsSync(logPath)) {
        this.watchLogFile(logPath, type);
      } else {
        // Create watcher for when file is created
        const interval = setInterval(() => {
          if (existsSync(logPath)) {
            this.watchLogFile(logPath, type);
            clearInterval(interval);
          }
        }, 1000);
      }
    });
  }
  
  /**
   * Watch a log file for changes
   */
  watchLogFile(filePath, type) {
    console.log(`👁️  Watching ${type} logs: ${filePath}`);
    
    let lastSize = 0;
    
    watchFile(filePath, (curr, prev) => {
      if (curr.size > lastSize) {
        const stream = createReadStream(filePath, {
          start: lastSize,
          end: curr.size - 1
        });
        
        stream.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim());
          lines.forEach(line => {
            this.logWithTimestamp(`📋 ${type.toUpperCase()}`, line);
          });
        });
        
        lastSize = curr.size;
      }
    });
  }
  
  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    console.log('🏥 Starting health monitoring...');
    
    this.healthCheckInterval = setInterval(async () => {
      for (const endpoint of this.config.healthCheck.endpoints) {
        try {
          const response = await fetch(endpoint.url, { timeout: 5000 });
          if (response.ok) {
            this.logWithTimestamp('💚 HEALTH', `${endpoint.name} is healthy`);
          } else {
            this.logWithTimestamp('💛 HEALTH', `${endpoint.name} returned ${response.status}`);
          }
        } catch (error) {
          this.logWithTimestamp('💔 HEALTH', `${endpoint.name} is down: ${error.message}`);
        }
      }
    }, this.config.healthCheck.interval);
  }
  
  /**
   * Display live dashboard
   */
  displayDashboard() {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║         🔄 LIVE SERVER DASHBOARD         ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  🤖 MCP Server: http://localhost:3000    ║');
    console.log('║  🧪 Test Suite: http://localhost:8101    ║');
    console.log('║  📋 Live Logs: Streaming in real-time   ║');
    console.log('║  🏥 Health Check: Every 30 seconds      ║');
    console.log('║  🔄 Auto-restart: File changes detected ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  Commands Available:                     ║');
    console.log('║  • Ctrl+C: Stop all servers             ║');
    console.log('║  • Check health: curl localhost:3000    ║');
    console.log('║  • Run tests: npm run test:all          ║');
    console.log('╚══════════════════════════════════════════╝');
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
          console.log(`✅ ${name} is ready at ${url}`);
          return true;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`⚠️  ${name} did not start within ${timeout}ms`);
    return false;
  }
  
  /**
   * Ensure logs directory exists
   */
  async ensureLogsDirectory() {
    const { mkdir } = await import('fs/promises');
    try {
      await mkdir('logs', { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
  
  /**
   * Log with timestamp and formatting
   */
  logWithTimestamp(prefix, message) {
    const timestamp = new Date().toISOString().substr(11, 8);
    console.log(`[${timestamp}] ${prefix}: ${message}`);
  }
  
  /**
   * Stop all servers and cleanup
   */
  async stopServers() {
    console.log('\n🛑 Stopping servers...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.mcpProcess) {
      this.mcpProcess.kill('SIGTERM');
    }
    
    if (this.testServerProcess) {
      this.testServerProcess.kill('SIGTERM');
    }
    
    // Clear log watchers
    this.logWatchers.forEach(watcher => {
      if (watcher && typeof watcher.close === 'function') {
        watcher.close();
      }
    });
    
    console.log('✅ All servers stopped');
  }
  
  /**
   * Handle graceful exit
   */
  async handleExit() {
    await this.stopServers();
    process.exit(0);
  }
}

// Start the live monitor
const monitor = new LiveServerMonitor();
monitor.start().catch(error => {
  console.error('❌ Failed to start live monitor:', error);
  process.exit(1);
});