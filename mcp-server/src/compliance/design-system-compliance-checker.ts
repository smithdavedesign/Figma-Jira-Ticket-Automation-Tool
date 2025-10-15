/**
 * Design System Compliance Checker
 * 
 * Implements the Master Integration Plan Phase 2 requirement:
 * "Add design system compliance checking with tech stack validation"
 */

export interface DesignTokens {
  colors?: Record<string, string>;
  typography?: Record<string, any>;
  spacing?: Record<string, string>;
  shadows?: Record<string, string>;
  borderRadius?: Record<string, string>;
}

export interface ComponentPattern {
  type: string;
  properties: Record<string, any>;
  figmaProperties?: Record<string, any>;
}

export interface ComplianceResult {
  isCompliant: boolean;
  confidence: number;
  designSystem: string;
  issues: string[];
  suggestions: string[];
  score: number;
}

export interface TechStackCompatibility {
  compatible: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  recommendedLibraries: string[];
}

/**
 * Main Design System Compliance Checker
 */
export class DesignSystemComplianceChecker {
  private knownDesignSystems: Map<string, any> = new Map();
  
  constructor() {
    this.initializeDesignSystems();
  }
  
  /**
   * Check design token compliance against known design systems
   */
  checkDesignTokenCompliance(tokens: DesignTokens): ComplianceResult {
    const results: ComplianceResult[] = [];
    
    // Check against Material Design
    results.push(this.checkMaterialDesignCompliance(tokens));
    
    // Check against Apple Human Interface Guidelines
    results.push(this.checkAppleHIGCompliance(tokens));
    
    // Check against Fluent Design System
    results.push(this.checkFluentDesignCompliance(tokens));
    
    // Check against Ant Design
    results.push(this.checkAntDesignCompliance(tokens));
    
    // Return the highest confidence result
    return results.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }
  
  /**
   * Recognize component patterns and validate against design systems
   */
  recognizeComponentPattern(component: ComponentPattern): ComplianceResult {
    const { type, properties } = component;
    
    switch (type.toLowerCase()) {
      case 'button':
        return this.analyzeButtonPattern(properties);
      case 'input':
      case 'textfield':
        return this.analyzeInputPattern(properties);
      case 'card':
        return this.analyzeCardPattern(properties);
      case 'navigation':
      case 'navbar':
        return this.analyzeNavigationPattern(properties);
      default:
        return this.analyzeGenericPattern(component);
    }
  }
  
  /**
   * Check tech stack compatibility with design system
   */
  checkTechStackCompatibility(
    designSystem: string, 
    techStack: Record<string, string>
  ): TechStackCompatibility {
    const framework = techStack.framework?.toLowerCase();
    
    const compatibilityMatrix = this.getCompatibilityMatrix();
    const systemCompatibility = compatibilityMatrix[designSystem];
    
    if (!systemCompatibility || !framework) {
      return {
        compatible: false,
        confidence: 0.3,
        issues: [`Unknown compatibility for ${framework || 'unknown framework'} with ${designSystem}`],
        suggestions: ['Consider using a more common framework', 'Check for community libraries'],
        recommendedLibraries: []
      };
    }
    
    const compatibility = systemCompatibility[framework];
    
    if (!compatibility) {
      return {
        compatible: false,
        confidence: 0.3,
        issues: [`No compatibility data for ${framework} with ${designSystem}`],
        suggestions: ['Consider using a supported framework', 'Check for community libraries'],
        recommendedLibraries: []
      };
    }
    
    return {
      compatible: compatibility.compatible,
      confidence: compatibility.confidence,
      issues: compatibility.issues || [],
      suggestions: compatibility.suggestions || [],
      recommendedLibraries: compatibility.libraries || []
    };
  }
  
