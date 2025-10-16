# ML Classification System: The Intelligence Engine

> **Lightweight classifiers that infer component roles, intent, and behavior from design patterns**

## 🧠 Classification Philosophy

This isn't heavy ML infrastructure — it's **pattern recognition at scale**. The system learns from design conventions, naming patterns, visual hierarchies, and spatial relationships to infer semantic meaning from raw design data.

## 🎯 Classification Targets

### Component Role Classification

```typescript
enum ComponentRole {
  // Action Components
  PRIMARY_CTA = 'primary_cta',           // "Buy Now", "Sign Up", main action
  SECONDARY_CTA = 'secondary_cta',       // "Learn More", "Cancel", secondary action
  NAVIGATION = 'navigation',             // Menu items, breadcrumbs, links
  
  // Input Components  
  DATA_INPUT = 'data_input',             // Form fields, search boxes, text areas
  DATA_SELECTION = 'data_selection',     // Dropdowns, checkboxes, radio buttons
  
  // Display Components
  DATA_DISPLAY = 'data_display',         // Tables, lists, cards showing information
  CONTENT = 'content',                   // Text blocks, images, media
  FEEDBACK = 'feedback',                 // Alerts, notifications, status indicators
  
  // Structural Components
  LAYOUT = 'layout',                     // Containers, grids, spacers
  DECORATION = 'decoration',             // Icons, dividers, background elements
  
  // Complex Components
  COMPOSITE = 'composite'                // Multi-purpose components with mixed roles
}
```

### Intent Classification

```typescript
interface IntentClassification {
  // Primary purpose
  purpose: 'conversion' | 'navigation' | 'information' | 'interaction' | 'decoration';
  
  // User action intent
  action: 'click' | 'input' | 'select' | 'submit' | 'navigate' | 'view' | 'none';
  
  // Business priority
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Urgency indicators
  urgency: 'immediate' | 'soon' | 'eventual' | 'optional';
}
```

### Behavioral Pattern Classification

```typescript
interface BehaviorPattern {
  // Interaction type
  interaction: 'hover' | 'click' | 'focus' | 'scroll' | 'drag' | 'submit';
  
  // State changes
  stateChange: 'toggle' | 'navigate' | 'validate' | 'submit' | 'load' | 'none';
  
  // Visual feedback
  feedback: 'immediate' | 'delayed' | 'none';
  
  // Error handling
  errorHandling: 'inline' | 'modal' | 'page' | 'none';
}
```

## 🔍 Feature Extraction Pipeline

### Visual Feature Extractors

```typescript
class VisualFeatureExtractor {
  extractFeatures(component: NormalizedComponent): VisualFeatures {
    return {
      // Size and prominence
      size: this.calculateRelativeSize(component),
      prominence: this.calculateVisualWeight(component),
      position: this.analyzePosition(component),
      
      // Color analysis
      colorProfile: this.analyzeColorProfile(component),
      contrast: this.calculateContrastRatio(component),
      
      // Typography
      textProperties: this.analyzeTextProperties(component),
      
      // Shape and form
      borderRadius: component.styles.borderRadius || 0,
      hasDropShadow: !!component.styles.dropShadow,
      hasBorder: !!component.styles.border,
      
      // Layout context
      isolation: this.calculateIsolation(component),
      alignment: this.analyzeAlignment(component)
    };
  }

  private calculateVisualWeight(component: NormalizedComponent): number {
    let weight = 0;
    
    // Size contribution (0-0.3)
    const sizeRatio = component.bounds.width * component.bounds.height;
    weight += Math.min(sizeRatio / 10000, 0.3);
    
    // Color saturation (0-0.2)
    if (component.styles.fill) {
      const saturation = this.getColorSaturation(component.styles.fill);
      weight += saturation * 0.2;
    }
    
    // Drop shadow (0-0.1)
    if (component.styles.dropShadow) {
      weight += 0.1;
    }
    
    // Border (0-0.1)
    if (component.styles.border) {
      weight += 0.1;
    }
    
    // Text weight (0-0.3)
    if (component.styles.text) {
      const fontWeight = component.styles.text.fontWeight || 400;
      weight += (fontWeight - 400) / 500 * 0.3;
    }
    
    return Math.min(weight, 1.0);
  }

  private analyzePosition(component: NormalizedComponent): PositionFeatures {
    return {
      // Relative position in parent
      relativeX: component.bounds.x / (component.parent?.bounds.width || 1),
      relativeY: component.bounds.y / (component.parent?.bounds.height || 1),
      
      // Positioning patterns
      isTopLevel: component.bounds.y < 100,
      isBottomLevel: component.bounds.y > (component.parent?.bounds.height || 0) * 0.8,
      isCentered: Math.abs(component.bounds.x - (component.parent?.bounds.width || 0) / 2) < 50,
      
      // Layout context
      isInHeader: this.isInHeaderContext(component),
      isInFooter: this.isInFooterContext(component),
      isInSidebar: this.isInSidebarContext(component),
      isInMainContent: this.isInMainContentContext(component)
    };
  }
}
```

