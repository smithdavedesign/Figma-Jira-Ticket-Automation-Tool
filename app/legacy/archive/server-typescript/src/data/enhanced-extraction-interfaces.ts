/**
 * Enhanced Extraction Interfaces
 * 
 * Extended TypeScript interfaces and helper functions for advanced Figma extraction
 * with semantic intent inference, visual density metrics, and normalized design tokens.
 */

import type { 
  FigmaNodeMetadata, 
  DesignTokens, 
  Position, 
  Size,
  RGBA,
  ValidationResult,
  FigmaNodeType,
  SemanticRole
} from './types.js';

// =============================================================================
// SEMANTIC INTENT INFERENCE
// =============================================================================

/**
 * Enhanced semantic analysis result with confidence scoring
 */
export interface SemanticAnalysisResult {
  intent: ComponentIntent;
  confidence: number; // 0-1
  reasoning: string[];
  patterns: SemanticPattern[];
  relationships: SemanticRelationship[];
}

/**
 * Detected component intent with UI pattern recognition
 */
export interface ComponentIntent {
  primaryRole: IntentRole;
  secondaryRoles: IntentRole[];
  uiPattern: UIPattern;
  interactionType: InteractionType;
  contentType: ContentType;
  formRole?: FormRole;
  navigationRole?: NavigationRole;
}

export type IntentRole = 
  | 'input' | 'output' | 'control' | 'navigation' | 'content'
  | 'feedback' | 'decoration' | 'structure' | 'interaction';

export type UIPattern = 
  | 'button' | 'input-field' | 'dropdown' | 'modal' | 'card' | 'list'
  | 'table' | 'form' | 'navigation' | 'header' | 'footer' | 'sidebar'
  | 'hero' | 'gallery' | 'carousel' | 'accordion' | 'tabs' | 'breadcrumb'
  | 'pagination' | 'search' | 'filter' | 'timeline' | 'dashboard'
  | 'custom' | 'unknown';

export type InteractionType = 
  | 'clickable' | 'hoverable' | 'draggable' | 'scrollable' | 'focusable'
  | 'editable' | 'selectable' | 'expandable' | 'sortable' | 'static';

export type ContentType = 
  | 'text' | 'image' | 'video' | 'icon' | 'data' | 'chart'
  | 'form' | 'list' | 'table' | 'media' | 'mixed' | 'empty';

export type FormRole = 
  | 'form-container' | 'field-group' | 'input-field' | 'label'
  | 'validation' | 'submit' | 'reset' | 'cancel' | 'help-text';

export type NavigationRole = 
  | 'primary-nav' | 'secondary-nav' | 'breadcrumb' | 'pagination'
  | 'tab-nav' | 'step-nav' | 'quick-nav' | 'footer-nav';

/**
 * Semantic pattern detected in the design
 */
export interface SemanticPattern {
  type: PatternType;
  name: string;
  confidence: number;
  elements: string[]; // Node IDs that make up this pattern
  properties: Record<string, any>;
}

export type PatternType = 
  | 'form-pattern' | 'navigation-pattern' | 'content-pattern'
  | 'layout-pattern' | 'interaction-pattern' | 'data-pattern';

/**
 * Relationships between semantic elements
 */
export interface SemanticRelationship {
  type: RelationshipType;
  source: string; // Node ID
  target: string; // Node ID
  strength: number; // 0-1
  properties: Record<string, any>;
}

export type RelationshipType = 
  | 'parent-child' | 'sibling' | 'label-input' | 'trigger-target'
  | 'group-member' | 'sequence' | 'dependency' | 'reference';

// =============================================================================
// VISUAL DENSITY METRICS
// =============================================================================

/**
 * Visual density analysis for layout optimization
 */
export interface VisualDensityMetrics {
  overallDensity: DensityLevel;
  regionAnalysis: DensityRegion[];
  whitespaceRatio: number; // 0-1
  contentDistribution: ContentDistribution;
  visualHierarchy: HierarchyLevel[];
  flowMetrics: FlowMetrics;
}

export type DensityLevel = 'sparse' | 'balanced' | 'dense' | 'crowded';

/**
 * Regional density analysis
 */
export interface DensityRegion {
  id: string;
  bounds: BoundingRect;
  density: DensityLevel;
  elementCount: number;
  whiteSpacePercentage: number;
  dominantElementType: string;
  accessibility: AccessibilityMetrics;
}

