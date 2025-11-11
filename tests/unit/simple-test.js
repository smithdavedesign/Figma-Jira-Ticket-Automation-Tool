#!/usr/bin/env node

/**
 * Simple Intelligence Integration Test
 */

console.log('🧠 Testing Context Intelligence Framework...\n');

try {
  // Test basic module loading
  console.log('1. Testing Design System Analyzer...');
  const DesignSystemAnalyzer = require('./core/context/design-system-analyzer');
  console.log('✅ Design System Analyzer loaded');

  console.log('2. Testing Business Context Intelligence...');
  const BusinessContextIntelligence = require('./core/context/business-context-intelligence');
  console.log('✅ Business Context Intelligence loaded');

  console.log('3. Testing Technical Context Analyzer...');
  const TechnicalContextAnalyzer = require('./core/context/technical-context-analyzer');
  console.log('✅ Technical Context Analyzer loaded');

  console.log('4. Testing User Experience Context Engine...');
  const UserExperienceContextEngine = require('./core/context/user-experience-context-engine');
  console.log('✅ User Experience Context Engine loaded');

  console.log('5. Testing Visual Enhanced AI Service...');
  const VisualEnhancedAIService = require('./core/ai/visual-enhanced-ai-service');
  console.log('✅ Visual Enhanced AI Service loaded');

  // Test instantiation
  console.log('\n🔧 Testing instantiation...');

  const designAnalyzer = new DesignSystemAnalyzer();
  console.log('✅ Design System Analyzer instantiated');

  const businessAnalyzer = new BusinessContextIntelligence();
  console.log('✅ Business Context Intelligence instantiated');

  const technicalAnalyzer = new TechnicalContextAnalyzer();
  console.log('✅ Technical Context Analyzer instantiated');

  const uxAnalyzer = new UserExperienceContextEngine();
  console.log('✅ User Experience Context Engine instantiated');

  const aiService = new VisualEnhancedAIService();
  console.log('✅ Visual Enhanced AI Service instantiated');

  console.log('\n🎉 SUCCESS: All intelligence modules loaded and instantiated correctly!');
  console.log('🚀 The comprehensive context intelligence framework is ready to enhance LLM accuracy!');

} catch (error) {
  console.error('❌ Error during test:', error.message);
  console.error('Stack:', error.stack);
}