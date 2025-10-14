/**
 * Compliance Analyzer
 * 
 * Analyzes design system compliance for selected Figma elements
 */

import { ComplianceScore, ComplianceBreakdown, ComplianceViolation, ComplianceRecommendation } from '../types/compliance';

export class ComplianceAnalyzer {
  private designSystem: any; // Will be properly typed once we resolve the import issues

  constructor(designSystem: any) {
    this.designSystem = designSystem;
  }

  /**
   * Calculate compliance score for selected frames/nodes
   */
  async calculateComplianceScore(nodes: readonly any[]): Promise<ComplianceScore> {
    console.log('📊 Calculating compliance score for', nodes.length, 'nodes');
    
    if (!this.designSystem) {
      throw new Error('Design system not provided to compliance analyzer.');
    }

    const violations: ComplianceViolation[] = [];
    const breakdown = {
      colors: { score: 0, compliantCount: 0, totalCount: 0, violations: [] },
      typography: { score: 0, compliantCount: 0, totalCount: 0, violations: [] },
      components: { score: 0, compliantCount: 0, totalCount: 0, violations: [] },
      spacing: { score: 0, compliantCount: 0, totalCount: 0, violations: [] }
    };

    // Analyze each node recursively
    for (const node of nodes) {
      await this.analyzeNodeCompliance(node, breakdown, violations);
    }

    // Calculate scores
    const colorScore = breakdown.colors.totalCount > 0 
      ? (breakdown.colors.compliantCount / breakdown.colors.totalCount) * 100 
      : 100;
    
    const typographyScore = breakdown.typography.totalCount > 0 
      ? (breakdown.typography.compliantCount / breakdown.typography.totalCount) * 100 
      : 100;
    
    const componentScore = breakdown.components.totalCount > 0 
      ? (breakdown.components.compliantCount / breakdown.components.totalCount) * 100 
      : 100;
    
    const spacingScore = breakdown.spacing.totalCount > 0 
      ? (breakdown.spacing.compliantCount / breakdown.spacing.totalCount) * 100 
      : 100;

    breakdown.colors.score = Math.round(colorScore);
    breakdown.typography.score = Math.round(typographyScore);
    breakdown.components.score = Math.round(componentScore);
    breakdown.spacing.score = Math.round(spacingScore);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (colorScore * 0.3) + 
      (typographyScore * 0.25) + 
      (componentScore * 0.3) + 
      (spacingScore * 0.15)
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(breakdown, violations);

    return {
      overall: overallScore,
      breakdown,
      lastCalculated: Date.now(),
      recommendations
    };
  }

  /**
   * Recursively analyze a node for compliance violations
   */
  private async analyzeNodeCompliance(
    node: any, 
    breakdown: any, 
    violations: ComplianceViolation[]
  ): Promise<void> {
    try {
      // Check if node is a design system component
      if (node.type === 'INSTANCE') {
        breakdown.components.totalCount++;
        // Check component naming patterns
        if (this.isDesignSystemComponentName(node.name)) {
          breakdown.components.compliantCount++;
        } else {
          breakdown.components.violations.push({
            type: 'component',
            severity: 'medium',
            description: `Non-standard component: ${node.name}`,
            elementId: node.id,
            suggestion: 'Replace with design system component'
          });
        }
      }

      // Check colors
      if ('fills' in node && node.fills && Array.isArray(node.fills)) {
        for (const fill of node.fills) {
          if (fill.type === 'SOLID' && fill.visible !== false) {
            breakdown.colors.totalCount++;
            if (this.isDesignSystemColor(fill.color)) {
              breakdown.colors.compliantCount++;
            } else {
              breakdown.colors.violations.push({
                type: 'color',
                severity: 'medium',
                description: `Custom color used in ${node.name}`,
                elementId: node.id,
                suggestion: 'Use design system color tokens'
              });
            }
          }
        }
      }

      // Check typography
      if (node.type === 'TEXT') {
        breakdown.typography.totalCount++;
        const textNode = node;
        if (this.isDesignSystemTypography(textNode)) {
          breakdown.typography.compliantCount++;
        } else {
          breakdown.typography.violations.push({
            type: 'typography',
            severity: 'medium',
            description: `Custom text style in ${node.name}`,
            elementId: node.id,
            suggestion: 'Apply design system text style'
          });
        }
      }

      // Check spacing (simplified - check common spacing values)
      if ('paddingLeft' in node || 'itemSpacing' in node) {
        breakdown.spacing.totalCount++;
        if (this.hasStandardSpacing(node)) {
          breakdown.spacing.compliantCount++;
        } else {
          breakdown.spacing.violations.push({
            type: 'spacing',
            severity: 'low',
            description: `Non-standard spacing in ${node.name}`,
            elementId: node.id,
            suggestion: 'Use design system spacing tokens'
          });
        }
      }

      // Recursively check children
      if ('children' in node && node.children) {
        const children = node.children;
        for (const child of children) {
          await this.analyzeNodeCompliance(child, breakdown, violations);
        }
      }
    } catch (error) {
      console.warn('Error analyzing node compliance:', error);
    }
  }

