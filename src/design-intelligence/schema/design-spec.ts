/**
 * 🎯 Design Intelligence Schema v1.0
 * 
 * Universal standard for design intelligence data that enables
 * specialized AI models to understand and process design intent.
 * 
 * This schema serves as the foundational interchange format between:
 * - Figma data extraction
 * - Multi-AI orchestration 
 * - Framework-specific adapters
 */

export interface DesignSpec {
  /** Schema metadata and versioning */
  metadata: DesignSpecMetadata;
  
  /** Normalized design tokens from the design system */
  designTokens: DesignTokens;
  
  /** Component hierarchy and semantic structure */
  components: DesignComponent[];
  
  /** Design system compliance and analysis */
  designSystem: DesignSystemAnalysis;
  
  /** Responsive design and layout constraints */
  responsive: ResponsiveDesignData;
  
  /** Accessibility and semantic information */
  accessibility: AccessibilityData;
  
  /** Context and intent analysis */
  context: DesignContext;
}

// =============================================================================
// METADATA & VERSIONING
// =============================================================================

export interface DesignSpecMetadata {
  /** Schema version for compatibility and migration */
  version: string;
  
  /** Unique identifier for this design specification */
  specId: string;
  
  /** Figma file information */
  figmaFile: {
    fileId: string;
    fileName: string;
    pageId: string;
    pageName: string;
    nodeIds: string[];
  };
  
  /** Extraction metadata */
  extraction: {
    timestamp: string;
    extractedBy: string; // "figma-mcp" | "figma-api" | etc
    processingTime: number;
    confidence: number; // 0-1 confidence in extraction quality
  };
  
  /** Processing context */
  context: {
    userSelection: boolean;
    selectionType: 'frame' | 'component' | 'instance' | 'mixed';
    elementCount: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
}

// =============================================================================
// DESIGN TOKENS
// =============================================================================

export interface DesignTokens {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  effects: EffectToken[];
  borders: BorderToken[];
  radii: RadiusToken[];
}

export interface ColorToken {
  id: string;
  name: string;
  value: string; // hex, rgb, hsl
  rgba: { r: number; g: number; b: number; a: number };
  usage: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic';
  semantic?: 'success' | 'warning' | 'error' | 'info';
  scope: 'global' | 'component' | 'local';
  references: string[]; // Where this token is used
}

export interface TypographyToken {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  usage: 'heading' | 'body' | 'caption' | 'label' | 'display';
  level?: number; // h1, h2, etc for headings
  scope: 'global' | 'component' | 'local';
  references: string[];
}

export interface SpacingToken {
  id: string;
  name: string;
  value: number;
  unit: 'px' | 'rem' | 'em' | '%';
  usage: 'margin' | 'padding' | 'gap' | 'inset';
  scale: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  references: string[];
}

export interface EffectToken {
  id: string;
  name: string;
  type: 'drop-shadow' | 'inner-shadow' | 'blur' | 'background-blur';
  values: {
    x?: number;
    y?: number;
    blur: number;
    spread?: number;
    color?: string;
  };
  usage: 'elevation' | 'focus' | 'hover' | 'disabled' | 'decorative';
  level?: number; // elevation level
  references: string[];
}

export interface BorderToken {
  id: string;
  name: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  side?: 'top' | 'right' | 'bottom' | 'left' | 'all';
  usage: 'container' | 'input' | 'divider' | 'focus';
  references: string[];
}

export interface RadiusToken {
  id: string;
  name: string;
  value: number;
  unit: 'px' | 'rem' | '%';
  corners?: {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
  };
  usage: 'button' | 'card' | 'input' | 'image' | 'container';
  references: string[];
}

// =============================================================================
// DESIGN COMPONENTS
// =============================================================================

export interface DesignComponent {
  /** Unique identifier */
  id: string;
  
  /** Component metadata */
  name: string;
  type: ComponentType;
  category: ComponentCategory;
  
  /** Semantic classification */
  semantic: {
    intent: ComponentIntent;
    role: AccessibilityRole;
    pattern: DesignPattern;
    confidence: number; // AI confidence in classification
  };
  
  /** Visual properties */
  visual: {
    dimensions: { width: number; height: number };
    position: { x: number; y: number };
    constraints: LayoutConstraints;
    fills: Fill[];
    strokes: Stroke[];
    effects: Effect[];
    cornerRadius?: number;
  };
  
