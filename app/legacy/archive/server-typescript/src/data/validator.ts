/**
 * Data Validation Implementation for MCP Data Layer
 * 
 * Comprehensive validation layer ensuring data integrity, completeness,
 * and accuracy of extracted Figma metadata, assets, and design tokens.
 */

import type { 
  DataValidator, 
  ValidationLevel,
  GeneratedCode
} from './interfaces.js';

import type {
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  ExtractionResult,
  FigmaNodeMetadata,
  AssetMetadata,
  DesignTokens
} from './types.js';

/**
 * Custom validation error class
 */
export class MCPValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'MCPValidationError';
  }
}

/**
 * Main validation implementation
 */
export class MCPDataValidator implements DataValidator {
  private validationLevel: ValidationLevel;

  constructor(validationLevel: ValidationLevel = 'standard') {
    this.validationLevel = validationLevel;
  }

  /**
   * Validate complete extraction result
   */
  async validateComplete(result: ExtractionResult): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Core structure validation
      if (this.validationLevel !== 'none') {
        this.validateExtractionStructure(result, errors);
      }

      // Metadata validation
      if (result.metadata.length > 0) {
        const metadataResult = await this.validateMetadata(result.metadata);
        errors.push(...metadataResult.errors);
        warnings.push(...metadataResult.warnings);
      }

      // Asset validation
      if (result.assets.length > 0) {
        const assetResult = await this.validateAssets(result.assets);
        errors.push(...assetResult.errors);
        warnings.push(...assetResult.warnings);
      }

      // Design tokens validation
      if (Object.keys(result.designTokens).length > 0) {
        const tokenResult = await this.validateDesignTokens(result.designTokens);
        errors.push(...tokenResult.errors);
        warnings.push(...tokenResult.warnings);
      }

      // Code generation validation
      if (result.codeGeneration.length > 0) {
        const codeResult = await this.validateCodeGeneration(result.codeGeneration);
        errors.push(...codeResult.errors);
        warnings.push(...codeResult.warnings);
      }

