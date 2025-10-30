/**
 * Phase 1 Line Item 1.2: Enhanced Design System Analysis
 *
 * This module provides advanced design system analysis capabilities for Figma designs,
 * detecting design tokens, component hierarchies, design patterns, and system consistency.
 */

class DesignSystemAnalyzer {
  constructor() {
    this.designTokens = new Map();
    this.componentLibrary = new Map();
    this.designPatterns = [];
    this.consistencyRules = [];
  }

  /**
   * Analyze a Figma design for design system elements
   */
  analyzeDesignSystem(figmaContext) {
    if (!figmaContext || !figmaContext.layers) {
      return this.createEmptyAnalysis();
    }

    const analysis = {
      designTokens: this.extractDesignTokens(figmaContext),
      componentHierarchy: this.buildComponentHierarchy(figmaContext),
      designPatterns: this.identifyDesignPatterns(figmaContext),
      systemConsistency: this.evaluateConsistency(figmaContext),
      recommendations: [],
      confidence: 0
    };

    // Generate recommendations based on analysis
    analysis.recommendations = this.generateSystemRecommendations(analysis);
    analysis.confidence = this.calculateSystemConfidence(analysis);

    return analysis;
  }

  /**
   * Extract design tokens from Figma layers
   */
  extractDesignTokens(figmaContext) {
    const tokens = {
      colors: new Set(),
      typography: new Set(),
      spacing: new Set(),
      borders: new Set(),
      shadows: new Set()
    };

    const layers = figmaContext.layers || [];

    layers.forEach(layer => {
      // Extract color tokens from layer styles
      if (layer.fills && Array.isArray(layer.fills)) {
        layer.fills.forEach(fill => {
          if (fill.type === 'SOLID' && fill.color) {
            tokens.colors.add(this.colorToHex(fill.color));
          }
        });
      }

      // Extract typography tokens
      if (layer.type === 'TEXT' && layer.style) {
        const typographyToken = {
          fontSize: layer.style.fontSize || 16,
          fontFamily: layer.style.fontFamily || 'Default',
          fontWeight: layer.style.fontWeight || 400,
          lineHeight: layer.style.lineHeightPx || layer.style.fontSize * 1.2
        };
        tokens.typography.add(JSON.stringify(typographyToken));
      }

      // Extract spacing tokens from layout constraints
      if (layer.constraints) {
        if (layer.paddingLeft !== undefined) {tokens.spacing.add(layer.paddingLeft);}
        if (layer.paddingTop !== undefined) {tokens.spacing.add(layer.paddingTop);}
        if (layer.paddingRight !== undefined) {tokens.spacing.add(layer.paddingRight);}
        if (layer.paddingBottom !== undefined) {tokens.spacing.add(layer.paddingBottom);}
      }

      // Recursively process children
      if (layer.children && Array.isArray(layer.children)) {
        const childTokens = this.extractDesignTokens({ layers: layer.children });
        this.mergeTokens(tokens, childTokens);
      }
    });

    return this.convertTokenSetsToArrays(tokens);
  }

  /**
   * Build component hierarchy from Figma structure
   */
  buildComponentHierarchy(figmaContext) {
    const hierarchy = {
      atoms: [], // Basic elements (buttons, inputs, icons)
      molecules: [], // Simple combinations (form fields, navigation items)
      organisms: [], // Complex components (headers, forms, product lists)
      templates: [], // Page layouts
      pages: [] // Specific implementations
    };

    const layers = figmaContext.layers || [];

    layers.forEach(layer => {
      const component = this.classifyComponent(layer);
      if (component) {
        hierarchy[component.level].push(component);
      }
    });

    return hierarchy;
  }

