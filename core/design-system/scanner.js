/**
 * Design System Scanner
 *
 * Automatically detects and analyzes design systems within Figma files.
 * Scans pages, styles, and components to build a comprehensive design system map.
 */

/**
 * @typedef {Object} DesignSystem
 * @property {string} id - Design system identifier
 * @property {string} name - Design system name
 * @property {any[]} pages - Design system pages
 * @property {any[]} colors - Color tokens
 * @property {any[]} typography - Typography tokens
 * @property {any} components - Component library
 * @property {any[]} spacing - Spacing tokens
 * @property {any[]} effects - Effect tokens
 * @property {number} detectionConfidence - Detection confidence score
 */

export class DesignSystemScanner {
  constructor() {
    this.file = figma.root;
    this.designSystem = null;
  }

  /**
   * Main entry point for design system detection
   * Scans the entire file and builds a design system object
   * @returns {Promise<DesignSystem|null>} Detected design system or null
   */
  async scanDesignSystem() {
    try {
      console.log('🔍 Starting design system scan...');

      // Add timeout to prevent freezing
      const startTime = Date.now();
      const maxDuration = 10000; // 10 seconds max

      // Step 1: Detect design system pages (quick)
      const designSystemPages = await this.detectDesignSystemPages();

      if (Date.now() - startTime > maxDuration) {
        console.warn('⏰ Scan timeout - returning partial results');
        return null;
      }

      // Step 2: Extract style tokens (quick)
      const colorTokens = await this.extractColorTokens();
      const typographyTokens = await this.extractTypographyTokens();
      const effectTokens = await this.extractEffectTokens();

      if (Date.now() - startTime > maxDuration) {
        console.warn('⏰ Scan timeout - returning partial results');
        return null;
      }

      // Step 3: Build component library (potentially slow)
      const componentLibrary = await this.buildComponentLibrary(designSystemPages);

      // Step 4: Extract spacing tokens (derived from components)
      const spacingTokens = this.extractSpacingTokens();

      // Build design system object
      const data = {
        id: this.generateDesignSystemId(),
        name: this.deriveDesignSystemName(designSystemPages),
        pages: designSystemPages,
        colors: colorTokens,
        typography: typographyTokens,
        components: componentLibrary,
        spacing: spacingTokens,
        effects: effectTokens,
        detectionConfidence: 0
      };

      // Calculate confidence score
      data.detectionConfidence = this.calculateConfidence(data);

      this.designSystem = data;
      console.log('✅ Design system scan complete:', data.name, `(${Math.round(data.detectionConfidence * 100)}% confidence)`);

      return data;
    } catch (error) {
      console.error('❌ Error scanning design system:', error);
      return null;
    }
  }

  /**
   * Get the currently detected design system
   * @returns {DesignSystem|null} Current design system
   */
  getDesignSystem() {
    return this.designSystem;
  }

