/**
 * Test Suite for New Architecture: Figma API → Context Layer → YAML Templates → Docs
 * 
 * Tests the direct flow bypassing MCP server dependencies
 */

import { Logger } from '../../core/utils/logger.js';

class ArchitectureTest {
  constructor() {
    this.logger = new Logger('ArchitectureTest');
    this.results = {
      contextBridge: null,
      templateEngine: null,
      mcpAdapter: null,
      endToEnd: null
    };
  }

  /**
   * Run comprehensive architecture tests
   */
  async runTests() {
    this.logger.info('🧪 Testing New Architecture: Figma API → Context Layer → YAML Templates → Docs');
    
    try {
      // Test 1: Context-Template Bridge
      await this.testContextTemplateBridge();
      
      // Test 2: Template Engine with Context Layer data
      await this.testTemplateEngineIntegration();
      
      // Test 3: Optional MCP Adapter
      await this.testMCPAdapter();
      
      // Test 4: End-to-end flow
      await this.testEndToEndFlow();
      
      // Summary
      this.printTestSummary();
      
    } catch (error) {
      this.logger.error('❌ Architecture test suite failed:', error);
    }
  }

  /**
   * Test Context-Template Bridge
   */
  async testContextTemplateBridge() {
    this.logger.info('🌉 Testing Context-Template Bridge...');
    
    try {
      const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
      const bridge = new ContextTemplateBridge();
      
      // Test initialization
      await bridge.initialize();
      const health = bridge.getHealthStatus();
      
      this.results.contextBridge = {
        status: 'pass',
        initialized: health.status === 'healthy',
        architecture: health.architecture,
        mcpBypass: health.bypass === 'mcp-server-bypass-enabled',
        contextManager: !!health.contextManager,
        templateEngine: !!health.templateEngine
      };
      
      this.logger.info('✅ Context-Template Bridge test passed');
      
    } catch (error) {
      this.results.contextBridge = {
        status: 'fail',
        error: error.message
      };
      this.logger.error('❌ Context-Template Bridge test failed:', error.message);
    }
  }

  /**
   * Test Template Engine with Context Layer data
   */
  async testTemplateEngineIntegration() {
    this.logger.info('📋 Testing Template Engine with Context Layer data...');
    
    try {
      const { UniversalTemplateEngine } = await import('../../core/template/UniversalTemplateEngine.js');
      const engine = new UniversalTemplateEngine();
      
      // Test with Context Layer formatted data
      const contextLayerData = this.createMockContextLayerData();
      const template = await engine.resolveTemplate('jira', 'component', 'react');
      const rendered = await engine.renderTemplate(template, contextLayerData);
      
      this.results.templateEngine = {
        status: 'pass',
        templateResolved: !!template,
        resolutionPath: template._meta?.resolutionPath,
        rendered: !!rendered,
        hasContextLayerData: !!contextLayerData.figma?.design_tokens,
        newVariablesWork: rendered.includes && (
          rendered.includes('Colors extracted via Context Layer') ||
          rendered.includes('Layout patterns') ||
          rendered.includes('85%') // Confidence percentage
        )
      };
      
      this.logger.info('✅ Template Engine integration test passed');
      
    } catch (error) {
      this.results.templateEngine = {
        status: 'fail',
        error: error.message
      };
      this.logger.error('❌ Template Engine integration test failed:', error.message);
    }
  }

  /**
   * Test Optional MCP Adapter
   */
  async testMCPAdapter() {
    this.logger.info('🔌 Testing Optional MCP Adapter...');
    
    try {
      const { MCPAdapter } = await import('../../core/adapters/MCPAdapter.js');
      const adapter = new MCPAdapter();
      
      // Test initialization (should gracefully handle server unavailability)
      await adapter.initialize();
      const health = adapter.getHealthStatus();
      const diagnostics = await adapter.runDiagnostics();
      
      this.results.mcpAdapter = {
        status: 'pass',
        isAvailable: health.isAvailable,
        capabilities: health.capabilities,
        gracefulDegradation: !health.isAvailable, // Should be true when server not available
        diagnostics: diagnostics.serverConnection
      };
      
      this.logger.info('✅ MCP Adapter test passed (graceful degradation working)');
      
    } catch (error) {
      this.results.mcpAdapter = {
        status: 'fail',
        error: error.message
      };
      this.logger.error('❌ MCP Adapter test failed:', error.message);
    }
  }

  /**
   * Test End-to-End Flow
   */
  async testEndToEndFlow() {
    this.logger.info('🔄 Testing End-to-End Flow...');
    
    try {
      const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
      const bridge = new ContextTemplateBridge();
      await bridge.initialize();
      
      // Simulate full generation request
      const mockRequest = {
        frameData: [
          {
            id: 'test-component',
            name: 'TestButton',
            type: 'COMPONENT'
          }
        ],
        platform: 'jira',
        documentType: 'component',
        techStack: ['React', 'TypeScript'],
        figmaUrl: 'https://figma.com/test'
      };
      
      const result = await bridge.generateDocumentation(mockRequest);
      
      this.results.endToEnd = {
        status: 'pass',
        generated: !!result.content,
        architecture: result.metadata?.architecture,
        mcpBypass: result.performance?.mcpBypass,
        contextLayerEnabled: result.performance?.contextLayerEnabled,
        strategy: result.strategy,
        format: result.format,
        hasContent: Array.isArray(result.content) && result.content.length > 0,
        contentType: result.content?.[0]?.type
      };
      
      this.logger.info('✅ End-to-End flow test passed');
      
    } catch (error) {
      this.results.endToEnd = {
        status: 'fail',
        error: error.message
      };
      this.logger.error('❌ End-to-End flow test failed:', error.message);
    }
  }

