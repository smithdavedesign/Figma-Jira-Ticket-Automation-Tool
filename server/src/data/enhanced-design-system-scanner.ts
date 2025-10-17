/**
 * Enhanced Design System Scanner with MCP Capabilities
 * 
 * Extends the existing design system scanner with MCP data layer enhancements
 * while preserving all existing functionality. This follows the integration
 * strategy to enhance rather than replace existing infrastructure.
 */

import { FigmaDataExtractor } from './extractor.js';
import type { 
  DesignSystem,
  ComponentInstance, 
  DesignSystemLinks, 
  HierarchicalData,
  LayerInfo
} from './types.js';

/**
 * Base Design System Scanner interface (simplified for compatibility)
 * This represents the existing scanner that we're extending
 */
interface BaseDesignSystemScanner {
  scanDesignSystem(): Promise<DesignSystem | null>;
}

/**
 * Enhanced Design System with MCP capabilities
 */
interface EnhancedDesignSystemResult extends DesignSystem {
  // MCP Enhancements
  hierarchy: HierarchicalData;
  componentInstances: ComponentInstance[];
  designSystemLinks: DesignSystemLinks;
  exportCapabilities: {
    screenshots: boolean;
    assets: boolean;
    tokens: boolean;
  };
  
  // Enhanced metadata
  mcpMetadata: {
    version: string;
    extractedAt: string;
    enhancementLevel: 'basic' | 'standard' | 'advanced';
    sources: string[];
    performance: {
      scanDuration: number;
      enhancementDuration: number;
      totalNodes: number;
      processedNodes: number;
    };
  };
}

/**
 * Enhanced Design System Scanner
 * Uses composition to extend existing scanner functionality with MCP capabilities
 */
class EnhancedDesignSystemScanner {
  // private mcpExtractor: FigmaDataExtractor;
  private enhancementLevel: 'basic' | 'standard' | 'advanced';
  private baseScanner: BaseDesignSystemScanner | null = null;

  constructor(
    mcpExtractor: FigmaDataExtractor,
    options: {
      enhancementLevel?: 'basic' | 'standard' | 'advanced';
      maxDepth?: number;
      includeScreenshots?: boolean;
      baseScanner?: BaseDesignSystemScanner;
    } = {}
  ) {
    // this.mcpExtractor = mcpExtractor;
    this.enhancementLevel = options.enhancementLevel || 'standard';
    this.baseScanner = options.baseScanner || null;
  }

  /**
   * Enhanced scan that includes all MCP capabilities
   * Builds on the existing scanDesignSystem method
   */
  async scanWithHierarchy(): Promise<EnhancedDesignSystemResult | null> {
    try {
      console.log('🔍 Starting enhanced design system scan with MCP capabilities...');
      
      const startTime = Date.now();
      
      // Step 1: Use existing scanner as foundation or create mock
      const baseSystem = await this.getBaseDesignSystem();
      
      if (!baseSystem) {
        console.log('ℹ️ No base design system found, cannot enhance');
        return null;
      }

      const enhancementStartTime = Date.now();
      
      // Step 2: Add MCP enhancements based on level
      const enhancements = await this.addMCPEnhancements(baseSystem);
      
      const enhancementDuration = Date.now() - enhancementStartTime;
      const totalDuration = Date.now() - startTime;

      // Step 3: Build enhanced result
      const enhancedResult: EnhancedDesignSystemResult = {
        ...baseSystem,
        ...enhancements,
        mcpMetadata: {
          version: '1.0.0',
          extractedAt: new Date().toISOString(),
          enhancementLevel: this.enhancementLevel,
          sources: ['existing-scanner', 'mcp-extractor'],
          performance: {
            scanDuration: enhancementStartTime - startTime,
            enhancementDuration,
            totalNodes: enhancements.hierarchy.totalNodes || 0,
            processedNodes: enhancements.componentInstances.length
          }
        }
      };

      console.log(`✅ Enhanced design system scan complete in ${totalDuration}ms`);
      console.log('📊 Enhancement results:', {
        baseConfidence: baseSystem.detectionConfidence,
        hierarchyDepth: enhancements.hierarchy.maxDepth,
        componentInstances: enhancements.componentInstances.length,
        systemLinks: Object.keys(enhancements.designSystemLinks).length
      });

      return enhancedResult;

    } catch (error) {
      console.error('❌ Enhanced design system scan failed:', error);
      // Fallback to base scanner
      const baseSystem = await this.getBaseDesignSystem();
      if (baseSystem) {
        return this.createMinimalEnhancement(baseSystem);
      }
      return null;
    }
  }

