/**
 * AI Configuration
 *
 * Configuration for AI providers with Dataiku OpenAI-compatible endpoint
 * and fallback strategies.
 */

export const aiConfig = {
  // AI system enabled
  enabled: true,

  // Primary AI provider
  primaryProvider: 'dataiku',

  // Provider configurations
  providers: {
    dataiku: {
      enabled: Boolean(process.env.DATAIKU_API_KEY && process.env.DATAIKU_HOST && process.env.DATAIKU_PROJECT_KEY),
      apiKey: process.env.DATAIKU_API_KEY,
      host: process.env.DATAIKU_HOST,
      projectKey: process.env.DATAIKU_PROJECT_KEY,
      model: process.env.DATAIKU_MODEL || 'gpt-4o-mini',
      maxTokens: 8192,
      temperature: 0,
      vision: {
        enabled: true,
        model: process.env.DATAIKU_MODEL || 'gpt-4o-mini'
      }
    }
  },

  // Fallback strategy
  fallback: {
    enabled: true,
    strategy: 'waterfall', // 'waterfall' or 'round-robin'
    order: ['dataiku', 'standard']
  },

  // Rate limiting
  rateLimits: {
    dataiku: {
      requestsPerMinute: 60,
      tokensPerDay: 100000
    }
  },

  // Template system
  templates: {
    enabled: true,
    useHandlebars: true,
    platforms: ['jira'],
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