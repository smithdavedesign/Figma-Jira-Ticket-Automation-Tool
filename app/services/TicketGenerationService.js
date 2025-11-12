/**
 * Ticket Generation Service - SIMPLIFIED ARCHITECTURE
 *
 * Simplified from 5 strategies to 2 strategies based on user needs analysis:
 * - User has ONE generate button, not five
 * - AI involvement is mandatory for quality tickets
 * - Complex strategy selection was over-engineering
 *
 * Strategies:
 * - AI-Powered Strategy: Unified AI + template + context approach (PRIMARY)
 * - Emergency Strategy: Fallback when AI service fails (FALLBACK ONLY)
 *
 * Technical Debt Cleanup: Eliminated redundant strategies and selection complexity
 */

import { BaseService } from './BaseService.js';
import { TemplateGuidedAIService } from '../../core/ai/template-guided-ai-service.js';
import { UnifiedContextBuilder } from '../../core/data/unified-context-builder.js';

export class TicketGenerationService extends BaseService {
  constructor(templateManager, visualAIService, aiOrchestrator, cacheService) {
    super('TicketGenerationService');

    this.templateManager = templateManager;
    this.visualAIService = visualAIService;
    this.aiOrchestrator = aiOrchestrator;
    this.cacheService = cacheService;

    this.strategies = new Map();
    this.defaultStrategy = 'ai-powered'; // Simplified: only 2 strategies
  }

  async onInitialize() {
    // Initialize unified context builder
    this.unifiedContextBuilder = new UnifiedContextBuilder({
      configService: this.configService,
      aiService: this.visualAIService
    });

    // Initialize template-guided AI service for optimal AI generation
    this.templateGuidedAIService = new TemplateGuidedAIService({
      aiService: this.visualAIService,
      configService: this.configService
    });

    // SIMPLIFIED: Only 2 strategies needed
    // 1. Primary: AI-Powered (combines template + AI + context)
    this.strategies.set('ai-powered', new AIPoweredGenerationStrategy(
      this.templateGuidedAIService,
      this.unifiedContextBuilder,
      this.templateManager,
      this.visualAIService,
      this.logger
    ));

    // 2. Fallback: Emergency (when AI fails)
    this.strategies.set('emergency', new EmergencyGenerationStrategy(
      this.templateManager,
      this.unifiedContextBuilder,
      this.logger
    ));

    // Initialize strategies
    for (const [name, strategy] of this.strategies) {
      try {
        await strategy.initialize();
        this.logger.info(`✅ Strategy initialized: ${name}`);
      } catch (error) {
        this.logger.error(`❌ Strategy initialization failed: ${name}`, error);
      }
    }

    this.logger.info('🎯 Simplified ticket generation: 2 strategies (was 5)');
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

      // Cache the result for future requests
      await this.cacheTicket(cacheKey, result);

      return result;
    }, { strategy: strategyName, requestType: request.documentType });
  }

  /**
   * Select appropriate generation strategy - SIMPLIFIED
   * @param {Object} request - Generation request
   * @param {string} preferredStrategy - Preferred strategy name (for backward compatibility)
   * @returns {Object} Selected strategy
   */
  selectStrategy(request, preferredStrategy = null) {
    // BACKWARD COMPATIBILITY: Map old strategy names to new ones
    const strategyMapping = {
      'ai': 'ai-powered',
      'enhanced': 'ai-powered',
      'template': 'ai-powered',
      'template-guided-ai': 'ai-powered',
      'legacy': 'emergency'
    };

    // Use mapped strategy if old name provided
    if (preferredStrategy && strategyMapping[preferredStrategy]) {
      const mappedStrategy = strategyMapping[preferredStrategy];
      this.logger.info(`🔄 Mapping legacy strategy '${preferredStrategy}' → '${mappedStrategy}'`);
      return this.strategies.get(mappedStrategy);
    }

    // Use preferred strategy if it exists
    if (preferredStrategy && this.strategies.has(preferredStrategy)) {
      return this.strategies.get(preferredStrategy);
    }

    // SIMPLIFIED SELECTION: AI service available? Use AI-powered, else emergency
    if (this.visualAIService && this.templateGuidedAIService) {
      this.logger.info('🤖 AI service available → Using ai-powered strategy');
      return this.strategies.get('ai-powered');
    } else {
      this.logger.info('⚠️ AI service unavailable → Using emergency strategy');
      return this.strategies.get('emergency');
    }
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
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        // Mark as cached and ensure proper format
        return {
          ...cached,
          metadata: {
            ...cached.metadata,
            cached: true
          }
        };
      }
      return null;
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
 * AI-Powered Generation Strategy (PRIMARY)
 *
 * Unified strategy combining the best of:
 * - Template-Guided AI (structure + AI intelligence)
 * - Enhanced Strategy (template + AI hybrid)
 * - Pure AI Strategy (visual analysis)
 *
 * This handles 95% of all ticket generation use cases.
 */
