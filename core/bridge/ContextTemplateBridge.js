/**
 * Context-Template Bridge — Lightweight non-AI fallback
 *
 * Extracts Figma design context and renders a YAML-based template when the
 * primary GeminiService is unavailable.
 *
 * Flow: Figma data → ContextManager → UniversalTemplateEngine → formatted doc
 */

import { Logger } from '../utils/logger.js';
import { ContextManager } from '../context/ContextManager.js';
import { UniversalTemplateEngine } from '../template/UniversalTemplateEngine.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class ContextTemplateBridge {
  constructor() {
    this.logger = new Logger('ContextTemplateBridge');
    this.contextManager = new ContextManager();
    this.templateEngine = new UniversalTemplateEngine(
      join(__dirname, '../ai/templates')
    );
  }

  async initialize() {
    await this.contextManager.initialize();
    this.logger.info('ContextTemplateBridge initialized (non-AI fallback)');
  }

  /**
   * Generate documentation from Figma data using YAML templates (no LLM).
   * @param {Object} request - Generation request from the plugin / route
   * @returns {Object} { content, format, strategy, metadata }
   */
  async generateDocumentation(request) {
    const startTime = Date.now();
    const platform = request.platform || request.format || 'jira';
    const documentType = request.documentType || 'component';
    const componentName =
      request.frameData?.[0]?.name ||
      request.enhancedFrameData?.[0]?.name ||
      'Component';

    try {
      // 1. Extract design context via ContextManager
      const figmaData = this._prepareFigmaData(request);
      const contextResult = await this.contextManager.extractContext(figmaData);

      // 2. Build template-friendly variables
      const templateVars = {
        figma: {
          component_name: componentName,
          component_type: contextResult.componentMapping?.components?.[0]?.type || 'UI Component',
          url: request.figmaUrl || '',
          live_link: request.figmaUrl || '',
        },
        project: {
          name: 'Component Library',
          tech_stack: Array.isArray(request.techStack)
            ? request.techStack
            : [request.techStack || 'AEM 6.5'],
        },
        calculated: {
          complexity: 'medium',
          confidence: contextResult.confidence || 0.5,
          story_points: '5',
        },
        design_tokens: {
          colors: (contextResult.styleExtraction?.colors || []).map(c => ({
            name: c.name,
            value: c.hex || c.value,
          })),
          spacing: (contextResult.styleExtraction?.spacing || []).map(s => ({
            name: s.name,
            value: s.value,
          })),
        },
        context: request.context || {},
      };

      // 3. Resolve and render YAML template
      const template = await this.templateEngine.resolveTemplate(platform, documentType, request.techStack || 'custom');
      const rendered = await this.templateEngine.renderTemplate(template, templateVars);

      const content = Array.isArray(rendered)
        ? rendered
        : [{ type: 'text', text: typeof rendered === 'string' ? rendered : JSON.stringify(rendered, null, 2) }];

      return {
        content,
        format: platform,
        strategy: 'context-bridge',
        metadata: {
          source: 'context-bridge',
          architecture: 'figma-api → context-layer → yaml-templates → docs',
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      this.logger.error('Template fallback failed:', error.message);
      return this._fallback(componentName, platform, request, error);
    }
  }

  // ---- Helpers -----------------------------------------------------------

  _prepareFigmaData(request) {
    const rawNodes = request.frameData || request.enhancedFrameData || [];
    const nodes = Array.isArray(rawNodes) ? rawNodes : [];
    return {
      document: {
        id: this._extractFileKey(request.figmaUrl),
        name: 'Document',
        type: 'DOCUMENT',
        children: nodes.length ? nodes : [{ id: 'page-1', name: 'Page 1', type: 'CANVAS', children: nodes }],
      },
      url: request.figmaUrl,
      screenshot: request.screenshot,
    };
  }

  _extractFileKey(url) {
    if (!url) return 'unknown';
    const m = url.match(/\/(file|design)\/([^/?#]+)/);
    return m ? m[2] : 'unknown';
  }

  _fallback(componentName, platform, request, error) {
    const techStack = Array.isArray(request.techStack) ? request.techStack.join(', ') : (request.techStack || 'Not specified');
    return {
      content: [{
        type: 'text',
        text: `# ${componentName} Implementation\n\nImplement the ${componentName} component.\n\n- **Platform**: ${platform}\n- **Tech Stack**: ${techStack}\n\n## Acceptance Criteria\n- [ ] Matches design specs\n- [ ] Responsive\n- [ ] WCAG 2.1 AA\n- [ ] Unit tested\n\n---\n*Generated via fallback (${error.message})*`,
      }],
      format: platform,
      strategy: 'context-bridge-fallback',
      metadata: { error: error.message, fallback: true },
    };
  }
}

export default ContextTemplateBridge;