  /** Content and text */
  content: {
    text?: TextContent[];
    images?: ImageContent[];
    icons?: IconContent[];
  };
  
  /** Component hierarchy */
  hierarchy: {
    parent?: string;
    children: string[];
    level: number;
    isRoot: boolean;
  };
  
  /** Component relationships */
  relationships: {
    variants?: ComponentVariant[];
    instances?: string[]; // Instance IDs
    masterComponent?: string;
    designSystem?: string; // Design system component ID
  };
  
  /** Framework mapping hints */
  framework: {
    suggestedTag: string; // 'button', 'div', 'section', etc
    attributes: Record<string, any>;
    events: string[]; // 'onClick', 'onSubmit', etc
    states: ComponentState[];
  };
}

export type ComponentType = 
  | 'frame' | 'group' | 'component' | 'instance' 
  | 'text' | 'rectangle' | 'ellipse' | 'polygon' 
  | 'star' | 'vector' | 'image' | 'slice';

export type ComponentCategory = 
  | 'layout' | 'navigation' | 'form' | 'display' 
  | 'feedback' | 'overlay' | 'media' | 'typography'
  | 'interactive' | 'decorative';

export type ComponentIntent = 
  | 'button' | 'input' | 'card' | 'modal' | 'navigation'
  | 'header' | 'footer' | 'sidebar' | 'content' | 'hero'
  | 'form' | 'list' | 'grid' | 'table' | 'chart'
  | 'avatar' | 'badge' | 'tooltip' | 'accordion'
  | 'tabs' | 'carousel' | 'dropdown' | 'unknown';

export type DesignPattern = 
  | 'container' | 'flexbox' | 'grid' | 'stack'
  | 'cluster' | 'sidebar' | 'switcher' | 'cover'
  | 'pancake' | 'holy-grail' | 'card-layout'
  | 'list-detail' | 'modal-overlay' | 'custom';

export type AccessibilityRole = 
  | 'button' | 'link' | 'textbox' | 'combobox' | 'listbox'
  | 'menu' | 'menuitem' | 'tab' | 'tabpanel' | 'dialog'
  | 'alert' | 'status' | 'region' | 'navigation' | 'main'
  | 'complementary' | 'banner' | 'contentinfo' | 'article'
  | 'section' | 'heading' | 'list' | 'listitem' | 'none';

export interface ComponentVariant {
  id: string;
  name: string;
  properties: Record<string, string>;
  isDefault: boolean;
}

export interface ComponentState {
  name: string; // 'default', 'hover', 'active', 'disabled', 'focus'
  properties: Record<string, any>;
  triggers: string[]; // 'onHover', 'onFocus', etc
}

export interface LayoutConstraints {
  horizontal: 'left' | 'right' | 'center' | 'left-right' | 'scale';
  vertical: 'top' | 'bottom' | 'center' | 'top-bottom' | 'scale';
}

export interface Fill {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  opacity: number;
  gradient?: GradientData;
  imageRef?: string;
}

export interface Stroke {
  color: string;
  width: number;
  opacity: number;
  position: 'inside' | 'outside' | 'center';
}

export interface Effect {
  type: 'drop-shadow' | 'inner-shadow' | 'blur' | 'background-blur';
  color?: string;
  opacity: number;
  offset: { x: number; y: number };
  radius: number;
  spread?: number;
}

export interface GradientData {
  type: 'linear' | 'radial' | 'angular';
  stops: Array<{
    position: number;
    color: string;
    opacity: number;
  }>;
  angle?: number;
  centerX?: number;
  centerY?: number;
}

export interface TextContent {
  id: string;
  text: string;
  style: TypographyToken;
  fills: Fill[];
  alignment: 'left' | 'center' | 'right' | 'justify';
  verticalAlignment: 'top' | 'center' | 'bottom';
  semantic: {
    role: 'heading' | 'body' | 'label' | 'caption' | 'code';
    level?: number;
    isInteractive: boolean;
  };
}

export interface ImageContent {
  id: string;
  src?: string; // URL or base64
  alt?: string;
  dimensions: { width: number; height: number };
  format?: 'png' | 'jpg' | 'svg' | 'webp';
  semantic: {
    role: 'decorative' | 'informative' | 'functional';
    description?: string;
  };
}

export interface IconContent {
  id: string;
  name?: string;
  src?: string;
  type: 'vector' | 'font' | 'image';
  semantic: {
    category: 'action' | 'status' | 'navigation' | 'social' | 'media' | 'device';
    meaning?: string;
    isDecorative: boolean;
  };
}

// =============================================================================
// DESIGN SYSTEM ANALYSIS
// =============================================================================

export interface DesignSystemAnalysis {
  /** Detected design system information */
  detected: {
    system: 'material' | 'apple-hig' | 'fluent' | 'ant-design' | 'bootstrap' | 'tailwind' | 'custom' | 'none';
    confidence: number;
    version?: string;
    evidence: string[]; // Evidence that led to this classification
  };
  
