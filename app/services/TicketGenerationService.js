/**
 * Ticket Generation Service
 *
 * Unified service that consolidates all ticket generation methods using strategy pattern.
 * Replaces 6+ different ticket generation methods from main server.
 *
 * Strategies:
 * - AI Strategy: Visual Enhanced AI with multimodal analysis
 * - Template Strategy: Rich template-based generation
 * - Enhanced Strategy: Template + context enhancement
 * - Legacy Strategy: Basic generation for backward compatibility
 *
 * Phase 8: Server Architecture Refactoring
 * Prepares for Phase 7 Context Intelligence integration
 */

import { BaseService } from './BaseService.js';

export class TicketGenerationService extends BaseService {
  constructor(templateManager, visualAIService, aiOrchestrator, cacheService) {
    super('TicketGenerationService');

    this.templateManager = templateManager;
    this.visualAIService = visualAIService;
    this.aiOrchestrator = aiOrchestrator;
    this.cacheService = cacheService;

    this.strategies = new Map();
    this.defaultStrategy = 'enhanced';
  }

  async onInitialize() {
    // Initialize generation strategies
    this.strategies.set('ai', new AIGenerationStrategy(
      this.visualAIService,
      this.aiOrchestrator,
      this.logger
    ));

    this.strategies.set('template', new TemplateGenerationStrategy(
      this.templateManager,
      this.logger
    ));

    this.strategies.set('enhanced', new EnhancedGenerationStrategy(
      this.templateManager,
      this.visualAIService,
      this.logger
    ));

    this.strategies.set('legacy', new LegacyGenerationStrategy(this.logger));

    // Initialize all strategies
    for (const [name, strategy] of this.strategies) {
      try {
        await strategy.initialize();
        this.logger.info(`✅ Strategy initialized: ${name}`);
      } catch (error) {
        this.logger.error(`❌ Strategy initialization failed: ${name}`, error);
      }
    }
  }

  /**
   * Generate ticket using specified strategy
   * @param {Object} request - Ticket generation request
   * @param {string} strategyName - Strategy to use (ai, template, enhanced, legacy)
   * @returns {Object} Generated ticket response
   */
  async generateTicket(request, strategyName = null) {
    return this.executeOperation('generateTicket', async () => {
      // Determine strategy
      const strategy = this.selectStrategy(request, strategyName);

      // Check cache first
      const cacheKey = this.createCacheKey(request, strategy.name);
      const cachedResult = await this.getCachedTicket(cacheKey);

      if (cachedResult) {
        this.logger.info(`📋 Using cached ticket [${strategy.name}]`);
        return cachedResult;
      }

      // Generate ticket
      this.logger.info(`🎫 Generating ticket using ${strategy.name} strategy`);
      const result = await strategy.generate(request);

      // Add metadata
      result.metadata = {
        ...result.metadata,
        strategy: strategy.name,
        service: 'TicketGenerationService',
        generatedAt: new Date().toISOString(),
        cached: false
      };

      // Cache result
      await this.cacheTicket(cacheKey, result);

      return result;
    }, { strategy: strategyName, requestType: request.documentType });
  }

  /**
   * Select appropriate generation strategy
   * @param {Object} request - Generation request
   * @param {string} preferredStrategy - Preferred strategy name
   * @returns {Object} Selected strategy
   */
  selectStrategy(request, preferredStrategy = null) {
    // Use preferred strategy if specified and available
    if (preferredStrategy && this.strategies.has(preferredStrategy)) {
      return this.strategies.get(preferredStrategy);
    }

    // Intelligent strategy selection based on request
    if (request.useAI && request.enhancedFrameData && this.visualAIService) {
      return this.strategies.get('ai');
    }

    if (request.enhancedFrameData && request.techStack) {
      return this.strategies.get('enhanced');
    }

    if (request.frameData) {
      return this.strategies.get('template');
    }

    // Fallback to default strategy
    return this.strategies.get(this.defaultStrategy);
  }

  /**
   * Get available strategies
   * @returns {Array<string>} Strategy names
   */
  getAvailableStrategies() {
    return Array.from(this.strategies.keys());
  }

  /**
   * Get strategy health status
   * @returns {Object} Health status of all strategies
   */
  getStrategyHealth() {
    const health = {};

    for (const [name, strategy] of this.strategies) {
      health[name] = strategy.healthCheck();
    }

    return health;
  }

