/**
 * Compliance Analyzer
 * 
 * Analyzes selected frames against detected design systems to provide
 * compliance scores, violations, and recommendations.
 */

/// <reference path="types.ts" />

class ComplianceAnalyzer {
  private designSystem: DesignSystem;

  constructor(designSystem: DesignSystem) {
    this.designSystem = designSystem;
  }

  /**
   * Analyze a frame for design system compliance
   */
  async analyzeFrame(frameNode: FrameNode): Promise<ComplianceReport> {
    console.log('🔍 Analyzing frame compliance:', frameNode.name);

    try {
      // Analyze different aspects of compliance
      const colorCompliance = await this.analyzeColorCompliance(frameNode);
      const typographyCompliance = await this.analyzeTypographyCompliance(frameNode);
      const componentCompliance = await this.analyzeComponentCompliance(frameNode);

      // Collect used tokens and violations
      const usedTokens = this.collectUsedTokens(frameNode);
      const violations = this.collectViolations(frameNode, colorCompliance, typographyCompliance, componentCompliance);
      const recommendations = this.generateRecommendations(violations, usedTokens);

      // Calculate overall score
      const overallScore = this.calculateOverallScore(colorCompliance, typographyCompliance, componentCompliance);

      return {
        overallScore,
        colorCompliance,
        typographyCompliance,
        componentCompliance,
        recommendations,
        usedTokens,
        violations
      };

    } catch (error) {
      console.error('❌ Error analyzing frame compliance:', error);
      
      // Return empty report on error
      return {
        overallScore: 0,
        colorCompliance: { score: 0, totalColors: 0, tokenizedColors: 0, hardcodedColors: 0 },
        typographyCompliance: { score: 0, totalTextElements: 0, tokenizedText: 0, hardcodedText: 0 },
        componentCompliance: { score: 0, totalComponents: 0, standardComponents: 0, customComponents: 0 },
        recommendations: [],
        usedTokens: [],
        violations: []
      };
    }
  }

  /**
   * Analyze color usage compliance
   */
  private async analyzeColorCompliance(frameNode: FrameNode): Promise<ColorCompliance> {
    let totalColors = 0;
    let tokenizedColors = 0;
    let hardcodedColors = 0;

    // Find all nodes with color fills
    const coloredNodes = frameNode.findAll?.((node: any) => {
      return (node.fills && node.fills.length > 0) || (node.strokes && node.strokes.length > 0);
    }) || [];

    for (const node of coloredNodes) {
      // Check fills
      if (node.fills) {
        for (const fill of node.fills) {
          if (fill.type === 'SOLID') {
            totalColors++;
            
            if (this.isColorTokenized(fill, node)) {
              tokenizedColors++;
            } else {
              hardcodedColors++;
            }
          }
        }
      }

      // Check strokes
      if (node.strokes) {
        for (const stroke of node.strokes) {
          if (stroke.type === 'SOLID') {
            totalColors++;
            
            if (this.isColorTokenized(stroke, node)) {
              tokenizedColors++;
            } else {
              hardcodedColors++;
            }
          }
        }
      }
    }

    const score = totalColors > 0 ? Math.round((tokenizedColors / totalColors) * 100) : 100;

    return {
      score,
      totalColors,
      tokenizedColors,
      hardcodedColors
    };
  }

  /**
   * Analyze typography compliance
   */
  private async analyzeTypographyCompliance(frameNode: FrameNode): Promise<TypographyCompliance> {
    let totalTextElements = 0;
    let tokenizedText = 0;
    let hardcodedText = 0;

    const textNodes = frameNode.findAll?.((node: any) => node.type === 'TEXT') || [];

    for (const textNode of textNodes) {
      totalTextElements++;

      if (this.isTypographyTokenized(textNode)) {
        tokenizedText++;
      } else {
        hardcodedText++;
      }
    }

    const score = totalTextElements > 0 ? Math.round((tokenizedText / totalTextElements) * 100) : 100;

    return {
      score,
      totalTextElements,
      tokenizedText,
      hardcodedText
    };
  }

