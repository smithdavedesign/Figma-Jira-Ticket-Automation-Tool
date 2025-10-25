/**
 * AI Configuration
 *
 * Configuration for AI providers including Gemini, Claude, GPT-4
 * and fallback strategies.
 */

export const aiConfig = {
  // AI system enabled
  enabled: true,

  // Primary AI provider
  primaryProvider: 'gemini',

  // Provider configurations
  providers: {
    gemini: {
      enabled: Boolean(process.env.GEMINI_API_KEY),
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-2.5-flash',
      maxTokens: 8192,
      temperature: 0.7,
      vision: {
        enabled: true,
        model: 'gemini-2.5-flash'
      }
    },

    claude: {
      enabled: Boolean(process.env.CLAUDE_API_KEY),
      apiKey: process.env.CLAUDE_API_KEY,
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4096,
      temperature: 0.7
    },

    gpt4: {
      enabled: Boolean(process.env.OPENAI_API_KEY),
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview',
      maxTokens: 4096,
      temperature: 0.7,
      vision: {
        enabled: true,
        model: 'gpt-4-vision-preview'
      }
    }
  },

  // Fallback strategy
  fallback: {
    enabled: true,
    strategy: 'waterfall', // 'waterfall' or 'round-robin'
    order: ['gemini', 'claude', 'gpt4', 'standard']
  },

  // Rate limiting
  rateLimits: {
    gemini: {
      requestsPerMinute: 60,
      tokensPerDay: 100000
    },
    claude: {
      requestsPerMinute: 50,
      tokensPerDay: 50000
    },
    gpt4: {
      requestsPerMinute: 30,
      tokensPerDay: 30000
    }
  },

  // Template system
  templates: {
    enabled: true,
    useHandlebars: true,
    platforms: ['jira', 'github', 'linear', 'notion', 'ui'],
    documentTypes: ['component', 'feature', 'code'],
    techStacks: ['react', 'vue', 'aem', 'generic']
  },

  // Visual analysis
  visual: {
    enabled: true,
    screenshotAnalysis: true,
    colorExtraction: true,
    typographyAnalysis: true,
    layoutAnalysis: true
  }
};