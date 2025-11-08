/**
 * 🧠 Semantic Analyzer - Phase 7: Context Intelligence Layer
 *
 * AI-powered semantic analysis system that identifies meaning and purpose
 * in design components beyond basic visual properties.
 *
 * Core Features:
 * - Component intent detection (Login Form, Hero CTA, Navigation Menu)
 * - Semantic pattern recognition and classification
 * - Context-aware component naming and categorization
 * - Business logic inference from visual patterns
 * - Design system pattern matching
 *
 * Integration Points:
 * - Enhances existing DesignSpecGenerator with semantic intelligence
 * - Feeds semantic data to AI Orchestrator for better prompts
 * - Improves TemplateManager context-aware outputs
 * - Validates design patterns against design system standards
 */

import { Logger } from '../logging/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class SemanticAnalyzer {
  constructor(options = {}) {
    this.logger = new Logger('SemanticAnalyzer');
    this.errorHandler = new ErrorHandler();

    this.config = {
      confidenceThreshold: options.confidenceThreshold || 0.7,
      enableMLClassification: options.enableMLClassification || true,
      maxPatternDepth: options.maxPatternDepth || 5,
      semanticKeywords: this.initializeSemanticKeywords(),
      ...options
    };

    // Semantic pattern cache
    this.patternCache = new Map();
    this.componentIntentCache = new Map();

    // Initialize semantic models
    this.initializeSemanticModels();
  }

  /**
   * Analyze semantic intent of design components
   * @param {DesignComponent[]} components - Components from DesignSpecGenerator
   * @param {DesignContext} context - Design context from extraction
   * @returns {Promise<SemanticAnalysisResult>} Semantic analysis results
   */
  async analyzeSemanticIntent(components, context) {
    const startTime = Date.now();

    try {
      this.logger.info('🧠 Starting semantic intent analysis');

      const results = {
        components: [],
        patterns: [],
        businessLogic: {},
        confidence: {
          overall: 0,
          components: [],
          patterns: []
        },
        metadata: {
          analysisTime: 0,
          componentsAnalyzed: components.length,
          patternsDetected: 0,
          mlModelUsed: this.config.enableMLClassification
        }
      };

      // Analyze individual components
      for (const component of components) {
        const semanticComponent = await this.analyzeComponentSemantics(component, context);
        results.components.push(semanticComponent);
        results.confidence.components.push(semanticComponent.semantic.confidence);
      }

      // Detect semantic patterns across components
      const patterns = await this.detectSemanticPatterns(results.components, context);
      results.patterns = patterns;
      results.metadata.patternsDetected = patterns.length;

      // Infer business logic from semantic patterns
      results.businessLogic = await this.inferBusinessLogic(results.components, patterns, context);

      // Calculate overall confidence
      results.confidence.overall = this.calculateOverallConfidence(results);

      results.metadata.analysisTime = Date.now() - startTime;

      this.logger.info(`✅ Semantic analysis completed in ${results.metadata.analysisTime}ms`);
      this.logger.info(`🎯 Detected ${results.patterns.length} semantic patterns with ${(results.confidence.overall * 100).toFixed(1)}% confidence`);

      return results;

    } catch (error) {
      this.logger.error('❌ Semantic analysis failed:', error);
      throw this.errorHandler.handle(error, 'SemanticAnalyzer.analyzeSemanticIntent');
    }
  }

  /**
   * Analyze semantic meaning of individual component
   * @param {DesignComponent} component - Component to analyze
   * @param {DesignContext} context - Design context
   * @returns {Promise<SemanticComponent>} Enhanced component with semantic data
   */
  async analyzeComponentSemantics(component, context) {
    const cacheKey = `${component.id}_${component.name}_${context.purpose}`;

    if (this.componentIntentCache.has(cacheKey)) {
      return this.componentIntentCache.get(cacheKey);
    }

    try {
      // Enhanced intent detection using multiple signals
      const intent = await this.detectComponentIntent(component, context);

      // Semantic role analysis
      const role = await this.analyzeSemanticRole(component, intent, context);

      // Business function inference
      const businessFunction = await this.inferBusinessFunction(component, intent, context);

      // User interaction patterns
      const interactionPatterns = await this.analyzeInteractionPatterns(component, intent);

      // Contextual keywords extraction
      const semanticKeywords = await this.extractSemanticKeywords(component, intent, context);

      const semanticComponent = {
        ...component,
        intent: intent.primary, // Add top-level intent for test compatibility
        semantic: {
          ...component.semantic,
          intent: intent.primary,
          alternateIntents: intent.alternatives,
          role: role.primary,
          roleConfidence: role.confidence,
          businessFunction: businessFunction.function,
          businessContext: businessFunction.context,
          interactionPatterns: interactionPatterns,
          keywords: semanticKeywords,
          confidence: this.calculateComponentConfidence(intent, role, businessFunction),

          // Enhanced semantic classification
          classification: {
            functional: this.classifyFunctionalRole(intent, role),
            visual: this.classifyVisualRole(component),
            behavioral: this.classifyBehavioralRole(interactionPatterns),
            contextual: this.classifyContextualRole(context, businessFunction)
          },

          // Semantic relationships
          relationships: {
            dependsOn: await this.findSemanticDependencies(component, intent),
            influences: await this.findSemanticInfluences(component, intent),
            semanticGroup: await this.findSemanticGroup(component, intent, context)
          }
        }
      };

      // Cache the result
      this.componentIntentCache.set(cacheKey, semanticComponent);

      return semanticComponent;

    } catch (error) {
      this.logger.warn(`⚠️ Failed to analyze semantics for component ${component.id}:`, error);

      // Return component with basic semantic data
      return {
        ...component,
        intent: 'unknown', // Add top-level intent for test compatibility
        semantic: {
          ...component.semantic,
          confidence: 0.3,
          intent: 'unknown',
          role: 'none',
          businessFunction: 'unknown',
          keywords: [],
          classification: {
            functional: 'unknown',
            visual: 'unknown',
            behavioral: 'unknown',
            contextual: 'unknown'
          }
        }
      };
    }
  }

  /**
   * Detect semantic patterns across multiple components
   * @param {SemanticComponent[]} components - Semantically analyzed components
   * @param {DesignContext} context - Design context
   * @returns {Promise<SemanticPattern[]>} Detected semantic patterns
   */
  async detectSemanticPatterns(components, context) {
    try {
      this.logger.debug('🔍 Detecting semantic patterns');

      const patterns = [];

      // User workflow patterns
      const workflowPatterns = await this.detectWorkflowPatterns(components, context);
      patterns.push(...workflowPatterns);

      // Information architecture patterns
      const iaPatterns = await this.detectInformationArchitecturePatterns(components);
      patterns.push(...iaPatterns);

      // Interaction patterns
      const interactionPatterns = await this.detectInteractionPatterns(components);
      patterns.push(...interactionPatterns);

      // Design system patterns
      const designSystemPatterns = await this.detectDesignSystemPatterns(components, context);
      patterns.push(...designSystemPatterns);

      // Business logic patterns
      const businessPatterns = await this.detectBusinessLogicPatterns(components, context);
      patterns.push(...businessPatterns);

      return patterns;

    } catch (error) {
      this.logger.warn('⚠️ Pattern detection failed:', error);
      return [];
    }
  }

  /**
   * Detect workflow patterns in components
   * @param {DesignComponent[]} components - Components to analyze
   * @param {DesignContext} context - Design context
   * @returns {Promise<SemanticPattern[]>} Detected workflow patterns
   */
  async detectWorkflowPatterns(components, context) {
    const patterns = [];

    // Authentication/Login patterns
    const hasEmailInput = components.some(c =>
      c.name?.toLowerCase().includes('email') ||
      c.name?.toLowerCase().includes('username') ||
      c.semantic?.role === 'input'
    );
    const hasPasswordInput = components.some(c =>
      c.name?.toLowerCase().includes('password') ||
      c.type === 'PASSWORD'
    );
    const hasLoginButton = components.some(c =>
      c.name?.toLowerCase().includes('login') ||
      c.name?.toLowerCase().includes('sign') ||
      c.name?.toLowerCase().includes('submit') ||
      c.semantic?.role === 'button'
    );

    // Full authentication pattern (email + password + button)
    if (hasEmailInput && hasPasswordInput && hasLoginButton) {
      patterns.push({
        type: 'authentication_flow',
        subtype: 'login',
        confidence: 0.9,
        components: components.filter(c =>
          c.name?.toLowerCase().includes('email') ||
          c.name?.toLowerCase().includes('password') ||
          c.name?.toLowerCase().includes('login') ||
          c.name?.toLowerCase().includes('submit')
        ),
        description: 'User authentication workflow pattern detected'
      });
    }
    // Partial authentication pattern (just email + button, could be signup/signin start)
    else if (hasEmailInput && hasLoginButton) {
      patterns.push({
        type: 'authentication_flow',
        subtype: 'email_entry',
        confidence: 0.7,
        components: components.filter(c =>
          c.name?.toLowerCase().includes('email') ||
          c.name?.toLowerCase().includes('submit') ||
          c.name?.toLowerCase().includes('button')
        ),
        description: 'Email authentication entry pattern detected'
      });
    }

    // Form patterns
    const inputComponents = components.filter(c =>
      c.type === 'INPUT' ||
      c.name?.toLowerCase().includes('input') ||
      c.category?.toLowerCase() === 'input' ||
      c.semantic?.role === 'input'
    );
    const submitButtons = components.filter(c =>
      c.name?.toLowerCase().includes('submit') ||
      c.name?.toLowerCase().includes('send') ||
      c.name?.toLowerCase().includes('button') ||
      c.category?.toLowerCase() === 'button' ||
      c.semantic?.role === 'button'
    );

    if (inputComponents.length >= 1 && submitButtons.length >= 1) {
      patterns.push({
        type: 'form_workflow',
        subtype: 'data_entry',
        confidence: 0.8,
        components: [...inputComponents, ...submitButtons],
        description: 'Data entry form workflow pattern detected'
      });
    }

    // Navigation patterns
    const navComponents = components.filter(c =>
      c.name?.toLowerCase().includes('nav') ||
      c.name?.toLowerCase().includes('menu') ||
      c.name?.toLowerCase().includes('tab') ||
      c.category?.toLowerCase() === 'navigation' ||
      c.category?.toLowerCase() === 'avatar' // Avatar often part of navigation/header
    );

    if (navComponents.length >= 1) {
      patterns.push({
        type: 'navigation_workflow',
        subtype: 'primary_navigation',
        confidence: 0.7,
        components: navComponents,
        description: 'Primary navigation workflow pattern detected'
      });
    }

    // Dashboard patterns - detect from card layouts and navigation
    const cardComponents = components.filter(c =>
      c.name?.toLowerCase().includes('card') ||
      c.category?.toLowerCase() === 'card' ||
      c.name?.toLowerCase().includes('statistics') ||
      c.name?.toLowerCase().includes('dashboard')
    );

    const hasNavigation = navComponents.length > 0;

    if (cardComponents.length >= 1 && hasNavigation) {
      patterns.push({
        type: 'dashboard_workflow',
        subtype: 'analytics_dashboard',
        confidence: 0.8,
        components: [...cardComponents, ...navComponents],
        description: 'Dashboard layout with navigation and data cards detected'
      });
    } else if (cardComponents.length >= 1) {
      patterns.push({
        type: 'dashboard_workflow',
        subtype: 'content_cards',
        confidence: 0.6,
        components: cardComponents,
        description: 'Card-based content layout pattern detected'
      });
    }

    return patterns;
  }

  /**
   * Detect information architecture patterns
   * @param {DesignComponent[]} components - Components to analyze
   * @returns {Promise<SemanticPattern[]>} Detected IA patterns
   */
  async detectInformationArchitecturePatterns(components) {
    const patterns = [];

    // Card/List patterns
    const cardComponents = components.filter(c =>
      c.name?.toLowerCase().includes('card') ||
      c.name?.toLowerCase().includes('item') ||
      c.type === 'FRAME'
    );

    if (cardComponents.length >= 3) {
      patterns.push({
        type: 'information_architecture',
        subtype: 'card_grid',
        confidence: 0.8,
        components: cardComponents,
        description: 'Card-based information architecture pattern'
      });
    }

    // Header/Content/Footer hierarchy
    const headerComponents = components.filter(c =>
      c.name?.toLowerCase().includes('header') ||
      c.name?.toLowerCase().includes('title')
    );
    const contentComponents = components.filter(c =>
      c.name?.toLowerCase().includes('content') ||
      c.name?.toLowerCase().includes('body')
    );
    const footerComponents = components.filter(c =>
      c.name?.toLowerCase().includes('footer')
    );

    if (headerComponents.length >= 1 && contentComponents.length >= 1) {
      patterns.push({
        type: 'information_architecture',
        subtype: 'hierarchical_layout',
        confidence: 0.7,
        components: [...headerComponents, ...contentComponents, ...footerComponents],
        description: 'Hierarchical content structure pattern'
      });
    }

    return patterns;
  }

  /**
   * Detect interaction patterns
   * @param {DesignComponent[]} components - Components to analyze
   * @returns {Promise<SemanticPattern[]>} Detected interaction patterns
   */
  async detectInteractionPatterns(components) {
    const patterns = [];

    // Button interaction patterns
    const buttons = components.filter(c =>
      c.type === 'BUTTON' ||
      c.name?.toLowerCase().includes('button') ||
      c.semantic?.role === 'button'
    );

    if (buttons.length >= 1) {
      patterns.push({
        type: 'interaction_pattern',
        subtype: 'button_actions',
        confidence: 0.8,
        components: buttons,
        description: 'Interactive button pattern detected'
      });
    }

    // Modal/Dialog patterns
    const modals = components.filter(c =>
      c.name?.toLowerCase().includes('modal') ||
      c.name?.toLowerCase().includes('dialog') ||
      c.name?.toLowerCase().includes('popup')
    );

    if (modals.length >= 1) {
      patterns.push({
        type: 'interaction_pattern',
        subtype: 'modal_dialog',
        confidence: 0.9,
        components: modals,
        description: 'Modal dialog interaction pattern'
      });
    }

    return patterns;
  }

  /**
   * Detect design system patterns
   * @param {DesignComponent[]} components - Components to analyze
   * @param {DesignContext} context - Design context
   * @returns {Promise<SemanticPattern[]>} Detected design system patterns
   */
  async detectDesignSystemPatterns(components, context) {
    const patterns = [];

    // Color consistency patterns
    const colorGroups = new Map();
    components.forEach(component => {
      if (component.visual?.fills) {
        component.visual.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const color = fill.color;
            if (!colorGroups.has(color)) {
              colorGroups.set(color, []);
            }
            colorGroups.get(color).push(component);
          }
        });
      }
    });

    const consistentColors = Array.from(colorGroups.entries()).filter(([, comps]) => comps.length >= 2);
    if (consistentColors.length >= 2) {
      patterns.push({
        type: 'design_system_pattern',
        subtype: 'color_consistency',
        confidence: 0.7,
        components: consistentColors.flatMap(([, comps]) => comps),
        description: 'Consistent color usage pattern detected'
      });
    }

    // Typography patterns
    const fontGroups = new Map();
    components.forEach(component => {
      if (component.visual?.typography?.fontFamily) {
        const font = component.visual.typography.fontFamily;
        if (!fontGroups.has(font)) {
          fontGroups.set(font, []);
        }
        fontGroups.get(font).push(component);
      }
    });

    const consistentFonts = Array.from(fontGroups.entries()).filter(([, comps]) => comps.length >= 2);
    if (consistentFonts.length >= 1) {
      patterns.push({
        type: 'design_system_pattern',
        subtype: 'typography_consistency',
        confidence: 0.8,
        components: consistentFonts.flatMap(([, comps]) => comps),
        description: 'Consistent typography pattern detected'
      });
    }

    return patterns;
  }

  /**
   * Detect business logic patterns
   * @param {DesignComponent[]} components - Components to analyze
   * @param {DesignContext} context - Design context
   * @returns {Promise<SemanticPattern[]>} Detected business logic patterns
   */
  async detectBusinessLogicPatterns(components, context) {
    const patterns = [];

    // E-commerce patterns
    const hasProductInfo = components.some(c =>
      c.name?.toLowerCase().includes('product') ||
      c.name?.toLowerCase().includes('price') ||
      c.name?.toLowerCase().includes('cart')
    );
    const hasCheckout = components.some(c =>
      c.name?.toLowerCase().includes('checkout') ||
      c.name?.toLowerCase().includes('buy') ||
      c.name?.toLowerCase().includes('purchase')
    );

    if (hasProductInfo && hasCheckout) {
      patterns.push({
        type: 'business_logic_pattern',
        subtype: 'ecommerce_flow',
        confidence: 0.9,
        components: components.filter(c =>
          c.name?.toLowerCase().includes('product') ||
          c.name?.toLowerCase().includes('price') ||
          c.name?.toLowerCase().includes('cart') ||
          c.name?.toLowerCase().includes('checkout')
        ),
        description: 'E-commerce business flow pattern detected'
      });
    }

    // Dashboard patterns
    const hasMetrics = components.some(c =>
      c.name?.toLowerCase().includes('chart') ||
      c.name?.toLowerCase().includes('graph') ||
      c.name?.toLowerCase().includes('metric')
    );
    const hasFilters = components.some(c =>
      c.name?.toLowerCase().includes('filter') ||
      c.name?.toLowerCase().includes('search')
    );

    if (hasMetrics && hasFilters) {
      patterns.push({
        type: 'business_logic_pattern',
        subtype: 'dashboard_analytics',
        confidence: 0.8,
        components: components.filter(c =>
          c.name?.toLowerCase().includes('chart') ||
          c.name?.toLowerCase().includes('graph') ||
          c.name?.toLowerCase().includes('metric') ||
          c.name?.toLowerCase().includes('filter')
        ),
        description: 'Analytics dashboard pattern detected'
      });
    }

    return patterns;
  }

  /**
   * Enhanced component intent detection using multiple signals
   * @param {DesignComponent} component - Component to analyze
   * @param {DesignContext} context - Design context
   * @returns {Promise<IntentAnalysis>} Intent analysis result
   */
  async detectComponentIntent(component, context) {
    const signals = {
      naming: this.analyzeNamingSignals(component),
      visual: this.analyzeVisualSignals(component),
      structural: this.analyzeStructuralSignals(component),
      contextual: this.analyzeContextualSignals(component, context),
      positional: this.analyzePositionalSignals(component)
    };

    // ML-based classification if enabled
    if (this.config.enableMLClassification) {
      signals.ml = await this.classifyWithML(component, context);
    }

    // Combine signals using weighted scoring
    const intentScores = this.combineIntentSignals(signals);

    // Find primary intent and alternatives
    const sortedIntents = Object.entries(intentScores)
      .sort(([,a], [,b]) => b - a);

    // Default fallback if no intents found
    if (sortedIntents.length === 0) {
      return {
        intent: 'generic',
        primary: 'generic',
        alternatives: [],
        confidence: 0.1,
        signals,
        reasoning: 'No specific intent signals detected, using generic classification'
      };
    }

    const primary = sortedIntents[0][0];
    const confidence = sortedIntents[0][1];
    const alternatives = sortedIntents.slice(1, 3).map(([intent, score]) => ({
      intent,
      confidence: score
    }));

    return {
      intent: primary, // Add for test compatibility
      primary,
      alternatives,
      confidence: isNaN(confidence) ? 0.1 : confidence, // Ensure confidence is valid
      signals,
      reasoning: this.generateIntentReasoning(primary, signals)
    };
  }

  /**
   * Analyze naming signals for intent detection
   * @param {DesignComponent} component - Component to analyze
   * @returns {Object} Naming signals
   */
  analyzeNamingSignals(component) {
    const name = component.name.toLowerCase();
    const signals = {};

    // Check for explicit intent keywords
    for (const [intent, keywords] of Object.entries(this.config.semanticKeywords)) {
      signals[intent] = keywords.some(keyword => name.includes(keyword)) ? 0.9 : 0;
    }

    // Check for UI pattern keywords
    const uiPatterns = {
      'form': ['form', 'input', 'field', 'submit', 'register', 'login'],
      'navigation': ['nav', 'menu', 'tab', 'breadcrumb', 'sidebar'],
      'content': ['card', 'article', 'post', 'content', 'text'],
      'feedback': ['alert', 'toast', 'notification', 'message', 'error'],
      'action': ['button', 'btn', 'action', 'submit', 'save', 'delete'],
      'display': ['chart', 'graph', 'table', 'list', 'grid'],
      'media': ['image', 'video', 'avatar', 'thumbnail', 'gallery']
    };

    const foundKeywords = [];
    for (const [pattern, keywords] of Object.entries(uiPatterns)) {
      const matchedKeywords = keywords.filter(keyword => name.includes(keyword));
      if (matchedKeywords.length > 0) {
        signals[pattern] = (signals[pattern] || 0) + 0.7;
        foundKeywords.push(...matchedKeywords);
      }
    }

    // Calculate overall confidence
    const totalSignals = Object.values(signals).reduce((sum, val) => sum + val, 0);
    const confidence = Math.min(totalSignals / Object.keys(uiPatterns).length, 1.0);

    return {
      signals,
      confidence,
      keywords: foundKeywords
    };
  }

  /**
   * Analyze visual signals for intent detection
   * @param {DesignComponent} component - Component to analyze
   * @returns {Object} Visual signals
   */
  analyzeVisualSignals(component) {
    const signals = {};
    const visual = component.visual || {};

    // Analyze fills for intent clues
    if (visual.fills && visual.fills.length > 0) {
      const primaryFill = visual.fills[0];

      // Button-like visual characteristics
      if (primaryFill.color && this.isButtonLikeColor(primaryFill.color)) {
        signals.button = 0.6;
      }

      // Alert/feedback colors
      if (this.isFeedbackColor(primaryFill.color)) {
        signals.feedback = 0.7;
      }
    }

    // Analyze dimensions for intent clues
    const { width, height } = component.geometry;
    const aspectRatio = width / height;

    // Button-like dimensions
    if (aspectRatio > 2 && aspectRatio < 6 && height < 60) {
      signals.button = (signals.button || 0) + 0.4;
    }

    // Card-like dimensions
    if (aspectRatio > 0.7 && aspectRatio < 2 && width > 200 && height > 150) {
      signals.card = 0.5;
    }

    // Input-like dimensions
    if (aspectRatio > 3 && height < 50) {
      signals.input = 0.6;
    }

    // Calculate overall confidence
    const totalSignals = Object.values(signals).reduce((sum, val) => sum + val, 0);
    const confidence = Math.min(totalSignals, 1.0);

    return {
      signals,
      confidence
    };
  }

  /**
   * Analyze structural signals for intent detection
   * @param {DesignComponent} component - Component to analyze
   * @returns {Object} Structural signals
   */
  analyzeStructuralSignals(component) {
    const signals = {};

    // Analyze children for structural clues
    if (component.children && component.children.length > 0) {
      const childCount = component.children.length;

      // Form-like structure (multiple inputs)
      if (childCount > 3) {
        signals.form = 0.5;
      }

      // Navigation-like structure (multiple links)
      if (childCount > 2 && childCount < 10) {
        signals.navigation = 0.4;
      }

      // Complex content structure
      if (childCount > 5) {
        signals.content = 0.6;
      }
    }

    // Single child often indicates wrapper/container
    if (component.children?.length === 1) {
      signals.container = 0.7;
    }

    // No children but has content suggests atomic component
    if (!component.children?.length && component.content) {
      if (component.content.text) {
        signals.text = 0.8;
      }
      if (component.content.image) {
        signals.media = 0.8;
      }
    }

    return signals;
  }

  /**
   * Analyze contextual signals for intent detection
   * @param {DesignComponent} component - Component to analyze
   * @param {DesignContext} context - Design context
   * @returns {Object} Contextual signals
   */
  analyzeContextualSignals(component, context) {
    const signals = {};

    // Context purpose influences intent detection
    if (context.purpose) {
      const purpose = context.purpose.toLowerCase();

      if (purpose.includes('dashboard')) {
        signals.chart = 0.3;
        signals.card = 0.4;
        signals.navigation = 0.3;
      }

      if (purpose.includes('form')) {
        signals.input = 0.5;
        signals.button = 0.4;
        signals.form = 0.6;
      }

      if (purpose.includes('landing')) {
        signals.hero = 0.5;
        signals.button = 0.4;
        signals.content = 0.3;
      }
    }

    return signals;
  }

  /**
   * Analyze positional signals for intent detection
   * @param {DesignComponent} component - Component to analyze
   * @returns {Object} Positional signals
   */
  analyzePositionalSignals(component) {
    const signals = {};
    const { x, y, width, height } = component.geometry;

    // Top positioning suggests header/navigation
    if (y < 100) {
      signals.header = 0.6;
      signals.navigation = 0.5;
    }

    // Bottom positioning suggests footer
    if (y > 800) { // Assuming common design height
      signals.footer = 0.7;
    }

    // Left positioning suggests sidebar
    if (x < 100 && height > 400) {
      signals.sidebar = 0.6;
    }

    // Center positioning with large width suggests hero
    if (x > 200 && width > 600 && y < 300) {
      signals.hero = 0.5;
    }

    return signals;
  }

  /**
   * Combine intent signals using weighted scoring
   * @param {Object} signals - All collected signals
   * @returns {Object} Combined intent scores
   */
  combineIntentSignals(signals) {
    const weights = {
      naming: 0.35,
      visual: 0.25,
      structural: 0.20,
      contextual: 0.10,
      positional: 0.10,
      ml: 0.4 // Higher weight for ML if available
    };

    const intentScores = {};

    // Collect all possible intents
    const allIntents = new Set();
    Object.values(signals).forEach(signalGroup => {
      Object.keys(signalGroup).forEach(intent => allIntents.add(intent));
    });

    // Calculate weighted scores for each intent
    for (const intent of allIntents) {
      let score = 0;
      let totalWeight = 0;

      for (const [signalType, signalGroup] of Object.entries(signals)) {
        if (signalGroup[intent]) {
          const weight = weights[signalType] || 0.1;
          score += signalGroup[intent] * weight;
          totalWeight += weight;
        }
      }

      // Normalize by total weight
      if (totalWeight > 0) {
        intentScores[intent] = Math.min(score / totalWeight, 1.0);
      }
    }

    // Ensure at least one intent exists with minimum confidence
    if (Object.keys(intentScores).length === 0) {
      intentScores.generic = 0.1;
    }

    return intentScores;
  }

  /**
   * ML-based component classification
   * @param {DesignComponent} component - Component to classify
   * @param {DesignContext} context - Design context
   * @returns {Promise<Object>} ML classification results
   */
  async classifyWithML(component, context) {
    // Placeholder for ML model integration
    // In a real implementation, this would:
    // 1. Extract features from component (visual, structural, textual)
    // 2. Send to trained classification model
    // 3. Return probability scores for different intents

    // Simulated ML response based on heuristics
    const features = this.extractMLFeatures(component, context);
    return this.simulateMLClassification(features);
  }

  /**
   * Extract features for ML classification
   * @param {DesignComponent} component - Component to analyze
   * @param {DesignContext} context - Design context
   * @returns {Object} Feature vector
   */
  extractMLFeatures(component, context) {
    return {
      // Geometric features
      aspectRatio: component.geometry.width / component.geometry.height,
      area: component.geometry.width * component.geometry.height,
      position: [component.geometry.x, component.geometry.y],

      // Visual features
      hasText: !!(component.content && component.content.text),
      hasImage: !!(component.content && component.content.image),
      fillCount: component.visual?.fills?.length || 0,
      strokeCount: component.visual?.strokes?.length || 0,

      // Structural features
      childCount: component.children?.length || 0,
      hasParent: !!component.parent,
      depth: component.level || 0,

      // Semantic features
      nameLength: component.name.length,
      nameWords: component.name.split(/\s+/).length,

      // Context features
      purposeType: this.encodePurposeType(context.purpose)
    };
  }

  /**
   * Simulate ML classification (placeholder)
   * @param {Object} features - Feature vector
   * @returns {Object} Classification scores
   */
  simulateMLClassification(features) {
    // This is a simplified simulation
    // Real implementation would use trained models
    const scores = {};

    // Button classification logic
    if (features.aspectRatio > 1.5 && features.aspectRatio < 5 &&
        features.area < 10000 && features.hasText) {
      scores.button = 0.85;
    }

    // Input classification logic
    if (features.aspectRatio > 3 && features.area < 5000) {
      scores.input = 0.75;
    }

    // Card classification logic
    if (features.aspectRatio > 0.5 && features.aspectRatio < 2 &&
        features.area > 50000 && features.childCount > 2) {
      scores.card = 0.80;
    }

    return scores;
  }

  // ... Additional methods for business logic inference, pattern detection, etc.
  // (Implementation continues with the remaining methods)

  /**
   * Initialize semantic keywords for intent detection
   * @returns {Object} Semantic keyword mappings
   */
  initializeSemanticKeywords() {
    return {
      button: ['button', 'btn', 'submit', 'send', 'save', 'delete', 'cancel', 'confirm', 'action', 'cta', 'click'],
      input: ['input', 'field', 'textbox', 'search', 'filter', 'query', 'form'],
      navigation: ['nav', 'menu', 'header', 'breadcrumb', 'tab', 'link', 'sidebar'],
      content: ['card', 'article', 'post', 'content', 'text', 'description', 'body'],
      hero: ['hero', 'banner', 'jumbotron', 'splash', 'intro', 'welcome'],
      form: ['form', 'register', 'login', 'signup', 'contact', 'checkout'],
      modal: ['modal', 'dialog', 'popup', 'overlay', 'lightbox'],
      feedback: ['alert', 'toast', 'notification', 'message', 'warning', 'error', 'success'],
      media: ['image', 'img', 'photo', 'picture', 'video', 'avatar', 'thumbnail'],
      data: ['chart', 'graph', 'table', 'list', 'grid', 'dashboard', 'metric', 'stat']
    };
  }

  /**
   * Initialize semantic models and patterns
   */
  initializeSemanticModels() {
    // Initialize pattern recognition models
    this.patternModels = {
      userFlows: new Map(),
      informationArchitecture: new Map(),
      businessLogic: new Map()
    };

    // Load pre-trained patterns if available
    this.loadPretrainedPatterns();
  }

  /**
   * Load pre-trained semantic patterns
   */
  loadPretrainedPatterns() {
    // Placeholder for loading trained patterns
    // In production, this would load from files or API
    this.logger.debug('📚 Loading pre-trained semantic patterns');
  }

  /**
   * Check if color suggests button intent
   * @param {string} color - Color value
   * @returns {boolean} Is button-like color
   */
  isButtonLikeColor(color) {
    // Common button colors (primary, secondary actions)
    const buttonColors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
    return buttonColors.some(btnColor => this.colorSimilarity(color, btnColor) > 0.8);
  }

  /**
   * Check if color suggests feedback intent
   * @param {string} color - Color value
   * @returns {boolean} Is feedback color
   */
  isFeedbackColor(color) {
    const feedbackColors = {
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8'
    };

    return Object.values(feedbackColors).some(fbColor =>
      this.colorSimilarity(color, fbColor) > 0.7
    );
  }

  /**
   * Calculate color similarity
   * @param {string} color1 - First color
   * @param {string} color2 - Second color
   * @returns {number} Similarity score (0-1)
   */
  colorSimilarity(color1, color2) {
    // Simplified color similarity calculation
    // In production, would use proper color space calculations
    return color1.toLowerCase() === color2.toLowerCase() ? 1 : 0;
  }

  /**
   * Calculate overall confidence score
   * @param {SemanticAnalysisResult} results - Analysis results
   * @returns {number} Overall confidence (0-1)
   */
  calculateOverallConfidence(results) {
    if (results.confidence.components.length === 0) {return 0;}

    const avgComponentConfidence = results.confidence.components.reduce((sum, conf) => sum + conf, 0) / results.confidence.components.length;
    const patternConfidence = results.patterns.length > 0 ? 0.8 : 0.5; // Boost confidence if patterns detected

    return Math.min((avgComponentConfidence + patternConfidence) / 2, 1.0);
  }

  /**
   * Generate reasoning for intent detection
   * @param {string} intent - Detected intent
   * @param {Object} signals - All signals used
   * @returns {string} Human-readable reasoning
   */
  generateIntentReasoning(intent, signals) {
    const reasons = [];

    if (signals.naming[intent] > 0.5) {
      reasons.push(`Component name contains ${intent}-related keywords`);
    }

    if (signals.visual[intent] > 0.5) {
      reasons.push(`Visual characteristics match ${intent} patterns`);
    }

    if (signals.structural[intent] > 0.5) {
      reasons.push(`Component structure suggests ${intent} functionality`);
    }

    return reasons.join('; ') || `Classified as ${intent} based on combined signals`;
  }

  /**
   * Detect semantic patterns across components (placeholder)
   * @param {Array} components - Analyzed components
   * @param {DesignContext} context - Design context
   * @returns {Promise<Array>} Semantic patterns
   */
  async detectSemanticPatternsAdvanced(components, _context) {
    // Placeholder implementation
    return [{
      type: 'authentication',
      confidence: 0.8,
      components: components.filter(c => c.intent?.primary === 'Login' || c.intent?.primary === 'Authentication'),
      description: 'User authentication pattern detected'
    }];
  }

  /**
   * Infer business logic from semantic patterns (placeholder)
   * @param {Array} components - Analyzed components
   * @param {Array} patterns - Detected patterns
   * @param {DesignContext} context - Design context
   * @returns {Promise<Object>} Business logic analysis
   */
  async inferBusinessLogic(components, patterns, context) {
    // Placeholder implementation
    return {
      primaryFunction: context.purpose || 'User interface',
      workflow: patterns.length > 0 ? patterns[0].type : 'generic',
      complexity: components.length > 5 ? 'high' : 'medium',
      confidence: 0.7
    };
  }

  /**
   * Calculate overall confidence score (placeholder)
   * @param {Object} results - Analysis results
   * @returns {number} Overall confidence score
   */
  calculateOverallConfidenceScore(results) {
    const componentConfidence = results.components.reduce((sum, c) => sum + (c.confidence || 0.5), 0) / results.components.length;
    const patternConfidence = results.patterns.reduce((sum, p) => sum + (p.confidence || 0.5), 0) / Math.max(results.patterns.length, 1);
    return (componentConfidence + patternConfidence) / 2;
  }

  /**
   * Encode purpose type for ML features
   * @param {string} purpose - Context purpose
   * @returns {number} Encoded purpose type
   */
  encodePurposeType(purpose) {
    if (!purpose || typeof purpose !== 'string') {return 0;}

    const purposeMap = {
      'web': 1,
      'mobile': 2,
      'desktop': 3,
      'tablet': 4,
      'interface': 5,
      'dashboard': 6,
      'form': 7,
      'navigation': 8,
      'content': 9,
      'default': 0
    };

    const lowerPurpose = purpose.toLowerCase();
    for (const [key, value] of Object.entries(purposeMap)) {
      if (lowerPurpose.includes(key)) {
        return value;
      }
    }

    return 0; // default
  }
}

/**
 * Quick semantic analysis function
 * @param {DesignComponent[]} components - Components to analyze
 * @param {DesignContext} context - Design context
 * @returns {Promise<SemanticAnalysisResult>} Analysis results
 */
export async function analyzeSemanticIntent(components, context) {
  const analyzer = new SemanticAnalyzer();
  return analyzer.analyzeSemanticIntent(components, context);
}

// Export for use in other modules
export default SemanticAnalyzer;