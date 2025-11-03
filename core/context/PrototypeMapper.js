/**
 * PrototypeMapper - Figma Prototype Flow Analysis
 *
 * Maps and analyzes prototype connections, user flows, and interaction patterns
 * from Figma prototypes to understand user journey and navigation structure.
 *
 * Handles:
 * - Prototype connection discovery and mapping
 * - User flow path analysis
 * - Interaction trigger identification
 * - Navigation pattern recognition
 * - Flow complexity analysis
 * - Dead-end and loop detection
 */

import { Logger } from '../utils/logger.js';

export class PrototypeMapper {
  constructor() {
    this.logger = new Logger('PrototypeMapper');

    // Prototype analysis patterns
    this.prototypePatterns = {
      interactionTypes: [
        'ON_CLICK', 'ON_HOVER', 'ON_PRESS', 'ON_DRAG',
        'WHILE_HOVERING', 'WHILE_PRESSING', 'MOUSE_ENTER',
        'MOUSE_LEAVE', 'ON_KEY_DOWN', 'AFTER_TIMEOUT'
      ],
      transitionTypes: [
        'DISSOLVE', 'SMART_ANIMATE', 'MOVE_IN', 'MOVE_OUT',
        'PUSH', 'SLIDE_IN', 'SLIDE_OUT', 'INSTANT'
      ],
      overlayTypes: [
        'MANUAL', 'ON_CLICK_OUTSIDE', 'ON_PRESS_ESCAPE'
      ]
    };

    // Flow analysis thresholds
    this.analysisThresholds = {
      maxFlowDepth: 10, // Maximum depth for flow traversal
      minFlowLength: 2, // Minimum connections to consider a flow
      loopDetectionLimit: 100, // Maximum iterations for loop detection
      deadEndThreshold: 0.1 // Percentage of flows that end without continuation
    };
  }

  /**
   * Initialize the prototype mapper
   */
  async initialize() {
    this.logger.info('✅ PrototypeMapper initialized');
  }

  /**
   * Map all prototype connections and analyze user flows
   * @param {Object} document - Figma document node
   * @param {Object} options - Mapping options
   * @returns {Object} Prototype mapping and flow analysis
   */
  async mapPrototypes(document, options = {}) {
    const startTime = Date.now();

    try {
      if (!document) {
        throw new Error('Document is required for prototype mapping');
      }

      this.logger.info('🔗 Mapping prototype connections and flows', {
        documentId: document.id
      });

      // Find all prototype connections
      const connections = this.findAllConnections(document);

      if (connections.length === 0) {
        this.logger.info('📋 No prototype connections found');
        return this.generateEmptyPrototypeMap();
      }

      // Analyze different aspects of prototyping
      const [
        flowAnalysis,
        interactionAnalysis,
        navigationAnalysis,
        transitionAnalysis,
        overlayAnalysis
      ] = await Promise.all([
        this.analyzeUserFlows(connections, document),
        this.analyzeInteractionPatterns(connections),
        this.analyzeNavigationStructure(connections, document),
        this.analyzeTransitionPatterns(connections),
        this.analyzeOverlayBehavior(connections)
      ]);

      const prototypeMap = {
        connections: this.normalizeConnections(connections),
        flows: flowAnalysis,
        interactions: interactionAnalysis,
        navigation: navigationAnalysis,
        transitions: transitionAnalysis,
        overlays: overlayAnalysis,

        // Flow validation
        validation: this.validateFlows(flowAnalysis, connections),

        // Flow patterns
        patterns: this.identifyFlowPatterns(flowAnalysis),

        // Metadata
        metadata: {
          totalConnections: connections.length,
          uniqueScreens: this.countUniqueScreens(connections),
          analysisTimestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          confidence: this.calculatePrototypeConfidence(connections, flowAnalysis)
        }
      };

      this.logger.info('✅ Prototype mapping complete', {
        connections: connections.length,
        flows: flowAnalysis.paths?.length || 0,
        screens: prototypeMap.metadata.uniqueScreens,
        processingTime: prototypeMap.metadata.processingTime
      });

      return prototypeMap;

    } catch (error) {
      this.logger.error('Prototype mapping failed:', error);
      return this.generateFallbackPrototypeMap(error);
    }
  }

