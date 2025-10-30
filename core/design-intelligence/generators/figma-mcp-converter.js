/**
 * 🔄 Figma MCP to Design Spec Converter
 *
 * Integrates with existing Figma MCP infrastructure to generate
 * standardized designSpec.json from raw Figma data.
 */

import { validateDesignSpec } from '../validators/design-spec-validator.js';
import { DesignSpecGenerator } from './design-spec-generator.js';

/**
 * @typedef {Object} ExistingFrameData
 * @property {string} id - Frame ID
 * @property {string} name - Frame name
 * @property {string} type - Frame type
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Frame width
 * @property {number} height - Frame height
 * @property {ExistingFrameData[]} [children] - Child frames
 * @property {any[]} [fills] - Fill styles
 * @property {any[]} [strokes] - Stroke styles
 * @property {any[]} [effects] - Visual effects
 * @property {string} [characters] - Text content
 * @property {any} [style] - Text style properties
 * @property {string} [componentId] - Component instance ID
 * @property {any} [mainComponent] - Main component reference
 * @property {any} [constraints] - Layout constraints
 * @property {boolean} [clipsContent] - Content clipping
 * @property {any} [background] - Background properties
 * @property {any} [exportSettings] - Export settings
 */

/**
 * @typedef {Object} ExistingFileContext
 * @property {string} fileId - Figma file ID
 * @property {string} fileName - File name
 * @property {string} pageId - Page ID
 * @property {string} pageName - Page name
 * @property {string[]} nodeIds - Selected node IDs
 * @property {any} [designSystemData] - Design system data
 * @property {any} [complianceData] - Compliance data
 * @property {string[]} [techStack] - Technology stack
 * @property {string} [userPrompt] - User prompt text
 * @property {number} [confidence] - Confidence score
 */

/**
 * @typedef {Object} ConversionStats
 * @property {number} processingTime - Processing time in ms
 * @property {number} elementsProcessed - Number of elements processed
 * @property {number} componentsAnalyzed - Components analyzed count
 * @property {number} tokensExtracted - Design tokens extracted
 * @property {boolean} cacheHit - Whether cache was used
 */

/**
 * @typedef {Object} ConversionResult
 * @property {Object} designSpec - Generated design specification
 * @property {ConversionStats} conversionStats - Conversion statistics
 * @property {any} [validationResult] - Validation results
 */

/**
 * @typedef {Object} ConversionOptions
 * @property {boolean} [enableCaching] - Enable result caching
 * @property {boolean} [skipValidation] - Skip validation step
 * @property {string} [extractionSource] - Source of extraction
 */

/**
 * @typedef {Object} BatchConversionOptions
 * @property {boolean} [enableCaching] - Enable result caching
 * @property {boolean} [skipValidation] - Skip validation step
 * @property {boolean} [parallelProcessing] - Process in parallel
 */

/**
 * @typedef {Object} BatchDataset
 * @property {ExistingFrameData[]} frameData - Frame data
 * @property {ExistingFileContext} fileContext - File context
 * @property {string} id - Dataset identifier
 */

/**
 * @typedef {Object} MCPRequest
 * @property {'figma-extract'|'design-spec-generate'|'batch-convert'} type - Request type
 * @property {any} data - Request data
 * @property {any} [options] - Request options
 */

export class FigmaMCPConverter {
  constructor() {
    this.generator = new DesignSpecGenerator();
    this.conversionCache = new Map();
  }

