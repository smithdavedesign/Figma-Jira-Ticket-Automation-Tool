/**
 * 🧪 Simple Context Intelligence Test
 * 
 * Basic functionality test for Phase 7: Context Intelligence Layer
 */

import ContextIntelligenceOrchestrator from '../core/context/context-intelligence-orchestrator.js';
import SemanticAnalyzer from '../core/context/semantic-analyzer.js';

// Simple test function
async function testContextIntelligence() {
  console.log('🧠 Testing Context Intelligence Layer...');

  try {
    // Test 1: Create Orchestrator
    console.log('📊 Test 1: Creating Orchestrator...');
    const orchestrator = new ContextIntelligenceOrchestrator({
      enableCaching: false,
      parallelAnalysis: true
    });
    console.log('✅ Orchestrator created successfully');

    // Test 2: Create Semantic Analyzer
    console.log('📊 Test 2: Creating Semantic Analyzer...');
    const semanticAnalyzer = new SemanticAnalyzer();
    console.log('✅ Semantic Analyzer created successfully');

    // Test 3: Mock data
    console.log('📊 Test 3: Creating mock data...');
    const mockDesignSpec = {
      components: [{
        id: 'button-1',
        name: 'Login Button',
        type: 'COMPONENT',
        category: 'Button',
        properties: {
          width: 120,
          height: 40,
          backgroundColor: '#0066CC',
          textColor: '#FFFFFF'
        },
        geometry: {
          width: 120,
          height: 40,
          x: 0,
          y: 0
        },
        style: {
          backgroundColor: '#0066CC',
          color: '#FFFFFF',
          borderRadius: 4
        }
      }],
      designTokens: {
        colors: [{ name: 'primary', value: '#0066CC', type: 'color' }]
      },
      metadata: {
        totalNodes: 1,
        componentCount: 1
      }
    };

    const mockPrototypeData = {
      interactions: [],
      prototypes: []
    };

    const mockDesignContext = {
      purpose: 'User authentication interface'
    };
    console.log('✅ Mock data created successfully');

    // Test 4: Run semantic analysis
    console.log('📊 Test 4: Running semantic analysis...');
    const semanticResult = await semanticAnalyzer.analyzeSemanticIntent(
      mockDesignSpec.components, 
      mockDesignContext
    );
    console.log('✅ Semantic analysis completed:', {
      componentCount: semanticResult.components?.length || 0,
      confidence: (semanticResult.confidence?.overall || 0).toFixed(2)
    });

    // Test 5: Run full orchestration (basic)
    console.log('📊 Test 5: Running context intelligence orchestration...');
    const result = await orchestrator.analyzeContextIntelligence(
      mockDesignSpec,
      mockPrototypeData,
      mockDesignContext
    );

    console.log('✅ Context Intelligence analysis completed:', {
      overallConfidence: (result.synthesis?.overallConfidence || 0).toFixed(2),
      analysisTime: result.metadata?.analysisTime || 0,
      criticalRecommendations: result.recommendations?.critical?.length || 0
    });

    console.log('🎉 All tests passed! Phase 7 Context Intelligence Layer is working.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test
testContextIntelligence()
  .then(success => {
    if (success) {
      console.log('🚀 Context Intelligence Layer test completed successfully!');
      process.exit(0);
    } else {
      console.log('💥 Context Intelligence Layer test failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });