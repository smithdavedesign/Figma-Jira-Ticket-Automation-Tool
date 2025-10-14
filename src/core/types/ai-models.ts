/**
 * AI Model Types
 * Defines structures for AI ticket generation
 */

// AI Model Configuration
export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'local';
  maxTokens: number;
  supportsVision?: boolean;
}

export interface AIRequest {
  model: string;
  apiKey: string;
  prompt: string;
  template: TicketTemplate;
  frameData: any[]; // Will be properly typed when we import FrameData
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Ticket Templates
export interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  fields: TicketField[];
}

export interface TicketField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

// Pre-defined Templates
export const TICKET_TEMPLATES: { [key: string]: TicketTemplate } = {
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