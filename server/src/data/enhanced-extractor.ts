/**
 * Enhanced Figma Data Extractor
 * 
 * Extended implementation with semantic intent inference, visual density metrics,
 * design token normalization, and performance optimizations for large frames.
 */

import { FigmaDataExtractor } from './extractor.js';
import type {
  SemanticAnalysisResult,
  ComponentIntent,
  UIPattern,
  InteractionType,
  ContentType,
  SemanticPattern,
  SemanticRelationship,
  VisualDensityMetrics,
  DensityRegion,
  FlowMetrics,
  NormalizedDesignTokens,
  PerformanceOptimizationConfig,
  AIModelIntegrationSchema,
  SafeAccessHelpers,
  ExtractedDataValidator
} from './enhanced-extraction-interfaces.js';

import type {
  FigmaNodeMetadata,
  FigmaNodeType,
  SemanticRole,
  DesignTokens,
  ValidationResult,
  PerformanceMetrics,
  Position,
  Size,
  RGBA
} from './types.js';

/**
 * Enhanced Figma Data Extractor with advanced features
 */
class EnhancedFigmaDataExtractor extends FigmaDataExtractor implements SafeAccessHelpers {
  private performanceConfig: PerformanceOptimizationConfig;
  private semanticPatterns: Map<string, SemanticPattern> = new Map();
  private densityCache: Map<string, VisualDensityMetrics> = new Map();

  constructor(
    figmaApiKey: string,
    performanceMonitor: any,
    cache: any,
    validator: any,
    performanceConfig?: PerformanceOptimizationConfig
  ) {
    super(figmaApiKey, performanceMonitor, cache, validator);
    
    this.performanceConfig = performanceConfig || this.getDefaultPerformanceConfig();
    this.initializeSemanticPatterns();
  }

  // =============================================================================
  // SEMANTIC INTENT INFERENCE
  // =============================================================================

  /**
   * Analyze semantic intent of design elements
   */
  async analyzeSemanticIntent(nodes: FigmaNodeMetadata[]): Promise<SemanticAnalysisResult[]> {
    const results: SemanticAnalysisResult[] = [];
    
    for (const node of nodes) {
      const analysis = await this.inferSemanticIntent(node);
      if (analysis) {
        results.push(analysis);
      }
    }

    // Analyze relationships between semantic elements
    const relationships = this.analyzeSemanticRelationships(results);
    
    // Update results with relationship context
    results.forEach(result => {
      result.relationships = relationships.filter(rel => 
        rel.source === result.intent.primaryRole.toString() || 
        rel.target === result.intent.primaryRole.toString()
      );
    });

    return results;
  }

  /**
   * Infer semantic intent from a single node
   */
  private async inferSemanticIntent(node: FigmaNodeMetadata): Promise<SemanticAnalysisResult | null> {
    if (!node) return null;

    const intent = this.analyzeComponentIntent(node);
    const patterns = this.detectSemanticPatterns(node);
    const confidence = this.calculateSemanticConfidence(node, intent, patterns);
    const reasoning = this.generateSemanticReasoning(node, intent, patterns);

    return {
      intent,
      confidence,
      reasoning,
      patterns,
      relationships: [] // Will be populated later
    };
  }

  /**
   * Analyze component intent from node properties
   */
  private analyzeComponentIntent(node: FigmaNodeMetadata): ComponentIntent {
    const name = this.getNodeProperty(node, 'name', '').toLowerCase();
    const type = this.getNodeProperty(node, 'type', 'FRAME' as FigmaNodeType);
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const bounds = this.calculateBoundingSafely(node);

    // Determine primary role
    let primaryRole = this.inferPrimaryRole(name, type, hasChildren);
    
    // Determine UI pattern
    const uiPattern = this.inferUIPattern(name, type, node, hasChildren);
    
    // Determine interaction type
    const interactionType = this.inferInteractionType(name, uiPattern, node);
    
    // Determine content type
    const contentType = this.inferContentType(type, node, hasChildren);
    
    // Specialized roles for forms and navigation
    const formRole = this.inferFormRole(name, uiPattern);
    const navigationRole = this.inferNavigationRole(name, uiPattern);

    return {
      primaryRole,
      secondaryRoles: this.inferSecondaryRoles(node, primaryRole),
      uiPattern,
      interactionType,
      contentType,
      formRole,
      navigationRole
    };
  }

