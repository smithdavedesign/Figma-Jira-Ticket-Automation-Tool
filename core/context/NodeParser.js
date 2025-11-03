/**
 * NodeParser - Figma Node Data Normalizer
 *
 * Normalizes and structures raw Figma node data (Frame, Text, Rectangle, etc.)
 * into a consistent format for downstream processing.
 *
 * Handles:
 * - Node type standardization
 * - Property extraction and normalization
 * - Hierarchy flattening and relationship mapping
 * - Coordinate system normalization
 * - Text content and styling extraction
 */

import { Logger } from '../utils/logger.js';

export class NodeParser {
  constructor() {
    this.logger = new Logger('NodeParser');

    // Node type mappings for standardization
    this.nodeTypeMap = {
      'FRAME': 'container',
      'GROUP': 'container',
      'COMPONENT': 'component',
      'INSTANCE': 'component_instance',
      'TEXT': 'text',
      'RECTANGLE': 'shape',
      'ELLIPSE': 'shape',
      'POLYGON': 'shape',
      'STAR': 'shape',
      'VECTOR': 'vector',
      'LINE': 'line',
      'BOOLEAN_OPERATION': 'boolean',
      'SLICE': 'utility'
    };

    this.supportedProperties = [
      'id', 'name', 'type', 'visible', 'locked', 'opacity',
      'blendMode', 'isMask', 'constraints', 'layoutAlign',
      'layoutGrow', 'absoluteBoundingBox', 'absoluteRenderBounds',
      'size', 'relativeTransform', 'clipsContent', 'background',
      'fills', 'strokes', 'strokeWeight', 'strokeAlign',
      'strokeCap', 'strokeJoin', 'cornerRadius', 'effects'
    ];

    this.textProperties = [
      'characters', 'style', 'characterStyleOverrides',
      'styleOverrideTable', 'lineTypes', 'lineIndentations'
    ];
  }

  /**
   * Initialize the node parser
   */
  async initialize() {
    this.logger.info('✅ NodeParser initialized');
  }

  /**
   * Parse all nodes in a Figma document
   * @param {Object} document - Figma document node
   * @param {Object} options - Parsing options
   * @returns {Array} Normalized node array
   */
  async parseNodes(document, options = {}) {
    const startTime = Date.now();

    try {
      if (!document) {
        throw new Error('Document is required for node parsing');
      }

      this.logger.info('🔍 Parsing Figma nodes', {
        documentId: document.id,
        rootChildren: document.children?.length || 0
      });

      const parsedNodes = [];
      const nodeMap = new Map(); // For relationship tracking

      // Recursive parsing with relationship tracking
      const parseNodeRecursive = (node, parent = null, depth = 0) => {
        try {
          const normalizedNode = this.normalizeNode(node, parent, depth);
          parsedNodes.push(normalizedNode);
          nodeMap.set(node.id, normalizedNode);

          // Parse children recursively
          if (node.children && Array.isArray(node.children)) {
            normalizedNode.childrenIds = node.children.map(child => child.id);
            node.children.forEach(child => {
              parseNodeRecursive(child, normalizedNode, depth + 1);
            });
          }

          return normalizedNode;
        } catch (error) {
          this.logger.warn(`Failed to parse node ${node.id}:`, error);
          return this.generateFallbackNode(node, parent, depth);
        }
      };

      // Start parsing from document root
      parseNodeRecursive(document);

      // Add relationship data
      this.addRelationshipData(parsedNodes, nodeMap);

      const processingTime = Date.now() - startTime;
      this.logger.info('✅ Node parsing complete', {
        totalNodes: parsedNodes.length,
        processingTime,
        rootNodes: parsedNodes.filter(n => n.depth === 0).length
      });

      return parsedNodes;

    } catch (error) {
      this.logger.error('Node parsing failed:', error);
      return this.generateFallbackNodes(document);
    }
  }

  /**
   * Normalize a single Figma node into standard format
   */
  normalizeNode(node, parent = null, depth = 0) {
    const normalized = {
      // Core identification
      id: node.id,
      name: node.name || 'Unnamed',
      type: node.type,
      normalizedType: this.nodeTypeMap[node.type] || 'unknown',

      // Hierarchy
      parentId: parent?.id || null,
      depth,
      childrenIds: [],

      // Visibility and state
      visible: node.visible !== false,
      locked: node.locked === true,
      opacity: node.opacity || 1.0,

      // Transform and positioning
      transform: this.extractTransform(node),
      bounds: this.extractBounds(node),
      constraints: node.constraints || {},

      // Layout properties
      layout: this.extractLayoutProperties(node),

      // Visual properties
      visual: this.extractVisualProperties(node),

      // Type-specific properties
      typeSpecific: this.extractTypeSpecificProperties(node),

      // Metadata
      metadata: {
        blendMode: node.blendMode || 'NORMAL',
        isMask: node.isMask === true,
        exportSettings: node.exportSettings || [],
        pluginData: node.pluginData || {},
        sharedPluginData: node.sharedPluginData || {}
      }
    };

    return normalized;
  }

