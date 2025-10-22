/**
 * Template Integration Layer
 * 
 * Integrates the parameterized template system with the existing ticket generation workflow.
 * This bridges the gap between the TicketGenerator and the AdvancedTemplateEngine.
 */

import { templateEngine } from './templates/template-config.js';
import type {
  TemplateContext,
  DocumentPlatform,
  DocumentType
} from './templates/template-types.js';

export interface TicketGenerationOptions {
  platform?: DocumentPlatform;
  documentType?: DocumentType;
  organizationId?: string;
  projectName?: string;
  teamStandards?: {
    testing_framework?: string;
    accessibility_level?: string;
    code_style?: string;
  };
  useTemplates?: boolean;
}

export interface FigmaFrameData {
  id: string;
  name: string;
  components?: any[];
  hasPrototype?: boolean;
  nodeCount?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  dependencies?: string[];
}

export interface ProjectContext {
  name: string;
  tech_stack: string[];
  design_system?: string;
  repository_url?: string;
}

export class TemplateIntegrationService {
  /**
   * Generate a parameterized ticket using the template system
   */
  async generateParameterizedTicket(
    frameData: FigmaFrameData,
    figmaContext: any,
    options: TicketGenerationOptions = {}
  ): Promise<string> {
    const {
      platform = 'jira',
      documentType = 'component',
      organizationId = 'default',
      projectName = 'Design Implementation',
      teamStandards = {},
      useTemplates = true
    } = options;

    if (!useTemplates) {
      // Fallback to legacy generation
      return this.generateLegacyTicket(frameData, figmaContext, options);
    }

    try {
      // Smart template selection based on tech stack
      const templateType = this.selectTemplateType(documentType, (teamStandards as any).tech_stack);
      console.log(`🔍 Using platform: ${platform} with template type: ${templateType}`);
      
      // Load the appropriate template
      const template = await templateEngine.loadTemplate(platform, templateType);
      
      // Build template context from available data
      const context = this.buildTemplateContext(
        frameData,
        figmaContext,
        projectName,
        teamStandards,
        organizationId
      );
      
      // Render the ticket using the template
      const renderedTicket = await templateEngine.renderTemplate(template, context);
      
      return renderedTicket;
    } catch (error) {
      console.warn('Template generation failed, falling back to legacy:', error);
      return this.generateLegacyTicket(frameData, figmaContext, options);
    }
  }

  /**
   * Build template context from available frame and project data
   */
  private buildTemplateContext(
    frameData: FigmaFrameData,
    figmaContext: any,
    projectName: string,
    teamStandards: any,
    organizationId: string
  ): TemplateContext {
    // Extract Figma context
    const figmaUrl = figmaContext.figmaUrl || figmaContext.frameUrls?.[0] || '';
    const fileId = this.extractFileId(figmaUrl);
    
    return {
      figma: {
        component_name: frameData.name || 'Unnamed Component',
        file_id: fileId,
        file_name: figmaContext.fileName || 'Design File',
        frame_id: frameData.id,
        dimensions: frameData.dimensions || { width: 0, height: 0 },
        dependencies: frameData.dependencies || []
      },
      project: {
        name: projectName,
        tech_stack: this.inferTechStack(figmaContext),
        repository: figmaContext.repositoryUrl || '',
        branch: 'main',
        environment: 'development' as const
      },
      calculated: {
        complexity: this.calculateComplexity(frameData),
        hours: this.estimateHours(frameData),
        confidence: this.calculateConfidence(frameData),
        similar_components: this.findSimilarComponents(frameData.name || ''),
        risk_factors: this.identifyRiskFactors(frameData),
        dependencies: frameData.dependencies || []
      },
      org: {
        name: this.getOrganizationName(organizationId),
        testing_stack: (teamStandards.testing_framework || 'jest-rtl') as any,
        accessibility_standard: (teamStandards.accessibility_level || 'wcag-aa') as any,
        docs_format: 'markdown' as const,
        project_management_tool: 'jira' as const,
        code_style_guide: (teamStandards.code_style || 'prettier') as any
      },
      team: {
        name: 'Development Team',
        workflow: 'Agile/Scrum',
        tools: ['Figma', 'VS Code', 'Git']
      },
      user: {
        name: 'Developer',
        role: 'Frontend Developer',
        preferences: {}
      }
    };
  }