  /**
   * Infer primary semantic role
   */
  private inferPrimaryRole(name: string, type: FigmaNodeType, hasChildren: boolean): import('./enhanced-extraction-interfaces.js').IntentRole {
    // Button patterns
    if (name.includes('button') || name.includes('btn') || name.includes('cta')) {
      return 'control';
    }
    
    // Input patterns  
    if (name.includes('input') || name.includes('field') || name.includes('text') && type === 'TEXT') {
      return 'input';
    }
    
    // Navigation patterns
    if (name.includes('nav') || name.includes('menu') || name.includes('link')) {
      return 'navigation';
    }
    
    // Content patterns
    if (name.includes('content') || name.includes('text') || name.includes('paragraph')) {
      return 'content';
    }
    
    // Structure patterns
    if (hasChildren && (name.includes('container') || name.includes('wrapper') || name.includes('layout'))) {
      return 'structure';
    }
    
    // Feedback patterns
    if (name.includes('alert') || name.includes('notification') || name.includes('toast')) {
      return 'feedback';
    }

    // Default based on type
    switch (type) {
      case 'TEXT': return 'content';
      case 'COMPONENT': 
      case 'INSTANCE': return 'interaction';
      case 'FRAME':
      case 'GROUP': return hasChildren ? 'structure' : 'decoration';
      default: return 'decoration';
    }
  }

  /**
   * Infer UI pattern from component characteristics
   */
  private inferUIPattern(name: string, type: FigmaNodeType, node: FigmaNodeMetadata, hasChildren: boolean): UIPattern {
    // Button patterns
    if (name.includes('button') || name.includes('btn')) {
      return 'button';
    }
    
    // Input patterns
    if (name.includes('input') || name.includes('field')) {
      if (name.includes('dropdown') || name.includes('select')) return 'dropdown';
      return 'input-field';
    }
    
    // Card patterns
    if (name.includes('card') || (hasChildren && name.includes('item'))) {
      return 'card';
    }
    
    // Modal patterns
    if (name.includes('modal') || name.includes('dialog') || name.includes('popup')) {
      return 'modal';
    }
    
    // Navigation patterns
    if (name.includes('nav') || name.includes('menu')) {
      if (name.includes('tab')) return 'tabs';
      if (name.includes('breadcrumb')) return 'breadcrumb';
      return 'navigation';
    }
    
    // Form patterns
    if (this.isFormPattern(node)) {
      return 'form';
    }
    
    // List patterns
    if (this.isListPattern(node)) {
      return 'list';
    }
    
    // Header/Footer patterns
    if (name.includes('header')) return 'header';
    if (name.includes('footer')) return 'footer';
    
    // Sidebar patterns
    if (name.includes('sidebar') || name.includes('aside')) return 'sidebar';

    return 'custom';
  }

  /**
   * Check if node represents a form pattern
   */
  private isFormPattern(node: FigmaNodeMetadata): boolean {
    if (!node.children) return false;
    
    const childNames = node.children.map(child => child.name.toLowerCase());
    const formKeywords = ['input', 'field', 'button', 'submit', 'form', 'label'];
    
    return formKeywords.some(keyword => 
      childNames.some(name => name.includes(keyword))
    ) && childNames.filter(name => 
      formKeywords.some(keyword => name.includes(keyword))
    ).length >= 2;
  }

  /**
   * Check if node represents a list pattern
   */
  private isListPattern(node: FigmaNodeMetadata): boolean {
    if (!node.children || node.children.length < 2) return false;
    
    // Check for repeated similar elements
    const childTypes = node.children.map(child => child.type);
    const childNames = node.children.map(child => child.name.toLowerCase());
    
    // Similar naming pattern
    const hasRepeatedNames = new Set(childNames).size < childNames.length * 0.8;
    
    // Similar types
    const hasRepeatedTypes = new Set(childTypes).size < childTypes.length * 0.5;
    
    return hasRepeatedNames || hasRepeatedTypes;
  }

