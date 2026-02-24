#!/usr/bin/env node

/**
 * Figma AI Ticket Generator — Server
 *
 * Streamlined Express server with explicit service/route registration.
 * Services: GeminiService → TicketGenerationService → WorkItemOrchestrator
 */

import './env-setup.js';
import express from 'express';
import helmet from 'helmet';
import { Logger } from '../core/utils/logger.js';

// Services
import { ServiceContainer } from './controllers/ServiceContainer.js';
import { GeminiService } from '../core/ai/GeminiService.js';
import { MCPAdapter } from '../core/adapters/MCPAdapter.js';
import { WorkItemOrchestrator } from '../core/orchestration/WorkItemOrchestrator.js';
import { TicketGenerationService } from './services/TicketGenerationService.js';
import { ScreenshotService } from './services/ScreenshotService.js';
import { ConfigurationService } from './services/ConfigurationService.js';
import { ContextManager } from '../core/context/ContextManager.js';
import { RedisClient } from '../core/data/redis-client.js';
import { SessionManager } from '../core/data/session-manager.js';
import { FigmaSessionManager } from '../core/data/figma-session-manager.js';

// Routes
import { GenerateRoutes } from './routes/generate.js';
import { HealthRoutes } from './routes/health.js';
import { FigmaRoutes } from './routes/figma/figma.js';

export class Server {
  constructor() {
    this.logger = new Logger('Server');
    this.app = express();
    this.serviceContainer = new ServiceContainer();
    this.server = null;
    this.isStarted = false;
  }

  async start() {
    try {
      this.logger.info('Starting Figma AI Ticket Generator');
      const t0 = Date.now();

      await this.initializeServices();
      this.setupMiddleware();
      await this.registerRoutes();
      this.setupErrorHandling();
      await this.startHttpServer();
      this.setupGracefulShutdown();

      this.isStarted = true;
      this.logger.info(`Server started in ${Date.now() - t0}ms — http://localhost:${this.getPort()}`);
    } catch (error) {
      this.logger.error('Server startup failed:', error);
      await this.shutdown();
      throw error;
    }
  }

  // ---- Service Registration -----------------------------------------------

  async initializeServices() {
    this.logger.info('Registering services...');
    const sc = this.serviceContainer;

    // Core data layer
    sc.register('redis', () => new RedisClient(), true, []);
    sc.register('sessionManager', () => new SessionManager(), true, []);
    sc.register('figmaSessionManager', () => new FigmaSessionManager(), true, []);

    // Configuration
    sc.register('configurationService', (_c, redis) => new ConfigurationService(redis), true, ['redis']);

    // Template manager
    const { TemplateManager } = await import('../core/data/template-manager.js');
    sc.register('templateManager', (_c, redis, cfg) => new TemplateManager({ redis, configService: cfg }), true, ['redis', 'configurationService']);

    // AI — GeminiService (primary generation engine)
    sc.register('geminiService', (_c, _r, cfg) => {
      const apiKey = cfg?.get('ai.gemini.apiKey') || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY not found');
      return new GeminiService({ apiKey, configService: cfg });
    }, true, ['redis', 'configurationService']);

    // Screenshot
    sc.register('screenshotService', (_c, redis, cfg, figma) => new ScreenshotService(redis, cfg, figma), true, ['redis', 'configurationService', 'figmaSessionManager']);

    // Context
    sc.register('contextManager', () => new ContextManager(), true, []);

    // MCP Adapter (Jira / Confluence / Git)
    sc.register('mcpAdapter', () => new MCPAdapter({
      mcpServerUrl: process.env.MCP_SERVER_URL || 'http://localhost:3000',
      enableMultiAgent: true,
    }), true, []);

    // Ticket generation (delegates to GeminiService)
    sc.register('ticketGenerationService', (_c, gemini) => new TicketGenerationService(gemini), true, ['geminiService']);
    sc.register('ticketService', (c) => c.get('ticketGenerationService'), true, ['ticketGenerationService']);

    // WorkItem orchestrator (Jira + Wiki + Git via MCP)
    sc.register('workItemOrchestrator', (c) => new WorkItemOrchestrator(c), true, ['mcpAdapter', 'ticketGenerationService', 'screenshotService']);

    // Instantiate + initialize all registered services
    for (const name of sc.getRegisteredServices()) {
      sc.get(name);
    }
    await sc.initializeServices();

    this.logger.info(`Services initialized: ${sc.getRegisteredServices().length}`);
  }

  // ---- Middleware ----------------------------------------------------------

  setupMiddleware() {
    this.app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

    // CORS for Figma plugin (file:// protocol)
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'false');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
      next();
    });

    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Static files
    this.app.use('/docs', express.static('docs'));
    this.app.use('/ui', express.static('ui'));

    // Request logger
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => this.logger.info(`${req.method} ${req.path} ${res.statusCode} (${Date.now() - start}ms)`));
      next();
    });

    // Inline health check (no route class needed)
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        services: this.serviceContainer.getRegisteredServices(),
        timestamp: new Date().toISOString(),
      });
    });

    this.logger.info('Middleware configured');
  }

  // ---- Route Registration (explicit, no filesystem scanning) ---------------

  async registerRoutes() {
    this.logger.info('Registering routes...');
    const router = express.Router();
    const sc = this.serviceContainer;

    // Core generation endpoint
    const generateRoutes = new GenerateRoutes(sc);
    if (generateRoutes.initialize) await generateRoutes.initialize();
    generateRoutes.registerRoutes(router);

    // Health endpoints
    const healthRoutes = new HealthRoutes(sc);
    healthRoutes.registerRoutes(router);

    // Figma API endpoints (screenshot, etc.)
    const figmaRoutes = new FigmaRoutes(sc);
    figmaRoutes.registerRoutes(router);

    this.app.use(router);
    this.logger.info('Routes registered');
  }

  // ---- Error Handling ------------------------------------------------------

  setupErrorHandling() {
    this.app.use((req, res) => {
      res.status(404).json({ error: 'Not Found', path: req.originalUrl });
    });

    this.app.use((error, _req, res, _next) => {
      this.logger.error('Unhandled error:', error);
      res.status(error.statusCode || 500).json({
        error: error.name || 'Internal Server Error',
        message: error.message,
      });
    });
  }

  // ---- HTTP Server ---------------------------------------------------------

  startHttpServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.getPort(), () => {
        this.logger.info(`HTTP listening on port ${this.getPort()}`);
        resolve();
      });
      this.server.on('error', reject);
    });
  }

  // ---- Graceful Shutdown ---------------------------------------------------

  setupGracefulShutdown() {
    const handler = async () => {
      this.logger.info('Shutting down...');
      await this.shutdown();
      process.exit(0);
    };
    process.on('SIGTERM', handler);
    process.on('SIGINT', handler);
    process.on('uncaughtException', async (err) => { this.logger.error('Uncaught:', err); await this.shutdown(); process.exit(1); });
    process.on('unhandledRejection', async (reason) => { this.logger.error('Unhandled rejection:', reason); await this.shutdown(); process.exit(1); });
  }

  async shutdown() {
    if (!this.isStarted) return;
    if (this.server) await new Promise(r => this.server.close(r));
    if (this.serviceContainer) await this.serviceContainer.shutdown();
    this.isStarted = false;
    this.logger.info('Shutdown complete');
  }

  getPort() {
    return process.env.PORT || 3000;
  }
}

// ---- Entry point -----------------------------------------------------------

async function main() {
  const logger = new Logger('Main');
  try {
    const server = new Server();
    await server.start();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
