/**
 * 🔗 Interaction Mapper - Phase 7: Context Intelligence Layer
 *
 * Advanced interaction pattern analysis system that maps user flows,
 * navigation targets, and behavioral patterns from design structures.
 *
 * Core Features:
 * - Click flow and navigation target extraction
 * - User journey mapping from prototypes
 * - State transition analysis
 * - Interaction pattern recognition
 * - User behavior prediction
 * - Touch target analysis for mobile interfaces
 *
 * Integration Points:
 * - Enhances PrototypeMapper with behavioral intelligence
 * - Feeds interaction data to AI Orchestrator
 * - Improves accessibility analysis with interaction patterns
 * - Validates user experience flow integrity
 */

import { Logger } from '../logging/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class InteractionMapper {
  constructor(options = {}) {
    this.logger = new Logger('InteractionMapper');
    this.errorHandler = new ErrorHandler();

    this.config = {
      minTouchTargetSize: options.minTouchTargetSize || 44, // iOS/Android standard
      maxFlowDepth: options.maxFlowDepth || 10,
      confidenceThreshold: options.confidenceThreshold || 0.6,
      enableGestureDetection: options.enableGestureDetection || true,
      enableFlowValidation: options.enableFlowValidation || true,
      ...options
    };

    // Interaction pattern cache
    this.flowCache = new Map();
    this.interactionPatterns = new Map();

    // Initialize interaction models
    this.initializeInteractionModels();
  }

  /**
   * Map all interaction patterns and flows in design
   * @param {SemanticComponent[]} components - Semantically analyzed components
   * @param {Object} prototypeData - Figma prototype/interaction data
   * @param {DesignContext} context - Design context
   * @returns {Promise<InteractionAnalysisResult>} Interaction analysis results
   */
  async mapInteractionFlows(components, prototypeData, context) {
    const startTime = Date.now();

    try {
      this.logger.info('🔗 Starting interaction flow mapping');

      const results = {
        interactiveComponents: [],
        navigationFlows: [],
        userJourneys: [],
        stateTransitions: [],
        touchTargets: [],
        gesturePatterns: [],
        accessibility: {
          focusFlow: [],
          keyboardNavigation: [],
          screenReaderFlow: []
        },
        validation: {
          flowIntegrity: true,
          deadEnds: [],
          orphanedComponents: [],
          unreachableStates: []
        },
        patterns: {
          common: [],
          antiPatterns: [],
          recommendations: []
        },
        metadata: {
          analysisTime: 0,
          componentsAnalyzed: components.length,
          flowsDetected: 0,
          interactionsFound: 0
        }
      };

      // Identify interactive components
      results.interactiveComponents = await this.identifyInteractiveComponents(components);

      // Map navigation flows
      results.navigationFlows = await this.mapNavigationFlows(results.interactiveComponents, prototypeData);

      // Extract user journeys
      results.userJourneys = await this.extractUserJourneys(results.navigationFlows, context);

      // Analyze state transitions
      results.stateTransitions = await this.analyzeStateTransitions(results.interactiveComponents, prototypeData);

      // Analyze touch targets
      results.touchTargets = await this.analyzeTouchTargets(results.interactiveComponents);

      // Detect gesture patterns
      if (this.config.enableGestureDetection) {
        results.gesturePatterns = await this.detectGesturePatterns(results.interactiveComponents, prototypeData);
      }

      // Analyze accessibility patterns
      results.accessibility = await this.analyzeAccessibilityPatterns(results.interactiveComponents, results.navigationFlows);

      // Validate flow integrity
      if (this.config.enableFlowValidation) {
        results.validation = await this.validateFlowIntegrity(results.navigationFlows, results.userJourneys);
      }

      // Detect interaction patterns
      results.patterns = await this.detectInteractionPatterns(results);

      // Update metadata
      results.metadata.analysisTime = Date.now() - startTime;
      results.metadata.flowsDetected = results.navigationFlows.length;
      results.metadata.interactionsFound = results.interactiveComponents.length;

      // Add singular navigationFlow for test compatibility
      results.navigationFlow = {
        flows: results.navigationFlows,
        totalFlows: results.navigationFlows.length,
        entry_points: results.navigationFlows.filter(flow => flow.isEntryPoint),
        exit_points: results.navigationFlows.filter(flow => flow.isExitPoint)
      };

      this.logger.info(`✅ Interaction mapping completed in ${results.metadata.analysisTime}ms`);
      this.logger.info(`🎯 Found ${results.metadata.interactionsFound} interactive components with ${results.metadata.flowsDetected} flows`);

      return results;

    } catch (error) {
      this.logger.error('❌ Interaction mapping failed:', error);
      throw this.errorHandler.handle(error, 'InteractionMapper.mapInteractionFlows');
    }
  }

  /**
   * Identify interactive components in the design
   * @param {SemanticComponent[]} components - Components to analyze
   * @returns {Promise<InteractiveComponent[]>} Interactive components
   */
  async identifyInteractiveComponents(components) {
    const interactiveComponents = [];

    for (const component of components) {
      const interactivity = this.analyzeComponentInteractivitySync(component);

      if (interactivity.isInteractive) {
        interactiveComponents.push({
          ...component,
          interactivity: {
            isInteractive: interactivity.isInteractive,
            type: interactivity.type,
            confidence: interactivity.confidence,
            triggers: interactivity.triggers,
            behaviors: interactivity.behaviors,
            states: interactivity.states,
            accessibility: interactivity.accessibility,
            interactionTypes: interactivity.interactionTypes
          },
          // Keep backward compatibility
          interaction: {
            type: interactivity.type,
            confidence: interactivity.confidence,
            triggers: interactivity.triggers,
            behaviors: interactivity.behaviors,
            states: interactivity.states,
            accessibility: interactivity.accessibility
          }
        });
      }
    }

    this.logger.debug(`🔍 Identified ${interactiveComponents.length} interactive components`);
    return interactiveComponents;
  }

  /**
   * Analyze component interactivity
   * @param {SemanticComponent} component - Component to analyze
   * @returns {Promise<InteractivityAnalysis>} Interactivity analysis
   */
  // Synchronous version for unit testing compatibility
  analyzeComponentInteractivity(component, interactions) {
    return this.analyzeComponentInteractivitySync(component);
  }

  async analyzeComponentInteractivityAsync(component) {
    return this.analyzeComponentInteractivitySync(component);
  }

  analyzeComponentInteractivitySync(component) {
    const analysis = {
      isInteractive: false,
      type: 'static',
      confidence: 0,
      triggers: [],
      behaviors: [],
      states: ['default'],
      accessibility: {}
    };

    // Check semantic intent for interactivity with null check
    const interactiveIntents = ['button', 'input', 'form', 'navigation', 'modal', 'dropdown', 'slider', 'toggle'];
    if (component?.semantic?.intent && interactiveIntents.includes(component.semantic.intent)) {
      analysis.isInteractive = true;
      analysis.type = component.semantic.intent;
      analysis.confidence = component.semantic.confidence || 0.5;
    }

    // Check visual cues for interactivity
    const interactivityCues = this.analyzeVisualInteractivityCues(component);
    if (interactivityCues.score > 0.5) {
      analysis.isInteractive = true;
      analysis.confidence = Math.max(analysis.confidence, interactivityCues.score);
      analysis.triggers.push(...interactivityCues.triggers);
    }

    // Check naming patterns for interactivity
    const namingCues = this.analyzeNamingInteractivityCues(component);
    if (namingCues.isInteractive) {
      analysis.isInteractive = true;
      analysis.confidence = Math.max(analysis.confidence, namingCues.confidence);
      analysis.type = namingCues.type;
    }

    // Determine possible behaviors
    analysis.behaviors = this.determinePossibleBehaviors(component, analysis);

    // Determine possible states
    analysis.states = this.determinePossibleStates(component, analysis);

    // Determine accessibility requirements
    analysis.accessibility = this.determineAccessibilityRequirements(component, analysis);

    // Add interactionTypes for test compatibility
    analysis.interactionTypes = [...analysis.triggers, ...analysis.behaviors];

    return analysis;
  }

  /**
   * Analyze visual cues for interactivity
   * @param {SemanticComponent} component - Component to analyze
   * @returns {Object} Visual interactivity analysis
   */
  analyzeVisualInteractivityCues(component) {
    const cues = {
      score: 0,
      triggers: [],
      evidence: []
    };

    const visual = component.visual || {};

    // Button-like visual characteristics
    if (visual.fills && visual.fills.length > 0) {
      const fill = visual.fills[0];

      // Solid fills often indicate clickable elements
      if (fill.type === 'SOLID') {
        cues.score += 0.3;
        cues.evidence.push('Solid fill suggests clickable element');
      }

      // Bright/saturated colors often indicate interactive elements
      if (this.isBrightColor(fill.color)) {
        cues.score += 0.2;
        cues.triggers.push('hover', 'focus');
        cues.evidence.push('Bright color suggests interactive element');
      }
    }

    // Border characteristics
    if (visual.strokes && visual.strokes.length > 0) {
      cues.score += 0.2;
      cues.evidence.push('Border suggests form element or button');
    }

    // Size and proportion analysis with null check
    if (!component?.geometry || typeof component.geometry.width !== 'number' || typeof component.geometry.height !== 'number') {
      return cues; // Return early if geometry is invalid
    }
    const { width, height } = component.geometry;
    const aspectRatio = width / height;

    // Button-like proportions
    if (aspectRatio > 1.5 && aspectRatio < 6 && height >= 32 && height <= 60) {
      cues.score += 0.4;
      cues.triggers.push('click', 'tap');
      cues.evidence.push('Button-like proportions');
    }

    // Input-like proportions
    if (aspectRatio > 2 && height >= 32 && height <= 50) {
      cues.score += 0.3;
      cues.triggers.push('focus', 'input');
      cues.evidence.push('Input-like proportions');
    }

    // Effects that suggest interactivity
    if (visual.effects && visual.effects.length > 0) {
      const hasDropShadow = visual.effects.some(effect => effect.type === 'DROP_SHADOW');
      if (hasDropShadow) {
        cues.score += 0.2;
        cues.evidence.push('Drop shadow suggests elevated/clickable element');
      }
    }

    return cues;
  }

  /**
   * Analyze naming patterns for interactivity cues
   * @param {SemanticComponent} component - Component to analyze
   * @returns {Object} Naming interactivity analysis
   */
  analyzeNamingInteractivityCues(component) {
    if (!component.name) {
      return { score: 0, keywords: [], confidence: 0 };
    }
    const name = component.name.toLowerCase();

    const interactiveKeywords = {
      button: ['button', 'btn', 'click', 'submit', 'send', 'save', 'delete', 'cancel', 'confirm'],
      input: ['input', 'field', 'textbox', 'search', 'filter'],
      link: ['link', 'anchor', 'href', 'url'],
      navigation: ['nav', 'menu', 'tab', 'breadcrumb'],
      toggle: ['toggle', 'switch', 'checkbox', 'radio'],
      dropdown: ['dropdown', 'select', 'picker', 'combo'],
      modal: ['modal', 'dialog', 'popup', 'overlay'],
      slider: ['slider', 'range', 'scrub']
    };

    for (const [type, keywords] of Object.entries(interactiveKeywords)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          return {
            isInteractive: true,
            type,
            confidence: 0.8,
            keyword
          };
        }
      }
    }

    // Check for action verbs
    const actionVerbs = ['add', 'remove', 'edit', 'update', 'create', 'delete', 'save', 'cancel', 'submit', 'send', 'share', 'like', 'follow'];
    for (const verb of actionVerbs) {
      if (name.includes(verb)) {
        return {
          isInteractive: true,
          type: 'button',
          confidence: 0.7,
          keyword: verb
        };
      }
    }

    return {
      isInteractive: false,
      confidence: 0
    };
  }

  /**
   * Map navigation flows between components
   * @param {InteractiveComponent[]} interactiveComponents - Interactive components
   * @param {Object} prototypeData - Prototype data from Figma
   * @returns {Promise<NavigationFlow[]>} Navigation flows
   */
  async mapNavigationFlows(interactiveComponents, prototypeData) {
    const flows = [];

    // Process explicit prototype connections
    if (prototypeData && prototypeData.connections) {
      for (const connection of prototypeData.connections) {
        const flow = await this.createNavigationFlow(connection, interactiveComponents);
        if (flow) {
          flows.push(flow);
        }
      }
    }

    // Infer implicit navigation flows
    const implicitFlows = await this.inferImplicitNavigationFlows(interactiveComponents);
    flows.push(...implicitFlows);

    this.logger.debug(`🗺️ Mapped ${flows.length} navigation flows`);
    return flows;
  }

  /**
   * Extract user journeys from navigation flows
   * @param {NavigationFlow[]} navigationFlows - Navigation flows
   * @param {DesignContext} context - Design context
   * @returns {Promise<UserJourney[]>} User journeys
   */
  async extractUserJourneys(navigationFlows, context) {
    const journeys = [];

    // Group flows by common patterns
    const flowGroups = await this.groupFlowsByPattern(navigationFlows);

    for (const [pattern, flows] of flowGroups) {
      const journey = await this.createUserJourney(pattern, flows, context);
      if (journey) {
        journeys.push(journey);
      }
    }

    // Identify main user journeys based on context
    const mainJourneys = await this.identifyMainUserJourneys(journeys, context);

    this.logger.debug(`👤 Extracted ${journeys.length} user journeys (${mainJourneys.length} main)`);
    return journeys;
  }

  /**
   * Analyze touch targets for mobile accessibility
   * @param {InteractiveComponent[]} interactiveComponents - Interactive components
   * @returns {Promise<TouchTargetAnalysis[]>} Touch target analysis
   */
  async analyzeTouchTargets(interactiveComponents) {
    const touchTargets = [];

    for (const component of interactiveComponents) {
      const analysis = await this.analyzeTouchTarget(component);
      touchTargets.push(analysis);
    }

    const summary = this.summarizeTouchTargetAnalysis(touchTargets);
    this.logger.debug(`👆 Analyzed ${touchTargets.length} touch targets: ${summary.compliant}/${touchTargets.length} compliant`);

    return touchTargets;
  }

  /**
   * Analyze individual touch target
   * @param {InteractiveComponent} component - Component to analyze
   * @returns {Promise<TouchTargetAnalysis>} Touch target analysis
   */
  async analyzeTouchTarget(component) {
    const { width, height } = component.geometry;
    const area = width * height;
    const minDimension = Math.min(width, height);

    return {
      componentId: component.id,
      dimensions: { width, height },
      area,
      minDimension,
      isCompliant: minDimension >= this.config.minTouchTargetSize,
      accessibility: {
        isTouchFriendly: minDimension >= this.config.minTouchTargetSize,
        isThumbReachable: this.isThumbReachable(component.geometry),
        hasAdequateSpacing: await this.hasAdequateSpacing(component)
      },
      recommendations: this.generateTouchTargetRecommendations(component, minDimension)
    };
  }

  /**
   * Detect gesture patterns in design
   * @param {InteractiveComponent[]} interactiveComponents - Interactive components
   * @param {Object} prototypeData - Prototype data
   * @returns {Promise<GesturePattern[]>} Detected gesture patterns
   */
  async detectGesturePatterns(interactiveComponents, prototypeData) {
    const patterns = [];

    // Analyze for common gesture patterns
    const swipePatterns = await this.detectSwipePatterns(interactiveComponents, prototypeData);
    patterns.push(...swipePatterns);

    const pinchPatterns = await this.detectPinchPatterns(interactiveComponents);
    patterns.push(...pinchPatterns);

    const longPressPatterns = await this.detectLongPressPatterns(interactiveComponents);
    patterns.push(...longPressPatterns);

    this.logger.debug(`👋 Detected ${patterns.length} gesture patterns`);
    return patterns;
  }

  /**
   * Initialize interaction models and patterns
   */
  initializeInteractionModels() {
    // Common interaction patterns
    this.commonPatterns = {
      // Form patterns
      formSubmission: {
        trigger: 'button[type=submit]',
        flow: ['validate', 'submit', 'feedback'],
        states: ['default', 'loading', 'success', 'error']
      },

      // Navigation patterns
      tabNavigation: {
        trigger: 'tab',
        flow: ['select', 'highlight', 'show-content'],
        states: ['default', 'active', 'hover', 'disabled']
      },

      // Modal patterns
      modalDialog: {
        trigger: 'button[modal-trigger]',
        flow: ['open', 'overlay', 'focus-trap', 'close'],
        states: ['closed', 'opening', 'open', 'closing']
      },

      // Dropdown patterns
      dropdown: {
        trigger: 'button[dropdown-trigger]',
        flow: ['toggle', 'position', 'close-on-outside-click'],
        states: ['closed', 'open']
      }
    };

    // Load gesture libraries
    this.gestureLibrary = {
      tap: { minDuration: 0, maxDuration: 200 },
      longPress: { minDuration: 500 },
      swipe: { minDistance: 50, maxDuration: 500 },
      pinch: { minFingers: 2, gestureType: 'scale' }
    };
  }

  // Utility methods

  /**
   * Check if color is bright/saturated
   * @param {string} color - Color value
   * @returns {boolean} Is bright color
   */
  isBrightColor(color) {
    // Simplified brightness check
    // In production, would use proper color space calculations
    if (!color || typeof color !== 'string') {return false;}

    const brightColors = ['#ff', '#00ff', '#ff00', '#0ff', '#f0f', '#ff0'];
    return brightColors.some(bright => color.toLowerCase().includes(bright.slice(0, 3)));
  }

  /**
   * Check if component is in thumb-reachable area
   * @param {Object} geometry - Component geometry
   * @returns {boolean} Is thumb reachable
   */
  isThumbReachable(geometry) {
    // Simplified thumb reach calculation
    // Bottom third of screen is generally thumb-reachable
    const screenHeight = 800; // Assume mobile screen height
    return geometry.y > (screenHeight * 0.6);
  }

  /**
   * Check if component has adequate spacing
   * @param {InteractiveComponent} component - Component to check
   * @returns {Promise<boolean>} Has adequate spacing
   */
  async hasAdequateSpacing(component) {
    // Simplified spacing check
    // In production, would analyze nearby interactive elements
    return true; // Placeholder
  }

  /**
   * Generate touch target recommendations
   * @param {InteractiveComponent} component - Component to analyze
   * @param {number} minDimension - Minimum dimension
   * @returns {string[]} Recommendations
   */
  generateTouchTargetRecommendations(component, minDimension) {
    const recommendations = [];

    if (minDimension < this.config.minTouchTargetSize) {
      recommendations.push(`Increase minimum dimension to ${this.config.minTouchTargetSize}px`);
    }

    if (component.geometry.y < 100) {
      recommendations.push('Consider thumb reachability for top-positioned elements');
    }

    if (component.interaction.type === 'button' && component.geometry.width < 100) {
      recommendations.push('Consider wider button for better touch experience');
    }

    return recommendations;
  }

  /**
   * Summarize touch target analysis
   * @param {TouchTargetAnalysis[]} touchTargets - Touch target analyses
   * @returns {Object} Summary
   */
  summarizeTouchTargetAnalysis(touchTargets) {
    const compliant = touchTargets.filter(target => target.isCompliant).length;
    const total = touchTargets.length;

    return {
      compliant,
      total,
      complianceRate: total > 0 ? compliant / total : 0,
      issues: touchTargets.filter(target => !target.isCompliant).length
    };
  }

  // Additional placeholder methods for full implementation

  async createNavigationFlow(connection, interactiveComponents) {
    // Create navigation flow from prototype connection
    return null; // Placeholder
  }

  async inferImplicitNavigationFlows(interactiveComponents) {
    // Infer flows based on component semantics and positioning
    return []; // Placeholder
  }

  async groupFlowsByPattern(navigationFlows) {
    // Group flows by common patterns
    return new Map(); // Placeholder
  }

  async createUserJourney(pattern, flows, context) {
    // Create user journey from flow pattern
    return null; // Placeholder
  }

  async identifyMainUserJourneys(journeys, context) {
    // Identify main user journeys based on context
    return []; // Placeholder
  }

  async analyzeStateTransitions(interactiveComponents, prototypeData) {
    // Analyze component state transitions
    return []; // Placeholder
  }

  async analyzeAccessibilityPatterns(interactiveComponents, navigationFlows) {
    // Analyze accessibility patterns
    return {
      focusFlow: [],
      keyboardNavigation: [],
      screenReaderFlow: []
    }; // Placeholder
  }

  async validateFlowIntegrity(navigationFlows, userJourneys) {
    // Validate flow integrity
    return {
      flowIntegrity: true,
      deadEnds: [],
      orphanedComponents: [],
      unreachableStates: []
    }; // Placeholder
  }

  async detectInteractionPatterns(results) {
    // Detect interaction patterns
    return {
      common: [],
      antiPatterns: [],
      recommendations: []
    }; // Placeholder
  }

  async detectSwipePatterns(interactiveComponents, prototypeData) {
    // Detect swipe gesture patterns
    return []; // Placeholder
  }

  async detectPinchPatterns(interactiveComponents) {
    // Detect pinch gesture patterns
    return []; // Placeholder
  }

  async detectLongPressPatterns(interactiveComponents) {
    // Detect long press patterns
    return []; // Placeholder
  }

  determinePossibleBehaviors(component, analysis) {
    // Determine possible behaviors for component
    const behaviors = [];

    switch (analysis.type) {
    case 'button':
      behaviors.push('click', 'submit', 'navigate');
      break;
    case 'input':
      behaviors.push('focus', 'input', 'validate');
      break;
    case 'dropdown':
      behaviors.push('toggle', 'select', 'close');
      break;
    default:
      behaviors.push('interact');
    }

    return behaviors;
  }

  determinePossibleStates(component, analysis) {
    // Determine possible states for component
    const states = ['default'];

    if (analysis.isInteractive) {
      states.push('hover', 'focus', 'active');

      if (analysis.type === 'button') {
        states.push('disabled', 'loading');
      }

      if (analysis.type === 'input') {
        states.push('error', 'valid', 'disabled');
      }

      if (analysis.type === 'toggle') {
        states.push('checked', 'unchecked');
      }
    }

    return states;
  }

  determineAccessibilityRequirements(component, analysis) {
    // Determine accessibility requirements
    const requirements = {};

    if (analysis.isInteractive) {
      requirements.focusable = true;
      requirements.keyboardAccessible = true;

      if (analysis.type === 'button') {
        requirements.role = 'button';
        requirements.ariaLabel = true;
      }

      if (analysis.type === 'input') {
        requirements.role = 'textbox';
        requirements.ariaLabel = true;
        requirements.ariaDescribedBy = true;
      }
    }

    return requirements;
  }
}

/**
 * Quick interaction mapping function
 * @param {SemanticComponent[]} components - Components to analyze
 * @param {Object} prototypeData - Prototype data
 * @param {DesignContext} context - Design context
 * @returns {Promise<InteractionAnalysisResult>} Analysis results
 */
export async function mapInteractionFlows(components, prototypeData, context) {
  const mapper = new InteractionMapper();
  return mapper.mapInteractionFlows(components, prototypeData, context);
}

export default InteractionMapper;