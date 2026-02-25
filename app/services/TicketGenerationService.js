/**
 * Ticket Generation Service — Thin wrapper around GeminiService
 *
 * Kept for backward compatibility with WorkItemOrchestrator and other callers.
 * Delegates all generation to GeminiService; falls back to a hardcoded
 * template when the LLM is unavailable.
 */

import { BaseService } from './BaseService.js';

export class TicketGenerationService extends BaseService {
  constructor(geminiService) {
    super('TicketGenerationService');
    this.geminiService = geminiService;
  }

  async onInitialize() {
    this.logger.info('TicketGenerationService ready (delegates to GeminiService)');
  }

  /**
   * Generate a ticket.
   * @param {Object} request  - Generation request (frameData, techStack, platform, etc.)
   * @param {string} _strategy - Ignored; kept for API compatibility.
   * @returns {{ content: string, metadata: Object }}
   */
  async generateTicket(request, _strategy) {
    const componentName =
      request.componentName ||
      request.frameData?.[0]?.name ||
      request.enhancedFrameData?.[0]?.name ||
      'Component';

    try {
      const result = await this.geminiService.generate({
        componentName,
        techStack: request.techStack || 'AEM 6.5',
        platform: request.platform || 'Jira',
        documentType: request.documentType || 'component',
        figmaContext: request.figmaContext,
        frameData: request.frameData,
        enhancedFrameData: request.enhancedFrameData,
        screenshot: request.screenshot,
        fileContext: request.fileContext,
        metadata: request.metadata,
      });

      return {
        content: result.content,
        metadata: {
          ...result.metadata,
          strategy: 'gemini',
          service: 'TicketGenerationService',
        },
      };
    } catch (error) {
      this.logger.error('GeminiService failed, using hardcoded fallback:', error.message);
      return this._hardcodedFallback(componentName, request);
    }
  }

  _hardcodedFallback(componentName, request) {
    const techStack = Array.isArray(request.techStack) ? request.techStack.join(', ') : (request.techStack || 'AEM 6.5');
    return {
      content: `h1. ${componentName} Implementation

h2. Description
Implement the ${componentName} component per Figma design specifications.

h2. Technical Requirements
* *Technology Stack*: ${techStack}
* *Component Type*: UI Component

h2. Acceptance Criteria
* Component matches design specifications
* Responsive across all breakpoints
* WCAG 2.1 AA compliant
* Unit tests > 80% coverage

---
_Generated via fallback (AI unavailable)_`,
      metadata: {
        strategy: 'emergency-fallback',
        service: 'TicketGenerationService',
        error: 'GeminiService unavailable',
      },
    };
  }

  healthCheck() {
    return {
      ...super.healthCheck(),
      geminiAvailable: !!this.geminiService,
    };
  }
}
