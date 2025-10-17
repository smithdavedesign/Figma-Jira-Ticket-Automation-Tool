/**
 * Enhanced Design System Scanner
 * 
 * This enhancement adds MCP capabilities to the existing design system scanner
 * without duplicating code. It extends the existing scanner with:
 * - Hierarchical component extraction
 * - Component instance tracking  
 * - Design system links detection
 * - Export capabilities
 */

/**
 * MCP Enhancement Mixin for Design System Scanner
 * Adds hierarchical and component instance capabilities to existing scanner
 */
export class MCPDesignSystemEnhancements {
  
  /**
   * Extract hierarchical component structure
   * This extends the existing scanner's component detection
   */
  static async extractHierarchicalComponents(pages: any[]): Promise<any> {
    const hierarchicalData = {
      frames: [],
      totalDepth: 0,
      componentCount: 0,
      instanceCount: 0,
      relationships: []
    };

    for (const page of pages) {
      if (page.children) {
        for (const frame of page.children) {
          const frameHierarchy = await this.analyzeFrameHierarchy(frame, 0);
          hierarchicalData.frames.push(frameHierarchy);
          hierarchicalData.totalDepth = Math.max(hierarchicalData.totalDepth, frameHierarchy.depth);
          hierarchicalData.componentCount += frameHierarchy.componentCount;
          hierarchicalData.instanceCount += frameHierarchy.instanceCount;
        }
      }
    }

    return hierarchicalData;
  }

  /**
   * Analyze frame hierarchy recursively
   */
  private static async analyzeFrameHierarchy(node: any, depth: number): Promise<any> {
    const frameData = {
      id: node.id,
      name: node.name,
      type: node.type,
      depth,
      layers: [],
      componentCount: 0,
      instanceCount: 0,
      children: []
    };

    // Count components and instances at this level
    if (node.type === 'COMPONENT') {
      frameData.componentCount++;
    } else if (node.type === 'INSTANCE') {
      frameData.instanceCount++;
    }

    // Build layer information
    if (node.children) {
      for (const child of node.children) {
        const layerInfo = {
          id: child.id,
          name: child.name,
          type: child.type,
          position: {
            x: child.absoluteBoundingBox?.x || 0,
            y: child.absoluteBoundingBox?.y || 0
          },
          size: {
            width: child.absoluteBoundingBox?.width || 0,
            height: child.absoluteBoundingBox?.height || 0
          },
          components: this.extractUsedComponents(child),
          tokens: await this.extractLayerTokens(child)
        };

        frameData.layers.push(layerInfo);

        // Recursively analyze children
        const childHierarchy = await this.analyzeFrameHierarchy(child, depth + 1);
        frameData.children.push(childHierarchy);
        frameData.componentCount += childHierarchy.componentCount;
        frameData.instanceCount += childHierarchy.instanceCount;
      }
    }

    return frameData;
  }

  /**
   * Extract component instances with detailed information
   */
  static async extractComponentInstances(pages: any[]): Promise<any[]> {
    const instances = [];

    for (const page of pages) {
      const pageInstances = await this.findInstancesInNode(page, page.name);
      instances.push(...pageInstances);
    }

    return instances;
  }

  /**
   * Find component instances recursively
   */
  private static async findInstancesInNode(node: any, pageName: string): Promise<any[]> {
    const instances = [];

    if (node.type === 'INSTANCE') {
      const instanceData = {
        id: node.id,
        name: node.name,
        masterComponentId: node.masterComponent?.id,
        pageName,
        properties: this.extractInstanceProperties(node),
        overrides: this.extractInstanceOverrides(node),
        variants: this.extractVariantProperties(node),
        parent: {
          id: node.parent?.id,
          name: node.parent?.name,
          type: node.parent?.type
        }
      };

      instances.push(instanceData);
    }

    // Recursively check children
    if (node.children) {
      for (const child of node.children) {
        const childInstances = await this.findInstancesInNode(child, pageName);
        instances.push(...childInstances);
      }
    }

    return instances;
  }

  /**
   * Detect design system links and references
   */
  static async detectDesignSystemLinks(designSystem: any): Promise<any> {
    const links = {
      buttons: null,
      typography: null,
      colors: null,
      spacing: null,
      components: null,
      icons: null,
      styles: {}
    };

    // Analyze component library for design system patterns
    if (designSystem.components) {
      const componentCategories = this.categorizeComponents(designSystem.components);
      
      // Map categories to design system links
      if (componentCategories.buttons.length > 0) {
        links.buttons = 'design-system/buttons';
      }
      if (componentCategories.inputs.length > 0) {
        links.components = 'design-system/form-components';
      }
      if (componentCategories.navigation.length > 0) {
        links.components = 'design-system/navigation';
      }
    }

    // Analyze color tokens
    if (designSystem.colors && designSystem.colors.length > 0) {
      links.colors = 'design-system/colors';
    }

    // Analyze typography tokens
    if (designSystem.typography && designSystem.typography.length > 0) {
      links.typography = 'design-system/typography';
    }

    // Analyze spacing tokens
    if (designSystem.spacing && designSystem.spacing.length > 0) {
      links.spacing = 'design-system/spacing';
    }

    return links;
  }

