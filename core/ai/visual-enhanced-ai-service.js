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



    if (apiKey) {
      // Initialize Gemini client and model with Gemini 2.0 Flash
      this.geminiClient = new GoogleGenerativeAI(apiKey);
      this.model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
      console.log('✅ Visual Enhanced AI Service initialized with Gemini 2.0 Flash');
    } else {
      console.log('⚠️ Visual Enhanced AI Service initialized without API key');
    }
  }

  /**
   * Process visual-enhanced context with Gemini Vision
   */
  async processVisualEnhancedContext(context, options = {}) {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    console.log('🎨 Processing visual-enhanced context with Gemini Vision...');

    try {
      // Build enhanced prompt combining visual and structured data
      const prompt = this.buildEnhancedPrompt(context, options);

      // Prepare multimodal input
      const parts = [{ text: prompt }];

      // Add screenshot if available
      if (context.screenshot?.base64) {
        const format = context.screenshot.format || 'png';
        parts.push({
          inlineData: {
            mimeType: `image/${format.toLowerCase()}`,
            data: context.screenshot.base64
          }
        });
        console.log(`📸 Including ${context.screenshot.format} screenshot (${context.screenshot.size} bytes)`);
      }

      // Generate response with visual understanding
      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const generatedText = response.text();

      // Parse and structure the response
      const analysis = this.parseAIResponse(generatedText);

      return {
        analysis,
        ticket: generatedText,
        confidence: this.calculateConfidence(context, generatedText),
        processingMetrics: {
          screenshotProcessed: !!context.screenshot,
          dataStructuresAnalyzed: this.countDataStructures(context),
          promptTokens: prompt.length / 4, // Rough estimate
          responseTokens: generatedText.length / 4
        }
      };

    } catch (error) {
      console.error('❌ Visual-enhanced AI processing failed:', error);
      throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build enhanced prompt combining visual and structured data
   */
  buildEnhancedPrompt(context, options) {
    const { documentType = 'jira', techStack = 'React TypeScript', instructions = '' } = options;

    // Extract intelligent insights from the context
    const designInsights = this.analyzeDesignContext(context);

    const prompt = `# Intelligent Design Analysis for Professional ${documentType.toUpperCase()} Ticket

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
- **Primary Function**: ${designInsights.inferredPurpose}

${context.screenshot ? `### 📸 Visual Screenshot Analysis
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
- Tech stack: ${techStack}
- Basic responsive requirements apply
`}

### 🔧 Technical Implementation Context
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
6. **Integration Challenges**: How does this fit into the existing design system?

## Expected Professional Output

Generate a **comprehensive professional ticket** using **JIRA MARKUP FORMAT** that includes:

**CRITICAL FORMAT REQUIREMENT**: Use Jira markup syntax, NOT markdown:
- Headers: h1. h2. h3. (not # ## ###)
- Bold: *bold text* (not **bold**)
- Lists: * item (same as markdown)
- Code: {{code}} (not \`code\`)
- Links: [Link text|URL] (not [text](url))
- Panels: {panel:title=Title}content{panel}
- Color: {color:red}text{color}
- Line breaks: Use actual line breaks, not \\n

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
- Error states and edge cases

h2. ✅ Acceptance Criteria (Specific & Testable)
- Functional requirements based on the actual design
- Visual accuracy requirements
- Performance benchmarks
- Accessibility compliance specifics

h2. 🔧 Development Guidance
- Code organization and file structure recommendations
- Testing strategy tailored to this component type
- Potential gotchas and implementation challenges
- Documentation and example requirements

---

*REMEMBER*: You're not just filling out a template. You're providing expert analysis of a real design that developers will use to build production software. Be specific, be smart, and provide real value. *USE JIRA MARKUP FORMAT ONLY*`;

    return prompt;
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
   * Test service configuration
   */
  async testConfiguration() {
    if (!this.geminiClient || !this.model) {
      return {
        available: false,
        model: 'none',
        capabilities: []
      };
    }

    try {
      // Test basic generation
      await this.model.generateContent('Test');

      return {
        available: true,
        model: 'gemini-1.5-flash',
        capabilities: ['text', 'vision', 'multimodal']
      };
    } catch (error) {
      return {
        available: false,
        model: 'gemini-1.5-flash',
        capabilities: []
      };
    }
  }
}

export default VisualEnhancedAIService;