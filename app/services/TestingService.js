/**
 * Testing Service
 *
 * Handles AI testing scenarios, performance monitoring, and test automation.
 * Provides comprehensive testing capabilities for the application.
 *
 * Phase 8: Server Architecture Refactoring - Business Services
 */

import { BaseService } from './BaseService.js';

export class TestingService extends BaseService {
  constructor(ticketService, screenshotService, analysisService, redis) {
    super('TestingService');
    this.ticketService = ticketService;
    this.screenshotService = screenshotService;
    this.analysisService = analysisService;
    this.redis = redis;
    this.testHistory = [];
    this.performanceMetrics = new Map();
    this.testScenarios = this.initializeTestScenarios();
  }

  /**
   * Initialize testing service
   */
  async onInitialize() {
    // Validate dependencies
    if (!this.ticketService) {
      throw new Error('Ticket service is required');
    }

    this.logger.info('Testing service dependencies validated');

    // Load test history from cache
    await this.loadTestHistory();
  }

  /**
   * Initialize predefined test scenarios
   * @returns {Array} Test scenarios
   */
  initializeTestScenarios() {
    return [
      {
        id: 'basic-ui-bug',
        name: 'Basic UI Bug',
        description: 'Test basic UI bug ticket generation with standard template',
        scenario: 'The login button is not responding when clicked on mobile devices',
        expectedStrategy: 'template',
        tags: ['ui', 'bug', 'mobile']
      },
      {
        id: 'visual-enhancement',
        name: 'Visual Enhancement',
        description: 'Test AI-enhanced ticket with visual analysis',
        scenario: 'The navigation menu overlaps with content on tablet view',
        expectedStrategy: 'enhanced',
        tags: ['ui', 'enhancement', 'visual']
      },
      {
        id: 'complex-feature',
        name: 'Complex Feature Request',
        description: 'Test complex feature request with AI strategy',
        scenario: 'Add dark mode support with user preference persistence and system theme detection',
        expectedStrategy: 'ai',
        tags: ['feature', 'complex', 'ai']
      },
      {
        id: 'performance-issue',
        name: 'Performance Issue',
        description: 'Test performance-related ticket generation',
        scenario: 'Page load time is extremely slow (>5 seconds) on the dashboard',
        expectedStrategy: 'template',
        tags: ['performance', 'bug', 'optimization']
      },
      {
        id: 'accessibility-issue',
        name: 'Accessibility Issue',
        description: 'Test accessibility-focused ticket generation',
        scenario: 'Screen readers cannot properly navigate the form elements',
        expectedStrategy: 'enhanced',
        tags: ['accessibility', 'a11y', 'forms']
      }
    ];
  }

  /**
   * Run AI scenario test
   * @param {string} scenarioId - Test scenario ID or custom scenario
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test results
   */
  async runAIScenarioTest(scenarioId, options = {}) {
    return this.executeOperation('runAIScenarioTest', async () => {
      const scenario = this.getTestScenario(scenarioId);
      const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      this.logger.info(`🧪 Running AI scenario test: ${scenario.name || scenarioId}`);

      const testResult = {
        testId,
        scenario: scenario.scenario || scenarioId,
        scenarioId: scenario.id || 'custom',
        timestamp: new Date().toISOString(),
        options,
        results: {},
        performance: {},
        success: false
      };

      const startTime = Date.now();

      try {
        // Generate ticket using different strategies
        const ticketResults = await this.testTicketGeneration(scenario, options);
        testResult.results.ticketGeneration = ticketResults;

        // Test screenshot generation if requested
        if (options.includeScreenshot) {
          const screenshotResults = await this.testScreenshotGeneration(options);
          testResult.results.screenshot = screenshotResults;
        }

        // Test visual analysis if requested
        if (options.includeVisualAnalysis && this.analysisService) {
          const analysisResults = await this.testVisualAnalysis(options);
          testResult.results.visualAnalysis = analysisResults;
        }

        // Calculate performance metrics
        testResult.performance = {
          totalDuration: Date.now() - startTime,
          ticketGeneration: ticketResults.duration,
          screenshot: testResult.results.screenshot?.duration || 0,
          analysis: testResult.results.visualAnalysis?.duration || 0
        };

        testResult.success = this.validateTestResults(testResult.results);

        this.logger.info(`✅ AI scenario test completed: ${testResult.success ? 'PASSED' : 'FAILED'}`);

      } catch (error) {
        testResult.error = error.message;
        testResult.performance.totalDuration = Date.now() - startTime;

        this.logger.error(`❌ AI scenario test failed: ${error.message}`);
      }

      // Save test result
      await this.saveTestResult(testResult);

      return testResult;

    }, { scenarioId, options });
  }

