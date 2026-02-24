/**
 * Figma Routes — screenshot endpoint only.
 */

import FigmaCoreRoutes from './core.js';
import { BaseRoute } from '../BaseRoute.js';

export class FigmaRoutes extends BaseRoute {
  constructor(serviceContainer) {
    super('Figma', serviceContainer);
    this.coreRoutes = new FigmaCoreRoutes(serviceContainer);
    this.logger.info('✅ Figma routes initialized');
  }

  registerRoutes(router) {
    this.coreRoutes.registerRoutes(router);
    this.logger.info('✅ All Figma routes registered successfully');
  }
}

export default FigmaRoutes;