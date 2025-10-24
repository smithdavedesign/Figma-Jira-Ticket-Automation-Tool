#!/usr/bin/env node

/**
 * Demo Runner for MCP Data Layer
 * 
 * This script demonstrates the enhanced hierarchical extraction capabilities
 * and shows what kind of structured data we can extract from Figma files.
 */

import { runMCPDemo, exampleUsage } from './demo.mjs';

console.log('🚀 MCP Data Layer Demo Runner');
console.log('==============================\n');

async function testMCPServer() {
  console.log('🧪 Testing live MCP server integration...\n');
  
  // Test the live MCP server with a properly formatted URL
  const testUrl = 'https://www.figma.com/file/abc123def456/Demo-Project';
  
  try {
    console.log(`📡 Testing MCP server at http://localhost:3000`);
    console.log(`🎯 Test URL: ${testUrl}\n`);
    
    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'analyze_project',
        params: { figmaUrl: testUrl }
      })
    });
    
    const result = await response.json();
    
    console.log('✅ MCP Server Response:');
    console.log('=======================');
    
    if (result.isError) {
      console.log('⚠️ Expected demo response (no real file):');
      console.log(result.content[0].text);
    } else {
      console.log(result.content[0].text);
    }
    
    console.log('\n🎉 MCP Server is working!');
    console.log('💡 To test with a real Figma file, replace the URL above with your actual Figma file URL\n');
    
  } catch (error) {
    console.error('❌ MCP Server test failed:', error.message);
    console.log('🔧 Make sure the server is running: npm run dev\n');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Running example usage...\n');
    await exampleUsage();
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test live MCP server integration
    await testMCPServer();
    return;
  }
  
  const [figmaFileKey, ...nodeIds] = args;
  
  console.log(`🎯 Running demo with file key: ${figmaFileKey}`);
  if (nodeIds.length > 0) {
    console.log(`📍 Targeting nodes: ${nodeIds.join(', ')}`);
  }
  console.log('');
  
  try {
    const result = await runMCPDemo(figmaFileKey, nodeIds.length > 0 ? nodeIds : undefined);
    
    console.log('\n🔄 Raw Demo Data Structure:');
    console.log('============================');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Handle process exit gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Demo interrupted. Goodbye!');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});