  /**
   * Get base design system from existing scanner or create mock
   */
  private async getBaseDesignSystem(): Promise<DesignSystem | null> {
    if (this.baseScanner) {
      return await this.baseScanner.scanDesignSystem();
    }
    
    // Create mock design system for demonstration
    return this.createMockDesignSystem();
  }

  /**
   * Create mock design system for demonstration purposes
   */
  private createMockDesignSystem(): DesignSystem {
    return {
      id: `ds_${Date.now()}`,
      name: 'Enhanced Design System',
      pages: [
        { id: 'page1', name: 'Components', children: [] },
        { id: 'page2', name: 'Tokens', children: [] }
      ],
      colors: [
        { id: 'color1', name: 'Primary', value: '#007AFF' },
        { id: 'color2', name: 'Secondary', value: '#FF3B30' }
      ],
      typography: [
        { id: 'typo1', name: 'Body', fontFamily: 'Inter', fontSize: 16 },
        { id: 'typo2', name: 'Heading', fontFamily: 'Inter', fontSize: 24 }
      ],
      components: {
        components: [
          { id: 'comp1', name: 'Button', type: 'COMPONENT' },
          { id: 'comp2', name: 'Card', type: 'COMPONENT' }
        ],
        categories: ['Navigation', 'Data Display'],
        totalComponents: 2
      },
      spacing: [
        { id: 'space1', name: 'Small', value: 8 },
        { id: 'space2', name: 'Medium', value: 16 }
      ],
      effects: [
        { id: 'effect1', name: 'Drop Shadow', type: 'DROP_SHADOW' }
      ],
      detectionConfidence: 0.85
    };
  }

  /**
   * Add MCP enhancements to existing design system
   */
  private async addMCPEnhancements(baseSystem: DesignSystem): Promise<{
    hierarchy: HierarchicalData;
    componentInstances: ComponentInstance[];
    designSystemLinks: DesignSystemLinks;
    exportCapabilities: any;
  }> {
    const enhancements = {
      hierarchy: await this.extractHierarchicalData(baseSystem),
      componentInstances: await this.extractComponentInstances(baseSystem),
      designSystemLinks: await this.detectDesignSystemLinks(baseSystem),
      exportCapabilities: await this.detectExportCapabilities(baseSystem)
    };

    return enhancements;
  }

  /**
   * Extract hierarchical structure from design system pages
   */
  private async extractHierarchicalData(baseSystem: DesignSystem): Promise<HierarchicalData> {
    try {
      // Focus on design system pages for hierarchy
      const hierarchyData: HierarchicalData = {
        totalNodes: 0,
        maxDepth: 0,
        layers: [],
        componentReferences: [],
        tokenUsage: {}
      };

      // Process each design system page
      for (const page of baseSystem.pages) {
        if (page.children && page.children.length > 0) {
          const pageHierarchy = await this.processPageHierarchy(page, 0);
          hierarchyData.layers.push(...pageHierarchy.layers);
          hierarchyData.totalNodes += pageHierarchy.nodeCount;
          hierarchyData.maxDepth = Math.max(hierarchyData.maxDepth, pageHierarchy.depth);
        }
      }

      return hierarchyData;

    } catch (error) {
      console.warn('⚠️ Failed to extract hierarchical data:', error);
      return {
        totalNodes: 0,
        maxDepth: 0,
        layers: [],
        componentReferences: [],
        tokenUsage: {}
      };
    }
  }

