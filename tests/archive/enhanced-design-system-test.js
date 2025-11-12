/**
 * Enhanced Design System Context Test
 * 
 * Tests the enhanced design system extractor to validate maximum context extraction
 * from real design systems and showcasing the improved analysis capabilities.
 */

import { EnhancedDesignSystemExtractor } from '../core/context/enhanced-design-system-extractor.js';

class EnhancedDesignSystemTest {
  constructor() {
    this.extractor = new EnhancedDesignSystemExtractor({
      enableVerboseLogging: true,
      extractionConfig: {
        enableAdvancedTokenExtraction: true,
        enableSemanticAnalysis: true,
        enableComponentIntelligence: true,
        enableBrandPersonality: true,
        enableDesignMaturity: true
      }
    });
  }

  /**
   * Run comprehensive design system extraction tests
   */
  async runDesignSystemTests() {
    console.log('🎨 Testing Enhanced Design System Context Extraction\n');

    // Test scenarios with different design system complexities
    const testScenarios = [
      {
        name: 'Advanced E-commerce Design System',
        figmaData: this.createAdvancedEcommerceDesignSystem(),
        fileContext: { 
          fileName: 'shopify-design-system.fig', 
          projectName: 'E-commerce Platform',
          teamName: 'Design Systems Team'
        },
        expectedMaturity: 'advanced',
        expectedTokens: 25
      },
      {
        name: 'SaaS Product Design System',
        figmaData: this.createSaaSDesignSystem(),
        fileContext: { 
          fileName: 'dashboard-components.fig', 
          projectName: 'Analytics Dashboard',
          teamName: 'Product Design'
        },
        expectedMaturity: 'intermediate',
        expectedTokens: 15
      },
      {
        name: 'Basic Component Library',
        figmaData: this.createBasicDesignSystem(),
        fileContext: { 
          fileName: 'ui-components.fig', 
          projectName: 'Mobile App',
          teamName: 'Mobile Team'
        },
        expectedMaturity: 'developing',
        expectedTokens: 8
      }
    ];

    let totalScore = 0;
    let testsRun = 0;

    for (const scenario of testScenarios) {
      console.log(`\n📊 Testing: ${scenario.name}`);
      console.log('=' .repeat(50));
      
      const result = await this.testScenario(scenario);
      totalScore += result.score;
      testsRun++;

      this.displayResults(scenario, result);
    }

    // Final summary
    const averageScore = totalScore / testsRun;
    console.log('\n🎯 Enhanced Design System Test Summary');
    console.log('=' .repeat(60));
    console.log(`Average Context Richness: ${Math.round(averageScore)}%`);
    console.log(`Tests Completed: ${testsRun}/3`);
    
    if (averageScore >= 80) {
      console.log('✅ EXCELLENT: Enhanced design system extraction is working at peak performance');
    } else if (averageScore >= 60) {
      console.log('✅ GOOD: Enhanced design system extraction providing solid context');
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT: Design system extraction could be enhanced');
    }

    this.generateRecommendations(averageScore);
  }

  /**
   * Test individual scenario
   */
  async testScenario(scenario) {
    try {
      const context = await this.extractor.extractMaximumDesignSystemContext(
        scenario.figmaData,
        scenario.fileContext
      );

      const score = context.contextRichness;
      const maturityMatch = context.designSystemMaturity?.level === scenario.expectedMaturity;
      const tokenCount = (context.designTokens?.colors?.length || 0) + 
                       (context.designTokens?.typography?.length || 0) + 
                       (context.designTokens?.spacing?.length || 0);

      return {
        success: true,
        score: score,
        context: context,
        maturityMatch: maturityMatch,
        tokenCount: tokenCount,
        expectedTokens: scenario.expectedTokens,
        issues: []
      };

    } catch (error) {
      return {
        success: false,
        score: 0,
        error: error.message,
        issues: [error.message]
      };
    }
  }

