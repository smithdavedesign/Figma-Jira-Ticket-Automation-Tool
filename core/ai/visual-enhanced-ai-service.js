#!/usr/bin/env node

/* eslint-disable no-unused-vars */
/**
 * Visual-Enhanced AI Service for Figma Design Analysis
 *
 * Combines Figma screenshot capture with hierarchical data extraction
 * to provide rich visual context to Gemini Vision and other AI models.
 *
 * Features:
 * - Screenshot processing and optimization for LLM input
 * - Combined visual + structured data analysis
 * - Enhanced prompt templates for design understanding
 * - Multi-modal design context generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export class VisualEnhancedAIService {
  constructor(apiKey) {
    this.geminiClient = null;
    this.model = null;
    this.maxRetries = 2;
    this.compressionThreshold = 10000; // chars

    if (!apiKey) {
      throw new Error('Missing Gemini API key. Cannot initialize Visual Enhanced AI Service.');
    }

    // Initialize Gemini client and model with Gemini 2.0 Flash
    this.geminiClient = new GoogleGenerativeAI(apiKey);
    this.model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Visual Enhanced AI Service initialized with Gemini 2.0 Flash');
  }

  /**
   * Process visual-enhanced context with Gemini Vision
   */
  async processVisualEnhancedContext(context, options = {}) {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    console.log('🎨 Processing visual-enhanced context with Gemini Vision...');
    const startTime = Date.now();

    try {
      // Compress context if needed
      const compressedContext = this.compressContextIfNeeded(context);

      // Build enhanced prompt with modular composition
      const prompt = this.buildEnhancedPrompt(compressedContext, options);

      // Prepare multimodal input
      const parts = [{ text: prompt }];

      // Add screenshot if available
      if (compressedContext.screenshot?.base64) {
        const format = compressedContext.screenshot.format || 'png';
        parts.push({
          inlineData: {
            mimeType: `image/${format.toLowerCase()}`,
            data: compressedContext.screenshot.base64
          }
        });
        console.log(`📸 Including ${compressedContext.screenshot.format} screenshot (${compressedContext.screenshot.size} bytes)`);
      }

      // Generate with retry logic
      const generatedText = await this.generateWithRetry(parts, options);

      // Parse and structure the response
      const analysis = this.parseAIResponse(generatedText);
      const processingTime = Date.now() - startTime;

      // Return structured output
      return {
        ticket: generatedText,
        structured: {
          summary: analysis.visualUnderstanding,
          implementation: analysis.componentAnalysis,
          recommendations: analysis.recommendationSummary,
          designSystem: analysis.designSystemCompliance
        },
        metadata: {
          confidence: this.calculateConfidence(compressedContext, generatedText),
          processingTime,
          contextCompressed: JSON.stringify(context).length > this.compressionThreshold,
          screenshotProcessed: !!compressedContext.screenshot,
          dataStructuresAnalyzed: this.countDataStructures(compressedContext),
          promptTokens: Math.ceil(prompt.length / 4),
          responseTokens: Math.ceil(generatedText.length / 4)
        }
      };

    } catch (error) {
      console.error('❌ Visual-enhanced AI processing failed:', error);
      throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate content with retry logic and validation
   */
  async generateWithRetry(parts, options = {}, attempt = 1) {
    try {
      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const generatedText = response.text();

      // Validate output quality
      if (!this.validateOutput(generatedText) && attempt <= this.maxRetries) {
        console.warn(`⚠️ Weak output detected (attempt ${attempt}/${this.maxRetries}), retrying with reinforced prompt`);

        // Enhance prompt for retry
        const enhancedParts = [...parts];
        enhancedParts[0].text += '\n\nIMPORTANT: Ensure output uses proper Jira markup (h1. h2. h3.) and includes comprehensive technical details. Minimum 500 words required.';

        return this.generateWithRetry(enhancedParts, options, attempt + 1);
      }

      return generatedText;
    } catch (error) {
      if (attempt <= this.maxRetries) {
        console.warn(`⚠️ API error (attempt ${attempt}/${this.maxRetries}), retrying:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        return this.generateWithRetry(parts, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Validate AI output quality
   */
  validateOutput(text) {
    return text.includes('h1.') &&
           text.includes('h2.') &&
           text.length >= 300 &&
           !text.includes('# ') && // No markdown headers
           !text.includes('**'); // No markdown bold
  }

  /**
   * Compress context if it exceeds threshold
   */
  compressContextIfNeeded(context) {
    const contextStr = JSON.stringify(context);
    if (contextStr.length <= this.compressionThreshold) {
      return context;
    }

    console.log(`🗜️ Compressing context from ${contextStr.length} to reduce token usage`);

    return {
      ...context,
      visualDesignContext: this.summarizeContext(context.visualDesignContext),
      hierarchicalData: this.summarizeHierarchy(context.hierarchicalData)
    };
  }

  /**
   * Summarize visual design context
   */
  summarizeContext(visualContext) {
    if (!visualContext) {return visualContext;}

    return {
      colorPalette: visualContext.colorPalette?.slice(0, 10) || [], // Top 10 colors
      typography: {
        fonts: visualContext.typography?.fonts?.slice(0, 5) || [],
        sizes: visualContext.typography?.sizes?.slice(0, 8) || [],
        hierarchy: visualContext.typography?.hierarchy?.slice(0, 4) || []
      },
      spacing: {
        patterns: visualContext.spacing?.patterns?.slice(0, 6) || [],
        measurements: visualContext.spacing?.measurements?.slice(0, 8) || []
      },
      layout: visualContext.layout || {}
    };
  }

  /**
   * Summarize hierarchical data
   */
  summarizeHierarchy(hierarchyData) {
    if (!hierarchyData) {return hierarchyData;}

    return {
      components: hierarchyData.components?.slice(0, 15) || [], // Top 15 components
      designSystemLinks: hierarchyData.designSystemLinks || null
    };
  }

  /**
   * Build enhanced prompt with modular composition
   */
  buildEnhancedPrompt(context, options) {
    const sections = [
      this.promptHeaders(context, options),
      this.promptDesignAnalysis(context),
      this.promptImplementationGuidance(context, options),
      this.promptExpectedOutput(options)
    ];

    return sections.join('\n\n');
  }

  /**
   * Generate prompt headers and context
   */
  promptHeaders(context, options) {
    const { documentType = 'jira', techStack = 'React TypeScript', instructions = '' } = options;
    const designInsights = this.analyzeDesignContext(context);

    return `# Intelligent Design Analysis for Professional ${documentType.toUpperCase()} Ticket

## Context
You are an expert UI/UX implementation analyst with deep experience in ${techStack}. Analyze the provided Figma design and generate a professional, detailed development ticket that demonstrates real understanding of the design requirements.

## CRITICAL: Be Smart and Specific
- **Don't just follow a template** - analyze the actual design and make intelligent observations
- **Provide specific implementation guidance** based on what you see
- **Identify real technical challenges** and complexity factors
- **Make practical recommendations** for development approach

## Design Analysis Context

### 🎨 Component: ${context.componentName || context.figmaContext?.selection?.name || 'Unknown Component'}
- **File**: ${context.figmaContext?.fileName || 'Unknown File'}
- **Type**: ${designInsights.componentType}
- **Complexity**: ${designInsights.complexity}
- **Primary Function**: ${designInsights.inferredPurpose}`;
  }

  /**
   * Generate design analysis section
   */
  promptDesignAnalysis(context) {
    const designInsights = this.analyzeDesignContext(context);

    return `${context.screenshot ? `### 📸 Visual Screenshot Analysis
- **Resolution**: ${context.screenshot.resolution ? `${context.screenshot.resolution.width}×${context.screenshot.resolution.height}px` : 'Available'}
- **Format**: ${context.screenshot.format}
- **URL**: Available for analysis

**ANALYZE THE SCREENSHOT**: Look at the actual visual design, understand the layout, interaction patterns, and user experience implications.` : '### ⚠️ No Screenshot - Analysis Based on Structured Data'}

### 🎨 Design Intelligence Extracted
${designInsights.hasRichContext ? `
**Color System Detected**:
${context.visualDesignContext?.colorPalette?.map(color =>
    `- ${color.hex} (${color.usage?.join(', ') || 'UI element'}) - ${color.count || 1} uses`
  ).join('\\n') || '- Standard design system colors'}

**Typography Analysis**:
${context.visualDesignContext?.typography ? `
- Fonts: ${context.visualDesignContext.typography.fonts?.join(', ') || 'System fonts'}
- Size Range: ${context.visualDesignContext.typography.sizes?.join('px, ') || '14, 16, 18, 24'}px
- Hierarchy: ${context.visualDesignContext.typography.hierarchy?.join(' → ') || 'Title → Body → Caption'}` : '- Standard typography hierarchy detected'}

**Layout & Spacing**:
${context.visualDesignContext?.spacing ? `
- Patterns: ${context.visualDesignContext.spacing.patterns?.join(', ') || 'Grid-based spacing'}
- Key Measurements: ${context.visualDesignContext.spacing.measurements?.join('px, ') || '8, 16, 24, 32'}px
- Structure: ${context.visualDesignContext.layout?.structure || 'Responsive layout'}` : '- Standard responsive layout patterns'}

**Component Architecture**:
${context.hierarchicalData?.components?.map(comp =>
    `- ${comp.name}: ${comp.type || 'Component'} ${comp.masterComponent ? `(Instance of ${comp.masterComponent})` : '(Custom)'}`
  ).join('\\n') || '- Standalone component implementation required'}
` : `
**Limited Design Context Available** - Focus on structured implementation approach
- Component name: ${context.componentName}
- Basic responsive requirements apply
`}`;
  }

  /**
   * Generate implementation guidance section
   */
  promptImplementationGuidance(context, options) {
    const { techStack = 'React TypeScript' } = options;

    return `### 🔧 Technical Implementation Context
- **Target Framework**: ${techStack}
- **File Key**: ${context.figmaContext?.fileKey || context.fileKey || 'Not available'}
- **Live Design URL**: ${context.figmaContext?.fileKey ? `https://www.figma.com/file/${context.figmaContext.fileKey}` : 'Not available'}

### 🎯 Smart Implementation Requirements

Based on your analysis, determine:

1. **Component Complexity**: Is this a simple display component, interactive element, or complex widget?
2. **Data Requirements**: What props/data does this component need?
3. **State Management**: Does it need local state, form handling, or external state?
4. **Accessibility Considerations**: What specific ARIA attributes and keyboard interactions are needed?
5. **Performance Implications**: Any specific optimization needs (lazy loading, virtualization, etc.)?
6. **Integration Challenges**: How does this fit into the existing design system?`;
  }

  /**
   * Generate expected output format section
   */
  promptExpectedOutput(options) {
    const { techStack = 'React TypeScript' } = options;

    return `## Expected Professional Output

Generate a **comprehensive professional ticket** using **JIRA MARKUP FORMAT** that includes:

**CRITICAL FORMAT REQUIREMENT**: Use Jira markup syntax, NOT markdown:
- Headers: h1. h2. h3. (not # ## ###)
- Bold: *bold text* (not **bold**)
- Lists: * item (same as markdown)
- Code: {{code}} (not \`code\`)
- Links: [Link text|URL] (not [text](url))
- Panels: {panel:title=Title}content{panel}

h1. 🎯 Executive Summary
- Clear description of what this component does and why it's needed
- Business value and user impact

h2. 📋 Technical Analysis & Approach
- Specific implementation strategy for ${techStack}
- Component architecture and data flow
- Integration with existing design system
- Performance and accessibility considerations

h2. 🎨 Design Implementation Details
- Specific color values, typography specs, and spacing measurements
- Responsive behavior and breakpoint considerations
- Interactive states and micro-interactions

h2. ✅ Acceptance Criteria (Specific & Testable)
- Functional requirements based on the actual design
- Visual accuracy requirements
- Performance benchmarks

h2. 🔧 Development Guidance
- Code organization and file structure recommendations
- Testing strategy tailored to this component type
- Potential gotchas and implementation challenges

---

*REMEMBER*: You're providing expert analysis of a real design that developers will use to build production software. Be specific, be smart, and provide real value. *USE JIRA MARKUP FORMAT ONLY*`;
  }

  /**
   * Analyze design context to extract intelligent insights
   */
  analyzeDesignContext(context) {
    const insights = {
      componentType: 'Unknown',
      complexity: 'Medium',
      inferredPurpose: 'UI Component',
      hasRichContext: false
    };

    // Analyze component name to infer type and purpose
    const componentName = context.componentName || context.figmaContext?.selection?.name || '';

    if (componentName) {
      const nameLower = componentName.toLowerCase();

      // Infer component type from name
      if (nameLower.includes('button') || nameLower.includes('btn')) {
        insights.componentType = 'Interactive Button';
        insights.inferredPurpose = 'User action trigger with click handling and states';
      } else if (nameLower.includes('card')) {
        insights.componentType = 'Content Card';
        insights.inferredPurpose = 'Content display container with structured information';
      } else if (nameLower.includes('modal') || nameLower.includes('dialog')) {
        insights.componentType = 'Modal Dialog';
        insights.inferredPurpose = 'Overlay interface for focused user interaction';
        insights.complexity = 'High';
      } else if (nameLower.includes('form') || nameLower.includes('input')) {
        insights.componentType = 'Form Control';
        insights.inferredPurpose = 'Data input and validation interface';
        insights.complexity = 'High';
      } else if (nameLower.includes('nav') || nameLower.includes('menu')) {
        insights.componentType = 'Navigation Component';
        insights.inferredPurpose = 'Site navigation and user flow control';
      } else if (nameLower.includes('header') || nameLower.includes('hero')) {
        insights.componentType = 'Header Section';
        insights.inferredPurpose = 'Page header with branding and primary navigation';
      } else if (nameLower.includes('footer')) {
        insights.componentType = 'Footer Section';
        insights.inferredPurpose = 'Page footer with secondary links and information';
      } else if (nameLower.includes('sidebar')) {
        insights.componentType = 'Sidebar Component';
        insights.inferredPurpose = 'Secondary navigation or content area';
      } else if (nameLower.includes('table') || nameLower.includes('list')) {
        insights.componentType = 'Data Display';
        insights.inferredPurpose = 'Structured data presentation and interaction';
        insights.complexity = 'High';
      } else if (nameLower.includes('case studies') || nameLower.includes('case study')) {
        insights.componentType = 'Case Study Showcase';
        insights.inferredPurpose = 'Portfolio/case study content display with media and text';
        insights.complexity = 'Medium-High';
      } else {
        insights.componentType = 'Content Component';
        insights.inferredPurpose = 'Custom content display element';
      }
    }

    // Analyze complexity based on available context
    const hasColorSystem = context.visualDesignContext?.colorPalette?.length > 0;
    const hasTypography = context.visualDesignContext?.typography?.fonts?.length > 0;
    const hasMultipleComponents = context.hierarchicalData?.components?.length > 1;
    const hasScreenshot = !!context.screenshot;

    if (hasColorSystem || hasTypography || hasMultipleComponents || hasScreenshot) {
      insights.hasRichContext = true;
    }

    // Adjust complexity based on rich context
    if (insights.hasRichContext) {
      if (hasMultipleComponents && context.hierarchicalData.components.length > 3) {
        insights.complexity = 'High';
      } else if (hasColorSystem && hasTypography) {
        insights.complexity = 'Medium-High';
      }
    }

    return insights;
  }

  /**
   * Parse AI response into structured analysis
   */
  parseAIResponse(response) {
    // Extract key sections from the AI response
    const sections = {
      visualUnderstanding: this.extractSection(response, ['visual', 'design', 'screenshot']),
      componentAnalysis: this.extractSection(response, ['component', 'architecture', 'structure']),
      designSystemCompliance: this.extractSection(response, ['design system', 'tokens', 'compliance']),
      recommendationSummary: this.extractSection(response, ['recommendation', 'suggestion', 'improvement'])
    };

    return sections;
  }

  /**
   * Extract relevant sections from AI response
   */
  extractSection(text, keywords) {
    const sentences = text.split(/[.!?]+/);
    const relevantSentences = sentences.filter(sentence =>
      keywords.some(keyword =>
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    return relevantSentences.slice(0, 3).join('. ').trim() || 'No specific analysis available';
  }

  /**
   * Calculate confidence score based on available context
   */
  calculateConfidence(context, response) {
    let confidence = 60; // Base confidence

    // Visual context bonus
    if (context.screenshot) {
      confidence += 20;
    }

    // Design context richness
    if (context.visualDesignContext.colorPalette.length > 0) {confidence += 5;}
    if (context.visualDesignContext.typography.fonts.length > 0) {confidence += 5;}
    if (context.visualDesignContext.spacing.patterns.length > 0) {confidence += 5;}

    // Component data richness
    if (context.hierarchicalData.components.length > 0) {confidence += 10;}
    if (context.hierarchicalData.designSystemLinks) {confidence += 5;}

    // Response quality indicators
    if (response.length > 500) {confidence += 5;}
    if (response.includes('accessibility') || response.includes('responsive')) {confidence += 3;}
    if (response.includes('component') && response.includes('design system')) {confidence += 2;}

    return Math.min(confidence, 95); // Cap at 95%
  }

  /**
   * Count available data structures for metrics
   */
  countDataStructures(context) {
    let count = 0;

    if (context.screenshot) {count++;}
    if (context.visualDesignContext.colorPalette.length > 0) {count++;}
    if (context.visualDesignContext.typography.fonts.length > 0) {count++;}
    if (context.hierarchicalData.components.length > 0) {count++;}
    if (context.hierarchicalData.designSystemLinks) {count++;}

    return count;
  }

  /**
   * Process visual-enhanced context with streaming for better UX
   */
  async processVisualEnhancedContextStream(context, options = {}, onChunk = null) {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    console.log('🎨 Processing visual-enhanced context with streaming...');
    const startTime = Date.now();

    try {
      // Compress context if needed
      const compressedContext = this.compressContextIfNeeded(context);

      // Build enhanced prompt with modular composition
      const prompt = this.buildEnhancedPrompt(compressedContext, options);

      // Prepare multimodal input
      const parts = [{ text: prompt }];

      // Add screenshot if available
      if (compressedContext.screenshot?.base64) {
        const format = compressedContext.screenshot.format || 'png';
        parts.push({
          inlineData: {
            mimeType: `image/${format.toLowerCase()}`,
            data: compressedContext.screenshot.base64
          }
        });
      }

      // Generate with streaming
      const stream = await this.model.generateContentStream(parts);
      let fullText = '';

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullText += chunkText;

        if (onChunk) {
          onChunk(chunkText, fullText);
        }
      }

      // Validate and retry if needed
      if (!this.validateOutput(fullText)) {
        console.warn('⚠️ Streaming output failed validation, falling back to retry logic');
        return this.processVisualEnhancedContext(compressedContext, options);
      }

      // Parse and structure the response
      const analysis = this.parseAIResponse(fullText);
      const processingTime = Date.now() - startTime;

      return {
        ticket: fullText,
        structured: {
          summary: analysis.visualUnderstanding,
          implementation: analysis.componentAnalysis,
          recommendations: analysis.recommendationSummary,
          designSystem: analysis.designSystemCompliance
        },
        metadata: {
          confidence: this.calculateConfidence(compressedContext, fullText),
          processingTime,
          contextCompressed: JSON.stringify(context).length > this.compressionThreshold,
          screenshotProcessed: !!compressedContext.screenshot,
          streaming: true,
          promptTokens: Math.ceil(prompt.length / 4),
          responseTokens: Math.ceil(fullText.length / 4)
        }
      };

    } catch (error) {
      console.error('❌ Streaming AI processing failed:', error);
      throw new Error(`Streaming AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test service configuration
   */
  async testConfiguration() {
    if (!this.geminiClient || !this.model) {
      return {
        available: false,
        model: 'none',
        capabilities: [],
        error: 'Service not initialized'
      };
    }

    try {
      // Test basic generation
      const testResult = await this.model.generateContent('Test response');
      const response = await testResult.response;
      const text = response.text();

      return {
        available: true,
        model: 'gemini-2.0-flash',
        capabilities: ['text', 'vision', 'multimodal', 'streaming'],
        features: {
          retry: this.maxRetries,
          compression: this.compressionThreshold,
          modularPrompts: true,
          structuredOutput: true
        },
        testResponse: text?.substring(0, 50) + '...'
      };
    } catch (error) {
      return {
        available: false,
        model: 'gemini-2.0-flash',
        capabilities: [],
        error: error.message
      };
    }
  }
}

export default VisualEnhancedAIService;