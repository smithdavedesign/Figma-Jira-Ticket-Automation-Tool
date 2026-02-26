/**
 * POST /api/retry-wiki
 *
 * Retries creation of a specific wiki page (Implementation Plan or QA Test Case)
 * using content that was already generated but failed to persist during the main flow.
 *
 * Body: { type: 'wiki'|'qa', title, content, spaceKey, parentId }
 * Response: { success: true, url, pageId }  |  { success: false, error }
 */

import { Logger } from '../../core/utils/logger.js';

export class RetryWikiRoutes {
  constructor(serviceContainer) {
    this.logger = new Logger('RetryWikiRoutes');
    this.sc = serviceContainer;
  }

  registerRoutes(router) {
    router.post('/api/retry-wiki', this.handleRetry.bind(this));
  }

  async handleRetry(req, res) {
    const { type = 'wiki', title, content, spaceKey, parentId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'title and content are required' });
    }

    this.logger.info(`🔁 Retry request — type: ${type}, title: "${title}", contentLength: ${content.length}`);

    try {
      const mcpAdapter = this.sc.get('mcpAdapter');

      // Directly reuse the existing createWikiPage which already has the
      // stub+update fallback strategy for large-content timeout scenarios.
      const result = await mcpAdapter.createWikiPage(title, content, spaceKey, parentId);

      // Extract URL from the various response shapes Confluence MCP can return
      let url = null;
      if (result?.page?.url) {
        url = result.page.url;
      } else if (result?.url) {
        url = result.url;
      } else if (result?.page?._links?.base && result?.page?._links?.webui) {
        url = `${result.page._links.base.replace(/\/+$/, '')}${result.page._links.webui}`;
      } else if (result?._links?.base && result?._links?.webui) {
        url = `${result._links.base.replace(/\/+$/, '')}${result._links.webui}`;
      }

      const pageId = result?.id || result?.page?.id || null;

      this.logger.info(`✅ Retry succeeded — type: ${type}, pageId: ${pageId}, url: ${url}`);
      res.json({ success: true, url, pageId });

    } catch (error) {
      this.logger.error(`❌ Retry failed — type: ${type}`, { message: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
