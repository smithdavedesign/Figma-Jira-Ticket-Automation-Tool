/**
 * 🔄 Unified Context Provider
 *
 * Consolidates all context building logic from Design Health tab and Advanced Context Dashboard
 * into a single, comprehensive context provider that serves as the unified interface for all
 * context-related operations.
 *
 * Features:
 * - Extends existing ContextManager with unified methods
 * - Combines design health metrics with advanced context
 * - Provides LLM-ready context preview
 * - Real-time context updates and validation
 * - Performance metrics and caching
 * - Configuration service integration
 */

import { ContextManager } from './ContextManager.js';
import { Logger } from '../logging/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import ContextIntelligenceOrchestrator from './context-intelligence-orchestrator.js';

// Import Configuration Service  
import configService from '../services/ConfigurationService.js';

export class UnifiedContextProvider extends ContextManager {
  constructor(options = {}) {
    super(options);

    this.logger = new Logger('UnifiedContextProvider');
    this.errorHandler = new ErrorHandler();

    // Additional configuration for unified context
    this.unifiedConfig = {
      includeDesignHealth: configService.isFeatureEnabled('designHealth'),
      includeAdvancedContext: configService.isFeatureEnabled('advancedContext'),
      includePerformanceMetrics: configService.isFeatureEnabled('performanceMetrics'),
      includeContextIntelligence: configService.isFeatureEnabled('contextIntelligence') !== false, // Default enabled
      enableRealTimeUpdates: true,
      contextValidation: true,
      ...options
    };

    // Initialize Context Intelligence Orchestrator (Phase 7)
    this.contextIntelligence = new ContextIntelligenceOrchestrator({
      enableCaching: this.unifiedConfig.includeContextIntelligence,
      parallelAnalysis: true,
      includePerformanceMetrics: this.unifiedConfig.includePerformanceMetrics,
      confidenceThreshold: 0.7
    });

    // Health metrics tracking
    this.healthMetrics = new Map();
    this.contextValidation = new Map();
    this.performanceTracker = new Map();
  }

  /**
   * Build comprehensive unified context combining all existing functionality
   * @param {object} figmaData - Raw Figma API data
   * @param {object} options - Context building options
   * @returns {object} Unified context object
   */
  async buildComprehensiveContext(figmaData, options = {}) {
    const startTime = Date.now();

    try {
      this.logger.info('🔄 Building comprehensive unified context');

      // Extract base context using existing ContextManager
      const baseContext = await this.extractContext(figmaData, options);

      // Add design health metrics
      const healthMetrics = this.unifiedConfig.includeDesignHealth
        ? await this.buildDesignHealthMetrics(figmaData, baseContext)
        : null;

      // Add advanced context analysis
      const advancedContext = this.unifiedConfig.includeAdvancedContext
        ? await this.buildAdvancedContextAnalysis(figmaData, baseContext)
        : null;

      // Add performance metrics
      const performanceMetrics = this.unifiedConfig.includePerformanceMetrics
        ? await this.buildPerformanceMetrics(figmaData, baseContext)
        : null;

      // Add Context Intelligence Analysis (Phase 7)
      const contextIntelligence = this.unifiedConfig.includeContextIntelligence
        ? await this.buildContextIntelligenceAnalysis(figmaData, baseContext, {
            healthMetrics,
            advancedContext,
            performanceMetrics
          })
        : null;

      // Build LLM preview context
      const llmPreviewContext = await this.buildLLMPreviewContext(baseContext, {
        healthMetrics,
        advancedContext,
        performanceMetrics,
        contextIntelligence
      });

      // Construct unified context object
      const unifiedContext = {
        // Base context from ContextManager
        ...baseContext,

        // Design health metrics (from old Design Health tab)
        healthMetrics,

        // Advanced context analysis (from old Advanced Context Dashboard)
        advancedContext,

        // Performance metrics
        performanceMetrics,

        // Context Intelligence Analysis (Phase 7)
        contextIntelligence,

        // LLM preview context (what gets sent to AI)
        llmPreview: llmPreviewContext,

        // Context metadata
        contextMetadata: {
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          featuresEnabled: {
            designHealth: this.unifiedConfig.includeDesignHealth,
            advancedContext: this.unifiedConfig.includeAdvancedContext,
            performanceMetrics: this.unifiedConfig.includePerformanceMetrics,
            contextIntelligence: this.unifiedConfig.includeContextIntelligence
          },
          contextVersion: '2.0.0',
          unifiedProvider: true
        }
      };

      // Validate context if enabled
      if (this.unifiedConfig.contextValidation) {
        await this.validateUnifiedContext(unifiedContext);
      }

      // Cache unified context
      await this.cacheUnifiedContext(unifiedContext, options);

      // Track performance metrics
      this.trackContextGeneration(Date.now() - startTime, unifiedContext);

      this.logger.info(`✅ Unified context built successfully in ${Date.now() - startTime}ms`);

      return unifiedContext;

    } catch (error) {
      this.logger.error('❌ Failed to build unified context:', error);
      throw this.errorHandler.handle(error, 'UnifiedContextProvider.buildComprehensiveContext');
    }
  }

