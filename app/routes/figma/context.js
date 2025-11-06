/**
 * Figma Context Routes Module
 *
 * Context Layer CRUD operations and search endpoints.
 * Handles context storage, retrieval, and advanced search capabilities.
 */

import { z } from 'zod';
import { BaseFigmaRoute } from './base.js';

// Schema validation for context endpoints
const StoreContextSchema = z.object({
  context: z.object({}),
  nodeId: z.string().optional(),
  metadata: z.object({}).optional().default({})
});

const UpdateContextSchema = z.object({
  context: z.object({}).optional(),
  nodeId: z.string().optional(),
  metadata: z.object({}).optional().default({}),
  merge: z.boolean().default(true)
});

const SearchContextSchema = z.object({
  query: z.string().min(1),
  fileKeys: z.array(z.string()).default([]),
  nodeTypes: z.array(z.string()).default([]),
  limit: z.number().int().min(1).max(100).default(20)
});

export class FigmaContextRoutes extends BaseFigmaRoute {
  constructor(serviceContainer) {
    super('FigmaContext', serviceContainer);
  }

  /**
   * Register context management routes
   * @param {Express.Router} router - Express router instance
   */
  registerRoutes(router) {
    // Context Layer Management Endpoints for UI
    router.get('/api/figma/context/:fileKey', this.handleGetContextData.bind(this));
    router.post('/api/figma/context/:fileKey', this.handleStoreContextData.bind(this));
    router.put('/api/figma/context/:fileKey', this.handleUpdateContextData.bind(this));
    router.delete('/api/figma/context/:fileKey', this.handleDeleteContextData.bind(this));

    // Context Layer Utilities
    router.get('/api/figma/context-summary/:fileKey', this.handleGetContextSummary.bind(this));
    router.post('/api/figma/context-search', this.handleSearchContext.bind(this));

    // 🔄 NEW: Unified Context Endpoint (consolidates Design Health + Advanced Context)
    router.post('/api/figma/unified-context', this.handleGetUnifiedContext.bind(this));

    this.logger.info('✅ Figma context routes registered');
  }

  /**
   * Get context data for a specific file
   * GET /api/figma/context/:fileKey
   */
  async handleGetContextData(req, res) {
    this.logAccess(req, 'getContextData');

    try {
      const { fileKey } = req.params;
      const { nodeId, includeMetadata = true } = req.query;

      const contextManager = this.getContextManager();
      if (!contextManager) {
        return this.sendError(res, 'Context Manager not available', 503);
      }

      const redis = this.getService('redis');
      const cacheKey = `figma-context-${fileKey}${nodeId ? `-${nodeId}` : ''}`;

      let contextData = await redis.get(cacheKey);

      if (!contextData) {
        // Extract fresh context data
        const figmaUrl = `https://www.figma.com/file/${fileKey}`;
        const result = await this._extractFigmaContext(figmaUrl, contextManager);
        contextData = result;

        // Cache for 1 hour
        await redis.set(cacheKey, JSON.stringify(contextData), 3600);
      } else {
        contextData = JSON.parse(contextData);
      }

      const responseData = {
        fileKey,
        nodeId: nodeId || null,
        context: contextData,
        cached: !!contextData.cached,
        timestamp: new Date().toISOString()
      };

      if (includeMetadata) {
        responseData.metadata = {
          extractors: contextData.extractors?.length || 0,
          confidence: contextData.confidence || 0,
          processingTime: contextData.processingTime || 0
        };
      }

      return this.sendSuccess(res, responseData);

    } catch (error) {
      this.handleFigmaError(error, res, 'get context data');
    }
  }

