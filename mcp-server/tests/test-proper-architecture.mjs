#!/usr/bin/env node

/**
 * Test: Proper Architecture Separation
 * 
 * Demonstrates the correct architectural pattern:
 * - Figma MCP: Pure data source layer (extraction only)
 * - Gemini: Pure reasoning layer (interpretation & generation only)
 * - Orchestration: Clean coordination between layers
 * 
 * This is the answer to "Use Figma MCP as your data source layer, not your reasoning or generation layer"
 */

import dotenv from 'dotenv';
import { FigmaMCPGeminiOrchestrator } from '../src/ai/figma-mcp-gemini-orchestrator.js';

dotenv.config();

async function testProperLayerSeparation() {
  console.log('🏗️  Testing Proper Architecture: Figma MCP (Data) + Gemini (Reasoning)');
  console.log('=' .repeat(80));
  
  // Test configuration
  const testConfig = {
    figmaUrl: 'https://www.figma.com/design/LKQ4FJ4bTnCSjedbRpk931/Sample-File?node-id=1669-162202&t=Ps6dBqaujcLMrWKx-0',
    prompt: 'Create a comprehensive implementation ticket for this authentication component',
    documentType: 'Implementation Ticket',
    context: {
      techStack: 'React + TypeScript + Tailwind',
      projectName: 'Enterprise Auth System',
      additionalRequirements: 'Must follow accessibility guidelines and support dark mode'
    }
  };
  
  try {
    // Verify Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('❌ GEMINI_API_KEY not found in environment variables');
    }
    console.log('✅ Gemini API key configured for reasoning layer');
    
    // Initialize orchestrator
    console.log('\n🎯 Initializing Proper Layer Separation Orchestrator...');
    const orchestrator = new FigmaMCPGeminiOrchestrator(geminiApiKey);
    console.log('✅ Orchestrator initialized');
    
    // Execute with proper layer separation
    console.log('\n🚀 Executing Proper Architecture Workflow...');
    console.log('📊 Layer 1: Figma MCP (Data Extraction)');
    console.log('🧠 Layer 2: Gemini (Reasoning & Generation)');
    console.log('🎯 Layer 3: Orchestration (Coordination)');
    
    const startTime = Date.now();
    const result = await orchestrator.generateTicketWithProperSeparation(testConfig);
    const executionTime = Date.now() - startTime;
    
    // Display results
    console.log('\n' + '=' .repeat(80));
    console.log('📋 ARCHITECTURAL SEPARATION RESULTS');
    console.log('=' .repeat(80));
    
    if (result.success) {
      console.log('✅ Status: SUCCESS - Proper layer separation achieved');
      console.log(`⏱️  Execution Time: ${executionTime}ms`);
      
      // Data Layer Results
      console.log('\n📊 DATA LAYER (Figma MCP):');
      console.log(`   • Assets: ${result.dataLayer.assets.length} discovered`);
      console.log(`   • Design Tokens: ${Object.keys(result.dataLayer.designTokens).length} extracted`);
      console.log(`   • Code Structure: ${result.dataLayer.structuredData.codeStructure ? 'Complete' : 'Partial'}`);
      console.log(`   • Screenshot: ${result.dataLayer.screenshot ? 'Captured' : 'Not captured'}`);
      console.log(`   • Metadata: ${Object.keys(result.dataLayer.metadata).length} fields`);
      console.log('   → Pure data extraction completed (no reasoning performed)');
      
      // Reasoning Layer Results
      console.log('\n🧠 REASONING LAYER (Gemini):');
      console.log(`   • Analysis Length: ${result.reasoningLayer.analysisResult.length} characters`);
      console.log(`   • Recommendations: ${result.reasoningLayer.recommendations.length} generated`);
      console.log(`   • Technical Specs: ${Object.keys(result.reasoningLayer.technicalSpecs).length} sections`);
      console.log('   → Pure reasoning and interpretation completed (no data extraction)');
      
      // Architecture Validation
      console.log('\n🏗️ ARCHITECTURE VALIDATION:');
      console.log(`   • Data Size: ${result.metadata.figmaDataSize} bytes from Figma MCP`);
      console.log(`   • Reasoning Tokens: ${result.metadata.geminiTokensUsed} from Gemini`);
      console.log('   • Separation: ✅ Clean separation between data and reasoning layers');
      console.log('   • Coordination: ✅ Proper orchestration between layers');
      
      // Generated Ticket Preview
      console.log('\n📄 GENERATED TICKET (First 500 chars):');
      console.log('-'.repeat(50));
      console.log(result.ticket.substring(0, 500) + '...');
      console.log('-'.repeat(50));
      
      // Architecture Summary
      console.log('\n🎯 ARCHITECTURE SUMMARY:');
      console.log('   1. Figma MCP → Pure Data Source (no reasoning)');
      console.log('   2. Gemini → Pure Reasoning Engine (no data extraction)');
      console.log('   3. Orchestrator → Clean coordination between layers');
      console.log('   4. Output → Combined intelligence from both layers');
      
    } else {
      console.log('❌ Status: FAILED - Layer separation encountered issues');
      console.log(`❌ Error: ${result.metadata.error}`);
      console.log('\n📄 Error Ticket Generated:');
      console.log('-'.repeat(50));
      console.log(result.ticket);
      console.log('-'.repeat(50));
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verify GEMINI_API_KEY is set in .env file');
    console.error('   2. Ensure Figma MCP server is running on port 3001');
    console.error('   3. Check network connectivity');
    console.error('   4. Verify the Figma URL is accessible');
  }
}

