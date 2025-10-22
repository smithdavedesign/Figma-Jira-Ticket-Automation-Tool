/**
 * Figma Data Extractor Implementation
 * 
 * Core implementation of the FigmaExtractor interface for extracting
 * metadata, assets, and design tokens from Figma designs.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  FigmaExtractor,
  ExtractionParams,
  MetadataOptions,
  TokenExtractionOptions,
  AssetExtractionOptions,
  CodeGenerationOptions,
  PerformanceMonitor,
  DataCache,
  DataValidator
} from './interfaces.js';

import type {
  FigmaNodeMetadata,
  AssetMetadata,
  DesignTokens,
  CodeGenerationHints,
  ValidationResult,
  PerformanceMetrics,
  ExtractionResult
} from './types.js';

/**
 * Main implementation of the Figma data extractor
 */
export class FigmaDataExtractor implements FigmaExtractor {
  private performanceMonitor: PerformanceMonitor;
  private cache: DataCache;
  private validator: DataValidator;
  private figmaApiKey: string;
  private baseUrl: string = 'https://api.figma.com/v1';

  constructor(
    figmaApiKey: string,
    performanceMonitor: PerformanceMonitor,
    cache: DataCache,
    validator: DataValidator
  ) {
    this.figmaApiKey = figmaApiKey;
    this.performanceMonitor = performanceMonitor;
    this.cache = cache;
    this.validator = validator;
  }

  /**
   * Extract complete data from a Figma file or specific nodes
   */
  /**
   * Enhanced extraction with hierarchical support
   * This method provides comprehensive extraction including component instances,
   * design system links, and export screenshots as shown in the user's example
   */
  async extractWithHierarchy(
    fileKey: string,
    nodeIds?: string[],
    options?: ExtractionParams['options']
  ): Promise<ExtractionResult> {
    const timerId = this.performanceMonitor.startTimer('extract_with_hierarchy');
    
    try {
      // Get Figma file data
      const figmaData = await this.fetchFigmaData(fileKey, nodeIds);
      
      // Extract enhanced metadata with hierarchy
      const metadata = await this.extractEnhancedMetadata(figmaData, options);
      
      // Extract design tokens
      const designTokens = await this.extractDesignTokens(fileKey, options?.tokens);
      
      // Extract assets
      const assets = await this.extractAssets(nodeIds || [], options?.assets);
      
      // Generate code hints
      const codeGeneration = await this.generateCodeHints(metadata, options?.codeGeneration);
      
      // Generate export screenshots if requested
      const screenshots = await this.generateExportScreenshots(metadata, options);
      
      // Build result with enhanced data
      const result: ExtractionResult = {
        metadata: metadata.map(m => ({
          ...m,
          exportScreenshots: screenshots.filter(s => s.nodeId === m.id)
        })),
        assets,
        designTokens,
        codeGeneration,
        validation: { valid: true, errors: [], warnings: [] },
        performance: this.getPerformanceMetrics(),
        extractedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      // Validate result
      const validation = await this.validateExtraction(result);
      result.validation = validation;
      
      this.performanceMonitor.endTimer(timerId);
      return result;
      
    } catch (error) {
      this.performanceMonitor.endTimer(timerId);
      throw error;
    }
  }

  /**
   * Extract enhanced metadata with hierarchy information
   */
  private async extractEnhancedMetadata(
    figmaData: any,
    options?: ExtractionParams['options']
  ): Promise<FigmaNodeMetadata[]> {
    const metadata: FigmaNodeMetadata[] = [];
    
    // Process document structure
    if (figmaData.document && figmaData.document.children) {
      for (const page of figmaData.document.children) {
        if (page.children) {
          for (const frame of page.children) {
            const frameMetadata = await this.processNodeWithHierarchy(frame, options, 0);
            metadata.push(frameMetadata);
          }
        }
      }
    }
    
    return metadata;
  }

  /**
   * Process node with enhanced hierarchy support
   */
  private async processNodeWithHierarchy(
    node: any,
    options?: ExtractionParams['options'],
    depth: number = 0
  ): Promise<FigmaNodeMetadata> {
    // Extract base metadata
    const baseMetadata = this.extractBaseNodeMetadata(node);
    
    // Build hierarchy information
    const hierarchy = await this.buildNodeHierarchy(node, depth);
    
    // Extract component instance properties
    const componentProperties = this.extractComponentProperties(node);
    
    // Extract design system links
    const designSystemLinks = await this.extractDesignSystemLinks(node, options);
    
    // Process children recursively
    const children: FigmaNodeMetadata[] = [];
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const childMetadata = await this.processNodeWithHierarchy(child, options, depth + 1);
        children.push(childMetadata);
      }
    }
    
