#!/usr/bin/env node
/**
 * Debug Template Test Script
 * Run this to test template generation with full debugging output
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

async function runDebugTest() {
  console.log('🧪 STARTING DEBUG TEMPLATE TEST');
  console.log('================================');

  // Start the server
  console.log('📋 Step 1: Starting server...');
  const server = spawn('npm', ['start'], { 
    stdio: 'pipe',
    cwd: process.cwd()
  });

  // Capture server output
  server.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  server.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  // Wait for server to start
  console.log('⏳ Waiting for server to initialize...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Run test
  console.log('\n🧪 Step 2: Running template generation test...');
  const testPayload = {
    enhancedFrameData: [{
      id: 'debug-test-final',
      name: 'DebugTestComponent',
      hierarchy: { componentCount: 2 }
    }],
    screenshot: 'https://example.com/debug.png',
    figmaUrl: 'https://www.figma.com/file/abc123/Debug-Project?node-id=123:456',
    techStack: 'React, TypeScript, Styled Components',
    documentType: 'component',
    platform: 'jira',
    useAI: false
  };

  try {
    const response = await exec(`curl -s -X POST http://localhost:3000/api/generate-ai-ticket-direct \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(testPayload)}'`);
    
    console.log('\n✅ API Response received');
    const result = JSON.parse(response.stdout);
    
    console.log('\n📊 RESPONSE ANALYSIS:');
    console.log('Success:', result.success);
    console.log('Template ID:', result.metadata?.template);
    console.log('Content Length:', result.generatedTicket?.length);
    
    // Check for base template inheritance
    const hasResources = result.generatedTicket?.includes('## 🔗 Resources');
    const hasEmptyResources = result.generatedTicket?.includes('- ****: []()');
    
    console.log('\n🔍 BASE TEMPLATE ANALYSIS:');
    console.log('Has Resources Section:', hasResources);
    console.log('Resources Are Empty:', hasEmptyResources);
    
    if (hasEmptyResources) {
      console.log('\n❌ ISSUE: Resources are empty - base template variables not resolving');
    } else {
      console.log('\n✅ SUCCESS: Resources populated from base template');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Clean up
  console.log('\n🧹 Cleaning up...');
  server.kill();
  process.exit(0);
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

runDebugTest().catch(console.error);