/**
 * Content distribution across the design
 */
export interface ContentDistribution {
  quadrants: QuadrantAnalysis;
  verticalDistribution: DistributionMetrics;
  horizontalDistribution: DistributionMetrics;
  centerOfMass: Position;
  symmetryScore: number; // 0-1
}

export interface QuadrantAnalysis {
  topLeft: QuadrantMetrics;
  topRight: QuadrantMetrics;
  bottomLeft: QuadrantMetrics;
  bottomRight: QuadrantMetrics;
}

export interface QuadrantMetrics {
  elementCount: number;
  contentType: ContentType[];
  density: DensityLevel;
  importance: ImportanceLevel;
}

export type ImportanceLevel = 'primary' | 'secondary' | 'tertiary' | 'minimal';

export interface DistributionMetrics {
  alignment: AlignmentPattern;
  spacing: SpacingPattern;
  rhythm: RhythmMetrics;
}

export type AlignmentPattern = 'left' | 'center' | 'right' | 'justified' | 'varied';
export type SpacingPattern = 'uniform' | 'progressive' | 'random' | 'clustered';

export interface RhythmMetrics {
  consistency: number; // 0-1
  baseUnit: number;
  variations: number[];
}

/**
 * Visual hierarchy levels
 */
export interface HierarchyLevel {
  level: number; // 1-5, 1 being most important
  elements: string[]; // Node IDs
  visualWeight: number; // Calculated from size, color, position
  attentionScore: number; // Predicted attention capture
}

// =============================================================================
// FLOW RECONSTRUCTION
// =============================================================================

/**
 * Flow analysis for user journey reconstruction
 */
export interface FlowMetrics {
  readingFlow: ReadingFlow;
  interactionFlow: InteractionFlow;
  visualFlow: VisualFlow;
  navigationPaths: NavigationPath[];
  bottlenecks: FlowBottleneck[];
}

export interface ReadingFlow {
  pattern: ReadingPattern;
  startPoint: Position;
  endPoint: Position;
  keyPoints: FlowPoint[];
  naturalOrder: string[]; // Node IDs in reading order
  readingTime: number; // Estimated seconds
}

export type ReadingPattern = 'z-pattern' | 'f-pattern' | 'gutenberg' | 'layer-cake' | 'custom';

export interface FlowPoint {
  nodeId: string;
  position: Position;
  importance: ImportanceLevel;
  dwellTime: number; // Estimated viewing time
  transitionType: TransitionType;
}

export type TransitionType = 'smooth' | 'jump' | 'scan' | 'return' | 'end';

export interface InteractionFlow {
  primaryPath: InteractionPath;
  alternativePaths: InteractionPath[];
  completionRate: number; // 0-1 predicted
  cognitiveLoad: CognitiveLoadLevel;
}

export interface InteractionPath {
  steps: InteractionStep[];
  difficulty: DifficultyLevel;
  errorProneness: number; // 0-1
  efficiency: number; // 0-1
}

export interface InteractionStep {
  nodeId: string;
  action: ActionType;
  required: boolean;
  complexity: ComplexityLevel;
  helpNeeded: boolean;
}

export type ActionType = 
  | 'click' | 'tap' | 'swipe' | 'type' | 'select' | 'drag'
  | 'scroll' | 'hover' | 'focus' | 'wait' | 'read' | 'decide';

export type CognitiveLoadLevel = 'low' | 'moderate' | 'high' | 'overwhelming';
export type DifficultyLevel = 'trivial' | 'easy' | 'moderate' | 'hard' | 'expert';
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'very-complex';

export interface VisualFlow {
  primaryDirection: FlowDirection;
  secondaryDirections: FlowDirection[];
  momentum: FlowMomentum[];
  barriers: FlowBarrier[];
}

export type FlowDirection = 'top-down' | 'left-right' | 'right-left' | 'bottom-up' | 'radial' | 'scattered';

export interface FlowMomentum {
  direction: FlowDirection;
  strength: number; // 0-1
  nodes: string[]; // Contributing node IDs
}

export interface FlowBarrier {
  type: BarrierType;
  position: Position;
  severity: number; // 0-1
  cause: string;
}

export type BarrierType = 'visual' | 'cognitive' | 'interaction' | 'accessibility';

