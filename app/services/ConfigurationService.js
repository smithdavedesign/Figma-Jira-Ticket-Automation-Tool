/**
 * Configuration Service
 *
 * Handles centralized configuration management, environment variables,
 * and dynamic configuration updates for the application.
 *
 * Phase 8: Server Architecture Refactoring - Business Services
 */

import { BaseService } from './BaseService.js';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export class ConfigurationService extends BaseService {
  constructor(redis) {
    super('ConfigurationService');
    this.redis = redis;
    this.config = new Map();
    this.watchers = new Map();
    this.configPath = join(process.cwd(), 'config');
    this.envOverrides = new Map();
    this.defaultConfig = this.initializeDefaultConfig();
  }

  /**
   * Initialize configuration service
   */
  async onInitialize() {
    // Load environment variables
    await this.loadEnvironmentConfig();

    // Load configuration files
    await this.loadConfigFiles();

    // Load cached config from Redis
    await this.loadCachedConfig();

    // Merge all configurations
    this.mergeConfigurations();

    this.logger.info(`Configuration loaded: ${this.config.size} settings`);
  }

  /**
   * Initialize default configuration
   * @returns {Map} Default configuration
   */
  initializeDefaultConfig() {
    const defaults = new Map();

    // Server configuration
    defaults.set('server.port', 3000);
    defaults.set('server.host', 'localhost');
    defaults.set('server.timeout', 30000);
    defaults.set('server.cors.enabled', true);
    defaults.set('server.cors.origins', ['http://localhost:3000']);

    // Logging configuration
    defaults.set('logging.level', 'info');
    defaults.set('logging.file.enabled', true);
    defaults.set('logging.console.enabled', true);
    defaults.set('logging.directory', 'logs');

    // AI configuration
    defaults.set('ai.provider', 'gemini');
    defaults.set('ai.model', 'gemini-2.0-flash');
    defaults.set('ai.temperature', 0.7);
    defaults.set('ai.maxTokens', 2000);
    defaults.set('ai.timeout', 30000);

    // Figma configuration
    defaults.set('figma.api.timeout', 30000);
    defaults.set('figma.api.retries', 3);
    defaults.set('figma.screenshots.quality', 'high');
    defaults.set('figma.screenshots.scale', 2);
    defaults.set('figma.screenshots.format', 'png');

    // Cache configuration
    defaults.set('cache.redis.enabled', true);
    defaults.set('cache.redis.ttl', 3600);
    defaults.set('cache.memory.enabled', true);
    defaults.set('cache.memory.maxSize', 100);

    // Testing configuration
    defaults.set('testing.enabled', true);
    defaults.set('testing.scenarios.autoload', true);
    defaults.set('testing.performance.tracking', true);
    defaults.set('testing.history.maxSize', 100);

    // Security configuration
    defaults.set('security.rateLimit.enabled', true);
    defaults.set('security.rateLimit.windowMs', 900000); // 15 minutes
    defaults.set('security.rateLimit.max', 100);
    defaults.set('security.cors.credentials', false);

    return defaults;
  }

  /**
   * Load environment variables into configuration
   */
  async loadEnvironmentConfig() {
    const envMappings = {
      'PORT': 'server.port',
      'HOST': 'server.host',
      'LOG_LEVEL': 'logging.level',
      'GEMINI_API_KEY': 'ai.apiKey',
      'FIGMA_ACCESS_TOKEN': 'figma.accessToken',
      'REDIS_URL': 'cache.redis.url',
      'NODE_ENV': 'environment.mode'
    };

    for (const [envVar, configKey] of Object.entries(envMappings)) {
      const value = process.env[envVar];
      if (value !== undefined) {
        this.envOverrides.set(configKey, this.parseConfigValue(value));
      }
    }

    this.logger.debug(`Loaded ${this.envOverrides.size} environment overrides`);
  }

  /**
   * Load configuration from files
   */
  async loadConfigFiles() {
    const configFiles = [
      'server.config.js',
      'ai.config.js',
      'figma.config.js',
      'cache.config.js'
    ];

    for (const fileName of configFiles) {
      try {
        const filePath = join(this.configPath, fileName);

        if (existsSync(filePath)) {
          const configModule = await import(filePath);
          const config = configModule.default || configModule;

          this.flattenAndStoreConfig(config, fileName.replace('.config.js', ''));
        }
      } catch (error) {
        this.logger.warn(`Failed to load config file ${fileName}:`, error.message);
      }
    }
  }

  /**
   * Load cached configuration from Redis
   */
  async loadCachedConfig() {
    if (!this.redis) {return;}

    try {
      const cachedConfig = await this.redis.get('app-config');
      if (cachedConfig) {
        const parsed = JSON.parse(cachedConfig);
        for (const [key, value] of Object.entries(parsed)) {
          this.config.set(key, value);
        }
        this.logger.debug('Loaded cached configuration from Redis');
      }
    } catch (error) {
      this.logger.warn('Failed to load cached config:', error.message);
    }
  }

  /**
   * Merge all configurations with proper precedence
   * Order: defaults < files < environment < runtime overrides
   */
  mergeConfigurations() {
    const mergedConfig = new Map();

    // Start with defaults
    for (const [key, value] of this.defaultConfig) {
      mergedConfig.set(key, value);
    }

    // Override with file-based config
    for (const [key, value] of this.config) {
      mergedConfig.set(key, value);
    }

    // Override with environment variables
    for (const [key, value] of this.envOverrides) {
      mergedConfig.set(key, value);
    }

    this.config = mergedConfig;
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key (dot notation supported)
   * @param {*} defaultValue - Default value if not found
   * @returns {*} Configuration value
   */
  get(key, defaultValue = null) {
    const value = this.config.get(key);

    if (value === undefined || value === null) {
      return defaultValue;
    }

    return value;
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   * @param {boolean} persist - Whether to persist to Redis
   */
  async set(key, value, persist = true) {
    this.config.set(key, value);

    if (persist && this.redis) {
      try {
        // Update cached config
        const configObject = Object.fromEntries(this.config);
        await this.redis.setex('app-config', 86400, JSON.stringify(configObject));

        // Notify watchers
        this.notifyWatchers(key, value);

      } catch (error) {
        this.logger.warn('Failed to persist configuration:', error.message);
      }
    }

    this.logger.debug(`Configuration updated: ${key} = ${value}`);
  }

  /**
   * Get configuration section
   * @param {string} section - Section prefix (e.g., 'server', 'ai')
   * @returns {Object} Configuration section
   */
  getSection(section) {
    const sectionConfig = {};
    const prefix = section + '.';

    for (const [key, value] of this.config) {
      if (key.startsWith(prefix)) {
        const subKey = key.slice(prefix.length);
        this.setNestedProperty(sectionConfig, subKey, value);
      }
    }

    return sectionConfig;
  }

  /**
   * Update configuration section
   * @param {string} section - Section name
   * @param {Object} config - Configuration object
   * @param {boolean} persist - Whether to persist changes
   */
  async updateSection(section, config, persist = true) {
    const flatConfig = this.flattenObject(config, section);

    for (const [key, value] of Object.entries(flatConfig)) {
      await this.set(key, value, false); // Don't persist individual updates
    }

    if (persist && this.redis) {
      // Persist all changes at once
      const configObject = Object.fromEntries(this.config);
      await this.redis.setex('app-config', 86400, JSON.stringify(configObject));
    }

    this.logger.info(`Configuration section updated: ${section}`);
  }

  /**
   * Watch for configuration changes
   * @param {string} key - Configuration key to watch
   * @param {Function} callback - Callback function
   * @returns {string} Watcher ID
   */
  watch(key, callback) {
    const watcherId = `watcher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Map());
    }

    this.watchers.get(key).set(watcherId, callback);

    this.logger.debug(`Configuration watcher added: ${key} (${watcherId})`);

    return watcherId;
  }

  /**
   * Remove configuration watcher
   * @param {string} key - Configuration key
   * @param {string} watcherId - Watcher ID
   */
  unwatch(key, watcherId) {
    if (this.watchers.has(key)) {
      this.watchers.get(key).delete(watcherId);

      if (this.watchers.get(key).size === 0) {
        this.watchers.delete(key);
      }
    }

    this.logger.debug(`Configuration watcher removed: ${key} (${watcherId})`);
  }

  /**
   * Notify watchers of configuration changes
   * @param {string} key - Configuration key
   * @param {*} value - New value
   */
  notifyWatchers(key, value) {
    if (this.watchers.has(key)) {
      const keyWatchers = this.watchers.get(key);

      for (const [watcherId, callback] of keyWatchers) {
        try {
          callback(key, value);
        } catch (error) {
          this.logger.warn(`Configuration watcher error (${watcherId}):`, error.message);
        }
      }
    }
  }

  /**
   * Validate configuration
   * @returns {Object} Validation results
   */
  validateConfiguration() {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      missing: []
    };

    // Check required configurations
    const required = [
      'server.port',
      'logging.level'
    ];

    for (const key of required) {
      if (!this.config.has(key)) {
        validation.missing.push(key);
        validation.valid = false;
      }
    }

    // Check AI configuration if AI is enabled
    if (this.get('ai.enabled', true)) {
      if (!this.get('ai.apiKey')) {
        validation.warnings.push('AI API key not configured');
      }
    }

    // Check Figma configuration if Figma features are enabled
    if (this.get('figma.enabled', true)) {
      if (!this.get('figma.accessToken')) {
        validation.warnings.push('Figma access token not configured');
      }
    }

    // Validate port number
    const port = this.get('server.port');
    if (port < 1 || port > 65535) {
      validation.errors.push('Invalid server port number');
      validation.valid = false;
    }

    return validation;
  }

  /**
   * Get all configuration as object
   * @param {boolean} includeSecrets - Whether to include sensitive values
   * @returns {Object} Configuration object
   */
  getAll(includeSecrets = false) {
    const config = {};

    for (const [key, value] of this.config) {
      if (!includeSecrets && this.isSensitiveKey(key)) {
        continue;
      }

      this.setNestedProperty(config, key, value);
    }

    return config;
  }

  /**
   * Reset configuration to defaults
   * @param {Array} sections - Sections to reset (optional)
   */
  async resetToDefaults(sections = null) {
    if (sections) {
      // Reset specific sections
      for (const section of sections) {
        const prefix = section + '.';

        // Remove current section config
        const keysToRemove = [];
        for (const key of this.config.keys()) {
          if (key.startsWith(prefix)) {
            keysToRemove.push(key);
          }
        }

        for (const key of keysToRemove) {
          this.config.delete(key);
        }

        // Restore defaults for section
        for (const [key, value] of this.defaultConfig) {
          if (key.startsWith(prefix)) {
            this.config.set(key, value);
          }
        }
      }
    } else {
      // Reset all configuration
      this.config.clear();
      for (const [key, value] of this.defaultConfig) {
        this.config.set(key, value);
      }
    }

    // Re-apply environment overrides
    for (const [key, value] of this.envOverrides) {
      this.config.set(key, value);
    }

    // Persist changes
    if (this.redis) {
      const configObject = Object.fromEntries(this.config);
      await this.redis.setex('app-config', 86400, JSON.stringify(configObject));
    }

    this.logger.info('Configuration reset to defaults');
  }

  /**
   * Parse configuration value from string
   * @param {string} value - String value
   * @returns {*} Parsed value
   */
  parseConfigValue(value) {
    // Handle boolean values
    if (value === 'true') {return true;}
    if (value === 'false') {return false;}

    // Handle null/undefined
    if (value === 'null') {return null;}
    if (value === 'undefined') {return undefined;}

    // Handle numbers
    if (/^\d+$/.test(value)) {return parseInt(value, 10);}
    if (/^\d*\.\d+$/.test(value)) {return parseFloat(value);}

    // Handle JSON arrays/objects
    if (value.startsWith('[') || value.startsWith('{')) {
      try {
        return JSON.parse(value);
      } catch {
        // If JSON parsing fails, return as string
      }
    }

    return value;
  }

  /**
   * Flatten object into dot notation
   * @param {Object} obj - Object to flatten
   * @param {string} prefix - Key prefix
   * @returns {Object} Flattened object
   */
  flattenObject(obj, prefix = '') {
    const flattened = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  }

  /**
   * Flatten and store configuration from file
   * @param {Object} config - Configuration object
   * @param {string} section - Section name
   */
  flattenAndStoreConfig(config, section) {
    const flattened = this.flattenObject(config, section);

    for (const [key, value] of Object.entries(flattened)) {
      this.config.set(key, value);
    }
  }

  /**
   * Set nested property in object
   * @param {Object} obj - Target object
   * @param {string} path - Property path (dot notation)
   * @param {*} value - Value to set
   */
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Check if configuration key is sensitive
   * @param {string} key - Configuration key
   * @returns {boolean} Whether key is sensitive
   */
  isSensitiveKey(key) {
    const sensitivePatterns = [
      /apikey/i,
      /token/i,
      /secret/i,
      /password/i,
      /key$/i
    ];

    return sensitivePatterns.some(pattern => pattern.test(key));
  }

  /**
   * Health check for configuration service
   * @returns {Object} Health status
   */
  healthCheck() {
    const baseHealth = super.healthCheck();
    const validation = this.validateConfiguration();

    return {
      ...baseHealth,
      configuration: {
        totalSettings: this.config.size,
        sections: this.getSectionNames(),
        validation: {
          valid: validation.valid,
          errors: validation.errors.length,
          warnings: validation.warnings.length,
          missing: validation.missing.length
        }
      },
      watchers: this.watchers.size,
      dependencies: {
        redis: !!this.redis
      },
      capabilities: [
        'environment-variables',
        'file-based-config',
        'runtime-updates',
        'configuration-watching',
        'validation',
        'persistence'
      ]
    };
  }

  /**
   * Get section names
   * @returns {Array} Section names
   */
  getSectionNames() {
    const sections = new Set();

    for (const key of this.config.keys()) {
      const firstDot = key.indexOf('.');
      if (firstDot > 0) {
        sections.add(key.substring(0, firstDot));
      }
    }

    return Array.from(sections);
  }

  /**
   * Cleanup service resources
   */
  async onShutdown() {
    this.watchers.clear();
    this.logger.info('Configuration watchers cleared');
  }
}