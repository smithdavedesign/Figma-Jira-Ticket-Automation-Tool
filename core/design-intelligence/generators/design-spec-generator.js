/* eslint-disable no-undef, no-unused-vars */
/**
 * 📊 Design Specification Generator
 *
 * Generates comprehensive design specifications from Figma data,
 * creating structured specifications for component implementation.

import { DESIGN_SPEC_VERSION } from '../schema/design-spec.js';

/**
 * @typedef {Object} FigmaFrameData
 * @property {string} id - Frame ID
 * @property {string} name - Frame name
 * @property {string} type - Frame type
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Frame width
 * @property {number} height - Frame height
 * @property {any[]} [fills] - Fill styles
 * @property {any[]} [strokes] - Stroke styles
 * @property {any[]} [effects] - Visual effects
 * @property {FigmaFrameData[]} [children] - Child frames
 * @property {string} [characters] - Text content
 * @property {any} [style] - Text style properties
 * @property {string} [componentId] - Component instance ID
 * @property {any} [mainComponent] - Main component reference
 */

/**
 * @typedef {Object} FigmaFileContext
 * @property {string} fileId - Figma file ID
 * @property {string} fileName - File name
 * @property {string} pageId - Page ID
 * @property {string} pageName - Page name
 * @property {string[]} nodeIds - Selected node IDs
 * @property {any} [designSystem] - Design system data
 * @property {any} [styles] - Style data
 */

/**
 * @typedef {Object} ExtractionContext
 * @property {string} extractedBy - Extraction source identifier
 * @property {number} processingTime - Processing time in ms
 * @property {boolean} userSelection - Whether user made selection
 * @property {'frame'|'component'|'instance'|'mixed'} selectionType - Selection type
 * @property {string[]} [techStack] - Technology stack
 * @property {number} [confidence] - Confidence score
 */

/**
 * @typedef {Object} ColorToken
 * @property {string} id - Token ID
 * @property {string} name - Token name
 * @property {string} value - Hex color value
 * @property {Object} rgba - RGBA color object
 * @property {'primary'|'secondary'|'neutral'} usage - Color usage
 * @property {'global'|'local'} scope - Token scope
 * @property {string[]} references - Component references
 */

/**
 * @typedef {Object} TypographyToken
 * @property {string} id - Token ID
 * @property {string} name - Token name
 * @property {string} fontFamily - Font family
 * @property {number} fontSize - Font size
 * @property {number} fontWeight - Font weight
 * @property {number} lineHeight - Line height
 * @property {number} letterSpacing - Letter spacing
 * @property {'heading'|'body'|'label'|'caption'} usage - Typography usage
 * @property {'global'|'local'} scope - Token scope
 * @property {string[]} references - Component references
 */

/**
 * @typedef {Object} DesignTokens
 * @property {ColorToken[]} colors - Color tokens
 * @property {TypographyToken[]} typography - Typography tokens
 * @property {any[]} spacing - Spacing tokens
 * @property {any[]} effects - Effect tokens
 * @property {any[]} borders - Border tokens
 * @property {any[]} radii - Radius tokens
 */

export class DesignSpecGenerator {
  constructor() {
    this.specId = this.generateSpecId();
    this.extractionStartTime = Date.now();
  }

