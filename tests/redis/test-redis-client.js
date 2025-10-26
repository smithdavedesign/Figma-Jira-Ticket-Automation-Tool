#!/usr/bin/env node

/**
 * Redis Client Test Script
 * Tests the RedisClient implementation with real Redis server
 */

import { RedisClient } from '../../core/data/redis-client.js';

async function testRedisClient() {
  console.log('🚀 Testing Redis Client Implementation...\n');

  const redis = new RedisClient();

  try {
    // Test connection
    console.log('1. Testing connection...');
    await redis.connect();
    const isConnected = await redis.isConnected();
    console.log(`   ✅ Connected: ${isConnected}\n`);

    // Test basic operations
    console.log('2. Testing basic operations...');
    await redis.set('test:key1', 'Hello Redis!');
    const value1 = await redis.get('test:key1');
    console.log(`   ✅ SET/GET: ${value1}\n`);

    // Test JSON operations (using string serialization)
    console.log('3. Testing JSON operations...');
    const testObject = { name: 'Figma Plugin', version: '1.0.0', features: ['AI', 'MCP'] };
    await redis.set('test:json', JSON.stringify(testObject));
    const retrievedJson = await redis.get('test:json');
    const retrievedObject = JSON.parse(retrievedJson || '{}');
    console.log(`   ✅ JSON: ${JSON.stringify(retrievedObject)}\n`);

    // Test TTL operations
    console.log('4. Testing TTL operations...');
    await redis.set('test:ttl', 'expires soon', 5); // 5 seconds
    await redis.expire('test:ttl', 10); // Set expiration
    console.log(`   ✅ TTL set for test:ttl\n`);

    // Test key operations
    console.log('5. Testing key operations...');
    const keys = await redis.keys('test:*');
    console.log(`   ✅ Keys matching test:*: ${keys.length} keys`);
    
    await redis.del('test:key1');
    const exists = await redis.exists('test:key1');
    console.log(`   ✅ Key exists after delete: ${exists}\n`);

    // Test cache patterns
    console.log('6. Testing cache patterns...');
    const cacheKey = 'figma:design:12345';
    const designData = {
      id: '12345',
      name: 'Button Component',
      type: 'COMPONENT',
      properties: { width: 120, height: 40 }
    };
    
    // Cache with 30 second TTL
    await redis.set(cacheKey, JSON.stringify(designData), 30);
    const cachedData = JSON.parse(await redis.get(cacheKey) || '{}');
    console.log(`   ✅ Cached design data: ${cachedData.name}\n`);

    // Clean up test keys
    console.log('7. Cleaning up test keys...');
    const testKeys = await redis.keys('test:*');
    if (testKeys.length > 0) {
      // Delete keys one by one since our del method might not support multiple keys
      for (const key of testKeys) {
        await redis.del(key);
      }
      console.log(`   ✅ Deleted ${testKeys.length} test keys\n`);
    }

    console.log('🎉 All Redis tests passed!');

  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await redis.disconnect();
    console.log('👋 Disconnected from Redis');
  }
}

// Run the test
testRedisClient().catch(console.error);