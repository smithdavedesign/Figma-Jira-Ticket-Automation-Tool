#!/usr/bin/env node

/**
 * Test Direct AI Generation
 * 
 * This script tests the new direct AI generation endpoint that bypasses the MCP server
 * and uses the Visual Enhanced AI Service with Template Manager directly.
 */

const testParams = {
  enhancedFrameData: [
    {
      id: 'I5921:26923;2587:12464',
      name: '06 Case Studies',
      type: 'INSTANCE',
      designTokens: {
        colors: [
          { name: 'primary-blue', value: '#667eea', usage: 3 },
          { name: 'text-dark', value: '#1a202c', usage: 5 },
          { name: 'background', value: '#ffffff', usage: 1 }
        ],
        fonts: [
          { fontFamily: 'Inter', fontSize: 16, usage: 4 },
          { fontFamily: 'Inter', fontSize: 24, usage: 2 }
        ],
        spacing: [
          { name: 'sm', value: 8, usage: 6 },
          { name: 'md', value: 16, usage: 8 },
          { name: 'lg', value: 24, usage: 4 }
        ]
      }
    }
  ],
  screenshot: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/test-screenshot.png',
  figmaUrl: 'https://www.figma.com/file/BioUSVD6t51ZNeG0g9AcNz/Solidigm%20Dotcom%203.0%20-%20Dayani',
  techStack: 'AEM 6.5 with HTL (HTML Template Language), Apache Sling framework, OSGi bundles, JCR repository, Touch UI components',
  documentType: 'component',
  platform: 'jira',
  projectName: 'Solidigm Dotcom 3.0',
  fileContext: {
    fileName: 'Solidigm Dotcom 3.0 - Dayani',
    fileKey: 'BioUSVD6t51ZNeG0g9AcNz',
    pageName: 'Design Page'
  },
  useAI: true,
  teamStandards: {
    tech_stack: 'AEM 6.5',
    testing_framework: 'junit-mockito',
    accessibility_level: 'wcag-aa'
  }
};

async function testDirectAIGeneration() {
  console.log('🧪 Testing Direct AI Generation...');
  console.log('📊 Test Parameters:', {
    frameCount: testParams.enhancedFrameData.length,
    componentName: testParams.enhancedFrameData[0].name,
    techStack: testParams.techStack,
    documentType: testParams.documentType,
    platform: testParams.platform,
    hasScreenshot: !!testParams.screenshot,
    hasDesignTokens: !!testParams.enhancedFrameData[0].designTokens
  });

  try {
    const response = await fetch('http://localhost:3000/api/generate-ai-ticket-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testParams)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ Direct AI Generation Test Results:');
    console.log('🎯 Success:', result.success);
    console.log('📝 Source:', result.source);
    console.log('📊 Confidence:', result.confidence);
    console.log('⏱️ Timestamp:', result.metadata?.timestamp);
    console.log('🔧 Tech Stack:', result.metadata?.techStack);
    console.log('📋 Document Type:', result.metadata?.documentType);
    console.log('🏗️ Platform:', result.metadata?.platform);
    
    if (result.generatedTicket) {
      console.log('\n📄 Generated Ticket Preview (first 500 chars):');
      console.log('─'.repeat(60));
      console.log(result.generatedTicket.substring(0, 500) + (result.generatedTicket.length > 500 ? '...' : ''));
      console.log('─'.repeat(60));
      
      // Check for key elements that should be in an AI-generated ticket
      const ticket = result.generatedTicket;
      const hasTitle = ticket.includes('#') || ticket.includes('Case Studies');
      const hasDescription = ticket.toLowerCase().includes('description') || ticket.toLowerCase().includes('implement');
      const hasTechStack = ticket.includes('AEM') || ticket.includes('HTL');
      const hasDesignTokens = ticket.includes('color') || ticket.includes('font') || ticket.includes('spacing');
      const hasAcceptanceCriteria = ticket.toLowerCase().includes('acceptance') || ticket.toLowerCase().includes('criteria');
      
      console.log('\n🔍 Ticket Quality Analysis:');
      console.log(`📝 Has Title: ${hasTitle ? '✅' : '❌'}`);
      console.log(`📋 Has Description: ${hasDescription ? '✅' : '❌'}`);
      console.log(`🔧 Mentions Tech Stack: ${hasTechStack ? '✅' : '❌'}`);
      console.log(`🎨 Includes Design Tokens: ${hasDesignTokens ? '✅' : '❌'}`);
      console.log(`✅ Has Acceptance Criteria: ${hasAcceptanceCriteria ? '✅' : '❌'}`);
      
      const qualityScore = [hasTitle, hasDescription, hasTechStack, hasDesignTokens, hasAcceptanceCriteria].filter(Boolean).length;
      console.log(`📊 Quality Score: ${qualityScore}/5 (${(qualityScore/5*100).toFixed(0)}%)`);
      
      if (qualityScore >= 4) {
        console.log('🎉 EXCELLENT: High-quality AI-generated ticket!');
      } else if (qualityScore >= 3) {
        console.log('👍 GOOD: Decent AI-generated ticket with room for improvement');
      } else {
        console.log('⚠️  NEEDS IMPROVEMENT: Ticket quality below expectations');
      }
    } else {
      console.log('❌ No ticket content generated');
    }

  } catch (error) {
    console.error('❌ Direct AI Generation Test Failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tip: Make sure the server is running on http://localhost:3000');
    } else if (error.message.includes('500')) {
      console.log('💡 Tip: Check server logs for detailed error information');
    }
  }
}

// Run the test
testDirectAIGeneration();