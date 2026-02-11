/* eslint-disable no-undef, no-unused-vars */
/**
 * Enhanced Figma Data Extractor
 *
 * Uses the consolidated Figma Session Manager for hybrid API/MCP data extraction.
 * Provides intelligent data source selection and comprehensive caching.
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { FigmaSessionManager } from './figma-session-manager.js';

export class EnhancedFigmaExtractor {
  constructor(options = {}) {
    this.logger = new Logger('EnhancedFigmaExtractor');
    this.errorHandler = new ErrorHandler();
    this.sessionManager = options.sessionManager || new FigmaSessionManager();

    this.config = {
      cacheExtractedData: true,
      cacheTTL: 3600, // 1 hour
      enablePerformanceMetrics: true,
      maxRetries: 3,
      timeoutMs: 30000,
      ...options
    };

    this.performanceMetrics = new Map();
  }

  /**
   * Initialize the extractor
   */
  async initialize() {
    await this.sessionManager.initialize();
    this.logger.info('✅ Enhanced Figma Extractor initialized');
  }

  /**
   * Extract comprehensive data from Figma
   */
  async extract(params) {
    const { fileKey, nodeIds = [], sessionId = null, options = {} } = params;
    const startTime = Date.now();

    if (!fileKey) {
      throw new Error('fileKey is required for extraction');
    }

    this.logger.info(`🔍 Starting extraction: ${fileKey} (${nodeIds.length} nodes)`);

    try {
      // Create or get session
      const session = sessionId
        ? await this.sessionManager.getSession(sessionId)
        : await this.sessionManager.createSession({ fileKey, nodeIds });

      if (!session) {
        throw new Error('Failed to create or retrieve Figma session');
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(fileKey, nodeIds, options);
      if (this.config.cacheExtractedData) {
        const cachedData = await this.sessionManager.getCachedData(session.id, cacheKey);
        if (cachedData) {
          this.logger.info(`⚡ Cache hit for extraction: ${cacheKey}`);
          return this.enhanceWithMetrics(cachedData, startTime, true);
        }
      }

      // Execute extraction with intelligent data source selection
      const extractionResult = await this.performExtraction(session, {
        fileKey,
        nodeIds,
        ...options
      });

      // Cache the result
      if (this.config.cacheExtractedData) {
        await this.sessionManager.setCachedData(
          session.id,
          cacheKey,
          extractionResult,
          this.config.cacheTTL
        );
      }

      const result = this.enhanceWithMetrics(extractionResult, startTime, false);
      this.logger.info(`✅ Extraction completed in ${result.performance.totalTime}ms`);

      return result;

    } catch (error) {
      this.logger.error('❌ Extraction failed:', error);
      throw this.errorHandler.createError('EXTRACTION_FAILED', error.message, { fileKey, nodeIds });
    }
  }

  /**
   * Perform the actual extraction using optimal data sources
   */
  async performExtraction(session, params) {
    const { fileKey, nodeIds, extractAssets = true, extractTokens = true, extractMetadata = true } = params;

    const result = {
      fileKey,
      nodeIds,
      extractedAt: new Date().toISOString(),
      metadata: {},
      designTokens: {},
      assets: [],
      screenshots: [],
      codeHints: [],
      validation: { valid: true, errors: [], warnings: [] }
    };

    // Extract metadata (API preferred for speed)
    if (extractMetadata) {
      this.logger.debug('📊 Extracting metadata...');
      try {
        result.metadata = await this.sessionManager.executeRequest(
          session.id,
          'metadata',
          { fileKey, nodeIds }
        );
      } catch (error) {
        this.logger.warn('Metadata extraction failed:', error.message);
        result.validation.warnings.push(`Metadata extraction failed: ${error.message}`);
      }
    }

    // Extract design tokens (MCP preferred for structured data)
    if (extractTokens) {
      this.logger.debug('🎨 Extracting design tokens...');
      try {
        result.designTokens = await this.sessionManager.executeRequest(
          session.id,
          'design-tokens',
          { fileKey, nodeIds }
        );
      } catch (error) {
        this.logger.warn('Design token extraction failed:', error.message);
        result.validation.warnings.push(`Design token extraction failed: ${error.message}`);
        result.designTokens = this.extractTokensFallback(result.metadata);
      }
    }

    // Extract assets (MCP preferred for export capabilities)
    if (extractAssets && nodeIds.length > 0) {
      this.logger.debug('🖼️ Extracting assets...');
      try {
        result.assets = await this.sessionManager.executeRequest(
          session.id,
          'assets',
          { fileKey, nodeIds, formats: ['png', 'svg'] }
        );
      } catch (error) {
        this.logger.warn('Asset extraction failed:', error.message);
        result.validation.warnings.push(`Asset extraction failed: ${error.message}`);
      }
    }

    // Extract screenshots (API only)
    if (nodeIds.length > 0) {
      this.logger.debug('📸 Extracting screenshots...');
      try {
        result.screenshots = await this.sessionManager.executeRequest(
          session.id,
          'screenshot',
          { fileKey, nodeIds, scale: 2, format: 'png' }
        );
      } catch (error) {
        this.logger.warn('Screenshot extraction failed:', error.message);
        result.validation.warnings.push(`Screenshot extraction failed: ${error.message}`);
      }
    }

    // Generate code hints
    result.codeHints = this.generateCodeHints(result);

    // Validate final result
    this.validateExtractionResult(result);

    return result;
  }

  /**
   * Extract design tokens from metadata as fallback
   */
  extractTokensFallback(metadata) {
    const tokens = {
      colors: {},
      typography: {},
      spacing: {},
      shadows: {},
      borders: {}
    };

    if (!metadata || !metadata.styles) {
      return tokens;
    }

    // Basic token extraction from styles
    // This would be expanded with more sophisticated parsing
    this.logger.debug('🔄 Extracting tokens from metadata fallback');

    return tokens;
  }

  /**
   * Generate code hints based on extracted data
   */
  generateCodeHints(extractionResult) {
    const hints = [];

    // Component structure hints
    if (extractionResult.metadata?.components) {
      hints.push({
        type: 'component-structure',
        message: `Found ${extractionResult.metadata.components.length} reusable components`,
        confidence: 0.9
      });
    }

    // Design token hints
    if (extractionResult.designTokens?.colors && Object.keys(extractionResult.designTokens.colors).length > 0) {
      hints.push({
        type: 'design-tokens',
        message: `${Object.keys(extractionResult.designTokens.colors).length} color tokens available`,
        confidence: 0.8
      });
    }

    // Asset hints
    if (extractionResult.assets?.length > 0) {
      hints.push({
        type: 'assets',
        message: `${extractionResult.assets.length} assets ready for export`,
        confidence: 1.0
      });
    }

    return hints;
  }

  /**
   * Validate extraction result
   */
  validateExtractionResult(result) {
    // Check for required data
    if (!result.metadata || Object.keys(result.metadata).length === 0) {
      result.validation.warnings.push('No metadata extracted');
    }

    if (!result.designTokens || Object.keys(result.designTokens).length === 0) {
      result.validation.warnings.push('No design tokens extracted');
    }

    // Check data completeness
    if (result.validation.warnings.length === 0) {
      result.validation.valid = true;
    } else if (result.validation.warnings.length > 3) {
      result.validation.valid = false;
      result.validation.errors.push('Too many extraction warnings - data may be incomplete');
    }
  }

  /**
   * Generate cache key for extraction results
   */
  generateCacheKey(fileKey, nodeIds, options) {
    const sortedNodeIds = [...nodeIds].sort();
    const optionsHash = JSON.stringify(options);
    // Use Buffer.from for Node.js compatibility instead of btoa
    return `extract:${fileKey}:${sortedNodeIds.join(',')}:${Buffer.from(optionsHash).toString('base64').slice(0, 8)}`;
  }

  /**
   * Enhance result with performance metrics
   */
  enhanceWithMetrics(result, startTime, fromCache) {
    const totalTime = Date.now() - startTime;

    result.performance = {
      totalTime,
      fromCache,
      timestamp: new Date().toISOString(),
      dataSize: JSON.stringify(result).length,
      cacheEfficiency: fromCache ? 1.0 : 0.0
    };

    // Track metrics
    if (this.config.enablePerformanceMetrics) {
      this.performanceMetrics.set(Date.now(), {
        totalTime,
        fromCache,
        dataSize: result.performance.dataSize,
        nodeCount: result.nodeIds?.length || 0
      });

      // Keep only last 100 metrics
      if (this.performanceMetrics.size > 100) {
        const oldest = Math.min(...this.performanceMetrics.keys());
        this.performanceMetrics.delete(oldest);
      }
    }

    return result;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    if (this.performanceMetrics.size === 0) {
      return null;
    }

    const metrics = Array.from(this.performanceMetrics.values());
    const totalRequests = metrics.length;
    const cacheHits = metrics.filter(m => m.fromCache).length;
    const avgTime = metrics.reduce((sum, m) => sum + m.totalTime, 0) / totalRequests;
    const avgDataSize = metrics.reduce((sum, m) => sum + m.dataSize, 0) / totalRequests;

    return {
      totalRequests,
      cacheHits,
      cacheHitRate: cacheHits / totalRequests,
      averageTime: Math.round(avgTime),
      averageDataSize: Math.round(avgDataSize),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Capture screenshot using the consolidated session manager
   */
  async captureScreenshot(fileKey, nodeId, options = {}) {
    const startTime = Date.now();
    this.logger.info('🔍 [Enhanced Extractor] Screenshot request:', { fileKey, nodeId, options });

    try {
      // Use API source for screenshots (faster and more reliable)
      this.logger.info('🔍 [Enhanced Extractor] Getting session by type \'api\'');
      const session = await this.sessionManager.getSessionByType('api', { fileKey });

      this.logger.info('🔍 [Enhanced Extractor] Session obtained:', {
        hasSession: !!session,
        sessionType: typeof session,
        sessionKeys: session ? Object.keys(session) : [],
        hasCaptureScreenshot: session && typeof session.captureScreenshot === 'function'
      });

      this.logger.info('🔍 [Enhanced Extractor] Session obtained, calling captureScreenshot');
      const screenshotResult = await session.captureScreenshot(fileKey, nodeId, {
        scale: options.scale || 2,
        format: options.format || 'png',
        ...options
      });

      this.logger.info('🔍 [Enhanced Extractor] Screenshot result received:', {
        imageUrl: screenshotResult.imageUrl?.substring(0, 100) + '...',
        hasImageUrl: !!screenshotResult.imageUrl,
        nodeId: screenshotResult.nodeId,
        dimensions: screenshotResult.dimensions
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        imageUrl: screenshotResult.imageUrl,
        dimensions: screenshotResult.dimensions,
        performance: { duration, source: 'api' },
        cached: false // Screenshots are typically not cached
      };

    } catch (error) {
      this.logger.error('Screenshot capture failed:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack,
        errorType: typeof error,
        errorKeys: Object.keys(error || {}),
        errorString: String(error)
      });

      // Handle different error types properly
      const errorMessage = error.message || error.error || String(error) || 'Unknown error occurred';
      const errorStatus = error.status || error.statusCode || 500;

      return {
        success: false,
        imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        error: errorMessage,
        status: errorStatus,
        message: `Failed to capture screenshot: ${errorMessage}`
      };
    }
  }

  /**
   * Extract comprehensive project data
   */
  async extractProjectData(fileKey, options = {}) {
    try {
      // Use extract method with project-specific options
      const result = await this.extract({
        fileKey,
        options: {
          includeComponents: options.includeComponents !== false,
          includeStyles: options.includeStyles !== false,
          includeAssets: options.includeAssets !== false,
          depth: options.depth || 'full',
          ...options
        }
      });

      return {
        success: true,
        data: result.data,
        source: result.source,
        performance: result.performance,
        cached: result.cached
      };

    } catch (error) {
      this.logger.error('Project data extraction failed:', error);

      return {
        success: false,
        error: error.message,
        message: `Failed to extract project data: ${error.message}`
      };
    }
  }

  /**
   * Extract component-specific context and metadata
   */
  async extractComponentContext(fileKey, componentName, options = {}) {
    try {
      // First get general project data
      const projectResult = await this.extractProjectData(fileKey, {
        includeComponents: true,
        includeStyles: true,
        depth: 'component'
      });

      if (!projectResult.success) {
        return projectResult;
      }

      const { components = [], styles = {} } = projectResult.data;

      // Find specific component
      const component = components.find(c =>
        c.name === componentName ||
        c.name.toLowerCase().includes(componentName.toLowerCase())
      );

      if (!component) {
        return {
          success: false,
          error: 'Component not found',
          message: `Component "${componentName}" not found in file`
        };
      }

      // Extract component context
      const context = {
        metadata: {
          type: component.type || 'COMPONENT',
          lastModified: component.lastModified || new Date().toISOString(),
          id: component.id
        },
        properties: component.componentPropertyDefinitions || [],
        variants: component.variants || [],
        specifications: this.extractDesignSpecifications(component, styles),
        description: component.description || `Component: ${componentName}`
      };

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: context,
        source: projectResult.source,
        performance: { duration, source: projectResult.source },
        cached: projectResult.cached
      };

    } catch (error) {
      this.logger.error('Component context extraction failed:', error);

      return {
        success: false,
        error: error.message,
        message: `Failed to extract component context: ${error.message}`
      };
    }
  }

  /**
   * Extract design specifications from component and styles
   */
  extractDesignSpecifications(component, styles) {
    const specifications = {
      colors: [],
      typography: [],
      spacing: [],
      effects: []
    };

    // Extract colors from styles
    if (styles.fills) {
      specifications.colors = styles.fills.map(fill => ({
        name: fill.name,
        value: fill.color || fill.value,
        type: fill.type || 'color'
      }));
    }

    // Extract typography
    if (styles.text) {
      specifications.typography = styles.text.map(text => ({
        name: text.name,
        fontSize: text.fontSize,
        fontFamily: text.fontFamily,
        lineHeight: text.lineHeight
      }));
    }

    // Extract effects
    if (component.effects) {
      specifications.effects = component.effects.map(effect => ({
        type: effect.type,
        visible: effect.visible,
        radius: effect.radius
      }));
    }

    return specifications;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    await this.sessionManager.disconnect();
    this.performanceMetrics.clear();
    this.logger.info('🧹 Enhanced Figma Extractor cleaned up');
  }
}