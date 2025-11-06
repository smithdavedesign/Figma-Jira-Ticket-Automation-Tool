/**
 * 🔧 Configuration Service
 *
 * Centralized configuration management to eliminate static values
 * and provide environment-specific settings for production deployment.
 *
 * Features:
 * - Environment variable loading with fallbacks
 * - Production-safe configuration validation
 * - Type-safe configuration access
 * - Dynamic configuration updates
 * - Configuration caching for performance
 */

const fs = require('fs');
const path = require('path');

class ConfigurationService {
  constructor() {
    this.config = null;
    this.configCache = new Map();
    this.lastConfigLoad = null;
    this.configFile = path.join(__dirname, '../../config/app.config.json');

    // Initialize configuration
    this.loadConfiguration();
  }

  /**
   * Load configuration from environment variables and config files
   */
  loadConfiguration() {
    try {
      const env = process.env.NODE_ENV || 'development';

      this.config = {
        // Environment info
        environment: env,
        isDevelopment: env === 'development',
        isProduction: env === 'production',

        // API Configuration
        api: {
          base: process.env.API_BASE || 'http://localhost:3000',
          figmaScreenshot: process.env.FIGMA_SCREENSHOT_API || 'http://localhost:3000/api/figma/screenshot',
          timeout: parseInt(process.env.API_TIMEOUT) || 30000
        },

        // Company/Organization URLs
        company: {
          testingStandardsUrl: process.env.COMPANY_TESTING_STANDARDS_URL || 'https://docs.company.com/testing',
          designSystemUrl: process.env.COMPANY_DESIGN_SYSTEM_URL || 'https://design.company.com',
          componentLibraryUrl: process.env.COMPANY_COMPONENT_LIBRARY_URL || 'https://components.company.com',
          accessibilityUrl: process.env.COMPANY_ACCESSIBILITY_URL || 'https://accessibility.company.com',
          name: process.env.COMPANY_NAME || 'Your Company'
        },

        // Team Configuration
        team: {
          name: process.env.DEFAULT_TEAM_NAME || 'Development Team',
          sprintPrefix: process.env.SPRINT_PREFIX || 'Sprint',
          defaultAssignee: process.env.DEFAULT_ASSIGNEE || null
        },

        // Ticket Generation Defaults
        tickets: {
          dueDateDays: parseInt(process.env.DEFAULT_DUE_DATE_DAYS) || 14,
          defaultPriority: process.env.DEFAULT_PRIORITY || 'Medium',
          defaultIssueType: process.env.DEFAULT_ISSUE_TYPE || 'Task',
          storyPointsEnabled: process.env.STORY_POINTS_ENABLED === 'true'
        },

        // Design System Defaults
        design: {
          defaultFontFamily: process.env.DEFAULT_FONT_FAMILY || 'Inter',
          defaultFontWeight: process.env.DEFAULT_FONT_WEIGHT || 'Regular',
          fallbackFileKey: process.env.FIGMA_FALLBACK_FILE_KEY || null
        },

        // Cache Configuration
        cache: {
          contextTtl: parseInt(process.env.CONTEXT_CACHE_TTL) || 300, // 5 minutes
          templateTtl: parseInt(process.env.TEMPLATE_CACHE_TTL) || 3600, // 1 hour
          enabled: process.env.CACHE_ENABLED !== 'false'
        },

        // Logging Configuration
        logging: {
          level: process.env.LOG_LEVEL || 'info',
          enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
          logDir: process.env.LOG_DIR || path.join(__dirname, '../../logs')
        },

        // Feature Flags
        features: {
          advancedContext: process.env.FEATURE_ADVANCED_CONTEXT !== 'false',
          designHealth: process.env.FEATURE_DESIGN_HEALTH !== 'false',
          aiIntegration: process.env.FEATURE_AI_INTEGRATION !== 'false',
          performanceMetrics: process.env.FEATURE_PERFORMANCE_METRICS !== 'false'
        },

        // Template Configuration
        template: {
          defaultPlatform: process.env.DEFAULT_TEMPLATE_PLATFORM || 'jira',
          defaultDocumentType: process.env.DEFAULT_DOCUMENT_TYPE || 'component',
          enableFallbacks: process.env.ENABLE_TEMPLATE_FALLBACKS !== 'false',
          templateDir: process.env.TEMPLATE_DIR || path.join(__dirname, '../../config/templates'),
          platforms: (process.env.TEMPLATE_PLATFORMS || 'jira,wiki,figma,storybook').split(','),
          documentTypes: (process.env.TEMPLATE_DOCUMENT_TYPES || 'component,feature,service,authoring').split(',')
        }
      };

      // Load additional configuration from file if exists
      this.loadConfigFile();

      // Validate critical configuration
      this.validateConfiguration();

      this.lastConfigLoad = Date.now();

      console.log(`🔧 Configuration loaded for ${env} environment`);

    } catch (error) {
      console.error('❌ Configuration loading failed:', error);
      throw new Error(`Configuration initialization failed: ${error.message}`);
    }
  }