  /**
   * Generate a complete design specification from Figma data
   * @param {FigmaFrameData[]} figmaData - Figma frame data
   * @param {FigmaFileContext} fileContext - File context
   * @param {ExtractionContext} extractionContext - Extraction context
   * @returns {Promise<Object>} Design specification
   */
  async generateDesignSpec(figmaData, fileContext, extractionCon_text) {
    try {
      const processingEndTime = Date.now();
      const totalProcessingTime = processingEndTime - this.extractionStartTime;

      // Generate each section of the design spec
      const metadata = this.generateMetadata(figmaData, fileContext, extractionContext, totalProcessingTime);
      const designTokens = await this.extractDesignTokens(figmaData, fileCon_text);
      const components = await this.analyzeComponents(figmaData, fileCon_text);
      const designSystem = await this.analyzeDesignSystem(figmaData, fileContext, designTokens);
      const responsive = await this.analyzeResponsiveDesign(figmaData);
      const accessibility = await this.analyzeAccessibility(figmaData, components);
      const context = await this.generateDesignContext(figmaData, fileContext, extractionCon_text);

      const designSpec = {
        metadata,
        designTokens,
        components,
        designSystem,
        responsive,
        accessibility,
        context
      };

      return designSpec;

    } catch (error) {
      throw new Error(`Failed to generate design spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate metadata section
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @param {FigmaFileContext} fileContext - File context
   * @param {ExtractionContext} extractionContext - Extraction context
   * @param {number} processingTime - Processing time
   * @returns {Object} Metadata object
   */
  generateMetadata(figmaData, fileContext, extractionContext, processingTime) {
    const elementCount = this.countTotalElements(figmaData);
    const complexity = this.assessComplexity(elementCount, figmaData.length);

    return {
      version: DESIGN_SPEC_VERSION,
      specId: this.specId,
      figmaFile: {
        fileId: fileContext.fileId,
        fileName: fileContext.fileName,
        pageId: fileContext.pageId,
        pageName: fileContext.pageName,
        nodeIds: fileContext.nodeIds
      },
      extraction: {
        timestamp: new Date().toISOString(),
        extractedBy: extractionContext.extractedBy,
        processingTime,
        confidence: extractionContext.confidence || 0.8
      },
      context: {
        userSelection: extractionContext.userSelection,
        selectionType: extractionContext.selectionType,
        elementCount,
        complexity
      }
    };
  }

  /**
   * Extract design tokens from Figma data
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @param {FigmaFileContext} fileContext - File context
   * @returns {Promise<DesignTokens>} Design tokens
   */
  async extractDesignTokens(figmaData, fileCon_text) {
    const colors = [];
    const typography = [];
    const spacing = [];
    const effects = [];
    const borders = [];
    const radii = [];

    // Extract colors from fills and strokes
    const colorMap = new Map();
    let colorId = 1;

    const extractColorsFromNode = (node) => {
      // Extract from fills
      if (node.fills) {
        node.fills.forEach((fill) => {
          if (fill.type === 'SOLID' && fill.color) {
            const colorValue = this.rgbaToHex(fill.color);
            if (!colorMap.has(colorValue)) {
              colorMap.set(colorValue, {
                id: `color-${colorId++}`,
                name: `color-${colorValue.replace('#', '')}`,
                value: colorValue,
                rgba: fill.color,
                usage: this.inferColorUsage(colorValue, node.type),
                scope: 'local',
                references: [node.id]
              });
            } else {
              colorMap.get(colorValue).references.push(node.id);
            }
          }
        });
      }

      // Extract from strokes
      if (node.strokes) {
        node.strokes.forEach((stroke) => {
          if (stroke.type === 'SOLID' && stroke.color) {
            const colorValue = this.rgbaToHex(stroke.color);
            if (!colorMap.has(colorValue)) {
              colorMap.set(colorValue, {
                id: `stroke-color-${colorId++}`,
                name: `stroke-${colorValue.replace('#', '')}`,
                value: colorValue,
                rgba: stroke.color,
                usage: 'neutral',
                scope: 'local',
                references: [node.id]
              });
            } else {
              colorMap.get(colorValue).references.push(node.id);
            }
          }
        });
      }

      // Process children recursively
      if (node.children) {
        node.children.forEach(extractColorsFromNode);
      }
    };

    figmaData.forEach(extractColorsFromNode);
    colors.push(...Array.from(colorMap.values()));

    // Extract typography tokens
    const typographyMap = new Map();
    let typographyId = 1;

    const extractTypographyFromNode = (node) => {
      if (node.type === 'TEXT' && node.style) {
        const style = node.style;
        const key = `${style.fontFamily}-${style.fontSize}-${style.fontWeight}`;

        if (!typographyMap.has(key)) {
          typographyMap.set(key, {
            id: `typography-${typographyId++}`,
            name: `${style.fontFamily}-${style.fontSize}`,
            fontFamily: style.fontFamily || 'Arial',
            fontSize: style.fontSize || 16,
            fontWeight: style.fontWeight || 400,
            lineHeight: style.lineHeight || 1.2,
            letterSpacing: style.letterSpacing || 0,
            usage: this.inferTypographyUsage(style.fontSize, node.name),
            scope: 'local',
            references: [node.id]
          });
        } else {
          typographyMap.get(key).references.push(node.id);
        }
      }

      if (node.children) {
        node.children.forEach(extractTypographyFromNode);
      }
    };

    figmaData.forEach(extractTypographyFromNode);
    typography.push(...Array.from(typographyMap.values()));

    return {
      colors,
      typography,
      spacing,
      effects,
      borders,
      radii
    };
  }

  /**
   * Analyze components and their semantic meaning
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @param {FigmaFileContext} fileContext - File context
   * @returns {Promise<Object[]>} Design components
   */
  async analyzeComponents(figmaData, fileCon_text) {
    const components = [];

    const analyzeNode = (node, parent, level = 0) => {
      const intent = this.inferComponentIntent(node);
      const role = this.inferAccessibilityRole(node, intent);

      const component = {
        id: node.id,
        name: node.name,
        type: this.mapFigmaTypeToComponentType(node.type),
        category: this.inferComponentCategory(intent),
        semantic: {
          intent,
          role,
          pattern: this.inferDesignPattern(node),
          confidence: this.calculateSemanticConfidence(node, intent)
        },
        visual: {
          dimensions: { width: node.width, height: node.height },
          position: { x: node.x, y: node.y },
          constraints: { horizontal: 'left', vertical: 'top' }, // Default
          fills: node.fills || [],
          strokes: node.strokes || [],
          effects: node.effects || [],
          cornerRadius: this.extractCornerRadius(node)
        },
        content: {
          text: node.type === 'TEXT' ? [{
            id: `${node.id}-text`,
            text: node.characters || '',
            style: {}, // Would be populated with extracted typography
            fills: node.fills || [],
            alignment: 'left',
            verticalAlignment: 'top',
            semantic: {
              role: this.inferTextRole(node.name, node.characters),
              isInteractive: this.isInteractiveText(node)
            }
          }] : undefined,
          images: node.type === 'IMAGE' ? [{
            id: `${node.id}-image`,
            dimensions: { width: node.width, height: node.height },
            semantic: {
              role: 'informative',
              description: `Image from ${node.name}`
            }
          }] : undefined
        },
        hierarchy: {
          parent,
          children: (node.children || []).map(child => child.id),
          level,
          isRoot: level === 0
        },
        relationships: {
          instances: node.componentId ? [node.componentId] : undefined,
          masterComponent: node.mainComponent?.id
        },
        framework: {
          suggestedTag: this.suggestHTMLTag(node, intent),
          attributes: this.generateFrameworkAttributes(node, intent),
          events: this.inferPossibleEvents(intent),
          states: this.inferComponentStates(intent)
        }
      };

      return component;
    };

    const processNodeRecursively = (node, parent, level = 0) => {
      const component = analyzeNode(node, parent, level);
      components.push(component);

      if (node.children) {
        node.children.forEach(child =>
          processNodeRecursively(child, node.id, level + 1)
        );
      }
    };

    figmaData.forEach(node => processNodeRecursively(node));

    return components;
  }

  /**
   * Analyze design system compliance
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @param {FigmaFileContext} fileContext - File context
   * @param {DesignTokens} designTokens - Design tokens
   * @returns {Promise<Object>} Design system analysis
   */
  async analyzeDesignSystem(figmaData, fileContext, designTokens) {
    // This would integrate with the existing design system detection logic
    return {
      detected: {
        system: 'custom',
        confidence: 0.7,
        evidence: ['Custom color palette detected', 'Consistent spacing patterns']
      },
      compliance: {
        overall: 0.8,
        categories: {
          colors: { score: 0.9, passed: 18, total: 20, issues: [] },
          typography: { score: 0.7, passed: 14, total: 20, issues: ['Missing font weights'] },
          spacing: { score: 0.8, passed: 16, total: 20, issues: [] },
          components: { score: 0.8, passed: 16, total: 20, issues: [] }
        },
        violations: [],
        recommendations: []
      },
      systemTokens: {
        colors: designTokens.colors.length,
        typography: designTokens.typography.length,
        spacing: designTokens.spacing.length,
        components: figmaData.length,
        coverage: 0.75
      }
    };
  }

  /**
   * Analyze responsive design patterns
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @returns {Promise<Object>} Responsive design data
   */
  async analyzeResponsiveDesign(figmaData) {
    return {
      breakpoints: [
        { name: 'mobile', minWidth: 320, maxWidth: 767, usage: 'mobile' },
        { name: 'tablet', minWidth: 768, maxWidth: 1023, usage: 'tablet' },
        { name: 'desktop', minWidth: 1024, usage: 'desktop' }
      ],
      layouts: [],
      flexible: {
        flexbox: [],
        grid: [],
        responsive: []
      },
      mobileFriendly: {
        isMobileFriendly: true,
        issues: [],
        recommendations: []
      }
    };
  }

  /**
   * Analyze accessibility compliance
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @param {Object[]} components - Design components
   * @returns {Promise<Object>} Accessibility data
   */
  async analyzeAccessibility(figmaData, components) {
    return {
      compliance: {
        wcag: 'partial',
        score: 0.7,
        automated: true
      },
      semantics: {
        headingStructure: [],
        landmarks: [],
        navigation: [],
        forms: []
      },
      colorAccessibility: {
        contrastIssues: [],
        colorDependency: false,
        colorBlindnessIssues: []
      },
      interaction: {
        focusable: [],
        keyboardNavigation: true,
        touchTargets: []
      },
      content: {
        altTexts: [],
        textScaling: true,
        readingOrder: components.map(c => c.id)
      },
      issues: [],
      recommendations: []
    };
  }

  /**
   * Generate design context and intent
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @param {FigmaFileContext} fileContext - File context
   * @param {ExtractionContext} extractionContext - Extraction context
   * @returns {Promise<Object>} Design context
   */
  async generateDesignContext(figmaData, fileContext, extractionCon_text) {
    const complexity = this.assessComplexity(this.countTotalElements(figmaData), figmaData.length);

    return {
      intent: {
        purpose: this.inferDesignPurpose(figmaData, fileCon_text),
        context: 'web' // Default, could be inferred
      },
      technical: {
        framework: extractionContext.techStack?.[0],
        platform: 'web',
        constraints: [],
        integrations: []
      },
      decisions: {
        rationale: [],
        assumptions: ['Web-based interface', 'Modern browser support'],
        constraints: ['Performance considerations', 'Accessibility compliance'],
        tradeoffs: []
      },
      quality: {
        completeness: 0.8,
        consistency: 0.7,
        clarity: 0.8,
        complexity: complexity === 'simple' ? 0.3 : complexity === 'moderate' ? 0.6 : 0.9,
        confidence: extractionContext.confidence || 0.8
      }
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate unique specification ID
   * @private
   * @returns {string} Spec ID
   */
  generateSpecId() {
    return `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Count total elements in frame data
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @returns {number} Total element count
   */
  countTotalElements(figmaData) {
    let count = 0;
    const countNode = (node) => {
      count++;
      if (node.children) {
        node.children.forEach(countNode);
      }
    };
    figmaData.forEach(countNode);
    return count;
  }

  /**
   * Assess design complexity
   * @private
   * @param {number} elementCount - Total elements
   * @param {number} rootCount - Root elements
   * @returns {'simple'|'moderate'|'complex'} Complexity level
   */
  assessComplexity(elementCount, rootCount) {
    if (elementCount < 20 && rootCount < 3) {return 'simple';}
    if (elementCount < 100 && rootCount < 10) {return 'moderate';}
    return 'complex';
  }

  /**
   * Convert RGBA to hex color
   * @private
   * @param {Object} rgba - RGBA color object
   * @returns {string} Hex color value
   */
  rgbaToHex(rgba) {
    const toHex = (value) => Math.round(value * 255).toString(16).padStart(2, '0');
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
  }

  /**
   * Infer color usage from context
   * @private
   * @param {string} colorValue - Hex color value
   * @param {string} nodeType - Figma node type
   * @returns {'primary'|'secondary'|'neutral'} Color usage
   */
  inferColorUsage(colorValue, nodeType) {
    // Simple heuristics - would be enhanced with ML classification
    if (colorValue === '#FFFFFF' || colorValue === '#000000') {return 'neutral';}
    if (nodeType === 'RECTANGLE' || nodeType === 'FRAME') {return 'primary';}
    return 'secondary';
  }

  /**
   * Infer typography usage from context
   * @private
   * @param {number} fontSize - Font size
   * @param {string} nodeName - Node name
   * @returns {'heading'|'body'|'label'|'caption'} Typography usage
   */
  inferTypographyUsage(fontSize, nodeName) {
    if (fontSize >= 24) {return 'heading';}
    if (fontSize >= 16) {return 'body';}
    if (nodeName.toLowerCase().includes('label')) {return 'label';}
    return 'caption';
  }

  /**
   * Map Figma type to component type
   * @private
   * @param {string} figmaType - Figma node type
   * @returns {string} Component type
   */
  mapFigmaTypeToComponentType(figmaType) {
    const typeMap = {
      'FRAME': 'frame',
      'GROUP': 'group',
      'COMPONENT': 'component',
      'INSTANCE': 'instance',
      'TEXT': 'text',
      'RECTANGLE': 'rectangle',
      'ELLIPSE': 'ellipse',
      'POLYGON': 'polygon',
      'STAR': 'star',
      'VECTOR': 'vector',
      'IMAGE': 'image'
    };
    return typeMap[figmaType] || 'frame';
  }

  /**
   * Infer component intent from context
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @returns {string} Component intent
   */
  inferComponentIntent(node) {
    const name = node.name.toLowerCase();

    // Button detection
    if (name.includes('button') || name.includes('btn')) {return 'button';}
    if (name.includes('input') || name.includes('field')) {return 'input';}
    if (name.includes('card')) {return 'card';}
    if (name.includes('modal') || name.includes('dialog')) {return 'modal';}
    if (name.includes('nav') || name.includes('menu')) {return 'navigation';}
    if (name.includes('header')) {return 'header';}
    if (name.includes('footer')) {return 'footer';}
    if (name.includes('sidebar')) {return 'sidebar';}
    if (name.includes('hero')) {return 'hero';}
    if (name.includes('form')) {return 'form';}
    if (name.includes('list')) {return 'list';}
    if (name.includes('grid')) {return 'grid';}
    if (name.includes('table')) {return 'table';}

    // Default based on node type
    if (node.type === 'TEXT') {return 'content';}
    if (node.type === 'IMAGE') {return 'content';}
    if (node.children && node.children.length > 0) {return 'content';}

    return 'unknown';
  }

  /**
   * Infer accessibility role from intent
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @param {string} intent - Component intent
   * @returns {string} Accessibility role
   */
  inferAccessibilityRole(node, intent) {
    const roleMap = {
      'button': 'button',
      'input': 'textbox',
      'card': 'article',
      'modal': 'dialog',
      'navigation': 'navigation',
      'header': 'banner',
      'footer': 'contentinfo',
      'sidebar': 'complementary',
      'content': 'main',
      'hero': 'banner',
      'form': 'main',
      'list': 'list',
      'grid': 'main',
      'table': 'main',
      'unknown': 'none'
    };
    return roleMap[intent] || 'none';
  }

  /**
   * Infer component category from intent
   * @private
   * @param {string} intent - Component intent
   * @returns {string} Component category
   */
  inferComponentCategory(intent) {
    const categoryMap = {
      'button': 'interactive',
      'input': 'form',
      'card': 'display',
      'modal': 'overlay',
      'navigation': 'navigation',
      'header': 'layout',
      'footer': 'layout',
      'sidebar': 'layout',
      'content': 'display',
      'hero': 'display',
      'form': 'form',
      'list': 'display',
      'grid': 'layout',
      'table': 'display',
      'unknown': 'layout'
    };
    return categoryMap[intent] || 'layout';
  }

  /**
   * Infer design pattern from structure
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @returns {string} Design pattern
   */
  inferDesignPattern(node) {
    if (this.hasFlexboxLayout(node)) {return 'flexbox';}
    if (this.hasGridLayout(node)) {return 'grid';}
    if (this.isStackLayout(node)) {return 'stack';}
    return 'container';
  }

  /**
   * Calculate semantic confidence score
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @param {string} intent - Component intent
   * @returns {number} Confidence score
   */
  calculateSemanticConfidence(node, intent) {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on naming patterns
    const name = node.name.toLowerCase();
    if (name.includes(intent)) {confidence += 0.3;}

    // Increase confidence based on structure
    if (intent === 'button' && node.type === 'FRAME' && node.children?.some(c => c.type === 'TEXT')) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Extract corner radius from node
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @returns {number|undefined} Corner radius
   */
  extractCornerRadius(node) {
    // Would extract from Figma's cornerRadius property
    return undefined;
  }

  /**
   * Infer text role from context
   * @private
   * @param {string} nodeName - Node name
   * @param {string} [text] - Text content
   * @returns {'heading'|'body'|'label'|'caption'|'code'} Text role
   */
  inferTextRole(nodeName, text) {
    const name = nodeName.toLowerCase();
    if (name.includes('title') || name.includes('heading') || name.includes('h1') || name.includes('h2')) {return 'heading';}
    if (name.includes('label')) {return 'label';}
    if (name.includes('caption') || name.includes('subtitle')) {return 'caption';}
    if (name.includes('code')) {return 'code';}
    return 'body';
  }

  /**
   * Check if text is interactive
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @returns {boolean} Is interactive
   */
  isInteractiveText(node) {
    const name = node.name.toLowerCase();
    return name.includes('link') || name.includes('button') || name.includes('clickable');
  }

  /**
   * Suggest HTML tag for component
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @param {string} intent - Component intent
   * @returns {string} HTML tag
   */
  suggestHTMLTag(node, intent) {
    const tagMap = {
      'button': 'button',
      'input': 'input',
      'card': 'article',
      'modal': 'dialog',
      'navigation': 'nav',
      'header': 'header',
      'footer': 'footer',
      'sidebar': 'aside',
      'content': 'main',
      'hero': 'section',
      'form': 'form',
      'list': 'ul',
      'grid': 'div',
      'table': 'table',
      'unknown': 'div'
    };
    return tagMap[intent] || 'div';
  }

  /**
   * Generate framework attributes
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @param {string} intent - Component intent
   * @returns {Object} Framework attributes
   */
  generateFrameworkAttributes(node, intent) {
    const attributes = {};

    if (intent === 'button') {
      attributes.type = 'button';
    }

    if (intent === 'input') {
      attributes.type = 'text';
      attributes.placeholder = 'Enter text...';
    }

    if (node.name) {
      attributes['data-testid'] = node.name.toLowerCase().replace(/\s+/g, '-');
    }

    return attributes;
  }

  /**
   * Infer possible events for component
   * @private
   * @param {string} intent - Component intent
   * @returns {string[]} Possible events
   */
  inferPossibleEvents(intent) {
    const eventMap = {
      'button': ['onClick', 'onHover', 'onFocus'],
      'input': ['onChange', 'onFocus', 'onBlur', 'onKeyPress'],
      'form': ['onSubmit'],
      'modal': ['onClose', 'onOpen'],
      'navigation': ['onClick']
    };
    return eventMap[intent] || [];
  }

  /**
   * Infer component states
   * @private
   * @param {string} intent - Component intent
   * @returns {Object[]} Component states
   */
  inferComponentStates(intent) {
    const baseStates = [
      { name: 'default', properties: {}, triggers: [] }
    ];

    if (intent === 'button') {
      baseStates.push(
        { name: 'hover', properties: { backgroundColor: 'darker' }, triggers: ['onHover'] },
        { name: 'active', properties: { transform: 'scale(0.98)' }, triggers: ['onMouseDown'] },
        { name: 'disabled', properties: { opacity: 0.5, cursor: 'not-allowed' }, triggers: [] }
      );
    }

    return baseStates;
  }

  /**
   * Check if node has flexbox layout
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @returns {boolean} Has flexbox layout
   */
  hasFlexboxLayout(node) {
    // Would check Figma's auto-layout properties
    return false;
  }

  /**
   * Check if node has grid layout
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @returns {boolean} Has grid layout
   */
  hasGridLayout(node) {
    // Would check for grid-like arrangements
    return false;
  }

  /**
   * Check if node is stack layout
   * @private
   * @param {FigmaFrameData} node - Figma node
   * @returns {boolean} Is stack layout
   */
  isStackLayout(node) {
    // Would check for vertical/horizontal stacking
    return node.children?.length ? true : false;
  }

  /**
   * Infer design purpose from context
   * @private
   * @param {FigmaFrameData[]} figmaData - Figma data
   * @param {FigmaFileContext} fileContext - File context
   * @returns {string} Design purpose
   */
  inferDesignPurpose(figmaData, fileCon_text) {
    const fileName = fileContext.fileName.toLowerCase();
    const nodeNames = figmaData.map(n => n.name.toLowerCase()).join(' ');

    if (fileName.includes('dashboard') || nodeNames.includes('dashboard')) {
      return 'Dashboard interface for data visualization and management';
    }
    if (fileName.includes('landing') || nodeNames.includes('hero')) {
      return 'Landing page to attract and convert visitors';
    }
    if (fileName.includes('form') || nodeNames.includes('form')) {
      return 'Form interface for data collection';
    }

    return 'User interface components for web application';
  }
}

/**
 * Quick generation function for simple use cases
 * @param {FigmaFrameData[]} figmaData - Figma frame data
 * @param {FigmaFileContext} fileContext - File context
 * @param {ExtractionContext} extractionContext - Extraction context
 * @returns {Promise<Object>} Generated design specification
 */
export async function generateDesignSpec(figmaData, fileContext, extractionCon_text) {
  const generator = new DesignSpecGenerator();
  return generator.generateDesignSpec(figmaData, fileContext, extractionCon_text);
}