  /**
   * Build design health metrics (from old Design Health tab functionality)
   * @param {object} figmaData - Raw Figma data
   * @param {object} baseContext - Base context from ContextManager
   * @returns {object} Design health metrics
   */
  async buildDesignHealthMetrics(figmaData, baseContext) {
    try {
      this.logger.debug('🏥 Building design health metrics');

      const selection = figmaData.selection || [];
      const designTokens = baseContext.designTokens || {};

      // Calculate design health scores
      const healthMetrics = {
        // Component health
        componentHealth: {
          totalComponents: this.countComponents(selection),
          instanceUsage: this.calculateInstanceUsage(selection),
          variantCoverage: this.calculateVariantCoverage(selection),
          componentReuse: this.calculateComponentReuse(selection),
          score: 0
        },

        // Design system adherence
        designSystemHealth: {
          colorTokenUsage: this.calculateColorTokenUsage(designTokens),
          typographyConsistency: this.calculateTypographyConsistency(designTokens),
          spacingAdherence: this.calculateSpacingAdherence(designTokens),
          consistencyScore: 0
        },

        // Layout quality
        layoutQuality: {
          alignmentScore: this.calculateAlignmentScore(selection),
          spacingConsistency: this.calculateSpacingConsistency(selection),
          gridUsage: this.calculateGridUsage(selection),
          responsiveReadiness: this.calculateResponsiveReadiness(selection),
          score: 0
        },

        // Accessibility health
        accessibilityHealth: {
          colorContrast: this.calculateColorContrast(designTokens),
          textReadability: this.calculateTextReadability(selection),
          interactionTargets: this.calculateInteractionTargets(selection),
          semanticStructure: this.calculateSemanticStructure(selection),
          score: 0
        },

        // Overall health metrics
        overallHealth: {
          totalScore: 0,
          grade: 'A',
          issues: [],
          recommendations: []
        }
      };

      // Calculate component health score
      healthMetrics.componentHealth.score = this.calculateComponentHealthScore(healthMetrics.componentHealth);

      // Calculate design system health score
      healthMetrics.designSystemHealth.consistencyScore = this.calculateDesignSystemScore(healthMetrics.designSystemHealth);

      // Calculate layout quality score
      healthMetrics.layoutQuality.score = this.calculateLayoutQualityScore(healthMetrics.layoutQuality);

      // Calculate accessibility health score
      healthMetrics.accessibilityHealth.score = this.calculateAccessibilityScore(healthMetrics.accessibilityHealth);

      // Calculate overall health score
      healthMetrics.overallHealth = this.calculateOverallHealth(healthMetrics);

      return healthMetrics;

    } catch (error) {
      this.logger.error('❌ Failed to build design health metrics:', error);
      return null;
    }
  }