### Semantic Feature Extractors

```typescript
class SemanticFeatureExtractor {
  extractFeatures(component: NormalizedComponent): SemanticFeatures {
    return {
      // Name analysis
      nameTokens: this.tokenizeName(component.name),
      namePatterns: this.analyzeNamePatterns(component.name),
      
      // Content analysis
      textContent: this.analyzeTextContent(component),
      textSentiment: this.analyzeTextSentiment(component),
      
      // Context patterns
      parentContext: this.analyzeParentContext(component),
      siblingPatterns: this.analyzeSiblingPatterns(component),
      
      // Design system hints
      componentLibraryHints: this.detectComponentLibraryPatterns(component)
    };
  }

  private analyzeNamePatterns(name: string): NamePatterns {
    const normalizedName = name.toLowerCase();
    
    return {
      // Button patterns
      isButton: /button|btn|cta|action/.test(normalizedName),
      isPrimary: /primary|main|principal/.test(normalizedName),
      isSecondary: /secondary|alt|alternative/.test(normalizedName),
      
      // Input patterns
      isInput: /input|field|text|email|password|search/.test(normalizedName),
      isForm: /form|submit|send/.test(normalizedName),
      
      // Navigation patterns
      isNavigation: /nav|menu|link|breadcrumb|tab/.test(normalizedName),
      
      // Content patterns
      isContent: /content|text|copy|description|body/.test(normalizedName),
      isHeading: /heading|title|h1|h2|h3|header/.test(normalizedName),
      
      // Layout patterns
      isContainer: /container|wrapper|box|card|panel/.test(normalizedName),
      isLayout: /layout|grid|row|col|column/.test(normalizedName),
      
      // State patterns
      hasState: /active|disabled|selected|hover|focus/.test(normalizedName),
      
      // Action patterns
      actionVerbs: this.extractActionVerbs(normalizedName)
    };
  }

  private analyzeTextContent(component: NormalizedComponent): TextContentAnalysis {
    if (!component.content?.text) {
      return { hasText: false };
    }

    const text = component.content.text.toLowerCase();
    
    return {
      hasText: true,
      length: text.length,
      
      // Action indicators
      isActionText: /buy|purchase|add|get|start|try|learn|download|sign|register/.test(text),
      isNavigationText: /home|about|contact|help|menu|more/.test(text),
      isFormText: /name|email|password|submit|send|search/.test(text),
      
      // Urgency indicators
      hasUrgency: /now|today|free|limited|urgent|expires/.test(text),
      
      // Question patterns
      isQuestion: text.includes('?'),
      
      // Call to action patterns
      isCTA: /buy now|sign up|get started|learn more|try free|download/.test(text),
      
      // Sentiment
      sentiment: this.calculateTextSentiment(text)
    };
  }
}
```

### Contextual Feature Extractors

