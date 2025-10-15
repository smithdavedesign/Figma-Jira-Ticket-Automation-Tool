/**
 * Unified Design System Integration
 * 
 * This module integrates the enhanced MCP data layer with existing design system
 * infrastructure to avoid duplication and provide a comprehensive solution.
 * 
 * Key Features:
 * - Async design system detection that loads with the tool
 * - Unified extraction that leverages existing compliance checking
 * - Enhanced hierarchical data with design system context
 * - Seamless integration between MCP and existing codebase
 */

import { DesignSystemScanner } from '../../src/core/design-system/scanner.js';
import { DesignSystemManager } from '../../src/plugin/handlers/design-system-handler.js';
import { ComplianceAnalyzer } from '../../src/core/compliance/analyzer.js';
import { DesignSystemComplianceChecker } from '../compliance/design-system-compliance-checker.js';
import { FigmaDataExtractor } from './extractor.js';

import type { DesignSystem } from '../../src/core/types/design-system.js';
import type { ExtractionResult, FigmaNodeMetadata, DesignSystemLinks } from './types.js';
import type { ExtractionParams } from './interfaces.js';

/**
 * Unified Design System Context
 * Combines all design system information into a single coherent structure
 */
export interface UnifiedDesignSystemContext {
  // Core design system data (from scanner)
  designSystem: DesignSystem | null;
  
  // Compliance analysis (from existing compliance checker)
  compliance: {
    overall: number;
    breakdown: any;
    violations: any[];
    recommendations: any[];
  };
  
  // MCP-specific enhancements
  mcpEnhancements: {
    hierarchicalTokens: any;
    componentInstances: any[];
    systemLinks: DesignSystemLinks;
    confidence: number;
  };
  
  // Detection metadata
  metadata: {
    detectedAt: string;
    version: string;
    async: boolean;
    sources: string[];
  };
}

/**
 * Unified Design System Detector
 * Orchestrates async design system detection using existing infrastructure
 */
export class UnifiedDesignSystemDetector {
  private designSystemScanner: DesignSystemScanner;
  private designSystemManager: DesignSystemManager;
  private complianceAnalyzer: ComplianceAnalyzer | null = null;
  private complianceChecker: DesignSystemComplianceChecker;
  private mcpExtractor: FigmaDataExtractor;
  
  private detectionPromise: Promise<UnifiedDesignSystemContext | null> | null = null;
  private designSystemContext: UnifiedDesignSystemContext | null = null;

  constructor(mcpExtractor: FigmaDataExtractor) {
    this.designSystemScanner = new DesignSystemScanner();
    this.designSystemManager = new DesignSystemManager();
    this.complianceChecker = new DesignSystemComplianceChecker();
    this.mcpExtractor = mcpExtractor;
  }

  /**
   * Start asynchronous design system detection
   * This should be called when the tool loads
   */
  startAsyncDetection(): Promise<UnifiedDesignSystemContext | null> {
    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    console.log('🚀 Starting unified design system detection...');
    
    this.detectionPromise = this.performDetection();
    return this.detectionPromise;
  }

  /**
   * Get the current design system context (may be incomplete if detection is ongoing)
   */
  getCurrentContext(): UnifiedDesignSystemContext | null {
    return this.designSystemContext;
  }

  /**
   * Check if detection is complete
   */
  isDetectionComplete(): boolean {
    return this.designSystemContext !== null;
  }

  /**
   * Enhanced extraction that includes design system context
   */
  async extractWithDesignSystemContext(
    fileKey: string,
    nodeIds?: string[],
    options?: ExtractionParams['options']
  ): Promise<ExtractionResult & { designSystemContext?: UnifiedDesignSystemContext }> {
    // Get design system context (wait if still detecting)
    const dsContext = await this.getOrWaitForContext();
    
    // Perform MCP extraction with design system context
    const extractionResult = await this.mcpExtractor.extractWithHierarchy(
      fileKey,
      nodeIds,
      {
        ...options,
        // Enhance with design system context
        designSystemContext: dsContext
      }
    );

    // Enhance extraction result with design system information
    return {
      ...extractionResult,
      designSystemContext: dsContext,
      // Enhance nodes with design system compliance
      metadata: await this.enhanceNodesWithCompliance(extractionResult.metadata, dsContext)
    };
  }