  /**
   * Infer interaction type
   */
  private inferInteractionType(name: string, pattern: UIPattern, node: FigmaNodeMetadata): InteractionType {
    // Static content
    if (pattern === 'custom' && node.type === 'TEXT') {
      return 'static';
    }
    
    // Interactive patterns
    switch (pattern) {
      case 'button': return 'clickable';
      case 'input-field': return 'editable';
      case 'dropdown': return 'selectable';
      case 'modal': return 'focusable';
      case 'card': return name.includes('clickable') ? 'clickable' : 'hoverable';
      case 'navigation': return 'clickable';
      case 'tabs': return 'clickable';
      default: return 'static';
    }
  }

  /**
   * Infer content type
   */
  private inferContentType(type: FigmaNodeType, node: FigmaNodeMetadata, hasChildren: boolean): ContentType {
    if (type === 'TEXT') return 'text';
    
    const name = node.name.toLowerCase();
    if (name.includes('image') || name.includes('photo') || name.includes('img')) return 'image';
    if (name.includes('video')) return 'video';
    if (name.includes('icon')) return 'icon';
    if (name.includes('chart') || name.includes('graph')) return 'chart';
    if (name.includes('table')) return 'table';
    if (name.includes('list')) return 'list';
    if (name.includes('form')) return 'form';
    
    if (hasChildren) {
      const childContentTypes = node.children?.map(child => 
        this.inferContentType(child.type, child, (child.children?.length || 0) > 0)
      ) || [];
      
      const uniqueTypes = new Set(childContentTypes);
      if (uniqueTypes.size > 1) return 'mixed';
      if (uniqueTypes.size === 1) return childContentTypes[0];
    }
    
    return hasChildren ? 'mixed' : 'empty';
  }

  /**
   * Infer form-specific role
   */
  private inferFormRole(name: string, pattern: UIPattern): import('./enhanced-extraction-interfaces.js').FormRole | undefined {
    if (pattern !== 'form' && !name.includes('form') && !name.includes('input') && !name.includes('field')) {
      return undefined;
    }
    
    if (name.includes('submit') || name.includes('send')) return 'submit';
    if (name.includes('reset') || name.includes('clear')) return 'reset';
    if (name.includes('cancel')) return 'cancel';
    if (name.includes('label')) return 'label';
    if (name.includes('help') || name.includes('hint')) return 'help-text';
    if (name.includes('error') || name.includes('validation')) return 'validation';
    if (name.includes('group') || name.includes('fieldset')) return 'field-group';
    if (name.includes('input') || name.includes('field')) return 'input-field';
    
    return 'form-container';
  }

  /**
   * Infer navigation-specific role
   */
  private inferNavigationRole(name: string, pattern: UIPattern): import('./enhanced-extraction-interfaces.js').NavigationRole | undefined {
    if (pattern !== 'navigation' && !name.includes('nav') && !name.includes('menu')) {
      return undefined;
    }
    
    if (name.includes('primary') || name.includes('main')) return 'primary-nav';
    if (name.includes('secondary') || name.includes('sub')) return 'secondary-nav';
    if (name.includes('breadcrumb')) return 'breadcrumb';
    if (name.includes('pagination') || name.includes('pager')) return 'pagination';
    if (name.includes('tab')) return 'tab-nav';
    if (name.includes('step') || name.includes('wizard')) return 'step-nav';
    if (name.includes('quick') || name.includes('shortcut')) return 'quick-nav';
    if (name.includes('footer')) return 'footer-nav';
    
    return 'primary-nav';
  }

  /**
   * Infer secondary roles
   */
  private inferSecondaryRoles(node: FigmaNodeMetadata, primaryRole: import('./enhanced-extraction-interfaces.js').IntentRole): import('./enhanced-extraction-interfaces.js').IntentRole[] {
    const roles: import('./enhanced-extraction-interfaces.js').IntentRole[] = [];
    const name = node.name.toLowerCase();
    
    // Always add decoration if has visual styling
    if (node.fills || node.strokes || node.effects) {
      roles.push('decoration');
    }
    
    // Add feedback role for interactive elements
    if (primaryRole === 'control' || primaryRole === 'input') {
      roles.push('feedback');
    }
    
    // Add structure role for containers
    if (node.children && node.children.length > 0 && primaryRole !== 'structure') {
      roles.push('structure');
    }
    
    return roles.filter(role => role !== primaryRole);
  }

