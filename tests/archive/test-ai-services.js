#!/usr/bin/env node

/**
 * AI Services Testing Script
 * Tests both Template-Guided and Template-Integrated services
 */

import { TemplateGuidedAIService } from '../core/ai/template-guided-ai-service.js';
import { TemplateIntegratedAIService } from '../core/ai/template-integrated-ai-service.js';
import { Logger } from '../core/utils/logger.js';

const logger = new Logger('AIServicesTest');

// Mock Visual Enhanced AI Service for testing
class MockVisualEnhancedAIService {
  async processVisualEnhancedContext(context, options) {
    return {
      content: `h1. ${context.componentName || 'Test Component'} - Component Implementation

h2. 📋 Project Context & Component Details
*Project*: AEM Component Library
*Component*: ${context.componentName || 'Test Component'}
*Type*: COMPONENT
*Issue Type*: Component Implementation
*Priority*: High - Important component with clear business value
*Story Points*: 8 - Represents a medium level of effort
*Technologies*: ${Array.isArray(context.techStack) ? context.techStack.join(', ') : context.techStack || 'AEM 6.5'}
*Labels*: aem, component, design-system
*Design Status*: ready-for-dev

h2. 🎨 Design System & Visual References
*Figma URL*: https://www.figma.com/design/BioUSVD6t51ZNeG0g9AcNz/AEM-Component-Library?node-id=123:456
*Storybook URL*: https://storybook.company.com/?path=/docs/test-component--docs
*Screenshot*: N/A (Screenshot Not Available)
*Colors*: #4f00b5, #333333, #ffffff, #f5f5f5
*Typography*: Sora 32px/Semi Bold, Sora 16px/Medium, Inter 14px/Regular

h2. ✅ Acceptance Criteria
* Component renders correctly on all devices
* Passes accessibility requirements (WCAG AA)
* Integrates with AEM authoring interface
* Follows design system guidelines`,
      confidence: 0.85,
      metadata: {
        source: 'mock-ai-service',
        platform: options.platform || 'Jira',
        documentType: options.documentType || 'component'
      }
    };
  }
}

// Mock context data
const mockUnifiedContext = {
  figmaData: {
    selection: [{
      id: 'I5921:24783;2587:11511;1725:25663',
      name: 'Featured Products',
      type: 'FRAME'
    }]
  },
  figmaContext: {
    fileKey: 'BioUSVD6t51ZNeG0g9AcNz',
    fileName: 'AEM Component Library'
  },
  screenshot: {
    dataUrl: 'https://example.com/screenshot.png',
    format: 'png'
  },
  enhancedFrameData: [{
    id: 'I5921:24783;2587:11511;1725:25663',
    name: 'Featured Products'
  }]
};

async function testTemplateGuidedService() {
  logger.info('🧪 Testing Template-Guided AI Service...');

  try {
    const service = new TemplateGuidedAIService({
      aiService: new MockVisualEnhancedAIService()
    });

    // Test 1: Platform Markup Helpers
    logger.info('📝 Test 1: Platform Markup Helpers');
    const jiraMarkup = service.getPlatformMarkupHelpers('Jira');
    const wikiMarkup = service.getPlatformMarkupHelpers('Wiki');
    const confluenceMarkup = service.getPlatformMarkupHelpers('Confluence');

    console.log('✅ Jira Markup:', { h1: jiraMarkup.h1, h2: jiraMarkup.h2, bold: jiraMarkup.bold });
    console.log('✅ Wiki Markup:', { h1: wikiMarkup.h1, h2: wikiMarkup.h2, bold: wikiMarkup.bold });
    console.log('✅ Confluence Markup:', { h1: confluenceMarkup.h1, h2: confluenceMarkup.h2, bold: confluenceMarkup.bold });

    // Test 2: Tech Stack Rules
    logger.info('📝 Test 2: Tech Stack Rules');
    const aemRules = service.getTechStackSpecificRules(['AEM 6.5']);
    const reactRules = service.getTechStackSpecificRules(['React']);
    const mixedRules = service.getTechStackSpecificRules(['AEM 6.5', 'React']);

    console.log('✅ AEM Rules:', aemRules.substring(0, 100) + '...');
    console.log('✅ React Rules:', reactRules.substring(0, 100) + '...');
    console.log('✅ Mixed Rules:', mixedRules.substring(0, 100) + '...');

    // Test 3: Template Structure Building
    logger.info('📝 Test 3: Template Structure Building');
    const templateStructure = {
      resources: [
        { type: 'Figma', link: '{figma.live_link}', notes: 'Design source' },
        { type: 'Storybook', link: '{project.storybook_url}', notes: 'Component docs' }
      ]
    };

    const jiraStructure = await service.buildPlatformAdaptiveTemplateStructure(
      'Featured Products',
      ['AEM 6.5'],
      templateStructure,
      mockUnifiedContext,
      { platform: 'Jira', ticketType: 'Component', documentType: 'component' }
    );

    const wikiStructure = await service.buildPlatformAdaptiveTemplateStructure(
      'Featured Products',
      ['React'],
      templateStructure,
      mockUnifiedContext,
      { platform: 'Wiki', ticketType: 'Feature', documentType: 'component' }
    );

    console.log('✅ Jira Structure Length:', jiraStructure.length);
    console.log('✅ Wiki Structure Length:', wikiStructure.length);
    console.log('✅ Jira Structure Preview:', jiraStructure.substring(0, 200) + '...');
    console.log('✅ Wiki Structure Preview:', wikiStructure.substring(0, 200) + '...');

    // Test 4: Prompt Building
    logger.info('📝 Test 4: Prompt Building');
    const jiraPrompt = await service.buildTemplateGuidedPrompt(
      mockUnifiedContext,
      templateStructure,
      {
        componentName: 'Featured Products',
        techStack: ['AEM 6.5'],
        platform: 'Jira',
        documentType: 'component',
        ticketType: 'Component'
      }
    );

    const wikiPrompt = await service.buildTemplateGuidedPrompt(
      mockUnifiedContext,
      templateStructure,
      {
        componentName: 'Featured Products',
        techStack: ['React'],
        platform: 'Wiki',
        documentType: 'component',
        ticketType: 'Feature'
      }
    );

    console.log('✅ Jira Prompt Length:', jiraPrompt.length);
    console.log('✅ Wiki Prompt Length:', wikiPrompt.length);
    console.log('✅ Jira Prompt includes AEM rules:', jiraPrompt.includes('HTL templates'));
    console.log('✅ Wiki Prompt includes React rules:', wikiPrompt.includes('React component'));

    logger.info('✅ Template-Guided AI Service tests completed successfully!');
    return true;

  } catch (error) {
    logger.error('❌ Template-Guided AI Service test failed:', error.message);
    return false;
  }
}

