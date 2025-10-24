/**
 * 🔍 Design Spec Validator
 * 
 * Comprehensive validation system for designSpec.json to ensure
 * data integrity and compatibility across the Design Intelligence Layer.
 */

import { 
  DesignSpec, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  DESIGN_SPEC_VERSION,
  SchemaVersion
} from '../schema/design-spec.js';

export class DesignSpecValidator {
  private version: string;

  constructor(version: string = DESIGN_SPEC_VERSION) {
    this.version = version;
  }

  /**
   * Validate a complete design specification
   */
  async validate(spec: unknown): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Basic structure validation
      if (!this.isValidObject(spec)) {
        errors.push({
          path: 'root',
          message: 'Design spec must be a valid object',
          expected: 'object',
          actual: typeof spec,
          code: 'INVALID_ROOT_TYPE'
        });
        return this.createResult(false, errors, warnings);
      }

      const designSpec = spec as Partial<DesignSpec>;

      // Validate required top-level properties
      await this.validateMetadata(designSpec.metadata, errors, warnings);
      await this.validateDesignTokens(designSpec.designTokens, errors, warnings);
      await this.validateComponents(designSpec.components, errors, warnings);
      await this.validateDesignSystem(designSpec.designSystem, errors, warnings);
      await this.validateResponsive(designSpec.responsive, errors, warnings);
      await this.validateAccessibility(designSpec.accessibility, errors, warnings);
      await this.validateContext(designSpec.context, errors, warnings);

      // Cross-validation checks
      await this.performCrossValidation(designSpec, errors, warnings);