  /**
   * Comprehensive design system analysis
   */
  analyzeDesignSystem(data: {
    tokens: DesignTokens;
    components: ComponentPattern[];
    techStack: Record<string, string>;
  }): {
    tokenCompliance: ComplianceResult;
    componentCompliance: ComplianceResult[];
    techStackCompatibility: TechStackCompatibility;
    overallScore: number;
    recommendations: string[];
  } {
    // Analyze design tokens
    const tokenCompliance = this.checkDesignTokenCompliance(data.tokens);
    
    // Analyze each component
    const componentCompliance = data.components.map(comp => 
      this.recognizeComponentPattern(comp)
    );
    
    // Check tech stack compatibility
    const techStackCompatibility = this.checkTechStackCompatibility(
      tokenCompliance.designSystem,
      data.techStack
    );
    
    // Calculate overall score
    const tokenScore = tokenCompliance.score;
    const componentScore = componentCompliance.reduce((sum, comp) => sum + comp.score, 0) / 
                          Math.max(componentCompliance.length, 1);
    const techScore = techStackCompatibility.compatible ? 85 : 45;
    
    const overallScore = (tokenScore * 0.4 + componentScore * 0.4 + techScore * 0.2);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations({
      tokenCompliance,
      componentCompliance,
      techStackCompatibility,
      overallScore
    });
    
    return {
      tokenCompliance,
      componentCompliance,
      techStackCompatibility,
      overallScore,
      recommendations
    };
  }
  
  // Private implementation methods
  