  /**
   * Display detailed test results
   */
  displayResults(scenario, result) {
    if (!result.success) {
      console.log(`❌ Test Failed: ${result.error}`);
      return;
    }

    const context = result.context;
    
    console.log(`📈 Context Richness: ${result.score}%`);
    console.log(`🏗️ Design System Maturity: ${context.designSystemMaturity?.level} (${context.designSystemMaturity?.score}% score)`);
    console.log(`🎨 Brand Philosophy: ${context.designPhilosophy?.primary} (${Math.round((context.designPhilosophy?.confidence || 0) * 100)}% confidence)`);
    console.log(`🎯 Design Tokens Extracted: ${result.tokenCount} (expected: ${result.expectedTokens})`);
    
    // Design system details
    if (context.designTokens) {
      console.log('\n🎨 Design Token Analysis:');
      if (context.designTokens.semanticColors?.systemCompleteness) {
        console.log(`  • Color System: ${context.designTokens.semanticColors.systemCompleteness} completeness`);
      }
      if (context.designTokens.typographyScale?.scale) {
        console.log(`  • Typography: ${context.designTokens.typographyScale.scale} scale (${context.designTokens.typographyScale.ratio} ratio)`);
      }
      if (context.designTokens.spacingSystem) {
        console.log(`  • Spacing: ${context.designTokens.spacingSystem.consistency || 'Analyzed'} system`);
      }
    }

    // Component library analysis
    if (context.componentLibrary) {
      const atoms = context.componentLibrary.atomicDesign?.atoms?.length || 0;
      const molecules = context.componentLibrary.atomicDesign?.molecules?.length || 0;
      const organisms = context.componentLibrary.atomicDesign?.organisms?.length || 0;
      
      console.log(`\n🧩 Component Library: ${atoms} atoms, ${molecules} molecules, ${organisms} organisms`);
      console.log(`  • Reusability: ${context.componentLibrary.reusabilityScore?.score || 'N/A'}`);
    }

    // Brand system analysis
    if (context.brandSystem) {
      console.log(`\n🎭 Brand Analysis:`);
      console.log(`  • Personality: ${context.brandSystem.brandPersonality?.primary || 'Not detected'}`);
      console.log(`  • Emotional Tone: ${context.brandSystem.emotionalTone?.primary || 'Neutral'}`);
      console.log(`  • Industry Alignment: ${context.brandSystem.industryAlignment?.match || 'General'}`);
    }

    // AI guidance
    if (context.designPhilosophy?.aiGuidance) {
      console.log(`\n🤖 AI Generation Guidance:`);
      console.log(`  • Tone: ${context.designPhilosophy.aiGuidance.tone}`);
      console.log(`  • Approach: ${context.designPhilosophy.aiGuidance.approach}`);
      console.log(`  • Priorities: ${context.designPhilosophy.aiGuidance.priorities?.join(', ')}`);
    }

    console.log(`\n✅ Analysis Confidence: ${context.confidenceLevel}%`);
  }