export interface NavigationPath {
  name: string;
  nodes: string[];
  pathType: PathType;
  efficiency: number; // 0-1
  userFriendliness: number; // 0-1
}

export type PathType = 'main' | 'alternate' | 'shortcut' | 'error-recovery';

export interface FlowBottleneck {
  nodeId: string;
  type: BottleneckType;
  severity: number; // 0-1
  impact: string;
  suggestions: string[];
}

export type BottleneckType = 'cognitive' | 'visual' | 'interaction' | 'technical';

// =============================================================================
// NORMALIZED DESIGN TOKENS
// =============================================================================

/**
 * Normalized design token schema for consistent output
 */
export interface NormalizedDesignTokens {
  meta: TokenMetadata;
  colors: NormalizedColorTokens;
  typography: NormalizedTypographyTokens;
  spacing: NormalizedSpacingTokens;
  borders: NormalizedBorderTokens;
  shadows: NormalizedShadowTokens;
  effects: NormalizedEffectTokens;
  layout: NormalizedLayoutTokens;
  animations: NormalizedAnimationTokens;
}

export interface TokenMetadata {
  version: string;
  extractedAt: string;
  sourceFile: string;
  totalTokens: number;
  categories: TokenCategory[];
  confidence: number; // 0-1
}

export interface TokenCategory {
  name: string;
  count: number;
  completeness: number; // 0-1
}

/**
 * Normalized color tokens with semantic mapping
 */
export interface NormalizedColorTokens {
  palette: ColorPalette;
  semantic: SemanticColors;
  system: SystemColors;
  custom: Record<string, ColorToken>;
}

export interface ColorPalette {
  primary: ColorScale;
  secondary?: ColorScale;
  accent?: ColorScale;
  neutral: ColorScale;
}

export interface ColorScale {
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500: string; // Base color
  600?: string;
  700?: string;
  800?: string;
  900?: string;
}

export interface SemanticColors {
  success: ColorToken;
  warning: ColorToken;
  error: ColorToken;
  info: ColorToken;
  background: ColorToken;
  surface: ColorToken;
  onBackground: ColorToken;
  onSurface: ColorToken;
}

export interface SystemColors {
  focus: ColorToken;
  disabled: ColorToken;
  placeholder: ColorToken;
  divider: ColorToken;
  overlay: ColorToken;
}

export interface ColorToken {
  value: string; // Hex, RGB, HSL, or CSS variable
  type: ColorFormat;
  usage: ColorUsage[];
  accessibility: ColorAccessibility;
  variations: ColorVariation[];
}

export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'css-var';

export interface ColorUsage {
  context: ColorContext;
  frequency: number; // How often it's used
  importance: ImportanceLevel;
}

export type ColorContext = 
  | 'background' | 'text' | 'border' | 'icon' | 'accent' | 'state' | 'surface';

export interface ColorAccessibility {
  contrastRatio: number;
  wcagLevel: 'AA' | 'AAA' | 'fail';
  colorBlindSafe: boolean;
}

export interface ColorVariation {
  name: string;
  value: string;
  relationship: VariationRelationship;
}

export type VariationRelationship = 'lighter' | 'darker' | 'saturated' | 'desaturated' | 'tinted' | 'shaded';

/**
 * Normalized typography tokens
 */
export interface NormalizedTypographyTokens {
  fontFamilies: FontFamilyToken[];
  typeScale: TypeScaleToken[];
  textStyles: TextStyleToken[];
  lineHeights: LineHeightToken[];
  letterSpacing: LetterSpacingToken[];
  fontWeights: FontWeightToken[];
}

export interface FontFamilyToken {
  name: string;
  value: string;
  fallbacks: string[];
  category: FontCategory;
  usage: TypographyUsage[];
}

export type FontCategory = 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';

export interface TypeScaleToken {
  name: string;
  size: number;
  unit: SizeUnit;
  scaleRatio?: number;
  usage: TypographyUsage[];
}

export type SizeUnit = 'px' | 'rem' | 'em' | 'pt' | '%' | 'vw' | 'vh';

export interface TextStyleToken {
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  lineHeight: number | string;
  letterSpacing: number | string;
  textTransform?: TextTransform;
  textDecoration?: TextDecoration;
  usage: TypographyUsage[];
}

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through';

