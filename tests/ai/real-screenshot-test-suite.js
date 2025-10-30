#!/usr/bin/env node

/**
 * AI Architecture Test Suite with Real Screenshots
 * 
 * This test suite downloads actual component screenshots from the internet
 * to provide realistic visual context for testing the AI architecture.
 * 
 * Features:
 * - Real component screenshots from design systems
 * - Multiple tech stack scenarios
 * - Performance benchmarking
 * - Detailed AI response analysis
 */

import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { VisualEnhancedAIService } from '../../core/ai/visual-enhanced-ai-service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Real component screenshot URLs and test data
 */
const REAL_COMPONENT_TESTS = [
  {
    name: 'Material Design Button - AEM',
    techStack: 'AEM',
    documentType: 'jira',
    componentType: 'button',
    description: 'Material Design button component for AEM implementation',
    screenshotUrl: 'https://lh3.googleusercontent.com/MBUGpVEsJrY-xRe0uiHCEX18r20FjHjfWQ7OUG2RGl3H0hQOIjGmwMl0UY_2RGrF6YY=s400',
    altScreenshot: 'https://via.placeholder.com/300x100/1976D2/FFFFFF?text=Material+Button',
    frameData: {
      component_name: 'MaterialButton',
      nodeCount: 4,
      type: 'COMPONENT',
      name: 'Material Design Button',
      fills: [
        { type: 'SOLID', color: { r: 0.1, g: 0.46, b: 0.82 } }, // Material Blue
        { type: 'SOLID', color: { r: 1, g: 1, b: 1 } } // White text
      ],
      style: {
        fontFamily: 'Roboto',
        fontSize: 14,
        fontWeight: 500
      }
    }
  },
  {
    name: 'Bootstrap Card - React TypeScript',
    techStack: 'React TypeScript',
    documentType: 'jira',
    componentType: 'card',
    description: 'Bootstrap-style card component for React TypeScript',
    screenshotUrl: 'https://getbootstrap.com/docs/5.3/assets/img/bootstrap-icons.png',
    altScreenshot: 'https://via.placeholder.com/400x300/F8F9FA/212529?text=Bootstrap+Card',
    frameData: {
      component_name: 'BootstrapCard',
      nodeCount: 8,
      type: 'COMPONENT',  
      name: 'Bootstrap Card',
      fills: [
        { type: 'SOLID', color: { r: 0.97, g: 0.98, b: 0.98 } }, // Bootstrap light
        { type: 'SOLID', color: { r: 0.13, g: 0.15, b: 0.16 } } // Bootstrap dark
      ],
      style: {
        fontFamily: 'system-ui',
        fontSize: 16,
        fontWeight: 400
      }
    }
  },
  {
    name: 'Ant Design Form - Vue.js',
    techStack: 'Vue.js',
    documentType: 'linear',
    componentType: 'form',
    description: 'Ant Design form component adapted for Vue.js',
    screenshotUrl: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    altScreenshot: 'https://via.placeholder.com/500x400/1890FF/FFFFFF?text=Ant+Design+Form',
    frameData: {
      component_name: 'AntDesignForm',
      nodeCount: 12,
      type: 'COMPONENT',
      name: 'Ant Design Form',
      fills: [
        { type: 'SOLID', color: { r: 0.1, g: 0.56, b: 1 } }, // Ant Design Blue
        { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }
      ],
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        fontSize: 14,
        fontWeight: 400
      }
    }
  },
  {
    name: 'Chakra UI Modal - Angular',
    techStack: 'Angular',
    documentType: 'asana',
    componentType: 'modal',
    description: 'Chakra UI inspired modal for Angular applications',
    screenshotUrl: 'https://via.placeholder.com/600x400/319795/FFFFFF?text=Chakra+UI+Modal',
    altScreenshot: 'https://via.placeholder.com/600x400/319795/FFFFFF?text=Modal+Dialog',
    frameData: {
      component_name: 'ChakraModal',
      nodeCount: 10,
      type: 'COMPONENT',
      name: 'Chakra UI Modal',
      fills: [
        { type: 'SOLID', color: { r: 0.19, g: 0.59, b: 0.58 } }, // Chakra teal
        { type: 'SOLID', color: { r: 1, g: 1, b: 1 } }
      ],
      style: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 400
      }
    }
  }
];

