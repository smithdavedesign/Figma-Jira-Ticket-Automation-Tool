/**
 * User Experience Context Engine
 *
 * Analyzes user experience patterns, journey mapping,
 * and behavioral context to provide UX intelligence
 * for more user-centered ticket generation.
 */

export class UserExperienceContextEngine {
  constructor() {
    this.journeyPatterns = new Map();
    this.behaviorPatterns = new Map();
    this.usabilityPrinciples = new Map();
  }

  /**
   * Analyze comprehensive UX context
   */
  async analyzeUXContext(figmaData, businessContext, contentAnalysis) {
    const context = {
      userJourney: await this.analyzeUserJourney(figmaData, contentAnalysis),
      interactionPatterns: await this.analyzeInteractionPatterns(figmaData),
      usabilityFactors: await this.analyzeUsabilityFactors(figmaData),
      accessibilityProfile: await this.analyzeAccessibilityProfile(figmaData),
      emotionalDesign: await this.analyzeEmotionalDesign(figmaData, businessContext),
      cognitiveLoad: await this.analyzeCognitiveLoad(figmaData, contentAnalysis),
      conversionOptimization: await this.analyzeConversionFactors(figmaData, businessContext),
      personalization: await this.analyzePersonalizationNeeds(figmaData, businessContext),
      mobileUX: await this.analyzeMobileUXConsiderations(figmaData),
      performanceUX: await this.analyzePerformanceUXImpact(figmaData)
    };

    return context;
  }

  /**
   * Alias method for backward compatibility
   */
  async analyzeUserExperienceContext(figmaData, fileContext) {
    return this.analyzeUXContext(figmaData, {}, {});
  }

  /**
   * Analyze user journey and flow
   */
  async analyzeUserJourney(figmaData, contentAnalysis) {
    const journeySteps = this.identifyJourneySteps(figmaData, contentAnalysis);
    const touchpoints = this.identifyTouchpoints(figmaData);
    const painPoints = this.identifyPotentialPainPoints(figmaData, contentAnalysis);

    return {
      primaryFlow: this.mapPrimaryFlow(journeySteps),
      alternativeFlows: this.identifyAlternativeFlows(journeySteps),
      touchpoints: touchpoints,
      painPoints: painPoints,
      opportunities: this.identifyOptimizationOpportunities(painPoints),
      emotions: this.mapEmotionalJourney(journeySteps),
      keyMoments: this.identifyKeyMoments(journeySteps),
      dropOffRisks: this.assessDropOffRisks(journeySteps, painPoints),
      successMetrics: this.identifyJourneyMetrics(journeySteps)
    };
  }

