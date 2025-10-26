#!/usr/bin/env node

/**
 * Test Redis Caching Integration
 * Tests the main server with Redis caching for ticket generation
 */

import { setTimeout } from 'timers/promises';

// Mock request data for testing
const testRequestData = {
  frameData: {
    component_name: 'Button Component',
    nodeCount: 15,
    dimensions: { width: 200, height: 50 }
  },
  platform: 'jira',
  documentType: 'component',
  teamStandards: {
    tech_stack: 'React TypeScript'
  }
};

async function testTicketCaching() {
  console.log('🚀 Testing Redis Caching Integration...\n');

  try {
    // Test 1: Make a request to generate a ticket
    console.log('1. Generating initial ticket (should be cached)...');
    const response1 = await makeTicketRequest(testRequestData);
    console.log(`   ✅ Response 1 received: ${response1.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   📝 Ticket summary: ${response1.ticket?.summary?.substring(0, 60)}...`);
    const time1 = response1.timestamp;

    // Wait a moment
    await setTimeout(1000);

    // Test 2: Make the same request (should use cache)
    console.log('\n2. Making identical request (should use cache)...');
    const response2 = await makeTicketRequest(testRequestData);
    console.log(`   ✅ Response 2 received: ${response2.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   🕐 Time comparison: ${time1} vs ${response2.timestamp}`);
    const time2 = response2.timestamp;

    // Check if tickets are identical (from cache)
    const ticketsMatch = JSON.stringify(response1.ticket) === JSON.stringify(response2.ticket);
    console.log(`   💾 Cache hit: ${ticketsMatch ? 'YES' : 'NO'}`);

    // Test 3: Make a request with different data (should not use cache)
    console.log('\n3. Making request with different component name...');
    const differentRequest = {
      ...testRequestData,
      frameData: {
        ...testRequestData.frameData,
        component_name: 'Card Component'
      }
    };
    
    const response3 = await makeTicketRequest(differentRequest);
    console.log(`   ✅ Response 3 received: ${response3.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   📝 Different ticket summary: ${response3.ticket?.summary?.substring(0, 60)}...`);
    
    // Verify it's a different ticket
    const differentTicket = JSON.stringify(response1.ticket) !== JSON.stringify(response3.ticket);
    console.log(`   🆕 Different ticket generated: ${differentTicket ? 'YES' : 'NO'}`);

    console.log('\n🎉 Redis caching test completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Cache hit test: ${ticketsMatch ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   - Different data test: ${differentTicket ? '✅ PASSED' : '❌ FAILED'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Make a ticket generation request to the server
 */
async function makeTicketRequest(requestData) {
  const response = await fetch('http://localhost:3000/api/generate-ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/');
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'healthy') {
        console.log('✅ Server is running on http://localhost:3000');
        return true;
      }
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start it with: npm start');
    console.log('   Or: node app/main.js');
    return false;
  }
}

// Run the test
async function runTest() {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (serverRunning) {
    await testTicketCaching();
  } else {
    console.log('\n📝 To run this test:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Run this test: node test-caching-integration.js');
  }
}

runTest().catch(console.error);