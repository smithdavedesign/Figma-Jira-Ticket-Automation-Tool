/**
 * Route Registry
 *
 * Handles automatic route discovery, registration, and dependency injection
 * for Express.js routes with the service container.
 *
 * Phase 8: Server Architecture Refactoring - Route Registry
 */

import { readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

export class RouteRegistry {
  constructor(app, serviceContainer, options = {}) {
    this.app = app;
    this.serviceContainer = serviceContainer;
    this.routes = new Map();
    this.middleware = new Map();
    this.routeGroups = new Map();

    // Configuration options
    this.options = {
      routesDirectory: options.routesDirectory || join(process.cwd(), 'app/routes'),
      middlewareDirectory: options.middlewareDirectory || join(process.cwd(), 'app/middleware'),
      autoLoad: options.autoLoad !== false,
      enableDependencyInjection: options.enableDependencyInjection !== false,
      enableMiddleware: options.enableMiddleware !== false,
      routePrefix: options.routePrefix || '/api',
      enableVersioning: options.enableVersioning || false,
      defaultVersion: options.defaultVersion || 'v1',
      enableMetrics: options.enableMetrics !== false,
      enableHealthChecks: options.enableHealthChecks !== false,
      ...options
    };

    this.logger = console; // Use service logger if available
    this.metrics = {
      routesRegistered: 0,
      middlewareRegistered: 0,
      requestCount: new Map(),
      errorCount: new Map(),
      responseTime: new Map()
    };
  }

  /**
   * Initialize the route registry
   */
  async initialize() {
    this.logger.info('Initializing Route Registry...');

    try {
      // Load middleware first
      if (this.options.enableMiddleware) {
        await this.loadMiddleware();
      }

      // Load and register routes
      if (this.options.autoLoad) {
        await this.loadRoutes();
      }

      // Setup global middleware
      this.setupGlobalMiddleware();

      // Setup health check routes if enabled
      if (this.options.enableHealthChecks) {
        this.setupHealthCheckRoutes();
      }

      // Setup metrics collection if enabled
      if (this.options.enableMetrics) {
        this.setupMetricsCollection();
      }

      this.logger.info(`Route Registry initialized: ${this.routes.size} routes, ${this.middleware.size} middleware`);

    } catch (error) {
      this.logger.error('Failed to initialize Route Registry:', error);
      throw error;
    }
  }

  /**
   * Load middleware from middleware directory
   */
  async loadMiddleware() {
    const middlewareDir = this.options.middlewareDirectory;

    try {
      if (!statSync(middlewareDir).isDirectory()) {
        this.logger.warn(`Middleware directory not found: ${middlewareDir}`);
        return;
      }

      const files = readdirSync(middlewareDir);

      for (const file of files) {
        if (this.isValidMiddlewareFile(file)) {
          await this.loadMiddlewareFile(join(middlewareDir, file));
        }
      }

      this.logger.info(`Loaded ${this.middleware.size} middleware modules`);

    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.warn('Error loading middleware:', error.message);
      }
    }
  }

  /**
   * Load routes from routes directory
   */
  async loadRoutes() {
    const routesDir = this.options.routesDirectory;

    try {
      if (!statSync(routesDir).isDirectory()) {
        this.logger.error(`Routes directory not found: ${routesDir}`);
        return;
      }

      await this.loadRoutesFromDirectory(routesDir);

      this.logger.info(`Loaded ${this.routes.size} route modules`);

    } catch (error) {
      this.logger.error('Error loading routes:', error);
      throw error;
    }
  }

  /**
   * Load routes from a directory recursively
   * @param {string} directory - Directory path
   * @param {string} parentGroup - Parent group name
   */
  async loadRoutesFromDirectory(directory, parentGroup = '') {
    const files = readdirSync(directory);

    for (const file of files) {
      const filePath = join(directory, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively load subdirectories
        const groupName = parentGroup ? `${parentGroup}/${file}` : file;
        await this.loadRoutesFromDirectory(filePath, groupName);

      } else if (this.isValidRouteFile(file)) {
        await this.loadRouteFile(filePath, parentGroup);
      }
    }
  }

  /**
   * Load a single route file
   * @param {string} filePath - Route file path
   * @param {string} group - Route group
   */
  async loadRouteFile(filePath, group = '') {
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(fileUrl);

      const RouteClass = module.default || module;

      if (typeof RouteClass !== 'function') {
        this.logger.warn(`Invalid route class in ${filePath}`);
        return;
      }

      // Create route instance with dependency injection
      const routeInstance = this.createRouteInstance(RouteClass, filePath);

      // Register the route
      const routeName = this.getRouteNameFromFile(filePath);
      const routeGroup = group || this.getRouteGroupFromPath(filePath);

      await this.registerRoute(routeName, routeInstance, routeGroup);

    } catch (error) {
      this.logger.error(`Failed to load route file ${filePath}:`, error);
    }
  }

  /**
   * Load a single middleware file
   * @param {string} filePath - Middleware file path
   */
  async loadMiddlewareFile(filePath) {
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(fileUrl);

      const middlewareFunction = module.default || module;

      if (typeof middlewareFunction !== 'function') {
        this.logger.warn(`Invalid middleware function in ${filePath}`);
        return;
      }

      const middlewareName = this.getMiddlewareNameFromFile(filePath);
      this.middleware.set(middlewareName, middlewareFunction);

      this.metrics.middlewareRegistered++;

    } catch (error) {
      this.logger.error(`Failed to load middleware file ${filePath}:`, error);
    }
  }

  /**
   * Create route instance with dependency injection
   * @param {Function} RouteClass - Route class constructor
   * @param {string} filePath - File path for context
   * @returns {Object} Route instance
   */
  createRouteInstance(RouteClass, filePath) {
    if (!this.options.enableDependencyInjection) {
      return new RouteClass();
    }

    // Check if this route extends BaseRoute by checking if it expects serviceContainer
    const constructorString = RouteClass.toString();
    const isBaseRoute = constructorString.includes('super(') ||
                       constructorString.includes('serviceContainer') ||
                       RouteClass.name.includes('Route');

    if (isBaseRoute) {
      // For BaseRoute descendants, pass serviceContainer directly
      return new RouteClass(this.serviceContainer);
    }

    // For other classes, use full dependency injection
    const dependencies = this.getRouteDependencies(RouteClass);
    const injectedServices = this.injectDependencies(dependencies);

    // Create instance with injected dependencies
    return new RouteClass(...injectedServices);
  }

  /**
   * Get route dependencies from constructor
   * @param {Function} RouteClass - Route class
   * @returns {Array} Dependency names
   */
  getRouteDependencies(RouteClass) {
    // Try to get dependencies from static property
    if (RouteClass.dependencies) {
      return RouteClass.dependencies;
    }

    // Try to parse constructor parameters (basic implementation)
    const constructorString = RouteClass.toString();
    const constructorMatch = constructorString.match(/constructor\s*\((.*?)\)/);

    if (constructorMatch && constructorMatch[1]) {
      return constructorMatch[1]
        .split(',')
        .map(param => param.trim())
        .filter(param => param.length > 0)
        .filter(param => param !== 'serviceContainer'); // Exclude serviceContainer - it's passed directly
    }

    return [];
  }

  /**
   * Inject dependencies from service container
   * @param {Array} dependencies - Dependency names
   * @returns {Array} Injected services
   */
  injectDependencies(dependencies) {
    const injectedServices = [];

    for (const dependency of dependencies) {
      try {
        const service = this.serviceContainer.get(dependency);
        injectedServices.push(service);
      } catch (error) {
        this.logger.warn(`Failed to inject dependency '${dependency}':`, error.message);
        injectedServices.push(null);
      }
    }

    return injectedServices;
  }

  /**
   * Register a route with Express app
   * @param {string} name - Route name
   * @param {Object} routeInstance - Route instance
   * @param {string} group - Route group
   */
  async registerRoute(name, routeInstance, group = '') {
    try {
      // Initialize route if it has an initialize method
      if (typeof routeInstance.initialize === 'function') {
        await routeInstance.initialize();
      }

      // Check if route has registerRoutes method (BaseRoute pattern)
      if (typeof routeInstance.registerRoutes === 'function') {
        // Create a router for this route group
        const router = this.app;

        // Call registerRoutes to let the route define its own endpoints
        routeInstance.registerRoutes(router);

        // Store route information
        this.routes.set(name, {
          instance: routeInstance,
          group: group,
          registeredAt: new Date(),
          type: 'BaseRoute'
        });

        // Add to route group
        this.addToRouteGroup(group, name);
        this.metrics.routesRegistered++;

        this.logger.debug(`BaseRoute registered: ${name}`);
      } else {
        // Fallback to old method for non-BaseRoute classes
        const routeConfig = this.getRouteConfiguration(routeInstance, name, group);
        const middlewareStack = this.buildMiddlewareStack(routeConfig);
        this.registerExpressRoute(routeConfig, routeInstance, middlewareStack);

        this.routes.set(name, {
          instance: routeInstance,
          config: routeConfig,
          group: group,
          registeredAt: new Date(),
          type: 'Legacy'
        });

        // Add to route group
        this.addToRouteGroup(group, name);
        this.metrics.routesRegistered++;

        this.logger.debug(`Legacy route registered: ${routeConfig.method} ${routeConfig.path}`);
      }

    } catch (error) {
      this.logger.error(`Failed to register route '${name}':`, error);
    }
  }

  /**
   * Get route configuration from route instance
   * @param {Object} routeInstance - Route instance
   * @param {string} name - Route name
   * @param {string} group - Route group
   * @returns {Object} Route configuration
   */
  getRouteConfiguration(routeInstance, name, group) {
    // Default configuration
    const config = {
      method: 'get',
      path: `/${name}`,
      middleware: [],
      rateLimit: null,
      authentication: false,
      validation: null
    };

    // Override with instance configuration
    if (routeInstance.config) {
      Object.assign(config, routeInstance.config);
    }

    // Apply route prefix and versioning
    config.path = this.buildRoutePath(config.path, group);

    return config;
  }

  /**
   * Build full route path with prefix and versioning
   * @param {string} path - Base path
   * @param {string} group - Route group
   * @returns {string} Full route path
   */
  buildRoutePath(path, group) {
    let fullPath = '';

    // Add route prefix
    if (this.options.routePrefix) {
      fullPath += this.options.routePrefix;
    }

    // Add versioning
    if (this.options.enableVersioning) {
      fullPath += `/${this.options.defaultVersion}`;
    }

    // Add group path
    if (group) {
      fullPath += `/${group}`;
    }

    // Add route path
    if (path && path !== '/') {
      fullPath += path.startsWith('/') ? path : `/${path}`;
    }

    // Ensure path starts with /
    if (!fullPath.startsWith('/')) {
      fullPath = '/' + fullPath;
    }

    // Clean up double slashes
    fullPath = fullPath.replace(/\/+/g, '/');

    return fullPath;
  }

  /**
   * Build middleware stack for route
   * @param {Object} routeConfig - Route configuration
   * @returns {Array} Middleware functions
   */
  buildMiddlewareStack(routeConfig) {
    const middlewareStack = [];

    // Add metrics middleware if enabled
    if (this.options.enableMetrics) {
      middlewareStack.push(this.createMetricsMiddleware(routeConfig.path));
    }

    // Add global middleware
    if (this.middleware.has('global')) {
      middlewareStack.push(this.middleware.get('global'));
    }

    // Add authentication middleware
    if (routeConfig.authentication && this.middleware.has('auth')) {
      middlewareStack.push(this.middleware.get('auth'));
    }

    // Add validation middleware
    if (routeConfig.validation && this.middleware.has('validation')) {
      middlewareStack.push(this.middleware.get('validation'));
    }

    // Add rate limiting middleware
    if (routeConfig.rateLimit && this.middleware.has('rateLimit')) {
      middlewareStack.push(this.middleware.get('rateLimit'));
    }

    // Add route-specific middleware
    if (routeConfig.middleware) {
      for (const middlewareName of routeConfig.middleware) {
        if (this.middleware.has(middlewareName)) {
          middlewareStack.push(this.middleware.get(middlewareName));
        }
      }
    }

    return middlewareStack;
  }

  /**
   * Register route with Express app
   * @param {Object} routeConfig - Route configuration
   * @param {Object} routeInstance - Route instance
   * @param {Array} middlewareStack - Middleware functions
   */
  registerExpressRoute(routeConfig, routeInstance, middlewareStack) {
    const method = routeConfig.method.toLowerCase();
    const path = routeConfig.path;

    // Get route handler
    const handler = this.getRouteHandler(routeInstance, method);

    if (!handler) {
      this.logger.warn(`No handler found for ${method.toUpperCase()} ${path}`);
      return;
    }

    // Register with Express
    if (middlewareStack.length > 0) {
      this.app[method](path, ...middlewareStack, handler);
    } else {
      this.app[method](path, handler);
    }
  }

  /**
   * Get route handler from route instance
   * @param {Object} routeInstance - Route instance
   * @param {string} method - HTTP method
   * @returns {Function} Route handler
   */
  getRouteHandler(routeInstance, method) {
    // Try method-specific handler
    if (typeof routeInstance[method] === 'function') {
      return routeInstance[method].bind(routeInstance);
    }

    // Try generic handler
    if (typeof routeInstance.handle === 'function') {
      return routeInstance.handle.bind(routeInstance);
    }

    // Try default handler
    if (typeof routeInstance.handler === 'function') {
      return routeInstance.handler.bind(routeInstance);
    }

    return null;
  }

  /**
   * Setup global middleware
   */
  setupGlobalMiddleware() {
    // CORS middleware
    if (this.middleware.has('cors')) {
      this.app.use(this.middleware.get('cors'));
    }

    // JSON parsing middleware
    this.app.use((req, res, next) => {
      if (req.is('application/json')) {
        req.body = req.body || {};
      }
      next();
    });

    // Request logging middleware
    if (this.middleware.has('logging')) {
      this.app.use(this.middleware.get('logging'));
    }
  }

  /**
   * Setup health check routes
   */
  setupHealthCheckRoutes() {
    const healthPath = `${this.options.routePrefix}/health`;

    this.app.get(healthPath, (req, res) => {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        routes: {
          registered: this.routes.size,
          groups: this.routeGroups.size
        },
        services: this.serviceContainer ? this.serviceContainer.getRegisteredServices().length : 0
      };

      res.json(health);
    });

    // Detailed health check
    this.app.get(`${healthPath}/detailed`, async (req, res) => {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        routes: this.getRoutesInfo(),
        services: this.serviceContainer ? await this.serviceContainer.healthCheck() : null,
        metrics: this.getMetrics()
      };

      res.json(health);
    });
  }

  /**
   * Setup metrics collection
   */
  setupMetricsCollection() {
    // Metrics endpoint
    const metricsPath = `${this.options.routePrefix}/metrics`;

    this.app.get(metricsPath, (req, res) => {
      res.json(this.getMetrics());
    });
  }

  /**
   * Create metrics middleware
   * @param {string} routePath - Route path
   * @returns {Function} Middleware function
   */
  createMetricsMiddleware(routePath) {
    return (req, res, next) => {
      const startTime = Date.now();

      // Increment request count
      const currentCount = this.metrics.requestCount.get(routePath) || 0;
      this.metrics.requestCount.set(routePath, currentCount + 1);

      // Track response time
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        const responseTimes = this.metrics.responseTime.get(routePath) || [];
        responseTimes.push(responseTime);

        // Keep only last 100 response times
        if (responseTimes.length > 100) {
          responseTimes.shift();
        }

        this.metrics.responseTime.set(routePath, responseTimes);

        // Track errors
        if (res.statusCode >= 400) {
          const errorCount = this.metrics.errorCount.get(routePath) || 0;
          this.metrics.errorCount.set(routePath, errorCount + 1);
        }
      });

      next();
    };
  }

  /**
   * Add route to group
   * @param {string} group - Group name
   * @param {string} routeName - Route name
   */
  addToRouteGroup(group, routeName) {
    if (!group) {return;}

    if (!this.routeGroups.has(group)) {
      this.routeGroups.set(group, []);
    }

    this.routeGroups.get(group).push(routeName);
  }

  /**
   * Get routes information
   * @returns {Object} Routes information
   */
  getRoutesInfo() {
    const routesInfo = {};

    for (const [name, routeData] of this.routes) {
      routesInfo[name] = {
        group: routeData.group,
        method: routeData.config.method,
        path: routeData.config.path,
        registeredAt: routeData.registeredAt,
        hasAuthentication: routeData.config.authentication,
        middleware: routeData.config.middleware
      };
    }

    return routesInfo;
  }

  /**
   * Get metrics
   * @returns {Object} Metrics data
   */
  getMetrics() {
    const metrics = {
      routes: {
        total: this.routes.size,
        byGroup: {}
      },
      requests: {
        total: 0,
        byRoute: {}
      },
      errors: {
        total: 0,
        byRoute: {}
      },
      performance: {
        averageResponseTime: 0,
        byRoute: {}
      }
    };

    // Calculate route metrics by group
    for (const [group, routes] of this.routeGroups) {
      metrics.routes.byGroup[group] = routes.length;
    }

    // Calculate request metrics
    let totalRequests = 0;
    for (const [route, count] of this.metrics.requestCount) {
      metrics.requests.byRoute[route] = count;
      totalRequests += count;
    }
    metrics.requests.total = totalRequests;

    // Calculate error metrics
    let totalErrors = 0;
    for (const [route, count] of this.metrics.errorCount) {
      metrics.errors.byRoute[route] = count;
      totalErrors += count;
    }
    metrics.errors.total = totalErrors;

    // Calculate performance metrics
    let totalResponseTime = 0;
    let totalMeasurements = 0;

    for (const [route, times] of this.metrics.responseTime) {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      metrics.performance.byRoute[route] = {
        average: Math.round(average),
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length
      };

      totalResponseTime += times.reduce((sum, time) => sum + time, 0);
      totalMeasurements += times.length;
    }

    if (totalMeasurements > 0) {
      metrics.performance.averageResponseTime = Math.round(totalResponseTime / totalMeasurements);
    }

    return metrics;
  }

  /**
   * Check if file is a valid route file
   * @param {string} filename - File name
   * @returns {boolean} Whether file is valid
   */
  isValidRouteFile(filename) {
    const ext = extname(filename);
    return (ext === '.js' || ext === '.mjs') && !filename.startsWith('.') && filename !== 'BaseRoute.js' && filename !== 'base.js' && filename !== 'mcp.js';
  }

  /**
   * Check if file is a valid middleware file
   * @param {string} filename - File name
   * @returns {boolean} Whether file is valid
   */
  isValidMiddlewareFile(filename) {
    const ext = extname(filename);
    return (ext === '.js' || ext === '.mjs') && !filename.startsWith('.');
  }

  /**
   * Get route name from file path
   * @param {string} filePath - File path
   * @returns {string} Route name
   */
  getRouteNameFromFile(filePath) {
    return basename(filePath, extname(filePath));
  }

  /**
   * Get middleware name from file path
   * @param {string} filePath - File path
   * @returns {string} Middleware name
   */
  getMiddlewareNameFromFile(filePath) {
    return basename(filePath, extname(filePath));
  }

  /**
   * Get route group from file path
   * @param {string} filePath - File path
   * @returns {string} Route group
   */
  getRouteGroupFromPath(filePath) {
    const relativePath = filePath.replace(this.options.routesDirectory, '');
    const pathParts = relativePath.split('/').filter(part => part && part !== '.');

    if (pathParts.length > 1) {
      return pathParts.slice(0, -1).join('/');
    }

    return '';
  }

  /**
   * Get registered routes
   * @returns {Map} Registered routes
   */
  getRoutes() {
    return this.routes;
  }

  /**
   * Get registered middleware
   * @returns {Map} Registered middleware
   */
  getMiddleware() {
    return this.middleware;
  }

  /**
   * Get route groups
   * @returns {Map} Route groups
   */
  getRouteGroups() {
    return this.routeGroups;
  }
}