#!/usr/bin/env node

/**
 * Figma AI Ticket Generator - Refactored Server
 *
 * Phase 8: Clean Architecture Implementation
 * Streamlined server using dependency injection, service layer, and route registry.
 *
 * Previous: 2,272-line monolithic server
 * Current: ~200-line orchestrator with clean separation of concerns
 */

import dotenv from 'dotenv';
import express from 'express';
import { Logger } from '../core/utils/logger.js';
import { ErrorHandler } from '../core/utils/error-handler.js';

// Architecture Components
import { ServiceContainer } from './controllers/ServiceContainer.js';
import { RouteRegistry } from './core/RouteRegistry.js';

// AI Services
import { AIOrchestrator } from '../core/ai/orchestrator.js';

// Services
import { TicketGenerationService } from './services/TicketGenerationService.js';
import { ScreenshotService } from './services/ScreenshotService.js';
import { AnalysisService } from './services/AnalysisService.js';
import { TestingService } from './services/TestingService.js';
import { ConfigurationService } from './services/ConfigurationService.js';

// Context Layer
import { ContextManager } from '../core/context/ContextManager.js';

// Data layer
import { RedisClient } from '../core/data/redis-client.js';
import { SessionManager } from '../core/data/session-manager.js';
import { FigmaSessionManager } from '../core/data/figma-session-manager.js';

// Load environment variables
dotenv.config();

/**
 * Refactored Server Class
 *
 * Clean, maintainable server using Phase 8 architecture:
 * - ServiceContainer for dependency injection
 * - RouteRegistry for automatic route discovery
 * - Business services for core functionality
 * - Configuration service for centralized settings
 */
export class Server {
  constructor() {
    this.logger = new Logger('Server');
    this.errorHandler = new ErrorHandler();

    // Express application
    this.app = express();

    // Core architecture components
    this.serviceContainer = new ServiceContainer();
    this.routeRegistry = null; // Initialized after services

    // Server state
    this.server = null;
    this.isStarted = false;
    this.startTime = null;
  }

  /**
   * Initialize and start the server
   */
  async start() {
    try {
      this.logger.info('🚀 Starting Figma AI Ticket Generator - Phase 8 Architecture');
      this.logger.info('📐 Architecture: Clean DI + Service Layer + Route Registry');

      this.startTime = Date.now();

      // Phase 1: Initialize service container
      await this.initializeServiceContainer();

      // Phase 2: Setup Express middleware
      this.setupExpressMiddleware();

      // Phase 3: Initialize route registry
      await this.initializeRouteRegistry();

      // Phase 4: Setup error handling
      this.setupErrorHandling();

      // Phase 5: Start HTTP server
      await this.startHttpServer();

      // Phase 6: Setup graceful shutdown
      this.setupGracefulShutdown();

      this.isStarted = true;

      const startupTime = Date.now() - this.startTime;
      this.logger.info(`✅ Server started in ${startupTime}ms`);
      this.logger.info(`🌐 Server running on http://localhost:${this.getPort()}`);
      this.logger.info(`📊 Services: ${this.serviceContainer.getRegisteredServices().length}`);
      this.logger.info(`🛣️  Routes: ${this.routeRegistry.getRoutes().size}`);

    } catch (error) {
      this.logger.error('❌ Server startup failed:', error);
      await this.shutdown();
      throw error;
    }
  }

