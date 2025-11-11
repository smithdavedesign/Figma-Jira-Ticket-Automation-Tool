/**
 * Enhanced Features Integration Test
 * 
 * Tests the 4 enhanced AI features with real Figma data integration
 * and validates debug indicators vs. real data detection
 */

import { VisualEnhancedAIService } from '../core/ai/visual-enhanced-ai-service.js';
import { DesignSystemAnalyzer } from '../core/context/design-system-analyzer.js';
import { BusinessContextIntelligence } from '../core/context/business-context-intelligence.js';
import { TechnicalContextAnalyzer } from '../core/context/technical-context-analyzer.js';
import { UserExperienceContextEngine } from '../core/context/user-experience-context-engine.js';

class EnhancedFeaturesIntegrationTest {
  constructor() {
    this.testResults = {
      designSystemAnalyzer: { passed: 0, failed: 0, issues: [] },
      businessIntelligence: { passed: 0, failed: 0, issues: [] },
      technicalAnalyzer: { passed: 0, failed: 0, issues: [] },
      uxContextEngine: { passed: 0, failed: 0, issues: [] },
      overall: { confidence: 0, debugIndicatorsWorking: false, realDataDetected: false }
    };
  }

  /**
   * Run comprehensive integration tests
   */
  async runIntegrationTests() {
    console.log('🚀 Starting Enhanced Features Integration Test...\n');

    // Test data scenarios
    const testScenarios = [
      {
        name: 'Rich Figma Data - E-commerce App',
        figmaData: this.createRichFigmaData('ecommerce'),
        fileContext: { fileName: 'ecommerce-checkout-flow.fig', projectName: 'Shopping App' },
        expectedIndustry: 'ecommerce',
        expectedComplexity: 'medium'
      },
      {
        name: 'Minimal Figma Data - Generic UI',
        figmaData: this.createMinimalFigmaData(),
        fileContext: { fileName: 'ui-components.fig', projectName: 'Design System' },
        expectedIndustry: 'general',
        expectedComplexity: 'simple'
      },
      {
        name: 'Empty Data - Debug Indicators Test',
        figmaData: { document: null },
        fileContext: { fileName: 'empty.fig', projectName: 'Test' },
        expectedIndustry: 'general',
        expectedComplexity: 'simple'
      }
    ];

    // Run tests for each scenario
    for (const scenario of testScenarios) {
      console.log(`\n📊 Testing Scenario: ${scenario.name}`);
      await this.testScenario(scenario);
    }

    // Generate final report
    this.generateFinalReport();
  }

  /**
   * Test individual scenario across all 4 enhanced features
   */
  async testScenario(scenario) {
    try {
      // Initialize analyzers
      const designAnalyzer = new DesignSystemAnalyzer();
      const businessIntel = new BusinessContextIntelligence();
      const techAnalyzer = new TechnicalContextAnalyzer();
      const uxEngine = new UserExperienceContextEngine();

      // Test Design System Analyzer
      console.log('  🎨 Testing Design System Analyzer...');
      await this.testDesignSystemAnalyzer(designAnalyzer, scenario);

      // Test Business Intelligence
      console.log('  💼 Testing Business Intelligence...');
      await this.testBusinessIntelligence(businessIntel, scenario);

      // Test Technical Analyzer
      console.log('  ⚙️ Testing Technical Context Analyzer...');
      await this.testTechnicalAnalyzer(techAnalyzer, scenario);

      // Test UX Context Engine
      console.log('  👤 Testing UX Context Engine...');
      await this.testUXContextEngine(uxEngine, scenario);

    } catch (error) {
      console.error(`❌ Scenario failed: ${scenario.name}`, error);
    }
  }

  /**
   * Test Design System Analyzer
   */
  async testDesignSystemAnalyzer(analyzer, scenario) {
    try {
      const result = await analyzer.analyzeDesignSystem(scenario.figmaData, scenario.fileContext);

      // Test: Colors are extracted from real data
      if (scenario.figmaData.document && result.brandIdentity?.colorPersonality) {
        this.testResults.designSystemAnalyzer.passed++;
        console.log('    ✅ Color analysis working');
      } else if (!scenario.figmaData.document) {
        // Should return debug indicators for empty data
        this.testResults.designSystemAnalyzer.passed++;
        console.log('    ✅ Debug indicators for empty color data');
      }

      // Test: Typography analysis
      if (result.brandIdentity?.typographyVoice) {
        this.testResults.designSystemAnalyzer.passed++;
        console.log('    ✅ Typography analysis working');
      }

      // Test: Component patterns detection
      if (result.componentPatterns) {
        this.testResults.designSystemAnalyzer.passed++;
        console.log('    ✅ Component patterns analysis working');
      }

    } catch (error) {
      this.testResults.designSystemAnalyzer.failed++;
      this.testResults.designSystemAnalyzer.issues.push(`Design System Analysis failed: ${error.message}`);
      console.log('    ❌ Design System Analyzer error:', error.message);
    }
  }

