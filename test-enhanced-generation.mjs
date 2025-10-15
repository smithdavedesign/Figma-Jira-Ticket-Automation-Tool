#!/usr/bin/env node

/**
 * Test Enhanced Ticket Generation with Boilerplate Code
 */

const testEnhancedTicketGeneration = async () => {
  const payload = {
    method: 'generate_enhanced_ticket',
    params: {
      figmaUrl: 'https://www.figma.com/design/example/test-frame',
      projectContext: 'User dashboard component for analytics platform',
      techStack: {
        frontend: {
          framework: 'react',
          styling: 'tailwind',
          stateManagement: 'zustand',
          testing: 'jest'
        },
        backend: {
          language: 'typescript',
          framework: 'express'
        },
        deployment: {
          platform: 'vercel'
        }
      },
      options: {
        includeTests: true,
        includeStorybook: true,
        includeAccessibility: true,
        includeResponsive: true,
        testing: 'jest',
        componentLibrary: 'chakra-ui'
      }
    }
  };

  try {
    console.log('🧪 Testing Enhanced Ticket Generation...');
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ Enhanced Ticket Generated Successfully!');
      console.log('\n📄 TICKET CONTENT:');
      console.log(result.ticket);
      console.log('\n⚛️ COMPONENT CODE:');
      console.log(result.boilerplateCode.component);
      console.log('\n🎨 STYLES:');
      console.log(result.boilerplateCode.styles);
      
      if (result.boilerplateCode.tests) {
        console.log('\n🧪 TESTS:');
        console.log(result.boilerplateCode.tests);
      }
      
      if (result.boilerplateCode.story) {
        console.log('\n📚 STORYBOOK:');
        console.log(result.boilerplateCode.story);
      }
    } else {
      console.error('❌ Request failed:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error details:', error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run test if this is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEnhancedTicketGeneration();
}

export { testEnhancedTicketGeneration };