      // Performance validation
      if (this.validationLevel === 'strict') {
        this.validatePerformance(result, warnings);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      errors.push({
        code: 'VALIDATION_FATAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        severity: 'critical',
        path: 'validation'
      });

      return {
        valid: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Validate individual metadata entries
   */
  async validateMetadata(metadata: FigmaNodeMetadata[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (let i = 0; i < metadata.length; i++) {
      const node = metadata[i];
      if (!node) continue;
      
      const fieldPrefix = `metadata[${i}]`;

      // Required fields validation
      this.validateRequiredField(node.id, `${fieldPrefix}.id`, 'Node ID is required', errors);
      this.validateRequiredField(node.name, `${fieldPrefix}.name`, 'Node name is required', errors);
      this.validateRequiredField(node.type, `${fieldPrefix}.type`, 'Node type is required', errors);

      // Type-specific validation
      if (node.type) {
        this.validateNodeType(node, fieldPrefix, warnings);
      }

      // Bounding box validation
      if (node.absoluteBoundingBox) {
        this.validateBoundingBox(node.absoluteBoundingBox, `${fieldPrefix}.absoluteBoundingBox`, errors);
      }

      // MCP metadata validation
      if (node.mcpMetadata) {
        this.validateMCPMetadata(node.mcpMetadata, `${fieldPrefix}.mcpMetadata`, errors, warnings);
      }

      // Consistency checks
      if (this.validationLevel === 'strict') {
        this.validateNodeConsistency(node, fieldPrefix, warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate asset metadata
   */
  async validateAssets(assets: AssetMetadata[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (!asset) continue;
      
      const fieldPrefix = `assets[${i}]`;

      // Required fields
      this.validateRequiredField(asset.id, `${fieldPrefix}.id`, 'Asset ID is required', errors);
      this.validateRequiredField(asset.name, `${fieldPrefix}.name`, 'Asset name is required', errors);
      this.validateRequiredField(asset.type, `${fieldPrefix}.type`, 'Asset type is required', errors);

      // URL validation
      if (asset.url && !this.isValidUrl(asset.url)) {
        errors.push({
          code: 'INVALID_ASSET_URL',
          message: 'Asset URL is not valid',
          severity: 'high',
          path: `${fieldPrefix}.url`
        });
      }

      // Size validation - check if it's a number (since AssetSize might be a union type)
      if (asset.size !== undefined && typeof asset.size === 'number' && asset.size < 0) {
        errors.push({
          code: 'INVALID_ASSET_SIZE',
          message: 'Asset size cannot be negative',
          severity: 'high',
          path: `${fieldPrefix}.size`
        });
      }

      // Format validation
      if (asset.format && !this.isValidAssetFormat(asset.format)) {
        warnings.push({
          code: 'UNUSUAL_ASSET_FORMAT',
          message: `Unusual asset format: ${asset.format}`,
          path: `${fieldPrefix}.format`,
          impact: 'medium'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate design tokens
   */
  async validateDesignTokens(tokens: DesignTokens): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Color tokens validation
    if (tokens.colors) {
      this.validateColorTokens(tokens.colors, 'designTokens.colors', errors, warnings);
    }

    // Typography tokens validation
    if (tokens.typography) {
      this.validateTypographyTokens(tokens.typography, 'designTokens.typography', errors, warnings);
    }

    // Spacing tokens validation
    if (tokens.spacing) {
      this.validateSpacingTokens(tokens.spacing, 'designTokens.spacing', errors, warnings);
    }

    // Border tokens validation
    if (tokens.borders) {
      this.validateBorderTokens(tokens.borders, 'designTokens.borders', errors, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate generated code
   */
  async validateCodeGeneration(code: GeneratedCode[]): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (let i = 0; i < code.length; i++) {
      const codeItem = code[i];
      if (!codeItem) continue;
      
      const fieldPrefix = `codeGeneration[${i}]`;

      // Required fields validation based on GeneratedCode interface
      if (codeItem.componentCode) {
        this.validateRequiredField(codeItem.componentCode, `${fieldPrefix}.componentCode`, 'Component code is required', errors);
      }

      if (codeItem.fileName && !this.isValidFileName(codeItem.fileName)) {
        warnings.push({
          code: 'INVALID_FILE_NAME',
          message: 'File name should follow naming conventions',
          path: `${fieldPrefix}.fileName`,
          impact: 'medium'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // =============================================================================
  // PRIVATE VALIDATION METHODS
  // =============================================================================

  private validateExtractionStructure(result: ExtractionResult, errors: ValidationError[]): void {
    // Version validation
    if (!result.version) {
      errors.push({
        code: 'MISSING_VERSION',
        message: 'Extraction result version is required',
        severity: 'high',
        path: 'version'
      });
    }

    // Timestamp validation
    if (!result.extractedAt) {
      errors.push({
        code: 'MISSING_TIMESTAMP',
        message: 'Extraction timestamp is required',
        severity: 'high',
        path: 'extractedAt'
      });
    } else if (!this.isValidTimestamp(result.extractedAt)) {
      errors.push({
        code: 'INVALID_TIMESTAMP',
        message: 'Extraction timestamp is not valid ISO format',
        severity: 'medium',
        path: 'extractedAt'
      });
    }

    // Arrays should be defined
    if (!Array.isArray(result.metadata)) {
      errors.push({
        code: 'INVALID_METADATA_ARRAY',
        message: 'Metadata must be an array',
        severity: 'critical',
        path: 'metadata'
      });
    }

    if (!Array.isArray(result.assets)) {
      errors.push({
        code: 'INVALID_ASSETS_ARRAY',
        message: 'Assets must be an array',
        severity: 'critical',
        path: 'assets'
      });
    }
  }

  private validateRequiredField(value: any, field: string, message: string, errors: ValidationError[]): void {
    if (value === undefined || value === null || value === '') {
      errors.push({
        code: 'REQUIRED_FIELD_MISSING',
        message,
        severity: 'high',
        path: field
      });
    }
  }

  private validateNodeType(node: FigmaNodeMetadata, fieldPrefix: string, warnings: ValidationWarning[]): void {
    const validTypes = ['FRAME', 'GROUP', 'TEXT', 'RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'IMAGE', 'COMPONENT', 'INSTANCE'];
    
    if (!validTypes.includes(node.type)) {
      warnings.push({
        code: 'UNKNOWN_NODE_TYPE',
        message: `Unknown node type: ${node.type}`,
        path: `${fieldPrefix}.type`,
        impact: 'medium'
      });
    }

    // Type-specific validations
    if (node.type === 'TEXT' && !node.name.includes('text') && !node.name.includes('Text')) {
      warnings.push({
        code: 'TEXT_NODE_NAMING',
        message: 'Text node name should indicate it contains text',
        path: `${fieldPrefix}.name`,
        impact: 'info'
      });
    }
  }

  private validateBoundingBox(box: any, field: string, errors: ValidationError[]): void {
    if (typeof box.x !== 'number' || typeof box.y !== 'number' || 
        typeof box.width !== 'number' || typeof box.height !== 'number') {
      errors.push({
        code: 'INVALID_BOUNDING_BOX',
        message: 'Bounding box must have numeric x, y, width, height properties',
        severity: 'high',
        path: field
      });
      return;
    }

    if (box.width < 0 || box.height < 0) {
      errors.push({
        code: 'NEGATIVE_DIMENSIONS',
        message: 'Bounding box dimensions cannot be negative',
        severity: 'medium',
        path: field
      });
    }
  }

  private validateMCPMetadata(metadata: any, field: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!metadata.extractedAt) {
      errors.push({
        code: 'MISSING_MCP_TIMESTAMP',
        message: 'MCP metadata must include extraction timestamp',
        severity: 'medium',
        path: `${field}.extractedAt`
      });
    }

    if (metadata.componentType && !this.isValidComponentType(metadata.componentType)) {
      warnings.push({
        code: 'UNKNOWN_COMPONENT_TYPE',
        message: `Unknown component type: ${metadata.componentType}`,
        path: `${field}.componentType`,
        impact: 'medium'
      });
    }
  }

  private validateNodeConsistency(node: FigmaNodeMetadata, fieldPrefix: string, warnings: ValidationWarning[]): void {
    // Check if invisible nodes are included (might be unintentional)
    if (!node.visible) {
      warnings.push({
        code: 'INVISIBLE_NODE_INCLUDED',
        message: 'Invisible node included in extraction',
        path: `${fieldPrefix}.visible`,
        impact: 'info'
      });
    }

    // Check for locked nodes
    if (node.locked) {
      warnings.push({
        code: 'LOCKED_NODE_INCLUDED',
        message: 'Locked node included in extraction',
        path: `${fieldPrefix}.locked`,
        impact: 'info'
      });
    }
  }

  private validateColorTokens(colors: any, field: string, errors: ValidationError[], _warnings: ValidationWarning[]): void {
    if (colors.custom) {
      for (const [name, value] of Object.entries(colors.custom)) {
        if (typeof value !== 'string') {
          errors.push({
            code: 'INVALID_COLOR_VALUE',
            message: `Color value must be a string: ${name}`,
            severity: 'medium',
            path: `${field}.custom.${name}`
          });
          continue;
        }

        if (!this.isValidColor(value as string)) {
          errors.push({
            code: 'INVALID_COLOR_FORMAT',
            message: `Invalid color format: ${value}`,
            severity: 'medium',
            path: `${field}.custom.${name}`
          });
        }
      }
    }
  }

  private validateTypographyTokens(typography: any, field: string, errors: ValidationError[], _warnings: ValidationWarning[]): void {
    if (typography.fontSize !== undefined && (typeof typography.fontSize !== 'number' || typography.fontSize <= 0)) {
      errors.push({
        code: 'INVALID_FONT_SIZE',
        message: 'Font size must be a positive number',
        severity: 'medium',
        path: `${field}.fontSize`
      });
    }

    if (typography.lineHeight !== undefined && (typeof typography.lineHeight !== 'number' || typography.lineHeight <= 0)) {
      errors.push({
        code: 'INVALID_LINE_HEIGHT',
        message: 'Line height must be a positive number',
        severity: 'medium',
        path: `${field}.lineHeight`
      });
    }
  }

  private validateSpacingTokens(spacing: any, field: string, errors: ValidationError[], _warnings: ValidationWarning[]): void {
    const spacingProps = ['padding', 'margin', 'gap'];
    
    for (const prop of spacingProps) {
      if (spacing[prop] !== undefined && (typeof spacing[prop] !== 'number' || spacing[prop] < 0)) {
        errors.push({
          code: 'INVALID_SPACING_VALUE',
          message: `${prop} must be a non-negative number`,
          severity: 'medium',
          path: `${field}.${prop}`
        });
      }
    }
  }

  private validateBorderTokens(borders: any, field: string, errors: ValidationError[], _warnings: ValidationWarning[]): void {
    if (borders.width !== undefined && (typeof borders.width !== 'number' || borders.width < 0)) {
      errors.push({
        code: 'INVALID_BORDER_WIDTH',
        message: 'Border width must be a non-negative number',
        severity: 'medium',
        path: `${field}.width`
      });
    }

    if (borders.color && !this.isValidColor(borders.color)) {
      errors.push({
        code: 'INVALID_BORDER_COLOR',
        message: 'Border color format is invalid',
        severity: 'medium',
        path: `${field}.color`
      });
    }
  }

  private validatePerformance(result: ExtractionResult, warnings: ValidationWarning[]): void {
    if (result.metadata.length > 1000) {
      warnings.push({
        code: 'LARGE_METADATA_COUNT',
        message: `Large number of metadata entries (${result.metadata.length}) may impact performance`,
        path: 'metadata',
        impact: 'medium'
      });
    }

    if (result.assets.length > 100) {
      warnings.push({
        code: 'LARGE_ASSET_COUNT',
        message: `Large number of assets (${result.assets.length}) may impact performance`,
        path: 'assets',
        impact: 'medium'
      });
    }
  }

  // =============================================================================
  // UTILITY VALIDATION METHODS
  // =============================================================================

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidAssetFormat(format: string): boolean {
    const validFormats = ['png', 'jpg', 'jpeg', 'svg', 'pdf', 'gif', 'webp'];
    return validFormats.includes(format.toLowerCase());
  }

  private isValidTimestamp(timestamp: string): boolean {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && timestamp.includes('T');
  }

  private isValidComponentType(type: string): boolean {
    const validTypes = ['button', 'input', 'card', 'modal', 'navigation', 'layout', 'typography', 'icon', 'custom'];
    return validTypes.includes(type);
  }

  private isValidFileName(fileName: string): boolean {
    // Basic file name validation
    return /^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(fileName);
  }

  private isValidColor(color: string): boolean {
    // Check hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/.test(color)) {
      return true;
    }
    
    // Check rgb/rgba colors
    if (/^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$/.test(color)) {
      return true;
    }
    
    // Check hsl/hsla colors
    if (/^hsla?\(\d+,\s*\d+%,\s*\d+%(?:,\s*[\d.]+)?\)$/.test(color)) {
      return true;
    }
    
    return false;
  }
}

/**
 * Validation factory for creating appropriate validators
 */
export class ValidatorFactory {
  static create(level: ValidationLevel): DataValidator {
    return new MCPDataValidator(level);
  }
}