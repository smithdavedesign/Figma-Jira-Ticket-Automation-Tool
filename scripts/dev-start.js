#!/usr/bin/env node

/**
 * Streamlined Development Startup Script
 * 
 * This script provides a single command to start all development servers
 * with proper error handling and automatic restarts.
 */

import { spawn, fork } from 'child_process';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SERVERS = {
  mcp: {
    name: '🤖 MCP Server',
    port: 3000,
    command: 'node',
    args: ['app/server.js'], // Updated for MVC structure
    cwd: path.join(__dirname, '..'),
    color: '\x1b[36m' // Cyan
  },
  ui: {
    name: '🎨 UI Server', 
    port: 8102,
    command: 'python3',
    args: ['-m', 'http.server', '8102'],
    cwd: __dirname,
    color: '\x1b[35m' // Magenta
  }
};

const RESET = '\x1b[0m';

let processes = new Map();

// Cleanup function
function cleanup() {
  console.log('\n🛑 Shutting down all servers gracefully...\n');
  
  processes.forEach((proc, name) => {
    if (proc && !proc.killed) {
      console.log(`📦 Stopping ${name}...`);
      proc.kill('SIGTERM');
    }
  });
  
  // Force kill after 5 seconds
  setTimeout(() => {
    processes.forEach((proc, name) => {
      if (proc && !proc.killed) {
        console.log(`🔨 Force killing ${name}...`);
        proc.kill('SIGKILL');
      }
    });
    process.exit(0);
  }, 5000);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Check if port is available
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

// Kill process on port
function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const kill = spawn('lsof', ['-ti', `:${port}`]);
    let pid = '';
    
    kill.stdout.on('data', (data) => {
      pid += data.toString();
    });
    
    kill.on('close', (code) => {
      if (pid.trim()) {
        const killProc = spawn('kill', ['-9', pid.trim()]);
        killProc.on('close', () => {
          console.log(`💀 Killed process ${pid.trim()} on port ${port}`);
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

// Start a server with auto-restart
async function startServer(key, config) {
  const { name, port, command, args, cwd, color } = config;
  
  // Clean up port first
  if (!(await isPortAvailable(port))) {
    console.log(`🧹 Port ${port} is busy, cleaning up...`);
    await killProcessOnPort(port);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  function start() {
    console.log(`${color}🚀 Starting ${name} on port ${port}${RESET}`);
    
    const proc = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });
    
    processes.set(key, proc);
    
    // Prefix output with server name
    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.log(`${color}[${name}]${RESET} ${line}`);
      });
    });
    
    proc.stderr.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        console.error(`${color}[${name} ERR]${RESET} ${line}`);
      });
    });
    
    proc.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ ${name} exited with code ${code}`);
        console.log(`🔄 Restarting ${name} in 3 seconds...`);
        setTimeout(start, 3000);
      } else {
        console.log(`✅ ${name} stopped gracefully`);
      }
    });
    
    proc.on('error', (err) => {
      console.error(`💥 ${name} error:`, err.message);
      console.log(`🔄 Restarting ${name} in 5 seconds...`);
      setTimeout(start, 5000);
    });
  }
  
  start();
}

// Health check
async function healthCheck() {
  console.log('\n🏥 Health Check Results:');
  
  for (const [key, config] of Object.entries(SERVERS)) {
    try {
      const response = await fetch(`http://localhost:${config.port}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      }).catch(() => null);
      
      if (response && response.ok) {
        console.log(`✅ ${config.name} - http://localhost:${config.port}`);
      } else {
        console.log(`❌ ${config.name} - Not responding`);
      }
    } catch (error) {
      console.log(`❌ ${config.name} - Error: ${error.message}`);
    }
  }
  console.log('');
}

// Main startup
async function main() {
  console.log(`
🎯 Figma AI Ticket Generator - Development Environment
=======================================================

Starting all servers with auto-restart capability...

`);
  
  // Start all servers
  for (const [key, config] of Object.entries(SERVERS)) {
    await startServer(key, config);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Stagger startup
  }
  
  // Health check after startup
  setTimeout(healthCheck, 5000);
  
  // Show instructions
  console.log(`
📋 Development Commands:
   🔍 Health Check: curl http://localhost:3000
   🎨 UI Interface: http://localhost:8102/ui/test/test-figma-integration.html
   🧪 Test MCP: curl -X POST http://localhost:3000/ -H "Content-Type: application/json" -d '{"method":"analyze_project","params":{"figmaUrl":"https://figma.com/file/test"}}'

Press Ctrl+C to stop all servers
`);
}

main().catch(console.error);