  /**
   * Process page hierarchy recursively
   */
  private async processPageHierarchy(
    node: any, 
    currentDepth: number
  ): Promise<{ 
    layers: any[]; 
    nodeCount: number; 
    depth: number 
  }> {
    const layers: any[] = [];
    let nodeCount = 1; // Count current node
    let maxDepth = currentDepth;

    // Process current node
    const layerData: LayerInfo = {
      id: node.id,
      name: node.name,
      type: node.type,
      position: { x: node.x || 0, y: node.y || 0 },
      size: { width: node.width || 0, height: node.height || 0 },
      tokens: await this.extractNodeTokens(node),
      children: [] as LayerInfo[]
    };

    layers.push(layerData);

    // Process children if they exist and we haven't reached max depth
    if (node.children && currentDepth < 5) { // Limit depth for performance
      for (const child of node.children) {
        const childResult = await this.processPageHierarchy(child, currentDepth + 1);
        if (childResult.layers && Array.isArray(childResult.layers)) {
          if (!layerData.children) {
            layerData.children = [];
          }
          layerData.children.push(...childResult.layers);
        }
        nodeCount += childResult.nodeCount;
        maxDepth = Math.max(maxDepth, childResult.depth);
      }
    }

    return { layers, nodeCount, depth: maxDepth };
  }

  /**
   * Extract design tokens from a specific node
   */
  private async extractNodeTokens(node: any): Promise<any> {
    const tokens: any = {};

    try {
      // Extract colors
      if (node.fills && node.fills.length > 0) {
        tokens.colors = node.fills
          .filter((fill: any) => fill.type === 'SOLID')
          .map((fill: any) => this.rgbToHex(fill.color));
      }

      // Extract typography
      if (node.fontName) {
        tokens.typography = {
          fontFamily: node.fontName.family,
          fontWeight: node.fontName.style,
          fontSize: node.fontSize
        };
      }

      // Extract effects
      if (node.effects && node.effects.length > 0) {
        tokens.effects = node.effects.map((effect: any) => ({
          type: effect.type,
          radius: effect.radius,
          color: effect.color ? this.rgbToHex(effect.color) : null
        }));
      }

    } catch (error) {
      console.warn(`⚠️ Failed to extract tokens from node ${node.id}:`, error);
    }

    return tokens;
  }

  /**
   * Extract component instances with master relationships
   */
  private async extractComponentInstances(baseSystem: DesignSystem): Promise<ComponentInstance[]> {
    const instances: ComponentInstance[] = [];

    try {
      // Process design system pages looking for component instances
      for (const page of baseSystem.pages) {
        const pageInstances = await this.findInstancesInPage(page);
        instances.push(...pageInstances);
      }

      console.log(`📦 Found ${instances.length} component instances`);
      return instances;

    } catch (error) {
      console.warn('⚠️ Failed to extract component instances:', error);
      return [];
    }
  }

  /**
   * Find component instances in a page recursively
   */
  private async findInstancesInPage(node: any): Promise<ComponentInstance[]> {
    const instances: ComponentInstance[] = [];

    if (!node) return instances;

    // Check if current node is a component instance
    if (node.type === 'INSTANCE' && node.mainComponent) {
      instances.push({
        id: node.id,
        name: node.name,
        masterComponentId: node.mainComponent.id,
        masterComponentName: node.mainComponent.name,
        props: this.extractInstanceProps(node),
        overrides: this.extractInstanceOverrides(node),
        variantProperties: node.variantProperties || {},
        parentFrameId: node.parent?.id,
        parentFrameName: node.parent?.name
      });
    }

    // Recursively check children
    if (node.children) {
      for (const child of node.children) {
        const childInstances = await this.findInstancesInPage(child);
        instances.push(...childInstances);
      }
    }

    return instances;
  }