  /**
   * Classify a layer into atomic design levels
   */
  classifyComponent(layer) {
    if (!layer.name) {return null;}

    const name = layer.name.toLowerCase();
    const hasChildren = layer.children && layer.children.length > 0;
    const childCount = hasChildren ? layer.children.length : 0;

    // Atoms - Basic elements
    if (this.isAtomicComponent(name, layer)) {
      return {
        level: 'atoms',
        name: layer.name,
        type: this.getAtomicType(name),
        layerId: layer.id,
        complexity: 'low',
        reusability: 'high',
        estimatedEffort: '30-60 minutes'
      };
    }

    // Molecules - 2-5 elements combined
    if (childCount >= 2 && childCount <= 5 && this.isMolecularComponent(name)) {
      return {
        level: 'molecules',
        name: layer.name,
        type: this.getMolecularType(name),
        layerId: layer.id,
        complexity: 'medium',
        reusability: 'medium',
        estimatedEffort: '1-3 hours',
        childComponents: childCount
      };
    }

    // Organisms - Complex components with 6+ elements
    if (childCount >= 6 && this.isOrganismalComponent(name)) {
      return {
        level: 'organisms',
        name: layer.name,
        type: this.getOrganismalType(name),
        layerId: layer.id,
        complexity: 'high',
        reusability: 'low',
        estimatedEffort: '4-8 hours',
        childComponents: childCount
      };
    }

    // Templates - Layout structures
    if (this.isTemplateComponent(name, layer)) {
      return {
        level: 'templates',
        name: layer.name,
        type: 'layout-template',
        layerId: layer.id,
        complexity: 'high',
        reusability: 'medium',
        estimatedEffort: '6-12 hours'
      };
    }

    return null;
  }

  /**
   * Identify design patterns in the system
   */
  identifyDesignPatterns(figmaContext) {
    const patterns = [];
    const layers = figmaContext.layers || [];

    // Look for common design patterns
    patterns.push(...this.detectNavigationPatterns(layers));
    patterns.push(...this.detectFormPatterns(layers));
    patterns.push(...this.detectDataPatterns(layers));
    patterns.push(...this.detectFeedbackPatterns(layers));
    patterns.push(...this.detectLayoutPatterns(layers));

    return patterns;
  }

  /**
   * Evaluate system consistency
   */
  evaluateConsistency(figmaContext) {
    const consistency = {
      colorConsistency: 0,
      typographyConsistency: 0,
      spacingConsistency: 0,
      componentConsistency: 0,
      overallScore: 0,
      issues: []
    };

    const tokens = this.extractDesignTokens(figmaContext);

    // Check color consistency
    consistency.colorConsistency = this.evaluateColorConsistency(tokens.colors);

    // Check typography consistency
    consistency.typographyConsistency = this.evaluateTypographyConsistency(tokens.typography);

    // Check spacing consistency
    consistency.spacingConsistency = this.evaluateSpacingConsistency(tokens.spacing);

    // Check component naming consistency
    consistency.componentConsistency = this.evaluateComponentConsistency(figmaContext);

    // Calculate overall score
    consistency.overallScore = Math.round(
      (consistency.colorConsistency +
       consistency.typographyConsistency +
       consistency.spacingConsistency +
       consistency.componentConsistency) / 4
    );

    return consistency;
  }

