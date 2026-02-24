/**
 * Unified Generation Route
 *
 * Single endpoint: POST /api/generate
 * Flow: request → GeminiService → (optional) WorkItemOrchestrator → response
 *
 * Falls back to ContextTemplateBridge (YAML templates) when LLM is unavailable.
 */

import { BaseRoute } from './BaseRoute.js';

export class GenerateRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Generate', serviceContainer);
  }

  registerRoutes(router) {
    router.post('/api/generate', this.asyncHandler(this.handleGenerate.bind(this)));
    this.logger.info('✅ Generate route registered: POST /api/generate');
  }

  /**
   * POST /api/generate — main generation endpoint
   */
  async handleGenerate(req, res) {
    this.logAccess(req, 'generate');

    try {
      const request = this._normalizeRequest(req.body);
      const validation = this._validate(request);
      if (!validation.valid) {
        return this.sendError(res, 'Validation failed', 400, { errors: validation.errors });
      }

      this.logger.info(`Generating ${request.platform}/${request.documentType} for "${request.componentName}"`);

      // ---- Primary path: GeminiService ----------------------------------
      // Snapshot everything we send to the LLM (strip raw base64 screenshot to keep JSON lean)
      const contextSnapshot = {
        sentAt: new Date().toISOString(),
        request: {
          componentName: request.componentName,
          platform: request.platform,
          documentType: request.documentType,
          techStack: request.techStack,
          enableActiveCreation: request.enableActiveCreation,
          fileContext: request.fileContext,
          metadata: request.metadata,
          frameData: request.frameData,
          enhancedFrameData: request.enhancedFrameData,
          // Summarise screenshot rather than embed the full base64
          screenshot: request.screenshot
            ? { provided: true, type: typeof request.screenshot, length: JSON.stringify(request.screenshot).length }
            : null,
        },
      };

      let result;
      try {
        const gemini = this.getService('geminiService');
        const generated = await gemini.generate({
          componentName: request.componentName,
          techStack: request.techStack,
          platform: request.platform,
          documentType: request.documentType,
          figmaContext: request.figmaContext,
          figmaUrl: request.figmaUrl,
          frameData: request.frameData,
          enhancedFrameData: request.enhancedFrameData,
          screenshot: request.screenshot,
          fileContext: request.fileContext,
          metadata: request.metadata,
        });

        result = {
          content: generated.content,
          format: request.platform,
          strategy: 'gemini',
          metadata: { ...generated.metadata, debugContext: contextSnapshot },
        };
      } catch (aiError) {
        this.logger.warn('GeminiService failed, falling back to YAML templates:', aiError.message);

        // ---- Fallback: ContextTemplateBridge (no LLM) -------------------
        const { ContextTemplateBridge } = await import('../../core/bridge/ContextTemplateBridge.js');
        const bridge = new ContextTemplateBridge();
        await bridge.initialize();
        result = await bridge.generateDocumentation(request);
        result.metadata = { ...(result.metadata || {}), debugContext: { ...contextSnapshot, fallbackReason: aiError.message } };
      }

      // ---- Optional: Active creation via WorkItemOrchestrator -----------
      if (request.enableActiveCreation) {
        try {
          const orchestrator = this.getService('workItemOrchestrator', false);
          if (orchestrator) {
            this.logger.info('Routing to WorkItemOrchestrator for active creation');
            const orchResult = await orchestrator.run({
              componentName: request.componentName,
              frameData: request.frameData,
              screenshot: request.screenshot,
              projectKey: request.ticketProjectKey,
              wikiSpace: request.wikiSpace,
              generatedContent: result.content,
              ...request,
            }, {
              enableActiveCreation: true,
              wikiSpace: request.wikiSpace,
              ticketProjectKey: request.ticketProjectKey,
            });

            result.metadata = {
              ...result.metadata,
              activeExecution: true,
              orchestration: orchResult.results,
            };
          }
        } catch (orchError) {
          this.logger.error('Orchestration failed (content still returned):', orchError.message);
          result.metadata = { ...result.metadata, orchestrationError: orchError.message };
        }
      }

      this.sendSuccess(res, result, 'Documentation generated successfully');

    } catch (error) {
      this.logger.error('Generation failed:', error);
      this.sendError(res, 'Generation failed', 500, { error: error.message });
    }
  }

  // ---- Request helpers --------------------------------------------------

  _normalizeRequest(raw) {
    const frameData = raw.enhancedFrameData || raw.frameData || [];
    return {
      frameData,
      enhancedFrameData: raw.enhancedFrameData || frameData,
      componentName: raw.componentName || frameData[0]?.name || 'Component',
      platform: raw.format || raw.platform || 'Jira',
      documentType: raw.documentType || raw.templateType || 'component',
      techStack: raw.techStack || raw.teamStandards?.tech_stack || 'AEM 6.5',
      figmaUrl: raw.figmaUrl,
      screenshot: raw.screenshot,
      fileContext: raw.fileContext,
      figmaContext: raw.figmaContext,
      enableActiveCreation: raw.enableActiveCreation || false,
      wikiSpace: raw.wikiSpace,
      ticketProjectKey: raw.ticketProjectKey,
      context: raw.context,
      metadata: raw.metadata,
    };
  }

  _validate(request) {
    const errors = [];
    const hasData = request.frameData?.length > 0 || request.screenshot || request.figmaUrl;
    if (!hasData) {
      errors.push('At least one of frameData, screenshot, or figmaUrl is required');
    }
    return { valid: errors.length === 0, errors };
  }
}

export default GenerateRoutes;