  /**
   * Generate export capabilities analysis
   */
  static async analyzeExportCapabilities(designSystem: any): Promise<any> {
    return {
      supportedFormats: ['PNG', 'SVG', 'PDF', 'JPG'],
      screenshots: {
        available: true,
        maxResolution: 'high',
        estimatedCount: designSystem.components?.totalComponents || 0
      },
      assets: {
        extractable: true,
        formats: ['PNG', 'SVG'],
        categories: ['icons', 'illustrations', 'images']
      },
      codeGeneration: {
        supported: true,
        frameworks: ['React', 'Vue', 'Angular', 'HTML/CSS'],
        features: ['component-props', 'style-tokens', 'accessibility']
      }
    };
  }

  // Helper methods

  private static extractUsedComponents(node: any): string[] {
    const components = [];
    
    if (node.type === 'INSTANCE' && node.masterComponent) {
      components.push(node.masterComponent.name || node.name);
    }

    return components;
  }

  private static async extractLayerTokens(node: any): Promise<any> {
    const tokens = {};

    // Extract colors
    if (node.fills && node.fills.length > 0) {
      const colors = node.fills
        .filter((fill: any) => fill.type === 'SOLID')
        .map((fill: any) => this.rgbToHex(fill.color));
      
      if (colors.length > 0) {
        tokens.colors = colors;
      }
    }

    // Extract spacing (padding/margins)
    const spacing = {};
    if (node.paddingLeft !== undefined) spacing.left = node.paddingLeft;
    if (node.paddingRight !== undefined) spacing.right = node.paddingRight;
    if (node.paddingTop !== undefined) spacing.top = node.paddingTop;
    if (node.paddingBottom !== undefined) spacing.bottom = node.paddingBottom;
    
    if (Object.keys(spacing).length > 0) {
      tokens.spacing = spacing;
    }

    // Extract typography for text nodes
    if (node.type === 'TEXT' && node.fontName) {
      tokens.typography = `${node.fontName.family}-${node.fontSize}-${node.fontName.style}`;
    }

    return tokens;
  }

  private static extractInstanceProperties(node: any): any {
    return {
      visible: node.visible,
      locked: node.locked,
      opacity: node.opacity,
      blendMode: node.blendMode,
      effects: node.effects?.length || 0,
      constraints: node.constraints
    };
  }

  private static extractInstanceOverrides(node: any): any[] {
    // This would need to be implemented based on Figma API
    // For now, return empty array
    return [];
  }

  private static extractVariantProperties(node: any): any {
    // Extract variant properties from component instance
    return node.variantProperties || {};
  }

  private static categorizeComponents(components: any): any {
    const categories = {
      buttons: [],
      inputs: [],
      navigation: [],
      cards: [],
      modals: [],
      other: []
    };

    if (components.components) {
      components.components.forEach((comp: any) => {
        const name = comp.name.toLowerCase();
        
        if (name.includes('button')) {
          categories.buttons.push(comp);
        } else if (name.includes('input') || name.includes('field')) {
          categories.inputs.push(comp);
        } else if (name.includes('nav') || name.includes('menu')) {
          categories.navigation.push(comp);
        } else if (name.includes('card')) {
          categories.cards.push(comp);
        } else if (name.includes('modal') || name.includes('dialog')) {
          categories.modals.push(comp);
        } else {
          categories.other.push(comp);
        }
      });
    }

    return categories;
  }

  private static rgbToHex(color: { r: number; g: number; b: number }): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

/**
 * Enhanced Design System Scanner Factory
 * Creates an enhanced scanner that combines existing functionality with MCP capabilities
 */
export function createEnhancedScanner(): any {
  return {
    /**
     * Enhanced scan that combines existing scanner with MCP enhancements
     */
    async scanWithMCPEnhancements(): Promise<any> {
      // Step 1: Use existing scanner (placeholder - would import actual scanner)
      console.log('🔍 Running base design system scan...');
      const baseDesignSystem = {
        id: `ds_${Date.now()}`,
        name: 'Enhanced Design System',
        pages: [], // Would come from existing scanner
        colors: [], // Would come from existing scanner
        typography: [], // Would come from existing scanner
        components: { components: [], totalComponents: 0 }, // Would come from existing scanner
        spacing: [], // Would come from existing scanner
        effects: [], // Would come from existing scanner
        detectionConfidence: 0.8
      };

      // Step 2: Add MCP enhancements
      console.log('⚡ Adding MCP enhancements...');
      
      const hierarchicalData = await MCPDesignSystemEnhancements.extractHierarchicalComponents(baseDesignSystem.pages);
      const componentInstances = await MCPDesignSystemEnhancements.extractComponentInstances(baseDesignSystem.pages);
      const designSystemLinks = await MCPDesignSystemEnhancements.detectDesignSystemLinks(baseDesignSystem);
      const exportCapabilities = await MCPDesignSystemEnhancements.analyzeExportCapabilities(baseDesignSystem);

      // Step 3: Combine into enhanced result
      const enhancedDesignSystem = {
        ...baseDesignSystem,
        
        // MCP enhancements
        hierarchy: hierarchicalData,
        componentInstances,
        designSystemLinks,
        exportCapabilities,
        
        // Enhanced metadata
        mcpMetadata: {
          enhancedAt: new Date().toISOString(),
          version: '1.0.0',
          features: ['hierarchy', 'component-instances', 'design-system-links', 'export-capabilities'],
          performance: {
            scanTime: 0, // Would be measured
            enhancementTime: 0 // Would be measured
          }
        }
      };

      console.log('✅ Enhanced design system scan complete');
      return enhancedDesignSystem;
    }
  };
}

export default MCPDesignSystemEnhancements;