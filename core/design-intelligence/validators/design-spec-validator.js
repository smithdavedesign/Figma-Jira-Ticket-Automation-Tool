/**
 * 🔍 Design Spec Validator
 *
 * Comprehensive validation system for designSpec.json to ensure
 * data integrity and compatibility across the Design Intelligence Layer.
 */

import { DESIGN_SPEC_VERSION } from '../schema/design-spec.js';

/**
 * @typedef {Object} ValidationError
 * @property {string} path
 * @property {string} message
 * @property {string} expected
 * @property {string} actual
 * @property {string} code
 */

/**
 * @typedef {Object} ValidationWarning
 * @property {string} path
 * @property {string} message
 * @property {string} code
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {ValidationError[]} errors
 * @property {ValidationWarning[]} warnings
 * @property {Object} summary
 * @property {number} summary.totalErrors
 * @property {number} summary.totalWarnings
 * @property {string} summary.validationVersion
 */

class DesignSpecValidator {
  /**
   * @param {string} version
   */
  constructor(version = DESIGN_SPEC_VERSION) {
    this.version = version;
  }

  /**
   * Validate a complete design specification
   * @param {unknown} spec
   * @returns {Promise<ValidationResult>}
   */
  async validate(spec) {
    /** @type {ValidationError[]} */
    const errors = [];
    /** @type {ValidationWarning[]} */
    const warnings = [];

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

      const designSpec = /** @type {Partial<DesignSpec>} */ (spec);

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
   * @param {DesignSpecMetadata|undefined} metadata
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {Promise<void>}
   */
  async validateMetadata(metadata, errors, warnings) {
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
      errors.push({
        path: 'metadata.version',
        message: 'Invalid version format',
        expected: 'semver format (e.g., "1.0.0")',
        actual: metadata.version,
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
        actual: typeof metadata.figmaFile,
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
      errors.push({
        path: 'metadata.extraction',
        message: 'Extraction metadata is required',
        expected: 'ExtractionMetadata object',
        actual: typeof metadata.extraction,
        code: 'MISSING_EXTRACTION'
      });
    } else {
      if (!metadata.extraction.timestamp) {
        errors.push({
          path: 'metadata.extraction.timestamp',
          message: 'Extraction timestamp is required',
          expected: 'ISO 8601 string',
          actual: typeof metadata.extraction.timestamp,
          code: 'MISSING_TIMESTAMP'
        });
      }
    }
  }

  /**
   * Validate design tokens section
   * @param {DesignTokens|undefined} tokens
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {Promise<void>}
   */
  async validateDesignTokens(tokens, errors, warnings) {
    if (!tokens) {
      warnings.push({
        path: 'designTokens',
        message: 'Design tokens are recommended for better design system analysis',
        code: 'MISSING_DESIGN_TOKENS'
      });
      return;
    }

    // Validate color tokens
    if (tokens.colors) {
      tokens.colors.forEach((colorToken, index) => {
        if (!colorToken.id) {
          errors.push({
            path: `designTokens.colors[${index}].id`,
            message: 'Color token ID is required',
            expected: 'string',
            actual: typeof colorToken.id,
            code: 'MISSING_COLOR_TOKEN_ID'
          });
        }
        if (!colorToken.value || !this.isValidColorValue(colorToken.value)) {
          errors.push({
            path: `designTokens.colors[${index}].value`,
            message: 'Valid color value is required',
            expected: 'hex, rgb, or hsl color string',
            actual: colorToken.value,
            code: 'INVALID_COLOR_VALUE'
          });
        }
      });
    }

    // Validate typography tokens
    if (tokens.typography) {
      tokens.typography.forEach((typographyToken, index) => {
        if (!typographyToken.id) {
          errors.push({
            path: `designTokens.typography[${index}].id`,
            message: 'Typography token ID is required',
            expected: 'string',
            actual: typeof typographyToken.id,
            code: 'MISSING_TYPOGRAPHY_TOKEN_ID'
          });
        }
        if (!typographyToken.fontSize || typeof typographyToken.fontSize !== 'number') {
          errors.push({
            path: `designTokens.typography[${index}].fontSize`,
            message: 'Font size must be a number',
            expected: 'number',
            actual: typeof typographyToken.fontSize,
            code: 'INVALID_FONT_SIZE'
          });
        }
      });
    }
  }

  /**
   * Validate components section
   * @param {DesignComponent[]|undefined} components
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {Promise<void>}
   */
  async validateComponents(components, errors, warnings) {
    if (!components || components.length === 0) {
      errors.push({
        path: 'components',
        message: 'At least one component is required',
        expected: 'DesignComponent[]',
        actual: components ? 'empty array' : typeof components,
        code: 'MISSING_COMPONENTS'
      });
      return;
    }

    const componentIds = new Set();

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

      if (!component.type) {
        errors.push({
          path: `components[${index}].type`,
          message: 'Component type is required',
          expected: 'ComponentType',
          actual: typeof component.type,
          code: 'MISSING_COMPONENT_TYPE'
        });
      }

      // Validate geometry
      if (!component.geometry) {
        errors.push({
          path: `components[${index}].geometry`,
          message: 'Component geometry is required',
          expected: 'ComponentGeometry object',
          actual: typeof component.geometry,
          code: 'MISSING_GEOMETRY'
        });
      } else {
        if (typeof component.geometry.width !== 'number' || component.geometry.width < 0) {
          errors.push({
            path: `components[${index}].geometry.width`,
            message: 'Width must be a non-negative number',
            expected: 'number >= 0',
            actual: component.geometry.width,
            code: 'INVALID_WIDTH'
          });
        }
        if (typeof component.geometry.height !== 'number' || component.geometry.height < 0) {
          errors.push({
            path: `components[${index}].geometry.height`,
            message: 'Height must be a non-negative number',
            expected: 'number >= 0',
            actual: component.geometry.height,
            code: 'INVALID_HEIGHT'
          });
        }
      }
    });
  }