  /**
   * Get or wait for design system context to be ready
   */
  private async getOrWaitForContext(): Promise<UnifiedDesignSystemContext | null> {
    if (this.designSystemContext) {
      return this.designSystemContext;
    }

    if (this.detectionPromise) {
      return await this.detectionPromise;
    }

    // Start detection if not already started
    return await this.startAsyncDetection();
  }

  /**
   * Core detection logic that orchestrates all existing components
   */
  private async performDetection(): Promise<UnifiedDesignSystemContext | null> {
    try {
      console.log('🔍 Performing unified design system detection...');
      
      const startTime = Date.now();
      
      // Step 1: Initialize design system manager
      await this.designSystemManager.initialize();
      
      // Step 2: Run design system scanner (uses existing implementation)
      const designSystem = await this.designSystemScanner.scanDesignSystem();
      
      // Step 3: Initialize compliance analyzer if design system found
      let compliance = null;
      if (designSystem) {
        this.complianceAnalyzer = new ComplianceAnalyzer(designSystem);
        
        // Get current selection or analyze whole page
        const selection = figma.currentPage.selection;
        compliance = await this.complianceAnalyzer.calculateComplianceScore(
          selection.length > 0 ? selection : figma.currentPage.children
        );
      }

      // Step 4: Extract MCP-specific enhancements
      const mcpEnhancements = await this.extractMCPEnhancements(designSystem);
      
      // Step 5: Build unified context
      const context: UnifiedDesignSystemContext = {
        designSystem,
        compliance: compliance || {
          overall: 0,
          breakdown: {},
          violations: [],
          recommendations: []
        },
        mcpEnhancements,
        metadata: {
          detectedAt: new Date().toISOString(),
          version: '1.0.0',
          async: true,
          sources: ['scanner', 'compliance-analyzer', 'mcp-extractor']
        }
      };

      this.designSystemContext = context;
      
      const duration = Date.now() - startTime;
      console.log(`✅ Unified design system detection complete in ${duration}ms`);
      console.log('📊 Detection results:', {
        hasDesignSystem: !!designSystem,
        confidence: designSystem?.detectionConfidence || 0,
        complianceScore: compliance?.overall || 0,
        enhancementsSources: mcpEnhancements.sources?.length || 0
      });

      return context;

    } catch (error) {
      console.error('❌ Unified design system detection failed:', error);
      return null;
    }
  }

  /**
   * Extract MCP-specific enhancements using our enhanced data layer
   */
  private async extractMCPEnhancements(designSystem: DesignSystem | null): Promise<any> {
    if (!designSystem) {
      return {
        hierarchicalTokens: {},
        componentInstances: [],
        systemLinks: {},
        confidence: 0,
        sources: []
      };
    }

    try {
      // Use our enhanced extraction to get hierarchical data
      const fileKey = figma.fileKey || 'current-file';
      const sampleResult = await this.mcpExtractor.extractWithHierarchy(fileKey, [], {
        includeHierarchy: true,
        includeComponentInstances: true,
        includeDesignSystemLinks: true,
        maxDepth: 3 // Limit depth for performance
      });

      // Extract design system links from the sample
      const systemLinks: DesignSystemLinks = {};
      const componentInstances: any[] = [];
      
      sampleResult.metadata.forEach(node => {
        if (node.designSystemLinks) {
          Object.assign(systemLinks, node.designSystemLinks);
        }
        if (node.componentProperties) {
          componentInstances.push({
            id: node.id,
            name: node.name,
            masterComponentId: node.componentProperties.masterComponentId,
            type: node.type
          });
        }
      });

      // Build hierarchical tokens from design system
      const hierarchicalTokens = this.buildHierarchicalTokens(designSystem);

      return {
        hierarchicalTokens,
        componentInstances,
        systemLinks,
        confidence: designSystem.detectionConfidence,
        sources: ['mcp-extractor', 'existing-scanner']
      };

    } catch (error) {
      console.warn('⚠️ Failed to extract MCP enhancements:', error);
      return {
        hierarchicalTokens: {},
        componentInstances: [],
        systemLinks: {},
        confidence: 0,
        sources: []
      };
    }
  }