  /**
   * Load additional configuration from JSON file
   */
  loadConfigFile() {
    try {
      if (fs.existsSync(this.configFile)) {
        const fileConfig = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));

        // Merge file configuration with environment configuration
        this.config = this.deepMerge(this.config, fileConfig);

        console.log('📄 Additional configuration loaded from file');
      }
    } catch (error) {
      console.warn('⚠️ Could not load configuration file:', error.message);
    }
  }

  /**
   * Validate critical configuration values
   */
  validateConfiguration() {
    const errors = [];

    // Validate required production settings
    if (this.config.isProduction) {
      if (this.config.company.testingStandardsUrl.includes('company.com')) {
        errors.push('Production deployment requires real COMPANY_TESTING_STANDARDS_URL');
      }

      if (this.config.company.designSystemUrl.includes('company.com')) {
        errors.push('Production deployment requires real COMPANY_DESIGN_SYSTEM_URL');
      }

      if (this.config.api.base.includes('localhost')) {
        errors.push('Production deployment requires real API_BASE (not localhost)');
      }
    }

    // Validate numeric values
    if (isNaN(this.config.tickets.dueDateDays) || this.config.tickets.dueDateDays < 1) {
      errors.push('DEFAULT_DUE_DATE_DAYS must be a positive number');
    }

    if (isNaN(this.config.api.timeout) || this.config.api.timeout < 1000) {
      errors.push('API_TIMEOUT must be at least 1000ms');
    }

    if (errors.length > 0) {
      console.error('❌ Configuration validation errors:');
      errors.forEach(error => console.error(`  - ${error}`));

      if (this.config.isProduction) {
        throw new Error('Configuration validation failed for production environment');
      } else {
        console.warn('⚠️ Configuration issues detected (development mode - continuing)');
      }
    }
  }

  /**
   * Get configuration value with dot notation support
   * @param {string} key - Configuration key (e.g., 'company.testingStandardsUrl')
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Configuration value
   */
  get(key, defaultValue = null) {
    if (!this.config) {
      this.loadConfiguration();
    }

    // Check cache first
    if (this.configCache.has(key)) {
      return this.configCache.get(key);
    }

    const value = this.getNestedValue(this.config, key) ?? defaultValue;

    // Cache the result
    this.configCache.set(key, value);

    return value;
  }

  /**
   * Get all configuration
   * @returns {object} Complete configuration object
   */
  getAll() {
    if (!this.config) {
      this.loadConfiguration();
    }

    return { ...this.config };
  }

  /**
   * Get company configuration
   * @returns {object} Company-specific configuration
   */
  getCompanyConfig() {
    return this.get('company', {});
  }

  /**
   * Get team configuration
   * @returns {object} Team-specific configuration
   */
  getTeamConfig() {
    return this.get('team', {});
  }

  /**
   * Get ticket generation configuration
   * @returns {object} Ticket generation defaults
   */
  getTicketConfig() {
    return this.get('tickets', {});
  }

  /**
   * Get design system configuration
   * @returns {object} Design system defaults
   */
  getDesignConfig() {
    return this.get('design', {});
  }

  /**
   * Get template system configuration
   * @returns {object} Template system configuration
   */
  getTemplateConfig() {
    return this.get('template', {});
  }

  /**
   * Check if feature is enabled
   * @param {string} featureName - Feature name
   * @returns {boolean} Feature enabled status
   */
  isFeatureEnabled(featureName) {
    return this.get(`features.${featureName}`, false);
  }

  /**
   * Get current sprint name
   * @returns {string} Current sprint name
   */
  getCurrentSprint() {
    const sprintPrefix = this.get('team.sprintPrefix', 'Sprint');
    const currentWeek = Math.ceil(new Date().getDate() / 7);
    return `${sprintPrefix} ${currentWeek}`;
  }

  /**
   * Get due date for tickets
   * @returns {string} ISO date string for due date
   */
  getTicketDueDate() {
    const days = this.get('tickets.dueDateDays', 14);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Reload configuration from environment and files
   */
  reload() {
    this.configCache.clear();
    this.loadConfiguration();
    console.log('🔄 Configuration reloaded');
  }

  /**
   * Get configuration age in milliseconds
   * @returns {number} Age in milliseconds
   */
  getConfigAge() {
    return this.lastConfigLoad ? Date.now() - this.lastConfigLoad : Infinity;
  }

  /**
   * Check if configuration needs refresh
   * @param {number} maxAge - Maximum age in milliseconds (default: 5 minutes)
   * @returns {boolean} True if configuration should be refreshed
   */
  needsRefresh(maxAge = 300000) {
    return this.getConfigAge() > maxAge;
  }

  // --- Private Helper Methods ---

  /**
   * Get nested object value using dot notation
   * @param {object} obj - Source object
   * @param {string} path - Dot notation path
   * @returns {*} Value or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Deep merge two objects
   * @param {object} target - Target object
   * @param {object} source - Source object
   * @returns {object} Merged object
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }
}

// Export singleton instance
module.exports = new ConfigurationService();