  /**
   * Validate design system section
   * @param {DesignSystemAnalysis|undefined} designSystem
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {Promise<void>}
   */
  async validateDesignSystem(designSystem, errors, warnings) {
    if (!designSystem) {
      warnings.push({
        path: 'designSystem',
        message: 'Design system analysis provides valuable insights',
        code: 'MISSING_DESIGN_SYSTEM'
      });
      return;
    }

    // Validate detection confidence
    if (designSystem.detected && designSystem.detected.confidence !== undefined) {
      if (typeof designSystem.detected.confidence !== 'number' ||
          designSystem.detected.confidence < 0 ||
          designSystem.detected.confidence > 1) {
        errors.push({
          path: 'designSystem.detected.confidence',
          message: 'Confidence must be a number between 0 and 1',
          expected: 'number (0-1)',
          actual: designSystem.detected.confidence,
          code: 'INVALID_CONFIDENCE'
        });
      }
    }

    // Validate compliance scores
    if (designSystem.compliance) {
      if (typeof designSystem.compliance.overall !== 'number' ||
          designSystem.compliance.overall < 0 ||
          designSystem.compliance.overall > 1) {
        errors.push({
          path: 'designSystem.compliance.overall',
          message: 'Overall compliance score must be between 0 and 1',
          expected: 'number (0-1)',
          actual: designSystem.compliance.overall,
          code: 'INVALID_COMPLIANCE_SCORE'
        });
      }

      if (designSystem.compliance.categories) {
        designSystem.compliance.categories.forEach((category, index) => {
          if (typeof category.score !== 'number' || category.score < 0 || category.score > 1) {
            errors.push({
              path: `designSystem.compliance.categories[${index}].score`,
              message: 'Category compliance score must be between 0 and 1',
              expected: 'number (0-1)',
              actual: category.score,
              code: 'INVALID_CATEGORY_SCORE'
            });
          }
        });
      }
    }
  }

  /**
   * Validate responsive design section
   * @param {ResponsiveDesignData|undefined} responsive
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {Promise<void>}
   */
  async validateResponsive(responsive, errors, warnings) {
    if (!responsive) {
      warnings.push({
        path: 'responsive',
        message: 'Responsive design data helps with better component generation',
        code: 'MISSING_RESPONSIVE_DATA'
      });
      return;
    }

    // Validate breakpoints
    if (responsive.breakpoints) {
      responsive.breakpoints.forEach((breakpoint, index) => {
        if (!breakpoint.name) {
          errors.push({
            path: `responsive.breakpoints[${index}].name`,
            message: 'Breakpoint name is required',
            expected: 'string',
            actual: typeof breakpoint.name,
            code: 'MISSING_BREAKPOINT_NAME'
          });
        }
        if (typeof breakpoint.minWidth !== 'number' || breakpoint.minWidth < 0) {
          errors.push({
            path: `responsive.breakpoints[${index}].minWidth`,
            message: 'Min width must be a non-negative number',
            expected: 'number >= 0',
            actual: breakpoint.minWidth,
            code: 'INVALID_MIN_WIDTH'
          });
        }
      });
    }
  }

  /**
   * Validate accessibility section
   * @param {AccessibilityData|undefined} accessibility
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {Promise<void>}
   */
  async validateAccessibility(accessibility, errors, warnings) {
    if (!accessibility) {
      warnings.push({
        path: 'accessibility',
        message: 'Accessibility data is crucial for inclusive design',
        code: 'MISSING_ACCESSIBILITY_DATA'
      });
      return;
    }

    // Validate compliance score
    if (accessibility.compliance && accessibility.compliance.score !== undefined) {
      if (typeof accessibility.compliance.score !== 'number' ||
          accessibility.compliance.score < 0 ||
          accessibility.compliance.score > 1) {
        errors.push({
          path: 'accessibility.compliance.score',
          message: 'Accessibility score must be between 0 and 1',
          expected: 'number (0-1)',
          actual: accessibility.compliance.score,
          code: 'INVALID_ACCESSIBILITY_SCORE'
        });
      }
    }
  }

