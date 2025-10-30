/**
 * AI Model Types
 * Defines structures for AI ticket generation
 */

/**
 * @typedef {Object} AIModel
 * @property {string} id - Unique identifier for the AI model
 * @property {string} name - Human-readable name
 * @property {'openai'|'anthropic'|'local'} provider - AI service provider
 * @property {number} maxTokens - Maximum tokens per request
 * @property {boolean} [supportsVision] - Whether model supports image input
 */

/**
 * @typedef {Object} AIRequest
 * @property {string} model - Model identifier
 * @property {string} apiKey - API authentication key
 * @property {string} prompt - Input prompt for AI
 * @property {TicketTemplate} template - Template configuration
 * @property {any[]} frameData - Figma frame data (will be properly typed when FrameData is imported)
 */

/**
 * @typedef {Object} AIResponse
 * @property {boolean} success - Whether the request succeeded
 * @property {string} [content] - Generated content from AI
 * @property {string} [error] - Error message if request failed
 * @property {Object} [usage] - Token usage information
 * @property {number} usage.promptTokens - Tokens used in prompt
 * @property {number} usage.completionTokens - Tokens used in completion
 * @property {number} usage.totalTokens - Total tokens used
 */

/**
 * @typedef {Object} TicketTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Template display name
 * @property {string} description - Template description
 * @property {string} prompt - AI prompt template
 * @property {TicketField[]} fields - Template fields configuration
 */

/**
 * @typedef {Object} TicketField
 * @property {string} name - Field name
 * @property {'text'|'textarea'|'select'|'multiselect'} type - Field input type
 * @property {boolean} required - Whether field is required
 * @property {string[]} [options] - Options for select/multiselect fields
 * @property {string} [defaultValue] - Default field value
 */

// Pre-defined Templates
const TICKET_TEMPLATES = {
  component: {
    id: 'component',
    name: 'UI Component',
    description: 'Create a ticket for implementing a UI component',
    prompt: 'Create a detailed implementation ticket for a UI component based on the provided Figma design.',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'acceptanceCriteria', type: 'textarea', required: true },
      { name: 'priority', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'] }
    ]
  },
  feature: {
    id: 'feature',
    name: 'Feature Implementation',
    description: 'Create a ticket for implementing a new feature',
    prompt: 'Create a comprehensive feature implementation ticket based on the provided Figma designs.',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'userStory', type: 'textarea', required: true },
      { name: 'acceptanceCriteria', type: 'textarea', required: true }
    ]
  },
  bug: {
    id: 'bug',
    name: 'Bug Fix',
    description: 'Create a ticket for fixing design inconsistencies',
    prompt: 'Create a bug fix ticket to address design inconsistencies found in the Figma analysis.',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'stepsToReproduce', type: 'textarea', required: true },
      { name: 'expectedBehavior', type: 'textarea', required: true }
    ]
  },
  page: {
    id: 'page',
    name: 'Page/Screen',
    description: 'Create a ticket for implementing a complete page or screen',
    prompt: 'Create a detailed implementation ticket for a complete page or screen based on the Figma design.',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'components', type: 'textarea', required: true },
      { name: 'acceptanceCriteria', type: 'textarea', required: true }
    ]
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'Create a custom ticket with additional instructions',
    prompt: 'Create a ticket based on the provided Figma design and additional custom instructions.',
    fields: [
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'textarea', required: true },
      { name: 'customInstructions', type: 'textarea', required: false }
    ]
  }
};

/**
 * Get all available ticket templates
 * @returns {TicketTemplate[]} Array of ticket templates
 */
function getAllTemplates() {
  return Object.values(TICKET_TEMPLATES);
}

/**
 * Get a specific ticket template by ID
 * @param {string} templateId - Template identifier
 * @returns {TicketTemplate|null} Template or null if not found
 */
function getTemplate(templateId) {
  return TICKET_TEMPLATES[templateId] || null;
}

/**
 * Validate a ticket template
 * @param {TicketTemplate} template - Template to validate
 * @returns {boolean} Whether template is valid
 */
function validateTemplate(template) {
  if (!template || typeof template !== 'object') {return false;}
  if (!template.id || !template.name || !template.prompt) {return false;}
  if (!Array.isArray(template.fields)) {return false;}

  return template.fields.every(field =>
    field.name &&
    field.type &&
    ['text', 'textarea', 'select', 'multiselect'].includes(field.type) &&
    typeof field.required === 'boolean'
  );
}

/**
 * Create a new custom template
 * @param {string} id - Template ID
 * @param {string} name - Template name
 * @param {string} description - Template description
 * @param {string} prompt - AI prompt
 * @param {TicketField[]} fields - Template fields
 * @returns {TicketTemplate} New template
 */
function createTemplate(id, name, description, prompt, fields) {
  const template = {
    id,
    name,
    description,
    prompt,
    fields
  };

  if (!validateTemplate(template)) {
    throw new Error('Invalid template configuration');
  }

  return template;
}

/**
 * Default AI model configurations
 */
const DEFAULT_AI_MODELS = {
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 8192,
    supportsVision: false
  },
  'gpt-4-vision': {
    id: 'gpt-4-vision',
    name: 'GPT-4 Vision',
    provider: 'openai',
    maxTokens: 4096,
    supportsVision: true
  },
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 4096,
    supportsVision: true
  },
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 4096,
    supportsVision: true
  },
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    maxTokens: 32768,
    supportsVision: false
  },
  'gemini-pro-vision': {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'google',
    maxTokens: 16384,
    supportsVision: true
  }
};

/**
 * Get AI model configuration
 * @param {string} modelId - Model identifier
 * @returns {AIModel|null} Model configuration or null if not found
 */
function getAIModel(modelId) {
  return DEFAULT_AI_MODELS[modelId] || null;
}

/**
 * Get all available AI models
 * @returns {AIModel[]} Array of AI model configurations
 */
function getAllAIModels() {
  return Object.values(DEFAULT_AI_MODELS);
}

/**
 * Get AI models by provider
 * @param {'openai'|'anthropic'|'google'} provider - Provider name
 * @returns {AIModel[]} Array of models for the provider
 */
function getModelsByProvider(provider) {
  return Object.values(DEFAULT_AI_MODELS).filter(model => model.provider === provider);
}

module.exports = {
  TICKET_TEMPLATES,
  DEFAULT_AI_MODELS,
  getAllTemplates,
  getTemplate,
  validateTemplate,
  createTemplate,
  getAIModel,
  getAllAIModels,
  getModelsByProvider
};