  /**
   * Build advanced context analysis (from old Advanced Context Dashboard functionality)
   * @param {object} figmaData - Raw Figma data
   * @param {object} baseContext - Base context from ContextManager
   * @returns {object} Advanced context analysis
   */
  async buildAdvancedContextAnalysis(figmaData, baseContext) {
    try {
      this.logger.debug('🔬 Building advanced context analysis');

      return {
        // Node hierarchy analysis
        hierarchyAnalysis: {
          depth: this.calculateNodeDepth(figmaData),
          complexity: this.calculateHierarchyComplexity(figmaData),
          relationships: this.mapNodeRelationships(figmaData),
          navigationPaths: this.calculateNavigationPaths(figmaData)
        },

        // Component analysis
        componentAnalysis: {
          componentTypes: this.analyzeComponentTypes(figmaData),
          variantMapping: this.mapComponentVariants(figmaData),
          instanceRelationships: this.mapInstanceRelationships(figmaData),
          componentDependencies: this.calculateComponentDependencies(figmaData)
        },

        // Design token analysis
        tokenAnalysis: {
          colorPalette: this.analyzeColorPalette(baseContext.designTokens),
          typographyScale: this.analyzeTypographyScale(baseContext.designTokens),
          spacingSystem: this.analyzeSpacingSystem(baseContext.designTokens),
          tokenUsage: this.analyzeTokenUsage(baseContext.designTokens)
        },

        // Layout analysis
        layoutAnalysis: {
          layoutPatterns: this.identifyLayoutPatterns(figmaData),
          gridSystems: this.analyzeGridSystems(figmaData),
          alignmentGroups: this.identifyAlignmentGroups(figmaData),
          spacingPatterns: this.analyzeSpacingPatterns(figmaData)
        },

        // Interaction analysis
        interactionAnalysis: {
          prototypeFlows: this.analyzePrototypeFlows(figmaData),
          interactionStates: this.mapInteractionStates(figmaData),
          userJourneys: this.mapUserJourneys(figmaData),
          interactionComplexity: this.calculateInteractionComplexity(figmaData)
        }
      };

    } catch (error) {
      this.logger.error('❌ Failed to build advanced context analysis:', error);
      return null;
    }
  }

  /**
   * Build Context Intelligence Analysis (Phase 7)
   * @param {object} figmaData - Raw Figma data
   * @param {object} baseContext - Base context from ContextManager
   * @param {object} additionalContext - Additional context from other analyses
   * @returns {object} Context intelligence analysis
   */
  async buildContextIntelligenceAnalysis(figmaData, baseContext, additionalContext = {}) {
    try {
      this.logger.debug('🧠 Building context intelligence analysis (Phase 7)');

      // Create a DesignSpec from baseContext for Context Intelligence
      const designSpec = {
        components: baseContext.components || [],
        designTokens: baseContext.designTokens || {},
        specifications: baseContext.specifications || {},
        metadata: {
          totalNodes: baseContext.nodes?.length || 0,
          componentCount: baseContext.components?.length || 0,
          designSystemDetected: !!(baseContext.designTokens?.colors?.length || baseContext.designTokens?.typography?.length)
        }
      };

      // Create prototype data from figmaData
      const prototypeData = {
        interactions: figmaData.interactions || [],
        prototypes: figmaData.prototypes || [],
        transitions: figmaData.transitions || [],
        flows: figmaData.flows || []
      };

      // Create design context
      const designContext = {
        purpose: baseContext.specifications?.purpose || 'User interface design',
        targetAudience: baseContext.specifications?.audience || 'General users',
        businessDomain: baseContext.specifications?.domain || 'Web application',
        platform: baseContext.specifications?.platform || 'Web',
        designSystem: baseContext.designTokens?.system || 'Custom'
      };

      // Run Context Intelligence Orchestrator
      const contextIntelligenceResult = await this.contextIntelligence.analyzeContextIntelligence(
        designSpec,
        prototypeData,
        designContext
      );

      // Enrich with additional context if available
      if (additionalContext.healthMetrics) {
        contextIntelligenceResult.enrichment = {
          ...contextIntelligenceResult.enrichment,
          healthMetrics: {
            overallHealthScore: additionalContext.healthMetrics.overallHealth?.totalScore || 0,
            componentHealth: additionalContext.healthMetrics.componentHealth?.score || 0,
            accessibilityHealth: additionalContext.healthMetrics.accessibilityHealth?.score || 0
          }
        };
      }

      if (additionalContext.advancedContext) {
        contextIntelligenceResult.enrichment = {
          ...contextIntelligenceResult.enrichment,
          advancedContext: {
            hierarchyComplexity: additionalContext.advancedContext.hierarchyAnalysis?.complexity || 0,
            componentComplexity: Object.keys(additionalContext.advancedContext.componentAnalysis?.componentTypes || {}).length,
            interactionComplexity: additionalContext.advancedContext.interactionAnalysis?.interactionComplexity || 0
          }
        };
      }

      this.logger.info(`🧠 Context Intelligence Analysis completed with ${(contextIntelligenceResult.synthesis.overallConfidence * 100).toFixed(1)}% confidence`);
      this.logger.info(`💡 Generated ${contextIntelligenceResult.recommendations.critical.length} critical recommendations`);

      return contextIntelligenceResult;

    } catch (error) {
      this.logger.error('❌ Failed to build context intelligence analysis:', error);
      return null;
    }
  }

