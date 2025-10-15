#!/usr/bin/env node

import { TechStackParser } from './dist/figma/tech-stack-parser.js';

// Test the natural language tech stack parser
console.log('🧠 Testing Smart Tech Stack Parser\n');

const parser = new TechStackParser();

const testCases = [
  "React with TypeScript, Tailwind CSS, and Jest testing",
  "Vue 3 project using Pinia for state, SCSS styling, deployed on Netlify",
  "Next.js app with Chakra UI components and Playwright e2e tests",
  "Angular application with Material Design and NgRx state management",
  "Full-stack: React frontend + Node.js Express backend with MongoDB",
  "Flutter mobile app with Material Design and Dart",
  "React Native app using Expo and TypeScript with Redux state",
  "Vue 3 with Composition API, styled-components, and Vitest testing"
];

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test Case ${index + 1}: "${testCase}"`);
  console.log('─'.repeat(60));
  
  const result = parser.parse(testCase);
  
  console.log(`🎯 Confidence: ${result.confidence}%`);
  console.log(`⚛️  Frontend: ${result.frontend.framework} + ${result.frontend.styling}`);
  if (result.frontend.stateManagement) {
    console.log(`🔄 State: ${result.frontend.stateManagement}`);
  }
  
  if (result.backend) {
    console.log(`🖥️  Backend: ${result.backend.language}${result.backend.framework ? ` (${result.backend.framework})` : ''}`);
  }
  
  if (result.mobile) {
    console.log(`📱 Mobile: ${result.mobile.platform}`);
  }
  
  if (result.deployment) {
    console.log(`🚀 Deployment: ${result.deployment.platform}`);
  }
  
  if (result.componentLibrary) {
    console.log(`🎨 UI Library: ${result.componentLibrary.name}`);
  }
  
  if (result.suggestions.length > 0) {
    console.log(`💡 Suggestions:`);
    result.suggestions.forEach(suggestion => {
      console.log(`   • ${suggestion}`);
    });
  }
});

// Test specific edge cases
console.log('\n\n🔍 Testing Edge Cases');
console.log('='.repeat(60));

const edgeCases = [
  "",
  "Just some random text with no tech stack mentioned",
  "I want to build something modern and fast",
  "React",
  "TypeScript project"
];

edgeCases.forEach((edgeCase, index) => {
  console.log(`\n🧪 Edge Case ${index + 1}: "${edgeCase || '(empty)'}"`);
  console.log('─'.repeat(40));
  
  const result = parser.parse(edgeCase);
  
  console.log(`🎯 Confidence: ${result.confidence}%`);
  console.log(`⚛️  Detected: ${result.frontend.framework} + ${result.frontend.styling}`);
  
  if (result.suggestions.length > 0) {
    console.log(`💡 Suggestions: ${result.suggestions.join(', ')}`);
  }
});

console.log('\n✅ Tech Stack Parser Tests Complete!\n');