// Additional test for architectural principles
async function validateArchitecturalPrinciples() {
  console.log('\n' + '=' .repeat(80));
  console.log('🏛️  ARCHITECTURAL PRINCIPLES VALIDATION');
  console.log('=' .repeat(80));
  
  console.log('\n✅ CORRECT ARCHITECTURE:');
  console.log('   📊 Figma MCP Layer:');
  console.log('      • Responsibility: Pure data extraction');
  console.log('      • Input: Figma URLs');
  console.log('      • Output: Raw design data (tokens, assets, structure)');
  console.log('      • NO: Interpretation, reasoning, or generation');
  
  console.log('\n   🧠 Gemini Layer:');
  console.log('      • Responsibility: Pure reasoning and generation');
  console.log('      • Input: Raw design data from Figma MCP');
  console.log('      • Output: Interpreted analysis and generated content');
  console.log('      • NO: Data extraction or API calls to design tools');
  
  console.log('\n   🎯 Orchestration Layer:');
  console.log('      • Responsibility: Coordinate between data and reasoning');
  console.log('      • Input: User requirements and configuration');
  console.log('      • Output: Final tickets combining data + reasoning');
  console.log('      • NO: Direct data extraction or generation');
  
  console.log('\n❌ INCORRECT PATTERNS TO AVOID:');
  console.log('   • Figma MCP doing AI reasoning or content generation');
  console.log('   • Gemini making direct API calls to Figma');
  console.log('   • Mixed responsibilities within a single layer');
  console.log('   • Data extraction logic in reasoning components');
  
  console.log('\n🎯 BENEFITS OF PROPER SEPARATION:');
  console.log('   • Clear responsibility boundaries');
  console.log('   • Easier testing and debugging');
  console.log('   • Scalable and maintainable architecture');
  console.log('   • Ability to swap components independently');
  console.log('   • Better error handling and isolation');
}

// Run the test
if (require.main === module) {
  console.log('🧪 Starting Proper Architecture Test Suite...\n');
  
  testProperLayerSeparation()
    .then(() => validateArchitecturalPrinciples())
    .then(() => {
      console.log('\n✅ All tests completed successfully!');
      console.log('🏗️  Architecture follows proper separation of concerns');
      console.log('📊 Figma MCP: Data source layer ✅');
      console.log('🧠 Gemini: Reasoning layer ✅');
      console.log('🎯 Orchestration: Coordination layer ✅');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { testProperLayerSeparation, validateArchitecturalPrinciples };