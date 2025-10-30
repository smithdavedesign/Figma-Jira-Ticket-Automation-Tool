/**
 * Compliance Analyzer
 *
 * Analyzes design system compliance for selected Figma elements
 */

/**
 * @typedef {Object} ComplianceViolation
 * @property {'color'|'typography'|'component'|'spacing'} type - Violation type
 * @property {'low'|'medium'|'high'} severity - Violation severity
 * @property {string} description - Violation description
 * @property {string} elementId - Element ID
 * @property {string} suggestion - Suggested fix
 */

/**
 * @typedef {Object} ComplianceRecommendation
 * @property {'low'|'medium'|'high'} priority - Recommendation priority
 * @property {string} category - Recommendation category
 * @property {string} description - Recommendation description
 * @property {string} action - Recommended action
 * @property {string} impact - Expected impact
 */

/**
 * @typedef {Object} ComplianceBreakdown
 * @property {{score: number, compliantCount: number, totalCount: number, violations: ComplianceViolation[]}} colors - Color compliance
 * @property {{score: number, compliantCount: number, totalCount: number, violations: ComplianceViolation[]}} typography - Typography compliance
 * @property {{score: number, compliantCount: number, totalCount: number, violations: ComplianceViolation[]}} components - Component compliance
 * @property {{score: number, compliantCount: number, totalCount: number, violations: ComplianceViolation[]}} spacing - Spacing compliance
 */

/**
 * @typedef {Object} ComplianceScore
 * @property {number} overall - Overall compliance score
 * @property {ComplianceBreakdown} breakdown - Detailed breakdown
 * @property {number} lastCalculated - Timestamp of calculation
 * @property {ComplianceRecommendation[]} recommendations - Recommendations
 */

export class ComplianceAnalyzer {
  /**
   * Create compliance analyzer
   * @param {any} designSystem - Design system data
   */
  constructor(designSystem) {
    this.designSystem = designSystem;
  }

  /**
   * Calculate compliance score for selected frames/nodes
   * @param {readonly any[]} nodes - Figma nodes to analyze
   * @returns {Promise<ComplianceScore>} Compliance analysis results
   */
  async calculateComplianceScore(nodes) {
    console.log('📊 Calculating compliance score for', nodes.length, 'nodes');

    if (!this.designSystem) {
      throw new Error('Design system not provided to compliance analyzer.');
    }

    const violations = [];
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
   * @private
   * @param {any} node - Figma node to analyze
   * @param {ComplianceBreakdown} breakdown - Breakdown object to update
   * @param {ComplianceViolation[]} violations - Violations array to update
   * @returns {Promise<void>}
   */
  async analyzeNodeCompliance(node, breakdown, violations) {
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
   * @private
   * @param {string} name - Component name
   * @returns {boolean} Is design system component
   */
  isDesignSystemComponentName(name) {
    const dsPatterns = [
      /^(Button|Input|Card|Modal|Alert|Badge|Chip)/i,
      /^(DS|Design|System)/i,
      /\/(Button|Input|Card|Modal|Alert|Badge|Chip)/i
    ];

    return dsPatterns.some(pattern => pattern.test(name));
  }

  /**
   * Check if a color matches design system colors
   * @private
   * @param {any} color - Color object to check
   * @returns {boolean} Is design system color
   */
  isDesignSystemColor(color) {
    if (!this.designSystem?.colors) {return false;}

    const tolerance = 0.01; // Allow slight variations

    return this.designSystem.colors.some((token) => {
      const dr = Math.abs(token.value.r - color.r);
      const dg = Math.abs(token.value.g - color.g);
      const db = Math.abs(token.value.b - color.b);
      return dr < tolerance && dg < tolerance && db < tolerance;
    });
  }

  /**
   * Check if typography follows design system standards
   * @private
   * @param {any} textNode - Text node to check
   * @returns {boolean} Is design system typography
   */
  isDesignSystemTypography(textNode) {
    if (!this.designSystem?.typography) {return false;}

    const fontSize = textNode.fontSize;
    const fontFamily = textNode.fontName ? textNode.fontName.family : '';

    return this.designSystem.typography.some((token) => {
      return Math.abs(token.fontSize - fontSize) < 1 &&
             token.fontFamily === fontFamily;
    });
  }

  /**
   * Check if spacing follows standard increments
   * @private
   * @param {any} node - Node to check spacing
   * @returns {boolean} Has standard spacing
   */
  hasStandardSpacing(node) {
    const standardSpacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64];

    const spacingValues = [];
    if ('paddingLeft' in node) {spacingValues.push(node.paddingLeft);}
    if ('paddingRight' in node) {spacingValues.push(node.paddingRight);}
    if ('paddingTop' in node) {spacingValues.push(node.paddingTop);}
    if ('paddingBottom' in node) {spacingValues.push(node.paddingBottom);}
    if ('itemSpacing' in node) {spacingValues.push(node.itemSpacing);}

    return spacingValues.length === 0 || spacingValues.every(value =>
      standardSpacing.includes(value) || value === 0
    );
  }

  /**
   * Generate actionable recommendations based on compliance analysis
   * @private
   * @param {ComplianceBreakdown} breakdown - Compliance breakdown
   * @param {ComplianceViolation[]} violations - Detected violations
   * @returns {ComplianceRecommendation[]} Generated recommendations
   */
  generateRecommendations(breakdown, _violations) {
    const recommendations = [];

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