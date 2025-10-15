/**
 * Enhanced MCP Data Layer Example
 * 
 * This example demonstrates how to use the enhanced data layer
 * to extract hierarchical frame data similar to the user's JSON example.
 */

import { FigmaDataExtractor } from './extractor.js';
import { MCPDataValidator } from './validator.js';
import { MCPPerformanceMonitor } from './performance.js';
import { CacheFactory } from './cache.js';

import type {
  ExtractionResult,
  FigmaNodeMetadata,
  NodeHierarchy,
  LayerInfo,
  ComponentInstanceProps,
  DesignSystemLinks,
  ExportScreenshot
} from './types.js';

import type {
  ExtractionParams,
  ExtractionOptions
} from './interfaces.js';

/**
 * Enhanced factory for creating a comprehensive Figma extractor with hierarchy support
 */
export function createEnhancedFigmaExtractor(
  figmaApiKey: string,
  options?: {
    caching?: 'none' | 'memory' | 'disk' | 'hybrid';
    validation?: 'none' | 'basic' | 'standard' | 'strict';
    performanceMonitoring?: boolean;
  }
) {
  const performanceMonitor = new MCPPerformanceMonitor();
  const cache = CacheFactory.create(options?.caching || 'memory');
  const validator = new MCPDataValidator(options?.validation || 'standard');
  
  return new FigmaDataExtractor(figmaApiKey, performanceMonitor, cache, validator);
}

/**
 * Extract hierarchical data with enhanced structure support
 * This function mimics the structure shown in the user's JSON example
 */
export async function extractHierarchicalFrameData(
  extractor: FigmaDataExtractor,
  fileKey: string,
  frameId?: string,
  options?: {
    includeScreenshots?: boolean;
    includeDesignSystemLinks?: boolean;
    maxDepth?: number;
    includeComponentInstances?: boolean;
  }
): Promise<HierarchicalFrameData> {
  // Use the enhanced extraction method
  const result = await extractor.extractWithHierarchy(
    fileKey,
    frameId ? [frameId] : undefined,
    {
      includeChildren: true,
      maxDepth: options?.maxDepth || 10,
      includeScreenshots: options?.includeScreenshots || false,
      includeDesignSystemLinks: options?.includeDesignSystemLinks || true,
      includeHierarchy: true,
      includeComponentInstances: options?.includeComponentInstances !== false
    }
  );

  return transformToHierarchicalStructure(result);
}

/**
 * Enhanced frame data structure matching user's JSON example
 */
export interface HierarchicalFrameData {
  frames: EnhancedFrameInfo[];
  designSystemLinks: DesignSystemLinks;
  exportScreenshots: ExportScreenshot[];
  componentInstances: ComponentInstanceInfo[];
  metadata: {
    extractedAt: string;
    version: string;
    totalFrames: number;
    totalLayers: number;
    totalComponents: number;
  };
}

/**
 * Enhanced frame information with hierarchical structure
 */
export interface EnhancedFrameInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  
  // Hierarchical structure
  hierarchy: {
    layers: EnhancedLayerInfo[];
    totalDepth: number;
    componentCount: number;
    textLayerCount: number;
  };
  
  // Component instances within this frame
  componentInstances: ComponentInstanceInfo[];
  
  // Design system references
  designSystemLinks: DesignSystemLinks;
  
  // Export screenshots
  exportScreenshots: ExportScreenshot[];
  
  // Nested children
  children: EnhancedFrameInfo[];
}

/**
 * Enhanced layer information with component references
 */
export interface EnhancedLayerInfo {
  id: string;
  name: string;
  type: string;
  description?: string;
  
  // Positioning and sizing
  position: { x: number; y: number };
  size: { width: number; height: number };
  
  // Component references
  components: ComponentReference[];
  
  // Design tokens used in this layer
  tokens: {
    colors?: string[];
    spacing?: string | number | Record<string, number>;
    typography?: string;
    borders?: string;
    shadows?: string;
    effects?: string[];
  };
  
  // Nested children
  children?: EnhancedLayerInfo[];
}

/**
 * Component reference information
 */
