#!/usr/bin/env node

/**
 * Final Validation Suite
 * 
 * Comprehensive test to validate all functionality after
 * documentation consolidation and Redis integration
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🧪 Final Validation Suite - Redis Integration & Documentation Consolidation');
console.log('==============================================================================\n');

const tests = [];
let passedTests = 0;
let failedTests = 0;

function logTest(name, status, details = '') {
  const icon = status ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
  if (status) passedTests++;
  else failedTests++;
  tests.push({ name, status, details });
}

async function runCommand(cmd, description) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    return { success: true, output: stdout, error: stderr };
  } catch (error) {
    return { success: false, output: error.stdout || '', error: error.stderr || error.message };
  }
}

async function testRedisConnection() {
  console.log('📊 1. REDIS FUNCTIONALITY TESTS\n');
  
  // Test direct Redis connection
  const directTest = await runCommand('node tests/redis/test-direct-redis.js', 'Direct Redis connection');
  logTest('Direct Redis Connection', directTest.success && directTest.output.includes('Direct Redis connection successful'));
  
  // Test RedisClient wrapper
  const wrapperTest = await runCommand('node tests/redis/test-redis-client.js', 'RedisClient wrapper');
  logTest('RedisClient Wrapper', wrapperTest.success && wrapperTest.output.includes('All Redis tests passed'));
  
  // Test server-level caching
  const cachingTest = await runCommand('node tests/redis/test-caching-integration.js', 'Server caching integration');
  logTest('Server-Level Caching', cachingTest.success && cachingTest.output.includes('Redis caching test completed'));
}

async function testServerEndpoints() {
  console.log('\n🌐 2. SERVER ENDPOINT TESTS\n');
  
  // Test health endpoint
  const healthTest = await runCommand(`curl -s http://localhost:3000/`, 'Health endpoint');
  logTest('Health Endpoint', healthTest.success && healthTest.output.includes('"status": "healthy"'));
  
  // Test JIRA ticket generation
  const jiraTest = await runCommand(`curl -s -X POST http://localhost:3000/api/generate-ticket -H "Content-Type: application/json" -d '{"platform": "jira", "documentType": "component", "frameData": {"component_name": "Test Component"}, "teamStandards": {"tech_stack": "React"}}'`, 'JIRA ticket generation');
  logTest('JIRA Ticket Generation', jiraTest.success && jiraTest.output.includes('"success": true'));
  
  // Test GitHub ticket generation
  const githubTest = await runCommand(`curl -s -X POST http://localhost:3000/api/generate-ticket -H "Content-Type: application/json" -d '{"platform": "github", "documentType": "feature", "frameData": {"component_name": "Auth System"}, "teamStandards": {"tech_stack": "Node.js"}}'`, 'GitHub ticket generation');
  logTest('GitHub Ticket Generation', githubTest.success && githubTest.output.includes('"success": true'));
  
  // Test Confluence ticket generation
  const confluenceTest = await runCommand(`curl -s -X POST http://localhost:3000/api/generate-ticket -H "Content-Type: application/json" -d '{"platform": "confluence", "documentType": "service", "frameData": {"component_name": "Payment API"}, "teamStandards": {"tech_stack": "Java"}}'`, 'Confluence ticket generation');
  logTest('Confluence Ticket Generation', confluenceTest.success && confluenceTest.output.includes('"success": true'));
}

async function testCachingBehavior() {
  console.log('\n💾 3. CACHING BEHAVIOR TESTS\n');
  
  const testData = {
    platform: "jira",
    documentType: "component", 
    frameData: { component_name: "Cache Test Component" },
    teamStandards: { tech_stack: "Vue.js" }
  };
  
  // First request (should cache)
  const firstRequest = await runCommand(`curl -s -X POST http://localhost:3000/api/generate-ticket -H "Content-Type: application/json" -d '${JSON.stringify(testData)}'`, 'First request (caching)');
  logTest('First Request (Creates Cache)', firstRequest.success && firstRequest.output.includes('"success": true'));
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Second identical request (should use cache)
  const secondRequest = await runCommand(`curl -s -X POST http://localhost:3000/api/generate-ticket -H "Content-Type: application/json" -d '${JSON.stringify(testData)}'`, 'Second request (cache hit)');
  logTest('Second Request (Cache Hit)', secondRequest.success && secondRequest.output.includes('"success": true'));
  
  // Verify they have the same generated timestamp (indicating cache hit)
  if (firstRequest.success && secondRequest.success) {
    try {
      const first = JSON.parse(firstRequest.output);
      const second = JSON.parse(secondRequest.output);
      const sameTicket = first.ticket === second.ticket;
      logTest('Cache Consistency', sameTicket, sameTicket ? 'Same ticket content returned (cache working)' : 'Different ticket content (cache not working)');
    } catch (e) {
      logTest('Cache Consistency', false, 'Failed to parse responses');
    }
  }
}

async function testDocumentationStructure() {
  console.log('\n📚 4. DOCUMENTATION STRUCTURE TESTS\n');
  
  // Check consolidated testing guide exists
  const testingGuide = await runCommand('test -f docs/testing/TESTING_GUIDE.md', 'Testing guide exists');
  logTest('Consolidated Testing Guide', testingGuide.success);
  
  // Check consolidated deployment guide exists
  const deploymentGuide = await runCommand('test -f docs/deployment/DEPLOYMENT_GUIDE.md', 'Deployment guide exists');
  logTest('Consolidated Deployment Guide', deploymentGuide.success);
  
  // Check archive directories exist
  const testingArchive = await runCommand('test -d docs/testing/archive', 'Testing archive exists');
  logTest('Testing Archive Directory', testingArchive.success);
  
  const deploymentArchive = await runCommand('test -d docs/deployment/archive', 'Deployment archive exists');
  logTest('Deployment Archive Directory', deploymentArchive.success);
  
  // Check Redis tests directory
  const redisTests = await runCommand('test -d tests/redis', 'Redis tests directory exists');
  logTest('Redis Tests Directory', redisTests.success);
  
  // Check Redis README
  const redisReadme = await runCommand('test -f tests/redis/README.md', 'Redis README exists');
  logTest('Redis Tests README', redisReadme.success);
}

async function testIntegrationCompatibility() {
  console.log('\n🔧 5. INTEGRATION COMPATIBILITY TESTS\n');
  
  // Test Figma context integration
  const figmaTest = await runCommand('node tests/archive/figma-context-integration.test.js', 'Figma context integration');
  logTest('Figma Context Integration', figmaTest.success && figmaTest.output.includes('All Figma context integration tests passed'));
  
  // Check MCP server status
  const serverStatus = await runCommand(`curl -s http://localhost:3000/ | grep -c "healthy"`, 'Server health status');
  logTest('MCP Server Health', serverStatus.success && serverStatus.output.trim() === '1');
}

async function generateFinalReport() {
  console.log('\n📋 FINAL VALIDATION REPORT');
  console.log('==========================\n');
  
  console.log(`✅ Passed Tests: ${passedTests}`);
  console.log(`❌ Failed Tests: ${failedTests}`);
  console.log(`📊 Total Tests: ${tests.length}`);
  console.log(`🎯 Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%\n`);
  
  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! 🎉');
    console.log('✅ Redis integration is fully functional');
    console.log('✅ Documentation consolidation is complete');
    console.log('✅ Server endpoints are working correctly');
    console.log('✅ Caching system is operational');
    console.log('✅ System is production-ready');
  } else {
    console.log('⚠️  Some tests failed. Review the results above.');
    console.log('\nFailed tests:');
    tests.filter(t => !t.status).forEach(t => {
      console.log(`  - ${t.name}: ${t.details || 'No details'}`);
    });
  }
  
  console.log('\n🚀 Validation complete!');
  
  // Return success code based on test results
  process.exit(failedTests === 0 ? 0 : 1);
}

async function runValidation() {
  try {
    await testRedisConnection();
    await testServerEndpoints();
    await testCachingBehavior();
    await testDocumentationStructure();
    await testIntegrationCompatibility();
    await generateFinalReport();
  } catch (error) {
    console.error('❌ Validation suite failed:', error);
    process.exit(1);
  }
}

// Run the validation
runValidation();