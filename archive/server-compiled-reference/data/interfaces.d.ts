import type { FigmaNodeMetadata, AssetMetadata, DesignTokens, CodeGenerationHints, ValidationResult, PerformanceMetrics, ExtractionResult, ValidationError as ValidationErrorType } from './types.js';
export interface FigmaExtractor {
    extract(params: ExtractionParams): Promise<ExtractionResult>;
    extractMetadata(nodeIds: string[], options?: MetadataOptions): Promise<FigmaNodeMetadata[]>;
    extractDesignTokens(fileKey: string, options?: TokenExtractionOptions): Promise<DesignTokens>;
    extractAssets(nodeIds: string[], options?: AssetExtractionOptions): Promise<AssetMetadata[]>;
    generateCodeHints(metadata: FigmaNodeMetadata[], options?: CodeGenerationOptions): Promise<CodeGenerationHints[]>;
    validateExtraction(result: ExtractionResult): Promise<ValidationResult>;
    getPerformanceMetrics(): PerformanceMetrics;
}
export interface ExtractionParams {
    source: string;
    nodeIds?: string[];
    dataTypes: ExtractionDataType[];
    options?: ExtractionOptions;
    context?: ExtractionContext;
}
export type ExtractionDataType = 'metadata' | 'assets' | 'design-tokens' | 'code-hints' | 'interactions' | 'accessibility' | 'performance';
export interface ExtractionOptions {
    includeChildren?: boolean;
    maxDepth?: number;
    includeHidden?: boolean;
    optimizationLevel?: OptimizationLevel;
    validationLevel?: ValidationLevel;
    caching?: CachingStrategy;
    assetProcessing?: AssetProcessingOptions;
    codeGeneration?: CodeGenerationPreferences;
    includeScreenshots?: boolean;
    includeHierarchy?: boolean;
    includeComponentInstances?: boolean;
    includeDesignSystemLinks?: boolean;
    metadata?: MetadataOptions;
    tokens?: TokenExtractionOptions;
    assets?: AssetExtractionOptions;
    projectContext?: import('./types.js').ProjectContext;
    userContext?: import('./types.js').UserContext;
    technicalContext?: import('./types.js').TechnicalContext;
}
export type OptimizationLevel = 'none' | 'basic' | 'standard' | 'aggressive';
export type ValidationLevel = 'none' | 'basic' | 'standard' | 'strict';
export type CachingStrategy = 'none' | 'memory' | 'disk' | 'hybrid';
export interface ExtractionContext {
    projectName?: string;
    targetFramework?: string;
    designSystem?: string;
    userPreferences?: UserPreferences;
    previousExtraction?: ExtractionResult;
    customMetadata?: Record<string, any>;
}
export interface UserPreferences {
    namingConvention?: NamingConvention;
    componentStructure?: ComponentStructure;
    codeStyle?: CodeStylePreferences;
    accessibilityLevel?: AccessibilityLevel;
}
export type NamingConvention = 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case';
export type ComponentStructure = 'atomic' | 'feature-based' | 'page-based' | 'custom';
export type AccessibilityLevel = 'basic' | 'enhanced' | 'enterprise';
export interface MetadataExtractor {
    extractNodeMetadata(nodeId: string, options?: MetadataOptions): Promise<FigmaNodeMetadata>;
    extractBulkMetadata(nodeIds: string[], options?: MetadataOptions): Promise<FigmaNodeMetadata[]>;
    enrichMetadata(metadata: FigmaNodeMetadata, context?: EnrichmentContext): Promise<FigmaNodeMetadata>;
}
export interface MetadataOptions {
    includeChildren?: boolean;
    includeStyles?: boolean;
    includeEffects?: boolean;
    includeConstraints?: boolean;
    includeExportSettings?: boolean;
    customFields?: string[];
}
export interface EnrichmentContext {
    designSystem?: DesignTokens;
    componentLibrary?: ComponentLibraryInfo;
    semanticAnalysis?: boolean;
    performanceAnalysis?: boolean;
}
export interface ComponentLibraryInfo {
    name: string;
    version: string;
    components: ComponentDefinition[];
}
export interface ComponentDefinition {
    name: string;
    category: string;
    props: PropDefinition[];
    variants: VariantDefinition[];
}
export interface PropDefinition {
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
    description?: string;
}
export interface VariantDefinition {
    name: string;
    values: string[];
    defaultValue: string;
}
export interface DesignTokenExtractor {
    extractColorTokens(fileKey: string): Promise<TokenSet<ColorToken>>;
    extractTypographyTokens(fileKey: string): Promise<TokenSet<TypographyToken>>;
    extractSpacingTokens(fileKey: string): Promise<TokenSet<SpacingToken>>;
    extractEffectTokens(fileKey: string): Promise<TokenSet<EffectToken>>;
    extractAllTokens(fileKey: string, options?: TokenExtractionOptions): Promise<DesignTokens>;
    validateTokens(tokens: DesignTokens): Promise<TokenValidationResult>;
}
export interface TokenExtractionOptions {
    includePrivateTokens?: boolean;
    tokenNamingConvention?: TokenNamingConvention;
    outputFormat?: TokenOutputFormat;
    groupingStrategy?: TokenGroupingStrategy;
    fallbackValues?: boolean;
}
export type TokenNamingConvention = 'figma' | 'css-custom-properties' | 'design-tokens' | 'tailwind';
export type TokenOutputFormat = 'json' | 'css' | 'scss' | 'js' | 'ts';
export type TokenGroupingStrategy = 'type' | 'component' | 'theme' | 'semantic';
export interface TokenSet<T> {
    tokens: T[];
    metadata: TokenSetMetadata;
}
export interface TokenSetMetadata {
    extractedAt: string;
    totalCount: number;
    categories: string[];
    version?: string;
}
export interface ColorToken {
    name: string;
    value: string;
    category?: string;
    usage?: string[];
    accessibility?: ColorAccessibilityInfo;
}
export interface TypographyToken {
    name: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing?: number;
    usage?: string[];
}
export interface SpacingToken {
    name: string;
    value: number;
    unit: SpacingUnit;
    usage?: string[];
}
export interface EffectToken {
    name: string;
    type: string;
    properties: Record<string, any>;
    usage?: string[];
}
export type SpacingUnit = 'px' | 'rem' | 'em' | '%' | 'vh' | 'vw';
export interface ColorAccessibilityInfo {
    contrastRatios?: Record<string, number>;
    wcagCompliance?: Record<string, boolean>;
    colorBlindnessInfo?: ColorBlindnessInfo;
}
export interface ColorBlindnessInfo {
    protanopia: string;
    deuteranopia: string;
    tritanopia: string;
    achromatopsia: string;
}
export interface TokenValidationResult {
    valid: boolean;
    errors: TokenValidationError[];
    warnings: TokenValidationWarning[];
    metrics: TokenMetrics;
}
export interface TokenValidationError {
    tokenName: string;
    errorType: TokenErrorType;
    message: string;
    suggestion?: string;
}
export interface TokenValidationWarning {
    tokenName: string;
    warningType: TokenWarningType;
    message: string;
    impact: string;
}
export type TokenErrorType = 'missing' | 'invalid-value' | 'naming-violation' | 'circular-reference';
export type TokenWarningType = 'unused' | 'deprecated' | 'inconsistent' | 'accessibility-concern';
export interface TokenMetrics {
    totalTokens: number;
    tokensByType: Record<string, number>;
    unusedTokens: number;
    inconsistentTokens: number;
    accessibilityIssues: number;
}
export interface AssetExtractor {
    extractImages(nodeIds: string[], options?: ImageExtractionOptions): Promise<AssetMetadata[]>;
    extractIcons(nodeIds: string[], options?: IconExtractionOptions): Promise<AssetMetadata[]>;
    extractFonts(fileKey: string): Promise<AssetMetadata[]>;
    extractAllAssets(params: AssetExtractionParams): Promise<AssetMetadata[]>;
    optimizeAssets(assets: AssetMetadata[], options?: AssetOptimizationOptions): Promise<AssetMetadata[]>;
}
export interface AssetExtractionParams {
    nodeIds: string[];
    assetTypes: AssetType[];
    options?: AssetExtractionOptions;
}
export type AssetType = 'image' | 'icon' | 'vector' | 'font' | 'video' | 'audio';
export interface AssetExtractionOptions {
    formats?: string[];
    resolutions?: Resolution[];
    quality?: number;
    compression?: CompressionSettings;
    naming?: AssetNamingOptions;
}
export interface ImageExtractionOptions extends AssetExtractionOptions {
    includeBackgrounds?: boolean;
    separateShapes?: boolean;
    vectorizeImages?: boolean;
}
export interface IconExtractionOptions extends AssetExtractionOptions {
    standardizeSizes?: boolean;
    generateSpriteSheet?: boolean;
    optimizeForWeb?: boolean;
}
export interface Resolution {
    scale: number;
    suffix?: string;
}
export interface CompressionSettings {
    algorithm?: CompressionAlgorithm;
    quality?: number;
    progressive?: boolean;
    optimize?: boolean;
}
export type CompressionAlgorithm = 'auto' | 'lossless' | 'lossy' | 'hybrid';
export interface AssetNamingOptions {
    convention?: NamingConvention;
    prefix?: string;
    suffix?: string;
    includeNodeName?: boolean;
    sanitize?: boolean;
}
export interface AssetOptimizationOptions {
    enableCompression?: boolean;
    enableResizing?: boolean;
    enableFormatConversion?: boolean;
    targetFormats?: string[];
    qualityThreshold?: number;
    sizeThreshold?: number;
}
export interface AssetProcessingOptions {
    downloadAssets?: boolean;
    optimizeAssets?: boolean;
    generateResponsiveVariants?: boolean;
    createAssetManifest?: boolean;
    assetBaseUrl?: string;
    outputDirectory?: string;
}
export interface CodeGenerator {
    generateComponent(metadata: FigmaNodeMetadata, options?: CodeGenerationOptions): Promise<GeneratedCode>;
    generateComponentSet(metadata: FigmaNodeMetadata[], options?: CodeGenerationOptions): Promise<GeneratedCodeSet>;
    generateStyleSheet(designTokens: DesignTokens, options?: StyleGenerationOptions): Promise<GeneratedStyles>;
    generateTypes(metadata: FigmaNodeMetadata[], options?: TypeGenerationOptions): Promise<GeneratedTypes>;
}
export interface CodeGenerationOptions {
    framework?: string;
    language?: string;
    styleApproach?: string;
    componentStructure?: string;
    includeTests?: boolean;
    includeStories?: boolean;
    includeDocumentation?: boolean;
    optimizations?: CodeOptimization[];
}
export interface CodeGenerationPreferences {
    framework?: string;
    language?: ProgrammingLanguage;
    styleFramework?: StyleFramework;
    testingFramework?: TestingFramework;
    bundler?: string;
    packageManager?: PackageManager;
}
export type ProgrammingLanguage = 'typescript' | 'javascript' | 'dart' | 'kotlin' | 'swift';
export type StyleFramework = 'css' | 'scss' | 'styled-components' | 'tailwind' | 'emotion';
export type TestingFramework = 'jest' | 'vitest' | 'cypress' | 'playwright' | 'testing-library';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
export interface GeneratedCode {
    component: string;
    styles?: string;
    types?: string;
    tests?: string;
    stories?: string;
    documentation?: string;
    metadata: CodeMetadata;
}
export interface GeneratedCodeSet {
    components: GeneratedCode[];
    sharedStyles?: string;
    sharedTypes?: string;
    index?: string;
    manifest: CodeSetManifest;
}
export interface GeneratedStyles {
    css?: string;
    scss?: string;
    variables?: string;
    tokens?: string;
    manifest: StyleManifest;
}
export interface GeneratedTypes {
    interfaces: string;
    types: string;
    enums?: string;
    manifest: TypeManifest;
}
export interface CodeMetadata {
    generatedAt: string;
    sourceNodeId: string;
    framework: string;
    language: string;
    dependencies: string[];
    optimizations: string[];
}
export interface CodeSetManifest {
    totalComponents: number;
    framework: string;
    dependencies: string[];
    structure: ComponentStructureInfo;
}
export interface StyleManifest {
    totalStyles: number;
    tokensUsed: number;
    framework: string;
    optimization: StyleOptimizationInfo;
}
export interface TypeManifest {
    totalTypes: number;
    interfaces: number;
    enums: number;
    language: string;
}
export interface ComponentStructureInfo {
    atomic: string[];
    molecular: string[];
    organisms: string[];
    templates: string[];
    pages: string[];
}
export interface StyleOptimizationInfo {
    minified: boolean;
    purged: boolean;
    compressed: boolean;
    bundleSize: number;
}
export interface StyleGenerationOptions {
    format?: StyleFormat;
    includeVariables?: boolean;
    includeUtilities?: boolean;
    minify?: boolean;
    autoprefixer?: boolean;
}
export type StyleFormat = 'css' | 'scss' | 'less' | 'stylus';
export interface TypeGenerationOptions {
    language?: ProgrammingLanguage;
    includeDocumentation?: boolean;
    strictMode?: boolean;
    exportStrategy?: ExportStrategy;
}
export type ExportStrategy = 'named' | 'default' | 'namespace' | 'mixed';
export interface CodeOptimization {
    type: CodeOptimizationType;
    enabled: boolean;
    options?: Record<string, any>;
}
export type CodeOptimizationType = 'tree-shaking' | 'code-splitting' | 'minification' | 'dead-code-elimination' | 'bundle-analysis' | 'lazy-loading';
export interface CodeStylePreferences {
    indentation?: IndentationType;
    semicolons?: boolean;
    quotes?: QuoteType;
    trailingCommas?: boolean;
    bracketSpacing?: boolean;
    lineLength?: number;
}
export type IndentationType = 'spaces' | 'tabs';
export type QuoteType = 'single' | 'double';
export interface DataValidator {
    validateMetadata(metadata: FigmaNodeMetadata[]): Promise<ValidationResult>;
    validateAssets(assets: AssetMetadata[]): Promise<ValidationResult>;
    validateDesignTokens(tokens: DesignTokens): Promise<ValidationResult>;
    validateCodeGeneration(code: GeneratedCode[]): Promise<ValidationResult>;
    validateComplete(result: ExtractionResult): Promise<ValidationResult>;
}
export interface PerformanceMonitor {
    startTimer(operationName: string): string;
    endTimer(timerId: string): number;
    recordMetric(name: string, value: number, unit?: string): void;
    getMetrics(): PerformanceMetrics;
    reset(): void;
}
export interface DataCache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    size(): Promise<number>;
}
export declare class ExtractionError extends Error {
    code: string;
    context?: Record<string, any> | undefined;
    constructor(message: string, code: string, context?: Record<string, any> | undefined);
}
export declare class FigmaApiError extends ExtractionError {
    statusCode: number;
    constructor(message: string, statusCode: number, context?: Record<string, any>);
}
export declare class DataValidationError extends ExtractionError {
    errors: ValidationErrorType[];
    constructor(message: string, errors: ValidationErrorType[], context?: Record<string, any>);
}
export declare class CodeGenerationError extends ExtractionError {
    generationContext: CodeGenerationOptions;
    constructor(message: string, generationContext: CodeGenerationOptions, context?: Record<string, any>);
}
//# sourceMappingURL=interfaces.d.ts.map