  /**
   * Build hierarchical tokens structure from design system
   */
  private buildHierarchicalTokens(designSystem: DesignSystem): any {
    return {
      colors: designSystem.colors.reduce((acc: any, token) => {
        acc[token.name] = {
          value: token.value,
          semantic: token.semantic,
          id: token.id
        };
        return acc;
      }, {}),
      
      typography: designSystem.typography.reduce((acc: any, token) => {
        acc[token.name] = {
          fontFamily: token.fontFamily,
          fontSize: token.fontSize,
          fontWeight: token.fontWeight,
          lineHeight: token.lineHeight,
          id: token.id
        };
        return acc;
      }, {}),
      
      spacing: designSystem.spacing.reduce((acc: any, token) => {
        acc[token.name] = {
          value: token.value,
          unit: token.unit,
          id: token.id
        };
        return acc;
      }, {}),
      
      effects: designSystem.effects.reduce((acc: any, token) => {
        acc[token.name] = {
          type: token.type,
          values: token.values,
          id: token.id
        };
        return acc;
      }, {})
    };
  }

  /**
   * Enhance nodes with compliance information
   */
  private async enhanceNodesWithCompliance(
    nodes: FigmaNodeMetadata[], 
    dsContext: UnifiedDesignSystemContext | null
  ): Promise<FigmaNodeMetadata[]> {
    if (!dsContext || !this.complianceAnalyzer) {
      return nodes;
    }

    return nodes.map(node => ({
      ...node,
      mcpMetadata: {
        ...node.mcpMetadata,
        designSystemCompliance: {
          score: dsContext.compliance.overall,
          violations: dsContext.compliance.violations.filter((v: any) => v.elementId === node.id),
          recommendations: dsContext.compliance.recommendations
        }
      }
    }));
  }
}

/**
 * Factory function to create unified design system integration
 */
export function createUnifiedDesignSystemDetector(
  figmaApiKey: string,
  options?: {
    autoStart?: boolean;
    caching?: 'none' | 'memory' | 'disk' | 'hybrid';
    validation?: 'none' | 'basic' | 'standard' | 'strict';
  }
): UnifiedDesignSystemDetector {
  // Import our enhanced extractor
  const { createEnhancedFigmaExtractor } = require('./enhanced-example.js');
  
  const mcpExtractor = createEnhancedFigmaExtractor(figmaApiKey, {
    caching: options?.caching || 'memory',
    validation: options?.validation || 'standard',
    performanceMonitoring: true
  });

  const detector = new UnifiedDesignSystemDetector(mcpExtractor);

  // Auto-start detection if requested
  if (options?.autoStart !== false) {
    // Start detection asynchronously
    detector.startAsyncDetection().catch(error => {
      console.warn('Auto-start design system detection failed:', error);
    });
  }

  return detector;
}

/**
 * Integration with existing UI
 * This allows the existing design system tab to use the unified approach
 */
export async function integrateWithExistingUI(detector: UnifiedDesignSystemDetector): Promise<void> {
  // Wait for design system context
  const context = await detector.startAsyncDetection();
  
  if (!context) {
    console.warn('No design system context available for UI integration');
    return;
  }

  // Send enhanced data to UI
  if (typeof figma !== 'undefined' && figma.ui) {
    figma.ui.postMessage({
      type: 'design-system-detected',
      data: {
        designSystem: context.designSystem,
        compliance: context.compliance,
        enhancements: context.mcpEnhancements,
        timestamp: context.metadata.detectedAt
      }
    });
  }
}

export default UnifiedDesignSystemDetector;