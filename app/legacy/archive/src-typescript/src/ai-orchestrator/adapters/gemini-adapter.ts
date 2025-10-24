/**
 * 🤖 Gemini AI Adapter - Documentation & Explanations
 * 
 * Specialized adapter for Google's Gemini model, optimized for:
 * - Component documentation generation
 * - Design system explanations
 * - User-friendly descriptions
 * - Accessibility documentation
 */

import { DesignSpec, DesignComponent } from '../../design-intelligence/schema/design-spec.js';
import { DocumentationResult } from '../orchestrator.js';

export interface GeminiConfig {
  apiKey: string;
  model: 'gemini-pro' | 'gemini-pro-vision';
  temperature: number;
  maxTokens: number;
  safetySettings?: Record<string, string>;
}

export interface GeminiPromptContext {
  designSpec: DesignSpec;
  focusAreas: string[];
  outputFormat: 'markdown' | 'html' | 'json';
  includeExamples: boolean;
  audience: 'developers' | 'designers' | 'mixed';
}

export class GeminiAdapter {
  private config: GeminiConfig;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(config: GeminiConfig) {
    this.config = config;
  }

  /**
   * Generate comprehensive documentation from design spec
   */
  async generateDocumentation(
    designSpec: DesignSpec,
    options: {
      includeUsageExamples?: boolean;
      includeAccessibility?: boolean;
      format?: 'markdown' | 'html';
      audience?: 'developers' | 'designers' | 'mixed';
    } = {}
  ): Promise<DocumentationResult> {
    const startTime = Date.now();

    try {
      console.log('📝 Generating documentation with Gemini...');

      // Build comprehensive prompt
      const promptContext: GeminiPromptContext = {
        designSpec,
        focusAreas: ['overview', 'components', 'design-system', 'usage'],
        outputFormat: options.format || 'markdown',
        includeExamples: options.includeUsageExamples || true,
        audience: options.audience || 'mixed'
      };

      const prompt = this.buildDocumentationPrompt(promptContext);
      
      // Call Gemini API
      const response = await this.callGeminiAPI(prompt, {
        temperature: 0.3, // Lower temperature for more consistent documentation
        maxTokens: 4000
      });

      // Parse and structure the response
      const documentation = this.parseDocumentationResponse(response);

      const processingTime = Date.now() - startTime;

      return {
        overview: documentation.overview,
        componentDocs: this.generateComponentDocumentation(designSpec.components),
        designSystemDocs: documentation.designSystemDocs,
        usageExamples: documentation.usageExamples,
        accessibility: documentation.accessibility,
        metadata: {
          model: this.config.model,
          processingTime,
          confidence: this.calculateConfidence(response)
        }
      };

    } catch (error) {
      console.error('❌ Gemini documentation generation failed:', error);
      throw new Error(`Gemini adapter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate explanations for design decisions
   */
  async explainDesignDecisions(
    designSpec: DesignSpec,
    options: {
      focusOn?: string[];
      depth?: 'brief' | 'detailed';
      includeAlternatives?: boolean;
    } = {}
  ): Promise<{
    explanations: DesignExplanation[];
    rationale: string;
    alternatives: string[];
    recommendations: string[];
  }> {
    const prompt = this.buildExplanationPrompt(designSpec, options);
    const response = await this.callGeminiAPI(prompt, { temperature: 0.4 });
    
    return this.parseExplanationResponse(response);
  }

  /**
   * Generate user-friendly component descriptions
   */
  async generateComponentDescriptions(
    components: DesignComponent[],
    options: {
      includeInteractionHints?: boolean;
      includeVariations?: boolean;
      audience?: 'end-users' | 'developers';
    } = {}
  ): Promise<ComponentDescription[]> {
    const descriptions: ComponentDescription[] = [];

    for (const component of components) {
      const prompt = this.buildComponentDescriptionPrompt(component, options);
      const response = await this.callGeminiAPI(prompt, { temperature: 0.2 });
      
      descriptions.push({
        componentId: component.id,
        name: component.name,
        description: response.content,
        userFriendlyName: this.extractUserFriendlyName(response.content),
        interactions: options.includeInteractionHints ? this.extractInteractionHints(response.content) : [],
        variations: options.includeVariations ? this.extractVariations(response.content) : []
      });
    }

    return descriptions;
  }

  // =============================================================================
  // PROMPT BUILDING METHODS
  // =============================================================================

  private buildDocumentationPrompt(context: GeminiPromptContext): string {
    const { designSpec, focusAreas, outputFormat, includeExamples, audience } = context;

    return `
# Design System Documentation Generation

You are an expert technical writer specializing in design system documentation. Generate comprehensive, user-friendly documentation for the following design specification.

## Design Specification Context:
${JSON.stringify({
  projectName: designSpec.metadata.figmaFile.fileName,
  components: designSpec.components.length,
  designSystem: designSpec.designSystem.detected.system,
  complexity: designSpec.context.quality.complexity
}, null, 2)}

## Component Overview:
${designSpec.components.map(c => `- ${c.name} (${c.semantic.intent}): ${c.semantic.role}`).join('\n')}

## Requirements:
- Target audience: ${audience}
- Output format: ${outputFormat}
- Include examples: ${includeExamples}
- Focus areas: ${focusAreas.join(', ')}

## Design System Information:
- Detected system: ${designSpec.designSystem.detected.system}
- Confidence: ${designSpec.designSystem.detected.confidence}
- Colors: ${designSpec.designTokens.colors.length} tokens
- Typography: ${designSpec.designTokens.typography.length} styles

Please generate documentation that includes:

1. **Overview Section**: A clear, engaging introduction to this design system
2. **Component Documentation**: Detailed descriptions for each component
3. **Design System Guidelines**: How to use the design tokens and patterns
4. **Usage Examples**: Practical examples of how to implement components
5. **Accessibility Notes**: Important accessibility considerations

Make the documentation:
- Clear and easy to understand
- Practical with actionable guidance  
- Consistent in tone and structure
- Accessible to ${audience === 'mixed' ? 'both designers and developers' : audience}

Generate the documentation now:
`;
  }

  private buildExplanationPrompt(
    designSpec: DesignSpec,
    options: any
  ): string {
    return `
# Design Decision Explanation

Analyze the following design specification and explain the key design decisions made.

## Design Context:
${JSON.stringify(designSpec.context, null, 2)}

## Design Decisions to Explain:
${designSpec.context.decisions.rationale.map(d => `- ${d.aspect}: ${d.decision}`).join('\n')}

Focus on: ${options.focusOn?.join(', ') || 'all aspects'}
Depth: ${options.depth || 'detailed'}
Include alternatives: ${options.includeAlternatives || false}

Provide clear, logical explanations for each decision, including:
1. The rationale behind the choice
2. Benefits and trade-offs
3. Alternative approaches considered (if requested)
4. Recommendations for implementation

Be specific and actionable in your explanations.
`;
  }

  private buildComponentDescriptionPrompt(
    component: DesignComponent,
    options: any
  ): string {
    return `
# Component Description Generation

Generate a user-friendly description for this UI component:

## Component Details:
- Name: ${component.name}
- Type: ${component.semantic.intent}
- Role: ${component.semantic.role}
- Category: ${component.category}

## Visual Properties:
- Dimensions: ${component.visual.dimensions.width}x${component.visual.dimensions.height}
- Has text: ${component.content.text ? 'Yes' : 'No'}
- Has images: ${component.content.images ? 'Yes' : 'No'}
- Interactive: ${component.framework.events.length > 0 ? 'Yes' : 'No'}

## Framework Info:
- Suggested tag: ${component.framework.suggestedTag}
- Events: ${component.framework.events.join(', ')}
- States: ${component.framework.states.map(s => s.name).join(', ')}

Target audience: ${options.audience || 'end-users'}

Generate a description that:
1. Explains what this component is in simple terms
2. Describes its primary purpose and function
3. Mentions key interactive behaviors (if any)
4. Suggests when/where to use it
5. Notes any important variations or states

Keep it concise but informative, suitable for ${options.audience || 'end-users'}.
`;
  }

  // =============================================================================
  // API INTERACTION METHODS
  // =============================================================================

  private async callGeminiAPI(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<GeminiResponse> {
    // Mock implementation - would call actual Gemini API
    console.log(`🤖 Calling Gemini API with prompt length: ${prompt.length}`);
    
    // Simulate API response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      content: this.generateMockDocumentation(prompt),
      usage: {
        inputTokens: Math.floor(prompt.length / 4),
        outputTokens: 800,
        totalTokens: Math.floor(prompt.length / 4) + 800
      },
      confidence: 0.92
    };
  }

  private generateMockDocumentation(prompt: string): string {
    if (prompt.includes('Component Description Generation')) {
      return `
This is a user interface component designed for interactive user engagement. 

**Primary Purpose**: This component serves as a clickable element that triggers actions or navigation within the application.

**Key Features**:
- Interactive behavior with hover and click states
- Accessible keyboard navigation support
- Clear visual hierarchy and styling
- Responsive design for multiple screen sizes

**When to Use**: Use this component when you need users to perform an action, such as submitting a form, navigating to another page, or triggering a dialog.

**Variations**: Available in different sizes (small, medium, large) and styles (primary, secondary, outline) to match different use cases and visual hierarchy needs.
`;
    }

    return `
# Design System Documentation

## Overview
This design system provides a comprehensive set of components and design tokens for building consistent, accessible user interfaces.

## Components
The system includes ${this.extractComponentCount(prompt)} carefully crafted components, each designed with accessibility and usability in mind.

## Design Tokens
- **Colors**: A carefully curated palette supporting brand consistency
- **Typography**: Scalable type system with proper hierarchy
- **Spacing**: Consistent spacing system based on 8px grid

## Usage Guidelines
Each component follows established patterns and can be easily integrated into modern web applications.

## Accessibility
All components meet WCAG 2.1 AA standards and include proper semantic markup and keyboard navigation support.
`;
  }

  // =============================================================================
  // RESPONSE PARSING METHODS
  // =============================================================================

  private parseDocumentationResponse(response: GeminiResponse): {
    overview: string;
    designSystemDocs: string;
    usageExamples: string[];
    accessibility: string;
  } {
    const content = response.content;
    
    return {
      overview: this.extractSection(content, 'Overview', 'Design System Documentation'),
      designSystemDocs: this.extractSection(content, 'Design Tokens', 'Usage Guidelines'),
      usageExamples: this.extractExamples(content),
      accessibility: this.extractSection(content, 'Accessibility', '')
    };
  }

  private parseExplanationResponse(response: GeminiResponse): {
    explanations: DesignExplanation[];
    rationale: string;
    alternatives: string[];
    recommendations: string[];
  } {
    // Mock parsing - would parse actual Gemini response
    return {
      explanations: [],
      rationale: 'Design decisions based on user experience principles',
      alternatives: ['Alternative approach 1', 'Alternative approach 2'],
      recommendations: ['Recommendation 1', 'Recommendation 2']
    };
  }

  private generateComponentDocumentation(components: DesignComponent[]): any[] {
    return components.map(component => ({
      componentId: component.id,
      name: component.name,
      description: this.generateComponentDescription(component),
      props: this.extractComponentProps(component),
      examples: this.generateUsageExamples(component),
      accessibility: this.generateAccessibilityNotes(component)
    }));
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private calculateConfidence(response: GeminiResponse): number {
    return response.confidence || 0.85;
  }

  private extractSection(content: string, startMarker: string, endMarker: string): string {
    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) return '';
    
    const endIndex = endMarker ? content.indexOf(endMarker, startIndex) : content.length;
    const sectionEnd = endIndex === -1 ? content.length : endIndex;
    
    return content.substring(startIndex, sectionEnd).trim();
  }

  private extractExamples(content: string): string[] {
    // Extract usage examples from content
    const examples = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('example') || line.includes('Example')) {
        examples.push(line.trim());
      }
    }
    
    return examples.length > 0 ? examples : ['Usage example would be generated based on component analysis'];
  }

  private extractComponentCount(prompt: string): number {
    const match = prompt.match(/components: (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private extractUserFriendlyName(content: string): string {
    const lines = content.split('\n');
    const firstLine = lines.find(line => line.trim().length > 0);
    return firstLine ? firstLine.replace(/^[#*\-\s]+/, '').trim() : 'UI Component';
  }

  private extractInteractionHints(content: string): string[] {
    const hints = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('click') || 
          line.toLowerCase().includes('hover') || 
          line.toLowerCase().includes('interact')) {
        hints.push(line.trim());
      }
    }
    
    return hints;
  }

  private extractVariations(content: string): string[] {
    const variations = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('variation') || 
          line.toLowerCase().includes('size') || 
          line.toLowerCase().includes('style')) {
        variations.push(line.trim());
      }
    }
    
    return variations;
  }

  private generateComponentDescription(component: DesignComponent): string {
    return `${component.name} is a ${component.semantic.intent} component that serves as ${component.semantic.role} in the user interface.`;
  }

  private extractComponentProps(component: DesignComponent): any[] {
    return Object.entries(component.framework.attributes).map(([name, value]) => ({
      name,
      type: typeof value,
      required: false,
      description: `${name} property for ${component.name}`,
      defaultValue: value
    }));
  }

  private generateUsageExamples(component: DesignComponent): string[] {
    return [
      `<${component.framework.suggestedTag}>${component.name}</${component.framework.suggestedTag}>`,
      `Implementation example for ${component.name} component`
    ];
  }

  private generateAccessibilityNotes(component: DesignComponent): string {
    return `This ${component.name} component includes proper ARIA attributes and supports keyboard navigation as a ${component.semantic.role}.`;
  }
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

interface GeminiResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  confidence?: number;
}

interface DesignExplanation {
  aspect: string;
  decision: string;
  rationale: string;
  alternatives: string[];
  impact: string;
}

interface ComponentDescription {
  componentId: string;
  name: string;
  description: string;
  userFriendlyName: string;
  interactions: string[];
  variations: string[];
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createGeminiAdapter(config: GeminiConfig): GeminiAdapter {
  return new GeminiAdapter(config);
}

export default GeminiAdapter;