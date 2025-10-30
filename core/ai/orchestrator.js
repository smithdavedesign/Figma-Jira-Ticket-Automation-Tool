/**
 * 🤖 Multi-AI Orchestration System
 *
 * Routes specialized tasks to different AI models for optimal results:
 * - Gemini: Documentation and explanations
 * - GPT-4: Code generation and complex logic
 * - Claude: Architectural reasoning and design analysis
 */

/**
 * @typedef {Object} AIOrchestrationResult
 * @property {string} taskId - Unique task identifier
 * @property {boolean} success - Whether orchestration succeeded
 * @property {Object} results - Results from different AI models
 * @property {Object} metadata - Processing metadata
 * @property {string[]} errors - Any errors encountered
 * @property {string[]} warnings - Any warnings encountered
 */

/**
 * @typedef {Object} AITask
 * @property {string} id - Task identifier
 * @property {'documentation'|'code-generation'|'reasoning'|'optimization'} type - Task type
 * @property {'high'|'medium'|'low'} priority - Task priority
 * @property {Object} designSpec - Design specification
 * @property {Object} parameters - Task parameters
 * @property {Object=} constraints - Task constraints
 */

/**
 * @typedef {Object} AIProvider
 * @property {string} name - Provider name
 * @property {string} model - Model name
 * @property {string[]} capabilities - Model capabilities
 * @property {boolean} available - Whether provider is available
 * @property {Object} rateLimits - Rate limit settings
 * @property {Object} costs - Cost information
 */

/**
 * Rate limiter for AI provider requests
 */
class RateLimiter {
  /**
   * @param {number} requestsPerMinute - Max requests per minute
   * @param {number} tokensPerMinute - Max tokens per minute
   */
  constructor(requestsPerMinute, tokensPerMinute) {
    this.requestsPerMinute = requestsPerMinute;
    this.tokensPerMinute = tokensPerMinute;
    this.requestCount = 0;
    this.tokenCount = 0;
    this.lastReset = Date.now();
  }

  /**
   * Check if request can be made
   * @param {number} tokenCount - Tokens for this request
   * @returns {boolean} Can make request
   */
  canMakeRequest(tokenCount = 1000) {
    this.resetIfNeeded();
    return this.requestCount < this.requestsPerMinute &&
           this.tokenCount + tokenCount <= this.tokensPerMinute;
  }

  /**
   * Record a request
   * @param {number} tokenCount - Tokens used
   */
  recordRequest(tokenCount = 1000) {
    this.resetIfNeeded();
    this.requestCount++;
    this.tokenCount += tokenCount;
  }

  /**
   * Reset counters if minute has passed
   * @private
   */
  resetIfNeeded() {
    const now = Date.now();
    if (now - this.lastReset >= 60000) { // 1 minute
      this.requestCount = 0;
      this.tokenCount = 0;
      this.lastReset = now;
    }
  }
}

/**
 * Semaphore for controlling concurrent tasks
 */
class Semaphore {
  /**
   * @param {number} count - Maximum concurrent tasks
   */
  constructor(count) {
    this.available = count;
    this.waiters = [];
  }

  /**
   * Acquire semaphore
   * @returns {Promise<void>}
   */
  async acquire() {
    if (this.available > 0) {
      this.available--;
      return;
    }

    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }

  /**
   * Release semaphore
   */
  release() {
    if (this.waiters.length > 0) {
      const waiter = this.waiters.shift();
      if (waiter) {waiter();}
    } else {
      this.available++;
    }
  }
}

/**
 * Main AI Orchestration System
 */
export class AIOrchestrator {
  constructor() {
    this.providers = new Map();
    this.taskQueue = [];
    this.activeConnections = new Map();
    this.rateLimiters = new Map();

    this.initializeProviders();
  }

