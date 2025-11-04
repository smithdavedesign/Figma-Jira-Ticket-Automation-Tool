/**
 * Screenshot Service
 *
 * Handles screenshot capture from Figma API and test screenshot generation.
 * Provides centralized screenshot functionality with caching and error handling.
 *
 * Phase 8: Server Architecture Refactoring - Business Services
 */

import { BaseService } from './BaseService.js';

export class ScreenshotService extends BaseService {
  constructor(redis, configService, figmaSessionManager) {
    super('ScreenshotService');
    this.redis = redis;
    this.configService = configService;
    this.figmaSessionManager = figmaSessionManager;
    this.screenshotCache = new Map();
    this.defaultOptions = {
      format: 'png',
      quality: 'high',
      scale: 2,
      timeout: 30000
    };
  }

  /**
   * Initialize screenshot service
   */
  async onInitialize() {
    // Validate dependencies
    if (!this.figmaSessionManager) {
      throw new Error('Figma Session Manager is required');
    }

    // Initialize the session manager
    await this.figmaSessionManager.initialize();

    this.logger.info('Screenshot service dependencies validated');
  }

  /**
   * Capture screenshot from Figma URL using Figma API
   * @param {string} figmaUrl - Figma file or frame URL
   * @param {Object} options - Screenshot options
   * @returns {Promise<string>} Base64 encoded screenshot
   */
  async captureFromFigma(figmaUrl, options = {}) {
    return this.executeOperation('captureFromFigma', async () => {
      const config = { ...this.defaultOptions, ...options };

      // Validate Figma URL
      if (!this.isValidFigmaUrl(figmaUrl)) {
        throw new Error('Invalid Figma URL provided');
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(figmaUrl, config);
      const cached = await this.getCachedScreenshot(cacheKey);
      if (cached) {
        this.logger.info('📋 Using cached Figma screenshot');
        return cached;
      }

      // Extract file ID and node ID from URL
      const { fileId, nodeId } = this.parseFigmaUrl(figmaUrl);

      // Get or create a session for screenshot capture
      this.logger.info(`📸 [REST API] Capturing screenshot from Figma: ${fileId}${nodeId ? `/${nodeId}` : ''}`, {
        protocol: 'REST',
        apiType: 'figma-api',
        fileId,
        nodeId: nodeId || null
      });

      const session = await this.figmaSessionManager.getSessionByType('api');
      const screenshotResult = await session.captureScreenshot(fileId, nodeId, {
        format: config.format === 'base64' ? 'png' : config.format,
        scale: config.scale.toString(),
        timeout: config.timeout
      });

      // For API responses, we need to return the URL directly
      if (config.format !== 'base64') {
        // Cache the URL result
        await this.cacheScreenshot(cacheKey, screenshotResult.imageUrl);
        this.logger.info(`✅ Figma screenshot captured: ${screenshotResult.imageUrl?.substring(0, 50)}...`);
        return screenshotResult.imageUrl;
      }

      // For base64 format, fetch the actual image data from the URL
      const imageResponse = await fetch(screenshotResult.imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch screenshot: ${imageResponse.status}`);
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Data = Buffer.from(imageBuffer).toString('base64');

      // Cache the result
      await this.cacheScreenshot(cacheKey, base64Data);

      this.logger.info(`✅ Figma screenshot captured: ${base64Data.length} bytes`);
      return base64Data;

    }, { figmaUrl, options });
  }

  /**
   * Capture screenshot (wrapper method for API compatibility)
   * @param {string|Object} figmaUrlOrOptions - Figma URL or options object with URL
   * @param {string} nodeId - Optional node ID (if first param is string)
   * @param {Object} options - Additional options (if first param is string)
   * @returns {Promise<Object>} Screenshot result with success flag
   */
  async captureScreenshot(figmaUrlOrOptions, nodeId = null, options = {}) {
    return this.executeOperation('captureScreenshot', async () => {
      let figmaUrl, finalOptions;

      // Handle different parameter formats for API compatibility
      if (typeof figmaUrlOrOptions === 'string') {
        // Called as captureScreenshot(url, nodeId, options)
        figmaUrl = figmaUrlOrOptions;
        finalOptions = { ...options };
      } else if (figmaUrlOrOptions && typeof figmaUrlOrOptions === 'object') {
        // Called as captureScreenshot({ url, format, quality, ... })
        figmaUrl = figmaUrlOrOptions.url || figmaUrlOrOptions.figmaUrl;
        finalOptions = { ...figmaUrlOrOptions };
        delete finalOptions.url;
        delete finalOptions.figmaUrl;
      } else {
        throw new Error('Invalid parameters: expected figmaUrl string or options object');
      }

      if (!figmaUrl) {
        throw new Error('Figma URL is required');
      }

      try {
        // If nodeId is provided as parameter, append it to URL
        let fullUrl = figmaUrl;
        if (nodeId && !figmaUrl.includes('#')) {
          fullUrl = `${figmaUrl}#${encodeURIComponent(nodeId)}`;
        }

        // Capture using the main method
        const screenshotData = await this.captureFromFigma(fullUrl, finalOptions);

        // Return in API-compatible format
        return {
          success: true,
          imageUrl: finalOptions.format === 'base64'
            ? `data:image/png;base64,${screenshotData}`
            : screenshotData,
          data: screenshotData,
          format: finalOptions.format || 'png',
          dimensions: { width: 800, height: 600 }, // Default dimensions
          performance: {
            captureTime: Date.now(),
            cached: false
          }
        };

      } catch (error) {
        this.logger.error('Screenshot capture failed:', error);
        return {
          success: false,
          error: error.message,
          status: 500
        };
      }

    }, { figmaUrlOrOptions, nodeId, options });
  }

