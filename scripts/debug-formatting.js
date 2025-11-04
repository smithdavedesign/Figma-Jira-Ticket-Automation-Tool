#!/usr/bin/env node

// Quick debug to see what's in the prompt that's triggering the validation

import { AIPromptManager } from '../core/ai/AIPromptManager.js';

async function debugPrompt() {
  const promptManager = new AIPromptManager();
  await promptManager.initialize();

  const context = {
    figma: { component_name: 'Debug Test' },
    project: { tech_stack: ['React'] }
  };

  const promptData = await promptManager.getReasoningPrompt('comprehensive-visual-analysis', context);

  console.log('🔍 Checking for formatting characters...');
  console.log('Contains h1.:', promptData.prompt.includes('h1.'));
  console.log('Contains ##:', promptData.prompt.includes('## '));
  console.log('Contains *:', promptData.prompt.includes('*'));
  console.log('Contains ticket:', promptData.prompt.includes('ticket'));

  // Let's look for what's triggering it
  const lines = promptData.prompt.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('##') || line.includes('*') || line.includes('h1.')) {
      console.log(`Line ${i + 1}: ${line}`);
    }
  });
}

debugPrompt();