  /**
   * Process a design spec through multiple AI models
   * @param {Object} designSpec - Design specification
   * @param {Object} tasks - Tasks to perform
   * @param {Object} options - Processing options
   * @returns {Promise<AIOrchestrationResult>}
   */
  async processDesignSpec(designSpec, tasks = {}, options = {}) {
    const taskId = this.generateTaskId();
    const startTime = Date.now();

    console.log(`🤖 Starting AI orchestration for design spec: ${designSpec.metadata?.specId}`);

    try {
      // Create task list based on requirements
      const aiTasks = this.createTasksFromRequirements(designSpec, tasks, options);

      // Process tasks (parallel or sequential)
      const results = options.parallel
        ? await this.processTasksInParallel(aiTasks, options.maxConcurrentTasks)
        : await this.processTasksSequentially(aiTasks);

      // Aggregate results
      const aggregatedResults = this.aggregateResults(results);

      const totalProcessingTime = Date.now() - startTime;

      console.log(`✅ AI orchestration completed in ${totalProcessingTime}ms`);

      return {
        taskId,
        success: true,
        results: aggregatedResults,
        metadata: {
          totalProcessingTime,
          modelsUsed: this.extractUsedModels(results),
          parallelTasks: aiTasks.length,
          confidence: this.calculateOverallConfidence(results)
        },
        errors: [],
        warnings: []
      };

    } catch (error) {
      console.error('❌ AI orchestration failed:', error);

      return {
        taskId,
        success: false,
        results: {},
        metadata: {
          totalProcessingTime: Date.now() - startTime,
          modelsUsed: [],
          parallelTasks: 0,
          confidence: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown orchestration error'],
        warnings: []
      };
    }
  }

  /**
   * Get available AI providers and their status
   * @returns {Object} Provider status
   */
  getProviderStatus() {
    const status = {};

    for (const [name, provider] of this.providers) {
      status[name] = {
        ...provider,
        status: provider.available ? 'available' : 'error'
      };
    }

    return status;
  }

  /**
   * Register an AI provider
   * @param {AIProvider} provider - Provider to register
   */
  registerProvider(provider) {
    this.providers.set(provider.name, provider);
    this.rateLimiters.set(provider.name, new RateLimiter(
      provider.rateLimits.requestsPerMinute,
      provider.rateLimits.tokensPerMinute
    ));

    console.log(`📝 Registered AI provider: ${provider.name} (${provider.model})`);
  }

  /**
   * Test connection to all providers
   * @returns {Promise<Object>} Connection test results
   */
  async testProviderConnections() {
    const results = {};

    for (const [name, provider] of this.providers) {
      try {
        results[name] = await this.testProviderConnection(provider);
      } catch (error) {
        console.error(`❌ Provider ${name} connection failed:`, error);
        results[name] = false;
      }
    }

    return results;
  }

  /**
   * Initialize default AI providers
   * @private
   */
  initializeProviders() {
    // Gemini provider for documentation - upgraded to 2.0 Flash
    this.registerProvider({
      name: 'gemini',
      model: 'gemini-2.0-flash',
      capabilities: ['documentation', 'explanation', 'analysis', 'visual-analysis'],
      available: true,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 2000000 // Increased for 2.0 model
      },
      costs: {
        inputCostPer1kTokens: 0.0005,
        outputCostPer1kTokens: 0.0015
      }
    });

    // GPT-4 provider for code generation
    this.registerProvider({
      name: 'gpt4',
      model: 'gpt-4-turbo',
      capabilities: ['code-generation', 'refactoring', 'optimization'],
      available: true,
      rateLimits: {
        requestsPerMinute: 30,
        tokensPerMinute: 150000
      },
      costs: {
        inputCostPer1kTokens: 0.01,
        outputCostPer1kTokens: 0.03
      }
    });

    // Claude provider for reasoning
    this.registerProvider({
      name: 'claude',
      model: 'claude-3-sonnet',
      capabilities: ['reasoning', 'analysis', 'architecture'],
      available: true,
      rateLimits: {
        requestsPerMinute: 50,
        tokensPerMinute: 200000
      },
      costs: {
        inputCostPer1kTokens: 0.003,
        outputCostPer1kTokens: 0.015
      }
    });

    console.log(`🚀 Initialized ${this.providers.size} AI providers`);
  }