  /**
   * Validate context section
   * @param {DesignContext|undefined} context
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {Promise<void>}
   */
  async validateContext(context, errors, warnings) {
    if (!context) {
      warnings.push({
        path: 'context',
        message: 'Design context provides valuable insights for code generation',
        code: 'MISSING_CONTEXT'
      });
      return;
    }

    if (!context.purpose) {
      warnings.push({
        path: 'context.purpose',
        message: 'Design purpose helps generate more appropriate code',
        code: 'MISSING_PURPOSE'
      });
    }

    if (!context.target) {
      warnings.push({
        path: 'context.target',
        message: 'Target information helps optimize generated components',
        code: 'MISSING_TARGET'
      });
    }
  }

  /**
   * Perform cross-validation checks
   * @param {Partial<DesignSpec>} spec
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {Promise<void>}
   */
  async performCrossValidation(spec, errors, warnings) {
    // Check component references
    if (spec.components) {
      const componentIds = new Set(spec.components.map(c => c.id));

      spec.components.forEach((component, index) => {
        if (component.children) {
          component.children.forEach((childId, childIndex) => {
            if (!componentIds.has(childId)) {
              errors.push({
                path: `components[${index}].children[${childIndex}]`,
                message: 'Referenced child component does not exist',
                expected: 'existing component ID',
                actual: childId,
                code: 'INVALID_CHILD_REFERENCE'
              });
            }
          });
        }

        if (component.parent && !componentIds.has(component.parent)) {
          errors.push({
            path: `components[${index}].parent`,
            message: 'Referenced parent component does not exist',
            expected: 'existing component ID',
            actual: component.parent,
            code: 'INVALID_PARENT_REFERENCE'
          });
        }
      });
    }

    // Check design token references
    if (spec.designTokens && spec.components) {
      // const colorTokenIds = new Set(spec.designTokens.colors?.map(c => c.id) || []);
      // const typographyTokenIds = new Set(spec.designTokens.typography?.map(t => t.id) || []);

      // Validate that referenced tokens exist
      spec.components.forEach((component, index) => {
        // This would be more complex in a full implementation
        // checking actual token references in component styles
      });
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Check if value is a valid object
   * @param {unknown} value
   * @returns {boolean}
   */
  isValidObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Check if version string is valid
   * @param {string} version
   * @returns {boolean}
   */
  isValidVersion(version) {
    // Basic semver validation
    return /^\d+\.\d+\.\d+/.test(version);
  }

  /**
   * Check if color value is valid
   * @param {string} value
   * @returns {boolean}
   */
  isValidColorValue(value) {
    // Basic color validation - hex, rgb, hsl
    return /^#[0-9A-Fa-f]{6}$/.test(value) ||
           /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(value) ||
           /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/.test(value) ||
           /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/.test(value) ||
           /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/.test(value);
  }

  /**
   * Create validation result
   * @param {boolean} valid
   * @param {ValidationError[]} errors
   * @param {ValidationWarning[]} warnings
   * @returns {ValidationResult}
   */
  createResult(valid, errors, warnings) {
    return {
      valid,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length,
        validationVersion: this.version
      }
    };
  }
}

/**
 * Quick validation function for simple use cases
 * @param {unknown} spec
 * @returns {Promise<ValidationResult>}
 */
async function validateDesignSpec(spec) {
  const validator = new DesignSpecValidator();
  return validator.validate(spec);
}

/**
 * Schema compatibility checker
 */
class SchemaCompatibilityChecker {
  /**
   * Check if a spec version is compatible with current version
   * @param {string} specVersion
   * @param {string} currentVersion
   * @returns {boolean}
   */
  static isCompatible(specVersion, currentVersion = DESIGN_SPEC_VERSION) {
    const parseVersion = (version) => {
      const parts = version.split('.');
      return {
        major: parseInt(parts[0]) || 0,
        minor: parseInt(parts[1]) || 0,
        patch: parseInt(parts[2]) || 0
      };
    };

    const spec = parseVersion(specVersion);
    const current = parseVersion(currentVersion);

    // Major version must match
    return spec.major === current.major;
  }

  /**
   * Get migration path from one version to another
   * @param {string} fromVersion
   * @param {string} toVersion
   * @returns {string[]}
   */
  static getMigrationPath(fromVersion, toVersion) {
    // Simplified migration path
    return [fromVersion, toVersion];
  }
}

module.exports = {
  DesignSpecValidator,
  validateDesignSpec,
  SchemaCompatibilityChecker,
  DESIGN_SPEC_VERSION
};