  /**
   * Calculate component complexity based on frame data
   */
  private calculateComplexity(frameData: FigmaFrameData): 'simple' | 'medium' | 'complex' {
    const componentCount = frameData.components?.length || 0;
    const nodeCount = frameData.nodeCount || 0;
    const hasInteractions = frameData.hasPrototype || false;
    
    let complexityScore = 1; // Base score
    
    // Factor in component count
    if (componentCount > 8) complexityScore += 3;
    else if (componentCount > 4) complexityScore += 2;
    else if (componentCount > 2) complexityScore += 1;
    
    // Factor in node count
    if (nodeCount > 50) complexityScore += 2;
    else if (nodeCount > 20) complexityScore += 1;
    
    // Factor in interactions
    if (hasInteractions) complexityScore += 2;
    
    // Determine complexity level
    if (complexityScore <= 3) return 'simple';
    if (complexityScore <= 6) return 'medium';
    return 'complex';
  }

  /**
   * Estimate implementation hours
   */
  private estimateHours(frameData: FigmaFrameData): number {
    const baseHours = 2;
    const componentCount = frameData.components?.length || 3;
    const nodeCount = frameData.nodeCount || 10;
    const hasInteractions = frameData.hasPrototype || false;
    
    let totalHours = baseHours;
    totalHours += componentCount * 0.3; // 0.3 hours per component
    totalHours += (nodeCount / 20) * 0.5; // 0.5 hours per 20 nodes
    
    if (hasInteractions) {
      totalHours += 2; // Additional time for interactions
    }
    
    // Add buffer for testing and documentation
    totalHours *= 1.3;
    
    return Math.round(totalHours * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate confidence level for estimates
   */
  private calculateConfidence(frameData: FigmaFrameData): number {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence for more detailed frames
    const nodeCount = frameData.nodeCount || 0;
    if (nodeCount > 30) confidence += 0.1;
    if (nodeCount > 50) confidence += 0.1;
    
    // Higher confidence if we have component information
    if (frameData.components && frameData.components.length > 0) {
      confidence += 0.1;
    }
    
    // Lower confidence for complex interactions
    if (frameData.hasPrototype) {
      confidence -= 0.05;
    }
    
    return Math.min(0.95, Math.max(0.5, confidence));
  }

  /**
   * Find similar components based on naming patterns
   */
  private findSimilarComponents(componentName: string): string[] {
    const name = componentName.toLowerCase();
    
    if (name.includes('button')) {
      return ['PrimaryButton', 'IconButton', 'LinkButton'];
    } else if (name.includes('input') || name.includes('field')) {
      return ['TextField', 'SelectField', 'TextArea'];
    } else if (name.includes('card')) {
      return ['ProductCard', 'UserCard', 'InfoCard'];
    } else if (name.includes('modal') || name.includes('dialog')) {
      return ['ConfirmDialog', 'FormModal', 'AlertDialog'];
    } else if (name.includes('navigation') || name.includes('nav')) {
      return ['TopNavigation', 'SideNavigation', 'BreadcrumbNav'];
    }
    
    return ['BaseComponent', 'StandardComponent'];
  }

  /**
   * Identify potential risk factors
   */
  private identifyRiskFactors(frameData: FigmaFrameData): string[] {
    const risks: string[] = [];
    const name = frameData.name?.toLowerCase() || '';
    
    if (name.includes('form')) {
      risks.push('form validation complexity');
    }
    
    if (frameData.hasPrototype) {
      risks.push('animation implementation');
    }
    
    if ((frameData.components?.length || 0) > 8) {
      risks.push('high component complexity');
    }
    
    if ((frameData.nodeCount || 0) > 50) {
      risks.push('large node tree complexity');
    }
    
    if (name.includes('table') || name.includes('grid')) {
      risks.push('data handling complexity');
    }
    
    if (name.includes('chart') || name.includes('graph')) {
      risks.push('visualization complexity');
    }
    
    return risks;
  }

  /**
   * Infer technology stack from context
   */
  private inferTechStack(figmaContext: any): string[] {
    // Default tech stack - could be enhanced to detect from project context
    const defaultStack = ['React', 'TypeScript', 'CSS-in-JS'];
    
    // Could add logic to detect tech stack from:
    // - Repository information
    // - Project configuration
    // - Team preferences
    
    return figmaContext.techStack || defaultStack;
  }

  /**
   * Get organization name from ID
   */
  private getOrganizationName(orgId: string): string {
    const orgMap: Record<string, string> = {
      'default': 'Default Organization',
      'acme': 'Acme Corporation',
      'startup': 'Startup Inc.',
      'enterprise': 'Enterprise Solutions',
    };
    
    return orgMap[orgId] || 'Unknown Organization';
  }

  /**
   * Extract Figma file ID from URL
   */
  private extractFileId(url: string): string {
    const match = url.match(/file\/([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }

  /**
   * Legacy ticket generation for fallback
   */
  private generateLegacyTicket(
    frameData: FigmaFrameData,
    figmaContext: any,
    options: TicketGenerationOptions
  ): string {
    const name = frameData.name || 'Unnamed Component';
    const platform = options.platform || 'jira';
    const complexity = this.calculateComplexity(frameData);
    const hours = this.estimateHours(frameData);
    
    return `# ${this.getPlatformIcon(platform)} Component: ${name}

## 📋 Summary
**Priority**: ${complexity === 'complex' ? 'High' : 'Medium'} | **Estimated Hours**: ${hours}

## 🎯 Objective
Implement the **${name}** component from the design specifications.

## 📐 Design Specifications
- **Component Name**: ${name}
- **Complexity**: ${complexity}
- **Dependencies**: ${frameData.dependencies?.join(', ') || 'None specified'}

## ✅ Acceptance Criteria
- [ ] **Visual Accuracy**: Component matches design specifications exactly
- [ ] **Responsive Design**: Works across all supported breakpoints
- [ ] **Accessibility**: Meets WCAG 2.1 AA standards
- [ ] **Testing**: Unit tests with appropriate coverage

## 🔗 Resources
- **Figma Design**: ${figmaContext.figmaUrl || 'Not provided'}

---
*Generated using legacy fallback mode*`;
  }

  /**
   * Get platform-specific icon
   */
  private getPlatformIcon(platform: DocumentPlatform): string {
    const icons: Record<DocumentPlatform, string> = {
      'jira': '🎫',
      'confluence': '📄',
      'wiki': '📚',
      'figma': '🎨',
      'github': '🐙',
      'linear': '📏',
      'notion': '📝',
      'azure-devops': '🔷',
      'trello': '📋',
      'asana': '✅'
    };
    
    return icons[platform] || '📄';
  }

  /**
   * Generate tickets for multiple frames with template support
   */
  async generateMultipleTickets(
    frameDataArray: FigmaFrameData[],
    figmaContext: any,
    options: TicketGenerationOptions = {}
  ): Promise<string[]> {
    const tickets = await Promise.all(
      frameDataArray.map(frameData => 
        this.generateParameterizedTicket(frameData, figmaContext, options)
      )
    );
    
    return tickets;
  }

  /**
   * List available templates
   */
  async getAvailableTemplates() {
    return await templateEngine.listAvailableTemplates();
  }

  /**
   * Select the appropriate template type based on document type and tech stack
   */
  private selectTemplateType(documentType: DocumentType, techStack: string | string[]): DocumentType {
    const techStackString = Array.isArray(techStack) 
      ? techStack.join(' ').toLowerCase()
      : (techStack || '').toLowerCase();
    
    // Check for AEM tech stack and modify template selection
    if (techStackString.includes('aem') || 
        techStackString.includes('htl') ||
        techStackString.includes('sling') ||
        techStackString.includes('osgi') ||
        techStackString.includes('jcr')) {
      
      console.log('🏗️ AEM tech stack detected - selecting AEM-specific template');
      
      // Map document types to AEM-specific templates
      if ((documentType as string) === 'component') return 'component-aem' as DocumentType;
      if ((documentType as string) === 'page') return 'page-aem' as DocumentType;
      if ((documentType as string) === 'service') return 'service-aem' as DocumentType;
      if ((documentType as string) === 'code-simple') return 'code-simple-aem' as DocumentType;
    }
    
    // Return original document type for non-AEM stacks
    return documentType;
  }

  /**
   * Detect the appropriate platform based on tech stack (deprecated - keeping for compatibility)
   */
  private detectPlatformFromTechStack(techStack: string, defaultPlatform: DocumentPlatform = 'jira'): DocumentPlatform {
    // Always use the specified platform (like 'jira') instead of overriding based on tech stack
    // The tech stack information will be injected into the template dynamically
    console.log(`🔍 Using platform: ${defaultPlatform} with tech stack: ${techStack}`);
    return defaultPlatform;
  }
}

// Export singleton instance
export const templateIntegration = new TemplateIntegrationService();