export interface TypographyUsage {
  element: TypographyElement;
  frequency: number;
  importance: ImportanceLevel;
}

export type TypographyElement = 
  | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6'
  | 'body' | 'caption' | 'label' | 'button' | 'input' | 'code' | 'quote';

export interface LineHeightToken {
  name: string;
  value: number;
  unit: LineHeightUnit;
  usage: TypographyUsage[];
}

export type LineHeightUnit = 'unitless' | 'px' | 'rem' | 'em' | '%';

export interface LetterSpacingToken {
  name: string;
  value: number;
  unit: SpacingUnit;
  usage: TypographyUsage[];
}

export interface FontWeightToken {
  name: string;
  value: number | string;
  usage: TypographyUsage[];
}

/**
 * Normalized spacing tokens
 */
export interface NormalizedSpacingTokens {
  baseUnit: number;
  scale: SpacingScale;
  semantic: SemanticSpacing;
  layout: LayoutSpacing;
}

export interface SpacingScale {
  xs: SpacingToken;
  sm: SpacingToken;
  md: SpacingToken;
  lg: SpacingToken;
  xl: SpacingToken;
  xxl?: SpacingToken;
}

export interface SemanticSpacing {
  component: ComponentSpacing;
  content: ContentSpacing;
  layout: LayoutSpacing;
}

export interface ComponentSpacing {
  padding: SpacingToken;
  margin: SpacingToken;
  gap: SpacingToken;
}

export interface ContentSpacing {
  paragraph: SpacingToken;
  section: SpacingToken;
  element: SpacingToken;
}

export interface LayoutSpacing {
  container: SpacingToken;
  gutter: SpacingToken;
  column: SpacingToken;
}

export interface SpacingToken {
  value: number;
  unit: SpacingUnit;
  usage: SpacingUsage[];
}

export type SpacingUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh' | 'fr';

export interface SpacingUsage {
  context: SpacingContext;
  frequency: number;
  element: string;
}

export type SpacingContext = 
  | 'padding' | 'margin' | 'gap' | 'grid-gap' | 'flex-gap' | 'border-spacing';

/**
 * Normalized border tokens
 */
export interface NormalizedBorderTokens {
  widths: BorderWidthToken[];
  styles: BorderStyleToken[];
  colors: Record<string, ColorToken>;
  radius: BorderRadiusTokens;
}

export interface BorderWidthToken {
  name: string;
  value: number;
  unit: SizeUnit;
  usage: BorderUsage[];
}

export interface BorderStyleToken {
  name: string;
  value: BorderStyleValue;
  usage: BorderUsage[];
}

export type BorderStyleValue = 
  | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';

export interface BorderUsage {
  element: string;
  context: BorderContext;
  frequency: number;
}

export type BorderContext = 'outline' | 'focus' | 'separator' | 'container' | 'decorator';

export interface BorderRadiusTokens {
  none: BorderRadiusToken;
  sm: BorderRadiusToken;
  md: BorderRadiusToken;
  lg: BorderRadiusToken;
  xl: BorderRadiusToken;
  full: BorderRadiusToken;
}

export interface BorderRadiusToken {
  value: number | string;
  unit: SizeUnit;
  usage: BorderUsage[];
}

/**
 * Normalized shadow tokens
 */
export interface NormalizedShadowTokens {
  elevation: ElevationTokens;
  semantic: SemanticShadows;
  custom: Record<string, ShadowToken>;
}

export interface ElevationTokens {
  none: ShadowToken;
  sm: ShadowToken;
  md: ShadowToken;
  lg: ShadowToken;
  xl: ShadowToken;
  xxl: ShadowToken;
}

export interface SemanticShadows {
  focus: ShadowToken;
  error: ShadowToken;
  success: ShadowToken;
  overlay: ShadowToken;
}

export interface ShadowToken {
  value: string; // CSS box-shadow value
  layers: ShadowLayer[];
  usage: ShadowUsage[];
}

export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export interface ShadowUsage {
  element: string;
  context: ShadowContext;
  frequency: number;
}

export type ShadowContext = 'elevation' | 'focus' | 'hover' | 'active' | 'error' | 'decorator';

/**
 * Normalized effect tokens
 */
export interface NormalizedEffectTokens {
  blur: BlurToken[];
  filters: FilterToken[];
  transforms: TransformToken[];
  transitions: TransitionToken[];
}

