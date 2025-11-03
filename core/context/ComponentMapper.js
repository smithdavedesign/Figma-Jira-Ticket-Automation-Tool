/**
 * ComponentMapper - Design System Component Analysis
 *
 * Maps and analyzes design system component usage throughout the Figma file.
 * Identifies component instances, variants, overrides, and design system patterns.
 *
 * Handles:
 * - Component definition discovery
 * - Instance usage tracking and analysis
 * - Variant mapping and property analysis
 * - Override pattern detection
 * - Design system consistency validation
 * - Component relationship mapping
 */

import { Logger } from '../utils/logger.js';

export class ComponentMapper {
  constructor() {
    this.logger = new Logger('ComponentMapper');

    // Component analysis patterns
    this.componentPatterns = {
      commonTypes: ['button', 'input', 'card', 'modal', 'navigation', 'icon', 'avatar'],
      variantProperties: ['size', 'variant', 'state', 'type', 'color', 'disabled'],
      stateProperties: ['hover', 'active', 'disabled', 'loading', 'selected', 'focus']
    };

    // Instance analysis thresholds
    this.analysisThresholds = {
      minInstancesForPattern: 3, // Minimum instances to consider a pattern
      overrideSignificanceThreshold: 0.1, // 10% of instances must have override
      variantUsageThreshold: 2 // Minimum usage to consider variant significant
    };
  }

  /**
   * Initialize the component mapper
   */
  async initialize() {
    this.logger.info('✅ ComponentMapper initialized');
  }

  /**
   * Map all components and their usage patterns
   * @param {Object} document - Figma document node
   * @param {Object} options - Mapping options
   * @returns {Object} Component mapping analysis
   */
  async mapComponents(document, options = {}) {
    const startTime = Date.now();

    try {
      if (!document) {
        throw new Error('Document is required for component mapping');
      }

      this.logger.info('🧩 Mapping design system components', {
        documentId: document.id
      });

      // Find all components and instances
      const [components, instances] = await Promise.all([
        this.findAllComponents(document),
        this.findAllInstances(document)
      ]);

      // Analyze component relationships and patterns
      const analysis = {
        definitions: this.analyzeComponentDefinitions(components),
        instances: this.analyzeComponentInstances(instances),
        variants: this.analyzeComponentVariants(components, instances),
        overrides: this.analyzeOverridePatterns(instances),
        relationships: this.analyzeComponentRelationships(components, instances),
        designSystem: this.analyzeDesignSystemUsage(components, instances),
        patterns: this.identifyUsagePatterns(instances),
        consistency: this.validateDesignSystemConsistency(instances)
      };

      // Add metadata
      analysis.metadata = {
        totalComponents: components.length,
        totalInstances: instances.length,
        uniqueComponentsUsed: new Set(instances.map(i => i.componentId)).size,
        analysisTimestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };

      this.logger.info('✅ Component mapping complete', {
        components: components.length,
        instances: instances.length,
        variants: analysis.variants ? Object.keys(analysis.variants).length : 0,
        processingTime: analysis.metadata.processingTime
      });

      return analysis;

    } catch (error) {
      this.logger.error('Component mapping failed:', error);
      return this.generateFallbackMapping(error);
    }
  }

  /**
   * Find all component definitions in the document
   */
  async findAllComponents(document) {
    const components = [];

    const findComponentsRecursive = (node) => {
      if (!node) {return;}

      if (node.type === 'COMPONENT') {
        components.push({
          id: node.id,
          name: node.name,
          description: node.description || '',
          componentId: node.componentId,
          key: node.key,
          remote: node.remote === true,
          properties: node.componentPropertyDefinitions || {},
          bounds: node.absoluteBoundingBox,
          children: node.children || [],
          parentId: node.parent?.id || null,

          // Analysis metadata
          variantCount: this.countVariants(node),
          complexity: this.calculateComponentComplexity(node),
          category: this.categorizeComponent(node.name)
        });
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(findComponentsRecursive);
      }
    };

    findComponentsRecursive(document);
    return components;
  }

