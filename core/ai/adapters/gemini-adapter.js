/**
 * 🤖 Gemini AI Adapter - Documentation & Explanations
 *
 * Specialized adapter for Google's Gemini model, optimized for:
 * - Component documentation generation
 * - Design system explanations
 * - User-friendly descriptions
 * - Accessibility documentation
 */

/**
 * @typedef {Object} GeminiConfig
 * @property {string} apiKey - Gemini API key
 * @property {'gemini-pro'|'gemini-pro-vision'} model - Gemini model to use
 * @property {number} temperature - Response creativity (0-1)
 * @property {number} maxTokens - Maximum tokens per request
 * @property {Record<string, string>} [safetySettings] - Safety configuration
 */

/**
 * @typedef {Object} GeminiPromptContext
 * @property {Object} designSpec - Design specification
 * @property {string[]} focusAreas - Areas to focus on
 * @property {'markdown'|'html'|'json'} outputFormat - Output format
 * @property {boolean} includeExamples - Include code examples
 * @property {'developers'|'designers'|'mixed'} audience - Target audience
 */

/**
 * @typedef {Object} DocumentationResult
 * @property {string} overview - System overview
 * @property {Object[]} componentDocs - Component documentation
 * @property {Object[]} patterns - Design patterns documentation
 * @property {Object} accessibility - Accessibility guidelines
 * @property {Object} metadata - Generation metadata
 */

/**
 * @typedef {Object} GeminiResponse
 * @property {string} text - Generated text
 * @property {{inputTokens: number, outputTokens: number}} usage - Token usage
 * @property {string[]} [safetyRatings] - Safety ratings
 */

