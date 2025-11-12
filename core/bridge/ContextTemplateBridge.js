/**
 * Context-to-Template Bridge Service
 *
 * Bridges the Context Layer (semantic design understanding) with the YAML Template Engine
 * Architecture: Figma API → Context Layer (JSON) → YAML Template Engine → Docs
 *
 * This service eliminates the need for MCP server dependency by creating a direct path
 * from enriched design context to template-generated documentation.
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { ContextManager } from '../context/ContextManager.js';
import { UniversalTemplateEngine } from '../template/UniversalTemplateEngine.js';
import { BaseService } from '../../app/services/BaseService.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ContextTemplateBridge extends BaseService {
  constructor() {
    super('ContextTemplateBridge');

    this.contextManager = new ContextManager();

    // Use the correct path for AI templates
    const templatesPath = join(__dirname, '../ai/templates');

    this.templateEngine = new UniversalTemplateEngine(templatesPath);
    this.errorHandler = new ErrorHandler('ContextTemplateBridge');

    // Optional MCP Adapter for advanced workflows
    this.mcpAdapter = null;
    this.mcpEnabled = false;

    // Performance metrics
    this.metrics = {
      totalGenerations: 0,
      successfulGenerations: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      mcpEnhancements: 0
    };
  }

  async onInitialize() {
    this.logger.info('🌉 Initializing Context-Template Bridge...');

    // Initialize context manager
    await this.contextManager.initialize();

    // Optionally initialize MCP Adapter for advanced workflows
    try {
      const { MCPAdapter } = await import('../adapters/MCPAdapter.js');
      this.mcpAdapter = new MCPAdapter({
        enableMultiAgent: true,
        enableCrossToolWorkflows: false // Keep simple for now
      });
      await this.mcpAdapter.initialize();
      this.mcpEnabled = this.mcpAdapter.isAvailable;

      if (this.mcpEnabled) {
        this.logger.info('🔌 MCP Adapter available for advanced workflows');
      } else {
        this.logger.info('🔇 MCP Adapter unavailable - using direct flow only');
      }
    } catch (error) {
      this.logger.info('🔇 MCP Adapter disabled - using direct Context→Template flow only');
      this.mcpEnabled = false;
    }

    this.logger.info('✅ Context-Template Bridge initialized', {
      mcpEnabled: this.mcpEnabled,
      architecture: this.mcpEnabled
        ? 'figma-api → context-layer → [optional mcp enhancement] → yaml-templates → docs'
        : 'figma-api → context-layer → yaml-templates → docs'
    });
  }

  /**
   * Main generation method - Direct path from Figma to Documentation
   * @param {Object} request - Generation request
   * @returns {Object} Generated documentation
   */
  async generateDocumentation(request) {
    const startTime = Date.now();
    this.metrics.totalGenerations++;

    try {
      this.logger.info('🌉 Starting Context-Template Bridge generation...', {
        platform: request.platform,
        documentType: request.documentType,
        techStack: request.techStack
      });

      // Phase 1: Extract rich context from Figma data
      const contextData = await this._extractContextFromRequest(request);

      // Phase 1.5: Optional MCP enhancement for advanced workflows
      const enhancedContextData = await this._enhanceContextWithMCP(contextData, request);

      // Phase 2: Resolve appropriate template
      const template = await this._resolveTemplate(request, enhancedContextData);

      // Phase 3: Generate documentation using template
      const documentation = await this._generateFromTemplate(template, enhancedContextData, request);

      // Phase 4: Format and enrich final output
      const result = await this._formatFinalOutput(documentation, enhancedContextData, request);

      const processingTime = Date.now() - startTime;
      this._updateMetrics(processingTime, true);

      this.logger.info('✅ Context-Template Bridge generation completed', {
        processingTime: `${processingTime}ms`,
        cacheHit: result.fromCache || false
      });

      return result;

    } catch (error) {
      this._updateMetrics(Date.now() - startTime, false);
      this.logger.error('❌ Context-Template Bridge generation failed:', error);

      // Create fallback response
      return this._createFallbackResponse(request, error);
    }
  }

  /**
   * Phase 1: Extract rich context from Figma data using Context Layer
   * @param {Object} request - Generation request
   * @returns {Object} Rich context data
   */
  async _extractContextFromRequest(request) {
    this.logger.info('🎯 Phase 1: Extracting context from Figma data...');

    try {
      // Prepare Figma data for context extraction
      const figmaData = this._prepareFigmaDataForContext(request);

      // Use Context Layer to extract rich semantic understanding
      const contextResult = await this.contextManager.extractContext(figmaData);

      // Transform context into template-friendly format
      const templateContext = await this._transformContextForTemplate(contextResult, request);

      this.logger.info('✅ Context extraction completed', {
        nodesAnalyzed: contextResult.nodeAnalysis?.nodeCount || 0,
        componentsFound: contextResult.componentMapping?.components?.length || 0,
        colorsExtracted: contextResult.styleExtraction?.colors?.length || 0,
        layoutPatternsFound: contextResult.layoutAnalysis?.patterns?.length || 0
      });

      return templateContext;

    } catch (error) {
      this.logger.warn('⚠️ Context extraction failed, using fallback:', error.message);
      return this._createFallbackContext(request);
    }
  }

  /**
   * Prepare Figma data from request for Context Layer processing
   * @param {Object} request - Generation request
   * @returns {Object} Formatted Figma data
   */
  _prepareFigmaDataForContext(request) {
    const rawNodes = request.frameData || request.enhancedFrameData || [];

    // Normalize node structure for proper Figma API format
    const normalizedNodes = Array.isArray(rawNodes) ? rawNodes.map(node => ({
      id: node.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: node.name || 'Component',
      type: node.type || 'FRAME',
      visible: node.visible !== false,
      locked: false,
      children: node.children || [],
      absoluteBoundingBox: node.absoluteBoundingBox || { x: 0, y: 0, width: 100, height: 100 },
      ...node
    })) : [];

    // Create proper Figma document structure expected by ContextManager
    const figmaData = {
      document: {
        id: request.figmaUrl ? this.extractFileIdFromUrl(request.figmaUrl) : 'mock-document',
        name: 'Document',
        type: 'DOCUMENT',
        children: normalizedNodes.length > 0 ? normalizedNodes : [{
          id: 'page-1',
          name: 'Page 1',
          type: 'CANVAS',
          children: normalizedNodes
        }]
      },
      url: request.figmaUrl,
      screenshot: request.screenshot,
      metadata: {
        extractedAt: new Date().toISOString(),
        source: 'bridge-service',
        mockMode: request.mockMode || false
      }
    };

    return figmaData;
  }

  /**
   * Extract file ID from Figma URL for proper document structure
   * @param {string} figmaUrl - Figma URL
   * @returns {string} File ID or fallback
   */
  extractFileIdFromUrl(figmaUrl) {
    if (!figmaUrl) {return 'mock-document';}

    // Handle both legacy /file/ and modern /design/ URL formats
    const legacyMatch = figmaUrl.match(/\/file\/([^/?#]+)/);
    if (legacyMatch) {return legacyMatch[1];}

    const modernMatch = figmaUrl.match(/\/design\/([^/?#]+)/);
    if (modernMatch) {return modernMatch[1];}

    return 'mock-document';
  }

  /**
   * Transform Context Layer output into template-friendly format
   * @param {Object} contextResult - Context Layer result
   * @param {Object} request - Original request
   * @returns {Object} Template-ready context
   */
  async _transformContextForTemplate(contextResult, request) {
    const componentName = request.frameData?.[0]?.name ||
                         request.enhancedFrameData?.[0]?.name ||
                         'Component';

    return {
      // Request context (user-provided values with highest priority)
      context: {
        componentName: request.context?.componentName,
        projectName: request.context?.projectName,
        priority: request.context?.priority,
        storyPoints: request.context?.storyPoints,
        issueType: request.context?.issueType,
        figma: {
          live_link: await this._buildEnhancedFigmaUrl(contextResult, request)
        },
        project: {
          component_prefix: request.context?.project?.component_prefix,
          testing_framework: request.context?.project?.testing_framework,
          tech_stack: request.context?.project?.tech_stack,
          component_library_url: request.context?.project?.component_library_url,
          accessibility_url: request.context?.project?.accessibility_url,
          testing_standards_url: request.context?.project?.testing_standards_url
        },
        calculated: {
          confidence: request.context?.calculated?.confidence,
          hours: request.context?.calculated?.hours
        }
      },

      // Figma context (enhanced by Context Layer)
      figma: {
        component_name: componentName,
        component_type: this._inferComponentType(contextResult),
        description: this._generateDescription(contextResult, componentName),
        url: request.figmaUrl,
        live_link: await this._buildEnhancedFigmaUrl(contextResult, request),

        // 🚀 Enhanced extraction for template variables
        extracted_colors: await this._extractEnhancedColors(contextResult, request),
        extracted_typography: await this._extractEnhancedTypography(contextResult, request),

        // Rich design data from Context Layer
        design_tokens: contextResult.styleExtraction?.designTokens || {},
        color_palette: contextResult.styleExtraction?.colors || [],
        typography: contextResult.styleExtraction?.typography || {},
        spacing_system: contextResult.styleExtraction?.spacing || {},

        // Component analysis
        variants: contextResult.componentMapping?.variants || [],
        states: contextResult.componentMapping?.states || [],
        properties: contextResult.componentMapping?.properties || [],

        // Layout intelligence
        layout_patterns: contextResult.layoutAnalysis?.patterns || [],
        responsive_behavior: contextResult.layoutAnalysis?.responsiveAnalysis || {},

        // User flow context
        interactions: contextResult.prototypeMapping?.interactions || [],
        user_flows: contextResult.prototypeMapping?.flows || [],

        // Screenshots and visual context
        screenshot_markdown: {
          jira: request.screenshot ? '!screenshot.png|thumbnail!' : '',
          confluence: request.screenshot ? '![Screenshot](screenshot.png)' : '',
          markdown: request.screenshot ? '![Component Screenshot](screenshot.png)' : ''
        }
      },

      // Project context
      project: {
        name: 'AEM Component Library',
        tech_stack: this._normalizeTechStack(request.techStack),
        component_prefix: 'UI',
        frontend_framework: this._inferFramework(request.techStack),
        styling_approach: this._inferStylingApproach(request.techStack),
        testing_framework: this._inferTestingFramework(request.techStack),
        repository: request.repository || 'https://github.com/company/design-system',
        component_library_url: 'https://storybook.company.com'
      },

      // Calculated metrics (from Context Layer analysis)
      calculated: {
        complexity: this._calculateComplexity(contextResult),
        confidence: contextResult.confidence || 0.85,
        story_points: this._estimateStoryPoints(contextResult),
        priority: this._determinePriority(contextResult),
        hours: this._estimateHours(contextResult),
        risk_factors: this._identifyRiskFactors(contextResult),
        design_analysis: this._generateDesignAnalysis(contextResult)
      },

      // Design tokens (structured for templates)
      design_tokens: {
        colors: contextResult.styleExtraction?.colors?.map(color => ({
          name: color.name,
          value: color.hex || color.value
        })) || [],
        spacing: contextResult.styleExtraction?.spacing?.map(space => ({
          name: space.name,
          value: space.value
        })) || [],
        typography: contextResult.styleExtraction?.typography?.families || []
      },

      // Team context (default values)
      team: {
        name: 'Design System Team',
        contact: 'design@company.com'
      },

      // Authoring context (for AEM integration)
      authoring: request.platform === 'aem' ? {
        notes: this._generateAEMNotes(contextResult),
        component_path: `/apps/components/${componentName.toLowerCase()}`,
        cq_template: `${componentName}Template`,
        touch_ui_required: true
      } : {},

      // Organization context
      org: {
        name: 'Organization',
        design_system_url: 'https://design.company.com',
        accessibility_url: 'https://accessibility.company.com',
        testing_standards_url: 'https://testing.company.com'
      }
    };
  }

  /**
   * Phase 1.5: Optional MCP enhancement for advanced workflows
   * @param {Object} contextData - Rich context data from Context Layer
   * @param {Object} request - Generation request
   * @returns {Object} Enhanced context data
   */
  async _enhanceContextWithMCP(contextData, request) {
    if (!this.mcpEnabled || !this.mcpAdapter) {
      return contextData; // Return original context if MCP not available
    }

    this.logger.info('🤖 Phase 1.5: Enhancing context with optional MCP workflows...');

    try {
      // Check if complex analysis is needed
      const needsEnhancement = this._shouldUseMCPEnhancement(contextData, request);

      if (!needsEnhancement) {
        this.logger.info('📋 Context sufficient - skipping MCP enhancement');
        return contextData;
      }

      // Perform multi-agent enhancement for complex components
      const enhancedContext = await this.mcpAdapter.enhanceWithMultiAgent(contextData, request);

      if (enhancedContext !== contextData) {
        this.metrics.mcpEnhancements++;
        this.logger.info('✨ Context enhanced with MCP multi-agent analysis');
        return enhancedContext;
      }

      return contextData;

    } catch (error) {
      this.logger.warn('⚠️ MCP enhancement failed, using original context:', error.message);
      return contextData; // Graceful fallback to original context
    }
  }

  /**
   * Determine if MCP enhancement is beneficial for this request
   * @param {Object} contextData - Rich context data
   * @param {Object} request - Generation request
   * @returns {boolean} Whether to use MCP enhancement
   */
  _shouldUseMCPEnhancement(contextData, request) {
    // Use MCP for complex components with multiple variants or interactions
    const complexity = contextData.calculated?.complexity;
    const hasMultipleVariants = contextData.figma?.variants?.length > 3;
    const hasInteractions = contextData.figma?.interactions?.length > 0;
    const isHighPriority = contextData.calculated?.priority === 'High';

    return complexity === 'complex' || hasMultipleVariants || hasInteractions || isHighPriority;
  }

  /**
   * Phase 2: Resolve appropriate template based on request and context
   * @param {Object} request - Generation request
   * @param {Object} contextData - Rich context data
   * @returns {Object} Resolved template
   */
  async _resolveTemplate(request, contextData) {
    this.logger.info('📋 Phase 2: Resolving template...', {
      platform: request.platform || 'jira',
      documentType: request.documentType || 'component',
      techStack: request.techStack || 'custom'
    });

    const template = await this.templateEngine.resolveTemplate(
      request.platform || 'jira',
      request.documentType || 'component',
      request.techStack || 'custom'
    );

    this.logger.info('✅ Template resolved', {
      resolutionPath: template._meta?.resolutionPath,
      templateType: template._meta?.platform ? 'platform' : 'tech-stack'
    });

    return template;
  }

  /**
   * Phase 3: Generate documentation using resolved template
   * @param {Object} template - Resolved template
   * @param {Object} contextData - Rich context data
   * @param {Object} request - Original request
   * @returns {Object} Generated documentation
   */
  async _generateFromTemplate(template, contextData, request) {
    this.logger.info('⚙️ Phase 3: Generating documentation from template...');

    this.logger.info('🔍 DEBUG - Template context keys:', Object.keys(contextData));
    this.logger.info('🔍 DEBUG - Context.componentName:', contextData.context?.componentName);
    this.logger.info('🔍 DEBUG - Context.projectName:', contextData.context?.projectName);
    this.logger.info('🔍 DEBUG - Request.context:', request.context);

    const rendered = await this.templateEngine.renderTemplate(template, contextData);

    return {
      content: rendered,
      template: template,
      context: contextData,
      metadata: {
        generationType: 'context-bridge',
        templateResolution: template._meta?.resolutionPath,
        contextSource: 'context-layer',
        processingPipeline: 'figma-api → context-layer → template-engine'
      }
    };
  }

  /**
   * Phase 4: Format final output for consumption
   * @param {Object} documentation - Generated documentation
   * @param {Object} contextData - Rich context data
   * @param {Object} request - Original request
   * @returns {Object} Final formatted result
   */
  async _formatFinalOutput(documentation, contextData, request) {
    this.logger.info('📄 Phase 4: Formatting final output...');

    return {
      // Primary content
      content: Array.isArray(documentation.content) ? documentation.content : [{
        type: 'text',
        text: typeof documentation.content === 'string'
          ? documentation.content
          : JSON.stringify(documentation.content, null, 2)
      }],

      // Output format and strategy
      format: request.platform || 'jira',
      strategy: 'context-bridge',

      // Rich metadata
      metadata: {
        ...documentation.metadata,
        confidence: contextData.calculated?.confidence || 0.85,
        complexity: contextData.calculated?.complexity || 'medium',
        source: 'context-bridge',
        architecture: 'figma-api → context-layer → yaml-templates → docs',
        contextAnalysis: {
          nodesProcessed: contextData.figma?.layout_patterns?.length || 0,
          componentsIdentified: contextData.figma?.variants?.length || 0,
          designTokensExtracted: contextData.design_tokens?.colors?.length +
                                contextData.design_tokens?.spacing?.length || 0,
          interactionsFound: contextData.figma?.interactions?.length || 0
        }
      },

      // Performance metrics
      performance: {
        duration: Date.now() - (this._startTime || Date.now()),
        fromCache: false,
        contextLayerEnabled: true,
        mcpBypass: true
      },

      // Generation timestamp
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Create fallback response when generation fails
   * @param {Object} request - Original request
   * @param {Error} error - Error that occurred
   * @returns {Object} Fallback response
   */
  _createFallbackResponse(request, error) {
    const componentName = request.frameData?.[0]?.name ||
                         request.enhancedFrameData?.[0]?.name ||
                         'Component';

    return {
      content: [{
        type: 'text',
        text: `# ${componentName} Implementation

## Description
Implement the ${componentName} component based on Figma design specifications.

## Technical Requirements
- **Platform**: ${request.platform || 'jira'}
- **Document Type**: ${request.documentType || 'component'}
- **Tech Stack**: ${Array.isArray(request.techStack) ? request.techStack.join(', ') : (request.techStack || 'Not specified')}

## Acceptance Criteria
- [ ] Component matches design specifications
- [ ] Component is responsive across all devices
- [ ] Component passes accessibility testing (WCAG 2.1 AA)
- [ ] Unit tests provide adequate coverage
- [ ] Code follows team standards and conventions

## Error Information
- **Generation Method**: Context-Template Bridge (Fallback)
- **Error**: ${error.message}
- **Architecture**: Figma API → Context Layer → YAML Templates → Docs

---
*Generated via Context-Template Bridge (Fallback Mode)*`
      }],
      format: request.platform || 'jira',
      strategy: 'context-bridge-fallback',
      metadata: {
        error: error.message,
        fallback: true,
        source: 'context-bridge'
      },
      performance: {
        duration: 0,
        fromCache: false,
        error: true
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Create fallback context when Context Layer extraction fails
   * @param {Object} request - Generation request
   * @returns {Object} Basic context data
   */
  _createFallbackContext(request) {
    const componentName = request.frameData?.[0]?.name ||
                         request.enhancedFrameData?.[0]?.name ||
                         'Component';

    return {
      figma: {
        component_name: componentName,
        component_type: 'UI Component',
        description: `A ${componentName} component for the application`,
        url: request.figmaUrl || '',
        live_link: request.figmaUrl || ''
      },
      project: {
        name: 'AEM Component Library',
        tech_stack: this._normalizeTechStack(request.techStack),
        frontend_framework: this._inferFramework(request.techStack)
      },
      calculated: {
        complexity: 'medium',
        confidence: 0.5,
        story_points: '5',
        priority: 'Medium',
        hours: '4-6'
      },
      design_tokens: {
        colors: [],
        spacing: [],
        typography: []
      }
    };
  }

  // Helper methods for context transformation

  _inferComponentType(contextResult) {
    const components = contextResult.componentMapping?.components || [];
    if (components.length > 0) {
      return components[0].type || 'UI Component';
    }
    return 'UI Component';
  }

  _generateDescription(contextResult, componentName) {
    const patterns = contextResult.layoutAnalysis?.patterns || [];
    if (patterns.length > 0) {
      return `A ${componentName} component implementing ${patterns[0].type} layout pattern`;
    }
    return `A reusable ${componentName} component for user interactions`;
  }

  _normalizeTechStack(techStack) {
    if (Array.isArray(techStack)) {
      return techStack;
    }
    if (typeof techStack === 'string') {
      return techStack.split(',').map(s => s.trim());
    }
    return ['React', 'TypeScript'];
  }

  _inferFramework(techStack) {
    const stack = this._normalizeTechStack(techStack);
    if (stack.some(tech => tech.toLowerCase().includes('react'))) {return 'React';}
    if (stack.some(tech => tech.toLowerCase().includes('vue'))) {return 'Vue';}
    if (stack.some(tech => tech.toLowerCase().includes('angular'))) {return 'Angular';}
    if (stack.some(tech => tech.toLowerCase().includes('aem'))) {return 'AEM';}
    return 'React';
  }

  _inferStylingApproach(techStack) {
    const stack = this._normalizeTechStack(techStack);
    if (stack.some(tech => tech.toLowerCase().includes('styled'))) {return 'Styled Components';}
    if (stack.some(tech => tech.toLowerCase().includes('tailwind'))) {return 'Tailwind CSS';}
    if (stack.some(tech => tech.toLowerCase().includes('css modules'))) {return 'CSS Modules';}
    return 'CSS Modules';
  }

  _inferTestingFramework(techStack) {
    const stack = this._normalizeTechStack(techStack);
    if (stack.some(tech => tech.toLowerCase().includes('vitest'))) {return 'Vitest';}
    if (stack.some(tech => tech.toLowerCase().includes('cypress'))) {return 'Cypress';}
    return 'Jest + React Testing Library';
  }

  _calculateComplexity(contextResult) {
    const nodeCount = contextResult.nodeAnalysis?.nodeCount || 0;
    const componentCount = contextResult.componentMapping?.components?.length || 0;
    const interactionCount = contextResult.prototypeMapping?.interactions?.length || 0;

    if (nodeCount > 15 || componentCount > 5 || interactionCount > 3) {
      return 'complex';
    } else if (nodeCount > 8 || componentCount > 2 || interactionCount > 1) {
      return 'medium';
    }
    return 'simple';
  }

  _estimateStoryPoints(contextResult) {
    const complexity = this._calculateComplexity(contextResult);
    switch (complexity) {
    case 'complex': return '8';
    case 'medium': return '5';
    case 'simple': return '3';
    default: return '5';
    }
  }

  _determinePriority(contextResult) {
    const hasInteractions = contextResult.prototypeMapping?.interactions?.length > 0;
    const hasVariants = contextResult.componentMapping?.variants?.length > 1;

    if (hasInteractions && hasVariants) {return 'High';}
    if (hasInteractions || hasVariants) {return 'Medium';}
    return 'Medium';
  }

  _estimateHours(contextResult) {
    const complexity = this._calculateComplexity(contextResult);
    switch (complexity) {
    case 'complex': return '12-16';
    case 'medium': return '6-8';
    case 'simple': return '3-4';
    default: return '4-6';
    }
  }

  _identifyRiskFactors(contextResult) {
    const risks = [];

    if ((contextResult.nodeAnalysis?.nodeCount || 0) > 20) {
      risks.push('High component complexity');
    }

    if ((contextResult.prototypeMapping?.interactions?.length || 0) > 5) {
      risks.push('Complex interaction patterns');
    }

    if ((contextResult.componentMapping?.variants?.length || 0) > 8) {
      risks.push('Many component variants');
    }

    return risks.length > 0 ? risks : ['Standard implementation risks'];
  }

  _generateDesignAnalysis(contextResult) {
    const patterns = contextResult.layoutAnalysis?.patterns || [];
    const components = contextResult.componentMapping?.components || [];
    const interactions = contextResult.prototypeMapping?.interactions || [];

    const analysisPoints = [];

    if (patterns.length > 0) {
      analysisPoints.push(`Uses ${patterns[0].type} layout pattern`);
    }

    if (components.length > 1) {
      analysisPoints.push(`Contains ${components.length} nested components`);
    }

    if (interactions.length > 0) {
      analysisPoints.push(`Includes ${interactions.length} interactive elements`);
    }

    return analysisPoints.length > 0
      ? analysisPoints.join('. ') + '.'
      : 'Standard component implementation with typical UI patterns.';
  }

  _generateAEMNotes(contextResult) {
    const components = contextResult.componentMapping?.components || [];
    if (components.length > 0) {
      return `AEM component implementation for ${components[0].name}. Ensure Touch UI compatibility and proper Sling Model bindings.`;
    }
    return 'Standard AEM component implementation. Follow AEM development best practices.';
  }

  _updateMetrics(processingTime, success) {
    if (success) {
      this.metrics.successfulGenerations++;
    }

    // Update average processing time
    this.metrics.averageProcessingTime =
      (this.metrics.averageProcessingTime * (this.metrics.totalGenerations - 1) + processingTime) /
      this.metrics.totalGenerations;
  }

  /**
   * Get service health and metrics
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      status: 'healthy',
      architecture: 'figma-api → context-layer → yaml-templates → docs',
      bypass: 'mcp-server-bypass-enabled',
      metrics: {
        ...this.metrics,
        successRate: this.metrics.totalGenerations > 0
          ? (this.metrics.successfulGenerations / this.metrics.totalGenerations * 100).toFixed(2) + '%'
          : '0%'
      },
      contextManager: this.contextManager.getHealthStatus(),
      templateEngine: {
        cacheStats: this.templateEngine.getCacheStats()
      },
      mcpAdapter: this.mcpEnabled ? this.mcpAdapter.getHealthStatus() : {
        status: 'disabled',
        reason: 'direct-context-template-flow-only'
      }
    };
  }

  /**
   * Build enhanced Figma URL using our debugging-enabled template manager
   * @param {Object} contextResult - Context Layer result
   * @param {Object} request - Original request
   * @returns {string} Enhanced Figma URL
   */
  async _buildEnhancedFigmaUrl(contextResult, request) {
    // Import and use our debugging-enabled TemplateManager
    try {
      // Lazy load to avoid circular dependencies
      const { TemplateManager } = await import('../data/template-manager.js');
      const templateManager = new TemplateManager();
      templateManager.redisClient = {
        get: () => null,
        set: () => true,
        del: () => true,
        exists: () => false,
        keys: () => []
      };

      // Build figma context from Context Layer output
      const extractedFileKey = this.extractFileIdFromUrl(request.figmaUrl);
      const figmaContext = {
        fileKey: extractedFileKey, // Primary location for Template Manager
        metadata: {
          id: extractedFileKey,
          name: request.frameData?.[0]?.name || request.enhancedFrameData?.[0]?.name || 'Component'
        }
      };

      this.logger.debug('🔍 Context Bridge file key extraction:', {
        originalUrl: request.figmaUrl,
        extractedFileKey: extractedFileKey,
        requestFileKey: request.fileContext?.fileKey
      });

      // Use our enhanced buildFigmaUrl method with debug logging
      const enhancedUrl = templateManager.buildFigmaUrl(figmaContext, request);

      this.logger.info('🔗 Enhanced Figma URL built via Context Bridge:', enhancedUrl);
      return enhancedUrl;

    } catch (error) {
      this.logger.warn('⚠️ Enhanced URL building failed, using fallback:', error.message);
      return request.figmaUrl || 'https://www.figma.com/file/unknown';
    }
  }

  /**
   * Extract enhanced colors using our Phase 1 extraction logic
   */
  async _extractEnhancedColors(contextResult, request) {
    try {
      this.logger.info('🎨 Context Bridge: Enhanced color extraction starting', {
        hasFrameData: !!request.frameData,
        frameDataLength: request.frameData?.length || 0,
        hasStyleExtraction: !!contextResult.styleExtraction,
        hasDesignTokens: !!contextResult.designTokens
      });
      
      // First try to extract from frameData if available
      if (request.frameData && Array.isArray(request.frameData)) {
        const colors = this._extractColorsFromFrameData(request.frameData);
        if (colors.length > 0) {
          return colors.join(', ');
        }
      }

      // Try to extract from style extraction context
      if (contextResult.styleExtraction?.colors && contextResult.styleExtraction.colors.length > 0) {
        return contextResult.styleExtraction.colors.map(c => c.hex || c).join(', ');
      }

      // Try to extract from design tokens
      if (contextResult.designTokens?.colors && Array.isArray(contextResult.designTokens.colors)) {
        return contextResult.designTokens.colors.join(', ');
      }

      // Return descriptive fallback with debug marker
      const fallback = '🎨 ENHANCED: Primary, Secondary, Accent colors from design system';
      this.logger.info('🎨 Context Bridge: Using color fallback:', fallback);
      return fallback;
    } catch (error) {
      this.logger.warn('⚠️ Enhanced color extraction failed:', error.message);
      return 'Primary, Secondary, Accent colors from design system';
    }
  }

  /**
   * Extract enhanced typography using our Phase 1 extraction logic
   */
  async _extractEnhancedTypography(contextResult, request) {
    try {
      // First try to extract from frameData if available
      if (request.frameData && Array.isArray(request.frameData)) {
        const fonts = this._extractFontsFromFrameData(request.frameData);
        if (fonts.length > 0) {
          return fonts.map(f => `${f.family} ${f.size}px/${f.weight}`).join(', ');
        }
      }

      // Try to extract from style extraction context
      if (contextResult.styleExtraction?.typography && contextResult.styleExtraction.typography.length > 0) {
        const fonts = contextResult.styleExtraction.typography;
        return fonts.map(f => `${f.fontFamily || f.family} ${f.fontSize || f.size}px/${f.fontWeight || f.weight}`).join(', ');
      }

      // Return descriptive fallback with debug marker
      const fallback = '🔤 ENHANCED: System fonts: Inter, SF Pro, Roboto';
      this.logger.info('🔤 Context Bridge: Using typography fallback:', fallback);
      return fallback;
    } catch (error) {
      this.logger.warn('⚠️ Enhanced typography extraction failed:', error.message);
      return 'System fonts: Inter, SF Pro, Roboto';
    }
  }

  /**
   * Extract colors from frameData structure
   */
  _extractColorsFromFrameData(frameData) {
    const colors = [];
    const colorSet = new Set();

    const extractFromNode = (node) => {
      // Extract colors from fills
      if (node.fills) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const hex = this._rgbaToHex(fill.color.r, fill.color.g, fill.color.b);
            if (!colorSet.has(hex)) {
              colorSet.add(hex);
              colors.push(hex);
            }
          }
        });
      }

      // Extract colors from strokes
      if (node.strokes) {
        node.strokes.forEach(stroke => {
          if (stroke.type === 'SOLID' && stroke.color) {
            const hex = this._rgbaToHex(stroke.color.r, stroke.color.g, stroke.color.b);
            if (!colorSet.has(hex)) {
              colorSet.add(hex);
              colors.push(hex);
            }
          }
        });
      }

      // Recursively process children
      if (node.children) {
        node.children.forEach(child => extractFromNode(child));
      }
    };

    frameData.forEach(node => extractFromNode(node));
    return colors;
  }

  /**
   * Extract fonts from frameData structure
   */
  _extractFontsFromFrameData(frameData) {
    const fonts = [];
    const fontSet = new Set();

    const extractFromNode = (node) => {
      // Extract fonts from text nodes
      if (node.type === 'TEXT' && node.style) {
        const fontKey = `${node.style.fontFamily}-${node.style.fontSize}-${node.style.fontWeight}`;
        if (!fontSet.has(fontKey)) {
          fontSet.add(fontKey);
          fonts.push({
            family: node.style.fontFamily || 'Unknown',
            size: node.style.fontSize || 16,
            weight: this._convertFontWeight(node.style.fontWeight || 400)
          });
        }
      }

      // Recursively process children
      if (node.children) {
        node.children.forEach(child => extractFromNode(child));
      }
    };

    frameData.forEach(node => extractFromNode(node));
    return fonts;
  }

  /**
   * Convert RGBA to hex
   */
  _rgbaToHex(r, g, b) {
    const toHex = (n) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Convert font weight to readable format
   */
  _convertFontWeight(weight) {
    const weightMap = {
      100: 'Thin',
      200: 'Extra Light',
      300: 'Light',
      400: 'Regular',
      500: 'Medium',
      600: 'Semi Bold',
      700: 'Bold',
      800: 'Extra Bold',
      900: 'Black'
    };
    return weightMap[weight] || 'Regular';
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.templateEngine.clearCache();
    this.logger.info('🧹 Context-Template Bridge caches cleared');
  }
}

export default ContextTemplateBridge;