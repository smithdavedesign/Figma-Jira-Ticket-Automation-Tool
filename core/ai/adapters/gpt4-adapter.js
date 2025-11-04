/* eslint-disable no-undef, no-unused-vars */
/**
 * 🤖 GPT-4 AI Adapter - Code Generation & Implementation
 *
 * Specialized adapter for OpenAI's GPT-4 model, optimized for:
 * - React/Vue/Angular component generation
 * - TypeScript code with proper typing
 * - Test suite generation
 * - Build configuration and tooling
 */

/**
 * @typedef {Object} GPT4Config
 * @property {string} apiKey - OpenAI API key
 * @property {'gpt-4'|'gpt-4-turbo'|'gpt-4-32k'} model - GPT-4 model to use
 * @property {number} temperature - Response creativity (0-1)
 * @property {number} maxTokens - Maximum tokens per request
 * @property {string} [organization] - OpenAI organization ID
 */

/**
 * @typedef {Object} CodeGenerationOptions
 * @property {'react'|'vue'|'angular'|'svelte'} framework - Frontend framework
 * @property {'typescript'|'javascript'} language - Programming language
 * @property {'css-modules'|'styled-components'|'tailwind'|'scss'} styling - Styling approach
 * @property {boolean} includeTests - Include test files
 * @property {boolean} includeStorybook - Include Storybook stories
 * @property {boolean} includeTypes - Include TypeScript definitions
 * @property {boolean} accessibility - Include accessibility features
 * @property {boolean} responsive - Include responsive design
 */

/**
 * @typedef {Object} CodeGenerationResult
 * @property {Object[]} components - Generated component files
 * @property {Object[]} styles - Generated style files
 * @property {Object[]} tests - Generated test files
 * @property {Object[]} stories - Generated Storybook stories
 * @property {Object[]} types - Generated type definitions
 * @property {Object} buildConfig - Build configuration
 * @property {Object} metadata - Generation metadata
 */

/**
 * @typedef {Object} GPT4Response
 * @property {string} content - Generated content
 * @property {{promptTokens: number, completionTokens: number, totalTokens: number}} usage - Token usage
 * @property {string} finishReason - Completion reason
 */

/**
 * @typedef {Object} ComponentFile
 * @property {string} name - File name
 * @property {string} content - File content
 * @property {string} language - Programming language
 * @property {string} framework - Framework used
 * @property {string[]} dependencies - Required dependencies
 */

