/**
 * Context Layer Client
 * 
 * JavaScript client library for interacting with the Figma Context Layer API
 * Provides easy-to-use methods for managing context data from the UI
 */

class ContextLayerClient {
  constructor(baseUrl = 'http://localhost:3000/api/figma') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  /**
   * Make HTTP request with error handling
   * @private
   */
  async _request(url, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`Context Layer API Error [${url}]:`, error);
      throw error;
    }
  }

  // =============================================================================
  // CONTEXT DATA MANAGEMENT
  // =============================================================================

  /**
   * Get context data for a Figma file
   * @param {string} fileKey - Figma file key
   * @param {Object} options - Options
   * @returns {Promise<Object>} Context data
   */
  async getContext(fileKey, options = {}) {
    const { nodeId, includeMetadata = true, useCache = true } = options;

    // Check local cache first
    const cacheKey = `${fileKey}${nodeId ? `-${nodeId}` : ''}`;
    if (useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const params = new URLSearchParams();
    if (nodeId) params.set('nodeId', nodeId);
    if (includeMetadata !== undefined) params.set('includeMetadata', includeMetadata);

    const url = `/context/${fileKey}${params.toString() ? `?${params}` : ''}`;
    const result = await this._request(url);

    // Cache the result
    if (useCache) {
      this.cache.set(cacheKey, result);
      // Auto-expire cache after 5 minutes
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
    }

    return result;
  }

  /**
   * Store context data for a Figma file
   * @param {string} fileKey - Figma file key
   * @param {Object} context - Context data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Storage result
   */
  async storeContext(fileKey, context, options = {}) {
    const { nodeId, metadata = {} } = options;

    const result = await this._request(`/context/${fileKey}`, {
      method: 'POST',
      body: JSON.stringify({
        context,
        nodeId,
        metadata
      })
    });

    // Update local cache
    const cacheKey = `${fileKey}${nodeId ? `-${nodeId}` : ''}`;
    this.cache.set(cacheKey, { 
      fileKey, 
      nodeId, 
      context, 
      metadata: { ...metadata, stored: new Date().toISOString() }
    });

    return result;
  }

  /**
   * Update existing context data
   * @param {string} fileKey - Figma file key
   * @param {Object} context - Context data updates
   * @param {Object} options - Options
   * @returns {Promise<Object>} Update result
   */
  async updateContext(fileKey, context, options = {}) {
    const { nodeId, metadata = {}, merge = true } = options;

    const result = await this._request(`/context/${fileKey}`, {
      method: 'PUT',
      body: JSON.stringify({
        context,
        nodeId,
        metadata,
        merge
      })
    });

    // Update local cache
    const cacheKey = `${fileKey}${nodeId ? `-${nodeId}` : ''}`;
    if (this.cache.has(cacheKey)) {
      const existing = this.cache.get(cacheKey);
      const updatedContext = merge ? { ...existing.context, ...context } : context;
      this.cache.set(cacheKey, { 
        ...existing, 
        context: updatedContext,
        metadata: { ...existing.metadata, ...metadata, updated: new Date().toISOString() }
      });
    }

    return result;
  }

  /**
   * Delete context data
   * @param {string} fileKey - Figma file key
   * @param {Object} options - Options
   * @returns {Promise<Object>} Deletion result
   */
  async deleteContext(fileKey, options = {}) {
    const { nodeId } = options;

    const params = new URLSearchParams();
    if (nodeId) params.set('nodeId', nodeId);

    const url = `/context/${fileKey}${params.toString() ? `?${params}` : ''}`;
    const result = await this._request(url, { method: 'DELETE' });

    // Remove from local cache
    const cacheKey = `${fileKey}${nodeId ? `-${nodeId}` : ''}`;
    this.cache.delete(cacheKey);

    return result;
  }

  // =============================================================================
  // CONTEXT UTILITIES
  // =============================================================================

  /**
   * Get context summary for a file
   * @param {string} fileKey - Figma file key
   * @returns {Promise<Object>} Context summary
   */
  async getContextSummary(fileKey) {
    return await this._request(`/context-summary/${fileKey}`);
  }

  /**
   * Search context data
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchContext(query, options = {}) {
    const { fileKeys = [], nodeTypes = [], limit = 20 } = options;

    return await this._request('/context-search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        fileKeys,
        nodeTypes,
        limit
      })
    });
  }

  // =============================================================================
  // CONVENIENCE METHODS
  // =============================================================================

  /**
   * Extract and store context from a Figma URL
   * @param {string} figmaUrl - Figma file URL
   * @param {Object} options - Options
   * @returns {Promise<Object>} Extracted context
   */
  async extractAndStore(figmaUrl, options = {}) {
    const { storeResult = true, includeScreenshot = false } = options;

    // First extract context
    const extractResult = await this._request('/extract-context', {
      method: 'POST',
      body: JSON.stringify({
        figmaUrl,
        includeScreenshot,
        testMode: false
      })
    });

    if (storeResult && extractResult.success) {
      const fileKey = this._extractFileKeyFromUrl(figmaUrl);
      if (fileKey) {
        await this.storeContext(fileKey, extractResult.data.context, {
          metadata: {
            source: 'extracted',
            figmaUrl,
            extractedAt: new Date().toISOString()
          }
        });
      }
    }

    return extractResult;
  }

  /**
   * Get or extract context (tries cache first, then extraction)
   * @param {string} figmaUrl - Figma file URL
   * @param {Object} options - Options
   * @returns {Promise<Object>} Context data
   */
  async getOrExtract(figmaUrl, options = {}) {
    const fileKey = this._extractFileKeyFromUrl(figmaUrl);
    if (!fileKey) {
      throw new Error('Invalid Figma URL');
    }

    try {
      // Try to get existing context first
      const existing = await this.getContext(fileKey, options);
      if (existing.success && existing.data.context) {
        return existing;
      }
    } catch (error) {
      console.log('No existing context found, extracting fresh...');
    }

    // Extract fresh context
    return await this.extractAndStore(figmaUrl, { ...options, storeResult: true });
  }

  /**
   * Clear local cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Extract file key from Figma URL
   * @private
   */
  _extractFileKeyFromUrl(figmaUrl) {
    const match = figmaUrl.match(/figma\.com\/file\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Format context data for display
   * @param {Object} contextData - Raw context data
   * @returns {Object} Formatted context
   */
  formatContext(contextData) {
    if (!contextData || !contextData.context) return null;

    const context = contextData.context;
    
    return {
      summary: {
        confidence: context.confidence || 0,
        nodesAnalyzed: context.nodesAnalyzed || 0,
        componentsFound: context.componentsFound || 0,
        stylesExtracted: context.stylesExtracted || 0
      },
      
      extractors: context.extractors || [],
      
      nodes: context.nodes || [],
      
      styles: context.styles || [],
      
      components: context.components || [],
      
      metadata: {
        timestamp: contextData.timestamp,
        fileKey: contextData.fileKey,
        nodeId: contextData.nodeId,
        cached: contextData.cached || false
      }
    };
  }

  /**
   * Validate context data structure
   * @param {Object} context - Context data to validate
   * @returns {Object} Validation result
   */
  validateContext(context) {
    const errors = [];
    const warnings = [];

    if (!context) {
      errors.push('Context data is null or undefined');
      return { valid: false, errors, warnings };
    }

    // Check required fields
    if (typeof context.confidence !== 'number') {
      warnings.push('Missing or invalid confidence score');
    }

    if (!Array.isArray(context.extractors)) {
      warnings.push('Missing or invalid extractors array');
    }

    if (!Array.isArray(context.nodes)) {
      warnings.push('Missing or invalid nodes array');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score: this._calculateValidationScore(context)
    };
  }

  /**
   * Calculate validation score
   * @private
   */
  _calculateValidationScore(context) {
    let score = 0;
    
    if (typeof context.confidence === 'number') score += 20;
    if (Array.isArray(context.extractors) && context.extractors.length > 0) score += 20;
    if (Array.isArray(context.nodes) && context.nodes.length > 0) score += 20;
    if (Array.isArray(context.styles) && context.styles.length > 0) score += 20;
    if (Array.isArray(context.components) && context.components.length > 0) score += 20;
    
    return score;
  }
}

// =============================================================================
// GLOBAL INSTANCE AND CONVENIENCE FUNCTIONS
// =============================================================================

// Create global instance
window.ContextLayer = new ContextLayerClient();

// Convenience functions for quick access
window.getContext = (fileKey, options) => window.ContextLayer.getContext(fileKey, options);
window.storeContext = (fileKey, context, options) => window.ContextLayer.storeContext(fileKey, context, options);
window.searchContext = (query, options) => window.ContextLayer.searchContext(query, options);
window.extractContext = (figmaUrl, options) => window.ContextLayer.extractAndStore(figmaUrl, options);

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextLayerClient;
}