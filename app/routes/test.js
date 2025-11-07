/**
 * Test Routes Module
 *
 * Handles testing and AI testing endpoints.
 * Routes: /api/ai-test-dashboard, /api/test-ai-scenario, /api/test-ai-screenshots
 *
 * Phase 8: Server Architecture Refactoring - Phase 3
 */

import { BaseRoute } from './BaseRoute.js';

export class TestRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Test', serviceContainer);
  }

  /**
   * Register test routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // AI test dashboard
    router.get('/api/ai-test-dashboard', this.asyncHandler(this.handleAITestDashboard.bind(this)));

    // AI scenario testing
    router.post('/api/test-ai-scenario', this.asyncHandler(this.handleTestAIScenario.bind(this)));

    // AI screenshot testing
    router.post('/api/test-ai-screenshots', this.asyncHandler(this.handleTestAIScreenshots.bind(this)));

    // AI ticket generation testing (for Swagger UI compatibility)
    router.post('/test/ai-ticket-generation', this.asyncHandler(this.handleTestAITicketGeneration.bind(this)));

    // Context Intelligence test endpoints
    router.post('/api/test/unit/context-intelligence', this.asyncHandler(this.handleUnitContextIntelligenceTest.bind(this)));
    router.post('/api/test/integration/context-intelligence', this.asyncHandler(this.handleIntegrationContextIntelligenceTest.bind(this)));
    router.post('/api/context-intelligence/analyze', this.asyncHandler(this.handleContextIntelligenceAnalyze.bind(this)));

    this.logger.info('✅ Test routes registered');
  }

  /**
   * Handle AI test dashboard requests
   * Extracted from main server handleAITestDashboard method
   */
  async handleAITestDashboard(req, res) {
    this.logAccess(req, 'aiTestDashboard');

    const redis = this.getService('redis');
    const ticketService = this.getService('ticketService');

    try {
      // Get cached test results if available
      const cachedResults = await redis.get('ai-test-results');
      const testHistory = await redis.get('ai-test-history') || [];

      const dashboardData = {
        title: 'AI Testing Dashboard - Visual Enhanced AI with Gemini 2.0 Flash',
        timestamp: new Date().toISOString(),
        testResults: cachedResults ? JSON.parse(cachedResults) : null,
        testHistory: Array.isArray(testHistory) ? testHistory : [],
        availableStrategies: ticketService.getAvailableStrategies(),
        testScenarios: this.getTestScenarios(),
        performanceMetrics: await this.getPerformanceMetrics(),
        systemStatus: {
          redis: (await redis.healthCheck()).status,
          ai: this.getAITestStatus(),
          services: this.services.getHealthStatus()
        }
      };

      // Send HTML dashboard
      const htmlContent = this.generateDashboardHTML(dashboardData);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(htmlContent);

    } catch (error) {
      this.logger.error('Error generating AI test dashboard:', error);
      this.sendError(res, 'Failed to generate test dashboard', 500, { originalError: error.message });
    }
  }

  /**
   * Handle AI scenario testing requests
   * Extracted from main server handleTestAIScenario method
   */
  async handleTestAIScenario(req, res) {
    this.logAccess(req, 'testAIScenario');

    const { scenario, strategy, includeScreenshot } = req.body;

    // Validate required fields
    try {
      this.validateRequired(req.body, ['scenario']);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }

    const redis = this.getService('redis');
    const ticketService = this.getService('ticketService');
    const screenshotService = this.getService('screenshotService');

    try {
      this.logger.info(`🧪 Running AI test scenario: ${scenario}`);

      // Initialize services if not already initialized
      if (!ticketService.initialized) {
        await ticketService.initialize();
      }
      if (includeScreenshot && !screenshotService.initialized) {
        await screenshotService.initialize();
      }

      let screenshotData = null;
      if (includeScreenshot) {
        // Generate test screenshot
        screenshotData = await screenshotService.generateTestScreenshot();
      }

      // Generate ticket using specified strategy
      const ticketData = await ticketService.generateTicket({
        strategy: strategy || 'enhanced', // Use enhanced instead of AI for better test compatibility
        scenario: scenario,
        includeScreenshot: includeScreenshot,
        screenshotData: screenshotData,
        testMode: true
      });

      const testResult = {
        scenario,
        strategy: strategy || 'AI',
        timestamp: new Date().toISOString(),
        success: true,
        ticket: ticketData,
        screenshot: screenshotData ? {
          included: true,
          size: screenshotData.length,
          type: 'base64'
        } : null,
        performance: {
          duration: ticketData.performance?.duration || 0,
          cacheHit: ticketData.performance?.cacheHit || false
        }
      };

      // Cache test result
      await redis.set(`ai-test-result-${Date.now()}`, testResult, 3600);

      // Update test history
      const history = await redis.get('ai-test-history') || [];
      const updatedHistory = Array.isArray(history) ? history : [];
      updatedHistory.push({
        scenario,
        strategy: strategy || 'AI',
        timestamp: new Date().toISOString(),
        success: true
      });

      // Keep only last 50 test results
      if (updatedHistory.length > 50) {
        updatedHistory.splice(0, updatedHistory.length - 50);
      }

      await redis.set('ai-test-history', updatedHistory, 86400);

      this.sendSuccess(res, testResult, 'AI scenario test completed successfully');

    } catch (error) {
      this.logger.error('Error in AI scenario test:', error);

      const errorResult = {
        scenario,
        strategy: strategy || 'AI',
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };

      // Cache error result
      await redis.set(`ai-test-error-${Date.now()}`, errorResult, 3600);

      this.sendError(res, 'AI scenario test failed', 500, { originalError: error.message });
    }
  }

  /**
   * Handle AI screenshot testing requests
   * Extracted from main server handleTestAIScreenshots method
   */
  async handleTestAIScreenshots(req, res) {
    this.logAccess(req, 'testAIScreenshots');

    const { testType, includeVisualAnalysis } = req.body;

    const redis = this.getService('redis');
    const screenshotService = this.getService('screenshotService');
    const analysisService = this.getService('analysisService');

    try {
      this.logger.info(`🧪 Running AI screenshot test: ${testType || 'standard'}`);

      // Initialize screenshot service if not already initialized
      if (!screenshotService.initialized) {
        await screenshotService.initialize();
      }

      // Initialize analysis service if needed and visual analysis is requested
      if (includeVisualAnalysis && analysisService && !analysisService.initialized) {
        await analysisService.initialize();
      }

      // Generate test screenshot
      const screenshotData = await screenshotService.generateTestScreenshot(testType);

      let visualAnalysis = null;
      if (includeVisualAnalysis && analysisService) {
        // Perform visual AI analysis
        visualAnalysis = await analysisService.analyzeScreenshot(screenshotData);
      }

      const testResult = {
        testType: testType || 'standard',
        timestamp: new Date().toISOString(),
        success: true,
        screenshot: {
          generated: true,
          size: screenshotData.length,
          type: 'base64'
        },
        visualAnalysis: visualAnalysis ? {
          included: true,
          insights: visualAnalysis.insights || [],
          elements: visualAnalysis.elements || [],
          suggestions: visualAnalysis.suggestions || []
        } : null,
        performance: {
          screenshotDuration: screenshotData.performance?.duration || 0,
          analysisDuration: visualAnalysis?.performance?.duration || 0
        }
      };

      // Cache test result
      await redis.set(`ai-screenshot-test-${Date.now()}`, testResult, 3600);

      this.sendSuccess(res, testResult, 'AI screenshot test completed successfully');

    } catch (error) {
      this.logger.error('Error in AI screenshot test:', error);
      this.sendError(res, 'AI screenshot test failed', 500, {
        originalError: error.message
      });
    }
  }

  /**
   * Handle AI ticket generation testing requests
   * For Swagger UI compatibility
   */
  async handleTestAITicketGeneration(req, res) {
    this.logAccess(req, 'testAITicketGeneration');

    const { description, strategy = 'enhanced', includeScreenshot = false } = req.body;

    try {
      // Validate required fields
      this.validateRequired(req.body, ['description']);
    } catch (error) {
      return this.sendError(res, error.message, 400);
    }

    const ticketService = this.getService('ticketService');

    try {
      this.logger.info(`🧪 Running AI ticket generation test: ${description}`);

      // Initialize service if not already initialized
      if (!ticketService.initialized) {
        await ticketService.initialize();
      }

      // Generate ticket using specified strategy
      const ticketData = await ticketService.generateTicket({
        strategy: strategy,
        scenario: description,
        includeScreenshot: includeScreenshot,
        testMode: true
      });

      const testResult = {
        description,
        strategy,
        timestamp: new Date().toISOString(),
        success: true,
        ticket: ticketData,
        performance: {
          duration: ticketData.performance?.duration || 0,
          cacheHit: ticketData.performance?.cacheHit || false
        }
      };

      this.sendSuccess(res, testResult, 'AI ticket generation test completed successfully');

    } catch (error) {
      this.logger.error('Error in AI ticket generation test:', error);
      this.sendError(res, 'AI ticket generation test failed', 500, {
        originalError: error.message
      });
    }
  }

  /**
   * Get available test scenarios
   * @returns {Array} Array of test scenarios
   */
  getTestScenarios() {
    return [
      {
        name: 'Basic UI Bug',
        description: 'Test basic UI bug ticket generation with standard template',
        scenario: 'The login button is not responding when clicked on mobile devices'
      },
      {
        name: 'Visual Enhancement',
        description: 'Test AI-enhanced ticket with visual analysis',
        scenario: 'The navigation menu overlaps with content on tablet view'
      },
      {
        name: 'Complex Feature Request',
        description: 'Test complex feature request with AI strategy',
        scenario: 'Add dark mode support with user preference persistence and system theme detection'
      },
      {
        name: 'Performance Issue',
        description: 'Test performance-related ticket generation',
        scenario: 'Page load time is extremely slow (>5 seconds) on the dashboard'
      },
      {
        name: 'Accessibility Issue',
        description: 'Test accessibility-focused ticket generation',
        scenario: 'Screen readers cannot properly navigate the form elements'
      }
    ];
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  async getPerformanceMetrics() {
    const redis = this.getService('redis');

    try {
      const metrics = await redis.get('performance-metrics') || {};
      return typeof metrics === 'string' ? JSON.parse(metrics) : metrics;
    } catch (error) {
      this.logger.warn('Error getting performance metrics:', error.message);
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        successRate: 0,
        cacheHitRate: 0
      };
    }
  }

  /**
   * Get AI test status
   * @returns {Object} AI test status
   */
  getAITestStatus() {
    try {
      const ticketService = this.getService('ticketService');
      const visualAIService = this.getService('visualAIService');
      const aiOrchestrator = this.getService('aiOrchestrator');

      return {
        ticketService: !!ticketService,
        visualAI: !!visualAIService,
        aiOrchestrator: !!aiOrchestrator,
        strategies: ticketService?.getAvailableStrategies() || [],
        testMode: true
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Generate dashboard HTML
   * @param {Object} data - Dashboard data
   * @returns {string} HTML content
   */
  generateDashboardHTML(data) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #007acc; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
        .status-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007acc; }
        .test-scenario { background: #e8f4fd; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .metric { display: inline-block; margin: 5px 10px; padding: 5px 10px; background: #007acc; color: white; border-radius: 3px; }
        .btn { padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #005a9e; }
        pre { background: #f1f1f1; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.title}</h1>
            <p>Generated at: ${data.timestamp}</p>
        </div>

        <div class="section">
            <h2>System Status</h2>
            <div class="status-grid">
                <div class="status-card">
                    <h3>Redis</h3>
                    <p>Status: ${data.systemStatus.redis}</p>
                </div>
                <div class="status-card">
                    <h3>AI Services</h3>
                    <p>Ticket Service: ${data.systemStatus.ai.ticketService ? '✅' : '❌'}</p>
                    <p>Visual AI: ${data.systemStatus.ai.visualAI ? '✅' : '❌'}</p>
                </div>
                <div class="status-card">
                    <h3>Available Strategies</h3>
                    <p>${data.availableStrategies.join(', ')}</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Test Scenarios</h2>
            ${data.testScenarios.map(scenario => `
                <div class="test-scenario">
                    <h4>${scenario.name}</h4>
                    <p>${scenario.description}</p>
                    <p><strong>Scenario:</strong> ${scenario.scenario}</p>
                    <button class="btn" onclick="runTest('${scenario.scenario}')">Run Test</button>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>Performance Metrics</h2>
            <div>
                <span class="metric">Avg Response: ${data.performanceMetrics.averageResponseTime}ms</span>
                <span class="metric">Total Requests: ${data.performanceMetrics.totalRequests}</span>
                <span class="metric">Success Rate: ${data.performanceMetrics.successRate}%</span>
                <span class="metric">Cache Hit Rate: ${data.performanceMetrics.cacheHitRate}%</span>
            </div>
        </div>

        ${data.testHistory.length > 0 ? `
        <div class="section">
            <h2>Recent Test History</h2>
            <pre>${JSON.stringify(data.testHistory.slice(-10), null, 2)}</pre>
        </div>
        ` : ''}
    </div>

    <script>
        function runTest(scenario) {
            fetch('/api/test-ai-scenario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenario, strategy: 'AI', includeScreenshot: true })
            })
            .then(response => response.json())
            .then(data => {
                alert('Test completed: ' + (data.success ? 'SUCCESS' : 'FAILED'));
                location.reload();
            })
            .catch(error => {
                alert('Test failed: ' + error.message);
            });
        }
    </script>
</body>
</html>`;
  }

  /**
   * Handle unit Context Intelligence test execution
   */
  async handleUnitContextIntelligenceTest(req, res) {
    this.logAccess(req, 'unitContextIntelligenceTest');

    try {
      const { spawn } = await import('child_process');
      const path = await import('path');

      const testProcess = spawn('npm', ['test', 'tests/unit/context-intelligence.test.js'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      testProcess.on('close', (code) => {
        const testResult = {
          testType: 'unit',
          testFile: 'context-intelligence.test.js',
          timestamp: new Date().toISOString(),
          exitCode: code,
          success: code === 0,
          output: output,
          error: error,
          duration: Date.now() - testProcess.spawnfile || 0
        };

        if (code === 0) {
          this.sendSuccess(res, testResult, 'Context Intelligence unit tests completed successfully');
        } else {
          this.sendError(res, 'Context Intelligence unit tests failed', 500, testResult);
        }
      });

    } catch (error) {
      this.logger.error('Error running Context Intelligence unit tests:', error);
      this.sendError(res, 'Failed to execute unit tests', 500, { originalError: error.message });
    }
  }

  /**
   * Handle integration Context Intelligence test execution
   */
  async handleIntegrationContextIntelligenceTest(req, res) {
    this.logAccess(req, 'integrationContextIntelligenceTest');

    try {
      const { spawn } = await import('child_process');

      const testProcess = spawn('npm', ['test', 'tests/unit/context-intelligence-integration.test.js'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      let error = '';

      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      testProcess.on('close', (code) => {
        const testResult = {
          testType: 'integration',
          testFile: 'context-intelligence-integration.test.js',
          timestamp: new Date().toISOString(),
          exitCode: code,
          success: code === 0,
          output: output,
          error: error,
          duration: Date.now() - testProcess.spawnfile || 0
        };

        if (code === 0) {
          this.sendSuccess(res, testResult, 'Context Intelligence integration tests completed successfully');
        } else {
          this.sendError(res, 'Context Intelligence integration tests failed', 500, testResult);
        }
      });

    } catch (error) {
      this.logger.error('Error running Context Intelligence integration tests:', error);
      this.sendError(res, 'Failed to execute integration tests', 500, { originalError: error.message });
    }
  }

  /**
   * Handle Context Intelligence live analysis
   */
  async handleContextIntelligenceAnalyze(req, res) {
    this.logAccess(req, 'contextIntelligenceAnalyze');

    const { analysisType, testData, components } = req.body;

    try {
      // Dynamic import of Context Intelligence modules
      const ContextIntelligenceOrchestratorModule = await import('../../core/context/context-intelligence-orchestrator.js');
      const ContextIntelligenceOrchestrator = ContextIntelligenceOrchestratorModule.default;

      // Initialize orchestrator
      const orchestrator = new ContextIntelligenceOrchestrator({
        enabledComponents: components || ['semantic', 'interaction', 'accessibility', 'pattern', 'performance'],
        cacheEnabled: false, // Disable cache for live testing
        performanceMode: 'balanced'
      });

      const startTime = Date.now();

      // Perform analysis based on type
      let analysisResult;

      switch (analysisType) {
      case 'semantic':
        analysisResult = await orchestrator.performSemanticAnalysis(testData);
        break;
      case 'interaction':
        analysisResult = await orchestrator.performInteractionAnalysis(testData);
        break;
      case 'accessibility':
        analysisResult = await orchestrator.performAccessibilityAnalysis(testData);
        break;
      case 'pattern':
        analysisResult = await orchestrator.performPatternAnalysis(testData);
        break;
      case 'performance':
        analysisResult = await orchestrator.performPerformanceAnalysis(testData);
        break;
      case 'comprehensive':
      default:
        analysisResult = await orchestrator.performComprehensiveAnalysis(testData);
        break;
      }

      const duration = Date.now() - startTime;

      const result = {
        analysisType: analysisType || 'comprehensive',
        timestamp: new Date().toISOString(),
        duration: duration,
        success: true,
        analysis: analysisResult,
        metadata: {
          enabledComponents: orchestrator.enabledComponents,
          dataSize: JSON.stringify(testData).length,
          performanceMode: 'balanced'
        }
      };

      this.sendSuccess(res, result, 'Context Intelligence analysis completed successfully');

    } catch (error) {
      this.logger.error('Error in Context Intelligence analysis:', error);

      this.sendError(res, 'Context Intelligence analysis failed', 500, {
        originalError: error.message,
        analysisType: analysisType || 'comprehensive',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get test routes health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const baseHealth = super.getHealthStatus();

    return {
      ...baseHealth,
      endpoints: [
        '/api/ai-test-dashboard',
        '/api/test-ai-scenario',
        '/api/test-ai-screenshots',
        '/api/test/unit/context-intelligence',
        '/api/test/integration/context-intelligence',
        '/api/context-intelligence/analyze'
      ],
      serviceRequirements: [
        'redis',
        'ticketService',
        'screenshotService',
        'visualAIService'
      ],
      testCapabilities: [
        'scenario-testing',
        'screenshot-testing',
        'visual-analysis',
        'performance-metrics',
        'test-history',
        'context-intelligence-unit-testing',
        'context-intelligence-integration-testing',
        'context-intelligence-live-analysis'
      ]
    };
  }
}
export default TestRoutes;