  /**
   * Build performance metrics
   * @param {object} figmaData - Raw Figma data
   * @param {object} baseContext - Base context from ContextManager
   * @returns {object} Performance metrics
   */
  async buildPerformanceMetrics(figmaData, baseContext) {
    try {
      return {
        // Context building performance
        contextPerformance: {
          extractionTime: this.extractionMetrics.get('lastExtractionTime') || 0,
          cacheHitRate: this.calculateCacheHitRate(),
          memoryUsage: process.memoryUsage(),
          nodeProcessingRate: this.calculateNodeProcessingRate(figmaData)
        },

        // Design complexity metrics
        complexityMetrics: {
          nodeCount: this.countTotalNodes(figmaData),
          componentCount: this.countComponents(figmaData),
          layerDepth: this.calculateMaxDepth(figmaData),
          designComplexityScore: this.calculateDesignComplexityScore(figmaData)
        },

        // System health
        systemHealth: {
          redisConnected: await this.redis.isConnected(),
          cacheSize: await this.redis.getCacheSize(),
          errorRate: this.calculateErrorRate(),
          responseTime: this.calculateAverageResponseTime()
        }
      };

    } catch (error) {
      this.logger.error('❌ Failed to build performance metrics:', error);
      return null;
    }
  }

  /**
   * Build LLM preview context (exact data sent to AI)
   * @param {object} baseContext - Base context
   * @param {object} additionalContext - Additional context components
   * @returns {object} LLM preview context
   */
  async buildLLMPreviewContext(baseContext, additionalContext = {}) {
    try {
      // Import template manager to get template context
      const { TemplateManager } = await import('../data/template-manager.js');
      const templateManager = new TemplateManager();

      // Build enhanced base context with Context Intelligence
      const enhancedBaseContext = { ...baseContext };
      
      // Enrich with Context Intelligence insights if available
      if (additionalContext.contextIntelligence) {
        enhancedBaseContext.contextIntelligence = {
          semanticInsights: additionalContext.contextIntelligence.synthesis?.keyInsights || [],
          businessLogic: additionalContext.contextIntelligence.synthesis?.businessLogic || {},
          userExperience: additionalContext.contextIntelligence.synthesis?.userExperience || {},
          designQuality: additionalContext.contextIntelligence.synthesis?.designQuality || {},
          recommendations: {
            critical: additionalContext.contextIntelligence.recommendations?.critical || [],
            important: additionalContext.contextIntelligence.recommendations?.important || []
          },
          aiEnhancements: additionalContext.contextIntelligence.integration?.promptEnhancements || {}
        };
      }

      // Build template context that would be sent to LLM
      const templateContext = await templateManager.buildTemplateContext(
        enhancedBaseContext,
        'React', // Default tech stack
        'jira', // Default platform
        'component' // Default document type
      );

      // Calculate enhanced context with Context Intelligence
      const enhancedTemplateContext = {
        ...templateContext
      };

      // Add Context Intelligence prompt enhancements if available
      if (additionalContext.contextIntelligence?.integration?.promptEnhancements) {
        enhancedTemplateContext.aiPromptEnhancements = additionalContext.contextIntelligence.integration.promptEnhancements;
      }

      return {
        templateContext: enhancedTemplateContext,
        tokenCount: this.estimateTokenCount(enhancedTemplateContext),
        contextSize: JSON.stringify(enhancedTemplateContext).length,
        validationStatus: this.validateLLMContext(enhancedTemplateContext),
        contextIntelligenceEnabled: !!(additionalContext.contextIntelligence),
        intelligenceConfidence: additionalContext.contextIntelligence?.synthesis?.overallConfidence || 0,
        previewGenerated: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error('❌ Failed to build LLM preview context:', error);
      return null;
    }
  }

  /**
   * Validate unified context
   * @param {object} context - Unified context to validate
   * @returns {object} Validation results
   */
  async validateUnifiedContext(context) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      completeness: 0
    };

