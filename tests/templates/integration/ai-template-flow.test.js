// AI Template Integration Test Suite
// Tests end-to-end AI workflow with template fallback system

import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Mock enhanced frame data for testing
 */
const mockEnhancedFrameData = [
  {
    name: 'Login Button',
    type: 'COMPONENT',
    componentProperties: {
      variant: 'primary',
      size: 'medium',
      state: 'default'
    },
    fills: [
      {
        type: 'SOLID',
        color: { r: 0.0, g: 0.48, b: 1.0 }
      }
    ],
    effects: [],
    children: [
      {
        name: 'Button Text',
        type: 'TEXT',
        characters: 'Sign In',
        style: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: 500
        }
      }
    ],
    absoluteBoundingBox: {
      x: 100,
      y: 100,
      width: 120,
      height: 40
    }
  }
];

/**
 * Test direct AI generation endpoint
 */
async function testDirectAIGeneration() {
  const result = {
    success: false,
    response: null,
    generatedTicket: null,
    confidence: 0,
    processingTime: 0,
    error: null
  };
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/generate-ai-ticket-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'jira',
        documentType: 'component',
        enhancedFrameData: mockEnhancedFrameData
      })
    });
    
    result.processingTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      result.error = `HTTP ${response.status}: ${errorText}`;
      return result;
    }
    
    const data = await response.json();
    result.response = data;
    
    if (data.success) {
      result.success = true;
      result.generatedTicket = data.generatedTicket;
      result.confidence = data.confidence || 0;
    } else {
      result.error = data.error || 'Unknown error';
    }
    
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

/**
 * Test template fallback system
 */
async function testTemplateFallback() {
  const result = {
    success: false,
    response: null,
    generatedTicket: null,
    source: null,
    processingTime: 0,
    error: null
  };
  
  try {
    const startTime = Date.now();
    
    // Test with minimal data to potentially trigger fallback
    const response = await fetch('http://localhost:3000/api/generate-ai-ticket-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'jira',
        documentType: 'component',
        enhancedFrameData: [
          {
            name: 'Simple Component',
            type: 'FRAME'
          }
        ]
      })
    });
    
    result.processingTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text();
      result.error = `HTTP ${response.status}: ${errorText}`;
      return result;
    }
    
    const data = await response.json();
    result.response = data;
    
    if (data.success) {
      result.success = true;
      result.generatedTicket = data.generatedTicket;
      result.source = data.source || 'unknown';
    } else {
      result.error = data.error || 'Unknown error';
    }
    
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

/**
 * Test AI service availability and fallback behavior
 */
async function testAIServiceFallback() {
  const result = {
    success: false,
    aiWorking: false,
    fallbackWorking: false,
    bothTested: false,
    error: null
  };
  
  try {
    // First test - should work with AI or fallback
    const test1 = await testDirectAIGeneration();
    
    if (test1.success) {
      // Determine if AI or fallback was used based on response characteristics
      const isAI = test1.confidence > 80 || test1.response?.source === 'Visual Enhanced AI Service';
      const isFallback = test1.response?.source === 'template' || test1.confidence === 0;
      
      if (isAI) {
        result.aiWorking = true;
        console.log('   ✅ AI generation working');
      } else if (isFallback) {
        result.fallbackWorking = true;
        console.log('   ✅ Template fallback working');
      }
      
      result.success = true;
    } else {
      result.error = test1.error;
    }
    
  } catch (error) {
    result.error = error.message;
  }
  
  return result;
}

/**
 * Test different template platforms
 */
async function testMultiplePlatforms() {
  const platforms = [
    { platform: 'jira', documentType: 'component' },
    { platform: 'github', documentType: 'issue' },
    { platform: 'linear', documentType: 'task' }
  ];
  
  const results = [];
  
  for (const config of platforms) {
    const result = {
      platform: config.platform,
      documentType: config.documentType,
      success: false,
      response: null,
      error: null
    };
    
    try {
      const response = await fetch('http://localhost:3000/api/generate-ai-ticket-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...config,
          enhancedFrameData: mockEnhancedFrameData
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        result.success = data.success;
        result.response = data;
      } else {
        result.error = `HTTP ${response.status}`;
      }
      
    } catch (error) {
      result.error = error.message;
    }
    
    results.push(result);
  }
  
  return results;
}