  /** Compliance analysis */
  compliance: {
    overall: number; // 0-1 overall compliance score
    categories: {
      colors: ComplianceCategory;
      typography: ComplianceCategory;
      spacing: ComplianceCategory;
      components: ComplianceCategory;
    };
    violations: DesignViolation[];
    recommendations: DesignRecommendation[];
  };
  
  /** Design system tokens found */
  systemTokens: {
    colors: number;
    typography: number;
    spacing: number;
    components: number;
    coverage: number; // % of design using system tokens
  };
}

export interface ComplianceCategory {
  score: number; // 0-1 compliance score
  passed: number;
  total: number;
  issues: string[];
}

export interface DesignViolation {
  id: string;
  type: 'color' | 'typography' | 'spacing' | 'component' | 'accessibility';
  severity: 'error' | 'warning' | 'info';
  message: string;
  component: string; // Component ID where violation occurs
  suggestion: string;
  autoFixable: boolean;
}

export interface DesignRecommendation {
  id: string;
  category: 'consistency' | 'accessibility' | 'performance' | 'maintainability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

// =============================================================================
// RESPONSIVE DESIGN
// =============================================================================

export interface ResponsiveDesignData {
  /** Detected breakpoints */
  breakpoints: Breakpoint[];
  
  /** Adaptive layouts */
  layouts: AdaptiveLayout[];
  
  /** Flexbox and grid data */
  flexible: {
    flexbox: FlexboxData[];
    grid: GridData[];
    responsive: ResponsiveConstraint[];
  };
  
  /** Mobile-first indicators */
  mobileFriendly: {
    isMobileFriendly: boolean;
    issues: string[];
    recommendations: string[];
  };
}

export interface Breakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  usage: 'mobile' | 'tablet' | 'desktop' | 'wide';
}

export interface AdaptiveLayout {
  componentId: string;
  breakpoint: string;
  changes: {
    dimensions?: { width: number; height: number };
    position?: { x: number; y: number };
    visibility?: boolean;
    properties?: Record<string, any>;
  };
}

export interface FlexboxData {
  componentId: string;
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap: boolean;
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  gap?: number;
  children: Array<{
    id: string;
    flex?: number;
    order?: number;
    alignSelf?: string;
  }>;
}

export interface GridData {
  componentId: string;
  columns: number;
  rows: number;
  columnGap?: number;
  rowGap?: number;
  areas?: string[][];
  children: Array<{
    id: string;
    column?: { start: number; end: number };
    row?: { start: number; end: number };
    area?: string;
  }>;
}

export interface ResponsiveConstraint {
  componentId: string;
  constraint: LayoutConstraints;
  breakpoints: string[];
}

// =============================================================================
// ACCESSIBILITY
// =============================================================================

export interface AccessibilityData {
  /** Overall accessibility compliance */
  compliance: {
    wcag: 'AA' | 'AAA' | 'partial' | 'none';
    score: number; // 0-1 accessibility score
    automated: boolean; // true if automated analysis only
  };
  
  /** Semantic structure */
  semantics: {
    headingStructure: HeadingStructure[];
    landmarks: LandmarkRegion[];
    navigation: NavigationStructure[];
    forms: FormStructure[];
  };
  
  /** Color and contrast */
  colorAccessibility: {
    contrastIssues: ContrastIssue[];
    colorDependency: boolean; // Information conveyed by color alone
    colorBlindnessIssues: string[];
  };
  
  /** Interactive elements */
  interaction: {
    focusable: FocusableElement[];
    keyboardNavigation: boolean;
    touchTargets: TouchTargetData[];
  };
  
  /** Content accessibility */
  content: {
    altTexts: AltTextData[];
    textScaling: boolean; // Text can scale to 200%
    readingOrder: string[]; // Component IDs in reading order
  };
  
