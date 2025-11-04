/**
 * Phase 1: Enhanced Tech Stack Parser with Figma Design Context
 *
 * This module extends the existing parseTechStack functionality to include
 * design pattern recognition and component type detection from Figma context.
 */

/**
 * Design Pattern Recognition System
 * Analyzes Figma design context to identify common UI patterns
 */
class DesignPatternRecognizer {
  constructor() {
    this.patterns = {
      form: {
        indicators: ['input', 'form', 'field', 'submit', 'button'],
        frameworks: { react: 0.9, vue: 0.8, angular: 0.9 },
        libraries: ['react-hook-form', 'formik', 'vee-validate', 'reactive-forms']
      },
      navigation: {
        indicators: ['nav', 'menu', 'header', 'sidebar', 'breadcrumb'],
        frameworks: { react: 0.8, vue: 0.8, angular: 0.7 },
        libraries: ['react-router', 'vue-router', 'angular-router']
      },
      dataDisplay: {
        indicators: ['table', 'list', 'grid', 'card', 'chart'],
        frameworks: { react: 0.8, vue: 0.7, angular: 0.8 },
        libraries: ['ag-grid', 'react-table', 'vue-tables', 'angular-material']
      },
      layout: {
        indicators: ['container', 'flex', 'grid', 'layout', 'wrapper'],
        frameworks: { react: 0.7, vue: 0.7, angular: 0.6 },
        libraries: ['chakra-ui', 'material-ui', 'vuetify', 'angular-material']
      }
    };
  }

  /**
   * Analyze Figma context for design patterns
   * @param {Object} figmaContext - Figma design data
   * @returns {Object} Detected patterns with confidence scores
   */
  analyzePatterns(figmaContext) {
    if (!figmaContext || !figmaContext.layers) {
      return { patterns: [], confidence: 0 };
    }

    const detectedPatterns = [];
    const layerText = this.extractTextFromLayers(figmaContext.layers);
    const layerNames = this.extractLayerNames(figmaContext.layers);
    const combinedText = (layerText + ' ' + layerNames).toLowerCase();

    // Analyze each pattern type
    Object.entries(this.patterns).forEach(([patternType, config]) => {
      const matchCount = config.indicators.filter(indicator =>
        combinedText.includes(indicator.toLowerCase())
      ).length;

      if (matchCount > 0) {
        const confidence = Math.min(matchCount / config.indicators.length, 1);
        detectedPatterns.push({
          type: patternType,
          confidence,
          matchedIndicators: config.indicators.filter(indicator =>
            combinedText.includes(indicator.toLowerCase())
          ),
          suggestedLibraries: config.libraries
        });
      }
    });

    // Sort by confidence
    detectedPatterns.sort((a, b) => b.confidence - a.confidence);

    return {
      patterns: detectedPatterns,
      confidence: detectedPatterns.length > 0 ?
        detectedPatterns.reduce((sum, p) => sum + p.confidence, 0) / detectedPatterns.length : 0
    };
  }

  extractTextFromLayers(layers) {
    let text = '';
    layers.forEach(layer => {
      if (layer.type === 'TEXT' && layer.characters) {
        text += layer.characters + ' ';
      }
      if (layer.children) {
        text += this.extractTextFromLayers(layer.children);
      }
    });
    return text;
  }

  extractLayerNames(layers) {
    let names = '';
    layers.forEach(layer => {
      if (layer.name) {
        names += layer.name + ' ';
      }
      if (layer.children) {
        names += this.extractLayerNames(layer.children);
      }
    });
    return names;
  }
}

/**
 * Component Type Detection System
 * Identifies specific component types from Figma layers
 */
class ComponentTypeDetector {
  constructor() {
    this.componentTypes = {
      button: {
        indicators: ['button', 'btn', 'cta', 'action'],
        attributes: ['clickable', 'interactive'],
        complexity: 'low'
      },
      input: {
        indicators: ['input', 'field', 'textfield', 'textarea'],
        attributes: ['form', 'editable'],
        complexity: 'medium'
      },
      modal: {
        indicators: ['modal', 'dialog', 'popup', 'overlay'],
        attributes: ['overlay', 'centered'],
        complexity: 'high'
      },
      card: {
        indicators: ['card', 'tile', 'item', 'product'],
        attributes: ['container', 'shadow'],
        complexity: 'medium'
      },
      navigation: {
        indicators: ['nav', 'menu', 'breadcrumb', 'tabs'],
        attributes: ['navigation', 'links'],
        complexity: 'medium'
      }
    };
  }