  /**
   * Check if a component name suggests it's from the design system
   */
  private isDesignSystemComponentName(name: string): boolean {
    const dsPatterns = [
      /^(Button|Input|Card|Modal|Alert|Badge|Chip)/i,
      /^(DS|Design|System)/i,
      /\/(Button|Input|Card|Modal|Alert|Badge|Chip)/i
    ];
    
    return dsPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Check if a color matches design system colors
   */
  private isDesignSystemColor(color: any): boolean {
    if (!this.designSystem?.colors) return false;
    
    const tolerance = 0.01; // Allow slight variations
    
    return this.designSystem.colors.some((token: any) => {
      const dr = Math.abs(token.value.r - color.r);
      const dg = Math.abs(token.value.g - color.g);
      const db = Math.abs(token.value.b - color.b);
      return dr < tolerance && dg < tolerance && db < tolerance;
    });
  }

  /**
   * Check if typography follows design system standards
   */
  private isDesignSystemTypography(textNode: any): boolean {
    if (!this.designSystem?.typography) return false;
    
    const fontSize = textNode.fontSize;
    const fontFamily = textNode.fontName ? textNode.fontName.family : '';
    
    return this.designSystem.typography.some((token: any) => {
      return Math.abs(token.fontSize - fontSize) < 1 && 
             token.fontFamily === fontFamily;
    });
  }

  /**
   * Check if spacing follows standard increments
   */
  private hasStandardSpacing(node: any): boolean {
    const standardSpacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64];
    
    const spacingValues = [];
    if ('paddingLeft' in node) spacingValues.push(node.paddingLeft);
    if ('paddingRight' in node) spacingValues.push(node.paddingRight);
    if ('paddingTop' in node) spacingValues.push(node.paddingTop);
    if ('paddingBottom' in node) spacingValues.push(node.paddingBottom);
    if ('itemSpacing' in node) spacingValues.push(node.itemSpacing);
    
    return spacingValues.length === 0 || spacingValues.every(value => 
      standardSpacing.includes(value) || value === 0
    );
  }

  /**
   * Generate actionable recommendations based on compliance analysis
   */
  private generateRecommendations(
    breakdown: any, 
    violations: ComplianceViolation[]
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    // Color recommendations
    if (breakdown.colors.score < 80 && breakdown.colors.violations.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Colors',
        description: `${breakdown.colors.violations.length} custom colors detected`,
        action: 'Replace custom colors with design system tokens',
        impact: 'Improves brand consistency and maintainability'
      });
    }

    // Typography recommendations
    if (breakdown.typography.score < 80 && breakdown.typography.violations.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Typography',
        description: `${breakdown.typography.violations.length} custom text styles found`,
        action: 'Apply design system text styles',
        impact: 'Ensures consistent typography across designs'
      });
    }

    // Component recommendations
    if (breakdown.components.score < 70 && breakdown.components.violations.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Components',
        description: `${breakdown.components.violations.length} non-standard components`,
        action: 'Replace with design system components',
        impact: 'Reduces development time and ensures consistency'
      });
    }

    // Spacing recommendations
    if (breakdown.spacing.score < 90 && breakdown.spacing.violations.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'Spacing',
        description: `${breakdown.spacing.violations.length} non-standard spacing values`,
        action: 'Use 4px/8px grid spacing system',
        impact: 'Creates visual rhythm and consistency'
      });
    }

    return recommendations;
  }
}