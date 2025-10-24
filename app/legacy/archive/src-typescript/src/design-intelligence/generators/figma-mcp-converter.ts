/**
 * 🔄 Figma MCP to Design Spec Converter
 * 
 * Integrates with existing Figma MCP infrastructure to generate
 * standardized designSpec.json from raw Figma data.
 */

import { DesignSpec } from '../schema/design-spec.js';
import { DesignSpecGenerator } from './design-spec-generator.js';
import { validateDesignSpec } from '../validators/design-spec-validator.js';

// Import existing MCP types and handlers
interface ExistingFrameData {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children?: ExistingFrameData[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  characters?: string;
  style?: any;
  componentId?: string;
  mainComponent?: any;
  // Additional properties from existing MCP
  constraints?: any;
  clipsContent?: boolean;
  background?: any;
  exportSettings?: any;
}

interface ExistingFileContext {
  fileId: string;
  fileName: string;
  pageId: string;
  pageName: string;
  nodeIds: string[];
  // Additional context from existing system
  designSystemData?: any;
  complianceData?: any;
  techStack?: string[];
  userPrompt?: string;
  confidence?: number;
}

export class FigmaMCPConverter {
  private generator: DesignSpecGenerator;
  private conversionCache: Map<string, DesignSpec>;

  constructor() {
    this.generator = new DesignSpecGenerator();
    this.conversionCache = new Map();
  }

  /**
   * Convert existing MCP frame data to designSpec format
   */
  async convertToDesignSpec(
    existingFrameData: ExistingFrameData[],
    existingFileContext: ExistingFileContext,
    options: {
      enableCaching?: boolean;
      skipValidation?: boolean;
      extractionSource?: string;
    } = {}
  ): Promise<{
    designSpec: DesignSpec;
    conversionStats: ConversionStats;
    validationResult?: any;
  }> {
    const startTime = Date.now();
    
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(existingFrameData, existingFileContext);
      
      // Check cache if enabled
      if (options.enableCaching && this.conversionCache.has(cacheKey)) {
        console.log('📦 Using cached designSpec conversion');
        return {
          designSpec: this.conversionCache.get(cacheKey)!,
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

      const conversionStats: ConversionStats = {
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
   */
  async convertFromDesignSpec(
    designSpec: DesignSpec
  ): Promise<{
    frameData: ExistingFrameData[];
    fileContext: ExistingFileContext;
  }> {
    const frameData: ExistingFrameData[] = [];
    
    // Convert components back to frame data format
    designSpec.components.forEach(component => {
      const frameItem: ExistingFrameData = {
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
    const fileContext: ExistingFileContext = {
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
   */
  async batchConvert(
    datasets: Array<{
      frameData: ExistingFrameData[];
      fileContext: ExistingFileContext;
      id: string;
    }>,
    options: {
      enableCaching?: boolean;
      skipValidation?: boolean;
      parallelProcessing?: boolean;
    } = {}
  ): Promise<Map<string, {
    designSpec: DesignSpec;
    conversionStats: ConversionStats;
    validationResult?: any;
  }>> {
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
   */
  getStats(): {
    cacheSize: number;
    totalConversions: number;
    averageProcessingTime: number;
  } {
    return {
      cacheSize: this.conversionCache.size,
      totalConversions: this.conversionCache.size, // Simplified
      averageProcessingTime: 500 // Would calculate from actual data
    };
  }

  /**
   * Clear conversion cache
   */
  clearCache(): void {
    this.conversionCache.clear();
    console.log('🗑️ Conversion cache cleared');
  }

  // =============================================================================
  // PRIVATE TRANSFORMATION METHODS
  // =============================================================================

  private transformFrameData(existingData: ExistingFrameData[]): any[] {
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

  private transformFileContext(existingContext: ExistingFileContext): any {
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

  private createExtractionContext(
    existingContext: ExistingFileContext,
    options: any
  ): any {
    return {
      extractedBy: options.extractionSource || 'figma-mcp-converter',
      processingTime: 0, // Will be calculated
      userSelection: true, // Assuming user-selected data
      selectionType: 'mixed' as const,
      techStack: existingContext.techStack,
      confidence: existingContext.confidence || 0.8
    };
  }

  private generateCacheKey(
    frameData: ExistingFrameData[],
    fileContext: ExistingFileContext
  ): string {
    // Create a hash-like key from the data
    const dataKey = frameData.map(f => `${f.id}-${f.name}-${f.type}`).join('|');
    const contextKey = `${fileContext.fileId}-${fileContext.pageId}`;
    return `${contextKey}:${dataKey}`.substring(0, 100); // Limit length
  }

  private countElements(frameData: ExistingFrameData[]): number {
    let count = 0;
    const countRecursive = (frames: ExistingFrameData[]) => {
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
  private converter: FigmaMCPConverter;

  constructor() {
    this.converter = new FigmaMCPConverter();
  }

  /**
   * Handle MCP requests with designSpec generation
   */
  async handleMCPRequest(
    request: {
      type: 'figma-extract' | 'design-spec-generate' | 'batch-convert';
      data: any;
      options?: any;
    }
  ): Promise<any> {
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

  private async handleFigmaExtract(data: any, options: any = {}) {
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

  private async handleDesignSpecGenerate(data: any, options: any = {}) {
    return this.converter.convertToDesignSpec(
      data.frameData,
      data.fileContext,
      options
    );
  }

  private async handleBatchConvert(data: any, options: any = {}) {
    return this.converter.batchConvert(data.datasets, options);
  }
}

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ConversionStats {
  processingTime: number;
  elementsProcessed: number;
  componentsAnalyzed: number;
  tokensExtracted: number;
  cacheHit: boolean;
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick conversion function for simple use cases
 */
export async function convertMCPToDesignSpec(
  frameData: ExistingFrameData[],
  fileContext: ExistingFileContext,
  options?: {
    enableCaching?: boolean;
    skipValidation?: boolean;
  }
): Promise<DesignSpec> {
  const converter = new FigmaMCPConverter();
  const result = await converter.convertToDesignSpec(frameData, fileContext, options);
  return result.designSpec;
}

/**
 * Create a singleton converter instance
 */
let globalConverter: FigmaMCPConverter | null = null;

export function getGlobalConverter(): FigmaMCPConverter {
  if (!globalConverter) {
    globalConverter = new FigmaMCPConverter();
  }
  return globalConverter;
}