  /**
   * Find all prototype connections in the document
   */
  findAllConnections(document) {
    const connections = [];

    const findConnectionsRecursive = (node) => {
      if (!node) {return;}

      // Check for prototype reactions on this node
      if (node.reactions && Array.isArray(node.reactions)) {
        node.reactions.forEach((reaction, index) => {
          if (reaction.action && reaction.trigger) {
            connections.push({
              id: `${node.id}_${index}`,
              sourceNodeId: node.id,
              sourceName: node.name || 'Unnamed',
              sourceType: node.type,

              // Trigger information
              trigger: {
                type: reaction.trigger.type,
                delay: reaction.trigger.delay || 0,
                timeout: reaction.trigger.timeout || null
              },

              // Action information
              action: this.normalizeAction(reaction.action),

              // Source node bounds for visualization
              sourceBounds: node.absoluteBoundingBox,

              // Analysis metadata
              reactionIndex: index,
              hasMultipleReactions: node.reactions.length > 1
            });
          }
        });
      }

      // Recurse through children
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(findConnectionsRecursive);
      }
    };

    findConnectionsRecursive(document);
    return connections;
  }

  /**
   * Normalize action data for consistent analysis
   */
  normalizeAction(action) {
    const normalized = {
      type: action.type,
      destinationId: null,
      url: null,
      transition: null,
      overlay: null,
      preserveScrollPosition: false,
      resetVideoPosition: false
    };

    switch (action.type) {
    case 'NODE':
      normalized.destinationId = action.destinationId;
      if (action.navigation) {
        normalized.transition = {
          type: action.navigation.type || 'INSTANT',
          duration: action.navigation.duration || 0,
          easing: action.navigation.easing || 'EASE_OUT',
          direction: action.navigation.direction || null
        };
      }
      normalized.preserveScrollPosition = action.preserveScrollPosition === true;
      normalized.resetVideoPosition = action.resetVideoPosition === true;
      break;

    case 'URL':
      normalized.url = action.url;
      break;

    case 'OVERLAY':
      normalized.destinationId = action.destinationId;
      normalized.overlay = {
        overlayRelativePosition: action.overlayRelativePosition || 'CENTER',
        closeWhenClickOutside: action.overlaySettings?.closeWhenClickOutside !== false,
        closeWhenPressEscape: action.overlaySettings?.closeWhenPressEscape !== false,
        backgroundInteraction: action.overlaySettings?.backgroundInteraction || 'NONE'
      };
      break;

    case 'BACK':
    case 'CLOSE':
      // No additional properties needed
      break;
    }

    return normalized;
  }

  /**
   * Analyze user flows and journey paths
   */
  async analyzeUserFlows(connections, document) {
    const flows = {
      paths: [],
      entryPoints: [],
      exitPoints: [],
      loops: [],
      deadEnds: [],
      statistics: {
        averagePathLength: 0,
        maxPathLength: 0,
        totalPaths: 0,
        branchingFactor: 0
      }
    };

    try {
      // Find entry points (nodes that are targets but not sources)
      const sourceIds = new Set(connections.map(c => c.sourceNodeId));
      const targetIds = new Set(connections.filter(c => c.action.destinationId).map(c => c.action.destinationId));

      flows.entryPoints = Array.from(targetIds).filter(id => !sourceIds.has(id));

      // If no clear entry points, use all sources as potential entries
      if (flows.entryPoints.length === 0) {
        flows.entryPoints = Array.from(sourceIds);
      }

      // Generate flow paths from each entry point
      flows.entryPoints.forEach(entryPoint => {
        const pathsFromEntry = this.generateFlowPaths(entryPoint, connections);
        flows.paths.push(...pathsFromEntry);
      });

      // Identify dead ends (sources with no outgoing connections)
      flows.deadEnds = Array.from(sourceIds).filter(id => !targetIds.has(id));

      // Detect loops
      flows.loops = this.detectLoops(connections);

      // Calculate statistics
      flows.statistics = this.calculateFlowStatistics(flows.paths);

      return flows;

    } catch (error) {
      this.logger.warn('Flow analysis failed:', error);
      return { paths: [], entryPoints: [], exitPoints: [], loops: [], deadEnds: [] };
    }
  }

  /**
   * Generate all possible flow paths from a starting point
   */
  generateFlowPaths(startNodeId, connections, visited = new Set(), path = [], maxDepth = this.analysisThresholds.maxFlowDepth) {
    if (maxDepth <= 0 || visited.has(startNodeId)) {
      return path.length >= this.analysisThresholds.minFlowLength ? [path] : [];
    }

    const paths = [];
    const outgoingConnections = connections.filter(c => c.sourceNodeId === startNodeId);

    if (outgoingConnections.length === 0) {
      // Dead end - return current path if it's long enough
      return path.length >= this.analysisThresholds.minFlowLength ? [path] : [];
    }

    outgoingConnections.forEach(connection => {
      if (connection.action.destinationId && !visited.has(connection.action.destinationId)) {
        const newVisited = new Set(visited);
        newVisited.add(startNodeId);

        const newPath = [...path, {
          from: startNodeId,
          to: connection.action.destinationId,
          connection: connection.id,
          trigger: connection.trigger.type,
          action: connection.action.type
        }];

        const continuedPaths = this.generateFlowPaths(
          connection.action.destinationId,
          connections,
          newVisited,
          newPath,
          maxDepth - 1
        );

        paths.push(...continuedPaths);
      }
    });

    return paths;
  }

  /**
   * Detect loops in the prototype flows
   */
  detectLoops(connections) {
    const loops = [];
    const visitedPaths = new Set();

    connections.forEach(connection => {
      if (connection.action.destinationId) {
        const loopPath = this.findLoopFromNode(
          connection.sourceNodeId,
          connection.action.destinationId,
          connections,
          new Set(),
          [connection.sourceNodeId]
        );

        if (loopPath.length > 0) {
          const pathKey = loopPath.sort().join('-');
          if (!visitedPaths.has(pathKey)) {
            visitedPaths.add(pathKey);
            loops.push({
              nodes: loopPath,
              length: loopPath.length,
              type: loopPath.length === 2 ? 'direct' : 'indirect'
            });
          }
        }
      }
    });

    return loops;
  }

  /**
   * Find if there's a loop path back to the starting node
   */
  findLoopFromNode(targetNodeId, currentNodeId, connections, visited, path) {
    if (currentNodeId === targetNodeId && path.length > 1) {
      return path;
    }

    if (visited.has(currentNodeId) || path.length > this.analysisThresholds.loopDetectionLimit) {
      return [];
    }

    const newVisited = new Set(visited);
    newVisited.add(currentNodeId);

    const outgoingConnections = connections.filter(c => c.sourceNodeId === currentNodeId);

    for (const connection of outgoingConnections) {
      if (connection.action.destinationId) {
        const newPath = [...path, connection.action.destinationId];
        const loopPath = this.findLoopFromNode(
          targetNodeId,
          connection.action.destinationId,
          connections,
          newVisited,
          newPath
        );

        if (loopPath.length > 0) {
          return loopPath;
        }
      }
    }

    return [];
  }

  /**
   * Analyze interaction patterns
   */
  async analyzeInteractionPatterns(connections) {
    const interactions = {
      byTrigger: {},
      byAction: {},
      combinations: {},
      complexity: 0
    };

    connections.forEach(connection => {
      // Count by trigger type
      const triggerType = connection.trigger.type;
      if (!interactions.byTrigger[triggerType]) {
        interactions.byTrigger[triggerType] = 0;
      }
      interactions.byTrigger[triggerType]++;

      // Count by action type
      const actionType = connection.action.type;
      if (!interactions.byAction[actionType]) {
        interactions.byAction[actionType] = 0;
      }
      interactions.byAction[actionType]++;

      // Track trigger-action combinations
      const combination = `${triggerType}->${actionType}`;
      if (!interactions.combinations[combination]) {
        interactions.combinations[combination] = 0;
      }
      interactions.combinations[combination]++;
    });

    // Calculate interaction complexity
    const triggerTypes = Object.keys(interactions.byTrigger).length;
    const actionTypes = Object.keys(interactions.byAction).length;
    interactions.complexity = triggerTypes * actionTypes / connections.length;

    return interactions;
  }

  /**
   * Analyze navigation structure
   */
  async analyzeNavigationStructure(connections, document) {
    const navigation = {
      hierarchy: {},
      breadth: 0,
      depth: 0,
      hubs: [], // Nodes with many incoming connections
      connectors: [] // Nodes with many outgoing connections
    };

    try {
      // Build adjacency lists
      const outgoing = {};
      const incoming = {};

      connections.forEach(connection => {
        const source = connection.sourceNodeId;
        const target = connection.action.destinationId;

        if (target) {
          // Outgoing connections
          if (!outgoing[source]) {outgoing[source] = [];}
          outgoing[source].push(target);

          // Incoming connections
          if (!incoming[target]) {incoming[target] = [];}
          incoming[target].push(source);
        }
      });

      // Find hubs (nodes with many incoming connections)
      Object.entries(incoming).forEach(([nodeId, incomingList]) => {
        if (incomingList.length > 2) {
          navigation.hubs.push({
            nodeId,
            incomingCount: incomingList.length,
            incomingFrom: incomingList
          });
        }
      });

      // Find connectors (nodes with many outgoing connections)
      Object.entries(outgoing).forEach(([nodeId, outgoingList]) => {
        if (outgoingList.length > 2) {
          navigation.connectors.push({
            nodeId,
            outgoingCount: outgoingList.length,
            outgoingTo: outgoingList
          });
        }
      });

      // Calculate navigation breadth and depth
      navigation.breadth = Math.max(...Object.values(outgoing).map(list => list.length));
      navigation.depth = this.calculateMaxNavigationDepth(outgoing);

      return navigation;

    } catch (error) {
      this.logger.warn('Navigation structure analysis failed:', error);
      return { hierarchy: {}, breadth: 0, depth: 0, hubs: [], connectors: [] };
    }
  }

  /**
   * Calculate maximum navigation depth
   */
  calculateMaxNavigationDepth(outgoingMap, startNode = null, visited = new Set(), depth = 0) {
    if (!startNode) {
      // Find all possible start nodes and get maximum depth
      const allNodes = Object.keys(outgoingMap);
      return Math.max(...allNodes.map(node =>
        this.calculateMaxNavigationDepth(outgoingMap, node, new Set(), 0)
      ).filter(d => d > 0));
    }

    if (visited.has(startNode) || depth > this.analysisThresholds.maxFlowDepth) {
      return depth;
    }

    const newVisited = new Set(visited);
    newVisited.add(startNode);

    const outgoing = outgoingMap[startNode] || [];
    if (outgoing.length === 0) {
      return depth;
    }

    return Math.max(...outgoing.map(target =>
      this.calculateMaxNavigationDepth(outgoingMap, target, newVisited, depth + 1)
    ));
  }

  /**
   * Analyze transition patterns
   */
  async analyzeTransitionPatterns(connections) {
    const transitions = {
      byType: {},
      byDuration: {},
      averageDuration: 0,
      smartAnimateUsage: 0
    };

    let totalDuration = 0;
    let transitionCount = 0;

    connections.forEach(connection => {
      if (connection.action.transition) {
        const transition = connection.action.transition;

        // Count by transition type
        const transitionType = transition.type;
        if (!transitions.byType[transitionType]) {
          transitions.byType[transitionType] = 0;
        }
        transitions.byType[transitionType]++;

        // Track duration
        const duration = transition.duration || 0;
        totalDuration += duration;
        transitionCount++;

        // Track duration ranges
        const durationRange = this.getDurationRange(duration);
        if (!transitions.byDuration[durationRange]) {
          transitions.byDuration[durationRange] = 0;
        }
        transitions.byDuration[durationRange]++;

        // Track Smart Animate usage
        if (transitionType === 'SMART_ANIMATE') {
          transitions.smartAnimateUsage++;
        }
      }
    });

    // Calculate averages
    transitions.averageDuration = transitionCount > 0 ? totalDuration / transitionCount : 0;
    transitions.smartAnimateUsage = transitionCount > 0 ? transitions.smartAnimateUsage / transitionCount : 0;

    return transitions;
  }

  /**
   * Get duration range category
   */
  getDurationRange(duration) {
    if (duration === 0) {return 'instant';}
    if (duration <= 200) {return 'fast';}
    if (duration <= 500) {return 'medium';}
    if (duration <= 1000) {return 'slow';}
    return 'very_slow';
  }

  /**
   * Analyze overlay behavior patterns
   */
  async analyzeOverlayBehavior(connections) {
    const overlays = {
      total: 0,
      byPosition: {},
      dismissalPatterns: {},
      backgroundInteraction: {}
    };

    connections.forEach(connection => {
      if (connection.action.type === 'OVERLAY' && connection.action.overlay) {
        overlays.total++;

        const overlay = connection.action.overlay;

        // Count by position
        const position = overlay.overlayRelativePosition || 'CENTER';
        if (!overlays.byPosition[position]) {
          overlays.byPosition[position] = 0;
        }
        overlays.byPosition[position]++;

        // Track dismissal patterns
        const dismissalKey = `${overlay.closeWhenClickOutside ? 'click_outside' : 'no_click_outside'}_${overlay.closeWhenPressEscape ? 'escape' : 'no_escape'}`;
        if (!overlays.dismissalPatterns[dismissalKey]) {
          overlays.dismissalPatterns[dismissalKey] = 0;
        }
        overlays.dismissalPatterns[dismissalKey]++;

        // Track background interaction
        const bgInteraction = overlay.backgroundInteraction || 'NONE';
        if (!overlays.backgroundInteraction[bgInteraction]) {
          overlays.backgroundInteraction[bgInteraction] = 0;
        }
        overlays.backgroundInteraction[bgInteraction]++;
      }
    });

    return overlays;
  }

  /**
   * Normalize connections for consistent output
   */
  normalizeConnections(connections) {
    return connections.map(connection => ({
      id: connection.id,
      source: {
        nodeId: connection.sourceNodeId,
        name: connection.sourceName,
        type: connection.sourceType
      },
      trigger: connection.trigger,
      action: connection.action,
      metadata: {
        hasMultipleReactions: connection.hasMultipleReactions,
        reactionIndex: connection.reactionIndex
      }
    }));
  }

  /**
   * Count unique screens involved in prototyping
   */
  countUniqueScreens(connections) {
    const screens = new Set();

    connections.forEach(connection => {
      screens.add(connection.sourceNodeId);
      if (connection.action.destinationId) {
        screens.add(connection.action.destinationId);
      }
    });

    return screens.size;
  }

  /**
   * Validate flows for completeness and consistency
   */
  validateFlows(flowAnalysis, connections) {
    const validation = {
      issues: [],
      warnings: [],
      score: 1.0
    };

    try {
      // Check for dead ends
      if (flowAnalysis.deadEnds && flowAnalysis.deadEnds.length > 0) {
        const deadEndRate = flowAnalysis.deadEnds.length / connections.length;
        if (deadEndRate > this.analysisThresholds.deadEndThreshold) {
          validation.issues.push({
            type: 'excessive_dead_ends',
            severity: 'medium',
            count: flowAnalysis.deadEnds.length,
            rate: deadEndRate
          });
          validation.score -= 0.2;
        }
      }

      // Check for unreachable screens
      const sourceIds = new Set(connections.map(c => c.sourceNodeId));
      const targetIds = new Set(connections.filter(c => c.action.destinationId).map(c => c.action.destinationId));
      const unreachableScreens = Array.from(sourceIds).filter(id => !targetIds.has(id));

      if (unreachableScreens.length > 0) {
        validation.warnings.push({
          type: 'unreachable_screens',
          count: unreachableScreens.length,
          screens: unreachableScreens
        });
      }

      // Check for loops
      if (flowAnalysis.loops && flowAnalysis.loops.length > 0) {
        validation.warnings.push({
          type: 'prototype_loops',
          count: flowAnalysis.loops.length,
          details: flowAnalysis.loops
        });
      }

    } catch (error) {
      validation.issues.push({
        type: 'validation_error',
        severity: 'low',
        message: error.message
      });
    }

    return validation;
  }

  /**
   * Identify common flow patterns
   */
  identifyFlowPatterns(flowAnalysis) {
    const patterns = {
      linear: 0,
      branching: 0,
      circular: 0,
      hub_spoke: 0
    };

    if (flowAnalysis.paths) {
      flowAnalysis.paths.forEach(path => {
        if (path.length <= 3) {
          patterns.linear++;
        } else if (this.hasBranching(path)) {
          patterns.branching++;
        }
      });
    }

    if (flowAnalysis.loops) {
      patterns.circular = flowAnalysis.loops.length;
    }

    return patterns;
  }

  /**
   * Check if a path has branching points
   */
  hasBranching(path) {
    // Simplified branching detection
    const nodes = new Set();
    path.forEach(step => {
      nodes.add(step.from);
      nodes.add(step.to);
    });

    return nodes.size < path.length; // More connections than unique nodes indicates branching
  }

  /**
   * Calculate flow statistics
   */
  calculateFlowStatistics(paths) {
    if (!paths || paths.length === 0) {
      return {
        averagePathLength: 0,
        maxPathLength: 0,
        totalPaths: 0,
        branchingFactor: 0
      };
    }

    const lengths = paths.map(path => path.length);

    return {
      averagePathLength: lengths.reduce((sum, len) => sum + len, 0) / lengths.length,
      maxPathLength: Math.max(...lengths),
      totalPaths: paths.length,
      branchingFactor: this.calculateBranchingFactor(paths)
    };
  }

  /**
   * Calculate branching factor for flows
   */
  calculateBranchingFactor(paths) {
    const branchingPoints = new Map();

    paths.forEach(path => {
      path.forEach(step => {
        if (!branchingPoints.has(step.from)) {
          branchingPoints.set(step.from, new Set());
        }
        branchingPoints.get(step.from).add(step.to);
      });
    });

    const branchingSizes = Array.from(branchingPoints.values()).map(targets => targets.size);
    return branchingSizes.length > 0 ?
      branchingSizes.reduce((sum, size) => sum + size, 0) / branchingSizes.length : 0;
  }

  /**
   * Calculate prototype analysis confidence
   */
  calculatePrototypeConfidence(connections, flowAnalysis) {
    let confidence = 0;
    let factors = 0;

    // Factor 1: Number of connections
    if (connections.length > 0) {
      confidence += Math.min(connections.length / 10, 1) * 0.3;
      factors++;
    }

    // Factor 2: Flow completeness
    if (flowAnalysis.paths && flowAnalysis.paths.length > 0) {
      confidence += 0.3;
      factors++;
    }

    // Factor 3: Interaction diversity
    const uniqueTriggers = new Set(connections.map(c => c.trigger.type));
    if (uniqueTriggers.size > 1) {
      confidence += 0.2;
      factors++;
    }

    // Factor 4: Navigation structure
    if (flowAnalysis.paths && flowAnalysis.paths.some(path => path.length > 2)) {
      confidence += 0.2;
      factors++;
    }

    return factors > 0 ? confidence : 0.1;
  }

  /**
   * Generate empty prototype map when no connections found
   */
  generateEmptyPrototypeMap() {
    return {
      connections: [],
      flows: { paths: [], entryPoints: [], exitPoints: [], loops: [], deadEnds: [] },
      interactions: { byTrigger: {}, byAction: {}, combinations: {} },
      navigation: { hierarchy: {}, breadth: 0, depth: 0, hubs: [], connectors: [] },
      transitions: { byType: {}, byDuration: {}, averageDuration: 0 },
      overlays: { total: 0, byPosition: {}, dismissalPatterns: {} },
      validation: { issues: [], warnings: [], score: 1.0 },
      patterns: { linear: 0, branching: 0, circular: 0, hub_spoke: 0 },
      metadata: {
        totalConnections: 0,
        uniqueScreens: 0,
        analysisTimestamp: new Date().toISOString(),
        confidence: 0
      }
    };
  }

  /**
   * Generate fallback prototype map when analysis fails
   */
  generateFallbackPrototypeMap(error) {
    this.logger.warn('Generating fallback prototype map:', error);

    const fallbackMap = this.generateEmptyPrototypeMap();
    fallbackMap.metadata.error = error.message;
    fallbackMap.metadata.confidence = 0.1;

    return fallbackMap;
  }
}

export default PrototypeMapper;