export interface ComponentReference {
  name: string;
  id?: string;
  type: 'component' | 'instance' | 'variant';
  masterComponentId?: string;
  variantProperties?: Record<string, string>;
}

/**
 * Component instance detailed information
 */
export interface ComponentInstanceInfo {
  id: string;
  name: string;
  masterComponentId?: string;
  componentSetId?: string;
  
  // Instance properties
  props: Record<string, any>;
  overrides: Array<{
    nodeId: string;
    propertyName: string;
    value: any;
    type: 'TEXT' | 'FILL' | 'STROKE' | 'EFFECT' | 'VISIBILITY';
  }>;
  
  // Variant information
  variantProperties: Record<string, string>;
  
  // Parent frame context
  parentFrameId: string;
  parentFrameName: string;
}

/**
 * Transform extraction result to hierarchical structure like user's JSON example
 */
export function transformToHierarchicalStructure(result: ExtractionResult): HierarchicalFrameData {
  const frames: EnhancedFrameInfo[] = result.metadata.map(frame => transformFrame(frame));
  
  // Collect all component instances
  const componentInstances: ComponentInstanceInfo[] = [];
  collectComponentInstances(result.metadata, componentInstances);
  
  // Aggregate design system links
  const designSystemLinks: DesignSystemLinks = aggregateDesignSystemLinks(result.metadata);
  
  // Collect all export screenshots
  const exportScreenshots: ExportScreenshot[] = [];
  result.metadata.forEach(frame => {
    if (frame.exportScreenshots) {
      exportScreenshots.push(...frame.exportScreenshots);
    }
  });
  
  return {
    frames,
    designSystemLinks,
    exportScreenshots,
    componentInstances,
    metadata: {
      extractedAt: result.extractedAt,
      version: result.version,
      totalFrames: frames.length,
      totalLayers: countTotalLayers(frames),
      totalComponents: componentInstances.length
    }
  };
}

/**
 * Transform a single frame to enhanced format
 */
function transformFrame(frame: FigmaNodeMetadata): EnhancedFrameInfo {
  return {
    id: frame.id,
    name: frame.name,
    type: frame.type,
    description: frame.mcpMetadata?.semanticRole || 'Frame component',
    
    hierarchy: {
      layers: (frame.hierarchy?.layers || []).map(transformLayer),
      totalDepth: frame.hierarchy?.totalDepth || 0,
      componentCount: frame.hierarchy?.componentCount || 0,
      textLayerCount: frame.hierarchy?.textLayerCount || 0
    },
    
    componentInstances: extractFrameComponentInstances(frame),
    designSystemLinks: frame.designSystemLinks || {},
    exportScreenshots: frame.exportScreenshots || [],
    children: (frame.children || []).map(transformFrame)
  };
}

/**
 * Transform a layer to enhanced format
 */
function transformLayer(layer: LayerInfo): EnhancedLayerInfo {
  return {
    id: layer.id,
    name: layer.name,
    type: layer.type,
    description: layer.description,
    position: layer.position,
    size: layer.size,
    components: (layer.components || []).map(componentName => ({
      name: componentName,
      type: 'component' as const
    })),
    tokens: layer.tokens || {},
    children: layer.children?.map(transformLayer)
  };
}

/**
 * Extract component instances from a frame
 */
function extractFrameComponentInstances(frame: FigmaNodeMetadata): ComponentInstanceInfo[] {
  const instances: ComponentInstanceInfo[] = [];
  
  if (frame.componentProperties) {
    instances.push({
      id: frame.id,
      name: frame.name,
      masterComponentId: frame.componentProperties.masterComponentId,
      componentSetId: frame.componentProperties.componentSetId,
      props: frame.componentProperties.props || {},
      overrides: frame.componentProperties.overrides || [],
      variantProperties: frame.componentProperties.variantProperties || {},
      parentFrameId: frame.id, // This would be the actual parent in a real implementation
      parentFrameName: frame.name
    });
  }
  
  return instances;
}

/**
 * Collect all component instances recursively
 */
function collectComponentInstances(
  nodes: FigmaNodeMetadata[],
  instances: ComponentInstanceInfo[]
): void {
  for (const node of nodes) {
    instances.push(...extractFrameComponentInstances(node));
    
    if (node.children) {
      collectComponentInstances(node.children, instances);
    }
  }
}

