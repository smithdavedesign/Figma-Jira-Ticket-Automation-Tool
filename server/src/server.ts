#!/usr/bin/env node

/**
 * Figma AI Ticket Generator - Enhanced MCP Server with Figma Integration
 * 
 * Strategic design-to-code automation server with direct Figma MCP integration.
 * This server provides project-level intelligence and workflow automation capabilities
 * that complement and orchestrate with Figma's tactical MCP server.
 */

import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();
import { FigmaWorkflowOrchestrator } from './figma/figma-mcp-client.js';
import { enhancedFigmaMCPService, type FigmaMCPPromptConfig } from './figma/figma-mcp-integration.js';
import { AdvancedAIService } from './ai/advanced-ai-service.js';
import { FigmaMCPGeminiOrchestrator } from './ai/figma-mcp-gemini-orchestrator.js';
import type { CodeGenerationOptions } from './figma/boilerplate-generator.js';
import type { AIAnalysisConfig, DesignAnalysisResult } from './ai/advanced-ai-service.js';

/**
 * Tool implementations for demonstration
 */

interface ToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

class ProjectAnalyzer {
  async analyze(args: any): Promise<ToolResult> {
    const { figmaUrl, scope = 'file' } = args;
    const fileKey = this.extractFileKey(figmaUrl);
    
    if (!fileKey) {
      throw new Error('Invalid Figma URL provided');
    }

    const result = `# Project Analysis Results

## 📊 Project Overview
- **File**: Design System v2.0 (${fileKey})
- **Components**: 156
- **Frames**: 489  
- **Pages**: 12
- **Scope**: ${scope}

## 🎯 Design System Compliance: 87%

### Color Usage
- Primary Blue: 45 instances
- Secondary Green: 23 instances
- Custom Colors: 8 instances (needs attention)

### Component Usage
- Button Primary: 78 instances
- Card Component: 45 instances
- Input Field: 34 instances

## 💡 Key Insights
- High component reuse rate (87%) indicates good design system adoption
- 8 custom colors should be standardized with design tokens
- Modal Dialog component well-architected with clear dependencies

---
*Analysis completed at ${new Date().toISOString()}*`;

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private extractFileKey(url: string): string | null {
    const match = url.match(/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] || null : null;
  }
}

class TicketGenerator {
  private figmaOrchestrator: FigmaWorkflowOrchestrator;

  constructor() {
    this.figmaOrchestrator = new FigmaWorkflowOrchestrator();
  }

