/**
 * Template Configuration Engine
 *
 * Implements the parameterized template system with variable substitution,
 * organization standards integration, and multi-platform support.
 */

import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Simple YAML parser for template files
class SimpleYAMLParser {
  static parse(yamlString) {
    try {
      const lines = yamlString.split('\n');
      const result = {};
      // let currentKey = ''; // TODO: Implement YAML key tracking
      let currentObject = result;
      const objectStack = [result];
      const keyStack = [];
      let inMultilineString = false;
      let multilineKey = '';
      let currentValue = '';

      for (let line of lines) {
        const originalLine = line;
        line = line.trim();

        // Skip comments and empty lines
        if (line.startsWith('#') || line === '') {continue;}

        // Skip invalid YAML structures like code fences
        if (line.startsWith('```') || line.startsWith('````')) {continue;}

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

export class AdvancedTemplateEngine {
  constructor(templatesDir) {
    this.templateCache = new Map();
    this.templatesDir = templatesDir || join(__dirname);
  }

  /**
   * Load a template configuration from YAML file
   */
  async loadTemplate(platform, type) {
    const cacheKey = `${platform}-${type}`;

    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey);
    }

    try {
      const templatePath = join(this.templatesDir, platform, `${type}.yml`);
      console.log(`Loading template from: ${templatePath}`);
      const templateContent = await readFile(templatePath, 'utf-8');
      console.log(`Template content loaded, length: ${templateContent.length}`);
      const template = SimpleYAMLParser.parse(templateContent);
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
  async renderTemplate(template, context) {
    let output = '';

    // Check if template has direct content to render
    if (template.content && typeof template.content === 'string') {
      // Use the template's content directly
      output = template.content;
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
  async renderSection(sectionType, template, context) {
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
  substituteVariables(content, template, context) {
    let result = content;

    // Process Handlebars-style conditionals first
    result = this.processConditionals(result, context);

    // Process custom sections ({{#variable}} ... {{/variable}})
    result = this.processCustomSections(result, context);

    // Process Handlebars-style loops
    result = this.processLoops(result, context);

    // Substitute figma context variables with fallback support (including nested properties)
    result = result.replace(/\{\{\s*figma\.([a-zA-Z_.][\w.]*)\s*(\|\|\s*figma\.([a-zA-Z_.][\w.]*))?\s*\}\}/g, (match, key, fallbackExpr, fallbackKey) => {
      const value = this.getNestedProperty(context.figma, key);
      if (value) return value;
      
      if (fallbackKey) {
        const fallbackValue = this.getNestedProperty(context.figma, fallbackKey);
        if (fallbackValue) return fallbackValue;
      }
      
      return match;
    });

    // Substitute project context variables
    result = result.replace(/\{\{\s*project\.(\w+)\s*\}\}/g, (match, key) => {
      return context.project[key] || match;
    });

    // Substitute calculated context variables
    result = result.replace(/\{\{\s*calculated\.(\w+)\s*\}\}/g, (match, key) => {
      return context.calculated[key] || match;
    });

    // Substitute organization context variables
    result = result.replace(/\{\{\s*org\.(\w+)\s*\}\}/g, (match, key) => {
      return context.org[key] || match;
    });

    // Substitute team context variables
    result = result.replace(/\{\{\s*team\.(\w+)\s*\}\}/g, (match, key) => {
      return context.team[key] || match;
    });

    // Substitute template variables (process template variables first, and resolve their values)
    for (const [key, value] of Object.entries(template.variables)) {
      let resolvedValue = String(value);

      // If the template variable value contains Handlebars syntax, resolve it
      if (resolvedValue.includes('{{')) {
        // Recursively process the template variable value
        resolvedValue = this.resolveVariableValue(resolvedValue, context);
      }

      const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(pattern, resolvedValue);
    }

    return result;
  }

  /**
   * Resolve a template variable value that may contain Handlebars syntax
   */
  resolveVariableValue(value, context) {
    let result = value;

    // Substitute figma context variables (including nested properties)
    result = result.replace(/\{\{\s*figma\.([a-zA-Z_.][\w.]*)\s*\}\}/g, (match, key) => {
      return this.getNestedProperty(context.figma, key) || match;
    });

    // Substitute project context variables
    result = result.replace(/\{\{\s*project\.(\w+)\s*\}\}/g, (match, key) => {
      return context.project[key] || match;
    });

    // Substitute calculated context variables
    result = result.replace(/\{\{\s*calculated\.(\w+)\s*\}\}/g, (match, key) => {
      return context.calculated[key] || match;
    });

    // Substitute organization context variables
    result = result.replace(/\{\{\s*org\.(\w+)\s*\}\}/g, (match, key) => {
      return context.org[key] || match;
    });

    // Substitute team context variables
    result = result.replace(/\{\{\s*team\.(\w+)\s*\}\}/g, (match, key) => {
      return context.team[key] || match;
    });

    // Substitute user context variables
    result = result.replace(/\{\{\s*user\.(\w+)\s*\}\}/g, (match, key) => {
      return context.user?.[key] || match;
    });

    return result;
  }

  /**
   * Process Handlebars-style conditionals {{#if}} {{/if}}
   */
  processConditionals(content, context) {
    let result = content;

    // Handle {{#if figma.design_tokens}} ... {{/if}}
    const ifPattern = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

    result = result.replace(ifPattern, (match, condition, innerContent) => {
      const value = this.evaluateCondition(condition, context);
      if (value && this.isTruthy(value)) {
        return innerContent;
      }
      return '';
    });

    return result;
  }

  /**
   * Process custom sections {{#variable}} ... {{/variable}}
   */
  processCustomSections(content, context) {
    let result = content;

    // Handle {{#calculated.design_analysis}} ... {{/calculated.design_analysis}}
    const sectionPattern = /\{\{\s*#([^}]+)\s*\}\}([\s\S]*?)\{\{\s*\/\1\s*\}\}/g;

    result = result.replace(sectionPattern, (match, sectionKey, innerContent) => {
      // Get the value from context using the section key
      const value = this.evaluateCondition(sectionKey, context);
      
      if (value && this.isTruthy(value)) {
        // If the value exists and is truthy, return the inner content
        return innerContent;
      }
      
      // If value is falsy, remove the entire section
      return '';
    });

    return result;
  }

  /**
   * Process Handlebars-style loops {{#each}} {{/each}}
   */
  processLoops(content, context) {
    let result = content;

    // Handle {{#each figma.design_tokens.colors}} ... {{/each}}
    const eachPattern = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

    result = result.replace(eachPattern, (match, arrayPath, innerContent) => {
      const arrayValue = this.evaluateCondition(arrayPath, context);

      if (Array.isArray(arrayValue)) {
        return arrayValue.map((item, index) => {
          let itemContent = innerContent;
          // Replace {{this}} with the current item
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
          // Replace {{@index}} with the current index
          itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
          return itemContent;
        }).join('');
      } else if (typeof arrayValue === 'object' && arrayValue) {
        // Handle object iteration
        return Object.entries(arrayValue).map(([key, value]) => {
          let itemContent = innerContent;
          // Replace {{@key}} with the current key
          itemContent = itemContent.replace(/\{\{@key\}\}/g, key);
          // Replace {{this}} with the current value
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(value));
          return itemContent;
        }).join('');
      }

      return '';
    });

    return result;
  }

  /**
   * Evaluate a condition like "figma.design_tokens" or "figma.design_tokens.colors"
   */
  evaluateCondition(condition, context) {
    const trimmed = condition.trim();

    if (trimmed.startsWith('figma.')) {
      const path = trimmed.substring(6); // Remove 'figma.'
      return this.getNestedProperty(context.figma, path);
    } else if (trimmed.startsWith('project.')) {
      const path = trimmed.substring(8); // Remove 'project.'
      return this.getNestedProperty(context.project, path);
    }

    return null;
  }

  /**
   * Get nested property from object using dot notation
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Check if a value is truthy (has content)
   */
  isTruthy(value) {
    if (value === null || value === undefined) {return false;}
    if (typeof value === 'string') {return value.trim().length > 0;}
    if (Array.isArray(value)) {return value.length > 0;}
    if (typeof value === 'object') {return Object.keys(value).length > 0;}
    return Boolean(value);
  }

  /**
   * Render title section
   */
  renderTitle(template, context, useEmojis) {
    const emoji = useEmojis ? this.getEmojiForDocumentType(template.platform) : '';
    const componentName = context.figma.component_name || template.variables.component_name;
    const typePrefix = this.getTypePrefix(template.platform);

    return `# ${emoji} ${typePrefix}: ${componentName}\n\n`;
  }

  /**
   * Render summary section
   */
  renderSummary(template, context, _useEmojis) {
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
  renderRequirements(template, context, useEmojis, useAIMarkers) {
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
  renderAcceptanceCriteria(template, context, useEmojis, useAIMarkers) {
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
  renderTestingStrategy(template, context, useEmojis, useAIMarkers) {
    let output = '';

    if (useAIMarkers) {
      output += '<!-- START: testing_strategy -->\n';
    }

    output += `## ${useEmojis ? '🧪 ' : ''}Testing Strategy\n\n`;

    const framework = template.team_standards.testing_framework;
    const frameworkName = this.getTestingFrameworkName(framework);

    output += `**Framework**: ${frameworkName}\n`;
    output += '**Test Types**: Unit tests, integration tests, snapshot tests\n';
    output += '**Coverage**: Component behavior, props validation, accessibility\n\n';

    if (template.customization.generate_test_files) {
      output += '**Example Test Structure**:\n';
      output += '```typescript\n';
      output += `describe('${context.figma.component_name}', () => {\n`;
      output += '  test(\'renders with default props\', () => {\n';
      output += '    // Implementation test\n';
      output += '  });\n';
      output += '  \n';
      output += '  test(\'handles user interactions correctly\', () => {\n';
      output += '    // Interaction test\n';
      output += '  });\n';

      if (template.team_standards.accessibility_level !== 'basic') {
        output += '  \n';
        output += '  test(\'meets accessibility requirements\', () => {\n';
        output += '    // A11y test\n';
        output += '  });\n';
      }

      output += '});\n';
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
  renderAIAssistantIntegration(template, context, useEmojis, useAIMarkers) {
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

    output += '**Claude/Cursor Prompt**: "Review this development ticket for completeness and suggest improvements for implementation clarity, edge cases, and testing coverage."\n';

    if (useAIMarkers) {
      output += '<!-- END: ai_assistant_integration -->\n';
    }

    return output;
  }

  /**
   * Render other sections (simplified for now)
   */
  renderDesignContext(template, context, useEmojis) {
    return `## ${useEmojis ? '🎨 ' : ''}Design Context\n\nRefer to the Figma design for visual specifications and interactions.\n\n`;
  }

  renderTechnicalImplementation(template, context, useEmojis, useAIMarkers) {
    let output = '';
    if (useAIMarkers) {output += '<!-- START: technical_implementation -->\n';}
    output += `## ${useEmojis ? '🔧 ' : ''}Technical Implementation\n\nImplement using ${context.project.tech_stack.join(', ')} following ${template.team_standards.code_style} standards.\n\n`;
    if (useAIMarkers) {output += '<!-- END: technical_implementation -->\n\n';}
    return output;
  }

  renderComplexityAnalysis(template, context, useEmojis) {
    return `## ${useEmojis ? '📊 ' : ''}Complexity Analysis\n\n**Level**: ${context.calculated.complexity}\n**Estimated Hours**: ${context.calculated.hours}\n**Confidence**: ${Math.round(context.calculated.confidence * 100)}%\n\n`;
  }

  renderSubtasks(template, context, useEmojis, useAIMarkers) {
    let output = '';
    if (useAIMarkers) {output += '<!-- START: subtasks -->\n';}
    output += `## ${useEmojis ? '📋 ' : ''}Subtasks\n\n`;
    output += `- [ ] ${useEmojis ? '🏗️ ' : ''}Set up component structure\n`;
    output += `- [ ] ${useEmojis ? '🎨 ' : ''}Implement styling with design tokens\n`;
    output += `- [ ] ${useEmojis ? '🧪 ' : ''}Write comprehensive tests\n`;
    if (useAIMarkers) {output += '<!-- END: subtasks -->\n\n';}
    return output;
  }

  /**
   * Helper methods
   */
  getEmojiForDocumentType(platform) {
    const emojiMap = {
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

  getTypePrefix(platform) {
    const prefixMap = {
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

  getTestingFrameworkName(framework) {
    const frameworkMap = {
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
  validateTemplate(template) {
    const errors = [];
    const warnings = [];

    console.log('🔍 Validating template:', JSON.stringify(template, null, 2));

    // Required fields validation
    if (!template.template_id) {errors.push('template_id is required');}
    if (!template.version) {errors.push('version is required');}
    if (!template.platform) {errors.push('platform is required');}
    if (!template.variables) {errors.push('variables section is required');}
    if (!template.team_standards) {errors.push('team_standards section is required');}
    if (!template.output_format) {errors.push('output_format section is required');}

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
  getDefaultTemplate(platform, type) {
    return {
      template_id: `${platform}-${type}-default`,
      version: '1.0.0',
      organization: 'default',
      platform,
      variables: {
        component_name: '{{ figma.component_name }}',
        technologies: [],
        design_ref: '{{ figma.frame_id }}',
        complexity_level: 'medium'
      },
      team_standards: {
        testing_framework: 'jest-rtl',
        accessibility_level: 'wcag-aa',
        documentation_format: 'markdown',
        code_style: 'prettier',
        review_process: 'standard'
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
  async listAvailableTemplates() {
    const templates = [];

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
                const template = SimpleYAMLParser.parse(content);

                templates.push({
                  template_id: template.template_id,
                  platform: template.platform,
                  type: file.replace('.yml', ''),
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