class AIPoweredGenerationStrategy extends GenerationStrategy {
  constructor(templateGuidedAIService, unifiedContextBuilder, templateManager, visualAIService, logger) {
    super('ai-powered', logger);
    this.templateGuidedAIService = templateGuidedAIService;
    this.unifiedContextBuilder = unifiedContextBuilder;
    this.templateManager = templateManager;
    this.visualAIService = visualAIService;
  }

  async generate(request) {
    const {
      componentName,
      platform = 'jira',
      documentType = 'component',
      techStack = 'React TypeScript',
      figmaContext,
      requestData,
      frameData,
      enhancedFrameData,
      screenshot
    } = request;

    this.logger.info(`🚀 Using AI-Powered Strategy (unified) for ${componentName || 'Component'}`);

    try {
      // FIRST ATTEMPT: Use Template-Guided AI (optimal approach)
      if (this.templateGuidedAIService) {
        this.logger.info('🎯 Attempting Template-Guided AI generation...', {
          componentName: componentName || frameData?.[0]?.name || 'Component',
          platform,
          documentType,
          hasFigmaContext: !!figmaContext,
          hasRequestData: !!requestData,
          techStack: Array.isArray(techStack) ? techStack.join(', ') : techStack
        });

        try {
          const result = await this.templateGuidedAIService.generateTemplateGuidedTicket({
            platform,
            documentType,
            componentName: componentName || frameData?.[0]?.name || 'Component',
            techStack,
            figmaContext,
            requestData: requestData || request
          });

          this.logger.info('✅ Template-Guided AI completed successfully:', {
            contentLength: result.content.length,
            contextCompleteness: result.metadata?.context_completeness,
            aiConfidence: result.metadata?.ai_confidence,
            generationType: result.metadata?.generationType
          });

          // 🔍 DEBUG: Log result structure to identify indexed format issue
          this.logger.info('🔍 DEBUG: Template-Guided AI result structure:', {
            contentType: typeof result.content,
            contentFirst50: result.content?.toString().substring(0, 50),
            isString: typeof result.content === 'string',
            resultKeys: Object.keys(result),
            contentKeys: typeof result.content === 'object' ? Object.keys(result.content) : null
          });

          return result;

        } catch (templateAIError) {
          this.logger.error('❌ Template-Guided AI failed with error:', {
            message: templateAIError.message,
            stack: templateAIError.stack?.substring(0, 500),
            componentName: componentName || frameData?.[0]?.name || 'Component'
          });
          this.logger.warn('⚠️ Falling back to enhanced approach due to Template-Guided AI failure');
        }
      } else {
        this.logger.warn('⚠️ Template-Guided AI service not available, skipping to enhanced approach');
      }

      // SECOND ATTEMPT: Enhanced approach (template + AI hybrid)
      if (this.templateManager && this.visualAIService && (enhancedFrameData || screenshot)) {
        try {
          // Generate base template
          const templateResult = await this.templateManager.generateTicket({
            platform,
            documentType,
            componentName: componentName || frameData?.[0]?.name || 'Component',
            techStack,
            requestData: request
          });

          // Enhance with AI if visual data available
          const visualContext = this.buildVisualContext(enhancedFrameData || [], screenshot);
          const aiResult = await this.visualAIService.processVisualEnhancedContext(
            visualContext,
            {
              documentType,
              techStack: Array.isArray(techStack) ? techStack.join(', ') : techStack,
              instructions: `Enhance this template with visual insights: ${templateResult.content.substring(0, 500)}...`
            }
          );

          const enhancedContent = this.combineTemplateAndAI(templateResult.content, aiResult.ticket);

          return {
            content: [{ type: 'text', text: enhancedContent }],
            metadata: {
              generationType: 'ai-powered-enhanced',
              strategy: 'ai-powered',
              templateId: templateResult.metadata?.template_id,
              aiModel: 'gemini-2.0-flash',
              confidence: aiResult.confidence || 0.8
            }
          };

        } catch (enhancedError) {
          this.logger.warn('⚠️ Enhanced approach failed, trying pure AI:', enhancedError.message);
        }
      }

      // THIRD ATTEMPT: Pure AI approach
      if (this.visualAIService) {
        const visualContext = this.buildVisualContext(enhancedFrameData || frameData || [], screenshot);
        const aiResult = await this.visualAIService.processVisualEnhancedContext(
          visualContext,
          {
            documentType,
            techStack,
            instructions: `Generate a comprehensive ${documentType} ticket for ${techStack} implementation`
          }
        );

        return {
          content: [{ type: 'text', text: aiResult.ticket + '\n\n---\n*Generated via AI-Powered Strategy (Pure AI)*' }],
          metadata: {
            generationType: 'ai-powered-pure',
            strategy: 'ai-powered',
            aiModel: 'gemini-2.0-flash',
            confidence: aiResult.confidence || 0.7
          }
        };
      }

      throw new Error('No AI services available for AI-powered strategy');

    } catch (error) {
      this.logger.error('❌ AI-Powered generation failed completely:', error);
      throw error;
    }
  }