  /**
   * Initialize service container with all services
   */
  async initializeServiceContainer() {
    this.logger.info('🔧 Initializing Service Container...');

    try {
      // Initialize core data services
      this.logger.info('📦 Creating data layer services...');
      const redis = new RedisClient();
      const sessionManager = new SessionManager();
      const figmaSessionManager = new FigmaSessionManager();
      this.logger.info('✅ Data layer services created');

      // Register core services
      this.logger.info('📋 Registering core services...');
      // Note: ServiceContainer should not register itself to avoid infinite recursion during shutdown
      this.serviceContainer.register('redis', () => redis, true, []);
      this.serviceContainer.register('sessionManager', () => sessionManager, true, []);
      this.serviceContainer.register('figmaSessionManager', () => figmaSessionManager, true, []);
      this.logger.info('✅ Core services registered');

      // Register business services with dependencies
      this.logger.info('🏗️ Registering business services...');
      this.serviceContainer.register('configurationService', (container, redis) => new ConfigurationService(redis), true, ['redis']);

      // Import and register template manager
      const { TemplateManager } = await import('../core/data/template-manager.js');
      this.serviceContainer.register('templateManager', (container, redis) => new TemplateManager({ redis }), true, ['redis']);

      // Import and register visual AI service
      const { VisualEnhancedAIService } = await import('../core/ai/visual-enhanced-ai-service.js');
      this.serviceContainer.register('visualAIService', (container, redis, configService) => new VisualEnhancedAIService(redis, configService), true, ['redis', 'configurationService']);

      this.serviceContainer.register('screenshotService', (container, redis, configService, figmaSession) =>
        new ScreenshotService(redis, configService, figmaSession), true, ['redis', 'configurationService', 'figmaSessionManager']);

      this.serviceContainer.register('contextManager', (container) =>
        new ContextManager(), true, []);

      this.serviceContainer.register('analysisService', (container, redis, configService, screenshotService) =>
        new AnalysisService(redis, configService, screenshotService), true, ['redis', 'configurationService', 'screenshotService']);

      this.serviceContainer.register('testingService', (container, redis, configService, screenshotService, analysisService, ticketService) =>
        new TestingService(ticketService, screenshotService, analysisService, redis), true, ['redis', 'configurationService', 'screenshotService', 'analysisService', 'ticketService']);

      // Register ticket generation service with correct dependencies
      this.serviceContainer.register('ticketGenerationService', (container, templateManager, visualAIService, aiOrchestrator, redis) =>
        new TicketGenerationService(templateManager, visualAIService, aiOrchestrator, redis), true, ['templateManager', 'visualAIService', 'aiOrchestrator', 'redis']);

      // Register AI orchestrator
      this.serviceContainer.register('aiOrchestrator', (container, redis, configService) =>
        new AIOrchestrator(redis, configService), true, ['redis', 'configurationService']);

      // Register alias for backward compatibility
      this.serviceContainer.register('ticketService', (container) => container.get('ticketGenerationService'), true, ['ticketGenerationService']);

      this.logger.info(`✅ Service Container initialized: ${this.serviceContainer.getRegisteredServices().length} services`);

      // Initialize all services that need initialization
      await this.initializeAllServices();

    } catch (error) {
      this.logger.error('❌ Service Container initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize all services by instantiating them and calling initialize()
   */
  async initializeAllServices() {
    this.logger.info('🔧 Initializing services...');

    try {
      // Get all service names
      const serviceNames = this.serviceContainer.getRegisteredServices();

      // Instantiate all services first (this triggers lazy loading)
      for (const serviceName of serviceNames) {
        this.serviceContainer.get(serviceName);
      }

      // Now initialize all instantiated services
      await this.serviceContainer.initializeServices();

      this.logger.info('✅ All services initialized');
    } catch (error) {
      this.logger.error('❌ Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup Express middleware
   */
  setupExpressMiddleware() {
    this.logger.info('🔧 Setting up Express middleware...');

    // Enhanced CORS middleware for file:// protocol support (MUST be first)
    this.app.use((req, res, next) => {
      // Handle null origin (file:// protocol)
      const origin = req.headers.origin;
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'false');

      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Basic middleware
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Static file serving for documentation
    this.app.use('/docs', express.static('docs'));
    this.app.use('/api-docs', express.static('app/api-docs'));
    this.app.use('/ui', express.static('ui'));
    this.app.use('/tests', express.static('tests'));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      });

      next();
    });

    // Health check endpoint (before route registry)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        architecture: 'Phase 8 - Clean Architecture',
        services: this.serviceContainer.getRegisteredServices(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    this.logger.info('✅ Express middleware configured');
  }

  /**
   * Initialize route registry
   */
  async initializeRouteRegistry() {
    this.logger.info('🔧 Initializing Route Registry...');

    this.routeRegistry = new RouteRegistry(this.app, this.serviceContainer, {
      routesDirectory: './app/routes',
      routePrefix: '/api',
      enableHealthChecks: true,
      enableMetrics: true,
      enableVersioning: false,
      autoLoad: true
    });

    await this.routeRegistry.initialize();

    this.logger.info(`✅ Route Registry initialized: ${this.routeRegistry.getRoutes().size} routes`);
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    this.logger.info('🔧 Setting up error handling...');

    // 404 handler
    this.app.use((req, res, next) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
        availableRoutes: this.getAvailableRoutes()
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      this.logger.error('Global error handler:', error);

      const statusCode = error.statusCode || error.status || 500;
      const isDevelopment = process.env.NODE_ENV === 'development';

      res.status(statusCode).json({
        error: error.name || 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        path: req.path,
        ...(isDevelopment && { stack: error.stack }),
        requestId: req.id || 'unknown'
      });
    });

    this.logger.info('✅ Error handling configured');
  }

  /**
   * Start HTTP server
   */
  async startHttpServer() {
    return new Promise((resolve, reject) => {
      const port = this.getPort();

      this.server = this.app.listen(port, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });

      this.server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          this.logger.error(`Port ${port} is already in use`);
        } else {
          this.logger.error('Server error:', error);
        }
        reject(error);
      });
    });
  }

  /**
   * Setup graceful shutdown handling
   */
  setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach(signal => {
      process.on(signal, async () => {
        this.logger.info(`Received ${signal}, starting graceful shutdown...`);
        await this.shutdown();
        process.exit(0);
      });
    });

    process.on('uncaughtException', async (error) => {
      this.logger.error('Uncaught Exception:', error);
      await this.shutdown();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      this.logger.error('Unhandled Promise Rejection:', reason);
      await this.shutdown();
      process.exit(1);
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    if (!this.isStarted) {
      return;
    }

    this.logger.info('🛑 Shutting down server...');

    try {
      // Close HTTP server
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
        this.logger.info('✅ HTTP server closed');
      }

      // Shutdown service container
      if (this.serviceContainer) {
        await this.serviceContainer.shutdown();
        this.logger.info('✅ Services shut down');
      }

      this.isStarted = false;
      this.logger.info('✅ Graceful shutdown completed');

    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }

  /**
   * Get server port
   * @returns {number} Server port
   */
  getPort() {
    return process.env.PORT || 3000;
  }

  /**
   * Get available routes for 404 responses
   * @returns {Array} Available routes
   */
  getAvailableRoutes() {
    if (!this.routeRegistry) {
      return [];
    }

    const routes = [];
    for (const [name, routeData] of this.routeRegistry.getRoutes()) {
      // Handle BaseRoute instances (new system)
      if (routeData.type === 'BaseRoute') {
        // BaseRoute instances register their own routes, so we can't easily get the paths
        // Instead, show that they're registered with their group
        routes.push({
          name,
          method: 'MULTIPLE', // BaseRoute instances can have multiple methods
          path: `/${name}/*`, // Indicate this is a route group
          group: routeData.group || 'unknown',
          type: 'BaseRoute'
        });
      } else if (routeData.config) {
        // Handle legacy route format
        routes.push({
          name,
          method: routeData.config.method.toUpperCase(),
          path: routeData.config.path,
          group: routeData.group || 'unknown',
          type: 'legacy'
        });
      } else {
        // Handle unknown format
        routes.push({
          name,
          method: 'UNKNOWN',
          path: 'unknown',
          group: routeData.group || 'unknown',
          type: 'unknown'
        });
      }
    }

    return routes.sort((a, b) => a.path.localeCompare(b.path));
  }

  /**
   * Get server status
   * @returns {Object} Server status
   */
  getStatus() {
    return {
      isStarted: this.isStarted,
      startTime: this.startTime,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      port: this.getPort(),
      services: this.serviceContainer ? this.serviceContainer.getRegisteredServices() : [],
      routes: this.routeRegistry ? this.routeRegistry.getRoutes().size : 0,
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}

/**
 * Main server initialization
 */
async function main() {
  const logger = new Logger('Main');

  try {
    logger.info('🎯 Phase 8: Server Architecture Refactoring');
    logger.info('📏 Reducing from 2,272 lines to clean architecture');
    logger.info('🔧 Environment:', process.env.NODE_ENV || 'development');

    const server = new Server();
    await server.start();

    // Keep process alive
    process.on('SIGTERM', () => server.shutdown());
    process.on('SIGINT', () => server.shutdown());

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}