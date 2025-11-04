/**
 * AI Prompt Manager
 *
 * Handles AI reasoning prompts separately from output templates.
 * Focused on intelligence extraction and analysis, not formatting.
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AIPromptManager {
  constructor(promptsDir) {
    this.promptsDir = promptsDir || join(__dirname, 'templates');
    this.promptCache = new Map();
    this.prompts = {};
  }

  /**
   * Initialize the prompt manager by loading available prompts
   */
  async initialize() {
    console.log('🧠 Initializing AI Prompt Manager...');

    try {
      // Load visual analysis prompt
      const visualAnalysisPath = join(this.promptsDir, 'visual-analysis.yml');
      this.prompts['comprehensive-visual-analysis'] = await this.loadPrompt(visualAnalysisPath);

      // Load component architecture prompt
      const componentArchPath = join(this.promptsDir, 'component-architecture.yml');
      this.prompts['component-architecture-analysis'] = await this.loadPrompt(componentArchPath);

      console.log(`✅ Loaded ${Object.keys(this.prompts).length} AI reasoning prompts`);
    } catch (error) {
      console.error('❌ Failed to initialize AI Prompt Manager:', error);
      throw error;
    }
  }

  /**
   * Load and render AI reasoning prompt
   */
  async getReasoningPrompt(promptType, context) {
    console.log(`🧠 Loading reasoning prompt: ${promptType}`);

    try {
      // Check if prompt is already loaded
      if (!this.prompts[promptType]) {
        throw new Error(`Prompt type '${promptType}' not found. Available: ${Object.keys(this.prompts).join(', ')}`);
      }

      const promptTemplate = this.prompts[promptType];

      if (!promptTemplate?.prompt_template) {
        throw new Error(`Prompt template ${promptType} missing content`);
      }

      // Render prompt with context
      const renderedPrompt = this.renderPromptTemplate(promptTemplate.prompt_template, context);

      console.log(`✅ Reasoning prompt loaded: ${promptType}`, {
        promptLength: renderedPrompt.length,
        contextKeys: Object.keys(context)
      });

      return {
        prompt: renderedPrompt,
        metadata: {
          promptType,
          version: promptTemplate.meta?.version,
          purpose: promptTemplate.meta?.purpose,
          lastUpdated: promptTemplate.meta?.last_updated
        }
      };

    } catch (error) {
      console.error(`❌ Failed to load reasoning prompt ${promptType}:`, error);
      throw error;
    }
  }

  /**
   * Load prompt from file
   */
  async loadPrompt(promptPath) {
    if (this.promptCache.has(promptPath)) {
      return this.promptCache.get(promptPath);
    }

    try {
      const content = await readFile(promptPath, 'utf-8');
      const prompt = yaml.load(content);

      this.promptCache.set(promptPath, prompt);
      return prompt;
    } catch (error) {
      console.error(`Failed to load prompt from ${promptPath}:`, error);
      throw error;
    }
  }

  /**
   * Simple template rendering for prompts
   */
  renderPromptTemplate(template, context) {
    let rendered = template;

    // Handle simple variable substitution: {{ variable }}
    rendered = rendered.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, expression) => {
      const value = this.evaluateExpression(expression.trim(), context);
      return value !== null && value !== undefined ? String(value) : '';
    });

    // Handle conditionals: {% if condition %} content {% endif %}
    rendered = rendered.replace(/\{%\s*if\s+([^%]+)\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/g,
      (match, condition, ifContent) => {
        const value = this.evaluateExpression(condition.trim(), context);
        return this.isTruthy(value) ? this.renderPromptTemplate(ifContent, context) : '';
      }
    );

    // Handle loops: {% for item in array %} content {% endfor %}
    rendered = rendered.replace(/\{%\s*for\s+(\w+)\s+in\s+([^%]+)\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/g,
      (match, itemVar, arrayExpr, content) => {
        const array = this.evaluateExpression(arrayExpr.trim(), context);
        if (!Array.isArray(array) || array.length === 0) {return '';}

        return array.map(item => {
          const itemContext = { ...context, [itemVar]: item };
          return this.renderPromptTemplate(content, itemContext);
        }).join('');
      }
    );

    return rendered;
  }

  /**
   * Evaluate expressions in prompt templates
   */
  evaluateExpression(expression, context) {
    // Handle fallback syntax: "value || 'default'"
    if (expression.includes('||')) {
      const parts = expression.split('||').map(part => part.trim());
      for (const part of parts) {
        const value = this.evaluateExpression(part, context);
        if (value !== null && value !== undefined && value !== '') {
          return value;
        }
        // If it's a quoted string, return it as the fallback
        if (part.match(/^['"].*['"]$/)) {
          return part.slice(1, -1); // Remove quotes
        }
      }
      return '';
    }

    // Handle filters: "value | join(', ')"
    const filterMatch = expression.match(/^(.+?)\s*\|\s*(\w+)(?:\(['"]([^'"]*)['"]\))?$/);
    if (filterMatch) {
      const [, mainExpr, filterName, filterArg] = filterMatch;
      const mainValue = this.evaluateExpression(mainExpr.trim(), context);
      return this.applyFilter(mainValue, filterName, filterArg);
    }

    // Handle dot notation: "figma.component_name"
    if (expression.includes('.')) {
      return this.getNestedProperty(context, expression);
    }

    // Direct context access
    return context[expression];
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
   * Apply filters to values
   */
  applyFilter(value, filterName, arg) {
    if (value === null || value === undefined) {return value;}

    switch (filterName) {
    case 'join':
      return Array.isArray(value) ? value.join(arg || ', ') : value;
    case 'length':
      return Array.isArray(value) ? value.length : String(value).length;
    case 'capitalize':
      return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    case 'default':
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
   * Parse JSON response from AI
   */
  parseAIResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, return structured fallback
      return {
        complexity_analysis: {
          level: 'medium',
          reasoning: 'Unable to parse AI response',
          estimated_hours: 6,
          confidence_score: 0.5
        },
        design_intelligence: {
          component_purpose: 'Component analysis incomplete',
          user_interaction_patterns: [],
          design_patterns_used: [],
          responsive_considerations: 'Standard responsive requirements'
        },
        technical_requirements: {
          data_needs: ['props to be determined'],
          state_management: 'local state recommended',
          performance_considerations: ['Standard optimization'],
          integration_challenges: ['Integration review needed']
        },
        accessibility_analysis: {
          aria_requirements: ['Standard ARIA compliance'],
          keyboard_interactions: ['Standard keyboard navigation'],
          screen_reader_considerations: 'Screen reader compatibility required'
        },
        implementation_recommendations: {
          file_structure: ['Component.tsx', 'Component.module.css', 'types.ts'],
          testing_strategy: ['unit', 'integration'],
          potential_gotchas: ['Review implementation details']
        }
      };
    } catch (error) {
      console.warn('Failed to parse AI JSON response:', error);
      return this.parseAIResponse('{}'); // Return fallback
    }
  }

  /**
   * Clear prompt cache
   */
  clearCache() {
    this.promptCache.clear();
  }

  /**
   * Get available prompt types
   */
  async getAvailablePrompts() {
    // For now, return known prompts
    // Could scan directory in production
    return [
      {
        type: 'visual-analysis',
        purpose: 'design-intelligence-extraction',
        description: 'Analyzes Figma designs for complexity, patterns, and technical requirements'
      }
    ];
  }
}

export default AIPromptManager;