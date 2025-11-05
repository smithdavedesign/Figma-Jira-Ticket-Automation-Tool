#!/usr/bin/env node

/**
 * Template-Integrated Visual AI Service
 *
 * Enhanced version that leverages the Universal Template Engine for prompts
 * instead of hardcoded prompt generation. This creates a bridge between
 * the AI service and the template system for consistent, maintainable prompts.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIPromptManager } from './AIPromptManager.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TemplateIntegratedAIService {
  constructor(options = {}) {
    const { apiKey, templateEngine, promptManager, testMode } = options;

    this.geminiClient = null;
    this.model = null;
    this.maxRetries = 2;
    this.testMode = testMode || process.env.AI_TEST_MODE === 'true';

    // Initialize AI Prompt Manager for reasoning prompts
    if (promptManager) {
      this.promptManager = promptManager;
    } else {
      this.promptManager = new AIPromptManager();
    }

    // Template engine for output formatting (separate from AI reasoning)
    this.templateEngine = templateEngine;

    // Only initialize Gemini client if not in test mode
    if (apiKey && !this.testMode) {
      // Initialize Gemini client
      this.geminiClient = new GoogleGenerativeAI(apiKey);
      this.model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
    } else if (this.testMode) {
      console.log('🧪 AI Service running in test mode - using mock responses');
    }
  }

  /**
   * Initialize the service (async setup)
   */
  async initialize() {
    console.log('🚀 Initializing Template-Integrated AI Service...');

    if (!this.geminiClient && !this.testMode) {
      throw new Error('Missing Gemini API key. Cannot initialize AI Service.');
    }

    // Initialize AI Prompt Manager
    await this.promptManager.initialize();

    console.log('✅ Template-Integrated AI Service initialized');
  }

  /**
   * Process context using AI reasoning prompts (new hybrid approach)
   */
  async processWithReasoningPrompts(context, options = {}) {
    console.log('🧠 Processing with AI reasoning prompts (hybrid approach)...');
    const startTime = Date.now();

    try {
      // Enrich context for AI analysis
      const enrichedContext = this.enrichContextForPrompts(context, options);

      // Get AI reasoning prompt (focused on intelligence extraction)
      const promptData = await this.promptManager.getReasoningPrompt('comprehensive-visual-analysis', enrichedContext);

      console.log('🎨 AI reasoning prompt generated:', {
        promptType: promptData.metadata.promptType,
        purpose: promptData.metadata.purpose,
        promptLength: promptData.prompt.length,
        contextKeys: Object.keys(enrichedContext)
      });

      // Prepare multimodal input with screenshot if available
      const parts = [{ text: promptData.prompt }];

      if (context.screenshot?.base64) {
        const format = context.screenshot.format || 'png';
        parts.push({
          inlineData: {
            mimeType: `image/${format.toLowerCase()}`,
            data: context.screenshot.base64
          }
        });
        console.log(`📸 Including ${format} screenshot`);
      }

      // Generate AI reasoning with retry logic
      const aiResponse = await this.generateWithRetry(parts, options);

      // Parse structured JSON response from AI reasoning
      const reasoningData = this.promptManager.parseAIResponse(aiResponse);
      const processingTime = Date.now() - startTime;

      console.log('✅ AI reasoning complete:', {
        complexity: reasoningData.complexity_analysis?.level,
        confidence: reasoningData.complexity_analysis?.confidence_score,
        hours: reasoningData.complexity_analysis?.estimated_hours
      });

      return {
        reasoning: reasoningData,
        rawResponse: aiResponse,
        metadata: {
          confidence: reasoningData.complexity_analysis?.confidence_score || 0.7,
          processingTime,
          promptType: promptData.metadata.promptType,
          promptVersion: promptData.metadata.version,
          screenshotProcessed: !!context.screenshot,
          promptTokens: Math.ceil(promptData.prompt.length / 4),
          responseTokens: Math.ceil(aiResponse.length / 4),
          source: 'hybrid-ai-reasoning'
        }
      };

    } catch (error) {
      console.error('❌ AI reasoning processing failed:', error);
      throw new Error(`AI reasoning processing failed: ${error.message}`);
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async processWithTemplatePrompts(context, options = {}) {
    console.log('⚠️ Legacy method called - redirecting to processWithReasoningPrompts');
    return this.processWithReasoningPrompts(context, options);
  }

  /**
   * Enrich context specifically for AI prompt generation
   * Leverages the template manager's context enrichment logic
   */
  enrichContextForPrompts(context, options) {
    const { documentType = 'jira', techStack = 'React TypeScript' } = options;

    // Build comprehensive context similar to TemplateManager.buildTemplateContext
    const enrichedContext = {
      // Figma context
      figma: {
        component_name: context.componentName || context.figmaContext?.selection?.name || 'Unknown Component',
        file_name: context.figmaContext?.fileName || 'Unknown File',
        file_id: context.figmaContext?.fileKey || context.fileKey || 'unknown',
        live_link: this.buildFigmaUrl(context),
        screenshot_url: context.screenshot?.url || context.screenshot?.base64 ? 'Available' : null,
        screenshot_format: context.screenshot?.format || 'png',
        component_type: this.inferComponentType(context.componentName),
        extracted_colors: this.formatColorsForPrompt(context.visualDesignContext?.colorPalette),
        extracted_typography: this.formatTypographyForPrompt(context.visualDesignContext?.typography),
        design_status: 'Ready for Development'
      },

      // Project context
      project: {
        name: 'Design System Project',
        tech_stack: Array.isArray(techStack) ? techStack : [techStack],
        platform: documentType,
        repository_url: 'https://github.com/company/design-system',
        storybook_url: 'https://storybook.company.com',
        wiki_url: 'https://wiki.company.com',
        analytics_url: 'https://analytics.company.com'
      },

      // Calculated context (enhanced complexity analysis)
      calculated: {
        complexity: this.calculateComplexity(context),
        hours: this.estimateHours(context, techStack),
        confidence: this.calculateConfidence(context),
        design_analysis: this.generateDesignAnalysis(context),
        similar_components: this.findSimilarComponents(context),
        risk_factors: this.identifyRiskFactors(context, techStack),
        priority: this.calculatePriority(context),
        story_points: this.calculateStoryPoints(context)
      },

      // Organization context
      org: {
        name: 'Organization',
        standards: 'Enterprise standards'
      },

      // Team context
      team: {
        name: 'Development Team',
        size: 'Medium',
        experience: 'Senior'
      },

      // User context
      user: {
        name: 'AI Assistant'
      }
    };

    console.log('🔄 Context enriched for AI prompts:', {
      figmaKeys: Object.keys(enrichedContext.figma),
      projectKeys: Object.keys(enrichedContext.project),
      calculatedKeys: Object.keys(enrichedContext.calculated),
      componentName: enrichedContext.figma.component_name,
      complexity: enrichedContext.calculated.complexity,
      techStack: enrichedContext.project.tech_stack
    });

    return enrichedContext;
  }

  /**
   * Generate with retry logic and validation
   */
  async generateWithRetry(parts, options = {}, attempt = 1) {
    // In test mode, return mock response
    if (this.testMode) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate processing time
      return this.generateMockResponse(parts, options);
    }

    try {
      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const generatedText = response.text();

      // Validate output quality
      if (!this.validateOutput(generatedText) && attempt <= this.maxRetries) {
        console.warn(`⚠️ Weak output detected (attempt ${attempt}/${this.maxRetries}), retrying`);

        // Enhance prompt for retry
        const enhancedParts = [...parts];
        enhancedParts[0].text += '\n\nIMPORTANT: Ensure output uses proper Jira markup (h1. h2. h3.) and includes comprehensive technical details.';

        return this.generateWithRetry(enhancedParts, options, attempt + 1);
      }

      return generatedText;
    } catch (error) {
      if (attempt <= this.maxRetries) {
        console.warn(`⚠️ API error (attempt ${attempt}/${this.maxRetries}), retrying:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.generateWithRetry(parts, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Generate mock response for testing
   */
  generateMockResponse(parts, options = {}) {
    const mockResponse = `h1. Mock Generated Ticket

h2. Overview
This is a mock ticket generated during testing. Component implementation based on Figma design specifications.

h2. Technical Requirements
* Implement responsive design using CSS Grid/Flexbox
* Follow accessibility guidelines (WCAG 2.1 AA)
* Use design system tokens for consistency
* Add proper TypeScript interfaces

h2. Acceptance Criteria
* Component matches Figma design specifications
* Responsive behavior works across breakpoints
* Unit tests achieve 90%+ coverage
* Design system integration complete

h2. Technical Notes
Implementation should follow established patterns and use the component library where possible.

h2. Story Points
Estimated complexity: 3 points

h2. Labels
ui-implementation, react, component-library, design-tokens`;

    return mockResponse;
  }

  /**
   * Validate AI output quality
   */
  validateOutput(text) {
    return text.includes('h1.') &&
           text.includes('h2.') &&
           text.length >= 300 &&
           !text.includes('# '); // No markdown headers
  }

  /**
   * Infer component type from name
   */
  inferComponentType(componentName) {
    if (!componentName) {return 'UI Component';}

    const nameLower = componentName.toLowerCase();

    if (nameLower.includes('button')) {return 'Interactive Button';}
    if (nameLower.includes('card')) {return 'Content Card';}
    if (nameLower.includes('modal')) {return 'Modal Dialog';}
    if (nameLower.includes('form')) {return 'Form Control';}
    if (nameLower.includes('nav')) {return 'Navigation Component';}
    if (nameLower.includes('header')) {return 'Header Section';}
    if (nameLower.includes('footer')) {return 'Footer Section';}

    return 'UI Component';
  }

  /**
   * Format colors for prompt display
   */
  formatColorsForPrompt(colorPalette) {
    if (!Array.isArray(colorPalette) || colorPalette.length === 0) {
      return 'Standard design system colors';
    }

    return colorPalette.slice(0, 5).map(color =>
      `${color.name || 'Color'}: ${color.hex || color.value || color}`
    ).join(', ');
  }

  /**
   * Format typography for prompt display
   */
  formatTypographyForPrompt(typography) {
    if (!typography) {return 'Standard typography hierarchy';}

    const parts = [];
    if (typography.fonts) {
      parts.push(`Fonts: ${typography.fonts.slice(0, 3).join(', ')}`);
    }
    if (typography.sizes) {
      parts.push(`Sizes: ${typography.sizes.slice(0, 3).join('px, ')}px`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'Typography system available';
  }

  /**
   * Build Figma URL from context
   */
  buildFigmaUrl(context) {
    const fileKey = context.figmaContext?.fileKey || context.fileKey;
    if (!fileKey || fileKey === 'unknown') {
      return 'https://www.figma.com/file/unknown';
    }

    const fileName = context.figmaContext?.fileName || 'Design-File';
    const encodedName = encodeURIComponent(fileName.replace(/\s+/g, '-'));

    return `https://www.figma.com/design/${fileKey}/${encodedName}`;
  }

  /**
   * Calculate complexity from context
   */
  calculateComplexity(context) {
    let score = 0;

    const components = context.hierarchicalData?.components?.length || 0;
    if (components > 5) {score += 2;}
    else if (components > 2) {score += 1;}

    const colors = context.visualDesignContext?.colorPalette?.length || 0;
    if (colors > 8) {score += 2;}
    else if (colors > 4) {score += 1;}

    if (score >= 4) {return 'complex';}
    if (score >= 2) {return 'medium';}
    return 'simple';
  }

  /**
   * Estimate hours based on complexity
   */
  estimateHours(context, techStack) {
    const complexity = this.calculateComplexity(context);
    let baseHours = complexity === 'simple' ? 4 : complexity === 'medium' ? 8 : 16;

    if (Array.isArray(techStack) && techStack.some(tech => tech.toLowerCase().includes('aem'))) {
      baseHours *= 1.5;
    }

    return Math.round(baseHours);
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(context, response = null) {
    let confidence = 60;

    if (context.screenshot) {confidence += 20;}
    if (context.visualDesignContext?.colorPalette?.length > 0) {confidence += 5;}
    if (context.hierarchicalData?.components?.length > 0) {confidence += 10;}
    if (response && response.length > 500) {confidence += 5;}

    return Math.min(confidence, 95);
  }

  /**
   * Generate design analysis summary
   */
  generateDesignAnalysis(context) {
    const componentName = context.componentName || 'Component';
    const nameLower = componentName.toLowerCase();

    if (nameLower.includes('case studies')) {
      return 'Case study showcase component with rich media content and structured information display';
    } else if (nameLower.includes('why solidigm')) {
      return 'Complex marketing showcase component featuring multiple content cards and interactive sections';
    } else if (nameLower.includes('button')) {
      return 'Interactive button component with multiple states and click handling';
    } else if (nameLower.includes('card')) {
      return 'Content card component for information display and organization';
    }

    return `"${componentName}" component requiring custom implementation`;
  }

  /**
   * Find similar components (simplified)
   */
  findSimilarComponents(context) {
    const components = context.hierarchicalData?.components || [];
    return components.slice(0, 3).map(c => c.name || 'Component');
  }

  /**
   * Identify risk factors
   */
  identifyRiskFactors(context, techStack) {
    const risks = [];

    if (this.calculateComplexity(context) === 'complex') {
      risks.push('High complexity component');
    }

    if (!context.screenshot) {
      risks.push('No visual reference available');
    }

    if (Array.isArray(techStack) && techStack.length > 2) {
      risks.push('Multiple technology stack requirements');
    }

    return risks;
  }

  /**
   * Calculate priority based on complexity
   */
  calculatePriority(context) {
    const complexity = this.calculateComplexity(context);
    return complexity === 'complex' ? 'High' : complexity === 'medium' ? 'Medium' : 'Low';
  }

  /**
   * Calculate story points
   */
  calculateStoryPoints(context) {
    const hours = this.estimateHours(context);
    if (hours <= 4) {return '3';}
    if (hours <= 8) {return '5';}
    if (hours <= 16) {return '8';}
    return '13';
  }

  /**
   * Parse AI response into structured sections
   */
  parseAIResponse(response) {
    return {
      visualUnderstanding: this.extractSection(response, ['visual', 'design', 'screenshot']),
      componentAnalysis: this.extractSection(response, ['component', 'architecture', 'implementation']),
      designSystemCompliance: this.extractSection(response, ['design system', 'tokens', 'compliance']),
      recommendationSummary: this.extractSection(response, ['recommendation', 'guidance', 'best practice'])
    };
  }

  /**
   * Extract relevant sections from response
   */
  extractSection(text, keywords) {
    const sentences = text.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence =>
      keywords.some(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    return relevantSentences.slice(0, 3).join('. ').trim() || 'Analysis available in full response';
  }

  /**
   * Test service configuration and hybrid AI-template architecture
   */
  async testConfiguration() {
    try {
      // Test basic AI functionality
      const testResult = await this.model.generateContent('Test response');
      const response = await testResult.response;
      const text = response.text();

      // Test AI prompt manager
      const reasoningPrompt = this.promptManager.getReasoningPrompt('comprehensive-visual-analysis');

      // Test template resolution (for output formatting)
      const outputTemplate = await this.templateEngine.resolveTemplate('platforms', 'jira', 'comp');

      return {
        available: true,
        model: 'gemini-2.0-flash',
        capabilities: ['text', 'vision', 'multimodal', 'hybrid-ai-template'],
        promptManager: {
          available: !!this.promptManager,
          reasoningPrompt: reasoningPrompt?.name || 'comprehensive-visual-analysis',
          promptsLoaded: Object.keys(this.promptManager.prompts || {}).length
        },
        templateEngine: {
          available: !!this.templateEngine,
          outputTemplate: outputTemplate._meta?.cacheKey || 'platforms-jira-comp',
          resolutionPath: outputTemplate._meta?.resolutionPath
        },
        features: {
          retry: this.maxRetries,
          cognitiveeSeparation: true,
          contextEnrichment: true,
          structuredOutput: true,
          hybridArchitecture: true
        },
        testResponse: text?.substring(0, 50) + '...'
      };
    } catch (error) {
      return {
        available: false,
        model: 'gemini-2.0-flash',
        error: error.message,
        promptManager: {
          available: !!this.promptManager,
          error: 'Prompt manager test failed'
        },
        templateEngine: {
          available: !!this.templateEngine,
          error: 'Template test failed'
        }
      };
    }
  }
}

export default TemplateIntegratedAIService;