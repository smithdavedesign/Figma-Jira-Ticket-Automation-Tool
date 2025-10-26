/**
 * 🌍 Global Test Setup
 * Runs once before all test suites
 */

import { createServer } from 'http';
import logger from '../../core/logging/logger.js';

export async function setup() {
  console.log('🚀 Setting up global test environment...');
  
  // Initialize test logger
  process.env.LOG_LEVEL = 'ERROR';
  process.env.LOG_TO_FILE = 'false';
  
  // Start mock MCP server for testing
  const mockServer = createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        name: "figma-ai-ticket-generator",
        version: "1.0.0",
        tools: [
          { name: "analyze_project" },
          { name: "generate_tickets" },
          { name: "check_compliance" },
          { name: "generate_enhanced_ticket" }
        ],
        storage: { redis: { connected: true, memory_usage: "12MB" } }
      }));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  return new Promise((resolve) => {
    mockServer.listen(3001, () => {
      console.log('🧪 Mock MCP server started on port 3001');
      resolve();
    });
    
    // Global teardown
    global.__MOCK_SERVER__ = mockServer;
  });
}

export async function teardown() {
  console.log('🧹 Cleaning up global test environment...');
  
  if (global.__MOCK_SERVER__) {
    global.__MOCK_SERVER__.close();
    console.log('🛑 Mock MCP server stopped');
  }
  
  // Clean up test artifacts
  logger.info('🧪 Test session completed');
}