async function testTemplateIntegratedService() {
  logger.info('🧪 Testing Template-Integrated AI Service...');

  try {
    const service = new TemplateIntegratedAIService({
      testMode: true // Enable test mode for mock responses
    });

    await service.initialize();

    // Test 1: Context Enrichment
    logger.info('📝 Test 1: Context Enrichment');
    const mockContext = {
      componentName: 'Featured Products',
      figmaContext: mockUnifiedContext.figmaContext,
      screenshot: mockUnifiedContext.screenshot,
      visualDesignContext: {
        colorPalette: [
          { name: 'Primary', hex: '#4f00b5' },
          { name: 'Secondary', hex: '#333333' }
        ],
        typography: {
          fonts: ['Sora', 'Inter'],
          sizes: [32, 16, 14]
        }
      }
    };

    const enrichedContext = service.enrichContextForPrompts(mockContext, {
      documentType: 'jira',
      techStack: ['AEM 6.5']
    });

    console.log('✅ Enriched Context Keys:', Object.keys(enrichedContext));
    console.log('✅ Figma Context:', enrichedContext.figma.component_name);
    console.log('✅ Project Context:', enrichedContext.project.name);
    console.log('✅ Calculated Context:', enrichedContext.calculated.complexity);

    // Test 2: AI Processing (Mock Mode)
    logger.info('📝 Test 2: AI Processing (Mock Mode)');
    const processingResult = await service.processWithReasoningPrompts(mockContext, {
      documentType: 'jira',
      techStack: ['AEM 6.5']
    });

    console.log('✅ Processing Success:', !!processingResult.reasoning);
    console.log('✅ Confidence Score:', processingResult.metadata.confidence);
    console.log('✅ Processing Time:', processingResult.metadata.processingTime + 'ms');
    console.log('✅ Screenshot Processed:', processingResult.metadata.screenshotProcessed);

    // Test 3: Service Configuration
    logger.info('📝 Test 3: Service Configuration');
    const configTest = await service.testConfiguration();

    console.log('✅ Service Available:', configTest.available);
    console.log('✅ Model:', configTest.model);
    console.log('✅ Capabilities:', configTest.capabilities);
    console.log('✅ Test Mode:', configTest.testMode);

    // Test 4: File Key Extraction
    logger.info('📝 Test 4: File Key Extraction');
    const fileKey1 = service.extractFileKeyFromUrl('https://www.figma.com/file/BioUSVD6t51ZNeG0g9AcNz/Test-File');
    const fileKey2 = service.extractFileKeyFromUrl('https://www.figma.com/design/BioUSVD6t51ZNeG0g9AcNz/Test-File');
    const fileKey3 = service.extractFileKeyFromUrl('invalid-url');

    console.log('✅ File Key 1:', fileKey1);
    console.log('✅ File Key 2:', fileKey2);
    console.log('✅ File Key 3 (invalid):', fileKey3);

    logger.info('✅ Template-Integrated AI Service tests completed successfully!');
    return true;

  } catch (error) {
    logger.error('❌ Template-Integrated AI Service test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  logger.info('🚀 Starting AI Services Comprehensive Testing...');

  const results = {
    templateGuided: false,
    templateIntegrated: false
  };

  // Test Template-Guided Service
  results.templateGuided = await testTemplateGuidedService();
  console.log('\n' + '='.repeat(60) + '\n');

  // Test Template-Integrated Service
  results.templateIntegrated = await testTemplateIntegratedService();
  console.log('\n' + '='.repeat(60) + '\n');

  // Summary
  logger.info('📊 Test Results Summary:');
  console.log('✅ Template-Guided AI Service:', results.templateGuided ? 'PASS' : 'FAIL');
  console.log('✅ Template-Integrated AI Service:', results.templateIntegrated ? 'PASS' : 'FAIL');

  const overallSuccess = results.templateGuided && results.templateIntegrated;
  logger.info(`🎯 Overall Test Result: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  return overallSuccess;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

export { runAllTests, testTemplateGuidedService, testTemplateIntegratedService };