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
      model: 'gemini-2.0-flash',
      maxTokens: 8192,
      temperature: 0.7,
      vision: {
        enabled: true,
        model: 'gemini-2.0-flash'
      }
    }
  },

  // Fallback strategy
  fallback: {
    enabled: true,
    strategy: 'waterfall', // 'waterfall' or 'round-robin'
    order: ['gemini', 'standard']
  },

  // Rate limiting
  rateLimits: {
    gemini: {
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