  /**
   * Analyze component usage compliance
   */
  private async analyzeComponentCompliance(frameNode: FrameNode): Promise<ComponentCompliance> {
    let totalComponents = 0;
    let standardComponents = 0;
    let customComponents = 0;

    const componentNodes = frameNode.findAll?.((node: any) => 
      node.type === 'INSTANCE' || node.type === 'COMPONENT'
    ) || [];

    // Limit to first 20 components to avoid performance issues
    const maxComponents = Math.min(componentNodes.length, 20);
    
    for (let i = 0; i < maxComponents; i++) {
      const componentNode = componentNodes[i];
      totalComponents++;

      if (await this.isStandardComponent(componentNode)) {
        standardComponents++;
      } else {
        customComponents++;
      }
    }

    const score = totalComponents > 0 ? Math.round((standardComponents / totalComponents) * 100) : 100;

    return {
      score,
      totalComponents,
      standardComponents,
      customComponents
    };
  }

  /**
   * Check if a color is using design system tokens
   */
  private isColorTokenized(colorFill: any, node: any): boolean {
    // Check if the fill uses a paint style
    if (colorFill.boundVariables?.color || node.fillStyleId) {
      return true;
    }

    // Check if the color matches any design system color tokens
    if (colorFill.color) {
      return this.designSystem.colors.some(token => 
        this.colorsMatch(token.value, colorFill.color)
      );
    }

    return false;
  }

  /**
   * Check if typography is using design system tokens
   */
  private isTypographyTokenized(textNode: any): boolean {
    // Check if using text style
    if (textNode.textStyleId) {
      return true;
    }

    // Check if font properties match design system tokens
    const fontSize = textNode.fontSize;
    const fontName = textNode.fontName;

    if (typeof fontSize === 'number' && fontName && typeof fontName === 'object') {
      return this.designSystem.typography.some(token =>
        token.fontSize === fontSize &&
        token.fontFamily === fontName.family
      );
    }

    return false;
  }

  /**
   * Check if component is from the design system
   */
  private async isStandardComponent(componentNode: any): Promise<boolean> {
    if (componentNode.type === 'INSTANCE') {
      try {
        const masterComponent = await (componentNode as any).getMainComponentAsync();
        if (masterComponent) {
          const masterComponentId = masterComponent.id;
          
          return this.designSystem.components.components.some(component =>
            component.id === masterComponentId
          );
        }
      } catch (error) {
        // Skip if component can't be resolved
        return false;
      }
    }

    return false;
  }

  /**
   * Collect all design system tokens used in the frame
   */
  private collectUsedTokens(frameNode: FrameNode): Token[] {
    const usedTokens: Token[] = [];
    const usedTokenIds = new Set<string>();

    // Collect color tokens
    const coloredNodes = frameNode.findAll?.((node: any) => 
      node.fillStyleId || node.strokeStyleId
    ) || [];

    for (const node of coloredNodes) {
      if (node.fillStyleId) {
        const colorToken = this.designSystem.colors.find(t => t.id === node.fillStyleId);
        if (colorToken && !usedTokenIds.has(colorToken.id)) {
          usedTokens.push({
            id: colorToken.id,
            name: colorToken.name,
            type: 'color',
            value: colorToken.value
          });
          usedTokenIds.add(colorToken.id);
        }
      }
    }

    // Collect typography tokens
    const textNodes = frameNode.findAll?.((node: any) => node.textStyleId) || [];

    for (const node of textNodes) {
      if (node.textStyleId) {
        const typoToken = this.designSystem.typography.find(t => t.id === node.textStyleId);
        if (typoToken && !usedTokenIds.has(typoToken.id)) {
          usedTokens.push({
            id: typoToken.id,
            name: typoToken.name,
            type: 'typography',
            value: {
              fontFamily: typoToken.fontFamily,
              fontSize: typoToken.fontSize,
              fontWeight: typoToken.fontWeight
            }
          });
          usedTokenIds.add(typoToken.id);
        }
      }
    }

    return usedTokens;
  }

