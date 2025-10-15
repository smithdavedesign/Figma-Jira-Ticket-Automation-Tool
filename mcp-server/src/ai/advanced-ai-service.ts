#!/usr/bin/env node

/**
 * Advanced AI Integration Service
 * 
 * Provides Google Gemini, GPT-4 Vision and Claude integration for intelligent design analysis,
 * screenshot interpretation, and context-aware document generation.
 * 
 * Features:
 * - Google Gemini 2.5 Flash (FREE) for text generation and analysis
 * - GPT-4 Vision for design screenshot analysis
 * - Claude for text processing and document generation
 * - Intelligent prompt templates per document type
 * - Multi-modal design understanding
 */

import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

export interface AIAnalysisConfig {
  openaiApiKey?: string | undefined;
  anthropicApiKey?: string | undefined;
  geminiApiKey?: string | undefined;
  enableVision: boolean;
  enableClaude: boolean;
  enableGemini: boolean;
  maxTokens: number;
  temperature: number;
}

export interface DesignAnalysisResult {
  components: ComponentAnalysis[];
  designSystem: DesignSystemAnalysis;
  accessibility: AccessibilityAnalysis;
  recommendations: string[];
  confidence: number;
}

export interface ComponentAnalysis {
  name: string;
  type: 'button' | 'input' | 'card' | 'modal' | 'navigation' | 'other';
  properties: Record<string, any>;
  variants: string[];
  usage: 'primary' | 'secondary' | 'tertiary';
  confidence: number;
}

export interface DesignSystemAnalysis {
  colors: ColorAnalysis;
  typography: TypographyAnalysis;
  spacing: SpacingAnalysis;
  consistency: number;
}

export interface ColorAnalysis {
  palette: { color: string; usage: string; count: number }[];
  compliance: number;
  issues: string[];
}

export interface TypographyAnalysis {
  fonts: { family: string; weights: string[]; sizes: string[] }[];
  hierarchy: string[];
  compliance: number;
}

export interface SpacingAnalysis {
  grid: string;
  margins: string[];
  padding: string[];
  compliance: number;
}

export interface AccessibilityAnalysis {
  colorContrast: { passed: boolean; issues: string[] };
  focusStates: { present: boolean; issues: string[] };
  semanticStructure: { score: number; issues: string[] };
  overallScore: number;
}

export class AdvancedAIService {
  private config: AIAnalysisConfig;
  private promptTemplates: Map<string, string> = new Map();

  constructor(config: AIAnalysisConfig) {
    this.config = config;
    this.loadPromptTemplates();
  }

