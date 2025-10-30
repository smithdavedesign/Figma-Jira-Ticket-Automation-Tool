/**
 * Data Validator Implementation
 *
 * Validates extracted Figma data for completeness and correctness.
 */

export class DataValidator {
  constructor(options = {}) {
    this.strictMode = options.strictMode || false;
    this.requiredFields = options.requiredFields || ['id', 'name', 'type'];
  }

  /**
   * Validate extraction result
   */
  async validate(extractionResult) {
    const errors = [];
    const warnings = [];

    try {
      // Validate structure
      if (!extractionResult) {
        errors.push('Extraction result is null or undefined');
        return { valid: false, errors, warnings };
      }

      // Validate metadata
      if (extractionResult.metadata) {
        const metadataValidation = this.validateMetadata(extractionResult.metadata);
        errors.push(...metadataValidation.errors);
        warnings.push(...metadataValidation.warnings);
      }

      // Validate design tokens
      if (extractionResult.designTokens) {
        const tokensValidation = this.validateDesignTokens(extractionResult.designTokens);
        errors.push(...tokensValidation.errors);
        warnings.push(...tokensValidation.warnings);
      }

      // Validate assets
      if (extractionResult.assets) {
        const assetsValidation = this.validateAssets(extractionResult.assets);
        errors.push(...assetsValidation.errors);
        warnings.push(...assetsValidation.warnings);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error.message}`],
        warnings
      };
    }
  }

  /**
   * Validate metadata array
   */
  validateMetadata(metadata) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(metadata)) {
      errors.push('Metadata must be an array');
      return { errors, warnings };
    }

    for (let i = 0; i < metadata.length; i++) {
      const node = metadata[i];
      const nodeErrors = this.validateNode(node, `metadata[${i}]`);
      errors.push(...nodeErrors);
    }

    if (metadata.length === 0) {
      warnings.push('No metadata nodes found');
    }

    return { errors, warnings };
  }

  /**
   * Validate individual node
   */
  validateNode(node, path = 'node') {
    const errors = [];

    if (!node || typeof node !== 'object') {
      errors.push(`${path} is not a valid object`);
      return errors;
    }

    // Check required fields
    for (const field of this.requiredFields) {
      if (node[field] === undefined || node[field] === null) {
        errors.push(`${path}.${field} is required but missing`);
      }
    }

    // Validate specific field types
    if (node.id && typeof node.id !== 'string') {
      errors.push(`${path}.id must be a string`);
    }

    if (node.name && typeof node.name !== 'string') {
      errors.push(`${path}.name must be a string`);
    }

    if (node.type && typeof node.type !== 'string') {
      errors.push(`${path}.type must be a string`);
    }

    if (node.bounds && typeof node.bounds !== 'object') {
      errors.push(`${path}.bounds must be an object`);
    }

    // Validate children recursively
    if (node.children && Array.isArray(node.children)) {
      for (let i = 0; i < node.children.length; i++) {
        const childErrors = this.validateNode(node.children[i], `${path}.children[${i}]`);
        errors.push(...childErrors);
      }
    }

    return errors;
  }

  /**
   * Validate design tokens
   */
  validateDesignTokens(tokens) {
    const errors = [];
    const warnings = [];

    if (!tokens || typeof tokens !== 'object') {
      errors.push('Design tokens must be an object');
      return { errors, warnings };
    }

    // Check for expected token categories
    const expectedCategories = ['colors', 'typography', 'spacing'];
    let hasAnyTokens = false;

    for (const category of expectedCategories) {
      if (tokens[category] && typeof tokens[category] === 'object') {
        const categoryTokens = Object.keys(tokens[category]);
        if (categoryTokens.length > 0) {
          hasAnyTokens = true;
        }
      }
    }

    if (!hasAnyTokens) {
      warnings.push('No design tokens found in expected categories');
    }

    // Validate color tokens
    if (tokens.colors) {
      for (const [name, token] of Object.entries(tokens.colors)) {
        if (!token.value) {
          errors.push(`Color token '${name}' missing value`);
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate assets
   */
  validateAssets(assets) {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(assets)) {
      errors.push('Assets must be an array');
      return { errors, warnings };
    }

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      if (!asset.nodeId) {
        errors.push(`assets[${i}].nodeId is required`);
      }

      if (!asset.type) {
        errors.push(`assets[${i}].type is required`);
      }

      if (asset.url && typeof asset.url !== 'string') {
        errors.push(`assets[${i}].url must be a string`);
      }
    }

    if (assets.length === 0) {
      warnings.push('No assets found');
    }

    return { errors, warnings };
  }

  /**
   * Validate specific data types
   */
  validateDataTypes(data, schema) {
    const errors = [];

    for (const [key, expectedType] of Object.entries(schema)) {
      const value = data[key];

      if (value === undefined || value === null) {
        if (this.strictMode) {
          errors.push(`${key} is required but missing`);
        }
        continue;
      }

      const actualType = Array.isArray(value) ? 'array' : typeof value;

      if (actualType !== expectedType) {
        errors.push(`${key} expected ${expectedType} but got ${actualType}`);
      }
    }

    return errors;
  }
}

/**
 * Performance Monitor Implementation
 */
export class PerformanceMonitor {
  constructor() {
    this.timers = new Map();
    this.metrics = {
      totalTime: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      operations: []
    };
  }

  startTimer(operation) {
    const timerId = `${operation}_${Date.now()}_${Math.random()}`;
    this.timers.set(timerId, {
      operation,
      startTime: performance.now()
    });
    return timerId;
  }

  endTimer(timerId) {
    const timer = this.timers.get(timerId);
    if (!timer) {return;}

    const endTime = performance.now();
    const duration = endTime - timer.startTime;

    this.metrics.operations.push({
      operation: timer.operation,
      duration,
      timestamp: new Date().toISOString()
    });

    this.metrics.totalTime += duration;
    this.timers.delete(timerId);

    return duration;
  }

  recordApiCall() {
    this.metrics.apiCalls++;
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) || 0,
      averageOperationTime: this.metrics.operations.length > 0
        ? this.metrics.totalTime / this.metrics.operations.length
        : 0
    };
  }

  reset() {
    this.timers.clear();
    this.metrics = {
      totalTime: 0,
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      operations: []
    };
  }
}