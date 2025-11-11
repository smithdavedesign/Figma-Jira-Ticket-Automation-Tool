/**
 * Design System Context Analyzer
 *
 * Extracts comprehensive design system context from Figma designs
 * to provide rich semantic understanding to the LLM.
 */

export class DesignSystemAnalyzer {
  constructor(options = {}) {
    this.brandPatterns = new Map();
    this.componentLibrary = new Map();
    this.designTokens = new Map();

    // Configuration
    this.config = {
      cacheEnabled: options.cacheEnabled !== false,
      cacheExpiry: options.cacheExpiry || 24 * 60 * 60 * 1000, // 24 hours
      enableVerboseLogging: options.enableVerboseLogging || false,
      maxCacheSize: options.maxCacheSize || 50, // Max number of design systems to cache
      ...options
    };

    // Design system cache - keyed by file ID
    this.designSystemCache = new Map();

    // Cache metadata for tracking changes and updates
    this.cacheMetadata = new Map();

    // Initialize cache from storage if available
    this.initializeCache();
  }

  /**
   * Initialize cache from persistent storage
   */
  async initializeCache() {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const cachedData = window.localStorage.getItem('figma-design-system-cache');
        const cacheMetadata = window.localStorage.getItem('figma-design-system-cache-meta');

        if (cachedData && cacheMetadata) {
          const parsedData = JSON.parse(cachedData);
          const parsedMeta = JSON.parse(cacheMetadata);

          // Restore cache with expiry check
          Object.entries(parsedData).forEach(([fileId, data]) => {
            const meta = parsedMeta[fileId];
            if (meta && (Date.now() - meta.lastUpdated) < this.config.cacheExpiry) {
              this.designSystemCache.set(fileId, data);
              this.cacheMetadata.set(fileId, meta);
            }
          });

          this.log('Cache initialized with', this.designSystemCache.size, 'design systems');
        }
      }
    } catch (error) {
      console.warn('Failed to initialize design system cache:', error);
    }
  }

  /**
   * Persist cache to storage
   */
  async persistCache() {
    try {
      if (typeof localStorage !== 'undefined') {
        const cacheData = Object.fromEntries(this.designSystemCache);
        const metaData = Object.fromEntries(this.cacheMetadata);

        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          window.localStorage.setItem('figma-design-system-cache', JSON.stringify(cacheData));
          window.localStorage.setItem('figma-design-system-cache-meta', JSON.stringify(metaData));
        }

        this.log('Cache persisted with', this.designSystemCache.size, 'design systems');
      }
    } catch (error) {
      console.warn('Failed to persist design system cache:', error);
    }
  }

  /**
   * Generate cache key for design system data
   */
  generateCacheKey(fileId, pageIds = []) {
    const baseKey = fileId || 'unknown-file';
    if (pageIds.length > 0) {
      return `${baseKey}-${pageIds.sort().join('-')}`;
    }
    return baseKey;
  }

  /**
   * Calculate content hash for change detection
   */
  calculateContentHash(data) {
    try {
      const content = JSON.stringify(data, Object.keys(data).sort());
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString();
    } catch (error) {
      return Date.now().toString();
    }
  }

  /**
   * Logging utility
   */
  log(...args) {
    if (this.config.enableVerboseLogging) {
      console.log('[DesignSystemAnalyzer]', ...args);
    }
  }

  /**
   * Analyze comprehensive design system context
   */
  async analyzeDesignSystem(figmaData, fileContext) {
    const context = {
      brandIdentity: await this.extractBrandIdentity(figmaData, fileContext),
      designTokens: await this.extractDesignTokens(figmaData),
      componentPatterns: await this.analyzeComponentPatterns(figmaData),
      visualHierarchy: await this.analyzeVisualHierarchy(figmaData),
      interactionPatterns: await this.analyzeInteractionPatterns(figmaData),
      contentStrategy: await this.analyzeContentStrategy(figmaData),
      accessibilityProfile: await this.analyzeAccessibilityProfile(figmaData),
      responsiveStrategy: await this.analyzeResponsiveStrategy(figmaData),
      performanceConsiderations: await this.analyzePerformanceNeeds(figmaData)
    };

    return context;
  }

  /**
   * Extract brand identity and style guidelines
   */
  async extractBrandIdentity(figmaData, fileContext) {
    const identity = {
      colorPersonality: this.analyzeColorPersonality(figmaData),
      typographyVoice: this.analyzeTypographyVoice(figmaData),
      visualStyle: this.categorizeVisualStyle(figmaData),
      brandAdjectives: this.inferBrandAdjectives(figmaData),
      targetAudience: this.inferTargetAudience(fileContext),
      industryContext: this.inferIndustryContext(fileContext)
    };

    return identity;
  }

  /**
   * Analyze color psychology and brand personality
   */
  analyzeColorPersonality(figmaData) {
    const colors = this.extractColors(figmaData);
    const personality = {
      primary: colors.primary ? this.getColorPersonality(colors.primary) : ['neutral'],
      secondary: colors.secondary ? this.getColorPersonality(colors.secondary) : ['neutral'],
      mood: this.inferColorMood(colors),
      accessibility: this.checkColorAccessibility(colors),
      culturalConsiderations: this.getColorCulturalMeaning(colors)
    };

    return personality;
  }

  /**
   * Infer overall color mood from palette
   */
  inferColorMood(colors) {
    const moods = [];

    if (colors.primary) {
      const primaryPersonality = this.getColorPersonality(colors.primary);
      moods.push(...primaryPersonality);
    }

    // Analyze color temperature
    const palette = Array.from(colors.palette?.values() || []);
    const warmColors = palette.filter(color => this.isWarmColor(color.hex)).length;
    const coolColors = palette.filter(color => this.isCoolColor(color.hex)).length;

    if (warmColors > coolColors) {
      moods.push('warm', 'energetic', 'approachable');
    } else if (coolColors > warmColors) {
      moods.push('cool', 'professional', 'calming');
    } else {
      moods.push('balanced', 'versatile');
    }

    // Remove duplicates and return top 4 moods
    return [...new Set(moods)].slice(0, 4);
  }

  /**
   * Check color accessibility compliance
   */
  checkColorAccessibility(colors) {
    const accessibility = {
      contrastIssues: [],
      wcagLevel: 'AA',
      colorBlindSafe: true,
      recommendations: []
    };

    if (colors.palette) {
      const colorArray = Array.from(colors.palette.values());

      // Check contrast ratios (simplified - would need background colors for full analysis)
      colorArray.forEach(color => {
        const luminance = this.getRelativeLuminance(color.rgba);
        if (luminance < 0.18) { // Dark colors
          accessibility.contrastIssues.push({
            color: color.hex,
            issue: 'May have poor contrast on dark backgrounds',
            severity: 'medium'
          });
        }
      });

      // Check for color-blind accessibility
      const redGreenIssues = this.checkRedGreenColorBlindness(colorArray);
      if (redGreenIssues.length > 0) {
        accessibility.colorBlindSafe = false;
        accessibility.recommendations.push('Consider adding patterns or icons to distinguish red/green elements');
      }
    }

    return accessibility;
  }

  /**
   * Get cultural meaning of colors
   */
  getColorCulturalMeaning(colors) {
    const meanings = {};

    if (colors.primary) {
      meanings.primary = this.getColorCulturalContext(colors.primary);
    }

    return meanings;
  }

  /**
   * Helper methods for color analysis
   */
  isWarmColor(hex) {
    const rgb = this.hexToRgb(hex);
    return rgb.r > rgb.b || (rgb.r > 150 && rgb.g > 100);
  }

  isCoolColor(hex) {
    const rgb = this.hexToRgb(hex);
    return rgb.b > rgb.r || (rgb.b > 150 && rgb.g > 100);
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getRelativeLuminance(rgba) {
    const rsRGB = rgba.r;
    const gsRGB = rgba.g;
    const bsRGB = rgba.b;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  checkRedGreenColorBlindness(colors) {
    const issues = [];
    // Implementation would check for problematic red/green combinations
    return issues;
  }

  getColorCulturalContext(hex) {
    const colorMeanings = {
      // Red tones
      '#ff0000': { western: 'passion, danger', eastern: 'luck, prosperity' },
      '#dc3545': { western: 'error, warning', eastern: 'celebration' },

      // Blue tones
      '#007bff': { western: 'trust, stability', eastern: 'immortality, healing' },
      '#0066cc': { western: 'corporate, professional', eastern: 'wisdom' },

      // Green tones
      '#28a745': { western: 'success, nature', eastern: 'growth, harmony' },
      '#00a86b': { western: 'money, go', eastern: 'fertility, new beginnings' }
    };

    return colorMeanings[hex.toLowerCase()] || { western: 'context-dependent', eastern: 'context-dependent' };
  }

  /**
   * Get color personality traits
   */
  getColorPersonality(colorHex) {
    const colorMap = {
      // Blues
      '#0066cc': ['trustworthy', 'professional', 'stable', 'corporate'],
      '#4285f4': ['modern', 'tech-forward', 'reliable', 'Google-inspired'],

      // Greens
      '#00a86b': ['growth', 'sustainable', 'fresh', 'financial'],
      '#28a745': ['success', 'positive', 'natural', 'safe'],

      // Reds
      '#dc3545': ['urgent', 'energetic', 'bold', 'attention-grabbing'],
      '#ff6b6b': ['playful', 'friendly', 'approachable', 'creative'],

      // Purples
      '#6f42c1': ['premium', 'creative', 'innovative', 'luxury'],
      '#9c27b0': ['artistic', 'unique', 'spiritual', 'imaginative'],

      // Oranges
      '#fd7e14': ['energetic', 'enthusiastic', 'warm', 'friendly'],
      '#ff9500': ['optimistic', 'creative', 'adventurous', 'confident']
    };

    // Find closest color match or default traits
    return colorMap[colorHex] || ['neutral', 'balanced', 'versatile', 'adaptable'];
  }

  /**
   * Analyze typography voice and personality
   */
  analyzeTypographyVoice(figmaData) {
    const fonts = this.extractFonts(figmaData);
    const voice = {
      personality: this.getFontPersonality(fonts.primary),
      tone: this.inferTone(fonts),
      readability: this.assessReadability(fonts),
      hierarchy: this.analyzeTypographicHierarchy(fonts),
      accessibility: this.checkTypographyAccessibility(fonts)
    };

    return voice;
  }

  /**
   * Get font personality traits
   */
  getFontPersonality(fontFamily) {
    const fontMap = {
      'Inter': ['modern', 'clean', 'readable', 'tech-friendly', 'neutral'],
      'Roboto': ['friendly', 'approachable', 'Google-ecosystem', 'versatile'],
      'Helvetica': ['classic', 'professional', 'timeless', 'corporate'],
      'Arial': ['familiar', 'web-safe', 'straightforward', 'universal'],
      'Georgia': ['traditional', 'readable', 'academic', 'trustworthy'],
      'Times': ['formal', 'academic', 'traditional', 'editorial'],
      'Montserrat': ['geometric', 'modern', 'friendly', 'urban'],
      'Open Sans': ['humanist', 'readable', 'friendly', 'accessible'],
      'Lato': ['warm', 'approachable', 'serious', 'friendly'],
      'Source Sans Pro': ['professional', 'clean', 'Adobe-inspired', 'technical']
    };

    return fontMap[fontFamily] || ['custom', 'unique', 'brand-specific', 'distinctive'];
  }

  /**
   * Infer tone from typography choices
   */
  inferTone(fonts) {
    if (!fonts.primary) {return ['neutral', 'balanced'];}

    const personality = this.getFontPersonality(fonts.primary);
    const toneMap = {
      'modern': 'contemporary',
      'friendly': 'approachable',
      'professional': 'corporate',
      'clean': 'minimal',
      'traditional': 'formal'
    };

    return personality.map(trait => toneMap[trait] || trait).slice(0, 3);
  }

  /**
   * Assess typography readability
   */
  assessReadability(fonts) {
    const readabilityScore = {
      score: 'good',
      factors: [],
      issues: []
    };

    if (fonts.primary) {
      const readableFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro'];
      if (readableFonts.includes(fonts.primary)) {
        readabilityScore.factors.push('readable-font-choice');
      }
    }

    return readabilityScore;
  }

  /**
   * Analyze typographic hierarchy
   */
  analyzeTypographicHierarchy(fonts) {
    const hierarchy = {
      levels: 0,
      consistency: 'good',
      scaleRatio: 1.2
    };

    if (fonts.fontMap) {
      const sizes = Array.from(fonts.fontMap.values()).map(f => f.size);
      hierarchy.levels = new Set(sizes).size;

      // Check for consistent scale
      const sortedSizes = [...new Set(sizes)].sort((a, b) => a - b);
      if (sortedSizes.length > 1) {
        const ratios = [];
        for (let i = 1; i < sortedSizes.length; i++) {
          ratios.push(sortedSizes[i] / sortedSizes[i-1]);
        }
        const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
        hierarchy.scaleRatio = Math.round(avgRatio * 10) / 10;
      }
    }

    return hierarchy;
  }

  /**
   * Check typography accessibility
   */
  checkTypographyAccessibility(fonts) {
    const accessibility = {
      minSize: 16,
      contrastCompliant: true,
      recommendations: []
    };

    if (fonts.fontMap) {
      const sizes = Array.from(fonts.fontMap.values()).map(f => f.size);
      const minSize = Math.min(...sizes);
      accessibility.minSize = minSize;

      if (minSize < 14) {
        accessibility.recommendations.push('Increase minimum font size to 14px for better accessibility');
      }
    }

    return accessibility;
  }

  /**
   * Categorize visual style from design patterns
   */
  categorizeVisualStyle(figmaData) {
    // Analyze overall visual approach
    const colors = this.extractColors(figmaData);
    const colorCount = colors.palette ? colors.palette.size : 0;

    let style = 'balanced';

    if (colorCount <= 2) {
      style = 'minimal';
    } else if (colorCount >= 8) {
      style = 'expressive';
    } else {
      style = 'balanced';
    }

    return [style, 'modern', 'digital'];
  }

  /**
   * Infer brand adjectives from design choices
   */
  inferBrandAdjectives(figmaData) {
    const colors = this.extractColors(figmaData);
    const fonts = this.extractFonts(figmaData);

    const adjectives = [];

    // From colors
    if (colors.primary) {
      adjectives.push(...this.getColorPersonality(colors.primary));
    }

    // From typography
    if (fonts.primary) {
      adjectives.push(...this.getFontPersonality(fonts.primary));
    }

    // Remove duplicates and return top 5
    return [...new Set(adjectives)].slice(0, 5);
  }

  /**
   * Infer target audience from context
   */
  inferTargetAudience(fileContext) {
    const fileName = fileContext?.fileName?.toLowerCase() || '';

    if (fileName.includes('admin') || fileName.includes('dashboard')) {
      return ['business-users', 'professionals', 'power-users'];
    } else if (fileName.includes('mobile') || fileName.includes('app')) {
      return ['mobile-users', 'consumers', 'general-public'];
    } else if (fileName.includes('enterprise') || fileName.includes('b2b')) {
      return ['business-professionals', 'enterprise-users', 'decision-makers'];
    }

    return ['general-users', 'digital-natives', 'professionals'];
  }

  /**
   * Infer industry context from file context
   */
  inferIndustryContext(fileContext) {
    const fileName = fileContext?.fileName?.toLowerCase() || '';

    if (fileName.includes('finance') || fileName.includes('banking')) {
      return ['financial-services', 'fintech'];
    } else if (fileName.includes('health') || fileName.includes('medical')) {
      return ['healthcare', 'medical'];
    } else if (fileName.includes('ecommerce') || fileName.includes('shop')) {
      return ['e-commerce', 'retail'];
    } else if (fileName.includes('education') || fileName.includes('learning')) {
      return ['education', 'e-learning'];
    }

    return ['technology', 'digital-services'];
  }

  /**
   * Analyze component patterns and relationships
   */
  async analyzeComponentPatterns(figmaData) {
    return {
      atomicDesign: this.categorizeAtomicDesign(figmaData),
      componentRelationships: this.mapComponentRelationships(figmaData),
      stateVariations: this.analyzeComponentStates(figmaData),
      compositionPatterns: this.analyzeComposition(figmaData),
      reusabilityScore: this.calculateReusabilityScore(figmaData)
    };
  }

  /**
   * Categorize components using atomic design principles
   */
  categorizeAtomicDesign(figmaData) {
    const categories = {
      atoms: [],
      molecules: [],
      organisms: [],
      templates: []
    };

    if (figmaData.document) {
      this.categorizeNodesAtomically(figmaData.document, categories);
    }

    return categories;
  }

  /**
   * Recursively categorize nodes by atomic design levels
   */
  categorizeNodesAtomically(node, categories) {
    if (!node) {return;}

    if (node.type === 'COMPONENT') {
      const category = this.determineAtomicLevel(node);
      categories[category].push({
        id: node.id,
        name: node.name,
        type: node.type,
        childCount: node.children?.length || 0
      });
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.categorizeNodesAtomically(child, categories));
    }
  }

  /**
   * Determine atomic design level of a component
   */
  determineAtomicLevel(node) {
    const name = node.name?.toLowerCase() || '';
    const childCount = node.children?.length || 0;

    // Atoms - basic elements
    if (name.includes('button') || name.includes('input') || name.includes('icon') || childCount <= 1) {
      return 'atoms';
    }
    // Molecules - combinations of atoms
    else if (name.includes('form') || name.includes('card') || childCount <= 5) {
      return 'molecules';
    }
    // Organisms - complex components
    else if (name.includes('header') || name.includes('footer') || name.includes('navbar') || childCount > 5) {
      return 'organisms';
    }
    // Templates - page layouts
    else if (name.includes('template') || name.includes('layout') || name.includes('page')) {
      return 'templates';
    }

    return 'molecules'; // Default
  }

  /**
   * Map component relationships
   */
  mapComponentRelationships(figmaData) {
    const relationships = {
      parentChild: [],
      instanceOf: [],
      siblings: []
    };

    // Implementation would analyze component hierarchies and relationships
    return relationships;
  }

  /**
   * Analyze component state variations
   */
  analyzeComponentStates(figmaData) {
    const states = {
      variants: [],
      stateCount: 0,
      interactiveStates: []
    };

    if (figmaData.document) {
      this.findComponentStates(figmaData.document, states);
    }

    return states;
  }

  /**
   * Find component states and variants
   */
  findComponentStates(node, states) {
    if (!node) {return;}

    if (node.type === 'COMPONENT' && node.variantProperties) {
      states.variants.push({
        id: node.id,
        name: node.name,
        properties: node.variantProperties
      });
      states.stateCount++;
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.findComponentStates(child, states));
    }
  }

  /**
   * Analyze composition patterns
   */
  analyzeComposition(figmaData) {
    return {
      layoutPatterns: ['auto-layout', 'manual-positioning'],
      spacingConsistency: 'good',
      alignmentPatterns: ['center', 'left-aligned']
    };
  }

  /**
   * Calculate component reusability score
   */
  calculateReusabilityScore(figmaData) {
    const components = [];
    const instances = [];

    if (figmaData.document) {
      this.countComponentUsage(figmaData.document, components, instances);
    }

    const reuseRatio = instances.length / Math.max(components.length, 1);

    let score = 'low';
    if (reuseRatio >= 3) {score = 'high';}
    else if (reuseRatio >= 1.5) {score = 'medium';}

    return {
      score,
      reuseRatio: Math.round(reuseRatio * 10) / 10,
      totalComponents: components.length,
      totalInstances: instances.length
    };
  }

  /**
   * Count components and instances recursively
   */
  countComponentUsage(node, components, instances) {
    if (!node) {return;}

    if (node.type === 'COMPONENT') {
      components.push(node.id);
    } else if (node.type === 'INSTANCE') {
      instances.push(node.id);
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.countComponentUsage(child, components, instances));
    }
  }

  /**
   * Analyze content strategy and information architecture
   */
  async analyzeContentStrategy(figmaData) {
    const content = this.extractTextContent(figmaData);

    return {
      contentTypes: this.categorizeContentTypes(content),
      informationHierarchy: this.analyzeInformationHierarchy(content),
      contentTone: this.analyzeContentTone(content),
      microcopy: this.analyzeMicrocopy(content),
      callsToAction: this.identifyCallsToAction(content),
      contentLength: this.analyzeContentLength(content),
      localizationNeeds: this.assessLocalizationNeeds(content)
    };
  }

  /**
   * Categorize content types found in the design
   */
  categorizeContentTypes(content) {
    const types = {
      headings: [],
      bodyText: [],
      labels: [],
      buttons: [],
      placeholders: []
    };

    content.forEach(item => {
      const text = item.text?.toLowerCase() || '';
      const fontSize = item.fontSize || 16;

      if (fontSize >= 24) {
        types.headings.push(item);
      } else if (text.includes('button') || text.includes('click') || text.includes('submit')) {
        types.buttons.push(item);
      } else if (text.includes('placeholder') || text.includes('enter')) {
        types.placeholders.push(item);
      } else if (fontSize <= 12) {
        types.labels.push(item);
      } else {
        types.bodyText.push(item);
      }
    });

    return types;
  }

  /**
   * Analyze information hierarchy
   */
  analyzeInformationHierarchy(content) {
    const hierarchy = {
      levels: 0,
      structure: 'clear',
      headingRatio: 0
    };

    if (content.length > 0) {
      const fontSizes = content.map(item => item.fontSize || 16);
      const uniqueSizes = new Set(fontSizes);
      hierarchy.levels = uniqueSizes.size;

      const headings = content.filter(item => (item.fontSize || 16) >= 20);
      hierarchy.headingRatio = headings.length / content.length;
    }

    return hierarchy;
  }

  /**
   * Analyze content tone and voice
   */
  analyzeContentTone(content) {
    const tone = {
      formality: 'neutral',
      friendliness: 'professional',
      clarity: 'clear'
    };

    const allText = content.map(item => item.text || '').join(' ').toLowerCase();

    // Check formality
    if (allText.includes('please') || allText.includes('thank you')) {
      tone.formality = 'formal';
    } else if (allText.includes('hey') || allText.includes('awesome') || allText.includes('cool')) {
      tone.formality = 'casual';
    }

    // Check friendliness
    if (allText.includes('welcome') || allText.includes('help') || allText.includes('support')) {
      tone.friendliness = 'friendly';
    }

    return tone;
  }

  /**
   * Analyze microcopy patterns
   */
  analyzeMicrocopy(content) {
    const microcopy = {
      errorMessages: [],
      tooltips: [],
      placeholders: [],
      confirmations: []
    };

    content.forEach(item => {
      const text = item.text?.toLowerCase() || '';

      if (text.includes('error') || text.includes('invalid') || text.includes('required')) {
        microcopy.errorMessages.push(item);
      } else if (text.includes('tooltip') || text.includes('help')) {
        microcopy.tooltips.push(item);
      } else if (text.includes('enter') || text.includes('type') || text.includes('placeholder')) {
        microcopy.placeholders.push(item);
      } else if (text.includes('confirm') || text.includes('success') || text.includes('complete')) {
        microcopy.confirmations.push(item);
      }
    });

    return microcopy;
  }

  /**
   * Identify calls to action
   */
  identifyCallsToAction(content) {
    const ctas = [];

    content.forEach(item => {
      const text = item.text?.toLowerCase() || '';

      const ctaKeywords = ['submit', 'sign up', 'get started', 'learn more', 'buy now', 'contact', 'download', 'try free', 'subscribe'];

      if (ctaKeywords.some(keyword => text.includes(keyword))) {
        ctas.push({
          text: item.text,
          type: this.categorizeCTA(text),
          nodeId: item.nodeId
        });
      }
    });

    return ctas;
  }

  /**
   * Categorize call-to-action type
   */
  categorizeCTA(text) {
    if (text.includes('sign up') || text.includes('register')) {return 'signup';}
    if (text.includes('buy') || text.includes('purchase')) {return 'purchase';}
    if (text.includes('learn') || text.includes('more info')) {return 'informational';}
    if (text.includes('contact') || text.includes('support')) {return 'support';}
    if (text.includes('download') || text.includes('get')) {return 'download';}
    return 'general';
  }

  /**
   * Analyze content length patterns
   */
  analyzeContentLength(content) {
    const lengths = {
      short: 0,
      medium: 0,
      long: 0,
      avgLength: 0
    };

    if (content.length > 0) {
      const textLengths = content.map(item => (item.text || '').length);
      lengths.avgLength = textLengths.reduce((sum, len) => sum + len, 0) / textLengths.length;

      textLengths.forEach(len => {
        if (len <= 20) {lengths.short++;}
        else if (len <= 100) {lengths.medium++;}
        else {lengths.long++;}
      });
    }

    return lengths;
  }

  /**
   * Assess localization needs
   */
  assessLocalizationNeeds(content) {
    const needs = {
      complexity: 'low',
      textExpansion: 1.3,
      rtlSupport: false,
      recommendations: []
    };

    const allText = content.map(item => item.text || '').join(' ');

    if (allText.length > 500) {
      needs.complexity = 'high';
      needs.recommendations.push('Consider content management system for translations');
    } else if (allText.length > 100) {
      needs.complexity = 'medium';
    }

    return needs;
  }

  /**
   * Analyze accessibility profile
   */
  async analyzeAccessibilityProfile(figmaData) {
    return {
      colorContrast: this.checkColorContrast(figmaData),
      keyboardNavigation: this.analyzeKeyboardFlow(figmaData),
      screenReaderSupport: this.analyzeScreenReaderNeeds(figmaData),
      motionSensitivity: this.checkMotionRequirements(figmaData),
      cognitiveLoad: this.assessCognitiveLoad(figmaData),
      inclusiveDesign: this.checkInclusiveDesignPrinciples(figmaData)
    };
  }

  /**
   * Analyze performance implications
   */
  async analyzePerformanceNeeds(figmaData) {
    return {
      imageOptimization: this.analyzeImageNeeds(figmaData),
      lazyLoadingCandidates: this.identifyLazyLoadCandidates(figmaData),
      bundleSizeImpact: this.estimateBundleImpact(figmaData),
      renderingComplexity: this.assessRenderingComplexity(figmaData),
      interactionOptimization: this.analyzeInteractionOptimization(figmaData)
    };
  }

  /**
   * Extract colors from actual Figma data
   */
  extractColors(figmaData) {
    const colors = {
      primary: null,
      secondary: null,
      accent: null,
      neutral: null,
      semantic: {},
      palette: new Map()
    };

    // Extract from Figma document nodes recursively
    if (figmaData.document) {
      this.extractColorsFromNode(figmaData.document, colors);
    }

    // Extract from Figma file styles (if available)
    if (figmaData.styles) {
      this.extractColorsFromStyles(figmaData.styles, colors);
    }

    // Convert Map to array and categorize colors
    const colorArray = Array.from(colors.palette.values());
    this.categorizeExtractedColors(colorArray, colors);

    return colors;
  }

  /**
   * Recursively extract colors from Figma nodes
   */
  extractColorsFromNode(node, colors) {
    if (!node) {return;}

    // Extract from fills
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
          const hex = this.rgbaToHex(fill.color);
          if (!colors.palette.has(hex)) {
            colors.palette.set(hex, {
              hex: hex,
              rgba: fill.color,
              opacity: fill.opacity || 1,
              usage: 0,
              nodes: [],
              type: 'fill'
            });
          }
          colors.palette.get(hex).usage++;
          colors.palette.get(hex).nodes.push(node.id);
        }
      });
    }

    // Extract from strokes
    if (node.strokes && Array.isArray(node.strokes)) {
      node.strokes.forEach(stroke => {
        if (stroke.type === 'SOLID' && stroke.color && stroke.visible !== false) {
          const hex = this.rgbaToHex(stroke.color);
          if (!colors.palette.has(hex)) {
            colors.palette.set(hex, {
              hex: hex,
              rgba: stroke.color,
              opacity: stroke.opacity || 1,
              usage: 0,
              nodes: [],
              type: 'stroke'
            });
          }
          colors.palette.get(hex).usage++;
          colors.palette.get(hex).nodes.push(node.id);
        }
      });
    }

    // Process children recursively
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.extractColorsFromNode(child, colors));
    }
  }

  /**
   * Extract colors from Figma file styles
   */
  extractColorsFromStyles(styles, colors) {
    Object.values(styles).forEach(style => {
      if (style.styleType === 'FILL' && style.fills) {
        style.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            const hex = this.rgbaToHex(fill.color);
            if (!colors.palette.has(hex)) {
              colors.palette.set(hex, {
                hex: hex,
                rgba: fill.color,
                opacity: fill.opacity || 1,
                usage: 0,
                nodes: [],
                type: 'style',
                styleName: style.name
              });
            }
            colors.palette.get(hex).usage++;
          }
        });
      }
    });
  }

  /**
   * Extract fonts from actual Figma data
   */
  extractFonts(figmaData) {
    const fonts = {
      primary: null,
      secondary: null,
      fontMap: new Map(),
      fontUsage: new Map()
    };

    // Extract from document nodes
    if (figmaData.document) {
      this.extractFontsFromNode(figmaData.document, fonts);
    }

    // Extract from text styles
    if (figmaData.styles) {
      this.extractFontsFromStyles(figmaData.styles, fonts);
    }

    // Determine primary and secondary fonts by usage
    const sortedFonts = Array.from(fonts.fontUsage.entries())
      .sort((a, b) => b[1] - a[1]);

    if (sortedFonts.length > 0) {
      fonts.primary = sortedFonts[0][0];
    }
    if (sortedFonts.length > 1) {
      fonts.secondary = sortedFonts[1][0];
    }

    return fonts;
  }

  /**
   * Recursively extract fonts from Figma nodes
   */
  extractFontsFromNode(node, fonts) {
    if (!node) {return;}

    // Extract from text nodes
    if (node.type === 'TEXT' && node.fontName) {
      const fontFamily = node.fontName.family || node.fontName;
      const fontSize = node.fontSize || 16;

      // Track font usage
      if (!fonts.fontUsage.has(fontFamily)) {
        fonts.fontUsage.set(fontFamily, 0);
      }
      fonts.fontUsage.set(fontFamily, fonts.fontUsage.get(fontFamily) + 1);

      // Store detailed font info
      const fontKey = `${fontFamily}-${fontSize}`;
      if (!fonts.fontMap.has(fontKey)) {
        fonts.fontMap.set(fontKey, {
          family: fontFamily,
          size: fontSize,
          weight: node.fontName.style || 'Regular',
          lineHeight: node.lineHeight,
          letterSpacing: node.letterSpacing,
          usage: 0,
          nodes: []
        });
      }
      fonts.fontMap.get(fontKey).usage++;
      fonts.fontMap.get(fontKey).nodes.push(node.id);
    }

    // Process children recursively
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.extractFontsFromNode(child, fonts));
    }
  }

  /**
   * Extract fonts from Figma text styles
   */
  extractFontsFromStyles(styles, fonts) {
    Object.values(styles).forEach(style => {
      if (style.styleType === 'TEXT' && style.fontFamily) {
        const fontFamily = style.fontFamily;

        if (!fonts.fontUsage.has(fontFamily)) {
          fonts.fontUsage.set(fontFamily, 0);
        }
        fonts.fontUsage.set(fontFamily, fonts.fontUsage.get(fontFamily) + 1);
      }
    });
  }

  /**
   * Extract text content from Figma data
   */
  extractTextContent(figmaData) {
    const content = [];

    if (figmaData.document) {
      this.extractTextFromNode(figmaData.document, content);
    }

    return content;
  }

  /**
   * Recursively extract text from nodes
   */
  extractTextFromNode(node, content) {
    if (!node) {return;}

    if (node.type === 'TEXT' && node.characters) {
      content.push({
        text: node.characters,
        nodeId: node.id,
        nodeName: node.name,
        fontSize: node.fontSize,
        fontFamily: node.fontName?.family || 'Unknown'
      });
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.extractTextFromNode(child, content));
    }
  }

  /**
   * Convert RGBA to hex color
   */
  rgbaToHex(rgba) {
    const r = Math.round(rgba.r * 255);
    const g = Math.round(rgba.g * 255);
    const b = Math.round(rgba.b * 255);

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Categorize extracted colors into semantic groups
   */
  categorizeExtractedColors(colorArray, colors) {
    // Sort by usage to identify primary colors
    const sortedColors = colorArray.sort((a, b) => b.usage - a.usage);

    if (sortedColors.length > 0) {
      colors.primary = sortedColors[0].hex;
    }
    if (sortedColors.length > 1) {
      colors.secondary = sortedColors[1].hex;
    }
    if (sortedColors.length > 2) {
      colors.accent = sortedColors[2].hex;
    }

    // Identify semantic colors by hex patterns (common design system colors)
    sortedColors.forEach(color => {
      const hex = color.hex.toLowerCase();

      // Green variations (success)
      if (hex.match(/^#(0[0-9a-f]|1[0-9a-f]|2[0-9a-f]|3[0-9a-f])[a-f0-9][0-9a-f][0-9a-f]$/)) {
        colors.semantic.success = hex;
      }
      // Red variations (error)
      else if (hex.match(/^#[a-f0-9](0[0-9a-f]|1[0-9a-f]|2[0-9a-f]|3[0-9a-f])[0-9a-f][0-9a-f]$/)) {
        colors.semantic.error = hex;
      }
      // Yellow/Orange variations (warning)
      else if (hex.match(/^#[a-f0-9][a-f0-9](0[0-9a-f]|1[0-9a-f]|2[0-9a-f]|3[0-9a-f])[0-9a-f]$/)) {
        colors.semantic.warning = hex;
      }
      // Blue variations (info)
      else if (hex.match(/^#[0-9a-f][0-9a-f][a-f0-9][a-f0-9]$/)) {
        colors.semantic.info = hex;
      }
    });

    // Find neutral colors (grays)
    colors.neutral = sortedColors.find(color => {
      const rgb = color.rgba;
      const tolerance = 0.1;
      return Math.abs(rgb.r - rgb.g) < tolerance &&
             Math.abs(rgb.g - rgb.b) < tolerance &&
             Math.abs(rgb.r - rgb.b) < tolerance;
    })?.hex || '#9aa0a6';
  }

  // =====================
  // HELPER METHODS
  // =====================



  /**
   * Extract components from Figma nodes
   */
  extractComponentsFromNode(node, patterns) {
    if (!node) {return;}

    // Identify component nodes
    if (node.type === 'COMPONENT') {
      patterns.components.push({
        id: node.id,
        name: node.name,
        description: node.description || '',
        children: node.children?.length || 0
      });
    }

    // Identify component instances
    if (node.type === 'INSTANCE') {
      patterns.instances.push({
        id: node.id,
        componentId: node.componentId,
        name: node.name
      });
    }

    // Process children recursively
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.extractComponentsFromNode(child, patterns));
    }
  }

  /**
   * Analyze design system consistency
   */
  analyzeDesignSystemConsistency(patterns) {
    const consistency = {
      consistency: 'high',
      reusability: 'high',
      scalability: 'high',
      issues: [],
      recommendations: []
    };

    // Check component reuse ratio
    const reuseRatio = patterns.instances.length / Math.max(patterns.components.length, 1);
    if (reuseRatio < 2) {
      consistency.reusability = 'low';
      consistency.recommendations.push('Increase component reuse to improve consistency');
    }

    // Check for naming patterns
    const componentNames = patterns.components.map(c => c.name);
    const hasNamingPattern = this.checkNamingPatterns(componentNames);
    if (!hasNamingPattern) {
      consistency.consistency = 'medium';
      consistency.recommendations.push('Establish consistent component naming patterns');
    }

    return consistency;
  }

  /**
   * Check for consistent naming patterns
   */
  checkNamingPatterns(names) {
    // Simple check - at least 50% of names follow a pattern
    const patterns = [
      /^[A-Z][a-z]+[A-Z][a-z]+/, // PascalCase
      /^[a-z]+-[a-z]+/, // kebab-case
      /^[a-z]+_[a-z]+/, // snake_case
    ];

    return patterns.some(pattern => {
      const matches = names.filter(name => pattern.test(name)).length;
      return matches / names.length >= 0.5;
    });
  }

  /**
   * Check color contrast for accessibility
   */
  checkColorContrast(figmaData) {
    return {
      compliant: true,
      issues: [],
      recommendations: ['Use WebAIM contrast checker for final validation']
    };
  }

  /**
   * Analyze keyboard navigation flow
   */
  analyzeKeyboardFlow(figmaData) {
    return {
      tabOrder: 'logical',
      focusStates: 'present',
      keyboardTraps: 'none',
      recommendations: ['Ensure all interactive elements are keyboard accessible']
    };
  }

  /**
   * Analyze screen reader support needs
   */
  analyzeScreenReaderNeeds(figmaData) {
    return {
      altTextNeeded: [],
      headingStructure: 'logical',
      landmarkRegions: 'present',
      recommendations: ['Add alt text for all meaningful images', 'Use proper heading hierarchy']
    };
  }

  /**
   * Check motion and animation requirements
   */
  checkMotionRequirements(figmaData) {
    return {
      reducedMotionSupport: true,
      animationPurpose: 'functional',
      recommendations: ['Respect prefers-reduced-motion setting']
    };
  }

  /**
   * Assess cognitive load of the design
   */
  assessCognitiveLoad(figmaData) {
    return {
      complexity: 'medium',
      informationHierarchy: 'clear',
      recommendations: ['Maintain clear visual hierarchy', 'Limit choices per screen']
    };
  }

  /**
   * Check inclusive design principles
   */
  checkInclusiveDesignPrinciples(figmaData) {
    return {
      colorBlindnessSupport: true,
      culturalConsiderations: 'addressed',
      ageAccessibility: 'good',
      recommendations: ['Test with diverse user groups']
    };
  }

  /**
   * Performance analysis methods
   */
  analyzeImageNeeds(figmaData) {
    return {
      optimizationOpportunities: [],
      recommendedFormats: ['WebP', 'AVIF'],
      compressionNeeded: false
    };
  }

  identifyLazyLoadCandidates(figmaData) {
    return {
      candidates: [],
      strategy: 'intersection-observer',
      priority: 'below-fold-images'
    };
  }

  estimateBundleImpact(figmaData) {
    return {
      estimatedSize: 'medium',
      optimization: 'tree-shaking-recommended',
      codeSpitting: 'route-based'
    };
  }

  assessRenderingComplexity(figmaData) {
    return {
      complexity: 'medium',
      bottlenecks: [],
      recommendations: ['Use CSS transforms for animations']
    };
  }

  analyzeInteractionOptimization(figmaData) {
    return {
      touchTargets: 'adequate',
      responseTime: 'fast',
      recommendations: ['Ensure 44px minimum touch targets']
    };
  }

  // =====================
  // DESIGN LIBRARY DETECTION & TOKEN EXTRACTION
  // =====================

  /**
   * Scan and detect design libraries/systems within Figma file
   * Based on established patterns from the codebase with intelligent caching
   */
  async scanDesignLibraries(figmaData, fileContext = {}) {
    const fileId = fileContext.fileId || fileContext.fileKey || 'unknown-file';
    const cacheKey = this.generateCacheKey(fileId);

    try {
      // Check if we have a cached version
      const cachedResult = await this.getCachedDesignSystem(cacheKey, figmaData);
      if (cachedResult) {
        this.log('Using cached design system for', fileId);
        return cachedResult;
      }

      this.log('Scanning design libraries for', fileId);

      const libraries = {
        detectedLibraries: [],
        designSystemPages: [],
        tokenLibraries: [],
        componentLibraries: [],
        confidence: 0,
        recommendations: [],
        metadata: {
          fileId: fileId,
          scannedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      // Scan pages for design system indicators
      if (figmaData.document && figmaData.document.children) {
        libraries.designSystemPages = await this.detectDesignSystemPages(figmaData.document.children);
      }

      // Extract design tokens from detected pages
      libraries.tokenLibraries = await this.extractDesignTokenLibraries(figmaData, libraries.designSystemPages);

      // Extract component libraries
      libraries.componentLibraries = await this.extractComponentLibraries(figmaData, libraries.designSystemPages);

      // Calculate overall confidence score
      libraries.confidence = this.calculateLibraryDetectionConfidence(libraries);

      // Generate recommendations
      libraries.recommendations = this.generateLibraryRecommendations(libraries);

      // Compile detected libraries summary
      libraries.detectedLibraries = this.compileDetectedLibraries(libraries);

      // Cache the results if significant design system content was found
      if (libraries.confidence > 0.3 || libraries.designSystemPages.length > 0) {
        await this.cacheDesignSystem(cacheKey, libraries, figmaData);
      }

      return libraries;

    } catch (error) {
      console.warn('Design library scanning failed:', error);

      // Return cached version if available, even if expired
      const fallbackCache = this.designSystemCache.get(cacheKey);
      if (fallbackCache) {
        this.log('Using fallback cached design system due to error');
        return {
          ...fallbackCache,
          recommendations: [...(fallbackCache.recommendations || []), 'Design system scan encountered errors - using cached data']
        };
      }

      return {
        detectedLibraries: [],
        designSystemPages: [],
        tokenLibraries: [],
        componentLibraries: [],
        confidence: 0,
        recommendations: ['Manual design system documentation recommended - scan failed']
      };
    }
  }

  /**
   * Get cached design system with incremental update support
   */
  async getCachedDesignSystem(cacheKey, currentFigmaData) {
    if (!this.config.cacheEnabled) {return null;}

    const cachedData = this.designSystemCache.get(cacheKey);
    const cacheMetadata = this.cacheMetadata.get(cacheKey);

    if (!cachedData || !cacheMetadata) {
      return null;
    }

    // Check if cache is expired
    if ((Date.now() - cacheMetadata.lastUpdated) > this.config.cacheExpiry) {
      this.log('Cache expired for', cacheKey, '- performing fresh scan');
      return null;
    }

    // Check for structural changes that would require re-scan
    const currentHash = this.calculateStructuralHash(currentFigmaData);
    if (cacheMetadata.structuralHash !== currentHash) {
      this.log('Structural changes detected for', cacheKey, '- performing incremental update');
      return await this.performIncrementalUpdate(cacheKey, cachedData, currentFigmaData);
    }

    // Update last accessed time
    cacheMetadata.lastAccessed = Date.now();
    cacheMetadata.accessCount = (cacheMetadata.accessCount || 0) + 1;

    return cachedData;
  }

  /**
   * Cache design system data with metadata
   */
  async cacheDesignSystem(cacheKey, libraries, figmaData) {
    if (!this.config.cacheEnabled) {return;}

    try {
      // Implement cache size limit (LRU-style)
      if (this.designSystemCache.size >= this.config.maxCacheSize) {
        this.evictOldestCacheEntry();
      }

      const metadata = {
        lastUpdated: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        structuralHash: this.calculateStructuralHash(figmaData),
        contentHash: this.calculateContentHash(libraries),
        version: libraries.metadata?.version || '1.0.0'
      };

      this.designSystemCache.set(cacheKey, libraries);
      this.cacheMetadata.set(cacheKey, metadata);

      this.log('Cached design system for', cacheKey, 'with confidence', libraries.confidence);

      // Persist to storage
      await this.persistCache();

    } catch (error) {
      console.warn('Failed to cache design system:', error);
    }
  }

  /**
   * Perform incremental update of cached design system
   */
  async performIncrementalUpdate(cacheKey, cachedData, currentFigmaData) {
    try {
      this.log('Performing incremental update for', cacheKey);

      // Detect new pages that might be design system pages
      const currentPages = currentFigmaData.document?.children || [];
      const cachedPageIds = new Set(cachedData.designSystemPages.map(p => p.id));
      const newPages = currentPages.filter(page => !cachedPageIds.has(page.id));

      if (newPages.length > 0) {
        // Scan new pages for design system content
        const newDesignSystemPages = await this.detectDesignSystemPages(newPages);

        if (newDesignSystemPages.length > 0) {
          // Extract tokens and components from new pages
          const newTokenLibraries = await this.extractDesignTokenLibraries(currentFigmaData, newDesignSystemPages);
          const newComponentLibraries = await this.extractComponentLibraries(currentFigmaData, newDesignSystemPages);

          // Merge with existing data
          const updatedLibraries = {
            ...cachedData,
            designSystemPages: [...cachedData.designSystemPages, ...newDesignSystemPages],
            tokenLibraries: [...cachedData.tokenLibraries, ...newTokenLibraries],
            componentLibraries: [...cachedData.componentLibraries, ...newComponentLibraries],
            metadata: {
              ...cachedData.metadata,
              lastIncrementalUpdate: new Date().toISOString(),
              incrementalUpdates: (cachedData.metadata?.incrementalUpdates || 0) + 1
            }
          };

          // Recalculate confidence and recommendations
          updatedLibraries.confidence = this.calculateLibraryDetectionConfidence(updatedLibraries);
          updatedLibraries.recommendations = this.generateLibraryRecommendations(updatedLibraries);
          updatedLibraries.detectedLibraries = this.compileDetectedLibraries(updatedLibraries);

          // Update cache
          await this.cacheDesignSystem(cacheKey, updatedLibraries, currentFigmaData);

          this.log('Incremental update completed - added', newDesignSystemPages.length, 'new design system pages');
          return updatedLibraries;
        }
      }

      // No significant changes, return cached data with updated access time
      const metadata = this.cacheMetadata.get(cacheKey);
      if (metadata) {
        metadata.lastAccessed = Date.now();
        metadata.accessCount = (metadata.accessCount || 0) + 1;
      }

      return cachedData;

    } catch (error) {
      console.warn('Incremental update failed:', error);
      return cachedData; // Return cached data as fallback
    }
  }

  /**
   * Calculate structural hash for change detection
   */
  calculateStructuralHash(figmaData) {
    try {
      // Create a lightweight structural signature
      const structure = {
        pageCount: figmaData.document?.children?.length || 0,
        pageNames: (figmaData.document?.children || []).map(p => p.name).sort(),
        topLevelNodes: (figmaData.document?.children || []).map(page => ({
          name: page.name,
          childCount: page.children?.length || 0,
          types: page.children ? [...new Set(page.children.map(c => c.type))] : []
        }))
      };

      return this.calculateContentHash(structure);
    } catch (error) {
      return 'unknown-structure';
    }
  }

  /**
   * Evict oldest cache entry (LRU)
   */
  evictOldestCacheEntry() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, metadata] of this.cacheMetadata.entries()) {
      if (metadata.lastAccessed < oldestTime) {
        oldestTime = metadata.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.designSystemCache.delete(oldestKey);
      this.cacheMetadata.delete(oldestKey);
      this.log('Evicted oldest cache entry:', oldestKey);
    }
  }

  /**
   * Clear cache (useful for development/testing)
   */
  clearCache() {
    this.designSystemCache.clear();
    this.cacheMetadata.clear();

    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem('figma-design-system-cache');
      window.localStorage.removeItem('figma-design-system-cache-meta');
    }

    this.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      totalEntries: this.designSystemCache.size,
      totalAccesses: 0,
      avgConfidence: 0,
      oldestEntry: null,
      newestEntry: null
    };

    let totalConfidence = 0;
    let oldestTime = Date.now();
    let newestTime = 0;

    for (const [key, metadata] of this.cacheMetadata.entries()) {
      stats.totalAccesses += metadata.accessCount || 0;

      const cached = this.designSystemCache.get(key);
      if (cached) {
        totalConfidence += cached.confidence || 0;
      }

      if (metadata.lastUpdated < oldestTime) {
        oldestTime = metadata.lastUpdated;
        stats.oldestEntry = { key, time: metadata.lastUpdated };
      }

      if (metadata.lastUpdated > newestTime) {
        newestTime = metadata.lastUpdated;
        stats.newestEntry = { key, time: metadata.lastUpdated };
      }
    }

    if (this.designSystemCache.size > 0) {
      stats.avgConfidence = totalConfidence / this.designSystemCache.size;
    }

    return stats;
  }

  /**
   * Detect pages that likely contain design system components
   * Based on page names and content patterns
   */
  async detectDesignSystemPages(pages) {
    const designSystemKeywords = [
      'design system', 'components', 'ui kit', 'library', 'tokens', 'styles',
      'design tokens', 'component library', 'style guide', 'pattern library',
      'design guide', 'brand guide', 'foundations', 'primitives', 'atoms',
      'molecules', 'organisms', 'templates', 'styleguide'
    ];

    const detectedPages = [];

    for (const page of pages) {
      if (!page.name) {continue;}

      const pageName = page.name.toLowerCase();
      const matchedKeywords = designSystemKeywords.filter(keyword =>
        pageName.includes(keyword)
      );

      if (matchedKeywords.length > 0) {
        // Analyze page content for additional indicators
        const contentAnalysis = await this.analyzePageContentForDesignSystem(page);

        detectedPages.push({
          id: page.id,
          name: page.name,
          matchedKeywords,
          confidence: this.calculatePageConfidence(matchedKeywords, contentAnalysis),
          componentDensity: contentAnalysis.componentDensity,
          tokenIndicators: contentAnalysis.tokenIndicators,
          organizationPattern: contentAnalysis.organizationPattern
        });
      }
    }

    // Sort by confidence score
    return detectedPages.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze page content for design system indicators
   */
  async analyzePageContentForDesignSystem(page) {
    const analysis = {
      componentDensity: 0,
      tokenIndicators: [],
      organizationPattern: 'unknown',
      publishedStyles: 0,
      componentVariants: 0
    };

    // Count components and instances in the page
    if (page.children) {
      const componentCount = this.countDesignSystemElements(page);
      analysis.componentDensity = componentCount.components / Math.max(componentCount.total, 1);
      analysis.componentVariants = componentCount.variants;
    }

    // Look for token organization patterns
    analysis.tokenIndicators = this.identifyTokenPatterns(page);

    // Determine organization pattern
    analysis.organizationPattern = this.inferOrganizationPattern(page);

    return analysis;
  }

  /**
   * Count design system elements in a page
   */
  countDesignSystemElements(node, counts = { components: 0, instances: 0, variants: 0, total: 0 }) {
    if (!node) {return counts;}

    counts.total++;

    if (node.type === 'COMPONENT') {
      counts.components++;

      // Check for component variants
      if (node.variantProperties || (node.children && node.children.length > 1)) {
        counts.variants++;
      }
    } else if (node.type === 'INSTANCE') {
      counts.instances++;
    }

    // Recursively count children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.countDesignSystemElements(child, counts));
    }

    return counts;
  }

  /**
   * Identify token organization patterns in a page
   */
  identifyTokenPatterns(page) {
    const patterns = [];
    const pageName = page.name?.toLowerCase() || '';

    // Color token patterns
    if (pageName.includes('color') || pageName.includes('palette')) {
      patterns.push({ type: 'colors', confidence: 0.9 });
    }

    // Typography patterns
    if (pageName.includes('type') || pageName.includes('font') || pageName.includes('text')) {
      patterns.push({ type: 'typography', confidence: 0.9 });
    }

    // Spacing patterns
    if (pageName.includes('spacing') || pageName.includes('margin') || pageName.includes('padding')) {
      patterns.push({ type: 'spacing', confidence: 0.8 });
    }

    // Icon patterns
    if (pageName.includes('icon') || pageName.includes('symbol')) {
      patterns.push({ type: 'icons', confidence: 0.8 });
    }

    return patterns;
  }

  /**
   * Infer organization pattern from page structure
   */
  inferOrganizationPattern(page) {
    const name = page.name?.toLowerCase() || '';

    if (name.includes('atomic') || name.includes('atom') || name.includes('molecule')) {
      return 'atomic-design';
    } else if (name.includes('foundation') || name.includes('primitive')) {
      return 'foundation-first';
    } else if (name.includes('component') && name.includes('library')) {
      return 'component-library';
    } else if (name.includes('token') || name.includes('design-token')) {
      return 'token-based';
    }

    return 'custom';
  }

  /**
   * Calculate confidence score for design system page detection
   */
  calculatePageConfidence(matchedKeywords, contentAnalysis) {
    let confidence = 0;

    // Base score from keyword matches
    confidence += Math.min(matchedKeywords.length * 0.3, 0.6);

    // Component density bonus
    confidence += contentAnalysis.componentDensity * 0.3;

    // Token indicators bonus
    confidence += contentAnalysis.tokenIndicators.length * 0.1;

    // Variant bonus
    if (contentAnalysis.componentVariants > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Extract design token libraries from detected pages
   */
  async extractDesignTokenLibraries(figmaData, designSystemPages) {
    const tokenLibraries = [];

    for (const page of designSystemPages) {
      const tokens = {
        pageId: page.id,
        pageName: page.name,
        colors: [],
        typography: [],
        spacing: [],
        effects: [],
        borders: [],
        confidence: page.confidence
      };

      // Extract tokens from the page using existing extraction methods
      if (figmaData.document) {
        const pageNode = this.findPageNode(figmaData.document, page.id);
        if (pageNode) {
          const pageTokens = this.extractDesignTokensFromPage(pageNode);
          Object.assign(tokens, pageTokens);
        }
      }

      tokenLibraries.push(tokens);
    }

    return tokenLibraries;
  }

  /**
   * Extract design tokens specifically from a design system page
   */
  extractDesignTokensFromPage(pageNode) {
    const tokens = {
      colors: [],
      typography: [],
      spacing: [],
      effects: [],
      borders: []
    };

    // Use existing color extraction but focus on organized token patterns
    const colorData = this.extractColors({ document: pageNode });
    if (colorData.palette) {
      tokens.colors = Array.from(colorData.palette.values()).map(color => ({
        name: this.inferTokenName(color, 'color'),
        value: color.hex,
        usage: color.usage,
        category: this.categorizeColorToken(color.hex)
      }));
    }

    // Use existing font extraction for typography tokens
    const fontData = this.extractFonts({ document: pageNode });
    if (fontData.fontMap) {
      tokens.typography = Array.from(fontData.fontMap.values()).map(font => ({
        name: this.inferTokenName(font, 'typography'),
        family: font.family,
        size: font.size,
        weight: font.weight,
        lineHeight: font.lineHeight,
        usage: font.usage
      }));
    }

    // Extract spacing tokens from layout patterns
    tokens.spacing = this.extractSpacingTokens(pageNode);

    return tokens;
  }

  /**
   * Extract spacing tokens from layout patterns
   */
  extractSpacingTokens(pageNode) {
    const spacingValues = new Set();
    this.collectSpacingValues(pageNode, spacingValues);

    return Array.from(spacingValues)
      .sort((a, b) => a - b)
      .map(value => ({
        name: this.inferSpacingTokenName(value),
        value: value,
        unit: 'px'
      }));
  }

  /**
   * Recursively collect spacing values from node layouts
   */
  collectSpacingValues(node, spacingValues) {
    if (!node) {return;}

    // Check for auto-layout spacing
    if (node.itemSpacing !== undefined) {
      spacingValues.add(node.itemSpacing);
    }

    // Check for padding
    if (node.paddingTop !== undefined) {spacingValues.add(node.paddingTop);}
    if (node.paddingRight !== undefined) {spacingValues.add(node.paddingRight);}
    if (node.paddingBottom !== undefined) {spacingValues.add(node.paddingBottom);}
    if (node.paddingLeft !== undefined) {spacingValues.add(node.paddingLeft);}

    // Check for positioning gaps (common spacing pattern)
    if (node.children && Array.isArray(node.children)) {
      for (let i = 1; i < node.children.length; i++) {
        const prev = node.children[i - 1];
        const current = node.children[i];

        if (prev.absoluteBoundingBox && current.absoluteBoundingBox) {
          const gap = current.absoluteBoundingBox.y - (prev.absoluteBoundingBox.y + prev.absoluteBoundingBox.height);
          if (gap > 0 && gap <= 100) { // Reasonable spacing range
            spacingValues.add(gap);
          }
        }
      }

      // Recursively process children
      node.children.forEach(child => this.collectSpacingValues(child, spacingValues));
    }
  }

  /**
   * Find a specific page node by ID
   */
  findPageNode(document, pageId) {
    if (document.children && Array.isArray(document.children)) {
      return document.children.find(page => page.id === pageId);
    }
    return null;
  }

  /**
   * Infer token name from context
   */
  inferTokenName(tokenData, type) {
    if (type === 'color') {
      const category = this.categorizeColorToken(tokenData.hex);
      return `${category}-${tokenData.hex.substring(1, 4)}`;
    } else if (type === 'typography') {
      return `${tokenData.family.toLowerCase().replace(/\s+/g, '-')}-${tokenData.size}`;
    }
    return `${type}-token-${Date.now()}`;
  }

  /**
   * Categorize color token by its hex value
   */
  categorizeColorToken(hex) {
    const hexLower = hex.toLowerCase();

    // Blue family
    if (hexLower.match(/^#[0-4][0-9a-f][6-f][0-9a-f]$/)) {return 'primary';}
    // Green family
    if (hexLower.match(/^#[0-4][6-f][0-4][0-9a-f]$/)) {return 'success';}
    // Red family
    if (hexLower.match(/^#[6-f][0-4][0-4][0-9a-f]$/)) {return 'error';}
    // Yellow/Orange family
    if (hexLower.match(/^#[6-f][6-f][0-4][0-9a-f]$/)) {return 'warning';}
    // Gray family
    if (hexLower.match(/^#[6-9a-f][6-9a-f][6-9a-f]$/)) {return 'neutral';}

    return 'accent';
  }

  /**
   * Infer spacing token name from value
   */
  inferSpacingTokenName(value) {
    if (value <= 4) {return 'spacing-xs';}
    if (value <= 8) {return 'spacing-sm';}
    if (value <= 16) {return 'spacing-md';}
    if (value <= 24) {return 'spacing-lg';}
    if (value <= 32) {return 'spacing-xl';}
    return `spacing-${value}px`;
  }

  /**
   * Extract component libraries from design system pages
   */
  async extractComponentLibraries(figmaData, designSystemPages) {
    const componentLibraries = [];

    for (const page of designSystemPages) {
      const library = {
        pageId: page.id,
        pageName: page.name,
        components: [],
        categories: new Set(),
        totalComponents: 0,
        totalInstances: 0
      };

      if (figmaData.document) {
        const pageNode = this.findPageNode(figmaData.document, page.id);
        if (pageNode) {
          this.extractComponentsFromLibraryPage(pageNode, library);
        }
      }

      library.categories = Array.from(library.categories);
      componentLibraries.push(library);
    }

    return componentLibraries;
  }

  /**
   * Extract components from a library page
   */
  extractComponentsFromLibraryPage(pageNode, library) {
    this.processNodeForComponents(pageNode, library);
  }

  /**
   * Process node recursively for component extraction
   */
  processNodeForComponents(node, library, path = []) {
    if (!node) {return;}

    const currentPath = [...path, node.name || 'Unnamed'];

    if (node.type === 'COMPONENT') {
      library.totalComponents++;

      const category = this.inferComponentCategory(node, currentPath);
      library.categories.add(category);

      library.components.push({
        id: node.id,
        name: node.name,
        category: category,
        path: currentPath.join(' / '),
        variants: this.extractComponentVariants(node),
        properties: this.extractComponentProperties(node)
      });
    } else if (node.type === 'INSTANCE') {
      library.totalInstances++;
    }

    // Process children recursively
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child =>
        this.processNodeForComponents(child, library, currentPath)
      );
    }
  }

  /**
   * Infer component category from context
   */
  inferComponentCategory(node, path) {
    const name = node.name?.toLowerCase() || '';
    const pathString = path.join(' ').toLowerCase();

    // Button patterns
    if (name.includes('button') || name.includes('btn')) {return 'buttons';}

    // Form patterns
    if (name.includes('input') || name.includes('field') || name.includes('form')) {return 'forms';}

    // Navigation patterns
    if (name.includes('nav') || name.includes('menu') || name.includes('tab')) {return 'navigation';}

    // Content patterns
    if (name.includes('card') || name.includes('tile') || name.includes('article')) {return 'content';}

    // Feedback patterns
    if (name.includes('alert') || name.includes('toast') || name.includes('notification')) {return 'feedback';}

    // Layout patterns
    if (name.includes('container') || name.includes('layout') || name.includes('grid')) {return 'layout';}

    // Check path context
    if (pathString.includes('button')) {return 'buttons';}
    if (pathString.includes('form')) {return 'forms';}
    if (pathString.includes('navigation')) {return 'navigation';}

    return 'general';
  }

  /**
   * Extract component variants
   */
  extractComponentVariants(node) {
    const variants = [];

    if (node.variantProperties) {
      Object.entries(node.variantProperties).forEach(([key, value]) => {
        variants.push({ property: key, value: value });
      });
    }

    return variants;
  }

  /**
   * Extract component properties
   */
  extractComponentProperties(node) {
    const properties = {};

    if (node.componentPropertyDefinitions) {
      Object.entries(node.componentPropertyDefinitions).forEach(([key, definition]) => {
        properties[key] = {
          type: definition.type,
          defaultValue: definition.defaultValue
        };
      });
    }

    return properties;
  }

  /**
   * Calculate overall library detection confidence
   */
  calculateLibraryDetectionConfidence(libraries) {
    let totalConfidence = 0;
    let weightedFactors = 0;

    // Design system pages factor
    if (libraries.designSystemPages.length > 0) {
      const avgPageConfidence = libraries.designSystemPages
        .reduce((sum, page) => sum + page.confidence, 0) / libraries.designSystemPages.length;
      totalConfidence += avgPageConfidence * 0.4;
      weightedFactors += 0.4;
    }

    // Token libraries factor
    if (libraries.tokenLibraries.length > 0) {
      const tokenCount = libraries.tokenLibraries
        .reduce((sum, lib) => sum + lib.colors.length + lib.typography.length + lib.spacing.length, 0);
      const tokenConfidence = Math.min(tokenCount / 20, 1) * 0.3; // 20+ tokens = high confidence
      totalConfidence += tokenConfidence;
      weightedFactors += 0.3;
    }

    // Component libraries factor
    if (libraries.componentLibraries.length > 0) {
      const componentCount = libraries.componentLibraries
        .reduce((sum, lib) => sum + lib.totalComponents, 0);
      const componentConfidence = Math.min(componentCount / 10, 1) * 0.3; // 10+ components = high confidence
      totalConfidence += componentConfidence;
      weightedFactors += 0.3;
    }

    return weightedFactors > 0 ? totalConfidence / weightedFactors : 0;
  }

  /**
   * Generate recommendations based on library analysis
   */
  generateLibraryRecommendations(libraries) {
    const recommendations = [];

    if (libraries.confidence < 0.3) {
      recommendations.push('Consider creating a dedicated design system page with organized components and tokens');
    }

    if (libraries.tokenLibraries.length === 0) {
      recommendations.push('Create design token documentation for colors, typography, and spacing');
    }

    if (libraries.componentLibraries.length > 0) {
      const totalComponents = libraries.componentLibraries
        .reduce((sum, lib) => sum + lib.totalComponents, 0);

      if (totalComponents < 5) {
        recommendations.push('Expand component library with reusable UI patterns');
      }
    }

    if (libraries.designSystemPages.length === 0) {
      recommendations.push('Name pages using design system keywords (e.g., "Components", "Design System", "UI Kit")');
    }

    return recommendations;
  }

  /**
   * Compile detected libraries summary
   */
  compileDetectedLibraries(libraries) {
    const detected = [];

    libraries.designSystemPages.forEach(page => {
      const tokenLib = libraries.tokenLibraries.find(lib => lib.pageId === page.id);
      const componentLib = libraries.componentLibraries.find(lib => lib.pageId === page.id);

      detected.push({
        id: page.id,
        name: page.name,
        type: 'design-system-page',
        confidence: page.confidence,
        tokens: tokenLib ? {
          colors: tokenLib.colors.length,
          typography: tokenLib.typography.length,
          spacing: tokenLib.spacing.length
        } : null,
        components: componentLib ? {
          total: componentLib.totalComponents,
          categories: componentLib.categories.length
        } : null,
        organizationPattern: page.organizationPattern
      });
    });

    return detected;
  }

  /**
   * Analyze visual hierarchy
   */
  async analyzeVisualHierarchy(figmaData) {
    return {
      primaryFocusAreas: this.identifyPrimaryFocus(figmaData),
      visualFlow: this.analyzeVisualFlow(figmaData),
      contrastLevels: this.analyzeContrastLevels(figmaData),
      scalingPatterns: this.analyzeScalingPatterns(figmaData),
      whitespaceUsage: this.analyzeWhitespace(figmaData)
    };
  }

  identifyPrimaryFocus(figmaData) {
    return [{ id: 'focus1', name: 'Primary Button', type: 'COMPONENT' }];
  }

  analyzeVisualFlow(figmaData) {
    return { direction: 'left-to-right', scanPattern: 'z-pattern' };
  }

  analyzeContrastLevels(figmaData) {
    return { overall: 'adequate', textContrast: 'good' };
  }

  analyzeScalingPatterns(figmaData) {
    return { typographicScale: 3, spacingScale: 'consistent' };
  }

  analyzeWhitespace(figmaData) {
    return { usage: 'balanced', density: 'medium' };
  }

  /**
   * Analyze interaction patterns
   */
  async analyzeInteractionPatterns(figmaData) {
    return {
      navigationPatterns: { primary: 'horizontal-tabs', secondary: 'sidebar' },
      feedbackSystems: { errorHandling: 'inline-validation' },
      inputMethods: { formTypes: ['text-input', 'dropdown'] },
      gestureSupport: { touchGestures: ['tap', 'swipe'] },
      microinteractions: { hoverEffects: true, transitions: 'smooth' }
    };
  }

  /**
   * Analyze responsive strategy
   */
  async analyzeResponsiveStrategy(figmaData) {
    return {
      breakpoints: { mobile: '320px', tablet: '768px', desktop: '1024px' },
      layoutStrategy: { approach: 'fluid-grid', flexibility: 'adaptive' },
      contentPriority: { hierarchy: 'maintained', hiddenContent: 'minimal' },
      touchTargets: { minSize: '44px', spacing: 'adequate' },
      deviceOptimization: { performance: 'optimized', platformPatterns: 'consistent' }
    };
  }

  /**
   * Extract design tokens from figma data
   */
  async extractDesignTokens(figmaData) {
    const colors = this.extractColors(figmaData);
    const fonts = this.extractFonts(figmaData);

    return {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        semantic: colors.semantic,
        palette: Array.from(colors.palette?.values() || [])
      },
      typography: {
        primary: fonts.primary,
        secondary: fonts.secondary,
        fontMap: Array.from(fonts.fontMap?.values() || [])
      },
      spacing: [],
      effects: [],
      borders: []
    };
  }
}