  /**
   * Store new context data for a file
   * POST /api/figma/context/:fileKey
   */
  async handleStoreContextData(req, res) {
    try {
      const validatedBody = StoreContextSchema.parse(req.body);

      this.logAccess(req, 'storeContextData');

      const { fileKey } = req.params;
      const { context, nodeId, metadata } = validatedBody;

      const contextManager = this.getContextManager();
      if (!contextManager) {
        return this.sendError(res, 'Context Manager not available', 503);
      }

      const redis = this.getService('redis');
      const cacheKey = `figma-context-${fileKey}${nodeId ? `-${nodeId}` : ''}`;

      const contextRecord = {
        fileKey,
        nodeId: nodeId || null,
        context,
        metadata: {
          ...metadata,
          stored: new Date().toISOString(),
          source: 'user-provided'
        },
        version: 1
      };

      await redis.set(cacheKey, JSON.stringify(contextRecord), 7200); // 2 hours

      return this.sendSuccess(res, {
        message: 'Context data stored successfully',
        fileKey,
        nodeId: nodeId || null,
        cacheKey,
        ttl: 7200
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.sendError(res, `Validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      this.handleFigmaError(error, res, 'store context data');
    }
  }

  /**
   * Update existing context data
   * PUT /api/figma/context/:fileKey
   */
  async handleUpdateContextData(req, res) {
    try {
      const validatedBody = UpdateContextSchema.parse(req.body);

      this.logAccess(req, 'updateContextData');

      const { fileKey } = req.params;
      const { context, nodeId, metadata, merge } = validatedBody;

      const contextManager = this.getContextManager();
      if (!contextManager) {
        return this.sendError(res, 'Context Manager not available', 503);
      }

      const redis = this.getService('redis');
      const cacheKey = `figma-context-${fileKey}${nodeId ? `-${nodeId}` : ''}`;

      // Get existing context data
      let existingData = await redis.get(cacheKey);
      if (!existingData) {
        return this.sendError(res, 'Context data not found', 404);
      }

      existingData = JSON.parse(existingData);

      // Update context data
      const updatedContext = merge && context ?
        { ...existingData.context, ...context } :
        context || existingData.context;

      const updatedRecord = {
        ...existingData,
        context: updatedContext,
        metadata: {
          ...existingData.metadata,
          ...metadata,
          updated: new Date().toISOString(),
          version: (existingData.version || 1) + 1
        }
      };

      await redis.set(cacheKey, JSON.stringify(updatedRecord), 7200);

      return this.sendSuccess(res, {
        message: 'Context data updated successfully',
        fileKey,
        nodeId: nodeId || null,
        version: updatedRecord.version,
        updated: updatedRecord.metadata.updated
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.sendError(res, `Validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      this.handleFigmaError(error, res, 'update context data');
    }
  }

  /**
   * Delete context data for a file
   * DELETE /api/figma/context/:fileKey
   */
  async handleDeleteContextData(req, res) {
    this.logAccess(req, 'deleteContextData');

    try {
      const { fileKey } = req.params;
      const { nodeId } = req.query;

      const redis = this.getService('redis');
      const cacheKey = `figma-context-${fileKey}${nodeId ? `-${nodeId}` : ''}`;

      const exists = await redis.exists(cacheKey);
      if (!exists) {
        return this.sendError(res, 'Context data not found', 404);
      }

      await redis.del(cacheKey);

      return this.sendSuccess(res, {
        message: 'Context data deleted successfully',
        fileKey,
        nodeId: nodeId || null,
        deleted: new Date().toISOString()
      });

    } catch (error) {
      this.handleFigmaError(error, res, 'delete context data');
    }
  }

  /**
   * Get context summary for a file with batched Redis operations
   * GET /api/figma/context-summary/:fileKey
   */
  async handleGetContextSummary(req, res) {
    this.logAccess(req, 'getContextSummary');

    try {
      const { fileKey } = req.params;
      const redis = this.getService('redis');

      // Get all context keys for this file
      const pattern = `figma-context-${fileKey}*`;
      const keys = await redis.keys(pattern);

      const summary = {
        fileKey,
        totalContexts: keys.length,
        contexts: [],
        generated: new Date().toISOString()
      };

      // Batch fetch context data (optimized)
      const limitedKeys = keys.slice(0, 10); // Limit to first 10
      const contextDataList = await this.batchRedisGet(limitedKeys);

      // Process results
      contextDataList.forEach((parsed, index) => {
        if (parsed) {
          summary.contexts.push({
            nodeId: parsed.nodeId,
            cacheKey: limitedKeys[index],
            version: parsed.version || 1,
            stored: parsed.metadata?.stored,
            updated: parsed.metadata?.updated,
            confidence: parsed.context?.confidence || 0,
            extractors: parsed.context?.extractors?.length || 0
          });
        }
      });

      return this.sendSuccess(res, summary);

    } catch (error) {
      this.handleFigmaError(error, res, 'get context summary');
    }
  }

  /**
   * Search context data across files with batched operations and enhanced relevance
   * POST /api/figma/context-search
   */
  async handleSearchContext(req, res) {
    try {
      const validatedBody = SearchContextSchema.parse(req.body);

      this.logAccess(req, 'searchContext');

      const { query, fileKeys, nodeTypes, limit } = validatedBody;
      const redis = this.getService('redis');
      const results = [];

      // Build search patterns
      const patterns = fileKeys.length > 0
        ? fileKeys.map(key => `figma-context-${key}*`)
        : ['figma-context-*'];

      for (const pattern of patterns) {
        const keys = await redis.keys(pattern);
        const limitedKeys = keys.slice(0, limit);

        // Batch fetch all data at once (optimized)
        const contextDataList = await this.batchRedisGet(limitedKeys);

        // Process search results
        contextDataList.forEach((parsed, index) => {
          if (parsed) {
            // Enhanced relevance calculation
            const relevance = this._calculateEnhancedRelevance(parsed.context, query);

            if (relevance > 0) {
              results.push({
                fileKey: parsed.fileKey,
                nodeId: parsed.nodeId,
                cacheKey: limitedKeys[index],
                relevance,
                preview: this._extractPreview(parsed.context, query),
                metadata: {
                  version: parsed.version,
                  confidence: parsed.context?.confidence || 0,
                  updated: parsed.metadata?.updated || parsed.metadata?.stored
                }
              });
            }
          }
        });
      }

      // Sort by relevance and limit results
      results.sort((a, b) => b.relevance - a.relevance);

      return this.sendSuccess(res, {
        query,
        totalResults: results.length,
        results: results.slice(0, limit),
        searched: new Date().toISOString()
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return this.sendError(res, `Validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      this.handleFigmaError(error, res, 'search context data');
    }
  }

  /**
   * Enhanced relevance calculation with field weighting
   * @private
   */
  _calculateEnhancedRelevance(context, query) {
    const queryLower = query.toLowerCase();
    let totalRelevance = 0;
    let fieldCount = 0;

    // Field weights (higher = more important)
    const fieldWeights = {
      'components.name': 3.0,
      'designTokens': 2.5,
      'components.description': 2.0,
      'styles': 1.5,
      'accessibility': 1.0,
      'metadata': 0.5
    };

    // Search in weighted fields
    for (const [fieldPath, weight] of Object.entries(fieldWeights)) {
      const fieldValue = this._getNestedValue(context, fieldPath);
      if (fieldValue) {
        const fieldText = JSON.stringify(fieldValue).toLowerCase();
        const occurrences = (fieldText.match(new RegExp(queryLower, 'gi')) || []).length;

        if (occurrences > 0) {
          const fieldRelevance = (occurrences / fieldText.length * 1000) * weight;
          totalRelevance += fieldRelevance;
          fieldCount++;
        }
      }
    }

    // Normalize by field count and cap at 1.0
    return fieldCount > 0 ? Math.min(totalRelevance / fieldCount, 1.0) : 0;
  }

  /**
   * Get nested object value by path
   * @private
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object') {
        return current[key];
      }
      return null;
    }, obj);
  }

  /**
   * Extract preview text around search matches
   * @private
   */
  _extractPreview(context, query, maxLength = 200) {
    const contextStr = JSON.stringify(context, null, 2);
    const queryIndex = contextStr.toLowerCase().indexOf(query.toLowerCase());

    if (queryIndex === -1) {return '';}

    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(contextStr.length, queryIndex + maxLength);

    return contextStr.substring(start, end) + (end < contextStr.length ? '...' : '');
  }

  /**
   * Extract context from Figma data using Context Layer
   * @private
   */
  async _extractFigmaContext(figmaUrl, contextManager) {
    try {
      const figmaData = {
        url: figmaUrl,
        nodes: [],
        metadata: {
          extractedAt: new Date().toISOString(),
          source: 'figma-context-routes',
          version: '2.0'
        }
      };

      const contextResult = await contextManager.extractContext(figmaData);

      this.logger.debug('✅ Context extraction successful for context routes');
      return contextResult;

    } catch (error) {
      this.logger.error('Context extraction failed:', error);
      throw error;
    }
  }

  /**
   * 🔄 NEW: Get unified context (consolidates Design Health + Advanced Context)
   * POST /api/figma/unified-context
   *
   * Provides comprehensive context combining all functionality from:
   * - Design Health analysis
   * - Advanced Context Dashboard
   * - LLM preview context
   * - Performance metrics
   */
  async handleGetUnifiedContext(req, res) {
    this.logAccess(req, 'getUnifiedContext');

    try {
      const { fileKey, nodeIds, options = {} } = req.body;

      if (!fileKey) {
        return this.sendError(res, 400, 'FILE_KEY_REQUIRED', 'File key is required for unified context');
      }

      this.logger.info(`🔄 Building unified context for fileKey: ${fileKey}`);

      // Get or create UnifiedContextProvider instance
      const contextManager = this.serviceContainer.get('ContextManager');

      // Import UnifiedContextProvider (dynamic import to avoid circular dependencies)
      const { UnifiedContextProvider } = await import('../../core/context/UnifiedContextProvider.js');
      const unifiedProvider = new UnifiedContextProvider();

      // Build mock Figma data (in real implementation, this would come from Figma API)
      const figmaData = {
        fileKey,
        nodeIds: nodeIds || [],
        selection: [], // Mock selection data
        metadata: {
          requestedAt: new Date().toISOString(),
          source: 'unified-context-api',
          version: '2.0.0'
        }
      };

      // Build comprehensive unified context
      const unifiedContext = await unifiedProvider.buildComprehensiveContext(figmaData, {
        ...options,
        includeHealthMetrics: true,
        includeAdvancedContext: true,
        includePerformanceMetrics: true,
        includeLLMPreview: true
      });

      // Track performance metrics
      const processingTime = Date.now() - Date.now();

      this.logger.info(`✅ Unified context built successfully in ${processingTime}ms`);

      // Return unified context
      this.sendSuccess(res, {
        unifiedContext,
        metadata: {
          fileKey,
          nodeIds,
          processingTime,
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          features: ['healthMetrics', 'advancedContext', 'performanceMetrics', 'llmPreview']
        }
      });

    } catch (error) {
      this.logger.error('❌ Failed to build unified context:', error);
      this.sendError(res, 500, 'UNIFIED_CONTEXT_ERROR', error.message);
    }
  }
}

export default FigmaContextRoutes;