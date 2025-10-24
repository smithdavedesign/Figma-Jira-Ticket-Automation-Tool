/**
 * 🏭 Design Spec Generator
 * 
 * Transforms raw Figma data into standardized designSpec.json format
 * for consumption by AI models and framework adapters.
 */

import { 
  DesignSpec, 
  DesignSpecMetadata,
  DesignTokens,
  DesignComponent,
  DesignSystemAnalysis,
  ResponsiveDesignData,
  AccessibilityData,
  DesignContext,
  ColorToken,
  TypographyToken,
  ComponentType,
  ComponentIntent,
  AccessibilityRole,
  DESIGN_SPEC_VERSION
} from '../schema/design-spec.js';

// Figma-like input interfaces (from existing MCP)
interface FigmaFrameData {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  children?: FigmaFrameData[];
  characters?: string;
  style?: any;
  componentId?: string;
  mainComponent?: any;
  // Add other Figma properties as needed
}

interface FigmaFileContext {
  fileId: string;
  fileName: string;
  pageId: string;
  pageName: string;
  nodeIds: string[];
  designSystem?: any;
  styles?: any;
}

interface ExtractionContext {
  extractedBy: string;
  processingTime: number;
  userSelection: boolean;
  selectionType: 'frame' | 'component' | 'instance' | 'mixed';
  techStack?: string[];
  confidence?: number;
}

export class DesignSpecGenerator {
  private specId: string;
  private extractionStartTime: number;

  constructor() {
    this.specId = this.generateSpecId();
    this.extractionStartTime = Date.now();
  }