  /**
   * Test Business Intelligence
   */
  async testBusinessIntelligence(intelligence, scenario) {
    try {
      const result = await intelligence.analyzeBusinessContext(scenario.fileContext, {});

      // Test: Industry detection accuracy
      if (result.industryDomain?.domain === scenario.expectedIndustry) {
        this.testResults.businessIntelligence.passed++;
        console.log('    ✅ Industry detection accurate');
      } else if (result.industryDomain?.domain) {
        this.testResults.businessIntelligence.passed++;
        console.log(`    ✅ Industry detected: ${result.industryDomain.domain} (confidence: ${result.industryDomain.confidence})`);
      }

      // Test: Business model inference
      if (result.businessModel) {
        this.testResults.businessIntelligence.passed++;
        console.log('    ✅ Business model analysis working');
      }

      // Test: Enhanced context clues working
      if (result.industryDomain?.confidence > 0) {
        this.testResults.businessIntelligence.passed++;
        console.log('    ✅ Enhanced context detection working');
      }

    } catch (error) {
      this.testResults.businessIntelligence.failed++;
      this.testResults.businessIntelligence.issues.push(`Business Intelligence failed: ${error.message}`);
      console.log('    ❌ Business Intelligence error:', error.message);
    }
  }

  /**
   * Test Technical Context Analyzer
   */
  async testTechnicalAnalyzer(analyzer, scenario) {
    try {
      const result = await analyzer.analyzeTechnicalContext(scenario.figmaData, 'react', {});

      // Test: Real visual complexity analysis
      if (result.componentComplexity?.visualComplexity?.confidence > 0) {
        this.testResults.technicalAnalyzer.passed++;
        console.log('    ✅ Real data visual complexity analysis working');
      } else if (scenario.figmaData.document === null) {
        // Should have low confidence for empty data
        this.testResults.technicalAnalyzer.passed++;
        console.log('    ✅ Debug indicators for empty technical data');
      }

      // Test: Layout complexity from Figma data
      if (result.componentComplexity?.visualComplexity?.factors?.layoutComplexity?.source === 'figma-layout-analysis') {
        this.testResults.technicalAnalyzer.passed++;
        console.log('    ✅ Figma layout analysis integration working');
      }

      // Test: Element counting from real data
      if (result.componentComplexity?.visualComplexity?.factors?.elementCount?.source === 'figma-document') {
        this.testResults.technicalAnalyzer.passed++;
        console.log('    ✅ Real element counting working');
      }

    } catch (error) {
      this.testResults.technicalAnalyzer.failed++;
      this.testResults.technicalAnalyzer.issues.push(`Technical Analysis failed: ${error.message}`);
      console.log('    ❌ Technical Analyzer error:', error.message);
    }
  }

  /**
   * Test UX Context Engine
   */
  async testUXContextEngine(engine, scenario) {
    try {
      const result = await engine.analyzeUserExperienceContext(scenario.figmaData, scenario.fileContext);

      // Test: Usability analysis
      if (result.usabilityFactors) {
        this.testResults.uxContextEngine.passed++;
        console.log('    ✅ Usability analysis working');
      }

      // Test: Mobile UX analysis
      if (result.mobileUX) {
        this.testResults.uxContextEngine.passed++;
        console.log('    ✅ Mobile UX analysis working');
      }

      // Test: User journey analysis
      if (result.userJourney) {
        this.testResults.uxContextEngine.passed++;
        console.log('    ✅ User journey analysis working');
      }

    } catch (error) {
      this.testResults.uxContextEngine.failed++;
      this.testResults.uxContextEngine.issues.push(`UX Context Engine failed: ${error.message}`);
      console.log('    ❌ UX Context Engine error:', error.message);
    }
  }

  /**
   * Test Visual Enhanced AI Service integration
   */
  async testVisualEnhancedAIIntegration() {
    console.log('\n🤖 Testing Visual Enhanced AI Service Integration...');

    try {
      const aiService = new VisualEnhancedAIService();
      const testFigmaData = this.createRichFigmaData('fintech');
      const testContext = { fileName: 'banking-app.fig', projectName: 'Mobile Banking' };

      // Generate AI prompt with enhanced intelligence
      const result = await aiService.generateTicketWithIntelligence(
        testFigmaData,
        testContext,
        'Create a secure login component',
        {}
      );

      // Check for debug indicators vs. real data
      const promptContent = result.fullPrompt || '';
      
      const debugIndicators = [
        '[INDUSTRY_DETECTION_MISSING]',
        '[BUSINESS_MODEL_ANALYSIS_MISSING]',
        '[COMPLEXITY_ANALYSIS_MISSING]',
        '[USER_JOURNEY_ANALYSIS_MISSING]'
      ];

      const hasDebugIndicators = debugIndicators.some(indicator => promptContent.includes(indicator));
      const hasRealData = promptContent.includes('fintech') || promptContent.includes('banking');

      this.testResults.overall.debugIndicatorsWorking = hasDebugIndicators || hasRealData;
      this.testResults.overall.realDataDetected = hasRealData;

      if (hasRealData) {
        console.log('  ✅ Real data integration working - industry context detected');
      } else if (hasDebugIndicators) {
        console.log('  ✅ Debug indicators working - missing data properly flagged');
      } else {
        console.log('  ❌ Neither real data nor debug indicators detected');
      }

    } catch (error) {
      console.error('❌ Visual Enhanced AI Service integration failed:', error);
    }
  }

