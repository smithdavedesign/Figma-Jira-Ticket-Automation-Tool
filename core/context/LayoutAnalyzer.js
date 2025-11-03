/**
 * LayoutAnalyzer - Layout Relationship and Structure Analysis
 *
 * Extracts and analyzes layout relationships, positioning patterns,
 * grid systems, and responsive behavior from Figma designs.
 *
 * Handles:
 * - Auto-layout detection and analysis
 * - Grid system identification
 * - Spacing pattern recognition
 * - Alignment and positioning analysis
 * - Responsive behavior inference
 * - Layout hierarchy mapping
 */

import { Logger } from '../utils/logger.js';

export class LayoutAnalyzer {
  constructor() {
    this.logger = new Logger('LayoutAnalyzer');

    // Layout analysis patterns and thresholds
    this.layoutPatterns = {
      commonGridSizes: [12, 16, 24], // Common grid column counts
      spacingUnits: [4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64], // Common spacing values
      breakpoints: [320, 768, 1024, 1200, 1440], // Common responsive breakpoints
      alignmentThreshold: 2, // Pixels tolerance for alignment detection
      gridDetectionMinItems: 3 // Minimum items to detect a grid pattern
    };

    // Layout relationship types
    this.relationshipTypes = {
      HORIZONTAL: 'horizontal',
      VERTICAL: 'vertical',
      GRID: 'grid',
      STACK: 'stack',
      CLUSTER: 'cluster',
      ISOLATED: 'isolated'
    };
  }

  /**
   * Initialize the layout analyzer
   */
  async initialize() {
    this.logger.info('✅ LayoutAnalyzer initialized');
  }

  /**
   * Analyze layout patterns and relationships throughout the design
   * @param {Object} document - Figma document node
   * @param {Object} options - Analysis options
   * @returns {Object} Layout analysis results
   */
  async analyzeLayout(document, options = {}) {
    const startTime = Date.now();

    try {
      if (!document) {
        throw new Error('Document is required for layout analysis');
      }

      this.logger.info('📐 Analyzing layout relationships', {
        documentId: document.id
      });

      // Find all layout containers (frames with children)
      const layoutContainers = this.findLayoutContainers(document);

      // Analyze different aspects of layout
      const [
        autoLayoutAnalysis,
        gridSystemAnalysis,
        spacingAnalysis,
        alignmentAnalysis,
        hierarchyAnalysis,
        responsiveAnalysis
      ] = await Promise.all([
        this.analyzeAutoLayout(layoutContainers),
        this.analyzeGridSystems(layoutContainers),
        this.analyzeSpacingPatterns(layoutContainers),
        this.analyzeAlignmentPatterns(layoutContainers),
        this.analyzeLayoutHierarchy(document),
        this.analyzeResponsiveBehavior(layoutContainers)
      ]);

      const layoutAnalysis = {
        autoLayout: autoLayoutAnalysis,
        gridSystems: gridSystemAnalysis,
        spacing: spacingAnalysis,
        alignment: alignmentAnalysis,
        hierarchy: hierarchyAnalysis,
        responsive: responsiveAnalysis,

        // Layout relationships
        relationships: this.analyzeLayoutRelationships(layoutContainers),

        // Layout patterns
        patterns: this.identifyLayoutPatterns(layoutContainers),

        // Layout consistency
        consistency: this.validateLayoutConsistency(layoutContainers),

        // Metadata
        metadata: {
          totalContainers: layoutContainers.length,
          analysisTimestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          confidence: this.calculateLayoutConfidence(layoutContainers)
        }
      };

      this.logger.info('✅ Layout analysis complete', {
        containers: layoutContainers.length,
        autoLayoutFrames: autoLayoutAnalysis.frames?.length || 0,
        gridSystems: Object.keys(gridSystemAnalysis.detected || {}).length,
        processingTime: layoutAnalysis.metadata.processingTime
      });

      return layoutAnalysis;

    } catch (error) {
      this.logger.error('Layout analysis failed:', error);
      return this.generateFallbackLayoutAnalysis(error);
    }
  }