  /**
   * Create advanced e-commerce design system test data
   */
  createAdvancedEcommerceDesignSystem() {
    return {
      document: {
        id: 'advanced-ecommerce-system',
        name: 'E-commerce Design System',
        type: 'DOCUMENT',
        children: [
          {
            id: 'foundations-page',
            name: 'Design Foundations',
            type: 'CANVAS',
            children: [
              // Color system
              {
                id: 'color-palette',
                name: 'Color Palette',
                type: 'FRAME',
                children: [
                  {
                    id: 'primary-blue',
                    name: 'Primary Blue',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 0.067, g: 0.384, b: 0.984 }, opacity: 1 }]
                  },
                  {
                    id: 'secondary-green',
                    name: 'Success Green',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 0.157, g: 0.655, b: 0.271 }, opacity: 1 }]
                  },
                  {
                    id: 'warning-orange',
                    name: 'Warning Orange',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 0.992, g: 0.549, b: 0.082 }, opacity: 1 }]
                  },
                  {
                    id: 'error-red',
                    name: 'Error Red',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 0.863, g: 0.208, b: 0.271 }, opacity: 1 }]
                  },
                  {
                    id: 'neutral-gray',
                    name: 'Neutral Gray',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 0.6, g: 0.62, b: 0.65 }, opacity: 1 }]
                  }
                ]
              },
              // Typography system
              {
                id: 'typography-scale',
                name: 'Typography Scale',
                type: 'FRAME',
                children: [
                  {
                    id: 'heading-xl',
                    name: 'Heading XL',
                    type: 'TEXT',
                    characters: 'Shop with Confidence',
                    fontSize: 48,
                    fontName: { family: 'Inter', style: 'Bold' }
                  },
                  {
                    id: 'heading-lg',
                    name: 'Heading Large',
                    type: 'TEXT',
                    characters: 'Featured Products',
                    fontSize: 36,
                    fontName: { family: 'Inter', style: 'SemiBold' }
                  },
                  {
                    id: 'heading-md',
                    name: 'Heading Medium',
                    type: 'TEXT',
                    characters: 'Product Category',
                    fontSize: 24,
                    fontName: { family: 'Inter', style: 'Medium' }
                  },
                  {
                    id: 'body-lg',
                    name: 'Body Large',
                    type: 'TEXT',
                    characters: 'Product description text',
                    fontSize: 18,
                    fontName: { family: 'Inter', style: 'Regular' }
                  },
                  {
                    id: 'body-md',
                    name: 'Body Medium',
                    type: 'TEXT',
                    characters: 'Standard body text',
                    fontSize: 16,
                    fontName: { family: 'Inter', style: 'Regular' }
                  }
                ]
              }
            ]
          },
          {
            id: 'components-page',
            name: 'Component Library',
            type: 'CANVAS',
            children: [
              // Button components with variants
              {
                id: 'button-primary',
                name: 'Button/Primary',
                type: 'COMPONENT',
                variantProperties: { Size: 'Large', State: 'Default' },
                children: [
                  {
                    id: 'button-bg',
                    name: 'Background',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 0.067, g: 0.384, b: 0.984 }, opacity: 1 }]
                  },
                  {
                    id: 'button-text',
                    name: 'Add to Cart',
                    type: 'TEXT',
                    characters: 'Add to Cart',
                    fontSize: 16,
                    fontName: { family: 'Inter', style: 'Medium' }
                  }
                ]
              },
              {
                id: 'button-secondary',
                name: 'Button/Secondary',
                type: 'COMPONENT',
                variantProperties: { Size: 'Large', State: 'Default' },
                children: [
                  {
                    id: 'secondary-bg',
                    name: 'Background',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }],
                    strokes: [{ type: 'SOLID', color: { r: 0.067, g: 0.384, b: 0.984 }, opacity: 1 }]
                  }
                ]
              },
              // Product card component
              {
                id: 'product-card',
                name: 'Product Card',
                type: 'COMPONENT',
                children: [
                  {
                    id: 'card-image',
                    name: 'Product Image',
                    type: 'RECTANGLE',
                    fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 }, opacity: 1 }]
                  },
                  {
                    id: 'card-title',
                    name: 'Product Title',
                    type: 'TEXT',
                    characters: 'Premium Wireless Headphones',
                    fontSize: 18,
                    fontName: { family: 'Inter', style: 'Medium' }
                  },
                  {
                    id: 'card-price',
                    name: 'Price',
                    type: 'TEXT',
                    characters: '$199.99',
                    fontSize: 24,
                    fontName: { family: 'Inter', style: 'Bold' }
                  }
                ]
              }
            ]
          }
        ]
      },
      styles: {
        'primary-color': {
          styleType: 'FILL',
          name: 'Primary/Blue-600',
          fills: [{ type: 'SOLID', color: { r: 0.067, g: 0.384, b: 0.984 } }]
        },
        'success-color': {
          styleType: 'FILL',
          name: 'Semantic/Success',
          fills: [{ type: 'SOLID', color: { r: 0.157, g: 0.655, b: 0.271 } }]
        },
        'heading-xl': {
          styleType: 'TEXT',
          name: 'Typography/Heading-XL',
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 700
        }
      },
      components: {
        'button-primary': {
          name: 'Button Primary',
          description: 'Primary call-to-action button for key user actions',
          variantProperties: { Size: ['Small', 'Medium', 'Large'], State: ['Default', 'Hover', 'Pressed', 'Disabled'] }
        },
        'product-card': {
          name: 'Product Card',
          description: 'Displays product information in e-commerce listings'
        }
      }
    };
  }

  /**
   * Create SaaS design system test data
   */
  createSaaSDesignSystem() {
    return {
      document: {
        id: 'saas-dashboard-system',
        name: 'Dashboard Design System',
        type: 'DOCUMENT',
        children: [
          {
            id: 'dashboard-components',
            name: 'Dashboard Components',
            type: 'CANVAS',
            children: [
              {
                id: 'data-card',
                name: 'Analytics Card',
                type: 'COMPONENT',
                children: [
                  {
                    id: 'card-header',
                    name: 'Card Header',
                    type: 'TEXT',
                    characters: 'Monthly Revenue',
                    fontSize: 16,
                    fontName: { family: 'Roboto', style: 'Medium' }
                  },
                  {
                    id: 'metric-value',
                    name: 'Metric Value',
                    type: 'TEXT',
                    characters: '$24,680',
                    fontSize: 32,
                    fontName: { family: 'Roboto', style: 'Bold' }
                  }
                ]
              }
            ]
          }
        ]
      },
      styles: {
        'dashboard-primary': {
          styleType: 'FILL',
          name: 'Dashboard Primary',
          fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.8 } }]
        }
      }
    };
  }

  /**
   * Create basic design system test data
   */
  createBasicDesignSystem() {
    return {
      document: {
        id: 'basic-components',
        name: 'Basic UI Components',
        type: 'DOCUMENT',
        children: [
          {
            id: 'simple-button',
            name: 'Button',
            type: 'COMPONENT',
            children: [
              {
                id: 'btn-bg',
                name: 'Background',
                type: 'RECTANGLE',
                fills: [{ type: 'SOLID', color: { r: 0.3, g: 0.6, b: 1 }, opacity: 1 }]
              }
            ]
          }
        ]
      }
    };
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations(averageScore) {
    console.log('\n📝 Enhancement Recommendations:');
    
    if (averageScore >= 80) {
      console.log('🎯 System is performing excellently. Consider:');
      console.log('  • Add advanced component relationship analysis');
      console.log('  • Implement cross-file design system linking');
      console.log('  • Add design system evolution tracking');
    } else if (averageScore >= 60) {
      console.log('🔧 Good performance with room for improvement:');
      console.log('  • Enhance semantic color analysis');
      console.log('  • Improve typography scale detection');
      console.log('  • Add more brand personality indicators');
    } else {
      console.log('⚠️ Significant improvements needed:');
      console.log('  • Fix basic token extraction');
      console.log('  • Improve component pattern recognition');
      console.log('  • Enhance confidence scoring algorithms');
    }

    console.log('\n🚀 Next Steps for Production:');
    console.log('  • Test with real user design systems');
    console.log('  • Validate AI generation improvements');
    console.log('  • Implement caching for performance');
    console.log('  • Add design system change detection');
  }
}

// Export for use in other modules
export { EnhancedDesignSystemTest };

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new EnhancedDesignSystemTest();
  tester.runDesignSystemTests().catch(console.error);
}