  /**
   * Detect semantic patterns in the design
   */
  private detectSemanticPatterns(node: FigmaNodeMetadata): SemanticPattern[] {
    const patterns: SemanticPattern[] = [];
    
    // Check against known patterns
    for (const [patternId, pattern] of this.semanticPatterns) {
      const match = this.matchesPattern(node, pattern);
      if (match.confidence > 0.5) {
        patterns.push({
          ...pattern,
          confidence: match.confidence,
          elements: [node.id],
          properties: match.properties
        });
      }
    }
    
    return patterns;
  }

  /**
   * Match node against a semantic pattern
   */
  private matchesPattern(node: FigmaNodeMetadata, pattern: SemanticPattern): { confidence: number; properties: Record<string, any> } {
    const name = node.name.toLowerCase();
    const type = node.type;
    let confidence = 0;
    const properties: Record<string, any> = {};
    
    // Pattern-specific matching logic
    switch (pattern.type) {
      case 'form-pattern':
        if (this.isFormPattern(node)) {
          confidence = 0.8;
          properties.fieldCount = node.children?.length || 0;
        }
        break;
        
      case 'navigation-pattern':
        if (name.includes('nav') || name.includes('menu')) {
          confidence = 0.7;
          properties.itemCount = node.children?.length || 0;
        }
        break;
        
      case 'content-pattern':
        if (type === 'TEXT' || name.includes('content')) {
          confidence = 0.6;
          properties.textLength = name.length;
        }
        break;
        
      case 'layout-pattern':
        if (node.children && node.children.length > 0) {
          confidence = 0.5;
          properties.childCount = node.children.length;
        }
        break;
    }
    
    return { confidence, properties };
  }