  /**
   * Convert existing MCP frame data to designSpec format
   * @param {ExistingFrameData[]} existingFrameData - Frame data to convert
   * @param {ExistingFileContext} existingFileContext - File context
   * @param {ConversionOptions} [options] - Conversion options
   * @returns {Promise<ConversionResult>} Conversion result
   */
  async convertToDesignSpec(existingFrameData, existingFileContext, options = {}) {
    const startTime = Date.now();

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(existingFrameData, existingFileContext);

      // Check cache if enabled
      if (options.enableCaching && this.conversionCache.has(cacheKey)) {
        console.log('📦 Using cached designSpec conversion');
        return {
          designSpec: this.conversionCache.get(cacheKey),
          conversionStats: {
            processingTime: Date.now() - startTime,
            elementsProcessed: this.countElements(existingFrameData),
            componentsAnalyzed: existingFrameData.length,
            tokensExtracted: 0, // Would be calculated from cache
            cacheHit: true
          }
        };
      }

      // Transform existing data structures to generator format
      const transformedFrameData = this.transformFrameData(existingFrameData);
      const transformedFileContext = this.transformFileContext(existingFileContext);
      const extractionContext = this.createExtractionContext(existingFileContext, options);

      // Generate design specification
      console.log('🏭 Generating designSpec from MCP data...');
      const designSpec = await this.generator.generateDesignSpec(
        transformedFrameData,
        transformedFileContext,
        extractionContext
      );

      // Validate if not skipped
      let validationResult;
      if (!options.skipValidation) {
        console.log('🔍 Validating generated designSpec...');
        validationResult = await validateDesignSpec(designSpec);

        if (!validationResult.valid) {
          console.warn('⚠️ DesignSpec validation issues:', validationResult.errors);
        }
      }

      // Cache if enabled
      if (options.enableCaching) {
        this.conversionCache.set(cacheKey, designSpec);
      }

      const conversionStats = {
        processingTime: Date.now() - startTime,
        elementsProcessed: this.countElements(existingFrameData),
        componentsAnalyzed: designSpec.components.length,
        tokensExtracted: designSpec.designTokens.colors.length + designSpec.designTokens.typography.length,
        cacheHit: false
      };

      console.log('✅ MCP to designSpec conversion completed:', conversionStats);

      return {
        designSpec,
        conversionStats,
        validationResult
      };

    } catch (error) {
      console.error('❌ MCP to designSpec conversion failed:', error);
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert designSpec back to existing MCP format (for backward compatibility)
   * @param {Object} designSpec - Design specification to convert
   * @returns {Promise<{frameData: ExistingFrameData[], fileContext: ExistingFileContext}>}
   */
  async convertFromDesignSpec(designSpec) {
    const frameData = [];

    // Convert components back to frame data format
    designSpec.components.forEach(component => {
      const frameItem = {
        id: component.id,
        name: component.name,
        type: component.type.toUpperCase(),
        x: component.visual.position.x,
        y: component.visual.position.y,
        width: component.visual.dimensions.width,
        height: component.visual.dimensions.height,
        fills: component.visual.fills,
        strokes: component.visual.strokes,
        effects: component.visual.effects,
        componentId: component.relationships?.instances?.[0],
        mainComponent: component.relationships?.masterComponent ? {
          id: component.relationships.masterComponent
        } : undefined
      };

      // Add text content if available
      if (component.content.text && component.content.text.length > 0) {
        frameItem.characters = component.content.text[0].text;
        frameItem.style = {
          fontFamily: 'Arial', // Would extract from designTokens
          fontSize: 16,
          fontWeight: 400
        };
      }

      frameData.push(frameItem);
    });

    // Convert metadata back to file context
    const fileContext = {
      fileId: designSpec.metadata.figmaFile.fileId,
      fileName: designSpec.metadata.figmaFile.fileName,
      pageId: designSpec.metadata.figmaFile.pageId,
      pageName: designSpec.metadata.figmaFile.pageName,
      nodeIds: designSpec.metadata.figmaFile.nodeIds,
      designSystemData: designSpec.designSystem,
      techStack: designSpec.context.technical.framework ? [designSpec.context.technical.framework] : undefined,
      confidence: designSpec.context.quality.confidence
    };

    return { frameData, fileContext };
  }

  /**
   * Batch convert multiple MCP datasets
   * @param {BatchDataset[]} datasets - Datasets to convert
   * @param {BatchConversionOptions} [options] - Conversion options
   * @returns {Promise<Map<string, ConversionResult>>} Conversion results map
   */
  async batchConvert(datasets, options = {}) {
    const results = new Map();

    if (options.parallelProcessing) {
      // Process in parallel
      console.log(`🔄 Processing ${datasets.length} datasets in parallel...`);
      const promises = datasets.map(async dataset => {
        const result = await this.convertToDesignSpec(
          dataset.frameData,
          dataset.fileContext,
          options
        );
        return { id: dataset.id, result };
      });

      const completed = await Promise.allSettled(promises);
      completed.forEach((outcome, index) => {
        if (outcome.status === 'fulfilled') {
          results.set(outcome.value.id, outcome.value.result);
        } else {
          console.error(`❌ Dataset ${datasets[index].id} conversion failed:`, outcome.reason);
        }
      });
    } else {
      // Process sequentially
      console.log(`🔄 Processing ${datasets.length} datasets sequentially...`);
      for (const dataset of datasets) {
        try {
          const result = await this.convertToDesignSpec(
            dataset.frameData,
            dataset.fileContext,
            options
          );
          results.set(dataset.id, result);
        } catch (error) {
          console.error(`❌ Dataset ${dataset.id} conversion failed:`, error);
        }
      }
    }

    return results;
  }

  /**
   * Get conversion statistics and cache info
   * @returns {{cacheSize: number, totalConversions: number, averageProcessingTime: number}}
   */
  getStats() {
    return {
      cacheSize: this.conversionCache.size,
      totalConversions: this.conversionCache.size, // Simplified
      averageProcessingTime: 500 // Would calculate from actual data
    };
  }

  /**
   * Clear conversion cache
   */
  clearCache() {
    this.conversionCache.clear();
    console.log('🗑️ Conversion cache cleared');
  }

  // =============================================================================
  // PRIVATE TRANSFORMATION METHODS
  // =============================================================================

  /**
   * Transform frame data to generator format
   * @private
   * @param {ExistingFrameData[]} existingData - Existing frame data
   * @returns {any[]} Transformed frame data
   */
  transformFrameData(existingData) {
    return existingData.map(frame => ({
      id: frame.id,
      name: frame.name,
      type: frame.type,
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      fills: frame.fills,
      strokes: frame.strokes,
      effects: frame.effects,
      children: frame.children ? this.transformFrameData(frame.children) : undefined,
      characters: frame.characters,
      style: frame.style,
      componentId: frame.componentId,
      mainComponent: frame.mainComponent
    }));
  }

  /**
   * Transform file context to generator format
   * @private
   * @param {ExistingFileContext} existingContext - Existing file context
   * @returns {any} Transformed file context
   */
  transformFileContext(existingContext) {
    return {
      fileId: existingContext.fileId,
      fileName: existingContext.fileName,
      pageId: existingContext.pageId,
      pageName: existingContext.pageName,
      nodeIds: existingContext.nodeIds,
      designSystem: existingContext.designSystemData,
      styles: {} // Would extract from designSystemData
    };
  }

  /**
   * Create extraction context
   * @private
   * @param {ExistingFileContext} existingContext - Existing file context
   * @param {ConversionOptions} options - Conversion options
   * @returns {any} Extraction context
   */
  createExtractionContext(existingContext, options) {
    return {
      extractedBy: options.extractionSource || 'figma-mcp-converter',
      processingTime: 0, // Will be calculated
      userSelection: true, // Assuming user-selected data
      selectionType: 'mixed',
      techStack: existingContext.techStack,
      confidence: existingContext.confidence || 0.8
    };
  }

  /**
   * Generate cache key for data
   * @private
   * @param {ExistingFrameData[]} frameData - Frame data
   * @param {ExistingFileContext} fileContext - File context
   * @returns {string} Cache key
   */
  generateCacheKey(frameData, fileContext) {
    // Create a hash-like key from the data
    const dataKey = frameData.map(f => `${f.id}-${f.name}-${f.type}`).join('|');
    const contextKey = `${fileContext.fileId}-${fileContext.pageId}`;
    return `${contextKey}:${dataKey}`.substring(0, 100); // Limit length
  }

  /**
   * Count total elements in frame data
   * @private
   * @param {ExistingFrameData[]} frameData - Frame data to count
   * @returns {number} Total element count
   */
  countElements(frameData) {
    let count = 0;
    const countRecursive = (frames) => {
      frames.forEach(frame => {
        count++;
        if (frame.children) {
          countRecursive(frame.children);
        }
      });
    };
    countRecursive(frameData);
    return count;
  }
}

// =============================================================================
// INTEGRATION WITH EXISTING MCP SERVER
// =============================================================================

/**
 * Enhanced MCP handler that includes designSpec generation
 */
export class EnhancedMCPHandler {
  constructor() {
    this.converter = new FigmaMCPConverter();
  }

