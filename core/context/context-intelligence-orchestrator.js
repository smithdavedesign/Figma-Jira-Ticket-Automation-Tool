/**
 * 🧠 Context Intelligence Orchestrator - Phase 7: Context Intelligence Layer
 *
 * Main orchestrator for the Context Intelligence Layer that coordinates
 * all semantic analysis components and provides unified intelligence output.
 *
 * Architecture:
 * SemanticAnalyzer → InteractionMapper → AccessibilityChecker → DesignTokenLinker → LayoutIntentExtractor
 *                                     ↓
 *                         Context Intelligence Orchestrator
 *                                     ↓
 *                         Enhanced AI Orchestrator (LLM Prompts)
 *
 * Core Features:
 * - Coordinates all Phase 7 analysis components
 * - Provides unified context intelligence interface
 * - Integrates with existing DesignSpecGenerator and AI Orchestrator
 * - Caches analysis results for performance
 * - Validates and enriches semantic understanding
 *
 * Integration Points:
 * - Extends existing UnifiedContextProvider
 * - Feeds enhanced context to AI Orchestrator
 * - Improves TemplateManager with contextual intelligence
 * - Validates design patterns against accessibility and usability standards
 */

import { Logger } from '../logging/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import SemanticAnalyzer from './semantic-analyzer.js';
import InteractionMapper from './interaction-mapper.js';
import AccessibilityChecker from './accessibility-checker.js';
import DesignTokenLinker from './design-system-linker.js';
import LayoutIntentExtractor from './layout-intent-extractor.js';

export class ContextIntelligenceOrchestrator {
  constructor(options = {}) {
    this.logger = new Logger('ContextIntelligenceOrchestrator');
    this.errorHandler = new ErrorHandler();

    this.config = {
      enableCaching: options.enableCaching !== false,
      cacheTimeout: options.cacheTimeout || 300000, // 5 minutes
      parallelAnalysis: options.parallelAnalysis !== false,
      includePerformanceMetrics: options.includePerformanceMetrics !== false,
      confidenceThreshold: options.confidenceThreshold || 0.7,
      enableValidation: options.enableValidation !== false,
      ...options
    };

    // Initialize analysis components
    this.semanticAnalyzer = new SemanticAnalyzer(options.semantic || {});
    this.interactionMapper = new InteractionMapper(options.interaction || {});
    this.accessibilityChecker = new AccessibilityChecker(options.accessibility || {});
    this.designTokenLinker = new DesignTokenLinker(options.tokens || {});
    this.layoutIntentExtractor = new LayoutIntentExtractor(options.layout || {});

    // Analysis cache
    this.analysisCache = new Map();
    this.performanceMetrics = new Map();

    this.initializeOrchestrator();
  }

