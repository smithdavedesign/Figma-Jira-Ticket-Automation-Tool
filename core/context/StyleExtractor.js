/**
 * StyleExtractor - Design System Style Extraction
 *
 * Extracts and normalizes colors, typography, spacing, grids, and other design tokens
 * from Figma data into structured design system information.
 *
 * Handles:
 * - Color palette extraction and categorization
 * - Typography system analysis (fonts, sizes, weights, line heights)
 * - Spacing patterns and grid system detection
 * - Shadow and effect cataloging
 * - Design token standardization
 */

import { Logger } from '../utils/logger.js';

export class StyleExtractor {
  constructor() {
    this.logger = new Logger('StyleExtractor');

    // Color analysis thresholds
    this.colorThresholds = {
      minimumUsage: 2, // Minimum times a color must appear to be considered significant
      contrastRatio: 4.5, // WCAG AA standard
      brightnessThreshold: 0.5
    };

    // Typography analysis patterns
    this.typographyPatterns = {
      headingSizes: [32, 28, 24, 20, 18, 16], // Common heading sizes
      bodySizes: [16, 14, 12, 10], // Common body text sizes
      fontWeights: [100, 200, 300, 400, 500, 600, 700, 800, 900]
    };

    // Spacing analysis patterns
    this.spacingPatterns = {
      commonSpacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64], // 4px grid system
      gridBases: [4, 8, 12], // Common grid base units
      breakpoints: [320, 768, 1024, 1440] // Common responsive breakpoints
    };
  }

  /**
   * Initialize the style extractor
   */
  async initialize() {
    this.logger.info('✅ StyleExtractor initialized');
  }

  /**
   * Extract comprehensive style system from Figma data
   * @param {Object} figmaData - Complete Figma file data
   * @param {Object} options - Extraction options
   * @returns {Object} Structured style system
   */
  async extractStyles(figmaData, options = {}) {
    const startTime = Date.now();

    try {
      this.logger.info('🎨 Extracting design system styles', {
        fileId: figmaData.document?.id,
        hasStyles: !!figmaData.styles,
        nodeCount: this.countTotalNodes(figmaData.document)
      });

      // Extract from multiple sources
      const [
        colorSystem,
        typographySystem,
        spacingSystem,
        effectSystem,
        gridSystem,
        componentStyles
      ] = await Promise.all([
        this.extractColorSystem(figmaData, options),
        this.extractTypographySystem(figmaData, options),
        this.extractSpacingSystem(figmaData, options),
        this.extractEffectSystem(figmaData, options),
        this.extractGridSystem(figmaData, options),
        this.extractComponentStyles(figmaData, options)
      ]);

      const styleSystem = {
        colors: colorSystem,
        typography: typographySystem,
        spacing: spacingSystem,
        effects: effectSystem,
        layout: gridSystem,
        components: componentStyles,

        // Style metadata
        extraction: {
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          confidence: this.calculateStyleConfidence({
            colorSystem,
            typographySystem,
            spacingSystem,
            effectSystem
          }),
          coverage: this.calculateStyleCoverage(figmaData)
        }
      };

      this.logger.info('✅ Style extraction complete', {
        colors: Object.keys(colorSystem.palette || {}).length,
        fonts: Object.keys(typographySystem.fonts || {}).length,
        spacingTokens: Object.keys(spacingSystem.tokens || {}).length,
        processingTime: styleSystem.extraction.processingTime
      });

      return styleSystem;

    } catch (error) {
      this.logger.error('Style extraction failed:', error);
      return this.generateFallbackStyleSystem(error);
    }
  }

  /**
   * Extract comprehensive color system
   */
  async extractColorSystem(figmaData, options) {
    const colors = {
      palette: {},
      usage: {},
      accessibility: {},
      categories: {
        primary: [],
        secondary: [],
        neutral: [],
        semantic: [], // success, warning, error, info
        accent: []
      }
    };

    try {
      // Extract from document styles
      if (figmaData.styles) {
        Object.values(figmaData.styles).forEach(style => {
          if (style.styleType === 'FILL') {
            this.processStyleFill(style, colors);
          }
        });
      }

      // Extract from node fills
      const nodeColors = this.extractColorsFromNodes(figmaData.document);
      this.mergeNodeColors(nodeColors, colors);

      // Analyze color relationships and accessibility
      colors.accessibility = this.analyzeColorAccessibility(colors.palette);
      colors.categories = this.categorizeColors(colors.palette);
      colors.usage = this.analyzeColorUsage(colors.palette);

      return colors;

    } catch (error) {
      this.logger.warn('Color extraction failed:', error);
      return { palette: {}, usage: {}, accessibility: {}, categories: {} };
    }
  }

  /**
   * Extract typography system
   */
  async extractTypographySystem(figmaData, options) {
    const typography = {
      fonts: {},
      scales: {},
      hierarchy: {},
      usage: {}
    };

    try {
      // Extract from text styles
      if (figmaData.styles) {
        Object.values(figmaData.styles).forEach(style => {
          if (style.styleType === 'TEXT') {
            this.processTextStyle(style, typography);
          }
        });
      }

      // Extract from text nodes
      const textNodes = this.findTextNodes(figmaData.document);
      textNodes.forEach(node => {
        this.processTextNode(node, typography);
      });

      // Analyze typography patterns
      typography.scales = this.identifyTypographyScales(typography.fonts);
      typography.hierarchy = this.identifyTypographyHierarchy(typography.fonts);
      typography.usage = this.analyzeTypographyUsage(typography.fonts);

      return typography;

    } catch (error) {
      this.logger.warn('Typography extraction failed:', error);
      return { fonts: {}, scales: {}, hierarchy: {}, usage: {} };
    }
  }

  /**
   * Extract spacing system
   */
  async extractSpacingSystem(figmaData, options) {
    const spacing = {
      tokens: {},
      patterns: {},
      grid: {},
      usage: {}
    };

    try {
      // Extract spacing from layout nodes
      const layoutNodes = this.findLayoutNodes(figmaData.document);
      layoutNodes.forEach(node => {
        this.extractNodeSpacing(node, spacing);
      });

      // Identify spacing patterns
      spacing.patterns = this.identifySpacingPatterns(spacing.tokens);
      spacing.grid = this.identifyGridSystem(spacing.tokens);
      spacing.usage = this.analyzeSpacingUsage(spacing.tokens);

      return spacing;

    } catch (error) {
      this.logger.warn('Spacing extraction failed:', error);
      return { tokens: {}, patterns: {}, grid: {}, usage: {} };
    }
  }

  /**
   * Extract effect system (shadows, blurs, etc.)
   */
  async extractEffectSystem(figmaData, options) {
    const effects = {
      shadows: {},
      blurs: {},
      other: {},
      usage: {}
    };

    try {
      // Extract from effect styles
      if (figmaData.styles) {
        Object.values(figmaData.styles).forEach(style => {
          if (style.styleType === 'EFFECT') {
            this.processEffectStyle(style, effects);
          }
        });
      }

      // Extract from node effects
      const nodesWithEffects = this.findNodesWithEffects(figmaData.document);
      nodesWithEffects.forEach(node => {
        this.processNodeEffects(node, effects);
      });

      effects.usage = this.analyzeEffectUsage(effects);

      return effects;

    } catch (error) {
      this.logger.warn('Effect extraction failed:', error);
      return { shadows: {}, blurs: {}, other: {}, usage: {} };
    }
  }

  /**
   * Extract grid and layout system
   */
  async extractGridSystem(figmaData, options) {
    const grid = {
      systems: {},
      breakpoints: {},
      containers: {},
      usage: {}
    };

    try {
      const frameNodes = this.findFrameNodes(figmaData.document);
      frameNodes.forEach(frame => {
        this.analyzeFrameGrid(frame, grid);
      });

      grid.breakpoints = this.identifyBreakpoints(frameNodes);
      grid.usage = this.analyzeGridUsage(grid.systems);

      return grid;

    } catch (error) {
      this.logger.warn('Grid extraction failed:', error);
      return { systems: {}, breakpoints: {}, containers: {}, usage: {} };
    }
  }

  /**
   * Extract component-specific styles
   */
  async extractComponentStyles(figmaData, options) {
    const componentStyles = {
      components: {},
      variants: {},
      patterns: {}
    };

    try {
      const componentNodes = this.findComponentNodes(figmaData.document);
      componentNodes.forEach(component => {
        this.extractComponentStyleData(component, componentStyles);
      });

      return componentStyles;

    } catch (error) {
      this.logger.warn('Component style extraction failed:', error);
      return { components: {}, variants: {}, patterns: {} };
    }
  }

  /**
   * Process style fill for color extraction
   */
  processStyleFill(style, colors) {
    if (style.fills && Array.isArray(style.fills)) {
      style.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const colorKey = this.rgbToHex(fill.color);
          colors.palette[colorKey] = {
            name: style.name,
            rgb: fill.color,
            hex: colorKey,
            opacity: fill.opacity || 1,
            styleId: style.key,
            usage: 1
          };
        }
      });
    }
  }

  /**
   * Extract colors from all nodes recursively
   */
  extractColorsFromNodes(node, colors = {}) {
    if (!node) {return colors;}

    // Process node fills
    if (node.fills && Array.isArray(node.fills)) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
          const colorKey = this.rgbToHex(fill.color);
          if (!colors[colorKey]) {
            colors[colorKey] = {
              hex: colorKey,
              rgb: fill.color,
              opacity: fill.opacity || 1,
              usage: 0,
              nodes: []
            };
          }
          colors[colorKey].usage++;
          colors[colorKey].nodes.push(node.id);
        }
      });
    }

    // Process node strokes
    if (node.strokes && Array.isArray(node.strokes)) {
      node.strokes.forEach(stroke => {
        if (stroke.type === 'SOLID' && stroke.color && stroke.visible !== false) {
          const colorKey = this.rgbToHex(stroke.color);
          if (!colors[colorKey]) {
            colors[colorKey] = {
              hex: colorKey,
              rgb: stroke.color,
              opacity: stroke.opacity || 1,
              usage: 0,
              nodes: []
            };
          }
          colors[colorKey].usage++;
          colors[colorKey].nodes.push(node.id);
        }
      });
    }

    // Recurse through children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        this.extractColorsFromNodes(child, colors);
      });
    }

    return colors;
  }

  /**
   * Convert RGB color to hex
   */
  rgbToHex(rgb) {
    if (!rgb) {return '#000000';}

    const toHex = (value) => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Calculate relative luminance for accessibility analysis
   */
  getRelativeLuminance(rgb) {
    const sRGB = (color) => {
      color = color / 255;
      return color <= 0.03928
        ? color / 12.92
        : Math.pow((color + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * sRGB(rgb.r * 255) +
           0.7152 * sRGB(rgb.g * 255) +
           0.0722 * sRGB(rgb.b * 255);
  }

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1, color2) {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);

    const lightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (lightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Analyze color accessibility
   */
  analyzeColorAccessibility(palette) {
    const accessibility = {
      violations: [],
      recommendations: [],
      compliant: []
    };

    const colors = Object.values(palette);

    // Check all color combinations for contrast
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const color1 = colors[i];
        const color2 = colors[j];

        if (color1.rgb && color2.rgb) {
          const contrast = this.getContrastRatio(color1.rgb, color2.rgb);

          if (contrast >= this.colorThresholds.contrastRatio) {
            accessibility.compliant.push({
              color1: color1.hex,
              color2: color2.hex,
              contrast: contrast.toFixed(2)
            });
          } else {
            accessibility.violations.push({
              color1: color1.hex,
              color2: color2.hex,
              contrast: contrast.toFixed(2),
              required: this.colorThresholds.contrastRatio
            });
          }
        }
      }
    }

    return accessibility;
  }

  /**
   * Categorize colors into semantic groups
   */
  categorizeColors(palette) {
    const categories = {
      primary: [],
      secondary: [],
      neutral: [],
      semantic: [],
      accent: []
    };

    Object.values(palette).forEach(color => {
      if (color.name) {
        const name = color.name.toLowerCase();

        if (name.includes('primary')) {
          categories.primary.push(color);
        } else if (name.includes('secondary')) {
          categories.secondary.push(color);
        } else if (name.includes('neutral') || name.includes('gray') || name.includes('grey')) {
          categories.neutral.push(color);
        } else if (name.includes('error') || name.includes('success') ||
                   name.includes('warning') || name.includes('info')) {
          categories.semantic.push(color);
        } else {
          categories.accent.push(color);
        }
      }
    });

    return categories;
  }

  /**
   * Find text nodes recursively
   */
  findTextNodes(node, textNodes = []) {
    if (!node) {return textNodes;}

    if (node.type === 'TEXT') {
      textNodes.push(node);
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => {
        this.findTextNodes(child, textNodes);
      });
    }

    return textNodes;
  }

  /**
   * Process text style for typography extraction
   */
  processTextStyle(style, typography) {
    if (style.style) {
      const styleData = {
        name: style.name,
        styleId: style.key,
        fontFamily: style.style.fontFamily,
        fontSize: style.style.fontSize,
        fontWeight: style.style.fontWeight,
        lineHeight: style.style.lineHeightPx || style.style.lineHeightPercent,
        letterSpacing: style.style.letterSpacing,
        textAlign: style.style.textAlignHorizontal,
        textDecoration: style.style.textDecoration
      };

      const fontKey = `${styleData.fontFamily}-${styleData.fontSize}-${styleData.fontWeight}`;
      typography.fonts[fontKey] = styleData;
    }
  }

  /**
   * Process text node for typography data
   */
  processTextNode(node, typography) {
    if (node.style) {
      const nodeStyle = {
        fontFamily: node.style.fontFamily,
        fontSize: node.style.fontSize,
        fontWeight: node.style.fontWeight,
        lineHeight: node.style.lineHeightPx || node.style.lineHeightPercent,
        characters: node.characters,
        nodeId: node.id
      };

      const fontKey = `${nodeStyle.fontFamily}-${nodeStyle.fontSize}-${nodeStyle.fontWeight}`;
      if (!typography.fonts[fontKey]) {
        typography.fonts[fontKey] = nodeStyle;
      }
    }
  }

  /**
   * Count total nodes in document
   */
  countTotalNodes(document) {
    if (!document) {return 0;}

    let count = 1;
    const countRecursive = (node) => {
      if (node.children && Array.isArray(node.children)) {
        count += node.children.length;
        node.children.forEach(countRecursive);
      }
    };

    countRecursive(document);
    return count;
  }

  /**
   * Calculate style extraction confidence
   */
  calculateStyleConfidence(styleSystem) {
    let score = 0;
    const maxScore = 4;

    if (Object.keys(styleSystem.colorSystem?.palette || {}).length > 0) {score++;}
    if (Object.keys(styleSystem.typographySystem?.fonts || {}).length > 0) {score++;}
    if (Object.keys(styleSystem.spacingSystem?.tokens || {}).length > 0) {score++;}
    if (Object.keys(styleSystem.effectSystem?.shadows || {}).length > 0) {score++;}

    return score / maxScore;
  }

  /**
   * Calculate style coverage
   */
  calculateStyleCoverage(figmaData) {
    const coverage = {
      hasStyles: !!figmaData.styles,
      styleCount: figmaData.styles ? Object.keys(figmaData.styles).length : 0,
      hasColors: false,
      hasTypography: false,
      hasEffects: false
    };

    if (figmaData.styles) {
      Object.values(figmaData.styles).forEach(style => {
        if (style.styleType === 'FILL') {coverage.hasColors = true;}
        if (style.styleType === 'TEXT') {coverage.hasTypography = true;}
        if (style.styleType === 'EFFECT') {coverage.hasEffects = true;}
      });
    }

    return coverage;
  }

  /**
   * Generate fallback style system
   */
  generateFallbackStyleSystem(error) {
    this.logger.warn('Generating fallback style system:', error);

    return {
      colors: { palette: {}, usage: {}, categories: {} },
      typography: { fonts: {}, scales: {}, hierarchy: {} },
      spacing: { tokens: {}, patterns: {}, grid: {} },
      effects: { shadows: {}, blurs: {}, other: {} },
      layout: { systems: {}, breakpoints: {} },
      components: { components: {}, variants: {} },
      extraction: {
        timestamp: new Date().toISOString(),
        error: error.message,
        confidence: 0.1
      }
    };
  }

  // Placeholder methods for comprehensive implementation
  mergeNodeColors(nodeColors, colors) { /* Implementation */ }
  analyzeColorUsage(palette) { return {}; }
  identifyTypographyScales(fonts) { return {}; }
  identifyTypographyHierarchy(fonts) { return {}; }
  analyzeTypographyUsage(fonts) { return {}; }
  findLayoutNodes(document) { return []; }
  extractNodeSpacing(node, spacing) { /* Implementation */ }
  identifySpacingPatterns(tokens) { return {}; }
  identifyGridSystem(tokens) { return {}; }
  analyzeSpacingUsage(tokens) { return {}; }
  findNodesWithEffects(document) { return []; }
  processEffectStyle(style, effects) { /* Implementation */ }
  processNodeEffects(node, effects) { /* Implementation */ }
  analyzeEffectUsage(effects) { return {}; }
  findFrameNodes(document) { return []; }
  analyzeFrameGrid(frame, grid) { /* Implementation */ }
  identifyBreakpoints(frames) { return {}; }
  analyzeGridUsage(systems) { return {}; }
  findComponentNodes(document) { return []; }
  extractComponentStyleData(component, styles) { /* Implementation */ }
}

export default StyleExtractor;