  /**
   * Generate unique design system ID
   * @private
   * @returns {string} Design system ID
   */
  generateDesignSystemId() {
    return `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect pages that contain design system components
   * @private
   * @returns {Promise<any[]>} Design system pages
   */
  async detectDesignSystemPages() {
    const pages = [];

    try {
      // Scan all pages in the file
      for (const page of this.file.children) {
        if (page.type === 'PAGE') {
          const pageData = {
            id: page.id,
            name: page.name,
            confidence: 0,
            componentCount: 0,
            styleCount: 0,
            isDesignSystemPage: false
          };

          // Check if page name suggests design system
          const dsKeywords = ['design system', 'components', 'ui kit', 'library', 'tokens', 'styles'];
          const pageName = page.name.toLowerCase();

          for (const keyword of dsKeywords) {
            if (pageName.includes(keyword)) {
              pageData.confidence += 0.3;
              pageData.isDesignSystemPage = true;
              break;
            }
          }

          // Count components on this page
          let componentCount = 0;
          const scanNode = (node) => {
            if (node.type === 'COMPONENT') {
              componentCount++;
            }
            if ('children' in node && node.children) {
              for (const child of node.children) {
                scanNode(child);
              }
            }
          };

          for (const child of page.children) {
            scanNode(child);
          }

          pageData.componentCount = componentCount;

          // Higher component density suggests design system page
          if (componentCount > 5) {
            pageData.confidence += 0.4;
            pageData.isDesignSystemPage = true;
          } else if (componentCount > 2) {
            pageData.confidence += 0.2;
          }

          // If this looks like a design system page, include it
          if (pageData.isDesignSystemPage || pageData.confidence > 0.3) {
            pages.push(pageData);
          }
        }
      }

      // Sort by confidence
      pages.sort((a, b) => b.confidence - a.confidence);

    } catch (error) {
      console.warn('Error detecting design system pages:', error);
    }

    return pages;
  }

  /**
   * Extract color tokens from local styles
   * @private
   * @returns {Promise<any[]>} Color tokens
   */
  async extractColorTokens() {
    const colorTokens = [];

    try {
      const localPaintStyles = figma.getLocalPaintStyles();

      for (const style of localPaintStyles) {
        if (style.paints && style.paints.length > 0) {
          const paint = style.paints[0];
          if (paint.type === 'SOLID') {
            colorTokens.push({
              id: style.id,
              name: style.name,
              description: style.description || '',
              value: {
                r: paint.color.r,
                g: paint.color.g,
                b: paint.color.b
              },
              opacity: paint.opacity || 1,
              type: 'color',
              category: this.categorizeColorToken(style.name),
              usage: []
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error extracting color tokens:', error);
    }

    return colorTokens;
  }

  /**
   * Extract typography tokens from local text styles
   * @private
   * @returns {Promise<any[]>} Typography tokens
   */
  async extractTypographyTokens() {
    const typographyTokens = [];

    try {
      const localTextStyles = figma.getLocalTextStyles();

      for (const style of localTextStyles) {
        typographyTokens.push({
          id: style.id,
          name: style.name,
          description: style.description || '',
          fontFamily: style.fontName ? style.fontName.family : 'Unknown',
          fontWeight: style.fontName ? style.fontName.style : 'Regular',
          fontSize: style.fontSize || 16,
          lineHeight: style.lineHeight || { value: 1.2, unit: 'AUTO' },
          letterSpacing: style.letterSpacing || { value: 0, unit: 'PIXELS' },
          textCase: style.textCase || 'ORIGINAL',
          type: 'typography',
          category: this.categorizeTypographyToken(style.name),
          usage: []
        });
      }
    } catch (error) {
      console.warn('Error extracting typography tokens:', error);
    }

    return typographyTokens;
  }

  /**
   * Extract effect tokens from local effect styles
   * @private
   * @returns {Promise<any[]>} Effect tokens
   */
  async extractEffectTokens() {
    const effectTokens = [];

    try {
      const localEffectStyles = figma.getLocalEffectStyles();

      for (const style of localEffectStyles) {
        effectTokens.push({
          id: style.id,
          name: style.name,
          description: style.description || '',
          effects: style.effects || [],
          type: 'effect',
          category: this.categorizeEffectToken(style.name),
          usage: []
        });
      }
    } catch (error) {
      console.warn('Error extracting effect tokens:', error);
    }

    return effectTokens;
  }

  /**
   * Extract spacing tokens from component analysis
   * @private
   * @returns {any[]} Spacing tokens
   */
  extractSpacingTokens() {
    const spacingTokens = [];

    // Common spacing values (8px grid system)
    const commonSpacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128];

    for (const spacing of commonSpacing) {
      spacingTokens.push({
        id: `spacing-${spacing}`,
        name: `spacing-${spacing}px`,
        value: spacing,
        type: 'spacing',
        unit: 'px',
        category: spacing <= 8 ? 'tight' : spacing <= 24 ? 'normal' : 'loose',
        usage: []
      });
    }

    return spacingTokens;
  }

  /**
   * Build component library from design system pages
   * @private
   * @param {any[]} pages - Design system pages
   * @returns {Promise<any>} Component library
   */
  async buildComponentLibrary(pages) {
    const componentLibrary = {
      components: [],
      categories: new Set(),
      totalComponents: 0
    };

    try {
      for (const page of pages) {
        // Find the actual page node
        const pageNode = this.file.children.find(p => p.id === page.id);
        if (!pageNode) {continue;}

        const scanForComponents = (node) => {
          if (node.type === 'COMPONENT') {
            const category = this.categorizeComponent(node.name);
            componentLibrary.categories.add(category);

            componentLibrary.components.push({
              id: node.id,
              name: node.name,
              description: node.description || '',
              category,
              width: node.width,
              height: node.height,
              pageId: page.id,
              instances: 0, // Would need to scan entire file to count
              type: 'component'
            });

            componentLibrary.totalComponents++;
          }

          if ('children' in node && node.children) {
            for (const child of node.children) {
              scanForComponents(child);
            }
          }
        };

        for (const child of pageNode.children) {
          scanForComponents(child);
        }
      }

      componentLibrary.categories = Array.from(componentLibrary.categories);

    } catch (error) {
      console.warn('Error building component library:', error);
    }

    return componentLibrary;
  }

  /**
   * Calculate design system detection confidence
   * @private
   * @param {any} data - Design system data
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(data) {
    let confidence = 0;

    // Pages contribute to confidence
    if (data.pages.length > 0) {
      confidence += 0.3;
      // Bonus for explicitly named design system pages
      if (data.pages.some(p => p.name.toLowerCase().includes('design system'))) {
        confidence += 0.2;
      }
    }

    // Style tokens contribute
    if (data.colors.length > 5) {confidence += 0.2;}
    if (data.typography.length > 3) {confidence += 0.15;}
    if (data.effects.length > 2) {confidence += 0.1;}

    // Component library contributes
    if (data.components.totalComponents > 10) {confidence += 0.3;}
    else if (data.components.totalComponents > 5) {confidence += 0.2;}
    else if (data.components.totalComponents > 2) {confidence += 0.1;}

    // Component categories contribute
    if (data.components.categories.length > 3) {confidence += 0.1;}

    return Math.min(confidence, 1.0);
  }

  /**
   * Derive design system name from detected pages
   * @private
   * @param {any[]} pages - Design system pages
   * @returns {string} Design system name
   */
  deriveDesignSystemName(pages) {
    if (pages.length === 0) {return 'Detected Design System';}

    // Use the highest confidence page name
    const topPage = pages[0];
    if (topPage.name && topPage.name.toLowerCase().includes('design system')) {
      return topPage.name;
    }

    return 'Design System';
  }

  /**
   * Categorize color token by name
   * @private
   * @param {string} name - Color token name
   * @returns {string} Color category
   */
  categorizeColorToken(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('primary') || nameLower.includes('brand')) {return 'primary';}
    if (nameLower.includes('secondary')) {return 'secondary';}
    if (nameLower.includes('success') || nameLower.includes('green')) {return 'success';}
    if (nameLower.includes('warning') || nameLower.includes('yellow')) {return 'warning';}
    if (nameLower.includes('error') || nameLower.includes('danger') || nameLower.includes('red')) {return 'error';}
    if (nameLower.includes('neutral') || nameLower.includes('gray') || nameLower.includes('grey')) {return 'neutral';}
    return 'other';
  }

  /**
   * Categorize typography token by name
   * @private
   * @param {string} name - Typography token name
   * @returns {string} Typography category
   */
  categorizeTypographyToken(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('h1') || nameLower.includes('heading') || nameLower.includes('title')) {return 'heading';}
    if (nameLower.includes('body') || nameLower.includes('paragraph')) {return 'body';}
    if (nameLower.includes('caption') || nameLower.includes('small')) {return 'caption';}
    if (nameLower.includes('label')) {return 'label';}
    if (nameLower.includes('code') || nameLower.includes('mono')) {return 'code';}
    return 'other';
  }

  /**
   * Categorize effect token by name
   * @private
   * @param {string} name - Effect token name
   * @returns {string} Effect category
   */
  categorizeEffectToken(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('shadow')) {return 'shadow';}
    if (nameLower.includes('blur')) {return 'blur';}
    if (nameLower.includes('glow')) {return 'glow';}
    return 'other';
  }

  /**
   * Categorize component by name
   * @private
   * @param {string} name - Component name
   * @returns {string} Component category
   */
  categorizeComponent(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('button')) {return 'buttons';}
    if (nameLower.includes('input') || nameLower.includes('field') || nameLower.includes('form')) {return 'forms';}
    if (nameLower.includes('card')) {return 'cards';}
    if (nameLower.includes('modal') || nameLower.includes('dialog')) {return 'overlays';}
    if (nameLower.includes('nav') || nameLower.includes('menu')) {return 'navigation';}
    if (nameLower.includes('icon')) {return 'icons';}
    if (nameLower.includes('badge') || nameLower.includes('tag') || nameLower.includes('chip')) {return 'indicators';}
    return 'other';
  }
}