  /**
   * Create tasks from requirements
   * @private
   */
  createTasksFromRequirements(designSpec, requirements, options) {
    const tasks = [];

    if (requirements.generateDocumentation) {
      tasks.push({
        id: `doc-${this.generateTaskId()}`,
        type: 'documentation',
        priority: options.priority || 'medium',
        designSpec,
        parameters: {
          includeUsageExamples: true,
          includeAccessibility: true,
          format: 'markdown'
        },
        constraints: {
          maxTokens: 4000,
          timeout: 30000
        }
      });
    }

    if (requirements.generateCode) {
      tasks.push({
        id: `code-${this.generateTaskId()}`,
        type: 'code-generation',
        priority: options.priority || 'high',
        designSpec,
        parameters: {
          framework: options.framework || 'react',
          includeTests: true,
          includeTypes: true,
          style: 'typescript'
        },
        constraints: {
          maxTokens: 8000,
          timeout: 45000
        }
      });
    }

    if (requirements.analyzeDesign) {
      tasks.push({
        id: `reason-${this.generateTaskId()}`,
        type: 'reasoning',
        priority: options.priority || 'medium',
        designSpec,
        parameters: {
          focusAreas: ['architecture', 'patterns', 'maintainability'],
          includeTradeoffs: true,
          depth: 'detailed'
        },
        constraints: {
          maxTokens: 6000,
          timeout: 40000
        }
      });
    }

    if (requirements.optimizeImplementation) {
      tasks.push({
        id: `opt-${this.generateTaskId()}`,
        type: 'optimization',
        priority: options.priority || 'low',
        designSpec,
        parameters: {
          focusAreas: ['performance', 'accessibility', 'bundle-size'],
          includeMetrics: true
        },
        constraints: {
          maxTokens: 3000,
          timeout: 25000
        }
      });
    }

    return tasks;
  }

