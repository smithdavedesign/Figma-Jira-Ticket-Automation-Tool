/**
 * Business Context Intelligence
 *
 * Provides business domain knowledge and strategic context
 * to help the LLM understand the purpose and priorities
 * behind design decisions.
 */

export class BusinessContextIntelligence {
  constructor() {
    this.industryPatterns = new Map();
    this.businessModelMap = new Map();
    this.userJourneyMap = new Map();
    this.competitorPatterns = new Map();
  }

  /**
   * Analyze comprehensive business context
   */
  async analyzeBusinessContext(fileContext, contentAnalysis) {
    const context = {
      industryDomain: await this.identifyIndustryDomain(fileContext),
      businessModel: await this.inferBusinessModel(fileContext, contentAnalysis),
      userPersonas: await this.inferUserPersonas(contentAnalysis),
      businessGoals: await this.inferBusinessGoals(fileContext, contentAnalysis),
      competitivePosition: await this.analyzeCompetitivePosition(fileContext),
      marketContext: await this.analyzeMarketContext(fileContext),
      stakeholderNeeds: await this.analyzeStakeholderNeeds(contentAnalysis),
      businessConstraints: await this.identifyBusinessConstraints(fileContext),
      successMetrics: await this.identifySuccessMetrics(fileContext, contentAnalysis),
      riskFactors: await this.identifyRiskFactors(fileContext, contentAnalysis)
    };

    return context;
  }

  /**
   * Identify industry domain and patterns
   */
  async identifyIndustryDomain(fileContext) {
    const fileName = fileContext.fileName?.toLowerCase() || '';
    const projectName = fileContext.projectName?.toLowerCase() || '';

    const industryKeywords = {
      'fintech': ['bank', 'finance', 'payment', 'wallet', 'loan', 'invest', 'trading', 'crypto'],
      'healthcare': ['health', 'medical', 'patient', 'doctor', 'clinic', 'hospital', 'wellness'],
      'ecommerce': ['shop', 'store', 'cart', 'checkout', 'product', 'marketplace', 'retail'],
      'saas': ['dashboard', 'analytics', 'workflow', 'collaboration', 'productivity', 'tools'],
      'education': ['learn', 'course', 'student', 'teacher', 'education', 'training', 'academy'],
      'real-estate': ['property', 'real estate', 'listing', 'apartment', 'house', 'rental'],
      'travel': ['hotel', 'flight', 'booking', 'travel', 'trip', 'vacation', 'destination'],
      'entertainment': ['game', 'movie', 'music', 'streaming', 'media', 'entertainment'],
      'social': ['social', 'community', 'chat', 'messaging', 'networking', 'dating'],
      'enterprise': ['enterprise', 'corporate', 'business', 'crm', 'erp', 'hr']
    };

    let detectedIndustry = 'general';
    let confidence = 0;

    // Enhanced analysis - check file name, project name, and content
    const combinedText = `${fileName} ${projectName}`.toLowerCase();

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      const matches = keywords.filter(keyword => combinedText.includes(keyword)).length;
      const industryConfidence = matches / keywords.length;

      if (industryConfidence > confidence) {
        confidence = industryConfidence;
        detectedIndustry = industry;
      }
    }

    // If no strong match found, check for additional context indicators
    if (confidence < 0.3) {
      const contextClues = this.extractContextualClues(fileContext);
      if (contextClues.industry && contextClues.confidence > confidence) {
        detectedIndustry = contextClues.industry;
        confidence = contextClues.confidence;
      }
    }