/**
 * Aggregate design system links from all nodes
 */
function aggregateDesignSystemLinks(nodes: FigmaNodeMetadata[]): DesignSystemLinks {
  const aggregated: DesignSystemLinks = {};
  
  for (const node of nodes) {
    if (node.designSystemLinks) {
      Object.assign(aggregated, node.designSystemLinks);
    }
    
    if (node.children) {
      const childLinks = aggregateDesignSystemLinks(node.children);
      Object.assign(aggregated, childLinks);
    }
  }
  
  return aggregated;
}

/**
 * Count total layers in all frames
 */
function countTotalLayers(frames: EnhancedFrameInfo[]): number {
  let count = 0;
  
  for (const frame of frames) {
    count += countLayersInFrame(frame);
  }
  
  return count;
}

/**
 * Count layers in a single frame
 */
function countLayersInFrame(frame: EnhancedFrameInfo): number {
  let count = frame.hierarchy.layers.length;
  
  for (const child of frame.children) {
    count += countLayersInFrame(child);
  }
  
  return count;
}

/**
 * Example usage function demonstrating the enhanced capabilities
 */
export async function enhancedExtractionExample(
  figmaApiKey: string,
  fileKey: string,
  frameId?: string
): Promise<HierarchicalFrameData> {
  // Create enhanced extractor
  const extractor = createEnhancedFigmaExtractor(figmaApiKey, {
    caching: 'memory',
    validation: 'standard',
    performanceMonitoring: true
  });
  
  // Extract hierarchical frame data
  const hierarchicalData = await extractHierarchicalFrameData(
    extractor,
    fileKey,
    frameId,
    {
      includeScreenshots: true,
      includeDesignSystemLinks: true,
      maxDepth: 10,
      includeComponentInstances: true
    }
  );
  
  // Log the structure for demonstration
  console.log('Enhanced Extraction Complete:', {
    totalFrames: hierarchicalData.metadata.totalFrames,
    totalLayers: hierarchicalData.metadata.totalLayers,
    totalComponents: hierarchicalData.metadata.totalComponents,
    hasDesignSystemLinks: Object.keys(hierarchicalData.designSystemLinks).length > 0,
    hasScreenshots: hierarchicalData.exportScreenshots.length > 0
  });
  
  return hierarchicalData;
}

/**
 * Example output format that matches the user's JSON structure
 */
export const EXAMPLE_OUTPUT_FORMAT = {
  frames: [
    {
      id: "frame-id",
      name: "Main Frame",
      type: "FRAME", 
      description: "Main container frame",
      hierarchy: {
        layers: [
          {
            id: "layer-id",
            name: "Button Layer",
            type: "COMPONENT_INSTANCE",
            position: { x: 100, y: 200 },
            size: { width: 120, height: 40 },
            components: [
              {
                name: "Primary Button",
                type: "component",
                masterComponentId: "component-id"
              }
            ],
            tokens: {
              colors: ["#007AFF", "#FFFFFF"],
              spacing: 16,
              typography: "Inter-16-Medium"
            }
          }
        ],
        totalDepth: 2,
        componentCount: 1,
        textLayerCount: 0
      },
      componentInstances: [
        {
          id: "instance-id",
          name: "Primary Button",
          masterComponentId: "component-id",
          props: { variant: "primary", size: "medium" },
          overrides: [],
          variantProperties: { State: "Default" },
          parentFrameId: "frame-id",
          parentFrameName: "Main Frame"
        }
      ],
      designSystemLinks: {
        buttons: "design-system/buttons",
        colors: "design-system/colors"
      },
      exportScreenshots: [
        {
          nodeId: "frame-id",
          url: "https://figma.com/screenshots/frame-id.png",
          format: "PNG",
          scale: 2,
          resolution: "high",
          timestamp: "2024-01-15T10:30:00Z"
        }
      ],
      children: []
    }
  ],
  metadata: {
    extractedAt: "2024-01-15T10:30:00Z",
    version: "1.0.0",
    totalFrames: 1,
    totalLayers: 1,
    totalComponents: 1
  }
};