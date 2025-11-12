#!/usr/bin/env node

/**
 * Test script to verify Phase 1 design token fix
 * Tests the modified getVariableInstruction method directly
 */

import { TemplateGuidedAIService } from '../core/ai/template-guided-ai-service.js';

// Mock dependencies
const mockAIService = {
  generateContent: () => Promise.resolve({ content: 'Mock AI response' })
};

const mockConfigService = {
  get: (key, defaultValue) => defaultValue
};

const mockCacheService = {
  get: () => null,
  set: () => Promise.resolve(),
  clear: () => Promise.resolve()
};

const mockContextBuilder = {
  buildUnifiedContext: () => ({})
};

const mockTemplateEngine = {
  resolveTemplate: () => ({}),
  renderTemplate: () => ({})
};

async function testPhase1Fix() {
  console.log('🧪 Testing Phase 1 Design Token Fix...\n');

  // Initialize the service
  const service = new TemplateGuidedAIService(
    mockAIService,
    mockConfigService,
    mockCacheService,
    mockContextBuilder,
    mockTemplateEngine
  );

  // Test the getVariableInstruction method directly
  console.log('1. Testing Colors Variable:');
  const colorsResult = service.getVariableInstruction('figma.extracted_colors', '[Extract HEX values from screenshot/context]');
  console.log(`   Result: ${colorsResult}`);
  console.log('   ✅ Expected Phase 1 colors: #4f00b5, #333333, #ffffff, #f5f5f5');

  console.log('\n2. Testing Typography Variable:');
  const typographyResult = service.getVariableInstruction('figma.extracted_typography', '[Extract font families, sizes from context]');
  console.log(`   Result: ${typographyResult}`);
  console.log('   ✅ Expected Phase 1 fonts: Sora 32px/Semi Bold, Sora 16px/Medium, Inter 14px/Regular');

  console.log('\n3. Testing Other Variable (should use fallback):');
  const otherResult = service.getVariableInstruction('project.name', 'Test Project');
  console.log(`   Result: ${otherResult}`);
  console.log('   ✅ Expected: Test Project');

  console.log('\n4. Testing Variable with Bracket Fallback (should keep AI instruction):');
  const bracketResult = service.getVariableInstruction('some.variable', '[Some AI instruction]');
  console.log(`   Result: ${bracketResult}`);
  console.log('   ✅ Expected: [Extract from context: some.variable || [Some AI instruction]]');

  // Verify the fix works - check if we're getting actual tokens instead of placeholder instructions
  const hasRealColors = colorsResult.includes('#') && !colorsResult.includes('[Extract');
  const hasRealFonts = (typographyResult.includes('px/') || typographyResult.includes('px ')) && !typographyResult.includes('[Extract');

  console.log('\n🎯 RESULTS:');
  console.log(`   Colors Fixed: ${hasRealColors ? '✅ YES' : '❌ NO'} (showing real hex values)`);
  console.log(`   Typography Fixed: ${hasRealFonts ? '✅ YES' : '❌ NO'} (showing real font specifications)`);
  console.log(`   Overall Status: ${hasRealColors && hasRealFonts ? '✅ FIXED' : '❌ STILL BROKEN'}`);

  if (hasRealColors && hasRealFonts) {
    console.log('\n🎉 SUCCESS! The placeholder values have been replaced with real design tokens!');
    console.log('   ✨ Before: "[Extract HEX values from screenshot/context]"');
    console.log(`   ✨ After:  "${colorsResult}"`);
    console.log('   ✨ Before: "[Extract font families, sizes from context]"');
    console.log(`   ✨ After:  "${typographyResult}"`);
    console.log('\n   The AI will now see actual colors and fonts instead of generic instructions.');
  } else {
    console.log('\n❌ The fix is not working properly. Still showing placeholder instructions.');
  }
}

// Run the test
testPhase1Fix().catch(console.error);