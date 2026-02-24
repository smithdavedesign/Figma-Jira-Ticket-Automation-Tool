/**
 * Figma Core Routes — screenshot endpoint.
 */

import { BaseFigmaRoute } from './base.js';

export class FigmaCoreRoutes extends BaseFigmaRoute {
  constructor(serviceContainer) {
    super('FigmaCore', serviceContainer);
  }

  registerRoutes(router) {
    router.get('/api/figma/screenshot', this.handleScreenshot.bind(this));
    router.post('/api/figma/screenshot', this.handleScreenshot.bind(this));
    router.get('/api/figma/health', (_req, res) => res.json({ status: 'ok' }));
    this.logger.info('✅ Figma core routes registered');
  }

  /** Unified GET/POST screenshot handler */
  async handleScreenshot(req, res) {
    this.logAccess(req, 'screenshot');
    try {
      const params = { ...req.query, ...req.body };
      const fileKey = params.fileKey || this.extractFileKeyFromURL(params.figmaUrl);
      const nodeId  = params.nodeId  || this.extractNodeIdFromURL(params.figmaUrl);
      const scale   = parseInt(params.scale) || 2;
      const format  = params.format || 'png';

      this.validateRequired({ fileKey, nodeId }, ['fileKey', 'nodeId']);

      // Test mode
      if (fileKey === 'test' || nodeId?.includes('test')) {
        return this.sendSuccess(res, {
          imageUrl: this.mockPng(),
          testMode: true
        }, 'Mock screenshot');
      }

      this.validateServices(['screenshotService']);
      const svc = this.getService('screenshotService');
      const url = params.figmaUrl || `https://www.figma.com/file/${fileKey}`;

      const result = await svc.captureScreenshot(url, nodeId, { scale, format });

      if (!result.success) {
        this.logger.warn('Screenshot capture failed, returning mock:', result.error);
        return this.sendSuccess(res, {
          imageUrl: this.mockPng(),
          fallback: true, originalError: result.error
        }, 'Fallback screenshot');
      }

      this.sendSuccess(res, {
        imageUrl: result.imageUrl,
        dimensions: result.dimensions,
        performance: result.performance
      }, 'Screenshot captured', 200, { fileKey, nodeId, scale, format });
    } catch (error) {
      this.handleFigmaError(error, res, 'capture screenshot');
    }
  }

  mockPng() {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  }
}

export default FigmaCoreRoutes;
