#!/usr/bin/env node

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

export interface VisualEnhancedContext {
  // Visual data from screenshot
  screenshot: {
    base64: string;
    format: string;
    resolution: { width: number; height: number };
    size: number;
    quality: string;
  } | null;
  
  // Enhanced design context
  visualDesignContext: {
    colorPalette: Array<{
      hex: string;
      rgb: { r: number; g: number; b: number };
      usage: string[];
      count: number;
    }>;
    typography: {
      fonts: string[];
      sizes: number[];
      weights: string[];
      hierarchy: string[];
    };
    spacing: {
      measurements: number[];
      patterns: string[];
      grid: any;
    };
    layout: {
      structure: string | null;
      alignment: string | null;
      distribution: string | null;
    };
    designPatterns: string[];
    visualHierarchy: string[];
  };
  
  // Hierarchical component data
  hierarchicalData: {
    frames: any[];
    components: any[];
    designSystemLinks: any;
    metadata: any;
  };
  
  // Figma context
  figmaContext: {
    fileKey: string;
    fileName: string;
    pageName: string;
    selection: any;
  };
}

export interface EnhancedAIResponse {
  analysis: {
    visualUnderstanding: string;
    componentAnalysis: string;
    designSystemCompliance: string;
    recommendationSummary: string;
  };
  ticket: string;
  confidence: number;
  processingMetrics: {
    screenshotProcessed: boolean;
    dataStructuresAnalyzed: number;
    promptTokens: number;
    responseTokens: number;
  };
}