      const isValid = errors.length === 0;
      return this.createResult(isValid, errors, warnings);

    } catch (error) {
      errors.push({
        path: 'validation',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        expected: 'successful validation',
        actual: 'validation exception',
        code: 'VALIDATION_EXCEPTION'
      });
      return this.createResult(false, errors, warnings);
    }
  }

  /**
   * Validate metadata section
   */
  private async validateMetadata(
    metadata: DesignSpec['metadata'] | undefined,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!metadata) {
      errors.push({
        path: 'metadata',
        message: 'Metadata is required',
        expected: 'DesignSpecMetadata object',
        actual: 'undefined',
        code: 'MISSING_METADATA'
      });
      return;
    }

    // Version validation
    if (!metadata.version) {
      errors.push({
        path: 'metadata.version',
        message: 'Version is required',
        expected: 'string',
        actual: typeof metadata.version,
        code: 'MISSING_VERSION'
      });
    } else if (!this.isValidVersion(metadata.version)) {
      warnings.push({
        path: 'metadata.version',
        message: 'Version format may not be valid semver',
        suggestion: 'Use semver format (e.g., "1.0.0")',
        code: 'INVALID_VERSION_FORMAT'
      });
    }

    // Spec ID validation
    if (!metadata.specId || typeof metadata.specId !== 'string') {
      errors.push({
        path: 'metadata.specId',
        message: 'Spec ID is required and must be a string',
        expected: 'string',
        actual: typeof metadata.specId,
        code: 'INVALID_SPEC_ID'
      });
    }

    // Figma file validation
    if (!metadata.figmaFile) {
      errors.push({
        path: 'metadata.figmaFile',
        message: 'Figma file information is required',
        expected: 'FigmaFileInfo object',
        actual: 'undefined',
        code: 'MISSING_FIGMA_FILE'
      });
    } else {
      if (!metadata.figmaFile.fileId) {
        errors.push({
          path: 'metadata.figmaFile.fileId',
          message: 'Figma file ID is required',
          expected: 'string',
          actual: typeof metadata.figmaFile.fileId,
          code: 'MISSING_FILE_ID'
        });
      }
    }

    // Extraction metadata validation
    if (!metadata.extraction) {
      warnings.push({
        path: 'metadata.extraction',
        message: 'Extraction metadata is recommended',
        suggestion: 'Include extraction timestamp and source information',
        code: 'MISSING_EXTRACTION_INFO'
      });
    } else {
      if (metadata.extraction.confidence < 0 || metadata.extraction.confidence > 1) {
        errors.push({
          path: 'metadata.extraction.confidence',
          message: 'Confidence must be between 0 and 1',
          expected: 'number between 0-1',
          actual: String(metadata.extraction.confidence),
          code: 'INVALID_CONFIDENCE_RANGE'
        });
      }
    }
  }

  /**
   * Validate design tokens section
   */
  private async validateDesignTokens(
    tokens: DesignSpec['designTokens'] | undefined,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!tokens) {
      warnings.push({
        path: 'designTokens',
        message: 'Design tokens are recommended',
        suggestion: 'Include extracted design tokens for better AI processing',
        code: 'MISSING_DESIGN_TOKENS'
      });
      return;
    }

    // Validate color tokens
    if (tokens.colors) {
      tokens.colors.forEach((color, index) => {
        if (!color.id || !color.name || !color.value) {
          errors.push({
            path: `designTokens.colors[${index}]`,
            message: 'Color token must have id, name, and value',
            expected: 'ColorToken with id, name, value',
            actual: 'incomplete ColorToken',
            code: 'INCOMPLETE_COLOR_TOKEN'
          });
        }

        // Validate color value format
        if (color.value && !this.isValidColorValue(color.value)) {
          warnings.push({
            path: `designTokens.colors[${index}].value`,
            message: 'Color value format may not be standard',
            suggestion: 'Use hex, rgb, or hsl format',
            code: 'INVALID_COLOR_FORMAT'
          });
        }
      });
    }

    // Validate typography tokens
    if (tokens.typography) {
      tokens.typography.forEach((typo, index) => {
        if (!typo.id || !typo.name || !typo.fontFamily) {
          errors.push({
            path: `designTokens.typography[${index}]`,
            message: 'Typography token must have id, name, and fontFamily',
            expected: 'TypographyToken with required fields',
            actual: 'incomplete TypographyToken',
            code: 'INCOMPLETE_TYPOGRAPHY_TOKEN'
          });
        }

        if (typo.fontSize && typo.fontSize <= 0) {
          errors.push({
            path: `designTokens.typography[${index}].fontSize`,
            message: 'Font size must be positive',
            expected: 'positive number',
            actual: String(typo.fontSize),
            code: 'INVALID_FONT_SIZE'
          });
        }
      });
    }
  }

  /**
   * Validate components section
   */
  private async validateComponents(
    components: DesignSpec['components'] | undefined,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!components || components.length === 0) {
      warnings.push({
        path: 'components',
        message: 'No components found',
        suggestion: 'Design spec should include analyzed components',
        code: 'NO_COMPONENTS'
      });
      return;
    }

    const componentIds = new Set<string>();

    components.forEach((component, index) => {
      // Validate required fields
      if (!component.id) {
        errors.push({
          path: `components[${index}].id`,
          message: 'Component ID is required',
          expected: 'string',
          actual: typeof component.id,
          code: 'MISSING_COMPONENT_ID'
        });
      } else {
        // Check for duplicate IDs
        if (componentIds.has(component.id)) {
          errors.push({
            path: `components[${index}].id`,
            message: 'Duplicate component ID',
            expected: 'unique string',
            actual: component.id,
            code: 'DUPLICATE_COMPONENT_ID'
          });
        }
        componentIds.add(component.id);
      }

      if (!component.name) {
        errors.push({
          path: `components[${index}].name`,
          message: 'Component name is required',
          expected: 'string',
          actual: typeof component.name,
          code: 'MISSING_COMPONENT_NAME'
        });
      }

      // Validate semantic classification
      if (component.semantic && component.semantic.confidence !== undefined) {
        if (component.semantic.confidence < 0 || component.semantic.confidence > 1) {
          errors.push({
            path: `components[${index}].semantic.confidence`,
            message: 'Semantic confidence must be between 0 and 1',
            expected: 'number between 0-1',
            actual: String(component.semantic.confidence),
            code: 'INVALID_SEMANTIC_CONFIDENCE'
          });
        }
      }

      // Validate visual properties
      if (component.visual) {
        if (component.visual.dimensions) {
          if (component.visual.dimensions.width < 0 || component.visual.dimensions.height < 0) {
            errors.push({
              path: `components[${index}].visual.dimensions`,
              message: 'Component dimensions must be non-negative',
              expected: 'positive numbers',
              actual: `width: ${component.visual.dimensions.width}, height: ${component.visual.dimensions.height}`,
              code: 'INVALID_DIMENSIONS'
            });
          }
        }
      }
    });
  }

  /**
   * Validate design system section
   */
  private async validateDesignSystem(
    designSystem: DesignSpec['designSystem'] | undefined,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!designSystem) {
      warnings.push({
        path: 'designSystem',
        message: 'Design system analysis is recommended',
        suggestion: 'Include design system compliance analysis',
        code: 'MISSING_DESIGN_SYSTEM'
      });
      return;
    }

    // Validate detection confidence
    if (designSystem.detected && designSystem.detected.confidence !== undefined) {
      if (designSystem.detected.confidence < 0 || designSystem.detected.confidence > 1) {
        errors.push({
          path: 'designSystem.detected.confidence',
          message: 'Detection confidence must be between 0 and 1',
          expected: 'number between 0-1',
          actual: String(designSystem.detected.confidence),
          code: 'INVALID_DETECTION_CONFIDENCE'
        });
      }
    }

    // Validate compliance scores
    if (designSystem.compliance) {
      if (designSystem.compliance.overall < 0 || designSystem.compliance.overall > 1) {
        errors.push({
          path: 'designSystem.compliance.overall',
          message: 'Overall compliance score must be between 0 and 1',
          expected: 'number between 0-1',
          actual: String(designSystem.compliance.overall),
          code: 'INVALID_COMPLIANCE_SCORE'
        });
      }

      // Validate category scores
      if (designSystem.compliance.categories) {
        Object.entries(designSystem.compliance.categories).forEach(([category, data]) => {
          if (data.score < 0 || data.score > 1) {
            errors.push({
              path: `designSystem.compliance.categories.${category}.score`,
              message: `${category} compliance score must be between 0 and 1`,
              expected: 'number between 0-1',
              actual: String(data.score),
              code: 'INVALID_CATEGORY_SCORE'
            });
          }
        });
      }
    }
  }

  /**
   * Validate responsive design section
   */
  private async validateResponsive(
    responsive: DesignSpec['responsive'] | undefined,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!responsive) {
      warnings.push({
        path: 'responsive',
        message: 'Responsive design data is recommended',
        suggestion: 'Include responsive design analysis for better code generation',
        code: 'MISSING_RESPONSIVE'
      });
      return;
    }

    // Validate breakpoints
    if (responsive.breakpoints) {
      responsive.breakpoints.forEach((breakpoint, index) => {
        if (!breakpoint.name || breakpoint.minWidth === undefined) {
          errors.push({
            path: `responsive.breakpoints[${index}]`,
            message: 'Breakpoint must have name and minWidth',
            expected: 'Breakpoint with name and minWidth',
            actual: 'incomplete Breakpoint',
            code: 'INCOMPLETE_BREAKPOINT'
          });
        }

        if (breakpoint.minWidth < 0) {
          errors.push({
            path: `responsive.breakpoints[${index}].minWidth`,
            message: 'Breakpoint minWidth must be non-negative',
            expected: 'non-negative number',
            actual: String(breakpoint.minWidth),
            code: 'INVALID_BREAKPOINT_WIDTH'
          });
        }
      });
    }
  }

  /**
   * Validate accessibility section
   */
  private async validateAccessibility(
    accessibility: DesignSpec['accessibility'] | undefined,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!accessibility) {
      warnings.push({
        path: 'accessibility',
        message: 'Accessibility data is recommended',
        suggestion: 'Include accessibility compliance analysis',
        code: 'MISSING_ACCESSIBILITY'
      });
      return;
    }

    // Validate compliance score
    if (accessibility.compliance && accessibility.compliance.score !== undefined) {
      if (accessibility.compliance.score < 0 || accessibility.compliance.score > 1) {
        errors.push({
          path: 'accessibility.compliance.score',
          message: 'Accessibility compliance score must be between 0 and 1',
          expected: 'number between 0-1',
          actual: String(accessibility.compliance.score),
          code: 'INVALID_ACCESSIBILITY_SCORE'
        });
      }
    }

    // Validate contrast issues
    if (accessibility.colorAccessibility && accessibility.colorAccessibility.contrastIssues) {
      accessibility.colorAccessibility.contrastIssues.forEach((issue, index) => {
        if (issue.ratio <= 0) {
          errors.push({
            path: `accessibility.colorAccessibility.contrastIssues[${index}].ratio`,
            message: 'Contrast ratio must be positive',
            expected: 'positive number',
            actual: String(issue.ratio),
            code: 'INVALID_CONTRAST_RATIO'
          });
        }
      });
    }
  }

  /**
   * Validate context section
   */
  private async validateContext(
    context: DesignSpec['context'] | undefined,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    if (!context) {
      warnings.push({
        path: 'context',
        message: 'Design context is recommended',
        suggestion: 'Include design intent and context information',
        code: 'MISSING_CONTEXT'
      });
      return;
    }

    // Validate quality metrics
    if (context.quality) {
      const qualityMetrics = ['completeness', 'consistency', 'clarity', 'complexity', 'confidence'];
      qualityMetrics.forEach(metric => {
        const value = (context.quality as any)[metric];
        if (value !== undefined && (value < 0 || value > 1)) {
          errors.push({
            path: `context.quality.${metric}`,
            message: `Quality ${metric} must be between 0 and 1`,
            expected: 'number between 0-1',
            actual: String(value),
            code: 'INVALID_QUALITY_METRIC'
          });
        }
      });
    }
  }

  /**
   * Perform cross-validation checks
   */
  private async performCrossValidation(
    spec: Partial<DesignSpec>,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): Promise<void> {
    // Check component references
    if (spec.components) {
      const componentIds = new Set(spec.components.map(c => c.id));
      
      spec.components.forEach((component, index) => {
        // Validate parent references
        if (component.hierarchy?.parent && !componentIds.has(component.hierarchy.parent)) {
          errors.push({
            path: `components[${index}].hierarchy.parent`,
            message: 'Parent component reference not found',
            expected: 'valid component ID',
            actual: component.hierarchy.parent,
            code: 'INVALID_PARENT_REFERENCE'
          });
        }

        // Validate children references
        component.hierarchy?.children?.forEach((childId, childIndex) => {
          if (!componentIds.has(childId)) {
            errors.push({
              path: `components[${index}].hierarchy.children[${childIndex}]`,
              message: 'Child component reference not found',
              expected: 'valid component ID',
              actual: childId,
              code: 'INVALID_CHILD_REFERENCE'
            });
          }
        });
      });
    }

    // Check token usage consistency
    if (spec.designTokens && spec.components) {
      const colorTokenIds = new Set(spec.designTokens.colors?.map(c => c.id) || []);
      const typographyTokenIds = new Set(spec.designTokens.typography?.map(t => t.id) || []);

      // This would be expanded to check if referenced tokens actually exist
      // For now, just add a warning if we have components but no tokens
      if (spec.components.length > 0 && colorTokenIds.size === 0 && typographyTokenIds.size === 0) {
        warnings.push({
          path: 'designTokens',
          message: 'Components found but no design tokens extracted',
          suggestion: 'Consider extracting design tokens for better consistency',
          code: 'NO_TOKENS_WITH_COMPONENTS'
        });
      }
    }
  }

  /**
   * Utility methods
   */
  private isValidObject(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isValidVersion(version: string): boolean {
    // Basic semver pattern check
    const semverPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    return semverPattern.test(version);
  }

  private isValidColorValue(value: string): boolean {
    // Check for common color formats
    const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
    const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
    const hslPattern = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
    const hslaPattern = /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/;

    return hexPattern.test(value) || 
           rgbPattern.test(value) || 
           rgbaPattern.test(value) || 
           hslPattern.test(value) || 
           hslaPattern.test(value);
  }

  private createResult(
    valid: boolean, 
    errors: ValidationError[], 
    warnings: ValidationWarning[]
  ): ValidationResult {
    return {
      valid,
      errors,
      warnings,
      metadata: {
        validator: 'DesignSpecValidator',
        version: this.version,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Quick validation function for simple use cases
 */
export async function validateDesignSpec(spec: unknown): Promise<ValidationResult> {
  const validator = new DesignSpecValidator();
  return validator.validate(spec);
}

/**
 * Schema compatibility checker
 */
export class SchemaCompatibilityChecker {
  /**
   * Check if a spec version is compatible with current version
   */
  static isCompatible(specVersion: string, currentVersion: string = DESIGN_SPEC_VERSION): boolean {
    const spec = this.parseVersion(specVersion);
    const current = this.parseVersion(currentVersion);

    if (!spec || !current) return false;

    // Major version must match
    if (spec.major !== current.major) return false;

    // Minor version must be <= current
    if (spec.minor > current.minor) return false;

    // Patch version can be anything
    return true;
  }

  /**
   * Get migration path from one version to another
   */
  static getMigrationPath(fromVersion: string, toVersion: string): string[] {
    const migrations: string[] = [];
    
    // This would be expanded with actual migration steps
    // For now, just return empty array (no migrations needed yet)
    return migrations;
  }

  private static parseVersion(version: string): SchemaVersion | null {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    
    if (!match) return null;

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4]
    };
  }
}

export { DESIGN_SPEC_VERSION };