  /**
   * Collect compliance violations
   */
  private collectViolations(
    frameNode: FrameNode,
    colorCompliance: ColorCompliance,
    typographyCompliance: TypographyCompliance,
    componentCompliance: ComponentCompliance
  ): Violation[] {
    const violations: Violation[] = [];

    // Add color violations
    if (colorCompliance.hardcodedColors > 0) {
      violations.push({
        id: `color-${frameNode.id}`,
        type: 'color',
        nodeId: frameNode.id,
        nodeName: frameNode.name,
        description: `${colorCompliance.hardcodedColors} hardcoded colors found`,
        suggestedFix: 'Use design system color tokens instead of hardcoded values'
      });
    }

    // Add typography violations
    if (typographyCompliance.hardcodedText > 0) {
      violations.push({
        id: `typography-${frameNode.id}`,
        type: 'typography',
        nodeId: frameNode.id,
        nodeName: frameNode.name,
        description: `${typographyCompliance.hardcodedText} text elements with custom styling`,
        suggestedFix: 'Apply design system text styles to maintain consistency'
      });
    }

    // Add component violations
    if (componentCompliance.customComponents > 0) {
      violations.push({
        id: `component-${frameNode.id}`,
        type: 'component',
        nodeId: frameNode.id,
        nodeName: frameNode.name,
        description: `${componentCompliance.customComponents} custom components found`,
        suggestedFix: 'Consider using existing design system components or propose new standard components'
      });
    }

    return violations;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(violations: Violation[], usedTokens: Token[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Generate recommendations based on violations
    for (const violation of violations) {
      let severity: 'low' | 'medium' | 'high' = 'medium';
      
      if (violation.type === 'color' && violation.description.includes('hardcoded')) {
        severity = 'high';
        recommendations.push({
          id: `rec-${violation.id}`,
          type: 'color',
          severity,
          message: 'Replace hardcoded colors with design system tokens',
          suggestion: `Consider using these color tokens: ${this.designSystem.colors.slice(0, 3).map(c => c.name).join(', ')}`,
          nodeId: violation.nodeId
        });
      }

      if (violation.type === 'typography' && violation.description.includes('custom')) {
        severity = 'medium';
        recommendations.push({
          id: `rec-${violation.id}`,
          type: 'typography',
          severity,
          message: 'Apply consistent typography styles',
          suggestion: `Use these text styles: ${this.designSystem.typography.slice(0, 3).map(t => t.name).join(', ')}`,
          nodeId: violation.nodeId
        });
      }

      if (violation.type === 'component' && violation.description.includes('custom')) {
        severity = 'low';
        recommendations.push({
          id: `rec-${violation.id}`,
          type: 'component',
          severity,
          message: 'Consider using standard components',
          suggestion: `Available components: ${this.designSystem.components.components.slice(0, 3).map(c => c.name).join(', ')}`,
          nodeId: violation.nodeId
        });
      }
    }

    // Add positive recommendations for good usage
    if (usedTokens.length > 0) {
      recommendations.push({
        id: 'positive-usage',
        type: 'color',
        severity: 'low',
        message: '✅ Good use of design system tokens',
        suggestion: `Currently using: ${usedTokens.slice(0, 3).map(t => t.name).join(', ')}`
      });
    }

    return recommendations;
  }

  /**
   * Calculate overall compliance score
   */
  private calculateOverallScore(
    colorCompliance: ColorCompliance,
    typographyCompliance: TypographyCompliance,
    componentCompliance: ComponentCompliance
  ): number {
    // Weighted average: colors 40%, typography 30%, components 30%
    const weightedScore = (
      colorCompliance.score * 0.4 +
      typographyCompliance.score * 0.3 +
      componentCompliance.score * 0.3
    );

    return Math.round(weightedScore);
  }

  /**
   * Helper to compare colors with tolerance
   */
  private colorsMatch(color1: RGB, color2: RGB, tolerance: number = 0.01): boolean {
    return (
      Math.abs(color1.r - color2.r) < tolerance &&
      Math.abs(color1.g - color2.g) < tolerance &&
      Math.abs(color1.b - color2.b) < tolerance
    );
  }
}