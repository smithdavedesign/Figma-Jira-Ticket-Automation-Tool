#!/usr/bin/env node

/**
 * Figma AI Ticket Generator - Enhanced MCP Server with Figma Integration
 * 
 * Strategic design-to-code automation server with direct Figma MCP integration.
 * This server provides project-level intelligence and workflow automation capabilities
 * that complement and orchestrate with Figma's tactical MCP server.
 */

import { createServer } from 'http';
import { FigmaWorkflowOrchestrator } from './figma/figma-mcp-client.js';
import { BoilerplateCodeGenerator } from './figma/boilerplate-generator.js';
import type { TechStackConfig, CodeGenerationOptions } from './figma/boilerplate-generator.js';

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
  private port: number;

  constructor(port: number = 3000) {
    this.projectAnalyzer = new ProjectAnalyzer();
    this.ticketGenerator = new TicketGenerator();
    this.complianceChecker = new ComplianceChecker();
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

        default:
          throw new Error(`Unknown method: ${method}`);
      }
    } catch (error) {
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
    figmaUrl: string;
    projectContext?: string;
    techStack: TechStackConfig;
    options: CodeGenerationOptions;
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
  }> {
    try {
      console.log('🚀 Starting enhanced ticket generation with boilerplate code...');

      // Initialize Figma MCP orchestrator
      const orchestrator = new FigmaWorkflowOrchestrator();

      // Execute complete workflow (strategic analysis + tactical code generation)
      const workflowResult = await orchestrator.executeCompleteWorkflow({
        figmaUrl: params.figmaUrl,
        projectContext: params.projectContext,
        requirements: {
          includeBoilerplate: true,
          techStack: params.techStack,
          ...params.options
        }
      });

      // Generate boilerplate code using tech stack configuration
      const boilerplateGenerator = new BoilerplateCodeGenerator(
        params.techStack,
        params.options
      );

      const boilerplateCode = await boilerplateGenerator.generateBoilerplateCode(
        params.figmaUrl,
        orchestrator // Pass the orchestrator which has access to Figma MCP
      );

      // Generate enhanced ticket description with embedded code
      const ticket = this.createEnhancedTicketDescription(
        workflowResult,
        params.techStack,
        boilerplateCode
      );

      console.log('✅ Enhanced ticket with boilerplate generated successfully!');

      return {
        content: [
          {
            type: 'text',
            text: 'Enhanced ticket with boilerplate code generated successfully'
          }
        ],
        ticket,
        boilerplateCode
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Enhanced ticket generation failed:', errorMessage);
      
      return {
        content: [
          {
            type: 'text',
            text: `Error generating enhanced ticket: ${errorMessage}`
          }
        ],
        ticket: `Error: ${errorMessage}`,
        boilerplateCode: {
          component: `// Error generating code: ${errorMessage}`,
          styles: `/* Error generating styles: ${errorMessage} */`
        }
      };
    }
  }

  /**
   * Create enhanced ticket description with embedded boilerplate code
   */
  private createEnhancedTicketDescription(
    workflowResult: any,
    techStack: TechStackConfig,
    boilerplateCode: any
  ): string {
    const framework = techStack.frontend.framework;
    const styling = techStack.frontend.styling;
    
    return `# 🎨 Component Implementation Ticket

## Overview
Implement the design component from Figma with ${framework} and ${styling}.

## Strategic Analysis
- **Project Scope**: ${workflowResult.strategicAnalysis.projectScope}
- **Complexity**: ${workflowResult.strategicAnalysis.complexity}
- **Estimated Effort**: ${workflowResult.strategicAnalysis.estimatedEffort}
- **Design System Compliance**: ${workflowResult.strategicAnalysis.designSystemCompliance}%

## Tech Stack
- **Frontend**: ${framework.charAt(0).toUpperCase() + framework.slice(1)}
- **Styling**: ${styling.charAt(0).toUpperCase() + styling.slice(1)}
- **State Management**: ${techStack.frontend.stateManagement || 'None'}
- **Testing**: ${techStack.frontend.testing || 'None'}

## Boilerplate Code

### Component Implementation
\`\`\`${framework === 'react' ? 'jsx' : framework}
${boilerplateCode.component}
\`\`\`

### Styles
\`\`\`${styling === 'scss' ? 'scss' : 'css'}
${boilerplateCode.styles}
\`\`\`

${boilerplateCode.tests ? `
### Tests
\`\`\`javascript
${boilerplateCode.tests}
\`\`\`
` : ''}

${boilerplateCode.story ? `
### Storybook Story
\`\`\`javascript
${boilerplateCode.story}
\`\`\`
` : ''}

## Acceptance Criteria
- [ ] Component matches Figma design exactly
- [ ] Component is responsive and accessible
- [ ] Code follows project conventions
- [ ] Tests pass and provide adequate coverage
- [ ] Component is documented${boilerplateCode.story ? ' and has Storybook stories' : ''}

## Technical Notes
${workflowResult.tacticalCode?.content?.[0]?.text || 'Generated from Figma MCP server integration'}

---
*Generated by Enhanced Figma-Jira Automation Tool with ${framework}/${styling} tech stack*`;
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
          tools: ['analyze_project', 'generate_tickets', 'check_compliance', 'generate_enhanced_ticket'],
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
            res.end(JSON.stringify({ error: errorMessage }));
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
      console.log('🔗 Available tools: analyze_project, generate_tickets, check_compliance, generate_enhanced_ticket');
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