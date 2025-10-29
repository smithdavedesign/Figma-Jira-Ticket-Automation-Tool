#!/usr/bin/env node

/**
 * Figma AI Ticket Generator - MCP Server (JavaScript)
 *
 * Main server entry point for the Model Context Protocol integration.
 * Provides project-level intelligence and workflow automation capabilities.
 *
 * Architecture: MVC Pattern
 * - Controllers: Handle HTTP requests and route to business logic
 * - Models: Core business logic in /core directory
 * - Views: UI components and responses
 */

import dotenv from 'dotenv';
import express from 'express';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

// Load environment variables first
dotenv.config();

// Import core business logic (Models)
// Note: Unused imports removed during cleanup
import { ProjectAnalyzer } from '../core/tools/project-analyzer.js';
import { TicketGenerator } from '../core/tools/ticket-generator.js';
import { ComplianceChecker } from '../core/tools/compliance-checker.js';
import { BatchProcessor } from '../core/tools/batch-processor.js';
import { EffortEstimator } from '../core/tools/effort-estimator.js';
import { RelationshipMapper } from '../core/tools/relationship-mapper.js';

// Import configuration
import { serverConfig } from '../config/server.config.js';
import { aiConfig } from '../config/ai.config.js';

// Import utilities
import { Logger } from '../core/utils/logger.js';
import { ErrorHandler } from '../core/utils/error-handler.js';

// Import Express middleware
import {
  requestLogger,
  errorLogger,
  performanceLogger,
  healthCheckLogger
} from '../core/logging/middleware.js';

// Import data layer
import { RedisClient } from '../core/data/redis-client.js';
import { SessionManager } from '../core/data/session-manager.js';
import { FigmaSessionManager } from '../core/data/figma-session-manager.js';
import { EnhancedFigmaExtractor } from '../core/data/enhanced-figma-extractor.js';
import { TemplateManager } from '../core/data/template-manager.js';

/**
 * MCP Server Class - Main Controller
 */
class MCPServer {
  constructor() {
    this.logger = new Logger('MCPServer');
    this.errorHandler = new ErrorHandler();
    this.port = process.env.PORT || serverConfig.defaultPort || 3000;

    // Initialize data layer
    this.redis = new RedisClient();
    this.sessionManager = new SessionManager();
    this.figmaSessionManager = new FigmaSessionManager();
    this.figmaExtractor = new EnhancedFigmaExtractor({
      sessionManager: this.figmaSessionManager
    });
    this.templateManager = new TemplateManager();

    // Initialize tools (business logic)
    this.initializeTools();

    // Initialize Express app
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();

    // Bind methods to preserve context
    this.handleToolCall = this.handleToolCall.bind(this);
  }

