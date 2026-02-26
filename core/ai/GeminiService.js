/**
 * GeminiService — Unified AI service for ticket/wiki generation
 *
 * Replaces the previous 4,900-line dual-service setup (VisualEnhancedAIService +
 * TemplateGuidedAIService) with a single focused module.
 *
 * Flow: context + screenshot + tech stack → prompt → Gemini 2.0 Flash → ticket content
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '../utils/logger.js';
import { UnifiedContextBuilder } from '../data/unified-context-builder.js';

export class GeminiService {
  constructor(options = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.logger = new Logger('GeminiService');
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({
      model: options.model || process.env.GEMINI_MODEL || 'gemini-2.0-flash'
    });
    this.maxRetries = 2;

    // Context builder for merging Figma data into a unified object
    this.contextBuilder = new UnifiedContextBuilder({
      configService: options.configService,
      logger: this.logger,
    });

    this.logger.info('GeminiService initialized');
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Generate a ticket/wiki page from Figma design context.
   *
   * @param {Object} params
   * @param {string} params.componentName  - Name of the selected Figma frame/component
   * @param {string|string[]} params.techStack - e.g. "AEM 6.5" or ["React", "TypeScript"]
   * @param {string} params.platform       - Output platform: "Jira" | "Wiki" | "Confluence" | "Markdown"
   * @param {string} params.documentType   - "component" | "feature" | "wiki" | etc.
   * @param {Object} params.figmaContext   - File context from the Figma plugin
   * @param {Object} params.frameData      - Enriched frame/node data array
   * @param {Object} params.enhancedFrameData - Extended frame data with design tokens
   * @param {Object} params.screenshot     - { base64, format, url }
   * @param {Object} params.fileContext    - { fileKey, fileName, pageId, pageName }
   * @param {Object} [params.metadata]     - Extra metadata
   * @returns {{ content: string, metadata: Object }}
   */
  async generate(params) {
    const startTime = Date.now();
    const {
      componentName,
      techStack = 'AEM 6.5',
      platform = 'Jira',
      documentType = 'component',
    } = params;

    this.logger.info(`Generating ${platform}/${documentType} for "${componentName}" [${techStack}]`);

    try {
      // 1. Build unified context from all Figma data sources
      const context = await this.contextBuilder.buildUnifiedContext({
        componentName,
        techStack,
        figmaContext: params.figmaContext,
        requestData: params,
        fileContext: params.fileContext,
        frameData: params.frameData,
        enhancedFrameData: params.enhancedFrameData,
        imageUrls: params.imageUrls,
        metadata: params.metadata,
        platform,
        documentType,
      });

      // 2. Build the prompt
      const prompt = this._buildPrompt(context, {
        componentName,
        techStack,
        platform,
        documentType,
      });

      // 3. Prepare multimodal parts (text + optional image)
      const parts = [{ text: prompt }];
      const screenshotBase64 = await this._resolveScreenshot(params, context);
      if (screenshotBase64) {
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: screenshotBase64,
          },
        });
        this.logger.info('Screenshot attached to LLM request');
      }

      // 4. Call Gemini with retry
      const generatedText = await this._callWithRetry(parts);

      // 5. Clean up response
      const content = this._cleanResponse(generatedText, platform);
      const duration = Date.now() - startTime;

      this.logger.info(`Generation complete in ${duration}ms (${content.length} chars)`);

      return {
        content,
        metadata: {
          generationMethod: 'gemini-service',
          platform,
          documentType,
          componentName,
          techStack,
          duration,
          promptTokens: Math.ceil(prompt.length / 4),
          responseTokens: Math.ceil(content.length / 4),
          hasScreenshot: !!screenshotBase64,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Generation failed:', error.message);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Prompt Building
  // ---------------------------------------------------------------------------

  _buildFigmaDeepLink(context) {
    // Primary: use the already-built live_link from unified context builder (includes node-id)
    if (context.figma?.live_link && context.figma.live_link !== 'https://www.figma.com/file/unknown') {
      return context.figma.live_link;
    }

    // Fallback: construct manually from available pieces
    const base = context.figma?.url
      || context.figmaUrl
      || null;

    const fileKey = this._extractFileKey(context);
    if (!fileKey || fileKey === 'unknown') return base || null;

    let url = base ? base.split('?')[0] : `https://www.figma.com/design/${fileKey}`;

    const nodeId = context.figma?.frame_id || context.figma?.node_id;
    if (nodeId) {
      const encodedNodeId = nodeId.replace(/:/g, '-').replace(/;/g, '%3B');
      url += `?node-id=${encodedNodeId}`;
    }
    return url;
  }

  _buildPrompt(context, options) {
    const { componentName, techStack, platform, documentType } = options;
    const techStackStr = Array.isArray(techStack) ? techStack.join(' + ') : techStack;
    const markup = this._getMarkupHelpers(platform);
    const figmaDeepLink = this._buildFigmaDeepLink(context);
    const figmaLinkText = figmaDeepLink
      ? (platform === 'jira' || platform === 'Jira'
          ? `[View in Figma|${figmaDeepLink}]`
          : `[View in Figma](${figmaDeepLink})`)
      : 'See Figma file context below';

    // Figma export URL — CDN image of the selected frame (passed from route via requestData)
    const figmaExportUrl = context.requestData?.figmaExportUrl || null;
    const hasImage = !!(context.figma?.screenshot_url || figmaExportUrl || context.requestData?.screenshot);

    return `${this._systemPrompt(techStackStr, platform)}

${this._platformRules(platform, markup)}

## Task
Generate a professional ${documentType} ticket for implementing the "${componentName}" component.
Tech Stack: ${techStackStr}
Platform: ${platform}

## Figma Design Reference
- Component: ${componentName}
- Figma URL: ${figmaDeepLink || 'Not available'}
- Figma Link (use this EXACT link text in the Design References section, do not replace it): ${figmaLinkText}
- File: ${context.figma?.file_name || context.fileContext?.fileName || context.requestData?.fileContext?.fileName || 'See context'}
${figmaExportUrl ? `- Design Image URL: ${figmaExportUrl}` : ''}
${hasImage ? `- Screenshot: Attached as image — analyze it carefully for layout, colors, spacing, and components.` : ''}

## Design Context Data
${this._formatContext(context)}

## Tech Stack Rules
${this._techStackRules(techStack)}

## Output Requirements
${this._outputRequirements(platform, documentType, markup)}

IMPORTANT:
- Return ONLY clean ${platform} markup content. No JSON, no YAML wrapping.
- Extract real data from context — never use placeholders like "TBD" or "unknown".
- If data is missing, infer intelligently from the component type and ${techStackStr} conventions.
- Include ALL sections with actionable, developer-ready content.`;
  }

  _systemPrompt(techStack, platform) {
    return `# Expert Technical Ticket Generator

You are a senior technical analyst who converts Figma design specifications into comprehensive ${platform} tickets.
You have deep expertise in ${techStack}, design systems, accessibility (WCAG AA), and component architecture.
Your output is always structured, actionable, and directly usable by development teams.`;
  }

  _platformRules(platform, markup) {
    const rules = {
      Jira: `Output ONLY in Jira wiki markup syntax. Follow these rules EXACTLY:
- Headings: h1. Title | h2. Section | h3. Subsection
- Bold: *bold text* (asterisks touching the word — no spaces inside)
- Italic: _italic text_ (underscores touching the word — use ONLY for inline emphasis, NEVER as a bullet)
- Bullet list items: level 1 = "* ", level 2 = "** ", level 3 = "*** ". NOTHING else.
- NEVER use underscore "_" or double-underscore "__" at the start of a line as a bullet marker.
- Links: [link text|https://example.com]
- Inline code: {{variable}}
- Code blocks: {code:java}...{code}

Correct list example:
* First item
** *Bold label:* nested description
*** Level 3 detail item
*** _italic label:_ another detail
* Second item

Incorrect (NEVER do this):
_ _Focus:* description   ← WRONG: underscore is not a bullet
__ {{variable}} text     ← WRONG: double-underscore is not a bullet
__* {{variable}} text    ← WRONG: double-underscore is not a bullet`,
      Wiki: 'Output using Confluence wiki markup syntax: h1. h2. h3. for headings, *bold*, _italic_, [text|url] for links, * for bullet list items (asterisk space), ** for nested bullets.',
      Confluence: 'Output using Confluence storage format: h1. h2. h3. headings, *bold*, {panel}, {info}, {code}. Use * for bullet items, ** for nested.',
      Markdown: 'Output using standard Markdown: # ## ### headings, **bold**, *italic*, [text](url), - bullets, `code`.',
    };
    return `## Formatting Rules\n${rules[platform] || rules.Jira}`;
  }

  _techStackRules(techStack) {
    const techArray = Array.isArray(techStack) ? techStack : [techStack];
    const rules = [];

    for (const tech of techArray) {
      switch (tech?.toLowerCase()) {
      case 'aem 6.5':
      case 'aem':
        rules.push(
          '- Include AEM component structure: HTL templates, Sling Models, Touch UI dialogs',
          '- Specify OSGi bundle requirements and JCR node structure',
          '- Include content policies, component configuration, and authoring requirements',
          '- Reference AEM Core Components where applicable',
        );
        break;
      case 'react':
        rules.push(
          '- Include component props interface, state management, and hooks',
          '- Specify component composition patterns and prop validation',
          '- Include testing guidance with React Testing Library',
        );
        break;
      case 'typescript':
        rules.push(
          '- Include TypeScript interfaces for props, state, and data models',
          '- Use strict typing — no `any` types',
        );
        break;
      case 'vue.js':
      case 'vue':
      case 'vue 3':
        rules.push(
          '- Use Vue 3 Composition API with <script setup>',
          '- Include props, emits, slots, and composable patterns',
        );
        break;
      case 'angular':
        rules.push(
          '- Include Angular component with @Input/@Output decorators',
          '- Specify services, dependency injection, and module structure',
        );
        break;
      case 'next.js':
      case 'nextjs':
        rules.push(
          '- Include Next.js patterns: App Router, Server/Client Components, SSR/SSG',
          '- Specify data fetching strategy and optimization requirements',
        );
        break;
      default:
        rules.push(`- Follow ${tech} best practices and conventions`);
        break;
      }
    }

    return rules.join('\n');
  }

  _outputRequirements(platform, documentType, markup) {
    if (documentType === 'wiki') {
      return `Generate a comprehensive technical documentation page including:
1. Component Overview (purpose, usage context, design rationale)
2. Content Model / Data Structure
3. Implementation Architecture (file structure, key classes/components)
4. Props/API Reference
5. Responsive Behavior (breakpoints and adaptations)
6. Accessibility Requirements (WCAG AA compliance, keyboard nav, ARIA)
7. Testing Strategy
8. Related Components and Dependencies`;
    }

    // Default: Jira-style ticket
    return `Generate a complete implementation ticket including:
1. Summary/Title
2. Component Overview (what it is, design intent)
3. Design References (Figma links, screenshot reference)
4. Design Tokens (colors, typography, spacing from the design)
5. Technical Implementation (component structure, state, props)
6. Accessibility Requirements (WCAG AA, keyboard, ARIA)
7. Responsive Behavior (mobile, tablet, desktop)
8. Interactive States (hover, focus, active, disabled, error)
9. Testing Requirements
10. Acceptance Criteria (specific, testable)
11. Exact Design Spec (reproduce the exact values from Design Context Data above: hex colors with roles, font family/weight/size/line-height, spacing values, border-radius values — no guesses or placeholders)`;
  }

  // ---------------------------------------------------------------------------
  // Context Formatting
  // ---------------------------------------------------------------------------

  _formatContext(context) {
    const sections = [];

    // ── Pull hierarchy from first enhanced frame ────────────────────────────
    const enhancedFrame = context.requestData?.enhancedFrameData?.[0];
    const hierarchy = enhancedFrame?.hierarchy || context.hierarchy;
    const dt = hierarchy?.designTokens || {};

    // ── Component info ──────────────────────────────────────────────────────
    const comp = context.figma || {};
    const frameName = comp.component_name || enhancedFrame?.name || 'See frame data';
    if (frameName || comp.file_name) {
      const w = enhancedFrame?.width || '?', h = enhancedFrame?.height || '?';
      sections.push(`### Component Info\n- Name: ${frameName}\n- File: ${comp.file_name || 'Unknown'}\n- Page: ${comp.page_name || 'Unknown'}\n- Type: ${comp.component_type || enhancedFrame?.type || 'FRAME'}\n- Size: ${w}\u00d7${h}px`);
    }

    // ── Auto-layout ─────────────────────────────────────────────────────────
    const rootLayer = hierarchy?.layers?.find(l => l.depth === 1);
    const rootLayout = rootLayer?.layout;
    if (rootLayout?.mode && rootLayout.mode !== 'NONE') {
      const dir = rootLayout.mode === 'HORIZONTAL' ? 'row' : 'column';
      const { paddingTop: pt = 0, paddingRight: pr = 0, paddingBottom: pb = 0, paddingLeft: pl = 0 } = rootLayout;
      const padding = (pt === pr && pr === pb && pb === pl) ? `${pt}px` : `${pt}px ${pr}px ${pb}px ${pl}px`;
      sections.push(`### Auto-Layout\n- Direction: ${dir} (${rootLayout.mode})\n- Gap: ${rootLayout.gap}px\n- Padding: ${padding}\n- Primary axis: ${rootLayout.primaryAlign || 'MIN'}\n- Cross axis: ${rootLayout.counterAlign || 'MIN'}`);
    }

    // ── Color tokens ────────────────────────────────────────────────────────
    const rawColors = dt.colors?.length ? dt.colors : (() => {
      const v = context.design?.colors;
      if (!v) return [];
      if (Array.isArray(v)) return v;
      if (typeof v === 'object') return Object.values(v).flat();
      return String(v).split(', ');
    })();
    if (rawColors.length > 0) {
      // Infer semantic role from the first layer that uses each hex
      const colorRoles = new Map();
      for (const layer of (hierarchy?.layers || [])) {
        const layerName = (layer.name || '').toLowerCase();
        const role = layer.semanticRole || '';
        for (const hex of (layer.tokens?.colors || [])) {
          if (colorRoles.has(hex)) continue;
          let label = role;
          if (layerName.includes('bg') || layerName.includes('background')) label = 'background';
          else if (layerName.includes('border') || layerName.includes('stroke')) label = 'border';
          else if (layer.type === 'TEXT') label = 'text';
          else if (layerName.includes('btn') || layerName.includes('button')) label = 'button-fill';
          else if (layerName.includes('icon') || role === 'icon') label = 'icon';
          colorRoles.set(hex, label);
        }
      }
      const colorLines = rawColors.map(hex => {
        const role = colorRoles.get(hex);
        return role ? `  ${hex}  (${role})` : `  ${hex}`;
      });
      sections.push(`### Color Tokens\n${colorLines.join('\n')}`);
    }

    // ── Typography ──────────────────────────────────────────────────────────
    if (dt.typographyRich?.length > 0) {
      const typoLines = dt.typographyRich.map(t => {
        const lh = t.lineHeight && t.lineHeight !== 'auto' ? ` / lh ${t.lineHeight}` : '';
        const ls = t.letterSpacing && t.letterSpacing !== 0 ? ` / ls ${t.letterSpacing}` : '';
        return `  ${t.role || 'text'}: ${t.family} / ${t.weight} / ${t.size}px${lh}${ls}`;
      });
      sections.push(`### Typography Roles\n${typoLines.join('\n')}`);
    } else {
      // Fallback to legacy format
      const fonts = (() => {
        const v = context.design?.typography?.fonts;
        if (!v) return [];
        if (Array.isArray(v)) return v;
        if (typeof v === 'object') return Object.values(v).flat();
        return String(v).split(', ');
      })();
      if (fonts.length > 0) sections.push(`### Typography\n${fonts.map(f => `  ${f}`).join('\n')}`);
    }

    // ── Spacing / border-radius / shadows ───────────────────────────────────
    if (dt.spacing?.length) {
      sections.push(`### Spacing Scale\n  ${dt.spacing.map(v => `${v}px`).join(', ')}`);
    } else if (context.design?.spacing?.base_unit) {
      sections.push(`### Spacing\n  Base unit: ${context.design.spacing.base_unit}`);
    }
    if (dt.borderRadius?.length) {
      sections.push(`### Border Radius\n  ${dt.borderRadius.map(r => `${r}px`).join(', ')}`);
    }
    if (dt.shadows?.length) {
      sections.push(`### Shadows\n${dt.shadows.map(s => `  ${s}`).join('\n')}`);
    }

    // ── Component variants (Figma REST API — Part B) ─────────────────────────
    const variants = context.requestData?.figmaRestData?.variants;
    if (variants && Object.keys(variants).length > 0) {
      const varLines = Object.entries(variants).map(([k, v]) => `  ${k}: ${Array.isArray(v) ? v.join(' | ') : v}`);
      sections.push(`### Component Variants\n${varLines.join('\n')}`);
    }

    // ── Code Connect (Figma dev_resources — Part C) ──────────────────────────
    const cc = context.requestData?.codeConnect;
    if (cc?.component) {
      const ccLines = [`  Component: ${cc.component}`];
      if (cc.importPath) ccLines.push(`  Import: import { ${cc.componentName || 'Component'} } from '${cc.importPath}'`);
      if (cc.props) ccLines.push(`  Props: ${JSON.stringify(cc.props)}`);
      sections.push(`### Code Component Mapping\n${ccLines.join('\n')}`);
    }

    // ── Project ─────────────────────────────────────────────────────────────
    if (context.project?.tech_stack) {
      sections.push(`### Project\n- Tech Stack: ${context.project.tech_stack}\n- Platform: ${context.project.platform || 'web'}`);
    }

    if (sections.length === 0) {
      sections.push('Context data limited — infer from screenshot and component name.');
    }

    // ── Full layer tree (always at the bottom) ───────────────────────────────
    if (hierarchy?.layers?.length > 0) {
      const treeLines = hierarchy.layers.map(layer => {
        const indent = '  '.repeat((layer.depth || 1) - 1);
        const w = Math.round(layer.size?.width || 0);
        const h = Math.round(layer.size?.height || 0);
        const layoutTag = layer.layout?.mode
          ? ` [${layer.layout.mode === 'HORIZONTAL' ? 'row' : 'col'}, gap:${layer.layout.gap}px]`
          : '';
        const typoTag = layer.type === 'TEXT' && layer.tokens?.typographyRich?.[0]
          ? ` "${layer.tokens.typographyRich[0].family} ${layer.tokens.typographyRich[0].weight} ${layer.tokens.typographyRich[0].size}px"`
          : '';
        return `${indent}${layer.name} (${layer.type}, ${w}\u00d7${h})${layoutTag}${typoTag}`;
      });
      sections.push(`### Layer Tree\n${treeLines.join('\n')}`);
    }

    return sections.join('\n\n');
  }

  _extractFileKey(context) {
    return context.figma?.file_key
      || context.fileContext?.fileKey
      || context.requestData?.fileContext?.fileKey
      || context.requestData?.fileKey
      || 'unknown';
  }

  // ---------------------------------------------------------------------------
  // Screenshot handling
  // ---------------------------------------------------------------------------

  async _resolveScreenshot(params, context) {
    // Direct base64 from plugin
    let screenshot = params.screenshot || context.requestData?.screenshot;
    if (!screenshot) return null;

    let base64 = null;

    if (typeof screenshot === 'string') {
      if (screenshot.startsWith('data:image')) {
        base64 = screenshot.split(',')[1];
      } else if (screenshot.startsWith('http')) {
        base64 = await this._downloadAsBase64(screenshot);
      } else {
        base64 = screenshot;
      }
    } else if (typeof screenshot === 'object') {
      if (screenshot.base64) {
        base64 = screenshot.base64;
      } else if (screenshot.dataUrl?.startsWith('data:')) {
        base64 = screenshot.dataUrl.split(',')[1];
      } else if (screenshot.url || screenshot.dataUrl) {
        const url = screenshot.url || screenshot.dataUrl;
        if (url.startsWith('http')) {
          base64 = await this._downloadAsBase64(url);
        }
      } else if (screenshot.content) {
        base64 = screenshot.content;
      }
    }

    // Strip data URL prefix if still present
    if (base64?.startsWith('data:image')) {
      base64 = base64.split(',')[1];
    }

    // Reject SVG (can't send to Gemini vision)
    if (base64 && /^PHN2Zy|data:image\/svg/.test(base64)) {
      this.logger.warn('SVG screenshot detected — skipping (Gemini requires raster images)');
      return null;
    }

    return base64 || null;
  }

  async _downloadAsBase64(url) {
    try {
      this.logger.info(`Downloading screenshot: ${url.substring(0, 60)}...`);
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.warn(`Screenshot download failed: ${response.status}`);
        return null;
      }
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch (err) {
      this.logger.warn('Screenshot download error:', err.message);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Gemini API call with retry
  // ---------------------------------------------------------------------------

  async _callWithRetry(parts, attempt = 1) {
    try {
      const result = await this.model.generateContent(parts);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (attempt <= this.maxRetries) {
        this.logger.warn(`Gemini API error (attempt ${attempt}/${this.maxRetries}), retrying: ${error.message}`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
        return this._callWithRetry(parts, attempt + 1);
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Response cleanup
  // ---------------------------------------------------------------------------

  _cleanResponse(text, platform) {
    let cleaned = text;
    // Remove trailing "Design Analysis" sections Gemini sometimes appends
    cleaned = cleaned.split(/\n#+\s*Design Analysis/i)[0];
    // Remove markdown code fences that wrap the entire output
    cleaned = cleaned.replace(/^```(?:markdown|jira|text)?\n/i, '').replace(/\n```\s*$/, '');
    // Fix Jira bullet formatting: AI sometimes emits "_ _Label:* text" instead of "** *Label:* text"
    if (platform === 'Jira' || platform === 'jira') {
      cleaned = this._fixJiraBullets(cleaned);
    }
    return cleaned.trim();
  }

  /**
   * Post-process Jira markdown to fix AI-generated _ _ pseudo-bullets.
   * Converts patterns like "_ _Focus:* desc" → "** *Focus:* desc"
   */
  _fixJiraBullets(text) {
    return text
      // "__* text" or "__ text" (double-underscore as level-3 bullet) → "*** text"
      .replace(/^__\* /gm, '*** ')
      .replace(/^__ /gm, '*** ')
      // "_ _Label*: description" → "** *Label:* description"  (asterisk before colon)
      .replace(/^_ _([^*\n]+)\*:[^\S\r\n]*(.*)$/gm, '** *$1:* $2')
      // "_ _Label:* description" → "** *Label:* description"  (asterisk after colon)
      .replace(/^_ _([^:\n]+):\*[^\S\r\n]*(.*)$/gm, '** *$1:* $2')
      // "_ _Label:_ description" → "** _Label:_ description"  (nested bullet with italic label)
      .replace(/^_ _([^:\n]+):_[^\S\r\n]*(.*)$/gm, '** _$1:_ $2')
      // Any remaining "_ _text" at line start → "** text"
      .replace(/^_ _/gm, '** ')
      // Any remaining "_ text" at line start (underscore used as a bullet) → "* text"
      .replace(/^_ (?!_)/gm, '* ')
      // Strip trailing spaces left by empty $2 captures
      .replace(/ +$/gm, '');
  }

  // ---------------------------------------------------------------------------
  // Markup helpers
  // ---------------------------------------------------------------------------

  _getMarkupHelpers(platform) {
    const helpers = {
      Jira: { h1: 'h1. ', h2: 'h2. ', h3: 'h3. ', bold: '*', bullet: '*', link: (t, u) => `[${t}|${u}]` },
      Wiki: { h1: '# ', h2: '## ', h3: '### ', bold: '**', bullet: '-', link: (t, u) => `[${t}](${u})` },
      Confluence: { h1: 'h1. ', h2: 'h2. ', h3: 'h3. ', bold: '*', bullet: '*', link: (t, u) => `[${t}|${u}]` },
      Markdown: { h1: '# ', h2: '## ', h3: '### ', bold: '**', bullet: '-', link: (t, u) => `[${t}](${u})` },
    };
    return helpers[platform] || helpers.Jira;
  }
}
