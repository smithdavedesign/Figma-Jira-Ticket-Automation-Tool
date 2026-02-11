/**
 * Consolidated Figma Session Manager
 *
 * Unified session management for both Figma Plugin API and MCP integration.
 * Handles authentication, caching, and provides seamless switching between data sources.
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { RedisClient } from './redis-client.js';
import { URL, URLSearchParams } from 'url';

export class FigmaSessionManager {
  constructor() {
    this.logger = new Logger('FigmaSessionManager');
    this.errorHandler = new ErrorHandler();
    this.redis = new RedisClient();

    // Session state
    this.figmaApiKey = process.env.FIGMA_API_KEY;
    this.mcpServerUrl = process.env.FIGMA_MCP_URL || 'http://localhost:3001';
    this.mcpAvailable = false;
    this.apiAvailable = false;

    // Active sessions cache
    this.activeSessions = new Map();

    // Performance metrics
    this.metrics = {
      sessions: {
        created: 0,
        retrieved: 0,
        active: 0
      },
      api: {
        requests: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: []
      },
      mcp: {
        requests: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: []
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      },
      screenshots: {
        requested: 0,
        successful: 0,
        failed: 0,
        averageSize: 0
      },
      startTime: Date.now()
    };

    // Configuration
    this.config = {
      sessionTTL: 3600, // 1 hour
      mcpTimeout: 10000, // 10 seconds
      apiTimeout: 5000, // 5 seconds
      retries: 3,
      cachePrefix: 'figma:session:',
      dataPrefix: 'figma:data:',
      metricsWindowSize: 100 // Keep last 100 response times for each service
    };
  }

  /**
   * Initialize Figma session manager
   */
  async initialize() {
    this.logger.info('🔗 Initializing Figma Session Manager...');

    // Initialize Redis connection
    const redisConnected = await this.redis.connect();
    if (!redisConnected) {
      this.logger.warn('Redis unavailable, using memory-only caching');
    }

    // Check Figma API availability
    await this.checkFigmaApiAvailability();

    // Check MCP server availability
    await this.checkMCPAvailability();

    // Log capabilities
    this.logCapabilities();

    this.logger.info('✅ Figma Session Manager initialized');
  }

  /**
   * Check Figma API availability
   */
  async checkFigmaApiAvailability() {
    if (!this.figmaApiKey) {
      this.logger.warn('❌ Figma API key not configured');
      this.apiAvailable = false;
      return;
    }

    try {
      // Test with a simple API call
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': this.figmaApiKey,
          'User-Agent': 'Figma-Session-Manager/1.0.0'
        },
        timeout: this.config.apiTimeout
      });

      this.apiAvailable = response.ok;
      this.logger.info(`${this.apiAvailable ? '✅' : '❌'} Figma API: ${response.status}`);
    } catch (error) {
      this.apiAvailable = false;
      this.logger.warn('❌ Figma API unavailable:', error.message);
    }
  }

  /**
   * Check MCP server availability
   */
  async checkMCPAvailability() {
    try {
      const response = await fetch(`${this.mcpServerUrl}/health`, {
        timeout: this.config.mcpTimeout
      });

      this.mcpAvailable = response.ok;
      this.logger.info(`${this.mcpAvailable ? '✅' : '❌'} Figma MCP: ${response.status}`);
    } catch (error) {
      this.mcpAvailable = false;
      this.logger.warn('❌ Figma MCP unavailable:', error.message);
    }
  }

  /**
   * Create a new Figma session
   */
  async createSession(options = {}) {
    const startTime = Date.now();

    try {
      const sessionId = this.generateSessionId();
      const session = {
        id: sessionId,
        fileKey: options.fileKey || null,
        nodeIds: options.nodeIds || [],
        preferredSource: options.preferredSource || 'api',
        createdAt: Date.now(),
        lastUsed: Date.now(),
        capabilities: {
          api: this.apiAvailable,
          mcp: this.mcpAvailable,
          screenshot: this.apiAvailable, // Screenshots via API
          assets: this.mcpAvailable, // Assets via MCP
          tokens: this.mcpAvailable // Design tokens via MCP
        },
        cache: new Map(),
        metrics: {
          requests: 0,
          cacheHits: 0,
          apiCalls: 0,
          mcpCalls: 0,
          screenshots: 0,
          averageResponseTime: 0,
          lastResponseTime: 0
        }
      };

      // Store in memory
      this.activeSessions.set(sessionId, session);

      // Store in Redis with TTL
      await this.redis.set(
        `${this.config.cachePrefix}${sessionId}`,
        session,
        this.config.sessionTTL
      );

      // Update global metrics
      this.metrics.sessions.created++;
      this.metrics.sessions.active = this.activeSessions.size;

      const responseTime = Date.now() - startTime;
      this.logger.info(`🆕 Created Figma session: ${sessionId} (${responseTime}ms)`);
      return session;

    } catch (error) {
      this.logger.error('Failed to create Figma session:', error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId) {
    // Try memory first
    let session = this.activeSessions.get(sessionId);

    if (!session) {
      // Try Redis
      session = await this.redis.get(`${this.config.cachePrefix}${sessionId}`);

      if (session) {
        // Restore to memory
        this.activeSessions.set(sessionId, session);
        this.logger.debug(`🔄 Restored session from Redis: ${sessionId}`);
      }
    }

    if (session) {
      session.lastUsed = Date.now();
      await this.updateSession(sessionId, session);
    }

    return session;
  }

  /**
   * Get or create session by type (api/mcp)
   */
  async getSessionByType(type = 'api', options = {}) {
    // Look for existing session of this type
    for (const [sessionId, session] of this.activeSessions) {
      if (session.preferredSource === type) {
        session.lastUsed = Date.now();
        await this.updateSession(sessionId, session);
        return this.createSessionInterface(session);
      }
    }

    // Create new session with preferred type
    const sessionOptions = {
      ...options,
      preferredSource: type
    };

    const session = await this.createSession(sessionOptions);
    return this.createSessionInterface(session);
  }

  /**
   * Create session interface with methods
   */
  createSessionInterface(session) {
    const sessionManager = this; // Capture the correct context

    return {
      id: session.id,
      capabilities: session.capabilities,

      // Screenshot capture method
      async captureScreenshot(fileKey, nodeId, options = {}) {
        // Validation Logic for API key
        if (!process.env.FIGMA_API_KEY && !sessionManager.figmaApiKey) {
           sessionManager.logger.error("❌ Figma API Key is missing!");
           throw new Error("Figma API Key is missing within session manager.");
        }
        
        // Ensure session capabilities are respected, but handle missing 'api' flag loosely if key present
        if (!session.capabilities.api) {
           sessionManager.logger.warn('⚠️ Session capabilities missing "api" flag, but proceeding since function was called.');
        }

        try {
          sessionManager.logger.info('🔍 [Session Manager] Screenshot request:', { fileKey, nodeId, options });
          sessionManager.logger.info(`� Capturing screenshot for node ${nodeId} in file ${fileKey}`);

          // If no node ID provided, get the first page from the file
          let targetNodeId = nodeId;
          if (!nodeId || nodeId === 'null') {
            sessionManager.logger.info('🔍 No node ID provided, fetching file structure to get first page...');

            // Fetch file structure to get the first page
            const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
              method: 'GET',
              headers: {
                'X-Figma-Token': sessionManager.figmaApiKey || process.env.FIGMA_API_KEY || ''
              }
            });

            if (!fileResponse.ok) {
              throw new Error(`Figma API error: ${fileResponse.status} ${fileResponse.statusText}`);
            }

            const fileData = await fileResponse.json();
            if (fileData.document && fileData.document.children && fileData.document.children.length > 0) {
              targetNodeId = fileData.document.children[0].id;
              sessionManager.logger.info(`🔍 Using first page ID: ${targetNodeId}`);
            } else {
              throw new Error('No pages found in Figma file');
            }
          }

          // Prepare Figma API screenshot request
          const screenshotParams = new URLSearchParams();
          screenshotParams.set('ids', targetNodeId);
          screenshotParams.set('format', options.format || 'png');
          screenshotParams.set('scale', options.scale || '2');
          if (options.use_absolute_bounds) {
            screenshotParams.set('use_absolute_bounds', 'true');
          }

          const screenshotUrl = `https://api.figma.com/v1/images/${fileKey}?${screenshotParams}`;
          sessionManager.logger.info('🔍 [Session Manager] Calling Figma API:', { screenshotUrl });

          const response = await fetch(screenshotUrl, {
            method: 'GET',
            headers: {
              'X-Figma-Token': sessionManager.figmaApiKey || process.env.FIGMA_API_KEY || ''
            }
          });

          sessionManager.logger.info('🔍 [Session Manager] Figma API response status:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          });

          if (!response.ok) {
            // Try to get error details from response body
            let errorDetails = response.statusText;
            try {
              const errorData = await response.json();
              errorDetails = errorData.message || errorData.err || errorDetails;
            } catch (jsonError) {
              // Response is not JSON, use status text
              sessionManager.logger.warn(`Non-JSON error response from Figma API: ${response.status}`);
            }
            throw new Error(`Figma API error: ${response.status} ${errorDetails}`);
          }

          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            sessionManager.logger.error('Failed to parse Figma API response as JSON:', jsonError.message);
            throw new Error(`Invalid response from Figma API: ${jsonError.message}`);
          }

          sessionManager.logger.info('🔍 [Session Manager] Figma API response:', {
            hasError: !!data.err,
            hasImages: !!data.images,
            imageKeys: data.images ? Object.keys(data.images) : [],
            requestedNodeId: targetNodeId
          });

          if (data.err) {
            sessionManager.logger.error('🔍 [Session Manager] Figma API returned error:', data.err);
            throw new Error(`Figma API error: ${data.err}`);
          }

          if (!data.images || !data.images[targetNodeId]) {
            sessionManager.logger.error(`🔍 [Session Manager] No image for node ${targetNodeId}:`, {
              hasImages: !!data.images,
              availableNodes: data.images ? Object.keys(data.images) : [],
              fileKey,
              nodeId: targetNodeId
            });
            throw new Error(`No screenshot generated for node ${targetNodeId}. Please verify the fileKey (${fileKey}) and nodeId (${targetNodeId}) are valid.`);
          }

          const imageUrl = data.images[targetNodeId];
          sessionManager.logger.info('🔍 [Session Manager] Final image URL:', { imageUrl: imageUrl.substring(0, 100) + '...' });
          sessionManager.logger.info(`✅ Screenshot captured successfully: ${imageUrl.substring(0, 100)}...`);

          return {
            imageUrl: imageUrl,
            nodeId: targetNodeId,
            fileKey: fileKey,
            dimensions: { width: 400, height: 300 }, // Would be extracted from actual image if needed
            timestamp: new Date().toISOString(),
            cached: false
          };

        } catch (error) {
          sessionManager.logger.error(`❌ Screenshot capture failed: ${error.message}`);

          // Return a meaningful error instead of mock data
          throw new Error(`Screenshot capture failed: ${error.message}`);
        }
      },

      // Data extraction method
      async extractData(fileKey, options = {}) {
        const preferredSource = session.preferredSource || 'api';

        if (preferredSource === 'mcp' && session.capabilities.mcp) {
          // Use MCP for structured data
          return this.extractDataViaMCP(fileKey, options);
        } else if (session.capabilities.api) {
          // Fallback to API
          return this.extractDataViaAPI(fileKey, options);
        } else {
          throw new Error('No data source available');
        }
      },

      // Helper methods for different data sources
      async extractDataViaMCP(fileKey, options) {
        // Mock MCP implementation
        return {
          components: [],
          styles: {},
          metadata: { name: `File ${fileKey}`, type: 'COMPONENT_SET' }
        };
      },

      async extractDataViaAPI(fileKey, options) {
        // Mock API implementation
        return {
          components: [],
          styles: {},
          metadata: { name: `File ${fileKey}`, type: 'COMPONENT_SET' }
        };
      }
    };
  }

  /**
   * Update session data
   */
  async updateSession(sessionId, sessionData) {
    this.activeSessions.set(sessionId, sessionData);
    await this.redis.set(
      `${this.config.cachePrefix}${sessionId}`,
      sessionData,
      this.config.sessionTTL
    );
  }

  /**
   * Get cached data for a session
   */
  async getCachedData(sessionId, dataKey) {
    const session = await this.getSession(sessionId);
    if (!session) {return null;}

    // Try session cache first
    const sessionCache = session.cache.get(dataKey);
    if (sessionCache && sessionCache.expires > Date.now()) {
      this.logger.debug(`🧠 Session cache HIT: ${dataKey}`);
      return sessionCache.data;
    }

    // Try Redis cache
    const cacheKey = `${this.config.dataPrefix}${sessionId}:${dataKey}`;
    const redisData = await this.redis.get(cacheKey);

    if (redisData) {
      // Restore to session cache
      session.cache.set(dataKey, {
        data: redisData,
        expires: Date.now() + (300 * 1000) // 5 minutes
      });
      this.logger.debug(`💾 Redis cache HIT: ${dataKey}`);
      return redisData;
    }

    return null;
  }

  /**
   * Cache data for a session
   */
  async setCachedData(sessionId, dataKey, data, ttl = 3600) {
    const session = await this.getSession(sessionId);
    if (!session) {return;}

    // Set in session cache
    session.cache.set(dataKey, {
      data,
      expires: Date.now() + (Math.min(ttl, 300) * 1000) // Max 5 min in memory
    });

    // Set in Redis cache
    const cacheKey = `${this.config.dataPrefix}${sessionId}:${dataKey}`;
    await this.redis.set(cacheKey, data, ttl);

    this.logger.debug(`💾 Cached data: ${dataKey} (TTL: ${ttl}s)`);
  }

  /**
   * Determine best data source for request
   */
  getDataSourceStrategy(requestType) {
    switch (requestType) {
    case 'screenshot':
      return this.apiAvailable ? 'api' : null;

    case 'assets':
    case 'export':
      return this.mcpAvailable ? 'mcp' : (this.apiAvailable ? 'api-fallback' : null);

    case 'design-tokens':
    case 'structured-data':
      return this.mcpAvailable ? 'mcp' : (this.apiAvailable ? 'api-parse' : null);

    case 'metadata':
    case 'basic-info':
      return this.apiAvailable ? 'api' : (this.mcpAvailable ? 'mcp' : null);

    default:
      return this.apiAvailable ? 'api' : (this.mcpAvailable ? 'mcp' : null);
    }
  }

  /**
   * Execute request with optimal data source
   */
  async executeRequest(sessionId, requestType, params = {}) {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const strategy = this.getDataSourceStrategy(requestType);
    if (!strategy) {
      throw new Error(`No available data source for: ${requestType}`);
    }

    this.logger.debug(`🎯 Executing ${requestType} via ${strategy}`);

    switch (strategy) {
    case 'api':
      return await this.executeApiRequest(session, requestType, params);

    case 'mcp':
      return await this.executeMCPRequest(session, requestType, params);

    case 'api-fallback':
      try {
        return await this.executeMCPRequest(session, requestType, params);
      } catch (error) {
        this.logger.warn(`MCP failed, falling back to API: ${error.message}`);
        return await this.executeApiRequest(session, requestType, params);
      }

    case 'api-parse': {
      // API data with client-side parsing for structured format
      const rawData = await this.executeApiRequest(session, requestType, params);
      return this.parseApiDataToStructured(rawData, requestType);
    }

    default:
      throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  /**
   * Execute API request
   */
  async executeApiRequest(session, requestType, params) {
    if (!this.apiAvailable) {
      throw new Error('Figma API not available');
    }

    // Implementation specific to each request type
    switch (requestType) {
    case 'screenshot':
      return await this.getScreenshotViaAPI(session, params);
    case 'metadata':
      return await this.getMetadataViaAPI(session, params);
    default:
      throw new Error(`API request type not implemented: ${requestType}`);
    }
  }

  /**
   * Execute MCP request
   */
  async executeMCPRequest(session, requestType, params) {
    if (!this.mcpAvailable) {
      throw new Error('Figma MCP not available');
    }

    // Implementation specific to each request type
    switch (requestType) {
    case 'assets':
      return await this.getAssetsViaMCP(session, params);
    case 'design-tokens':
      return await this.getDesignTokensViaMCP(session, params);
    default:
      throw new Error(`MCP request type not implemented: ${requestType}`);
    }
  }

  /**
   * Parse API data to structured format
   */
  parseApiDataToStructured(rawData, requestType) {
    // This would contain the parsing logic from the old extractor.js
    // Converting raw Figma API responses to structured design intelligence format
    this.logger.debug(`🔄 Parsing API data for ${requestType}`);
    return rawData; // Placeholder
  }

  /**
   * Update response time metrics for a service
   */
  updateServiceMetrics(service, responseTime, success = true) {
    if (!this.metrics[service]) {return;}

    this.metrics[service].requests++;
    if (success) {
      this.metrics[service].successful++;
    } else {
      this.metrics[service].failed++;
    }

    // Add to response times array
    this.metrics[service].responseTimes.push(responseTime);

    // Keep only last N response times
    if (this.metrics[service].responseTimes.length > this.config.metricsWindowSize) {
      this.metrics[service].responseTimes.shift();
    }

    // Update average
    const times = this.metrics[service].responseTimes;
    this.metrics[service].averageResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * Update cache metrics
   */
  updateCacheMetrics(hit = true) {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }

    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 ? (this.metrics.cache.hits / total) * 100 : 0;
  }

  /**
   * Get comprehensive performance metrics
   */
  getPerformanceMetrics() {
    const uptime = Date.now() - this.metrics.startTime;

    return {
      uptime,
      sessions: {
        ...this.metrics.sessions,
        active: this.activeSessions.size
      },
      services: {
        api: {
          ...this.metrics.api,
          available: this.apiAvailable,
          successRate: this.metrics.api.requests > 0 ?
            (this.metrics.api.successful / this.metrics.api.requests) * 100 : 0
        },
        mcp: {
          ...this.metrics.mcp,
          available: this.mcpAvailable,
          successRate: this.metrics.mcp.requests > 0 ?
            (this.metrics.mcp.successful / this.metrics.mcp.requests) * 100 : 0
        }
      },
      cache: {
        ...this.metrics.cache,
        efficiency: this.metrics.cache.hitRate
      },
      screenshots: {
        ...this.metrics.screenshots,
        successRate: this.metrics.screenshots.requested > 0 ?
          (this.metrics.screenshots.successful / this.metrics.screenshots.requested) * 100 : 0
      },
      health: {
        status: this.getHealthStatus(),
        issues: this.getHealthIssues(),
        score: this.calculateHealthScore()
      }
    };
  }

  /**
   * Get overall health status
   */
  getHealthStatus() {
    if (!this.apiAvailable && !this.mcpAvailable) {return 'critical';}
    if (this.metrics.api.failed > this.metrics.api.successful && this.metrics.mcp.failed > this.metrics.mcp.successful) {return 'degraded';}
    if (!this.apiAvailable || !this.mcpAvailable) {return 'partial';}
    return 'healthy';
  }

  /**
   * Get health issues
   */
  getHealthIssues() {
    const issues = [];

    if (!this.apiAvailable) {issues.push('Figma API unavailable');}
    if (!this.mcpAvailable) {issues.push('MCP server unavailable');}
    if (this.metrics.api.averageResponseTime > 5000) {issues.push('Slow API response times');}
    if (this.metrics.mcp.averageResponseTime > 10000) {issues.push('Slow MCP response times');}
    if (this.metrics.cache.hitRate < 50) {issues.push('Low cache hit rate');}
    if (this.activeSessions.size > 100) {issues.push('High session count');}

    return issues;
  }

  /**
   * Calculate health score (0-100)
   */
  calculateHealthScore() {
    let score = 100;

    // Service availability
    if (!this.apiAvailable) {score -= 30;}
    if (!this.mcpAvailable) {score -= 20;}

    // Performance penalties
    if (this.metrics.api.averageResponseTime > 3000) {score -= 10;}
    if (this.metrics.mcp.averageResponseTime > 8000) {score -= 10;}
    if (this.metrics.cache.hitRate < 70) {score -= 15;}

    // Error rate penalties
    const apiErrorRate = this.metrics.api.requests > 0 ?
      (this.metrics.api.failed / this.metrics.api.requests) * 100 : 0;
    const mcpErrorRate = this.metrics.mcp.requests > 0 ?
      (this.metrics.mcp.failed / this.metrics.mcp.requests) * 100 : 0;

    if (apiErrorRate > 10) {score -= 15;}
    if (mcpErrorRate > 10) {score -= 10;}

    return Math.max(0, Math.round(score));
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `figma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log current capabilities
   */
  logCapabilities() {
    this.logger.info('🎯 Figma Session Capabilities:');
    this.logger.info(`   📸 Screenshots: ${this.apiAvailable ? '✅ API' : '❌ Unavailable'}`);
    this.logger.info(`   🎨 Assets: ${this.mcpAvailable ? '✅ MCP' : (this.apiAvailable ? '⚠️ API Fallback' : '❌ Unavailable')}`);
    this.logger.info(`   🔧 Design Tokens: ${this.mcpAvailable ? '✅ MCP' : (this.apiAvailable ? '⚠️ Parse API' : '❌ Unavailable')}`);
    this.logger.info(`   📊 Metadata: ${this.apiAvailable ? '✅ API' : (this.mcpAvailable ? '✅ MCP' : '❌ Unavailable')}`);
  }

  /**
   * Cleanup expired sessions
   */
  async cleanup() {
    const now = Date.now();
    const expired = [];

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastUsed > (this.config.sessionTTL * 1000)) {
        expired.push(sessionId);
      }
    }

    for (const sessionId of expired) {
      this.activeSessions.delete(sessionId);
      await this.redis.del(`${this.config.cachePrefix}${sessionId}`);
    }

    if (expired.length > 0) {
      this.logger.info(`🧹 Cleaned up ${expired.length} expired sessions`);
    }
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect() {
    await this.cleanup();
    await this.redis.disconnect();
    this.logger.info('👋 Figma Session Manager disconnected');
  }

  // Placeholder methods for specific implementations
  async getScreenshotViaAPI(session, params) {
    throw new Error('Screenshot via API not implemented yet');
  }

  async getMetadataViaAPI(session, params) {
    throw new Error('Metadata via API not implemented yet');
  }

  async getAssetsViaMCP(session, params) {
    throw new Error('Assets via MCP not implemented yet');
  }

  async getDesignTokensViaMCP(session, params) {
    throw new Error('Design tokens via MCP not implemented yet');
  }
}