  /**
   * Detect component types from Figma context
   * @param {Object} figmaContext - Figma design data
   * @returns {Object} Detected components with metadata
   */
  detectComponents(figmaContext) {
    if (!figmaContext || !figmaContext.layers) {
      return { components: [], confidence: 0 };
    }

    const detectedComponents = [];
    const layers = figmaContext.layers;

    layers.forEach(layer => {
      const componentType = this.analyzeLayer(layer);
      if (componentType) {
        detectedComponents.push({
          ...componentType,
          layerId: layer.id,
          layerName: layer.name
        });
      }
    });

    return {
      components: detectedComponents,
      confidence: detectedComponents.length > 0 ? 0.8 : 0
    };
  }

  analyzeLayer(layer) {
    const layerName = (layer.name || '').toLowerCase();
    // const layerType = layer.type || ''; // TODO: Use layerType for enhanced analysis

    for (const [componentType, config] of Object.entries(this.componentTypes)) {
      const hasIndicator = config.indicators.some(indicator =>
        layerName.includes(indicator)
      );

      if (hasIndicator) {
        return {
          type: componentType,
          complexity: config.complexity,
          confidence: 0.8,
          suggestedProps: this.generateProps(componentType),
          estimatedEffort: this.estimateEffort(config.complexity)
        };
      }
    }

    return null;
  }

  generateProps(componentType) {
    const propSuggestions = {
      button: ['variant', 'size', 'disabled', 'onClick'],
      input: ['type', 'placeholder', 'value', 'onChange', 'validation'],
      modal: ['isOpen', 'onClose', 'title', 'children'],
      card: ['title', 'content', 'actions', 'variant'],
      navigation: ['items', 'activeItem', 'onItemClick']
    };

    return propSuggestions[componentType] || [];
  }

  estimateEffort(complexity) {
    const effortMap = {
      low: '1-2 hours',
      medium: '3-5 hours',
      high: '6-8 hours'
    };
    return effortMap[complexity] || 'Unknown';
  }
}

/**
 * Enhanced Confidence Calculator
 * Calculates confidence scores considering both tech stack and design context
 */
class DesignConfidenceCalculator {
  constructor() {
    this.patternRecognizer = new DesignPatternRecognizer();
    this.componentDetector = new ComponentTypeDetector();
  }

  /**
   * Calculate enhanced confidence score with design context
   * @param {Object} baseTechStack - Original tech stack parsing result
   * @param {Object} figmaContext - Figma design data
   * @returns {number} Enhanced confidence score (0-1)
   */
  calculateDesignConfidence(baseTechStack, figmaContext) {
    if (!figmaContext) {
      return baseTechStack.confidence || 0.5;
    }

    // Base confidence from original parser
    let confidence = baseTechStack.confidence || 0.5;

    // Analyze design patterns
    const patternAnalysis = this.patternRecognizer.analyzePatterns(figmaContext);

    // Adjust confidence based on framework-pattern alignment
    if (patternAnalysis.patterns.length > 0) {
      const frameworkAlignment = this.calculateFrameworkAlignment(
        baseTechStack.stack || [],
        patternAnalysis.patterns
      );

      // Boost confidence if patterns align well with detected framework
      confidence += frameworkAlignment * 0.2;
    }

    // Analyze component complexity
    const componentAnalysis = this.componentDetector.detectComponents(figmaContext);

    // Adjust confidence based on component complexity vs framework capabilities
    if (componentAnalysis.components.length > 0) {
      const complexityAlignment = this.calculateComplexityAlignment(
        baseTechStack.stack || [],
        componentAnalysis.components
      );

      confidence += complexityAlignment * 0.1;
    }

    // Ensure confidence stays within bounds
    return Math.min(Math.max(confidence, 0), 1);
  }