```typescript
class ContextualFeatureExtractor {
  extractFeatures(component: NormalizedComponent, pageContext: PageContext): ContextualFeatures {
    return {
      // Page context
      pageType: pageContext.pageType,
      userRole: pageContext.userRole,
      
      // Spatial context
      density: this.calculateLocalDensity(component),
      hierarchy: this.calculateHierarchyLevel(component),
      
      // Functional context
      formContext: this.analyzeFormContext(component),
      navigationContext: this.analyzeNavigationContext(component),
      
      // Business context
      conversionContext: this.analyzeConversionContext(component, pageContext),
      brandingContext: this.analyzeBrandingContext(component)
    };
  }

  private analyzeFormContext(component: NormalizedComponent): FormContext {
    const nearbyComponents = this.findNearbyComponents(component, 200);
    
    const hasFormFields = nearbyComponents.some(c => 
      /input|field|text|email|password/.test(c.name.toLowerCase())
    );
    
    const hasSubmitButton = nearbyComponents.some(c =>
      /submit|send|save/.test(c.name.toLowerCase()) ||
      /submit|send|save/.test(c.content?.text?.toLowerCase() || '')
    );
    
    return {
      isInForm: hasFormFields && hasSubmitButton,
      isFormField: /input|field/.test(component.name.toLowerCase()),
      isSubmitButton: /submit|send|save/.test(component.name.toLowerCase()),
      formComplexity: this.calculateFormComplexity(nearbyComponents)
    };
  }

  private analyzeConversionContext(component: NormalizedComponent, pageContext: PageContext): ConversionContext {
    const isConversionPage = ['product', 'checkout', 'pricing'].includes(pageContext.pageType);
    const hasConversionText = /buy|purchase|add.*cart|checkout|order/.test(
      component.content?.text?.toLowerCase() || ''
    );
    
    return {
      isConversionPage,
      hasConversionText,
      conversionFunnel: this.identifyConversionFunnelStage(component, pageContext),
      isPrimaryConversion: isConversionPage && hasConversionText && 
                          this.calculateVisualWeight(component) > 0.7
    };
  }
}
```

## 🤖 Classification Models

### Rule-Based Classifier (Fast Path)

```typescript
class RuleBasedClassifier {
  classifyComponent(features: ComponentFeatures): ClassificationResult {
    const rules = this.componentRules;
    
    for (const rule of rules) {
      const confidence = this.evaluateRule(rule, features);
      if (confidence > rule.threshold) {
        return {
          classification: rule.result,
          confidence,
          method: 'rule-based',
          rule: rule.name
        };
      }
    }
    
    return this.getDefaultClassification(features);
  }

  private componentRules: ClassificationRule[] = [
    {
      name: 'Primary CTA - High Confidence',
      threshold: 0.9,
      result: { role: ComponentRole.PRIMARY_CTA, intent: { purpose: 'conversion', priority: 'critical' } },
      conditions: (features) => 
        features.semantic.namePatterns.isPrimary &&
        features.semantic.namePatterns.isButton &&
        features.visual.prominence > 0.8 &&
        features.contextual.conversionContext.isPrimaryConversion
    },
    
    {
      name: 'Form Input Field',
      threshold: 0.85,
      result: { role: ComponentRole.DATA_INPUT, intent: { purpose: 'interaction', priority: 'high' } },
      conditions: (features) =>
        features.semantic.namePatterns.isInput &&
        features.contextual.formContext.isFormField &&
        features.visual.textProperties?.isEditable
    },
    
    {
      name: 'Navigation Link',
      threshold: 0.8,
      result: { role: ComponentRole.NAVIGATION, intent: { purpose: 'navigation', priority: 'medium' } },
      conditions: (features) =>
        features.semantic.namePatterns.isNavigation &&
        features.visual.position.isInHeader &&
        features.semantic.textContent.isNavigationText
    }
    
    // ... more rules
  ];
}
```

### ML-Based Classifier (High Accuracy)