  /**
   * Extract transform and positioning data
   */
  extractTransform(node) {
    return {
      relativeTransform: node.relativeTransform || [[1, 0, 0], [0, 1, 0]],
      absoluteBoundingBox: node.absoluteBoundingBox || null,
      absoluteRenderBounds: node.absoluteRenderBounds || null,
      size: node.size || { width: 0, height: 0 }
    };
  }

  /**
   * Extract bounds information
   */
  extractBounds(node) {
    const bounds = node.absoluteBoundingBox;
    if (!bounds) {return null;}

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      right: bounds.x + bounds.width,
      bottom: bounds.y + bounds.height,
      center: {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      }
    };
  }

  /**
   * Extract layout-specific properties
   */
  extractLayoutProperties(node) {
    return {
      layoutAlign: node.layoutAlign || 'INHERIT',
      layoutGrow: node.layoutGrow || 0,
      layoutMode: node.layoutMode || 'NONE',
      primaryAxisSizingMode: node.primaryAxisSizingMode || 'AUTO',
      counterAxisSizingMode: node.counterAxisSizingMode || 'AUTO',
      primaryAxisAlignItems: node.primaryAxisAlignItems || 'MIN',
      counterAxisAlignItems: node.counterAxisAlignItems || 'MIN',
      paddingLeft: node.paddingLeft || 0,
      paddingRight: node.paddingRight || 0,
      paddingTop: node.paddingTop || 0,
      paddingBottom: node.paddingBottom || 0,
      itemSpacing: node.itemSpacing || 0,
      clipsContent: node.clipsContent === true
    };
  }

  /**
   * Extract visual properties (fills, strokes, effects)
   */
  extractVisualProperties(node) {
    return {
      fills: this.normalizeFills(node.fills),
      strokes: this.normalizeStrokes(node.strokes),
      strokeWeight: node.strokeWeight || 0,
      strokeAlign: node.strokeAlign || 'INSIDE',
      strokeCap: node.strokeCap || 'NONE',
      strokeJoin: node.strokeJoin || 'MITER',
      cornerRadius: this.extractCornerRadius(node),
      effects: this.normalizeEffects(node.effects)
    };
  }

  /**
   * Extract type-specific properties
   */
  extractTypeSpecificProperties(node) {
    const properties = {};

    switch (node.type) {
    case 'TEXT':
      properties.text = this.extractTextProperties(node);
      break;
    case 'COMPONENT':
      properties.component = this.extractComponentProperties(node);
      break;
    case 'INSTANCE':
      properties.instance = this.extractInstanceProperties(node);
      break;
    case 'FRAME':
    case 'GROUP':
      properties.container = this.extractContainerProperties(node);
      break;
    default:
      properties.generic = this.extractGenericProperties(node);
    }

    return properties;
  }

  /**
   * Extract text-specific properties
   */
  extractTextProperties(node) {
    return {
      characters: node.characters || '',
      style: node.style || {},
      characterStyleOverrides: node.characterStyleOverrides || [],
      styleOverrideTable: node.styleOverrideTable || {},
      lineTypes: node.lineTypes || [],
      lineIndentations: node.lineIndentations || [],
      fontSize: node.style?.fontSize || 12,
      fontFamily: node.style?.fontFamily || 'Arial',
      fontWeight: node.style?.fontWeight || 400,
      textAlign: node.style?.textAlignHorizontal || 'LEFT',
      textDecoration: node.style?.textDecoration || 'NONE'
    };
  }

  /**
   * Extract component properties
   */
  extractComponentProperties(node) {
    return {
      componentId: node.componentId,
      componentPropertyDefinitions: node.componentPropertyDefinitions || {},
      remote: node.remote === true,
      key: node.key || null,
      description: node.description || ''
    };
  }

  /**
   * Extract instance properties
   */
  extractInstanceProperties(node) {
    return {
      componentId: node.componentId,
      componentProperties: node.componentProperties || {},
      overrides: node.overrides || {},
      mainComponent: node.mainComponent || null,
      swapChain: node.swapChain || []
    };
  }

  /**
   * Extract container properties
   */
  extractContainerProperties(node) {
    return {
      background: node.background || [],
      backgroundColor: node.backgroundColor || null,
      layoutMode: node.layoutMode || 'NONE',
      counterAxisSizingMode: node.counterAxisSizingMode || 'AUTO',
      primaryAxisSizingMode: node.primaryAxisSizingMode || 'AUTO',
      clipsContent: node.clipsContent === true
    };
  }

  /**
   * Extract generic properties for other node types
   */
  extractGenericProperties(node) {
    const generic = {};

    // Extract any properties not covered by core normalization
    Object.keys(node).forEach(key => {
      if (!this.supportedProperties.includes(key) &&
          !this.textProperties.includes(key) &&
          !['id', 'name', 'type', 'children'].includes(key)) {
        generic[key] = node[key];
      }
    });

    return generic;
  }

  /**
   * Normalize fills array
   */
  normalizeFills(fills) {
    if (!Array.isArray(fills)) {return [];}

    return fills.map(fill => ({
      type: fill.type || 'SOLID',
      visible: fill.visible !== false,
      opacity: fill.opacity || 1,
      blendMode: fill.blendMode || 'NORMAL',
      color: fill.color || { r: 0, g: 0, b: 0, a: 1 },
      gradientHandlePositions: fill.gradientHandlePositions || [],
      gradientStops: fill.gradientStops || [],
      scaleMode: fill.scaleMode || 'FILL',
      imageTransform: fill.imageTransform || null,
      scalingFactor: fill.scalingFactor || null,
      imageRef: fill.imageRef || null
    }));
  }

  /**
   * Normalize strokes array
   */
  normalizeStrokes(strokes) {
    if (!Array.isArray(strokes)) {return [];}

    return strokes.map(stroke => ({
      type: stroke.type || 'SOLID',
      visible: stroke.visible !== false,
      opacity: stroke.opacity || 1,
      blendMode: stroke.blendMode || 'NORMAL',
      color: stroke.color || { r: 0, g: 0, b: 0, a: 1 }
    }));
  }

  /**
   * Extract corner radius (handle both single value and object)
   */
  extractCornerRadius(node) {
    if (typeof node.cornerRadius === 'number') {
      return {
        all: node.cornerRadius,
        topLeft: node.cornerRadius,
        topRight: node.cornerRadius,
        bottomLeft: node.cornerRadius,
        bottomRight: node.cornerRadius
      };
    }

    if (typeof node.cornerRadius === 'object') {
      return {
        all: null,
        topLeft: node.rectangleCornerRadii?.[0] || 0,
        topRight: node.rectangleCornerRadii?.[1] || 0,
        bottomRight: node.rectangleCornerRadii?.[2] || 0,
        bottomLeft: node.rectangleCornerRadii?.[3] || 0
      };
    }

    return { all: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 };
  }

  /**
   * Normalize effects array
   */
  normalizeEffects(effects) {
    if (!Array.isArray(effects)) {return [];}

    return effects.map(effect => ({
      type: effect.type || 'DROP_SHADOW',
      visible: effect.visible !== false,
      radius: effect.radius || 0,
      color: effect.color || { r: 0, g: 0, b: 0, a: 0.25 },
      blendMode: effect.blendMode || 'NORMAL',
      offset: effect.offset || { x: 0, y: 0 },
      spread: effect.spread || 0,
      showShadowBehindNode: effect.showShadowBehindNode !== false
    }));
  }

  /**
   * Add relationship data between nodes
   */
  addRelationshipData(parsedNodes, nodeMap) {
    parsedNodes.forEach(node => {
      // Add parent reference
      if (node.parentId && nodeMap.has(node.parentId)) {
        node.parent = nodeMap.get(node.parentId);
      }

      // Add children references
      node.children = node.childrenIds
        .map(id => nodeMap.get(id))
        .filter(child => child);

      // Add sibling information
      if (node.parent) {
        node.siblings = node.parent.children.filter(child => child.id !== node.id);
        node.siblingIndex = node.parent.children.findIndex(child => child.id === node.id);
      }
    });
  }

  /**
   * Generate fallback node when parsing fails
   */
  generateFallbackNode(node, parent, depth) {
    return {
      id: node.id || 'unknown',
      name: node.name || 'Parse Failed',
      type: node.type || 'UNKNOWN',
      normalizedType: 'unknown',
      parentId: parent?.id || null,
      depth,
      visible: true,
      error: 'Node parsing failed',
      transform: null,
      bounds: null,
      layout: {},
      visual: {},
      typeSpecific: {},
      metadata: {}
    };
  }

  /**
   * Generate fallback nodes when document parsing fails
   */
  generateFallbackNodes(document) {
    this.logger.warn('Generating fallback nodes due to parsing failure');

    return [{
      id: document?.id || 'fallback',
      name: 'Document Parse Failed',
      type: 'DOCUMENT',
      normalizedType: 'document',
      error: 'Document parsing failed',
      children: []
    }];
  }

  /**
   * Get parsing statistics
   */
  getParsingStats(parsedNodes) {
    const stats = {
      total: parsedNodes.length,
      byType: {},
      byDepth: {},
      errors: 0
    };

    parsedNodes.forEach(node => {
      // Count by type
      stats.byType[node.normalizedType] = (stats.byType[node.normalizedType] || 0) + 1;

      // Count by depth
      stats.byDepth[node.depth] = (stats.byDepth[node.depth] || 0) + 1;

      // Count errors
      if (node.error) {stats.errors++;}
    });

    return stats;
  }
}

export default NodeParser;