  /**
   * Run comprehensive test suite
   * @param {Array} scenarioIds - Test scenarios to run
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Test suite results
   */
  async runTestSuite(scenarioIds = null, options = {}) {
    return this.executeOperation('runTestSuite', async () => {
      const scenarios = scenarioIds || this.testScenarios.map(s => s.id);
      const suiteId = `suite-${Date.now()}`;

      this.logger.info(`🧪 Running comprehensive test suite: ${scenarios.length} scenarios`);

      const suiteResults = {
        suiteId,
        timestamp: new Date().toISOString(),
        scenarios: scenarios.length,
        results: [],
        summary: {
          passed: 0,
          failed: 0,
          total: scenarios.length,
          successRate: 0
        },
        performance: {
          totalDuration: 0,
          averageDuration: 0
        }
      };

      const startTime = Date.now();

      // Run tests sequentially to avoid overwhelming services
      for (const scenarioId of scenarios) {
        try {
          const testResult = await this.runAIScenarioTest(scenarioId, options);
          suiteResults.results.push(testResult);

          if (testResult.success) {
            suiteResults.summary.passed++;
          } else {
            suiteResults.summary.failed++;
          }

        } catch (error) {
          suiteResults.results.push({
            scenarioId,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
          suiteResults.summary.failed++;
        }
      }

      // Calculate final metrics
      suiteResults.performance.totalDuration = Date.now() - startTime;
      suiteResults.performance.averageDuration = suiteResults.performance.totalDuration / scenarios.length;
      suiteResults.summary.successRate = Math.round((suiteResults.summary.passed / suiteResults.summary.total) * 100);

      // Update performance metrics
      await this.updatePerformanceMetrics('test-suite', suiteResults.performance);

      this.logger.info(`✅ Test suite completed: ${suiteResults.summary.passed}/${suiteResults.summary.total} passed (${suiteResults.summary.successRate}%)`);

      return suiteResults;

    }, { scenarioIds, options });
  }

  /**
   * Test ticket generation functionality
   * @param {Object} scenario - Test scenario
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Ticket generation test results
   */
  async testTicketGeneration(scenario, options) {
    const startTime = Date.now();

    try {
      // Test with different strategies
      const strategies = options.strategies || ['ai', 'template', 'enhanced'];
      const results = {};

      for (const strategy of strategies) {
        const ticketResult = await this.ticketService.generateTicket({
          description: scenario.scenario,
          strategy: strategy,
          testMode: true
        });

        results[strategy] = {
          success: !!ticketResult,
          ticket: ticketResult,
          strategy: ticketResult?.strategy || strategy
        };
      }

      return {
        success: Object.values(results).some(r => r.success),
        results,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test screenshot generation functionality
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Screenshot test results
   */
  async testScreenshotGeneration(options) {
    const startTime = Date.now();

    try {
      const screenshotType = options.screenshotType || 'standard';
      const screenshotData = await this.screenshotService.generateTestScreenshot(screenshotType);

      return {
        success: !!screenshotData,
        screenshot: {
          type: screenshotType,
          size: screenshotData?.length || 0,
          format: 'base64'
        },
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test visual analysis functionality
   * @param {Object} options - Test options
   * @returns {Promise<Object>} Visual analysis test results
   */
  async testVisualAnalysis(options) {
    const startTime = Date.now();

    try {
      // Generate test screenshot first
      const screenshotData = await this.screenshotService.generateTestScreenshot('standard');

      // Perform analysis
      const analysisResult = await this.analysisService.analyzeScreenshot(screenshotData, {
        analysisType: 'comprehensive',
        includeElementDetails: true
      });

      return {
        success: !!analysisResult,
        analysis: {
          elements: analysisResult.elements?.length || 0,
          insights: analysisResult.insights?.length || 0,
          accessibilityIssues: analysisResult.accessibilityIssues?.length || 0
        },
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Get test scenario by ID
   * @param {string} scenarioId - Scenario ID
   * @returns {Object} Test scenario
   */
  getTestScenario(scenarioId) {
    // If it's a custom scenario (string), return as-is
    if (typeof scenarioId === 'string' && !this.testScenarios.find(s => s.id === scenarioId)) {
      return { scenario: scenarioId, id: 'custom' };
    }

    // Find predefined scenario
    const scenario = this.testScenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      throw new Error(`Test scenario not found: ${scenarioId}`);
    }

    return scenario;
  }

  /**
   * Validate test results
   * @param {Object} results - Test results
   * @returns {boolean} Whether test passed
   */
  validateTestResults(results) {
    // Check ticket generation
    if (results.ticketGeneration && !results.ticketGeneration.success) {
      return false;
    }

    // Check screenshot generation if included
    if (results.screenshot && !results.screenshot.success) {
      return false;
    }

    // Check visual analysis if included
    if (results.visualAnalysis && !results.visualAnalysis.success) {
      return false;
    }

    return true;
  }

  /**
   * Save test result
   * @param {Object} testResult - Test result
   */
  async saveTestResult(testResult) {
    try {
      // Add to memory history
      this.testHistory.push(testResult);

      // Keep only last 100 test results in memory
      if (this.testHistory.length > 100) {
        this.testHistory = this.testHistory.slice(-100);
      }

      // Save to Redis
      if (this.redis) {
        const historyKey = 'test-history';
        const resultKey = `test-result-${testResult.testId}`;

        // Save individual result
        await this.redis.setex(resultKey, 86400, JSON.stringify(testResult));

        // Update history list
        await this.redis.lpush(historyKey, testResult.testId);
        await this.redis.ltrim(historyKey, 0, 99); // Keep last 100
      }

    } catch (error) {
      this.logger.warn('Failed to save test result:', error.message);
    }
  }

  /**
   * Load test history from cache
   */
  async loadTestHistory() {
    try {
      if (this.redis) {
        const historyKeys = await this.redis.lrange('test-history', 0, 49); // Last 50

        for (const testId of historyKeys) {
          const testResult = await this.redis.get(`test-result-${testId}`);
          if (testResult) {
            this.testHistory.push(JSON.parse(testResult));
          }
        }

        this.logger.info(`Loaded ${this.testHistory.length} test results from cache`);
      }
    } catch (error) {
      this.logger.warn('Failed to load test history:', error.message);
    }
  }

  /**
   * Get test history
   * @param {number} limit - Number of results to return
   * @returns {Array} Test history
   */
  getTestHistory(limit = 20) {
    return this.testHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    const metrics = {};

    for (const [operation, data] of this.performanceMetrics) {
      metrics[operation] = {
        totalRuns: data.runs,
        averageDuration: data.totalDuration / data.runs,
        successRate: (data.successes / data.runs) * 100,
        lastRun: data.lastRun
      };
    }

    return metrics;
  }

  /**
   * Update performance metrics
   * @param {string} operation - Operation name
   * @param {Object} performance - Performance data
   */
  async updatePerformanceMetrics(operation, performance) {
    try {
      const existing = this.performanceMetrics.get(operation) || {
        runs: 0,
        successes: 0,
        totalDuration: 0,
        lastRun: null
      };

      existing.runs++;
      existing.totalDuration += performance.totalDuration || 0;
      existing.lastRun = new Date().toISOString();

      if (performance.success !== false) {
        existing.successes++;
      }

      this.performanceMetrics.set(operation, existing);

      // Save to Redis
      if (this.redis) {
        await this.redis.setex(
          `performance-metrics-${operation}`,
          86400,
          JSON.stringify(existing)
        );
      }

    } catch (error) {
      this.logger.warn('Failed to update performance metrics:', error.message);
    }
  }

  /**
   * Generate test report
   * @param {Object} options - Report options
   * @returns {Object} Test report
   */
  generateTestReport(options = {}) {
    const limit = options.limit || 50;
    const recentTests = this.getTestHistory(limit);

    const report = {
      generated: new Date().toISOString(),
      summary: {
        totalTests: recentTests.length,
        passed: recentTests.filter(t => t.success).length,
        failed: recentTests.filter(t => !t.success).length,
        successRate: 0
      },
      performance: this.getPerformanceMetrics(),
      testScenarios: this.testScenarios.length,
      recentTests: recentTests.slice(0, 10) // Last 10 tests
    };

    if (report.summary.totalTests > 0) {
      report.summary.successRate = Math.round(
        (report.summary.passed / report.summary.totalTests) * 100
      );
    }

    return report;
  }

  /**
   * Health check for testing service
   * @returns {Object} Health status
   */
  healthCheck() {
    const baseHealth = super.healthCheck();

    return {
      ...baseHealth,
      dependencies: {
        ticketService: !!this.ticketService,
        screenshotService: !!this.screenshotService,
        analysisService: !!this.analysisService,
        redis: !!this.redis
      },
      testScenarios: this.testScenarios.length,
      testHistory: this.testHistory.length,
      performanceMetrics: this.performanceMetrics.size,
      capabilities: [
        'ai-scenario-testing',
        'comprehensive-test-suites',
        'performance-monitoring',
        'screenshot-testing',
        'visual-analysis-testing',
        'test-reporting'
      ]
    };
  }

  /**
   * Cleanup service resources
   */
  async onShutdown() {
    // Save final test history
    if (this.testHistory.length > 0 && this.redis) {
      try {
        await this.redis.setex(
          'final-test-history',
          86400,
          JSON.stringify(this.testHistory)
        );
      } catch (error) {
        this.logger.warn('Failed to save final test history:', error.message);
      }
    }

    this.testHistory = [];
    this.performanceMetrics.clear();
    this.logger.info('Testing service cleanup completed');
  }
}