  /** Violations and recommendations */
  issues: AccessibilityIssue[];
  recommendations: AccessibilityRecommendation[];
}

export interface HeadingStructure {
  componentId: string;
  level: number; // 1-6
  text: string;
  parent?: string;
  children: string[];
}

export interface LandmarkRegion {
  componentId: string;
  role: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' | 'region';
  label?: string;
}

export interface NavigationStructure {
  componentId: string;
  type: 'primary' | 'secondary' | 'breadcrumb' | 'pagination' | 'tab';
  items: NavigationItem[];
}

export interface NavigationItem {
  componentId: string;
  text: string;
  url?: string;
  isCurrent: boolean;
  children?: NavigationItem[];
}

export interface FormStructure {
  componentId: string;
  inputs: FormInput[];
  validation: FormValidation[];
  submission: {
    method: string;
    action?: string;
    validation: boolean;
  };
}

export interface FormInput {
  componentId: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label?: string;
  placeholder?: string;
  required: boolean;
  validation?: string[];
}

export interface FormValidation {
  inputId: string;
  rules: string[];
  errorMessage?: string;
}

export interface ContrastIssue {
  componentId: string;
  textColor: string;
  backgroundColor: string;
  ratio: number;
  required: number;
  level: 'AA' | 'AAA';
  passes: boolean;
}

export interface FocusableElement {
  componentId: string;
  focusable: boolean;
  tabIndex?: number;
  focusIndicator: boolean;
  keyboardAccessible: boolean;
}

export interface TouchTargetData {
  componentId: string;
  size: { width: number; height: number };
  meetsMinimum: boolean; // 44px minimum
  spacing: number;
  adequate: boolean;
}

export interface AltTextData {
  componentId: string;
  hasAltText: boolean;
  altText?: string;
  isDecorative: boolean;
  quality: 'good' | 'fair' | 'poor' | 'missing';
}

export interface AccessibilityIssue {
  id: string;
  componentId: string;
  type: 'color-contrast' | 'alt-text' | 'heading-structure' | 'keyboard-navigation' | 'focus-indicator' | 'semantic-markup';
  severity: 'error' | 'warning';
  wcagCriterion: string; // e.g., "1.4.3"
  message: string;
  suggestion: string;
}

export interface AccessibilityRecommendation {
  id: string;
  category: 'semantic' | 'color' | 'interaction' | 'content';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

// =============================================================================
// DESIGN CONTEXT
// =============================================================================

export interface DesignContext {
  /** Intent and purpose */
  intent: {
    purpose: string; // What this design is meant to accomplish
    userStory?: string; // User story or use case
    businessGoal?: string; // Business objective
    context: 'web' | 'mobile' | 'desktop' | 'multi-platform';
  };
  
  /** Technical context */
  technical: {
    framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
    platform?: 'web' | 'react-native' | 'flutter' | 'native';
    constraints?: string[]; // Technical constraints or requirements
    integrations?: string[]; // APIs or services to integrate
  };
  
  /** Design decisions */
  decisions: {
    rationale: DesignDecision[];
    assumptions: string[];
    constraints: string[];
    tradeoffs: string[];
  };
  
  /** Quality metrics */
  quality: {
    completeness: number; // 0-1 how complete the design is
    consistency: number; // 0-1 internal consistency
    clarity: number; // 0-1 how clear the design intent is
    complexity: number; // 0-1 complexity score
    confidence: number; // 0-1 overall confidence in analysis
  };
}

export interface DesignDecision {
  aspect: string; // What aspect of design this decision affects
  decision: string; // The decision made
  rationale: string; // Why this decision was made
  alternatives?: string[]; // Alternative approaches considered
  impact: string; // Impact of this decision
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Version information for schema evolution */
export interface SchemaVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

/** Processing statistics */
export interface ProcessingStats {
  startTime: string;
  endTime: string;
  duration: number; // milliseconds
  elementsProcessed: number;
  tokensExtracted: number;
  componentsAnalyzed: number;
  memoryUsage?: number; // bytes
}

/** Error and warning information */
export interface ProcessingIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  component?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestion?: string;
}

// =============================================================================
// SCHEMA VALIDATION
// =============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: {
    validator: string;
    version: string;
    timestamp: string;
  };
}

export interface ValidationError {
  path: string; // JSON path where error occurred
  message: string;
  expected: string;
  actual: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion: string;
  code: string;
}

// =============================================================================
// EXPORTS
// =============================================================================

// All interfaces are already exported with their declarations above

// Schema version constant
export const DESIGN_SPEC_VERSION = '1.0.0';