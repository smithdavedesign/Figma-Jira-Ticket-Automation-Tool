#!/usr/bin/env node

/**
 * Final comprehensive test of AI-enhanced ticket generation
 */

const testAIGeneration = async () => {
  console.log('🧪 Testing AI-Enhanced Ticket Generation\n');

  const testCases = [
    {
      name: 'AI Services Status',
      method: 'test_ai_services',
      params: {}
    },
    {
      name: 'AI Ticket Generation',
      method: 'generate_ai_ticket',
      params: {
        title: 'Navigation Accessibility Enhancement',
        description: 'Improve keyboard navigation and screen reader support for better accessibility',
        category: 'Accessibility',
        priority: 'High',
        techStack: 'React, TypeScript, Tailwind CSS',
        figmaUrl: 'https://figma.com/file/test456/Navigation-Components'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await fetch('http://localhost:3000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: testCase.method,
          params: testCase.params
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.content && result.content[0]) {
        console.log(result.content[0].text);
      } else {
        console.log('✅ Success:', JSON.stringify(result, null, 2));
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Test suite completed!');
};

testAIGeneration().catch(console.error);