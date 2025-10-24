export interface FigmaNodeMetadata {
    id: string;
    name: string;
    type: FigmaNodeType;
    visible: boolean;
    locked: boolean;
    absoluteBoundingBox: BoundingBox;
    relativeTransform: Transform;
    constraints: LayoutConstraints;
    fills?: Paint[];
    strokes?: Paint[];
    strokeWeight?: number;
    strokeAlign?: StrokeAlign;
    cornerRadius?: number;
    effects?: Effect[];
    blendMode?: BlendMode;
    opacity?: number;
    preserveRatio?: boolean;
    layoutAlign?: LayoutAlign;
    layoutGrow?: number;
    layoutSizingHorizontal?: LayoutSizing;
    layoutSizingVertical?: LayoutSizing;
    exportSettings?: ExportSetting[];
    children?: FigmaNodeMetadata[];
    hierarchy?: NodeHierarchy;
    componentProperties?: ComponentInstanceProps;
    designSystemLinks?: DesignSystemLinks;
    exportScreenshots?: ExportScreenshot[];
    mcpMetadata?: MCPNodeMetadata;
}
export interface NodeHierarchy {
    layers: LayerInfo[];
    totalDepth?: number;
    componentCount?: number;
    textLayerCount?: number;
}
export interface LayerInfo {
    id: string;
    name: string;
    type: FigmaNodeType;
    description?: string;
    position: Position;
    size: Size;
    components?: string[];
    tokens?: LayerTokens;
    children?: LayerInfo[];
}
export interface ComponentInstanceProps {
    masterComponentId?: string;
    componentSetId?: string;
    props?: Record<string, any>;
    overrides?: ComponentOverride[];
    variantProperties?: Record<string, string>;
}
export interface ComponentOverride {
    nodeId: string;
    propertyName: string;
    value: any;
    type: 'TEXT' | 'FILL' | 'STROKE' | 'EFFECT' | 'VISIBILITY';
}
export interface DesignSystemLinks {
    buttons?: string;
    typography?: string;
    colors?: string;
    spacing?: string;
    components?: string;
    icons?: string;
    effects?: string;
    styles?: Record<string, string>;
}
export interface ExportScreenshot {
    nodeId: string;
    url: string;
    format?: 'PNG' | 'JPG' | 'SVG' | 'PDF';
    scale?: number;
    resolution?: 'low' | 'medium' | 'high';
    timestamp?: string;
}
export interface LayerTokens {
    colors?: string[];
    spacing?: string | number | Record<string, number>;
    typography?: string;
    borders?: string;
    shadows?: string;
    effects?: string[];
}
export interface Position {
    x: number;
    y: number;
    z?: number;
}
export interface Size {
    width: number;
    height: number;
    depth?: number;
}
export interface MCPNodeMetadata {
    extractedAt: string;
    componentType?: ComponentType;
    designTokens?: DesignTokens;
    semanticRole?: SemanticRole;
    interactionStates?: InteractionState[];
    accessibilityInfo?: AccessibilityInfo;
    codeGeneration?: CodeGenerationHints;
    projectContext?: ProjectContext;
    userContext?: UserContext;
    technicalContext?: TechnicalContext;
}
export type FigmaNodeType = 'DOCUMENT' | 'CANVAS' | 'FRAME' | 'GROUP' | 'VECTOR' | 'BOOLEAN_OPERATION' | 'STAR' | 'LINE' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'RECTANGLE' | 'TEXT' | 'SLICE' | 'COMPONENT' | 'COMPONENT_SET' | 'INSTANCE' | 'STICKY' | 'SHAPE_WITH_TEXT' | 'CONNECTOR' | 'WIDGET' | 'EMBED' | 'LINK_UNFURL' | 'MEDIA';
export type ComponentType = 'atom' | 'molecule' | 'organism' | 'template' | 'page' | 'button' | 'input' | 'card' | 'modal' | 'navigation' | 'layout' | 'typography' | 'icon' | 'image' | 'form' | 'list' | 'table' | 'chart' | 'custom';
export type SemanticRole = 'button' | 'link' | 'heading' | 'text' | 'image' | 'navigation' | 'main' | 'aside' | 'footer' | 'header' | 'section' | 'article' | 'list' | 'listitem' | 'table' | 'row' | 'cell' | 'form' | 'input' | 'label' | 'dialog' | 'alert' | 'status' | 'presentation';
export interface DesignTokens {
    colors?: ColorTokens;
    typography?: TypographyTokens;
    spacing?: SpacingTokens;
    borders?: BorderTokens;
    shadows?: ShadowTokens;
    effects?: EffectTokens;
    layout?: LayoutTokens;
}
export interface ColorTokens {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutral?: string[];
    semantic?: {
        success?: string;
        warning?: string;
        error?: string;
        info?: string;
    };
    custom?: Record<string, string>;
}
export interface TypographyTokens {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    lineHeight?: number | string;
    letterSpacing?: number | string;
    textAlign?: TextAlign;
    textDecoration?: TextDecoration;
    textCase?: TextCase;
}
export interface SpacingTokens {
    padding?: SpacingValue;
    margin?: SpacingValue;
    gap?: number;
    gridTemplateColumns?: string;
    gridTemplateRows?: string;
}
export interface BorderTokens {
    width?: number;
    style?: BorderStyle;
    color?: string;
    radius?: number | BorderRadius;
}
export interface ShadowTokens {
    boxShadow?: string;
    dropShadow?: DropShadowEffect;
    innerShadow?: InnerShadowEffect;
}
export interface EffectTokens {
    blur?: BlurEffect;
    backgroundBlur?: BackgroundBlurEffect;
    layerBlur?: LayerBlurEffect;
}
export interface LayoutTokens {
    display?: LayoutType;
    flexDirection?: FlexDirection;
    alignItems?: AlignItems;
    justifyContent?: JustifyContent;
    flexWrap?: FlexWrap;
    gap?: number;
    gridTemplate?: GridTemplate;
}
export interface CodeGenerationHints {
    framework?: Framework;
    componentName?: string;
    propsInterface?: string;
    stateManagement?: StateManagement;
    styling?: StylingApproach;
    testingStrategy?: TestingStrategy;
    accessibilityCompliance?: AccessibilityCompliance;
    performanceOptimizations?: PerformanceOptimization[];
}
export type Framework = 'react' | 'vue' | 'angular' | 'svelte' | 'solid' | 'next' | 'nuxt' | 'gatsby' | 'astro' | 'remix';
export type StateManagement = 'useState' | 'useReducer' | 'zustand' | 'redux' | 'mobx' | 'recoil' | 'jotai' | 'valtio' | 'context';
export type StylingApproach = 'css' | 'scss' | 'less' | 'styled-components' | 'emotion' | 'tailwind' | 'chakra' | 'mui' | 'mantine' | 'css-modules' | 'vanilla-extract';
export type TestingStrategy = 'jest' | 'vitest' | 'cypress' | 'playwright' | 'testing-library' | 'enzyme' | 'storybook';
export interface AssetMetadata {
    id: string;
    name: string;
    type: AssetType;
    format: AssetFormat;
    url?: string;
    localPath?: string;
    size?: AssetSize;
    optimizations?: AssetOptimization[];
    usage?: AssetUsage[];
    metadata?: Record<string, any>;
}
export type AssetType = 'image' | 'icon' | 'font' | 'video' | 'audio' | 'svg' | 'component' | 'style' | 'data';
export type AssetFormat = 'png' | 'jpg' | 'jpeg' | 'svg' | 'webp' | 'gif' | 'woff' | 'woff2' | 'ttf' | 'otf' | 'eot' | 'mp4' | 'webm' | 'mp3' | 'wav' | 'json' | 'css';
export interface AssetSize {
    width?: number;
    height?: number;
    fileSize?: number;
}
export interface AssetOptimization {
    type: OptimizationType;
    applied: boolean;
    savings?: number;
    quality?: number;
}
export type OptimizationType = 'compression' | 'resize' | 'format-conversion' | 'lazy-loading' | 'responsive-images' | 'sprite-generation';
export interface AssetUsage {
    nodeId: string;
    context: UsageContext;
    importance: UsageImportance;
}
export type UsageContext = 'background' | 'icon' | 'illustration' | 'logo' | 'avatar' | 'thumbnail' | 'hero' | 'decoration';
export type UsageImportance = 'critical' | 'important' | 'optional';
export interface InteractionState {
    name: InteractionStateName;
    trigger: InteractionTrigger;
    properties: StateProperties;
    animation?: AnimationProperties;
}
export type InteractionStateName = 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'error' | 'success' | 'selected' | 'expanded';
export type InteractionTrigger = 'mouse-enter' | 'mouse-leave' | 'click' | 'key-press' | 'focus' | 'blur' | 'scroll' | 'resize' | 'timer';
export interface StateProperties {
    opacity?: number;
    backgroundColor?: string;
    borderColor?: string;
    transform?: string;
    boxShadow?: string;
    custom?: Record<string, any>;
}
export interface AnimationProperties {
    duration?: number;
    easing?: EasingFunction;
    delay?: number;
    iterations?: number;
    direction?: AnimationDirection;
}
export interface AccessibilityInfo {
    ariaLabel?: string;
    ariaRole?: string;
    ariaDescription?: string;
    tabIndex?: number;
    focusable?: boolean;
    keyboardNavigation?: KeyboardNavigation;
    screenReaderInfo?: ScreenReaderInfo;
    colorContrast?: ColorContrastInfo;
    compliance?: AccessibilityCompliance;
}
export interface KeyboardNavigation {
    supported: boolean;
    keys?: KeyBinding[];
    tabOrder?: number;
}
export interface KeyBinding {
    key: string;
    action: string;
    modifiers?: KeyModifier[];
}
export type KeyModifier = 'ctrl' | 'alt' | 'shift' | 'meta';
export interface ScreenReaderInfo {
    description?: string;
    announcement?: string;
    landmarks?: string[];
}
export interface ColorContrastInfo {
    ratio: number;
    wcagLevel: WCAGLevel;
    passes: boolean;
    foreground: string;
    background: string;
}
export type WCAGLevel = 'AA' | 'AAA';
export type AccessibilityCompliance = 'full' | 'partial' | 'none' | 'unknown';
export interface PerformanceOptimization {
    type: OptimizationCategory;
    impact: PerformanceImpact;
    implementation: OptimizationImplementation;
    metrics?: PerformanceMetrics;
}
export type OptimizationCategory = 'lazy-loading' | 'code-splitting' | 'image-optimization' | 'caching' | 'compression' | 'bundling' | 'tree-shaking' | 'prefetching' | 'service-worker' | 'critical-css';
export type PerformanceImpact = 'high' | 'medium' | 'low';
export interface OptimizationImplementation {
    strategy: string;
    tools?: string[];
    configuration?: Record<string, any>;
    code?: string;
}
export interface PerformanceMetrics {
    timing: Record<string, number>;
    memory: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    throughput: number;
    cacheHitRate: number;
    errorRate: number;
    apiCallCount: number;
    lastUpdated: number;
    loadTime?: number;
    bundleSize?: number;
    renderTime?: number;
    interactionDelay?: number;
    memoryUsage?: number;
}
export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface Transform {
    0: [number, number, number];
    1: [number, number, number];
}
export interface LayoutConstraints {
    vertical: ConstraintType;
    horizontal: ConstraintType;
}
export type ConstraintType = 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
export interface Paint {
    type: PaintType;
    visible?: boolean;
    opacity?: number;
    color?: RGBA;
    blendMode?: BlendMode;
    gradientHandlePositions?: Vector[];
    gradientStops?: ColorStop[];
    scaleMode?: ScaleMode;
    imageTransform?: Transform;
    scalingFactor?: number;
    rotation?: number;
    imageRef?: string;
    filters?: ImageFilters;
    gifRef?: string;
    boundVariables?: BoundVariables;
}
export type PaintType = 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI' | 'VIDEO';
export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface Vector {
    x: number;
    y: number;
}
export interface ColorStop {
    position: number;
    color: RGBA;
}
export type ScaleMode = 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
export type BlendMode = 'NORMAL' | 'MULTIPLY' | 'SCREEN' | 'OVERLAY' | string;
export type StrokeAlign = 'INSIDE' | 'OUTSIDE' | 'CENTER';
export interface Effect {
    type: EffectType;
    visible?: boolean;
    radius?: number;
    color?: RGBA;
    blendMode?: BlendMode;
    offset?: Vector;
    spread?: number;
    showShadowBehindNode?: boolean;
    boundVariables?: BoundVariables;
}
export type EffectType = 'INNER_SHADOW' | 'DROP_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
export interface DropShadowEffect extends Effect {
    type: 'DROP_SHADOW';
    offset: Vector;
    spread?: number;
    showShadowBehindNode?: boolean;
}
export interface InnerShadowEffect extends Effect {
    type: 'INNER_SHADOW';
    offset: Vector;
    spread?: number;
}
export interface BlurEffect extends Effect {
    type: 'LAYER_BLUR';
}
export interface BackgroundBlurEffect extends Effect {
    type: 'BACKGROUND_BLUR';
}
export interface LayerBlurEffect extends Effect {
    type: 'LAYER_BLUR';
}
export interface ExportSetting {
    suffix: string;
    format: ExportFormat;
    constraint: ExportConstraint;
}
export type ExportFormat = 'JPG' | 'PNG' | 'SVG' | 'PDF';
export interface ExportConstraint {
    type: ConstraintType;
    value: number;
}
export type LayoutAlign = 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'INHERIT';
export type LayoutSizing = 'FIXED' | 'HUG' | 'FILL';
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    metadata?: ValidationMetadata;
}
export interface ValidationError {
    code: string;
    message: string;
    path?: string;
    severity: ErrorSeverity;
    suggestions?: string[];
}
export interface ValidationWarning {
    code: string;
    message: string;
    path?: string;
    impact: WarningImpact;
}
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';
export type WarningImpact = 'high' | 'medium' | 'low' | 'info';
export interface ValidationMetadata {
    validatedAt: string;
    validatorVersion: string;
    validationDuration: number;
    totalChecks: number;
    passedChecks: number;
}
export type SpacingValue = number | {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};
export type BorderRadius = number | {
    topLeft?: number;
    topRight?: number;
    bottomRight?: number;
    bottomLeft?: number;
};
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through';
export type TextCase = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
export type LayoutType = 'block' | 'inline' | 'flex' | 'grid' | 'inline-block' | 'inline-flex' | 'inline-grid';
export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type AlignItems = 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export interface GridTemplate {
    columns?: string;
    rows?: string;
    areas?: string;
}
export interface ImageFilters {
    exposure?: number;
    contrast?: number;
    saturation?: number;
    temperature?: number;
    tint?: number;
    highlights?: number;
    shadows?: number;
}
export interface BoundVariables {
    [key: string]: VariableAlias;
}
export interface VariableAlias {
    type: 'VARIABLE_ALIAS';
    id: string;
}
export interface ExtractionResult {
    metadata: FigmaNodeMetadata[];
    assets: AssetMetadata[];
    designTokens: DesignTokens;
    codeGeneration: CodeGenerationHints[];
    validation: ValidationResult;
    performance: PerformanceMetrics;
    extractedAt: string;
    version: string;
}
export interface ProjectContext {
    projectId?: string;
    projectName?: string;
    figmaFileId?: string;
    figmaFileName?: string;
    branch?: string;
    version?: string;
    team?: string;
}
export interface UserContext {
    userId?: string;
    userName?: string;
    userRole?: string;
    preferences?: Record<string, any>;
    customTokens?: Record<string, any>;
}
export interface TechnicalContext {
    framework?: string;
    language?: string;
    platform?: string;
    designSystem?: string;
    libraries?: string[];
    customRules?: Record<string, any>;
}
export interface ComponentInstance {
    id: string;
    name: string;
    masterComponentId: string;
    masterComponentName?: string;
    props: Record<string, any>;
    overrides: ComponentOverride[];
    variantProperties: Record<string, string>;
    parentFrameId?: string;
    parentFrameName?: string;
}
export interface HierarchicalData {
    totalNodes: number;
    maxDepth: number;
    layers: LayerInfo[];
    componentReferences: string[];
    tokenUsage: Record<string, any>;
}
export interface DesignSystem {
    id: string;
    name: string;
    pages: any[];
    colors: any[];
    typography: any[];
    components: any;
    spacing: any[];
    effects: any[];
    detectionConfidence: number;
}
export interface EnhancedDesignSystem extends DesignSystem {
    hierarchy: HierarchicalData;
    componentInstances: ComponentInstance[];
    designSystemLinks: DesignSystemLinks;
    exportCapabilities: {
        screenshots: boolean;
        assets: boolean;
        tokens: boolean;
    };
}
//# sourceMappingURL=types.d.ts.map