/**
 * Template Manager - Data Layer Service
 *
 * Provides unified access to template system with Redis caching,
 * Figma context integration, and MCP/API accessibility.
 *
 * Architecture:
 * - Templates are data resources, not AI logic
 * - Redis caching for performance
 * - Integration with Figma session context
 * - Accessible by MCP, API, and LLM services
 */

import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { RedisClient } from './redis-client.js';
import { UniversalTemplateEngine } from '../template/UniversalTemplateEngine.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TemplateManager {
  constructor(options = {}) {
    this.logger = new Logger('TemplateManager');
    this.errorHandler = new ErrorHandler();
    this.redis = new RedisClient();

    // Initialize Universal Template Engine with config directory
    const configDir = join(__dirname, '../../config/templates');
    this.templateEngine = new UniversalTemplateEngine(configDir);

    this.config = {
      cacheTemplates: true,
      cacheTTL: 3600, // 1 hour
      enablePerformanceMetrics: true,
      ...options
    };

    this.performanceMetrics = new Map();
  }

  /**
   * Initialize the template manager
   */
  async initialize() {
    await this.redis.connect();
    this.logger.info('✅ Template Manager initialized with Redis caching');
  }

  /**
   * Generate ticket using Universal Template System with Figma context
   */
  async generateTicket(params) {
    const { platform, documentType, componentName, techStack, figmaContext, requestData } = params;
    const startTime = Date.now();

    this.logger.info(`🎫 Generating ${platform} ticket for ${componentName} using Universal Template System`);

    // Build context for template rendering (moved outside try block for error logging)
    let templateContext;

    try {
      // Create cache key for this specific ticket configuration
      const cacheKey = this.createTicketCacheKey(params);

      // Check cache first (disabled for fresh template generation)
      // TODO: Re-enable caching after template stabilization
      const cacheEnabled = false; // Cache disabled for development
      if (cacheEnabled && this.config.cacheTemplates) {
        const cachedTicket = await this.getCachedTicket(cacheKey);
        if (cachedTicket) {
          this.logger.info(`📋 Using cached ticket: ${cacheKey}`);
          return this.addPerformanceMetrics(cachedTicket, startTime, true);
        }
      }

      // Build context for template rendering
      templateContext = this.buildTemplateContext({
        componentName,
        techStack,
        figmaContext,
        requestData,
        platform,
        documentType
      });

      // Use Universal Template Engine to resolve and render template
      const resolvedTemplate = await this.templateEngine.resolveTemplate(platform, documentType, techStack);
      const renderedTicket = await this.templateEngine.renderTemplate(resolvedTemplate, templateContext);

      this.logger.info('🔍 Universal Template System generated ticket:', {
        template_id: resolvedTemplate._meta?.cacheKey || `${platform}-${documentType}`,
        resolution_path: resolvedTemplate._meta?.resolutionPath || 'fallback',
        contentLength: renderedTicket.length,
        preview: renderedTicket.substring(0, 200) + '...',
        contextKeys: Object.keys(templateContext)
      });

      // Create final ticket object
      const ticket = {
        content: renderedTicket,
        metadata: {
          template_id: resolvedTemplate._meta?.cacheKey || `${platform}-${documentType}`,
          resolution_path: resolvedTemplate._meta?.resolutionPath,
          platform,
          documentType,
          componentName,
          techStack,
          generatedAt: new Date().toISOString(),
          source: 'universal-template-manager'
        }
      };

      // Cache the result
      if (this.config.cacheTemplates) {
        await this.cacheTicket(cacheKey, ticket);
      }

      const result = this.addPerformanceMetrics(ticket, startTime, false);
      this.logger.info(`✅ Template ticket generated in ${result.performance.duration}ms`);

      return result;

    } catch (error) {
      this.logger.error('❌ Template ticket generation failed:', {
        error: error.message,
        stack: error.stack,
        params: { platform, documentType, componentName },
        contextKeys: Object.keys(templateContext || {})
      });

      // Fallback to basic template
      return this.generateFallbackTicket(params, error);
    }
  }

  /**
   * Build comprehensive context for template rendering
   */
  buildTemplateContext(params) {
    const { componentName, techStack, figmaContext, requestData, platform, documentType } = params;

    console.log('🏗️ BUILDING TEMPLATE CONTEXT DEBUG:');
    console.log('  📋 Input params:', {
      componentName,
      techStack,
      platform,
      documentType,
      hasFigmaContext: !!figmaContext,
      hasRequestData: !!requestData
    });
    console.log('  🎨 Request data keys:', Object.keys(requestData || {}));
    console.log('  📊 Figma context keys:', Object.keys(figmaContext || {}));

    // Extract file key from figmaUrl if not available in other sources
    const figmaUrl = requestData?.figmaUrl;
    const extractedFileKey = figmaUrl ? this.extractFileKeyFromUrl(figmaUrl) : null;

    console.log('  🔗 URL extraction:', {
      figmaUrl,
      extractedFileKey,
      screenshot: requestData?.screenshot
    });

    const templateContext = {
      // Figma context data
      figma: {
        component_name: componentName,
        component_type: figmaContext?.type || 'Component',
        file_name: figmaContext?.metadata?.name || requestData?.fileContext?.fileName || 'Design File',
        file_id: figmaContext?.metadata?.id || figmaContext?.fileKey || requestData?.fileContext?.fileKey || requestData?.fileKey || extractedFileKey,
        frame_id: requestData?.frameData?.id || null,
        dimensions: figmaContext?.specifications?.dimensions || { width: 0, height: 0 },
        design_tokens: figmaContext?.specifications?.colors || [],
        dependencies: figmaContext?.components?.map(c => c.name) || [],
        properties: figmaContext?.properties || [],
        variants: figmaContext?.variants || [],
        live_link: this.buildFigmaUrl(figmaContext, requestData, extractedFileKey),
        screenshot_filename: `${componentName}-screenshot.png`,
        screenshot_url: requestData?.screenshot || figmaContext?.screenshot || null,
        screenshot_format: 'png',
        screenshot_markdown: this.generateScreenshotMarkdown(componentName, requestData, figmaContext),
        screenshot_attachment: this.generateScreenshotAttachment(componentName, requestData, figmaContext),
        design_status: 'Ready for Development',
        extracted_colors: this.extractColorTokens(figmaContext, requestData),
        extracted_typography: this.extractTypographyTokens(figmaContext, requestData)
      },

      // Project context (enhanced with comprehensive defaults)
      project: {
        name: 'Design System Project',
        tech_stack: Array.isArray(techStack) ? techStack : [techStack],
        platform,
        document_type: documentType,
        component_type: 'UI Component',
        labels: 'component,design-system',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
        team: 'Development Team',
        cycle: 'Sprint ' + Math.ceil(new Date().getDate() / 7),
        design_system_url: 'https://design-system.company.com',
        component_library_url: 'https://storybook.company.com',
        accessibility_url: 'https://accessibility.company.com',
        testing_standards_url: 'https://testing.company.com'
      },

      // Calculated context (complexity analysis)
      calculated: {
        complexity: this.calculateComplexity(figmaContext),
        hours: this.estimateHours(figmaContext, techStack),
        confidence: this.calculateConfidence(figmaContext),
        similar_components: this.findSimilarComponents(figmaContext),
        risk_factors: this.identifyRiskFactors(figmaContext, techStack),
        priority: this.calculatePriority(figmaContext, techStack),
        story_points: this.calculateStoryPoints(figmaContext, techStack),
        design_analysis: this.generateDesignAnalysisSummary(figmaContext, componentName, requestData),
        implementation_notes: this.generateImplementationNotes(figmaContext, techStack),
        accessibility_requirements: this.generateAccessibilityRequirements(figmaContext)
      },

      // Template aliases (for backward compatibility and shorthand)
      comp: componentName, // Shorthand for component name
      code: Array.isArray(techStack) ? techStack.join(', ') : techStack, // Shorthand for tech stack

      // Organization context (can be enhanced later)
      org: {
        name: 'Organization',
        standards: 'Standard practices'
      },

      // Team context (enhanced with defaults)
      team: {
        size: 'Medium',
        experience: 'Senior',
        assignee: 'Unassigned',
        name: 'Development Team',
        cycle: 'Current Sprint'
      },

      // User context (can be enhanced later)
      user: {
        name: 'System Generated'
      }
    };

    console.log('✅ TEMPLATE CONTEXT BUILT - Final Context Summary:');
    console.log('  🎨 Figma context keys:', Object.keys(templateContext.figma));
    console.log('  🏗️ Project context keys:', Object.keys(templateContext.project));
    console.log('  📊 Calculated context keys:', Object.keys(templateContext.calculated));
    console.log('  🏢 Org context:', templateContext.org.name);
    console.log('  👥 Team context:', templateContext.team.name);
    console.log('  📋 Key values for debugging:');
    console.log(`    figma.live_link: "${templateContext.figma.live_link}"`);
    console.log(`    project.repository_url: "${templateContext.project.repository_url || 'NOT SET'}"`);
    console.log(`    project.storybook_url: "${templateContext.project.storybook_url || 'NOT SET'}"`);
    console.log(`    project.wiki_url: "${templateContext.project.wiki_url || 'NOT SET'}"`);
    console.log(`    project.analytics_url: "${templateContext.project.analytics_url || 'NOT SET'}"`);

    return templateContext;
  }

  /**
   * Calculate complexity based on Figma context
   */
  calculateComplexity(figmaContext) {
    if (!figmaContext) {return 'medium';}

    let complexityScore = 0;

    // Component count
    const componentCount = figmaContext.components?.length || 0;
    if (componentCount > 5) {complexityScore += 2;}
    else if (componentCount > 2) {complexityScore += 1;}

    // Properties count
    const propertiesCount = figmaContext.properties?.length || 0;
    if (propertiesCount > 8) {complexityScore += 2;}
    else if (propertiesCount > 4) {complexityScore += 1;}

    // Variants count
    const variantsCount = figmaContext.variants?.length || 0;
    if (variantsCount > 6) {complexityScore += 2;}
    else if (variantsCount > 3) {complexityScore += 1;}

    if (complexityScore >= 5) {return 'complex';}
    if (complexityScore >= 3) {return 'medium';}
    return 'simple';
  }

  /**
   * Estimate development hours
   */
  estimateHours(figmaContext, documentType, techStack) {
    const complexity = this.calculateComplexity(figmaContext);
    const isComplexTech = Array.isArray(techStack)
      ? techStack.some(tech => tech && tech.toLowerCase().includes('aem'))
      : techStack && techStack.toLowerCase().includes('aem');

    let baseHours = 4; // Simple component

    if (complexity === 'medium') {baseHours = 8;}
    if (complexity === 'complex') {baseHours = 16;}

    // Complex tech stacks need more time
    if (isComplexTech) {baseHours *= 1.5;}

    return Math.round(baseHours);
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(figmaContext) {
    if (!figmaContext) {return 0.6;}

    let confidence = 0.7; // Base confidence

    if (figmaContext.specifications) {confidence += 0.1;}
    if (figmaContext.components?.length > 0) {confidence += 0.1;}
    if (figmaContext.properties?.length > 0) {confidence += 0.05;}
    if (figmaContext.variants?.length > 0) {confidence += 0.05;}

    return Math.min(confidence, 0.95);
  }

  /**
   * Find similar components (placeholder)
   */
  findSimilarComponents(figmaContext) {
    if (!figmaContext?.components) {return [];}

    // Simple similarity based on component types
    return figmaContext.components
      .filter(c => c.type === 'COMPONENT')
      .map(c => c.name)
      .slice(0, 3);
  }

  /**
   * Identify risk factors
   */
  identifyRiskFactors(figmaContext, techStack) {
    const risks = [];

    if (!figmaContext) {risks.push('Limited design context');}
    if (figmaContext?.variants?.length > 8) {risks.push('High variant complexity');}
    if (Array.isArray(techStack) && techStack.length > 3) {risks.push('Multiple tech stacks');}

    return risks;
  }

  /**
   * Create cache key for ticket
   */
  createTicketCacheKey(params) {
    const { platform, documentType, componentName, techStack } = params;
    const techStackStr = Array.isArray(techStack) ? techStack.join('-') : techStack;
    const normalized = `${platform}-${documentType}-${componentName}-${techStackStr}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '_')
      .substring(0, 100);

    return `template:${normalized}`;
  }

  /**
   * Get cached ticket
   */
  async getCachedTicket(cacheKey) {
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
    } catch (error) {
      this.logger.warn(`Cache read failed for ${cacheKey}:`, error.message);
    }
    return null;
  }

  /**
   * Cache generated ticket
   */
  async cacheTicket(cacheKey, ticket) {
    try {
      await this.redis.set(cacheKey, JSON.stringify(ticket), this.config.cacheTTL);
      this.logger.debug(`💾 Cached template ticket: ${cacheKey}`);
    } catch (error) {
      this.logger.warn(`Cache write failed for ${cacheKey}:`, error.message);
    }
  }

  /**
   * Add performance metrics to result
   */
  addPerformanceMetrics(ticket, startTime, fromCache) {
    const duration = Date.now() - startTime;

    ticket.performance = {
      duration,
      fromCache,
      timestamp: new Date().toISOString(),
      source: 'template-manager'
    };

    // Track metrics
    if (this.config.enablePerformanceMetrics) {
      this.performanceMetrics.set(Date.now(), {
        duration,
        fromCache,
        templateUsed: ticket.metadata?.template_id || 'unknown'
      });

      // Keep only last 100 metrics
      if (this.performanceMetrics.size > 100) {
        const firstKey = this.performanceMetrics.keys().next().value;
        this.performanceMetrics.delete(firstKey);
      }
    }

    return ticket;
  }

  /**
   * Generate fallback ticket when template system fails
   */
  generateFallbackTicket(params, error) {
    const { platform, componentName, techStack } = params;

    this.logger.warn('🔄 Using fallback ticket generation');

    const fallbackContent = `# ${componentName} Implementation

## Description
Implement the ${componentName} component based on design specifications.

## Technical Requirements
- **Platform**: ${platform}
- **Tech Stack**: ${Array.isArray(techStack) ? techStack.join(', ') : techStack}

## Acceptance Criteria
- [ ] Component matches design specifications exactly
- [ ] Component is responsive across all devices
- [ ] Component passes accessibility testing
- [ ] Unit tests provide adequate coverage
- [ ] Code follows team standards and conventions

## Notes
Generated using fallback template due to: ${error.message}

---
Generated at ${new Date().toISOString()} via Template Manager (Fallback)`;

    return {
      content: fallbackContent,
      metadata: {
        template_id: 'fallback',
        platform,
        componentName,
        techStack,
        generatedAt: new Date().toISOString(),
        source: 'template-manager-fallback',
        error: error.message
      },
      performance: {
        duration: 0,
        fromCache: false,
        timestamp: new Date().toISOString(),
        source: 'fallback'
      }
    };
  }

  /**
   * List available templates from Universal Template System
   */
  async listTemplates() {
    try {
      // Get available templates from the Universal Template System
      const platforms = ['jira', 'wiki', 'figma', 'storybook'];
      const documentTypes = ['component', 'feature', 'service', 'authoring'];
      const templates = [];

      for (const platform of platforms) {
        for (const documentType of documentTypes) {
          try {
            const resolvedTemplate = await this.templateEngine.resolveTemplate(platform, documentType, 'custom');
            templates.push({
              template_id: `${platform}-${documentType}`,
              platform,
              document_type: documentType,
              resolution_path: resolvedTemplate._meta?.resolutionPath || 'fallback',
              available: true,
              description: `${platform} ${documentType} template with intelligent fallback`
            });
          } catch (_error) {
            // Template resolution failed, but we can still list it as unavailable
            templates.push({
              template_id: `${platform}-${documentType}`,
              platform,
              document_type: documentType,
              resolution_path: 'error',
              available: false,
              description: `${platform} ${documentType} template (resolution failed)`
            });
          }
        }
      }

      return templates;
    } catch (error) {
      this.logger.error('Failed to list templates:', error);
      return [];
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    if (this.performanceMetrics.size === 0) {
      return null;
    }

    const metrics = Array.from(this.performanceMetrics.values());
    const totalRequests = metrics.length;
    const cacheHits = metrics.filter(m => m.fromCache).length;
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;

    return {
      totalRequests,
      cacheHits,
      cacheHitRate: cacheHits / totalRequests,
      averageDuration: Math.round(avgDuration),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate design analysis summary
   */
  generateDesignAnalysisSummary(figmaContext, componentName, requestData) {
    const parts = [];

    // Get enhanced data if available
    const enhancedData = requestData?.enhancedFrameData?.[0];
    const hierarchy = enhancedData?.hierarchy;

    // Component type analysis with enhanced intelligence
    const nameLower = (componentName || '').toLowerCase();
    if (nameLower.includes('why solidigm')) {
      parts.push('Complex marketing showcase component featuring multiple content cards, video elements, and interactive sections for company positioning.');
    } else if (nameLower.includes('case studies')) {
      parts.push('Case study showcase component with rich media content and structured information display.');
    } else if (nameLower.includes('button')) {
      parts.push('Interactive button component with multiple states and click handling.');
    } else if (nameLower.includes('card')) {
      parts.push('Content card component for information display and organization.');
    } else {
      parts.push(`"${componentName}" component requiring custom implementation.`);
    }

    // Enhanced design analysis from hierarchical data
    if (hierarchy) {
      const layerCount = hierarchy.layers?.length || 0;
      const componentCount = hierarchy.componentCount || 0;
      const textLayers = hierarchy.textLayerCount || 0;
      const designTokens = hierarchy.designTokens;

      if (layerCount > 30) {
        parts.push(`Highly complex component with ${layerCount} layers across ${hierarchy.totalDepth} depth levels.`);
      } else if (layerCount > 10) {
        parts.push(`Moderate complexity with ${layerCount} layers requiring structured implementation.`);
      }

      if (designTokens?.colors?.length > 0) {
        parts.push(`Uses ${designTokens.colors.length} color tokens including brand colors (${designTokens.colors.slice(0, 3).join(', ')}).`);
      }

      if (designTokens?.typography?.length > 0) {
        const fonts = [...new Set(designTokens.typography.map(t => t.split('-')[0]))];
        parts.push(`Typography system uses ${fonts.join(', ')} with ${designTokens.typography.length} variants.`);
      }

      if (textLayers > 5) {
        parts.push(`Content-heavy component with ${textLayers} text elements requiring internationalization support.`);
      }

      if (componentCount > 2) {
        parts.push(`Contains ${componentCount} nested component instances requiring proper prop drilling.`);
      }
    } else {
      // Fallback analysis
      const colors = figmaContext?.specifications?.colors || [];
      if (colors.length > 0) {
        parts.push(`Uses ${colors.length} color token${colors.length > 1 ? 's' : ''} from the design system.`);
      }

      const componentCount = figmaContext?.components?.length || 0;
      if (componentCount > 3) {
        parts.push(`Complex component with ${componentCount} nested elements requiring careful state management.`);
      } else if (componentCount > 1) {
        parts.push(`Moderate complexity with ${componentCount} child components.`);
      }
    }

    return parts.join(' ') || `Standard implementation of "${componentName}" component.`;
  }

  /**
   * Extract color tokens from Figma context
   */
  extractColorTokens(figmaContext, requestData) {
    // Try to get colors from enhanced frame data first
    const enhancedColors = requestData?.enhancedFrameData?.[0]?.hierarchy?.designTokens?.colors;
    if (enhancedColors && enhancedColors.length > 0) {
      return enhancedColors.slice(0, 6).join(', ');
    }

    // Fallback to specifications
    if (figmaContext?.specifications?.colors && figmaContext.specifications.colors.length > 0) {
      return figmaContext.specifications.colors
        .slice(0, 5)
        .map(color => `${color.hex || color}`)
        .join(', ');
    }

    return null;
  }

  /**
   * Extract typography tokens from Figma context
   */
  extractTypographyTokens(figmaContext, requestData) {
    // Try to get typography from enhanced frame data first
    const enhancedTypography = requestData?.enhancedFrameData?.[0]?.hierarchy?.designTokens?.typography;
    if (enhancedTypography && enhancedTypography.length > 0) {
      const uniqueFonts = [...new Set(enhancedTypography)];
      return `Fonts: ${uniqueFonts.slice(0, 4).join(', ')}`;
    }

    // Fallback to specifications
    if (figmaContext?.specifications?.typography) {
      const typo = figmaContext.specifications.typography;
      const parts = [];

      if (typo.fonts && typo.fonts.length > 0) {
        parts.push(`Fonts: ${typo.fonts.slice(0, 3).join(', ')}`);
      }

      if (typo.sizes && typo.sizes.length > 0) {
        parts.push(`Sizes: ${typo.sizes.slice(0, 4).join('px, ')}px`);
      }

      return parts.length > 0 ? parts.join(' | ') : null;
    }

    return null;
  }

  /**
   * Extract file key from Figma URL
   * @param {string} figmaUrl - The Figma URL to extract file key from
   * @returns {string|null} - The extracted file key or null if not found
   */
  extractFileKeyFromUrl(figmaUrl) {
    if (!figmaUrl) {
      return null;
    }

    // Match Figma URLs: https://www.figma.com/file/<fileKey>/* or https://www.figma.com/design/<fileKey>/*
    // Production keys are 22+ chars, but allow shorter keys for testing
    const match = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]{8,})/);
    return match ? match[1] : null;
  }

  /**
   * Build complete Figma URL with node ID, project name, and team parameters
   * @param {Object} figmaContext - Figma context data
   * @param {Object} requestData - Request data containing frame info
   * @param {string} extractedFileKey - File key extracted from URL
   * @returns {string} - Complete Figma URL
   */
  buildFigmaUrl(figmaContext, requestData, extractedFileKey) {
    // Get file key from various sources
    const fileKey = figmaContext?.metadata?.id || figmaContext?.fileKey ||
                   requestData?.fileContext?.fileKey || requestData?.fileKey || extractedFileKey;

    if (!fileKey || fileKey === 'unknown') {
      return 'https://www.figma.com/file/unknown';
    }

    // Get project name for URL (encode for URL safety)
    const projectName = requestData?.fileContext?.fileName ||
                       figmaContext?.metadata?.name ||
                       requestData?.metadata?.fileName ||
                       'Design-File';
    const encodedProjectName = encodeURIComponent(projectName.replace(/\s+/g, '-'));

    // Get node ID from frame data
    const nodeId = requestData?.frameData?.id ||
                  requestData?.enhancedFrameData?.[0]?.id ||
                  requestData?.metadata?.nodeId;

    // Extract team parameter from original Figma URL if available
    let teamParam = null;
    const originalUrl = requestData?.figmaUrl || requestData?.fileContext?.url;
    if (originalUrl) {
      const urlMatch = originalUrl.match(/[?&]t=([^&]+)/);
      if (urlMatch) {
        teamParam = urlMatch[1];
      }
    }

    // Build the complete URL with parameters
    let baseUrl = `https://www.figma.com/design/${fileKey}/${encodedProjectName}`;
    const params = [];

    if (nodeId) {
      // Fix node ID format: handle semicolon-separated IDs and proper encoding
      let formattedNodeId = nodeId;

      // If nodeId contains semicolons, convert to comma-separated and take primary
      if (formattedNodeId.includes(';')) {
        const nodeIds = formattedNodeId.split(';');
        formattedNodeId = nodeIds[0]; // Use primary node ID for deep linking
      }

      // Ensure proper URL encoding for node ID
      params.push(`node-id=${encodeURIComponent(formattedNodeId)}`);
    }

    if (teamParam) {
      params.push(`t=${teamParam}`);
    }

    // Add mode parameter for better deep-linking
    params.push('mode=design');

    // Add scaling for better viewing
    params.push('scaling=min-zoom');

    if (params.length > 0) {
      baseUrl += `?${params.join('&')}`;
    }

    return baseUrl;
  }

  /**
   * Generate screenshot markdown for better copy-paste compatibility
   */
  generateScreenshotMarkdown(componentName, requestData, figmaContext) {
    const screenshotUrl = requestData?.screenshot || figmaContext?.screenshot;
    const filename = `${componentName}-screenshot.png`;

    if (screenshotUrl) {
      // Return multiple formats for maximum compatibility
      return {
        markdown: `![${componentName} Component](${screenshotUrl})`,
        html: `<img src="${screenshotUrl}" alt="${componentName} Component" style="max-width: 100%; height: auto;" />`,
        jira: `!${screenshotUrl}|thumbnail!`,
        confluence: `!${screenshotUrl}|thumbnail!`,
        wiki: `[[File:${filename}|thumb|${componentName} Component]]`
      };
    }

    return {
      markdown: `![${componentName} Component](${filename})`,
      html: `<img src="${filename}" alt="${componentName} Component" style="max-width: 100%; height: auto;" />`,
      jira: `!${filename}|thumbnail!`,
      confluence: `!${filename}|thumbnail!`,
      wiki: `[[File:${filename}|thumb|${componentName} Component]]`
    };
  }

  /**
   * Generate screenshot attachment information
   */
  generateScreenshotAttachment(componentName, requestData, figmaContext) {
    const screenshotUrl = requestData?.screenshot || figmaContext?.screenshot;
    const filename = `${componentName}-screenshot.png`;

    return {
      filename,
      url: screenshotUrl || null,
      alt_text: `${componentName} Component Design`,
      title: `${componentName} - Design Reference`,
      description: `Visual reference for the ${componentName} component implementation`,
      // Instructions for manual attachment
      copy_paste_note: screenshotUrl ?
        `💡 For Jira: Open ${screenshotUrl} → Right-click → Save Image → Drag file to Jira ticket` :
        '💡 For Jira: Take screenshot in Figma → Save as PNG → Drag file to Jira ticket'
    };
  }

  /**
   * Calculate priority based on component complexity and tech stack
   */
  calculatePriority(figmaContext, techStack) {
    const complexity = this.calculateComplexity(figmaContext);
    const isComplexTech = Array.isArray(techStack)
      ? techStack.some(tech => tech && tech.toLowerCase().includes('aem'))
      : techStack && techStack.toLowerCase().includes('aem');

    if (complexity === 'complex' || isComplexTech) {
      return 'High';
    }
    if (complexity === 'medium') {
      return 'Medium';
    }
    return 'Low';
  }

  /**
   * Calculate story points based on complexity and estimated hours
   */
  calculateStoryPoints(figmaContext, techStack) {
    const hours = this.estimateHours(figmaContext, techStack);

    if (hours <= 4) {return '3';}
    if (hours <= 8) {return '5';}
    if (hours <= 16) {return '8';}
    return '13';
  }

  /**
   * Generate implementation notes based on component analysis
   */
  generateImplementationNotes(figmaContext, techStack) {
    const notes = [];
    const complexity = this.calculateComplexity(figmaContext);

    if (complexity === 'complex') {
      notes.push('Consider breaking down into smaller sub-components');
      notes.push('Plan for comprehensive testing strategy');
    }

    if (Array.isArray(techStack) && techStack.some(tech => tech.toLowerCase().includes('aem'))) {
      notes.push('Follow AEM component development best practices');
      notes.push('Ensure Touch UI compatibility');
      notes.push('Implement proper Sling Model bindings');
    }

    return notes.length > 0 ? notes : ['Standard component implementation approach'];
  }

  /**
   * Generate accessibility requirements based on component type
   */
  generateAccessibilityRequirements(figmaContext) {
    const requirements = [
      'WCAG 2.1 AA compliance',
      'Proper semantic HTML structure',
      'Keyboard navigation support',
      'Screen reader compatibility'
    ];

    // Add specific requirements based on component analysis
    if (figmaContext?.components?.some(c => c.name.toLowerCase().includes('button'))) {
      requirements.push('Proper button states and focus indicators');
    }

    if (figmaContext?.components?.some(c => c.name.toLowerCase().includes('form'))) {
      requirements.push('Form field labels and error messages');
    }

    return requirements;
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    await this.redis.disconnect();
    this.performanceMetrics.clear();
    this.logger.info('🧹 Template Manager cleaned up');
  }
}