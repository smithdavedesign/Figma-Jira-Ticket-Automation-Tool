#!/usr/bin/env node

/* eslint-disable no-unused-vars */
/**
 * Visual-Enhanced AI Service for Figma Design Analysis
 *
 * Combines Figma screenshot capture with hierarchical data extraction
 * to provide rich visual context to Gemini Vision and other AI models.
 *
 * Features:
 * - Screenshot processing and optimization for LLM input
 * - Combined visual + structured data analysis
 * - Enhanced prompt templates for design understanding
 * - Multi-modal design context generation
 * - Comprehensive context analysis integration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
// TODO: Uncomment these imports when ready for production integration
import { DesignSystemAnalyzer } from '../context/design-system-analyzer.js';
import { EnhancedDesignSystemExtractor } from '../context/enhanced-design-system-extractor.js';
import { BusinessContextIntelligence } from '../context/business-context-intelligence.js';
import { TechnicalContextAnalyzer } from '../context/technical-context-analyzer.js';
import { UserExperienceContextEngine } from '../context/user-experience-context-engine.js';

export class VisualEnhancedAIService {
  constructor(apiKey) {
    this.geminiClient = null;
    this.model = null;
    this.maxRetries = 2;
    this.compressionThreshold = 10000; // chars

    if (!apiKey) {
      throw new Error('Missing Gemini API key. Cannot initialize Visual Enhanced AI Service.');
    }

    // Initialize Gemini client and model with Gemini 2.0 Flash
    this.geminiClient = new GoogleGenerativeAI(apiKey);
    this.model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Initialize comprehensive context analyzers with enhanced design system extractor
    this.designSystemAnalyzer = new DesignSystemAnalyzer();
    this.enhancedDesignSystemExtractor = new EnhancedDesignSystemExtractor({
      enableVerboseLogging: true,
      extractionConfig: {
        enableAdvancedTokenExtraction: true,
        enableSemanticAnalysis: true,
        enableComponentIntelligence: true,
        enableBrandPersonality: true,
        enableDesignMaturity: true
      }
    });
    this.businessIntelligence = new BusinessContextIntelligence();
    this.technicalAnalyzer = new TechnicalContextAnalyzer();
    this.uxContextEngine = new UserExperienceContextEngine();

    console.log('✅ Visual Enhanced AI Service initialized with Gemini 2.0 Flash');
    console.log('🎯 Advanced context analyzers loaded: Design System, Business Intelligence, Technical Analysis, UX Context');
  }

  /**
   * Process visual-enhanced context with Gemini Vision
   */
  async processVisualEnhancedContext(context, options = {}) {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    console.log('🎨 Processing visual-enhanced context with Gemini Vision...');
    console.log('🧠 Initiating comprehensive context analysis...');
    const startTime = Date.now();

    try {
      // 🎯 COMPREHENSIVE CONTEXT ANALYSIS
      const enrichedContext = await this.enrichContextWithIntelligence(context, options);
      console.log('✅ Context enriched with advanced intelligence layers');

      // Compress context if needed
      const compressedContext = this.compressContextIfNeeded(enrichedContext);

      // Build enhanced prompt with comprehensive context
      const prompt = this.buildEnhancedPrompt(compressedContext, options);

      // Prepare multimodal input
      const parts = [{ text: prompt }];

      // Add screenshot if available
      if (compressedContext.screenshot?.base64) {
        const format = compressedContext.screenshot.format || 'png';
        const base64Data = compressedContext.screenshot.base64;

        parts.push({
          inlineData: {
            mimeType: `image/${format.toLowerCase()}`,
            data: base64Data
          }
        });

        // 🔍 DETAILED IMAGE CONTEXT LOGGING
        console.log('🖼️ IMAGE CONTEXT CONFIRMED:');
        console.log(`  📸 Format: ${format}`);
        console.log(`  📏 Base64 Length: ${base64Data.length} chars`);
        console.log(`  🎯 MIME Type: image/${format.toLowerCase()}`);
        console.log('  ✅ Image data sent to Gemini 2.0 Flash LLM');
        console.log(`  🔢 Total parts for LLM: ${parts.length} (text + image)`);

        // Validate base64 data
        if (base64Data.startsWith('data:image/')) {
          console.log('  ⚠️ Base64 includes data URL prefix - stripping for LLM');
        } else if (base64Data.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
          console.log('  ✅ Clean base64 format confirmed');
        } else {
          console.log('  ❌ WARNING: Invalid base64 format detected');
        }

      } else {
        console.log('❌ NO IMAGE CONTEXT: Screenshot base64 not available');
        console.log('  Screenshot object:', compressedContext.screenshot);
      }

      // Generate with retry logic
      const generatedText = await this.generateWithRetry(parts, options);

      // 🔍 VERIFY LLM USED VISUAL CONTEXT
      console.log('🧠 LLM VISUAL CONTEXT ANALYSIS:');
      const hasVisualKeywords = this.checkVisualContextUsage(generatedText);
      if (hasVisualKeywords.used) {
        console.log('  ✅ LLM referenced visual elements:', hasVisualKeywords.keywords);
        console.log('  🎯 Visual context successfully processed by Gemini 2.0 Flash');
      } else {
        console.log('  ⚠️ No explicit visual references found in response');
        console.log('  📝 Response length:', generatedText.length, 'chars');
      }

      // Clean up the generated text
      let cleanedText = generatedText;

      // Remove any trailing "Design Analysis" sections that might be appended
      cleanedText = cleanedText.split(/\n#+\s*Design Analysis/i)[0];
      cleanedText = cleanedText.split(/\n#+\s*## Design Analysis/i)[0];
      cleanedText = cleanedText.trim();

      // Check if this is being called in template-guided mode (return clean text)
      const isTemplateGuided = options.useTemplateStructure || compressedContext.templateStructure || compressedContext.templateGuidedPrompt;

      if (isTemplateGuided) {
        console.log('🎯 Template-guided mode: returning clean markdown text');
        return cleanedText;
      }

      // Legacy mode: return structured output for backward compatibility
      const analysis = this.parseAIResponse(cleanedText);
      const processingTime = Date.now() - startTime;

      return {
        ticket: cleanedText,
        structured: {
          summary: analysis.visualUnderstanding,
          implementation: analysis.componentAnalysis,
          recommendations: analysis.recommendationSummary,
          designSystem: analysis.designSystemCompliance
        },
        metadata: {
          confidence: this.calculateConfidence(compressedContext, cleanedText),
          processingTime,
          contextCompressed: this.isContextCompressed(context),
          screenshotProcessed: this.isScreenshotProcessed(compressedContext),
          dataStructuresAnalyzed: this.countDataStructures(compressedContext),
          promptTokens: Math.ceil(prompt.length / 4),
          responseTokens: Math.ceil(cleanedText.length / 4)
        }
      };

    } catch (error) {
      console.error('❌ Visual-enhanced AI processing failed:', error);
      throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 🧠 COMPREHENSIVE CONTEXT ENRICHMENT
   * Enriches basic context with advanced intelligence layers
   */
  async enrichContextWithIntelligence(context, options = {}) {
    console.log('🔍 Analyzing context with comprehensive intelligence...');

    try {
      // Extract content analysis for business and UX context
      const contentAnalysis = this.extractContentAnalysis(context);

      // 🎨 Enhanced Design System Analysis
      console.log('🎨 Running enhanced design system analysis...');
      const designSystemContext = await this.enhancedDesignSystemExtractor.extractMaximumDesignSystemContext(
        context.hierarchicalData || context.figmaData,
        context.figmaContext || context.fileContext
      );

      // Also run standard analysis for backward compatibility
      const standardDesignSystemContext = await this.designSystemAnalyzer.analyzeDesignSystem(
        context.hierarchicalData || context.figmaData,
        context.figmaContext || context.fileContext
      );

      // 💼 Business Context Intelligence
      console.log('💼 Running business intelligence analysis...');
      const businessContext = await this.businessIntelligence.analyzeBusinessContext(
        context.figmaContext || context.fileContext,
        contentAnalysis
      );

      // ⚙️ Technical Context Analysis
      console.log('⚙️ Running technical context analysis...');
      const technicalContext = await this.technicalAnalyzer.analyzeTechnicalContext(
        context.hierarchicalData || context.figmaData,
        options.techStack || context.metadata?.techStack || 'React TypeScript',
        context.projectContext || context.metadata
      );

      // 👤 UX Context Analysis
      console.log('👤 Running UX context analysis...');
      const uxContext = await this.uxContextEngine.analyzeUXContext(
        context.hierarchicalData || context.figmaData,
        businessContext,
        contentAnalysis
      );

      console.log('✅ Comprehensive context analysis complete');

      // Return enriched context with enhanced design system analysis
      const enrichedContext = {
        ...context,
        intelligenceContext: {
          designSystem: designSystemContext,
          standardDesignSystem: standardDesignSystemContext, // For backward compatibility
          business: businessContext,
          technical: technicalContext,
          userExperience: uxContext,
          analysisTimestamp: new Date().toISOString(),
          confidenceScore: this.calculateOverallConfidence(designSystemContext, businessContext, technicalContext, uxContext),
          enhancedAnalysis: true
        }
      };

      console.log(`🎯 Context enrichment confidence: ${enrichedContext.intelligenceContext.confidenceScore}%`);
      return enrichedContext;

    } catch (error) {
      console.warn('⚠️ Context enrichment failed, using basic context:', error.message);
      return context;
    }
  }

  /**
   * Extract content analysis from context
   */
  extractContentAnalysis(context) {
    const textContent = this.extractAllText(context);

    return {
      textContent: textContent,
      wordCount: textContent ? textContent.split(' ').length : 0,
      primaryLanguage: this.detectLanguage(textContent),
      contentType: this.detectContentType(textContent),
      readabilityScore: this.calculateReadabilityScore(textContent)
    };
  }

  /**
   * Extract all text content from context
   */
  extractAllText(context) {
    let text = '';

    // Extract from hierarchical data
    if (context.hierarchicalData) {
      text += this.extractTextFromHierarchy(context.hierarchicalData);
    }

    // Extract from enhanced frame data
    if (context.enhancedFrameData) {
      text += this.extractTextFromFrameData(context.enhancedFrameData);
    }

    // Extract from component names and properties
    if (context.componentName) {
      text += ' ' + context.componentName;
    }

    return text.trim();
  }

  /**
   * Extract text from hierarchical data
   */
  extractTextFromHierarchy(data) {
    let text = '';
    if (data.components) {
      data.components.forEach(comp => {
        if (comp.name) {text += ' ' + comp.name;}
        if (comp.text) {text += ' ' + comp.text;}
      });
    }
    return text;
  }

  /**
   * Extract text from frame data
   */
  extractTextFromFrameData(frameData) {
    let text = '';
    if (Array.isArray(frameData)) {
      frameData.forEach(frame => {
        if (frame.name) {text += ' ' + frame.name;}
        if (frame.text) {text += ' ' + frame.text;}
      });
    }
    return text;
  }

  /**
   * Detect content language
   */
  detectLanguage(text) {
    if (!text) {return 'en';}
    // Simple language detection - could be enhanced with a proper library
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const matches = englishWords.filter(word => text.toLowerCase().includes(word)).length;
    return matches > 2 ? 'en' : 'unknown';
  }

  /**
   * Detect content type
   */
  detectContentType(text) {
    if (!text) {return 'interface';}
    const lowerText = text.toLowerCase();

    if (lowerText.includes('dashboard') || lowerText.includes('analytics')) {return 'dashboard';}
    if (lowerText.includes('form') || lowerText.includes('input')) {return 'form';}
    if (lowerText.includes('navigation') || lowerText.includes('menu')) {return 'navigation';}
    if (lowerText.includes('card') || lowerText.includes('list')) {return 'content-display';}

    return 'general-interface';
  }

  /**
   * Calculate basic readability score
   */
  calculateReadabilityScore(text) {
    if (!text) {return 50;}

    const words = text.split(' ').length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    // Simple readability calculation (inverse of complexity)
    const complexity = avgWordsPerSentence > 20 ? 'high' : avgWordsPerSentence > 10 ? 'medium' : 'low';
    return complexity === 'low' ? 80 : complexity === 'medium' ? 60 : 40;
  }

  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence(designSystem, business, technical, ux) {
    const scores = [];

    if (designSystem?.brandIdentity?.confidence) {scores.push(designSystem.brandIdentity.confidence * 100);}
    if (business?.industryDomain?.confidence) {scores.push(business.industryDomain.confidence * 100);}
    if (technical?.componentComplexity?.overall?.score) {scores.push((technical.componentComplexity.overall.score / 10) * 100);}
    if (ux?.usabilityFactors?.satisfaction?.score) {scores.push((ux.usabilityFactors.satisfaction.score / 10) * 100);}

    const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 70;
    return Math.round(avgScore);
  }

  /**
   * Generate content with retry logic and validation
   */
  async generateWithRetry(parts, options = {}, attempt = 1) {
    try {
      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const generatedText = response.text();

      // Validate output quality
      if (!this.validateOutput(generatedText) && attempt <= this.maxRetries) {
        console.warn(`⚠️ Weak output detected (attempt ${attempt}/${this.maxRetries}), retrying with reinforced prompt`);

        // Enhance prompt for retry
        const enhancedParts = [...parts];
        enhancedParts[0].text += '\n\nIMPORTANT: Ensure output uses proper Markdown format (# ## ###) and includes comprehensive technical details. Minimum 500 words required.';

        return this.generateWithRetry(enhancedParts, options, attempt + 1);
      }

      return generatedText;
    } catch (error) {
      if (attempt <= this.maxRetries) {
        console.warn(`⚠️ API error (attempt ${attempt}/${this.maxRetries}), retrying:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        return this.generateWithRetry(parts, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Validate AI output quality
   */
  validateOutput(text) {
    return text.includes('#') &&
           text.includes('##') &&
           text.length >= 300 &&
           !text.includes('# ') && // No markdown headers
           !text.includes('**'); // No markdown bold
  }

  /**
   * Compress context if it exceeds threshold
   */
  compressContextIfNeeded(context) {
    const contextStr = JSON.stringify(context);
    if (contextStr.length <= this.compressionThreshold) {
      return context;
    }

    console.log(`🗜️ Compressing context from ${contextStr.length} to reduce token usage`);

    return {
      ...context,
      visualDesignContext: this.summarizeContext(context.visualDesignContext),
      hierarchicalData: this.summarizeHierarchy(context.hierarchicalData)
    };
  }

  /**
   * Summarize visual design context
   */
  summarizeContext(visualContext) {
    if (!visualContext) {return visualContext;}

    return {
      colorPalette: visualContext.colorPalette?.slice(0, 10) || [], // Top 10 colors
      typography: {
        fonts: visualContext.typography?.fonts?.slice(0, 5) || [],
        sizes: visualContext.typography?.sizes?.slice(0, 8) || [],
        hierarchy: visualContext.typography?.hierarchy?.slice(0, 4) || []
      },
      spacing: {
        patterns: visualContext.spacing?.patterns?.slice(0, 6) || [],
        measurements: visualContext.spacing?.measurements?.slice(0, 8) || []
      },
      layout: visualContext.layout || {}
    };
  }

  /**
   * Summarize hierarchical data
   */
  summarizeHierarchy(hierarchyData) {
    if (!hierarchyData) {return hierarchyData;}

    return {
      components: hierarchyData.components?.slice(0, 15) || [], // Top 15 components
      designSystemLinks: hierarchyData.designSystemLinks || null
    };
  }

  /**
   * Build enhanced prompt with modular composition
   */
  buildEnhancedPrompt(context, options) {
    // 🎯 PRIORITY: Use template-guided prompt if provided
    if (context.templateGuidedPrompt) {
      console.log('🎯 Using custom template-guided prompt instead of generic prompt');
      return context.templateGuidedPrompt;
    }

    // Extract template structure from context if available
    const templateStructure = context.templateStructure || null;

    const sections = [
      this.promptHeaders(context, options),
      this.promptDesignAnalysis(context),
      this.promptImplementationGuidance(context, options),
      this.promptExpectedOutput(options, templateStructure)
    ];

    return sections.join('\n\n');
  }

  /**
   * Generate prompt headers and context
   */
  promptHeaders(context, options) {
    const { documentType = 'jira', techStack = 'React TypeScript', instructions = '' } = options;
    const designInsights = this.analyzeDesignContext(context);
    const intelligence = context.intelligenceContext;

    return `# 🧠 COMPREHENSIVE DESIGN INTELLIGENCE for Professional ${documentType.toUpperCase()} Ticket

## Advanced Context Intelligence
You are an expert UI/UX implementation analyst with deep experience in ${techStack}. You have access to comprehensive design intelligence including business context, technical requirements, UX patterns, and design system analysis.

${intelligence ? `## 🎯 INTELLIGENCE BRIEFING (Confidence: ${intelligence.confidenceScore}%)

### 🏢 Business Context & Strategy
- **Industry Domain**: ${intelligence.business?.industryDomain?.domain || '[INDUSTRY_DETECTION_MISSING]'} (${Math.round((intelligence.business?.industryDomain?.confidence || 0) * 100)}% confidence)
- **Business Model**: ${intelligence.business?.businessModel?.model || '[BUSINESS_MODEL_ANALYSIS_MISSING]'}
- **Target Personas**: ${intelligence.business?.userPersonas?.map(p => `${p.type} (${Math.round(p.confidence * 100)}%)`).join(', ') || '[USER_PERSONAS_DETECTION_MISSING]'}
- **Success Metrics**: ${intelligence.business?.successMetrics?.primary?.join(', ') || '[SUCCESS_METRICS_ANALYSIS_MISSING]'}
- **Compliance**: ${intelligence.business?.businessConstraints?.compliance?.join(', ') || '[COMPLIANCE_DETECTION_MISSING]'}

### 🎨 Enhanced Design System Intelligence
- **Design System Maturity**: ${intelligence.designSystem?.designSystemMaturity?.level || '[DESIGN_MATURITY_MISSING]'} (${intelligence.designSystem?.designSystemMaturity?.score || 0}% score)
- **Context Richness**: ${intelligence.designSystem?.contextRichness || 0}% comprehensive analysis
- **Brand Personality**: ${intelligence.designSystem?.brandSystem?.brandPersonality?.primary || intelligence.designSystem?.brandIdentity?.colorPersonality?.mood?.join(', ') || '[BRAND_PERSONALITY_ANALYSIS_MISSING]'}
- **Design Philosophy**: ${intelligence.designSystem?.designPhilosophy?.primary || '[DESIGN_PHILOSOPHY_MISSING]'} (${Math.round((intelligence.designSystem?.designPhilosophy?.confidence || 0) * 100)}% confidence)
- **Visual Style**: ${intelligence.designSystem?.brandSystem?.visualStyle || intelligence.designSystem?.brandIdentity?.visualStyle || '[VISUAL_STYLE_DETECTION_MISSING]'}
- **Typography Scale**: ${intelligence.designSystem?.designTokens?.typographyScale?.scale || '[TYPOGRAPHY_SCALE_MISSING]'} (${intelligence.designSystem?.designTokens?.typographyScale?.ratio || 'unknown'} ratio)
- **Color System**: ${intelligence.designSystem?.designTokens?.semanticColors?.systemCompleteness || '[COLOR_SYSTEM_MISSING]'} semantic completeness
- **Component Library**: ${intelligence.designSystem?.componentLibrary?.atomicDesign?.atoms?.length || 0} atoms, ${intelligence.designSystem?.componentLibrary?.atomicDesign?.molecules?.length || 0} molecules, ${intelligence.designSystem?.componentLibrary?.atomicDesign?.organisms?.length || 0} organisms
- **Accessibility Level**: ${intelligence.designSystem?.accessibilityProfile?.colorContrast || '[ACCESSIBILITY_ANALYSIS_MISSING]'}
- **AI Guidance**: ${intelligence.designSystem?.designPhilosophy?.aiGuidance?.approach || 'Context-appropriate implementation'}

### ⚙️ Technical Architecture Intelligence
- **Complexity Assessment**: ${intelligence.technical?.componentComplexity?.overall?.level || '[COMPLEXITY_ANALYSIS_MISSING]'} complexity
- **Recommended Pattern**: ${intelligence.technical?.architectureProfile?.recommendedPattern || '[ARCHITECTURE_PATTERN_MISSING]'}
- **State Management**: ${intelligence.technical?.stateManagement?.recommendedLibrary || '[STATE_MANAGEMENT_ANALYSIS_MISSING]'}
- **Development Estimate**: ${intelligence.technical?.componentComplexity?.developmentTime?.estimated || '[TIME_ESTIMATE_MISSING]'} hours
- **Risk Factors**: ${intelligence.technical?.componentComplexity?.riskFactors?.join(', ') || '[RISK_ANALYSIS_MISSING]'}
- **Performance Profile**: ${intelligence.technical?.performanceProfile?.criticalPath || '[PERFORMANCE_ANALYSIS_MISSING]'}

### 👤 User Experience Intelligence
- **Journey Stage**: ${intelligence.userExperience?.userJourney?.primaryFlow?.map(step => step.step)?.join(' → ') || '[USER_JOURNEY_ANALYSIS_MISSING]'}
- **Cognitive Load**: ${intelligence.userExperience?.cognitiveLoad?.overallLoad?.level || '[COGNITIVE_LOAD_MISSING]'} cognitive complexity
- **Usability Score**: ${intelligence.userExperience?.usabilityFactors?.satisfaction?.score || '[USABILITY_SCORE_MISSING]'}/10
- **Mobile UX Priority**: ${intelligence.userExperience?.mobileUX?.touchTargets?.level || '[MOBILE_UX_ANALYSIS_MISSING]'} mobile optimization
- **Conversion Factors**: ${intelligence.userExperience?.conversionOptimization?.conversionGoals?.join(', ') || '[CONVERSION_ANALYSIS_MISSING]'}
- **Accessibility Needs**: ${intelligence.userExperience?.accessibilityProfile?.keyboardNavigation || '[ACCESSIBILITY_UX_MISSING]'}
` : '## 📋 Standard Analysis Mode (Limited Context)'}

## CRITICAL INTELLIGENCE-DRIVEN ANALYSIS
- **Use business context** to understand user needs and success criteria from ${intelligence?.business?.industryDomain?.domain || 'general'} industry perspective
- **Apply UX intelligence** to address ${intelligence?.userExperience?.cognitiveLoad?.overallLoad?.level || 'medium'} cognitive load and ${intelligence?.userExperience?.userJourney?.primaryFlow?.length || 'multi'}-step user journey
- **Leverage technical insights** for ${intelligence?.technical?.componentComplexity?.overall?.level || 'medium'} complexity implementation with ${intelligence?.technical?.componentComplexity?.developmentTime?.estimated || 24}-hour estimate
- **Consider design system** alignment with ${intelligence?.designSystem?.brandIdentity?.visualStyle || 'modern'} brand personality and ${intelligence?.designSystem?.accessibilityProfile?.colorContrast || 'standard'} accessibility requirements

## Component Analysis Context

### 🎨 Component: ${this._extractComponentName(context)}
- **File**: ${context.figmaContext?.fileName || 'Unknown File'}
- **Component Type**: ${designInsights.componentType}
- **Implementation Complexity**: ${designInsights.complexity}
- **Primary Function**: ${designInsights.inferredPurpose}
- **Business Context**: ${intelligence?.business?.industryDomain?.domain || 'General'} industry, ${intelligence?.business?.businessModel?.model || 'standard'} business model
- **User Context**: ${intelligence?.business?.userPersonas?.[0]?.type || 'General user'} interaction pattern`;
  }

  /**
   * Generate design analysis section
   */
  promptDesignAnalysis(context) {
    const designInsights = this.analyzeDesignContext(context);

    return `${context.screenshot ? `### 📸 Visual Screenshot Analysis
- **Resolution**: ${context.screenshot.resolution ? `${context.screenshot.resolution.width}×${context.screenshot.resolution.height}px` : 'Available'}
- **Format**: ${context.screenshot.format}
- **URL**: Available for analysis

**ANALYZE THE SCREENSHOT**: Look at the actual visual design, understand the layout, interaction patterns, and user experience implications.` : '### ⚠️ No Screenshot - Analysis Based on Structured Data'}

### 🎨 Design Intelligence Extracted
${designInsights.hasRichContext ? `
**Color System Detected**:
${context.visualDesignContext?.colorPalette?.map(color =>
    `- ${color.hex} (${color.usage?.join(', ') || 'UI element'}) - ${color.count || 1} uses`
  ).join('\\n') || '- Standard design system colors'}

**Typography Analysis**:
${context.visualDesignContext?.typography ? `
- Fonts: ${context.visualDesignContext.typography.fonts?.join(', ') || 'System fonts'}
- Size Range: ${context.visualDesignContext.typography.sizes?.join('px, ') || '14, 16, 18, 24'}px
- Hierarchy: ${context.visualDesignContext.typography.hierarchy?.join(' → ') || 'Title → Body → Caption'}` : '- Standard typography hierarchy detected'}

**Layout & Spacing**:
${context.visualDesignContext?.spacing ? `
- Patterns: ${context.visualDesignContext.spacing.patterns?.join(', ') || 'Grid-based spacing'}
- Key Measurements: ${context.visualDesignContext.spacing.measurements?.join('px, ') || '8, 16, 24, 32'}px
- Structure: ${context.visualDesignContext.layout?.structure || 'Responsive layout'}` : '- Standard responsive layout patterns'}

**Component Architecture**:
${context.hierarchicalData?.components?.map(comp =>
    `- ${comp.name}: ${comp.type || 'Component'} ${comp.masterComponent ? `(Instance of ${comp.masterComponent})` : '(Custom)'}`
  ).join('\\n') || '- Standalone component implementation required'}
` : `
**Limited Design Context Available** - Focus on structured implementation approach
- Component name: ${context.componentName}
- Basic responsive requirements apply
`}`;
  }

  /**
   * Generate implementation guidance section
   */
  promptImplementationGuidance(context, options) {
    const { techStack = 'React TypeScript' } = options;
    const intelligence = context.intelligenceContext;

    return `### 🔧 Technical Implementation Context
- **Target Framework**: ${techStack}
- **File Key**: ${context.figmaContext?.fileKey || context.fileKey || 'Not available'}
- **Live Design URL**: ${context.figmaContext?.fileKey ? `https://www.figma.com/file/${context.figmaContext.fileKey}` : 'Not available'}

${intelligence ? `### 🧠 INTELLIGENCE-DRIVEN IMPLEMENTATION STRATEGY

#### 🎯 Priority Implementation Requirements (Based on ${intelligence.confidenceScore}% Confidence)

**1. Business-Aligned Architecture**
- **Industry Context**: Design for ${intelligence.business?.industryDomain?.domain || 'general'} industry ${intelligence.business?.userPersonas?.[0]?.type || 'users'}
- **Success Optimization**: Focus on ${intelligence.business?.successMetrics?.primary?.join(' and ') || 'user engagement'}
- **Compliance Requirements**: Ensure ${intelligence.business?.businessConstraints?.compliance?.join(', ') || 'GDPR'} compliance from day one

**2. UX-Informed Technical Decisions**
- **Cognitive Load Management**: Design for ${intelligence.userExperience?.cognitiveLoad?.overallLoad?.level || 'medium'} complexity users
- **User Journey Integration**: Support ${intelligence.userExperience?.userJourney?.primaryFlow?.map(step => step.step)?.join(' → ') || 'task completion'} flow
- **Conversion Optimization**: Prioritize ${intelligence.userExperience?.conversionOptimization?.conversionGoals?.join(' and ') || 'task completion'}
- **Mobile-First Strategy**: ${intelligence.userExperience?.mobileUX?.touchTargets?.level === 'High' ? 'Critical mobile optimization required' : 'Standard responsive approach'}

**3. Technical Architecture Recommendations**
- **Complexity Level**: ${intelligence.technical?.componentComplexity?.overall?.level || 'Medium'} complexity implementation
- **Recommended Pattern**: Use ${intelligence.technical?.architectureProfile?.recommendedPattern || 'component composition'} approach
- **State Management**: Implement ${intelligence.technical?.stateManagement?.recommendedLibrary || 'local state'} strategy
- **Development Scope**: Plan for ~${intelligence.technical?.componentComplexity?.developmentTime?.estimated || 24} hours development
- **Risk Mitigation**: Address ${intelligence.technical?.componentComplexity?.riskFactors?.join(', ') || 'standard implementation challenges'}

**4. Design System Integration**
- **Brand Alignment**: Follow ${intelligence.designSystem?.brandIdentity?.visualStyle || 'modern, clean'} brand guidelines
- **Component Pattern**: Use ${intelligence.designSystem?.componentPatterns?.atomicDesign || 'atomic design'} methodology
- **Accessibility Target**: Achieve ${intelligence.designSystem?.accessibilityProfile?.colorContrast || 'WCAG AA'} compliance
- **Typography Implementation**: Apply ${intelligence.designSystem?.brandIdentity?.typographyVoice?.personality?.join(', ') || 'readable, friendly'} typography voice

#### 🔍 Intelligence-Informed Analysis Questions

Based on the comprehensive context intelligence, analyze:

1. **Business Impact Assessment**: How does this component support ${intelligence.business?.industryDomain?.domain || 'business'} objectives and ${intelligence.business?.userPersonas?.[0]?.type || 'user'} needs?
2. **UX Journey Optimization**: How does it fit into the ${intelligence.userExperience?.userJourney?.primaryFlow?.length || 'multi'}-step user journey and ${intelligence.userExperience?.cognitiveLoad?.overallLoad?.level || 'medium'} cognitive load management?
3. **Technical Architecture**: What ${intelligence.technical?.architectureProfile?.recommendedPattern || 'component'} patterns best serve the ${intelligence.technical?.componentComplexity?.overall?.level || 'medium'} complexity requirements?
4. **Design System Compliance**: How does it align with ${intelligence.designSystem?.brandIdentity?.colorPersonality?.mood?.join(', ') || 'professional'} brand personality and ${intelligence.designSystem?.componentPatterns?.atomicDesign || 'component-based'} design patterns?
5. **Performance & Accessibility**: What optimizations are needed for ${intelligence.technical?.performanceProfile?.criticalPath || 'standard'} performance and ${intelligence.userExperience?.accessibilityProfile?.keyboardNavigation || 'standard'} accessibility requirements?

` : `### 🎯 Standard Implementation Requirements

Based on your analysis, determine:

1. **Component Complexity**: Is this a simple display component, interactive element, or complex widget?
2. **Data Requirements**: What props/data does this component need?
3. **State Management**: Does it need local state, form handling, or external state?
4. **Accessibility Considerations**: What specific ARIA attributes and keyboard interactions are needed?
5. **Performance Implications**: Any specific optimization needs (lazy loading, virtualization, etc.)?
6. **Integration Challenges**: How does this fit into the existing design system?

`}### 📊 Context Quality Metrics
- **Intelligence Confidence**: ${intelligence?.confidenceScore || 60}%
- **Available Context**: ${intelligence ? 'Comprehensive business, UX, technical, and design intelligence' : 'Basic component analysis'}
- **Analysis Depth**: ${intelligence ? `${intelligence.business ? 'Business✓' : ''} ${intelligence.designSystem ? 'Design✓' : ''} ${intelligence.technical ? 'Technical✓' : ''} ${intelligence.userExperience ? 'UX✓' : ''}`.trim() : 'Standard design analysis'}`;
  }

  /**
   * Generate expected output format section using actual template structure
   */
  promptExpectedOutput(options, templateStructure = null) {
    const { techStack = 'React TypeScript', platform = 'jira' } = options;

    // If we have template structure, use it to build dynamic output format
    if (templateStructure && templateStructure.sections) {
      return this.buildTemplateBasedOutput(templateStructure, options);
    }

    // Fallback to intelligent default structure
    return `## Expected Professional Output

Generate a **comprehensive professional ticket** that leverages the provided intelligence context and follows the platform-specific format requirements.

**OUTPUT FORMAT**: Return clean ${platform.toUpperCase()} markdown content only - NO JSON wrapping, NO additional formatting.

### 🎯 Required Ticket Structure (Based on ${techStack})

Follow this exact structure for professional ticket generation:

# 🎯 Executive Summary & Business Context
*Business impact, user value proposition, strategic alignment*

## 🏢 Business Requirements & User Context  
*Industry-specific requirements, user personas, business model alignment*

## 👤 User Experience Strategy
*Cognitive load optimization, user journey integration, conversion goals*

## 📋 Technical Analysis & Architecture
*Implementation strategy for ${techStack}, complexity assessment, architecture patterns*

## 🎨 Design System Implementation
*Brand alignment, design tokens, typography, responsive behavior*

## ✅ Intelligence-Driven Acceptance Criteria
*Measurable goals, performance benchmarks, compliance requirements*

## 🔧 Development Strategy & Implementation
*Code architecture, time estimates, risk mitigation, testing strategy*

## 📊 Success Measurement & Validation
*Business metrics, technical KPIs, user experience validation*

---

**CRITICAL OUTPUT REQUIREMENTS**:
- Generate ONLY the ticket content - no JSON, no metadata wrapper
- Use proper markdown formatting (# ## ### for headers)
- Integrate intelligence context throughout all sections
- Make content actionable and development-ready
- Apply ${techStack} specific technical recommendations

*RETURN CLEAN MARKDOWN ONLY - DO NOT WRAP IN JSON STRUCTURE*`;
  }

  /**
   * Build template-based output format using actual template structure (fully leveraging base.yml)
   */
  buildTemplateBasedOutput(templateStructure, options) {
    const { techStack = 'React TypeScript', platform = 'jira' } = options;

    let output = `## Expected Professional Output - BASED ON ACTUAL TEMPLATE STRUCTURE

Generate a **comprehensive professional ticket** using the complete base.yml template structure provided below.

**CRITICAL OUTPUT REQUIREMENT**: Return ONLY clean markdown content - NO JSON wrapper, NO additional structure.

### 🎯 COMPLETE TEMPLATE-DRIVEN STRUCTURE (from base.yml)

You MUST include ALL sections and populate ALL variables from the base template:

`;

    // Generate comprehensive ticket structure based on base.yml
    output += `# 🎯 ${this.extractVariableValue(templateStructure, 'component_name')} - ${this.extractVariableValue(templateStructure, 'component_type')} Implementation

## 📋 Project Context & Component Details
**Project**: ${this.extractVariableValue(templateStructure, 'project_name')}
**Component**: ${this.extractVariableValue(templateStructure, 'component_name')}
**Type**: ${this.extractVariableValue(templateStructure, 'component_type')}
**Priority**: ${this.extractVariableValue(templateStructure, 'priority')}
**Story Points**: ${this.extractVariableValue(templateStructure, 'story_points')}
**Technologies**: ${this.extractVariableValue(templateStructure, 'technologies')}
**Labels**: ${this.extractVariableValue(templateStructure, 'labels')}

## 🎨 Design System & Visual References
**Figma URL**: ${this.extractVariableValue(templateStructure, 'figma_url')}
**Design Status**: ${this.extractVariableValue(templateStructure, 'design_status')}
**Screenshot**: ${this.extractVariableValue(templateStructure, 'screenshot_filename')}

### Design Tokens Implementation
**Colors**: ${this.extractVariableValue(templateStructure, 'colors')}
**Typography**: ${this.extractVariableValue(templateStructure, 'typography')}

`;

    // Add design tokens sections if available
    if (templateStructure.sections?.designTokens_spacing) {
      output += '### Spacing System\n';
      output += `**Base Unit**: ${this.extractDesignTokenValue(templateStructure, 'spacing.base_unit')}\n`;
      output += `**Margins**: ${this.extractDesignTokenValue(templateStructure, 'spacing.margins')}\n`;
      output += `**Paddings**: ${this.extractDesignTokenValue(templateStructure, 'spacing.paddings')}\n`;
      output += `**Grid**: ${this.extractDesignTokenValue(templateStructure, 'spacing.grid_columns')} columns, ${this.extractDesignTokenValue(templateStructure, 'spacing.grid_gutter')} gutter\n\n`;
    }

    if (templateStructure.sections?.designTokens_states) {
      output += '### Interactive States\n';
      output += `**Hover**: ${this.extractDesignTokenValue(templateStructure, 'states.hover')}\n`;
      output += `**Focus**: ${this.extractDesignTokenValue(templateStructure, 'states.focus')}\n`;
      output += `**Active**: ${this.extractDesignTokenValue(templateStructure, 'states.active')}\n`;
      output += `**Disabled**: ${this.extractDesignTokenValue(templateStructure, 'states.disabled')}\n`;
      output += `**Error**: ${this.extractDesignTokenValue(templateStructure, 'states.error')}\n`;
      output += `**Success**: ${this.extractDesignTokenValue(templateStructure, 'states.success')}\n\n`;
    }

    if (templateStructure.sections?.designTokens_accessibility) {
      output += '### Accessibility Requirements\n';
      output += `**Contrast Ratio**: ${this.extractDesignTokenValue(templateStructure, 'accessibility.contrast_ratio')}\n`;
      output += `**Keyboard Navigation**: ${this.extractDesignTokenValue(templateStructure, 'accessibility.keyboard_nav')}\n`;
      output += `**ARIA Roles**: ${this.extractDesignTokenValue(templateStructure, 'accessibility.aria_roles')}\n`;
      output += `**Screen Reader**: ${this.extractDesignTokenValue(templateStructure, 'accessibility.screen_reader')}\n\n`;
    }

    if (templateStructure.sections?.designTokens_motion) {
      output += '### Motion & Animation\n';
      output += `**Duration**: ${this.extractDesignTokenValue(templateStructure, 'motion.duration')}\n`;
      output += `**Easing**: ${this.extractDesignTokenValue(templateStructure, 'motion.easing')}\n\n`;
    }

    if (templateStructure.sections?.designTokens_breakpoints) {
      output += '### Responsive Breakpoints\n';
      output += `**Mobile**: ${this.extractDesignTokenValue(templateStructure, 'breakpoints.mobile')}\n`;
      output += `**Tablet**: ${this.extractDesignTokenValue(templateStructure, 'breakpoints.tablet')}\n`;
      output += `**Desktop**: ${this.extractDesignTokenValue(templateStructure, 'breakpoints.desktop')}\n\n`;
    }

    // Add authoring section if available
    if (templateStructure.sections?.authoring) {
      output += '## ⚙️ AEM/CQ Authoring Requirements\n';
      output += `**Touch UI Required**: ${this.extractVariableValue(templateStructure, 'touch_ui')}\n`;
      output += `**CQ Template**: ${this.extractVariableValue(templateStructure, 'cq_template')}\n`;
      output += `**Component Path**: ${this.extractVariableValue(templateStructure, 'component_path')}\n`;
      output += `**Authoring Notes**: ${this.extractVariableValue(templateStructure, 'authoring_notes')}\n\n`;
    }

    // Add resources section
    output += '## 📚 Resources & References\n';
    if (templateStructure.resources && templateStructure.resources.length > 0) {
      templateStructure.resources.forEach(resource => {
        output += `**${resource.type}**: ${resource.link || 'URL to be populated'}\n`;
        if (resource.notes) {
          output += `*${resource.notes}*\n`;
        }
        output += '\n';
      });
    }

    output += `
## 🔧 Technical Implementation for ${techStack}
*Populate with specific technical requirements based on component analysis*

## ✅ Acceptance Criteria
*Define measurable success criteria based on component requirements*

---

**CRITICAL BASE TEMPLATE COMPLIANCE**:
- POPULATE ALL template variables listed above with actual context data
- Include ALL design tokens from base.yml (colors, typography, spacing, states, accessibility, motion, breakpoints)  
- Reference ALL resource URLs (Figma, Storybook, Wiki, GitHub, Analytics)
- Include AEM/CQ authoring requirements if applicable
- Apply ${techStack} specific technical guidance
- Generate comprehensive, production-ready content
- Return ONLY the markdown ticket content - NO JSON STRUCTURE

**Template Variables to Populate**: ${Object.keys(templateStructure.variables || {}).join(', ')}
**Design Token Categories**: ${Object.keys(templateStructure.sections || {}).filter(k => k.startsWith('designTokens_')).join(', ')}
**Resource Count**: ${templateStructure.resources?.length || 0} resources to include

*IMPORTANT*: Output should be clean markdown ready for copy-paste use with ALL base.yml content included.`;

    return output;
  }

  /**
   * Extract variable value with fallback
   */
  extractVariableValue(templateStructure, variableName) {
    const variable = templateStructure.variables?.[variableName];
    if (typeof variable === 'string') {
      return variable;
    }
    return `[${variableName.toUpperCase().replace(/_/g, ' ')} TO BE POPULATED]`;
  }

  /**
   * Extract design token value with fallback
   */
  extractDesignTokenValue(templateStructure, tokenPath) {
    const sections = templateStructure.sections || {};
    const pathParts = tokenPath.split('.');

    // Look in design sections
    if (sections.design) {
      let value = sections.design;
      for (const part of pathParts) {
        value = value?.[part];
      }
      if (value) {return JSON.stringify(value);}
    }

    return `[${tokenPath.toUpperCase().replace(/\./g, ' ')} TO BE POPULATED]`;
  }

  /**
   * Format section title from template structure
   */
  formatSectionTitle(sectionKey, sectionData) {
    // Use template title if available, otherwise format key
    if (sectionData.title) {
      return sectionData.title;
    }

    // Format camelCase/snake_case keys to readable titles
    return sectionKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  }

  /**
   * Analyze design context to extract intelligent insights
   */
  analyzeDesignContext(context) {
    const insights = {
      componentType: 'Unknown',
      complexity: 'Medium',
      inferredPurpose: 'UI Component',
      hasRichContext: false
    };

    // Analyze component name to infer type and purpose
    const componentName = context.componentName || context.figmaContext?.selection?.name || '';

    if (componentName) {
      const nameLower = componentName.toLowerCase();

      // Infer component type from name
      if (nameLower.includes('button') || nameLower.includes('btn')) {
        insights.componentType = 'Interactive Button';
        insights.inferredPurpose = 'User action trigger with click handling and states';
      } else if (nameLower.includes('card')) {
        insights.componentType = 'Content Card';
        insights.inferredPurpose = 'Content display container with structured information';
      } else if (nameLower.includes('modal') || nameLower.includes('dialog')) {
        insights.componentType = 'Modal Dialog';
        insights.inferredPurpose = 'Overlay interface for focused user interaction';
        insights.complexity = 'High';
      } else if (nameLower.includes('form') || nameLower.includes('input')) {
        insights.componentType = 'Form Control';
        insights.inferredPurpose = 'Data input and validation interface';
        insights.complexity = 'High';
      } else if (nameLower.includes('nav') || nameLower.includes('menu')) {
        insights.componentType = 'Navigation Component';
        insights.inferredPurpose = 'Site navigation and user flow control';
      } else if (nameLower.includes('header') || nameLower.includes('hero')) {
        insights.componentType = 'Header Section';
        insights.inferredPurpose = 'Page header with branding and primary navigation';
      } else if (nameLower.includes('footer')) {
        insights.componentType = 'Footer Section';
        insights.inferredPurpose = 'Page footer with secondary links and information';
      } else if (nameLower.includes('sidebar')) {
        insights.componentType = 'Sidebar Component';
        insights.inferredPurpose = 'Secondary navigation or content area';
      } else if (nameLower.includes('table') || nameLower.includes('list')) {
        insights.componentType = 'Data Display';
        insights.inferredPurpose = 'Structured data presentation and interaction';
        insights.complexity = 'High';
      } else if (nameLower.includes('case studies') || nameLower.includes('case study')) {
        insights.componentType = 'Case Study Showcase';
        insights.inferredPurpose = 'Portfolio/case study content display with media and text';
        insights.complexity = 'Medium-High';
      } else {
        insights.componentType = 'Content Component';
        insights.inferredPurpose = 'Custom content display element';
      }
    }

    // Analyze complexity based on available context
    const hasColorSystem = context.visualDesignContext?.colorPalette?.length > 0;
    const hasTypography = context.visualDesignContext?.typography?.fonts?.length > 0;
    const hasMultipleComponents = context.hierarchicalData?.components?.length > 1;
    const hasScreenshot = !!context.screenshot;

    if (hasColorSystem || hasTypography || hasMultipleComponents || hasScreenshot) {
      insights.hasRichContext = true;
    }

    // Adjust complexity based on rich context
    if (insights.hasRichContext) {
      if (hasMultipleComponents && context.hierarchicalData.components.length > 3) {
        insights.complexity = 'High';
      } else if (hasColorSystem && hasTypography) {
        insights.complexity = 'Medium-High';
      }
    }

    return insights;
  }

  /**
   * Parse AI response into structured analysis
   * FIXED: Improved content extraction using semantic section detection instead of fragmented keyword matching
   */
  parseAIResponse(response) {
    // Use semantic section extraction instead of keyword-based fragmentation
    const sections = {
      summary: this.extractExecutiveSummary(response),
      implementation: this.extractImplementationSection(response),
      recommendations: this.extractRecommendationsSection(response),
      designSystem: this.extractDesignSystemSection(response)
    };

    // Apply content deduplication to avoid repetitive ticket content
    const deduplicatedSections = this.deduplicateContent(sections);

    return deduplicatedSections;
  }

  /**
   * Extract executive summary from AI response
   * FIXED: Look for actual summary content instead of fragmented sentences
   */
  extractExecutiveSummary(text) {
    // Look for summary sections with various header patterns
    const summaryPatterns = [
      /(?:h1\.|#|##)\s*🎯\s*Executive Summary.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h1\.|#|##)\s*Summary.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h1\.|#|##)\s*Overview.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /^(.*?)(?=\n(?:h[1-6]\.|#{1,6}))/is // First paragraph as fallback
    ];

    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 50) {
        return this.convertTextileToMarkdown(this.cleanExtractedContent(match[1]));
      }
    }

    // Fallback: Extract first meaningful paragraph
    const paragraphs = text.split(/\n\s*\n/);
    const meaningfulParagraph = paragraphs.find(p =>
      p.trim().length > 100 &&
      !p.startsWith('#') &&
      !p.startsWith('#') &&
      !p.match(/^\s*[*\-+]\s/)
    );

    return meaningfulParagraph ? this.convertTextileToMarkdown(this.cleanExtractedContent(meaningfulParagraph)) : 'Executive summary not clearly identified in response.';
  }

  /**
   * Extract implementation details from AI response
   * FIXED: Look for technical implementation sections
   */
  extractImplementationSection(text) {
    const implementationPatterns = [
      /(?:h[1-6]\.|#{1,6})\s*📋\s*Technical Analysis.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*Implementation.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*Technical.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*Architecture.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*🔧\s*Development.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is
    ];

    for (const pattern of implementationPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 50) {
        return this.convertTextileToMarkdown(this.cleanExtractedContent(match[1]));
      }
    }

    // Fallback: Look for technical content
    const technicalKeywords = ['component', 'implementation', 'architecture', 'technical', 'development'];
    const paragraphs = text.split(/\n\s*\n/);
    const technicalParagraph = paragraphs.find(p =>
      technicalKeywords.some(keyword => p.toLowerCase().includes(keyword)) &&
      p.trim().length > 100
    );

    return technicalParagraph ? this.convertTextileToMarkdown(this.cleanExtractedContent(technicalParagraph)) : 'Technical implementation details not clearly specified.';
  }

  /**
   * Extract recommendations from AI response
   * FIXED: Look for recommendation sections and lists
   */
  extractRecommendationsSection(text) {
    const recommendationPatterns = [
      /(?:h[1-6]\.|#{1,6})\s*📊\s*Success Measurement.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*Recommendation.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*✅\s*Intelligence.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*Success.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is
    ];

    for (const pattern of recommendationPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 30) {
        return this.cleanExtractedContent(match[1]);
      }
    }

    // Look for bullet point recommendations
    const bulletMatches = text.match(/(?:\*\s+.*(?:\n|\r\n?))+/g);
    if (bulletMatches && bulletMatches.length > 0) {
      const longestList = bulletMatches.reduce((longest, current) =>
        current.length > longest.length ? current : longest
      );
      if (longestList.length > 50) {
        return this.convertTextileToMarkdown(this.cleanExtractedContent(longestList));
      }
    }

    return 'Specific recommendations not clearly outlined in response.';
  }

  /**
   * Extract design system information from AI response
   * FIXED: Look for design system sections
   */
  extractDesignSystemSection(text) {
    const designSystemPatterns = [
      /(?:h[1-6]\.|#{1,6})\s*🎨\s*Design System.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*Design.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is,
      /(?:h[1-6]\.|#{1,6})\s*Style.*?\n\n(.*?)(?=\n(?:h[1-6]\.|#{1,6}|\n\n))/is
    ];

    for (const pattern of designSystemPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 50) {
        return this.convertTextileToMarkdown(this.cleanExtractedContent(match[1]));
      }
    }

    // Look for design-related content
    const designKeywords = ['design system', 'design tokens', 'style', 'color', 'typography', 'spacing'];
    const paragraphs = text.split(/\n\s*\n/);
    const designParagraph = paragraphs.find(p =>
      designKeywords.some(keyword => p.toLowerCase().includes(keyword)) &&
      p.trim().length > 80
    );

    return designParagraph ? this.convertTextileToMarkdown(this.cleanExtractedContent(designParagraph)) : 'Design system compliance information not specified.';
  }

  /**
   * Clean and format extracted content
   * FIXED: Remove markup artifacts and format consistently
   */
  cleanExtractedContent(content) {
    if (!content) {return '';}

    return content
      .trim()
      // Remove markup artifacts
      .replace(/^(?:h[1-6]\.|#{1,6})\s*/gm, '')
      .replace(/^\s*[*\-+]\s*[*\-+]\s*/gm, '• ') // Fix broken list formatting like "*   *"
      .replace(/^\s*[*\-+]\s{2,}/gm, '• ') // Fix multiple spaces after bullets
      .replace(/^\s*[*\-+]\s*/gm, '• ') // Standardize bullet points
      .replace(/^\s*•\s*•\s*/gm, '• ') // Fix double bullet points
      // Clean up spacing
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      // Remove empty bullet points
      .replace(/^\s*•\s*$/gm, '')
      .trim();
  }

  /**
   * Convert Textile markup to Markdown format
   * FIXED: Standardize on Markdown format to avoid mixed markup issues
   */
  convertTextileToMarkdown(content) {
    if (!content) {return '';}

    let converted = content
      // Convert Textile headers to Markdown
      .replace(/^h1\.\s*/gm, '# ')
      .replace(/^h2\.\s*/gm, '## ')
      .replace(/^h3\.\s*/gm, '### ')
      .replace(/^h4\.\s*/gm, '#### ')
      .replace(/^h5\.\s*/gm, '##### ')
      .replace(/^h6\.\s*/gm, '###### ');

    // Apply comprehensive list formatting fixes
    converted = this.fixListFormatting(converted);

    return converted.trim();
  }

  /**
   * Fix broken list formatting in AI-generated content
   * FIXED: Address patterns like "*   *Component Structure:" and inconsistent spacing
   */
  fixListFormatting(content) {
    if (!content) {return '';}

    return content
      // Fix the specific "*   *Component Structure:" pattern
      .replace(/^\s*\*\s*\*\s*([^*:]+):\s*/gm, '* **$1:** ')
      .replace(/^\s*\*\s*\*\s*([^*]+)$/gm, '* **$1**')
      // Fix nested bullet issues with excessive spacing
      .replace(/^\s*\*\s{3,}\*/gm, '* ')
      .replace(/^\s*\*\s{2,}([^*])/gm, '* $1')
      // Fix inconsistent list markers
      .replace(/^\s*[-+]\s*/gm, '* ')
      // Fix broken indentation in nested lists
      .replace(/^(\s*)\*\s{2,}(\*\s*)/gm, '$1* $2')
      // Clean up excessive line breaks in lists
      .replace(/(\*[^\n]*)\n\s*\n(\s*\*)/g, '$1\n$2')
      // Remove empty list items
      .replace(/^\s*\*\s*$/gm, '')
      .trim();
  }

  /**
   * Remove content duplication between structured fields
   * FIXED: Prevent repetitive content across summary, implementation, recommendations, designSystem
   */
  deduplicateContent(sections) {
    if (!sections || typeof sections !== 'object') {return sections;}

    const { executiveSummary, implementation, recommendations, designSystem } = sections;

    // Create normalized versions for comparison (remove formatting, case, punctuation)
    const normalize = (text) => {
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Extract meaningful phrases (3+ words) for similarity detection
    const extractPhrases = (text, minLength = 3) => {
      const words = normalize(text).split(' ');
      const phrases = [];
      for (let i = 0; i <= words.length - minLength; i++) {
        phrases.push(words.slice(i, i + minLength).join(' '));
      }
      return phrases;
    };

    // Calculate similarity between two texts based on common phrases
    const calculateSimilarity = (text1, text2) => {
      if (!text1 || !text2) {return 0;}
      const phrases1 = extractPhrases(text1);
      const phrases2 = extractPhrases(text2);
      const commonPhrases = phrases1.filter(phrase => phrases2.includes(phrase));
      return phrases1.length > 0 ? commonPhrases.length / phrases1.length : 0;
    };

    // Remove duplicate sentences from target text that appear in source text
    const removeDuplicateSentences = (targetText, sourceText, threshold = 0.7) => {
      if (!targetText || !sourceText) {return targetText;}

      const sentences = targetText.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const uniqueSentences = sentences.filter(sentence => {
        const similarity = calculateSimilarity(sentence, sourceText);
        return similarity < threshold;
      });

      return uniqueSentences.join('. ').trim() + (uniqueSentences.length > 0 ? '.' : '');
    };

    // Deduplicate in order of importance: summary -> implementation -> recommendations -> designSystem
    const deduplicated = { ...sections };

    // Implementation should not repeat executive summary content
    if (implementation && executiveSummary) {
      deduplicated.implementation = removeDuplicateSentences(implementation, executiveSummary, 0.6);
    }

    // Recommendations should not repeat executive summary or implementation
    if (recommendations) {
      let cleanRecommendations = recommendations;
      if (executiveSummary) {
        cleanRecommendations = removeDuplicateSentences(cleanRecommendations, executiveSummary, 0.6);
      }
      if (implementation) {
        cleanRecommendations = removeDuplicateSentences(cleanRecommendations, implementation, 0.6);
      }
      deduplicated.recommendations = cleanRecommendations;
    }

    // Design system should not repeat other sections
    if (designSystem) {
      let cleanDesignSystem = designSystem;
      if (executiveSummary) {
        cleanDesignSystem = removeDuplicateSentences(cleanDesignSystem, executiveSummary, 0.6);
      }
      if (implementation) {
        cleanDesignSystem = removeDuplicateSentences(cleanDesignSystem, implementation, 0.6);
      }
      if (recommendations) {
        cleanDesignSystem = removeDuplicateSentences(cleanDesignSystem, recommendations, 0.6);
      }
      deduplicated.designSystem = cleanDesignSystem;
    }

    // Ensure minimum content length after deduplication
    Object.keys(deduplicated).forEach(key => {
      if (deduplicated[key] && deduplicated[key].trim().length < 50) {
        deduplicated[key] = sections[key]; // Revert to original if too short after deduplication
      }
    });

    return deduplicated;
  }

  /**
   * Extract component name from context with intelligent fallbacks
   * FIXED: Proper component name extraction to avoid "Unknown Component"
   */
  _extractComponentName(context) {
    // Try multiple paths to find the component name
    const possibleNames = [
      context.componentName,
      context.figmaContext?.selection?.name,
      context.figmaContext?.selection?.[0]?.name,
      context.figmaData?.selection?.[0]?.name,
      context.hierarchicalData?.[0]?.name,
      context.enhancedFrameData?.[0]?.name,
      context.frameData?.[0]?.name,
      context.figma?.component_name,
      context.figmaContext?.metadata?.name
    ];

    // Find the first valid name
    for (const name of possibleNames) {
      if (name && typeof name === 'string' && name.trim().length > 0) {
        return name.trim();
      }
    }

    // If no name found, try to extract from file context
    if (context.fileContext?.fileName) {
      return `Component from ${context.fileContext.fileName}`;
    }

    // Last resort fallback
    return 'UI Component'; // More professional than "Unknown Component"
  }

  /**
   * Calculate confidence score based on available context
   */
  calculateConfidence(context, response) {
    let confidence = 60; // Base confidence

    // Visual context bonus
    if (context.screenshot) {
      confidence += 20;
    }

    // Design context richness - with null safety
    if (context.visualDesignContext?.colorPalette?.length > 0) {confidence += 5;}
    if (context.visualDesignContext?.typography?.fonts?.length > 0) {confidence += 5;}
    if (context.visualDesignContext?.spacing?.patterns?.length > 0) {confidence += 5;}

    // Component data richness - with null safety
    if (context.hierarchicalData?.components?.length > 0) {confidence += 10;}
    if (context.hierarchicalData?.designSystemLinks) {confidence += 5;}

    // Response quality indicators
    if (response.length > 500) {confidence += 5;}
    if (response.includes('accessibility') || response.includes('responsive')) {confidence += 3;}
    if (response.includes('component') && response.includes('design system')) {confidence += 2;}

    return Math.min(confidence, 95); // Cap at 95%
  }

  /**
   * Count available data structures for metrics
   */
  countDataStructures(context) {
    let count = 0;

    // Check for screenshot data
    if (context.screenshot && (context.screenshot.base64 || context.screenshot.url)) {
      count++;
    }

    // Check for visual design context structures
    if (context.visualDesignContext?.colorPalette?.length > 0) {
      count++;
    }
    if (context.visualDesignContext?.typography?.fonts?.length > 0) {
      count++;
    }

    // Check for hierarchical data structures
    if (context.hierarchicalData?.components?.length > 0) {
      count++;
    }
    if (context.hierarchicalData?.designSystemLinks) {
      count++;
    }

    // Check for frame data structures
    if (context.frameData?.length > 0) {
      count++;
    }
    if (context.enhancedFrameData?.length > 0) {
      count++;
    }

    // Check for figma context structures
    if (context.figmaContext && Object.keys(context.figmaContext).length > 0) {
      count++;
    }

    // Check for component analysis structures
    if (context.componentAnalysis && Object.keys(context.componentAnalysis).length > 0) {
      count++;
    }

    return count;
  }

  /**
   * Check if context is compressed based on size and complexity
   * FIXED: Better compression detection logic
   */
  isContextCompressed(context) {
    if (!context) {return false;}

    const contextStr = JSON.stringify(context);
    const isLargeContext = contextStr.length > this.compressionThreshold;
    const hasScreenshot = !!(context.screenshot?.base64);
    const hasComplexStructures = this.countDataStructures(context) > 3;

    return isLargeContext || hasScreenshot || hasComplexStructures;
  }

  /**
   * Check if screenshot was actually processed (not just present)
   * FIXED: Verify screenshot processing status properly
   */
  isScreenshotProcessed(context) {
    if (!context?.screenshot) {return false;}

    // Check if we have actual screenshot data
    const hasBase64 = !!(context.screenshot.base64);
    const hasUrl = !!(context.screenshot.url);
    const hasFormat = !!(context.screenshot.format);

    // Screenshot is considered processed if we have data and it's properly formatted
    return (hasBase64 || hasUrl) && hasFormat;
  }

  /**
   * Process visual-enhanced context with streaming for better UX
   */
  async processVisualEnhancedContextStream(context, options = {}, onChunk = null) {
    if (!this.model) {
      throw new Error('Gemini API not configured');
    }

    console.log('🎨 Processing visual-enhanced context with streaming...');
    const startTime = Date.now();

    try {
      // Compress context if needed
      const compressedContext = this.compressContextIfNeeded(context);

      // Build enhanced prompt with modular composition
      const prompt = this.buildEnhancedPrompt(compressedContext, options);

      // Prepare multimodal input
      const parts = [{ text: prompt }];

      // Add screenshot if available
      if (compressedContext.screenshot?.base64) {
        const format = compressedContext.screenshot.format || 'png';
        parts.push({
          inlineData: {
            mimeType: `image/${format.toLowerCase()}`,
            data: compressedContext.screenshot.base64
          }
        });
      }

      // Generate with streaming
      const stream = await this.model.generateContentStream(parts);
      let fullText = '';

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullText += chunkText;

        if (onChunk) {
          onChunk(chunkText, fullText);
        }
      }

      // Validate and retry if needed
      if (!this.validateOutput(fullText)) {
        console.warn('⚠️ Streaming output failed validation, falling back to retry logic');
        return this.processVisualEnhancedContext(compressedContext, options);
      }

      // Clean up the generated text
      let cleanedText = fullText;
      cleanedText = cleanedText.split(/\n#+\s*Design Analysis/i)[0];
      cleanedText = cleanedText.split(/\n#+\s*## Design Analysis/i)[0];
      cleanedText = cleanedText.trim();

      // Check if this is being called in template-guided mode (return clean text)
      const isTemplateGuided = options.useTemplateStructure || compressedContext.templateStructure || compressedContext.templateGuidedPrompt;

      if (isTemplateGuided) {
        console.log('🎯 Template-guided streaming mode: returning clean markdown text');
        return cleanedText;
      }

      // Legacy mode: return structured output for backward compatibility
      const analysis = this.parseAIResponse(cleanedText);
      const processingTime = Date.now() - startTime;

      return {
        ticket: cleanedText,
        structured: {
          summary: analysis.visualUnderstanding,
          implementation: analysis.componentAnalysis,
          recommendations: analysis.recommendationSummary,
          designSystem: analysis.designSystemCompliance
        },
        metadata: {
          confidence: this.calculateConfidence(compressedContext, cleanedText),
          processingTime,
          contextCompressed: this.isContextCompressed(context),
          screenshotProcessed: !!compressedContext.screenshot,
          streaming: true,
          promptTokens: Math.ceil(prompt.length / 4),
          responseTokens: Math.ceil(cleanedText.length / 4)
        }
      };

    } catch (error) {
      console.error('❌ Streaming AI processing failed:', error);
      throw new Error(`Streaming AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test service configuration
   */
  async testConfiguration() {
    if (!this.geminiClient || !this.model) {
      return {
        available: false,
        model: 'none',
        capabilities: [],
        error: 'Service not initialized'
      };
    }

    try {
      // Test basic generation
      const testResult = await this.model.generateContent('Test response');
      const response = await testResult.response;
      const text = response.text();

      return {
        available: true,
        model: 'gemini-2.0-flash',
        capabilities: ['text', 'vision', 'multimodal', 'streaming'],
        features: {
          retry: this.maxRetries,
          compression: this.compressionThreshold,
          modularPrompts: true,
          structuredOutput: true
        },
        testResponse: text?.substring(0, 50) + '...'
      };
    } catch (error) {
      return {
        available: false,
        model: 'gemini-2.0-flash',
        capabilities: [],
        error: error.message
      };
    }
  }

  /**
   * Check if LLM response contains evidence of visual context usage
   */
  checkVisualContextUsage(responseText) {
    const visualKeywords = [
      // Direct visual references
      'screenshot', 'image', 'visual', 'see', 'shown', 'displayed', 'appears',
      'visible', 'layout', 'design', 'component', 'element', 'button', 'text',

      // Color and style references
      'color', 'background', 'border', 'shadow', 'gradient', 'typography',
      'font', 'spacing', 'padding', 'margin', 'alignment',

      // UI/UX specific terms
      'interface', 'user interface', 'ui', 'ux', 'interaction', 'hover',
      'active', 'disabled', 'focused', 'selected', 'highlighted',

      // Figma/Design specific
      'figma', 'frame', 'layer', 'group', 'instance', 'component',
      'auto layout', 'constraints', 'responsive'
    ];

    const lowerResponse = responseText.toLowerCase();
    const foundKeywords = visualKeywords.filter(keyword =>
      lowerResponse.includes(keyword.toLowerCase())
    );

    return {
      used: foundKeywords.length > 0,
      keywords: foundKeywords,
      confidence: Math.min(foundKeywords.length / 5, 1.0) // Scale 0-1
    };
  }
}

export default VisualEnhancedAIService;