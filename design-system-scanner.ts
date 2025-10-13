/**
 * Design System Scanner
 * 
 * Automatically detects and analyzes design systems within Figma files.
 * Scans pages, styles, and components to build a comprehensive design system map.
 */

/// <reference path="types.ts" />

class DesignSystemScanner {
  private file: any;
  private designSystem: DesignSystem | null = null;

  constructor() {
    this.file = figma.root;
  }

  /**
   * Main entry point for design system detection
   * Scans the entire file and builds a design system object
   */
  async scanDesignSystem(): Promise<DesignSystem | null> {
    try {
      console.log('🔍 Starting design system scan...');
      
      // Step 1: Detect design system pages
      const designSystemPages = await this.detectDesignSystemPages();
      
      // Step 2: Extract style tokens
      const colorTokens = await this.extractColorTokens();
      const typographyTokens = await this.extractTypographyTokens();
      const effectTokens = await this.extractEffectTokens();
      
      // Step 3: Build component library
      const componentLibrary = await this.buildComponentLibrary();
      
      // Step 4: Extract spacing tokens (derived from components)
      const spacingTokens = await this.extractSpacingTokens();
      
      // Step 5: Calculate detection confidence
      const confidence = this.calculateDetectionConfidence({
        pages: designSystemPages,
        colors: colorTokens,
        typography: typographyTokens,
        components: componentLibrary
      });

      // Only create design system if we have reasonable confidence
      if (confidence < 0.3) {
        console.log('❌ Low confidence in design system detection:', confidence);
        return null;
      }

      this.designSystem = {
        id: this.file.id || 'unknown',
        name: this.deriveDesignSystemName(designSystemPages),
        pages: designSystemPages,
        colors: colorTokens,
        typography: typographyTokens,
        components: componentLibrary,
        spacing: spacingTokens,
        effects: effectTokens,
        detectionConfidence: confidence
      };

      console.log('✅ Design system detected with confidence:', confidence);
      console.log('📊 Found:', {
        pages: designSystemPages.length,
        colors: colorTokens.length,
        typography: typographyTokens.length,
        components: componentLibrary.components.length
      });

      return this.designSystem;
    } catch (error) {
      console.error('❌ Error scanning design system:', error);
      return null;
    }
  }