export class GPT4Adapter {
  /**
   * Create GPT-4 AI adapter
   * @param {GPT4Config} config - GPT-4 configuration
   */
  constructor(config) {
    this.config = config;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Generate complete code implementation from design spec
   * @param {Object} designSpec - Design specification
   * @param {CodeGenerationOptions} options - Code generation options
   * @returns {Promise<CodeGenerationResult>} Generated code
   */
  async generateCode(designSpec, _options) {
    try {
      console.log(`💻 Generating ${options.framework} code with GPT-4...`);

      // Generate components
      const components = await this.generateComponents(designSpec, _options);

      // Generate styles
      const styles = await this.generateStyles(designSpec, _options);

      // Generate tests if requested
      const tests = options.includeTests
        ? await this.generateTests(components, _options)
        : [];

      // Generate Storybook stories if requested
      const stories = options.includeStorybook
        ? await this.generateStories(components, _options)
        : [];

      // Generate types if requested
      const types = options.includeTypes
        ? await this.generateTypes(designSpec, _options)
        : [];

      // Generate build configuration
      const buildConfig = await this.generateBuildConfig(_options);

      const processingTime = Date.now() - startTime;

      return {
        components,
        styles,
        tests,
        stories,
        types,
        buildConfig,
        metadata: {
          model: this.config.model,
          framework: options.framework,
          language: options.language,
          processingTime,
          generatedAt: new Date().toISOString(),
          totalFiles: components.length + styles.length + tests.length + stories.length + types.length
        }
      };

    } catch (error) {
      console.error('❌ GPT-4 code generation failed:', error);
      throw new Error(`GPT-4 adapter failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate individual component code
   * @param {Object} component - Component specification
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<ComponentFile>} Generated component
   */
  async generateSingleComponent(component, _options) {
    try {
      const prompt = this.buildComponentPrompt(component, _options);
      const response = await this.callGPT4API(prompt);
      return this.parseComponentCode(response.content, component, _options);

    } catch (error) {
      console.error('❌ Error generating component:', error);
      throw error;
    }
  }

  /**
   * Generate test suite for components
   * @param {ComponentFile[]} components - Components to test
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<Object[]>} Generated tests
   */
  async generateTestSuite(components, _options) {
    try {
      const testSuite = [];

      for (const component of _components) {
        const testPrompt = this.buildTestPrompt(component, _options);
        const response = await this.callGPT4API(testPrompt);
        const testFile = this.parseTestCode(response.content, component, _options);
        testSuite.push(testFile);
      }

      return testSuite;

    } catch (error) {
      console.error('❌ Error generating test suite:', error);
      throw error;
    }
  }

  /**
   * Generate TypeScript definitions
   * @param {Object} designSpec - Design specification
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<Object[]>} Generated type definitions
   */
  async generateTypeDefinitions(designSpec, _options) {
    try {
      const prompt = this.buildTypesPrompt(designSpec, _options);
      const response = await this.callGPT4API(prompt);
      return this.parseTypeDefinitions(response.content, _options);

    } catch (error) {
      console.error('❌ Error generating type definitions:', error);
      return [];
    }
  }

  // =============================================================================
  // PRIVATE GENERATION METHODS
  // =============================================================================

  /**
   * Generate all component files
   * @private
   * @param {Object} designSpec - Design specification
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<ComponentFile[]>} Generated components
   */
  async generateComponents(designSpec, _options) {
    const components = [];
    const designComponents = designSpec.components || [];

    // Process components in batches to manage token limits
    const batchSize = 3;
    for (let i = 0; i < Math.min(designComponents.length, 15); i += batchSize) {
      const batch = designComponents.slice(i, i + batchSize);
      const batchPrompt = this.buildComponentBatchPrompt(batch, _options);
      const response = await this.callGPT4API(batchPrompt);
      const parsedComponents = this.parseComponentBatch(response.content, batch, _options);
      components.push(...parsedComponents);

      // Add delay between batches
      if (i + batchSize < designComponents.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return components;
  }

  /**
   * Generate style files
   * @private
   * @param {Object} designSpec - Design specification
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<Object[]>} Generated styles
   */
  async generateStyles(designSpec, _options) {
    const prompt = this.buildStylesPrompt(designSpec, _options);
    const response = await this.callGPT4API(prompt);
    return this.parseStyles(response.content, _options);
  }

  /**
   * Generate test files
   * @private
   * @param {ComponentFile[]} components - Components to test
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<Object[]>} Generated tests
   */
  async generateTests(components, _options) {
    const tests = [];

    for (const component of components.slice(0, 10)) { // Limit tests
      const testPrompt = this.buildTestPrompt(component, _options);
      const response = await this.callGPT4API(testPrompt);
      const testFile = this.parseTestCode(response.content, component, _options);
      tests.push(testFile);

      // Small delay between test generations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return tests;
  }

  /**
   * Generate Storybook stories
   * @private
   * @param {ComponentFile[]} components - Components for stories
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<Object[]>} Generated stories
   */
  async generateStories(components, _options) {
    const stories = [];

    for (const component of components.slice(0, 10)) { // Limit stories
      const storyPrompt = this.buildStoryPrompt(component, _options);
      const response = await this.callGPT4API(storyPrompt);
      const storyFile = this.parseStoryCode(response.content, component, _options);
      stories.push(storyFile);
    }

    return stories;
  }

  /**
   * Generate TypeScript type definitions
   * @private
   * @param {Object} designSpec - Design specification
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<Object[]>} Generated types
   */
  async generateTypes(designSpec, _options) {
    if (options.language !== 'typescript') {return [];}

    const prompt = this.buildTypesPrompt(designSpec, _options);
    const response = await this.callGPT4API(prompt);
    return this.parseTypeDefinitions(response.content, _options);
  }

  /**
   * Generate build configuration
   * @private
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Promise<Object>} Build configuration
   */
  async generateBuildConfig(_options) {
    const prompt = this.buildConfigPrompt(_options);
    const response = await this.callGPT4API(prompt);
    return this.parseBuildConfig(response.content, _options);
  }

  // =============================================================================
  // PROMPT BUILDING METHODS
  // =============================================================================

  /**
   * Build component generation prompt
   * @private
   * @param {Object} component - Component to generate
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {string} Generated prompt
   */
  buildComponentPrompt(component, _options) {
    const framework = options.framework;
    const language = options.language;
    const styling = options.styling;

    return `Generate a ${framework} component in ${language}:

COMPONENT DETAILS:
- Name: ${component.name}
- Type: ${component.type}
- Intent: ${component.semantic?.intent || 'unknown'}
- Category: ${component.category}
- Dimensions: ${component.visual?.dimensions?.width}x${component.visual?.dimensions?.height}

REQUIREMENTS:
- Framework: ${framework}
- Language: ${language}
- Styling: ${styling}
- Accessibility: ${options.accessibility ? 'Required' : 'Optional'}
- Responsive: ${options.responsive ? 'Required' : 'Optional'}

VISUAL PROPERTIES:
- Fills: ${JSON.stringify(component.visual?.fills || [])}
- Strokes: ${JSON.stringify(component.visual?.strokes || [])}
- Effects: ${JSON.stringify(component.visual?.effects || [])}

${component.content?.text ? `TEXT CONTENT: ${JSON.stringify(component.content._text)}` : ''}

Generate a complete, production-ready component with:
1. Proper ${language} typing
2. ${styling} styling implementation
3. ${options.accessibility ? 'ARIA attributes and accessibility features' : 'Basic accessibility'}
4. ${options.responsive ? 'Responsive design implementation' : 'Fixed design'}
5. Props interface
6. Default props
7. Component documentation

Provide only the component code, properly formatted.`;
  }

  /**
   * Build component batch prompt
   * @private
   * @param {Object[]} components - Components to generate
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {string} Generated prompt
   */
  buildComponentBatchPrompt(components, _options) {
    const componentList = components.map(comp =>
      `- ${comp.name} (${comp.type}): ${comp.semantic?.intent || 'component'}`
    ).join('\n');

    return `Generate ${options.framework} components in ${options.language}:

COMPONENTS TO GENERATE:
${componentList}

REQUIREMENTS:
- Framework: ${options.framework}
- Language: ${options.language}
- Styling: ${options.styling}
- Accessibility: ${options.accessibility}
- Responsive: ${options.responsive}

Generate complete, production-ready components with proper structure.
Separate each component clearly with comments indicating the component name.
Include all necessary imports and exports.`;
  }

  /**
   * Build styles generation prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {string} Generated prompt
   */
  buildStylesPrompt(designSpec, _options) {
    const colors = designSpec.designTokens?.colors || [];
    const typography = designSpec.designTokens?.typography || [];

    return `Generate ${options.styling} styles for this design system:

DESIGN TOKENS:
Colors: ${colors.length} tokens
Typography: ${typography.length} tokens

STYLING APPROACH: ${options.styling}
RESPONSIVE: ${options.responsive}

Generate:
1. Color variables/tokens
2. Typography scales
3. Spacing system
4. Component base styles
5. Utility classes (if applicable)
${options.responsive ? '6. Responsive breakpoints' : ''}

Format according to ${options.styling} best practices.`;
  }

  /**
   * Build test generation prompt
   * @private
   * @param {ComponentFile} component - Component to test
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {string} Generated prompt
   */
  buildTestPrompt(component, _options) {
    const testFramework = options.framework === 'react' ? 'Jest + React Testing Library' :
      options.framework === 'vue' ? 'Jest + Vue Test Utils' :
        options.framework === 'angular' ? 'Jasmine + Angular Testing' : 'Jest';

    return `Generate comprehensive tests for this component:

COMPONENT: ${component.name}
FRAMEWORK: ${options.framework}
LANGUAGE: ${options.language}
TEST FRAMEWORK: ${testFramework}

Generate tests covering:
1. Component rendering
2. Props handling
3. User interactions
4. Accessibility features
5. Edge cases
6. Snapshot testing

Use testing best practices for ${options.framework}.
Include proper setup and teardown.
Add descriptive test names and comments.`;
  }

  /**
   * Build Storybook story prompt
   * @private
   * @param {ComponentFile} component - Component for story
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {string} Generated prompt
   */
  buildStoryPrompt(component, _options) {
    return `Generate Storybook story for this component:

COMPONENT: ${component.name}
FRAMEWORK: ${options.framework}
LANGUAGE: ${options.language}

Generate story with:
1. Default story
2. All prop variations
3. Different states
4. Accessibility checks
5. Controls/knobs
6. Documentation

Use Storybook 6+ format with CSF.
Include proper meta configuration.
Add useful controls for interactive testing.`;
  }

  /**
   * Build types generation prompt
   * @private
   * @param {Object} designSpec - Design specification
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {string} Generated prompt
   */
  buildTypesPrompt(designSpec, __options) {
    return `Generate TypeScript type definitions for this design system:

COMPONENTS: ${designSpec.components?.length || 0}
DESIGN TOKENS: Colors (${designSpec.designTokens?.colors?.length || 0}), Typography (${designSpec.designTokens?.typography?.length || 0})

Generate comprehensive types including:
1. Component prop interfaces
2. Design token types
3. Theme interface
4. Event handler types
5. Utility types
6. Enum definitions

Use TypeScript best practices.
Export all types properly.
Include JSDoc comments for complex types.`;
  }

  /**
   * Build build configuration prompt
   * @private
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {string} Generated prompt
   */
  buildConfigPrompt(_options) {
    return `Generate build configuration for ${_options.framework} project:

FRAMEWORK: ${_options.framework}
LANGUAGE: ${_options.language}
STYLING: ${_options.styling}
INCLUDE_TESTS: ${_options.includeTests}
INCLUDE_STORYBOOK: ${_options.includeStorybook}

Generate configuration for:
1. Package.json dependencies
2. Build scripts
3. Development server setup
4. ${options.language === 'typescript' ? 'TypeScript configuration' : 'Babel configuration'}
5. ${options.includeStorybook ? 'Storybook configuration' : ''}
6. ${options.includeTests ? 'Test configuration' : ''}

Provide modern, optimized configuration.`;
  }

  // =============================================================================
  // PARSING METHODS
  // =============================================================================

  /**
   * Parse component code from response
   * @private
   * @param {string} content - GPT-4 response content
   * @param {Object} component - Original component
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {ComponentFile} Parsed component
   */
  parseComponentCode(content, component, _options) {
    const codeBlock = this.extractCodeBlock(content);
    const extension = options.language === 'typescript' ? '.tsx' : '.jsx';

    return {
      name: `${component.name}${extension}`,
      content: codeBlock,
      language: options.language,
      framework: options.framework,
      dependencies: this.extractDependencies(codeBlock, _options),
      componentName: component.name,
      type: 'component'
    };
  }

  /**
   * Parse component batch from response
   * @private
   * @param {string} content - GPT-4 response content
   * @param {Object[]} components - Original components
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {ComponentFile[]} Parsed components
   */
  parseComponentBatch(content, components, _options) {
    // Split content by component boundaries
    const componentSections = this.splitComponentSections(content);

    return components.map((component, _index) => ({
      name: `${component.name}.${options.language === 'typescript' ? 'tsx' : 'jsx'}`,
      content: componentSections[index] || componentSections[0] || '// Component generation failed',
      language: options.language,
      framework: options.framework,
      dependencies: this.extractDependencies(componentSections[index] || '', _options),
      componentName: component.name,
      type: 'component'
    }));
  }

  /**
   * Parse styles from response
   * @private
   * @param {string} content - GPT-4 response content
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Object[]} Parsed styles
   */
  parseStyles(content, _options) {
    const extension = this.getStyleExtension(options.styling);

    return [{
      name: `styles${extension}`,
      content: this.extractCodeBlock(content),
      type: 'styles',
      styling: options.styling
    }];
  }

  /**
   * Parse test code from response
   * @private
   * @param {string} content - GPT-4 response content
   * @param {ComponentFile} component - Component being tested
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Object} Parsed test
   */
  parseTestCode(content, component, _options) {
    const testExtension = options.language === 'typescript' ? '.test.tsx' : '.test.jsx';

    return {
      name: `${component.componentName}${testExtension}`,
      content: this.extractCodeBlock(content),
      language: options.language,
      type: 'test',
      componentName: component.componentName
    };
  }

  /**
   * Parse Storybook story from response
   * @private
   * @param {string} content - GPT-4 response content
   * @param {ComponentFile} component - Component for story
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Object} Parsed story
   */
  parseStoryCode(content, component, _options) {
    const storyExtension = options.language === 'typescript' ? '.stories.tsx' : '.stories.jsx';

    return {
      name: `${component.componentName}${storyExtension}`,
      content: this.extractCodeBlock(content),
      language: options.language,
      type: 'story',
      componentName: component.componentName
    };
  }

  /**
   * Parse type definitions from response
   * @private
   * @param {string} content - GPT-4 response content
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Object[]} Parsed type definitions
   */
  parseTypeDefinitions(content, __options) {
    return [{
      name: 'types.ts',
      content: this.extractCodeBlock(content),
      language: 'typescript',
      type: 'types'
    }];
  }

  /**
   * Parse build configuration from response
   * @private
   * @param {string} content - GPT-4 response content
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {Object} Parsed build config
   */
  parseBuildConfig(content, _options) {
    try {
      const configJSON = this.extractJSON(content);
      return JSON.parse(configJSON);
    } catch (error) {
      return {
        framework: options.framework,
        language: options.language,
        error: 'Failed to parse build configuration'
      };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Call GPT-4 API with prompt
   * @private
   * @param {string} prompt - Prompt to send
   * @returns {Promise<GPT4Response>} API response
   */
  async callGPT4API(prompt) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`GPT-4 API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      finishReason: data.choices[0].finish_reason
    };
  }

  /**
   * Extract code block from response
   * @private
   * @param {string} content - Response content
   * @returns {string} Extracted code
   */
  extractCodeBlock(content) {
    const codeBlockMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
    return codeBlockMatch ? codeBlockMatch[1] : content;
  }

  /**
   * Extract JSON from response
   * @private
   * @param {string} content - Response content
   * @returns {string} Extracted JSON
   */
  extractJSON(content) {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
  }

  /**
   * Extract dependencies from code
   * @private
   * @param {string} code - Component code
   * @param {CodeGenerationOptions} options - Generation options
   * @returns {string[]} Extracted dependencies
   */
  extractDependencies(code, _options) {
    const dependencies = [];

    // Framework dependencies
    if (options.framework === 'react') {
      dependencies.push('react');
      if (code.includes('useState') || code.includes('useEffect')) {
        dependencies.push('react');
      }
    }

    // Styling dependencies
    if (options.styling === 'styled-components' && code.includes('styled')) {
      dependencies.push('styled-components');
    }

    if (options.styling === 'tailwind' && code.includes('className')) {
      dependencies.push('tailwindcss');
    }

    return dependencies;
  }

  /**
   * Split content into component sections
   * @private
   * @param {string} content - Content to split
   * @returns {string[]} Component sections
   */
  splitComponentSections(content) {
    // Split by component boundaries (comments or exports)
    return content.split(/\/\*\*?\s*Component:|\/\/\s*Component:|export\s+(?:default\s+)?(?:function|const|class)/i)
      .filter(section => section.trim().length > 0);
  }

  /**
   * Get file extension for styling approach
   * @private
   * @param {string} styling - Styling approach
   * @returns {string} File extension
   */
  getStyleExtension(styling) {
    const extensionMap = {
      'css-modules': '.module.css',
      'styled-components': '.styles.js',
      'tailwind': '.css',
      'scss': '.scss'
    };
    return extensionMap[styling] || '.css';
  }
}