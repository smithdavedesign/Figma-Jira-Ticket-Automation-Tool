/**
 * Figma Data Extractor Implementation
 *
 * Core implementation for extracting metadata, assets, and design tokens from Figma designs.
 * Simplified JavaScript version focusing on essential functionality.
 */

export class FigmaDataExtractor {
  constructor(figmaApiKey, performanceMonitor, cache, validator) {
    this.figmaApiKey = figmaApiKey;
    this.performanceMonitor = performanceMonitor;
    this.cache = cache;
    this.validator = validator;
    this.baseUrl = 'https://api.figma.com/v1';
  }

  /**
   * Extract complete data from a Figma file or specific nodes
   */
  async extract(params) {
    const timerId = this.performanceMonitor?.startTimer('figma_extraction');

    try {
      const { fileKey, nodeIds, options } = params;

      // Get Figma file data
      const figmaData = await this.fetchFigmaData(fileKey, nodeIds);

      // Extract metadata
      const metadata = await this.extractMetadata(figmaData, options?.metadata);

      // Extract design tokens
      const designTokens = await this.extractDesignTokens(fileKey, options?.tokens);

      // Extract assets
      const assets = await this.extractAssets(nodeIds || [], options?.assets);

      // Generate code hints
      const codeHints = await this.generateCodeHints(metadata, options?.codeGeneration);

      const result = {
        metadata,
        assets,
        designTokens,
        codeHints,
        validation: { valid: true, errors: [], warnings: [] },
        performance: this.getPerformanceMetrics(),
        extractedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      // Validate result
      if (this.validator) {
        const validation = await this.validator.validate(result);
        result.validation = validation;
      }

      return result;

    } catch (error) {
      console.error('Extraction failed:', error);
      return {
        metadata: [],
        assets: [],
        designTokens: {},
        codeHints: [],
        validation: {
          valid: false,
          errors: [error.message || 'Unknown extraction error'],
          warnings: []
        },
        performance: this.getPerformanceMetrics(),
        extractedAt: new Date().toISOString(),
        version: '1.0.0'
      };
    } finally {
      this.performanceMonitor?.endTimer(timerId);
    }
  }

  /**
   * Extract metadata from Figma nodes
   */
  async extractMetadata(figmaData, options = {}) {
    const metadata = [];

    if (!figmaData?.document) {
      return metadata;
    }

    // Recursively process nodes
    const processNode = (node, depth = 0) => {
      const nodeMetadata = {
        id: node.id,
        name: node.name,
        type: node.type,
        depth,
        bounds: node.absoluteBoundingBox || null,
        visible: node.visible !== false,
        locked: node.locked || false,
        exportSettings: node.exportSettings || [],
        styles: this.extractNodeStyles(node),
        children: [],
        componentId: node.componentId || null,
        instanceId: node.instanceId || null,
        masterComponent: node.masterComponent || null
      };

      // Process children recursively
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          const childMetadata = processNode(child, depth + 1);
          nodeMetadata.children.push(childMetadata);
        }
      }

      return nodeMetadata;
    };

    // Process document children
    if (figmaData.document.children) {
      for (const child of figmaData.document.children) {
        metadata.push(processNode(child));
      }
    }