  // Helper methods from original strategies
  buildVisualContext(frameData, screenshot) {
    const colors = this.extractColors(frameData);
    const typography = this.extractTypography(frameData);
    const components = frameData.map(frame => ({
      name: frame.name || 'Component',
      type: frame.type || 'FRAME',
      id: frame.id
    }));

    return {
      screenshot: screenshot ? this.processScreenshotForAI(screenshot) : null,
      visualDesignContext: {
        colorPalette: colors,
        typography,
        spacing: { patterns: ['8px', '16px', '24px', '32px'] },
        layout: { structure: 'Component-based' },
        designPatterns: ['Component System', 'Design Tokens']
      },
      hierarchicalData: { components },
      figmaContext: {
        selection: { name: components[0]?.name || 'Component' },
        fileName: 'Design File'
      }
    };
  }

  extractColors(frameData) {
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

  combineTemplateAndAI(templateContent, aiContent) {
    let enhanced = templateContent;
    if (aiContent.includes('complexity') || aiContent.includes('implementation')) {
      enhanced += '\n\n---\n**AI-Enhanced Analysis:**\n\n';
      const aiInsights = this.extractKeyInsights(aiContent);
      enhanced += aiInsights;
    }
    return enhanced;
  }

  extractKeyInsights(aiContent) {
    const insights = [];
    const complexityMatch = aiContent.match(/complexity[^.]*\./i);
    if (complexityMatch) {insights.push(`• ${complexityMatch[0]}`);}

    const implMatches = aiContent.match(/implementation[^.]*\./gi);
    if (implMatches) {
      insights.push(...implMatches.slice(0, 2).map(match => `• ${match}`));
    }

    return insights.join('\n') || 'Additional analysis insights integrated from AI review.';
  }

  async processScreenshotForAI(screenshot) {
    // Simplified version - just return the screenshot data
    if (typeof screenshot === 'string' && screenshot.startsWith('data:image')) {
      const base64Match = screenshot.match(/base64,(.+)/);
      if (base64Match) {
        return {
          base64: base64Match[1],
          format: screenshot.includes('png') ? 'png' : 'jpeg',
          source: 'data-url'
        };
      }
    }
    return null;
  }

  healthCheck() {
    return {
      ...super.healthCheck(),
      templateGuidedAIAvailable: !!this.templateGuidedAIService,
      contextBuilderAvailable: !!this.unifiedContextBuilder,
      templateManagerAvailable: !!this.templateManager,
      visualAIAvailable: !!this.visualAIService
    };
  }
}

/**
 * Emergency Generation Strategy (FALLBACK ONLY)
 *
 * Used only when AI services completely fail.
 * Provides functional templates with intelligent defaults - no "Not Found" values.
 * Goal: Always produce a usable ticket, even if not AI-enhanced.
 */
class EmergencyGenerationStrategy extends GenerationStrategy {
  constructor(templateManager, unifiedContextBuilder, logger) {
    super('emergency', logger);
    this.templateManager = templateManager;
    this.unifiedContextBuilder = unifiedContextBuilder;
  }

