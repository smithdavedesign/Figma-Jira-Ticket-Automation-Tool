/**
 * 🤖 Claude AI Adapter - Architectural Reasoning & Design Analysis
 *
 * Specialized adapter for Anthropic's Claude model, optimized for:
 * - Architectural analysis and recommendations
 * - Design pattern recognition
 * - System design reasoning
 * - Trade-off analysis and decision support
 */

/**
 * @typedef {Object} ClaudeConfig
 * @property {string} apiKey - API key for Claude
 * @property {'claude-3-opus'|'claude-3-sonnet'|'claude-3-haiku'} model - Claude model to use
 * @property {number} maxTokens - Maximum tokens per request
 * @property {number} temperature - Response creativity (0-1)
 */

/**
 * @typedef {Object} ArchitecturalAnalysisOptions
 * @property {('patterns'|'scalability'|'maintainability'|'performance'|'accessibility')[]} focusAreas - Areas to focus analysis on
 * @property {'surface'|'detailed'|'comprehensive'} depth - Analysis depth
 * @property {boolean} includeAlternatives - Include alternative approaches
 * @property {boolean} includeTradeoffs - Include tradeoff analysis
 * @property {'startup'|'enterprise'|'agency'|'product'} context - Project context
 */

/**
 * @typedef {Object} ClaudeResponse
 * @property {string} content - Response content
 * @property {{inputTokens: number, outputTokens: number, totalTokens: number}} usage - Token usage
 * @property {'end_turn'|'max_tokens'|'stop_sequence'} stopReason - Stop reason
 */

/**
 * @typedef {Object} DesignPattern
 * @property {string} name - Pattern name
 * @property {string} usage - Usage description
 * @property {string[]} benefits - Pattern benefits
 * @property {string} implementation - Implementation guide
 */

/**
 * @typedef {Object} ArchitecturalRecommendation
 * @property {string} category - Recommendation category
 * @property {'high'|'medium'|'low'} priority - Priority level
 * @property {string} description - Recommendation description
 * @property {string} implementation - Implementation details
 * @property {string} impact - Expected impact
 */

/**
 * @typedef {Object} Tradeoff
 * @property {string} decision - Decision being evaluated
 * @property {string[]} pros - Advantages
 * @property {string[]} cons - Disadvantages
 * @property {string} recommendation - Final recommendation
 */

/**
 * @typedef {Object} Improvement
 * @property {string} area - Improvement area
 * @property {string} description - Improvement description
 * @property {'low'|'medium'|'high'} effort - Implementation effort
 * @property {'low'|'medium'|'high'} impact - Expected impact
 * @property {string} implementation - Implementation approach
 */

/**
 * @typedef {Object} DesignAnalysis
 * @property {number} complexity - Design complexity score
 * @property {string} summary - Analysis summary
 * @property {string[]} strengths - Design strengths
 * @property {string[]} weaknesses - Design weaknesses
 * @property {string[]} opportunities - Improvement opportunities
 */

/**
 * @typedef {Object} DecisionEvaluation
 * @property {string} decision - Decision being evaluated
 * @property {number} score - Evaluation score (0-100)
 * @property {string} rationale - Evaluation rationale
 * @property {string[]} alternatives - Alternative approaches
 * @property {string} recommendation - Final recommendation
 */

/**
 * @typedef {Object} SystemDesign
 * @property {string[]} components - System components
 * @property {string[]} layers - Architecture layers
 * @property {string[]} patterns - Recommended patterns
 * @property {string} dataFlow - Data flow description
 * @property {string[]} technologies - Recommended technologies
 */