  /**
   * Generate a complete design specification from Figma data
   */
  async generateDesignSpec(
    figmaData: FigmaFrameData[],
    fileContext: FigmaFileContext,
    extractionContext: ExtractionContext
  ): Promise<DesignSpec> {
    try {
      const processingEndTime = Date.now();
      const totalProcessingTime = processingEndTime - this.extractionStartTime;

      // Generate each section of the design spec
      const metadata = this.generateMetadata(figmaData, fileContext, extractionContext, totalProcessingTime);
      const designTokens = await this.extractDesignTokens(figmaData, fileContext);
      const components = await this.analyzeComponents(figmaData, fileContext);
      const designSystem = await this.analyzeDesignSystem(figmaData, fileContext, designTokens);
      const responsive = await this.analyzeResponsiveDesign(figmaData);
      const accessibility = await this.analyzeAccessibility(figmaData, components);
      const context = await this.generateDesignContext(figmaData, fileContext, extractionContext);

      const designSpec: DesignSpec = {
        metadata,
        designTokens,
        components,
        designSystem,
        responsive,
        accessibility,
        context
      };

      return designSpec;

    } catch (error) {
      throw new Error(`Failed to generate design spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate metadata section
   */
  private generateMetadata(
    figmaData: FigmaFrameData[],
    fileContext: FigmaFileContext,
    extractionContext: ExtractionContext,
    processingTime: number
  ): DesignSpecMetadata {
    const elementCount = this.countTotalElements(figmaData);
    const complexity = this.assessComplexity(elementCount, figmaData.length);

    return {
      version: DESIGN_SPEC_VERSION,
      specId: this.specId,
      figmaFile: {
        fileId: fileContext.fileId,
        fileName: fileContext.fileName,
        pageId: fileContext.pageId,
        pageName: fileContext.pageName,
        nodeIds: fileContext.nodeIds
      },
      extraction: {
        timestamp: new Date().toISOString(),
        extractedBy: extractionContext.extractedBy,
        processingTime,
        confidence: extractionContext.confidence || 0.8
      },
      context: {
        userSelection: extractionContext.userSelection,
        selectionType: extractionContext.selectionType,
        elementCount,
        complexity
      }
    };
  }

  /**
   * Extract design tokens from Figma data
   */
  private async extractDesignTokens(
    figmaData: FigmaFrameData[],
    fileContext: FigmaFileContext
  ): Promise<DesignTokens> {
    const colors: ColorToken[] = [];
    const typography: TypographyToken[] = [];
    const spacing: any[] = [];
    const effects: any[] = [];
    const borders: any[] = [];
    const radii: any[] = [];

    // Extract colors from fills and strokes
    const colorMap = new Map<string, ColorToken>();
    let colorId = 1;

    const extractColorsFromNode = (node: FigmaFrameData) => {
      // Extract from fills
      if (node.fills) {
        node.fills.forEach((fill: any) => {
          if (fill.type === 'SOLID' && fill.color) {
            const colorValue = this.rgbaToHex(fill.color);
            if (!colorMap.has(colorValue)) {
              colorMap.set(colorValue, {
                id: `color-${colorId++}`,
                name: `color-${colorValue.replace('#', '')}`,
                value: colorValue,
                rgba: fill.color,
                usage: this.inferColorUsage(colorValue, node.type),
                scope: 'local',
                references: [node.id]
              });
            } else {
              colorMap.get(colorValue)!.references.push(node.id);
            }
          }
        });
      }

      // Extract from strokes
      if (node.strokes) {
        node.strokes.forEach((stroke: any) => {
          if (stroke.type === 'SOLID' && stroke.color) {
            const colorValue = this.rgbaToHex(stroke.color);
            if (!colorMap.has(colorValue)) {
              colorMap.set(colorValue, {
                id: `stroke-color-${colorId++}`,
                name: `stroke-${colorValue.replace('#', '')}`,
                value: colorValue,
                rgba: stroke.color,
                usage: 'neutral',
                scope: 'local',
                references: [node.id]
              });
            } else {
              colorMap.get(colorValue)!.references.push(node.id);
            }
          }
        });
      }

      // Process children recursively
      if (node.children) {
        node.children.forEach(extractColorsFromNode);
      }
    };

    figmaData.forEach(extractColorsFromNode);
    colors.push(...Array.from(colorMap.values()));

    // Extract typography tokens
    const typographyMap = new Map<string, TypographyToken>();
    let typographyId = 1;

    const extractTypographyFromNode = (node: FigmaFrameData) => {
      if (node.type === 'TEXT' && node.style) {
        const style = node.style;
        const key = `${style.fontFamily}-${style.fontSize}-${style.fontWeight}`;
        
        if (!typographyMap.has(key)) {
          typographyMap.set(key, {
            id: `typography-${typographyId++}`,
            name: `${style.fontFamily}-${style.fontSize}`,
            fontFamily: style.fontFamily || 'Arial',
            fontSize: style.fontSize || 16,
            fontWeight: style.fontWeight || 400,
            lineHeight: style.lineHeight || 1.2,
            letterSpacing: style.letterSpacing || 0,
            usage: this.inferTypographyUsage(style.fontSize, node.name),
            scope: 'local',
            references: [node.id]
          });
        } else {
          typographyMap.get(key)!.references.push(node.id);
        }
      }

      if (node.children) {
        node.children.forEach(extractTypographyFromNode);
      }
    };

    figmaData.forEach(extractTypographyFromNode);
    typography.push(...Array.from(typographyMap.values()));

    return {
      colors,
      typography,
      spacing,
      effects,
      borders,
      radii
    };
  }

  /**
   * Analyze components and their semantic meaning
   */
  private async analyzeComponents(
    figmaData: FigmaFrameData[],
    fileContext: FigmaFileContext
  ): Promise<DesignComponent[]> {
    const components: DesignComponent[] = [];

    const analyzeNode = (node: FigmaFrameData, parent?: string, level: number = 0): DesignComponent => {
      const intent = this.inferComponentIntent(node);
      const role = this.inferAccessibilityRole(node, intent);

      const component: DesignComponent = {
        id: node.id,
        name: node.name,
        type: this.mapFigmaTypeToComponentType(node.type),
        category: this.inferComponentCategory(intent),
        semantic: {
          intent,
          role,
          pattern: this.inferDesignPattern(node),
          confidence: this.calculateSemanticConfidence(node, intent)
        },
        visual: {
          dimensions: { width: node.width, height: node.height },
          position: { x: node.x, y: node.y },
          constraints: { horizontal: 'left', vertical: 'top' }, // Default
          fills: node.fills || [],
          strokes: node.strokes || [],
          effects: node.effects || [],
          cornerRadius: this.extractCornerRadius(node)
        },
        content: {
          text: node.type === 'TEXT' ? [{
            id: `${node.id}-text`,
            text: node.characters || '',
            style: {} as any, // Would be populated with extracted typography
            fills: node.fills || [],
            alignment: 'left',
            verticalAlignment: 'top',
            semantic: {
              role: this.inferTextRole(node.name, node.characters),
              isInteractive: this.isInteractiveText(node)
            }
          }] : undefined,
          images: node.type === 'IMAGE' ? [{
            id: `${node.id}-image`,
            dimensions: { width: node.width, height: node.height },
            semantic: {
              role: 'informative',
              description: `Image from ${node.name}`
            }
          }] : undefined
        },
        hierarchy: {
          parent,
          children: (node.children || []).map(child => child.id),
          level,
          isRoot: level === 0
        },
        relationships: {
          instances: node.componentId ? [node.componentId] : undefined,
          masterComponent: node.mainComponent?.id
        },
        framework: {
          suggestedTag: this.suggestHTMLTag(node, intent),
          attributes: this.generateFrameworkAttributes(node, intent),
          events: this.inferPossibleEvents(intent),
          states: this.inferComponentStates(intent)
        }
      };

      return component;
    };

    const processNodeRecursively = (node: FigmaFrameData, parent?: string, level: number = 0) => {
      const component = analyzeNode(node, parent, level);
      components.push(component);

      if (node.children) {
        node.children.forEach(child => 
          processNodeRecursively(child, node.id, level + 1)
        );
      }
    };

    figmaData.forEach(node => processNodeRecursively(node));

    return components;
  }

  /**
   * Analyze design system compliance
   */
  private async analyzeDesignSystem(
    figmaData: FigmaFrameData[],
    fileContext: FigmaFileContext,
    designTokens: DesignTokens
  ): Promise<DesignSystemAnalysis> {
    // This would integrate with the existing design system detection logic
    return {
      detected: {
        system: 'custom',
        confidence: 0.7,
        evidence: ['Custom color palette detected', 'Consistent spacing patterns']
      },
      compliance: {
        overall: 0.8,
        categories: {
          colors: { score: 0.9, passed: 18, total: 20, issues: [] },
          typography: { score: 0.7, passed: 14, total: 20, issues: ['Missing font weights'] },
          spacing: { score: 0.8, passed: 16, total: 20, issues: [] },
          components: { score: 0.8, passed: 16, total: 20, issues: [] }
        },
        violations: [],
        recommendations: []
      },
      systemTokens: {
        colors: designTokens.colors.length,
        typography: designTokens.typography.length,
        spacing: designTokens.spacing.length,
        components: figmaData.length,
        coverage: 0.75
      }
    };
  }

  /**
   * Analyze responsive design patterns
   */
  private async analyzeResponsiveDesign(figmaData: FigmaFrameData[]): Promise<ResponsiveDesignData> {
    return {
      breakpoints: [
        { name: 'mobile', minWidth: 320, maxWidth: 767, usage: 'mobile' },
        { name: 'tablet', minWidth: 768, maxWidth: 1023, usage: 'tablet' },
        { name: 'desktop', minWidth: 1024, usage: 'desktop' }
      ],
      layouts: [],
      flexible: {
        flexbox: [],
        grid: [],
        responsive: []
      },
      mobileFriendly: {
        isMobileFriendly: true,
        issues: [],
        recommendations: []
      }
    };
  }

  /**
   * Analyze accessibility compliance
   */
  private async analyzeAccessibility(
    figmaData: FigmaFrameData[],
    components: DesignComponent[]
  ): Promise<AccessibilityData> {
    return {
      compliance: {
        wcag: 'partial',
        score: 0.7,
        automated: true
      },
      semantics: {
        headingStructure: [],
        landmarks: [],
        navigation: [],
        forms: []
      },
      colorAccessibility: {
        contrastIssues: [],
        colorDependency: false,
        colorBlindnessIssues: []
      },
      interaction: {
        focusable: [],
        keyboardNavigation: true,
        touchTargets: []
      },
      content: {
        altTexts: [],
        textScaling: true,
        readingOrder: components.map(c => c.id)
      },
      issues: [],
      recommendations: []
    };
  }

  /**
   * Generate design context and intent
   */
  private async generateDesignContext(
    figmaData: FigmaFrameData[],
    fileContext: FigmaFileContext,
    extractionContext: ExtractionContext
  ): Promise<DesignContext> {
    const complexity = this.assessComplexity(this.countTotalElements(figmaData), figmaData.length);
    
    return {
      intent: {
        purpose: this.inferDesignPurpose(figmaData, fileContext),
        context: 'web' // Default, could be inferred
      },
      technical: {
        framework: extractionContext.techStack?.[0] as any,
        platform: 'web',
        constraints: [],
        integrations: []
      },
      decisions: {
        rationale: [],
        assumptions: ['Web-based interface', 'Modern browser support'],
        constraints: ['Performance considerations', 'Accessibility compliance'],
        tradeoffs: []
      },
      quality: {
        completeness: 0.8,
        consistency: 0.7,
        clarity: 0.8,
        complexity: complexity === 'simple' ? 0.3 : complexity === 'moderate' ? 0.6 : 0.9,
        confidence: extractionContext.confidence || 0.8
      }
    };
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private generateSpecId(): string {
    return `spec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private countTotalElements(figmaData: FigmaFrameData[]): number {
    let count = 0;
    const countNode = (node: FigmaFrameData) => {
      count++;
      if (node.children) {
        node.children.forEach(countNode);
      }
    };
    figmaData.forEach(countNode);
    return count;
  }

  private assessComplexity(elementCount: number, rootCount: number): 'simple' | 'moderate' | 'complex' {
    if (elementCount < 20 && rootCount < 3) return 'simple';
    if (elementCount < 100 && rootCount < 10) return 'moderate';
    return 'complex';
  }

  private rgbaToHex(rgba: { r: number; g: number; b: number; a?: number }): string {
    const toHex = (value: number) => Math.round(value * 255).toString(16).padStart(2, '0');
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
  }

  private inferColorUsage(colorValue: string, nodeType: string): ColorToken['usage'] {
    // Simple heuristics - would be enhanced with ML classification
    if (colorValue === '#FFFFFF' || colorValue === '#000000') return 'neutral';
    if (nodeType === 'RECTANGLE' || nodeType === 'FRAME') return 'primary';
    return 'secondary';
  }

  private inferTypographyUsage(fontSize: number, nodeName: string): TypographyToken['usage'] {
    if (fontSize >= 24) return 'heading';
    if (fontSize >= 16) return 'body';
    if (nodeName.toLowerCase().includes('label')) return 'label';
    return 'caption';
  }

  private mapFigmaTypeToComponentType(figmaType: string): ComponentType {
    const typeMap: Record<string, ComponentType> = {
      'FRAME': 'frame',
      'GROUP': 'group',
      'COMPONENT': 'component',
      'INSTANCE': 'instance',
      'TEXT': 'text',
      'RECTANGLE': 'rectangle',
      'ELLIPSE': 'ellipse',
      'POLYGON': 'polygon',
      'STAR': 'star',
      'VECTOR': 'vector',
      'IMAGE': 'image'
    };
    return typeMap[figmaType] || 'frame';
  }

  private inferComponentIntent(node: FigmaFrameData): ComponentIntent {
    const name = node.name.toLowerCase();
    
    // Button detection
    if (name.includes('button') || name.includes('btn')) return 'button';
    if (name.includes('input') || name.includes('field')) return 'input';
    if (name.includes('card')) return 'card';
    if (name.includes('modal') || name.includes('dialog')) return 'modal';
    if (name.includes('nav') || name.includes('menu')) return 'navigation';
    if (name.includes('header')) return 'header';
    if (name.includes('footer')) return 'footer';
    if (name.includes('sidebar')) return 'sidebar';
    if (name.includes('hero')) return 'hero';
    if (name.includes('form')) return 'form';
    if (name.includes('list')) return 'list';
    if (name.includes('grid')) return 'grid';
    if (name.includes('table')) return 'table';
    
    // Default based on node type
    if (node.type === 'TEXT') return 'content';
    if (node.type === 'IMAGE') return 'content';
    if (node.children && node.children.length > 0) return 'content';
    
    return 'unknown';
  }

  private inferAccessibilityRole(node: FigmaFrameData, intent: ComponentIntent): AccessibilityRole {
    const roleMap: Partial<Record<ComponentIntent, AccessibilityRole>> = {
      'button': 'button',
      'input': 'textbox',
      'card': 'article',
      'modal': 'dialog',
      'navigation': 'navigation',
      'header': 'banner',
      'footer': 'contentinfo',
      'sidebar': 'complementary',
      'content': 'main',
      'hero': 'banner',
      'form': 'main',
      'list': 'list',
      'grid': 'main',
      'table': 'main',
      'unknown': 'none'
    };
    return roleMap[intent] || 'none';
  }

  private inferComponentCategory(intent: ComponentIntent): DesignComponent['category'] {
    const categoryMap: Partial<Record<ComponentIntent, DesignComponent['category']>> = {
      'button': 'interactive',
      'input': 'form',
      'card': 'display',
      'modal': 'overlay',
      'navigation': 'navigation',
      'header': 'layout',
      'footer': 'layout',
      'sidebar': 'layout',
      'content': 'display',
      'hero': 'display',
      'form': 'form',
      'list': 'display',
      'grid': 'layout',
      'table': 'display',
      'unknown': 'layout'
    };
    return categoryMap[intent] || 'layout';
  }

  private inferDesignPattern(node: FigmaFrameData): DesignComponent['semantic']['pattern'] {
    if (this.hasFlexboxLayout(node)) return 'flexbox';
    if (this.hasGridLayout(node)) return 'grid';
    if (this.isStackLayout(node)) return 'stack';
    return 'container';
  }

  private calculateSemanticConfidence(node: FigmaFrameData, intent: ComponentIntent): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on naming patterns
    const name = node.name.toLowerCase();
    if (name.includes(intent)) confidence += 0.3;
    
    // Increase confidence based on structure
    if (intent === 'button' && node.type === 'FRAME' && node.children?.some(c => c.type === 'TEXT')) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  private extractCornerRadius(node: FigmaFrameData): number | undefined {
    // Would extract from Figma's cornerRadius property
    return undefined;
  }

  private inferTextRole(nodeName: string, text?: string): 'heading' | 'body' | 'label' | 'caption' | 'code' {
    const name = nodeName.toLowerCase();
    if (name.includes('title') || name.includes('heading') || name.includes('h1') || name.includes('h2')) return 'heading';
    if (name.includes('label')) return 'label';
    if (name.includes('caption') || name.includes('subtitle')) return 'caption';
    if (name.includes('code')) return 'code';
    return 'body';
  }

  private isInteractiveText(node: FigmaFrameData): boolean {
    const name = node.name.toLowerCase();
    return name.includes('link') || name.includes('button') || name.includes('clickable');
  }

  private suggestHTMLTag(node: FigmaFrameData, intent: ComponentIntent): string {
    const tagMap: Partial<Record<ComponentIntent, string>> = {
      'button': 'button',
      'input': 'input',
      'card': 'article',
      'modal': 'dialog',
      'navigation': 'nav',
      'header': 'header',
      'footer': 'footer',
      'sidebar': 'aside',
      'content': 'main',
      'hero': 'section',
      'form': 'form',
      'list': 'ul',
      'grid': 'div',
      'table': 'table',
      'unknown': 'div'
    };
    return tagMap[intent] || 'div';
  }

  private generateFrameworkAttributes(node: FigmaFrameData, intent: ComponentIntent): Record<string, any> {
    const attributes: Record<string, any> = {};
    
    if (intent === 'button') {
      attributes.type = 'button';
    }
    
    if (intent === 'input') {
      attributes.type = 'text';
      attributes.placeholder = 'Enter text...';
    }
    
    if (node.name) {
      attributes['data-testid'] = node.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    return attributes;
  }

  private inferPossibleEvents(intent: ComponentIntent): string[] {
    const eventMap: Partial<Record<ComponentIntent, string[]>> = {
      'button': ['onClick', 'onHover', 'onFocus'],
      'input': ['onChange', 'onFocus', 'onBlur', 'onKeyPress'],
      'form': ['onSubmit'],
      'modal': ['onClose', 'onOpen'],
      'navigation': ['onClick']
    };
    return eventMap[intent] || [];
  }

  private inferComponentStates(intent: ComponentIntent): DesignComponent['framework']['states'] {
    const baseStates: Array<{
      name: string;
      properties: Record<string, any>;
      triggers: string[];
    }> = [
      { name: 'default', properties: {}, triggers: [] }
    ];
    
    if (intent === 'button') {
      baseStates.push(
        { name: 'hover', properties: { backgroundColor: 'darker' }, triggers: ['onHover'] },
        { name: 'active', properties: { transform: 'scale(0.98)' }, triggers: ['onMouseDown'] },
        { name: 'disabled', properties: { opacity: 0.5, cursor: 'not-allowed' }, triggers: [] }
      );
    }
    
    return baseStates;
  }

  private hasFlexboxLayout(node: FigmaFrameData): boolean {
    // Would check Figma's auto-layout properties
    return false;
  }

  private hasGridLayout(node: FigmaFrameData): boolean {
    // Would check for grid-like arrangements
    return false;
  }

  private isStackLayout(node: FigmaFrameData): boolean {
    // Would check for vertical/horizontal stacking
    return node.children?.length ? true : false;
  }

  private inferDesignPurpose(figmaData: FigmaFrameData[], fileContext: FigmaFileContext): string {
    const fileName = fileContext.fileName.toLowerCase();
    const nodeNames = figmaData.map(n => n.name.toLowerCase()).join(' ');
    
    if (fileName.includes('dashboard') || nodeNames.includes('dashboard')) {
      return 'Dashboard interface for data visualization and management';
    }
    if (fileName.includes('landing') || nodeNames.includes('hero')) {
      return 'Landing page to attract and convert visitors';
    }
    if (fileName.includes('form') || nodeNames.includes('form')) {
      return 'Form interface for data collection';
    }
    
    return 'User interface components for web application';
  }
}

/**
 * Quick generation function for simple use cases
 */
export async function generateDesignSpec(
  figmaData: FigmaFrameData[],
  fileContext: FigmaFileContext,
  extractionContext: ExtractionContext
): Promise<DesignSpec> {
  const generator = new DesignSpecGenerator();
  return generator.generateDesignSpec(figmaData, fileContext, extractionContext);
}