```typescript
class MLBasedClassifier {
  private models: {
    componentRole: ComponentRoleModel;
    intentPurpose: IntentPurposeModel;
    priorityLevel: PriorityLevelModel;
  };

  async classifyComponent(features: ComponentFeatures): Promise<ClassificationResult> {
    const featureVector = this.featuresToVector(features);
    
    const [roleProbs, purposeProbs, priorityProbs] = await Promise.all([
      this.models.componentRole.predict(featureVector),
      this.models.intentPurpose.predict(featureVector),
      this.models.priorityLevel.predict(featureVector)
    ]);
    
    return {
      classification: {
        role: this.getHighestConfidenceClass(roleProbs),
        intent: {
          purpose: this.getHighestConfidenceClass(purposeProbs),
          priority: this.getHighestConfidenceClass(priorityProbs)
        }
      },
      confidence: this.calculateAverageConfidence([roleProbs, purposeProbs, priorityProbs]),
      method: 'ml-based',
      probabilities: {
        role: roleProbs,
        purpose: purposeProbs,
        priority: priorityProbs
      }
    };
  }

  private featuresToVector(features: ComponentFeatures): number[] {
    return [
      // Visual features (20 dimensions)
      features.visual.size,
      features.visual.prominence,
      features.visual.position.relativeX,
      features.visual.position.relativeY,
      features.visual.colorProfile.saturation,
      features.visual.colorProfile.brightness,
      features.visual.contrast,
      // ... more visual features
      
      // Semantic features (15 dimensions)
      features.semantic.namePatterns.isButton ? 1 : 0,
      features.semantic.namePatterns.isPrimary ? 1 : 0,
      features.semantic.textContent.isActionText ? 1 : 0,
      features.semantic.textContent.hasUrgency ? 1 : 0,
      // ... more semantic features
      
      // Contextual features (10 dimensions)
      this.pageTypeToNumber(features.contextual.pageType),
      features.contextual.conversionContext.isPrimaryConversion ? 1 : 0,
      features.contextual.formContext.isInForm ? 1 : 0,
      // ... more contextual features
    ];
  }
}
```

### Ensemble Classifier (Best of Both)

```typescript
class EnsembleClassifier {
  constructor(
    private ruleBasedClassifier: RuleBasedClassifier,
    private mlClassifier: MLBasedClassifier
  ) {}

  async classifyComponent(features: ComponentFeatures): Promise<ClassificationResult> {
    const [ruleResult, mlResult] = await Promise.all([
      this.ruleBasedClassifier.classifyComponent(features),
      this.mlClassifier.classifyComponent(features)
    ]);
    
    // Use rule-based for high-confidence cases
    if (ruleResult.confidence > 0.9) {
      return ruleResult;
    }
    
    // Use ML for ambiguous cases
    if (mlResult.confidence > 0.8) {
      return mlResult;
    }
    
    // Ensemble voting for medium confidence
    return this.combineClassifications(ruleResult, mlResult, features);
  }

  private combineClassifications(
    ruleResult: ClassificationResult,
    mlResult: ClassificationResult,
    features: ComponentFeatures
  ): ClassificationResult {
    // Weighted voting based on confidence and feature characteristics
    const ruleWeight = this.calculateRuleBasedWeight(features);
    const mlWeight = 1 - ruleWeight;
    
    const combinedConfidence = 
      ruleResult.confidence * ruleWeight + 
      mlResult.confidence * mlWeight;
    
    // Choose classification with higher weighted confidence
    const finalClassification = 
      (ruleResult.confidence * ruleWeight) > (mlResult.confidence * mlWeight)
        ? ruleResult.classification
        : mlResult.classification;
    
    return {
      classification: finalClassification,
      confidence: combinedConfidence,
      method: 'ensemble',
      ensemble: {
        ruleBasedResult: ruleResult,
        mlBasedResult: mlResult,
        weights: { rule: ruleWeight, ml: mlWeight }
      }
    };
  }
}
```

## 🎯 Training Data Generation

### Automatic Labeling Pipeline