  /**
   * Find all component instances in the document
   */
  async findAllInstances(document) {
    const instances = [];

    const findInstancesRecursive = (node, depth = 0) => {
      if (!node) {return;}

      if (node.type === 'INSTANCE') {
        instances.push({
          id: node.id,
          name: node.name,
          componentId: node.componentId,
          mainComponent: node.mainComponent,
          properties: node.componentProperties || {},
          overrides: node.overrides || {},
          bounds: node.absoluteBoundingBox,
          parentId: node.parent?.id || null,
          depth,

          // Analysis metadata
          hasOverrides: Object.keys(node.overrides || {}).length > 0,
          propertyCount: Object.keys(node.componentProperties || {}).length,
          overrideCount: Object.keys(node.overrides || {}).length,
          swapChain: node.swapChain || []
        });
      }

      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => findInstancesRecursive(child, depth + 1));
      }
    };

    findInstancesRecursive(document);
    return instances;
  }

  /**
   * Analyze component definitions
   */
  analyzeComponentDefinitions(components) {
    const analysis = {
      total: components.length,
      byCategory: {},
      byComplexity: { simple: 0, moderate: 0, complex: 0 },
      withVariants: 0,
      withDescription: 0,
      remote: 0
    };

    components.forEach(component => {
      // Category analysis
      if (!analysis.byCategory[component.category]) {
        analysis.byCategory[component.category] = 0;
      }
      analysis.byCategory[component.category]++;

      // Complexity analysis
      if (component.complexity <= 5) {
        analysis.byComplexity.simple++;
      } else if (component.complexity <= 15) {
        analysis.byComplexity.moderate++;
      } else {
        analysis.byComplexity.complex++;
      }

      // Feature analysis
      if (component.variantCount > 0) {analysis.withVariants++;}
      if (component.description) {analysis.withDescription++;}
      if (component.remote) {analysis.remote++;}
    });

    return analysis;
  }

  /**
   * Analyze component instances
   */
  analyzeComponentInstances(instances) {
    const analysis = {
      total: instances.length,
      byComponent: {},
      withOverrides: 0,
      withProperties: 0,
      averageOverrides: 0,
      depthDistribution: {}
    };

    let totalOverrides = 0;

    instances.forEach(instance => {
      // Usage by component
      if (!analysis.byComponent[instance.componentId]) {
        analysis.byComponent[instance.componentId] = {
          count: 0,
          overrideRate: 0,
          instanceIds: []
        };
      }
      analysis.byComponent[instance.componentId].count++;
      analysis.byComponent[instance.componentId].instanceIds.push(instance.id);

      // Override analysis
      if (instance.hasOverrides) {
        analysis.withOverrides++;
        analysis.byComponent[instance.componentId].overrideRate++;
      }
      totalOverrides += instance.overrideCount;

      // Property analysis
      if (instance.propertyCount > 0) {
        analysis.withProperties++;
      }

      // Depth distribution
      if (!analysis.depthDistribution[instance.depth]) {
        analysis.depthDistribution[instance.depth] = 0;
      }
      analysis.depthDistribution[instance.depth]++;
    });

    // Calculate rates
    Object.keys(analysis.byComponent).forEach(componentId => {
      const component = analysis.byComponent[componentId];
      component.overrideRate = component.overrideRate / component.count;
    });

    analysis.averageOverrides = instances.length > 0 ? totalOverrides / instances.length : 0;

    return analysis;
  }

  /**
   * Analyze component variants
   */
  analyzeComponentVariants(components, instances) {
    const variants = {};

    components.forEach(component => {
      if (Object.keys(component.properties).length > 0) {
        variants[component.componentId] = {
          definition: component.properties,
          usage: {},
          combinations: new Set()
        };

        // Analyze instance usage
        const componentInstances = instances.filter(i => i.componentId === component.componentId);
        componentInstances.forEach(instance => {
          Object.entries(instance.properties).forEach(([prop, value]) => {
            if (!variants[component.componentId].usage[prop]) {
              variants[component.componentId].usage[prop] = {};
            }
            if (!variants[component.componentId].usage[prop][value]) {
              variants[component.componentId].usage[prop][value] = 0;
            }
            variants[component.componentId].usage[prop][value]++;
          });

          // Track property combinations
          const combination = JSON.stringify(instance.properties);
          variants[component.componentId].combinations.add(combination);
        });

        // Convert Set to Array for JSON serialization
        variants[component.componentId].combinations = Array.from(variants[component.componentId].combinations);
      }
    });

    return variants;
  }

  /**
   * Analyze override patterns
   */
  analyzeOverridePatterns(instances) {
    const patterns = {
      commonOverrides: {},
      overridesByType: {},
      frequentPatterns: []
    };

    instances.forEach(instance => {
      if (instance.hasOverrides) {
        Object.entries(instance.overrides).forEach(([nodeId, override]) => {
          // Track common override types
          const overrideType = this.categorizeOverride(override);
          if (!patterns.overridesByType[overrideType]) {
            patterns.overridesByType[overrideType] = 0;
          }
          patterns.overridesByType[overrideType]++;

          // Track specific overrides
          const overrideKey = `${overrideType}:${JSON.stringify(override)}`;
          if (!patterns.commonOverrides[overrideKey]) {
            patterns.commonOverrides[overrideKey] = {
              count: 0,
              type: overrideType,
              override,
              instances: []
            };
          }
          patterns.commonOverrides[overrideKey].count++;
          patterns.commonOverrides[overrideKey].instances.push(instance.id);
        });
      }
    });

    // Identify frequent patterns (used by multiple instances)
    patterns.frequentPatterns = Object.values(patterns.commonOverrides)
      .filter(pattern => pattern.count >= this.analysisThresholds.minInstancesForPattern)
      .sort((a, b) => b.count - a.count);

    return patterns;
  }

  /**
   * Analyze component relationships
   */
  analyzeComponentRelationships(components, instances) {
    const relationships = {
      nested: {},
      siblings: {},
      parentChild: {}
    };

    // Find nested component relationships
    instances.forEach(instance => {
      const parentInstances = instances.filter(i =>
        i.bounds && instance.bounds &&
        this.isNested(instance.bounds, i.bounds) &&
        i.id !== instance.id
      );

      if (parentInstances.length > 0) {
        parentInstances.forEach(parent => {
          const relationKey = `${parent.componentId}->${instance.componentId}`;
          if (!relationships.nested[relationKey]) {
            relationships.nested[relationKey] = {
              parent: parent.componentId,
              child: instance.componentId,
              count: 0
            };
          }
          relationships.nested[relationKey].count++;
        });
      }
    });

    return relationships;
  }

  /**
   * Analyze design system usage patterns
   */
  analyzeDesignSystemUsage(components, instances) {
    const designSystem = {
      coverage: 0,
      consistency: 0,
      adoption: {},
      gaps: []
    };

    // Calculate design system coverage
    const totalComponents = components.length;
    const usedComponents = new Set(instances.map(i => i.componentId)).size;
    designSystem.coverage = totalComponents > 0 ? usedComponents / totalComponents : 0;

    // Analyze component adoption
    components.forEach(component => {
      const usage = instances.filter(i => i.componentId === component.componentId).length;
      designSystem.adoption[component.componentId] = {
        name: component.name,
        category: component.category,
        usage,
        adoptionRate: usage > 0 ? 1 : 0
      };

      // Identify gaps (unused components)
      if (usage === 0) {
        designSystem.gaps.push({
          componentId: component.componentId,
          name: component.name,
          category: component.category,
          reason: 'unused'
        });
      }
    });

    return designSystem;
  }

  /**
   * Identify usage patterns
   */
  identifyUsagePatterns(instances) {
    const patterns = {
      hotspots: [], // Most used components
      variants: [], // Most used variant combinations
      contexts: [] // Common usage contexts
    };

    // Find hotspot components
    const componentUsage = {};
    instances.forEach(instance => {
      if (!componentUsage[instance.componentId]) {
        componentUsage[instance.componentId] = 0;
      }
      componentUsage[instance.componentId]++;
    });

    patterns.hotspots = Object.entries(componentUsage)
      .map(([componentId, count]) => ({ componentId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return patterns;
  }

  /**
   * Validate design system consistency
   */
  validateDesignSystemConsistency(instances) {
    const consistency = {
      score: 0,
      issues: [],
      recommendations: []
    };

    // Check for inconsistent component usage
    const componentGroups = this.groupInstancesByComponent(instances);

    Object.values(componentGroups).forEach(group => {
      if (group.length > 1) {
        const overrideConsistency = this.checkOverrideConsistency(group);
        if (overrideConsistency.score < 0.8) {
          consistency.issues.push({
            type: 'inconsistent_overrides',
            componentId: group[0].componentId,
            score: overrideConsistency.score,
            details: overrideConsistency.issues
          });
        }
      }
    });

    // Calculate overall consistency score
    consistency.score = consistency.issues.length === 0 ? 1.0 :
      Math.max(0, 1.0 - (consistency.issues.length * 0.1));

    return consistency;
  }

  /**
   * Count variants in a component
   */
  countVariants(component) {
    return Object.keys(component.componentPropertyDefinitions || {}).length;
  }

  /**
   * Calculate component complexity based on children and properties
   */
  calculateComponentComplexity(component) {
    let complexity = 0;

    // Base complexity from children
    if (component.children) {
      complexity += component.children.length;
    }

    // Add complexity from properties
    complexity += Object.keys(component.componentPropertyDefinitions || {}).length * 2;

    // Add complexity from nested structure
    const maxDepth = this.calculateMaxDepth(component);
    complexity += maxDepth;

    return complexity;
  }

  /**
   * Categorize component by name patterns
   */
  categorizeComponent(name) {
    const lowercaseName = name.toLowerCase();

    for (const type of this.componentPatterns.commonTypes) {
      if (lowercaseName.includes(type)) {
        return type;
      }
    }

    return 'other';
  }

  /**
   * Categorize override type
   */
  categorizeOverride(override) {
    if (override.fills) {return 'fill';}
    if (override.strokes) {return 'stroke';}
    if (override.characters) {return 'text';}
    if (override.visible !== undefined) {return 'visibility';}
    if (override.opacity !== undefined) {return 'opacity';}
    return 'other';
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
   * Group instances by component ID
   */
  groupInstancesByComponent(instances) {
    const groups = {};
    instances.forEach(instance => {
      if (!groups[instance.componentId]) {
        groups[instance.componentId] = [];
      }
      groups[instance.componentId].push(instance);
    });
    return groups;
  }

  /**
   * Check override consistency within a component group
   */
  checkOverrideConsistency(instanceGroup) {
    const consistency = {
      score: 1.0,
      issues: []
    };

    // Analyze override patterns
    const overridePatterns = {};
    instanceGroup.forEach(instance => {
      const overrideSignature = JSON.stringify(instance.overrides);
      if (!overridePatterns[overrideSignature]) {
        overridePatterns[overrideSignature] = 0;
      }
      overridePatterns[overrideSignature]++;
    });

    // Check if overrides are too diverse
    const uniquePatterns = Object.keys(overridePatterns).length;
    const totalInstances = instanceGroup.length;

    if (uniquePatterns / totalInstances > 0.5) {
      consistency.score = Math.max(0, 1.0 - (uniquePatterns / totalInstances));
      consistency.issues.push('High override diversity detected');
    }

    return consistency;
  }

  /**
   * Calculate maximum depth of component tree
   */
  calculateMaxDepth(node, currentDepth = 0) {
    if (!node.children || node.children.length === 0) {
      return currentDepth;
    }

    return Math.max(...node.children.map(child =>
      this.calculateMaxDepth(child, currentDepth + 1)
    ));
  }

  /**
   * Generate fallback mapping when analysis fails
   */
  generateFallbackMapping(error) {
    this.logger.warn('Generating fallback component mapping:', error);

    return {
      definitions: { total: 0, byCategory: {}, byComplexity: {} },
      instances: { total: 0, byComponent: {}, withOverrides: 0 },
      variants: {},
      overrides: { commonOverrides: {}, overridesByType: {} },
      relationships: { nested: {}, siblings: {} },
      designSystem: { coverage: 0, consistency: 0, adoption: {} },
      patterns: { hotspots: [], variants: [] },
      consistency: { score: 0, issues: [], recommendations: [] },
      metadata: {
        error: error.message,
        analysisTimestamp: new Date().toISOString()
      }
    };
  }
}

export default ComponentMapper;