/**
 * Real Screenshot Test Suite
 */
class RealScreenshotTestSuite {
  constructor() {
    this.results = [];
    this.screenshots = new Map();
    this.testStartTime = Date.now();
    this.downloadedImages = 0;
    this.failedDownloads = 0;
    
    console.log('🖼️  Initializing Real Screenshot AI Test Suite...');
    
    // Initialize AI services
    this.initializeAIServices();
  }

  /**
   * Initialize AI services
   */
  initializeAIServices() {
    try {
      this.visualAIService = new VisualEnhancedAIService(process.env.GEMINI_API_KEY);
      console.log('✅ Visual Enhanced AI Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AI services:', error);
      this.visualAIService = null;
    }
  }

  /**
   * Run all real screenshot tests
   */
  async runAllTests() {
    console.log(`\n🚀 Starting Real Screenshot AI Test Suite with ${REAL_COMPONENT_TESTS.length} scenarios...\n`);

    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️  GEMINI_API_KEY not found - testing fallback behavior only');
    }

    // Ensure screenshots directory exists
    await fs.mkdir('./tests/ai/screenshots', { recursive: true });

    for (const test of REAL_COMPONENT_TESTS) {
      await this.runRealScreenshotTest(test);
    }

    await this.generateRealScreenshotReport();
  }

  /**
   * Run a single test with real screenshot
   */
  async runRealScreenshotTest(test) {
    console.log(`\n🖼️  Testing: ${test.name}`);
    console.log(`   Component: ${test.componentType} (${test.techStack})`);

    const testResult = {
      scenario: test.name,
      techStack: test.techStack,
      documentType: test.documentType,
      componentType: test.componentType,
      startTime: Date.now(),
      success: false,
      screenshotDownloaded: false,
      screenshotSize: 0,
      aiResponse: null,
      confidence: 0,
      processingMetrics: {},
      errors: [],
      warnings: []
    };

    try {
      // Step 1: Download real screenshot
      const screenshot = await this.downloadComponentScreenshot(test);
      testResult.screenshotDownloaded = !!screenshot;
      testResult.screenshotSize = screenshot?.size || 0;

      if (!screenshot) {
        testResult.warnings.push('Screenshot download failed - using placeholder');
      }

      // Step 2: Build visual context with real screenshot
      const visualContext = this.buildRealVisualContext(test, screenshot);

      // Step 3: Test with Visual Enhanced AI Service
      if (this.visualAIService && process.env.GEMINI_API_KEY) {
        console.log('   🎨 Processing with Visual Enhanced AI...');
        
        const aiResult = await this.visualAIService.processVisualEnhancedContext(visualContext, {
          documentType: test.documentType,
          techStack: test.techStack,
          instructions: `Analyze this ${test.componentType} component screenshot and generate a comprehensive ${test.documentType} ticket for ${test.techStack} implementation. Pay special attention to visual design patterns, accessibility requirements, and responsive behavior visible in the image.`
        });

        testResult.success = true;
        testResult.aiResponse = aiResult.ticket;
        testResult.confidence = aiResult.confidence;
        testResult.processingMetrics = aiResult.processingMetrics;

        console.log('   ✅ AI processing completed');
        console.log(`   📊 Confidence: ${aiResult.confidence}%`);
        
      } else {
        testResult.warnings.push('AI service not available - skipped processing');
      }

    } catch (error) {
      console.error(`   ❌ Test failed: ${error.message}`);
      testResult.success = false;
      testResult.errors.push(error.message);
    }

    testResult.duration = Date.now() - testResult.startTime;
    this.results.push(testResult);

    // Display result
    const status = testResult.success ? '✅' : '❌';
    const screenshot = testResult.screenshotDownloaded ? '📸' : '🖼️';
    console.log(`   ${status} ${screenshot} Result (${testResult.duration}ms)`);
  }

  /**
   * Download component screenshot from URL
   */
  async downloadComponentScreenshot(test) {
    try {
      console.log(`   📥 Downloading screenshot: ${test.screenshotUrl}`);
      
      // Try primary URL first
      let response = await fetch(test.screenshotUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      // If primary fails, try alt screenshot
      if (!response.ok && test.altScreenshot) {
        console.log(`   📥 Trying alternative screenshot: ${test.altScreenshot}`);
        response = await fetch(test.altScreenshot, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          },
          timeout: 10000
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = await response.buffer();
      const base64 = buffer.toString('base64');
      
      // Save to file for debugging
      const filename = `${test.componentType}-${test.techStack.replace(/\s+/g, '-').toLowerCase()}.png`;
      await fs.writeFile(`./tests/ai/screenshots/${filename}`, buffer);

      const screenshot = {
        base64,
        format: 'PNG',
        size: buffer.length,
        resolution: { width: 400, height: 300 } // Estimated
      };

      this.downloadedImages++;
      console.log(`   ✅ Screenshot downloaded (${buffer.length} bytes)`);
      
      return screenshot;

    } catch (error) {
      this.failedDownloads++;
      console.warn(`   ⚠️  Screenshot download failed: ${error.message}`);
      
      // Return placeholder screenshot
      return {
        base64: this.generatePlaceholderScreenshot(test.name),
        format: 'PNG',
        size: 100,
        resolution: { width: 400, height: 300 }
      };
    }
  }

  /**
   * Generate placeholder screenshot
   */
  generatePlaceholderScreenshot(name) {
    // Minimal 1x1 PNG in base64
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  /**
   * Build visual context with real screenshot data
   */
  buildRealVisualContext(test, screenshot) {
    return {
      screenshot,
      visualDesignContext: {
        colorPalette: test.frameData.fills?.map((fill, index) => ({
          hex: this.rgbToHex(fill.color),
          rgb: fill.color,
          usage: [`Component fill ${index + 1}`],
          count: 1
        })) || [],
        typography: {
          fonts: [test.frameData.style?.fontFamily || 'Inter'],
          sizes: [test.frameData.style?.fontSize || 16],
          hierarchy: ['Primary', 'Secondary', 'Caption']
        },
        spacing: {
          patterns: ['4px', '8px', '16px', '24px', '32px'],
          measurements: [4, 8, 16, 24, 32, 48]
        },
        layout: {
          structure: 'Component-based',
          alignment: 'Responsive'
        },
        designPatterns: [`${test.componentType} pattern`, 'Design system component']
      },
      hierarchicalData: {
        components: [
          {
            name: test.frameData.name,
            type: test.frameData.type,
            masterComponent: test.frameData.component_name,
            id: `real-test-${Date.now()}`
          }
        ],
        designSystemLinks: {
          detected: true,
          system: `${test.techStack} Design System`
        }
      },
      figmaContext: {
        fileName: `${test.name} Real Screenshot Test`,
        pageName: 'Component Library',
        selection: {
          name: test.frameData.name,
          id: `real-selection-${Date.now()}`
        }
      }
    };
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(rgb) {
    const toHex = (c) => {
      const hex = Math.round((c || 0) * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Generate comprehensive report
   */
  async generateRealScreenshotReport() {
    const totalDuration = Date.now() - this.testStartTime;
    const successCount = this.results.filter(r => r.success).length;
    const failureCount = this.results.filter(r => !r.success).length;
    const avgConfidence = this.results.filter(r => r.confidence > 0).reduce((sum, r) => sum + r.confidence, 0) / this.results.filter(r => r.confidence > 0).length || 0;

    console.log('\n' + '='.repeat(80));
    console.log('🖼️  REAL SCREENSHOT AI TEST SUITE REPORT');
    console.log('='.repeat(80));
    console.log(`\n📊 Overall Results:`);
    console.log(`   ✅ Successful tests: ${successCount}/${this.results.length}`);
    console.log(`   ❌ Failed tests: ${failureCount}/${this.results.length}`);
    console.log(`   📸 Screenshots downloaded: ${this.downloadedImages}/${REAL_COMPONENT_TESTS.length}`);
    console.log(`   🖼️  Screenshot failures: ${this.failedDownloads}/${REAL_COMPONENT_TESTS.length}`);
    console.log(`   📈 Average AI confidence: ${avgConfidence.toFixed(1)}%`);
    console.log(`   ⏱️  Total Duration: ${totalDuration}ms`);

    console.log(`\n📝 Detailed Results:`);
    console.log('-'.repeat(80));

    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const screenshot = result.screenshotDownloaded ? '📸' : '🖼️';
      
      console.log(`\n${index + 1}. ${status} ${screenshot} ${result.scenario}`);
      console.log(`   Tech Stack: ${result.techStack} | Document: ${result.documentType}`);
      console.log(`   Component: ${result.componentType}`);
      console.log(`   Duration: ${result.duration}ms`);
      
      if (result.screenshotDownloaded) {
        console.log(`   Screenshot: ${(result.screenshotSize / 1024).toFixed(1)}KB downloaded`);
      }
      
      if (result.confidence > 0) {
        console.log(`   AI Confidence: ${result.confidence}%`);
      }
      
      if (result.processingMetrics?.screenshotProcessed) {
        console.log(`   Visual Processing: ✅ Screenshot analyzed`);
      }
      
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
      
      if (result.warnings.length > 0) {
        console.log(`   Warnings: ${result.warnings.join(', ')}`);
      }

      // Show AI response preview
      if (result.aiResponse && result.success) {
        const preview = result.aiResponse.substring(0, 150) + '...';
        console.log(`   AI Response Preview: ${preview}`);
      }
    });

    // Save detailed report
    await this.saveRealScreenshotReport();

    console.log('\n' + '='.repeat(80));
    console.log('🎯 RECOMMENDATIONS:');
    console.log('='.repeat(80));

    if (this.failedDownloads > 0) {
      console.log('⚠️  Some screenshot downloads failed - check network connectivity');
    }

    if (avgConfidence > 80) {
      console.log('🎉 Excellent AI confidence scores - visual analysis working well!');
    } else if (avgConfidence > 60) {
      console.log('👍 Good AI confidence scores - room for improvement in visual context');
    } else if (avgConfidence > 0) {
      console.log('⚠️  Low AI confidence scores - consider improving visual context building');
    }

    if (successCount === this.results.length) {
      console.log('✅ All tests passed - Real Screenshot AI architecture is working correctly!');
    }

    console.log('\n📁 Screenshots saved to: tests/ai/screenshots/');
    console.log('📁 Detailed report saved to: tests/ai/real-screenshot-report.json');
    console.log('🚀 Real Screenshot Test Suite completed!\n');
  }

  /**
   * Save detailed report to file
   */
  async saveRealScreenshotReport() {
    const report = {
      testSuite: 'Real Screenshot AI Test Suite',
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - this.testStartTime,
      summary: {
        totalTests: this.results.length,
        successful: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        screenshotsDownloaded: this.downloadedImages,
        screenshotFailures: this.failedDownloads,
        averageConfidence: this.results.filter(r => r.confidence > 0).reduce((sum, r) => sum + r.confidence, 0) / this.results.filter(r => r.confidence > 0).length || 0
      },
      environment: {
        hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
        nodeVersion: process.version,
        platform: process.platform
      },
      results: this.results,
      tests: REAL_COMPONENT_TESTS
    };

    try {
      await fs.writeFile('./tests/ai/real-screenshot-report.json', JSON.stringify(report, null, 2));
    } catch (error) {
      console.warn('⚠️  Could not save report file:', error.message);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const testSuite = new RealScreenshotTestSuite();
  await testSuite.runAllTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RealScreenshotTestSuite, REAL_COMPONENT_TESTS };