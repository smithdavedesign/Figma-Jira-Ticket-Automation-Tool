#!/usr/bin/env node

/**
 * Simple Redis Connection Test
 * Direct test with ioredis to debug connection issues
 */

import Redis from 'ioredis';

async function testDirectRedis() {
  console.log('🔍 Testing direct Redis connection with ioredis...\n');

  // Create Redis instance with connection details
  const redis = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    lazyConnect: true
  });

  try {
    console.log('1. Connecting to Redis...');
    await redis.connect();
    console.log('   ✅ Connected successfully');

    console.log('2. Testing PING...');
    const pong = await redis.ping();
    console.log(`   ✅ Ping response: ${pong}`);

    console.log('3. Testing SET/GET...');
    await redis.set('test-key', 'Hello from Node.js!');
    const value = await redis.get('test-key');
    console.log(`   ✅ GET result: ${value}`);

    console.log('4. Cleaning up...');
    await redis.del('test-key');
    console.log('   ✅ Test key deleted');

    console.log('\n🎉 Direct Redis connection successful!');

  } catch (error) {
    console.error('❌ Direct Redis connection failed:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Stack:', error.stack);
  } finally {
    await redis.disconnect();
    console.log('👋 Disconnected from Redis');
  }
}

// Run the test
testDirectRedis().catch(console.error);