  /**
   * Create cache key for ticket
   * @param {Object} request - Generation request
   * @param {string} strategy - Strategy name
   * @returns {string} Cache key
   */
  createCacheKey(request, strategy) {
    const keyData = {
      strategy,
      documentType: request.documentType,
      platform: request.platform,
      techStack: request.techStack,
      componentName: request.frameData?.[0]?.name || request.enhancedFrameData?.[0]?.name,
      hasScreenshot: !!request.screenshot
    };

    // Create deterministic hash
    const keyString = JSON.stringify(keyData);
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `ticket:${Math.abs(hash)}:${strategy}`;
  }

  /**
   * Get cached ticket
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} Cached ticket or null
   */
  async getCachedTicket(cacheKey) {
    if (!this.cacheService) {return null;}

    try {
      return await this.cacheService.get(cacheKey);
    } catch (error) {
      this.logger.warn('Cache read failed:', error.message);
      return null;
    }
  }

  /**
   * Cache generated ticket
   * @param {string} cacheKey - Cache key
   * @param {Object} ticket - Generated ticket
   */
  async cacheTicket(cacheKey, ticket) {
    if (!this.cacheService) {return;}

    try {
      // Cache for 2 hours
      await this.cacheService.set(cacheKey, ticket, 7200);
      this.logger.debug(`💾 Cached ticket: ${cacheKey}`);
    } catch (error) {
      this.logger.warn('Cache write failed:', error.message);
    }
  }

  healthCheck() {
    const baseHealth = super.healthCheck();

    return {
      ...baseHealth,
      strategies: this.getStrategyHealth(),
      defaultStrategy: this.defaultStrategy,
      availableStrategies: this.getAvailableStrategies()
    };
  }
}

/**
 * Base Generation Strategy
 */
class GenerationStrategy {
  constructor(name, logger) {
    this.name = name;
    this.logger = logger;
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
  }

  async generate(request) {
    throw new Error(`Strategy ${this.name} must implement generate() method`);
  }

  healthCheck() {
    return {
      strategy: this.name,
      initialized: this.initialized,
      status: this.initialized ? 'ready' : 'not-initialized'
    };
  }
}

/**
 * AI Generation Strategy - Visual Enhanced AI with multimodal analysis
 */
class AIGenerationStrategy extends GenerationStrategy {
  constructor(visualAIService, aiOrchestrator, logger) {
    super('ai', logger);
    this.visualAIService = visualAIService;
    this.aiOrchestrator = aiOrchestrator;
  }

  async generate(request) {
    const { enhancedFrameData, frameData, screenshot, techStack, documentType, mockMode, testMode } = request;

    // Use enhancedFrameData if available, otherwise fall back to frameData
    const dataToUse = enhancedFrameData || frameData;

    // In test/mock mode, be more flexible with data requirements
    if (!dataToUse?.length && !mockMode && !testMode && !screenshot) {
      throw new Error('Enhanced frame data required for AI generation');
    }

    // Return mock data if in mock mode
    if (mockMode || testMode) {
      return {
        content: [{
          type: 'text',
          text: `# Mock AI Generated ${documentType || 'Task'}\n\n` +
                `**Technology Stack:** ${techStack || 'Not specified'}\n\n` +
                '## Description\n' +
                'This is a mock AI-generated ticket for testing purposes. In production, this would contain ' +
                'AI-analyzed content based on the provided visual context.\n\n' +
                '## Acceptance Criteria\n' +
                '- [ ] Mock criterion 1\n' +
                '- [ ] Mock criterion 2\n' +
                '- [ ] Mock criterion 3\n\n' +
                '---\n*Generated via Mock AI Strategy*'
        }],
        format: 'jira',
        strategy: 'ai',
        confidence: 0.95,
        source: 'mock-ai',
        performance: {
          duration: 0,
          cacheHit: false
        }
      };
    }

    // Build visual context for AI (use available data)
    const visualContext = this.buildVisualContext(dataToUse || [], screenshot);

    // Use Visual Enhanced AI Service
    const aiResult = await this.visualAIService.processVisualEnhancedContext(
      visualContext,
      {
        documentType,
        techStack,
        instructions: `Generate a comprehensive ${documentType} ticket for ${techStack} implementation`
      }
    );

    return {
      content: [{
        type: 'text',
        text: aiResult.ticket + '\n\n---\n*Generated via Visual Enhanced AI*'
      }],
      metadata: {
        generationType: 'visual-enhanced-ai',
        aiModel: 'gemini-2.0-flash',
        confidence: aiResult.confidence,
        processingMetrics: aiResult.processingMetrics
      }
    };
  }