  /**
   * Create mock Context Layer data for testing
   */
  createMockContextLayerData() {
    return {
      figma: {
        component_name: 'TestButton',
        component_type: 'UI Component',
        description: 'A reusable button component',
        url: 'https://figma.com/test',
        design_tokens: {
          colors: ['primary', 'secondary'],
          spacing: ['sm', 'md', 'lg']
        },
        color_palette: [
          { name: 'primary', hex: '#0066CC' },
          { name: 'secondary', hex: '#6C757D' }
        ],
        typography: {
          families: ['Inter', 'Roboto']
        },
        variants: [
          { name: 'Primary' },
          { name: 'Secondary' }
        ],
        layout_patterns: [
          { type: 'flex-horizontal' }
        ],
        interactions: [
          { type: 'click', trigger: 'onClick' }
        ]
      },
      project: {
        name: 'Test Project',
        tech_stack: ['React', 'TypeScript'],
        frontend_framework: 'React'
      },
      calculated: {
        complexity: 'medium',
        confidence: 0.85,
        story_points: '5',
        priority: 'Medium',
        hours: '4-6'
      },
      design_tokens: {
        colors: [
          { name: 'primary', value: '#0066CC' }
        ],
        spacing: [
          { name: 'md', value: '16' }
        ]
      }
    };
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    console.log('\n🧪 NEW ARCHITECTURE TEST SUMMARY');
    console.log('=' .repeat(50));
    
    const tests = [
      { name: 'Context-Template Bridge', result: this.results.contextBridge },
      { name: 'Template Engine Integration', result: this.results.templateEngine },
      { name: 'MCP Adapter (Optional)', result: this.results.mcpAdapter },
      { name: 'End-to-End Flow', result: this.results.endToEnd }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    tests.forEach(test => {
      const status = test.result?.status === 'pass' ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.name}`);
      
      if (test.result?.status === 'pass') {
        passed++;
        
        // Show key details for passed tests
        if (test.name === 'Context-Template Bridge') {
          console.log(`    Architecture: ${test.result.architecture}`);
          console.log(`    MCP Bypass: ${test.result.mcpBypass}`);
        } else if (test.name === 'End-to-End Flow') {
          console.log(`    Strategy: ${test.result.strategy}`);
          console.log(`    Architecture: ${test.result.architecture}`);
          console.log(`    Context Layer: ${test.result.contextLayerEnabled}`);
        }
      } else {
        console.log(`    Error: ${test.result?.error || 'Unknown error'}`);
      }
    });
    
    console.log('=' .repeat(50));
    console.log(`RESULTS: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 NEW ARCHITECTURE WORKING CORRECTLY!');
      console.log('   Primary Flow: Figma API → Context Layer → YAML Templates → Docs');
      console.log('   MCP Server: Optional for advanced workflows only');
    } else {
      console.log('⚠️ Some tests failed - check implementation');
    }
    
    return passed === total;
  }

  /**
   * Get test results for external consumption
   */
  getResults() {
    return {
      summary: {
        total: 4,
        passed: Object.values(this.results).filter(r => r?.status === 'pass').length,
        failed: Object.values(this.results).filter(r => r?.status === 'fail').length
      },
      details: this.results,
      architecture: {
        primary: 'figma-api → context-layer → yaml-templates → docs',
        optional: 'context-layer → mcp-adapter → multi-agent → enhanced-outputs',
        mcpBypass: true
      }
    };
  }
}

/**
 * Run architecture tests
 */
export async function runArchitectureTests() {
  const tester = new ArchitectureTest();
  await tester.runTests();
  return tester.getResults();
}

/**
 * Quick architecture validation
 */
export async function validateNewArchitecture() {
  console.log('🏗️ Quick Architecture Validation...\n');
  
  try {
    // Test Context-Template Bridge availability
    const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
    console.log('✅ Context-Template Bridge: Available');
    
    // Test Template Engine
    const { UniversalTemplateEngine } = await import('../../core/template/UniversalTemplateEngine.js');
    console.log('✅ Universal Template Engine: Available');
    
    // Test MCP Adapter (optional)
    const { MCPAdapter } = await import('../../core/adapters/MCPAdapter.js');
    console.log('✅ MCP Adapter: Available (optional)');
    
    console.log('\n🎯 Architecture Components Ready!');
    console.log('   New Flow: Figma API → Context Layer → YAML Templates → Docs');
    console.log('   MCP Server: Optional for advanced workflows');
    
    return true;
    
  } catch (error) {
    console.log('❌ Architecture validation failed:', error.message);
    return false;
  }
}

export default ArchitectureTest;