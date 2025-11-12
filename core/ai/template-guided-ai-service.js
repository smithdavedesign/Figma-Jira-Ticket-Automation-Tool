/**
 * Template-Guided AI Service
 *
 * Combines the power of AI generation with the structure of YAML templates.
 * Uses template variables as guidance for AI prompts, ensuring consistent
 * output while leveraging AI intelligence for content generation.
 *
 * Features:
 * - Template structure-aware AI prompts
 * - YAML template variable population via AI
 * - Unified context integration
 * - Intelligent fallback handling
 * - Multi-modal design analysis with template guidance
 */

import { Logger } from '../utils/logger.js';
import { UniversalTemplateEngine } from '../template/UniversalTemplateEngine.js';
import { UnifiedContextBuilder } from '../data/unified-context-builder.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TemplateGuidedAIService {
  constructor(options = {}) {
    this.logger = new Logger('TemplateGuidedAIService');
    this.aiService = options.aiService; // Visual Enhanced AI Service
    this.configService = options.configService;
    this.cacheService = options.cacheService; // Enhanced: Add caching support

    // Performance and quality metrics
    this.metrics = {
      totalRequests: 0,
      successfulGenerations: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      templateCompleteness: 0,
      aiConfidence: 0
    };

    // Initialize unified context builder with AI service
    this.contextBuilder = new UnifiedContextBuilder({
      configService: this.configService,
      aiService: this.aiService,
      logger: this.logger // Enhanced: Pass logger to context builder
    });

    // Initialize template engine - use correct path to AI templates
    const configDir = join(__dirname, './templates');
    this.templateEngine = new UniversalTemplateEngine(configDir);

    // Template validation cache
    this.templateValidationCache = new Map();

    // Track service start time for uptime calculation
    this.startTime = Date.now();

    this.logger.info('✅ Template-Guided AI Service initialized with enhanced caching & metrics');
  }

  /**
   * Generate ticket using template structure to guide AI generation
   * Enhanced with comprehensive caching, logging, and performance monitoring
   */
  async generateTemplateGuidedTicket(params) {
    const { platform, documentType, componentName, techStack, figmaContext, requestData } = params;
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.metrics.totalRequests++;

    this.logger.info(`🤖 [${requestId}] Starting template-guided AI generation:`, {
      component: componentName,
      platform,
      documentType,
      techStack: Array.isArray(techStack) ? techStack.join(', ') : techStack,
      hasFigmaContext: !!figmaContext,
      hasRequestData: !!requestData
    });

    try {
      // 🔍 DEBUG: Log incoming parameters
      this.logger.info(`🔍 [${requestId}] Template-Guided AI Parameters:`, {
        platform,
        documentType,
        componentName,
        techStack: Array.isArray(techStack) ? techStack.join(', ') : techStack,
        hasFigmaContext: !!figmaContext,
        hasRequestData: !!requestData,
        figmaContextKeys: figmaContext ? Object.keys(figmaContext) : [],
        requestDataKeys: requestData ? Object.keys(requestData) : []
      });

      // STEP 1: Skip cache for debugging - FORCE FRESH GENERATION
      this.logger.info(`🚫 [${requestId}] Cache DISABLED for debugging - forcing fresh AI generation`);

      // DISABLED CACHE CHECK FOR DEBUGGING
      // const cacheKey = this.createCacheKey(params);
      // let cachedResult = null;
      // if (this.cacheService) {
      //   cachedResult = await this.cacheService.get(cacheKey);
      //   if (cachedResult) return cachedResult;
      // }

      // STEP 2: Build unified context that serves both template and AI
      const contextStartTime = Date.now();
      this.logger.info(`🔄 [${requestId}] Building unified context...`);

      const unifiedContext = await this.contextBuilder.buildUnifiedContext({
        componentName,
        techStack,
        figmaContext,
        requestData,
        platform,
        documentType,
        options: {
          enableAIEnhancement: true,
          requestId
        }
      });

      const contextDuration = Date.now() - contextStartTime;
      this.logger.info(`✅ [${requestId}] Unified context built in ${contextDuration}ms:`, {
        variables: Object.keys(unifiedContext).length,
        figmaContext: !!unifiedContext.figma,
        designTokens: !!unifiedContext.design,
        aiEnhanced: !!unifiedContext.ai_enhanced
      });

      // STEP 3: Get and validate template structure
      const templateStartTime = Date.now();
      this.logger.info(`📋 [${requestId}] Resolving template structure...`);

      const templateStructure = await this.getTemplateStructure(platform, documentType, techStack);
      const templateDuration = Date.now() - templateStartTime;

      this.logger.info(`✅ [${requestId}] Template structure resolved in ${templateDuration}ms:`, {
        variables: Object.keys(templateStructure.variables || {}).length,
        sections: Object.keys(templateStructure.sections || {}).length,
        templateType: templateStructure.type || 'base'
      });

      // STEP 4: Generate AI-enhanced ticket using template structure as guidance
      const aiStartTime = Date.now();
      this.logger.info(`🧠 [${requestId}] Starting AI generation guided by template structure...`);

      const aiGeneratedTicket = await this.generateAIGuidedByTemplate(
        unifiedContext,
        templateStructure,
        { platform, documentType, componentName, techStack, requestId }
      );

      const aiDuration = Date.now() - aiStartTime;
      this.logger.info(`✅ [${requestId}] AI generation completed in ${aiDuration}ms`);

      // STEP 5: Validate and enhance the generated ticket
      const validationStartTime = Date.now();
      this.logger.info(`🔍 [${requestId}] Validating and enhancing generated ticket...`);

      const validatedTicket = await this.validateAndEnhanceTicket(
        aiGeneratedTicket,
        unifiedContext,
        templateStructure,
        { requestId }
      );

      const validationDuration = Date.now() - validationStartTime;
      const totalDuration = Date.now() - startTime;

      // STEP 6: Calculate quality metrics
      const contextCompleteness = this.calculateContextCompleteness(unifiedContext);
      const aiConfidence = unifiedContext.ai_confidence || aiGeneratedTicket.confidence || 0.8;

      // Update running metrics
      this.metrics.successfulGenerations++;
      this.metrics.averageResponseTime = (this.metrics.averageResponseTime + totalDuration) / 2;
      this.metrics.templateCompleteness = (this.metrics.templateCompleteness + contextCompleteness) / 2;
      this.metrics.aiConfidence = (this.metrics.aiConfidence + aiConfidence) / 2;

      const result = {
        content: validatedTicket,
        metadata: {
          template_id: `template-guided-ai-${platform}-${documentType}`,
          generation_method: 'template-guided-ai',
          generationType: 'template-guided-ai',
          platform,
          documentType,
          componentName,
          techStack,
          generatedAt: new Date().toISOString(),
          source: 'template-guided-ai-service',
          context_completeness: contextCompleteness,
          ai_confidence: aiConfidence,
          requestId
        },
        performance: {
          duration: totalDuration,
          breakdown: {
            contextBuilding: contextDuration,
            templateResolution: templateDuration,
            aiGeneration: aiDuration,
            validation: validationDuration
          },
          fromCache: false,
          timestamp: new Date().toISOString(),
          source: 'template-guided-ai',
          requestId
        }
      };

      // STEP 7: Skip caching for debugging
      this.logger.info(`🚫 [${requestId}] Cache write DISABLED for debugging`);

      // DISABLED CACHE WRITE FOR DEBUGGING
      // if (this.cacheService && result.metadata.context_completeness > 0.7) {
      //   await this.cacheService.set(cacheKey, result, 3600);
      // }

      this.logger.info(`🎯 [${requestId}] Template-guided AI generation completed successfully:`, {
        totalDuration: `${totalDuration}ms`,
        contextCompleteness: `${Math.round(contextCompleteness * 100)}%`,
        aiConfidence: `${Math.round(aiConfidence * 100)}%`,
        ticketLength: validatedTicket.length,
        cached: true
      });

      return result;

    } catch (error) {
      this.logger.error(`❌ [${requestId}] Template-guided AI generation failed:`, {
        error: error.message,
        stack: error.stack?.substring(0, 1000),
        duration: Date.now() - startTime,
        params: {
          platform,
          documentType,
          componentName,
          hasFigmaContext: !!figmaContext,
          hasRequestData: !!requestData
        }
      });

      // 🔍 DEBUG: Log specific failure details
      if (error.message.includes('buildUnifiedContext')) {
        this.logger.error(`❌ [${requestId}] Context building failed - check unified context builder`);
      } else if (error.message.includes('template')) {
        this.logger.error(`❌ [${requestId}] Template resolution failed - check template engine`);
      } else if (error.message.includes('AI') || error.message.includes('visual')) {
        this.logger.error(`❌ [${requestId}] AI processing failed - check visual AI service`);
      }

      return this.generateFallbackTicket(params, error, requestId);
    }
  }

  /**
   * Get template structure to guide AI generation
   */
  async getTemplateStructure(platform, documentType, techStack) {
    try {
      // Resolve template using Universal Template Engine
      const resolvedTemplate = await this.templateEngine.resolveTemplate(platform, documentType, techStack);

      // Extract template structure and variables
      const templateStructure = this.extractTemplateStructure(resolvedTemplate);

      this.logger.info('📋 Template structure extracted for AI guidance:', {
        variables: Object.keys(templateStructure.variables || {}).length,
        sections: Object.keys(templateStructure.sections || {}).length,
        resources: templateStructure.resources?.length || 0
      });

      return templateStructure;
    } catch (error) {
      this.logger.warn('Template structure extraction failed, using base structure:', error.message);
      return this.getBaseTemplateStructure();
    }
  }

  /**
   * Extract structured information from resolved template (fully leveraging base.yml)
   */
  extractTemplateStructure(resolvedTemplate) {
    const structure = {
      variables: {},
      sections: {},
      resources: [],
      validation_rules: [],
      templateMetadata: {}
    };

    if (!resolvedTemplate?.template) {
      return structure;
    }

    const template = resolvedTemplate.template;

    // Extract ALL variables from base template
    if (template.variables) {
      structure.variables = template.variables;
      this.logger.info('📋 Extracted template variables:', Object.keys(template.variables).length);
    }

    // Extract design structure with all design tokens
    if (template.design) {
      structure.sections.design = template.design;
      // Include specific design token categories
      if (template.design.colors) {structure.sections.designTokens_colors = template.design.colors;}
      if (template.design.typography) {structure.sections.designTokens_typography = template.design.typography;}
      if (template.design.spacing) {structure.sections.designTokens_spacing = template.design.spacing;}
      if (template.design.states) {structure.sections.designTokens_states = template.design.states;}
      if (template.design.accessibility) {structure.sections.designTokens_accessibility = template.design.accessibility;}
      if (template.design.motion) {structure.sections.designTokens_motion = template.design.motion;}
      if (template.design.breakpoints) {structure.sections.designTokens_breakpoints = template.design.breakpoints;}
    }

    // Extract resources (Figma, Storybook, Wiki, GitHub, Analytics)
    if (template.resources) {
      structure.resources = template.resources;
    }

    // Extract authoring information (AEM/CQ specific)
    if (template.authoring) {
      structure.sections.authoring = template.authoring;
    }

    // Extract logging/validation rules
    if (template.logging) {
      structure.validation_rules = template.logging;
    }

    // Store template metadata for AI context
    structure.templateMetadata = {
      hasDesignTokens: !!(template.design?.colors || template.design?.typography),
      hasResources: !!(template.resources?.length > 0),
      hasAuthoring: !!template.authoring,
      variableCount: Object.keys(template.variables || {}).length,
      resourceCount: template.resources?.length || 0,
      designSections: Object.keys(template.design || {}).length
    };

    this.logger.info('📋 Full template structure extracted:', {
      variables: Object.keys(structure.variables).length,
      sections: Object.keys(structure.sections).length,
      resources: structure.resources.length,
      hasDesignTokens: structure.templateMetadata.hasDesignTokens,
      hasAuthoring: structure.templateMetadata.hasAuthoring
    });

    return structure;
  }

  /**
   * Generate AI-guided ticket using template structure
   */
  async generateAIGuidedByTemplate(unifiedContext, templateStructure, options) {
    const { platform, documentType, componentName, techStack, requestId } = options;

    try {
      // 🚫 REMOVED: Direct template rendering - we want AI to generate content!
      // The previous logic was using template rendering instead of AI generation

      this.logger.info(`🤖 [${requestId}] Starting AI-guided generation for ${platform}/${documentType} with template structure`);

      if (!this.aiService) {
        throw new Error('AI Service not available for template-guided generation');
      }

      // Build template-guided prompt that instructs AI to use template structure
      const templateGuidedPrompt = this.buildTemplateGuidedPrompt(unifiedContext, templateStructure, options);

      this.logger.info(`🧠 [${requestId}] Built template-guided prompt, calling AI service...`);

      // Use AI service to generate content guided by template structure
      const aiOptions = {
        ...options,
        useTemplateStructure: true,
        templateVariables: Object.keys(templateStructure.variables || {}),
        expectedSections: Object.keys(templateStructure.sections || {}),
        platform,
        documentType,
        componentName,
        techStack
      };

      // ✅ CRITICAL FIX: Always call AI service for intelligent content generation
      const aiResult = await this.aiService.processVisualEnhancedContext(
        {
          ...unifiedContext,
          templateStructure,
          templateGuidedPrompt,
          // Extract proper file key for Figma URLs
          fileKey: this.extractFileKey(unifiedContext),
          componentName,
          platform,
          documentType
        },
        aiOptions
      );

      this.logger.info(`✅ [${requestId}] AI-guided generation completed successfully`);

      // ✅ CRITICAL FIX: aiResult is now guaranteed to be an object with content property
      return {
        content: aiResult.content,
        confidence: aiResult.confidence || 0.8,
        metadata: aiResult.metadata || {},
        source: 'ai-guided-by-template',
        templateUsed: `${platform}/${documentType}`,
        aiEnhanced: true
      };

    } catch (error) {
      this.logger.error(`❌ [${requestId}] AI-guided template generation failed:`, error.message);

      // Enhanced error handling with fallback to template rendering if AI fails
      this.logger.warn(`🔄 [${requestId}] Falling back to template rendering due to AI failure`);

      try {
        const templateVariables = this.extractTemplateVariablesFromContext(unifiedContext, componentName, techStack);
        const resolvedTemplate = await this.templateEngine.resolveTemplate(platform, documentType, techStack);

        if (resolvedTemplate?.template?.content) {
          const renderedContent = await this.templateEngine.renderTemplate(resolvedTemplate.template.content, templateVariables);

          this.logger.info(`✅ [${requestId}] Fallback template rendering successful`);

          return {
            content: renderedContent,
            source: 'template-fallback',
            confidence: 0.7,
            templateUsed: `${platform}/${documentType}`,
            aiEnhanced: false,
            fallbackReason: error.message
          };
        }
      } catch (fallbackError) {
        this.logger.error(`❌ [${requestId}] Template fallback also failed:`, fallbackError.message);
      }

      throw error;
    }
  }

  /**
   * Build template-guided prompt that instructs AI to follow template structure
   */
  buildTemplateGuidedPrompt(unifiedContext, templateStructure, options) {
    const { componentName, techStack } = options;

    // Layer 1: System Context
    const systemPrompt = `You are an expert technical product assistant who converts design specifications into Jira tickets for implementation.
Always output in Jira markup syntax — never JSON or YAML.
Your expertise covers design systems, component architecture, and technical requirements extraction.`;

    // Layer 2: Task Definition
    const taskPrompt = `Generate a Jira-ready ticket for implementing a UI component based on Figma design context and project metadata.
Follow the required Jira structure precisely and ensure every section provides actionable implementation details.`;

    // Layer 3: Template Structure (configurable)
    const templateStructurePrompt = this.buildJiraTemplateStructure(componentName, techStack, templateStructure);

    // Layer 4: Rules and Requirements
    const rulesPrompt = `## Jira Markup Rules
- Use Jira markup syntax (h1., h2., *, {color}, [text|url])
- Do not invent fake placeholders or use "Not Found", "TBD", "unknown"
- If data is missing, infer intelligently based on component type and industry standards
- Ensure every section contains meaningful, actionable content
- Output must be directly pasteable into Jira
- Extract real data from context - never use template fallbacks

## Critical Requirements
1. **JIRA MARKUP OUTPUT**: Return ONLY clean Jira markup - NO YAML, NO JSON, NO indexed format
2. **REAL DATA EXTRACTION**: Extract actual component names, colors, URLs from provided context
3. **SMART INFERENCE**: Generate realistic story points, priorities, technical specs based on component analysis
4. **FILE KEY USAGE**: MUST use actual file key from context in ALL Figma URLs - NEVER use "unknown"
5. **COMPLETE COVERAGE**: Include ALL design token categories, ALL 5 resources, ALL sections`;

    // Layer 5: Context Data
    const contextData = `## CONTEXT DATA FOR EXTRACTION:
${this.formatDetailedContextForAI(unifiedContext)}`;

    // Combine all layers
    return [
      systemPrompt,
      taskPrompt,
      templateStructurePrompt,
      rulesPrompt,
      contextData
    ].join('\n\n');
  }

  /**
   * Build configurable Jira template structure using available template variables
   */
  buildJiraTemplateStructure(componentName, techStack, templateStructure) {
    // Extract available variables from template structure
    const resources = templateStructure?.resources || [];

    // Build dynamic template structure based on available variables
    const jiraTemplate = {
      header: `h1. ${this.getVariableInstruction('figma.component_name', componentName)} - ${this.getVariableInstruction('calculated.document_type', 'Component Implementation')}`,
      sections: []
    };

    // Project Context Section - use available variables
    const projectSection = {
      title: 'h2. 📋 Project Context & Component Details',
      fields: [
        `*Project*: ${this.getVariableInstruction('project.name', '[Extract from context - use actual project name]')}`,
        `*Component*: ${this.getVariableInstruction('figma.component_name', componentName)}`,
        `*Type*: ${this.getVariableInstruction('figma.component_type', '[Determine from Figma analysis: INSTANCE, COMPONENT, FRAME]')}`,
        `*Issue Type*: ${this.getVariableInstruction('calculated.issue_type', 'Component Implementation')}`,
        `*Priority*: ${this.getVariableInstruction('calculated.priority', '[Calculate: High/Medium/Low based on complexity]')}`,
        `*Story Points*: ${this.getVariableInstruction('calculated.story_points', '[Calculate: 1,2,3,5,8 based on component analysis]')}`,
        `*Technologies*: ${this.getVariableInstruction('project.tech_stack', this.formatTechStack(techStack))}`,
        `*Labels*: ${this.getVariableInstruction('calculated.labels', '[Generate relevant labels based on component type]')}`,
        `*Design Status*: ${this.getVariableInstruction('figma.design_status', '[Extract from Figma context or infer: ready-for-dev, in-progress, draft]')}`
      ]
    };
    jiraTemplate.sections.push(projectSection);

    // Design System Section - use design variables if available
    const designSection = {
      title: 'h2. 🎨 Design System & Visual References',
      fields: [
        `*Figma URL*: ${this.getVariableInstruction('figma.live_link', '[Build URL: https://www.figma.com/design/{fileKey}/{projectName}?node-id={nodeId} - Use project name NOT component name]')}`,
        `*Storybook URL*: ${this.getVariableInstruction('project.storybook_url', '[Use project.storybook_url or generate logical URL]')}`,
        `*Screenshot*: ${this.getVariableInstruction('figma.screenshot_markdown.jira', '[Reference actual screenshot filename from context]')}`,
        `*Colors*: ${this.getVariableInstruction('figma.extracted_colors', '[Extract HEX values from screenshot/context]')}`,
        `*Typography*: ${this.getVariableInstruction('figma.extracted_typography', '[Extract font families, sizes from context]')}`
      ]
    };
    jiraTemplate.sections.push(designSection);

    // Resources Section - use template resources if available (moved up for better flow)
    const resourcesSection = {
      title: 'h2. 📚 Resources & References',
      fields: this.buildResourceFields(resources)
    };
    jiraTemplate.sections.push(resourcesSection);

    // Design Tokens Section - use design system variables
    const designTokensSection = {
      title: 'h2. 🎯 Design Tokens Implementation',
      subsections: [
        {
          title: '*Spacing*:',
          items: [
            `* Base Unit: ${this.getVariableInstruction('design.spacing.base_unit', '[Extract or infer from design system]')}`,
            `* Margins: ${this.getVariableInstruction('design.spacing.margins', '[Extract spacing values from context]')}`,
            `* Paddings: ${this.getVariableInstruction('design.spacing.paddings', '[Extract padding values from context]')}`,
            `* Grid: ${this.getVariableInstruction('design.grid.columns', '[Extract grid system or use standard 12-column]')}`
          ]
        },
        {
          title: '*Interactive States*:',
          items: [
            `* Hover: ${this.getVariableInstruction('design.states.hover', '[Describe hover behavior from analysis]')}`,
            `* Focus: ${this.getVariableInstruction('design.states.focus', '[Describe focus state requirements]')}`,
            `* Active: ${this.getVariableInstruction('design.states.active', '[Describe active/pressed state]')}`,
            `* Disabled: ${this.getVariableInstruction('design.states.disabled', '[Describe disabled appearance]')}`,
            `* Error: ${this.getVariableInstruction('design.states.error', '[Describe error state styling]')}`,
            `* Success: ${this.getVariableInstruction('design.states.success', '[Describe success state styling]')}`
          ]
        },
        {
          title: '*Accessibility Requirements*:',
          items: [
            `* Contrast Ratio: ${this.getVariableInstruction('design.accessibility.contrast_ratio', '[Calculate or require: "4.5:1 minimum, 7:1 preferred"]')}`,
            `* Keyboard Navigation: ${this.getVariableInstruction('design.accessibility.keyboard_navigation', '[Specify keyboard interaction patterns]')}`,
            `* ARIA Roles: ${this.getVariableInstruction('design.accessibility.aria_roles', '[List required ARIA roles and properties]')}`,
            `* Screen Reader: ${this.getVariableInstruction('design.accessibility.screen_reader', '[Specify announcements and labels]')}`
          ]
        },
        {
          title: '*Motion & Animation*:',
          items: [
            `* Duration: ${this.getVariableInstruction('design.motion.duration', '[Standard: "200ms for micro-interactions, 300ms for transitions"]')}`,
            `* Easing: ${this.getVariableInstruction('design.motion.easing', '[Standard: "ease-out for entrances, ease-in for exits"]')}`
          ]
        },
        {
          title: '*Responsive Breakpoints*:',
          items: [
            `* Mobile: ${this.getVariableInstruction('design.breakpoints.mobile', '[Component behavior on mobile devices]')}`,
            `* Tablet: ${this.getVariableInstruction('design.breakpoints.tablet', '[Component behavior on tablet devices]')}`,
            `* Desktop: ${this.getVariableInstruction('design.breakpoints.desktop', '[Component behavior on desktop devices]')}`
          ]
        }
      ]
    };
    jiraTemplate.sections.push(designTokensSection);

    // Authoring Section - platform specific
    const authoringSection = {
      title: `h2. ⚙️ ${this.getVariableInstruction('project.platform', 'Platform')} Authoring Requirements`,
      fields: [
        `*Touch UI Required*: ${this.getVariableInstruction('authoring.touch_ui_required', '[Specify authoring interface requirements]')}`,
        `*Component Template*: ${this.getVariableInstruction('authoring.cq_template', '[Component template path]')}`,
        `*Component Path*: ${this.getVariableInstruction('authoring.component_path', '[Component implementation path]')}`,
        `*Authoring Notes*: ${this.getVariableInstruction('authoring.notes', '[Specify dialog fields, validation rules, content policies]')}`
      ]
    };
    jiraTemplate.sections.push(authoringSection);

    // Technical Implementation Section
    const technicalSection = {
      title: 'h2. 🔧 Technical Implementation',
      content: `${this.getVariableInstruction('calculated.technical_requirements', `[Generate specific implementation requirements based on component analysis for ${this.formatTechStack(techStack)}]`)}`
    };
    jiraTemplate.sections.push(technicalSection);

    // Acceptance Criteria Section
    const acceptanceSection = {
      title: 'h2. ✅ Acceptance Criteria',
      content: `${this.getVariableInstruction('calculated.acceptance_criteria', '[Generate specific, testable criteria based on component requirements and business impact]')}`
    };
    jiraTemplate.sections.push(acceptanceSection);

    return this.renderJiraTemplate(jiraTemplate);
  }

  /**
   * Get instruction for a template variable or fallback
   */
  getVariableInstruction(variablePath, fallback) {
    return `[Extract from context: ${variablePath} || ${fallback}]`;
  }

  /**
   * Format tech stack for display
   */
  formatTechStack(techStack) {
    if (Array.isArray(techStack)) {
      return techStack.join(', ');
    }
    return techStack || '[Extract from context]';
  }

  /**
   * Build resource fields from template resources
   */
  buildResourceFields(resources) {
    if (!resources || resources.length === 0) {
      // Default resources if none defined in template
      return [
        '*Figma*: [Extract figma.live_link] - Final design source with all states',
        '*Storybook*: [Extract project.storybook_url] - Interactive component reference',
        '*Wiki/Technical Doc*: [Extract project.wiki_url] - Implementation guide',
        '*GitHub*: [Extract project.repository_url] - Development branch',
        '*Analytics/Tagging Spec*: [Extract project.analytics_url] - Data layer and tracking requirements'
      ];
    }

    return resources.map(resource => {
      const linkInstruction = resource.link ?
        `[Extract ${resource.link.replace(/[{}]/g, '')}]` :
        '[Generate logical URL]';
      return `*${resource.type}*: ${linkInstruction} - ${resource.notes || 'Resource description'}`;
    });
  }

  /**
   * Render Jira template structure into formatted string
   */
  renderJiraTemplate(template) {
    let output = `## REQUIRED JIRA MARKUP STRUCTURE - FOLLOW PRECISELY:

${template.header}

`;

    template.sections.forEach(section => {
      output += `${section.title}\n`;

      if (section.fields) {
        section.fields.forEach(field => {
          output += `${field}\n`;
        });
      }

      if (section.subsections) {
        section.subsections.forEach(subsection => {
          output += `\n${subsection.title}\n`;
          subsection.items.forEach(item => {
            output += `${item}\n`;
          });
        });
      }

      if (section.content) {
        output += `${section.content}\n`;
      }

      output += '\n';
    });

    return output;
  }

  /**
   * Format template variables for AI prompt
   */
  formatTemplateVariablesForAI(variables) {
    if (!variables) {return 'No template variables defined';}

    const formatted = Object.entries(variables).map(([key, template]) => {
      // Extract expected variable name from template string
      const variableMatch = template.toString().match(/\{\{([^}]+)\}\}/);
      const variablePath = variableMatch ? variableMatch[1].split('||')[0].trim() : key;

      return `- **${key}**: Populate using \`${variablePath}\` from context - provide specific, relevant value`;
    });

    return formatted.join('\n');
  }

  /**
   * Format template sections for AI prompt (emphasizing base.yml design tokens)
   */
  formatTemplateSectionsForAI(sections) {
    if (!sections) {return 'Include all base.yml design token sections';}

    const formatted = Object.entries(sections).map(([sectionName, sectionData]) => {
      if (sectionName.startsWith('designTokens_')) {
        const tokenType = sectionName.replace('designTokens_', '');
        return `- **${tokenType.toUpperCase()} Tokens**: Extract real ${tokenType} values from context - ${Object.keys(sectionData || {}).join(', ')}`;
      } else if (sectionName === 'design') {
        return '- **Design References**: Include all figma_url, storybook_url, screenshot references';
      } else if (sectionName === 'authoring') {
        return '- **AEM Authoring**: Include Touch UI, CQ Template, Component Path requirements';
      } else {
        return `- **${sectionName}**: ${typeof sectionData === 'object' ?
          `Include: ${Object.keys(sectionData).join(', ')}` :
          'Provide detailed content'}`;
      }
    });

    return formatted.join('\n') + '\n\n**MANDATORY**: Include ALL design token categories (spacing, states, accessibility, motion, breakpoints) with real values.';
  }

  /**
   * Format template resources for AI prompt (emphasizing base.yml resources)
   */
  formatTemplateResourcesForAI(resources) {
    if (!resources || !Array.isArray(resources)) {
      return `CRITICAL: Include ALL 5 base.yml resources:
- **Figma**: Final design source link
- **Storybook**: Component states and interactions reference  
- **Wiki/Technical Doc**: AEM field mapping, templates, tech spec
- **GitHub**: Feature branch or repo reference
- **Analytics/Tagging Spec**: Tracking or data layer requirements`;
    }

    const formatted = resources.map(resource => {
      const linkVar = resource.link ? resource.link.match(/\{\{\s*([^}]+)\s*\}\}/) : null;
      const linkPath = linkVar ? linkVar[1].split('||')[0].trim() : 'URL to be populated';

      return `- **${resource.type}**: Extract from \`${linkPath}\` - ${resource.notes}`;
    });

    return formatted.join('\n') + '\n\n**CRITICAL**: ALL 5 resource links MUST be included with real URLs, not placeholders.';
  }

  /**
   * Format unified context for AI prompt
   */
  formatUnifiedContextForAI(unifiedContext) {
    const contextSummary = [];

    // Figma context
    if (unifiedContext.figma) {
      contextSummary.push(`**Figma Context**: Component "${unifiedContext.figma.component_name}", File: "${unifiedContext.figma.file_name}", Colors: ${unifiedContext.figma.extracted_colors || 'Not specified'}, Typography: ${unifiedContext.figma.extracted_typography || 'Not specified'}`);
    }

    // Project context
    if (unifiedContext.project) {
      contextSummary.push(`**Project Context**: ${unifiedContext.project.name}, Tech Stack: ${unifiedContext.project.tech_stack?.join(', ') || 'Not specified'}, Platform: ${unifiedContext.project.platform}`);
    }

    // Calculated context
    if (unifiedContext.calculated) {
      contextSummary.push(`**Analysis**: Complexity: ${unifiedContext.calculated.complexity}, Hours: ${unifiedContext.calculated.hours}, Priority: ${unifiedContext.calculated.priority}, Story Points: ${unifiedContext.calculated.story_points}`);
    }

    // Design context
    if (unifiedContext.design) {
      contextSummary.push(`**Design System**: Spacing base unit: ${unifiedContext.design.spacing?.base_unit || 'Not specified'}, Breakpoints: ${Object.values(unifiedContext.design.breakpoints || {}).join(', ')}`);
    }

    return contextSummary.join('\n');
  }

  /**
   * Format detailed context data for comprehensive AI analysis (human-readable format)
   */
  formatDetailedContextForAI(unifiedContext) {
    // 🔍 DEBUG: Log the complete unified context structure
    this.logger.info('🔍 DEBUG: Complete unified context for file key debugging:', {
      keys: Object.keys(unifiedContext),
      figma: unifiedContext.figma,
      figmaData: unifiedContext.figmaData,
      requestData: unifiedContext.requestData ? {
        keys: Object.keys(unifiedContext.requestData),
        fileKey: unifiedContext.requestData.fileKey,
        fileContext: unifiedContext.requestData.fileContext
      } : 'not present',
      fileKey: unifiedContext.fileKey,
      metadata: unifiedContext.metadata
    });

    const contextSections = [];

    // Extract and format component information
    const componentInfo = this.extractComponentInfo(unifiedContext);
    if (componentInfo) {
      const nodeId = this.extractNodeIdFromContext(unifiedContext);
      const projectName = this.extractProjectName(unifiedContext);
      const figmaUrl = componentInfo.fileKey !== 'unknown' ?
        `https://www.figma.com/design/${componentInfo.fileKey}/${encodeURIComponent(projectName.replace(/\s+/g, '-'))}${nodeId ? `?node-id=${nodeId}` : ''}` :
        'Use file key from context to build URL';

      contextSections.push(`Component: ${componentInfo.name}
Frame: ${componentInfo.pageName}
Type: ${componentInfo.type}
File Key: ${componentInfo.fileKey}
Screenshot Available: ${componentInfo.screenshotUrl ? 'Yes' : 'No'}
Figma URL: ${figmaUrl}`);
    }

    // Extract and format design data
    const designData = this.extractDesignData(unifiedContext);
    if (designData) {
      const colors = this.extractColorsFromContext(unifiedContext);
      const fonts = this.extractFontsFromContext(unifiedContext);

      contextSections.push(`Colors Detected: ${colors.length > 0 ? colors.join(', ') : 'Extract from visual analysis'}
Typography: ${fonts.length > 0 ? fonts.map(f => `${f.family} ${f.size}px/${f.weight}`).join(', ') : 'Extract from visual analysis'}
Spacing: Base ${designData.spacingValues[0] || 8}px
Interactive Elements: ${designData.interactionsCount}`);
    }

    // Extract and format project data
    const projectData = this.extractProjectData(unifiedContext);
    if (projectData) {
      const projectName = this.extractProjectName(unifiedContext);
      const urls = this.extractProjectUrls(unifiedContext);

      contextSections.push(`Project: ${projectName}
Tech Stack: ${projectData.techStack}
Platform: ${projectData.platform}
File Key: ${projectData.fileKey}
Storybook: ${urls.storybook || 'Generate logical URL'}
Repository: ${urls.repository || 'Generate logical URL'}
Wiki: ${urls.wiki || 'Generate logical URL'}`);
    }

    // Add calculated metrics if available
    const calculatedData = unifiedContext.calculated;
    if (calculatedData) {
      contextSections.push(`Complexity: ${calculatedData.complexity || 'Medium'}
Estimated Hours: ${calculatedData.hours || '4-6'}
Priority: ${calculatedData.priority || 'Medium'}
Story Points: ${calculatedData.story_points || '5'}
Confidence: ${Math.round((calculatedData.confidence || 0.8) * 100)}%`);
    }

    return contextSections.join('\n\n');
  }

  /**
   * Extract node-id from context for Figma URL construction
   */
  extractNodeIdFromContext(unifiedContext) {
    // Try multiple paths for node-id
    const figmaUrl = unifiedContext.figmaUrl || unifiedContext.requestData?.figmaUrl;
    if (figmaUrl) {
      const nodeIdMatch = figmaUrl.match(/node-id=([^&]+)/);
      if (nodeIdMatch) {
        return decodeURIComponent(nodeIdMatch[1]);
      }
    }

    // Check selection data
    const selection = unifiedContext.figmaData?.selection?.[0] || unifiedContext.selection?.[0];
    return selection?.id || null;
  }

  /**
   * Extract colors from context in readable format
   */
  extractColorsFromContext(unifiedContext) {
    const colors = [];

    // Try multiple sources for color data
    if (unifiedContext.figma?.extracted_colors) {
      colors.push(...unifiedContext.figma.extracted_colors.split(',').map(c => c.trim()));
    }

    if (unifiedContext.designTokens?.colors) {
      colors.push(...unifiedContext.designTokens.colors);
    }

    // Return unique colors or default design system colors
    return colors.length > 0 ? [...new Set(colors)] : ['#FFFFFF', '#000000', '#F5F5F5', '#007AFF'];
  }

  /**
   * Extract fonts from context in readable format
   */
  extractFontsFromContext(unifiedContext) {
    const fonts = [];

    // Try to extract font information
    if (unifiedContext.figma?.extracted_typography) {
      const typography = unifiedContext.figma.extracted_typography;
      // Parse typography string into structured format
      const fontMatches = typography.match(/(\w+)\s+(\d+)px(?:\/(\d+)px)?(?:,?\s*(Bold|Regular|Medium))?/g);
      if (fontMatches) {
        fontMatches.forEach(match => {
          const parts = match.match(/(\w+)\s+(\d+)px(?:\/(\d+)px)?(?:,?\s*(Bold|Regular|Medium))?/);
          if (parts) {
            fonts.push({
              family: parts[1],
              size: parts[2],
              lineHeight: parts[3] || parts[2],
              weight: parts[4] || 'Regular'
            });
          }
        });
      }
    }

    // Return default design system fonts if none found
    return fonts.length > 0 ? fonts : [
      { family: 'Inter', size: '14', weight: 'Regular' },
      { family: 'Inter', size: '16', weight: 'Regular' },
      { family: 'Inter', size: '20', weight: 'Bold' }
    ];
  }

  /**
   * Extract project name from context
   */
  extractProjectName(unifiedContext) {
    return unifiedContext.project?.name ||
           unifiedContext.requestData?.context?.projectName ||
           unifiedContext.context?.projectName ||
           unifiedContext.figmaData?.fileContext?.fileName ||
           'AEM Project';
  }

  /**
   * Extract project URLs from context
   */
  extractProjectUrls(unifiedContext) {
    const project = unifiedContext.project || {};
    return {
      storybook: project.storybook_url || project.component_library_url,
      repository: project.repository_url || project.github_url,
      wiki: project.wiki_url || project.documentation_url,
      analytics: project.analytics_url || project.tracking_url
    };
  }

  /**
   * Extract template variables from unified context for template rendering
   */
  extractTemplateVariablesFromContext(unifiedContext, componentName, techStack) {
    const componentInfo = this.extractComponentInfo(unifiedContext);
    const designData = this.extractDesignData(unifiedContext);

    // Build Figma URL with proper file key using enhanced extraction
    const fileKey = this.extractFileKey(unifiedContext);
    const projectName = this.extractProjectName(unifiedContext);
    const nodeId = this.extractNodeIdFromContext(unifiedContext);
    const figmaUrl = `https://www.figma.com/design/${fileKey}/${encodeURIComponent(projectName.replace(/\s+/g, '-'))}${nodeId ? `?node-id=${nodeId}` : ''}`;

    this.logger.info('🔗 Built Figma URL:', {
      fileKey,
      projectName,
      componentName,
      nodeId,
      finalUrl: figmaUrl
    });

    // Get screenshot info
    const screenshot = unifiedContext.screenshot || {};
    const screenshotMarkdown = screenshot.dataUrl ?
      `![${componentName} Screenshot](${screenshot.dataUrl})` :
      `!${componentName.toLowerCase().replace(/\s+/g, '-')}.png|thumbnail!`;

    return {
      // Project variables
      project: {
        component_prefix: 'UI',
        tech_stack: Array.isArray(techStack) ? techStack : [techStack],
        testing_framework: 'aem-mocks',
        component_library_url: 'https://storybook.company.com',
        accessibility_url: 'https://accessibility.company.com',
        testing_standards_url: 'https://testing.company.com'
      },

      // Figma variables
      figma: {
        component_name: componentName,
        component_type: componentInfo.type || 'UI Component',
        design_status: 'Ready for Development',
        live_link: figmaUrl,
        screenshot_markdown: {
          jira: screenshotMarkdown
        },
        extracted_colors: designData.colorsCount > 0 ? '#FFFFFF, #000000, #F0F0F0' : undefined,
        extracted_typography: designData.typographyCount > 0 ? 'Arial 16px/24px, Bold 20px, Arial 14px' : undefined
      },

      // Calculated variables
      calculated: {
        priority: 'Medium',
        story_points: '5',
        complexity: 'medium',
        hours: '4-6',
        confidence: 0.8,
        design_analysis: `"${componentName}" component requiring custom implementation.`
      },

      // Authoring variables
      authoring: {
        notes: 'Authoring Notes Not Found',
        component_path: `/apps/aemproject/components/content/${componentName.toLowerCase().replace(/\s+/g, '-')}`,
        cq_template: `/apps/aemproject/components/${componentName.toLowerCase().replace(/\s+/g, '-')}`,
        touch_ui_required: 'Yes - Full Touch UI component dialog'
      }
    };
  }

  /**
   * Extract file key from unified context for proper Figma URL generation
   */
  extractFileKey(unifiedContext) {
    // PRIORITY 1: Extract from screenshot metadata (most reliable for current selections)
    const screenshotFileKey = unifiedContext.screenshot?.metadata?.fileKey ||
                             unifiedContext.requestData?.screenshot?.metadata?.fileKey;
    
    if (screenshotFileKey && screenshotFileKey !== 'unknown') {
      this.logger.info('🔍 File key extraction result:', {
        extractedFileKey: screenshotFileKey,
        source: 'screenshot.metadata'
      });
      return screenshotFileKey;
    }

    // PRIORITY 2: Extract from figmaUrl (reliable when available)
    const figmaUrl = unifiedContext.figmaUrl ||
                    unifiedContext.requestData?.figmaUrl ||
                    unifiedContext.figmaData?.figmaUrl;

    if (figmaUrl) {
      const extractedKey = this.extractFileKeyFromUrl(figmaUrl);
      if (extractedKey && extractedKey !== 'unknown') {
        this.logger.info('🔍 File key extraction result:', {
          extractedFileKey: extractedKey,
          source: 'figmaUrl'
        });
        return extractedKey;
      }
    }

    // PRIORITY 3: Fallback to context paths
    const contextFileKey =
      unifiedContext.fileKey ||
      unifiedContext.metadata?.fileKey ||
      unifiedContext.requestData?.fileContext?.fileKey ||
      unifiedContext.requestData?.fileKey ||
      unifiedContext.figmaData?.fileContext?.fileKey ||
      unifiedContext.figmaData?.fileKey ||
      (unifiedContext.figma?.file_id !== 'unknown' ? unifiedContext.figma?.file_id : null) ||
      unifiedContext.figma?.metadata?.id;

    if (contextFileKey && contextFileKey !== 'unknown') {
      this.logger.info('🔍 File key extraction result:', {
        extractedFileKey: contextFileKey,
        source: 'context'
      });
      return contextFileKey;
    }

    // LAST RESORT: Use fallback (but log warning)
    this.logger.warn('⚠️ Using fallback file key - no valid file key found in context');
    return 'BioUSVD6t51ZNeG0g9AcNz';
  }

  /**
   * Extract component information from unified context
   */
  extractComponentInfo(unifiedContext) {
    // Try multiple paths to find component data
    const figmaData = unifiedContext.figmaData || unifiedContext.figma || {};
    const selection = figmaData.selection?.[0] || unifiedContext.selection?.[0] || {};
    const fileContext = figmaData.fileContext || unifiedContext.fileContext || {};

    // 🔍 DEBUG: Log all possible file key paths
    this.logger.info('🔍 DEBUG: File key extraction paths:', {
      'fileContext.fileKey': fileContext.fileKey,
      'figmaData.fileKey': figmaData.fileKey,
      'unifiedContext.fileKey': unifiedContext.fileKey,
      'unifiedContext.metadata?.fileKey': unifiedContext.metadata?.fileKey,
      'unifiedContext.requestData?.fileContext?.fileKey': unifiedContext.requestData?.fileContext?.fileKey,
      'unifiedContext.requestData?.fileKey': unifiedContext.requestData?.fileKey,
      'unifiedContext.requestData?: screenshot.metadata.fileKey': unifiedContext.requestData?.screenshot?.metadata?.fileKey,
      'unifiedContext.figma?.file_id': unifiedContext.figma?.file_id,
      'unifiedContext.screenshot?.metadata?.fileKey': unifiedContext.screenshot?.metadata?.fileKey,
      'requestData keys': unifiedContext.requestData ? Object.keys(unifiedContext.requestData) : 'none',
      'availableKeys': Object.keys(unifiedContext)
    });

    // Use the centralized file key extraction method
    const fileKey = this.extractFileKey(unifiedContext);

    this.logger.info(`🔍 DEBUG: Final extracted file key: "${fileKey}"`);

    return {
      name: selection.name || figmaData.component_name || 'Component',
      type: selection.type || figmaData.component_type || 'INSTANCE',
      fileKey: fileKey || 'unknown',
      pageName: fileContext.pageName || fileContext.fileName || 'Unknown Page',
      screenshotUrl: unifiedContext.screenshot?.dataUrl || unifiedContext.screenshot?.url
    };
  }

  /**
   * Extract file key from Figma URL
   */
  extractFileKeyFromUrl(figmaUrl) {
    if (!figmaUrl || typeof figmaUrl !== 'string') {
      return null;
    }

    // Match Figma URLs: https://www.figma.com/file/<fileKey>/* or https://www.figma.com/design/<fileKey>/*
    const fileMatch = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]{22})/);
    return fileMatch ? fileMatch[1] : null;
  }

  /**
   * Extract design data from unified context
   */
  extractDesignData(unifiedContext) {
    const designTokens = unifiedContext.designTokens || {};

    return {
      colorsCount: designTokens.colors?.length || 0,
      typographyCount: designTokens.typography?.length || 0,
      spacingValues: designTokens.spacing || [4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
      interactionsCount: unifiedContext.figmaData?.interactions?.length || 0
    };
  }

  /**
   * Extract project data from unified context
   */
  extractProjectData(unifiedContext) {
    const codeGeneration = unifiedContext.codeGeneration || {};
    const componentInfo = this.extractComponentInfo(unifiedContext); // Use our enhanced component info extraction

    return {
      techStack: codeGeneration.framework || 'AEM 6.5 with HTL',
      platform: 'AEM',
      fileKey: componentInfo.fileKey // Use the enhanced file key extraction
    };
  }

  /**
   * Validate and enhance the AI-generated ticket
   */
  async validateAndEnhanceTicket(aiGeneratedTicket, unifiedContext, templateStructure) {
    // Handle both string and object responses from AI service
    let ticketContent = aiGeneratedTicket;

    // If AI result is an object, extract the content
    if (typeof aiGeneratedTicket === 'object' && aiGeneratedTicket !== null) {
      ticketContent = aiGeneratedTicket.content || aiGeneratedTicket.result || aiGeneratedTicket.text || JSON.stringify(aiGeneratedTicket);
    }

    // Ensure we have a string to work with
    if (typeof ticketContent !== 'string') {
      this.logger.warn('⚠️ AI result is not a string, converting:', typeof aiGeneratedTicket);
      ticketContent = String(ticketContent);
    }

    let enhancedTicket = ticketContent;

    // Check for template variable population
    const missingVariables = this.checkForMissingVariables(enhancedTicket, templateStructure.variables);

    if (missingVariables.length > 0) {
      this.logger.warn(`⚠️ AI missed ${missingVariables.length} template variables:`, missingVariables);

      // Attempt to populate missing variables using context
      enhancedTicket = this.populateMissingVariables(enhancedTicket, missingVariables, unifiedContext);
    }

    // Enhance with specific component insights
    enhancedTicket = this.addComponentSpecificEnhancements(enhancedTicket, unifiedContext);

    return enhancedTicket;
  }

  /**
   * Check for missing template variables in AI output
   */
  checkForMissingVariables(ticketContent, templateVariables) {
    if (!templateVariables) {return [];}
    if (!ticketContent || typeof ticketContent !== 'string') {return [];}

    const missingVariables = [];
    const lowerContent = ticketContent.toLowerCase();

    Object.keys(templateVariables).forEach(variable => {
      // Check if variable concept is addressed in ticket
      const variableSearchTerms = variable.toLowerCase().replace(/_/g, ' ').split(' ');
      const hasVariableCoverage = variableSearchTerms.some(term => lowerContent.includes(term));

      if (!hasVariableCoverage) {
        missingVariables.push(variable);
      }
    });

    return missingVariables;
  }

  /**
   * Populate missing variables using available context
   */
  populateMissingVariables(ticketContent, missingVariables, unifiedContext) {
    let enhancedContent = ticketContent;

    // Add missing variable content at the end
    if (missingVariables.length > 0) {
      enhancedContent += '\n\n## Additional Information\n\n';

      missingVariables.forEach(variable => {
        const variableContent = this.generateVariableContent(variable, unifiedContext);
        if (variableContent) {
          enhancedContent += `**${variable.replace(/_/g, ' ').toUpperCase()}**: ${variableContent}\n\n`;
        }
      });
    }

    return enhancedContent;
  }

  /**
   * Generate content for a specific variable using context
   */
  generateVariableContent(variable, unifiedContext) {
    const variableLower = variable.toLowerCase();

    // URL variables
    if (variableLower.includes('url') || variableLower.includes('link')) {
      if (variableLower.includes('figma')) {return unifiedContext.figma?.live_link;}
      if (variableLower.includes('storybook')) {return unifiedContext.project?.storybook_url;}
      if (variableLower.includes('github') || variableLower.includes('repository')) {return unifiedContext.project?.repository_url;}
      if (variableLower.includes('wiki')) {return unifiedContext.project?.wiki_url;}
      if (variableLower.includes('analytics')) {return unifiedContext.project?.analytics_url;}
    }

    // Design variables
    if (variableLower.includes('color')) {return unifiedContext.figma?.extracted_colors;}
    if (variableLower.includes('typography')) {return unifiedContext.figma?.extracted_typography;}
    if (variableLower.includes('spacing')) {return unifiedContext.design?.spacing?.base_unit;}

    // Project variables
    if (variableLower.includes('priority')) {return unifiedContext.calculated?.priority;}
    if (variableLower.includes('complexity')) {return unifiedContext.calculated?.complexity;}
    if (variableLower.includes('story') && variableLower.includes('points')) {return unifiedContext.calculated?.story_points;}

    return null;
  }

  /**
   * Add component-specific enhancements
   */
  addComponentSpecificEnhancements(ticketContent, unifiedContext) {
    if (!ticketContent || typeof ticketContent !== 'string') {
      return ticketContent;
    }

    let enhancedContent = ticketContent;

    // Add design analysis if not present
    if (!ticketContent.toLowerCase().includes('design analysis') && unifiedContext.calculated?.design_analysis) {
      enhancedContent += `\n\n## Design Analysis\n${unifiedContext.calculated.design_analysis}\n`;
    }

    // Add accessibility requirements if not present
    if (!ticketContent.toLowerCase().includes('accessibility') && unifiedContext.calculated?.accessibility_requirements) {
      enhancedContent += `\n\n## Accessibility Requirements\n${unifiedContext.calculated.accessibility_requirements.map(req => `- ${req}`).join('\n')}\n`;
    }

    // Add implementation notes if not present
    if (!ticketContent.toLowerCase().includes('implementation') && unifiedContext.calculated?.implementation_notes) {
      enhancedContent += `\n\n## Implementation Notes\n${unifiedContext.calculated.implementation_notes.map(note => `- ${note}`).join('\n')}\n`;
    }

    return enhancedContent;
  }

  /**
   * Calculate context completeness score
   */
  calculateContextCompleteness(unifiedContext) {
    let completeness = 0;
    let totalChecks = 0;

    // Check figma context
    if (unifiedContext.figma) {
      totalChecks += 5;
      if (unifiedContext.figma.live_link && !unifiedContext.figma.live_link.includes('unknown')) {completeness++;}
      if (unifiedContext.figma.extracted_colors) {completeness++;}
      if (unifiedContext.figma.extracted_typography) {completeness++;}
      if (unifiedContext.figma.screenshot_url) {completeness++;}
      if (unifiedContext.figma.dimensions?.width > 0) {completeness++;}
    }

    // Check project context
    if (unifiedContext.project) {
      totalChecks += 4;
      if (unifiedContext.project.repository_url && !unifiedContext.project.repository_url.includes('NOT SET')) {completeness++;}
      if (unifiedContext.project.storybook_url && !unifiedContext.project.storybook_url.includes('NOT SET')) {completeness++;}
      if (unifiedContext.project.wiki_url && !unifiedContext.project.wiki_url.includes('NOT SET')) {completeness++;}
      if (unifiedContext.project.tech_stack?.length > 0) {completeness++;}
    }

    // Check design context
    if (unifiedContext.design) {
      totalChecks += 3;
      if (unifiedContext.design.spacing?.base_unit) {completeness++;}
      if (unifiedContext.design.breakpoints?.mobile) {completeness++;}
      if (unifiedContext.design.accessibility?.contrast_ratio) {completeness++;}
    }

    return totalChecks > 0 ? Math.round((completeness / totalChecks) * 100) : 0;
  }

  /**
   * Get base template structure as fallback
   */
  getBaseTemplateStructure() {
    return {
      variables: {
        component_name: 'Component name',
        figma_url: 'Figma design link',
        storybook_url: 'Storybook documentation',
        github_url: 'Repository link',
        priority: 'Task priority',
        story_points: 'Complexity estimate'
      },
      sections: {
        description: 'Component description',
        requirements: 'Technical requirements',
        acceptance_criteria: 'Acceptance criteria'
      },
      resources: [
        { type: 'Figma', notes: 'Design source' },
        { type: 'Storybook', notes: 'Component documentation' },
        { type: 'GitHub', notes: 'Code repository' }
      ]
    };
  }

  /**
   * Generate fallback ticket when template-guided AI fails
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
Generated at ${new Date().toISOString()} via Template-Guided AI Service (Fallback)`;

    return {
      content: fallbackContent,
      metadata: {
        template_id: 'template-guided-ai-fallback',
        generation_method: 'template-guided-ai-fallback',
        generationType: 'template-guided-ai-fallback',
        platform,
        componentName,
        techStack,
        generatedAt: new Date().toISOString(),
        source: 'template-guided-ai-fallback',
        error: error.message
      },
      performance: {
        duration: 0,
        fromCache: false,
        source: 'fallback'
      }
    };
  }

  /**
   * Create cache key for request parameters
   */
  createCacheKey(params) {
    const { platform, documentType, componentName, techStack } = params;
    const keyData = {
      platform: platform || 'jira',
      documentType: documentType || 'component',
      componentName: componentName || 'component',
      techStack: Array.isArray(techStack) ? techStack.sort().join('-') : techStack
    };

    // Create deterministic hash
    const keyString = JSON.stringify(keyData);
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `template-guided-ai:${Math.abs(hash)}`;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0
        ? (this.metrics.successfulGenerations / this.metrics.totalRequests) * 100
        : 0,
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Health check for the service
   */
  healthCheck() {
    return {
      service: 'TemplateGuidedAIService',
      status: 'healthy',
      initialized: true,
      dependencies: {
        aiService: !!this.aiService,
        configService: !!this.configService,
        cacheService: !!this.cacheService,
        contextBuilder: !!this.contextBuilder,
        templateEngine: !!this.templateEngine
      },
      metrics: this.getMetrics(),
      lastChecked: new Date().toISOString()
    };
  }
}