    return {
      ...baseMetadata,
      hierarchy,
      ...(componentProperties && { componentProperties }),
      ...(designSystemLinks && { designSystemLinks }),
      children: children.length > 0 ? children : [],
      mcpMetadata: {
        extractedAt: new Date().toISOString(),
        componentType: this.inferComponentType(node),
        designTokens: await this.extractNodeDesignTokens(node),
        semanticRole: this.inferSemanticRole(node),
        interactionStates: this.extractInteractionStates(node),
        accessibilityInfo: this.extractAccessibilityInfo(node),
        codeGeneration: this.generateNodeCodeHints(node),
        ...(options?.projectContext && { projectContext: options.projectContext }),
        ...(options?.userContext && { userContext: options.userContext }),
        ...(options?.technicalContext && { technicalContext: options.technicalContext })
      }
    };
  }

  /**
   * Build node hierarchy information
   */
  private async buildNodeHierarchy(node: any, depth: number): Promise<import('./types.js').NodeHierarchy> {
    const layers: import('./types.js').LayerInfo[] = [];
    let componentCount = 0;
    let textLayerCount = 0;
    
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const layerInfo = await this.buildLayerInfo(child);
        layers.push(layerInfo);
        
        if (child.type === 'COMPONENT' || child.type === 'COMPONENT_INSTANCE') {
          componentCount++;
        }
        if (child.type === 'TEXT') {
          textLayerCount++;
        }
      }
    }
    
    return {
      layers,
      totalDepth: depth,
      componentCount,
      textLayerCount
    };
  }

  /**
   * Build layer information for hierarchy
   */
  private async buildLayerInfo(node: any): Promise<import('./types.js').LayerInfo> {
    const children: import('./types.js').LayerInfo[] = [];
    
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const childLayer = await this.buildLayerInfo(child);
        children.push(childLayer);
      }
    }
    
    return {
      id: node.id || '',
      name: node.name || '',
      type: node.type || 'FRAME',
      description: node.description,
      position: {
        x: node.absoluteBoundingBox?.x || 0,
        y: node.absoluteBoundingBox?.y || 0
      },
      size: {
        width: node.absoluteBoundingBox?.width || 0,
        height: node.absoluteBoundingBox?.height || 0
      },
      components: this.extractUsedComponents(node),
      ...(children.length > 0 && { children })
    };
  }

  /**
   * Extract component instance properties
   */
  private extractComponentProperties(node: any): import('./types.js').ComponentInstanceProps | undefined {
    if (node.type !== 'COMPONENT_INSTANCE') {
      return undefined;
    }
    
    return {
      masterComponentId: node.masterComponentId,
      componentSetId: node.componentSetId,
      props: node.componentProperties || {},
      overrides: this.extractComponentOverrides(node),
      variantProperties: node.variantProperties || {}
    };
  }

  /**
   * Extract component property overrides
   */
  private extractComponentOverrides(node: any): import('./types.js').ComponentOverride[] {
    const overrides: import('./types.js').ComponentOverride[] = [];
    
    if (node.overrides && Array.isArray(node.overrides)) {
      for (const override of node.overrides) {
        overrides.push({
          nodeId: override.id || '',
          propertyName: override.property || '',
          value: override.value,
          type: this.inferOverrideType(override)
        });
      }
    }
    
    return overrides;
  }

  /**
   * Extract design system links
   */
  private async extractDesignSystemLinks(
    node: any,
    options?: ExtractionParams['options']
  ): Promise<import('./types.js').DesignSystemLinks | undefined> {
    const links: import('./types.js').DesignSystemLinks = {};
    
    // Look for design system references in node name and styles
    if (node.name) {
      if (node.name.toLowerCase().includes('button')) {
        links.buttons = 'design-system/buttons';
      }
      if (node.name.toLowerCase().includes('text') || node.type === 'TEXT') {
        links.typography = 'design-system/typography';
      }
    }
    
    // Extract color references
    if (node.fills && Array.isArray(node.fills)) {
      links.colors = 'design-system/colors';
    }
    
    // Extract spacing references
    if (node.layoutMode) {
      links.spacing = 'design-system/spacing';
    }
    
    return Object.keys(links).length > 0 ? links : undefined;
  }

  /**
   * Generate export screenshots
   */
  private async generateExportScreenshots(
    metadata: FigmaNodeMetadata[],
    options?: ExtractionParams['options']
  ): Promise<import('./types.js').ExportScreenshot[]> {
    const screenshots: import('./types.js').ExportScreenshot[] = [];
    
    if (!options?.includeScreenshots) {
      return screenshots;
    }
    
    for (const node of metadata) {
      // This would integrate with Figma API to generate actual screenshots
      // For now, we'll create placeholder entries
      screenshots.push({
        nodeId: node.id,
        url: `https://figma.com/screenshots/${node.id}.png`,
        format: 'PNG',
        scale: 2,
        resolution: 'high',
        timestamp: new Date().toISOString()
      });
    }
    
    return screenshots;
  }

  /**
   * Extract layer-specific design tokens
   */
  private async extractLayerTokens(node: any): Promise<import('./types.js').LayerTokens | undefined> {
    const tokens: import('./types.js').LayerTokens = {};
    
    // Extract colors
    if (node.fills && Array.isArray(node.fills)) {
      tokens.colors = node.fills.map((fill: any) => fill.color?.hex || '').filter(Boolean);
    }
    
    // Extract spacing
    if (node.paddingLeft || node.paddingTop || node.paddingRight || node.paddingBottom) {
      tokens.spacing = {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
      };
    }
    
    // Extract typography
    if (node.style && node.type === 'TEXT') {
      tokens.typography = `${node.style.fontFamily}-${node.style.fontSize}`;
    }
    
    return Object.keys(tokens).length > 0 ? tokens : undefined;
  }

  /**
   * Extract components used in this node
   */
  private extractUsedComponents(node: any): string[] {
    const components: string[] = [];
    
    if (node.type === 'COMPONENT_INSTANCE' && node.masterComponentId) {
      components.push(node.name || node.masterComponentId);
    }
    
    return components;
  }

  /**
   * Infer override type from override data
   */
  private inferOverrideType(override: any): import('./types.js').ComponentOverride['type'] {
    if (override.property?.includes('text')) return 'TEXT';
    if (override.property?.includes('fill')) return 'FILL';
    if (override.property?.includes('stroke')) return 'STROKE';
    if (override.property?.includes('effect')) return 'EFFECT';
    if (override.property?.includes('visible')) return 'VISIBILITY';
    return 'TEXT'; // Default
  }

  /**
   * Extract base node metadata
   */
  private extractBaseNodeMetadata(node: any): Omit<FigmaNodeMetadata, 'hierarchy' | 'componentProperties' | 'designSystemLinks' | 'exportScreenshots' | 'mcpMetadata'> {
    return {
      id: node.id || '',
      name: node.name || '',
      type: node.type || 'FRAME',
      visible: node.visible !== false,
      locked: node.locked === true,
      absoluteBoundingBox: node.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 },
      relativeTransform: node.relativeTransform || [[1, 0, 0], [0, 1, 0]],
      constraints: node.constraints || { horizontal: 'LEFT', vertical: 'TOP' },
      fills: node.fills,
      strokes: node.strokes,
      strokeWeight: node.strokeWeight,
      strokeAlign: node.strokeAlign,
      cornerRadius: node.cornerRadius,
      effects: node.effects,
      blendMode: node.blendMode,
      opacity: node.opacity,
      preserveRatio: node.preserveRatio,
      layoutAlign: node.layoutAlign,
      layoutGrow: node.layoutGrow,
      layoutSizingHorizontal: node.layoutSizingHorizontal,
      layoutSizingVertical: node.layoutSizingVertical,
      exportSettings: node.exportSettings,
      children: undefined // Will be populated by the calling method
    };
  }

  /**
   * Fetch Figma data from API
   */
  private async fetchFigmaData(fileKey: string, nodeIds?: string[]): Promise<any> {
    let url = `${this.baseUrl}/files/${fileKey}`;
    
    if (nodeIds && nodeIds.length > 0) {
      url += `?ids=${nodeIds.join(',')}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': this.figmaApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Infer component type from node data
   */
  private inferComponentType(node: any): import('./types.js').ComponentType {
    if (node.type === 'COMPONENT_INSTANCE') return 'molecule';
    if (node.type === 'TEXT') return 'typography';
    if (node.name?.toLowerCase().includes('button')) return 'button';
    if (node.name?.toLowerCase().includes('input')) return 'input';
    if (node.name?.toLowerCase().includes('card')) return 'card';
    if (node.name?.toLowerCase().includes('modal')) return 'modal';
    if (node.name?.toLowerCase().includes('nav')) return 'navigation';
    return 'layout';
  }

  /**
   * Extract node-specific design tokens
   */
  private async extractNodeDesignTokens(node: any): Promise<import('./types.js').DesignTokens> {
    const tokens: import('./types.js').DesignTokens = {};
    
    // Extract colors from fills
    if (node.fills && Array.isArray(node.fills)) {
      const colors: Record<string, string> = {};
      node.fills.forEach((fill: any, index: number) => {
        if (fill.color) {
          const hex = this.rgbToHex(fill.color);
          colors[`fill-${index}`] = hex;
        }
      });
      tokens.colors = colors;
    }
    
    // Extract typography for text nodes
    if (node.type === 'TEXT' && node.style) {
      tokens.typography = {
        [`${node.name || 'text'}`]: {
          fontFamily: node.style.fontFamily || 'Inter',
          fontSize: node.style.fontSize || 16,
          fontWeight: node.style.fontWeight || 400,
          lineHeight: node.style.lineHeightPx || node.style.fontSize * 1.2,
          letterSpacing: node.style.letterSpacing || 0
        }
      };
    }
    
    return tokens;
  }

  /**
   * Infer semantic role from node data
   */
  private inferSemanticRole(node: any): import('./types.js').SemanticRole {
    if (node.type === 'TEXT') return 'text';
    if (node.name?.toLowerCase().includes('button')) return 'button';
    if (node.name?.toLowerCase().includes('input')) return 'input';
    if (node.name?.toLowerCase().includes('nav')) return 'navigation';
    if (node.name?.toLowerCase().includes('header')) return 'header';
    if (node.name?.toLowerCase().includes('footer')) return 'footer';
    if (node.name?.toLowerCase().includes('sidebar')) return 'aside';
    if (node.name?.toLowerCase().includes('modal')) return 'dialog';
    return 'presentation';
  }

  /**
   * Extract interaction states
   */
  private extractInteractionStates(node: any): import('./types.js').InteractionState[] {
    const states: import('./types.js').InteractionState[] = [];
    
    // Check for common interaction patterns
    if (node.name?.toLowerCase().includes('hover')) {
      states.push({ 
        name: 'hover', 
        trigger: 'mouse-enter',
        properties: {}
      });
    }
    if (node.name?.toLowerCase().includes('active')) {
      states.push({ 
        name: 'active', 
        trigger: 'click',
        properties: {}
      });
    }
    if (node.name?.toLowerCase().includes('disabled')) {
      states.push({ 
        name: 'disabled', 
        trigger: 'focus',
        properties: {}
      });
    }
    if (node.name?.toLowerCase().includes('focus')) {
      states.push({ 
        name: 'focus', 
        trigger: 'focus',
        properties: {}
      });
    }
    
    return states;
  }

  /**
   * Extract accessibility information
   */
  private extractAccessibilityInfo(node: any): import('./types.js').AccessibilityInfo {
    return {
      ariaRole: this.inferAccessibilityRole(node),
      ariaLabel: node.name || '',
      ariaDescription: node.description || undefined,
      tabIndex: node.name?.toLowerCase().includes('button') ? 0 : undefined,
      focusable: node.name?.toLowerCase().includes('button') || node.name?.toLowerCase().includes('input'),
      keyboardNavigation: {
        supported: node.name?.toLowerCase().includes('button') || node.name?.toLowerCase().includes('input'),
        keys: []
      }
    };
  }

  /**
   * Infer accessibility role
   */
  private inferAccessibilityRole(node: any): string {
    if (node.name?.toLowerCase().includes('button')) return 'button';
    if (node.name?.toLowerCase().includes('input')) return 'textbox';
    if (node.name?.toLowerCase().includes('nav')) return 'navigation';
    if (node.name?.toLowerCase().includes('header')) return 'banner';
    if (node.name?.toLowerCase().includes('footer')) return 'contentinfo';
    if (node.type === 'TEXT') return 'text';
    return 'generic';
  }

  /**
   * Generate node-specific code hints
   */
  private generateNodeCodeHints(node: any): import('./types.js').CodeGenerationHints {
    return {
      framework: 'react' as import('./types.js').Framework,
      componentName: this.generateComponentName(node.name)
    };
  }

  /**
   * Generate component name from node name
   */
  private generateComponentName(name: string): string {
    if (!name) return 'Component';
    
    // Convert to PascalCase
    return name
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Extract props from node data
   */
  private extractNodeProps(node: any): Record<string, any> {
    const props: Record<string, any> = {};
    
    if (node.name) props.name = node.name;
    if (node.visible !== undefined) props.visible = node.visible;
    if (node.opacity !== undefined && node.opacity !== 1) props.opacity = node.opacity;
    
    return props;
  }

  /**
   * Extract styles from node data
   */
  private extractNodeStyles(node: any): Record<string, any> {
    const styles: Record<string, any> = {};
    
    if (node.absoluteBoundingBox) {
      styles.width = node.absoluteBoundingBox.width;
      styles.height = node.absoluteBoundingBox.height;
    }
    
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.color) {
        styles.backgroundColor = this.rgbToHex(fill.color);
      }
    }
    
    if (node.cornerRadius) {
      styles.borderRadius = node.cornerRadius;
    }
    
    return styles;
  }

  /**
   * Generate import statements
   */
  private generateImports(node: any): string[] {
    const imports: string[] = ['import React from "react";'];
    
    if (node.type === 'TEXT') {
      imports.push('import { Typography } from "@/components/ui/typography";');
    }
    if (node.name?.toLowerCase().includes('button')) {
      imports.push('import { Button } from "@/components/ui/button";');
    }
    
    return imports;
  }

  /**
   * Generate export statements
   */
  private generateExports(node: any): string[] {
    const componentName = this.generateComponentName(node.name);
    return [`export default ${componentName};`, `export { ${componentName} };`];
  }

  /**
   * Generate test suggestions
   */
  private generateTestSuggestions(node: any): string[] {
    const suggestions: string[] = [];
    const componentName = this.generateComponentName(node.name);
    
    suggestions.push(`describe('${componentName}', () => { it('renders correctly', () => {}); });`);
    
    if (node.name?.toLowerCase().includes('button')) {
      suggestions.push(`it('handles click events', () => {});`);
    }
    
    return suggestions;
  }

  /**
   * Generate documentation
   */
  private generateDocumentation(node: any): string {
    const componentName = this.generateComponentName(node.name);
    return `/**\n * ${componentName} component\n * \n * @description ${node.description || 'Auto-generated component from Figma design'}\n */`;
  }

  /**
   * Generate optimization hints
   */
  private generateOptimizationHints(node: any): string[] {
    const hints: string[] = [];
    
    if (node.children && node.children.length > 10) {
      hints.push('Consider using React.memo for this component with many children');
    }
    
    if (node.absoluteBoundingBox && node.absoluteBoundingBox.width * node.absoluteBoundingBox.height > 100000) {
      hints.push('Consider lazy loading for this large component');
    }
    
    return hints;
  }

  /**
   * Convert RGB color to hex
   */
  private rgbToHex(color: { r: number; g: number; b: number }): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  async extract(params: ExtractionParams): Promise<ExtractionResult> {
    const timerId = this.performanceMonitor.startTimer('extract_complete');
    
    try {
      // Parse source to get file key and node IDs
      const { fileKey, nodeIds } = this.parseSource(params.source, params.nodeIds);
      
      // Create cache key
      const cacheKey = this.createCacheKey('extract', fileKey, nodeIds, params.dataTypes);
      
      // Check cache first
      if (params.options?.caching !== 'none') {
        const cached = await this.cache.get<ExtractionResult>(cacheKey);
        if (cached) {
          this.performanceMonitor.endTimer(timerId);
          return cached;
        }
      }

      // Initialize result
      const result: ExtractionResult = {
        metadata: [],
        assets: [],
        designTokens: {},
        codeGeneration: [],
        validation: { valid: true, errors: [], warnings: [] },
        performance: {
          timing: {},
          memory: { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 },
          throughput: 0,
          cacheHitRate: 0,
          errorRate: 0,
          apiCallCount: 0,
          lastUpdated: Date.now(),
          loadTime: 0,
          bundleSize: 0,
          renderTime: 0
        },
        extractedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      // Extract data based on requested types
      if (params.dataTypes.includes('metadata')) {
        result.metadata = await this.extractMetadata(nodeIds, params.options?.metadata);
      }

      if (params.dataTypes.includes('design-tokens')) {
        result.designTokens = await this.extractDesignTokens(fileKey, params.options?.tokens);
      }

      if (params.dataTypes.includes('assets')) {
        result.assets = await this.extractAssets(nodeIds, params.options?.assets);
      }

      if (params.dataTypes.includes('code-hints') && result.metadata.length > 0) {
        result.codeGeneration = await this.generateCodeHints(result.metadata, params.options?.codeGeneration);
      }

      // Validate the extraction
      result.validation = await this.validateExtraction(result);

      // Get performance metrics
      result.performance = this.getPerformanceMetrics();

      // Cache the result
      if (params.options?.caching !== 'none') {
        await this.cache.set(cacheKey, result, this.getCacheTTL(params.options?.caching));
      }

      this.performanceMonitor.endTimer(timerId);
      return result;

    } catch (error) {
      this.performanceMonitor.endTimer(timerId);
      throw error;
    }
  }

  /**
   * Extract only metadata from specified nodes
   */
  async extractMetadata(nodeIds: string[], options?: MetadataOptions): Promise<FigmaNodeMetadata[]> {
    const timerId = this.performanceMonitor.startTimer('extract_metadata');
    
    try {
      const metadata: FigmaNodeMetadata[] = [];
      
      // Process nodes in batches to avoid API rate limits
      const batchSize = 50;
      for (let i = 0; i < nodeIds.length; i += batchSize) {
        const batch = nodeIds.slice(i, i + batchSize);
        const batchMetadata = await this.fetchNodeMetadata(batch, options);
        metadata.push(...batchMetadata);
      }

      // Enrich metadata with MCP-specific information
      for (const node of metadata) {
        await this.enrichNodeMetadata(node, options);
      }

      this.performanceMonitor.endTimer(timerId);
      return metadata;

    } catch (error) {
      this.performanceMonitor.endTimer(timerId);
      throw error;
    }
  }

  /**
   * Extract design tokens from the design system
   */
  async extractDesignTokens(fileKey: string, options?: TokenExtractionOptions): Promise<DesignTokens> {
    const timerId = this.performanceMonitor.startTimer('extract_design_tokens');
    
    try {
      const cacheKey = this.createCacheKey('tokens', fileKey);
      
      // Check cache
      const cached = await this.cache.get<DesignTokens>(cacheKey);
      if (cached) {
        this.performanceMonitor.endTimer(timerId);
        return cached;
      }

      // Extract different types of tokens
      const tokens: DesignTokens = {};

      // Extract color tokens
      tokens.colors = await this.extractColorTokens(fileKey);
      
      // Extract typography tokens
      tokens.typography = await this.extractTypographyTokens(fileKey);
      
      // Extract spacing tokens
      tokens.spacing = await this.extractSpacingTokens(fileKey);
      
      // Extract border tokens
      tokens.borders = await this.extractBorderTokens(fileKey);
      
      // Extract shadow tokens
      tokens.shadows = await this.extractShadowTokens(fileKey);
      
      // Extract effect tokens
      tokens.effects = await this.extractEffectTokens(fileKey);

      // Cache the tokens
      await this.cache.set(cacheKey, tokens, 3600); // 1 hour TTL

      this.performanceMonitor.endTimer(timerId);
      return tokens;

    } catch (error) {
      this.performanceMonitor.endTimer(timerId);
      throw error;
    }
  }

  /**
   * Extract assets from the design
   */
  async extractAssets(nodeIds: string[], options?: AssetExtractionOptions): Promise<AssetMetadata[]> {
    const timerId = this.performanceMonitor.startTimer('extract_assets');
    
    try {
      const assets: AssetMetadata[] = [];
      
      // Identify asset nodes
      const assetNodes = await this.identifyAssetNodes(nodeIds);
      
      // Extract different types of assets
      for (const node of assetNodes) {
        const asset = await this.extractAssetFromNode(node, options);
        if (asset) {
          assets.push(asset);
        }
      }

      // Optimize assets if requested
      // await this.optimizeAssets(assets, options);

      this.performanceMonitor.endTimer(timerId);
      return assets;

    } catch (error) {
      this.performanceMonitor.endTimer(timerId);
      throw error;
    }
  }

  /**
   * Generate code hints based on design analysis
   */
  async generateCodeHints(metadata: FigmaNodeMetadata[], options?: CodeGenerationOptions): Promise<CodeGenerationHints[]> {
    const timerId = this.performanceMonitor.startTimer('generate_code_hints');
    
    try {
      const hints: CodeGenerationHints[] = [];
      
      for (const node of metadata) {
        const hint = await this.analyzeNodeForCodeGeneration(node, options);
        if (hint) {
          hints.push(hint);
        }
      }

      this.performanceMonitor.endTimer(timerId);
      return hints;

    } catch (error) {
      this.performanceMonitor.endTimer(timerId);
      throw error;
    }
  }

  /**
   * Validate extracted data for completeness and accuracy
   */
  async validateExtraction(result: ExtractionResult): Promise<ValidationResult> {
    return await this.validator.validateComplete(result);
  }

  /**
   * Get performance metrics for the extraction process
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceMonitor.getMetrics();
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private parseSource(source: string, nodeIds?: string[]): { fileKey: string; nodeIds: string[] } {
    // Extract file key from Figma URL or use as direct file key
    let fileKey: string;
    
    if (source.includes('figma.com')) {
      const match = source.match(/file\/([a-zA-Z0-9]+)/);
      if (!match) {
        throw new Error('Invalid Figma URL format');
      }
      fileKey = match[1];
    } else {
      fileKey = source;
    }

    // Use provided node IDs or extract from URL
    let finalNodeIds = nodeIds || [];
    if (finalNodeIds.length === 0 && source.includes('node-id=')) {
      const nodeMatch = source.match(/node-id=([^&]+)/);
      if (nodeMatch) {
        finalNodeIds = nodeMatch[1].split(',').map(id => decodeURIComponent(id));
      }
    }

    return { fileKey, nodeIds: finalNodeIds };
  }

  private createCacheKey(operation: string, fileKey: string, nodeIds?: string[], dataTypes?: string[]): string {
    const parts = [operation, fileKey];
    if (nodeIds?.length) {
      parts.push(nodeIds.sort().join(','));
    }
    if (dataTypes?.length) {
      parts.push(dataTypes.sort().join(','));
    }
    return parts.join(':');
  }

  private getCacheTTL(strategy?: string): number {
    switch (strategy) {
      case 'memory': return 300; // 5 minutes
      case 'disk': return 3600; // 1 hour
      case 'hybrid': return 1800; // 30 minutes
      default: return 600; // 10 minutes
    }
  }

  private async fetchNodeMetadata(nodeIds: string[], options?: MetadataOptions): Promise<FigmaNodeMetadata[]> {
    // This would implement the actual Figma API calls
    // For now, return mock data structure
    return nodeIds.map(id => ({
      id,
      name: `Node ${id}`,
      type: 'FRAME' as const,
      visible: true,
      locked: false,
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
      relativeTransform: { 0: [1, 0, 0], 1: [0, 1, 0] },
      constraints: { vertical: 'MIN', horizontal: 'MIN' },
      mcpMetadata: {
        extractedAt: new Date().toISOString(),
        componentType: 'layout',
        semanticRole: 'section'
      }
    }));
  }

  private async enrichNodeMetadata(node: FigmaNodeMetadata, options?: MetadataOptions): Promise<void> {
    // Enrich with semantic analysis
    if (!node.mcpMetadata) {
      node.mcpMetadata = {
        extractedAt: new Date().toISOString()
      };
    }

    // Analyze component type
    node.mcpMetadata.componentType = this.analyzeComponentType(node);
    
    // Determine semantic role
    node.mcpMetadata.semanticRole = this.determineSemanticRole(node);
    
    // Extract design tokens
    node.mcpMetadata.designTokens = await this.extractNodeDesignTokens(node);
  }

  private analyzeComponentType(node: FigmaNodeMetadata): import('./types.js').ComponentType {
    // Basic analysis based on node properties
    if (node.name.toLowerCase().includes('button')) return 'button';
    if (node.name.toLowerCase().includes('input')) return 'input';
    if (node.name.toLowerCase().includes('card')) return 'card';
    if (node.name.toLowerCase().includes('modal')) return 'modal';
    if (node.type === 'TEXT') return 'typography';
    if (node.type === 'FRAME') return 'layout';
    return 'custom';
  }

  private determineSemanticRole(node: FigmaNodeMetadata): import('./types.js').SemanticRole {
    const componentType = node.mcpMetadata?.componentType;
    if (componentType === 'button') return 'button';
    if (componentType === 'input') return 'input';
    if (node.type === 'TEXT') return 'text';
    if (node.type === 'FRAME') return 'section';
    return 'presentation';
  }



  private extractColorsFromPaints(paints: import('./types.js').Paint[]): import('./types.js').ColorTokens {
    const colors: import('./types.js').ColorTokens = { custom: {} };
    
    paints.forEach((paint, index) => {
      if (paint.type === 'SOLID' && paint.color) {
        const { r, g, b, a } = paint.color;
        const hex = this.rgbaToHex(r, g, b, a || 1);
        if (colors.custom) {
          colors.custom[`paint-${index}`] = hex;
        }
      }
    });

    return colors;
  }

  private extractTypographyFromText(node: FigmaNodeMetadata): import('./types.js').TypographyTokens {
    // This would extract typography information from text nodes
    return {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5
    };
  }

  private rgbaToHex(r: number, g: number, b: number, a: number): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a < 1 ? `${hex}${toHex(a)}` : hex;
  }

  private async extractColorTokens(fileKey: string): Promise<import('./types.js').ColorTokens> {
    // Implementation for extracting color tokens from styles
    return { custom: {} };
  }

  private async extractTypographyTokens(fileKey: string): Promise<import('./types.js').TypographyTokens> {
    // Implementation for extracting typography tokens
    return {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5
    };
  }

  private async extractSpacingTokens(fileKey: string): Promise<import('./types.js').SpacingTokens> {
    // Implementation for extracting spacing tokens
    return {
      padding: 16,
      margin: 16,
      gap: 8
    };
  }

  private async extractBorderTokens(fileKey: string): Promise<import('./types.js').BorderTokens> {
    // Implementation for extracting border tokens
    return {
      width: 1,
      style: 'solid',
      color: '#000000',
      radius: 4
    };
  }

  private async extractShadowTokens(fileKey: string): Promise<import('./types.js').ShadowTokens> {
    // Implementation for extracting shadow tokens
    return {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  }

  private async extractEffectTokens(fileKey: string): Promise<import('./types.js').EffectTokens> {
    // Implementation for extracting effect tokens
    return {};
  }

  private async identifyAssetNodes(nodeIds: string[]): Promise<FigmaNodeMetadata[]> {
    // Implementation for identifying nodes that contain assets
    return [];
  }

  private async extractAssetFromNode(node: FigmaNodeMetadata, options?: AssetExtractionOptions): Promise<AssetMetadata | null> {
    // Implementation for extracting assets from individual nodes
    return null;
  }

  private async optimizeAssets(assets: AssetMetadata[], options?: AssetExtractionOptions): Promise<void> {
    // Implementation for asset optimization
  }

  private async analyzeNodeForCodeGeneration(node: FigmaNodeMetadata, options?: CodeGenerationOptions): Promise<CodeGenerationHints | null> {
    // Implementation for analyzing nodes and generating code hints
    return {
      framework: (options?.framework || 'react') as import('./types.js').Framework,
      componentName: this.generateComponentName(node.name),
      stateManagement: 'useState',
      styling: 'css',
      testingStrategy: 'jest'
    };
  }


}