#!/usr/bin/env node

/**
 * Real-time Log Monitor
 * Tails and parses error logs for immediate debugging
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_FILES = {
  server: path.join(LOG_DIR, 'server.log'),
  error: path.join(LOG_DIR, 'error.log'),
  performance: path.join(LOG_DIR, 'performance.log')
};

class LogMonitor {
  constructor() {
    this.watchers = new Map();
    this.errorPatterns = [
      /ERROR/i,
      /FATAL/i,
      /CRITICAL/i,
      /Exception/i,
      /Error:/i,
      /Failed/i
    ];
  }

  start() {
    console.log('🔍 Starting real-time log monitor...');
    console.log('📁 Monitoring logs in:', LOG_DIR);
    console.log('⌨️  Press Ctrl+C to stop');
    console.log('=' + '='.repeat(60));

    // Monitor each log file
    Object.entries(LOG_FILES).forEach(([name, filePath]) => {
      this.watchLogFile(name, filePath);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping log monitor...');
      this.watchers.forEach(watcher => watcher.close());
      process.exit(0);
    });
  }

  watchLogFile(name, filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Log file not found: ${filePath}`);
      return;
    }

    console.log(`👀 Watching ${name}: ${filePath}`);

    // Get current file size to start from end
    let lastSize = fs.statSync(filePath).size;

    const watcher = fs.watchFile(filePath, { interval: 500 }, (curr, prev) => {
      if (curr.size > lastSize) {
        // Read new content
        const stream = fs.createReadStream(filePath, {
          start: lastSize,
          end: curr.size - 1
        });

        let newContent = '';
        stream.on('data', chunk => {
          newContent += chunk.toString();
        });

        stream.on('end', () => {
          this.processLogContent(name, newContent);
        });

        lastSize = curr.size;
      }
    });

    this.watchers.set(name, watcher);
  }

  processLogContent(logName, content) {
    const lines = content.trim().split('\n').filter(line => line.trim());

    lines.forEach(line => {
      try {
        // Try to parse as JSON
        const logEntry = JSON.parse(line);
        this.formatLogEntry(logName, logEntry);
      } catch {
        // Handle plain text logs
        this.formatPlainLog(logName, line);
      }
    });
  }

  formatLogEntry(logName, entry) {
    const timestamp = new Date(entry.timestamp || Date.now()).toLocaleTimeString();
    const level = entry.level || 'INFO';
    const message = entry.message || entry.msg || 'No message';

    // Color coding based on level
    const colors = {
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      INFO: '\x1b[36m',    // Cyan
      DEBUG: '\x1b[90m'    // Gray
    };
    const reset = '\x1b[0m';
    const color = colors[level.toUpperCase()] || colors.INFO;

    console.log(`${color}[${timestamp}] ${logName.toUpperCase()}: ${level} - ${message}${reset}`);

    // Show additional details for errors
    if (level === 'ERROR' && entry.error) {
      console.log(`${colors.ERROR}  └─ ${entry.error.stack || entry.error}${reset}`);
    }
  }

  formatPlainLog(logName, line) {
    const timestamp = new Date().toLocaleTimeString();
    const isError = this.errorPatterns.some(pattern => pattern.test(line));
    
    const color = isError ? '\x1b[31m' : '\x1b[37m'; // Red for errors, white for others
    const reset = '\x1b[0m';

    console.log(`${color}[${timestamp}] ${logName.toUpperCase()}: ${line}${reset}`);
  }
}

// Show usage if no arguments
if (process.argv.length === 2) {
  console.log(`
🔍 Log Monitor Usage:

npm run monitor              - Monitor all logs in real-time
npm run monitor:performance  - Monitor performance logs only
npm run monitor:health       - Check system health status

Examples:
  npm run monitor                    # Start real-time monitoring
  node scripts/monitor-logs.js       # Direct node execution
  
Log Files:
  - ${LOG_FILES.server}
  - ${LOG_FILES.error}  
  - ${LOG_FILES.performance}
`);
  process.exit(0);
}

// Start monitoring
const monitor = new LogMonitor();
monitor.start();