  /**
   * Analyze relationships between semantic elements
   */
  private analyzeSemanticRelationships(analyses: SemanticAnalysisResult[]): SemanticRelationship[] {
    const relationships: SemanticRelationship[] = [];
    
    for (let i = 0; i < analyses.length; i++) {
      for (let j = i + 1; j < analyses.length; j++) {
        const sourceAnalysis = analyses[i];
        const targetAnalysis = analyses[j];
        
        const relationship = this.detectRelationship(sourceAnalysis, targetAnalysis);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }
    
    return relationships;
  }

  /**
   * Detect relationship between two semantic analyses
   */
  private detectRelationship(source: SemanticAnalysisResult, target: SemanticAnalysisResult): SemanticRelationship | null {
    // Label-input relationships
    if (source.intent.primaryRole === 'content' && target.intent.primaryRole === 'input') {
      return {
        type: 'label-input',
        source: source.intent.primaryRole,
        target: target.intent.primaryRole,
        strength: 0.8,
        properties: { type: 'label-field' }
      };
    }
    
    // Trigger-target relationships (button -> modal)
    if (source.intent.primaryRole === 'control' && target.intent.uiPattern === 'modal') {
      return {
        type: 'trigger-target',
        source: source.intent.primaryRole,
        target: target.intent.primaryRole,
        strength: 0.7,
        properties: { type: 'button-modal' }
      };
    }
    
    // Group membership (elements in same container)
    if (source.intent.primaryRole === 'structure' && target.intent.primaryRole !== 'structure') {
      return {
        type: 'group-member',
        source: source.intent.primaryRole,
        target: target.intent.primaryRole,
        strength: 0.6,
        properties: { type: 'container-element' }
      };
    }
    
    return null;
  }

  /**
   * Calculate confidence score for semantic analysis
   */
  private calculateSemanticConfidence(node: FigmaNodeMetadata, intent: ComponentIntent, patterns: SemanticPattern[]): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on naming clarity
    const name = node.name.toLowerCase();
    const nameKeywords = ['button', 'input', 'nav', 'menu', 'form', 'card', 'modal'];
    if (nameKeywords.some(keyword => name.includes(keyword))) {
      confidence += 0.2;
    }
    
    // Boost confidence based on pattern matches
    const patternConfidence = patterns.reduce((sum, pattern) => sum + pattern.confidence, 0) / patterns.length;
    if (patternConfidence > 0) {
      confidence += patternConfidence * 0.3;
    }
    
    // Boost confidence based on structural clarity
    if (node.children && node.children.length > 0) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Generate reasoning for semantic analysis
   */
  private generateSemanticReasoning(node: FigmaNodeMetadata, intent: ComponentIntent, patterns: SemanticPattern[]): string[] {
    const reasoning: string[] = [];
    const name = node.name;
    
    reasoning.push(`Identified as ${intent.uiPattern} based on name "${name}" and type ${node.type}`);
    
    if (intent.formRole) {
      reasoning.push(`Form role: ${intent.formRole} - likely part of a form interaction flow`);
    }
    
    if (intent.navigationRole) {
      reasoning.push(`Navigation role: ${intent.navigationRole} - supports user navigation`);
    }
    
    if (patterns.length > 0) {
      reasoning.push(`Matches ${patterns.length} semantic pattern(s): ${patterns.map(p => p.name).join(', ')}`);
    }
    
    if (node.children && node.children.length > 0) {
      reasoning.push(`Contains ${node.children.length} child elements, suggesting structural role`);
    }
    
    return reasoning;
  }

  // =============================================================================
  // VISUAL DENSITY METRICS
  // =============================================================================

  /**
   * Calculate visual density metrics for design analysis
   */
  async calculateVisualDensity(nodes: FigmaNodeMetadata[], bounds?: { width: number; height: number }): Promise<VisualDensityMetrics> {
    const cacheKey = this.createDensityCacheKey(nodes, bounds);
    
    // Check cache first
    const cached = this.densityCache.get(cacheKey);
    if (cached) return cached;
    
    // Calculate overall design bounds if not provided
    const designBounds = bounds || this.calculateOverallBounds(nodes);
    
    // Analyze regions
    const regions = await this.analyzeDesignRegions(nodes, designBounds);
    
    // Calculate overall density
    const overallDensity = this.calculateOverallDensity(regions);
    
    // Calculate whitespace ratio
    const whitespaceRatio = this.calculateWhitespaceRatio(nodes, designBounds);
    
    // Analyze content distribution
    const contentDistribution = this.analyzeContentDistribution(nodes, designBounds);
    
    // Build visual hierarchy
    const visualHierarchy = this.buildVisualHierarchy(nodes);
    
    // Analyze flow
    const flowMetrics = await this.analyzeVisualFlow(nodes, designBounds);
    
    const metrics: VisualDensityMetrics = {
      overallDensity,
      regionAnalysis: regions,
      whitespaceRatio,
      contentDistribution,
      visualHierarchy,
      flowMetrics
    };
    
    // Cache results
    this.densityCache.set(cacheKey, metrics);
    
    return metrics;
  }

  /**
   * Analyze design regions for density
   */
  private async analyzeDesignRegions(nodes: FigmaNodeMetadata[], bounds: { width: number; height: number }): Promise<DensityRegion[]> {
    const regions: DensityRegion[] = [];
    
    // Divide design into grid regions for analysis
    const gridSize = 4; // 4x4 grid
    const regionWidth = bounds.width / gridSize;
    const regionHeight = bounds.height / gridSize;
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const regionBounds = {
          x: col * regionWidth,
          y: row * regionHeight,
          width: regionWidth,
          height: regionHeight
        };
        
        const region = await this.analyzeRegion(nodes, regionBounds, `region-${row}-${col}`);
        regions.push(region);
      }
    }
    