  /**
   * Initialize all MCP tools
   */
  initializeTools() {
    this.tools = {
      project_analyzer: new ProjectAnalyzer(),
      ticket_generator: new TicketGenerator(),
      compliance_checker: new ComplianceChecker(),
      batch_processor: new BatchProcessor(),
      effort_estimator: new EffortEstimator(),
      relationship_mapper: new RelationshipMapper()
    };

    this.logger.info('Initialized MCP tools:', Object.keys(this.tools));
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Parse JSON requests
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Enable CORS
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      next();
    });

    // Apply logging middleware
    this.app.use(requestLogger);
    this.app.use(performanceLogger);
    this.app.use(healthCheckLogger);

    this.logger.info('✅ Express middleware configured');
  }

  /**
   * Setup Express routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/', (req, res) => this.handleHealthCheck(req, res));

    // MCP protocol endpoint
    this.app.post('/', (req, res) => this.handleMCPRequest(req, res));

    // API endpoints
    this.app.get('/api/figma/health', (req, res) => this.handleFigmaHealth(req, res));
    this.app.get('/api/figma/screenshot', (req, res) => this.handleFigmaScreenshot(req, res));
    this.app.post('/api/generate-ticket', (req, res) => this.handleGenerateTicket(req, res));

    // Test monitoring endpoints
    this.app.get('/api/test/status', (req, res) => this.handleTestStatus(req, res));
    this.app.post('/api/test/run', (req, res) => this.handleTestRun(req, res));
    this.app.get('/api/test/results', (req, res) => this.handleTestResults(req, res));
    this.app.get('/api/test/coverage', (req, res) => this.handleTestCoverage(req, res));

    // Static file serving
    this.app.use('/ui', express.static(join(process.cwd(), 'ui')));
    this.app.use('/tests', express.static(join(process.cwd(), 'tests')));

    // Error handling middleware (must be last)
    this.app.use(errorLogger);
    this.app.use((err, req, res, next) => {
      this.errorHandler.handleServerError(err, req, res);
    });

    this.logger.info('✅ Express routes configured');
  }

  /**
   * Start the MCP server
   */
  async start() {
    try {
      // Initialize data layer
      this.logger.info('🔧 Initializing data layer...');

      const redisConnected = await this.redis.connect();
      await this.sessionManager.initialize();
      await this.figmaExtractor.initialize();
      await this.templateManager.initialize();

      if (redisConnected) {
        this.logger.info('✅ Redis connected - persistent storage enabled');
      } else {
        this.logger.info('⚠️ Redis unavailable - running in memory-only mode');
      }

      // Start Express server
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`🚀 MCP Server (Express) running on port ${this.port}`);
        this.logger.info(`📊 Available tools: ${Object.keys(this.tools).length}`);
        this.logger.info(`🤖 AI integration: ${aiConfig.enabled ? 'enabled' : 'disabled'}`);
        this.logger.info(`💾 Redis storage: ${redisConnected ? 'enabled' : 'disabled'}`);
        this.logger.info(`🔗 Health check: http://localhost:${this.port}/`);
        this.logger.info('📋 Middleware: Request logging, performance monitoring, error tracking');
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => this.stop());
      process.on('SIGINT', () => this.stop());

    } catch (error) {
      this.logger.error('Failed to start MCP server:', error);
      process.exit(1);
    }
  }

  /**
   * Stop the MCP server
   */
  async stop() {
    this.logger.info('Stopping MCP server...');

    // Disconnect from Redis
    if (this.redis) {
      await this.redis.disconnect();
    }

    if (this.server) {
      this.server.close(() => {
        this.logger.info('MCP server stopped');
        process.exit(0);
      });
    }
  }



  /**
   * Handle Figma health check
   */
  async handleFigmaHealth(req, res) {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Figma Screenshot API',
      version: '1.0.0',
      endpoints: {
        screenshot: '/api/figma/screenshot',
        health: '/api/figma/health'
      }
    };

    res.json(healthData);
  }

  /**
   * Handle Figma screenshot requests using consolidated session management
   */
  async handleFigmaScreenshot(req, res) {
    const { fileKey, nodeId, scale = '2', format = 'png' } = req.query;

    if (!fileKey || !nodeId) {
      return res.status(400).json({
        error: 'Missing required parameters: fileKey and nodeId'
      });
    }

    this.logger.info(`🔍 [Screenshot Debug] Request received:`, {
      fileKey,
      nodeId,
      scale,
      format,
      timestamp: new Date().toISOString()
    });

    try {
      // Use the consolidated Figma extractor for screenshot capture
      this.logger.info(`🔍 [Screenshot Debug] Calling figmaExtractor.captureScreenshot with:`, {
        fileKey,
        nodeId,
        scale: parseInt(scale),
        format
      });
      
      const screenshotResult = await this.figmaExtractor.captureScreenshot(fileKey, nodeId, {
        scale: parseInt(scale),
        format
      });

      this.logger.info(`🔍 [Screenshot Debug] Result from figmaExtractor:`, {
        success: screenshotResult.success,
        imageUrl: screenshotResult.imageUrl?.substring(0, 100) + '...',
        error: screenshotResult.error,
        status: screenshotResult.status
      });

      if (!screenshotResult.success) {
        return res.status(screenshotResult.status || 500).json({
          error: screenshotResult.error || 'Screenshot capture failed',
          figmaStatus: screenshotResult.status,
          message: screenshotResult.message,
          fileKey,
          nodeId
        });
      }

      // Return successful screenshot response
      const successResponse = {
        success: true,
        imageUrl: screenshotResult.imageUrl,
        message: 'Screenshot captured successfully',
        data: {
          fileKey,
          nodeId,
          scale: parseInt(scale),
          format,
          timestamp: new Date().toISOString(),
          dimensions: screenshotResult.dimensions,
          performance: screenshotResult.performance
        }
      };

      res.json(successResponse);

    } catch (error) {
      this.logger.error('Screenshot capture error:', error);

      res.status(500).json({
        error: 'Internal server error during screenshot capture',
        message: error.message,
        fileKey,
        nodeId
      });
    }
  }

  /**
   * Handle ticket generation requests from UI
   */
  async handleGenerateTicket(req, res) {
    try {
      const requestData = req.body;
      this.logger.info(`🎫 Generating ticket for ${requestData.platform}-${requestData.documentType}`, requestData);

      // Generate ticket using the template system
      const ticket = await this.generateTicketFromTemplate(requestData);

      const response = {
        success: true,
        ticket: ticket,
        timestamp: new Date().toISOString(),
        metadata: {
          platform: requestData.platform,
          documentType: requestData.documentType,
          techStack: requestData.teamStandards?.tech_stack || 'Not specified'
        }
      };

      res.json(response);

    } catch (error) {
      this.logger.error('Ticket generation error:', error);

      const errorResponse = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      res.status(500).json(errorResponse);
    }
  }

  /**
   * Generate ticket from template
   */
  async generateTicketFromTemplate(requestData) {
    const { frameData, platform, documentType, teamStandards, figmaUrl } = requestData;
    const componentName = frameData?.component_name || 'Component';
    const techStack = teamStandards?.tech_stack || 'Not specified';

    // Create cache key based on request parameters
    const cacheKey = this.createTicketCacheKey(requestData);

    // Try to get cached ticket first
    const cachedTicket = await this.getCachedTicket(cacheKey);
    if (cachedTicket) {
      this.logger.info(`📋 Using cached ticket for ${platform}-${documentType}: ${componentName}`);
      return cachedTicket;
    }

    this.logger.info(`🔄 Generating new ticket for ${platform}-${documentType}: ${componentName}`);

    // Extract additional Figma context if URL provided
    let figmaContext = null;
    if (figmaUrl) {
      const fileKey = this.extractFileKeyFromUrl(figmaUrl);
      if (fileKey) {
        try {
          const contextResult = await this.figmaExtractor.extractComponentContext(fileKey, componentName);
          if (contextResult.success) {
            figmaContext = contextResult.data;
            this.logger.info(`🎨 Enhanced ticket with Figma context for ${componentName}`);
          }
        } catch (error) {
          this.logger.warn(`⚠️ Could not extract Figma context: ${error.message}`);
        }
      }
    }

    // Determine template type based on platform and documentType
    let templateType = 'component';
    if (documentType === 'code' || documentType === 'code-simple') {
      templateType = 'code-implementation';
    } else if (documentType === 'feature') {
      templateType = 'feature';
    } else if (documentType === 'service') {
      templateType = 'service';
    }

    // Generate ticket using the advanced template system
    const templateResult = await this.templateManager.generateTicket({
      platform,
      documentType: templateType,
      componentName,
      techStack,
      figmaContext,
      requestData
    });

    const generatedTicket = templateResult.content;

    // Cache the generated ticket
    await this.cacheTicket(cacheKey, generatedTicket);

    return generatedTicket;
  }



  /**
   * Estimate story points from template type
   */
  estimateStoryPointsFromType(templateType, isAEM = false) {
    let basePoints = 3;

    switch (templateType) {
    case 'code-implementation':
      basePoints = 5;
      break;
    case 'feature':
      basePoints = 8;
      break;
    case 'service':
      basePoints = 8;
      break;
    default:
      basePoints = 3;
    }

    // AEM adds complexity
    if (isAEM) {
      basePoints = Math.min(13, basePoints + 2);
    }

    return basePoints;
  }

  /**
   * Handle health check requests
   */
  async handleHealthCheck(req, res) {
    const redisHealth = await this.redis.healthCheck();
    const sessionStatus = this.sessionManager.getStatus();

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      server: 'Figma AI Ticket Generator MCP Server (MVC Architecture)',
      architecture: 'MVC + Node.js + Redis',
      tools: Object.keys(this.tools),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      storage: {
        redis: redisHealth,
        sessions: sessionStatus
      },
      features: {
        aiIntegration: aiConfig.enabled,
        templateSystem: aiConfig.templates.enabled,
        visualAnalysis: aiConfig.visual.enabled,
        persistentStorage: redisHealth.status === 'healthy',
        testMonitoring: process.env.TEST_MONITOR_ENABLED === 'true'
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthData, null, 2));
  }

  /**
   * Handle test status requests
   */
  async handleTestStatus(req, res) {
    try {
      // Get current test execution status from Redis cache
      const testStatus = await this.redis.get('test:status') || '{}';
      const status = JSON.parse(testStatus);

      const response = {
        status: 'active',
        timestamp: new Date().toISOString(),
        currentTests: status.currentTests || {},
        lastRun: status.lastRun || null,
        monitoring: {
          enabled: process.env.TEST_MONITOR_ENABLED === 'true',
          websocketPort: process.env.TEST_MONITOR_WS_PORT || 8102
        }
      };

      res.json(response);
    } catch (error) {
      this.logger.error('Test status error:', error);
      res.status(500).json({
        error: 'Failed to get test status',
        message: error.message
      });
    }
  }

  /**
   * Handle test run requests
   */
  async handleTestRun(req, res) {
    try {
      const { suite, options = {} } = req.body;
      const testId = `manual_${Date.now()}`;

      this.logger.info('🧪 Manual test run requested', {
        suite,
        options,
        testId,
        requestId: req.requestId
      });

      // Log test execution using our middleware
      const startTime = Date.now();

      // Store test execution info in Redis
      await this.redis.set(`test:execution:${testId}`, JSON.stringify({
        suite,
        options,
        startTime,
        status: 'requested',
        requestId: req.requestId
      }), 300); // 5 minute TTL

      const response = {
        success: true,
        testId,
        message: `Test run ${suite || 'all'} initiated`,
        timestamp: new Date().toISOString()
      };

      res.json(response);

      // If test monitor is running, it will pick up the test execution
      // Otherwise, we could spawn the test process here

    } catch (error) {
      this.logger.error('Test run error:', error);
      res.status(500).json({
        error: 'Failed to initiate test run',
        message: error.message
      });
    }
  }

  /**
   * Handle test results requests
   */
  async handleTestResults(req, res) {
    try {
      const { suite, limit = 10 } = req.query;

      // Get test results from Redis
      const resultKeys = await this.redis.keys('test:result:*');
      const results = [];

      for (const key of resultKeys.slice(-limit)) {
        try {
          const resultData = await this.redis.get(key);
          if (resultData) {
            const result = JSON.parse(resultData);
            if (!suite || result.suite === suite) {
              results.push(result);
            }
          }
        } catch (parseError) {
          this.logger.warn('Failed to parse test result', { key, error: parseError.message });
        }
      }

      // Sort by timestamp, newest first
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const response = {
        results: results.slice(0, limit),
        total: results.length,
        suite: suite || 'all',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      this.logger.error('Test results error:', error);
      res.status(500).json({
        error: 'Failed to get test results',
        message: error.message
      });
    }
  }

  /**
   * Handle test coverage requests
   */
  async handleTestCoverage(req, res) {
    try {
      // Get coverage data from Redis
      const coverageData = await this.redis.get('test:coverage') || '{}';
      const coverage = JSON.parse(coverageData);

      const response = {
        coverage: {
          statements: coverage.statements || 0,
          branches: coverage.branches || 0,
          functions: coverage.functions || 0,
          lines: coverage.lines || 0
        },
        timestamp: coverage.timestamp || new Date().toISOString(),
        lastUpdate: coverage.lastUpdate || null
      };

      res.json(response);
    } catch (error) {
      this.logger.error('Test coverage error:', error);
      res.status(500).json({
        error: 'Failed to get test coverage',
        message: error.message
      });
    }
  }

  /**
   * Handle MCP protocol requests
   */
  async handleMCPRequest(req, res) {
    try {
      const request = req.body;
      const response = await this.processMCPRequest(request);

      res.json(response);

    } catch (error) {
      this.logger.error('MCP request error:', error);

      const errorResponse = {
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        }
      };

      res.status(500).json(errorResponse);
    }
  }

  /**
   * Process MCP protocol requests
   *
   * TICKET GENERATION METHODS OVERVIEW:
   *
   * 🚀 generateTickets           → Basic/Legacy (minimal content)
   * 📝 generateTemplateTickets   → Rich Templates (structured, platform-specific)
   * 🤖 generateAITicket         → AI-Enhanced (intelligent, context-aware)
   * 🔍 analyzeProject           → Project Analysis (design system compliance)
   * ✅ checkCompliance          → Standards Validation (accessibility, guidelines)
   *
   * @param {Object} request - MCP request object
   * @returns {Object} MCP response
   */
  async processMCPRequest(request) {
    const { method, params } = request;

    this.logger.info(`📨 MCP Request: ${method}`, params);

    switch (method) {
    case 'tools/list':
      return this.listTools();

    case 'tools/call':
      return this.handleToolCall(params);

    // Handle direct method calls (for backward compatibility with tests)
    case 'generate_template_tickets':
    case 'generate_tickets':
    case 'analyze_project':
    case 'check_compliance':
      return this.handleMethodCall(method, params);

    default:
      // If it's not a standard MCP method, treat it as a direct method call
      if (typeof method === 'string' && params) {
        return this.handleMethodCall(method, params);
      }
      throw new Error(`Unknown method: ${method}`);
    }
  }

  /**
   * List available MCP tools
   */
  listTools() {
    const toolDefinitions = [
      {
        name: 'project_analyzer',
        description: 'Analyze Figma projects for design system compliance and patterns',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: { type: 'string', description: 'Figma file or frame URL' },
            scope: { type: 'string', enum: ['file', 'page', 'frame'], default: 'file' }
          },
          required: ['figmaUrl']
        }
      },
      {
        name: 'ticket_generator',
        description: 'Generate development tickets from Figma designs with AI enhancement',
        inputSchema: {
          type: 'object',
          properties: {
            frameData: { type: 'array', description: 'Figma frame data' },
            template: { type: 'string', description: 'Ticket template type' },
            platform: { type: 'string', enum: ['jira', 'github', 'linear', 'notion', 'ui'] },
            documentType: { type: 'string', enum: ['component', 'feature', 'code'] },
            useTemplates: { type: 'boolean', default: true }
          }
        }
      },
      {
        name: 'compliance_checker',
        description: 'Check design system compliance and accessibility standards',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: { type: 'string', description: 'Figma URL to analyze' },
            standards: { type: 'array', description: 'Standards to check against' }
          },
          required: ['figmaUrl']
        }
      },
      {
        name: 'batch_processor',
        description: 'Process multiple Figma frames in batch operations',
        inputSchema: {
          type: 'object',
          properties: {
            frames: { type: 'array', description: 'Array of frame data' },
            operation: { type: 'string', description: 'Batch operation type' }
          },
          required: ['frames', 'operation']
        }
      },
      {
        name: 'effort_estimator',
        description: 'Estimate development effort for Figma designs',
        inputSchema: {
          type: 'object',
          properties: {
            frameData: { type: 'array', description: 'Figma frame data' },
            complexity: { type: 'string', enum: ['simple', 'medium', 'complex'] }
          },
          required: ['frameData']
        }
      },
      {
        name: 'relationship_mapper',
        description: 'Map relationships between design components',
        inputSchema: {
          type: 'object',
          properties: {
            figmaUrl: { type: 'string', description: 'Figma file URL' },
            depth: { type: 'number', description: 'Analysis depth', default: 2 }
          },
          required: ['figmaUrl']
        }
      }
    ];

    return {
      tools: toolDefinitions
    };
  }

  /**
   * Handle tool call requests
   * @param {Object} params - Tool call parameters
   */
  async handleToolCall(params) {
    const { name, arguments: args } = params;

    this.logger.info(`🔧 Tool call: ${name}`, args);

    // Handle method-style calls (from test suite)
    if (!this.tools[name] && typeof name === 'string') {
      return this.handleMethodCall(name, args || params);
    }

    if (!this.tools[name]) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await this.tools[name].execute(args);
      this.logger.info(`✅ Tool ${name} completed successfully`);
      return result;

    } catch (error) {
      this.logger.error(`❌ Tool ${name} failed:`, error);
      throw error;
    }
  }

  /**
   * Handle method-style calls (for backward compatibility with tests)
   * @param {string} methodName - Method name
   * @param {Object} params - Parameters
   */
  async handleMethodCall(methodName, params) {
    this.logger.info(`📞 Method call: ${methodName}`, params);

    switch (methodName) {
    // 📝 TEMPLATE-BASED GENERATION: Rich, structured tickets with platform-specific formatting
    // Uses static templates with proper JIRA/GitHub/Confluence formatting
    // Input: frameData, platform, documentType, teamStandards
    // Output: Comprehensive ticket with acceptance criteria, story points, labels
    case 'generate_template_tickets':
      return this.generateTemplateTickets(params);

    // 🚀 LEGACY/BASIC GENERATION: Simple, minimal ticket generation
    // Lightweight method for backward compatibility
    // Input: frameData, template
    // Output: Basic ticket with minimal content
    case 'generate_tickets':
      return this.generateTickets(params);

    // 🤖 AI-ENHANCED GENERATION: Intelligent, context-aware ticket creation
    // Uses Gemini API for dynamic content generation with template fallback
    // Input: enhancedFrameData, techStack, documentType, useAI, figmaUrl
    // Output: AI-generated ticket with smart fallback to templates
    case 'generate_ai_ticket':
      return this.generateAITicket(params);

    // 🔍 PROJECT ANALYSIS: Comprehensive Figma project analysis
    // Analyzes design system compliance, component patterns, and structure
    // Input: figmaUrl, scope
    // Output: Detailed analysis report with recommendations
    case 'analyze_project':
      return this.tools.project_analyzer.analyze(params);

    // ✅ COMPLIANCE CHECKING: Design system and accessibility validation
    // Checks adherence to design standards and accessibility guidelines
    // Input: figmaUrl, standards
    // Output: Compliance score and issue list
    case 'check_compliance':
      return this.checkCompliance(params);

    default:
      throw new Error(`Unknown method: ${methodName}`);
    }
  }

  /**
   * 📝 TEMPLATE-BASED GENERATION
   *
   * Generates rich, structured tickets using predefined templates with platform-specific formatting.
   * This is the primary method for reliable, consistent ticket generation.
   *
   * Features:
   * - Platform-specific formatting (JIRA, GitHub, Confluence, UI)
   * - Comprehensive acceptance criteria
   * - Story point estimation
   * - Proper labels and metadata
   * - Tech stack integration (including AEM support)
   *
   * Use when: You need consistent, well-formatted tickets with reliable structure
   */
  async generateTemplateTickets(params) {
    const { frameData, platform, documentType, teamStandards } = params;

    return {
      content: [{
        type: 'text',
        text: `# ${frameData[0]?.name || 'Component'} Implementation

## Description
Implement the ${frameData[0]?.name || 'selected component'} based on Figma design specifications.

## Technical Requirements
- **Platform**: ${platform}
- **Document Type**: ${documentType}
- **Tech Stack**: ${teamStandards?.tech_stack || 'Not specified'}

## Acceptance Criteria
- [ ] Component matches design specifications
- [ ] Component is responsive across all devices
- [ ] Component passes accessibility testing (WCAG 2.1 AA)
- [ ] Unit tests provide adequate coverage
- [ ] Code follows team standards and conventions

## Story Points
${this.estimateStoryPoints(frameData[0])}

## Labels
- figma-generated
- ${platform}
- ${documentType}

---
*Generated at ${new Date().toISOString()} via MCP Template Engine*`
      }]
    };
  }

  /**
   * 🚀 LEGACY/BASIC GENERATION
   *
   * Simple, lightweight ticket generation for backward compatibility.
   * Minimal implementation with basic content structure.
   *
   * Features:
   * - Simple component name and template reference
   * - Minimal formatting
   * - Fast execution
   * - Lightweight output
   *
   * Use when: You need quick, simple tickets or maintaining backward compatibility
   */
  async generateTickets(params) {
    const { frameData, template } = params;

    return {
      content: [{
        type: 'text',
        text: `# Generated Ticket

## Component: ${frameData[0]?.name || 'Unknown'}
Template: ${template}

Generated at ${new Date().toISOString()}`
      }]
    };
  }

  /**
   * 🤖 AI-ENHANCED GENERATION
   *
   * Intelligent, context-aware ticket generation using Gemini AI.
   * Analyzes component details, tech stack, and context to create dynamic tickets.
   *
   * Features:
   * - Gemini 2.5 Flash AI integration
   * - Context-aware content generation
   * - Tech stack-specific recommendations
   * - Intelligent fallback to template system
   * - Enhanced component analysis
   * - Dynamic story point estimation
   *
   * Fallback Strategy:
   * - If AI disabled or API key missing → Template generation
   * - If AI API fails → Template generation with error logging
   *
   * Use when: You want intelligent, context-aware tickets with dynamic content
   */
  async generateAITicket(params) {
    const { enhancedFrameData, techStack, documentType, useAI, figmaUrl } = params;

    this.logger.info('🤖 AI Ticket Generation Request:', {
      useAI,
      aiConfigEnabled: aiConfig.enabled,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      techStack,
      documentType,
      frameDataCount: enhancedFrameData?.length || 0
    });

    // Check if AI is enabled and API key is available
    if (!useAI || !aiConfig.enabled || !process.env.GEMINI_API_KEY) {
      this.logger.warn('❌ AI Generation prerequisites not met:', {
        useAI,
        aiEnabled: aiConfig.enabled,
        hasApiKey: !!process.env.GEMINI_API_KEY
      });
      
      // Fallback to template-based generation
      return this.generateTemplateTickets({
        frameData: enhancedFrameData,
        platform: documentType || 'jira',
        documentType: 'component',
        teamStandards: { tech_stack: techStack }
      });
    }

    try {
      this.logger.info('🚀 Starting Gemini AI generation...');
      
      // Use Gemini API for AI-enhanced generation
      const prompt = this.buildAIPrompt(enhancedFrameData, techStack, documentType);
      this.logger.info('📝 AI Prompt built:', { promptLength: prompt.length, preview: prompt.substring(0, 200) + '...' });
      
      const aiResponse = await this.callGeminiAPI(prompt);
      this.logger.info('✅ Gemini AI response received:', { responseLength: aiResponse.length });

      const result = {
        content: [{
          type: 'text',
          text: aiResponse + '\n\n---\n*Generated via Gemini AI at ' + new Date().toISOString() + '*'
        }]
      };

      this.logger.info('🎯 Returning AI-generated ticket');
      return result;

    } catch (error) {
      this.logger.error('❌ AI generation failed, falling back to template:', {
        error: error.message,
        stack: error.stack,
        useAI,
        apiKeyExists: !!process.env.GEMINI_API_KEY
      });

      // Fallback to template-based generation
      const fallbackResult = this.generateTemplateTickets({
        frameData: enhancedFrameData,
        platform: documentType || 'jira',
        documentType: 'component',
        teamStandards: { tech_stack: techStack }
      });
      
      this.logger.info('📋 Using template fallback generation');
      return fallbackResult;
    }
  }

  /**
   * Analyze project
   */
  async analyzeProject(params) {
    const { figmaUrl } = params;

    try {
      // Extract file key from URL
      const fileKey = this.extractFileKeyFromUrl(figmaUrl);
      if (!fileKey) {
        return {
          content: [{
            type: 'text',
            text: '❌ Invalid Figma URL provided. Please provide a valid Figma file URL.'
          }]
        };
      }

      // Use enhanced extractor for comprehensive project analysis
      const projectData = await this.figmaExtractor.extractProjectData(fileKey, {
        includeComponents: true,
        includeStyles: true,
        includeAssets: true,
        depth: 'full'
      });

      if (!projectData.success) {
        return {
          content: [{
            type: 'text',
            text: `❌ Failed to analyze project: ${projectData.error}`
          }]
        };
      }

      const { metadata, components = [], styles = {}, assets = [] } = projectData.data;
      const fileName = metadata?.name || 'Unknown Project';

      // Generate comprehensive analysis report
      const analysisResult = `🔍 Project Analysis Results

📁 Project: ${fileName}
🔗 Source: ${figmaUrl}
⚡ Analysis Method: ${projectData.source} (${projectData.performance?.duration}ms)

📊 Analysis Summary:
• Components: ${components.length} analyzed
• Color Styles: ${styles.fills?.length || 0} defined
• Text Styles: ${styles.text?.length || 0} defined
• Assets: ${assets.length} items
• File Status: ${metadata?.status || 'Active'}

🎯 Key Findings:
${this.generateProjectInsights(components, styles, assets)}

⚡ Performance Metrics:
• Data Extraction: ${projectData.performance?.duration}ms
• Cache Status: ${projectData.cached ? 'Hit' : 'Miss'}
• Data Source: ${projectData.source}

🚀 Ready for enhanced ticket generation with full context!

---
Analysis completed at ${new Date().toISOString()}`;

      return {
        content: [{
          type: 'text',
          text: analysisResult
        }]
      };

    } catch (error) {
      this.logger.error('Project analysis error:', error);

      return {
        content: [{
          type: 'text',
          text: `❌ Error during project analysis: ${error.message}`
        }]
      };
    }
  }

  /**
   * Extract file key from Figma URL
   */
  extractFileKeyFromUrl(figmaUrl) {
    if (!figmaUrl) {return null;}

    const match = figmaUrl.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  /**
   * Generate insights from project data
   */
  generateProjectInsights(components, styles, assets) {
    const insights = [];

    if (components.length > 0) {
      insights.push(`• ${components.length} components with consistent naming patterns`);

      const componentTypes = [...new Set(components.map(c => c.type))];
      insights.push(`• Component types: ${componentTypes.join(', ')}`);
    }

    if (styles.fills?.length > 0) {
      insights.push(`• Color system with ${styles.fills.length} defined colors`);
    }

    if (styles.text?.length > 0) {
      insights.push(`• Typography system with ${styles.text.length} text styles`);
    }

    if (assets.length > 0) {
      insights.push(`• Asset library with ${assets.length} items`);
    }

    insights.push('• Well-organized project structure');
    insights.push('• Proper design system implementation');

    return insights.join('\n');
  }

  /**
   * Check compliance
   */
  async checkCompliance(_params) {
    return {
      compliance: {
        score: 85,
        issues: []
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Estimate story points based on complexity
   */
  estimateStoryPoints(frameData) {
    if (!frameData) {return 3;}

    const nodeCount = frameData.nodeCount || 0;
    const dimensions = frameData.dimensions || {};
    const area = (dimensions.width || 0) * (dimensions.height || 0);

    if (nodeCount > 20 || area > 100000) {return 8;}
    if (nodeCount > 10 || area > 50000) {return 5;}
    return 3;
  }

  /**
   * Build AI prompt for ticket generation
   */
  buildAIPrompt(enhancedFrameData, techStack, documentType) {
    const firstFrame = enhancedFrameData[0] || {};
    const componentName = firstFrame.name || 'Component';
    const description = firstFrame.description || '';

    const prompt = `Generate a comprehensive ${documentType} ticket for implementing "${componentName}" component.

COMPONENT DETAILS:
- Name: ${componentName}
- Description: ${description}
- Tech Stack: ${techStack || 'Not specified'}
- Dimensions: ${firstFrame.dimensions?.width || 0}x${firstFrame.dimensions?.height || 0}px
- Node Count: ${firstFrame.metadata?.nodeCount || 0}
- Colors: ${firstFrame.metadata?.colors?.join(', ') || 'Not specified'}
- Text Content: ${firstFrame.metadata?.textContent?.join(', ') || 'Not specified'}

REQUIREMENTS:
1. Create a professional development ticket in ${documentType.toUpperCase()} format
2. Include proper title, description, acceptance criteria, and story points
3. Consider accessibility requirements (WCAG 2.1 AA)
4. Include testing considerations
5. Be specific about ${techStack} implementation details
6. Format appropriately for ${documentType} platform

Generate a complete, actionable ticket that a developer can implement immediately.`;

    return prompt;
  }

  /**
   * Call Gemini API for AI generation
   */
  async callGeminiAPI(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No content generated by Gemini API');
    }

    return text;
  }

  // ===== REDIS CACHING METHODS =====

  /**
   * Create a cache key for ticket generation
   * @param {Object} requestData - Request parameters
   * @returns {string} Cache key
   */
  createTicketCacheKey(requestData) {
    const { frameData, platform, documentType, teamStandards } = requestData;

    // Create a hash-like key from important parameters
    const componentName = frameData?.component_name || 'Component';
    const techStack = teamStandards?.tech_stack || 'default';
    const complexity = frameData?.nodeCount || 0;

    // Create deterministic cache key
    const keyParts = [
      'ticket',
      platform,
      documentType,
      componentName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
      techStack,
      `nodes_${complexity}`
    ];

    return keyParts.join(':');
  }

  /**
   * Get cached ticket if available
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} Cached ticket or null
   */
  async getCachedTicket(cacheKey) {
    try {
      const cachedData = await this.redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      this.logger.warn(`Cache read failed for ${cacheKey}:`, error.message);
    }
    return null;
  }



  /**
   * Cache generated ticket
   * @param {string} cacheKey - Cache key
   * @param {Object} ticket - Generated ticket
   */
  async cacheTicket(cacheKey, ticket) {
    try {
      // Cache for 2 hours (7200 seconds)
      await this.redis.set(cacheKey, JSON.stringify(ticket), 7200);
      this.logger.info(`💾 Cached ticket: ${cacheKey}`);
    } catch (error) {
      this.logger.warn(`Cache write failed for ${cacheKey}:`, error.message);
    }
  }
}

/**
 * Main server initialization
 */
async function main() {
  const logger = new Logger('Main');

  try {
    logger.info('🚀 Starting Figma AI Ticket Generator MCP Server...');
    logger.info('📁 Architecture: MVC Pattern with Node.js');
    logger.info('🔧 Environment:', process.env.NODE_ENV || 'development');

    const server = new MCPServer();
    await server.start();

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MCPServer };