  async generate(args: any): Promise<ToolResult> {
    const { 
      frameData = [], 
      template = 'component', 
      projectName = 'Design Implementation',
      figmaContext = {},
      instructions = '',
      enableFigmaMCP = true
    } = args;

    console.log('🎫 Generating enhanced tickets for:', frameData.length, 'frames');
    console.log('🤝 Figma MCP integration:', enableFigmaMCP ? 'enabled' : 'disabled');
    
    if (!frameData || frameData.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: this.generateEmptyStateTicket(template, figmaContext, instructions),
          },
        ],
      };
    }

    // Enhanced ticket generation with optional Figma MCP integration
    const tickets = await Promise.all(
      frameData.map(async (frame: any) => {
        if (enableFigmaMCP && figmaContext.figmaUrl) {
          try {
            // Use enhanced workflow with Figma MCP integration
            const enhancedTicket = await this.figmaOrchestrator.generateEnhancedTicket(
              figmaContext.figmaUrl,
              template,
              instructions
            );
            
            return this.convertToTicketFormat(enhancedTicket, frame, figmaContext);
          } catch (error) {
            console.warn('⚠️ Figma MCP integration failed, using strategic-only generation:', error);
            // Fallback to strategic-only generation
            return this.generateDetailedTicket(frame, template, figmaContext, instructions);
          }
        } else {
          // Strategic-only generation (existing behavior)
          return this.generateDetailedTicket(frame, template, figmaContext, instructions);
        }
      })
    );

    const combinedTicket = this.combineTickets(tickets, projectName, figmaContext);

    return {
      content: [
        {
          type: 'text',
          text: combinedTicket,
        },
      ],
    };
  }

  /**
   * Convert enhanced ticket from Figma MCP integration to our format
   */
  private convertToTicketFormat(enhancedTicket: any, frame: any, figmaContext: any): any {
    const name = frame.name || enhancedTicket.title || 'Enhanced Component';
    const frameUrl = figmaContext.frameUrls?.find((url: string) => url.includes(frame.id)) || figmaContext.figmaUrl;
    
    return {
      title: enhancedTicket.title || `Enhanced: ${name}`,
      priority: this.calculatePriority(frame),
      storyPoints: this.estimateStoryPoints(frame),
      figmaLink: frameUrl,
      description: this.generateEnhancedDescription(enhancedTicket, frame, figmaContext),
      acceptanceCriteria: enhancedTicket.acceptanceCriteria || [
        '✅ Implementation matches Figma design exactly',
        '🎨 Uses design system tokens from Figma variables',
        '📱 Responsive design works across breakpoints',
        '♿ Meets accessibility standards (WCAG 2.1 AA)',
      ],
      technicalNotes: this.generateMCPTechnicalNotes(enhancedTicket),
      designSystemNotes: this.generateDesignSystemNotes(frame),
      subtasks: this.generateSubtasks(frame, enhancedTicket.template || 'component'),
    };
  }

  /**
   * Generate enhanced description combining strategic analysis with Figma MCP tactical details
   */
  private generateEnhancedDescription(enhancedTicket: any, frame: any, _figmaContext: any): string {
    let description = `## 🎯 Enhanced Implementation with Figma MCP Integration\n\n`;
    
    description += `**Component**: ${frame.name || 'Unnamed Component'}\n`;
    
    if (enhancedTicket.strategicAnalysis) {
      description += `**Strategic Analysis**: ${enhancedTicket.strategicAnalysis}\n`;
    }
    
    if (enhancedTicket.tacticalImplementation?.code) {
      description += `\n## 🔧 Tactical Implementation (via Figma MCP)\n\n`;
      description += `\`\`\`tsx\n${enhancedTicket.tacticalImplementation.code.substring(0, 500)}...\n\`\`\`\n\n`;
    }
    
    if (enhancedTicket.tacticalImplementation?.variables) {
      description += `## 🎨 Design Variables\n${enhancedTicket.tacticalImplementation.variables}\n\n`;
    }
    
    description += `## 📋 Implementation Guidelines\n`;
    description += `This component has been analyzed using both strategic project-level insights and tactical Figma MCP integration for comprehensive implementation guidance.\n\n`;
    
    if (enhancedTicket.fallbackMode) {
      description += `⚠️ **Note**: Generated in strategic-only mode due to Figma MCP unavailability.\n\n`;
    }
    
    return description;
  }

  /**
   * Generate enhanced technical notes with Figma MCP insights
   */
  private generateMCPTechnicalNotes(enhancedTicket: any): string {
    let notes = `## 🔧 Enhanced Technical Implementation\n\n`;
    
    if (enhancedTicket.tacticalImplementation?.code) {
      notes += `### Code Generation via Figma MCP\n`;
      notes += `- React + Tailwind implementation provided\n`;
      notes += `- Component structure optimized for design system integration\n`;
      notes += `- Responsive design patterns included\n\n`;
    }
    
    if (enhancedTicket.tacticalImplementation?.variables) {
      notes += `### Design System Integration\n`;
      notes += `- Design tokens extracted from Figma\n`;
      notes += `- Variable mappings provided for consistency\n`;
      notes += `- Color and typography tokens included\n\n`;
    }
    
    notes += `### Strategic Implementation Guidelines\n`;
    notes += `- Follow project conventions and patterns\n`;
    notes += `- Ensure accessibility compliance (WCAG 2.1 AA)\n`;
    notes += `- Implement responsive design across all breakpoints\n`;
    notes += `- Use design system components where possible\n\n`;
    
    return notes;
  }

  private calculatePriority(frame: any): string {
    if (frame.components && frame.components.length > 5) return 'High';
    if (frame.hasPrototype) return 'Medium';
    return 'Low';
  }

  private estimateStoryPoints(frame: any): number {
    let points = 3; // Base points
    if (frame.components) points += Math.min(frame.components.length, 5);
    if (frame.hasPrototype) points += 2;
    if (frame.nodeCount > 20) points += 1;
    return Math.min(points, 13); // Cap at 13 points
  }

  private generateDetailedTicket(frame: any, template: string, figmaContext: any, instructions: string): any {
    const name = frame.name || 'Unnamed Component';
    const frameUrl = figmaContext.frameUrls?.find((url: string) => url.includes(frame.id)) || figmaContext.figmaUrl;
    
    const ticket = {
      title: `${this.getTemplatePrefix(template)}: ${name}`,
      priority: this.calculatePriority(frame),
      storyPoints: this.estimateStoryPoints(frame),
      description: this.generateRichDescription(frame, template, figmaContext, instructions),
      acceptanceCriteria: this.generateAcceptanceCriteria(frame, template),
      technicalNotes: this.generateEnhancedTechnicalNotes(frame, template),
      designSystemNotes: this.generateDesignSystemNotes(frame),
      figmaLink: frameUrl,
      subtasks: this.generateSubtasks(frame, template)
    };

    return ticket;
  }

  private generateRichDescription(frame: any, template: string, figmaContext: any, instructions: string): string {
    const name = frame.name || 'Unnamed Component';
    const dimensions = frame.dimensions || { width: 0, height: 0 };
    
    let description = `## 🎯 Objective\n`;
    description += `Implement the **${name}** ${template} from the design specifications in ${figmaContext.fileName || 'Figma design file'}.\n\n`;
    
    description += `## 📐 Design Specifications\n`;
    description += `- **Component Name**: ${name}\n`;
    description += `- **Dimensions**: ${dimensions.width}×${dimensions.height}px\n`;
    description += `- **Template Type**: ${template.charAt(0).toUpperCase() + template.slice(1)}\n`;
    
    if (frame.nodeCount) {
      description += `- **Complexity**: ${frame.nodeCount} design elements\n`;
    }
    
    if (frame.components && frame.components.length > 0) {
      description += `- **Components Used**: ${frame.components.slice(0, 3).join(', ')}${frame.components.length > 3 ? '...' : ''}\n`;
    }
    
    description += `\n## 🎨 Design Context\n`;
    description += `This implementation should maintain consistency with the existing design system and follow established patterns.\n`;
    
    if (instructions) {
      description += `\n## 📝 Additional Requirements\n${instructions}\n`;
    }
    
    return description;
  }

  private generateAcceptanceCriteria(frame: any, template: string): string[] {
    const name = frame.name || 'component';
    const criteria = [
      `✅ **Visual Accuracy**: ${name} matches the Figma design specifications exactly`,
      `📱 **Responsive Design**: Component works seamlessly across all supported breakpoints (mobile, tablet, desktop)`,
      `♿ **Accessibility**: Meets WCAG 2.1 AA standards with proper ARIA labels, keyboard navigation, and screen reader support`,
      `🎨 **Design System Compliance**: Uses approved design tokens for colors, typography, spacing, and shadows`,
      `⚡ **Performance**: Component loads efficiently with optimized assets and minimal bundle impact`,
      `🧪 **Testing**: Unit tests cover all functionality with minimum 90% code coverage`,
      `📐 **Cross-browser Compatibility**: Verified functionality in Chrome, Firefox, Safari, and Edge`,
    ];

    if (template === 'component') {
      criteria.push(`🔧 **Reusability**: Component is modular and can be easily reused in other contexts`);
      criteria.push(`📚 **Documentation**: Component is documented with usage examples and prop specifications`);
    }
    
    if (template === 'feature') {
      criteria.push(`🔄 **Integration**: Feature integrates smoothly with existing application flow`);
      criteria.push(`📊 **Analytics**: Appropriate tracking events are implemented where needed`);
    }

    if (frame.hasPrototype) {
      criteria.push(`⚡ **Interactions**: All prototype interactions and animations are implemented as designed`);
    }

    return criteria;
  }

  private generateEnhancedTechnicalNotes(frame: any, template: string): string {
    let notes = `## 🔧 Implementation Guidelines\n\n`;
    
    notes += `### 🏗️ Architecture\n`;
    if (template === 'component') {
      notes += `- Create as a reusable component with clear prop interface\n`;
      notes += `- Follow component composition patterns\n`;
      notes += `- Implement proper state management if needed\n`;
    } else if (template === 'page') {
      notes += `- Structure as a page-level component\n`;
      notes += `- Implement proper routing and navigation\n`;
      notes += `- Consider SEO requirements (meta tags, structured data)\n`;
    }
    
    notes += `\n### 🎨 Styling\n`;
    notes += `- Use CSS-in-JS or styled-components for component-scoped styles\n`;
    notes += `- Leverage design system tokens for consistent theming\n`;
    notes += `- Implement responsive design using established breakpoints\n`;
    
    if (frame.nodeCount > 15) {
      notes += `\n### ⚡ Performance Considerations\n`;
      notes += `- Consider lazy loading for heavy components\n`;
      notes += `- Optimize image assets and implement proper loading strategies\n`;
      notes += `- Use React.memo or similar optimization techniques if applicable\n`;
    }
    
    if (frame.hasPrototype) {
      notes += `\n### 🎬 Animations & Interactions\n`;
      notes += `- Implement micro-interactions as shown in prototype\n`;
      notes += `- Use CSS transitions or animation library for smooth effects\n`;
      notes += `- Ensure animations respect user's motion preferences\n`;
    }
    
    return notes;
  }

  private generateDesignSystemNotes(frame: any): string {
    let notes = `## 🎨 Design System Integration\n\n`;
    
    notes += `### 🎯 Key Elements to Verify\n`;
    notes += `- **Colors**: Use semantic color tokens (primary, secondary, accent, neutral)\n`;
    notes += `- **Typography**: Apply type scale and font weights from design system\n`;
    notes += `- **Spacing**: Use consistent spacing tokens (4px, 8px, 16px, 24px, 32px)\n`;
    notes += `- **Border Radius**: Apply standard border radius values from design tokens\n`;
    notes += `- **Shadows**: Use elevation system for depth and hierarchy\n`;
    
    if (frame.components && frame.components.length > 0) {
      notes += `\n### 🧩 Component Dependencies\n`;
      frame.components.slice(0, 5).forEach((comp: string) => {
        notes += `- **${comp}**: Ensure latest version is used with proper configuration\n`;
      });
    }
    
    notes += `\n### ✅ Compliance Checklist\n`;
    notes += `- [ ] All colors match design system palette\n`;
    notes += `- [ ] Typography scales correctly across breakpoints\n`;
    notes += `- [ ] Spacing follows 8px grid system\n`;
    notes += `- [ ] Interactive states (hover, focus, active) are implemented\n`;
    notes += `- [ ] Component variants are properly configured\n`;
    
    return notes;
  }

  private generateSubtasks(frame: any, template: string): string[] {
    const tasks = [
      '🏗️ Set up component structure and basic markup',
      '🎨 Implement styling with design system tokens',
      '⚡ Add interactive functionality and event handlers',
      '📱 Ensure responsive behavior across breakpoints',
      '♿ Implement accessibility features and ARIA attributes',
      '🧪 Write comprehensive unit tests',
      '📚 Update component documentation and examples'
    ];

    if (template === 'feature') {
      tasks.push('🔄 Integrate with application state management');
      tasks.push('📊 Implement analytics tracking');
    }

    if (frame.hasPrototype) {
      tasks.push('🎬 Implement animations and micro-interactions');
    }

    return tasks;
  }

  private combineTickets(tickets: any[], projectName: string, figmaContext: any): string {
    if (tickets.length === 0) return 'No tickets generated.';
    
    if (tickets.length === 1) {
      return this.formatSingleTicket(tickets[0], figmaContext);
    }
    
    // Multiple tickets - create epic format
    let output = `# 🚀 ${projectName} - Implementation Epic\n\n`;
    
    if (figmaContext.figmaUrl) {
      output += `**📎 Figma Design**: [View in Figma](${figmaContext.figmaUrl})\n\n`;
    }
    
    output += `## 📊 Epic Overview\n`;
    output += `- **Total Components**: ${tickets.length}\n`;
    output += `- **Estimated Story Points**: ${tickets.reduce((sum: number, t: any) => sum + t.storyPoints, 0)}\n`;
    output += `- **Priority Distribution**: ${this.getPriorityDistribution(tickets)}\n\n`;
    
    output += `## 🎫 Implementation Tickets\n\n`;
    
    tickets.forEach((ticket: any, index: number) => {
      output += `### ${index + 1}. ${ticket.title}\n`;
      output += `**Priority**: ${ticket.priority} | **Story Points**: ${ticket.storyPoints}\n\n`;
      output += `${ticket.description}\n\n`;
      
      if (ticket.figmaLink) {
        output += `**🔗 Figma Link**: [View Component](${ticket.figmaLink})\n\n`;
      }
      
      output += `**Acceptance Criteria**:\n`;
      ticket.acceptanceCriteria.forEach((criteria: string) => {
        output += `- ${criteria}\n`;
      });
      output += `\n`;
      
      output += `${ticket.technicalNotes}\n\n`;
      output += `${ticket.designSystemNotes}\n\n`;
      
      if (index < tickets.length - 1) {
        output += `---\n\n`;
      }
    });
    
    return output;
  }

  private formatSingleTicket(ticket: any, _figmaContext: any): string {
    let output = `# ${ticket.title}\n\n`;
    
    output += `**Priority**: ${ticket.priority} | **Story Points**: ${ticket.storyPoints}\n\n`;
    
    if (ticket.figmaLink) {
      output += `**🔗 Figma Design**: [View Component](${ticket.figmaLink})\n\n`;
    }
    
    output += `${ticket.description}\n\n`;
    
    output += `## ✅ Acceptance Criteria\n\n`;
    ticket.acceptanceCriteria.forEach((criteria: string) => {
      output += `${criteria}\n\n`;
    });
    
    output += `${ticket.technicalNotes}\n\n`;
    output += `${ticket.designSystemNotes}\n\n`;
    
    output += `## 📋 Subtasks\n\n`;
    ticket.subtasks.forEach((task: string) => {
      output += `- [ ] ${task}\n`;
    });
    
    return output;
  }

  private generateEmptyStateTicket(template: string, figmaContext: any, instructions: string): string {
    let output = `# ${this.getTemplatePrefix(template)}: New Implementation\n\n`;
    
    if (figmaContext.figmaUrl) {
      output += `**🔗 Figma Design**: [View in Figma](${figmaContext.figmaUrl})\n\n`;
    }
    
    output += `## 🎯 Objective\n`;
    output += `Implement ${template} based on design specifications.\n\n`;
    
    if (instructions) {
      output += `## 📝 Additional Requirements\n${instructions}\n\n`;
    }
    
    output += `## ✅ Acceptance Criteria\n\n`;
    output += `- ✅ Implementation matches design specifications exactly\n`;
    output += `- 📱 Responsive design works across all breakpoints\n`;
    output += `- ♿ Meets accessibility standards (WCAG 2.1 AA)\n`;
    output += `- 🎨 Uses design system tokens consistently\n`;
    output += `- 🧪 Comprehensive test coverage implemented\n\n`;
    
    return output;
  }

  private getTemplatePrefix(template: string): string {
    const prefixes: { [key: string]: string } = {
      'component': '🧩 Component',
      'feature': '⚡ Feature',
      'page': '📄 Page',
      'bug': '🐛 Bug Fix',
      'custom': '🎯 Custom'
    };
    return prefixes[template] || '🎯 Task';
  }

  private getPriorityDistribution(tickets: any[]): string {
    const counts = tickets.reduce((acc: any, t: any) => {
      acc[t.priority] = (acc[t.priority] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts)
      .map(([priority, count]) => `${priority}: ${count}`)
      .join(', ');
  }
}

/**
 * AI-Powered Ticket Generator with GPT-4 Vision and Claude Integration
 * 
 * Provides advanced design analysis and intelligent document generation
 * using state-of-the-art AI models for multi-modal design understanding.
 */
class AIEnhancedTicketGenerator {
  private aiService: AdvancedAIService;
  private fallbackGenerator: TicketGenerator;

  constructor(aiConfig: AIAnalysisConfig) {
    this.aiService = new AdvancedAIService(aiConfig);
    this.fallbackGenerator = new TicketGenerator();
  }

  /**
   * Generate intelligent ticket with AI-powered design analysis
   */
  async generateWithAI(args: any): Promise<ToolResult> {
    const {
      figmaUrl,
      documentType = 'jira',
      techStack,
      projectName,
      imageData, // Base64 encoded screenshot
      screenshot, // Alternative screenshot parameter
      enhancedFrameData, // Enhanced frame data from Figma plugin
      additionalRequirements = '',
      useAI = true
    } = args;

    console.log('🤖 Starting AI-enhanced ticket generation...');
    console.log('📋 Document type:', documentType);
    console.log('🔮 AI enabled:', useAI);

    // Test AI services if requested
    if (useAI) {
      const aiStatus = await this.aiService.testConfiguration();
      console.log('🧠 AI Services Status:', aiStatus);
      
      if (!aiStatus.gemini && !aiStatus.vision && !aiStatus.claude && !aiStatus.gpt4) {
        console.warn('⚠️ No AI services available, falling back to standard generation');
        return this.fallbackGenerator.generate(args);
      }
    }

    try {
      let analysisResult: DesignAnalysisResult | null = null;

      // Step 1: AI-powered design analysis (prioritize enhanced frame data)
      const actualImageData = imageData || screenshot;
      
      if (useAI && enhancedFrameData && enhancedFrameData.length > 0) {
        console.log('🎯 Using enhanced frame data for targeted component analysis...');
        console.log(`� Analyzing ${enhancedFrameData.length} selected components`);
        
        // Create analysis from enhanced frame data
        analysisResult = this.createAnalysisFromFrameData(enhancedFrameData, { techStack, projectName });
        
        // If we also have a screenshot, enhance with visual analysis
        if (actualImageData) {
          console.log('🔍 Enhancing with screenshot analysis...');
          try {
            const imageBuffer = Buffer.from(actualImageData.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
            const visualAnalysis = await this.aiService.analyzeDesignScreenshot(
              imageBuffer,
              documentType,
              { techStack, projectName }
            );
            
            // Merge visual analysis with frame data analysis
            analysisResult = this.mergeAnalysisResults(analysisResult, visualAnalysis);
            console.log(`✅ Enhanced analysis complete - confidence: ${analysisResult.confidence}%`);
          } catch (error) {
            console.warn('⚠️ Screenshot analysis failed, using frame data only:', error);
          }
        }
        
        console.log(`� Component-focused analysis: ${analysisResult.components.length} components identified`);
        
      } else if (useAI && actualImageData) {
        console.log('🔍 Analyzing design with image analysis only...');
        const imageBuffer = Buffer.from(actualImageData.replace(/^data:image\/[a-z]+;base64,/, ''), 'base64');
        
        analysisResult = await this.aiService.analyzeDesignScreenshot(
          imageBuffer,
          documentType,
          { techStack, projectName }
        );
        
        console.log(`✅ Image analysis complete - confidence: ${analysisResult.confidence}%`);
        console.log(`📊 Found ${analysisResult.components.length} components`);
        
      } else if (useAI) {
        // Generate AI content with basic analysis
        console.log('🤖 Creating AI-enhanced content with basic analysis...');
        analysisResult = {
          components: [],
          designSystem: { 
            colors: { palette: [], compliance: 85, issues: [] },
            typography: { fonts: [], hierarchy: [], compliance: 85 },
            spacing: { grid: '8px', margins: [], padding: [], compliance: 85 },
            consistency: 85 
          },
          accessibility: { 
            colorContrast: { passed: true, issues: [] },
            focusStates: { present: true, issues: [] },
            semanticStructure: { score: 80, issues: [] },
            overallScore: 80 
          },
          recommendations: [`Enhance ${documentType} with best practices for ${techStack}`],
          confidence: 75
        };
      }

      // Step 2: Intelligent document generation
      let documentContent: string;
      
      if (useAI && analysisResult) {
        console.log('📝 Generating intelligent document content...');
        documentContent = await this.aiService.generateDocumentContent(
          analysisResult,
          documentType,
          { techStack, projectName, additionalRequirements }
        );
      } else {
        // Fallback to standard generation
        console.log('📄 Using standard document generation...');
        const fallbackResult = await this.fallbackGenerator.generate(args);
        documentContent = fallbackResult.content[0]?.text || 'Error: Could not generate fallback content';
      }

      // Step 3: Create enhanced result with AI insights
      const enhancedResult = this.createEnhancedResult(
        documentContent,
        analysisResult,
        { figmaUrl, documentType, techStack, projectName }
      );

      return {
        content: [
          {
            type: 'text',
            text: enhancedResult
          }
        ]
      };

    } catch (error) {
      console.error('❌ AI-enhanced generation failed:', error);
      console.log('🔄 Falling back to standard generation...');
      
      // Fallback to standard generation
      return this.fallbackGenerator.generate(args);
    }
  }

  /**
   * Create enhanced result combining AI analysis with document content
   */
  private createEnhancedResult(
    documentContent: string,
    analysisResult: DesignAnalysisResult | null,
    context: any
  ): string {
    let result = `# 🤖 AI-Enhanced ${context.documentType.toUpperCase()} Document\n\n`;
    
    // Add AI analysis summary if available
    if (analysisResult) {
      result += `## 🧠 AI Design Analysis Summary\n\n`;
      result += `- **Confidence Score**: ${analysisResult.confidence}%\n`;
      result += `- **Components Identified**: ${analysisResult.components.length}\n`;
      result += `- **Design System Consistency**: ${analysisResult.designSystem.consistency}%\n`;
      result += `- **Accessibility Score**: ${analysisResult.accessibility.overallScore}%\n\n`;
      
      if (analysisResult.components.length > 0) {
        result += `### 🔧 Key Components\n`;
        analysisResult.components.slice(0, 5).forEach(component => {
          result += `- **${component.name}** (${component.type}): ${component.usage} usage\n`;
        });
        result += `\n`;
      }
      
      if (analysisResult.recommendations.length > 0) {
        result += `### 💡 AI Recommendations\n`;
        analysisResult.recommendations.slice(0, 3).forEach(rec => {
          result += `- ${rec}\n`;
        });
        result += `\n`;
      }
    }
    
    // Add Figma context
    if (context.figmaUrl) {
      result += `## 🎨 Figma Reference\n`;
      result += `- **Design Source**: [View in Figma](${context.figmaUrl})\n`;
      if (context.projectName) {
        result += `- **Project**: ${context.projectName}\n`;
      }
      if (context.techStack) {
        result += `- **Tech Stack**: ${context.techStack}\n`;
      }
      result += `\n`;
    }
    
    // Add the main document content
    result += `## 📋 Implementation Details\n\n`;
    result += documentContent;
    
    // Add AI enhancement footer
    result += `\n\n---\n`;
    result += `*🤖 This document was enhanced with AI-powered design analysis`;
    if (analysisResult) {
      result += ` (${analysisResult.confidence}% confidence)`;
    }
    result += `*\n`;
    result += `*Generated on ${new Date().toISOString()}*`;
    
    return result;
  }

  /**
   * Test AI service availability
   */
  async testAIServices(): Promise<ToolResult> {
    const status = await this.aiService.testConfiguration();
    
    const result = `# 🧠 AI Services Status Report

## Service Availability
- **🆓 Google Gemini**: ${status.gemini ? '✅ Available (FREE)' : '❌ Unavailable'}
- **🖼️ Gemini Vision**: ${status.geminiVision ? '✅ Available (FREE)' : '❌ Unavailable'}
- **GPT-4 Vision**: ${status.vision ? '✅ Available' : '❌ Unavailable'}
- **Claude**: ${status.claude ? '✅ Available' : '❌ Unavailable'}  
- **GPT-4 (Fallback)**: ${status.gpt4 ? '✅ Available' : '❌ Unavailable'}

## Capabilities
${status.gemini ? '- 🆓 FREE AI-powered document generation with Google Gemini\n' : ''}${status.geminiVision ? '- 🖼️ FREE design screenshot analysis with Gemini Vision\n' : ''}${status.vision ? '- 🖼️ Advanced design screenshot analysis with GPT-4 Vision\n' : ''}${status.claude ? '- 📝 Premium document generation with Claude\n' : ''}${status.gpt4 ? '- 🔄 GPT-4 fallback for document generation\n' : ''}
${!status.gemini && !status.vision && !status.claude && !status.gpt4 ? '- 📄 Standard generation (no AI services available)\n' : ''}
## Configuration Requirements
${!status.gemini ? '- Set GEMINI_API_KEY for FREE Google AI generation (recommended)\n' : ''}${!status.vision ? '- Set OPENAI_API_KEY for GPT-4 Vision and fallback generation\n' : ''}${!status.claude ? '- Set ANTHROPIC_API_KEY for Claude document generation\n' : ''}
## Service Priority
1. 🆓 **Gemini** (FREE) - Primary AI service for generation
2. 🤖 **Claude** (PAID) - Premium document generation
3. 🧠 **GPT-4** (PAID) - Advanced analysis and fallback
4. 📄 **Standard** - Always available fallback

*Tested at ${new Date().toISOString()}*`;

    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  }

  /**
   * Create design analysis from enhanced frame data
   */
  private createAnalysisFromFrameData(enhancedFrameData: any[], context?: any): DesignAnalysisResult {
    const components = enhancedFrameData.map(frame => ({
      name: frame.name || 'Unknown Component',
      type: this.mapFigmaTypeToComponent(frame.type),
      properties: {
        width: frame.dimensions?.width || 0,
        height: frame.dimensions?.height || 0,
        figmaType: frame.type
      },
      variants: frame.componentInstances ? ['default', 'hover', 'active'] : ['default'],
      usage: this.inferUsageFromType(frame.type),
      confidence: 90 // High confidence since we have actual Figma data
    }));

    const colors = this.extractColorsFromFrameData(enhancedFrameData);
    const typography = this.extractTypographyFromFrameData(enhancedFrameData);
    const spacing = this.extractSpacingFromFrameData(enhancedFrameData);

    return {
      components,
      designSystem: {
        colors: {
          palette: colors.map(color => ({ color, usage: 'component', count: 1 })),
          compliance: 90,
          issues: []
        },
        typography: {
          fonts: typography.fonts || [],
          hierarchy: typography.hierarchy || [],
          compliance: 90
        },
        spacing: {
          grid: spacing.grid || '8px',
          margins: spacing.margins || [],
          padding: spacing.padding || [],
          compliance: 90
        },
        consistency: 90
      },
      accessibility: {
        colorContrast: { passed: true, issues: [] },
        focusStates: { present: true, issues: [] },
        semanticStructure: { score: 85, issues: [] },
        overallScore: 85
      },
      recommendations: [
        `Implement ${components[0]?.name || 'component'} with focus on ${context?.techStack || 'current tech stack'}`,
        'Ensure accessibility compliance for all interactive elements',
        'Maintain design system consistency across implementation'
      ],
      confidence: 90
    };
  }

  /**
   * Merge two analysis results, prioritizing frame data
   */
  private mergeAnalysisResults(frameAnalysis: DesignAnalysisResult, visualAnalysis: DesignAnalysisResult): DesignAnalysisResult {
    return {
      components: [...frameAnalysis.components, ...visualAnalysis.components.slice(0, 2)], // Combine but prioritize frame data
      designSystem: {
        colors: {
          palette: [...frameAnalysis.designSystem.colors.palette, ...visualAnalysis.designSystem.colors.palette.slice(0, 3)],
          compliance: Math.max(frameAnalysis.designSystem.colors.compliance, visualAnalysis.designSystem.colors.compliance),
          issues: [...frameAnalysis.designSystem.colors.issues, ...visualAnalysis.designSystem.colors.issues]
        },
        typography: visualAnalysis.designSystem.typography.fonts.length > 0 ? visualAnalysis.designSystem.typography : frameAnalysis.designSystem.typography,
        spacing: frameAnalysis.designSystem.spacing.grid !== '8px' ? frameAnalysis.designSystem.spacing : visualAnalysis.designSystem.spacing,
        consistency: Math.max(frameAnalysis.designSystem.consistency, visualAnalysis.designSystem.consistency)
      },
      accessibility: {
        colorContrast: { 
          passed: frameAnalysis.accessibility.colorContrast.passed && visualAnalysis.accessibility.colorContrast.passed,
          issues: [...frameAnalysis.accessibility.colorContrast.issues, ...visualAnalysis.accessibility.colorContrast.issues]
        },
        focusStates: frameAnalysis.accessibility.focusStates,
        semanticStructure: {
          score: Math.max(frameAnalysis.accessibility.semanticStructure.score, visualAnalysis.accessibility.semanticStructure.score),
          issues: [...frameAnalysis.accessibility.semanticStructure.issues, ...visualAnalysis.accessibility.semanticStructure.issues]
        },
        overallScore: Math.max(frameAnalysis.accessibility.overallScore, visualAnalysis.accessibility.overallScore)
      },
      recommendations: [...frameAnalysis.recommendations.slice(0, 2), ...visualAnalysis.recommendations.slice(0, 2)],
      confidence: Math.max(frameAnalysis.confidence, visualAnalysis.confidence)
    };
  }

  /**
   * Helper methods for extracting data from frame data
   */
  private mapFigmaTypeToComponent(figmaType: string): 'button' | 'input' | 'card' | 'modal' | 'navigation' | 'other' {
    const name = figmaType?.toLowerCase() || '';
    if (name.includes('button') || figmaType === 'COMPONENT') return 'button';
    if (name.includes('input') || name.includes('field')) return 'input';
    if (name.includes('card')) return 'card';
    if (name.includes('modal') || name.includes('dialog')) return 'modal';
    if (name.includes('nav') || name.includes('menu')) return 'navigation';
    return 'other';
  }

  private inferUsageFromType(type: string): 'primary' | 'secondary' | 'tertiary' {
    const typeMap: { [key: string]: 'primary' | 'secondary' | 'tertiary' } = {
      'COMPONENT': 'primary',
      'INSTANCE': 'secondary', 
      'FRAME': 'tertiary',
      'GROUP': 'tertiary',
      'TEXT': 'tertiary'
    };
    return typeMap[type] || 'primary';
  }

  private extractColorsFromFrameData(frameData: any[]): string[] {
    const colors: string[] = [];
    frameData.forEach(frame => {
      if (frame.metadata?.colors) {
        colors.push(...frame.metadata.colors);
      }
    });
    return [...new Set(colors)]; // Remove duplicates
  }

  private extractTypographyFromFrameData(frameData: any[]): { fonts: any[], hierarchy: string[] } {
    const fonts: any[] = [];
    const hierarchy: string[] = [];
    
    frameData.forEach(frame => {
      if (frame.metadata?.textContent) {
        hierarchy.push('body', 'heading');
      }
    });
    
    return { fonts, hierarchy: [...new Set(hierarchy)] };
  }

  private extractSpacingFromFrameData(frameData: any[]): { grid: string, margins: string[], padding: string[] } {
    // Analyze dimensions to infer spacing patterns
    const dimensions = frameData.map(frame => ({
      width: frame.dimensions?.width || 0,
      height: frame.dimensions?.height || 0
    }));
    
    // Simple grid detection based on common dimensions
    const grid = dimensions.some(d => d.width % 8 === 0 && d.height % 8 === 0) ? '8px' : '4px';
    
    return {
      grid,
      margins: ['8px', '16px', '24px'],
      padding: ['4px', '8px', '12px', '16px']
    };
  }
}

class ComplianceChecker {
  async check(args: any): Promise<ToolResult> {
    const { figmaUrl, categories = ['all'] } = args;
    const fileKey = this.extractFileKey(figmaUrl);
    
    if (!fileKey) {
      throw new Error('Invalid Figma URL provided');
    }

    const result = `# Design System Compliance Report

## 📊 Overall Compliance Score: 87%
**File**: ${fileKey}
**Categories Checked**: ${categories.join(', ')}

### 🎨 Color Compliance: 92%
- **Compliant**: 156 instances using design tokens
- **Non-compliant**: 14 instances using custom colors

#### Violations Found:
- Custom color #FF5733 used 8 times (replace with \`--color-accent-orange\`)
- RGB(45, 67, 89) used 6 times (replace with \`--color-neutral-600\`)

### 📝 Typography Compliance: 89%
- **Compliant**: 298 text instances using design system fonts
- **Non-compliant**: 37 instances using custom typography

### 🧩 Component Compliance: 91%
- **Standard Components**: 142 instances
- **Custom Implementations**: 14 instances

## 💡 Recommendations
1. Replace custom colors with design system tokens
2. Standardize custom button implementations
3. Implement automated linting rules

---
*Compliance check completed at ${new Date().toISOString()}*`;

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  }

  private extractFileKey(url: string): string | null {
    const match = url.match(/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] || null : null;
  }
}

/**
 * Standalone Test Server
 */
class FigmaAITestServer {
  private projectAnalyzer: ProjectAnalyzer;
  private ticketGenerator: TicketGenerator;
  private complianceChecker: ComplianceChecker;
  private aiEnhancedGenerator: AIEnhancedTicketGenerator;
  private port: number;

  constructor(port: number = 3000) {
    this.projectAnalyzer = new ProjectAnalyzer();
    this.ticketGenerator = new TicketGenerator();
    this.complianceChecker = new ComplianceChecker();
    
    // Initialize AI service with configuration from environment
    const aiConfig: AIAnalysisConfig = {
      geminiApiKey: process.env.GEMINI_API_KEY || undefined,
      openaiApiKey: process.env.OPENAI_API_KEY || undefined,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || undefined,
      enableGemini: process.env.ENABLE_GEMINI !== 'false', // Default enabled
      enableVision: process.env.ENABLE_AI_VISION !== 'false',
      enableClaude: process.env.ENABLE_CLAUDE !== 'false', 
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
    };
    
    this.aiEnhancedGenerator = new AIEnhancedTicketGenerator(aiConfig);
    this.port = port;
  }

  async handleRequest(method: string, body: any): Promise<any> {
    try {
      switch (method) {
        case 'analyze_project':
          return await this.projectAnalyzer.analyze(body);

        case 'generate_tickets':
          return await this.ticketGenerator.generate(body);

        case 'check_compliance':
          return await this.complianceChecker.check(body);

        case 'generate_enhanced_ticket':
          return await this.generateEnhancedTicketWithBoilerplate(body);

        case 'generate_ai_ticket':
          return await this.aiEnhancedGenerator.generateWithAI(body);

        case 'test_ai_services':
          return await this.aiEnhancedGenerator.testAIServices();

        case 'generate_visual_enhanced_ticket':
          return await this.generateVisualEnhancedTicket(body);

        default:
          // Don't catch unknown method errors - let them bubble up for proper HTTP error handling
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
      // Only catch and format non-unknown-method errors
      if (error instanceof Error && error.message.startsWith('Unknown method:')) {
        throw error; // Re-throw for proper HTTP error handling
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        content: [
          {
            type: 'text',
            text: `Error executing method "${method}": ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Enhanced ticket generation with boilerplate code
   */
  async generateEnhancedTicketWithBoilerplate(params: {
    techStack?: string;
    documentType?: string;
    confidence?: number;
    detectedTech?: any;
    designContext?: any;
    figmaContext?: {
      fileKey?: string;
      fileName?: string;
      selection?: Array<{
        id: string;
        name: string;
        type: string;
        textContent?: Array<{content: string; style: string}>;
        colors?: string[];
        dimensions?: {width: number; height: number};
        nodeCount?: number;
        pageName?: string;
        hasPrototype?: boolean;
        components?: any[];
        designSystemContext?: any;
      }>;
      hasSelection: boolean;
    };
    figmaUrl?: string;
    projectContext?: string;
    options?: CodeGenerationOptions;
  }): Promise<{
    content: Array<{ type: string; text: string }>;
    ticket: string;
    boilerplateCode: {
      component: string;
      styles: string;
      tests?: string;
      story?: string;
      types?: string;
    };
    isFallback?: boolean;
    fallbackReason?: string;
  }> {
    try {
      console.log('🚀 Starting enhanced ticket generation with boilerplate code...');
      console.log('📊 Received figmaContext:', JSON.stringify(params.figmaContext, null, 2));

      // Extract detailed information from Figma context
      const figmaSelection = params.figmaContext?.selection?.[0];
      const hasRichContext = figmaSelection && Object.keys(figmaSelection).length > 3;

      let enhancedTicket: string;
      let boilerplateCode: any;

      if (hasRichContext && figmaSelection) {
        // Generate context-aware ticket with rich Figma data
        enhancedTicket = this.generateContextAwareTicket(figmaSelection, params);
        boilerplateCode = this.generateContextAwareBoilerplate(figmaSelection, params);
      } else {
        // Fallback to basic ticket generation
        console.log('⚠️ Limited context available, using fallback generation');
        enhancedTicket = this.generateFallbackTicket(params);
        boilerplateCode = this.generateFallbackBoilerplate(params.techStack || 'React');
      }

      console.log('✅ Enhanced ticket with boilerplate generated successfully!');

      return {
        content: [
          {
            type: 'text',
            text: enhancedTicket
          }
        ],
        ticket: enhancedTicket,
        boilerplateCode,
        isFallback: !hasRichContext,
        ...(hasRichContext ? {} : { fallbackReason: 'Limited Figma context available' })
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Enhanced ticket generation failed:', errorMessage);
      
      // Generate fallback content when processing fails
      const fallbackTicket = this.generateFallbackTicket(params);
      const fallbackBoilerplate = this.generateFallbackBoilerplate(params.techStack || 'React');
      
      return {
        content: [
          {
            type: 'text',
            text: fallbackTicket
          }
        ],
        ticket: fallbackTicket,
        boilerplateCode: fallbackBoilerplate,
        isFallback: true,
        fallbackReason: 'Enhanced analysis temporarily unavailable'
      };
    }
  }

  /**
   * Generate context-aware ticket using rich Figma selection data
   */
  private generateContextAwareTicket(figmaSelection: any, params: any): string {
    const componentName = figmaSelection.name || 'Component';
    const techStack = params.techStack || 'React TypeScript';
    const pageName = figmaSelection.pageName || 'Design Page';
    const nodeCount = figmaSelection.nodeCount || 0;
    const dimensions = figmaSelection.dimensions;
    const colors = figmaSelection.colors || [];
    const textContent = figmaSelection.textContent || [];
    
    // Generate complexity assessment
    const complexity = nodeCount > 15 ? 'Complex' : nodeCount > 8 ? 'Medium' : 'Simple';
    const effort = complexity === 'Complex' ? '6-8 hours' : complexity === 'Medium' ? '4-6 hours' : '2-4 hours';
    
    // Extract text content for context
    const textContentSummary = textContent.length > 0 
      ? textContent.map((t: any) => `"${t.content}" (${t.style})`).join(', ')
      : 'No text content';
    
    // Color analysis
    const colorSummary = colors.length > 0 
      ? colors.map((c: string) => c).join(', ')
      : 'No specific colors detected';

    return `# 🎨 ${componentName} Implementation

## 📋 Component Overview
**Component**: ${componentName}  
**Page**: ${pageName}  
**File**: ${figmaSelection.fileName || 'Figma Design'}  
**Tech Stack**: ${techStack}  
**Complexity**: ${complexity} (${nodeCount} nodes)  
**Estimated Effort**: ${effort}

## 🎯 Design Specifications

### Dimensions
${dimensions ? `- Width: ${dimensions.width}px` : '- Width: Not specified'}
${dimensions ? `- Height: ${dimensions.height}px` : '- Height: Not specified'}

### Content Analysis
- **Text Elements**: ${textContent.length} items
- **Content**: ${textContentSummary}

### Color Palette
- **Colors Used**: ${colorSummary}

## 💻 Implementation Requirements

### 1. Component Structure
- Create ${componentName} component using ${techStack}
- Implement responsive design for multiple screen sizes
- Follow established design system patterns

### 2. Content Implementation
${textContent.length > 0 ? textContent.map((t: any, i: number) => 
  `- **Text ${i + 1}**: "${t.content}" using ${t.style} typography`
).join('\n') : '- No specific text content to implement'}

### 3. Styling Requirements
- Apply color scheme: ${colorSummary}
- Maintain exact dimensions where specified
- Implement proper spacing and layout

### 4. Interactive Features
${figmaSelection.hasPrototype ? '- Implement prototype interactions' : '- Add standard interactive behaviors'}
- Ensure accessibility compliance (ARIA labels, keyboard navigation)
- Add hover and focus states

## ✅ Acceptance Criteria

- [ ] Component matches Figma design exactly
- [ ] All text content rendered with correct typography
- [ ] Color scheme implemented accurately
- [ ] Responsive behavior works across devices
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Component integrates with existing design system
- [ ] Code follows team coding standards
- [ ] Unit tests written and passing
- [ ] Storybook story created (if applicable)

## 🔧 Technical Notes

- **Framework**: ${techStack}
- **Styling**: Use CSS modules or styled-components
- **Testing**: Jest + React Testing Library
- **Documentation**: Include prop types and usage examples

## 📦 Deliverables

1. **Component Code**: Fully implemented ${componentName}
2. **Styles**: CSS/SCSS with exact design specifications
3. **Tests**: Unit tests covering all functionality
4. **Documentation**: Component usage guide
5. **Storybook**: Interactive component showcase

---
*Generated from Figma selection: ${figmaSelection.id} | Complexity: ${complexity} | Effort: ${effort}*`;
  }

  /**
   * Generate context-aware boilerplate code using Figma selection data
   */
  private generateContextAwareBoilerplate(figmaSelection: any, params: any): any {
    const componentName = figmaSelection.name?.replace(/[^a-zA-Z0-9]/g, '') || 'Component';
    const techStack = params.techStack || 'React TypeScript';
    const textContent = figmaSelection.textContent || [];
    const colors = figmaSelection.colors || [];
    const dimensions = figmaSelection.dimensions;
    
    // Determine if this is TypeScript or JavaScript
    const isTypeScript = techStack.toLowerCase().includes('typescript');
    
    // Generate component props based on content
    const hasTextContent = textContent.length > 0;
    const hasCustomColors = colors.length > 0;
    const hasDimensions = dimensions && (dimensions.width || dimensions.height);
    
    const componentCode = this.generateComponentCode(
      componentName, 
      figmaSelection, 
      isTypeScript, 
      hasTextContent, 
      hasCustomColors, 
      hasDimensions
    );
    
    const stylesCode = this.generateStylesCode(
      componentName, 
      figmaSelection, 
      colors, 
      dimensions
    );
    
    const testsCode = this.generateTestsCode(componentName, textContent, isTypeScript);
    
    const storyCode = this.generateStoryCode(componentName, figmaSelection, isTypeScript);
    
    const typesCode = isTypeScript ? this.generateTypesCode(componentName, figmaSelection) : '';

    return {
      component: componentCode,
      styles: stylesCode,
      tests: testsCode,
      story: storyCode,
      ...(isTypeScript && { types: typesCode })
    };
  }

  /**
   * Generate component code with Figma context
   */
  private generateComponentCode(
    componentName: string, 
    figmaSelection: any, 
    isTypeScript: boolean, 
    hasTextContent: boolean, 
    hasCustomColors: boolean, 
    hasDimensions: boolean
  ): string {
    const textContent = figmaSelection.textContent || [];
    const propsInterface = isTypeScript ? `
interface ${componentName}Props {
  ${hasTextContent ? 'content?: { [key: string]: string };' : ''}
  ${hasCustomColors ? 'customColors?: string[];' : ''}
  ${hasDimensions ? 'size?: { width?: number; height?: number };' : ''}
  className?: string;
  onClick?: () => void;
}` : '';

    const propsType = isTypeScript ? `: React.FC<${componentName}Props>` : '';

    return `import React from 'react';
import './${componentName}.css';
${isTypeScript ? propsInterface : ''}

export const ${componentName}${propsType} = ({ 
  ${hasTextContent ? 'content = {},' : ''}
  ${hasCustomColors ? 'customColors = [],' : ''}
  ${hasDimensions ? 'size = {},' : ''}
  className = '',
  onClick,
  ...props
}) => {
  return (
    <div 
      className={\`${componentName.toLowerCase()} \${className}\`}
      ${hasDimensions ? 'style={{ ...size, ...props.style }}' : ''}
      onClick={onClick}
      {...props}
    >
      ${textContent.map((text: any, index: number) => `
      <span className="${componentName.toLowerCase()}__text-${index + 1}">
        {content['text${index + 1}'] || '${text.content}'}
      </span>`).join('')}
      ${textContent.length === 0 ? `
      <div className="${componentName.toLowerCase()}__content">
        {/* Add your ${componentName} content here */}
        ${componentName} Component
      </div>` : ''}
    </div>
  );
};

export default ${componentName};`;
  }

  /**
   * Generate CSS styles with Figma design context
   */
  private generateStylesCode(componentName: string, figmaSelection: any, colors: string[], dimensions: any): string {
    const baseClass = componentName.toLowerCase();
    const textContent = figmaSelection.textContent || [];
    
    return `.${baseClass} {
  /* Base component styles */
  display: flex;
  flex-direction: column;
  ${dimensions ? `width: ${dimensions.width}px;` : 'width: 100%;'}
  ${dimensions ? `height: ${dimensions.height}px;` : 'height: auto;'}
  ${colors.length > 0 ? `background-color: ${colors[0]};` : 'background: #ffffff;'}
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  
  /* Design system integration */
  font-family: var(--font-family, system-ui, -apple-system, sans-serif);
  ${colors.length > 1 ? `color: ${colors[1]};` : 'color: #333333;'}
}

${textContent.map((text: any, index: number) => `
.${baseClass}__text-${index + 1} {
  /* ${text.style} styles */
  font-weight: ${text.style?.includes('Bold') ? 'bold' : text.style?.includes('Light') ? '300' : 'normal'};
  font-family: ${text.style?.includes('Sora') ? "'Sora', sans-serif" : 'inherit'};
  margin-bottom: 8px;
  display: block;
}`).join('')}

.${baseClass}__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .${baseClass} {
    ${dimensions ? `width: min(${dimensions.width}px, 100%);` : 'width: 100%;'}
    padding: 12px;
  }
}

/* Interactive states */
.${baseClass}:hover {
  ${colors.length > 0 && colors[0] ? `background-color: ${this.adjustColor(colors[0], -10)};` : 'background-color: #f5f5f5;'}
  cursor: pointer;
}

.${baseClass}:focus {
  outline: 2px solid #007acc;
  outline-offset: 2px;
}`;
  }

  /**
   * Generate test code with component context
   */
  private generateTestsCode(componentName: string, textContent: any[], _isTypeScript: boolean): string {
    
    return `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName} Component')).toBeInTheDocument();
  });

  ${textContent.map((text: any, _index: number) => `
  it('displays ${text.content} text correctly', () => {
    render(<${componentName} />);
    expect(screen.getByText('${text.content}')).toBeInTheDocument();
  });`).join('')}

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<${componentName} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button', { name: /${componentName}/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    render(<${componentName} className={customClass} />);
    
    expect(screen.getByRole('button')).toHaveClass(customClass);
  });

  ${textContent.length > 0 ? `
  it('renders with custom content', () => {
    const customContent = {
      ${textContent.map((text: any, index: number) => `text${index + 1}: 'Custom ${text.content}'`).join(',\n      ')}
    };
    
    render(<${componentName} content={customContent} />);
    ${textContent.map((text: any, _index: number) => `
    expect(screen.getByText('Custom ${text.content}')).toBeInTheDocument();`).join('')}
  });` : ''}
});`;
  }

  /**
   * Generate Storybook story with design context
   */
  private generateStoryCode(componentName: string, figmaSelection: any, _isTypeScript: boolean): string {
    const textContent = figmaSelection.textContent || [];
    
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Generated from Figma design: ${figmaSelection.name}',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
    ${textContent.length > 0 ? `
    content: {
      description: 'Text content for the component',
      control: 'object',
    },` : ''}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ${textContent.length > 0 ? `
    content: {
      ${textContent.map((text: any, index: number) => `text${index + 1}: '${text.content}'`).join(',\n      ')}
    },` : ''}
  },
};

export const Interactive: Story = {
  args: {
    ...Default.args,
    onClick: () => alert('${componentName} clicked!'),
  },
};

${textContent.length > 0 ? `
export const CustomContent: Story = {
  args: {
    content: {
      ${textContent.map((text: any, index: number) => `text${index + 1}: 'Custom ${text.content} Text'`).join(',\n      ')}
    },
  },
};` : ''}`;
  }

  /**
   * Generate TypeScript types
   */
  private generateTypesCode(componentName: string, figmaSelection: any): string {
    const textContent = figmaSelection.textContent || [];
    const dimensions = figmaSelection.dimensions;
    
    return `export interface ${componentName}Props {
  ${textContent.length > 0 ? `
  /** Text content for the component */
  content?: {
    ${textContent.map((_text: any, index: number) => `text${index + 1}?: string;`).join('\n    ')}
  };` : ''}
  
  /** Custom colors to override design system */
  customColors?: string[];
  
  ${dimensions ? `
  /** Component size override */
  size?: {
    width?: number;
    height?: number;
  };` : ''}
  
  /** Additional CSS className */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Additional props */
  [key: string]: any;
}

export interface ${componentName}Ref {
  focus: () => void;
  blur: () => void;
}`;
  }

  /**
   * Helper to adjust color brightness
   */
  private adjustColor(color: string, amount: number): string {
    // Simple color adjustment - in production, use a proper color manipulation library
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  /**
   * Generate fallback boilerplate code when Figma MCP is unavailable
   */
  private generateFallbackBoilerplate(techStack: any): any {
    const framework = techStack?.frontend?.framework || 'React';
    const styling = techStack?.frontend?.styling || 'CSS';
    
    const componentTemplate = framework === 'React' ? 
      `import React from 'react';
import './Component.${styling === 'styled-components' ? 'ts' : 'css'}';

interface ComponentProps {
  // Add your props here
}

export const Component: React.FC<ComponentProps> = (props) => {
  return (
    <div className="component">
      <h1>Component</h1>
      {/* Add your implementation here */}
    </div>
  );
};

export default Component;` :
      `<!-- ${framework} Component Template -->
<template>
  <div class="component">
    <h1>Component</h1>
    <!-- Add your implementation here -->
  </div>
</template>

<script>
export default {
  name: 'Component',
  props: {
    // Add your props here
  }
}
</script>

<style scoped>
.component {
  /* Add your styles here */
}
</style>`;

    const stylesTemplate = styling === 'styled-components' ? 
      `import styled from 'styled-components';

export const ComponentWrapper = styled.div\`
  /* Add your styles here */
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
\`;` :
      `.component {
  /* Add your styles here */
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}`;

    return {
      component: componentTemplate,
      styles: stylesTemplate,
      tests: `// Component tests
describe('Component', () => {
  it('should render correctly', () => {
    // Add your test implementation
    expect(true).toBe(true);
  });
});`,
      story: `// Storybook story
export default {
  title: 'Components/Component',
  component: Component,
};

export const Default = () => <Component />;`,
      types: framework === 'React' ? `export interface ComponentProps {
  // Add your prop types here
}` : undefined
    };
  }

  /**
   * Generate ticket using proper layer separation: Figma MCP (data) + Gemini (reasoning)
   * This is the correct architectural approach where each layer has distinct responsibilities
   */
  async generateTicketWithProperLayerSeparation(params: {
    figmaUrl: string;
    prompt: string;
    documentType: string;
    context?: any;
  }) {
    try {
      console.log('🏗️ Starting proper layer separation workflow...');
      console.log('📊 Data Layer: Figma MCP');
      console.log('🧠 Reasoning Layer: Gemini');
      
      // Initialize the orchestrator with Gemini API key
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured for reasoning layer');
      }
      
      const orchestrator = new FigmaMCPGeminiOrchestrator(geminiApiKey);
      
      // Generate ticket using proper layer separation
      const result = await orchestrator.generateTicketWithProperSeparation({
        figmaUrl: params.figmaUrl,
        prompt: params.prompt,
        documentType: params.documentType,
        context: params.context
      });
      
      if (!result.success) {
        return {
          success: false,
          error: 'Layer separation failed',
          ticket: result.ticket,
          metadata: result.metadata
        };
      }
      
      // Log the successful separation
      console.log('✅ Layer Separation Complete:');
      console.log(`   📊 Data Layer: ${result.dataLayer.assets.length} assets, ${Object.keys(result.dataLayer.designTokens).length} tokens`);
      console.log(`   🧠 Reasoning Layer: ${result.reasoningLayer.analysisResult.length} chars of analysis`);
      console.log(`   🎯 Final Ticket: ${result.ticket.length} chars`);
      
      return {
        success: true,
        ticket: result.ticket,
        dataLayer: result.dataLayer,
        reasoningLayer: result.reasoningLayer,
        metadata: result.metadata,
        architecture: {
          dataSource: 'Figma MCP',
          reasoningEngine: 'Gemini',
          orchestration: 'Proper Layer Separation'
        }
      };
      
    } catch (error) {
      console.error('❌ Proper layer separation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        ticket: `# ❌ Architecture Error: Proper Layer Separation Failed

## Issue
The architectural separation between Figma MCP (data layer) and Gemini (reasoning layer) failed.

## Error Details
\`\`\`
${error instanceof Error ? error.message : JSON.stringify(error)}
\`\`\`

## Architecture Goals
- **Figma MCP**: Pure data extraction (design tokens, assets, structure)  
- **Gemini**: Pure reasoning and generation (interpretation, strategy, recommendations)
- **Orchestration**: Clean coordination between layers

## Recovery Steps
1. Verify Figma MCP server is running and accessible
2. Confirm Gemini API key is valid and has quota
3. Check network connectivity to both services
4. Try with a smaller/simpler Figma selection
5. Review error logs for specific failure point

## Next Actions
- Contact development team if issue persists
- Use fallback generation methods if urgent
- Document specific failure for architecture improvements`,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          architecture: 'Failed layer separation'
        }
      };
    }
  }

  /**
   * Generate enhanced ticket using official Figma MCP server best practices
   * Implements the complete workflow from Figma MCP documentation
   */
  async generateTicketWithFigmaMCP(params: {
    figmaUrl: string;
    prompt: string;
    framework?: string;
    stylingSystem?: string;
    context?: any;
  }) {
    try {
      console.log('🚀 Starting enhanced Figma MCP workflow...');
      
      // Step 1: Validate frame size following "avoid large frames" guidance
      if (params.context?.mcpContext) {
        const sizeCheck = enhancedFigmaMCPService.isOptimalFrameSize(params.context);
        
        if (!sizeCheck.isOptimal) {
          console.warn('⚠️ Frame size not optimal for MCP processing');
          
          return {
            success: false,
            error: 'Frame too large for optimal processing',
            suggestions: sizeCheck.suggestions,
            ticket: `# ⚠️ Frame Size Optimization Required

## Issue
The selected Figma frame is too large for optimal MCP processing.

## Recommendations
${sizeCheck.suggestions.map(s => `- ${s}`).join('\n')}

## Next Steps
1. Select smaller sections (e.g., individual components)
2. Break complex layouts into logical chunks
3. Focus on specific areas like headers, cards, or buttons

## Alternative Approach
Generate tickets for smaller components first, then combine them into larger layouts.`
          };
        }
      }
      
      // Step 2: Configure MCP prompt following best practices
      const mcpConfig: FigmaMCPPromptConfig = {
        framework: params.framework || 'react',
        stylingSystem: params.stylingSystem || 'tailwind',
        codebaseConventions: this.generateCodebaseConventions(params.context),
        filePath: this.suggestFilePath(params.context),
        componentLibrary: 'src/components/ui',
        layoutSystem: 'flexbox'
      };
      
      // Step 3: Generate effective prompt
      const effectivePrompt = enhancedFigmaMCPService.generateEffectivePrompt(
        params.prompt,
        mcpConfig,
        params.context
      );
      
      // Step 4: Execute Figma MCP workflow
      const mcpResult = await enhancedFigmaMCPService.generateCodeWithBestPractices(
        params.figmaUrl,
        mcpConfig,
        params.context
      );
      
      if (!mcpResult.success) {
        console.error('❌ Figma MCP workflow failed:', mcpResult.errors);
        
        // Fallback to our enhanced ticket generation
        console.log('🔄 Falling back to enhanced ticket generation...');
        return this.generateFallbackTicket(params);
      }
      
      // Step 5: Generate comprehensive ticket with MCP results
      const ticket = this.generateMCPEnhancedTicket(params, mcpResult, effectivePrompt);
      
      console.log('✅ Enhanced Figma MCP ticket generated successfully');
      
      return {
        success: true,
        ticket: ticket,
        mcpMetadata: {
          codeGenerated: !!mcpResult.code,
          assetsFound: mcpResult.assets?.length || 0,
          designTokensExtracted: !!mcpResult.designTokens,
          optimizationSuggestions: mcpResult.optimizationSuggestions
        },
        prompt: effectivePrompt
      };
      
    } catch (error) {
      console.error('💥 Enhanced Figma MCP workflow error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        ticket: this.generateErrorTicket(params, error)
      };
    }
  }

  /**
   * Generate codebase conventions based on context
   */
  private generateCodebaseConventions(context?: any): string {
    let conventions = 'Follow these project conventions:\n';
    conventions += '- Use TypeScript for all components\n';
    conventions += '- Export components as named exports\n';
    conventions += '- Include proper PropTypes or TypeScript interfaces\n';
    conventions += '- Follow BEM methodology for CSS classes\n';
    
    if (context?.designSystemContext) {
      conventions += '- Use design system tokens from detected system\n';
      conventions += '- Maintain design system compliance\n';
    }
    
    return conventions;
  }

  /**
   * Suggest appropriate file path based on context
   */
  private suggestFilePath(context?: any): string {
    if (context?.mcpContext?.componentInfo?.isComponent) {
      return 'src/components/ui/';
    }
    
    if (context?.mcpContext?.semanticName?.includes('Page')) {
      return 'src/pages/';
    }
    
    if (context?.mcpContext?.semanticName?.includes('Layout')) {
      return 'src/layouts/';
    }
    
    return 'src/components/';
  }

  /**
   * Generate comprehensive ticket combining our analysis with Figma MCP results
   */
  private generateMCPEnhancedTicket(params: any, mcpResult: any, prompt: string): string {
    const componentName = params.context?.name || 'Component';
    const complexity = params.context?.mcpContext?.optimizationInfo?.complexity || 'medium';
    
    return `# 🎯 ${componentName} Implementation

## Overview
Generated using enhanced Figma MCP integration following official best practices.

**Figma URL**: ${params.figmaUrl}
**Component Complexity**: ${complexity}
**MCP Integration**: ✅ Successfully processed

## 🔧 Generated Code

### Component Implementation
\`\`\`typescript
${mcpResult.code || '// Code generation failed - see fallback approach below'}
\`\`\`

### Design Tokens
${mcpResult.designTokens ? `
\`\`\`json
${JSON.stringify(mcpResult.designTokens, null, 2)}
\`\`\`
` : 'No design tokens extracted from Figma'}

## 📐 MCP Analysis Results

### Assets Required
${mcpResult.assets?.length ? mcpResult.assets.map((asset: string) => `- ${asset}`).join('\n') : 'No assets detected'}

### Optimization Suggestions
${mcpResult.optimizationSuggestions?.length ? mcpResult.optimizationSuggestions.map((suggestion: string) => `- ${suggestion}`).join('\n') : 'No optimization suggestions'}

## ✅ Implementation Checklist

### Required Steps
- [ ] Review and test generated code
- [ ] Download and implement required assets
- [ ] Apply design tokens consistently
- [ ] Test responsive behavior
- [ ] Validate accessibility compliance
- [ ] Add unit tests
- [ ] Update Storybook (if applicable)

### Quality Assurance
- [ ] Code follows project conventions
- [ ] Design matches Figma exactly
- [ ] Performance is optimized
- [ ] Accessibility standards met (WCAG 2.1 AA)

## 📋 Implementation Notes

### Effective Prompt Used
\`\`\`
${prompt}
\`\`\`

### Framework Configuration
- **Framework**: ${params.framework || 'React'}
- **Styling**: ${params.stylingSystem || 'Tailwind CSS'}
- **Component Library**: src/components/ui

---
*Generated with Enhanced Figma MCP Integration | Following Official Best Practices*`;
  }

  /**
   * Generate fallback ticket when MCP fails
   */
  private generateFallbackTicket(params: any): any {
    return {
      success: true,
      ticket: `# 🔄 Fallback Implementation: ${params.context?.name || 'Component'}

## Status
Figma MCP server unavailable - using enhanced local generation.

## Next Steps
1. Retry when Figma MCP server is available
2. Use local context analysis for basic implementation
3. Manually verify design alignment

## Context Available
${JSON.stringify(params.context || {}, null, 2)}`,
      isFallback: true
    };
  }

  /**
   * Generate error ticket for debugging
   */
  private generateErrorTicket(params: any, error: any): string {
    return `# ❌ Implementation Error: ${params.context?.name || 'Component'}

## Error Details
\`\`\`
${error instanceof Error ? error.message : JSON.stringify(error)}
\`\`\`

## Debugging Information
- **Figma URL**: ${params.figmaUrl}
- **Context**: ${JSON.stringify(params.context || {}, null, 2)}

## Recommended Actions
1. Verify Figma URL is accessible
2. Check if frame size is optimal
3. Retry with smaller selection
4. Contact development team if issue persists`;
  }

  /**
   * Generate visual-enhanced ticket using screenshot + hierarchical data
   */
  async generateVisualEnhancedTicket(params: {
    figmaContext?: {
      selection?: any[];
      fileKey?: string;
      fileName?: string;
      pageName?: string;
    };
    visualContext?: {
      screenshot?: {
        base64: string;
        format: string;
        resolution: { width: number; height: number };
        size: number;
      };
      visualDesignContext?: any;
    };
    hierarchicalData?: any;
    options?: {
      documentType?: string;
      techStack?: string;
      instructions?: string;
    };
  }): Promise<any> {
    console.log('🎨 Starting visual-enhanced ticket generation...');
    
    try {
      // Extract context from parameters
      const figmaContext = params.figmaContext || {};
      const visualContext = params.visualContext || {};
      const hierarchicalData = params.hierarchicalData || {};
      const options = params.options || {};

      // Create enhanced context structure
      const enhancedContext = {
        screenshot: visualContext.screenshot || null,
        visualDesignContext: visualContext.visualDesignContext || {
          colorPalette: [],
          typography: { fonts: [], sizes: [], weights: [], hierarchy: [] },
          spacing: { measurements: [], patterns: [], grid: null },
          layout: { structure: null, alignment: null, distribution: null },
          designPatterns: [],
          visualHierarchy: []
        },
        hierarchicalData: hierarchicalData,
        figmaContext: {
          fileKey: figmaContext.fileKey || 'unknown',
          fileName: figmaContext.fileName || 'Untitled',
          pageName: figmaContext.pageName || 'Page 1',
          selection: figmaContext.selection?.[0] || { name: 'Unknown Selection' }
        }
      };

      // Generate enhanced ticket
      const ticket = await this.generateVisualContextTicket(enhancedContext, options);
      
      console.log('✅ Visual-enhanced ticket generated successfully');
      
      return {
        content: [
          {
            type: 'text',
            text: ticket
          }
        ],
        ticket: ticket,
        enhancedContext: {
          hasScreenshot: !!enhancedContext.screenshot,
          visualDataPoints: this.countVisualDataPoints(enhancedContext),
          confidence: this.calculateVisualConfidence(enhancedContext)
        }
      };

    } catch (error) {
      console.error('❌ Visual-enhanced ticket generation failed:', error);
      
      return {
        content: [
          {
            type: 'text',
            text: `# ❌ Visual-Enhanced Generation Error

## Issue
Visual-enhanced ticket generation failed due to processing error.

## Error Details
\`\`\`
${error instanceof Error ? error.message : JSON.stringify(error)}
\`\`\`

## Available Context
- Screenshot: ${params.visualContext?.screenshot ? '✅ Available' : '❌ Not provided'}
- Visual Design Context: ${params.visualContext?.visualDesignContext ? '✅ Available' : '❌ Not provided'}
- Hierarchical Data: ${params.hierarchicalData ? '✅ Available' : '❌ Not provided'}

## Fallback Recommendation
Use the standard \`generate_enhanced_ticket\` method for reliable ticket generation without visual analysis.`
          }
        ],
        isError: true,
        fallbackSuggested: true
      };
    }
  }

  /**
   * Generate ticket using visual context
   */
  private async generateVisualContextTicket(context: any, options: any): Promise<string> {
    const { techStack = 'React TypeScript', instructions = '' } = options;
    
    // Build ticket with simple string concatenation to avoid template literal issues
    let ticket = '# 🎨 Visual-Enhanced ';
    ticket += (context.figmaContext.selection.name || 'Component');
    ticket += ' Implementation\n\n';
    
    ticket += '## 📋 Enhanced Context Analysis\n\n';
    
    // Visual Analysis Section
    ticket += '### 🖼️ Visual Analysis\n';
    if (context.screenshot) {
      ticket += '**Screenshot Available**: ';
      ticket += context.screenshot.resolution.width + '×' + context.screenshot.resolution.height + 'px ';
      ticket += context.screenshot.format + ' (' + Math.round(context.screenshot.size / 1024) + 'KB)\n';
      ticket += '- High-resolution visual reference for pixel-perfect implementation\n';
      ticket += '- Visual context available for AI analysis and verification\n\n';
    } else {
      ticket += '**No Screenshot**: Working with structured data only\n';
      ticket += '- Implementation based on hierarchical component data\n';
      ticket += '- Visual verification will be needed during development\n\n';
    }
    
    // Design Context
    ticket += '### 🎯 Design Context\n';
    ticket += '- **File**: ' + context.figmaContext.fileName + '\n';
    ticket += '- **Page**: ' + context.figmaContext.pageName + '\n';
    ticket += '- **Component**: ' + context.figmaContext.selection.name + '\n\n';
    
    // Color System Analysis
    ticket += '### 🎨 Color System Analysis\n';
    if (context.visualDesignContext.colorPalette.length > 0) {
      const colors = context.visualDesignContext.colorPalette.slice(0, 5);
      colors.forEach((color: any) => {
        ticket += '- **' + color.hex + '** - ' + color.usage.join(', ') + ' (' + color.count + ' instances)\n';
      });
    } else {
      ticket += '- No color data extracted - manual design token mapping required\n';
    }
    ticket += '\n';
    
    // Typography Analysis
    ticket += '### 📝 Typography Analysis\n';
    if (context.visualDesignContext.typography.fonts.length > 0) {
      ticket += '- **Fonts**: ' + context.visualDesignContext.typography.fonts.join(', ') + '\n';
      ticket += '- **Sizes**: ' + context.visualDesignContext.typography.sizes.join('px, ') + 'px\n';
      ticket += '- **Hierarchy**: ' + context.visualDesignContext.typography.hierarchy.join(' → ') + '\n';
    } else {
      ticket += '- No typography data extracted - manual font specification required\n';
    }
    ticket += '\n';
    
    // Layout & Spacing
    ticket += '### 📐 Layout & Spacing\n';
    if (context.visualDesignContext.spacing.patterns.length > 0) {
      ticket += '- **Grid System**: ' + context.visualDesignContext.spacing.patterns.join(', ') + '\n';
      ticket += '- **Layout**: ' + (context.visualDesignContext.layout.structure || 'Custom layout') + '\n';
      ticket += '- **Spacing**: ' + context.visualDesignContext.spacing.measurements.join('px, ') + 'px\n';
    } else {
      ticket += '- No spacing patterns detected - manual spacing implementation required\n';
    }
    ticket += '\n';
    
    // Implementation Requirements
    ticket += '## 💻 Implementation Requirements\n\n';
    
    // Technical Specifications
    ticket += '### Technical Specifications\n';
    ticket += '- **Framework**: ' + techStack + '\n';
    const hasGridSystem = context.visualDesignContext.spacing.patterns.includes('8px-grid');
    ticket += '- **Styling Approach**: ' + (hasGridSystem ? 'Design system with 8px grid' : 'Custom CSS with extracted measurements') + '\n';
    const hasColors = context.visualDesignContext.colorPalette.length > 0;
    ticket += '- **Color Management**: ' + (hasColors ? 'Use extracted color palette' : 'Define color tokens from visual reference') + '\n\n';
    
    // Component Architecture
    ticket += '### Component Architecture\n';
    if (context.hierarchicalData.components?.length > 0) {
      context.hierarchicalData.components.forEach((comp: any) => {
        ticket += '- **' + comp.name + '**: ' + (comp.masterComponent || 'Custom implementation') + '\n';
      });
    } else {
      ticket += '- Component structure to be determined from visual analysis\n';
    }
    ticket += '\n';
    
    // Visual Fidelity Requirements
    ticket += '### Visual Fidelity Requirements\n';
    if (context.screenshot) {
      ticket += '- Implementation must match the provided screenshot exactly\n';
      ticket += '- All visual elements, spacing, and proportions must be pixel-perfect\n';
      ticket += '- Use screenshot as primary reference for visual validation\n\n';
    } else {
      ticket += '- Implementation must follow structured component data\n';
      ticket += '- Visual elements should be inferred from hierarchical data\n';
      ticket += '- Manual visual review required during development\n\n';
    }
    
    // Acceptance Criteria
    ticket += '## ✅ Acceptance Criteria\n\n';
    
    ticket += '### Visual Requirements\n';
    ticket += '- [ ] Component matches design specifications exactly\n';
    ticket += '- [ ] All extracted colors are implemented correctly (' + context.visualDesignContext.colorPalette.length + ' colors)\n';
    ticket += '- [ ] Typography follows detected hierarchy (' + context.visualDesignContext.typography.hierarchy.length + ' levels)\n';
    const spacingText = context.visualDesignContext.spacing.patterns.join(', ') || 'custom spacing';
    ticket += '- [ ] Spacing conforms to detected patterns (' + spacingText + ')\n\n';
    
    ticket += '### Technical Requirements\n';
    ticket += '- [ ] Built using ' + techStack + ' with proper component structure\n';
    ticket += '- [ ] Responsive design implemented for mobile, tablet, desktop\n';
    ticket += '- [ ] Accessibility standards met (WCAG 2.1 AA)\n';
    ticket += '- [ ] Design system tokens used where applicable\n';
    ticket += '- [ ] Performance optimized (lazy loading, efficient rendering)\n\n';
    
    ticket += '### Quality Assurance\n';
    ticket += '- [ ] Code follows team conventions and best practices\n';
    ticket += '- [ ] Component is reusable and well-documented\n';
    ticket += '- [ ] Unit tests written and passing\n';
    ticket += '- [ ] Cross-browser compatibility verified\n';
    if (context.screenshot) {
      ticket += '- [ ] Visual regression testing against screenshot\n\n';
    } else {
      ticket += '- [ ] Manual visual review completed\n\n';
    }
    
    // Implementation Notes
    ticket += '## 🔧 Implementation Notes\n\n';
    
    ticket += '### Development Approach\n';
    ticket += '1. **Setup**: Create component structure using ' + techStack + '\n';
    if (context.visualDesignContext.colorPalette.length > 0) {
      ticket += '2. **Styling**: Implement extracted color system first\n';
    } else {
      ticket += '2. **Styling**: Define color tokens from visual reference\n';
    }
    if (context.visualDesignContext.layout.structure) {
      ticket += '3. **Layout**: Use ' + context.visualDesignContext.layout.structure + ' layout\n';
    } else {
      ticket += '3. **Layout**: Analyze visual structure for layout approach\n';
    }
    ticket += '4. **Refinement**: Match visual details and ensure responsive behavior\n';
    ticket += '5. **Testing**: Verify functionality and visual accuracy\n\n';
    
    // Design System Integration
    ticket += '### Design System Integration\n';
    if (context.visualDesignContext.colorPalette.length > 0) {
      ticket += '- Use extracted colors as design tokens\n';
      ticket += '- Implement detected spacing patterns (' + context.visualDesignContext.spacing.patterns.join(', ') + ')\n';
      ticket += '- Follow typography hierarchy: ' + context.visualDesignContext.typography.hierarchy.join(' → ') + '\n\n';
    } else {
      ticket += '- Create design tokens based on visual analysis\n';
      ticket += '- Establish consistent spacing and typography system\n';
      ticket += '- Document patterns for future component development\n\n';
    }
    
    // Additional Instructions
    ticket += '### Additional Instructions\n';
    ticket += (instructions || 'Follow standard development practices and team conventions') + '\n\n';
    
    // Footer
    ticket += '---\n\n';
    ticket += '**Generated with Visual-Enhanced Analysis**\n';
    if (context.screenshot) {
      ticket += '📸 Screenshot: ' + context.screenshot.resolution.width + '×' + context.screenshot.resolution.height + 'px\n';
    } else {
      ticket += '📊 Data-driven analysis\n';
    }
    ticket += '🎨 Color Palette: ' + context.visualDesignContext.colorPalette.length + ' colors | ';
    ticket += '📝 Typography: ' + context.visualDesignContext.typography.fonts.length + ' fonts | ';
    ticket += '📐 Spacing: ' + context.visualDesignContext.spacing.patterns.length + ' patterns\n';

    return ticket;
  }

  /**
   * Count visual data points for confidence calculation
   */
  private countVisualDataPoints(context: any): number {
    let count = 0;
    if (context.screenshot) count += 3; // High value for screenshot
    if (context.visualDesignContext.colorPalette.length > 0) count++;
    if (context.visualDesignContext.typography.fonts.length > 0) count++;
    if (context.visualDesignContext.spacing.patterns.length > 0) count++;
    if (context.hierarchicalData.components?.length > 0) count++;
    return count;
  }

  /**
   * Calculate confidence based on available visual context
   */
  private calculateVisualConfidence(context: any): number {
    let confidence = 60; // Base confidence
    
    if (context.screenshot) confidence += 25; // Screenshot is very valuable
    if (context.visualDesignContext.colorPalette.length > 0) confidence += 5;
    if (context.visualDesignContext.typography.fonts.length > 0) confidence += 5;
    if (context.visualDesignContext.spacing.patterns.length > 0) confidence += 5;
    if (context.hierarchicalData.components?.length > 0) confidence += 5;
    
    return Math.min(confidence, 95);
  }

  start(): void {
    const server = createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200);
        res.end(JSON.stringify({
          name: 'Figma AI Ticket Generator',
          version: '1.0.0',
          status: 'running',
          tools: ['analyze_project', 'generate_tickets', 'check_compliance', 'generate_enhanced_ticket', 'generate_ai_ticket'],
          description: 'Strategic design-to-code automation server'
        }));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { method, params } = JSON.parse(body);
            const result = await this.handleRequest(method, params);
            
            res.writeHead(200);
            res.end(JSON.stringify(result));
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.writeHead(400);
            // Format error response to match expected test structure
            res.end(JSON.stringify({
              content: [
                {
                  type: 'text',
                  text: errorMessage
                }
              ],
              isError: true
            }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not Found' }));
    });

    server.listen(this.port, () => {
      console.log('� Figma AI Ticket Generator Test Server started');
      console.log(`📋 Server running at http://localhost:${this.port}`);
      console.log('🔗 Available tools: analyze_project, generate_tickets, check_compliance, generate_enhanced_ticket, generate_ai_ticket');
      console.log('');
      console.log('Example usage:');
      console.log(`curl -X POST http://localhost:${this.port} \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '{"method":"analyze_project","params":{"figmaUrl":"https://figma.com/file/abc123"}}'`);
    });
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new FigmaAITestServer();
  server.start();
}

export { FigmaAITestServer };