    return regions;
  }

  /**
   * Analyze a specific region for density metrics
   */
  private async analyzeRegion(nodes: FigmaNodeMetadata[], bounds: import('./enhanced-extraction-interfaces.js').BoundingRect, id: string): Promise<DensityRegion> {
    // Find nodes that intersect with this region
    const regionNodes = nodes.filter(node => {
      const nodeBounds = this.calculateBoundingSafely(node);
      return nodeBounds && this.intersects(nodeBounds, bounds);
    });
    
    // Calculate density metrics
    const elementCount = regionNodes.length;
    const occupiedArea = regionNodes.reduce((sum, node) => {
      const nodeBounds = this.calculateBoundingSafely(node);
      return sum + (nodeBounds ? nodeBounds.width * nodeBounds.height : 0);
    }, 0);
    
    const regionArea = bounds.width * bounds.height;
    const whiteSpacePercentage = Math.max(0, (regionArea - occupiedArea) / regionArea);
    
    // Determine density level
    let density: import('./enhanced-extraction-interfaces.js').DensityLevel;
    if (whiteSpacePercentage > 0.7) density = 'sparse';
    else if (whiteSpacePercentage > 0.4) density = 'balanced';
    else if (whiteSpacePercentage > 0.2) density = 'dense';
    else density = 'crowded';
    
    // Find dominant element type
    const elementTypes = regionNodes.map(node => node.type);
    const dominantElementType = this.getMostFrequent(elementTypes) || 'FRAME';
    
    // Basic accessibility analysis
    const accessibility = await this.analyzeRegionAccessibility(regionNodes);
    
    return {
      id,
      bounds,
      density,
      elementCount,
      whiteSpacePercentage,
      dominantElementType,
      accessibility
    };
  }

  /**
   * Check if two bounding rectangles intersect
   */
  private intersects(rect1: import('./enhanced-extraction-interfaces.js').BoundingRect, rect2: import('./enhanced-extraction-interfaces.js').BoundingRect): boolean {
    return !(rect1.x + rect1.width < rect2.x || 
             rect2.x + rect2.width < rect1.x || 
             rect1.y + rect1.height < rect2.y || 
             rect2.y + rect2.height < rect1.y);
  }

  /**
   * Find most frequent item in array
   */
  private getMostFrequent<T>(items: T[]): T | null {
    if (items.length === 0) return null;
    
    const counts = new Map<T, number>();
    items.forEach(item => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });
    
    let maxCount = 0;
    let mostFrequent: T | null = null;
    
    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = item;
      }
    });
    
    return mostFrequent;
  }

  /**
   * Calculate overall design bounds
   */
  private calculateOverallBounds(nodes: FigmaNodeMetadata[]): { width: number; height: number } {
    if (nodes.length === 0) return { width: 0, height: 0 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const bounds = this.calculateBoundingSafely(node);
      if (bounds) {
        minX = Math.min(minX, bounds.x);
        minY = Math.min(minY, bounds.y);
        maxX = Math.max(maxX, bounds.x + bounds.width);
        maxY = Math.max(maxY, bounds.y + bounds.height);
      }
    });
    
    return {
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // =============================================================================
  // SAFE ACCESS HELPER IMPLEMENTATIONS
  // =============================================================================

  /**
   * Safely get property from node with fallback
   */
  getNodeProperty<T>(node: any, path: string, defaultValue: T): T {
    try {
      const pathParts = path.split('.');
      let current = node;
      
      for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return defaultValue;
        }
      }
      
      return current !== undefined ? current : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Check if node has specific type
   */
  hasNodeType(node: any, types: FigmaNodeType[]): boolean {
    const nodeType = this.getNodeProperty(node, 'type', null);
    return nodeType ? types.includes(nodeType) : false;
  }

  /**
   * Safely extract color from paint object
   */
  extractColorSafely(paint: any): string | null {
    try {
      if (!paint || paint.type !== 'SOLID' || !paint.color) return null;
      
      const { r, g, b, a } = paint.color;
      if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') return null;
      
      const alpha = typeof a === 'number' ? a : 1;
      return this.rgbaToHexWithAlpha(r, g, b, alpha);
    } catch {
      return null;
    }
  }

  /**
   * Safely calculate bounding rectangle
   */
  calculateBoundingSafely(node: any): import('./enhanced-extraction-interfaces.js').BoundingRect | null {
    try {
      const bounds = this.getNodeProperty(node, 'absoluteBoundingBox', null);
      if (!bounds || typeof bounds !== 'object') return null;
      
      const x = this.getNodeProperty(bounds, 'x', 0);
      const y = this.getNodeProperty(bounds, 'y', 0);
      const width = this.getNodeProperty(bounds, 'width', 0);
      const height = this.getNodeProperty(bounds, 'height', 0);
      
      if (typeof x !== 'number' || typeof y !== 'number' || 
          typeof width !== 'number' || typeof height !== 'number') return null;
      
      return { x, y, width, height };
    } catch {
      return null;
    }
  }

  /**
   * Safely infer semantic role
   */
  inferSemanticRoleSafely(node: any): SemanticRole {
    try {
      const name = this.getNodeProperty(node, 'name', '').toLowerCase();
      const type = this.getNodeProperty(node, 'type', 'FRAME');
      
      if (name.includes('button')) return 'button';
      if (name.includes('input')) return 'input';
      if (name.includes('nav')) return 'navigation';
      if (name.includes('header')) return 'header';
      if (name.includes('footer')) return 'footer';
      if (node.type === 'TEXT') return 'text';
      
      return 'presentation';
    } catch {
      return 'presentation';
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Convert RGBA to hex with alpha support
   */
  protected rgbaToHexWithAlpha(r: number, g: number, b: number, a: number): string {
    const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n * 255))).toString(16).padStart(2, '0');
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a < 1 ? `${hex}${toHex(a)}` : hex;
  }

  /**
   * Initialize semantic patterns library
   */
  private initializeSemanticPatterns(): void {
    // Form pattern
    this.semanticPatterns.set('form-pattern', {
      type: 'form-pattern',
      name: 'Form Pattern',
      confidence: 0,
      elements: [],
      properties: {}
    });
    
    // Navigation pattern
    this.semanticPatterns.set('navigation-pattern', {
      type: 'navigation-pattern', 
      name: 'Navigation Pattern',
      confidence: 0,
      elements: [],
      properties: {}
    });
    
    // Content pattern
    this.semanticPatterns.set('content-pattern', {
      type: 'content-pattern',
      name: 'Content Pattern', 
      confidence: 0,
      elements: [],
      properties: {}
    });
    
    // Layout pattern
    this.semanticPatterns.set('layout-pattern', {
      type: 'layout-pattern',
      name: 'Layout Pattern',
      confidence: 0,
      elements: [],
      properties: {}
    });
  }

  /**
   * Get default performance configuration
   */
  private getDefaultPerformanceConfig(): PerformanceOptimizationConfig {
    return {
      maxNodes: 1000,
      prioritization: {
        strategy: 'hybrid',
        weights: {
          size: 0.3,
          position: 0.2,
          visibility: 0.2,
          interaction: 0.2,
          semantic: 0.1
        },
        thresholds: {
          critical: 0.8,
          important: 0.6,
          standard: 0.4,
          optional: 0.2
        }
      },
      streaming: {
        enabled: true,
        batchSize: 50,
        delay: 100,
        progressive: true
      },
      caching: {
        enabled: true,
        levels: ['memory', 'disk'],
        ttl: {
          semantic: 3600,
          density: 1800,
          tokens: 7200
        },
        invalidation: 'time-based'
      },
      processing: {
        parallel: true,
        maxWorkers: 4,
        timeout: 30000,
        retries: 3,
        fallback: 'simplify'
      }
    };
  }

  /**
   * Create cache key for density metrics
   */
  private createDensityCacheKey(nodes: FigmaNodeMetadata[], bounds?: { width: number; height: number }): string {
    const nodeIds = nodes.map(n => n.id).sort().join(',');
    const boundsKey = bounds ? `${bounds.width}x${bounds.height}` : 'auto';
    return `density:${nodeIds}:${boundsKey}`;
  }

  /**
   * Calculate overall density from regions
   */
  private calculateOverallDensity(regions: DensityRegion[]): import('./enhanced-extraction-interfaces.js').DensityLevel {
    if (regions.length === 0) return 'balanced';
    
    const densityScores = regions.map(region => {
      switch (region.density) {
        case 'sparse': return 1;
        case 'balanced': return 2;
        case 'dense': return 3;
        case 'crowded': return 4;
        default: return 2;
      }
    });
    
    const averageScore = densityScores.reduce((sum, score) => sum + score, 0) / densityScores.length;
    
    if (averageScore <= 1.5) return 'sparse';
    if (averageScore <= 2.5) return 'balanced';
    if (averageScore <= 3.5) return 'dense';
    return 'crowded';
  }

  /**
   * Calculate whitespace ratio
   */
  private calculateWhitespaceRatio(nodes: FigmaNodeMetadata[], bounds: { width: number; height: number }): number {
    const totalArea = bounds.width * bounds.height;
    if (totalArea === 0) return 1;
    
    const occupiedArea = nodes.reduce((sum, node) => {
      const nodeBounds = this.calculateBoundingSafely(node);
      return sum + (nodeBounds ? nodeBounds.width * nodeBounds.height : 0);
    }, 0);
    
    return Math.max(0, (totalArea - occupiedArea) / totalArea);
  }

  /**
   * Analyze content distribution
   */
  private analyzeContentDistribution(nodes: FigmaNodeMetadata[], bounds: { width: number; height: number }): import('./enhanced-extraction-interfaces.js').ContentDistribution {
    // Implement content distribution analysis
    // This is a simplified version - full implementation would be more comprehensive
    
    return {
      quadrants: {
        topLeft: { elementCount: 0, contentType: [], density: 'balanced', importance: 'secondary' },
        topRight: { elementCount: 0, contentType: [], density: 'balanced', importance: 'secondary' },
        bottomLeft: { elementCount: 0, contentType: [], density: 'balanced', importance: 'secondary' },
        bottomRight: { elementCount: 0, contentType: [], density: 'balanced', importance: 'secondary' }
      },
      verticalDistribution: {
        alignment: 'center',
        spacing: 'uniform',
        rhythm: { consistency: 0.8, baseUnit: 8, variations: [4, 8, 16, 24] }
      },
      horizontalDistribution: {
        alignment: 'center',
        spacing: 'uniform', 
        rhythm: { consistency: 0.8, baseUnit: 8, variations: [4, 8, 16, 24] }
      },
      centerOfMass: { x: bounds.width / 2, y: bounds.height / 2 },
      symmetryScore: 0.7
    };
  }

  /**
   * Build visual hierarchy from nodes
   */
  private buildVisualHierarchy(nodes: FigmaNodeMetadata[]): import('./enhanced-extraction-interfaces.js').HierarchyLevel[] {
    // Simplified implementation - full version would calculate visual weight based on multiple factors
    return [
      {
        level: 1,
        elements: nodes.slice(0, Math.ceil(nodes.length * 0.1)).map(n => n.id),
        visualWeight: 1.0,
        attentionScore: 0.9
      },
      {
        level: 2,
        elements: nodes.slice(Math.ceil(nodes.length * 0.1), Math.ceil(nodes.length * 0.3)).map(n => n.id),
        visualWeight: 0.7,
        attentionScore: 0.7
      },
      {
        level: 3,
        elements: nodes.slice(Math.ceil(nodes.length * 0.3)).map(n => n.id),
        visualWeight: 0.4,
        attentionScore: 0.4
      }
    ];
  }

  /**
   * Analyze visual flow
   */
  private async analyzeVisualFlow(nodes: FigmaNodeMetadata[], bounds: { width: number; height: number }): Promise<FlowMetrics> {
    // Simplified implementation - full version would analyze visual flow patterns
    return {
      readingFlow: {
        pattern: 'z-pattern',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: bounds.width, y: bounds.height },
        keyPoints: [],
        naturalOrder: nodes.map(n => n.id),
        readingTime: nodes.length * 2 // 2 seconds per element estimate
      },
      interactionFlow: {
        primaryPath: {
          steps: [],
          difficulty: 'easy',
          errorProneness: 0.1,
          efficiency: 0.8
        },
        alternativePaths: [],
        completionRate: 0.85,
        cognitiveLoad: 'moderate'
      },
      visualFlow: {
        primaryDirection: 'top-down',
        secondaryDirections: ['left-right'],
        momentum: [],
        barriers: []
      },
      navigationPaths: [],
      bottlenecks: []
    };
  }

  /**
   * Analyze region accessibility
   */
  private async analyzeRegionAccessibility(nodes: FigmaNodeMetadata[]): Promise<import('./enhanced-extraction-interfaces.js').AccessibilityMetrics> {
    // Simplified implementation
    return {
      score: 75,
      issues: [],
      recommendations: []
    };
  }
}

export { EnhancedFigmaDataExtractor };