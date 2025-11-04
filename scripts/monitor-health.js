#!/usr/bin/env node

/**
 * Health Status Monitor
 * Continuously checks MCP server health and system status
 */

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HealthMonitor {
  constructor() {
    this.healthUrl = 'http://localhost:3000/';
    this.checkInterval = 5000; // 5 seconds
    this.isRunning = false;
  }

  async start() {
    console.log('🏥 Starting health monitor...');
    console.log(`🔍 Checking: ${this.healthUrl}`);
    console.log(`⏱️  Interval: ${this.checkInterval/1000}s`);
    console.log('⌨️  Press Ctrl+C to stop');
    console.log('=' + '='.repeat(60));

    this.isRunning = true;

    // Initial check
    await this.checkHealth();

    // Set up interval
    const intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.checkHealth();
      }
    }, this.checkInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping health monitor...');
      this.isRunning = false;
      clearInterval(intervalId);
      process.exit(0);
    });
  }

  async checkHealth() {
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      const http = await import('http');
      
      const response = await new Promise((resolve, reject) => {
        const req = http.default.get(this.healthUrl, resolve);
        req.on('error', reject);
        req.setTimeout(3000, () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });
      });

      if (response.statusCode === 200) {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const health = JSON.parse(data);
            this.displayHealthStatus(timestamp, health);
          } catch (error) {
            console.log(`🔴 [${timestamp}] JSON Parse Error: ${error.message}`);
          }
        });
      } else {
        console.log(`🔴 [${timestamp}] HTTP ${response.statusCode}: ${response.statusMessage}`);
      }
    } catch (error) {
      console.log(`🔴 [${timestamp}] CONNECTION FAILED: ${error.message}`);
      this.displayConnectionHelp();
    }
  }

  displayHealthStatus(timestamp, health) {
    const status = health.status === 'healthy' ? '🟢' : '🟡';
    const uptime = health.uptime || 'unknown';
    const toolCount = health.tools ? health.tools.length : 0;
    
    console.log(`${status} [${timestamp}] Status: ${health.status} | Uptime: ${uptime} | Tools: ${toolCount}`);

    // Show detailed info every 10th check (50 seconds)
    if (this.checkCount % 10 === 0) {
      this.displayDetailedHealth(health);
    }

    this.checkCount = (this.checkCount || 0) + 1;
  }

  displayDetailedHealth(health) {
    console.log('\n📊 Detailed Health Report:');
    console.log(`   Version: ${health.version || 'unknown'}`);
    console.log(`   Architecture: ${health.architecture || 'unknown'}`);
    
    if (health.tools) {
      console.log(`   Tools: ${health.tools.join(', ')}`);
    }

    if (health.connections) {
      console.log('   Connections:');
      Object.entries(health.connections).forEach(([service, status]) => {
        const indicator = status === 'connected' ? '✅' : '❌';
        console.log(`     ${indicator} ${service}: ${status}`);
      });
    }

    if (health.metrics) {
      console.log('   Metrics:');
      Object.entries(health.metrics).forEach(([metric, value]) => {
        console.log(`     📈 ${metric}: ${value}`);
      });
    }
    console.log();
  }

  displayConnectionHelp() {
    if (this.helpShown) return;
    
    console.log('\n💡 Connection Troubleshooting:');
    console.log('   1. Check if MCP server is running: npm run start:mvc');
    console.log('   2. Verify port 3000 is not blocked: lsof -i :3000');
    console.log('   3. Check server logs: tail -f server.log');
    console.log('   4. Restart server: npm run start:mvc\n');
    
    this.helpShown = true;
  }

  async checkOnce() {
    console.log('🏥 Single health check...\n');
    await this.checkHealth();
    
    // Additional system checks
    await this.checkSystemResources();
    
    process.exit(0);
  }

  async checkSystemResources() {
    console.log('\n🖥️  System Resources:');
    
    try {
      const memUsage = process.memoryUsage();
      console.log(`   Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB heap used`);
      console.log(`   Uptime: ${Math.round(process.uptime())}s`);
      
      // Check log file sizes
      const fs = await import('fs');
      const logDir = path.join(__dirname, '../logs');
      
      if (fs.existsSync(logDir)) {
        const logFiles = fs.readdirSync(logDir);
        console.log('   Log Files:');
        logFiles.forEach(file => {
          const filePath = path.join(logDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`     📄 ${file}: ${sizeKB}KB`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error checking system resources: ${error.message}`);
    }
  }
}

// Command line arguments
const args = process.argv.slice(2);
const monitor = new HealthMonitor();

if (args.includes('--once') || args.includes('-o')) {
  monitor.checkOnce();
} else {
  monitor.start();
}