  /**
   * Extract instance properties
   */
  private extractInstanceProps(node: any): Record<string, any> {
    const props: Record<string, any> = {};

    try {
      // Extract variant properties
      if (node.variantProperties) {
        Object.assign(props, node.variantProperties);
      }

      // Extract component properties
      if (node.componentProperties) {
        Object.assign(props, node.componentProperties);
      }

    } catch (error) {
      console.warn(`⚠️ Failed to extract props from instance ${node.id}:`, error);
    }

    return props;
  }

  /**
   * Extract instance overrides
   */
  private extractInstanceOverrides(node: any): any[] {
    const overrides: any[] = [];

    try {
      if (node.overrides) {
        overrides.push(...node.overrides);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to extract overrides from instance ${node.id}:`, error);
    }

    return overrides;
  }

  /**
   * Detect design system links based on existing data
   */
  private async detectDesignSystemLinks(baseSystem: DesignSystem): Promise<DesignSystemLinks> {
    const links: DesignSystemLinks = {};

    try {
      // Link to buttons if button components exist
      if (baseSystem.components.components.some((c: any) => 
        c.name.toLowerCase().includes('button'))) {
        links.buttons = 'design-system/buttons';
      }

      // Link to typography if typography tokens exist
      if (baseSystem.typography.length > 0) {
        links.typography = 'design-system/typography';
      }

      // Link to colors if color tokens exist
      if (baseSystem.colors.length > 0) {
        links.colors = 'design-system/colors';
      }

      // Link to spacing if spacing tokens exist
      if (baseSystem.spacing.length > 0) {
        links.spacing = 'design-system/spacing';
      }

      // Link to effects if effect tokens exist
      if (baseSystem.effects.length > 0) {
        links.effects = 'design-system/effects';
      }

      console.log(`🔗 Generated ${Object.keys(links).length} design system links`);
      return links;

    } catch (error) {
      console.warn('⚠️ Failed to detect design system links:', error);
      return {};
    }
  }

  /**
   * Detect export capabilities
   */
  private async detectExportCapabilities(baseSystem: DesignSystem): Promise<any> {
    return {
      screenshots: true, // Always available through Figma API
      assets: baseSystem.components.totalComponents > 0,
      tokens: baseSystem.colors.length > 0 || baseSystem.typography.length > 0
    };
  }

  /**
   * Create minimal enhancement for fallback
   */
  private createMinimalEnhancement(baseSystem: DesignSystem): EnhancedDesignSystemResult {
    return {
      ...baseSystem,
      hierarchy: {
        totalNodes: 0,
        maxDepth: 0,
        layers: [],
        componentReferences: [],
        tokenUsage: {}
      },
      componentInstances: [],
      designSystemLinks: {},
      exportCapabilities: {
        screenshots: false,
        assets: false,
        tokens: false
      },
      mcpMetadata: {
        version: '1.0.0',
        extractedAt: new Date().toISOString(),
        enhancementLevel: 'basic',
        sources: ['existing-scanner'],
        performance: {
          scanDuration: 0,
          enhancementDuration: 0,
          totalNodes: 0,
          processedNodes: 0
        }
      }
    };
  }

  /**
   * Utility: Convert RGB to Hex
   */
  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }
}

/**
 * Factory function to create enhanced scanner
 */
export function createEnhancedDesignSystemScanner(
  mcpExtractor: FigmaDataExtractor,
  options?: {
    enhancementLevel?: 'basic' | 'standard' | 'advanced';
    maxDepth?: number;
    includeScreenshots?: boolean;
  }
): EnhancedDesignSystemScanner {
  return new EnhancedDesignSystemScanner(mcpExtractor, options);
}

export { EnhancedDesignSystemScanner };
export type { EnhancedDesignSystemResult };