    return {
      domain: detectedIndustry,
      confidence: confidence,
      patterns: this.getIndustryPatterns(detectedIndustry),
      regulations: this.getIndustryRegulations(detectedIndustry),
      bestPractices: this.getIndustryBestPractices(detectedIndustry)
    };
  }

  /**
   * Extract additional contextual clues for industry detection
   */
  extractContextualClues(fileContext) {
    // Check for URLs, descriptions, team names, etc.
    const clues = {
      industry: null,
      confidence: 0
    };

    // Additional real-world context extraction would go here
    // This is where we'd integrate with actual Figma metadata, team info, etc.

    return clues;
  }

  /**
   * Get industry-specific regulations and compliance requirements
   */
  getIndustryRegulations(industry) {
    const regulations = {
      'fintech': ['GDPR', 'PCI DSS', 'PSD2', 'banking regulations'],
      'healthcare': ['HIPAA', 'FDA guidelines', 'medical device standards'],
      'ecommerce': ['GDPR', 'CCPA', 'consumer protection laws'],
      'education': ['FERPA', 'COPPA', 'accessibility standards'],
      'general': ['GDPR', 'accessibility standards']
    };

    return regulations[industry] || regulations['general'];
  }

  /**
   * Get industry-specific best practices
   */
  getIndustryBestPractices(industry) {
    const practices = {
      'fintech': ['multi-factor authentication', 'clear fee disclosure', 'fraud prevention'],
      'healthcare': ['patient privacy', 'medical accuracy', 'accessibility compliance'],
      'ecommerce': ['secure checkout', 'product reviews', 'return policy clarity'],
      'education': ['inclusive design', 'progress tracking', 'parental controls'],
      'general': ['user privacy', 'accessibility', 'clear navigation']
    };

    return practices[industry] || practices['general'];
  }

  /**
   * Get monetization strategy for business model
   */
  getMonetizationStrategy(businessModel) {
    const strategies = {
      'saas': ['subscription', 'freemium', 'usage-based'],
      'ecommerce': ['transaction-fees', 'marketplace-commission', 'premium-listings'],
      'marketplace': ['commission', 'listing-fees', 'premium-features'],
      'fintech': ['transaction-fees', 'interest', 'premium-services'],
      'general': ['subscription', 'one-time-purchase', 'advertising']
    };

    return strategies[businessModel] || strategies['general'];
  }

  /**
   * Get business KPIs for model
   */
  getBusinessKPIs(businessModel) {
    const kpis = {
      'saas': ['MRR', 'churn-rate', 'CAC', 'LTV'],
      'ecommerce': ['conversion-rate', 'AOV', 'cart-abandonment', 'ROAS'],
      'marketplace': ['GMV', 'take-rate', 'active-users', 'liquidity'],
      'fintech': ['AUM', 'transaction-volume', 'compliance-score', 'fraud-rate'],
      'general': ['user-acquisition', 'engagement', 'retention', 'revenue']
    };

    return kpis[businessModel] || kpis['general'];
  }

  /**
   * Get user acquisition strategy
   */
  getUserAcquisitionStrategy(businessModel) {
    const strategies = {
      'saas': ['content-marketing', 'free-trial', 'partner-referrals'],
      'ecommerce': ['social-media', 'influencer-marketing', 'SEO'],
      'marketplace': ['network-effects', 'supply-side-growth', 'demand-generation'],
      'fintech': ['trust-building', 'regulatory-compliance', 'financial-education'],
      'general': ['digital-marketing', 'word-of-mouth', 'partnerships']
    };

    return strategies[businessModel] || strategies['general'];
  }

  /**
   * Get industry-specific patterns and expectations
   */
  getIndustryPatterns(industry) {
    const patterns = {
      'fintech': {
        security: 'Critical - multi-factor auth, encryption, compliance',
        trust: 'Essential - clear security indicators, transparent fees',
        compliance: 'GDPR, PCI DSS, PSD2, banking regulations',
        userExperience: 'Simple onboarding, clear financial data, mobile-first'
      },
      'healthcare': {
        privacy: 'HIPAA compliance, patient data protection',
        accessibility: 'ADA compliance, inclusive design critical',
        trust: 'Professional appearance, clear credentials',
        usability: 'Clear navigation, minimal cognitive load'
      },
      'ecommerce': {
        conversion: 'Clear CTAs, trust signals, social proof',
        performance: 'Fast loading, mobile optimization critical',
        security: 'Secure checkout, payment protection',
        experience: 'Product discovery, easy returns'
      },
      'saas': {
        onboarding: 'Progressive disclosure, guided tours',
        efficiency: 'Keyboard shortcuts, bulk actions',
        data: 'Clear data visualization, export capabilities',
        scalability: 'Multi-tenant considerations'
      },
      'education': {
        accessibility: 'WCAG compliance, diverse learning styles',
        engagement: 'Interactive elements, progress tracking',
        simplicity: 'Clear navigation, age-appropriate design',
        mobile: 'Mobile-first for student access'
      }
    };

    return patterns[industry] || patterns['general'] || {};
  }

  /**
   * Infer business model from context
   */
  async inferBusinessModel(fileContext, contentAnalysis) {
    const content = contentAnalysis.textContent?.toLowerCase() || '';

    const businessModels = {
      'subscription': ['subscribe', 'monthly', 'annual', 'plan', 'upgrade', 'tier'],
      'marketplace': ['seller', 'buyer', 'commission', 'listing', 'marketplace'],
      'freemium': ['free', 'premium', 'upgrade', 'trial', 'limits'],
      'ecommerce': ['buy', 'cart', 'checkout', 'shipping', 'price', 'product'],
      'advertising': ['ads', 'sponsored', 'advertiser', 'campaign', 'impressions'],
      'enterprise': ['enterprise', 'team', 'organization', 'admin', 'permissions'],
      'platform': ['developer', 'api', 'integration', 'third-party', 'ecosystem']
    };

    let detectedModel = 'unknown';
    let confidence = 0;

    for (const [model, keywords] of Object.entries(businessModels)) {
      const matches = keywords.filter(keyword => content.includes(keyword)).length;
      const modelConfidence = matches / keywords.length;

      if (modelConfidence > confidence) {
        confidence = modelConfidence;
        detectedModel = model;
      }
    }

    return {
      model: detectedModel,
      confidence: confidence,
      monetization: this.getMonetizationStrategy(detectedModel),
      kpis: this.getBusinessKPIs(detectedModel),
      userAcquisition: this.getUserAcquisitionStrategy(detectedModel)
    };
  }

  /**
   * Infer business goals from context and content
   */
  async inferBusinessGoals(fileContext, contentAnalysis) {
    const content = contentAnalysis.textContent?.toLowerCase() || '';
    const fileName = fileContext.fileName?.toLowerCase() || '';

    const goalIndicators = {
      'user-acquisition': ['sign up', 'register', 'join', 'onboard', 'get started'],
      'conversion': ['buy', 'purchase', 'checkout', 'subscribe', 'upgrade'],
      'engagement': ['share', 'like', 'comment', 'follow', 'connect'],
      'retention': ['dashboard', 'profile', 'settings', 'preferences', 'history'],
      'revenue': ['pricing', 'plan', 'payment', 'billing', 'invoice'],
      'efficiency': ['workflow', 'automation', 'bulk', 'batch', 'quick'],
      'growth': ['referral', 'invite', 'network', 'viral', 'sharing'],
      'trust': ['security', 'privacy', 'verified', 'certified', 'secure'],
      'satisfaction': ['feedback', 'rating', 'review', 'survey', 'support'],
      'compliance': ['terms', 'policy', 'legal', 'compliance', 'regulation']
    };

    const detectedGoals = [];
    const combinedText = `${content} ${fileName}`;

    for (const [goal, keywords] of Object.entries(goalIndicators)) {
      const matches = keywords.filter(keyword => combinedText.includes(keyword)).length;
      if (matches > 0) {
        detectedGoals.push({
          goal: goal,
          confidence: matches / keywords.length,
          indicators: keywords.filter(keyword => combinedText.includes(keyword)),
          priority: this.getGoalPriority(goal),
          metrics: this.getGoalMetrics(goal)
        });
      }
    }

    // Sort by confidence and priority
    const sortedGoals = detectedGoals.sort((a, b) => {
      const priorityWeight = { 'high': 3, 'medium': 2, 'low': 1 };
      return (b.confidence * priorityWeight[b.priority]) - (a.confidence * priorityWeight[a.priority]);
    });

    return {
      primary: sortedGoals.slice(0, 3),
      secondary: sortedGoals.slice(3, 6),
      overall: sortedGoals.length > 0 ? sortedGoals[0].goal : 'user-experience',
      confidence: sortedGoals.length > 0 ? sortedGoals[0].confidence : 0.1
    };
  }

  /**
   * Get goal priority level
   */
  getGoalPriority(goal) {
    const priorities = {
      'conversion': 'high',
      'user-acquisition': 'high',
      'revenue': 'high',
      'retention': 'high',
      'engagement': 'medium',
      'efficiency': 'medium',
      'trust': 'medium',
      'growth': 'medium',
      'satisfaction': 'low',
      'compliance': 'low'
    };

    return priorities[goal] || 'medium';
  }

  /**
   * Get metrics associated with business goals
   */
  getGoalMetrics(goal) {
    const metrics = {
      'user-acquisition': ['sign-up-rate', 'cost-per-acquisition', 'conversion-funnel'],
      'conversion': ['conversion-rate', 'cart-abandonment', 'checkout-completion'],
      'engagement': ['session-duration', 'page-views', 'interaction-rate'],
      'retention': ['daily-active-users', 'churn-rate', 'feature-adoption'],
      'revenue': ['average-order-value', 'lifetime-value', 'revenue-per-user'],
      'efficiency': ['task-completion-time', 'error-rate', 'user-satisfaction'],
      'growth': ['referral-rate', 'viral-coefficient', 'network-growth'],
      'trust': ['security-incidents', 'user-trust-score', 'compliance-rate'],
      'satisfaction': ['nps-score', 'customer-satisfaction', 'support-tickets'],
      'compliance': ['audit-score', 'regulatory-adherence', 'privacy-compliance']
    };

    return metrics[goal] || ['user-satisfaction', 'task-completion'];
  }

  /**
   * Infer user personas from content analysis
   */
  async inferUserPersonas(contentAnalysis) {
    const content = contentAnalysis.textContent?.toLowerCase() || '';

    const personaIndicators = {
      'b2b-executive': ['dashboard', 'analytics', 'roi', 'enterprise', 'team', 'admin'],
      'b2b-end-user': ['workflow', 'task', 'collaboration', 'productivity', 'daily'],
      'consumer-young': ['social', 'mobile', 'sharing', 'trendy', 'discover'],
      'consumer-professional': ['career', 'professional', 'network', 'growth'],
      'consumer-family': ['family', 'kids', 'safe', 'parental', 'household'],
      'technical-user': ['api', 'developer', 'integration', 'code', 'technical'],
      'senior-user': ['simple', 'clear', 'help', 'support', 'easy']
    };

    const detectedPersonas = [];

    for (const [persona, keywords] of Object.entries(personaIndicators)) {
      const matches = keywords.filter(keyword => content.includes(keyword)).length;
      if (matches > 0) {
        detectedPersonas.push({
          type: persona,
          confidence: matches / keywords.length,
          needs: this.getPersonaNeeds(persona),
          painPoints: this.getPersonaPainPoints(persona),
          behaviors: this.getPersonaBehaviors(persona)
        });
      }
    }

    return detectedPersonas.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get persona-specific needs
   */
  getPersonaNeeds(personaType) {
    const needs = {
      'b2b-executive': ['high-level insights', 'quick decision making', 'strategic overview'],
      'b2b-end-user': ['efficient workflows', 'minimal training', 'reliable performance'],
      'consumer-young': ['social features', 'mobile optimization', 'discovery'],
      'consumer-professional': ['networking', 'career advancement', 'credibility'],
      'technical-user': ['documentation', 'APIs', 'customization', 'integration'],
      'senior-user': ['simplicity', 'large text', 'clear navigation', 'help']
    };

    return needs[personaType] || ['general usability', 'clear interface'];
  }

  /**
   * Get persona-specific pain points
   */
  getPersonaPainPoints(personaType) {
    const painPoints = {
      'b2b-executive': ['information overload', 'slow decision making', 'lack of strategic insight'],
      'b2b-end-user': ['complex workflows', 'frequent training needs', 'system unreliability'],
      'consumer-young': ['boring interfaces', 'slow mobile experience', 'hard to discover content'],
      'consumer-professional': ['limited networking', 'unclear career paths', 'credibility concerns'],
      'technical-user': ['poor documentation', 'limited APIs', 'no customization', 'integration challenges'],
      'senior-user': ['complex interfaces', 'small text', 'confusing navigation', 'lack of help']
    };

    return painPoints[personaType] || ['usability issues', 'unclear interface'];
  }

  /**
   * Get persona-specific behaviors
   */
  getPersonaBehaviors(personaType) {
    const behaviors = {
      'b2b-executive': ['quick scanning', 'delegate tasks', 'focus on ROI', 'multi-device usage'],
      'b2b-end-user': ['routine-focused', 'efficiency-seeking', 'collaborative', 'task-oriented'],
      'consumer-young': ['social sharing', 'mobile-first', 'exploratory', 'trend-following'],
      'consumer-professional': ['goal-oriented', 'network-building', 'reputation-conscious', 'efficiency-focused'],
      'technical-user': ['documentation-reading', 'experimentation', 'customization', 'integration-focused'],
      'senior-user': ['cautious exploration', 'help-seeking', 'routine-preferring', 'assistance-needing']
    };

    return behaviors[personaType] || ['general usage patterns'];
  }

  /**
   * Analyze competitive positioning
   */
  async analyzeCompetitivePosition(fileContext) {
    // This would integrate with competitive intelligence APIs
    // For now, provide framework for competitive analysis

    return {
      positioning: 'differentiation-needed',
      advantages: ['user-experience-focus', 'modern-design'],
      challenges: ['market-saturation', 'user-acquisition'],
      opportunities: ['mobile-optimization', 'ai-integration'],
      threats: ['big-tech-competition', 'regulatory-changes']
    };
  }

  /**
   * Identify success metrics based on business context
   */
  async identifySuccessMetrics(fileContext, contentAnalysis) {
    const businessModel = await this.inferBusinessModel(fileContext, contentAnalysis);

    const metricsByModel = {
      'subscription': ['MRR', 'churn-rate', 'LTV', 'conversion-rate'],
      'marketplace': ['GMV', 'take-rate', 'active-users', 'transaction-volume'],
      'freemium': ['conversion-rate', 'feature-adoption', 'upgrade-rate'],
      'ecommerce': ['conversion-rate', 'AOV', 'cart-abandonment', 'retention'],
      'advertising': ['CTR', 'CPM', 'user-engagement', 'time-on-site'],
      'enterprise': ['user-adoption', 'feature-usage', 'admin-efficiency'],
      'platform': ['API-usage', 'developer-adoption', 'integration-success']
    };

    return {
      primary: metricsByModel[businessModel.model] || ['user-engagement', 'task-completion'],
      secondary: ['user-satisfaction', 'performance', 'accessibility-score'],
      technical: ['page-load-time', 'error-rate', 'uptime'],
      business: ['user-acquisition', 'retention', 'revenue-impact']
    };
  }

  /**
   * Identify business constraints and requirements
   */
  async identifyBusinessConstraints(fileContext) {
    return {
      timeline: 'aggressive', // Could be inferred from project context
      budget: 'moderate', // Could be inferred from team size/scope
      compliance: this.getComplianceRequirements(fileContext),
      technical: ['browser-support', 'mobile-responsive', 'accessibility'],
      business: ['brand-consistency', 'user-testing', 'stakeholder-approval'],
      performance: ['load-time-3s', 'mobile-first', 'SEO-optimized']
    };
  }

  /**
   * Get compliance requirements based on context
   */
  getComplianceRequirements(fileContext) {
    const requirements = ['GDPR']; // Base requirement

    // Add industry-specific requirements
    const fileName = fileContext.fileName?.toLowerCase() || '';

    if (fileName.includes('health') || fileName.includes('medical')) {
      requirements.push('HIPAA');
    }
    if (fileName.includes('finance') || fileName.includes('payment')) {
      requirements.push('PCI-DSS', 'SOX');
    }
    if (fileName.includes('education') || fileName.includes('school')) {
      requirements.push('FERPA', 'COPPA');
    }

    return requirements;
  }

  /**
   * Analyze market context and positioning
   */
  async analyzeMarketContext(fileContext) {
    return {
      marketSize: 'growing',
      competition: 'moderate',
      trends: ['mobile-first', 'ai-integration', 'privacy-focused'],
      opportunities: ['emerging-markets', 'new-technologies', 'changing-regulations'],
      barriers: ['user-acquisition-cost', 'market-saturation', 'regulatory-compliance'],
      timing: 'favorable'
    };
  }

  /**
   * Analyze stakeholder needs and priorities
   */
  async analyzeStakeholderNeeds(contentAnalysis) {
    const content = contentAnalysis.textContent?.toLowerCase() || '';

    const stakeholderTypes = {
      'end-users': ['user', 'customer', 'member', 'subscriber'],
      'business-owners': ['revenue', 'profit', 'growth', 'roi'],
      'developers': ['api', 'integration', 'technical', 'code'],
      'managers': ['dashboard', 'report', 'analytics', 'kpi'],
      'support-staff': ['help', 'support', 'ticket', 'documentation'],
      'compliance-officers': ['regulation', 'compliance', 'audit', 'policy']
    };

    const detectedStakeholders = [];

    for (const [stakeholder, keywords] of Object.entries(stakeholderTypes)) {
      const matches = keywords.filter(keyword => content.includes(keyword)).length;
      if (matches > 0) {
        detectedStakeholders.push({
          type: stakeholder,
          priority: matches > 2 ? 'high' : matches > 1 ? 'medium' : 'low',
          needs: this.getStakeholderNeeds(stakeholder),
          influence: this.getStakeholderInfluence(stakeholder)
        });
      }
    }

    return detectedStakeholders.length > 0 ? detectedStakeholders : [
      {
        type: 'end-users',
        priority: 'high',
        needs: ['usability', 'performance', 'reliability'],
        influence: 'high'
      }
    ];
  }

  /**
   * Get specific needs for stakeholder type
   */
  getStakeholderNeeds(stakeholderType) {
    const needs = {
      'end-users': ['ease-of-use', 'performance', 'reliability', 'support'],
      'business-owners': ['roi', 'scalability', 'competitive-advantage', 'risk-mitigation'],
      'developers': ['documentation', 'apis', 'maintainability', 'extensibility'],
      'managers': ['visibility', 'control', 'reporting', 'team-productivity'],
      'support-staff': ['troubleshooting-tools', 'user-guides', 'monitoring', 'escalation'],
      'compliance-officers': ['audit-trails', 'data-protection', 'regulatory-reporting', 'risk-assessment']
    };

    return needs[stakeholderType] || ['general-satisfaction'];
  }

  /**
   * Get stakeholder influence level
   */
  getStakeholderInfluence(stakeholderType) {
    const influence = {
      'end-users': 'high',
      'business-owners': 'high',
      'managers': 'high',
      'compliance-officers': 'medium',
      'developers': 'medium',
      'support-staff': 'low'
    };

    return influence[stakeholderType] || 'medium';
  }

  /**
   * Identify potential risk factors
   */
  async identifyRiskFactors(fileContext, contentAnalysis) {
    const content = contentAnalysis.textContent?.toLowerCase() || '';
    const fileName = fileContext.fileName?.toLowerCase() || '';

    const riskIndicators = {
      'security': ['password', 'login', 'payment', 'personal', 'sensitive'],
      'compliance': ['gdpr', 'privacy', 'data', 'legal', 'regulation'],
      'technical': ['complex', 'integration', 'api', 'system', 'performance'],
      'business': ['competitive', 'market', 'revenue', 'customer', 'retention'],
      'user-experience': ['confusing', 'difficult', 'error', 'slow', 'broken'],
      'scalability': ['growth', 'scale', 'volume', 'capacity', 'load']
    };

    const identifiedRisks = [];
    const combinedText = `${content} ${fileName}`;

    for (const [riskType, keywords] of Object.entries(riskIndicators)) {
      const matches = keywords.filter(keyword => combinedText.includes(keyword)).length;
      if (matches > 0) {
        identifiedRisks.push({
          type: riskType,
          severity: matches > 3 ? 'high' : matches > 1 ? 'medium' : 'low',
          likelihood: this.getRiskLikelihood(riskType),
          mitigation: this.getRiskMitigation(riskType),
          impact: this.getRiskImpact(riskType)
        });
      }
    }

    return identifiedRisks.length > 0 ? identifiedRisks : [
      {
        type: 'user-experience',
        severity: 'medium',
        likelihood: 'medium',
        mitigation: ['user-testing', 'iterative-design', 'feedback-collection'],
        impact: 'user-satisfaction'
      }
    ];
  }

  /**
   * Get risk likelihood assessment
   */
  getRiskLikelihood(riskType) {
    const likelihoods = {
      'security': 'high',
      'compliance': 'medium',
      'technical': 'medium',
      'business': 'high',
      'user-experience': 'medium',
      'scalability': 'low'
    };

    return likelihoods[riskType] || 'medium';
  }

  /**
   * Get risk mitigation strategies
   */
  getRiskMitigation(riskType) {
    const mitigations = {
      'security': ['security-audit', 'penetration-testing', 'encryption', 'access-controls'],
      'compliance': ['legal-review', 'privacy-impact-assessment', 'data-mapping', 'training'],
      'technical': ['code-review', 'testing', 'monitoring', 'documentation'],
      'business': ['market-research', 'competitive-analysis', 'diversification', 'partnerships'],
      'user-experience': ['user-research', 'usability-testing', 'accessibility-audit', 'feedback-loops'],
      'scalability': ['performance-testing', 'architecture-review', 'capacity-planning', 'monitoring']
    };

    return mitigations[riskType] || ['regular-review', 'monitoring'];
  }

  /**
   * Get risk impact assessment
   */
  getRiskImpact(riskType) {
    const impacts = {
      'security': 'reputation-and-legal',
      'compliance': 'legal-and-financial',
      'technical': 'performance-and-reliability',
      'business': 'revenue-and-growth',
      'user-experience': 'user-satisfaction-and-retention',
      'scalability': 'performance-and-cost'
    };

    return impacts[riskType] || 'general-business-impact';
  }
}