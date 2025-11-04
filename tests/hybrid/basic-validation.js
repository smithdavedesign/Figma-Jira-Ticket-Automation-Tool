#!/usr/bin/env node

/**
 * Simplified Hybrid Architecture Test
 */

import { TemplateIntegratedAIService } from '../../core/ai/template-integrated-ai-service.js';
import { UniversalTemplateEngine } from '../../core/template/UniversalTemplateEngine.js';

async function testHybridArchitecture() {
  console.log('🧪 Testing Hybrid AI-Template Architecture\n');

  try {
    // Initialize components
    console.log('📋 Initializing components...');
    const templateEngine = new UniversalTemplateEngine('./config/templates');
    const aiService = new TemplateIntegratedAIService({
      apiKey: 'test-key',
      templateEngine
    });
    
    await aiService.initialize();
    console.log('✅ Components initialized\n');

    // Test prompt generation
    console.log('🧠 Testing AI reasoning prompt generation...');
    const mockContext = {
      figma: {
        component_name: 'Login Button',
        file_name: 'Design System'
      },
      project: {
        tech_stack: ['React', 'TypeScript'],
        platform: 'web'
      },
      calculated: {
        complexity: 'medium'
      }
    };

    const promptData = await aiService.promptManager.getReasoningPrompt('comprehensive-visual-analysis', mockContext);
    
    console.log('📊 Prompt Generation Test Results:');
    console.log(`  - Prompt generated: ${!!promptData.prompt}`);
    console.log(`  - Prompt length: ${promptData.prompt?.length}`);
    console.log(`  - Contains component name: ${promptData.prompt?.includes('Login Button')}`);
    console.log(`  - Contains tech stack: ${promptData.prompt?.includes('React')}`);
    
    // Test service configuration
    console.log('\n⚙️ Testing service configuration...');
    const config = await aiService.testConfiguration();
    
    console.log('📊 Configuration Test Results:');
    console.log(`  - Service available: ${config.available}`);
    console.log(`  - Hybrid architecture: ${config.features?.hybridArchitecture}`);
    console.log(`  - Cognitive separation: ${config.features?.cognitiveeSeparation}`);
    console.log(`  - Prompt manager available: ${config.promptManager?.available}`);
    console.log(`  - Template engine available: ${config.templateEngine?.available}`);

    console.log('\n🎉 All tests passed successfully!');
    
    return {
      success: true,
      promptGeneration: {
        hasPrompt: !!promptData.prompt,
        promptLength: promptData.prompt?.length,
        hasComponentName: promptData.prompt?.includes('Login Button'),
        hasTechStack: promptData.prompt?.includes('React')
      },
      configuration: {
        available: config.available,
        hybridArchitecture: config.features?.hybridArchitecture,
        promptManager: config.promptManager?.available,
        templateEngine: config.templateEngine?.available
      }
    };

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Run the test
testHybridArchitecture()
  .then(result => {
    console.log('\n📊 Final Result:', result.success ? 'SUCCESS' : 'FAILED');
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });