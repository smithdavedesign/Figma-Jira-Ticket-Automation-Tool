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

    // Initialize template engine
    const configDir = join(__dirname, '../../config/templates');
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
    if (!this.aiService) {
      throw new Error('AI Service not available for template-guided generation');
    }

    // Build template-guided prompt
    const templateGuidedPrompt = this.buildTemplateGuidedPrompt(unifiedContext, templateStructure, options);

    // Use AI service to generate content
    const aiOptions = {
      ...options,
      useTemplateStructure: true,
      templateVariables: Object.keys(templateStructure.variables || {}),
      expectedSections: Object.keys(templateStructure.sections || {})
    };

    const aiResult = await this.aiService.processVisualEnhancedContext(
      {
        ...unifiedContext,
        templateStructure,
        templateGuidedPrompt
      },
      aiOptions
    );

    return aiResult;
  }

  /**
   * Build template-guided prompt that instructs AI to follow template structure
   */
  buildTemplateGuidedPrompt(unifiedContext, templateStructure, options) {
    const { platform, documentType, componentName, techStack } = options;

    const prompt = `# 🎯 MANDATORY BASE.YML TEMPLATE STRUCTURE

You are generating a ${platform.toUpperCase()} ticket that MUST follow the exact base.yml template structure with ALL variables populated from real context data.

## EXACT TEMPLATE STRUCTURE - FOLLOW PRECISELY:

\`\`\`
# ${componentName} - Component Implementation

## 📋 Project Context & Component Details
**Project**: [Extract from context - NEVER use "Project Name Not Found"]
**Component**: ${componentName}
**Type**: [Determine from Figma analysis: INSTANCE, COMPONENT, FRAME]
**Issue Type**: Component Implementation
**Priority**: [Calculate: High/Medium/Low based on complexity]
**Story Points**: [Calculate: 1,2,3,5,8 based on component analysis]
**Technologies**: ${techStack}
**Labels**: [Generate relevant labels: frontend, component, design-system]
**Design Status**: [Extract from Figma context or infer: ready-for-dev, in-progress, draft]

## 🎨 Design System & Visual References  
**Figma URL**: [Build real URL using file key from context]
**Storybook URL**: [Use project.storybook_url or generate logical URL]
**Screenshot**: [Reference actual screenshot filename from context]
**Colors**: [Extract HEX values from screenshot/context - e.g., "#FF5733, #3498DB, #2C3E50"]
**Typography**: [Extract font families, sizes from context - e.g., "Inter 16px/24px, Bold 20px"]

### Design Tokens Implementation - ALL CATEGORIES REQUIRED
**Spacing**:
- Base Unit: [Extract or infer: 4px, 8px, 16px - standard design system]
- Margins: [Extract spacing values: "16px, 24px, 32px, 48px"]
- Paddings: [Extract padding values: "8px, 12px, 16px, 20px"]
- Grid: 12 columns, 24px gutter [Standard or extract if specified]

**Interactive States** - POPULATE ALL:
- Hover: [Describe hover behavior from analysis]
- Focus: [Describe focus state requirements]
- Active: [Describe active/pressed state]
- Disabled: [Describe disabled appearance]
- Error: [Describe error state styling]
- Success: [Describe success state styling]

**Accessibility Requirements** - MANDATORY WCAG COMPLIANCE:
- Contrast Ratio: [Calculate or require: "4.5:1 minimum, 7:1 preferred"]
- Keyboard Navigation: [Specify: "Tab order, Enter/Space activation, Arrow keys"]
- ARIA Roles: [List required: "button, link, menuitem, tab, etc."]
- Screen Reader: [Specify announcements and labels]

**Motion & Animation** - PERFORMANCE OPTIMIZED:
- Duration: [Standard: "200ms for micro-interactions, 300ms for transitions"]
- Easing: [Standard: "ease-out for entrances, ease-in for exits"]

**Responsive Breakpoints** - MOBILE-FIRST:
- Mobile: 320px-768px [Component behavior on mobile]
- Tablet: 769px-1024px [Component behavior on tablet]
- Desktop: 1025px+ [Component behavior on desktop]

## ⚙️ AEM/CQ Authoring Requirements - ${techStack} SPECIFIC
**Touch UI Required**: Yes - Full Touch UI component dialog
**CQ Template**: /apps/[project]/components/${componentName.toLowerCase().replace(/\s+/g, '-')}
**Component Path**: /apps/[project]/components/content/${componentName.toLowerCase().replace(/\s+/g, '-')}
**Authoring Notes**: [Specify dialog fields, validation rules, content policies]

## 📚 Resources & References - ALL 5 REQUIRED
**Figma**: [Build real URL with file key] - Final design source with all states
**Storybook**: [Project storybook URL]/components/${componentName.toLowerCase()} - Interactive component reference
**Wiki/Technical Doc**: [Project wiki URL]/aem-components/${componentName} - AEM implementation guide
**GitHub**: [Project repo URL]/feature/${componentName.toLowerCase()}-component - Development branch
**Analytics/Tagging Spec**: [Analytics doc URL] - Data layer and tracking requirements

## 🔧 Technical Implementation for ${techStack}
[Generate specific HTL, Sling Models, JavaScript, CSS requirements based on component analysis]

## ✅ Acceptance Criteria - MEASURABLE & TESTABLE
[Generate specific, testable criteria based on component requirements and business impact]
\`\`\`

## CONTEXT DATA FOR EXTRACTION:
${this.formatDetailedContextForAI(unifiedContext)}

## ABSOLUTE REQUIREMENTS:
1. **ZERO PLACEHOLDER TEXT**: Never use "Not Found", "TBD", or template fallbacks
2. **REAL DATA EXTRACTION**: Extract actual component names, colors, URLs from provided context
3. **SMART INFERENCE**: When data isn't explicit, make intelligent assumptions based on component type and industry standards
4. **COMPLETE COVERAGE**: Include ALL design token categories, ALL 5 resources, ALL sections
5. **PRACTICAL VALUES**: Generate realistic story points, priorities, technical specs

**FAILURE TO INCLUDE ALL BASE.YML SECTIONS = INVALID RESPONSE**`;

    return prompt;
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
   * Format detailed context data for comprehensive AI analysis
   */
  formatDetailedContextForAI(unifiedContext) {
    const contextSections = [];

    // Extract component information
    const componentInfo = this.extractComponentInfo(unifiedContext);
    if (componentInfo) {
      contextSections.push(`**COMPONENT DATA:**
- Name: "${componentInfo.name}"
- Type: ${componentInfo.type}
- File Key: ${componentInfo.fileKey}
- Page: "${componentInfo.pageName}"
- Screenshot: Available (${componentInfo.screenshotUrl ? 'Yes' : 'No'})`);
    }

    // Extract design data
    const designData = this.extractDesignData(unifiedContext);
    if (designData) {
      contextSections.push(`**DESIGN DATA:**
- Colors Found: ${designData.colorsCount} (Extract hex values from screenshot)
- Typography Elements: ${designData.typographyCount}
- Spacing Values: [${designData.spacingValues.join(', ')}]px
- Interactive Elements: ${designData.interactionsCount}`);
    }

    // Project context
    const projectData = this.extractProjectData(unifiedContext);
    if (projectData) {
      contextSections.push(`**PROJECT DATA:**
- Tech Stack: ${projectData.techStack}
- Platform: ${projectData.platform}
- Build URLs using file key: ${projectData.fileKey}`);
    }

    return contextSections.join('\n\n');
  }

  /**
   * Extract component information from unified context
   */
  extractComponentInfo(unifiedContext) {
    // Try multiple paths to find component data
    const figmaData = unifiedContext.figmaData || unifiedContext.figma || {};
    const selection = figmaData.selection?.[0] || unifiedContext.selection?.[0] || {};
    const fileContext = figmaData.fileContext || unifiedContext.fileContext || {};

    return {
      name: selection.name || figmaData.component_name || 'Component',
      type: selection.type || figmaData.component_type || 'INSTANCE',
      fileKey: fileContext.fileKey || 'unknown',
      pageName: fileContext.pageName || fileContext.fileName || 'Unknown Page',
      screenshotUrl: unifiedContext.screenshot?.dataUrl || unifiedContext.screenshot?.url
    };
  }

  /**
   * Extract design data from unified context
   */
  extractDesignData(unifiedContext) {
    const designTokens = unifiedContext.designTokens || {};
    const technicalSpecs = unifiedContext.technicalSpecs || {};

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
    const fileContext = unifiedContext.figmaData?.fileContext || unifiedContext.fileContext || {};

    return {
      techStack: codeGeneration.framework || 'AEM 6.5 with HTL',
      platform: 'AEM',
      fileKey: fileContext.fileKey || 'unknown'
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