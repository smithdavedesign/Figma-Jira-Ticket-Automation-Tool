#!/usr/bin/env node

/**
 * 🎯 Figma AI Ticket Generator - Live Demo Script
 * 
 * Tests the complete workflow:
 * 1. Server health check
 * 2. Template-based ticket generation
 * 3. AI-enhanced generation (if available)
 * 4. Performance metrics
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SERVER_URL = 'http://localhost:3000';
const DEMO_FIGMA_URL = 'https://www.figma.com/file/demo';
const DEMO_NODE_ID = '123:456';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${colors.bold}${message}${colors.reset}`, 'blue');
}

async function makeRequest(endpoint, method = 'GET', data = null) {
  const startTime = Date.now();
  
  try {
    let curlCmd = `curl -s -w "\\n%{http_code}" -X ${method} ${SERVER_URL}${endpoint}`;
    
    if (data) {
      curlCmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
    }
    
    const { stdout } = await execAsync(curlCmd);
    const lines = stdout.trim().split('\n');
    const statusCode = lines.pop();
    const response = lines.join('\n');
    
    const duration = Date.now() - startTime;
    
    return {
      statusCode: parseInt(statusCode),
      response: response || '{}',
      duration
    };
  } catch (error) {
    return {
      statusCode: 0,
      response: `Error: ${error.message}`,
      duration: Date.now() - startTime
    };
  }
}

async function checkServerHealth() {
  logStep(1, 'Checking Server Health');
  
  const result = await makeRequest('/health');
  
  if (result.statusCode === 200) {
    log('✅ Server is healthy', 'green');
    log(`   Response time: ${result.duration}ms`);
    
    try {
      const health = JSON.parse(result.response);
      log(`   Services: ${health.services || 'N/A'}`);
      log(`   Routes: ${health.routes || 'N/A'}`);
    } catch (e) {
      log('   Server responded with 200 OK');
    }
  } else {
    log(`❌ Server health check failed (${result.statusCode})`, 'red');
    log(`   Response: ${result.response}`);
    return false;
  }
  
  return true;
}

async function testTemplateGeneration() {
  logStep(2, 'Testing Template-Based Generation');
  
  const requestData = {
    figmaUrl: DEMO_FIGMA_URL,
    nodeId: DEMO_NODE_ID,
    platform: 'jira',
    documentType: 'comp',
    projectContext: {
      name: 'Demo Project',
      tech_stack: ['react', 'typescript']
    }
  };
  
  const result = await makeRequest('/generate/template', 'POST', requestData);
  
  if (result.statusCode === 200) {
    log('✅ Template generation successful', 'green');
    log(`   Response time: ${result.duration}ms`);
    
    try {
      const ticket = JSON.parse(result.response);
      log(`   Generated ticket length: ${ticket.content?.length || 0} chars`);
      log(`   Template used: ${ticket.template || 'N/A'}`);
    } catch (e) {
      log('   Response received (parsing failed)');
    }
  } else if (result.statusCode === 404) {
    log('⚠️  Template generation endpoint not implemented yet', 'yellow');
    log('   This is expected - endpoint may need to be created');
  } else {
    log(`❌ Template generation failed (${result.statusCode})`, 'red');
    log(`   Response: ${result.response.substring(0, 200)}...`);
  }
}

async function testAIGeneration() {
  logStep(3, 'Testing AI-Enhanced Generation');
  
  const requestData = {
    figmaUrl: DEMO_FIGMA_URL,
    nodeId: DEMO_NODE_ID,
    platform: 'jira',
    useVisualAnalysis: true
  };
  
  const result = await makeRequest('/generate/ai', 'POST', requestData);
  
  if (result.statusCode === 200) {
    log('✅ AI generation successful', 'green');
    log(`   Response time: ${result.duration}ms`);
    
    try {
      const ticket = JSON.parse(result.response);
      log(`   AI analysis included: ${ticket.aiAnalysis ? 'Yes' : 'No'}`);
      log(`   Visual features detected: ${ticket.visualFeatures?.length || 0}`);
    } catch (e) {
      log('   AI response received (parsing failed)');
    }
  } else if (result.statusCode === 404) {
    log('⚠️  AI generation endpoint not implemented yet', 'yellow');
    log('   This is expected - endpoint may need to be created');
  } else {
    log(`❌ AI generation failed (${result.statusCode})`, 'red');
    log(`   Response: ${result.response.substring(0, 200)}...`);
  }
}

async function testAPIEndpoints() {
  logStep(4, 'Testing Available API Endpoints');
  
  const endpoints = [
    '/api/health',
    '/figma/health', 
    '/test/health'
  ];
  
  for (const endpoint of endpoints) {
    const result = await makeRequest(endpoint);
    
    if (result.statusCode === 200) {
      log(`✅ ${endpoint} - OK (${result.duration}ms)`, 'green');
    } else if (result.statusCode === 404) {
      log(`⚠️  ${endpoint} - Not Found`, 'yellow');
    } else {
      log(`❌ ${endpoint} - Error ${result.statusCode}`, 'red');
    }
  }
}

async function showSystemMetrics() {
  logStep(5, 'System Performance Metrics');
  
  try {
    const { stdout } = await execAsync('ps -p $$ -o pid,vsz,rss,pcpu,comm');
    log('Process metrics:');
    log(stdout);
  } catch (e) {
    log('Could not retrieve process metrics');
  }
  
  // Test template system
  try {
    const { stdout } = await execAsync('find core/ai/templates -name "*.yml" | wc -l');
    const templateCount = stdout.trim();
    log(`📋 Templates available: ${templateCount}`);
  } catch (e) {
    log('Could not count templates');
  }
}

async function main() {
  log(`${colors.bold}🎯 Figma AI Ticket Generator - Live Demo${colors.reset}`, 'blue');
  log(`Testing server at: ${SERVER_URL}`);
  log('='.repeat(60));
  
  // Check if server is running
  const isHealthy = await checkServerHealth();
  
  if (!isHealthy) {
    log('\n❌ Server is not responding. Please start it with: npm start', 'red');
    process.exit(1);
  }
  
  // Run all tests
  await testTemplateGeneration();
  await testAIGeneration();
  await testAPIEndpoints();
  await showSystemMetrics();
  
  log(`\n${'='.repeat(60)}`);
  log('🎉 Demo completed! Check results above.', 'green');
  log('\n💡 Next steps:');
  log('   1. Implement missing /generate/* endpoints');
  log('   2. Test with real Figma URLs');
  log('   3. Deploy to production');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`\n❌ Demo failed: ${error.message}`, 'red');
    process.exit(1);
  });
}