export class VisualEnhancedAIService {
  private geminiClient: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      // API key will be used when initializing model
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
    // For now, log that service is initialized without key
    console.log('Visual Enhanced AI Service initialized');
  }

  /**
   * Process visual-enhanced context with Gemini Vision
   */
  async processVisualEnhancedContext(
    context: VisualEnhancedContext,
    options: {
      documentType?: string;
      techStack?: string;
      instructions?: string;
    } = {}
  ): Promise<EnhancedAIResponse> {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    console.log('🎨 Processing visual-enhanced context with Gemini Vision...');

    try {
      // Build enhanced prompt combining visual and structured data
      const prompt = this.buildEnhancedPrompt(context, options);
      
      // Prepare multimodal input
      const parts: any[] = [{ text: prompt }];
      
      // Add screenshot if available
      if (context.screenshot?.base64) {
        parts.push({
          inlineData: {
            mimeType: `image/${context.screenshot.format.toLowerCase()}`,
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
  private buildEnhancedPrompt(
    context: VisualEnhancedContext,
    options: any
  ): string {
    const { documentType = 'jira', techStack = 'React TypeScript', instructions = '' } = options;

    let prompt = `# Visual Design Analysis for ${documentType.toUpperCase()} Ticket Generation

## Context
You are analyzing a Figma design selection that includes both visual screenshots and detailed structured data. 
Your goal is to generate a comprehensive ${documentType} ticket for implementing this design using ${techStack}.

## Visual Design Understanding Required
${context.screenshot ? '📸 **SCREENSHOT PROVIDED**: Analyze the visual design in the screenshot alongside the structured data below.' : '⚠️ **NO SCREENSHOT**: Work with structured data only.'}

## Figma Selection Details
- **File**: ${context.figmaContext.fileName}
- **Page**: ${context.figmaContext.pageName}
- **Selection**: ${context.figmaContext.selection?.name || 'Multiple items'}
${context.screenshot ? `- **Screenshot**: ${context.screenshot.resolution.width}×${context.screenshot.resolution.height}px ${context.screenshot.format}` : ''}

## Enhanced Design Context

### 🎨 Color Palette Analysis
${context.visualDesignContext.colorPalette.map(color => 
  `- **${color.hex}** (RGB: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}) - Used for: ${color.usage.join(', ')} (${color.count} instances)`
).join('\\n')}

### 📝 Typography System
- **Fonts**: ${context.visualDesignContext.typography.fonts.join(', ')}
- **Sizes**: ${context.visualDesignContext.typography.sizes.join('px, ')}px
- **Hierarchy**: ${context.visualDesignContext.typography.hierarchy.join(' → ')}

### 📐 Spacing & Layout
- **Spacing Pattern**: ${context.visualDesignContext.spacing.patterns.join(', ') || 'Custom spacing'}
- **Layout Structure**: ${context.visualDesignContext.layout.structure || 'Static positioning'}
- **Alignment**: ${context.visualDesignContext.layout.alignment || 'Not specified'}
- **Key Measurements**: ${context.visualDesignContext.spacing.measurements.join('px, ')}px

### 🏗️ Component Architecture
${context.hierarchicalData.components.map(comp => 
  `- **${comp.name}**: ${comp.masterComponent || 'Custom component'}`
).join('\\n')}

### 🎯 Design Patterns Detected
${context.visualDesignContext.designPatterns.length > 0 ? 
  context.visualDesignContext.designPatterns.map(pattern => `- ${pattern}`).join('\\n') : 
  '- No specific patterns detected'}

## Implementation Requirements

### Technical Stack
- **Framework**: ${techStack}
- **Styling**: Use design system tokens where possible
- **Accessibility**: WCAG 2.1 AA compliance required

### Additional Instructions
${instructions || 'Follow standard implementation practices'}

## Expected Output

Generate a comprehensive ${documentType} ticket that includes:

1. **🎯 Visual Analysis Summary**: What you see in the design and how it should function
2. **📋 Implementation Details**: Technical approach using ${techStack}
3. **🎨 Design System Integration**: How to use the detected colors, typography, and spacing
4. **✅ Acceptance Criteria**: Specific, testable requirements
5. **🔧 Technical Notes**: Development guidance and best practices
6. **📱 Responsive Considerations**: How the design should adapt across devices

## Key Focus Areas

${context.screenshot ? 
  '- **Visual Fidelity**: Implementation must match the screenshot exactly' : 
  '- **Structured Implementation**: Build based on component hierarchy and design data'
}
- **Design System Compliance**: Use detected color palette and typography consistently
- **Component Reusability**: Structure for maintainability and reuse
- **Performance**: Optimize for fast loading and smooth interactions

---

Please analyze both the visual design ${context.screenshot ? '(screenshot) ' : ''}and structured data to generate a comprehensive implementation ticket.`;

    return prompt;
  }

  /**
   * Parse AI response into structured analysis
   */
  private parseAIResponse(response: string): any {
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
  private extractSection(text: string, keywords: string[]): string {
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
  private calculateConfidence(context: VisualEnhancedContext, response: string): number {
    let confidence = 60; // Base confidence

    // Visual context bonus
    if (context.screenshot) {
      confidence += 20;
    }

    // Design context richness
    if (context.visualDesignContext.colorPalette.length > 0) confidence += 5;
    if (context.visualDesignContext.typography.fonts.length > 0) confidence += 5;
    if (context.visualDesignContext.spacing.patterns.length > 0) confidence += 5;

    // Component data richness
    if (context.hierarchicalData.components.length > 0) confidence += 10;
    if (context.hierarchicalData.designSystemLinks) confidence += 5;

    // Response quality indicators
    if (response.length > 500) confidence += 5;
    if (response.includes('accessibility') || response.includes('responsive')) confidence += 3;
    if (response.includes('component') && response.includes('design system')) confidence += 2;

    return Math.min(confidence, 95); // Cap at 95%
  }

  /**
   * Count available data structures for metrics
   */
  private countDataStructures(context: VisualEnhancedContext): number {
    let count = 0;
    
    if (context.screenshot) count++;
    if (context.visualDesignContext.colorPalette.length > 0) count++;
    if (context.visualDesignContext.typography.fonts.length > 0) count++;
    if (context.hierarchicalData.components.length > 0) count++;
    if (context.hierarchicalData.designSystemLinks) count++;
    
    return count;
  }

  /**
   * Test service configuration
   */
  async testConfiguration(): Promise<{ available: boolean; model: string; capabilities: string[] }> {
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