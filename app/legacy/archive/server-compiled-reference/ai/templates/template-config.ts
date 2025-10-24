/**
 * Template Configuration Engine
 * 
 * Implements the parameterized template system with variable substitution,
 * organization standards integration, and multi-platform support.
 */

import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
  TemplateConfig,
  TemplateContext,
  TemplateEngine,
  DocumentPlatform,
  DocumentType,
  TemplateInfo,
  ValidationResult
} from './template-types.js';

// Simple YAML parser for template files
class SimpleYAMLParser {
  static parse(yamlString: string): any {
    try {
      const lines = yamlString.split('\n');
      const result: any = {};
      let currentKey = '';
      let currentObject: any = result;
      let objectStack: any[] = [result];
      let keyStack: string[] = [];
      let inMultilineString = false;
      let multilineKey = '';
      let currentValue = '';
      
      for (let line of lines) {
        const originalLine = line;
        line = line.trim();
        
        // Skip comments and empty lines
        if (line.startsWith('#') || line === '') continue;
        
        // Skip invalid YAML structures like code fences
        if (line.startsWith('```') || line.startsWith('````')) continue;
      
        // Handle multiline strings
        if (inMultilineString) {
          if (line === '---' || line.startsWith('template_id:') || (originalLine.length > 0 && !originalLine.startsWith(' ') && line.includes(':'))) {
            currentObject[multilineKey] = currentValue.trim();
            inMultilineString = false;
            multilineKey = '';
            currentValue = '';
            // Continue processing this line
          } else {
            currentValue += line + '\n';
            continue;
          }
        }
        
        // Calculate indentation level
        const indentLevel = Math.floor((originalLine.length - originalLine.trimLeft().length) / 2);
        
        // Handle key-value pairs
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          const cleanKey = key.trim();
          
          // Adjust object stack based on indentation
          while (keyStack.length > indentLevel) {
            keyStack.pop();
            objectStack.pop();
          }
          currentObject = objectStack[objectStack.length - 1];
          
          if (cleanKey === 'content' && value === '|') {
            inMultilineString = true;
            multilineKey = 'content';
            currentValue = '';
          } else if (value === '' || value === ':') {
            // This is a parent key for nested objects
            currentObject[cleanKey] = {};
            keyStack.push(cleanKey);
            objectStack.push(currentObject[cleanKey]);
            currentObject = currentObject[cleanKey];
          } else if (value.startsWith('"') && value.endsWith('"')) {
            currentObject[cleanKey] = value.slice(1, -1);
          } else if (value.startsWith('[') && value.endsWith(']')) {
            currentObject[cleanKey] = value.slice(1, -1).split(',').map(s => s.trim().replace(/"/g, ''));
          } else if (value === 'true') {
            currentObject[cleanKey] = true;
          } else if (value === 'false') {
            currentObject[cleanKey] = false;
          } else if (!isNaN(Number(value))) {
            currentObject[cleanKey] = Number(value);
          } else {
            currentObject[cleanKey] = value;
          }
        }
      }
      
      // Handle final multiline string
      if (inMultilineString) {
        currentObject[multilineKey] = currentValue.trim();
      }
      
      return result;
    } catch (error) {
      console.error('YAML parsing error:', error);
      throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AdvancedTemplateEngine implements TemplateEngine {
  private templateCache = new Map<string, TemplateConfig>();
  private templatesDir: string;

  constructor(templatesDir?: string) {
    this.templatesDir = templatesDir || join(__dirname);
  }

  /**
   * Load a template configuration from YAML file
   */
  async loadTemplate(platform: DocumentPlatform, type: DocumentType): Promise<TemplateConfig> {
    const cacheKey = `${platform}-${type}`;
    
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    try {
      const templatePath = join(this.templatesDir, platform, `${type}.yml`);
      console.log(`Loading template from: ${templatePath}`);
      const templateContent = await readFile(templatePath, 'utf-8');
      console.log(`Template content loaded, length: ${templateContent.length}`);
      const template = SimpleYAMLParser.parse(templateContent) as TemplateConfig;
      console.log(`Template parsed successfully: ${template.template_id}`);
      
      // Validate template
      const validation = this.validateTemplate(template);
      if (!validation.isValid) {
        throw new Error(`Invalid template ${cacheKey}: ${validation.errors.join(', ')}`);
      }

      this.templateCache.set(cacheKey, template);
      return template;
    } catch (error) {
      console.error(`Failed to load template ${cacheKey}:`, error);
      console.warn(`Using default template for ${cacheKey}`);
      return this.getDefaultTemplate(platform, type);
    }
  }

  /**
   * Render a template with the provided context
   */
  async renderTemplate(template: TemplateConfig, context: TemplateContext): Promise<string> {
    let output = '';

    // Check if template has direct content to render
    if ((template as any).content && typeof (template as any).content === 'string') {
      // Use the template's content directly
      output = (template as any).content;
    } else {
      // Fallback to section-based rendering
      for (const sectionType of template.output_format.sections) {
        output += await this.renderSection(sectionType, template, context);
      }
    }

    // Apply global template variables
    output = this.substituteVariables(output, template, context);

    return output;
  }

  /**
   * Render a specific section of the template
   */
  private async renderSection(
    sectionType: string, 
    template: TemplateConfig, 
    context: TemplateContext
  ): Promise<string> {
    const useEmojis = template.output_format.formatting.use_emojis;
    const useAIMarkers = template.customization.include_ai_context_markers;

    switch (sectionType) {
      case 'title':
        return this.renderTitle(template, context, useEmojis);
      
      case 'summary':
        return this.renderSummary(template, context, useEmojis);
      
      case 'requirements':
        return this.renderRequirements(template, context, useEmojis, useAIMarkers);
      
      case 'design_context':
        return this.renderDesignContext(template, context, useEmojis);
      
      case 'acceptance_criteria':
        return this.renderAcceptanceCriteria(template, context, useEmojis, useAIMarkers);
      
      case 'technical_implementation':
        return this.renderTechnicalImplementation(template, context, useEmojis, useAIMarkers);
      
      case 'testing_strategy':
        return this.renderTestingStrategy(template, context, useEmojis, useAIMarkers);
      
      case 'complexity_analysis':
        return this.renderComplexityAnalysis(template, context, useEmojis);
      
      case 'subtasks':
        return this.renderSubtasks(template, context, useEmojis, useAIMarkers);
      
      case 'ai_assistant_integration':
        return this.renderAIAssistantIntegration(template, context, useEmojis, useAIMarkers);
      
      default:
        return `## ${sectionType.replace(/_/g, ' ').toUpperCase()}\n\n`;
    }
  }

  /**
   * Substitute variables in template content
   */
  private substituteVariables(
    content: string, 
    template: TemplateConfig, 
    context: TemplateContext
  ): string {
    let result = content;

    // Substitute figma context variables
    result = result.replace(/\{\{\s*figma\.(\w+)\s*\}\}/g, (match, key) => {
      return (context.figma as any)[key] || match;
    });

    // Substitute project context variables
    result = result.replace(/\{\{\s*project\.(\w+)\s*\}\}/g, (match, key) => {
      return (context.project as any)[key] || match;
    });

    // Substitute calculated context variables
    result = result.replace(/\{\{\s*calculated\.(\w+)\s*\}\}/g, (match, key) => {
      return (context.calculated as any)[key] || match;
    });

    // Substitute organization context variables
    result = result.replace(/\{\{\s*org\.(\w+)\s*\}\}/g, (match, key) => {
      return (context.org as any)[key] || match;
    });

    // Substitute team context variables
    result = result.replace(/\{\{\s*team\.(\w+)\s*\}\}/g, (match, key) => {
      return (context.team as any)[key] || match;
    });

    // Substitute template variables
    for (const [key, value] of Object.entries(template.variables)) {
      const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(pattern, String(value));
    }

    return result;
  }

  /**
   * Render title section
   */
  private renderTitle(template: TemplateConfig, context: TemplateContext, useEmojis: boolean): string {
    const emoji = useEmojis ? this.getEmojiForDocumentType(template.platform) : '';
    const componentName = context.figma.component_name || template.variables.component_name;
    const typePrefix = this.getTypePrefix(template.platform);
    
    return `# ${emoji} ${typePrefix}: ${componentName}\n\n`;
  }

  /**
   * Render summary section
   */
  private renderSummary(template: TemplateConfig, context: TemplateContext, useEmojis: boolean): string {
    const priority = context.calculated.complexity === 'complex' ? 'High' : 'Medium';
    const storyPoints = context.calculated.hours <= 4 ? 3 : context.calculated.hours <= 8 ? 5 : 8;
    
    let output = `**Priority**: ${priority} | **Story Points**: ${storyPoints}\n\n`;
    
    if (context.figma.file_id) {
      output += `**🔗 Figma Design**: [View Component](https://figma.com/file/${context.figma.file_id})\n\n`;
    }
    
    return output;
  }

  /**
   * Render requirements section with AI markers
   */
  private renderRequirements(
    template: TemplateConfig, 
    context: TemplateContext, 
    useEmojis: boolean, 
    useAIMarkers: boolean
  ): string {
    let output = '';
    
    if (useAIMarkers) {
      output += '<!-- START: requirements -->\n';
    }
    
    output += `## ${useEmojis ? '🎯 ' : ''}Objective\n`;
    output += `Implement the **${context.figma.component_name}** component from the design specifications`;
    
    if (context.figma.file_name) {
      output += ` in ${context.figma.file_name}`;
    }
    
    output += '.\n\n';
    
    // Add design specifications
    output += `## ${useEmojis ? '📐 ' : ''}Design Specifications\n`;
    output += `- **Component Name**: ${context.figma.component_name}\n`;
    
    if (context.figma.dimensions) {
      output += `- **Dimensions**: ${context.figma.dimensions.width}×${context.figma.dimensions.height}px\n`;
    }
    
    output += `- **Complexity**: ${context.calculated.complexity}\n`;
    
    if (context.figma.dependencies && context.figma.dependencies.length > 0) {
      output += `- **Dependencies**: ${context.figma.dependencies.slice(0, 3).join(', ')}\n`;
    }
    
    // Add complexity analysis
    if (template.customization.include_risk_assessment) {
      output += `\n## ${useEmojis ? '📊 ' : ''}Intelligence Analysis\n\n`;
      output += `**Estimated Complexity:** ${context.calculated.complexity} (${context.calculated.hours} hours)\n`;
      output += `├── 📊 **Confidence Level:** ${Math.round(context.calculated.confidence * 100)}%\n`;
      
      if (context.calculated.similar_components.length > 0) {
        output += `├── ⚡ **Similar Components:** ${context.calculated.similar_components.slice(0, 3).join(', ')}\n`;
      }
      
      if (context.calculated.risk_factors.length > 0) {
        output += `└── 🎯 **Risk Factors:** ${context.calculated.risk_factors.join(', ')}\n`;
      }
      
      output += '\n';
    }
    
    if (useAIMarkers) {
      output += '<!-- END: requirements -->\n\n';
    }
    
    return output;
  }

  /**
   * Render acceptance criteria with AI markers
   */
  private renderAcceptanceCriteria(
    template: TemplateConfig,
    context: TemplateContext,
    useEmojis: boolean,
    useAIMarkers: boolean
  ): string {
    let output = '';
    
    if (useAIMarkers) {
      output += '<!-- START: acceptance_criteria -->\n';
    }
    
    output += `## ${useEmojis ? '✅ ' : ''}Acceptance Criteria\n\n`;
    
    // Standard criteria
    output += `${useEmojis ? '✅ ' : '- '}**Visual Accuracy**: Component matches design specifications exactly\n\n`;
    output += `${useEmojis ? '📱 ' : '- '}**Responsive Design**: Works across all supported breakpoints\n\n`;
    
    // Accessibility criteria based on team standards
    const accessibilityLevel = template.team_standards.accessibility_level;
    if (accessibilityLevel !== 'basic') {
      output += `${useEmojis ? '♿ ' : '- '}**Accessibility**: Meets ${accessibilityLevel.toUpperCase()} standards\n\n`;
    }
    
    output += `${useEmojis ? '🎨 ' : '- '}**Design System Compliance**: Uses approved design tokens\n\n`;
    output += `${useEmojis ? '🧪 ' : '- '}**Testing**: Unit tests with ${template.team_standards.testing_framework}\n\n`;
    
    if (useAIMarkers) {
      output += '<!-- END: acceptance_criteria -->\n\n';
    }
    
    return output;
  }

  /**
   * Render testing strategy with framework-specific examples
   */
  private renderTestingStrategy(
    template: TemplateConfig,
    context: TemplateContext,
    useEmojis: boolean,
    useAIMarkers: boolean
  ): string {
    let output = '';
    
    if (useAIMarkers) {
      output += '<!-- START: testing_strategy -->\n';
    }
    
    output += `## ${useEmojis ? '🧪 ' : ''}Testing Strategy\n\n`;
    
    const framework = template.team_standards.testing_framework;
    const frameworkName = this.getTestingFrameworkName(framework);
    
    output += `**Framework**: ${frameworkName}\n`;
    output += `**Test Types**: Unit tests, integration tests, snapshot tests\n`;
    output += `**Coverage**: Component behavior, props validation, accessibility\n\n`;
    
    if (template.customization.generate_test_files) {
      output += `**Example Test Structure**:\n`;
      output += '```typescript\n';
      output += `describe('${context.figma.component_name}', () => {\n`;
      output += `  test('renders with default props', () => {\n`;
      output += `    // Implementation test\n`;
      output += `  });\n`;
      output += `  \n`;
      output += `  test('handles user interactions correctly', () => {\n`;
      output += `    // Interaction test\n`;
      output += `  });\n`;
      
      if (template.team_standards.accessibility_level !== 'basic') {
        output += `  \n`;
        output += `  test('meets accessibility requirements', () => {\n`;
        output += `    // A11y test\n`;
        output += `  });\n`;
      }
      
      output += `});\n`;
      output += '```\n';
    }
    
    if (useAIMarkers) {
      output += '<!-- END: testing_strategy -->\n\n';
    }
    
    return output;
  }

  /**
   * Render AI assistant integration section
   */
  private renderAIAssistantIntegration(
    template: TemplateConfig,
    context: TemplateContext,
    useEmojis: boolean,
    useAIMarkers: boolean
  ): string {
    if (!template.customization.include_ai_context_markers) {
      return '';
    }
    
    let output = '';
    
    if (useAIMarkers) {
      output += '<!-- START: ai_assistant_integration -->\n';
    }
    
    output += `## ${useEmojis ? '🤖 ' : ''}AI Assistant Integration\n\n`;
    
    // Platform-specific prompts
    const techStack = context.project.tech_stack.join(', ');
    const testFramework = this.getTestingFrameworkName(template.team_standards.testing_framework);
    
    output += `**Copilot Prompt**: "Analyze this ticket and generate a ${techStack} component implementation with proper TypeScript interfaces, styling, and comprehensive ${testFramework} tests. Focus on accessibility and design system compliance."\n\n`;
    
    output += `**Claude/Cursor Prompt**: "Review this development ticket for completeness and suggest improvements for implementation clarity, edge cases, and testing coverage."\n`;
    
    if (useAIMarkers) {
      output += '<!-- END: ai_assistant_integration -->\n';
    }
    
    return output;
  }

  /**
   * Render other sections (simplified for now)
   */
  private renderDesignContext(template: TemplateConfig, context: TemplateContext, useEmojis: boolean): string {
    return `## ${useEmojis ? '🎨 ' : ''}Design Context\n\nRefer to the Figma design for visual specifications and interactions.\n\n`;
  }

  private renderTechnicalImplementation(template: TemplateConfig, context: TemplateContext, useEmojis: boolean, useAIMarkers: boolean): string {
    let output = '';
    if (useAIMarkers) output += '<!-- START: technical_implementation -->\n';
    output += `## ${useEmojis ? '🔧 ' : ''}Technical Implementation\n\nImplement using ${context.project.tech_stack.join(', ')} following ${template.team_standards.code_style} standards.\n\n`;
    if (useAIMarkers) output += '<!-- END: technical_implementation -->\n\n';
    return output;
  }

  private renderComplexityAnalysis(template: TemplateConfig, context: TemplateContext, useEmojis: boolean): string {
    return `## ${useEmojis ? '📊 ' : ''}Complexity Analysis\n\n**Level**: ${context.calculated.complexity}\n**Estimated Hours**: ${context.calculated.hours}\n**Confidence**: ${Math.round(context.calculated.confidence * 100)}%\n\n`;
  }

  private renderSubtasks(template: TemplateConfig, context: TemplateContext, useEmojis: boolean, useAIMarkers: boolean): string {
    let output = '';
    if (useAIMarkers) output += '<!-- START: subtasks -->\n';
    output += `## ${useEmojis ? '📋 ' : ''}Subtasks\n\n`;
    output += `- [ ] ${useEmojis ? '🏗️ ' : ''}Set up component structure\n`;
    output += `- [ ] ${useEmojis ? '🎨 ' : ''}Implement styling with design tokens\n`;
    output += `- [ ] ${useEmojis ? '🧪 ' : ''}Write comprehensive tests\n`;
    if (useAIMarkers) output += '<!-- END: subtasks -->\n\n';
    return output;
  }

  /**
   * Helper methods
   */
  private getEmojiForDocumentType(platform: DocumentPlatform): string {
    const emojiMap: Record<DocumentPlatform, string> = {
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
    return emojiMap[platform] || '📄';
  }

  private getTypePrefix(platform: DocumentPlatform): string {
    const prefixMap: Record<DocumentPlatform, string> = {
      'jira': 'Component',
      'confluence': 'Documentation',
      'wiki': 'Guide',
      'figma': 'Design Spec',
      'github': 'Issue',
      'linear': 'Feature',
      'notion': 'Page',
      'azure-devops': 'Work Item',
      'trello': 'Card',
      'asana': 'Task'
    };
    return prefixMap[platform] || 'Document';
  }

  private getTestingFrameworkName(framework: string): string {
    const frameworkMap: Record<string, string> = {
      'jest-rtl': 'Jest + React Testing Library',
      'cypress': 'Cypress',
      'playwright': 'Playwright',
      'vitest': 'Vitest',
      'mocha-chai': 'Mocha + Chai',
      'jasmine': 'Jasmine',
      'karma': 'Karma'
    };
    return frameworkMap[framework] || framework;
  }

  /**
   * Validate template configuration
   */
  validateTemplate(template: TemplateConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log('🔍 Validating template:', JSON.stringify(template, null, 2));

    // Required fields validation
    if (!template.template_id) errors.push('template_id is required');
    if (!template.version) errors.push('version is required');
    if (!template.platform) errors.push('platform is required');
    if (!template.variables) errors.push('variables section is required');
    if (!template.team_standards) errors.push('team_standards section is required');
    if (!template.output_format) errors.push('output_format section is required');

    // Validate output format sections
    if (template.output_format.sections && template.output_format.sections.length === 0) {
      warnings.push('No sections defined in output_format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get default template when file loading fails
   */
  private getDefaultTemplate(platform: DocumentPlatform, type: DocumentType): TemplateConfig {
    return {
      template_id: `${platform}-${type}-default`,
      version: '1.0.0',
      organization: 'default',
      platform,
      variables: {
        component_name: '{{ figma.component_name }}',
        technologies: [],
        design_ref: '{{ figma.frame_id }}',
        complexity_level: 'medium' as const
      },
      team_standards: {
        testing_framework: 'jest-rtl' as const,
        accessibility_level: 'wcag-aa' as const,
        documentation_format: 'markdown' as const,
        code_style: 'prettier' as const,
        review_process: 'standard' as const
      },
      output_format: {
        ticket_type: 'task',
        sections: ['title', 'summary', 'requirements', 'acceptance_criteria', 'testing_strategy'],
        formatting: {
          use_emojis: true,
          include_diagrams: false,
          code_highlighting: true,
          table_formatting: true,
          link_formatting: true
        },
        ai_context_markers: true,
        include_metadata: true
      },
      customization: {
        include_ai_context_markers: true,
        generate_test_files: true,
        create_storybook_stories: false,
        add_accessibility_checklist: true,
        include_performance_metrics: false,
        enable_automated_testing: false,
        include_design_tokens: true,
        add_similar_components: true,
        include_risk_assessment: true
      }
    };
  }

  /**
   * List all available templates
   */
  async listAvailableTemplates(): Promise<TemplateInfo[]> {
    const templates: TemplateInfo[] = [];
    
    try {
      const platforms = await readdir(this.templatesDir, { withFileTypes: true });
      
      for (const platformDir of platforms) {
        if (platformDir.isDirectory() && !platformDir.name.startsWith('.')) {
          const platformPath = join(this.templatesDir, platformDir.name);
          const templateFiles = await readdir(platformPath);
          
          for (const file of templateFiles) {
            if (file.endsWith('.yml')) {
              try {
                const templatePath = join(platformPath, file);
                const content = await readFile(templatePath, 'utf-8');
                const template = SimpleYAMLParser.parse(content) as TemplateConfig;
                
                templates.push({
                  template_id: template.template_id,
                  platform: template.platform,
                  type: file.replace('.yml', '') as DocumentType,
                  version: template.version,
                  description: template.description || '',
                  variables: Object.keys(template.variables)
                });
              } catch (error) {
                console.warn(`Failed to load template ${file}:`, error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to list templates:', error);
    }
    
    return templates;
  }
}

// Export singleton instance
export const templateEngine = new AdvancedTemplateEngine();