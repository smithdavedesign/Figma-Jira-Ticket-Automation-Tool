/**
 * Core Data Extraction Interfaces for MCP Data Layer
 * 
 * This module defines the interfaces for extracting metadata, code, and assets
 * from Figma designs, forming the foundation of the MCP data processing pipeline.
 */

import type {
  FigmaNodeMetadata,
  AssetMetadata,
  DesignTokens,
  CodeGenerationHints,
  ValidationResult,
  PerformanceMetrics,
  ExtractionResult,
  ValidationError as ValidationErrorType
} from './types.js';

// =============================================================================
// CORE EXTRACTOR INTERFACES
// =============================================================================

/**
 * Main interface for Figma data extraction
 */
export interface FigmaExtractor {
  /**
   * Extract complete data from a Figma file or specific nodes
   */
  extract(params: ExtractionParams): Promise<ExtractionResult>;
  
  /**
   * Extract only metadata from specified nodes
   */
  extractMetadata(nodeIds: string[], options?: MetadataOptions): Promise<FigmaNodeMetadata[]>;
  
  /**
   * Extract design tokens from the design system
   */
  extractDesignTokens(fileKey: string, options?: TokenExtractionOptions): Promise<DesignTokens>;
  
  /**
   * Extract assets (images, icons, etc.) from the design
   */
  extractAssets(nodeIds: string[], options?: AssetExtractionOptions): Promise<AssetMetadata[]>;
  
  /**
   * Generate code hints based on design analysis
   */
  generateCodeHints(metadata: FigmaNodeMetadata[], options?: CodeGenerationOptions): Promise<CodeGenerationHints[]>;
  
  /**
   * Validate extracted data for completeness and accuracy
   */
  validateExtraction(result: ExtractionResult): Promise<ValidationResult>;
  
  /**
   * Get performance metrics for the extraction process
   */
  getPerformanceMetrics(): PerformanceMetrics;
}

/**
 * Parameters for data extraction
 */
export interface ExtractionParams {
  /** Figma file key or URL */
  source: string;
  
  /** Specific node IDs to extract (if empty, extracts entire file) */
  nodeIds?: string[];
  
  /** What types of data to extract */
  dataTypes: ExtractionDataType[];
  
  /** Extraction configuration options */
  options?: ExtractionOptions;
  
  /** Context information for better extraction */
  context?: ExtractionContext;
}

export type ExtractionDataType = 
  | 'metadata' | 'assets' | 'design-tokens' | 'code-hints' 
  | 'interactions' | 'accessibility' | 'performance';

/**
 * Configuration options for extraction
 */
export interface ExtractionOptions {
  /** Include child nodes in extraction */
  includeChildren?: boolean;
  
  /** Maximum depth for child node extraction */
  maxDepth?: number;
  
  /** Include hidden/invisible nodes */
  includeHidden?: boolean;
  
  /** Optimization level for performance */
  optimizationLevel?: OptimizationLevel;
  
  /** Validation level for data quality */
  validationLevel?: ValidationLevel;
  
  /** Caching strategy */
  caching?: CachingStrategy;
  
  /** Asset processing options */
  assetProcessing?: AssetProcessingOptions;
  
  /** Code generation preferences */
  codeGeneration?: CodeGenerationPreferences;
  
  // Enhanced options for hierarchy support
  /** Include export screenshots */
  includeScreenshots?: boolean;
  
  /** Include hierarchy information */
  includeHierarchy?: boolean;
  
  /** Include component instance data */
  includeComponentInstances?: boolean;
  
  /** Include design system links */
  includeDesignSystemLinks?: boolean;
  
  /** Metadata extraction options */
  metadata?: MetadataOptions;
  
  /** Token extraction options */
  tokens?: TokenExtractionOptions;
  
  /** Asset extraction options */
  assets?: AssetExtractionOptions;
  
  /** Context options */
  projectContext?: import('./types.js').ProjectContext;
  userContext?: import('./types.js').UserContext;
  technicalContext?: import('./types.js').TechnicalContext;
}

export type OptimizationLevel = 'none' | 'basic' | 'standard' | 'aggressive';
export type ValidationLevel = 'none' | 'basic' | 'standard' | 'strict';
export type CachingStrategy = 'none' | 'memory' | 'disk' | 'hybrid';

/**
 * Context information to improve extraction quality
 */
export interface ExtractionContext {
  /** Project or design system name */
  projectName?: string;
  
  /** Target framework for code generation */
  targetFramework?: string;
  
  /** Design system version or theme */
  designSystem?: string;
  
  /** User preferences and settings */
  userPreferences?: UserPreferences;
  
  /** Previous extraction results for comparison */
  previousExtraction?: ExtractionResult;
  
  /** Custom metadata */
  customMetadata?: Record<string, any>;
}

export interface UserPreferences {
  /** Preferred naming conventions */
  namingConvention?: NamingConvention;
  
  /** Component organization preferences */
  componentStructure?: ComponentStructure;
  
  /** Code style preferences */
  codeStyle?: CodeStylePreferences;
  
  /** Accessibility requirements */
  accessibilityLevel?: AccessibilityLevel;
}

export type NamingConvention = 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case';
export type ComponentStructure = 'atomic' | 'feature-based' | 'page-based' | 'custom';
export type AccessibilityLevel = 'basic' | 'enhanced' | 'enterprise';

// =============================================================================
// SPECIALIZED EXTRACTOR INTERFACES
// =============================================================================

/**
 * Interface for metadata extraction
 */
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

/**
 * Interface for design token extraction
 */
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

/**
 * Interface for asset extraction
 */
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

/**
 * Interface for code generation
 */
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

export type CodeOptimizationType = 
  | 'tree-shaking' | 'code-splitting' | 'minification'
  | 'dead-code-elimination' | 'bundle-analysis' | 'lazy-loading';

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

// =============================================================================
// VALIDATION AND QUALITY INTERFACES
// =============================================================================

/**
 * Interface for data validation
 */
export interface DataValidator {
  validateMetadata(metadata: FigmaNodeMetadata[]): Promise<ValidationResult>;
  validateAssets(assets: AssetMetadata[]): Promise<ValidationResult>;
  validateDesignTokens(tokens: DesignTokens): Promise<ValidationResult>;
  validateCodeGeneration(code: GeneratedCode[]): Promise<ValidationResult>;
  validateComplete(result: ExtractionResult): Promise<ValidationResult>;
}

/**
 * Interface for performance monitoring
 */
export interface PerformanceMonitor {
  startTimer(operationName: string): string;
  endTimer(timerId: string): number;
  recordMetric(name: string, value: number, unit?: string): void;
  getMetrics(): PerformanceMetrics;
  reset(): void;
}

/**
 * Interface for caching extracted data
 */
export interface DataCache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  size(): Promise<number>;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Base class for extraction errors
 */
export class ExtractionError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Error thrown when Figma API access fails
 */
export class FigmaApiError extends ExtractionError {
  constructor(message: string, public statusCode: number, context?: Record<string, any>) {
    super(message, 'FIGMA_API_ERROR', context);
    this.name = 'FigmaApiError';
  }
}

/**
 * Error thrown when data validation fails
 */
export class DataValidationError extends ExtractionError {
  constructor(message: string, public errors: ValidationErrorType[], context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'DataValidationError';
  }
}

/**
 * Error thrown when code generation fails
 */
export class CodeGenerationError extends ExtractionError {
  constructor(message: string, public generationContext: CodeGenerationOptions, context?: Record<string, any>) {
    super(message, 'CODE_GENERATION_ERROR', context);
    this.name = 'CodeGenerationError';
  }
}