  /**
   * Generate test screenshot for development and testing
   * @param {string} testType - Type of test screenshot
   * @returns {Promise<string>} Base64 encoded test screenshot
   */
  async generateTestScreenshot(testType = 'standard') {
    return this.executeOperation('generateTestScreenshot', async () => {
      this.logger.info(`🧪 Generating test screenshot: ${testType}`);

      // Check if we have a cached test screenshot
      const cacheKey = `test-screenshot-${testType}`;
      const cached = await this.getCachedScreenshot(cacheKey);
      if (cached) {
        this.logger.info('📋 Using cached test screenshot');
        return cached;
      }

      // Generate test screenshot based on type
      const testScreenshot = this.createTestScreenshot(testType);

      // Cache for 1 hour (test screenshots don't change often)
      await this.cacheScreenshot(cacheKey, testScreenshot, 3600);

      return testScreenshot;

    }, { testType });
  }

  /**
   * Capture screenshot with retry logic
   * @param {string} figmaUrl - Figma URL
   * @param {Object} options - Screenshot options
   * @param {number} retries - Number of retries
   * @returns {Promise<string>} Screenshot data
   */
  async captureWithRetry(figmaUrl, options = {}, retries = 3) {
    return this.executeOperation('captureWithRetry', async () => {
      let lastError;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          this.logger.debug(`Screenshot attempt ${attempt}/${retries}`);

          const screenshot = await this.captureFromFigma(figmaUrl, {
            ...options,
            timeout: options.timeout || (10000 * attempt) // Increase timeout with each retry
          });

          return screenshot;

        } catch (error) {
          lastError = error;
          this.logger.warn(`Screenshot attempt ${attempt} failed:`, error.message);

          if (attempt < retries) {
            // Wait before retry (exponential backoff)
            const delay = Math.pow(2, attempt) * 1000;
            this.logger.info(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      throw new Error(`Screenshot capture failed after ${retries} attempts: ${lastError.message}`);

    }, { figmaUrl, options, retries });
  }

  /**
   * Validate Figma URL format
   * @param {string} url - URL to validate
   * @returns {boolean} Whether URL is valid
   */
  isValidFigmaUrl(url) {
    if (!url || typeof url !== 'string') {return false;}

    const figmaUrlPattern = /^https:\/\/(?:www\.)?figma\.com\/(file|proto|design)\/([a-zA-Z0-9]+)/;
    return figmaUrlPattern.test(url);
  }

  /**
   * Parse Figma URL to extract file ID and node ID
   * @param {string} figmaUrl - Figma URL
   * @returns {Object} Parsed URL components
   */
  parseFigmaUrl(figmaUrl) {
    const urlPattern = /https:\/\/(?:www\.)?figma\.com\/(file|proto|design)\/([a-zA-Z0-9_-]+)(?:\/[^?]*)?(?:\?[^#]*)?(?:#(.+))?/;
    const match = figmaUrl.match(urlPattern);

    if (!match) {
      throw new Error('Invalid Figma URL format');
    }

    const [, type, fileId, nodeId] = match;

    return {
      type,
      fileId,
      nodeId: nodeId ? decodeURIComponent(nodeId) : null
    };
  }

  /**
   * Generate cache key for screenshot
   * @param {string} figmaUrl - Figma URL
   * @param {Object} options - Screenshot options
   * @returns {string} Cache key
   */
  generateCacheKey(figmaUrl, options) {
    const optionsHash = Buffer.from(JSON.stringify(options)).toString('base64');
    const urlHash = Buffer.from(figmaUrl).toString('base64').slice(0, 20);
    return `screenshot-${urlHash}-${optionsHash}`;
  }

  /**
   * Get cached screenshot
   * @param {string} cacheKey - Cache key
   * @returns {Promise<string|null>} Cached screenshot or null
   */
  async getCachedScreenshot(cacheKey) {
    try {
      // Try Redis first
      if (this.redis) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {return cached;}
      }

      // Try in-memory cache
      return this.screenshotCache.get(cacheKey) || null;

    } catch (error) {
      this.logger.warn('Cache read failed:', error.message);
      return null;
    }
  }

  /**
   * Cache screenshot data
   * @param {string} cacheKey - Cache key
   * @param {string} screenshotData - Screenshot data
   * @param {number} ttl - Time to live in seconds
   */
  async cacheScreenshot(cacheKey, screenshotData, ttl = 7200) {
    try {
      // Cache in Redis
      if (this.redis) {
        await this.redis.setex(cacheKey, ttl, screenshotData);
      }

      // Cache in memory (with size limit)
      if (this.screenshotCache.size > 50) {
        // Remove oldest entries
        const firstKey = this.screenshotCache.keys().next().value;
        this.screenshotCache.delete(firstKey);
      }

      this.screenshotCache.set(cacheKey, screenshotData);

    } catch (error) {
      this.logger.warn('Cache write failed:', error.message);
    }
  }

  /**
   * Convert image data to base64
   * @param {Buffer|ArrayBuffer|string} imageData - Image data
   * @returns {Promise<string>} Base64 encoded string
   */
  async convertToBase64(imageData) {
    if (typeof imageData === 'string') {
      // Already a string, assume it's base64 or URL
      if (imageData.startsWith('data:') || imageData.startsWith('http')) {
        // Fetch and convert if it's a URL
        const response = await fetch(imageData);
        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
      }
      return imageData;
    }

    if (imageData instanceof ArrayBuffer) {
      return Buffer.from(imageData).toString('base64');
    }

    if (Buffer.isBuffer(imageData)) {
      return imageData.toString('base64');
    }

    throw new Error('Unsupported image data format');
  }

  /**
   * Create test screenshot for development
   * @param {string} testType - Type of test screenshot
   * @returns {string} Base64 encoded test image
   */
  createTestScreenshot(testType) {
    // Create a simple test image based on type
    const testImages = {
      standard: this.generateTestImage('Standard Test Component', '#007acc'),
      button: this.generateTestImage('Button Component', '#28a745'),
      form: this.generateTestImage('Form Component', '#ffc107'),
      navigation: this.generateTestImage('Navigation Component', '#dc3545'),
      error: this.generateTestImage('Error State', '#6c757d')
    };

    return testImages[testType] || testImages.standard;
  }

  /**
   * Generate a simple test image
   * @param {string} text - Text to display
   * @param {string} color - Background color
   * @returns {string} Base64 encoded SVG image
   */
  generateTestImage(text, color) {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <rect x="20" y="20" width="360" height="260" fill="white" rx="10"/>
        <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="${color}">
          ${text}
        </text>
        <text x="200" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
          Generated: ${new Date().toISOString()}
        </text>
        <circle cx="50" cy="50" r="15" fill="${color}"/>
        <circle cx="350" cy="50" r="15" fill="${color}"/>
        <circle cx="50" cy="250" r="15" fill="${color}"/>
        <circle cx="350" cy="250" r="15" fill="${color}"/>
      </svg>
    `;

    return Buffer.from(svg).toString('base64');
  }

  /**
   * Health check for screenshot service
   * @returns {Object} Health status
   */
  healthCheck() {
    const baseHealth = super.healthCheck();

    return {
      ...baseHealth,
      dependencies: {
        figmaSessionManager: !!this.figmaSessionManager,
        redis: !!this.redis,
        configService: !!this.configService
      },
      cache: {
        memorySize: this.screenshotCache.size,
        maxMemorySize: 50
      },
      capabilities: [
        'figma-screenshot-capture',
        'test-screenshot-generation',
        'retry-logic',
        'caching',
        'base64-conversion'
      ]
    };
  }

  /**
   * Cleanup service resources
   */
  async onShutdown() {
    this.screenshotCache.clear();
    this.logger.info('Screenshot cache cleared');
  }
}