export interface BlurToken {
  name: string;
  value: number;
  unit: SizeUnit;
  type: BlurType;
  usage: EffectUsage[];
}

export type BlurType = 'gaussian' | 'motion' | 'background';

export interface FilterToken {
  name: string;
  value: string; // CSS filter value
  usage: EffectUsage[];
}

export interface TransformToken {
  name: string;
  value: string; // CSS transform value
  usage: EffectUsage[];
}

export interface TransitionToken {
  name: string;
  property: string;
  duration: number;
  easing: string;
  delay: number;
  usage: EffectUsage[];
}

export interface EffectUsage {
  element: string;
  trigger: EffectTrigger;
  frequency: number;
}

export type EffectTrigger = 'hover' | 'focus' | 'active' | 'loading' | 'always' | 'scroll';

/**
 * Normalized layout tokens
 */
export interface NormalizedLayoutTokens {
  containers: ContainerToken[];
  grids: GridToken[];
  flexbox: FlexboxToken[];
  breakpoints: BreakpointToken[];
}

export interface ContainerToken {
  name: string;
  maxWidth: number;
  padding: number;
  usage: LayoutUsage[];
}

export interface GridToken {
  name: string;
  columns: number;
  gap: number;
  usage: LayoutUsage[];
}

export interface FlexboxToken {
  name: string;
  direction: FlexDirectionValue;
  wrap: FlexWrapValue;
  justify: JustifyContentValue;
  align: AlignItemsValue;
  usage: LayoutUsage[];
}

export type FlexDirectionValue = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrapValue = 'nowrap' | 'wrap' | 'wrap-reverse';
export type JustifyContentValue = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItemsValue = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';

export interface BreakpointToken {
  name: string;
  value: number;
  unit: SizeUnit;
  usage: LayoutUsage[];
}

export interface LayoutUsage {
  context: LayoutContext;
  frequency: number;
  importance: ImportanceLevel;
}

export type LayoutContext = 
  | 'page' | 'section' | 'component' | 'element' | 'responsive' | 'print';

/**
 * Normalized animation tokens
 */
export interface NormalizedAnimationTokens {
  durations: DurationToken[];
  easings: EasingToken[];
  keyframes: KeyframeToken[];
}

export interface DurationToken {
  name: string;
  value: number;
  unit: TimeUnit;
  usage: AnimationUsage[];
}

export type TimeUnit = 'ms' | 's';

export interface EasingToken {
  name: string;
  value: string; // CSS easing function
  usage: AnimationUsage[];
}

export interface KeyframeToken {
  name: string;
  keyframes: Record<string, Record<string, any>>;
  usage: AnimationUsage[];
}

export interface AnimationUsage {
  element: string;
  trigger: AnimationTrigger;
  purpose: AnimationPurpose;
  frequency: number;
}

export type AnimationTrigger = 'load' | 'hover' | 'focus' | 'click' | 'scroll' | 'resize';
export type AnimationPurpose = 'feedback' | 'transition' | 'decoration' | 'loading' | 'attention';

// =============================================================================
// PERFORMANCE OPTIMIZATION INTERFACES
// =============================================================================

/**
 * Performance optimization configuration for large frames
 */
export interface PerformanceOptimizationConfig {
  maxNodes: number;
  prioritization: NodePrioritization;
  streaming: StreamingConfig;
  caching: CachingStrategy;
  processing: ProcessingStrategy;
}

export interface NodePrioritization {
  strategy: PrioritizationStrategy;
  weights: PriorityWeights;
  thresholds: PriorityThresholds;
}

export type PrioritizationStrategy = 'importance' | 'visual-weight' | 'interaction' | 'hybrid';

export interface PriorityWeights {
  size: number; // 0-1
  position: number; // 0-1  
  visibility: number; // 0-1
  interaction: number; // 0-1
  semantic: number; // 0-1
}

export interface PriorityThresholds {
  critical: number; // 0-1
  important: number; // 0-1
  standard: number; // 0-1
  optional: number; // 0-1
}

export interface StreamingConfig {
  enabled: boolean;
  batchSize: number;
  delay: number; // ms between batches
  progressive: boolean;
}

export interface CachingStrategy {
  enabled: boolean;
  levels: CacheLevel[];
  ttl: Record<string, number>; // seconds
  invalidation: InvalidationStrategy;
}