  /**
   * Handle MCP requests with designSpec generation
   * @param {MCPRequest} request - MCP request
   * @returns {Promise<any>} Request result
   */
  async handleMCPRequest(request) {
    switch (request.type) {
    case 'figma-extract':
      // Traditional MCP extraction with designSpec generation
      return this.handleFigmaExtract(request.data, request.options);

    case 'design-spec-generate':
      // Direct designSpec generation from existing data
      return this.handleDesignSpecGenerate(request.data, request.options);

    case 'batch-convert':
      // Batch processing for multiple files
      return this.handleBatchConvert(request.data, request.options);

    default:
      throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  /**
   * Handle Figma extraction request
   * @private
   * @param {any} data - Request data
   * @param {any} [options] - Request options
   * @returns {Promise<any>} Extraction result
   */
  async handleFigmaExtract(data, options = {}) {
    // This would integrate with existing Figma extraction logic
    // and then convert to designSpec
    const existingFrameData = data.frameData;
    const existingFileContext = data.fileContext;

    const result = await this.converter.convertToDesignSpec(
      existingFrameData,
      existingFileContext,
      options
    );

    return {
      success: true,
      designSpec: result.designSpec,
      stats: result.conversionStats,
      validation: result.validationResult,
      // Also return traditional format for backward compatibility
      traditional: {
        frameData: existingFrameData,
        fileContext: existingFileContext
      }
    };
  }

  /**
   * Handle design spec generation request
   * @private
   * @param {any} data - Request data
   * @param {any} [options] - Request options
   * @returns {Promise<ConversionResult>} Generation result
   */
  async handleDesignSpecGenerate(data, options = {}) {
    return this.converter.convertToDesignSpec(
      data.frameData,
      data.fileContext,
      options
    );
  }

  /**
   * Handle batch conversion request
   * @private
   * @param {any} data - Request data
   * @param {any} [options] - Request options
   * @returns {Promise<Map<string, ConversionResult>>} Batch conversion results
   */
  async handleBatchConvert(data, options = {}) {
    return this.converter.batchConvert(data.datasets, options);
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick conversion function for simple use cases
 * @param {ExistingFrameData[]} frameData - Frame data to convert
 * @param {ExistingFileContext} fileContext - File context
 * @param {ConversionOptions} [options] - Conversion options
 * @returns {Promise<Object>} Design specification
 */
export async function convertMCPToDesignSpec(frameData, fileContext, options) {
  const converter = new FigmaMCPConverter();
  const result = await converter.convertToDesignSpec(frameData, fileContext, options);
  return result.designSpec;
}

/**
 * Create a singleton converter instance
 * @returns {FigmaMCPConverter} Global converter instance
 */
let globalConverter = null;

export function getGlobalConverter() {
  if (!globalConverter) {
    globalConverter = new FigmaMCPConverter();
  }
  return globalConverter;
}