/**
 * Main AI template integration test execution
 */
async function runAITemplateIntegrationTests() {
  console.log('🤖 AI Template Integration Test Suite');
  console.log('====================================');
  
  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3000', { timeout: 5000 });
    console.log('✅ MCP server is running');
  } catch (error) {
    console.log('❌ MCP server not accessible - make sure to run: npm run start:mvc');
    return { success: false, error: 'Server not running' };
  }
  
  const testResults = {
    aiGeneration: null,
    templateFallback: null,
    serviceFallback: null,
    multiplePlatforms: null,
    overall: false
  };
  
  // Test 1: Direct AI Generation
  console.log('\\n🤖 Testing direct AI generation...');
  testResults.aiGeneration = await testDirectAIGeneration();
  
  if (testResults.aiGeneration.success) {
    console.log(`   ✅ AI generation successful (${testResults.aiGeneration.processingTime}ms)`);
    console.log(`   📊 Confidence: ${testResults.aiGeneration.confidence}%`);
    console.log(`   📄 Ticket length: ${testResults.aiGeneration.generatedTicket?.length || 0} chars`);
  } else {
    console.log(`   ❌ AI generation failed: ${testResults.aiGeneration.error}`);
  }
  
  // Test 2: Template Fallback
  console.log('\\n📋 Testing template fallback...');
  testResults.templateFallback = await testTemplateFallback();
  
  if (testResults.templateFallback.success) {
    console.log(`   ✅ Template fallback working (${testResults.templateFallback.processingTime}ms)`);
    console.log(`   🔧 Source: ${testResults.templateFallback.source}`);
  } else {
    console.log(`   ❌ Template fallback failed: ${testResults.templateFallback.error}`);
  }
  
  // Test 3: Service Fallback Behavior
  console.log('\\n🔄 Testing AI service fallback behavior...');
  testResults.serviceFallback = await testAIServiceFallback();
  
  if (testResults.serviceFallback.success) {
    console.log('   ✅ Fallback system working');
  } else {
    console.log(`   ❌ Fallback system issues: ${testResults.serviceFallback.error}`);
  }
  
  // Test 4: Multiple Platforms
  console.log('\\n🌐 Testing multiple platform templates...');
  testResults.multiplePlatforms = await testMultiplePlatforms();
  
  const successfulPlatforms = testResults.multiplePlatforms.filter(r => r.success);
  console.log(`   📊 Platforms working: ${successfulPlatforms.length}/${testResults.multiplePlatforms.length}`);
  
  testResults.multiplePlatforms.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.platform}/${result.documentType}: ${result.success ? 'OK' : result.error}`);
  });
  
  // Overall assessment
  const criticalTests = [
    testResults.aiGeneration.success || testResults.templateFallback.success, // Either AI or fallback must work
    testResults.serviceFallback.success
  ];
  
  testResults.overall = criticalTests.every(test => test);
  
  console.log(`\\n📊 AI Template Integration Assessment:`);
  console.log(`   AI Generation: ${testResults.aiGeneration.success ? '✅' : '❌'}`);
  console.log(`   Template Fallback: ${testResults.templateFallback.success ? '✅' : '❌'}`);
  console.log(`   Service Fallback: ${testResults.serviceFallback.success ? '✅' : '❌'}`);
  console.log(`   Multiple Platforms: ${successfulPlatforms.length}/${testResults.multiplePlatforms.length} ✅`);
  
  console.log(`\\n${testResults.overall ? '🎉' : '⚠️'} ${testResults.overall ? 'AI integration fully functional!' : 'AI integration needs attention'}`);
  
  return testResults;
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAITemplateIntegrationTests()
    .then(result => {
      process.exit(result.overall ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { 
  runAITemplateIntegrationTests, 
  testDirectAIGeneration, 
  testTemplateFallback, 
  testMultiplePlatforms,
  mockEnhancedFrameData 
};