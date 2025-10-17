/**
 * MCP Data Layer - Main Entry Point
 * 
 * This module exports all the core data layer components for the
 * Model Context Protocol (MCP) implementation, providing a clean
 * interface for Figma metadata, code, and assets extraction.
 */

// Core interfaces and types
export type {
  // Main extractor interface
  FigmaExtractor,
  
  // Configuration interfaces
  ExtractionParams,
  ExtractionOptions,
  ExtractionContext,
  ExtractionDataType,
  
  // Specific extraction options
  MetadataOptions,
  TokenExtractionOptions,
  AssetExtractionOptions,
  CodeGenerationOptions,
  
  // Validation and performance
  DataValidator,
  PerformanceMonitor,
  DataCache,
  ValidationLevel,
  OptimizationLevel,
  CachingStrategy,
  
  // Code generation
  CodeGenerator,
  GeneratedCode,
  GeneratedCodeSet
} from './interfaces.js';

export type {
  // Core data types
  FigmaNodeMetadata,
  MCPNodeMetadata,
  AssetMetadata,
  DesignTokens,
  CodeGenerationHints,
  
  // Validation types
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PerformanceMetrics,
  
  // Extraction result
  ExtractionResult,
  
  // Component and semantic types
  ComponentType,
  SemanticRole,
  FigmaNodeType,
  
  // Design token types
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderTokens,
  ShadowTokens,
  EffectTokens,
  
  // Figma API types
  Paint,
  Effect,
  BoundingBox,
  Transform,
  LayoutConstraints
} from './types.js';

// Core implementations
export { FigmaDataExtractor } from './extractor.js';
export { MCPDataValidator, MCPValidationError, ValidatorFactory } from './validator.js';
export { MCPPerformanceMonitor, PerformanceMonitorFactory } from './performance-optimizer.js';
export { MemoryCache, HybridCache, CacheFactory } from './cache.js';

// =============================================================================
// CONVENIENCE FACTORY FUNCTIONS
// =============================================================================

import { FigmaDataExtractor } from './extractor.js';
import { ValidatorFactory } from './validator.js';
import { PerformanceMonitorFactory } from './performance-optimizer.js';
import { CacheFactory } from './cache.js';
import type { ValidationLevel, CachingStrategy, FigmaExtractor } from './interfaces.js';

/**
 * Create a complete, configured Figma data extractor
 */
export function createFigmaExtractor(config: {
  figmaApiKey: string;
  validationLevel?: ValidationLevel;
  cachingStrategy?: CachingStrategy;
  enablePerformanceMonitoring?: boolean;
}): FigmaExtractor {
  const {
    figmaApiKey,
    validationLevel = 'standard',
    cachingStrategy = 'memory',
    enablePerformanceMonitoring = true
  } = config;

  // Create supporting services
  const performanceMonitor = enablePerformanceMonitoring 
    ? PerformanceMonitorFactory.create()
    : PerformanceMonitorFactory.create(); // TODO: Create no-op monitor

  const cache = CacheFactory.create(cachingStrategy);
  const validator = ValidatorFactory.create(validationLevel);

  // Create and return the extractor
  return new FigmaDataExtractor(figmaApiKey, performanceMonitor, cache, validator);
}

/**
 * Create a lightweight extractor for basic operations
 */
export function createBasicExtractor(figmaApiKey: string): FigmaExtractor {
  return createFigmaExtractor({
    figmaApiKey,
    validationLevel: 'basic',
    cachingStrategy: 'memory',
    enablePerformanceMonitoring: false
  });
}

/**
 * Create a high-performance extractor for production use
 */
export function createProductionExtractor(figmaApiKey: string): FigmaExtractor {
  return createFigmaExtractor({
    figmaApiKey,
    validationLevel: 'strict',
    cachingStrategy: 'hybrid',
    enablePerformanceMonitoring: true
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate a Figma URL and extract file key
 */
export function parseSource(source: string): { fileKey: string; nodeIds?: string[] } | null {
  try {
    // Extract file key from Figma URL or use as direct file key
    let fileKey: string;
    let nodeIds: string[] | undefined;
    
    if (source.includes('figma.com')) {
      const match = source.match(/file\/([a-zA-Z0-9]+)/);
      if (!match?.[1]) {
        return null;
      }
      fileKey = match[1];
      
      // Extract node IDs if present
      const nodeMatch = source.match(/node-id=([^&]+)/);
      if (nodeMatch?.[1]) {
        nodeIds = nodeMatch[1].split(',').map(id => decodeURIComponent(id));
      }
    } else {
      fileKey = source;
    }

    const result: { fileKey: string; nodeIds?: string[] } = { fileKey };
    if (nodeIds && nodeIds.length > 0) {
      result.nodeIds = nodeIds;
    }
    
    return result;
  } catch {
    return null;
  }
}

/**
 * Check if a source is a valid Figma URL or file key
 */
export function isValidFigmaSource(source: string): boolean {
  return parseSource(source) !== null;
}

/**
 * Create extraction parameters with sensible defaults
 */
export function createExtractionParams(
  source: string,
  options: Partial<{
    nodeIds: string[];
    dataTypes: Array<'metadata' | 'assets' | 'design-tokens' | 'code-hints'>;
    includeChildren: boolean;
    maxDepth: number;
    optimizationLevel: 'none' | 'basic' | 'standard' | 'aggressive';
  }> = {}
) {
  const {
    nodeIds = [],
    dataTypes = ['metadata', 'design-tokens'],
    includeChildren = true,
    maxDepth = 5,
    optimizationLevel = 'standard'
  } = options;

  return {
    source,
    nodeIds,
    dataTypes,
    options: {
      includeChildren,
      maxDepth,
      optimizationLevel,
      validationLevel: 'standard' as const,
      caching: 'memory' as const
    }
  };
}

// =============================================================================
// VERSION AND METADATA
// =============================================================================

export const MCP_DATA_LAYER_VERSION = '1.0.0';
export const MCP_DATA_LAYER_NAME = 'Figma MCP Data Layer';

export const getDataLayerInfo = () => ({
  name: MCP_DATA_LAYER_NAME,
  version: MCP_DATA_LAYER_VERSION,
  description: 'Core data extraction layer for Figma Model Context Protocol integration',
  supportedDataTypes: ['metadata', 'assets', 'design-tokens', 'code-hints', 'interactions', 'accessibility'],
  supportedValidationLevels: ['none', 'basic', 'standard', 'strict'],
  supportedCachingStrategies: ['none', 'memory', 'disk', 'hybrid'],
  supportedOptimizationLevels: ['none', 'basic', 'standard', 'aggressive']
});