/**
 * ContextManager - Context Understanding Layer
 *
 * Orchestrates all context extraction from raw Figma data into structured design ontology.
 * Serves as the primary interface between Figma API data and AI/template consumption.
 *
 * Architecture:
 * - Coordinates multiple specialized extractors
 * - Transforms raw Figma node data into semantic design understanding
 * - Provides unified context object for AI orchestration and template generation
 * - Caches extracted context for performance optimization
 *
 * Integration Points:
 * - Input: Raw Figma API responses (from figma-api.js)
 * - Output: Structured design context for AI orchestrator and TemplateManager
 * - Caching: Redis integration for context persistence
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { RedisClient } from '../data/redis-client.js';
import { NodeParser } from './NodeParser.js';
import { StyleExtractor } from './StyleExtractor.js';
import { ComponentMapper } from './ComponentMapper.js';
import { LayoutAnalyzer } from './LayoutAnalyzer.js';
import { PrototypeMapper } from './PrototypeMapper.js';

export class ContextManager {
  constructor(options = {}) {
    this.logger = new Logger('ContextManager');
    this.errorHandler = new ErrorHandler();
    this.redis = new RedisClient();

    // Initialize specialized extractors
    this.nodeParser = new NodeParser();
    this.styleExtractor = new StyleExtractor();
    this.componentMapper = new ComponentMapper();
    this.layoutAnalyzer = new LayoutAnalyzer();
    this.prototypeMapper = new PrototypeMapper();

    this.config = {
      enableCaching: true,
      cacheTTL: 3600, // 1 hour
      enablePerformanceMetrics: true,
      maxConcurrentExtractions: 5,
      ...options
    };

    this.extractionMetrics = new Map();
    this.contextCache = new Map();
  }

  /**
   * Initialize the context manager and all extractors
   */
  async initialize() {
    try {
      await this.redis.connect();

      // Initialize all extractors
      await Promise.all([
        this.nodeParser.initialize(),
        this.styleExtractor.initialize(),
        this.componentMapper.initialize(),
        this.layoutAnalyzer.initialize(),
        this.prototypeMapper.initialize()
      ]);

      this.logger.info('✅ ContextManager initialized with all extractors');
    } catch (error) {
      this.logger.error('Failed to initialize ContextManager:', error);
      throw error;
    }
  }

  /**
   * Extract comprehensive context from Figma file data
   * @param {Object} figmaData - Raw Figma API response
   * @param {Object} options - Extraction options
   * @returns {Object} Structured design context
   */
  async extractContext(figmaData, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(figmaData, options);

    try {
      // Check cache first
      if (this.config.enableCaching) {
        const cachedContext = await this.getCachedContext(cacheKey);
        if (cachedContext) {
          this.logger.info(`📋 Using cached context: ${cacheKey}`);
          return this.addPerformanceMetrics(cachedContext, startTime, true);
        }
      }

      this.logger.info('🔍 Extracting context from Figma data', {
        fileId: figmaData.document?.id || 'unknown',
        nodeCount: this.countNodes(figmaData.document),
        options
      });

      // Parallel extraction with all specialized extractors
      const [
        parsedNodes,
        extractedStyles,
        componentMapping,
        layoutAnalysis,
        prototypeConnections
      ] = await Promise.all([
        this.nodeParser.parseNodes(figmaData.document, options),
        this.styleExtractor.extractStyles(figmaData, options),
        this.componentMapper.mapComponents(figmaData.document, options),
        this.layoutAnalyzer.analyzeLayout(figmaData.document, options),
        this.prototypeMapper.mapPrototypes(figmaData.document, options)
      ]);

      // Build comprehensive context object
      const context = this.buildUnifiedContext({
        figmaData,
        parsedNodes,
        extractedStyles,
        componentMapping,
        layoutAnalysis,
        prototypeConnections,
        options
      });

      // Cache the extracted context
      if (this.config.enableCaching) {
        await this.cacheContext(cacheKey, context);
      }

      this.logger.info('✅ Context extraction complete', {
        processingTime: Date.now() - startTime,
        contextKeys: Object.keys(context),
        componentsFound: context.components?.length || 0,
        stylesExtracted: Object.keys(context.styles || {}).length
      });

      return this.addPerformanceMetrics(context, startTime, false);

    } catch (error) {
      this.logger.error('Context extraction failed:', error);
      return this.generateFallbackContext(figmaData, error);
    }
  }

  /**
   * Build unified context object from all extractor outputs
   */
  buildUnifiedContext({
    figmaData,
    parsedNodes,
    extractedStyles,
    componentMapping,
    layoutAnalysis,
    prototypeConnections,
    options
  }) {
    const context = {
      // File metadata
      file: {
        id: figmaData.document?.id,
        name: figmaData.name || 'Untitled',
        version: figmaData.version,
        lastModified: figmaData.lastModified,
        thumbnail: figmaData.thumbnailUrl
      },

      // Parsed node structure
      nodes: parsedNodes,

      // Style system
      styles: extractedStyles,

      // Component design system
      components: componentMapping,

      // Layout relationships
      layout: layoutAnalysis,

      // Prototype flows
      prototypes: prototypeConnections,

      // Semantic understanding
      semantics: this.extractSemanticContext(parsedNodes, componentMapping),

      // Design tokens
      designTokens: this.consolidateDesignTokens(extractedStyles, componentMapping),

      // Accessibility context
      accessibility: this.extractAccessibilityContext(parsedNodes, extractedStyles),

      // Performance metadata
      extraction: {
        timestamp: new Date().toISOString(),
        processingTime: null, // Will be added later
        cached: false,
        extractor: 'ContextManager',
        confidence: this.calculateContextConfidence(parsedNodes, extractedStyles, componentMapping)
      }
    };

    return context;
  }

  /**
   * Extract semantic meaning from parsed nodes and components
   */
  extractSemanticContext(parsedNodes, componentMapping) {
    const semantics = {
      intents: [], // Login form, CTA button, navigation, etc.
      purposes: [], // Primary action, secondary info, decorative, etc.
      userFlows: [], // Multi-step processes identified
      interactionPatterns: [] // Common UI patterns detected
    };

    // Analyze node patterns for semantic meaning
    parsedNodes.forEach(node => {
      // Detect common patterns
      if (node.type === 'FRAME' && node.children) {
        const intent = this.detectFrameIntent(node);
        if (intent) {
          semantics.intents.push({
            nodeId: node.id,
            intent,
            confidence: intent.confidence
          });
        }
      }
    });

    return semantics;
  }

  /**
   * Consolidate design tokens from styles and components
   */
  consolidateDesignTokens(styles, components) {
    return {
      colors: styles.colors || {},
      typography: styles.typography || {},
      spacing: styles.spacing || {},
      layout: styles.layout || {},
      components: components.designSystem || {},
      variations: components.variants || []
    };
  }

  /**
   * Extract accessibility context
   */
  extractAccessibilityContext(parsedNodes, styles) {
    return {
      colorContrast: this.analyzeColorContrast(styles.colors),
      textHierarchy: this.analyzeTextHierarchy(parsedNodes),
      interactiveElements: this.identifyInteractiveElements(parsedNodes),
      landmarks: this.identifyLandmarks(parsedNodes)
    };
  }

  /**
   * Detect semantic intent of frame nodes
   */
  detectFrameIntent(frame) {
    // Simple pattern detection - can be enhanced with ML
    const name = frame.name.toLowerCase();

    if (name.includes('login') || name.includes('signin')) {
      return { type: 'login_form', confidence: 0.8 };
    }
    if (name.includes('nav') || name.includes('header')) {
      return { type: 'navigation', confidence: 0.7 };
    }
    if (name.includes('button') || name.includes('cta')) {
      return { type: 'call_to_action', confidence: 0.6 };
    }

    return null;
  }

  /**
   * Calculate confidence score for extracted context
   */
  calculateContextConfidence(parsedNodes, styles, components) {
    let score = 0;
    let factors = 0;

    // Node parsing confidence
    if (parsedNodes && parsedNodes.length > 0) {
      score += 0.25;
      factors++;
    }

    // Style extraction confidence
    if (styles && Object.keys(styles).length > 0) {
      score += 0.25;
      factors++;
    }

    // Component mapping confidence
    if (components && Object.keys(components).length > 0) {
      score += 0.25;
      factors++;
    }

    // Overall completeness
    if (factors === 3) {
      score += 0.25;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate cache key for context data
   */
  generateCacheKey(figmaData, options) {
    const fileId = figmaData.document?.id || 'unknown';
    const version = figmaData.version || 'v1';
    const optionsHash = JSON.stringify(options);
    return `context:${fileId}:${version}:${Buffer.from(optionsHash).toString('base64')}`;
  }

  /**
   * Get cached context if available
   */
  async getCachedContext(cacheKey) {
    try {
      const cached = await this.redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      this.logger.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  /**
   * Cache extracted context
   */
  async cacheContext(cacheKey, context) {
    try {
      await this.redis.setex(cacheKey, this.config.cacheTTL, JSON.stringify(context));
      this.logger.debug(`📋 Context cached: ${cacheKey}`);
    } catch (error) {
      this.logger.warn('Context caching failed:', error);
    }
  }

  /**
   * Count total nodes in document
   */
  countNodes(document) {
    if (!document || !document.children) {return 0;}

    let count = 1; // Count the document itself
    const countChildren = (node) => {
      if (node.children) {
        count += node.children.length;
        node.children.forEach(countChildren);
      }
    };

    document.children.forEach(countChildren);
    return count;
  }

  /**
   * Add performance metrics to context
   */
  addPerformanceMetrics(context, startTime, fromCache) {
    const processingTime = Date.now() - startTime;

    context.extraction = {
      ...context.extraction,
      processingTime,
      cached: fromCache
    };

    // Track metrics
    this.extractionMetrics.set(Date.now(), {
      processingTime,
      cached: fromCache,
      contextSize: JSON.stringify(context).length
    });

    return context;
  }

  /**
   * Generate fallback context when extraction fails
   */
  generateFallbackContext(figmaData, error) {
    this.logger.warn('Generating fallback context due to extraction error:', error);

    return {
      file: {
        id: figmaData.document?.id || 'unknown',
        name: figmaData.name || 'Untitled',
        error: 'Context extraction failed'
      },
      nodes: [],
      styles: {},
      components: {},
      layout: {},
      prototypes: {},
      extraction: {
        timestamp: new Date().toISOString(),
        error: error.message,
        confidence: 0.1
      }
    };
  }

  /**
   * Analyze color contrast for accessibility
   */
  analyzeColorContrast(colors) {
    // Placeholder for color contrast analysis
    return {
      analyzed: false,
      pairs: [],
      violations: []
    };
  }

  /**
   * Analyze text hierarchy for accessibility
   */
  analyzeTextHierarchy(nodes) {
    const textNodes = nodes.filter(node => node.type === 'TEXT');
    return {
      headings: textNodes.filter(node => node.name?.toLowerCase().includes('heading')),
      body: textNodes.filter(node => !node.name?.toLowerCase().includes('heading')),
      hierarchy: 'detected' // Placeholder
    };
  }

  /**
   * Identify interactive elements
   */
  identifyInteractiveElements(nodes) {
    return nodes.filter(node =>
      node.name?.toLowerCase().includes('button') ||
      node.name?.toLowerCase().includes('link') ||
      node.name?.toLowerCase().includes('input')
    );
  }

  /**
   * Identify landmark elements
   */
  identifyLandmarks(nodes) {
    return nodes.filter(node =>
      node.name?.toLowerCase().includes('nav') ||
      node.name?.toLowerCase().includes('header') ||
      node.name?.toLowerCase().includes('footer') ||
      node.name?.toLowerCase().includes('main')
    );
  }

  /**
   * Get extraction performance metrics
   */
  getPerformanceMetrics() {
    const metrics = Array.from(this.extractionMetrics.values());
    return {
      totalExtractions: metrics.length,
      averageTime: metrics.reduce((sum, m) => sum + m.processingTime, 0) / metrics.length,
      cacheHitRate: metrics.filter(m => m.cached).length / metrics.length,
      averageContextSize: metrics.reduce((sum, m) => sum + m.contextSize, 0) / metrics.length
    };
  }

  /**
   * Get health status for monitoring
   */
  getHealthStatus() {
    return {
      status: 'healthy',
      extractors: {
        nodeParser: !!this.nodeParser,
        styleExtractor: !!this.styleExtractor,
        componentMapper: !!this.componentMapper,
        layoutAnalyzer: !!this.layoutAnalyzer,
        prototypeMapper: !!this.prototypeMapper
      },
      cache: {
        entries: this.contextCache.size,
        maxSize: this.maxCacheSize
      },
      redis: this.redisClient ? 'connected' : 'unavailable',
      metrics: this.getPerformanceMetrics()
    };
  }

  /**
   * Clear caches and reset metrics
   */
  async cleanup() {
    this.contextCache.clear();
    this.extractionMetrics.clear();
    await this.redis.disconnect();
    this.logger.info('🧹 ContextManager cleanup complete');
  }
}

export default ContextManager;