  /**
   * Generate system recommendations
   */
  generateSystemRecommendations(analysis) {
    const recommendations = [];

    // Design token recommendations
    if (analysis.designTokens.colors.length > 15) {
      recommendations.push({
        type: 'design-tokens',
        priority: 'high',
        message: 'Consider consolidating color palette - detected over 15 colors',
        action: 'Create semantic color tokens (primary, secondary, success, warning, error)'
      });
    }

    // Component hierarchy recommendations
    const totalComponents = Object.values(analysis.componentHierarchy)
      .reduce((sum, level) => sum + level.length, 0);

    if (totalComponents > 50) {
      recommendations.push({
        type: 'component-organization',
        priority: 'medium',
        message: 'Large component library detected - consider better organization',
        action: 'Group related components and create clear naming conventions'
      });
    }

    // Consistency recommendations
    if (analysis.systemConsistency.overallScore < 70) {
      recommendations.push({
        type: 'consistency',
        priority: 'high',
        message: 'Low consistency score detected',
        action: 'Standardize design tokens and establish design system guidelines'
      });
    }

    // Pattern recommendations
    const hasFormPatterns = analysis.designPatterns.some(p => p.category === 'forms');
    if (hasFormPatterns) {
      recommendations.push({
        type: 'implementation',
        priority: 'medium',
        message: 'Form patterns detected',
        action: 'Consider form validation library and accessibility guidelines'
      });
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  // Helper methods for component classification
  isAtomicComponent(name, layer) {
    const atomicKeywords = ['button', 'input', 'icon', 'label', 'avatar', 'badge', 'chip'];
    return atomicKeywords.some(keyword => name.includes(keyword)) &&
           (!layer.children || layer.children.length <= 1);
  }

  isMolecularComponent(name) {
    const molecularKeywords = ['field', 'item', 'card-header', 'nav-item', 'breadcrumb'];
    return molecularKeywords.some(keyword => name.includes(keyword));
  }

  isOrganismalComponent(name) {
    const organismalKeywords = ['header', 'sidebar', 'footer', 'form', 'table', 'list', 'gallery'];
    return organismalKeywords.some(keyword => name.includes(keyword));
  }

  isTemplateComponent(name, layer) {
    const templateKeywords = ['page', 'layout', 'template', 'screen'];
    return templateKeywords.some(keyword => name.includes(keyword)) ||
           (layer.children && layer.children.length >= 10);
  }

  getAtomicType(name) {
    if (name.includes('button')) {return 'button';}
    if (name.includes('input')) {return 'input';}
    if (name.includes('icon')) {return 'icon';}
    if (name.includes('label')) {return 'label';}
    return 'element';
  }

  getMolecularType(name) {
    if (name.includes('field')) {return 'form-field';}
    if (name.includes('item')) {return 'list-item';}
    if (name.includes('nav')) {return 'nav-item';}
    return 'combination';
  }

  getOrganismalType(name) {
    if (name.includes('header')) {return 'page-header';}
    if (name.includes('form')) {return 'form-section';}
    if (name.includes('table')) {return 'data-table';}
    if (name.includes('list')) {return 'content-list';}
    return 'complex-component';
  }

  // Pattern detection methods
  detectNavigationPatterns(layers) {
    const patterns = [];
    const navLayers = layers.filter(layer =>
      layer.name && (
        layer.name.toLowerCase().includes('nav') ||
        layer.name.toLowerCase().includes('menu') ||
        layer.name.toLowerCase().includes('header')
      )
    );

    if (navLayers.length > 0) {
      patterns.push({
        category: 'navigation',
        type: 'primary-navigation',
        confidence: 85,
        layers: navLayers.map(l => l.id),
        recommendations: ['Implement responsive navigation', 'Add keyboard navigation support']
      });
    }

    return patterns;
  }

  detectFormPatterns(layers) {
    const patterns = [];
    const formLayers = layers.filter(layer =>
      layer.name && (
        layer.name.toLowerCase().includes('form') ||
        layer.name.toLowerCase().includes('input') ||
        layer.name.toLowerCase().includes('field')
      )
    );

    if (formLayers.length >= 2) {
      patterns.push({
        category: 'forms',
        type: 'form-collection',
        confidence: 80,
        layers: formLayers.map(l => l.id),
        recommendations: ['Add form validation', 'Implement error handling', 'Consider accessibility']
      });
    }

    return patterns;
  }

  detectDataPatterns(layers) {
    const patterns = [];
    const dataLayers = layers.filter(layer =>
      layer.name && (
        layer.name.toLowerCase().includes('table') ||
        layer.name.toLowerCase().includes('list') ||
        layer.name.toLowerCase().includes('data') ||
        layer.name.toLowerCase().includes('row')
      )
    );

    if (dataLayers.length > 0) {
      patterns.push({
        category: 'data-display',
        type: 'data-visualization',
        confidence: 75,
        layers: dataLayers.map(l => l.id),
        recommendations: ['Add sorting/filtering', 'Implement pagination', 'Consider loading states']
      });
    }

    return patterns;
  }

  detectFeedbackPatterns(layers) {
    const patterns = [];
    const feedbackLayers = layers.filter(layer =>
      layer.name && (
        layer.name.toLowerCase().includes('alert') ||
        layer.name.toLowerCase().includes('notification') ||
        layer.name.toLowerCase().includes('toast') ||
        layer.name.toLowerCase().includes('modal')
      )
    );

    if (feedbackLayers.length > 0) {
      patterns.push({
        category: 'feedback',
        type: 'user-feedback',
        confidence: 70,
        layers: feedbackLayers.map(l => l.id),
        recommendations: ['Implement consistent messaging', 'Add auto-dismiss timers', 'Consider accessibility']
      });
    }

    return patterns;
  }

  detectLayoutPatterns(layers) {
    const patterns = [];
    const layoutLayers = layers.filter(layer =>
      layer.name && (
        layer.name.toLowerCase().includes('grid') ||
        layer.name.toLowerCase().includes('layout') ||
        layer.name.toLowerCase().includes('container')
      )
    );

    if (layoutLayers.length > 0) {
      patterns.push({
        category: 'layout',
        type: 'grid-system',
        confidence: 65,
        layers: layoutLayers.map(l => l.id),
        recommendations: ['Implement responsive grid', 'Use consistent spacing', 'Consider mobile layouts']
      });
    }

    return patterns;
  }

  // Consistency evaluation methods
  evaluateColorConsistency(colors) {
    if (colors.length <= 8) {return 90;}
    if (colors.length <= 12) {return 75;}
    if (colors.length <= 16) {return 60;}
    return 40;
  }

  evaluateTypographyConsistency(typography) {
    const uniqueStyles = new Set(typography);
    if (uniqueStyles.size <= 6) {return 90;}
    if (uniqueStyles.size <= 10) {return 75;}
    if (uniqueStyles.size <= 15) {return 60;}
    return 40;
  }

  evaluateSpacingConsistency(spacing) {
    if (spacing.length === 0) {return 50;}

    // Check if spacing follows a consistent scale (e.g., 4px, 8px, 16px, 32px)
    const sortedSpacing = [...spacing].sort((a, b) => a - b);
    let consistentScale = 0;

    for (let i = 1; i < sortedSpacing.length; i++) {
      const ratio = sortedSpacing[i] / sortedSpacing[i - 1];
      if (ratio === 2 || ratio === 1.5 || ratio === 1.25) {
        consistentScale++;
      }
    }

    const consistencyRatio = consistentScale / (sortedSpacing.length - 1);
    return Math.round(consistencyRatio * 100);
  }

  evaluateComponentConsistency(figmaContext) {
    const layers = figmaContext.layers || [];
    const componentNames = layers
      .filter(layer => layer.name)
      .map(layer => layer.name.toLowerCase());

    // Check for consistent naming patterns
    const hasConsistentNaming = this.checkNamingConsistency(componentNames);

    return hasConsistentNaming ? 80 : 50;
  }

  checkNamingConsistency(names) {
    // Check for consistent naming patterns (kebab-case, camelCase, etc.)
    const kebabCase = names.filter(name => name.includes('-')).length;
    const camelCase = names.filter(name => /[a-z][A-Z]/.test(name)).length;
    const spaceCase = names.filter(name => name.includes(' ')).length;

    const total = names.length;
    const dominantPattern = Math.max(kebabCase, camelCase, spaceCase);

    return dominantPattern / total > 0.7;
  }

  // Utility methods
  colorToHex(color) {
    if (typeof color === 'string') {return color;}
    if (color.r !== undefined) {
      const r = Math.round(color.r * 255);
      const g = Math.round(color.g * 255);
      const b = Math.round(color.b * 255);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return '#000000';
  }

  mergeTokens(target, source) {
    Object.keys(source).forEach(key => {
      if (source[key] instanceof Set) {
        source[key].forEach(value => target[key].add(value));
      }
    });
  }

  convertTokenSetsToArrays(tokens) {
    const result = {};
    Object.keys(tokens).forEach(key => {
      result[key] = Array.from(tokens[key]);
    });
    return result;
  }

  calculateSystemConfidence(analysis) {
    let confidence = 0;
    let factors = 0;

    // Factor in design token consistency
    if (analysis.designTokens.colors.length > 0) {
      confidence += analysis.systemConsistency.colorConsistency;
      factors++;
    }

    // Factor in component hierarchy completeness
    const hierarchyLevels = Object.values(analysis.componentHierarchy)
      .filter(level => level.length > 0).length;
    confidence += (hierarchyLevels / 5) * 100;
    factors++;

    // Factor in pattern detection
    if (analysis.designPatterns.length > 0) {
      const avgPatternConfidence = analysis.designPatterns
        .reduce((sum, pattern) => sum + pattern.confidence, 0) / analysis.designPatterns.length;
      confidence += avgPatternConfidence;
      factors++;
    }

    return factors > 0 ? Math.round(confidence / factors) : 0;
  }

  createEmptyAnalysis() {
    return {
      designTokens: { colors: [], typography: [], spacing: [], borders: [], shadows: [] },
      componentHierarchy: { atoms: [], molecules: [], organisms: [], templates: [], pages: [] },
      designPatterns: [],
      systemConsistency: { colorConsistency: 0, typographyConsistency: 0, spacingConsistency: 0, componentConsistency: 0, overallScore: 0, issues: [] },
      recommendations: [],
      confidence: 0
    };
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesignSystemAnalyzer;
} else if (typeof window !== 'undefined') {
  window.DesignSystemAnalyzer = DesignSystemAnalyzer;
}