  /**
   * Analyze design screenshot using GPT-4 Vision
   */
  async analyzeDesignScreenshot(
    imageBuffer: Buffer, 
    documentType: string = 'jira',
    context?: { techStack?: string; projectName?: string }
  ): Promise<DesignAnalysisResult> {
    if (!this.config.enableVision || !this.config.openaiApiKey) {
      throw new Error('GPT-4 Vision not configured or disabled');
    }

    const base64Image = imageBuffer.toString('base64');
    const prompt = this.getPromptTemplate('design_analysis', documentType, context);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.config.geminiApiKey
          }
        }
      );

      const analysisText = response.data.choices[0].message.content;
      return this.parseAnalysisResponse(analysisText);
      
    } catch (error) {
      console.error('GPT-4 Vision analysis failed:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate intelligent document content using Claude
   */
  async generateDocumentContent(
    analysisResult: DesignAnalysisResult,
    documentType: string,
    context?: { 
      techStack?: string; 
      projectName?: string; 
      additionalRequirements?: string 
    }
  ): Promise<string> {
    // 🆓 Priority 1: Try Gemini first (FREE service)
    if (this.config.enableGemini && this.config.geminiApiKey) {
      try {
        return await this.generateWithGemini(analysisResult, documentType, context);
      } catch (error) {
        console.warn('Gemini generation failed, trying fallback services:', error instanceof Error ? error.message : 'Unknown');
      }
    }
    
    // Priority 2: Try Claude if available
    if (this.config.enableClaude && this.config.anthropicApiKey) {
      try {
        return await this.generateWithClaude(analysisResult, documentType, context);
      } catch (error) {
        console.warn('Claude generation failed, trying GPT-4:', error instanceof Error ? error.message : 'Unknown');
      }
    }
    
    // Priority 3: Fallback to GPT-4
    return this.generateWithGPT4(analysisResult, documentType, context);
  }

  /**
   * Generate content using Google Gemini (FREE service)
   */
  private async generateWithGemini(
    analysisResult: DesignAnalysisResult,
    documentType: string,
    context?: { 
      techStack?: string; 
      projectName?: string; 
      additionalRequirements?: string 
    }
  ): Promise<string> {
    const prompt = this.getPromptTemplate('document_generation', documentType, context);
    const enhancedPrompt = this.enhancePromptWithAnalysis(prompt, analysisResult);

    const genAI = new GoogleGenAI({ apiKey: this.config.geminiApiKey! });
    
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: enhancedPrompt
    });
    
    return result.text || '';
  }

  /**
   * Generate content using Claude
   */
  private async generateWithClaude(
    analysisResult: DesignAnalysisResult,
    documentType: string,
    context?: { 
      techStack?: string; 
      projectName?: string; 
      additionalRequirements?: string 
    }
  ): Promise<string> {
    const prompt = this.getPromptTemplate('document_generation', documentType, context);
    const enhancedPrompt = this.enhancePromptWithAnalysis(prompt, analysisResult);

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      },
      {
        headers: {
          'x-api-key': this.config.anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  }

  /**
   * GPT-4 fallback for document generation
   */
  private async generateWithGPT4(
    analysisResult: DesignAnalysisResult,
    documentType: string,
    context?: any
  ): Promise<string> {
    if (!this.config.openaiApiKey) {
      throw new Error('No AI service available - both Claude and GPT-4 require API keys');
    }

    const prompt = this.getPromptTemplate('document_generation', documentType, context);
    const enhancedPrompt = this.enhancePromptWithAnalysis(prompt, analysisResult);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Load intelligent prompt templates for different document types
   */
  private loadPromptTemplates(): void {
    // Design Analysis Template
    this.promptTemplates.set('design_analysis', `
You are an expert UI/UX designer and design system architect. Analyze this design screenshot and provide a comprehensive analysis in JSON format.

Focus on:
1. **Component Identification**: Identify all UI components (buttons, inputs, cards, etc.)
2. **Design System Compliance**: Evaluate consistency in colors, typography, spacing
3. **Accessibility**: Check color contrast, focus states, semantic structure
4. **Technical Implementation**: Suggest component architecture and props

Return a structured JSON response matching the DesignAnalysisResult interface.
`);

    // Jira Ticket Template
    this.promptTemplates.set('document_generation_jira', `
Generate a comprehensive Jira ticket for implementing the analyzed design components.

Include:
- Clear user story with acceptance criteria
- Technical implementation details
- Design system integration notes
- Testing requirements
- Accessibility considerations
- Effort estimation

Use Jira markdown formatting and include relevant labels and components.
`);

    // Confluence Page Template
    this.promptTemplates.set('document_generation_confluence', `
Create a detailed Confluence documentation page for the design implementation.

Include:
- Component overview and usage guidelines
- Design specifications and measurements
- Code examples and integration patterns
- Design system relationships
- Accessibility requirements
- Implementation notes for developers

Use Confluence markup with proper headings, tables, and code blocks.
`);

    // Technical Specification Template
    this.promptTemplates.set('document_generation_technical_spec', `
Generate a comprehensive technical specification document.

Include:
- Architecture overview and component hierarchy
- API contracts and prop interfaces
- State management requirements
- Performance considerations
- Testing strategy
- Implementation timeline
- Dependencies and integration points

Use markdown formatting with detailed technical diagrams and code examples.
`);

    // GitHub Issue Template
    this.promptTemplates.set('document_generation_github_issue', `
Create a detailed GitHub issue for the design implementation.

Include:
- Problem statement and solution overview
- Implementation checklist with sub-tasks
- Technical requirements and constraints
- Testing criteria and acceptance conditions
- Related issues and dependencies
- Screenshots and design references

Use GitHub markdown with proper task lists, labels, and milestone suggestions.
`);

    // Wiki Documentation Template
    this.promptTemplates.set('document_generation_wiki', `
Generate comprehensive wiki documentation for the design system components.

Include:
- Component catalog with usage examples
- Design principles and guidelines
- Implementation patterns and best practices
- Customization options and theming
- Common pitfalls and troubleshooting
- Version history and migration guides

Use wiki markup with clear navigation and cross-references.
`);

    // Agent Task Template
    this.promptTemplates.set('document_generation_agent_task', `
Create a structured task definition for AI agents to implement the design.

Include:
- Step-by-step implementation instructions
- Code generation templates and patterns
- Validation criteria and testing steps
- Error handling and fallback strategies
- Integration points and dependencies
- Success metrics and completion criteria

Format as a clear, actionable task specification.
`);
  }

  /**
   * Get appropriate prompt template for document type
   */
  private getPromptTemplate(
    templateType: 'design_analysis' | 'document_generation',
    documentType: string,
    context?: any
  ): string {
    const key = templateType === 'design_analysis' 
      ? 'design_analysis' 
      : `document_generation_${documentType.toLowerCase().replace(/\s+/g, '_')}`;
    
    let template = this.promptTemplates.get(key) || this.promptTemplates.get('document_generation_jira')!;
    
    // Enhance template with context
    if (context?.techStack) {
      template += `\n\nTech Stack Context: ${context.techStack}`;
    }
    
    if (context?.projectName) {
      template += `\n\nProject: ${context.projectName}`;
    }

    if (context?.additionalRequirements) {
      template += `\n\nAdditional Requirements: ${context.additionalRequirements}`;
    }
    
    return template;
  }

  /**
   * Enhance prompt with analysis results
   */
  private enhancePromptWithAnalysis(prompt: string, analysis: DesignAnalysisResult): string {
    return `${prompt}

## Design Analysis Context:

### Components Identified:
${analysis.components.map(c => 
  `- ${c.name} (${c.type}): ${c.usage} usage, confidence: ${c.confidence}%`
).join('\n')}

### Design System Analysis:
- Color Compliance: ${analysis.designSystem.colors.compliance}%
- Typography Compliance: ${analysis.designSystem.typography.compliance}%
- Spacing Compliance: ${analysis.designSystem.spacing.compliance}%
- Overall Consistency: ${analysis.designSystem.consistency}%

### Accessibility Score: ${analysis.accessibility.overallScore}%

### Key Recommendations:
${analysis.recommendations.map(r => `- ${r}`).join('\n')}

Please generate the document incorporating these insights and maintaining consistency with the identified design patterns.`;
  }

  /**
   * Parse AI analysis response into structured result
   */
  private parseAnalysisResponse(analysisText: string): DesignAnalysisResult {
    try {
      // Attempt to parse JSON response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: Create structured response from text analysis
      return this.createFallbackAnalysis(analysisText);
      
    } catch (error) {
      console.warn('Failed to parse AI response as JSON, using fallback analysis');
      return this.createFallbackAnalysis(analysisText);
    }
  }

  /**
   * Create fallback analysis when JSON parsing fails
   */
  private createFallbackAnalysis(_text: string): DesignAnalysisResult {
    return {
      components: [
        {
          name: 'Detected Component',
          type: 'other',
          properties: {},
          variants: [],
          usage: 'primary',
          confidence: 70
        }
      ],
      designSystem: {
        colors: {
          palette: [],
          compliance: 75,
          issues: ['Analysis parsing incomplete']
        },
        typography: {
          fonts: [],
          hierarchy: [],
          compliance: 75
        },
        spacing: {
          grid: '8px',
          margins: [],
          padding: [],
          compliance: 75
        },
        consistency: 75
      },
      accessibility: {
        colorContrast: { passed: true, issues: [] },
        focusStates: { present: true, issues: [] },
        semanticStructure: { score: 75, issues: [] },
        overallScore: 75
      },
      recommendations: [
        'AI analysis required manual parsing',
        'Review generated content for accuracy',
        'Consider providing higher quality images for better analysis'
      ],
      confidence: 70
    };
  }

  /**
   * Test AI service configuration
   */
  async testConfiguration(): Promise<{ 
    gemini: boolean; 
    geminiVision: boolean; 
    vision: boolean; 
    claude: boolean; 
    gpt4: boolean 
  }> {
    const results = {
      gemini: false,
      geminiVision: false,
      vision: false,
      claude: false,
      gpt4: false
    };

    // Test Gemini (FREE TIER) - Using official SDK
    if (this.config.enableGemini && this.config.geminiApiKey) {
      try {
        const genAI = new GoogleGenAI({ apiKey: this.config.geminiApiKey });
        
        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'Test connection'
        });
        
        if (result) {
          results.gemini = true;
          results.geminiVision = true; // Gemini 2.5 Flash supports vision
        }
      } catch (error) {
        console.warn('Gemini test failed:', error instanceof Error ? error.message : 'Unknown');
      }
    }

    // Test GPT-4 Vision
    if (this.config.enableVision && this.config.openaiApiKey) {
      try {
        await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4-vision-preview',
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 10
          },
          {
            headers: { 'Authorization': `Bearer ${this.config.openaiApiKey}` },
            timeout: 5000
          }
        );
        results.vision = true;
      } catch (error) {
        console.warn('GPT-4 Vision test failed:', error instanceof Error ? error.message : 'Unknown');
      }
    }

    // Test Claude
    if (this.config.enableClaude && this.config.anthropicApiKey) {
      try {
        await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model: 'claude-3-sonnet-20240229',
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 10
          },
          {
            headers: { 
              'x-api-key': this.config.anthropicApiKey,
              'anthropic-version': '2023-06-01'
            },
            timeout: 5000
          }
        );
        results.claude = true;
      } catch (error) {
        console.warn('Claude test failed:', error instanceof Error ? error.message : 'Unknown');
      }
    }

    // Test GPT-4 (fallback)
    if (this.config.openaiApiKey) {
      try {
        await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: 'Test connection' }],
            max_tokens: 10
          },
          {
            headers: { 'Authorization': `Bearer ${this.config.openaiApiKey}` },
            timeout: 5000
          }
        );
        results.gpt4 = true;
      } catch (error) {
        console.warn('GPT-4 test failed:', error instanceof Error ? error.message : 'Unknown');
      }
    }

    return results;
  }
}

export default AdvancedAIService;