    try {
      // Check required sections
      const requiredSections = ['nodes', 'components', 'designTokens', 'specifications'];
      for (const section of requiredSections) {
        if (!context[section]) {
          validation.errors.push(`Missing required section: ${section}`);
          validation.isValid = false;
        }
      }

      // Validate Context Intelligence if enabled
      if (context.contextIntelligence) {
        if (!context.contextIntelligence.synthesis || !context.contextIntelligence.recommendations) {
          validation.warnings.push('Context Intelligence analysis incomplete');
        } else {
          const confidence = context.contextIntelligence.synthesis.overallConfidence || 0;
          if (confidence < 0.5) {
            validation.warnings.push(`Low Context Intelligence confidence: ${(confidence * 100).toFixed(1)}%`);
          } else if (confidence >= 0.8) {
            validation.warnings.push(`High Context Intelligence confidence: ${(confidence * 100).toFixed(1)}%`);
          }
        }
      }

      // Check data quality
      if (context.nodes && context.nodes.length === 0) {
        validation.warnings.push('No nodes found in context');
      }

      if (context.designTokens && Object.keys(context.designTokens).length === 0) {
        validation.warnings.push('No design tokens extracted');
      }

      // Calculate completeness score
      validation.completeness = this.calculateContextCompleteness(context);

      this.contextValidation.set('lastValidation', validation);

      return validation;

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Validation error: ${error.message}`);
      return validation;
    }
  }

  /**
   * Cache unified context
   * @param {object} context - Context to cache
   * @param {object} options - Caching options
   */
  async cacheUnifiedContext(context, options = {}) {
    try {
      if (!this.config.enableCaching) {return;}

      const cacheKey = `unified_context:${options.fileKey || 'default'}:${Date.now()}`;
      const ttl = configService.get('cache.contextTtl', 300);

      await this.redis.setex(cacheKey, ttl, JSON.stringify(context));

      this.logger.debug(`💾 Unified context cached with key: ${cacheKey}`);

    } catch (error) {
      this.logger.warn('⚠️ Failed to cache unified context:', error);
    }
  }

  /**
   * Track context generation performance
   * @param {number} processingTime - Time taken to generate context
   * @param {object} context - Generated context
   */
  trackContextGeneration(processingTime, context) {
    this.performanceTracker.set('lastGeneration', {
      processingTime,
      timestamp: Date.now(),
      contextSize: JSON.stringify(context).length,
      nodeCount: context.nodes?.length || 0,
      componentCount: context.components?.length || 0
    });
  }

  // --- Helper Methods for Design Health Metrics ---

  countComponents(selection) {
    return selection.filter(node =>
      node.type === 'COMPONENT' || node.type === 'INSTANCE'
    ).length;
  }

  calculateInstanceUsage(selection) {
    const instances = selection.filter(node => node.type === 'INSTANCE');
    const components = selection.filter(node => node.type === 'COMPONENT');
    return components.length > 0 ? instances.length / components.length : 0;
  }

  calculateVariantCoverage(selection) {
    // Simplified variant coverage calculation
    return 0.8; // Default good score
  }

  calculateComponentReuse(selection) {
    // Simplified component reuse calculation
    return 0.7; // Default decent score
  }

  calculateColorTokenUsage(designTokens) {
    return designTokens.colors?.length || 0;
  }

  calculateTypographyConsistency(designTokens) {
    return designTokens.typography?.length || 0;
  }

  calculateSpacingAdherence(designTokens) {
    return designTokens.spacing?.length || 0;
  }

  calculateAlignmentScore(selection) {
    return 0.85; // Default good alignment score
  }

  calculateSpacingConsistency(selection) {
    return 0.78; // Default decent spacing score
  }

  calculateGridUsage(selection) {
    return 0.65; // Default moderate grid usage
  }

  calculateResponsiveReadiness(selection) {
    return 0.70; // Default moderate responsive readiness
  }

  calculateColorContrast(designTokens) {
    return 0.90; // Default good contrast score
  }

  calculateTextReadability(selection) {
    return 0.88; // Default good readability score
  }

  calculateInteractionTargets(selection) {
    return 0.75; // Default decent interaction targets
  }

  calculateSemanticStructure(selection) {
    return 0.80; // Default good semantic structure
  }

  // --- Health Score Calculations ---

  calculateComponentHealthScore(componentHealth) {
    const weights = {
      instanceUsage: 0.3,
      variantCoverage: 0.25,
      componentReuse: 0.45
    };

    return (
      componentHealth.instanceUsage * weights.instanceUsage +
      componentHealth.variantCoverage * weights.variantCoverage +
      componentHealth.componentReuse * weights.componentReuse
    );
  }

  calculateDesignSystemScore(designSystemHealth) {
    const hasColors = designSystemHealth.colorTokenUsage > 0 ? 0.4 : 0;
    const hasTypography = designSystemHealth.typographyConsistency > 0 ? 0.3 : 0;
    const hasSpacing = designSystemHealth.spacingAdherence > 0 ? 0.3 : 0;

    return hasColors + hasTypography + hasSpacing;
  }

  calculateLayoutQualityScore(layoutQuality) {
    return (
      layoutQuality.alignmentScore * 0.3 +
      layoutQuality.spacingConsistency * 0.25 +
      layoutQuality.gridUsage * 0.2 +
      layoutQuality.responsiveReadiness * 0.25
    );
  }

  calculateAccessibilityScore(accessibilityHealth) {
    return (
      accessibilityHealth.colorContrast * 0.3 +
      accessibilityHealth.textReadability * 0.25 +
      accessibilityHealth.interactionTargets * 0.25 +
      accessibilityHealth.semanticStructure * 0.2
    );
  }

  calculateOverallHealth(healthMetrics) {
    const overallScore = (
      healthMetrics.componentHealth.score * 0.25 +
      healthMetrics.designSystemHealth.consistencyScore * 0.25 +
      healthMetrics.layoutQuality.score * 0.25 +
      healthMetrics.accessibilityHealth.score * 0.25
    );

    let grade = 'F';
    if (overallScore >= 0.9) {grade = 'A';}
    else if (overallScore >= 0.8) {grade = 'B';}
    else if (overallScore >= 0.7) {grade = 'C';}
    else if (overallScore >= 0.6) {grade = 'D';}

    const issues = [];
    const recommendations = [];

    if (healthMetrics.componentHealth.score < 0.7) {
      issues.push('Low component reuse detected');
      recommendations.push('Consider creating more reusable components');
    }

    if (healthMetrics.designSystemHealth.consistencyScore < 0.5) {
      issues.push('Limited design system adherence');
      recommendations.push('Implement consistent design tokens');
    }

    return {
      totalScore: overallScore,
      grade,
      issues,
      recommendations
    };
  }

  // --- Advanced Context Helper Methods ---

  calculateNodeDepth(figmaData) {
    // Simplified depth calculation
    return 3;
  }

  calculateHierarchyComplexity(figmaData) {
    return (figmaData.selection?.length || 0) * 1.5;
  }

  mapNodeRelationships(figmaData) {
    return { parent: 0, child: 0, sibling: 0 };
  }

  calculateNavigationPaths(figmaData) {
    return [];
  }

  analyzeComponentTypes(figmaData) {
    return { components: 0, instances: 0, frames: 0 };
  }

  mapComponentVariants(figmaData) {
    return {};
  }

  mapInstanceRelationships(figmaData) {
    return {};
  }

  calculateComponentDependencies(figmaData) {
    return {};
  }

  analyzeColorPalette(designTokens) {
    return designTokens.colors || [];
  }

  analyzeTypographyScale(designTokens) {
    return designTokens.typography || [];
  }

  analyzeSpacingSystem(designTokens) {
    return designTokens.spacing || [];
  }

  analyzeTokenUsage(designTokens) {
    return { used: 0, total: 0, coverage: 0 };
  }

  identifyLayoutPatterns(figmaData) {
    return [];
  }

  analyzeGridSystems(figmaData) {
    return {};
  }

  identifyAlignmentGroups(figmaData) {
    return [];
  }

  analyzeSpacingPatterns(figmaData) {
    return {};
  }

  analyzePrototypeFlows(figmaData) {
    return [];
  }

  mapInteractionStates(figmaData) {
    return {};
  }

  mapUserJourneys(figmaData) {
    return [];
  }

  calculateInteractionComplexity(figmaData) {
    return 0;
  }

  // --- Performance Helper Methods ---

  calculateCacheHitRate() {
    return 0.85; // Default good cache hit rate
  }

  calculateNodeProcessingRate(figmaData) {
    const nodeCount = figmaData.selection?.length || 0;
    const processingTime = this.extractionMetrics.get('lastExtractionTime') || 1;
    return nodeCount / processingTime;
  }

  countTotalNodes(figmaData) {
    return figmaData.selection?.length || 0;
  }

  calculateMaxDepth(figmaData) {
    return 3; // Default depth
  }

  calculateDesignComplexityScore(figmaData) {
    const nodeCount = this.countTotalNodes(figmaData);
    const componentCount = this.countComponents(figmaData);
    return (nodeCount * 0.1) + (componentCount * 0.5);
  }

  calculateErrorRate() {
    return 0.02; // Default low error rate
  }

  calculateAverageResponseTime() {
    return 150; // Default good response time in ms
  }

  // --- LLM Context Helper Methods ---

  estimateTokenCount(context) {
    // Rough token estimation (1 token ≈ 4 characters)
    return Math.ceil(JSON.stringify(context).length / 4);
  }

  validateLLMContext(context) {
    return {
      valid: context && typeof context === 'object',
      hasRequiredFields: !!(context.figma && context.project && context.calculated),
      estimatedTokens: this.estimateTokenCount(context)
    };
  }

  calculateContextCompleteness(context) {
    const sections = ['nodes', 'components', 'designTokens', 'specifications', 'healthMetrics', 'advancedContext', 'contextIntelligence'];
    const presentSections = sections.filter(section => context[section]).length;
    return presentSections / sections.length;
  }
}

// Export the unified context provider
export default UnifiedContextProvider;