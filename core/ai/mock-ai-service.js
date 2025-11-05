/**
 * Mock AI Service for Testing
 *
 * Provides mock AI responses to avoid API calls during testing
 */

import { aiTestConfig } from '../config/ai-test.config.js';

export class MockAIService {
  constructor(config = aiTestConfig) {
    this.config = config;
    this.callCount = 0;
    this.responses = config.mockResponses || {};
  }

  /**
     * Mock AI generation with reasoning prompts
     */
  async processWithReasoningPrompts(context, options = {}) {
    this.callCount++;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, options.delay || 10));

    // Handle test scenarios
    if (options.forceError) {
      throw new Error(this.responses.error?.error || 'Mock AI error');
    }

    if (options.forceTimeout) {
      throw new Error(this.responses.timeout?.error || 'Mock timeout');
    }

    // Return mock response
    return {
      success: true,
      data: {
        ...this.responses.default.data,
        context: {
          figma: context.figma || {},
          project: context.project || {},
          calculated: context.calculated || {}
        },
        metadata: {
          provider: 'mock',
          model: this.config.providers.mock.model,
          processingTime: options.delay || 10,
          callCount: this.callCount
        }
      }
    };
  }

  /**
     * Mock template generation
     */
  async generateTicket(figmaData, projectData, options = {}) {
    this.callCount++;

    await new Promise(resolve => setTimeout(resolve, options.delay || 5));

    return {
      success: true,
      ticket: {
        title: `[${projectData.platform || 'UI'}] ${figmaData.component_name || 'Component'} Implementation`,
        description: `Implement ${figmaData.component_name || 'component'} based on Figma design specifications.`,
        priority: options.priority || 'Medium',
        storyPoints: this.calculateMockStoryPoints(figmaData),
        labels: this.generateMockLabels(figmaData, projectData),
        acceptanceCriteria: this.generateMockAcceptanceCriteria(figmaData),
        technicalNotes: this.generateMockTechnicalNotes(figmaData, projectData)
      },
      metadata: {
        provider: 'mock',
        processingTime: options.delay || 5,
        callCount: this.callCount
      }
    };
  }

  /**
     * Mock visual analysis
     */
  async analyzeVisualContext(screenshotData, options = {}) {
    this.callCount++;

    await new Promise(resolve => setTimeout(resolve, options.delay || 15));

    return {
      success: true,
      analysis: {
        colors: this.config.visual.mockData.colors,
        typography: this.config.visual.mockData.typography,
        layout: this.config.visual.mockData.layout,
        components: [
          {
            type: 'button',
            properties: ['primary', 'medium', 'rounded'],
            count: 2
          },
          {
            type: 'input',
            properties: ['text', 'required', 'validation'],
            count: 1
          }
        ],
        complexity: options.complexity || 'medium',
        designSystem: {
          detected: true,
          confidence: 0.85,
          patterns: ['material-ui', 'bootstrap-like']
        }
      },
      metadata: {
        provider: 'mock',
        processingTime: options.delay || 15,
        callCount: this.callCount
      }
    };
  }

  /**
     * Mock error handling
     */
  async testErrorScenarios(scenario = 'default') {
    this.callCount++;

    switch (scenario) {
    case 'network_error':
      throw new Error('Mock network connection failed');
    case 'rate_limit':
      throw new Error('Mock rate limit exceeded');
    case 'invalid_key':
      throw new Error('Mock API key invalid');
    case 'timeout':
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('Mock request timeout');
    default:
      return { success: true, data: 'Mock error test completed' };
    }
  }

  // Helper methods for generating mock data
  calculateMockStoryPoints(figmaData) {
    const complexityMap = {
      simple: 1,
      medium: 3,
      complex: 5,
      advanced: 8
    };
    return complexityMap[figmaData.complexity] || 3;
  }

  generateMockLabels(figmaData, projectData) {
    const labels = ['ui-implementation'];

    if (projectData.techStack?.includes('React')) {
      labels.push('react');
    }
    if (figmaData.component_type) {
      labels.push(figmaData.component_type.toLowerCase());
    }
    if (figmaData.complexity) {
      labels.push(`complexity-${figmaData.complexity}`);
    }

    return labels;
  }

  generateMockAcceptanceCriteria(figmaData) {
    return [
      'Component matches Figma design specifications',
      'Responsive behavior works across all breakpoints',
      'Accessibility requirements (WCAG 2.1 AA) are met',
      'Component is properly tested with unit tests',
      'Design system tokens are used consistently'
    ];
  }

  generateMockTechnicalNotes(figmaData, projectData) {
    const techStack = projectData.techStack?.join(', ') || 'React';
    return `Implementation using ${techStack}. ` +
               'Component should be built with reusability in mind. ' +
               'Consider performance implications for rendering.';
  }

  // Test utilities
  getCallCount() {
    return this.callCount;
  }

  resetCallCount() {
    this.callCount = 0;
  }

  getConfig() {
    return this.config;
  }
}

export default MockAIService;