  /**
   * Process tasks in parallel
   * @private
   */
  async processTasksInParallel(tasks, maxConcurrent = 3) {
    const results = new Map();
    const semaphore = new Semaphore(maxConcurrent);

    console.log(`🔄 Processing ${tasks.length} tasks in parallel (max ${maxConcurrent} concurrent)`);

    const promises = tasks.map(async (task) => {
      await semaphore.acquire();

      try {
        const result = await this.processSingleTask(task);
        results.set(task.id, result);
      } finally {
        semaphore.release();
      }
    });

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Process tasks sequentially
   * @private
   */
  async processTasksSequentially(tasks) {
    const results = new Map();

    console.log(`🔄 Processing ${tasks.length} tasks sequentially`);

    for (const task of tasks) {
      try {
        const result = await this.processSingleTask(task);
        results.set(task.id, result);
      } catch (error) {
        console.error(`❌ Task ${task.id} failed:`, error);
        results.set(task.id, { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return results;
  }

  /**
   * Process a single task
   * @private
   */
  async processSingleTask(task) {
    const provider = this.selectProviderForTask(task);
    if (!provider) {
      throw new Error(`No suitable provider found for task type: ${task.type}`);
    }

    // Check rate limits
    const rateLimiter = this.rateLimiters.get(provider.name);
    if (rateLimiter && !rateLimiter.canMakeRequest()) {
      throw new Error(`Rate limit exceeded for provider: ${provider.name}`);
    }

    console.log(`🤖 Processing task ${task.id} with ${provider.name}`);

    const startTime = Date.now();

    try {
      // Mock implementation - would call actual AI APIs
      const result = await this.callAIProvider(task, provider);

      const processingTime = Date.now() - startTime;

      // Update rate limiter
      if (rateLimiter) {
        rateLimiter.recordRequest();
      }

      return {
        ...result,
        metadata: {
          ...result.metadata,
          processingTime,
          provider: provider.name
        }
      };

    } catch (error) {
      console.error('❌ Task processing failed:', error);
      throw error;
    }
  }

  /**
   * Call AI provider (mock implementation)
   * @private
   */
  async callAIProvider(task, provider) {
    // Mock implementation - would call actual AI APIs
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    return {
      result: `Mock result from ${provider.name} for ${task.type}`,
      metadata: {
        model: provider.model,
        confidence: 0.9
      }
    };
  }

  /**
   * Select best provider for task
   * @private
   */
  selectProviderForTask(task) {
    // Select best provider based on task type and capabilities
    for (const [name, provider] of this.providers) {
      if (!provider.available) {continue;}

      switch (task.type) {
      case 'documentation':
        if (name === 'gemini') {return provider;}
        break;
      case 'code-generation':
        if (name === 'gpt4') {return provider;}
        break;
      case 'reasoning':
        if (name === 'claude') {return provider;}
        break;
      case 'optimization':
        if (name === 'gpt4' || name === 'claude') {return provider;}
        break;
      }
    }

    // Fallback to any available provider
    for (const [, provider] of this.providers) {
      if (provider.available) {return provider;}
    }

    return null;
  }

  /**
   * Aggregate results from multiple tasks
   * @private
   */
  aggregateResults(results) {
    const aggregated = {};

    for (const [taskId, result] of results) {
      if (result.error) {continue;}

      if (taskId.startsWith('doc-')) {
        aggregated.documentation = result;
      } else if (taskId.startsWith('code-')) {
        aggregated.codeGeneration = result;
      } else if (taskId.startsWith('reason-')) {
        aggregated.reasoning = result;
      } else if (taskId.startsWith('opt-')) {
        aggregated.optimization = result;
      }
    }

    return aggregated;
  }

  /**
   * Extract used models from results
   * @private
   */
  extractUsedModels(results) {
    const models = new Set();

    for (const [, result] of results) {
      if (result.metadata?.provider) {
        const provider = this.providers.get(result.metadata.provider);
        if (provider) {
          models.add(provider.model);
        }
      }
    }

    return Array.from(models);
  }

  /**
   * Calculate overall confidence
   * @private
   */
  calculateOverallConfidence(results) {
    let totalConfidence = 0;
    let count = 0;

    for (const [, result] of results) {
      if (result.metadata?.confidence) {
        totalConfidence += result.metadata.confidence;
        count++;
      }
    }

    return count > 0 ? totalConfidence / count : 0;
  }

  /**
   * Generate unique task ID
   * @private
   */
  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Test provider connection (mock)
   * @private
   */
  async testProviderConnection(provider) {
    // Mock implementation - would test actual API connections
    return Promise.resolve(provider.available);
  }
}

// Singleton instance
let globalOrchestrator = null;

/**
 * Get global orchestrator instance
 * @returns {AIOrchestrator}
 */
export function getGlobalOrchestrator() {
  if (!globalOrchestrator) {
    globalOrchestrator = new AIOrchestrator();
  }
  return globalOrchestrator;
}

/**
 * Quick orchestration function for simple use cases
 * @param {Object} designSpec - Design specification
 * @param {Object} requirements - Requirements object
 * @param {Object} options - Options
 * @returns {Promise<AIOrchestrationResult>}
 */
export async function orchestrateAI(designSpec, requirements, options = {}) {
  const orchestrator = getGlobalOrchestrator();

  return orchestrator.processDesignSpec(designSpec, {
    generateDocumentation: requirements.documentation,
    generateCode: requirements.code,
    analyzeDesign: requirements.analysis,
    optimizeImplementation: requirements.optimization
  }, options);
}