export type CacheLevel = 'memory' | 'disk' | 'distributed';
export type InvalidationStrategy = 'time-based' | 'version-based' | 'manual';

export interface ProcessingStrategy {
  parallel: boolean;
  maxWorkers: number;
  timeout: number; // ms
  retries: number;
  fallback: FallbackStrategy;
}

export type FallbackStrategy = 'skip' | 'simplify' | 'cache' | 'error';

// =============================================================================
// PIPELINE INTEGRATION SCHEMAS
// =============================================================================

/**
 * Optimized output schema for AI model integration
 */
export interface AIModelIntegrationSchema {
  meta: IntegrationMetadata;
  context: ModelContext;
  data: ModelData;
  instructions: ModelInstructions;
}

export interface IntegrationMetadata {
  version: string;
  timestamp: string;
  source: string;
  extractionId: string;
  modelTargets: ModelTarget[];
}

export type ModelTarget = 'gemini' | 'gpt' | 'claude' | 'custom';

export interface ModelContext {
  project: ProjectContextData;
  design: DesignContextData;
  technical: TechnicalContextData;
  user: UserContextData;
}

export interface ProjectContextData {
  name: string;
  type: ProjectType;
  phase: ProjectPhase;
  requirements: string[];
  constraints: string[];
}

export type ProjectType = 'website' | 'webapp' | 'mobile' | 'desktop' | 'design-system';
export type ProjectPhase = 'discovery' | 'design' | 'development' | 'testing' | 'deployment';

export interface DesignContextData {
  style: DesignStyle;
  patterns: DesignPattern[];
  principles: DesignPrinciple[];
  tokens: NormalizedDesignTokens;
}

export type DesignStyle = 'minimal' | 'modern' | 'classic' | 'bold' | 'playful' | 'professional';

export interface DesignPattern {
  name: string;
  type: PatternType;
  usage: string[];
}

export interface DesignPrinciple {
  name: string;
  description: string;
  importance: ImportanceLevel;
}

export interface TechnicalContextData {
  framework: string;
  language: string;
  platform: string;
  tools: string[];
  standards: string[];
}

export interface UserContextData {
  persona: UserPersona[];
  journey: UserJourney[];
  needs: UserNeed[];
}

export interface UserPersona {
  name: string;
  role: string;
  goals: string[];
  painPoints: string[];
}

export interface UserJourney {
  phase: JourneyPhase;
  actions: string[];
  emotions: string[];
  touchpoints: string[];
}

export type JourneyPhase = 'awareness' | 'consideration' | 'decision' | 'onboarding' | 'usage' | 'support';

export interface UserNeed {
  category: NeedCategory;
  description: string;
  priority: ImportanceLevel;
}

export type NeedCategory = 'functional' | 'emotional' | 'social' | 'aspirational';

export interface ModelData {
  structure: StructuralData;
  visual: VisualData;
  interaction: InteractionData;
  content: ContentData;
}

export interface StructuralData {
  hierarchy: HierarchicalStructure;
  relationships: ElementRelationship[];
  patterns: StructuralPattern[];
}

export interface HierarchicalStructure {
  depth: number;
  branches: StructuralBranch[];
  leafNodes: string[];
}

export interface StructuralBranch {
  id: string;
  level: number;
  children: string[];
  type: BranchType;
}

export type BranchType = 'container' | 'component' | 'content' | 'decoration';

export interface ElementRelationship {
  source: string;
  target: string;
  type: RelationshipType;
  strength: number;
}

export interface StructuralPattern {
  name: string;
  elements: string[];
  rule: string;
}

export interface VisualData {
  density: VisualDensityMetrics;
  hierarchy: VisualHierarchy;
  flow: VisualFlowData;
  aesthetics: AestheticMetrics;
}

export interface VisualHierarchy {
  levels: HierarchyLevel[];
  primaryPath: string[];
  secondaryPaths: string[][];
}

export interface VisualFlowData {
  direction: FlowDirection;
  momentum: FlowMomentum[];
  breaks: FlowBreak[];
}

export interface FlowBreak {
  position: Position;
  severity: number;
  cause: string;
}

export interface AestheticMetrics {
  balance: number; // 0-1
  contrast: number; // 0-1
  harmony: number; // 0-1
  rhythm: number; // 0-1
  unity: number; // 0-1
}