  calculateFrameworkAlignment(techStack, patterns) {
    if (!Array.isArray(techStack) || patterns.length === 0) {return 0;}

    const detectedFramework = techStack.find(tech =>
      ['react', 'vue', 'angular', 'svelte'].includes(tech.toLowerCase())
    );

    if (!detectedFramework) {return 0;}

    const framework = detectedFramework.toLowerCase();
    let totalAlignment = 0;
    let patternCount = 0;

    patterns.forEach(pattern => {
      const frameworkFit = this.patternRecognizer.patterns[pattern.type]?.frameworks[framework];
      if (frameworkFit) {
        totalAlignment += frameworkFit * pattern.confidence;
        patternCount++;
      }
    });

    return patternCount > 0 ? totalAlignment / patternCount : 0;
  }

  calculateComplexityAlignment(techStack, components) {
    if (!Array.isArray(techStack) || components.length === 0) {return 0;}

    const hasAdvancedFramework = techStack.some(tech =>
      ['react', 'vue', 'angular'].includes(tech.toLowerCase())
    );

    const complexComponents = components.filter(comp =>
      comp.complexity === 'high'
    ).length;

    // If we have complex components, advanced frameworks are better suited
    if (complexComponents > 0 && hasAdvancedFramework) {
      return 0.3;
    }

    // Simple components work well with any framework
    return 0.1;
  }
}

/**
 * Enhanced Tech Stack Parser
 * Main function that extends the existing parseTechStack with Figma context
 */
export function enhancedParseTechStack(input, figmaContext = null) {
  // Call original parseTechStack function (assuming it exists globally)
  const baseResult = parseBasicTechStack(input);

  // If no Figma context, return enhanced base result
  if (!figmaContext) {
    return {
      ...baseResult,
      designContext: null,
      enhanced: false
    };
  }

  // Initialize analyzers
  const patternRecognizer = new DesignPatternRecognizer();
  const componentDetector = new ComponentTypeDetector();
  const confidenceCalculator = new DesignConfidenceCalculator();

  // Analyze design context
  const patternAnalysis = patternRecognizer.analyzePatterns(figmaContext);
  const componentAnalysis = componentDetector.detectComponents(figmaContext);

  // Calculate enhanced confidence
  const enhancedConfidence = confidenceCalculator.calculateDesignConfidence(
    baseResult,
    figmaContext
  );

  // Generate design-informed suggestions
  const designSuggestions = generateDesignSuggestions(
    baseResult,
    patternAnalysis,
    componentAnalysis
  );

  return {
    ...baseResult,
    confidence: enhancedConfidence,
    designContext: {
      patterns: patternAnalysis.patterns,
      components: componentAnalysis.components,
      patternConfidence: patternAnalysis.confidence,
      componentConfidence: componentAnalysis.confidence
    },
    suggestions: [...(baseResult.suggestions || []), ...designSuggestions],
    enhanced: true,
    metadata: {
      analysisTimestamp: new Date().toISOString(),
      figmaLayerCount: figmaContext.layers?.length || 0,
      enhancementVersion: '1.0.0'
    }
  };
}

/**
 * Fallback basic tech stack parser if original doesn't exist
 */
function parseBasicTechStack(input) {
  const frameworks = ['react', 'vue', 'angular', 'svelte'];
  const languages = ['typescript', 'javascript'];
  const lowerInput = input.toLowerCase();

  const detected = {
    frameworks: frameworks.filter(f => lowerInput.includes(f)),
    languages: languages.filter(l => lowerInput.includes(l))
  };

  return {
    stack: [...detected.frameworks, ...detected.languages],
    confidence: detected.frameworks.length > 0 ? 0.7 : 0.3,
    suggestions: []
  };
}

/**
 * Generate design-informed suggestions
 */
function generateDesignSuggestions(baseResult, patternAnalysis, componentAnalysis) {
  const suggestions = [];

  // Suggest libraries based on detected patterns
  patternAnalysis.patterns.forEach(pattern => {
    if (pattern.suggestedLibraries) {
      pattern.suggestedLibraries.forEach(lib => {
        suggestions.push(`Consider ${lib} for ${pattern.type} patterns`);
      });
    }
  });

  // Suggest improvements based on component complexity
  const complexComponents = componentAnalysis.components.filter(c =>
    c.complexity === 'high'
  );

  if (complexComponents.length > 0) {
    suggestions.push('Add state management for complex components');
    suggestions.push('Consider component library like Material-UI');
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Export classes for testing
export {
  DesignPatternRecognizer,
  ComponentTypeDetector,
  DesignConfidenceCalculator
};