export class GeminiAdapter {
  /**
   * Create Gemini AI adapter
   * @param {GeminiConfig} config - Gemini configuration
   */
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  /**
   * Generate comprehensive documentation from design spec
   * @param {Object} designSpec - Design specification
   * @param {Object} [options] - Documentation options
   * @returns {Promise<DocumentationResult>} Generated documentation
   */
  async generateDocumentation(designSpec, options = {}) {
    const startTime = Date.now();

    try {
      console.log('📝 Generating documentation with Gemini...');

      // Generate system overview
      const overview = await this.generateSystemOverview(designSpec, options);

      // Generate component documentation
      const componentDocs = await this.generateComponentDocumentation(designSpec, options);

      // Generate pattern documentation
      const patterns = await this.generatePatternDocumentation(designSpec, options);

      // Generate accessibility documentation
      const accessibility = options.includeAccessibility !== false
        ? await this.generateAccessibilityDocumentation(designSpec, options)
        : null;

      // Generate usage examples
      const examples = options.includeUsageExamples
        ? await this.generateUsageExamples(designSpec, options)
        : [];

      const processingTime = Date.now() - startTime;

      return {
        overview,
        componentDocs,
        patterns,
        accessibility,
        examples,
        metadata: {
          model: this.config.model,
          processingTime,
          generatedAt: new Date().toISOString(),
          format: options.format || 'markdown',
          audience: options.audience || 'mixed'
        }
      };

    } catch (error) {
      console.error('❌ Gemini documentation generation failed:', error);
      throw new Error(`Gemini adapter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate component explanations
   * @param {Object[]} components - Components to explain
   * @param {Object} [options] - Generation options
   * @returns {Promise<Object[]>} Component explanations
   */
  async explainComponents(components, options = {}) {
    const explanations = [];

    try {
      for (const component of components.slice(0, 10)) { // Limit to prevent overwhelming
        const explanation = await this.explainSingleComponent(component, options);
        explanations.push(explanation);
      }

      return explanations;

    } catch (error) {
      console.error('❌ Error explaining components:', error);
      throw error;
    }
  }

  /**
   * Generate accessibility guidelines
   * @param {Object} designSpec - Design specification
   * @param {Object} [options] - Generation options
   * @returns {Promise<Object>} Accessibility guidelines
   */
  async generateAccessibilityGuidelines(designSpec, options = {}) {
    try {
      const prompt = this.buildAccessibilityPrompt(designSpec, options);
      const response = await this.callGeminiAPI(prompt);
      return this.parseAccessibilityGuidelines(response.text);

    } catch (error) {
      console.error('❌ Error generating accessibility guidelines:', error);
      throw error;
    }
  }

  /**
   * Generate usage examples
   * @param {Object} designSpec - Design specification
   * @param {Object} [options] - Generation options
   * @returns {Promise<Object[]>} Usage examples
   */
  async generateUsageExamples(designSpec, options = {}) {
    try {
      const prompt = this.buildUsageExamplesPrompt(designSpec, options);
      const response = await this.callGeminiAPI(prompt);
      return this.parseUsageExamples(response.text);

    } catch (error) {
      console.error('❌ Error generating usage examples:', error);
      return [];
    }
  }

  // =============================================================================
  // PRIVATE GENERATION METHODS
  // =============================================================================

  /**
   * Generate system overview documentation
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {Promise<string>} System overview
   */
  async generateSystemOverview(designSpec, options) {
    const prompt = this.buildSystemOverviewPrompt(designSpec, options);
    const response = await this.callGeminiAPI(prompt);
    return response.text;
  }

  /**
   * Generate component documentation
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {Promise<Object[]>} Component documentation
   */
  async generateComponentDocumentation(designSpec, options) {
    const componentDocs = [];
    const components = designSpec.components || [];

    // Process components in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < Math.min(components.length, 20); i += batchSize) {
      const batch = components.slice(i, i + batchSize);
      const batchPrompt = this.buildComponentDocumentationPrompt(batch, options);
      const response = await this.callGeminiAPI(batchPrompt);
      const parsedDocs = this.parseComponentDocumentation(response.text, batch);
      componentDocs.push(...parsedDocs);

      // Add small delay between batches
      if (i + batchSize < components.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return componentDocs;
  }

  /**
   * Generate pattern documentation
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {Promise<Object[]>} Pattern documentation
   */
  async generatePatternDocumentation(designSpec, options) {
    const prompt = this.buildPatternDocumentationPrompt(designSpec, options);
    const response = await this.callGeminiAPI(prompt);
    return this.parsePatternDocumentation(response.text);
  }

  /**
   * Generate accessibility documentation
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Accessibility documentation
   */
  async generateAccessibilityDocumentation(designSpec, options) {
    const prompt = this.buildAccessibilityDocumentationPrompt(designSpec, options);
    const response = await this.callGeminiAPI(prompt);
    return this.parseAccessibilityDocumentation(response.text);
  }

  /**
   * Explain a single component in detail
   * @private
   * @param {Object} component - Component to explain
   * @param {Object} options - Explanation options
   * @returns {Promise<Object>} Component explanation
   */
  async explainSingleComponent(component, options) {
    const prompt = this.buildComponentExplanationPrompt(component, options);
    const response = await this.callGeminiAPI(prompt);
    return {
      componentId: component.id,
      name: component.name,
      explanation: response.text,
      generatedAt: new Date().toISOString()
    };
  }

  // =============================================================================
  // PROMPT BUILDING METHODS
  // =============================================================================

  /**
   * Build system overview prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {string} Generated prompt
   */
  buildSystemOverviewPrompt(designSpec, options) {
    const audience = options.audience || 'mixed';
    const format = options.format || 'markdown';

    return `Generate a comprehensive system overview for this design system:

SYSTEM INFORMATION:
- Purpose: ${designSpec.context?.intent?.purpose || 'UI Design System'}
- Platform: ${designSpec.context?.technical?.platform || 'Web'}
- Components: ${designSpec.components?.length || 0}
- Design System: ${designSpec.designSystem?.detected?.system || 'Custom'}
- Complexity: ${(designSpec.context?.quality?.complexity || 0.5) * 100}%

TARGET AUDIENCE: ${audience}
OUTPUT FORMAT: ${format}

Please create an overview that includes:
1. System purpose and goals
2. Architecture overview
3. Key design principles
4. Component categories
5. Usage guidelines
6. Getting started information

Make it ${audience === 'developers' ? 'technical and implementation-focused' :
    audience === 'designers' ? 'design-focused with visual emphasis' :
      'accessible to both developers and designers'}.

Format the response in ${format}.`;
  }

  /**
   * Build component documentation prompt
   * @private
   * @param {Object[]} components - Components to document
   * @param {Object} options - Generation options
   * @returns {string} Generated prompt
   */
  buildComponentDocumentationPrompt(components, options) {
    const audience = options.audience || 'mixed';
    const format = options.format || 'markdown';

    const componentSummary = components.map(comp =>
      `- ${comp.name} (${comp.type}): ${comp.semantic?.intent || 'component'} - ${comp.semantic?.role || 'interactive'}`
    ).join('\n');

    return `Generate detailed documentation for these components:

COMPONENTS:
${componentSummary}

TARGET AUDIENCE: ${audience}
OUTPUT FORMAT: ${format}

For each component, provide:
1. Purpose and description
2. When to use it
3. Key features and behavior
4. Accessibility considerations
5. Implementation notes
${options.includeUsageExamples ? '6. Usage examples' : ''}

Make the documentation ${audience === 'developers' ? 'implementation-focused with technical details' :
    audience === 'designers' ? 'design-focused with usage guidelines' :
      'comprehensive for both developers and designers'}.

Format as ${format} with clear sections for each component.`;
  }

  /**
   * Build pattern documentation prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {string} Generated prompt
   */
  buildPatternDocumentationPrompt(designSpec, options) {
    const format = options.format || 'markdown';

    return `Document the design patterns used in this system:

DESIGN CONTEXT:
- Components: ${designSpec.components?.length || 0}
- Design System: ${designSpec.designSystem?.detected?.system || 'Custom'}
- Complexity: ${(designSpec.context?.quality?.complexity || 0.5) * 100}%

Identify and document patterns in these areas:
1. Layout patterns (grid, flexbox, spacing)
2. Component composition patterns
3. State management patterns
4. Interaction patterns
5. Responsive design patterns

For each pattern, provide:
- Pattern name and description
- When to use it
- Benefits and considerations
- Implementation guidelines
- Examples from the system

Format as ${format} with clear sections.`;
  }

  /**
   * Build accessibility documentation prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {string} Generated prompt
   */
  buildAccessibilityDocumentationPrompt(designSpec, options) {
    const format = options.format || 'markdown';

    return `Generate accessibility documentation for this design system:

ACCESSIBILITY STATUS:
- WCAG Compliance: ${designSpec.accessibility?.compliance?.wcag || 'Unknown'}
- Compliance Score: ${(designSpec.accessibility?.compliance?.score || 0.7) * 100}%
- Components: ${designSpec.components?.length || 0}

Create documentation covering:
1. Accessibility principles and standards
2. Color and contrast guidelines
3. Typography and readability
4. Keyboard navigation
5. Screen reader support
6. Component-specific accessibility features
7. Testing guidelines
8. Common accessibility issues and solutions

Make it practical and actionable for implementation.
Format as ${format}.`;
  }

  /**
   * Build component explanation prompt
   * @private
   * @param {Object} component - Component to explain
   * @param {Object} options - Explanation options
   * @returns {string} Generated prompt
   */
  buildComponentExplanationPrompt(component, options) {
    const audience = options.audience || 'mixed';

    return `Explain this UI component in detail:

COMPONENT DETAILS:
- Name: ${component.name}
- Type: ${component.type}
- Category: ${component.category}
- Intent: ${component.semantic?.intent || 'unknown'}
- Role: ${component.semantic?.role || 'unknown'}
- Dimensions: ${component.visual?.dimensions?.width}x${component.visual?.dimensions?.height}

TARGET AUDIENCE: ${audience}

Provide a comprehensive explanation including:
1. What this component is and its purpose
2. When and how to use it
3. Key design decisions and rationale
4. Accessibility considerations
5. Implementation notes
${options.includeExamples ? '6. Usage examples' : ''}

Write in a clear, ${audience === 'developers' ? 'technical' :
    audience === 'designers' ? 'design-focused' :
      'accessible'} tone.`;
  }

  /**
   * Build accessibility prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {string} Generated prompt
   */
  buildAccessibilityPrompt(designSpec, options) {
    return `Generate accessibility guidelines for this design system:

CURRENT ACCESSIBILITY:
- WCAG Level: ${designSpec.accessibility?.compliance?.wcag || 'Unknown'}
- Score: ${(designSpec.accessibility?.compliance?.score || 0.7) * 100}%
- Issues: ${designSpec.accessibility?.issues?.length || 0}

Provide guidelines covering:
1. Color contrast requirements
2. Typography accessibility
3. Keyboard navigation
4. Screen reader support
5. Touch target sizes
6. Motion and animation considerations

Format as actionable guidelines with examples.`;
  }

  /**
   * Build usage examples prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {Object} options - Generation options
   * @returns {string} Generated prompt
   */
  buildUsageExamplesPrompt(designSpec, options) {
    const framework = designSpec.context?.technical?.framework || 'React';

    return `Generate usage examples for this design system:

TECHNICAL CONTEXT:
- Framework: ${framework}
- Components: ${designSpec.components?.length || 0}
- Platform: ${designSpec.context?.technical?.platform || 'Web'}

Create practical examples showing:
1. Basic component usage
2. Component composition
3. Common patterns
4. Responsive usage
5. Accessibility implementations

Provide code examples in ${framework} format.
Make examples realistic and practical.`;
  }

  // =============================================================================
  // PARSING METHODS
  // =============================================================================

  /**
   * Parse component documentation from response
   * @private
   * @param {string} text - Response text
   * @param {Object[]} components - Original components
   * @returns {Object[]} Parsed documentation
   */
  parseComponentDocumentation(text, components) {
    // Split documentation by component
    const sections = text.split(/#{1,3}\s+(?=\w)/);

    return components.map((component, index) => ({
      componentId: component.id,
      name: component.name,
      documentation: sections[index + 1] || sections[0] || 'Documentation not available',
      generatedAt: new Date().toISOString()
    }));
  }

  /**
   * Parse pattern documentation from response
   * @private
   * @param {string} text - Response text
   * @returns {Object[]} Parsed patterns
   */
  parsePatternDocumentation(text) {
    // Extract pattern sections
    const patternSections = text.split(/#{1,3}\s+(?=[\w\s]+Pattern|Layout|Component)/i);

    return patternSections.slice(1).map((section, index) => ({
      id: `pattern-${index + 1}`,
      content: section.trim(),
      type: 'pattern',
      generatedAt: new Date().toISOString()
    }));
  }

  /**
   * Parse accessibility documentation from response
   * @private
   * @param {string} text - Response text
   * @returns {Object} Parsed accessibility documentation
   */
  parseAccessibilityDocumentation(text) {
    return {
      guidelines: text,
      sections: this.extractAccessibilitySections(text),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Parse accessibility guidelines from response
   * @private
   * @param {string} text - Response text
   * @returns {Object} Parsed guidelines
   */
  parseAccessibilityGuidelines(text) {
    return {
      overview: text,
      guidelines: this.extractGuidelines(text),
      checklist: this.extractChecklist(text),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Parse usage examples from response
   * @private
   * @param {string} text - Response text
   * @returns {Object[]} Parsed examples
   */
  parseUsageExamples(text) {
    // Extract code blocks
    const codeBlocks = text.match(/```[\s\S]*?```/g) || [];

    return codeBlocks.map((block, index) => ({
      id: `example-${index + 1}`,
      code: block.replace(/```\w*\n?|\n?```/g, ''),
      description: this.extractExampleDescription(text, block),
      language: this.extractLanguage(block),
      generatedAt: new Date().toISOString()
    }));
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Call Gemini API with prompt
   * @private
   * @param {string} prompt - Prompt to send
   * @returns {Promise<GeminiResponse>} API response
   */
  async callGeminiAPI(prompt) {
    const url = `${this.baseUrl}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens
        },
        safetySettings: this.config.safetySettings || []
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const candidate = data.candidates[0];

    return {
      text: candidate.content.parts[0].text,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount || 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount || 0
      },
      safetyRatings: candidate.safetyRatings || []
    };
  }