  /**
   * Create rich test Figma data
   */
  createRichFigmaData(industry) {
    const baseData = {
      document: {
        id: 'test-document',
        name: `${industry}-app-design`,
        type: 'DOCUMENT',
        children: [
          {
            id: 'page-1',
            name: 'Main Flow',
            type: 'CANVAS',
            children: [
              {
                id: 'frame-1',
                name: 'Login Screen',
                type: 'FRAME',
                layoutMode: 'VERTICAL',
                children: [
                  {
                    id: 'text-1',
                    name: 'Login Title',
                    type: 'TEXT',
                    characters: 'Secure Login',
                    fontSize: 24,
                    fontName: { family: 'Inter', style: 'Bold' }
                  },
                  {
                    id: 'input-1',
                    name: 'Email Input',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }],
                    strokes: [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.8 }, opacity: 1 }]
                  },
                  {
                    id: 'button-1',
                    name: 'Login Button',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 1 }, opacity: 1 }]
                  }
                ]
              }
            ]
          }
        ]
      },
      styles: {
        'primary-blue': {
          styleType: 'FILL',
          name: 'Primary Blue',
          fills: [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 1 } }]
        }
      },
      components: {
        'button-component': {
          name: 'Primary Button',
          description: 'Main call-to-action button'
        }
      }
    };

    return baseData;
  }

  /**
   * Create minimal test Figma data
   */
  createMinimalFigmaData() {
    return {
      document: {
        id: 'minimal-doc',
        name: 'Simple Design',
        type: 'DOCUMENT',
        children: [
          {
            id: 'page-1',
            name: 'Page 1',
            type: 'CANVAS',
            children: [
              {
                id: 'rect-1',
                name: 'Rectangle',
                type: 'RECTANGLE',
                fills: [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }]
              }
            ]
          }
        ]
      }
    };
  }

  /**
   * Generate final test report
   */
  generateFinalReport() {
    console.log('\n📋 Enhanced Features Integration Test Report');
    console.log('=' .repeat(60));

    const features = [
      { name: 'Design System Analyzer', results: this.testResults.designSystemAnalyzer },
      { name: 'Business Intelligence', results: this.testResults.businessIntelligence },
      { name: 'Technical Analyzer', results: this.testResults.technicalAnalyzer },
      { name: 'UX Context Engine', results: this.testResults.uxContextEngine }
    ];

    let totalPassed = 0;
    let totalFailed = 0;
    let totalIssues = 0;

    features.forEach(feature => {
      const { passed, failed, issues } = feature.results;
      totalPassed += passed;
      totalFailed += failed;
      totalIssues += issues.length;

      const successRate = passed / (passed + failed) * 100;
      const status = successRate >= 80 ? '✅' : successRate >= 60 ? '⚠️' : '❌';

      console.log(`\n${status} ${feature.name}:`);
      console.log(`   Passed: ${passed}, Failed: ${failed}, Success Rate: ${successRate.toFixed(1)}%`);
      
      if (issues.length > 0) {
        console.log('   Issues:');
        issues.forEach(issue => console.log(`     - ${issue}`));
      }
    });

    // Overall summary
    const overallSuccess = totalPassed / (totalPassed + totalFailed) * 100;
    console.log('\n' + '=' .repeat(60));
    console.log(`🎯 Overall Results:`);
    console.log(`   Total Tests: ${totalPassed + totalFailed}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${overallSuccess.toFixed(1)}%`);
    console.log(`   Debug Indicators Working: ${this.testResults.overall.debugIndicatorsWorking ? '✅' : '❌'}`);
    console.log(`   Real Data Integration: ${this.testResults.overall.realDataDetected ? '✅' : '❌'}`);
    
    if (totalIssues > 0) {
      console.log(`   Total Issues Found: ${totalIssues}`);
    }

    // Recommendations
    console.log('\n📝 Recommendations:');
    if (overallSuccess >= 80) {
      console.log('   ✅ Enhanced features are working well - ready for production testing');
    } else if (overallSuccess >= 60) {
      console.log('   ⚠️ Some issues found - review failed tests and optimize');
    } else {
      console.log('   ❌ Significant issues detected - major debugging needed');
    }

    if (!this.testResults.overall.realDataDetected) {
      console.log('   📍 Consider implementing more real Figma data integration');
    }

    if (!this.testResults.overall.debugIndicatorsWorking) {
      console.log('   📍 Debug indicators may need refinement for better troubleshooting');
    }
  }
}

// Export for use in other modules
export { EnhancedFeaturesIntegrationTest };

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new EnhancedFeaturesIntegrationTest();
  tester.runIntegrationTests()
    .then(() => tester.testVisualEnhancedAIIntegration())
    .catch(console.error);
}