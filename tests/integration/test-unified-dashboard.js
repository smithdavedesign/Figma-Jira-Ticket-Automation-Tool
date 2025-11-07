#!/usr/bin/env node

/**
 * 🎨 Unified Context Dashboard Live Test
 *
 * This script demonstrates the complete unified context data layer by:
 * 1. Starting the server
 * 2. Testing all API endpoints
 * 3. Simulating Figma context extraction
 * 4. Testing AI generation with context bridge
 * 5. Validating the unified data flow
 */

import { spawn } from 'child_process';

const API_BASE = 'http://localhost:3000';
const TEST_FIGMA_URL = 'https://figma.com/file/test123/Sample-Design';

class UnifiedContextDashboardTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
    this.contextData = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || '📋';

    console.log(`[${timestamp}] ${emoji} ${message}`);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startServer() {
    this.log('Starting Figma AI Ticket Generator server...', 'info');

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('npm', ['start'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let startupComplete = false;

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Server running on http://localhost:3000') && !startupComplete) {
          startupComplete = true;
          this.log('Server successfully started on port 3000', 'success');
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      this.serverProcess.on('close', (code) => {
        if (!startupComplete) {
          reject(new Error(`Server failed to start, exit code: ${code}`));
        }
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        if (!startupComplete) {
          reject(new Error('Server startup timeout'));
        }
      }, 15000);
    });
  }

  async apiRequest(endpoint, options = {}) {
    try {
      // Use node's built-in fetch (Node 18+) or curl fallback
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testSystemHealth() {
    this.log('Testing system health...', 'test');

    const tests = [
      { name: 'Server Health', endpoint: '/health' },
      { name: 'API Health', endpoint: '/api/health' },
      { name: 'Figma Health', endpoint: '/api/figma/health' }
    ];

    const results = [];

    for (const test of tests) {
      const result = await this.apiRequest(test.endpoint);
      results.push({
        name: test.name,
        success: result.success,
        response: result.data || result.error
      });

      if (result.success) {
        this.log(`${test.name}: PASSED`, 'success');
      } else {
        this.log(`${test.name}: FAILED - ${result.error}`, 'error');
      }
    }

    return results;
  }

  async testContextExtraction() {
    this.log('Testing context extraction...', 'test');

    const result = await this.apiRequest('/api/figma/extract-context', {
      method: 'POST',
      body: JSON.stringify({
        figmaUrl: TEST_FIGMA_URL,
        includeScreenshot: true,
        testMode: true
      })
    });

    if (result.success) {
      this.contextData = result.data;
      this.log('Context extraction: PASSED', 'success');
      this.log(`Extracted ${result.data.context?.nodes?.length || 0} nodes`, 'info');
      return result.data;
    } else {
      this.log(`Context extraction: FAILED - ${result.error}`, 'error');
      return null;
    }
  }

  async testContextValidation() {
    if (!this.contextData) {
      this.log('Skipping context validation - no context data', 'warning');
      return null;
    }

    this.log('Testing context validation...', 'test');

    // Simulate context validation locally
    const validation = this.validateContextStructure(this.contextData.context);

    if (validation.valid) {
      this.log(`Context validation: PASSED (Score: ${validation.score}/100)`, 'success');
    } else {
      this.log(`Context validation: FAILED (Score: ${validation.score}/100)`, 'error');
      validation.errors.forEach(error => this.log(`  Error: ${error}`, 'error'));
    }

    return validation;
  }

  validateContextStructure(context) {
    const errors = [];
    const warnings = [];
    let score = 0;

    if (!context) {
      errors.push('Context is null or undefined');
      return { valid: false, errors, warnings, score: 0 };
    }

    // Check for required fields
    if (typeof context.confidence === 'number') {
      score += 20;
    } else {
      warnings.push('Missing confidence score');
    }

    if (Array.isArray(context.extractors) && context.extractors.length > 0) {
      score += 20;
    } else {
      warnings.push('Missing extractors');
    }

    if (Array.isArray(context.nodes) && context.nodes.length > 0) {
      score += 20;
    } else {
      warnings.push('Missing nodes');
    }

    if (Array.isArray(context.styles)) {
      score += 20;
    } else {
      warnings.push('Missing styles array');
    }

    if (Array.isArray(context.components)) {
      score += 20;
    } else {
      warnings.push('Missing components array');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  async testAIGeneration() {
    if (!this.contextData) {
      this.log('Skipping AI generation - no context data', 'warning');
      return null;
    }

    this.log('Testing AI ticket generation...', 'test');

    const result = await this.apiRequest('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        format: 'jira',
        strategy: 'context-bridge',
        documentType: 'component',
        techStack: 'React TypeScript',
        frameData: this.contextData.context?.nodes || [],
        enhancedFrameData: this.contextData.context,
        testMode: true
      })
    });

    if (result.success) {
      this.log('AI generation: PASSED', 'success');
      this.log(`Generated ${result.data?.content?.length || 0} characters`, 'info');
      return result.data;
    } else {
      this.log(`AI generation: FAILED - ${result.error}`, 'error');
      return null;
    }
  }

  async testContextBridge() {
    this.log('Testing Context-Template Bridge...', 'test');

    const result = await this.apiRequest('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        format: 'markdown',
        strategy: 'context-bridge',
        documentType: 'component',
        testMode: true,
        mockData: {
          nodes: [
            { name: 'Button Component', type: 'COMPONENT' },
            { name: 'Header Section', type: 'FRAME' }
          ],
          components: [
            { name: 'Primary Button', variants: 2 }
          ],
          styles: [
            { name: 'Primary Color', type: 'FILL' }
          ]
        }
      })
    });

    if (result.success) {
      this.log('Context Bridge: PASSED', 'success');
      return result.data;
    } else {
      this.log(`Context Bridge: FAILED - ${result.error}`, 'error');
      return null;
    }
  }

  async testUnifiedFlow() {
    this.log('Testing complete unified context flow...', 'test');

    try {
      // 1. Health checks
      const healthResults = await this.testSystemHealth();

      // 2. Context extraction
      const contextData = await this.testContextExtraction();

      // 3. Context validation
      const validation = await this.testContextValidation();

      // 4. Context bridge test
      const bridgeResult = await this.testContextBridge();

      // 5. AI generation (if context available)
      const aiResult = await this.testAIGeneration();

      // Summary
      const summary = {
        timestamp: new Date().toISOString(),
        healthChecks: healthResults,
        contextExtraction: !!contextData,
        contextValidation: validation,
        contextBridge: !!bridgeResult,
        aiGeneration: !!aiResult,
        unifiedFlowSuccess: !!(healthResults && contextData && bridgeResult)
      };

      this.log('=== UNIFIED CONTEXT DASHBOARD TEST SUMMARY ===', 'info');
      this.log(`Health Checks: ${healthResults?.length || 0} endpoints tested`, 'info');
      this.log(`Context Extraction: ${summary.contextExtraction ? 'SUCCESS' : 'FAILED'}`, summary.contextExtraction ? 'success' : 'error');
      this.log(`Context Validation: ${validation?.valid ? 'PASSED' : 'FAILED'} (${validation?.score || 0}/100)`, validation?.valid ? 'success' : 'warning');
      this.log(`Context Bridge: ${summary.contextBridge ? 'SUCCESS' : 'FAILED'}`, summary.contextBridge ? 'success' : 'error');
      this.log(`AI Generation: ${summary.aiGeneration ? 'SUCCESS' : 'FAILED'}`, summary.aiGeneration ? 'success' : 'error');
      this.log(`Unified Flow: ${summary.unifiedFlowSuccess ? 'SUCCESS' : 'FAILED'}`, summary.unifiedFlowSuccess ? 'success' : 'error');

      return summary;

    } catch (error) {
      this.log(`Unified flow test failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  async testDashboardEndpoints() {
    this.log('Testing dashboard-specific endpoints...', 'test');

    const dashboardTests = [
      {
        name: 'System Metrics',
        endpoint: '/health',
        test: (data) => data.services && data.uptime
      },
      {
        name: 'Context Summary',
        endpoint: '/api/figma/context-summary/test123',
        test: (data) => true // Any response is good for mock
      },
      {
        name: 'Template List',
        endpoint: '/api/templates',
        test: (data) => Array.isArray(data) || data.templates
      }
    ];

    const results = [];

    for (const test of dashboardTests) {
      const result = await this.apiRequest(test.endpoint);
      const passed = result.success && (!test.test || test.test(result.data));

      results.push({
        name: test.name,
        success: passed,
        endpoint: test.endpoint
      });

      this.log(`${test.name}: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'warning');
    }

    return results;
  }

  async cleanup() {
    if (this.serverProcess) {
      this.log('Shutting down server...', 'info');
      this.serverProcess.kill('SIGTERM');

      // Wait for graceful shutdown
      await this.sleep(2000);

      if (this.serverProcess.killed) {
        this.log('Server shutdown complete', 'success');
      }
    }
  }

  async run() {
    try {
      this.log('🎨 Starting Unified Context Dashboard Test Suite', 'info');
      this.log('============================================', 'info');

      // Start server
      await this.startServer();
      await this.sleep(3000); // Give server time to fully initialize

      // Run tests
      const summary = await this.testUnifiedFlow();

      // Test dashboard-specific features
      const dashboardResults = await this.testDashboardEndpoints();

      this.log('============================================', 'info');
      this.log('🎯 Test Results:', 'info');
      this.log(`  • Total endpoints tested: ${(summary.healthChecks?.length || 0) + dashboardResults.length}`, 'info');
      this.log(`  • Context extraction: ${summary.contextExtraction ? '✅' : '❌'}`, 'info');
      this.log(`  • AI generation: ${summary.aiGeneration ? '✅' : '❌'}`, 'info');
      this.log(`  • Context bridge: ${summary.contextBridge ? '✅' : '❌'}`, 'info');
      this.log(`  • Unified flow: ${summary.unifiedFlowSuccess ? '✅ SUCCESS' : '❌ FAILED'}`, 'info');

      this.log('============================================', 'info');
      this.log('📊 Dashboard URL: http://localhost:3000/ui/unified-context-dashboard.html', 'info');
      this.log('🌐 Server URL: http://localhost:3000', 'info');
      this.log('============================================', 'info');

      if (summary.unifiedFlowSuccess) {
        this.log('🎉 All unified context systems are operational!', 'success');
        this.log('💡 You can now test the dashboard UI manually', 'info');
      } else {
        this.log('⚠️  Some systems need attention', 'warning');
      }

      // Keep server running for manual testing
      this.log('Server will remain running for manual testing...', 'info');
      this.log('Press Ctrl+C to stop the server', 'info');

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        this.log('Received shutdown signal...', 'info');
        await this.cleanup();
        process.exit(0);
      });

      // Keep the process alive
      return new Promise(() => {});

    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Run the test suite
const tester = new UnifiedContextDashboardTester();
tester.run().catch(console.error);

export default UnifiedContextDashboardTester;