  /**
   * Extract accessibility sections from text
   * @private
   * @param {string} text - Text to parse
   * @returns {Object[]} Extracted sections
   */
  extractAccessibilitySections(text) {
    const sections = text.split(/#{1,3}\s+/);
    return sections.slice(1).map((section, index) => ({
      id: `accessibility-${index + 1}`,
      title: section.split('\n')[0],
      content: section.split('\n').slice(1).join('\n').trim()
    }));
  }

  /**
   * Extract guidelines from text
   * @private
   * @param {string} text - Text to parse
   * @returns {string[]} Extracted guidelines
   */
  extractGuidelines(text) {
    const guidelines = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.match(/^[-*]\s+/) || line.match(/^\d+\.\s+/)) {
        guidelines.push(line.replace(/^[-*\d.]\s*/, '').trim());
      }
    }

    return guidelines;
  }

  /**
   * Extract checklist from text
   * @private
   * @param {string} text - Text to parse
   * @returns {Object[]} Extracted checklist items
   */
  extractChecklist(text) {
    const checklist = [];
    const checklistMatch = text.match(/checklist[\s\S]*?(?=\n#|\n\n|$)/i);

    if (checklistMatch) {
      const lines = checklistMatch[0].split('\n');
      for (const line of lines) {
        if (line.match(/^[-*☐☑]\s+/)) {
          checklist.push({
            item: line.replace(/^[-*☐☑]\s*/, '').trim(),
            checked: line.includes('☑')
          });
        }
      }
    }

    return checklist;
  }

  /**
   * Extract example description from text
   * @private
   * @param {string} text - Full text
   * @param {string} codeBlock - Code block
   * @returns {string} Example description
   */
  extractExampleDescription(text, codeBlock) {
    const blockIndex = text.indexOf(codeBlock);
    if (blockIndex === -1) {return 'Code example';}

    // Look for description before the code block
    const beforeBlock = text.substring(0, blockIndex);
    const lines = beforeBlock.split('\n');

    // Find the last non-empty line before the code block
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line && !line.startsWith('#') && !line.startsWith('```')) {
        return line;
      }
    }

    return 'Code example';
  }

  /**
   * Extract language from code block
   * @private
   * @param {string} codeBlock - Code block
   * @returns {string} Detected language
   */
  extractLanguage(codeBlock) {
    const langMatch = codeBlock.match(/```(\w+)/);
    return langMatch ? langMatch[1] : 'javascript';
  }
}