  async generate(request) {
    const {
      componentName,
      platform = 'jira',
      documentType = 'component',
      techStack = 'React TypeScript',
      frameData,
      figmaContext,
      requestData
    } = request;

    this.logger.warn('⚠️ Using Emergency Strategy - AI services unavailable');

    try {
      // Try to use template manager with unified context (without AI enhancement)
      if (this.templateManager && this.unifiedContextBuilder) {
        const context = await this.unifiedContextBuilder.buildUnifiedContext({
          componentName: componentName || frameData?.[0]?.name || 'Component',
          techStack,
          figmaContext,
          requestData: requestData || request,
          platform,
          documentType,
          options: { enableAIEnhancement: false } // No AI for emergency
        });

        const result = await this.templateManager.generateTicket({
          platform,
          documentType,
          componentName: componentName || frameData?.[0]?.name || 'Component',
          techStack,
          figmaContext: context.figma,
          requestData: context
        });

        return {
          content: [{ type: 'text', text: result.content + '\n\n---\n⚠️ *Generated via Emergency Strategy (AI unavailable)*' }],
          metadata: {
            generationType: 'emergency',
            strategy: 'emergency',
            templateId: result.metadata?.template_id,
            aiUnavailable: true,
            platform,
            documentType
          }
        };
      }

      // Fallback to basic template if template manager fails
      if (this.templateManager) {
        const result = await this.templateManager.generateTicket({
          platform,
          documentType,
          componentName: componentName || frameData?.[0]?.name || 'Component',
          techStack,
          requestData: request
        });

        return {
          content: [{ type: 'text', text: result.content + '\n\n---\n⚠️ *Generated via Emergency Strategy (Basic Template)*' }],
          metadata: {
            generationType: 'emergency-basic',
            strategy: 'emergency',
            templateId: result.metadata?.template_id
          }
        };
      }

      // Ultimate fallback: hardcoded template
      return this.generateHardcodedTicket(componentName || frameData?.[0]?.name || 'Component', techStack, documentType);

    } catch (error) {
      this.logger.error('❌ Emergency strategy failed, using hardcoded fallback:', error);
      return this.generateHardcodedTicket(componentName || frameData?.[0]?.name || 'Component', techStack, documentType);
    }
  }

  /**
   * Generate hardcoded ticket as ultimate fallback
   */
  generateHardcodedTicket(componentName, techStack, documentType) {
    const techStackStr = Array.isArray(techStack) ? techStack.join(', ') : techStack;

    const content = `# ${componentName} Implementation

## Description
Implement the ${componentName} component according to design specifications.

## Technical Requirements
- **Technology Stack**: ${techStackStr}
- **Document Type**: ${documentType}
- **Component Type**: UI Component

## Acceptance Criteria
- [ ] Component matches design specifications exactly
- [ ] Component is responsive across all breakpoints (mobile, tablet, desktop)
- [ ] Component passes WCAG 2.1 AA accessibility compliance
- [ ] Unit tests provide adequate coverage (>80%)
- [ ] Code follows team standards and conventions
- [ ] Component is documented in Storybook
- [ ] Cross-browser compatibility verified

## Implementation Notes
- Follow established design system patterns
- Use semantic HTML structure
- Implement proper keyboard navigation
- Ensure screen reader compatibility
- Add proper focus indicators

## Resources
- Design Reference: See Figma file
- Component Library: Check existing patterns
- Accessibility Guide: Follow WCAG 2.1 standards
- Testing Requirements: Unit + integration tests

---
⚠️ *Generated via Emergency Strategy fallback - AI services were unavailable*
*This is a functional template with intelligent defaults*

Generated at ${new Date().toISOString()}`;

    return {
      content: [{ type: 'text', text: content }],
      metadata: {
        generationType: 'emergency-hardcoded',
        strategy: 'emergency',
        componentName,
        techStack: techStackStr,
        documentType
      }
    };
  }

  healthCheck() {
    return {
      ...super.healthCheck(),
      templateManagerAvailable: !!this.templateManager,
      contextBuilderAvailable: !!this.unifiedContextBuilder,
      fallbackMode: true
    };
  }
}