  private initializeDesignSystems() {
    this.knownDesignSystems = new Map([
      ['material-design', {
        colors: {
          primary: ['#1976D2', '#2196F3', '#1565C0'],
          secondary: ['#DC004E', '#E91E63', '#AD1457'],
          error: ['#B00020', '#F44336', '#C62828']
        },
        typography: {
          fontFamily: ['Roboto', 'Roboto Condensed'],
          weights: [300, 400, 500, 700],
          sizes: [12, 14, 16, 20, 24, 34, 48, 60, 96]
        },
        spacing: [4, 8, 16, 24, 32, 40, 48],
        elevation: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24]
      }],
      ['apple-hig', {
        colors: {
          systemBlue: '#007AFF',
          systemGreen: '#34C759',
          systemRed: '#FF3B30',
          systemOrange: '#FF9500',
          systemYellow: '#FFCC00'
        },
        typography: {
          fontFamily: ['SF Pro Display', 'SF Pro Text', 'SF Compact'],
          weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
          sizes: [11, 13, 15, 17, 20, 28, 34]
        },
        spacing: [4, 8, 12, 16, 20, 24, 32],
        cornerRadius: [0, 4, 8, 12, 16, 20]
      }],
      ['fluent-design', {
        colors: {
          themePrimary: '#0078D4',
          themeSecondary: '#106EBE',
          themeTertiary: '#005A9E'
        },
        typography: {
          fontFamily: ['Segoe UI', 'Segoe UI Web'],
          weights: [100, 200, 300, 400, 600, 700],
          sizes: [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 68]
        }
      }]
    ]);
  }
  
  private checkMaterialDesignCompliance(tokens: DesignTokens): ComplianceResult {
    const materialDesign = this.knownDesignSystems.get('material-design')!;
    let score = 0;
    let maxScore = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check colors
    if (tokens.colors) {
      maxScore += 30;
      if (tokens.colors.primary && materialDesign.colors.primary.includes(tokens.colors.primary)) {
        score += 15;
      } else if (tokens.colors.primary) {
        issues.push('Primary color does not match Material Design palette');
        suggestions.push('Consider using Material Design primary colors like #1976D2');
      }
      
      if (tokens.colors.error && materialDesign.colors.error.includes(tokens.colors.error)) {
        score += 15;
      }
    }
    
    // Check typography
    if (tokens.typography) {
      maxScore += 25;
      const hasRoboto = Object.values(tokens.typography).some(
        (typo: any) => typo.fontFamily?.includes('Roboto')
      );
      if (hasRoboto) {
        score += 25;
      } else {
        issues.push('Typography does not use Roboto font family');
        suggestions.push('Use Roboto font family for Material Design compliance');
      }
    }
    
    // Check spacing
    if (tokens.spacing) {
      maxScore += 20;
      const spacingValues = Object.values(tokens.spacing).map(s => parseInt(s));
      const materialSpacing = materialDesign.spacing;
      const matchingSpacing = spacingValues.filter(s => materialSpacing.includes(s));
      score += (matchingSpacing.length / spacingValues.length) * 20;
    }
    
    const confidence = maxScore > 0 ? score / maxScore : 0;
    
    return {
      isCompliant: confidence > 0.7,
      confidence,
      designSystem: 'material-design',
      issues,
      suggestions,
      score: (confidence * 100)
    };
  }
  
  private checkAppleHIGCompliance(tokens: DesignTokens): ComplianceResult {
    const appleHIG = this.knownDesignSystems.get('apple-hig')!;
    let score = 0;
    let maxScore = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check colors
    if (tokens.colors) {
      maxScore += 30;
      if (tokens.colors.systemBlue === appleHIG.colors.systemBlue) {
        score += 15;
      }
      if (tokens.colors.systemRed === appleHIG.colors.systemRed) {
        score += 15;
      }
      
      if (score === 0 && tokens.colors.primary) {
        issues.push('Colors do not match Apple system colors');
        suggestions.push('Consider using Apple system colors like #007AFF for primary');
      }
    }
    
    // Check typography
    if (tokens.typography) {
      maxScore += 25;
      const hasSFPro = Object.values(tokens.typography).some(
        (typo: any) => typo.fontFamily?.includes('SF Pro')
      );
      if (hasSFPro) {
        score += 25;
      } else {
        issues.push('Typography does not use SF Pro font family');
        suggestions.push('Use SF Pro font family for Apple HIG compliance');
      }
    }
    
    const confidence = maxScore > 0 ? score / maxScore : 0;
    
    return {
      isCompliant: confidence > 0.7,
      confidence,
      designSystem: 'apple-hig',
      issues,
      suggestions,
      score: (confidence * 100)
    };
  }
  
  private checkFluentDesignCompliance(tokens: DesignTokens): ComplianceResult {
    // Simplified Fluent Design check
    const fluentDesign = this.knownDesignSystems.get('fluent-design')!;
    let confidence = 0.3; // Base confidence
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (tokens.colors?.themePrimary === fluentDesign.colors.themePrimary) {
      confidence += 0.4;
    } else {
      issues.push('Primary color does not match Fluent Design theme');
      suggestions.push('Consider using #0078D4 for Fluent Design primary color');
    }
    
    return {
      isCompliant: confidence > 0.7,
      confidence,
      designSystem: 'fluent-design',
      issues,
      suggestions,
      score: (confidence * 100)
    };
  }
  
  private checkAntDesignCompliance(tokens: DesignTokens): ComplianceResult {
    // Simplified Ant Design check
    let confidence = 0.2; // Lower base confidence
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (tokens.colors?.primary === '#1890ff') {
      confidence += 0.5;
    } else {
      issues.push('Primary color does not match Ant Design default');
      suggestions.push('Consider using #1890ff for Ant Design primary color');
    }
    
    return {
      isCompliant: confidence > 0.7,
      confidence,
      designSystem: 'ant-design',
      issues,
      suggestions,
      score: (confidence * 100)
    };
  }
  
  private analyzeButtonPattern(properties: Record<string, any>): ComplianceResult {
    let confidence = 0.5;
    const issues: string[] = [];
    const suggestions: string[] = [];
    let designSystem = 'unknown';
    
    // Material Design button patterns
    if (properties.elevation || properties.textTransform === 'uppercase') {
      confidence += 0.3;
      designSystem = 'material-design';
    }
    
    // Apple HIG button patterns
    if (properties.cornerRadius === '8px' && properties.fontWeight === '600') {
      confidence += 0.3;
      designSystem = 'apple-hig';
    }
    
    // Accessibility checks
    if (properties.minHeight && parseInt(properties.minHeight) < 44) {
      issues.push('Button height below accessibility minimum (44px)');
      suggestions.push('Increase button height to at least 44px for better accessibility');
      confidence -= 0.1;
    }
    
    return {
      isCompliant: confidence > 0.7,
      confidence,
      designSystem,
      issues,
      suggestions,
      score: (confidence * 100)
    };
  }
  
  private analyzeInputPattern(properties: Record<string, any>): ComplianceResult {
    let confidence = 0.4;
    const issues: string[] = [];
    const suggestions: string[] = [];
    let designSystem = 'modern';
    
    // Check for proper padding
    if (properties.padding) {
      confidence += 0.2;
    } else {
      issues.push('Input lacks proper padding');
      suggestions.push('Add padding for better usability');
    }
    
    // Check for border radius
    if (properties.borderRadius || properties.cornerRadius) {
      confidence += 0.2;
    }
    
    return {
      isCompliant: confidence > 0.6,
      confidence,
      designSystem,
      issues,
      suggestions,
      score: (confidence * 100)
    };
  }
  
  private analyzeCardPattern(properties: Record<string, any>): ComplianceResult {
    let confidence = 0.3;
    const issues: string[] = [];
    const suggestions: string[] = [];
    let designSystem = 'unknown';
    
    // Material Design card patterns
    if (properties.elevation) {
      confidence += 0.4;
      designSystem = 'material-design';
    }
    
    // Check for proper spacing
    if (properties.padding) {
      confidence += 0.2;
    } else {
      issues.push('Card lacks proper internal padding');
      suggestions.push('Add padding for better content layout');
    }
    
    return {
      isCompliant: confidence > 0.6,
      confidence,
      designSystem,
      issues,
      suggestions,
      score: (confidence * 100)
    };
  }
  
  private analyzeNavigationPattern(properties: Record<string, any>): ComplianceResult {
    let confidence = 0.4;
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check for proper height
    if (properties.height) {
      const height = parseInt(properties.height);
      if (height >= 44) {
        confidence += 0.3;
      } else {
        issues.push('Navigation height below accessibility minimum');
        suggestions.push('Increase navigation height to at least 44px');
      }
    }
    
    return {
      isCompliant: confidence > 0.6,
      confidence,
      designSystem: 'modern',
      issues,
      suggestions,
      score: (confidence * 100)
    };
  }
  
  private analyzeGenericPattern(component: ComponentPattern): ComplianceResult {
    return {
      isCompliant: false,
      confidence: 0.2,
      designSystem: 'unknown',
      issues: [`Unknown component type: ${component.type}`],
      suggestions: ['Define component pattern for better analysis'],
      score: 20
    };
  }
  
  private getCompatibilityMatrix(): Record<string, Record<string, any>> {
    return {
      'material-design': {
        'react': {
          compatible: true,
          confidence: 0.95,
          libraries: ['@mui/material', '@material-ui/core', 'react-md'],
          suggestions: ['Use Material-UI for best Material Design compliance']
        },
        'vue': {
          compatible: true,
          confidence: 0.90,
          libraries: ['vuetify', 'vue-material', 'quasar'],
          suggestions: ['Vuetify provides excellent Material Design implementation']
        },
        'angular': {
          compatible: true,
          confidence: 0.92,
          libraries: ['@angular/material', 'ng-zorro-antd'],
          suggestions: ['Angular Material is the official Material Design implementation']
        },
        'svelte': {
          compatible: true,
          confidence: 0.75,
          libraries: ['svelte-material-ui', 'smelte'],
          suggestions: ['Consider using Svelte Material UI for Material Design']
        }
      },
      'apple-hig': {
        'react': {
          compatible: true,
          confidence: 0.70,
          libraries: ['react-native', '@fluentui/react'],
          suggestions: ['Consider React Native for true Apple HIG compliance'],
          issues: ['Web implementations may not fully match native Apple guidelines']
        },
        'vue': {
          compatible: false,
          confidence: 0.30,
          issues: ['Limited Apple HIG support for Vue'],
          suggestions: ['Consider custom implementation or different design system']
        }
      },
      'fluent-design': {
        'react': {
          compatible: true,
          confidence: 0.90,
          libraries: ['@fluentui/react', '@fluentui/react-components'],
          suggestions: ['Fluent UI React provides official Microsoft design implementation']
        }
      }
    };
  }
  
  private generateRecommendations(analysis: {
    tokenCompliance: ComplianceResult;
    componentCompliance: ComplianceResult[];
    techStackCompatibility: TechStackCompatibility;
    overallScore: number;
  }): string[] {
    const recommendations: string[] = [];
    
    if (analysis.overallScore < 70) {
      recommendations.push('Overall design system compliance is low - consider adopting a established design system');
    }
    
    if (!analysis.tokenCompliance.isCompliant) {
      recommendations.push('Design tokens need alignment with chosen design system standards');
    }
    
    if (!analysis.techStackCompatibility.compatible) {
      recommendations.push('Tech stack is not well-suited for the detected design system');
      recommendations.push(...analysis.techStackCompatibility.suggestions);
    }
    
    const lowConfidenceComponents = analysis.componentCompliance.filter(c => c.confidence < 0.6);
    if (lowConfidenceComponents.length > 0) {
      recommendations.push(`${lowConfidenceComponents.length} components have low design system confidence`);
    }
    
    return recommendations;
  }
}

export default DesignSystemComplianceChecker;