export class ClaudeAdapter {
  /**
   * Create Claude AI adapter
   * @param {ClaudeConfig} config - Claude configuration
   */
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://api.anthropic.com/v1';
  }

  /**
   * Perform comprehensive architectural analysis
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeArchitecture(designSpec, options) {
    const startTime = Date.now();

    try {
      console.log('🏗️ Analyzing architecture with Claude...');

      // Analyze design patterns
      const patterns = await this.analyzeDesignPatterns(designSpec, options);

      // Generate architectural recommendations
      const recommendations = await this.generateArchitecturalRecommendations(designSpec, options);

      // Analyze trade-offs
      const tradeoffs = options.includeTradeoffs
        ? await this.analyzeTradeoffs(designSpec, options)
        : [];

      // Suggest improvements
      const improvements = await this.suggestImprovements(designSpec, options);

      // Perform overall design analysis
      const designAnalysis = await this.performDesignAnalysis(designSpec, options);

      const processingTime = Date.now() - startTime;

      return {
        designAnalysis,
        architecturalRecommendations: recommendations,
        patterns,
        tradeoffs,
        improvements,
        metadata: {
          model: this.config.model,
          processingTime,
          confidence: this.calculateAnalysisConfidence(designSpec, patterns, recommendations)
        }
      };

    } catch (error) {
      console.error('❌ Claude architectural analysis failed:', error);
      throw new Error(`Claude adapter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Evaluate design decisions and suggest alternatives
   * @param {Object} designSpec - Design specification
   * @param {string[]} decisions - Decisions to evaluate
   * @param {Object} context - Evaluation context
   * @returns {Promise<DecisionEvaluation[]>} Decision evaluations
   */
  async evaluateDesignDecisions(designSpec, decisions, context) {
    const evaluations = [];

    try {
      for (const decision of decisions) {
        const prompt = this.buildDecisionEvaluationPrompt(designSpec, decision, context);
        const response = await this.callClaudeAPI(prompt);
        const evaluation = this.parseDecisionEvaluation(response.content, decision);
        evaluations.push(evaluation);
      }

      return evaluations;

    } catch (error) {
      console.error('❌ Error evaluating design decisions:', error);
      throw error;
    }
  }

  /**
   * Identify potential risks in the design
   * @param {Object} designSpec - Design specification
   * @param {Object} context - Risk context
   * @returns {Promise<Object[]>} Identified risks
   */
  async identifyRisks(designSpec, context) {
    try {
      const prompt = this.buildRiskAnalysisPrompt(designSpec, context);
      const response = await this.callClaudeAPI(prompt);
      return this.parseRiskAnalysis(response.content);

    } catch (error) {
      console.error('❌ Error identifying risks:', error);
      throw error;
    }
  }

  /**
   * Generate system design from requirements
   * @param {Object} requirements - System requirements
   * @param {Object} constraints - Design constraints
   * @returns {Promise<SystemDesign>} Generated system design
   */
  async generateSystemDesign(requirements, constraints) {
    try {
      const prompt = this.buildSystemDesignPrompt(requirements, constraints);
      const response = await this.callClaudeAPI(prompt);
      return this.parseSystemDesign(response.content);

    } catch (error) {
      console.error('❌ Error generating system design:', error);
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE ANALYSIS METHODS
  // =============================================================================

  /**
   * Analyze design patterns in the specification
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {Promise<DesignPattern[]>} Identified patterns
   */
  async analyzeDesignPatterns(designSpec, options) {
    const prompt = this.buildPatternAnalysisPrompt(designSpec, options);
    const response = await this.callClaudeAPI(prompt);
    return this.parseDesignPatterns(response.content);
  }

  /**
   * Generate architectural recommendations
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {Promise<ArchitecturalRecommendation[]>} Recommendations
   */
  async generateArchitecturalRecommendations(designSpec, options) {
    const prompt = this.buildRecommendationPrompt(designSpec, options);
    const response = await this.callClaudeAPI(prompt);
    return this.parseRecommendations(response.content);
  }

  /**
   * Analyze tradeoffs in design decisions
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {Promise<Tradeoff[]>} Tradeoff analysis
   */
  async analyzeTradeoffs(designSpec, options) {
    const prompt = this.buildTradeoffAnalysisPrompt(designSpec, options);
    const response = await this.callClaudeAPI(prompt);
    return this.parseTradeoffs(response.content);
  }

  /**
   * Suggest improvements for the design
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {Promise<Improvement[]>} Improvement suggestions
   */
  async suggestImprovements(designSpec, options) {
    const prompt = this.buildImprovementPrompt(designSpec, options);
    const response = await this.callClaudeAPI(prompt);
    return this.parseImprovements(response.content);
  }

  /**
   * Perform overall design analysis
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {Promise<DesignAnalysis>} Design analysis
   */
  async performDesignAnalysis(designSpec, options) {
    const prompt = this.buildDesignAnalysisPrompt(designSpec, options);
    const response = await this.callClaudeAPI(prompt);
    return this.parseDesignAnalysis(response.content);
  }

  // =============================================================================
  // PROMPT BUILDING METHODS
  // =============================================================================

  /**
   * Build pattern analysis prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {string} Generated prompt
   */
  buildPatternAnalysisPrompt(designSpec, options) {
    const componentsCount = designSpec.components?.length || 0;
    const complexity = designSpec.context?.quality?.complexity || 0.5;

    return `Analyze the design patterns in this UI specification:

DESIGN CONTEXT:
- Components: ${componentsCount}
- Complexity: ${(complexity * 100).toFixed(0)}%
- Focus Areas: ${options.focusAreas.join(', ')}
- Analysis Depth: ${options.depth}
- Project Context: ${options.context}

COMPONENTS SUMMARY:
${this.summarizeComponents(designSpec.components || [])}

DESIGN TOKENS:
- Colors: ${designSpec.designTokens?.colors?.length || 0}
- Typography: ${designSpec.designTokens?.typography?.length || 0}

Please identify and analyze design patterns used, including:
1. Layout patterns (grid, flexbox, stack)
2. Component patterns (composition, compound components)
3. State management patterns
4. Data flow patterns
5. Styling patterns

For each pattern, provide:
- Name and description
- Usage in the design
- Benefits and drawbacks
- Implementation recommendations

Format as JSON array of pattern objects.`;
  }

  /**
   * Build recommendation prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {string} Generated prompt
   */
  buildRecommendationPrompt(designSpec, options) {
    return `Provide architectural recommendations for this design system:

ANALYSIS FOCUS: ${options.focusAreas.join(', ')}
PROJECT CONTEXT: ${options.context}
DEPTH: ${options.depth}

CURRENT STATE:
- Design System: ${designSpec.designSystem?.detected?.system || 'Custom'}
- Components: ${designSpec.components?.length || 0}
- Compliance Score: ${designSpec.designSystem?.compliance?.overall || 'Unknown'}

Provide recommendations covering:
1. Architecture improvements
2. Scalability enhancements
3. Performance optimizations
4. Maintainability improvements
5. Accessibility enhancements

Each recommendation should include:
- Category and priority
- Clear description
- Implementation approach
- Expected impact

Format as JSON array of recommendation objects.`;
  }

  /**
   * Build tradeoff analysis prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {string} Generated prompt
   */
  buildTradeoffAnalysisPrompt(designSpec, options) {
    return `Analyze key architectural tradeoffs in this design:

PROJECT CONTEXT: ${options.context}
FOCUS AREAS: ${options.focusAreas.join(', ')}

DESIGN CHARACTERISTICS:
- Complexity: ${designSpec.context?.quality?.complexity || 0.5}
- Component Count: ${designSpec.components?.length || 0}
- Design System Compliance: ${designSpec.designSystem?.compliance?.overall || 'Unknown'}

Analyze tradeoffs in these areas:
1. Performance vs. Features
2. Flexibility vs. Consistency
3. Development Speed vs. Quality
4. Maintainability vs. Innovation
5. User Experience vs. Technical Constraints

For each tradeoff, provide:
- Decision description
- Pros and cons
- Recommendation with rationale

Format as JSON array of tradeoff objects.`;
  }

  /**
   * Build improvement prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {string} Generated prompt
   */
  buildImprovementPrompt(designSpec, options) {
    return `Suggest specific improvements for this design system:

CURRENT STATE:
- Overall Quality: ${designSpec.context?.quality?.completeness || 0.8}
- Consistency Score: ${designSpec.context?.quality?.consistency || 0.7}
- Complexity: ${designSpec.context?.quality?.complexity || 0.5}

Focus on improvements that address:
1. Design consistency
2. Component reusability
3. Performance optimization
4. Accessibility compliance
5. Developer experience

For each improvement:
- Area of focus
- Specific description
- Implementation effort (low/medium/high)
- Expected impact (low/medium/high)
- Implementation steps

Format as JSON array of improvement objects.`;
  }

  /**
   * Build design analysis prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {ArchitecturalAnalysisOptions} options - Analysis options
   * @returns {string} Generated prompt
   */
  buildDesignAnalysisPrompt(designSpec, options) {
    return `Perform comprehensive design analysis:

DESIGN OVERVIEW:
- Purpose: ${designSpec.context?.intent?.purpose || 'UI System'}
- Platform: ${designSpec.context?.technical?.platform || 'Web'}
- Components: ${designSpec.components?.length || 0}
- Design System: ${designSpec.designSystem?.detected?.system || 'Custom'}

QUALITY METRICS:
- Completeness: ${(designSpec.context?.quality?.completeness || 0.8) * 100}%
- Consistency: ${(designSpec.context?.quality?.consistency || 0.7) * 100}%
- Clarity: ${(designSpec.context?.quality?.clarity || 0.8) * 100}%

Provide analysis including:
1. Overall complexity assessment (0-1)
2. Executive summary
3. Key strengths
4. Major weaknesses
5. Improvement opportunities

Format as JSON object with analysis structure.`;
  }

  /**
   * Build decision evaluation prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {string} decision - Decision to evaluate
   * @param {Object} context - Evaluation context
   * @returns {string} Generated prompt
   */
  buildDecisionEvaluationPrompt(designSpec, decision, context) {
    return `Evaluate this design decision:

DECISION: ${decision}

CONTEXT:
- Team Size: ${context.team}
- Timeline: ${context.timeline}
- Constraints: ${context.constraints.join(', ')}
- Goals: ${context.goals.join(', ')}

CURRENT DESIGN:
- Components: ${designSpec.components?.length || 0}
- Complexity: ${designSpec.context?.quality?.complexity || 0.5}

Provide evaluation including:
- Score (0-100)
- Detailed rationale
- Alternative approaches
- Final recommendation

Format as JSON object.`;
  }

  /**
   * Build risk analysis prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} context - Risk context
   * @returns {string} Generated prompt
   */
  buildRiskAnalysisPrompt(designSpec, context) {
    return `Identify potential risks in this design:

DESIGN CHARACTERISTICS:
- Complexity: ${designSpec.context?.quality?.complexity || 0.5}
- Component Count: ${designSpec.components?.length || 0}
- Design System Maturity: ${designSpec.designSystem?.detected?.confidence || 0.7}

CONTEXT: ${JSON.stringify(context)}

Identify risks in these categories:
1. Technical risks
2. User experience risks  
3. Performance risks
4. Maintenance risks
5. Scalability risks

For each risk, provide:
- Risk description
- Probability (low/medium/high)
- Impact (low/medium/high)
- Mitigation strategies

Format as JSON array of risk objects.`;
  }

  /**
   * Build system design prompt
   * @private
   * @param {Object} requirements - System requirements
   * @param {Object} constraints - Design constraints
   * @returns {string} Generated prompt
   */
  buildSystemDesignPrompt(requirements, constraints) {
    return `Generate system design based on requirements:

REQUIREMENTS: ${JSON.stringify(requirements)}
CONSTRAINTS: ${JSON.stringify(constraints)}

Design a system architecture including:
1. Core components
2. Architecture layers
3. Recommended patterns
4. Data flow description
5. Technology recommendations

Format as JSON object with system design structure.`;
  }

  // =============================================================================
  // PARSING METHODS
  // =============================================================================

  /**
   * Parse design patterns from Claude response
   * @private
   * @param {string} content - Claude response content
   * @returns {DesignPattern[]} Parsed patterns
   */
  parseDesignPatterns(content) {
    try {
      const patterns = JSON.parse(this.extractJSON(content));
      return patterns.map(pattern => ({
        name: pattern.name || 'Unknown Pattern',
        usage: pattern.usage || 'Not specified',
        benefits: pattern.benefits || [],
        implementation: pattern.implementation || 'No implementation details'
      }));
    } catch (error) {
      console.warn('Error parsing design patterns:', error);
      return this.getFallbackPatterns();
    }
  }

  /**
   * Parse recommendations from Claude response
   * @private
   * @param {string} content - Claude response content
   * @returns {ArchitecturalRecommendation[]} Parsed recommendations
   */
  parseRecommendations(content) {
    try {
      const recommendations = JSON.parse(this.extractJSON(content));
      return recommendations.map(rec => ({
        category: rec.category || 'General',
        priority: rec.priority || 'medium',
        description: rec.description || 'No description',
        implementation: rec.implementation || 'No implementation details',
        impact: rec.impact || 'Unknown impact'
      }));
    } catch (error) {
      console.warn('Error parsing recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Parse tradeoffs from Claude response
   * @private
   * @param {string} content - Claude response content
   * @returns {Tradeoff[]} Parsed tradeoffs
   */
  parseTradeoffs(content) {
    try {
      const tradeoffs = JSON.parse(this.extractJSON(content));
      return tradeoffs.map(tradeoff => ({
        decision: tradeoff.decision || 'Unknown decision',
        pros: tradeoff.pros || [],
        cons: tradeoff.cons || [],
        recommendation: tradeoff.recommendation || 'No recommendation'
      }));
    } catch (error) {
      console.warn('Error parsing tradeoffs:', error);
      return [];
    }
  }

  /**
   * Parse improvements from Claude response
   * @private
   * @param {string} content - Claude response content
   * @returns {Improvement[]} Parsed improvements
   */
  parseImprovements(content) {
    try {
      const improvements = JSON.parse(this.extractJSON(content));
      return improvements.map(improvement => ({
        area: improvement.area || 'General',
        description: improvement.description || 'No description',
        effort: improvement.effort || 'medium',
        impact: improvement.impact || 'medium',
        implementation: improvement.implementation || 'No implementation details'
      }));
    } catch (error) {
      console.warn('Error parsing improvements:', error);
      return [];
    }
  }

  /**
   * Parse design analysis from Claude response
   * @private
   * @param {string} content - Claude response content
   * @returns {DesignAnalysis} Parsed analysis
   */
  parseDesignAnalysis(content) {
    try {
      const analysis = JSON.parse(this.extractJSON(content));
      return {
        complexity: analysis.complexity || 0.5,
        summary: analysis.summary || 'No analysis summary available',
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        opportunities: analysis.opportunities || []
      };
    } catch (error) {
      console.warn('Error parsing design analysis:', error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Parse decision evaluation from Claude response
   * @private
   * @param {string} content - Claude response content
   * @param {string} decision - Original decision
   * @returns {DecisionEvaluation} Parsed evaluation
   */
  parseDecisionEvaluation(content, decision) {
    try {
      const evaluation = JSON.parse(this.extractJSON(content));
      return {
        decision,
        score: evaluation.score || 50,
        rationale: evaluation.rationale || 'No rationale provided',
        alternatives: evaluation.alternatives || [],
        recommendation: evaluation.recommendation || 'No recommendation'
      };
    } catch (error) {
      console.warn('Error parsing decision evaluation:', error);
      return {
        decision,
        score: 50,
        rationale: 'Analysis unavailable',
        alternatives: [],
        recommendation: 'Requires manual review'
      };
    }
  }

  /**
   * Parse risk analysis from Claude response
   * @private
   * @param {string} content - Claude response content
   * @returns {Object[]} Parsed risks
   */
  parseRiskAnalysis(content) {
    try {
      return JSON.parse(this.extractJSON(content));
    } catch (error) {
      console.warn('Error parsing risk analysis:', error);
      return [];
    }
  }

  /**
   * Parse system design from Claude response
   * @private
   * @param {string} content - Claude response content
   * @returns {SystemDesign} Parsed system design
   */
  parseSystemDesign(content) {
    try {
      const design = JSON.parse(this.extractJSON(content));
      return {
        components: design.components || [],
        layers: design.layers || [],
        patterns: design.patterns || [],
        dataFlow: design.dataFlow || 'No data flow specified',
        technologies: design.technologies || []
      };
    } catch (error) {
      console.warn('Error parsing system design:', error);
      return {
        components: [],
        layers: [],
        patterns: [],
        dataFlow: 'Analysis unavailable',
        technologies: []
      };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Call Claude API with prompt
   * @private
   * @param {string} prompt - Prompt to send
   * @returns {Promise<ClaudeResponse>} API response
   */
  async callClaudeAPI(prompt) {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      },
      stopReason: data.stop_reason
    };
  }

  /**
   * Extract JSON from Claude response content
   * @private
   * @param {string} content - Response content
   * @returns {string} Extracted JSON string
   */
  extractJSON(content) {
    // Look for JSON blocks in the response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/) || content.match(/\[[\s\S]*\]/);
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
  }

  /**
   * Summarize components for prompt context
   * @private
   * @param {Object[]} components - Design components
   * @returns {string} Component summary
   */
  summarizeComponents(components) {
    if (!components || components.length === 0) {return 'No components available';}

    const summary = components.slice(0, 10).map(comp =>
      `- ${comp.name} (${comp.type}): ${comp.semantic?.intent || 'unknown intent'}`
    ).join('\n');

    return summary + (components.length > 10 ? `\n... and ${components.length - 10} more components` : '');
  }

  /**
   * Calculate analysis confidence score
   * @private
   * @param {Object} designSpec - Design specification
   * @param {DesignPattern[]} patterns - Identified patterns
   * @param {ArchitecturalRecommendation[]} recommendations - Generated recommendations
   * @returns {number} Confidence score (0-1)
   */
  calculateAnalysisConfidence(designSpec, patterns, recommendations) {
    let baseConfidence = 0.6; // Base confidence for Claude analysis

    // Boost confidence based on design spec completeness
    const completeness = designSpec.context?.quality?.completeness || 0.5;
    baseConfidence += completeness * 0.2;

    // Boost confidence based on number of patterns found
    const patternBonus = Math.min(patterns.length * 0.05, 0.15);

    // Boost confidence based on recommendation quality
    const recommendationBonus = Math.min(recommendations.length * 0.03, 0.1);

    return Math.min(baseConfidence + patternBonus + recommendationBonus, 1.0);
  }

  /**
   * Get fallback patterns when parsing fails
   * @private
   * @returns {DesignPattern[]} Fallback patterns
   */
  getFallbackPatterns() {
    return [
      {
        name: 'Component Composition',
        usage: 'Building complex UI from simple components',
        benefits: ['Reusability', 'Maintainability', 'Testability'],
        implementation: 'Create small, focused components that can be combined'
      }
    ];
  }

  /**
   * Get fallback recommendations when parsing fails
   * @private
   * @returns {ArchitecturalRecommendation[]} Fallback recommendations
   */
  getFallbackRecommendations() {
    return [
      {
        category: 'Architecture',
        priority: 'medium',
        description: 'Review component structure and organization',
        implementation: 'Audit current components and identify refactoring opportunities',
        impact: 'Improved maintainability and developer experience'
      }
    ];
  }

  /**
   * Get fallback analysis when parsing fails
   * @private
   * @returns {DesignAnalysis} Fallback analysis
   */
  getFallbackAnalysis() {
    return {
      complexity: 0.5,
      summary: 'Design analysis could not be completed automatically',
      strengths: ['Existing component structure'],
      weaknesses: ['Requires manual review'],
      opportunities: ['Architecture optimization', 'Pattern standardization']
    };
  }
}