export interface InteractionData {
  patterns: InteractionPattern[];
  flows: InteractionFlow[];
  affordances: Affordance[];
}

export interface InteractionPattern {
  name: string;
  type: InteractionPatternType;
  elements: string[];
  behavior: BehaviorDescription;
}

export type InteractionPatternType = 
  | 'click' | 'hover' | 'drag' | 'swipe' | 'scroll' | 'type' | 'select';

export interface BehaviorDescription {
  trigger: string;
  response: string;
  feedback: string;
  timing: TimingDescription;
}

export interface TimingDescription {
  delay: number;
  duration: number;
  easing: string;
}

export interface Affordance {
  element: string;
  action: string;
  clarity: number; // 0-1
  discoverability: number; // 0-1
}

export interface ContentData {
  types: ContentTypeAnalysis[];
  structure: ContentStructure;
  semantics: ContentSemantics;
}

export interface ContentTypeAnalysis {
  type: ContentType;
  count: number;
  distribution: number; // 0-1
  importance: ImportanceLevel;
}

export interface ContentStructure {
  sections: ContentSection[];
  relationships: ContentRelationship[];
}

export interface ContentSection {
  id: string;
  type: SectionType;
  elements: string[];
  purpose: string;
}

export type SectionType = 'header' | 'hero' | 'content' | 'sidebar' | 'footer' | 'navigation';

export interface ContentRelationship {
  source: string;
  target: string;
  type: ContentRelationshipType;
}

export type ContentRelationshipType = 'supports' | 'elaborates' | 'contrasts' | 'summarizes' | 'references';

export interface ContentSemantics {
  topics: Topic[];
  sentiment: SentimentAnalysis;
  readability: ReadabilityMetrics;
}

export interface Topic {
  name: string;
  weight: number; // 0-1
  elements: string[];
}

export interface SentimentAnalysis {
  overall: SentimentScore;
  byElement: Record<string, SentimentScore>;
}

export type SentimentScore = 'positive' | 'neutral' | 'negative' | 'mixed';

export interface ReadabilityMetrics {
  level: ReadabilityLevel;
  score: number; // 0-100
  issues: ReadabilityIssue[];
}

export type ReadabilityLevel = 'elementary' | 'middle' | 'high' | 'college' | 'graduate';

export interface ReadabilityIssue {
  type: IssueType;
  severity: number; // 0-1
  description: string;
  suggestions: string[];
}

export type IssueType = 'complexity' | 'length' | 'vocabulary' | 'structure' | 'clarity';

export interface ModelInstructions {
  objectives: string[];
  constraints: string[];
  preferences: string[];
  examples: InstructionExample[];
}

export interface InstructionExample {
  input: string;
  output: string;
  reasoning: string;
}

// =============================================================================
// UTILITY TYPES AND HELPERS
// =============================================================================

export interface BoundingRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AccessibilityMetrics {
  score: number; // 0-100
  issues: AccessibilityIssue[];
  recommendations: string[];
}

export interface AccessibilityIssue {
  type: AccessibilityIssueType;
  severity: IssueSeverity;
  element: string;
  description: string;
  wcagReference: string;
}

export type AccessibilityIssueType = 
  | 'color-contrast' | 'keyboard-navigation' | 'aria-labels' | 'focus-management'
  | 'semantic-structure' | 'alternative-text' | 'form-labels';

export type IssueSeverity = 'critical' | 'major' | 'minor' | 'suggestion';

/**
 * Helper functions for safe property access
 */
export interface SafeAccessHelpers {
  getNodeProperty<T>(node: any, path: string, defaultValue: T): T;
  hasNodeType(node: any, types: FigmaNodeType[]): boolean;
  extractColorSafely(paint: any): string | null;
  calculateBoundingSafely(node: any): BoundingRect | null;
  inferSemanticRoleSafely(node: any): SemanticRole;
}

/**
 * Validation helpers for extracted data
 */
export interface ExtractedDataValidator {
  validateSemanticAnalysis(analysis: SemanticAnalysisResult): ValidationResult;
  validateDensityMetrics(metrics: VisualDensityMetrics): ValidationResult;
  validateDesignTokens(tokens: NormalizedDesignTokens): ValidationResult;
  validatePerformanceConfig(config: PerformanceOptimizationConfig): ValidationResult;
}