  /**
   * Identify journey steps from Figma data
   */
  identifyJourneySteps(figmaData, contentAnalysis) {
    const content = contentAnalysis.textContent?.toLowerCase() || '';
    const components = this.extractComponents(figmaData);

    const stepIndicators = {
      'awareness': ['discover', 'learn', 'explore', 'browse', 'search'],
      'consideration': ['compare', 'evaluate', 'details', 'features', 'benefits'],
      'decision': ['choose', 'select', 'add to cart', 'sign up', 'start'],
      'action': ['buy', 'purchase', 'checkout', 'submit', 'complete'],
      'retention': ['dashboard', 'account', 'profile', 'settings', 'preferences'],
      'advocacy': ['share', 'review', 'recommend', 'refer', 'feedback']
    };

    const identifiedSteps = [];

    for (const [step, keywords] of Object.entries(stepIndicators)) {
      const matches = keywords.filter(keyword =>
        content.includes(keyword) ||
        components.some(comp => comp.name?.toLowerCase().includes(keyword))
      );

      if (matches.length > 0) {
        identifiedSteps.push({
          step: step,
          confidence: matches.length / keywords.length,
          indicators: matches,
          components: this.getRelevantComponents(components, matches),
          requirements: this.getStepRequirements(step),
          challenges: this.getStepChallenges(step),
          opportunities: this.getStepOpportunities(step)
        });
      }
    }

    return identifiedSteps.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze interaction patterns
   */
  async analyzeInteractionPatterns(figmaData) {
    return {
      inputPatterns: this.analyzeInputPatterns(figmaData),
      navigationPatterns: this.analyzeNavigationPatterns(figmaData),
      feedbackPatterns: this.analyzeFeedbackPatterns(figmaData),
      gestureSupport: this.analyzeGestureSupport(figmaData),
      keyboardNavigation: this.analyzeKeyboardNavigation(figmaData),
      voiceInteraction: this.analyzeVoiceInteractionNeeds(figmaData),
      multiModal: this.analyzeMultiModalNeeds(figmaData),
      realTimeInteraction: this.analyzeRealTimeNeeds(figmaData)
    };
  }

  /**
   * Analyze usability factors
   */
  async analyzeUsabilityFactors(figmaData) {
    return {
      learnability: this.assessLearnability(figmaData),
      efficiency: this.assessEfficiency(figmaData),
      memorability: this.assessMemorability(figmaData),
      errorPrevention: this.assessErrorPrevention(figmaData),
      satisfaction: this.assessSatisfactionFactors(figmaData),
      nielsenHeuristics: this.assessNielsenHeuristics(figmaData),
      wcagCompliance: this.assessWCAGCompliance(figmaData),
      mobileUsability: this.assessMobileUsability(figmaData)
    };
  }

  /**
   * Assess learnability factors
   */
  assessLearnability(figmaData) {
    const factors = {
      visualHierarchy: this.assessVisualHierarchy(figmaData),
      consistentPatterns: this.assessPatternConsistency(figmaData),
      affordances: this.assessAffordances(figmaData),
      feedback: this.assessFeedbackClarity(figmaData),
      mentalModels: this.assessMentalModelAlignment(figmaData),
      onboarding: this.assessOnboardingNeeds(figmaData)
    };

    const score = this.calculateUsabilityScore(factors);

    return {
      score: score,
      level: this.getUsabilityLevel(score),
      factors: factors,
      improvements: this.suggestLearnabilityImprovements(factors),
      testingNeeds: this.identifyLearnabilityTests(factors)
    };
  }

  /**
   * Analyze emotional design factors
   */
  async analyzeEmotionalDesign(figmaData, businessContext) {
    return {
      emotionalTone: this.assessEmotionalTone(figmaData),
      trustBuilding: this.assessTrustElements(figmaData),
      delight: this.identifyDelightOpportunities(figmaData),
      frustrationPoints: this.identifyFrustrationRisks(figmaData),
      brandEmotions: this.alignEmotionsWithBrand(figmaData, businessContext),
      culturalConsiderations: this.assessCulturalFactors(figmaData, businessContext),
      emotionalJourney: this.mapEmotionalStates(figmaData),
      microInteractions: this.identifyMicroInteractionNeeds(figmaData)
    };
  }

  /**
   * Analyze cognitive load factors
   */
  async analyzeCognitiveLoad(figmaData, contentAnalysis) {
    const visualComplexity = this.assessVisualComplexity(figmaData);
    const informationDensity = this.assessInformationDensity(contentAnalysis);
    const choiceComplexity = this.assessChoiceComplexity(figmaData);

    return {
      visualLoad: visualComplexity,
      informationLoad: informationDensity,
      decisionLoad: choiceComplexity,
      overallLoad: this.calculateOverallCognitiveLoad(visualComplexity, informationDensity, choiceComplexity),
      reductionStrategies: this.suggestLoadReductionStrategies(visualComplexity, informationDensity, choiceComplexity),
      progressiveDisclosure: this.assessProgressiveDisclosureNeeds(figmaData),
      chunking: this.assessChunkingOpportunities(contentAnalysis),
      prioritization: this.assessPrioritizationNeeds(figmaData)
    };
  }

  /**
   * Analyze conversion optimization factors
   */
  async analyzeConversionFactors(figmaData, businessContext) {
    const businessModel = businessContext.businessModel?.model || 'unknown';

    return {
      conversionGoals: this.identifyConversionGoals(figmaData, businessModel),
      trustSignals: this.identifyTrustSignals(figmaData),
      frictionPoints: this.identifyFrictionPoints(figmaData),
      persuasionElements: this.identifyPersuasionElements(figmaData),
      socialProof: this.identifySocialProofOpportunities(figmaData),
      urgency: this.assessUrgencyElements(figmaData),
      valueProposition: this.assessValuePropositionClarity(figmaData),
      ctaOptimization: this.analyzeCTAOptimization(figmaData),
      formOptimization: this.analyzeFormOptimization(figmaData),
      abandonmentPrevention: this.identifyAbandonmentPrevention(figmaData)
    };
  }

  /**
   * Analyze mobile UX considerations
   */
  async analyzeMobileUXConsiderations(figmaData) {
    return {
      touchTargets: this.assessTouchTargets(figmaData),
      thumbZones: this.assessThumbZoneOptimization(figmaData),
      screenSizes: this.assessScreenSizeConsiderations(figmaData),
      orientation: this.assessOrientationHandling(figmaData),
      gestures: this.assessMobileGestures(figmaData),
      context: this.assessMobileContext(figmaData),
      performance: this.assessMobilePerformance(figmaData),
      connectivity: this.assessConnectivityConsiderations(figmaData),
      battery: this.assessBatteryOptimization(figmaData),
      notifications: this.assessNotificationNeeds(figmaData)
    };
  }

  /**
   * Get step requirements for user journey
   */
  getStepRequirements(step) {
    const requirements = {
      'awareness': ['SEO optimization', 'clear value proposition', 'social proof'],
      'consideration': ['detailed information', 'comparison tools', 'expert content'],
      'decision': ['clear CTAs', 'trust signals', 'easy comparison'],
      'action': ['streamlined process', 'progress indicators', 'error prevention'],
      'retention': ['personalization', 'value delivery', 'engagement features'],
      'advocacy': ['sharing tools', 'feedback systems', 'incentive programs']
    };

    return requirements[step] || ['user-friendly interface', 'clear navigation'];
  }

  /**
   * Calculate overall cognitive load
   */
  calculateOverallCognitiveLoad(visual, information, choice) {
    const weights = { visual: 0.3, information: 0.4, choice: 0.3 };
    const weightedScore = (visual.score * weights.visual) +
                         (information.score * weights.information) +
                         (choice.score * weights.choice);

    return {
      score: Math.round(weightedScore),
      level: this.getCognitiveLoadLevel(weightedScore),
      primaryFactors: this.identifyPrimaryLoadFactors(visual, information, choice),
      recommendations: this.getCognitiveLoadRecommendations(weightedScore)
    };
  }

  /**
   * Get cognitive load level
   */
  getCognitiveLoadLevel(score) {
    if (score < 3) {return 'low';}
    if (score < 6) {return 'medium';}
    if (score < 8) {return 'high';}
    return 'overwhelming';
  }

  /**
   * Assess visual hierarchy
   */
  assessVisualHierarchy(figmaData) {
    // Analyze visual hierarchy factors
    const hierarchy = this.extractVisualHierarchy(figmaData);

    return {
      clarity: this.assessHierarchyClarity(hierarchy),
      consistency: this.assessHierarchyConsistency(hierarchy),
      scanability: this.assessScanability(hierarchy),
      grouping: this.assessVisualGrouping(hierarchy),
      emphasis: this.assessEmphasisTechniques(hierarchy)
    };
  }

  /**
   * Calculate usability score
   */
  calculateUsabilityScore(factors) {
    const scores = Object.values(factors).map(factor => factor.score || 0);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Get usability level
   */
  getUsabilityLevel(score) {
    if (score >= 8) {return 'excellent';}
    if (score >= 6) {return 'good';}
    if (score >= 4) {return 'fair';}
    return 'poor';
  }

  // ============================================================================
  // MISSING METHOD IMPLEMENTATIONS (STUB/BASIC VERSIONS)
  // ============================================================================

  /**
   * Extract visual hierarchy from Figma data
   */
  extractVisualHierarchy(figmaData) {
    const nodes = figmaData.nodes || [];
    return {
      levels: this.categorizeBySize(nodes),
      typography: this.extractTypographyLevels(nodes),
      spacing: this.extractSpacingPatterns(nodes),
      colors: this.extractColorHierarchy(nodes)
    };
  }

  /**
   * Assess hierarchy clarity
   */
  assessHierarchyClarity(hierarchy) {
    const levelCount = Object.keys(hierarchy.levels || {}).length;
    const clarity = levelCount >= 3 && levelCount <= 6 ? 8 : 5;

    return {
      score: clarity,
      levels: levelCount,
      assessment: levelCount >= 3 && levelCount <= 6 ? 'clear' : 'needs improvement'
    };
  }

  /**
   * Assess hierarchy consistency
   */
  assessHierarchyConsistency(hierarchy) {
    return {
      score: 7,
      consistency: 'good',
      patterns: ['consistent heading sizes', 'regular spacing']
    };
  }

  /**
   * Assess scanability
   */
  assessScanability(hierarchy) {
    return {
      score: 7,
      factors: ['clear headings', 'good spacing', 'visual breaks'],
      recommendations: ['add more white space', 'improve contrast']
    };
  }

  /**
   * Assess visual grouping
   */
  assessVisualGrouping(hierarchy) {
    return {
      score: 6,
      groups: ['header', 'main content', 'sidebar'],
      clarity: 'moderate'
    };
  }

  /**
   * Assess emphasis techniques
   */
  assessEmphasisTechniques(hierarchy) {
    return {
      score: 7,
      techniques: ['size', 'color', 'weight', 'spacing'],
      effectiveness: 'good'
    };
  }

  /**
   * Extract components from Figma data
   */
  extractComponents(figmaData) {
    const nodes = figmaData.nodes || [];
    return nodes.filter(node => node.type === 'COMPONENT' || node.type === 'INSTANCE')
      .map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        category: this.categorizeComponent(node.name)
      }));
  }

  /**
   * Get relevant components for matches
   */
  getRelevantComponents(components, matches) {
    return components.filter(comp =>
      matches.some(match => comp.name?.toLowerCase().includes(match))
    );
  }

  /**
   * Get step challenges
   */
  getStepChallenges(step) {
    const challenges = {
      'awareness': ['discoverability', 'competition', 'messaging clarity'],
      'consideration': ['information overload', 'comparison complexity'],
      'decision': ['choice paralysis', 'trust barriers'],
      'action': ['form complexity', 'technical issues'],
      'retention': ['engagement drop', 'value realization'],
      'advocacy': ['motivation barriers', 'sharing friction']
    };
    return challenges[step] || ['user experience optimization'];
  }

  /**
   * Get step opportunities
   */
  getStepOpportunities(step) {
    const opportunities = {
      'awareness': ['SEO optimization', 'content marketing', 'social proof'],
      'consideration': ['interactive demos', 'comparison tools'],
      'decision': ['recommendations', 'social proof', 'guarantees'],
      'action': ['progressive disclosure', 'error prevention'],
      'retention': ['personalization', 'gamification'],
      'advocacy': ['referral programs', 'review systems']
    };
    return opportunities[step] || ['user experience improvements'];
  }

  // User Journey Analysis Methods
  identifyTouchpoints(figmaData) {
    return [
      { point: 'landing page', type: 'digital', importance: 'high' },
      { point: 'navigation', type: 'digital', importance: 'medium' },
      { point: 'forms', type: 'digital', importance: 'high' }
    ];
  }

  identifyPotentialPainPoints(figmaData, contentAnalysis) {
    return [
      { issue: 'complex navigation', severity: 'medium', impact: 'user confusion' },
      { issue: 'long forms', severity: 'high', impact: 'abandonment risk' }
    ];
  }

  mapPrimaryFlow(journeySteps) {
    return journeySteps.map((step, index) => ({
      step: index + 1,
      phase: step.step,
      confidence: step.confidence
    }));
  }

  identifyAlternativeFlows(journeySteps) {
    return journeySteps.filter(step => step.confidence < 0.7)
      .map(step => ({ alternative: step.step, reason: 'low confidence' }));
  }

  identifyOptimizationOpportunities(painPoints) {
    return painPoints.map(pain => ({
      opportunity: `improve ${pain.issue}`,
      impact: 'medium',
      effort: 'medium'
    }));
  }

  mapEmotionalJourney(journeySteps) {
    return journeySteps.map(step => ({
      step: step.step,
      emotion: 'neutral',
      intensity: 5
    }));
  }

  identifyKeyMoments(journeySteps) {
    return journeySteps.filter(step => step.confidence > 0.8)
      .map(step => ({ moment: step.step, importance: 'high' }));
  }

  assessDropOffRisks(journeySteps, painPoints) {
    return {
      overall: 'medium',
      points: painPoints.map(pain => pain.issue),
      mitigation: ['simplify process', 'add progress indicators']
    };
  }

  identifyJourneyMetrics(journeySteps) {
    return journeySteps.map(step => ({
      step: step.step,
      metrics: ['completion rate', 'time on step', 'drop-off rate']
    }));
  }

  // Analysis Methods (Stub Implementations)
  async analyzeAccessibilityProfile(figmaData) {
    return {
      score: 7,
      compliance: 'partial',
      issues: ['color contrast', 'alt text missing'],
      recommendations: ['improve contrast ratios', 'add alt text']
    };
  }

  async analyzePersonalizationNeeds(figmaData, businessContext) {
    return {
      opportunities: ['user preferences', 'content customization'],
      complexity: 'medium',
      priority: 'medium'
    };
  }

  async analyzePerformanceUXImpact(figmaData) {
    return {
      loadTime: 'medium',
      interactivity: 'good',
      recommendations: ['optimize images', 'reduce animations']
    };
  }

  // Interaction Patterns Methods
  /**
   * TODO: Implement comprehensive input pattern analysis
   * - Identify all input types in design (text, select, radio, checkbox, etc.)
   * - Analyze form structure and field grouping
   * - Evaluate input validation and error handling patterns
   * - Assess form usability and completion flow
   */
  analyzeInputPatterns(figmaData) {
    return {
      types: ['text', 'select', 'checkbox'],
      complexity: 'medium',
      usability: 'good'
    };
  }

  analyzeNavigationPatterns(figmaData) {
    return {
      type: 'hierarchical',
      depth: 3,
      clarity: 'good'
    };
  }

  analyzeFeedbackPatterns(figmaData) {
    return {
      present: true,
      types: ['visual', 'textual'],
      effectiveness: 'medium'
    };
  }

  analyzeGestureSupport(figmaData) {
    return {
      supported: ['tap', 'scroll'],
      missing: ['swipe', 'pinch'],
      priority: 'medium'
    };
  }

  analyzeKeyboardNavigation(figmaData) {
    return {
      supported: true,
      tabOrder: 'logical',
      shortcuts: 'basic'
    };
  }

  analyzeVoiceInteractionNeeds(figmaData) {
    return {
      potential: 'medium',
      use_cases: ['search', 'navigation'],
      complexity: 'high'
    };
  }

  analyzeMultiModalNeeds(figmaData) {
    return {
      opportunities: ['voice + touch', 'gesture + visual'],
      priority: 'low'
    };
  }

  analyzeRealTimeNeeds(figmaData) {
    return {
      requirements: ['notifications', 'live updates'],
      complexity: 'medium'
    };
  }

  // Usability Assessment Methods
  assessEfficiency(figmaData) {
    return { score: 7, factors: ['task completion time', 'click efficiency'] };
  }

  assessMemorability(figmaData) {
    return { score: 6, factors: ['consistent patterns', 'clear labels'] };
  }

  assessErrorPrevention(figmaData) {
    return { score: 5, factors: ['validation', 'confirmation dialogs'] };
  }

  assessSatisfactionFactors(figmaData) {
    return { score: 7, factors: ['visual appeal', 'ease of use'] };
  }

  assessNielsenHeuristics(figmaData) {
    return {
      scores: {
        visibility: 7,
        match: 8,
        control: 6,
        consistency: 7,
        prevention: 5,
        recognition: 7,
        flexibility: 6,
        aesthetic: 8,
        recovery: 5,
        help: 4
      },
      overall: 6.3
    };
  }

  assessWCAGCompliance(figmaData) {
    return {
      level: 'AA',
      compliance: 70,
      issues: ['color contrast', 'keyboard navigation']
    };
  }

  assessMobileUsability(figmaData) {
    return {
      score: 6,
      factors: ['touch targets', 'screen size adaptation', 'thumb zones']
    };
  }

  // Pattern Assessment Methods
  assessPatternConsistency(figmaData) {
    return { score: 7, consistency: 'good', patterns: ['buttons', 'forms', 'navigation'] };
  }

  assessAffordances(figmaData) {
    return { score: 6, clarity: 'medium', improvements: ['button styling', 'link indicators'] };
  }

  assessFeedbackClarity(figmaData) {
    return { score: 7, types: ['visual', 'textual'], effectiveness: 'good' };
  }

  assessMentalModelAlignment(figmaData) {
    return { score: 6, alignment: 'moderate', familiarity: 'medium' };
  }

  assessOnboardingNeeds(figmaData) {
    return { complexity: 'medium', requirements: ['guided tour', 'tooltips'] };
  }

  suggestLearnabilityImprovements(factors) {
    return ['improve visual hierarchy', 'add help text', 'simplify navigation'];
  }

  identifyLearnabilityTests(factors) {
    return ['first-time user testing', 'task completion measurement', 'error rate analysis'];
  }

  // Cognitive Load Methods
  assessVisualComplexity(figmaData) {
    return { score: 5, factors: ['element count', 'color variety', 'layout complexity'] };
  }

  assessInformationDensity(contentAnalysis) {
    const wordCount = contentAnalysis.textContent?.split(' ').length || 0;
    const density = wordCount > 500 ? 7 : wordCount > 200 ? 5 : 3;
    return { score: density, wordCount, assessment: density > 6 ? 'high' : 'medium' };
  }

  assessChoiceComplexity(figmaData) {
    return { score: 4, choices: 'manageable', recommendations: ['group options', 'progressive disclosure'] };
  }

  suggestLoadReductionStrategies(visual, information, choice) {
    return ['reduce visual clutter', 'chunk information', 'limit choices'];
  }

  assessProgressiveDisclosureNeeds(figmaData) {
    return { potential: 'high', areas: ['forms', 'settings', 'advanced features'] };
  }

  assessChunkingOpportunities(contentAnalysis) {
    return { opportunities: ['group related content', 'use headers', 'add white space'] };
  }

  assessPrioritizationNeeds(figmaData) {
    return { needed: true, approach: 'importance-based', areas: ['navigation', 'content'] };
  }

  identifyPrimaryLoadFactors(visual, information, choice) {
    const factors = [
      { type: 'visual', score: visual.score },
      { type: 'information', score: information.score },
      { type: 'choice', score: choice.score }
    ];
    return factors.sort((a, b) => b.score - a.score);
  }

  getCognitiveLoadRecommendations(score) {
    if (score > 7) {return ['urgent simplification needed', 'reduce information', 'improve organization'];}
    if (score > 5) {return ['moderate simplification', 'better grouping', 'progressive disclosure'];}
    return ['minor optimizations', 'maintain current approach'];
  }

  // Emotional Design Methods
  assessEmotionalTone(figmaData) {
    return { tone: 'professional', warmth: 'medium', energy: 'moderate' };
  }

  assessTrustElements(figmaData) {
    return { present: ['security badges', 'testimonials'], missing: ['certifications'] };
  }

  identifyDelightOpportunities(figmaData) {
    return ['micro-animations', 'personalized messages', 'easter eggs'];
  }

  identifyFrustrationRisks(figmaData) {
    return ['slow loading', 'complex forms', 'unclear navigation'];
  }

  alignEmotionsWithBrand(figmaData, businessContext) {
    const brand = businessContext.brand || 'professional';
    return { alignment: 'good', tone: brand, consistency: 'medium' };
  }

  assessCulturalFactors(figmaData, businessContext) {
    return { considerations: ['color meanings', 'text direction', 'imagery'], impact: 'medium' };
  }

  mapEmotionalStates(figmaData) {
    return [
      { phase: 'entry', emotion: 'curious', intensity: 6 },
      { phase: 'engagement', emotion: 'interested', intensity: 7 },
      { phase: 'action', emotion: 'confident', intensity: 8 }
    ];
  }

  identifyMicroInteractionNeeds(figmaData) {
    return ['button hover', 'form validation', 'loading states'];
  }

  // Helper Methods
  categorizeBySize(nodes) {
    return {
      large: nodes.filter(n => (n.width || 0) > 200),
      medium: nodes.filter(n => (n.width || 0) > 100 && (n.width || 0) <= 200),
      small: nodes.filter(n => (n.width || 0) <= 100)
    };
  }

  extractTypographyLevels(nodes) {
    return {
      h1: nodes.filter(n => n.fontSize > 24),
      h2: nodes.filter(n => n.fontSize > 18 && n.fontSize <= 24),
      body: nodes.filter(n => n.fontSize <= 18)
    };
  }

  extractSpacingPatterns(nodes) {
    return { consistent: true, patterns: ['8px', '16px', '24px'] };
  }

  extractColorHierarchy(nodes) {
    return { primary: '#000000', secondary: '#666666', accent: '#0066cc' };
  }

  categorizeComponent(name) {
    const lowerName = (name || '').toLowerCase();
    if (lowerName.includes('button')) {return 'interactive';}
    if (lowerName.includes('form') || lowerName.includes('input')) {return 'form';}
    if (lowerName.includes('nav')) {return 'navigation';}
    return 'content';
  }

  // Conversion and Mobile UX Methods (Basic Stubs)
  identifyConversionGoals(figmaData, businessModel) { return { primary: 'engagement', secondary: 'retention' }; }
  identifyTrustSignals(figmaData) { return ['security badges', 'testimonials']; }
  identifyFrictionPoints(figmaData) { return ['complex forms', 'multiple steps']; }
  identifyPersuasionElements(figmaData) { return ['social proof', 'scarcity']; }
  identifySocialProofOpportunities(figmaData) { return ['user reviews', 'usage stats']; }
  assessUrgencyElements(figmaData) { return { present: false, opportunities: ['limited time offers'] }; }
  assessValuePropositionClarity(figmaData) { return { clarity: 'medium', improvements: ['clearer messaging'] }; }
  analyzeCTAOptimization(figmaData) { return { effectiveness: 'good', suggestions: ['contrast', 'placement'] }; }
  analyzeFormOptimization(figmaData) { return { complexity: 'medium', suggestions: ['reduce fields'] }; }
  identifyAbandonmentPrevention(figmaData) { return ['progress indicators', 'save draft']; }

  // Mobile UX Methods (Basic Stubs)
  assessTouchTargets(figmaData) { return { adequate: true, minSize: '44px', issues: [] }; }
  assessThumbZoneOptimization(figmaData) { return { optimized: 'partial', recommendations: ['move nav lower'] }; }
  assessScreenSizeConsiderations(figmaData) { return { responsive: true, breakpoints: ['mobile', 'tablet'] }; }
  assessOrientationHandling(figmaData) { return { supported: ['portrait'], missing: ['landscape'] }; }
  assessMobileGestures(figmaData) { return { supported: ['tap', 'scroll'], potential: ['swipe'] }; }
  assessMobileContext(figmaData) { return { considerations: ['one-handed use', 'on-the-go'] }; }
  assessMobilePerformance(figmaData) { return { optimized: 'partial', issues: ['large images'] }; }
  assessConnectivityConsiderations(figmaData) { return { offline: false, recommendations: ['cache key content'] }; }
  assessBatteryOptimization(figmaData) { return { optimized: true, animations: 'minimal' }; }
  assessNotificationNeeds(figmaData) { return { required: false, potential: ['updates', 'reminders'] }; }
}