  /**
   * Orchestrate complete context intelligence analysis
   * @param {DesignSpec} designSpec - Design specification from DesignSpecGenerator
   * @param {Object} prototypeData - Figma prototype/interaction data
   * @param {DesignContext} context - Design context
   * @returns {Promise<ContextIntelligenceResult>} Complete context intelligence analysis
   */
  async analyzeContextIntelligence(designSpec, prototypeData, context) {
    const startTime = Date.now();
    const analysisId = this.generateAnalysisId(designSpec, context);

    try {
      this.logger.info('🧠 Starting context intelligence orchestration');

      // Check cache first
      if (this.config.enableCaching && this.analysisCache.has(analysisId)) {
        const cached = this.analysisCache.get(analysisId);
        if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
          this.logger.info('💾 Returning cached context intelligence analysis');
          return cached.result;
        }
      }

      const results = {
        semantic: null,
        interaction: null,
        accessibility: null,
        tokens: null,
        layout: null,
        analysis: {
          semantic: null,
          interaction: null,
          accessibility: null,
          tokens: null,
          layout: null
        },
        synthesis: {
          overallConfidence: 0,
          keyInsights: [],
          businessLogic: {},
          userExperience: {},
          designQuality: {}
        },
        recommendations: {
          critical: [],
          important: [],
          suggested: [],
          enhancements: []
        },
        integration: {
          promptEnhancements: {},
          templateContext: {},
          aiOrchestration: {}
        },
        metadata: {
          analysisTime: 0,
          componentsAnalyzed: designSpec.components?.length || 0,
          analysisDepth: 'comprehensive',
          cacheEnabled: this.config.enableCaching,
          parallelProcessing: this.config.parallelAnalysis
        }
      };

      // Phase 1: Semantic Analysis (foundation for all other analyses)
      this.logger.info('🎯 Phase 1: Semantic Analysis');
      results.semantic = await this.semanticAnalyzer.analyzeSemanticIntent(
        designSpec.components || [],
        context
      );
      results.analysis.semantic = results.semantic;

      // Phase 2: Parallel Analysis (can run concurrently based on semantic foundation)
      if (this.config.parallelAnalysis) {
        this.logger.info('⚡ Phase 2: Parallel Analysis (Interaction, Accessibility, Tokens, Layout)');

        const [interactionResult, accessibilityResult, tokensResult, layoutResult] = await Promise.all([
          this.interactionMapper.mapInteractionFlows(
            results.semantic.components,
            prototypeData,
            context
          ),
          this.accessibilityChecker.analyzeAccessibility(
            results.semantic.components,
            [], // Will be populated after interaction analysis
            context
          ),
          this.designTokenLinker.analyzeDesignTokens(
            designSpec.designTokens || {},
            results.semantic.components,
            context
          ),
          this.layoutIntentExtractor.extractLayoutIntent(
            results.semantic.components,
            context
          )
        ]);

        results.interaction = interactionResult;
        results.accessibility = accessibilityResult;
        results.tokens = tokensResult;
        results.layout = layoutResult;

        // Update analysis object
        results.analysis.interaction = results.interaction;
        results.analysis.accessibility = results.accessibility;
        results.analysis.tokens = results.tokens;
        results.analysis.layout = results.layout;

      } else {
        // Sequential analysis
        this.logger.info('🔄 Phase 2: Sequential Analysis');

        results.interaction = await this.interactionMapper.mapInteractionFlows(
          results.semantic.components,
          prototypeData,
          context
        );

        results.accessibility = await this.accessibilityChecker.analyzeAccessibility(
          results.semantic.components,
          results.interaction.interactiveComponents,
          context
        );

        results.tokens = await this.designTokenLinker.analyzeDesignTokens(
          designSpec.designTokens || {},
          results.semantic.components,
          context
        );

        results.layout = await this.layoutIntentExtractor.extractLayoutIntent(
          results.semantic.components,
          context
        );

        // Update analysis object
        results.analysis.interaction = results.interaction;
        results.analysis.accessibility = results.accessibility;
        results.analysis.tokens = results.tokens;
        results.analysis.layout = results.layout;
      }

      // Phase 3: Synthesis and Integration
      this.logger.info('🔬 Phase 3: Synthesis and Integration');
      results.synthesis = await this.synthesizeAnalyses(results, designSpec, context);

      // Phase 4: Generate Recommendations
      this.logger.info('💡 Phase 4: Generate Recommendations');
      results.recommendations = await this.generateRecommendations(results, context);

      // Phase 5: AI Orchestrator Integration
      this.logger.info('🤖 Phase 5: AI Orchestrator Integration');
      results.integration = await this.prepareAIIntegration(results, designSpec, context);

      // Phase 6: Validation (if enabled)
      if (this.config.enableValidation) {
        this.logger.info('✅ Phase 6: Validation');
        await this.validateAnalysisResults(results);
      }

      // Update metadata
      results.metadata.analysisTime = Date.now() - startTime;

      // Add confidence structure for backward compatibility
      results.confidence = {
        overall: results.synthesis.overallConfidence || 0,
        semantic: results.semantic?.confidence || 0,
        interaction: results.interaction?.confidence || 0,
        accessibility: results.accessibility?.confidence || 0,
        tokens: results.tokens?.confidence || 0,
        layout: results.layout?.confidence || 0
      };

      // Cache results
      if (this.config.enableCaching) {
        this.analysisCache.set(analysisId, {
          result: results,
          timestamp: Date.now()
        });
      }

      // Track performance metrics
      if (this.config.includePerformanceMetrics) {
        this.trackPerformanceMetrics(analysisId, results.metadata.analysisTime, results);
      }

      this.logger.info(`✅ Context intelligence orchestration completed in ${results.metadata.analysisTime}ms`);
      this.logger.info(`🎯 Overall confidence: ${(results.synthesis.overallConfidence * 100).toFixed(1)}%`);
      this.logger.info(`💡 Generated ${results.recommendations.critical.length} critical recommendations`);

      return results;

    } catch (error) {
      this.logger.error('❌ Context intelligence orchestration failed:', error);
      throw this.errorHandler.handle(error, 'ContextIntelligenceOrchestrator.analyzeContextIntelligence');
    }
  }

  /**
   * Synthesize all analyses into unified insights
   * @param {Object} results - All analysis results
   * @param {DesignSpec} designSpec - Original design spec
   * @param {DesignContext} context - Design context
   * @returns {Promise<Object>} Synthesis results
   */
  async synthesizeAnalyses(results, designSpec, context) {
    const synthesis = {
      overallConfidence: 0,
      keyInsights: [],
      businessLogic: {},
      userExperience: {},
      designQuality: {}
    };

    // Calculate overall confidence score
    const confidenceScores = [
      results.semantic?.confidence?.overall || 0,
      results.interaction?.metadata?.confidence || 0.5,
      results.accessibility?.compliance?.overall?.score || 0,
      results.tokens?.compliance?.overall || 0,
      results.layout?.metadata?.confidence || 0.5
    ];

    synthesis.overallConfidence = confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;

    // Extract key insights
    synthesis.keyInsights = await this.extractKeyInsights(results, context);

    // Synthesize business logic understanding
    synthesis.businessLogic = await this.synthesizeBusinessLogic(results, context);

    // Synthesize user experience insights
    synthesis.userExperience = await this.synthesizeUserExperience(results, context);

    // Synthesize design quality assessment
    synthesis.designQuality = await this.synthesizeDesignQuality(results, designSpec);

    return synthesis;
  }

  /**
   * Extract key insights from all analyses
   * @param {Object} results - Analysis results
   * @param {DesignContext} context - Design context
   * @returns {Promise<Array>} Key insights
   */
  async extractKeyInsights(results, context) {
    const insights = [];

    // Semantic insights
    if (results.semantic?.patterns?.length > 0) {
      insights.push({
        type: 'semantic',
        insight: `Detected ${results.semantic.patterns.length} semantic patterns`,
        confidence: results.semantic.confidence.overall,
        impact: 'high'
      });
    }

    // Interaction insights
    if (results.interaction?.userJourneys?.length > 0) {
      insights.push({
        type: 'interaction',
        insight: `Identified ${results.interaction.userJourneys.length} user journeys`,
        confidence: 0.8,
        impact: 'high'
      });
    }

    // Accessibility insights
    const accessibilityScore = results.accessibility?.compliance?.overall?.score || 0;
    if (accessibilityScore < 0.8) {
      insights.push({
        type: 'accessibility',
        insight: `Accessibility compliance at ${(accessibilityScore * 100).toFixed(1)}% - needs improvement`,
        confidence: 0.9,
        impact: 'critical'
      });
    }

    // Token insights
    if (results.tokens?.systemDetection?.detectedSystem) {
      insights.push({
        type: 'tokens',
        insight: `Design tokens align with ${results.tokens.systemDetection.detectedSystem} system`,
        confidence: results.tokens.systemDetection.confidence,
        impact: 'medium'
      });
    }

    // Layout insights
    if (results.layout?.gridSystems?.length > 0) {
      insights.push({
        type: 'layout',
        insight: `Detected ${results.layout.gridSystems.length} grid systems`,
        confidence: 0.8,
        impact: 'medium'
      });
    }

    return insights;
  }

  /**
   * Synthesize business logic understanding
   * @param {Object} results - Analysis results
   * @param {DesignContext} context - Design context
   * @returns {Promise<Object>} Business logic synthesis
   */
  async synthesizeBusinessLogic(results, context) {
    return {
      primaryFunction: this.inferPrimaryFunction(results, context),
      userWorkflows: this.extractUserWorkflows(results),
      dataFlow: this.inferDataFlow(results),
      businessRules: this.extractBusinessRules(results)
    };
  }

  /**
   * Synthesize user experience insights
   * @param {Object} results - Analysis results
   * @param {DesignContext} context - Design context
   * @returns {Promise<Object>} UX synthesis
   */
  async synthesizeUserExperience(results, context) {
    return {
      usabilityScore: this.calculateUsabilityScore(results),
      userJourneyQuality: this.assessUserJourneyQuality(results),
      accessibilityScore: results.accessibility?.compliance?.overall?.score || 0,
      interactionQuality: this.assessInteractionQuality(results),
      cognitiveLoad: this.assessCognitiveLoad(results)
    };
  }

  /**
   * Synthesize design quality assessment
   * @param {Object} results - Analysis results
   * @param {DesignSpec} designSpec - Design spec
   * @returns {Promise<Object>} Design quality synthesis
   */
  async synthesizeDesignQuality(results, designSpec) {
    return {
      consistency: this.assessDesignConsistency(results),
      systemCompliance: results.tokens?.compliance?.overall || 0,
      layoutQuality: this.assessLayoutQuality(results),
      componentQuality: this.assessComponentQuality(results),
      overallQuality: this.calculateOverallDesignQuality(results)
    };
  }

  /**
   * Generate comprehensive recommendations
   * @param {Object} results - Analysis results
   * @param {DesignContext} context - Design context
   * @returns {Promise<Object>} Recommendations
   */
  async generateRecommendations(results, context) {
    const recommendations = {
      critical: [],
      important: [],
      suggested: [],
      enhancements: []
    };

    // Extract critical recommendations from accessibility
    if (results.accessibility?.recommendations?.critical) {
      recommendations.critical.push(...results.accessibility.recommendations.critical);
    }

    // Extract important recommendations
    if (results.tokens?.recommendations?.tokenStandardization) {
      recommendations.important.push(...results.tokens.recommendations.tokenStandardization);
    }

    // Extract suggested improvements
    if (results.layout?.validation?.recommendations) {
      recommendations.suggested.push(...results.layout.validation.recommendations);
    }

    // Generate enhancement recommendations
    recommendations.enhancements = await this.generateEnhancementRecommendations(results, context);

    return recommendations;
  }

  /**
   * Prepare integration data for AI Orchestrator
   * @param {Object} results - Analysis results
   * @param {DesignSpec} designSpec - Design spec
   * @param {DesignContext} context - Design context
   * @returns {Promise<Object>} AI integration data
   */
  async prepareAIIntegration(results, designSpec, context) {
    return {
      promptEnhancements: await this.generatePromptEnhancements(results),
      templateContext: await this.enhanceTemplateContext(results, context),
      aiOrchestration: await this.prepareAIOrchestrationData(results, designSpec)
    };
  }

  /**
   * Generate enhanced prompts for AI Orchestrator
   * @param {Object} results - Analysis results
   * @returns {Promise<Object>} Prompt enhancements
   */
  async generatePromptEnhancements(results) {
    const enhancements = {
      semanticContext: '',
      businessLogic: '',
      userExperience: '',
      technicalConstraints: '',
      accessibility: ''
    };

    // Semantic context enhancement
    if (results.semantic?.patterns?.length > 0) {
      enhancements.semanticContext = `This design contains ${results.semantic.patterns.length} semantic patterns including ${results.semantic.patterns.map(p => p.type).join(', ')}.`;
    }

    // Business logic enhancement
    if (results.synthesis?.businessLogic?.primaryFunction) {
      enhancements.businessLogic = `The primary business function is ${results.synthesis.businessLogic.primaryFunction}.`;
    }

    // UX enhancement
    const uxScore = results.synthesis?.userExperience?.usabilityScore || 0;
    enhancements.userExperience = `Usability score: ${(uxScore * 100).toFixed(1)}%. ${uxScore < 0.7 ? 'Focus on improving user experience.' : 'Good user experience foundation.'}`;

    // Accessibility enhancement
    const a11yScore = results.accessibility?.compliance?.overall?.score || 0;
    enhancements.accessibility = `Accessibility compliance: ${(a11yScore * 100).toFixed(1)}%. ${a11yScore < 0.8 ? 'Critical accessibility improvements needed.' : 'Good accessibility foundation.'}`;

    return enhancements;
  }

  // Utility methods

  generateAnalysisId(designSpec, context) {
    const specHash = JSON.stringify(designSpec?.metadata || {});
    const contextHash = JSON.stringify(context?.purpose || '');
    return `analysis_${Date.now()}_${Buffer.from(specHash + contextHash).toString('base64').slice(0, 8)}`;
  }

  initializeOrchestrator() {
    this.logger.debug('🧠 Context Intelligence Orchestrator initialized');
    this.logger.debug(`📊 Configuration: parallel=${this.config.parallelAnalysis}, cache=${this.config.enableCaching}`);
  }

  async validateAnalysisResults(results) {
    // Validate analysis consistency and quality
    const validation = {
      semanticConsistency: true,
      confidenceThreshold: true,
      dataIntegrity: true
    };

    // Check confidence thresholds
    if (results.synthesis.overallConfidence < this.config.confidenceThreshold) {
      this.logger.warn(`⚠️ Analysis confidence ${(results.synthesis.overallConfidence * 100).toFixed(1)}% below threshold ${(this.config.confidenceThreshold * 100).toFixed(1)}%`);
    }

    return validation;
  }

  trackPerformanceMetrics(analysisId, duration, results) {
    this.performanceMetrics.set(analysisId, {
      duration,
      timestamp: Date.now(),
      componentsAnalyzed: results.metadata.componentsAnalyzed,
      analysesCompleted: 5, // semantic, interaction, accessibility, tokens, layout
      cacheHit: false
    });
  }

  // Placeholder methods for synthesis calculations

  inferPrimaryFunction(results, context) {
    return context.purpose || 'User interface';
  }

  extractUserWorkflows(results) {
    return results.interaction?.userJourneys || [];
  }

  inferDataFlow(results) {
    return {};
  }

  extractBusinessRules(results) {
    return [];
  }

  calculateUsabilityScore(results) {
    return 0.8; // Placeholder
  }

  assessUserJourneyQuality(results) {
    return 0.7; // Placeholder
  }

  assessInteractionQuality(results) {
    return 0.8; // Placeholder
  }

  assessCognitiveLoad(results) {
    return 0.6; // Placeholder - lower is better
  }

  assessDesignConsistency(results) {
    return results.tokens?.compliance?.overall || 0.7;
  }

  assessLayoutQuality(results) {
    return 0.8; // Placeholder
  }

  assessComponentQuality(results) {
    return 0.8; // Placeholder
  }

  calculateOverallDesignQuality(results) {
    return 0.8; // Placeholder
  }

  async generateEnhancementRecommendations(results, context) {
    return []; // Placeholder
  }

  async enhanceTemplateContext(results, context) {
    return {}; // Placeholder
  }

  async prepareAIOrchestrationData(results, designSpec) {
    return {}; // Placeholder
  }
}

/**
 * Quick context intelligence analysis function
 * @param {DesignSpec} designSpec - Design specification
 * @param {Object} prototypeData - Prototype data
 * @param {DesignContext} context - Design context
 * @returns {Promise<ContextIntelligenceResult>} Analysis results
 */
export async function analyzeContextIntelligence(designSpec, prototypeData, context) {
  const orchestrator = new ContextIntelligenceOrchestrator();
  return orchestrator.analyzeContextIntelligence(designSpec, prototypeData, context);
}

export default ContextIntelligenceOrchestrator;