  /**
   * Detect pages that likely contain design system content
   */
  private async detectDesignSystemPages(): Promise<DesignSystemPage[]> {
    const pages: DesignSystemPage[] = [];
    const designSystemKeywords = [
      'design system', 'components', 'tokens', 'styles', 'library',
      'atoms', 'molecules', 'organisms', 'foundation', 'primitives'
    ];

    for (const page of this.file.children) {
      const pageName = page.name.toLowerCase();
      let confidence = 0;
      let type: DesignSystemPage['type'] = 'documentation';

      // Check page name against keywords
      for (const keyword of designSystemKeywords) {
        if (pageName.includes(keyword)) {
          confidence += 0.3;
          
          // Determine page type based on keywords
          if (keyword.includes('component')) type = 'components';
          else if (keyword.includes('token') || keyword.includes('style')) type = 'tokens';
          else if (keyword.includes('foundation') || keyword.includes('primitive')) type = 'styles';
        }
      }

      // Analyze page content for design system indicators
      const contentScore = await this.analyzePageContent(page);
      confidence += contentScore;

      // Only include pages with reasonable confidence
      if (confidence > 0.2) {
        pages.push({
          id: page.id,
          name: page.name,
          type,
          confidence: Math.min(confidence, 1.0)
        });
      }
    }

    return pages.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze page content to determine if it contains design system elements
   */
  private async analyzePageContent(page: any): Promise<number> {
    let score = 0;
    let componentCount = 0;
    let publishedStyleCount = 0;

    try {
      // Count components on this page
      const components = page.findAll((node: any) => 
        node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
      );
      componentCount = components.length;

      // Score based on component density
      if (componentCount > 10) score += 0.4;
      else if (componentCount > 5) score += 0.2;
      else if (componentCount > 0) score += 0.1;

      // Look for organized layouts (grids, systematic spacing)
      const frames = page.findAll((node: any) => node.type === 'FRAME');
      const systematicLayout = this.detectSystematicLayout(frames);
      if (systematicLayout) score += 0.2;

      // Look for documentation patterns (text with examples)
      const textNodes = page.findAll((node: any) => node.type === 'TEXT');
      const hasDocumentation = this.detectDocumentationPattern(textNodes);
      if (hasDocumentation) score += 0.1;

    } catch (error) {
      console.warn('Error analyzing page content:', error);
    }

    return score;
  }

  /**
   * Extract color tokens from published paint styles
   */
  private async extractColorTokens(): Promise<ColorToken[]> {
    const colorTokens: ColorToken[] = [];

    try {
      const paintStyles = figma.getLocalPaintStyles();
      
      for (const style of paintStyles) {
        if (style.paints.length > 0 && style.paints[0].type === 'SOLID') {
          const paint = style.paints[0] as SolidPaint;
          
          colorTokens.push({
            id: style.id,
            name: style.name,
            value: paint.color,
            description: style.description,
            semantic: this.inferSemanticColor(style.name)
          });
        }
      }
    } catch (error) {
      console.warn('Error extracting color tokens:', error);
    }

    return colorTokens;
  }

  /**
   * Extract typography tokens from published text styles
   */
  private async extractTypographyTokens(): Promise<TypographyToken[]> {
    const typographyTokens: TypographyToken[] = [];

    try {
      const textStyles = figma.getLocalTextStyles();
      
      for (const style of textStyles) {
        const fontSize = style.fontSize;
        const fontName = style.fontName;
        
        if (typeof fontSize === 'number' && fontName && typeof fontName === 'object') {
          typographyTokens.push({
            id: style.id,
            name: style.name,
            fontFamily: fontName.family,
            fontSize: fontSize,
            fontWeight: fontName.style,
            lineHeight: style.lineHeight?.value,
            letterSpacing: style.letterSpacing?.value
          });
        }
      }
    } catch (error) {
      console.warn('Error extracting typography tokens:', error);
    }

    return typographyTokens;
  }

  /**
   * Extract effect tokens from published effect styles
   */
  private async extractEffectTokens(): Promise<EffectToken[]> {
    const effectTokens: EffectToken[] = [];

    try {
      const effectStyles = figma.getLocalEffectStyles();
      
      for (const style of effectStyles) {
        if (style.effects.length > 0) {
          const effect = style.effects[0];
          
          effectTokens.push({
            id: style.id,
            name: style.name,
            type: effect.type === 'DROP_SHADOW' ? 'shadow' : 'blur',
            properties: effect
          });
        }
      }
    } catch (error) {
      console.warn('Error extracting effect tokens:', error);
    }

    return effectTokens;
  }

  /**
   * Build component library by analyzing all components in the file
   */
  private async buildComponentLibrary(): Promise<ComponentLibrary> {
    const components: ComponentMetadata[] = [];
    const variants: ComponentVariant[] = [];

    try {
      const allComponents = figma.root.findAll((node: any) => 
        node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
      );

      for (const component of allComponents) {
        if (component.type === 'COMPONENT') {
          // Count instances of this component
          const instances = figma.root.findAll((node: any) => 
            node.type === 'INSTANCE' && node.masterComponent?.id === component.id
          );

          components.push({
            id: component.id,
            name: component.name,
            description: component.description,
            category: this.inferComponentCategory(component.name),
            instances: instances.length
          });
        } else if (component.type === 'COMPONENT_SET') {
          // Handle component sets (variants)
          const variantComponents = component.children || [];
          
          components.push({
            id: component.id,
            name: component.name,
            description: component.description,
            category: this.inferComponentCategory(component.name),
            instances: 0, // Will be calculated from all variants
            variants: variantComponents.map((v: any) => v.name)
          });

          // Add individual variants
          for (const variant of variantComponents) {
            variants.push({
              id: variant.id,
              parentId: component.id,
              properties: this.extractVariantProperties(variant)
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error building component library:', error);
    }

    return { components, variants };
  }

  /**
   * Extract spacing tokens by analyzing common spacing patterns
   */
  private async extractSpacingTokens(): Promise<SpacingToken[]> {
    const spacingTokens: SpacingToken[] = [];
    const spacingValues = new Map<number, number>();

    try {
      // Analyze frames and components for common spacing patterns
      const frames = figma.root.findAll((node: any) => node.type === 'FRAME');
      
      for (const frame of frames) {
        // Analyze padding and spacing within the frame
        if (frame.paddingLeft) spacingValues.set(frame.paddingLeft, (spacingValues.get(frame.paddingLeft) || 0) + 1);
        if (frame.paddingTop) spacingValues.set(frame.paddingTop, (spacingValues.get(frame.paddingTop) || 0) + 1);
        
        // Analyze gaps between children
        if (frame.itemSpacing) spacingValues.set(frame.itemSpacing, (spacingValues.get(frame.itemSpacing) || 0) + 1);
      }

      // Convert common spacing values to tokens
      const sortedSpacing = Array.from(spacingValues.entries())
        .filter(([value, count]) => count >= 3) // Only include values used at least 3 times
        .sort((a, b) => a[0] - b[0]); // Sort by value

      sortedSpacing.forEach(([value], index) => {
        spacingTokens.push({
          id: `spacing-${index}`,
          name: `spacing-${this.getSpacingScale(index)}`,
          value: value,
          semantic: this.getSpacingScale(index)
        });
      });

    } catch (error) {
      console.warn('Error extracting spacing tokens:', error);
    }

    return spacingTokens;
  }

  // Helper methods
  private detectSystematicLayout(frames: any[]): boolean {
    // Simple heuristic: look for consistent spacing and alignment
    return frames.length > 5 && frames.some(frame => 
      frame.layoutMode === 'HORIZONTAL' || frame.layoutMode === 'VERTICAL'
    );
  }

  private detectDocumentationPattern(textNodes: any[]): boolean {
    // Look for text nodes that might be documentation
    return textNodes.some(node => 
      node.characters && (
        node.characters.toLowerCase().includes('component') ||
        node.characters.toLowerCase().includes('usage') ||
        node.characters.toLowerCase().includes('guideline')
      )
    );
  }

  private inferSemanticColor(name: string): string | undefined {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('primary')) return 'primary';
    if (lowerName.includes('secondary')) return 'secondary';
    if (lowerName.includes('error') || lowerName.includes('danger')) return 'error';
    if (lowerName.includes('warning')) return 'warning';
    if (lowerName.includes('success')) return 'success';
    if (lowerName.includes('info')) return 'info';
    return undefined;
  }

  private inferComponentCategory(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('button')) return 'actions';
    if (lowerName.includes('input') || lowerName.includes('field')) return 'inputs';
    if (lowerName.includes('card')) return 'containers';
    if (lowerName.includes('header') || lowerName.includes('nav')) return 'navigation';
    if (lowerName.includes('icon')) return 'icons';
    return 'general';
  }

  private extractVariantProperties(variant: any): { [key: string]: string } {
    // Extract variant properties from component instance
    const properties: { [key: string]: string } = {};
    
    if (variant.variantProperties) {
      for (const [key, value] of Object.entries(variant.variantProperties)) {
        properties[key] = String(value);
      }
    }
    
    return properties;
  }

  private getSpacingScale(index: number): string {
    const scales = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    return scales[Math.min(index, scales.length - 1)] || `scale-${index}`;
  }

  private calculateDetectionConfidence(data: {
    pages: DesignSystemPage[];
    colors: ColorToken[];
    typography: TypographyToken[];
    components: ComponentLibrary;
  }): number {
    let confidence = 0;

    // Page indicators (30% weight)
    const avgPageConfidence = data.pages.length > 0 
      ? data.pages.reduce((sum, page) => sum + page.confidence, 0) / data.pages.length 
      : 0;
    confidence += avgPageConfidence * 0.3;

    // Style indicators (40% weight)
    const styleScore = Math.min((data.colors.length + data.typography.length) / 10, 1);
    confidence += styleScore * 0.4;

    // Component indicators (30% weight)
    const componentScore = Math.min(data.components.components.length / 20, 1);
    confidence += componentScore * 0.3;

    return Math.min(confidence, 1.0);
  }

  private deriveDesignSystemName(pages: DesignSystemPage[]): string {
    if (pages.length === 0) return 'Detected Design System';
    
    // Use the highest confidence page name
    const topPage = pages[0];
    if (topPage.name.toLowerCase().includes('design system')) {
      return topPage.name;
    }
    
    return `${topPage.name} Design System`;
  }

  /**
   * Get the currently detected design system
   */
  getDesignSystem(): DesignSystem | null {
    return this.designSystem;
  }
}