```typescript
class TrainingDataGenerator {
  async generateTrainingData(figmaFiles: string[]): Promise<TrainingDataset> {
    const dataset: TrainingExample[] = [];
    
    for (const fileId of figmaFiles) {
      const components = await this.extractAllComponents(fileId);
      
      for (const component of components) {
        const features = await this.extractFeatures(component);
        
        // Automatic labeling using high-confidence rules
        const autoLabel = await this.generateAutoLabel(component, features);
        
        if (autoLabel.confidence > 0.95) {
          dataset.push({
            features,
            label: autoLabel.classification,
            confidence: autoLabel.confidence,
            source: 'auto-generated',
            metadata: {
              figmaFileId: fileId,
              componentId: component.id,
              componentName: component.name
            }
          });
        }
      }
    }
    
    return {
      examples: dataset,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceFiles: figmaFiles,
        totalExamples: dataset.length,
        qualityScore: this.calculateDatasetQuality(dataset)
      }
    };
  }

  private async generateAutoLabel(
    component: NormalizedComponent,
    features: ComponentFeatures
  ): Promise<AutoLabel> {
    // Use conservative, high-confidence rules for automatic labeling
    const patterns = [
      {
        pattern: () => 
          features.semantic.namePatterns.isButton &&
          features.semantic.textContent.isCTA &&
          features.visual.prominence > 0.8,
        label: { role: ComponentRole.PRIMARY_CTA, intent: { purpose: 'conversion', priority: 'critical' } },
        confidence: 0.98
      },
      
      {
        pattern: () =>
          /^input|text.*field|email.*field/i.test(component.name) &&
          features.contextual.formContext.isFormField,
        label: { role: ComponentRole.DATA_INPUT, intent: { purpose: 'interaction', priority: 'high' } },
        confidence: 0.96
      }
      
      // ... more patterns
    ];
    
    for (const { pattern, label, confidence } of patterns) {
      if (pattern()) {
        return { classification: label, confidence };
      }
    }
    
    return { classification: null, confidence: 0 };
  }
}
```

### Human-in-the-Loop Refinement

```typescript
class HumanFeedbackIntegration {
  async incorporateFeedback(
    extractionId: string,
    humanCorrections: ClassificationCorrections,
    userContext: UserContext
  ): Promise<void> {
    // Store correction for model retraining
    await this.trainingDataStore.addCorrection({
      extractionId,
      corrections: humanCorrections,
      userRole: userContext.role,
      confidence: userContext.confidence,
      timestamp: new Date().toISOString()
    });
    
    // Immediate rule updates for high-confidence corrections
    if (userContext.confidence === 'high') {
      await this.updateRuleWeights(humanCorrections);
    }
    
    // Trigger model retraining if we have enough new data
    const correctionCount = await this.trainingDataStore.getCorrectionCount();
    if (correctionCount % 100 === 0) {
      await this.triggerModelRetraining();
    }
  }

  private async updateRuleWeights(corrections: ClassificationCorrections): Promise<void> {
    // Adjust rule confidence based on human feedback
    for (const [field, correction] of Object.entries(corrections)) {
      const affectedRules = await this.findRulesAffecting(field);
      
      for (const rule of affectedRules) {
        if (correction.wasCorrect) {
          rule.weight = Math.min(rule.weight * 1.1, 1.0);
        } else {
          rule.weight = Math.max(rule.weight * 0.9, 0.1);
        }
      }
    }
  }
}
```

## 📊 Performance Metrics

### Classification Accuracy Tracking

```typescript
interface ClassificationMetrics {
  overall: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  
  byRole: {
    [K in ComponentRole]: {
      accuracy: number;
      precision: number;
      recall: number;
      truePositives: number;
      falsePositives: number;
      falseNegatives: number;
    };
  };
  
  byConfidenceLevel: {
    high: { accuracy: number; count: number };
    medium: { accuracy: number; count: number };
    low: { accuracy: number; count: number };
  };
  
  temporalTrends: {
    dailyAccuracy: Array<{ date: string; accuracy: number }>;
    improvementRate: number;
  };
}
```

### Real-time Performance Monitoring

```typescript
class PerformanceMonitor {
  private metrics = new Map<string, ClassificationMetrics>();

  async trackPrediction(
    prediction: ClassificationResult,
    actualLabel?: ComponentClassification,
    feedbackDelay?: number
  ): Promise<void> {
    // Immediate confidence tracking
    await this.confidenceTracker.record({
      predictedConfidence: prediction.confidence,
      actualCorrectness: actualLabel ? this.isCorrect(prediction, actualLabel) : null,
      timestamp: new Date()
    });
    
    // Update metrics when ground truth is available
    if (actualLabel) {
      await this.updateAccuracyMetrics(prediction, actualLabel);
    }
  }

  async getRealtimeMetrics(): Promise<ClassificationMetrics> {
    const recentPredictions = await this.getPredictionsInTimeWindow('24h');
    return this.calculateMetrics(recentPredictions);
  }
}
```

This classification system provides the intelligence layer that transforms raw design data into semantic understanding — the foundation that enables AI to reason about design intent rather than just visual properties.