  /**
   * Find all layout containers (frames with children that might have layout)
   */
  findLayoutContainers(document) {
    const containers = [];

    const findContainersRecursive = (node, depth = 0) => {
      if (!node) {return;}

      // Check if node is a layout container
      if (this.isLayoutContainer(node)) {
        containers.push({
          id: node.id,
          name: node.name,
          type: node.type,
          bounds: node.absoluteBoundingBox,
          children: node.children || [],
          layoutMode: node.layoutMode,
          layoutAlign: node.layoutAlign,
          layoutGrow: node.layoutGrow,
          primaryAxisSizingMode: node.primaryAxisSizingMode,
          counterAxisSizingMode: node.counterAxisSizingMode,
          primaryAxisAlignItems: node.primaryAxisAlignItems,
          counterAxisAlignItems: node.counterAxisAlignItems,
          paddingLeft: node.paddingLeft || 0,
          paddingRight: node.paddingRight || 0,
          paddingTop: node.paddingTop || 0,
          paddingBottom: node.paddingBottom || 0,
          itemSpacing: node.itemSpacing || 0,
          depth,

          // Analysis helpers
          childCount: node.children?.length || 0,
          hasAutoLayout: node.layoutMode !== 'NONE',
          clipsContent: node.clipsContent === true
        });
      }

      // Recurse through children
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
          findContainersRecursive(child, depth + 1);
        });
      }
    };

    findContainersRecursive(document);
    return containers;
  }

  /**
   * Check if a node is a layout container
   */
  isLayoutContainer(node) {
    return (node.type === 'FRAME' || node.type === 'GROUP') &&
           node.children &&
           node.children.length > 0;
  }

  /**
   * Analyze auto-layout usage and patterns
   */
  async analyzeAutoLayout(containers) {
    const autoLayout = {
      frames: [],
      patterns: {},
      usage: {
        total: 0,
        horizontal: 0,
        vertical: 0,
        withSpacing: 0,
        withPadding: 0
      }
    };

    containers.forEach(container => {
      if (container.hasAutoLayout) {
        const frameData = {
          id: container.id,
          name: container.name,
          layoutMode: container.layoutMode,
          direction: container.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
          spacing: container.itemSpacing,
          padding: {
            top: container.paddingTop,
            right: container.paddingRight,
            bottom: container.paddingBottom,
            left: container.paddingLeft
          },
          alignment: {
            primary: container.primaryAxisAlignItems,
            counter: container.counterAxisAlignItems
          },
          sizing: {
            primary: container.primaryAxisSizingMode,
            counter: container.counterAxisSizingMode
          },
          childCount: container.childCount
        };

        autoLayout.frames.push(frameData);
        autoLayout.usage.total++;

        // Track patterns
        if (container.layoutMode === 'HORIZONTAL') {
          autoLayout.usage.horizontal++;
        } else if (container.layoutMode === 'VERTICAL') {
          autoLayout.usage.vertical++;
        }

        if (container.itemSpacing > 0) {
          autoLayout.usage.withSpacing++;
        }

        if (container.paddingTop > 0 || container.paddingRight > 0 ||
            container.paddingBottom > 0 || container.paddingLeft > 0) {
          autoLayout.usage.withPadding++;
        }

        // Track spacing patterns
        const spacingKey = container.itemSpacing.toString();
        if (!autoLayout.patterns[spacingKey]) {
          autoLayout.patterns[spacingKey] = 0;
        }
        autoLayout.patterns[spacingKey]++;
      }
    });

    return autoLayout;
  }

  /**
   * Analyze grid systems and patterns
   */
  async analyzeGridSystems(containers) {
    const gridSystems = {
      detected: {},
      patterns: [],
      usage: {
        totalGrids: 0,
        averageColumns: 0,
        averageRows: 0
      }
    };

    containers.forEach(container => {
      if (container.children.length >= this.layoutPatterns.gridDetectionMinItems) {
        const gridAnalysis = this.detectGridPattern(container);

        if (gridAnalysis.isGrid) {
          gridSystems.detected[container.id] = {
            name: container.name,
            columns: gridAnalysis.columns,
            rows: gridAnalysis.rows,
            itemCount: container.childCount,
            spacing: gridAnalysis.spacing,
            alignment: gridAnalysis.alignment,
            bounds: container.bounds
          };

          gridSystems.usage.totalGrids++;
        }
      }
    });

    // Calculate averages
    const detectedGrids = Object.values(gridSystems.detected);
    if (detectedGrids.length > 0) {
      gridSystems.usage.averageColumns = detectedGrids.reduce((sum, grid) => sum + grid.columns, 0) / detectedGrids.length;
      gridSystems.usage.averageRows = detectedGrids.reduce((sum, grid) => sum + grid.rows, 0) / detectedGrids.length;
    }

    return gridSystems;
  }

  /**
   * Detect grid pattern in a container
   */
  detectGridPattern(container) {
    const analysis = {
      isGrid: false,
      columns: 0,
      rows: 0,
      spacing: { x: 0, y: 0 },
      alignment: 'unknown'
    };

    if (!container.children || container.children.length < 2) {
      return analysis;
    }

    // Get positioned children (with bounds)
    const positionedChildren = container.children.filter(child => child.absoluteBoundingBox);

    if (positionedChildren.length < this.layoutPatterns.gridDetectionMinItems) {
      return analysis;
    }

    // Analyze horizontal alignment (rows)
    const rowGroups = this.groupByYPosition(positionedChildren);

    // Analyze vertical alignment (columns)
    const columnGroups = this.groupByXPosition(positionedChildren);

    // Determine if it's a grid pattern
    if (rowGroups.length > 1 && columnGroups.length > 1) {
      analysis.isGrid = true;
      analysis.rows = rowGroups.length;
      analysis.columns = columnGroups.length;

      // Calculate spacing
      analysis.spacing = this.calculateGridSpacing(positionedChildren, rowGroups, columnGroups);

      // Determine alignment
      analysis.alignment = this.determineGridAlignment(positionedChildren);
    }

    return analysis;
  }

  /**
   * Group elements by Y position (rows)
   */
  groupByYPosition(elements) {
    const groups = [];
    const threshold = this.layoutPatterns.alignmentThreshold;

    elements.forEach(element => {
      const y = element.absoluteBoundingBox.y;
      let foundGroup = false;

      for (const group of groups) {
        if (Math.abs(group.y - y) <= threshold) {
          group.elements.push(element);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push({ y, elements: [element] });
      }
    });

    return groups.sort((a, b) => a.y - b.y);
  }

  /**
   * Group elements by X position (columns)
   */
  groupByXPosition(elements) {
    const groups = [];
    const threshold = this.layoutPatterns.alignmentThreshold;

    elements.forEach(element => {
      const x = element.absoluteBoundingBox.x;
      let foundGroup = false;

      for (const group of groups) {
        if (Math.abs(group.x - x) <= threshold) {
          group.elements.push(element);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push({ x, elements: [element] });
      }
    });

    return groups.sort((a, b) => a.x - b.x);
  }

  /**
   * Calculate grid spacing
   */
  calculateGridSpacing(elements, rowGroups, columnGroups) {
    const spacing = { x: 0, y: 0 };

    // Calculate horizontal spacing (between columns)
    if (columnGroups.length > 1) {
      const xPositions = columnGroups.map(group => group.x).sort((a, b) => a - b);
      const xSpacings = [];

      for (let i = 1; i < xPositions.length; i++) {
        xSpacings.push(xPositions[i] - xPositions[i - 1]);
      }

      spacing.x = xSpacings.length > 0 ? xSpacings.reduce((sum, s) => sum + s, 0) / xSpacings.length : 0;
    }

    // Calculate vertical spacing (between rows)
    if (rowGroups.length > 1) {
      const yPositions = rowGroups.map(group => group.y).sort((a, b) => a - b);
      const ySpacings = [];

      for (let i = 1; i < yPositions.length; i++) {
        ySpacings.push(yPositions[i] - yPositions[i - 1]);
      }

      spacing.y = ySpacings.length > 0 ? ySpacings.reduce((sum, s) => sum + s, 0) / ySpacings.length : 0;
    }

    return spacing;
  }

  /**
   * Determine grid alignment pattern
   */
  determineGridAlignment(elements) {
    // Simplified alignment detection
    const leftAligned = elements.filter(el =>
      Math.abs(el.absoluteBoundingBox.x - elements[0].absoluteBoundingBox.x) <= this.layoutPatterns.alignmentThreshold
    ).length;

    if (leftAligned > elements.length * 0.8) {
      return 'left';
    }

    return 'mixed';
  }

  /**
   * Analyze spacing patterns
   */
  async analyzeSpacingPatterns(containers) {
    const spacing = {
      patterns: {},
      distribution: {},
      consistency: 0
    };

    const allSpacings = [];

    containers.forEach(container => {
      if (container.hasAutoLayout && container.itemSpacing > 0) {
        allSpacings.push(container.itemSpacing);

        const spacingKey = container.itemSpacing.toString();
        if (!spacing.patterns[spacingKey]) {
          spacing.patterns[spacingKey] = { value: container.itemSpacing, count: 0, containers: [] };
        }
        spacing.patterns[spacingKey].count++;
        spacing.patterns[spacingKey].containers.push(container.id);
      }
    });

    // Analyze distribution
    this.layoutPatterns.spacingUnits.forEach(unit => {
      const matches = allSpacings.filter(s => s === unit).length;
      if (matches > 0) {
        spacing.distribution[unit] = matches;
      }
    });

    // Calculate consistency (how often standard spacing units are used)
    const standardSpacings = allSpacings.filter(s => this.layoutPatterns.spacingUnits.includes(s));
    spacing.consistency = allSpacings.length > 0 ? standardSpacings.length / allSpacings.length : 0;

    return spacing;
  }

  /**
   * Analyze alignment patterns
   */
  async analyzeAlignmentPatterns(containers) {
    const alignment = {
      horizontal: {},
      vertical: {},
      mixed: 0
    };

    containers.forEach(container => {
      if (container.hasAutoLayout) {
        // Primary axis alignment
        const primaryAlign = container.primaryAxisAlignItems || 'MIN';
        if (!alignment.horizontal[primaryAlign]) {
          alignment.horizontal[primaryAlign] = 0;
        }
        alignment.horizontal[primaryAlign]++;

        // Counter axis alignment
        const counterAlign = container.counterAxisAlignItems || 'MIN';
        if (!alignment.vertical[counterAlign]) {
          alignment.vertical[counterAlign] = 0;
        }
        alignment.vertical[counterAlign]++;

        // Check for mixed alignments
        if (primaryAlign !== 'MIN' && counterAlign !== 'MIN') {
          alignment.mixed++;
        }
      }
    });

    return alignment;
  }

  /**
   * Analyze layout hierarchy
   */
  async analyzeLayoutHierarchy(document) {
    const hierarchy = {
      levels: {},
      maxDepth: 0,
      branching: {}
    };

    const analyzeHierarchyRecursive = (node, depth = 0) => {
      if (!node) {return;}

      // Track depth levels
      if (!hierarchy.levels[depth]) {
        hierarchy.levels[depth] = 0;
      }
      hierarchy.levels[depth]++;

      // Update max depth
      hierarchy.maxDepth = Math.max(hierarchy.maxDepth, depth);

      // Track branching factor
      if (node.children && node.children.length > 0) {
        const childCount = node.children.length;
        if (!hierarchy.branching[childCount]) {
          hierarchy.branching[childCount] = 0;
        }
        hierarchy.branching[childCount]++;

        // Recurse through children
        node.children.forEach(child => {
          analyzeHierarchyRecursive(child, depth + 1);
        });
      }
    };

    analyzeHierarchyRecursive(document);
    return hierarchy;
  }

  /**
   * Analyze responsive behavior patterns
   */
  async analyzeResponsiveBehavior(containers) {
    const responsive = {
      constraints: {},
      flexible: 0,
      fixed: 0,
      adaptive: 0
    };

    containers.forEach(container => {
      // Analyze sizing modes
      if (container.primaryAxisSizingMode === 'AUTO' || container.counterAxisSizingMode === 'AUTO') {
        responsive.flexible++;
      } else {
        responsive.fixed++;
      }

      // Analyze layout grow behavior
      if (container.layoutGrow > 0) {
        responsive.adaptive++;
      }
    });

    return responsive;
  }

  /**
   * Analyze layout relationships between containers
   */
  analyzeLayoutRelationships(containers) {
    const relationships = {
      parent_child: [],
      siblings: [],
      nested: []
    };

    // Find parent-child relationships
    containers.forEach(container => {
      containers.forEach(otherContainer => {
        if (container.id !== otherContainer.id) {
          if (this.isDirectChild(container, otherContainer)) {
            relationships.parent_child.push({
              parent: otherContainer.id,
              child: container.id,
              relationship: 'direct_child'
            });
          } else if (this.isNested(container.bounds, otherContainer.bounds)) {
            relationships.nested.push({
              inner: container.id,
              outer: otherContainer.id,
              relationship: 'nested'
            });
          }
        }
      });
    });

    return relationships;
  }

  /**
   * Check if container is a direct child of another
   */
  isDirectChild(child, parent) {
    return parent.children.some(childNode => childNode.id === child.id);
  }

  /**
   * Check if one bounds is nested inside another
   */
  isNested(inner, outer) {
    if (!inner || !outer) {return false;}

    return inner.x >= outer.x &&
           inner.y >= outer.y &&
           inner.x + inner.width <= outer.x + outer.width &&
           inner.y + inner.height <= outer.y + outer.height;
  }

  /**
   * Identify common layout patterns
   */
  identifyLayoutPatterns(containers) {
    const patterns = {
      common: [],
      unique: [],
      repeated: []
    };

    // Analyze layout signatures
    const signatures = {};

    containers.forEach(container => {
      const signature = this.generateLayoutSignature(container);
      if (!signatures[signature]) {
        signatures[signature] = [];
      }
      signatures[signature].push(container);
    });

    // Categorize patterns
    Object.entries(signatures).forEach(([signature, containers]) => {
      if (containers.length === 1) {
        patterns.unique.push({ signature, containers });
      } else if (containers.length > 1) {
        patterns.repeated.push({ signature, containers, count: containers.length });
      }
    });

    // Sort repeated patterns by frequency
    patterns.repeated.sort((a, b) => b.count - a.count);

    // Mark most common patterns
    patterns.common = patterns.repeated.slice(0, 5);

    return patterns;
  }

  /**
   * Generate layout signature for pattern detection
   */
  generateLayoutSignature(container) {
    return `${container.layoutMode || 'NONE'}_${container.childCount}_${container.itemSpacing || 0}_${container.hasAutoLayout}`;
  }

  /**
   * Validate layout consistency
   */
  validateLayoutConsistency(containers) {
    const consistency = {
      score: 0,
      issues: [],
      recommendations: []
    };

    // Check spacing consistency
    const spacings = containers
      .filter(c => c.hasAutoLayout && c.itemSpacing > 0)
      .map(c => c.itemSpacing);

    const uniqueSpacings = [...new Set(spacings)];
    const spacingConsistency = spacings.length > 0 ? 1 - (uniqueSpacings.length / spacings.length) : 1;

    if (spacingConsistency < 0.7) {
      consistency.issues.push({
        type: 'spacing_inconsistency',
        severity: 'medium',
        details: `${uniqueSpacings.length} different spacing values used`
      });
    }

    // Check padding consistency
    const paddingPatterns = containers
      .filter(c => c.hasAutoLayout)
      .map(c => `${c.paddingTop}_${c.paddingRight}_${c.paddingBottom}_${c.paddingLeft}`);

    const uniquePaddingPatterns = [...new Set(paddingPatterns)];
    const paddingConsistency = paddingPatterns.length > 0 ? 1 - (uniquePaddingPatterns.length / paddingPatterns.length) : 1;

    // Calculate overall consistency score
    consistency.score = (spacingConsistency + paddingConsistency) / 2;

    return consistency;
  }

  /**
   * Calculate layout analysis confidence
   */
  calculateLayoutConfidence(containers) {
    let confidence = 0;
    let factors = 0;

    // Factor 1: Number of containers analyzed
    if (containers.length > 0) {
      confidence += Math.min(containers.length / 10, 1) * 0.25;
      factors++;
    }

    // Factor 2: Auto-layout usage
    const autoLayoutContainers = containers.filter(c => c.hasAutoLayout);
    if (autoLayoutContainers.length > 0) {
      confidence += (autoLayoutContainers.length / containers.length) * 0.25;
      factors++;
    }

    // Factor 3: Layout diversity
    const layoutModes = [...new Set(containers.map(c => c.layoutMode))];
    if (layoutModes.length > 1) {
      confidence += 0.25;
      factors++;
    }

    // Factor 4: Hierarchy depth
    const maxDepth = Math.max(...containers.map(c => c.depth));
    if (maxDepth > 2) {
      confidence += 0.25;
      factors++;
    }

    return factors > 0 ? confidence : 0.1;
  }

  /**
   * Generate fallback layout analysis
   */
  generateFallbackLayoutAnalysis(error) {
    this.logger.warn('Generating fallback layout analysis:', error);

    return {
      autoLayout: { frames: [], patterns: {}, usage: {} },
      gridSystems: { detected: {}, patterns: [], usage: {} },
      spacing: { patterns: {}, distribution: {}, consistency: 0 },
      alignment: { horizontal: {}, vertical: {}, mixed: 0 },
      hierarchy: { levels: {}, maxDepth: 0, branching: {} },
      responsive: { constraints: {}, flexible: 0, fixed: 0 },
      relationships: { parent_child: [], siblings: [], nested: [] },
      patterns: { common: [], unique: [], repeated: [] },
      consistency: { score: 0, issues: [], recommendations: [] },
      metadata: {
        error: error.message,
        analysisTimestamp: new Date().toISOString(),
        confidence: 0.1
      }
    };
  }
}

export default LayoutAnalyzer;