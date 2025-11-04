#!/usr/bin/env node

/**
 * Quick debug test for AI Prompt Manager
 */

import { AIPromptManager } from '../core/ai/AIPromptManager.js';

async function debugPromptManager() {
  try {
    console.log('🔍 Debugging AI Prompt Manager...');

    const promptManager = new AIPromptManager();
    await promptManager.initialize();

    const mockContext = {
      figma: {
        component_name: 'Test Button',
        file_name: 'Design System'
      },
      project: {
        tech_stack: ['React', 'TypeScript'],
        platform: 'jira'
      },
      calculated: {
        complexity: 'medium'
      }
    };

    console.log('📋 Mock context:', mockContext);

    const result = await promptManager.getReasoningPrompt('comprehensive-visual-analysis', mockContext);

    console.log('📝 Result structure:', {
      hasPrompt: !!result.prompt,
      promptLength: result.prompt?.length,
      hasMetadata: !!result.metadata,
      promptPreview: result.prompt?.substring(0, 200) + '...'
    });

    console.log('🔍 Does prompt include "Test Button"?', result.prompt?.includes('Test Button'));
    console.log('🔍 Does prompt include "React"?', result.prompt?.includes('React'));

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugPromptManager();