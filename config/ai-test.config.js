/**
 * AI Test Configuration
 *
 * Test mode configuration that mocks AI responses to avoid API calls during testing
 */

export const aiTestConfig = {
  // AI system in test mode
  enabled: true,
  testMode: true,

  // Primary AI provider (mocked)
  primaryProvider: 'mock',

  // Mock provider configuration
  providers: {
    mock: {
      enabled: true,
      apiKey: 'test-key',
      model: 'mock-model',
      maxTokens: 8192,
      temperature: 0.7,
      vision: {
        enabled: true,
        model: 'mock-vision-model'
      }
    }
  },

  // Mock responses for testing
  mockResponses: {
    default: {
      success: true,
      data: {
        title: 'Mock Generated Ticket',
        description: 'This is a mock description generated for testing purposes.',
        priority: 'Medium',
        storyPoints: 3,
        acceptanceCriteria: [
          'Component renders correctly',
          'Responsive design works on mobile',
          'Accessibility requirements met'
        ],
        technicalNotes: 'Mock technical implementation notes',
        complexity: 'medium',
        designAnalysis: {
          colors: ['#007BFF', '#6C757D'],
          typography: ['Roboto', '16px'],
          layout: 'Flexbox grid system'
        }
      }
    },
    error: {
      success: false,
      error: 'Mock API error for testing error handling'
    },
    timeout: {
      success: false,
      error: 'Mock timeout for testing timeout handling'
    }
  },

  // Fallback disabled in test mode
  fallback: {
    enabled: false,
    strategy: 'mock',
    order: ['mock']
  },

  // No rate limiting in test mode
  rateLimits: {
    mock: {
      requestsPerMinute: 1000,
      tokensPerDay: 1000000
    }
  },

  // Template system enabled for testing
  templates: {
    enabled: true,
    useHandlebars: true,
    platforms: ['jira', 'github', 'linear', 'notion', 'ui'],
    documentTypes: ['component', 'feature', 'code'],
    techStacks: ['react', 'vue', 'aem', 'generic']
  },

  // Visual analysis mocked
  visual: {
    enabled: true,
    screenshotAnalysis: true,
    colorExtraction: true,
    typographyAnalysis: true,
    layoutAnalysis: true,
    mockData: {
      colors: ['#007BFF', '#6C757D', '#28A745'],
      typography: {
        primary: 'Roboto',
        secondary: 'Arial',
        sizes: ['14px', '16px', '18px', '24px']
      },
      layout: {
        type: 'grid',
        columns: 12,
        breakpoints: ['mobile', 'tablet', 'desktop']
      }
    }
  }
};