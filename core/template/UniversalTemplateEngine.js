/**
 * Universal Template Resolution Engine
 *
 * Implements intelligent template resolution with fallback logic:
 * 1. platform-specific template (e.g., jira/component.yml)
 * 2. tech-stack-specific template (e.g., react/component.yml)
 * 3. custom defaults (custom/defaults.yml)
 * 4. built-in defaults
 */

import { readFile, readdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class UniversalTemplateEngine {
  constructor(configDir) {
    this.configDir = configDir || join(__dirname, '../../config/templates');
    this.templateCache = new Map();
    this.resolvedCache = new Map();

    // Document type mapping for new file naming convention
    this.documentTypeMapping = {
      'component': 'comp',
      'comp': 'comp',
      'feature': 'feature',
      'code': 'code',
      'service': 'service',
      'wiki': 'wiki',
      'authoring': 'wiki' // Map authoring to wiki as they're similar
    };
  }

  /**
   * Map document type to file name
   */
  mapDocumentType(documentType) {
    return this.documentTypeMapping[documentType] || documentType;
  }

  /**
   * Main template resolution with intelligent fallback
   */
  async resolveTemplate(platform, documentType, techStack = 'custom') {
    const mappedDocumentType = this.mapDocumentType(documentType);
    const cacheKey = `${platform}-${documentType}-${techStack}`;

    if (this.resolvedCache.has(cacheKey)) {
      return this.resolvedCache.get(cacheKey);
    }

    // Resolution order with fallback logic
    const resolutionPaths = [
      // 1. Platform-specific template
      `platforms/${platform}/${mappedDocumentType}.yml`,

      // 2. Tech-stack-specific template
      `tech-stacks/${techStack}/defaults.yml`,

      // 3. Custom defaults
      'tech-stacks/custom/defaults.yml',

      // 4. Built-in fallback (we'll generate this)
    ];

    let resolvedTemplate = null;
    let resolutionPath = null;

    for (const path of resolutionPaths) {
      try {
        const fullPath = join(this.configDir, path);
        await access(fullPath);

        const template = await this.loadTemplate(fullPath);
        if (template && this.isValidTemplate(template, platform, documentType)) {
          // Merge with base template if it inherits from base
          resolvedTemplate = await this.mergeWithBase(template);
          resolutionPath = path;
          break;
        }
      } catch (error) {
        // Path doesn't exist, try next one
        continue;
      }
    }

    // If no template found, create a basic fallback
    if (!resolvedTemplate) {
      resolvedTemplate = this.createFallbackTemplate(platform, documentType, techStack);
      resolutionPath = 'built-in-fallback';
    }

    // Enhance template with metadata
    const enhancedTemplate = {
      ...resolvedTemplate,
      _meta: {
        platform,
        documentType,
        techStack,
        resolutionPath,
        resolvedAt: new Date().toISOString(),
        cacheKey
      }
    };

    this.resolvedCache.set(cacheKey, enhancedTemplate);
    return enhancedTemplate;
  }

  /**
   * Load and parse YAML template
   */
  async loadTemplate(filePath) {
    if (this.templateCache.has(filePath)) {
      return this.templateCache.get(filePath);
    }

    try {
      const content = await readFile(filePath, 'utf-8');
      const template = yaml.load(content);

      this.templateCache.set(filePath, template);
      return template;
    } catch (error) {
      console.warn(`Failed to load template ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Validate template structure
   */
  isValidTemplate(template, platform, documentType) {
    if (!template || typeof template !== 'object') {
      return false;
    }

    // Check for required structure
    const hasValidMeta = template.meta && (
      template.meta.platform === platform ||
      template.meta.document_type === documentType ||
      template.meta.tech_stack
    );

    const hasTemplate = template.template || template.content;

    return hasValidMeta || hasTemplate;
  }

  /**
   * Render template with context data
   */
  async renderTemplate(template, context) {
    if (!template) {
      throw new Error('Template is required for rendering');
    }

    // Extract the actual template content from different possible locations
    let templateContent = null;

    if (template.template && typeof template.template === 'object' && template.template.content) {
      // Template has structured content: template.template.content
      templateContent = template.template.content;
    } else if (template.template && typeof template.template === 'string') {
      // Template has direct string content: template.template
      templateContent = template.template;
    } else if (template.content) {
      // Template has content field: template.content
      templateContent = template.content;
    } else if (typeof template === 'string') {
      // Template is a direct string
      templateContent = template;
    } else if (template.template && typeof template.template === 'object') {
      // Template is an object structure - render as formatted output
      return this.processObjectTemplate(template.template, context, template);
    }

    // If we found template content, process it
    if (templateContent && typeof templateContent === 'string') {
      // Merge base template variables into context if available
      const enrichedContext = this.enrichContextWithTemplate(context, template);
      return this.substituteVariables(templateContent, enrichedContext, template);
    }

    // If it's an object template, process each field
    if (typeof templateContent === 'object') {
      return this.processObjectTemplate(templateContent, context, template);
    }

    // Fallback - try to find any renderable content
    console.warn('No renderable content found in template:', Object.keys(template));
    return `# ${context.figma?.component_name || 'Component'}\n\nTemplate structure could not be rendered.\nTemplate keys: ${Object.keys(template).join(', ')}`;
  }

  /**
   * Process object-based templates (like Jira ticket structure)
   */
  processObjectTemplate(templateObj, context, template) {
    const result = {};

    for (const [key, value] of Object.entries(templateObj)) {
      if (typeof value === 'string') {
        result[key] = this.substituteVariables(value, context, template);
      } else if (Array.isArray(value)) {
        result[key] = value.map(item =>
          typeof item === 'string'
            ? this.substituteVariables(item, context, template)
            : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.processObjectTemplate(value, context, template);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Advanced variable substitution with multiple syntax support
   */
  substituteVariables(content, context, template) {
    let result = content;

    // 1. Handle Handlebars-style variables: {{ figma.component_name }}
    result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, expression) => {
      const value = this.evaluateExpression(expression, context, template);
      // Return empty string if value is null/undefined, otherwise return the value or original match
      return value !== null && value !== undefined ? String(value) : '';
    });

    // 2. Handle conditionals: {% if condition %} content {% endif %}
    result = result.replace(/{%\s*if\s+([^%]+)\s*%}([\s\S]*?){%\s*endif\s*%}/g,
      (match, condition, content) => {
        const value = this.evaluateExpression(condition, context, template);
        return this.isTruthy(value) ? this.substituteVariables(content, context, template) : '';
      }
    );

    // 3. Handle loops: {% for item in array %} content {% endfor %}
    result = result.replace(/{%\s*for\s+(\w+)\s+in\s+([^%]+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g,
      (match, itemVar, arrayExpr, content) => {
        const array = this.evaluateExpression(arrayExpr, context, template);
        if (!Array.isArray(array) || array.length === 0) {return '';}

        return array.map((item, index) => {
          const itemContext = {
            ...context,
            [itemVar]: item,
            loop: { index: index + 1, index0: index }
          };
          return this.substituteVariables(content, itemContext, template);
        }).join('');
      }
    );

    // 4. Handle default values with || syntax: {{value || 'default'}}
    result = result.replace(/\{\{\s*([^}]+?)\s*\|\|\s*['"]([^'"]*)['"]\s*\}\}/g,
      (match, expression, defaultValue) => {
        const value = this.evaluateExpression(expression, context, template);
        return this.isTruthy(value) ? String(value) : defaultValue;
      }
    );

    return result;
  }

  /**
   * Evaluate expressions like "figma.component_name" or "project.tech_stack | default('React')"
   */
  evaluateExpression(expression, context, template) {
    const trimmed = expression.trim();

    // Handle mathematical operations: "calculated.confidence * 100"
    const mathMatch = trimmed.match(/^(.+?)\s*(\*|\+|-|\/)\s*(\d+(?:\.\d+)?)$/);
    if (mathMatch) {
      const [, leftExpr, operator, rightValue] = mathMatch;
      const leftValue = this.evaluateExpression(leftExpr, context, template);
      const rightNum = parseFloat(rightValue);
      const leftNum = parseFloat(leftValue);

      if (!isNaN(leftNum) && !isNaN(rightNum)) {
        switch (operator) {
        case '*': return Math.round(leftNum * rightNum);
        case '+': return leftNum + rightNum;
        case '-': return leftNum - rightNum;
        case '/': return rightNum !== 0 ? leftNum / rightNum : 0;
        }
      }
      return leftValue;
    }

    // Handle default values: "value | default('fallback')"
    const defaultMatch = trimmed.match(/^(.+?)\s*\|\s*default\(['"]([^'"]*)['"]\)$/);
    if (defaultMatch) {
      const [, mainExpr, defaultValue] = defaultMatch;
      const mainValue = this.evaluateExpression(mainExpr, context, template);
      return this.isTruthy(mainValue) ? mainValue : defaultValue;
    }

    // Handle filters: "value | lowercase" or "array | join(', ')"
    const filterMatch = trimmed.match(/^(.+?)\s*\|\s*(\w+)(?:\(['"]([^'"]*)['"]\))?$/);
    if (filterMatch) {
      const [, mainExpr, filterName, filterArg] = filterMatch;
      const mainValue = this.evaluateExpression(mainExpr, context, template);
      return this.applyFilter(mainValue, filterName, filterArg);
    }

    // Handle dot notation: "figma.component_name"
    if (trimmed.includes('.')) {
      return this.getNestedProperty(context, trimmed);
    }

    // Handle direct context access
    return context[trimmed];
  }

  /**
   * Get nested property using dot notation
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Apply template filters
   */
  applyFilter(value, filterName, arg) {
    if (value === null || value === undefined) {return value;}

    switch (filterName) {
    case 'lowercase':
      return String(value).toLowerCase();
    case 'uppercase':
      return String(value).toUpperCase();
    case 'capitalize':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    case 'join':
      return Array.isArray(value) ? value.join(arg || ', ') : value;
    case 'length':
      return Array.isArray(value) ? value.length : String(value).length;
    case 'replace':
      return String(value).replace(/ /g, arg || '-');
    case 'date':
      // Handle date formatting
      if (value === 'now') {
        const now = new Date();
        return arg ? now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : now.toISOString().split('T')[0];
      }
      return value;
    case 'multiply': {
      // Handle mathematical operations like confidence * 100
      const multiplier = parseFloat(arg) || 100;
      return Math.round(parseFloat(value) * multiplier);
    }
    case 'default':
      // Handle default values
      return this.isTruthy(value) ? value : arg;
    default:
      return value;
    }
  }

  /**
   * Check if value is truthy for conditionals
   */
  isTruthy(value) {
    if (value === null || value === undefined) {return false;}
    if (typeof value === 'string') {return value.trim().length > 0;}
    if (Array.isArray(value)) {return value.length > 0;}
    if (typeof value === 'object') {return Object.keys(value).length > 0;}
    return Boolean(value);
  }

  /**
   * Create fallback template when no specific template is found
   */
  createFallbackTemplate(platform, documentType, techStack) {
    return {
      meta: {
        platform,
        document_type: documentType,
        tech_stack: techStack,
        version: '1.0.0',
        status: 'fallback',
        last_updated: new Date().toISOString()
      },
      template: {
        title: `{{ figma.component_name }} ${documentType}`,
        description: `${documentType} for {{ figma.component_name }} component`,
        content: `
# {{ figma.component_name }} ${documentType}

## Overview
This is a ${documentType} for the {{ figma.component_name }} component.

## Details
- **Platform**: ${platform}
- **Tech Stack**: ${techStack}
- **Component**: {{ figma.component_name }}

## Implementation Notes
Please customize this template for your specific needs.

## Resources
- Figma Design: {{ figma.url }}
- Repository: {{ project.repository }}
        `.trim()
      }
    };
  }

  /**
   * List all available templates in the system
   */
  async listAvailableTemplates() {
    const templates = [];

    try {
      // Scan platform templates
      const platformsDir = join(this.configDir, 'platforms');
      const platforms = await readdir(platformsDir, { withFileTypes: true });

      for (const platform of platforms) {
        if (platform.isDirectory()) {
          const platformDir = join(platformsDir, platform.name);
          const files = await readdir(platformDir);

          for (const file of files) {
            if (file.endsWith('.yml')) {
              const documentType = file.replace('.yml', '');
              templates.push({
                type: 'platform',
                platform: platform.name,
                documentType,
                path: `platforms/${platform.name}/${file}`
              });
            }
          }
        }
      }

      // Scan tech-stack templates
      const techStacksDir = join(this.configDir, 'tech-stacks');
      const techStacks = await readdir(techStacksDir, { withFileTypes: true });

      for (const techStack of techStacks) {
        if (techStack.isDirectory()) {
          const techStackDir = join(techStacksDir, techStack.name);
          const files = await readdir(techStackDir);

          for (const file of files) {
            if (file.endsWith('.yml')) {
              const documentType = file.replace('.yml', '');
              templates.push({
                type: 'tech-stack',
                techStack: techStack.name,
                documentType,
                path: `tech-stacks/${techStack.name}/${file}`
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to list templates:', error);
    }

    return templates;
  }

  /**
   * Clear caches
   */
  clearCache() {
    this.templateCache.clear();
    this.resolvedCache.clear();
  }

  /**
   * Enrich context with base template variables for rendering
   */
  enrichContextWithTemplate(context, template) {
    // If template has merged base template data, add it to context
    if (template?.template) {
      const enrichedContext = { ...context };

      console.log('🔍 CONTEXT ENRICHMENT DEBUG - Input Context:');
      console.log('  📊 Input context keys:', Object.keys(context));
      console.log('  📋 Figma context:', JSON.stringify(context.figma || {}, null, 2));
      console.log('  🏗️ Project context:', JSON.stringify(context.project || {}, null, 2));
      console.log('  📊 Calculated context:', JSON.stringify(context.calculated || {}, null, 2));
      console.log('  👥 Org context:', JSON.stringify(context.org || {}, null, 2));
      console.log('  🔧 Base template keys:', Object.keys(template.template));

      // Add base template variables to context
      if (template.template.resources) {
        console.log('  🔗 Processing base template resources...');
        // Resolve template variables in resources
        enrichedContext.resources = template.template.resources.map((resource, index) => {
          const resolvedResource = {
            ...resource,
            link: this.substituteVariables(resource.link, context),
            type: this.substituteVariables(resource.type, context),
            notes: this.substituteVariables(resource.notes, context)
          };
          console.log(`    Resource ${index + 1}: ${resource.type} -> ${resolvedResource.link}`);
          return resolvedResource;
        });
        console.log(`  ✅ Resolved ${enrichedContext.resources.length} resources`);
      }

      if (template.template.variables) {
        console.log('  📝 Processing base template variables...');
        // Merge base template variables but don't override context data
        enrichedContext.base_variables = template.template.variables;
        console.log('  📝 Base variables keys:', Object.keys(template.template.variables));

        // Log some key variables for debugging
        if (template.template.variables.figma_url) {
          const resolved = this.substituteVariables(template.template.variables.figma_url, context);
          console.log(`    figma_url: "${template.template.variables.figma_url}" -> "${resolved}"`);
        }
        if (template.template.variables.github_url) {
          const resolved = this.substituteVariables(template.template.variables.github_url, context);
          console.log(`    github_url: "${template.template.variables.github_url}" -> "${resolved}"`);
        }
      }

      if (template.template.design) {
        console.log('  🎨 Adding base template design data...');
        enrichedContext.design = template.template.design;
        console.log('    Design keys:', Object.keys(template.template.design));
      }

      if (template.template.authoring) {
        console.log('  📝 Merging base template authoring data...');
        enrichedContext.authoring = {
          ...template.template.authoring,
          ...enrichedContext.authoring
        };
        console.log('    Authoring keys:', Object.keys(enrichedContext.authoring));
      }

      console.log('🔄 CONTEXT ENRICHMENT COMPLETE');
      console.log('  📊 Final enriched context keys:', Object.keys(enrichedContext));
      console.log('  🔗 Resources count:', enrichedContext.resources?.length || 0);
      console.log('  📝 Base variables available:', !!enrichedContext.base_variables);
      console.log('  🎨 Design data available:', !!enrichedContext.design);
      console.log('  📝 Authoring data available:', !!enrichedContext.authoring);

      return enrichedContext;
    }

    console.log('⚠️ No base template data found for enrichment');
    return context;
  }

  /**
   * Merge template with base template if it inherits from base
   */
  async mergeWithBase(template) {
    // Check if template inherits from base
    if (!template?.meta?.inherits_from || template.meta.inherits_from !== 'base.yml') {
      return template;
    }

    try {
      // Load base template
      const basePath = join(this.configDir, 'template_configs/base.yml');
      const baseTemplate = await this.loadTemplate(basePath);

      if (!baseTemplate?.template) {
        console.warn('Base template not found or invalid structure, using template as-is');
        return template;
      }

      console.log('🔄 Merging template with base template');
      console.log('Base template keys:', Object.keys(baseTemplate.template));
      console.log('Platform template keys:', Object.keys(template.template || {}));

      // Deep merge base template with current template
      const mergedTemplate = {
        ...template,
        template: this.deepMerge(
          baseTemplate.template,
          template.template || {}
        )
      };

      console.log('✅ Template merge completed');
      console.log('Merged template keys:', Object.keys(mergedTemplate.template));

      return mergedTemplate;
    } catch (error) {
      console.error('❌ Failed to merge with base template:', error.message);
      console.error('Error details:', error);
      return template;
    }
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    // Handle null/undefined cases
    if (!target && !source) {return {};}
    if (!target) {return { ...source };}
    if (!source) {return { ...target };}

    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      templateCache: this.templateCache.size,
      resolvedCache: this.resolvedCache.size,
      lastCleared: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const universalTemplateEngine = new UniversalTemplateEngine();
export default UniversalTemplateEngine;