    return metadata;
  }

  /**
   * Extract design tokens from Figma variables
   */
  async extractDesignTokens(fileKey, options = {}) {
    try {
      const cacheKey = `tokens_${fileKey}`;

      // Check cache first
      if (this.cache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {return cached;}
      }

      // Fetch variables from Figma API
      const response = await fetch(`${this.baseUrl}/files/${fileKey}/variables/local`, {
        headers: {
          'X-Figma-Token': this.figmaApiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.status}`);
      }

      const data = await response.json();

      const tokens = {
        colors: {},
        typography: {},
        spacing: {},
        borders: {},
        shadows: {},
        raw: data
      };

      // Process variables into design tokens
      if (data.meta?.variableCollections) {
        for (const collection of Object.values(data.meta.variableCollections)) {
          if (data.meta.variables) {
            for (const variable of Object.values(data.meta.variables)) {
              if (variable.variableCollectionId === collection.id) {
                this.categorizeToken(tokens, variable, collection);
              }
            }
          }
        }
      }

      // Cache the result
      if (this.cache) {
        await this.cache.set(cacheKey, tokens, 3600); // 1 hour TTL
      }

      return tokens;

    } catch (error) {
      console.error('Failed to extract design tokens:', error);
      return {
        colors: {},
        typography: {},
        spacing: {},
        borders: {},
        shadows: {},
        error: error.message
      };
    }
  }

  /**
   * Extract assets from nodes
   */
  async extractAssets(nodeIds, options = {}) {
    if (!nodeIds || nodeIds.length === 0) {
      return [];
    }

    try {
      // This would typically export assets from Figma
      // For now, return placeholder structure
      return nodeIds.map(nodeId => ({
        nodeId,
        type: 'image',
        format: options.format || 'png',
        scale: options.scale || 1,
        url: null, // Would be populated by actual export
        size: null,
        extractedAt: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Failed to extract assets:', error);
      return [];
    }
  }

  /**
   * Generate code hints based on design analysis
   */
  async generateCodeHints(metadata, options = {}) {
    const hints = [];

    for (const node of metadata) {
      const hint = {
        nodeId: node.id,
        nodeName: node.name,
        suggestions: [],
        framework: options.framework || 'react',
        complexity: this.assessComplexity(node),
        patterns: this.identifyPatterns(node)
      };

      // Add specific suggestions based on node type
      switch (node.type) {
      case 'COMPONENT':
        hint.suggestions.push('Create reusable component');
        if (node.componentId) {
          hint.suggestions.push('Use design system component');
        }
        break;
      case 'INSTANCE':
        hint.suggestions.push('Instance of design system component');
        break;
      case 'TEXT':
        hint.suggestions.push('Use typography design tokens');
        break;
      case 'RECTANGLE':
      case 'ELLIPSE':
        hint.suggestions.push('Consider using CSS properties');
        break;
      }

      hints.push(hint);
    }

    return hints;
  }

  /**
   * Fetch data from Figma API
   */
  async fetchFigmaData(fileKey, nodeIds) {
    const url = nodeIds && nodeIds.length > 0
      ? `${this.baseUrl}/files/${fileKey}?ids=${nodeIds.join(',')}`
      : `${this.baseUrl}/files/${fileKey}`;

    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': this.figmaApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Extract styles from a Figma node
   */
  extractNodeStyles(node) {
    const styles = {};

    if (node.fills && Array.isArray(node.fills)) {
      styles.fills = node.fills;
    }

    if (node.strokes && Array.isArray(node.strokes)) {
      styles.strokes = node.strokes;
    }

    if (node.effects && Array.isArray(node.effects)) {
      styles.effects = node.effects;
    }

    if (node.cornerRadius !== undefined) {
      styles.cornerRadius = node.cornerRadius;
    }

    if (node.style) {
      styles.textStyle = node.style;
    }

    return styles;
  }

  /**
   * Categorize a design token based on its properties
   */
  categorizeToken(tokens, variable, collection) {
    const name = variable.name;
    const value = variable.valuesByMode?.[Object.keys(variable.valuesByMode)[0]];

    if (!value) {return;}

    // Color tokens
    if (variable.resolvedType === 'COLOR') {
      tokens.colors[name] = {
        value: this.formatColorValue(value),
        collection: collection.name,
        id: variable.id
      };
    }
    // Number tokens (spacing, sizes, etc.)
    else if (variable.resolvedType === 'FLOAT') {
      if (name.toLowerCase().includes('spacing') || name.toLowerCase().includes('gap')) {
        tokens.spacing[name] = {
          value: `${value}px`,
          collection: collection.name,
          id: variable.id
        };
      }
    }
    // String tokens (could be typography, etc.)
    else if (variable.resolvedType === 'STRING') {
      tokens.typography[name] = {
        value: value,
        collection: collection.name,
        id: variable.id
      };
    }
  }

  /**
   * Format color value for design tokens
   */
  formatColorValue(colorValue) {
    if (typeof colorValue === 'string') {return colorValue;}

    if (colorValue.r !== undefined) {
      const r = Math.round(colorValue.r * 255);
      const g = Math.round(colorValue.g * 255);
      const b = Math.round(colorValue.b * 255);
      const a = colorValue.a !== undefined ? colorValue.a : 1;

      return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    return colorValue;
  }

  /**
   * Assess the complexity of a node for code generation
   */
  assessComplexity(node) {
    let complexity = 0;

    if (node.children && node.children.length > 0) {
      complexity += node.children.length * 0.5;
    }

    if (node.styles && Object.keys(node.styles).length > 3) {
      complexity += 1;
    }

    if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      complexity += 1;
    }

    return complexity < 2 ? 'simple' : complexity < 5 ? 'medium' : 'complex';
  }

  /**
   * Identify common design patterns in a node
   */
  identifyPatterns(node) {
    const patterns = [];

    if (node.type === 'COMPONENT') {
      patterns.push('design-system-component');
    }

    if (node.children && node.children.length > 0) {
      const hasText = node.children.some(child => child.type === 'TEXT');
      const hasImages = node.children.some(child => child.type === 'RECTANGLE' && child.fills);

      if (hasText && hasImages) {
        patterns.push('card-pattern');
      } else if (hasText) {
        patterns.push('text-content');
      }
    }

    return patterns;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMonitor?.getMetrics() || {
      totalTime: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}