  buildVisualContext(enhancedFrameData, screenshot) {
    // Extract design context from frame data
    const colors = this.extractColors(enhancedFrameData);
    const typography = this.extractTypography(enhancedFrameData);
    const components = enhancedFrameData.map(frame => ({
      name: frame.name || 'Component',
      type: frame.type || 'FRAME',
      id: frame.id
    }));

    return {
      screenshot: screenshot ? { url: screenshot, format: 'png' } : null,
      visualDesignContext: {
        colorPalette: colors,
        typography,
        spacing: { patterns: ['8px', '16px', '24px', '32px'] },
        layout: { structure: 'Component-based' },
        designPatterns: ['Component System', 'Design Tokens']
      },
      hierarchicalData: { components },
      figmaContext: {
        fileName: 'Design System Project',
        pageName: 'Components',
        selection: enhancedFrameData[0] || {}
      }
    };
  }

  extractColors(frameData) {
    // Extract colors from frame data
    const colors = [];
    frameData.forEach(frame => {
      if (frame.fills) {
        frame.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            colors.push({
              hex: this.rgbToHex(fill.color),
              rgb: fill.color,
              usage: ['Component'],
              count: 1
            });
          }
        });
      }
    });
    return colors.length > 0 ? colors : [
      { hex: '#667eea', rgb: { r: 102, g: 126, b: 234 }, usage: ['Primary'], count: 1 }
    ];
  }

  extractTypography(frameData) {
    const fonts = new Set();
    const sizes = new Set();

    frameData.forEach(frame => {
      if (frame.style) {
        if (frame.style.fontFamily) {fonts.add(frame.style.fontFamily);}
        if (frame.style.fontSize) {sizes.add(frame.style.fontSize);}
      }
    });

    return {
      fonts: fonts.size > 0 ? Array.from(fonts) : ['Inter', 'SF Pro Display'],
      sizes: sizes.size > 0 ? Array.from(sizes) : [14, 16, 18, 24, 32],
      hierarchy: ['Heading 1', 'Heading 2', 'Body', 'Caption']
    };
  }

  rgbToHex(rgb) {
    const toHex = (c) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  healthCheck() {
    const baseHealth = super.healthCheck();
    return {
      ...baseHealth,
      visualAIService: !!this.visualAIService,
      aiOrchestrator: !!this.aiOrchestrator
    };
  }
}

/**
 * Template Generation Strategy - Rich template-based generation
 */
class TemplateGenerationStrategy extends GenerationStrategy {
  constructor(templateManager, logger) {
    super('template', logger);
    this.templateManager = templateManager;
  }

  async generate(request) {
    const { frameData, platform, documentType, techStack, teamStandards } = request;

    const result = await this.templateManager.generateTicket({
      platform: platform || 'jira',
      documentType: documentType || 'component',
      componentName: frameData?.[0]?.name || 'Component',
      techStack,
      teamStandards,
      requestData: request
    });

    return {
      content: [{
        type: 'text',
        text: result.content
      }],
      metadata: {
        generationType: 'template',
        templateId: result.metadata?.template_id,
        platform,
        documentType
      }
    };
  }

  healthCheck() {
    const baseHealth = super.healthCheck();
    return {
      ...baseHealth,
      templateManager: !!this.templateManager
    };
  }
}

/**
 * Enhanced Generation Strategy - Template + context enhancement
 */
class EnhancedGenerationStrategy extends GenerationStrategy {
  constructor(templateManager, visualAIService, logger) {
    super('enhanced', logger);
    this.templateManager = templateManager;
    this.visualAIService = visualAIService;
  }

  async generate(request) {
    // Try AI enhancement first, fallback to template
    if (this.visualAIService && request.enhancedFrameData) {
      try {
        const aiStrategy = new AIGenerationStrategy(this.visualAIService, null, this.logger);
        return await aiStrategy.generate(request);
      } catch (error) {
        this.logger.warn('AI enhancement failed, falling back to template:', error.message);
      }
    }

    // Fallback to template generation
    const templateStrategy = new TemplateGenerationStrategy(this.templateManager, this.logger);
    const result = await templateStrategy.generate(request);

    result.metadata.generationType = 'enhanced-template-fallback';
    return result;
  }

  healthCheck() {
    const baseHealth = super.healthCheck();
    return {
      ...baseHealth,
      templateManager: !!this.templateManager,
      visualAIService: !!this.visualAIService
    };
  }
}

/**
 * Legacy Generation Strategy - Basic generation for backward compatibility
 */
class LegacyGenerationStrategy extends GenerationStrategy {
  constructor(logger) {
    super('legacy', logger);
  }

  async generate(request) {
    const { frameData, template = 'basic' } = request;
    const componentName = frameData?.[0]?.name || 'Component';

    return {
      content: [{
        type: 'text',
        text: `# Generated Ticket

## Component: ${componentName}
Template: ${template}

Generated at ${new Date().toISOString()}`
      }],
      metadata: {
        generationType: 'legacy',
        template
      }
    };
  }
}