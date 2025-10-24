/**
 * Performance Optimization for Large Frame Extraction
 * 
 * Optimizes extraction performance on large frames while maintaining fidelity
 * through prioritization, streaming, caching, and intelligent processing strategies.
 */

import type {
  FigmaNodeMetadata,
  PerformanceMetrics
} from './types.js';

import type {
  PerformanceOptimizationConfig,
  NodePrioritization,
  StreamingConfig,
  ProcessingStrategy
} from './enhanced-extraction-interfaces.js';

/**
 * Performance optimizer for large frame extraction
 */
class ExtractionPerformanceOptimizer {
  private config: PerformanceOptimizationConfig;
  private nodeCache: Map<string, any> = new Map();
  private priorityQueue: PriorityQueue<FigmaNodeMetadata> = new PriorityQueue();
  private processingStats: ProcessingStats = {
    totalNodes: 0,
    processedNodes: 0,
    skippedNodes: 0,
    cachedNodes: 0,
    processingTime: 0,
    averageNodeTime: 0
  };

  constructor(config: PerformanceOptimizationConfig) {
    this.config = config;
  }

  /**
   * Optimize extraction process for large frame sets
   */
  async optimizeExtraction(
    nodes: FigmaNodeMetadata[],
    extractionFn: (node: FigmaNodeMetadata) => Promise<any>
  ): Promise<{
    results: any[];
    performance: ProcessingStats;
    recommendations: PerformanceRecommendation[];
  }> {
    console.log(`⚡ Optimizing extraction for ${nodes.length} nodes`);
    
    const startTime = Date.now();
    this.processingStats.totalNodes = nodes.length;
    
    // Step 1: Prioritize nodes based on importance
    const prioritizedNodes = await this.prioritizeNodes(nodes);
    
    // Step 2: Apply early filtering if needed
    const filteredNodes = this.applyPerformanceFiltering(prioritizedNodes);
    
    // Step 3: Process nodes with streaming and caching
    const results = await this.processNodesOptimized(filteredNodes, extractionFn);
    
    // Step 4: Calculate performance metrics
    const processingTime = Date.now() - startTime;
    this.processingStats.processingTime = processingTime;
    this.processingStats.averageNodeTime = processingTime / this.processingStats.processedNodes;
    
    // Step 5: Generate performance recommendations
    const recommendations = this.generatePerformanceRecommendations();
    
    console.log(`✅ Extraction optimized: ${this.processingStats.processedNodes}/${this.processingStats.totalNodes} nodes processed in ${processingTime}ms`);
    
    return {
      results,
      performance: this.processingStats,
      recommendations
    };
  }

  /**
   * Prioritize nodes based on importance and visual weight
   */
  private async prioritizeNodes(nodes: FigmaNodeMetadata[]): Promise<PriorityNode[]> {
    const prioritizedNodes: PriorityNode[] = [];
    
    for (const node of nodes) {
      const priority = await this.calculateNodePriority(node);
      prioritizedNodes.push({
        node,
        priority,
        weight: this.calculateVisualWeight(node),
        importance: this.categorizeImportance(priority)
      });
    }
    
    // Sort by priority (highest first)
    return prioritizedNodes.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate priority score for a node
   */
  private async calculateNodePriority(node: FigmaNodeMetadata): Promise<number> {
    const weights = this.config.prioritization.weights;
    let score = 0;
    
    // Size factor (larger elements get higher priority)
    const bounds = node.absoluteBoundingBox;
    if (bounds) {
      const area = bounds.width * bounds.height;
      const normalizedSize = Math.min(area / 100000, 1); // Normalize to 0-1
      score += normalizedSize * weights.size;
    }
    
    // Position factor (top-left elements get higher priority)
    if (bounds) {
      const positionScore = 1 - (Math.sqrt(bounds.x * bounds.x + bounds.y * bounds.y) / 1000);
      score += Math.max(0, positionScore) * weights.position;
    }
    
    // Visibility factor
    const visibilityScore = node.visible ? 1 : 0;
    score += visibilityScore * weights.visibility;
    
    // Interaction factor (interactive elements get higher priority)
    const interactionScore = this.calculateInteractionScore(node);
    score += interactionScore * weights.interaction;
    
    // Semantic factor (semantically important elements get higher priority)
    const semanticScore = this.calculateSemanticScore(node);
    score += semanticScore * weights.semantic;
    
    return Math.min(score, 1); // Normalize to 0-1
  }

  /**
   * Calculate interaction score based on node characteristics
   */
  private calculateInteractionScore(node: FigmaNodeMetadata): number {
    const name = node.name.toLowerCase();
    
    // Interactive element patterns
    if (name.includes('button') || name.includes('btn')) return 1.0;
    if (name.includes('input') || name.includes('field')) return 0.9;
    if (name.includes('link') || name.includes('nav')) return 0.8;
    if (name.includes('card') && name.includes('click')) return 0.7;
    if (node.type === 'COMPONENT' || node.type === 'INSTANCE') return 0.6;
    
    return 0.2; // Base interaction score
  }

  /**
   * Calculate semantic score based on content importance
   */
  private calculateSemanticScore(node: FigmaNodeMetadata): number {
    const name = node.name.toLowerCase();
    
    // Semantic importance patterns
    if (name.includes('header') || name.includes('title')) return 1.0;
    if (name.includes('nav') || name.includes('menu')) return 0.9;
    if (name.includes('content') || name.includes('main')) return 0.8;
    if (name.includes('form') || name.includes('input')) return 0.7;
    if (name.includes('footer') || name.includes('aside')) return 0.5;
    if (node.type === 'TEXT') return 0.6;
    
    return 0.3; // Base semantic score
  }

  /**
   * Calculate visual weight for rendering order
   */
  private calculateVisualWeight(node: FigmaNodeMetadata): number {
    let weight = 0;
    
    // Size contributes to visual weight
    const bounds = node.absoluteBoundingBox;
    if (bounds) {
      weight += (bounds.width * bounds.height) / 10000;
    }
    
    // Visual properties contribute to weight
    if (node.fills && node.fills.length > 0) weight += 0.2;
    if (node.strokes && node.strokes.length > 0) weight += 0.1;
    if (node.effects && node.effects.length > 0) weight += 0.3;
    if (node.opacity && node.opacity < 1) weight += 0.1;
    
    // Component instances have higher visual weight
    if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
      weight += 0.5;
    }
    
    return Math.min(weight, 2.0); // Cap at 2.0
  }

  /**
   * Categorize importance level
   */
  private categorizeImportance(priority: number): ImportanceLevel {
    const thresholds = this.config.prioritization.thresholds;
    
    if (priority >= thresholds.critical) return 'critical';
    if (priority >= thresholds.important) return 'important';
    if (priority >= thresholds.standard) return 'standard';
    return 'optional';
  }

  /**
   * Apply performance filtering based on configuration
   */
  private applyPerformanceFiltering(prioritizedNodes: PriorityNode[]): PriorityNode[] {
    const maxNodes = this.config.maxNodes;
    
    if (prioritizedNodes.length <= maxNodes) {
      return prioritizedNodes;
    }
    
    console.log(`📉 Filtering ${prioritizedNodes.length - maxNodes} nodes for performance`);
    
    // Keep high-priority nodes and sample from lower priority
    const criticalNodes = prioritizedNodes.filter(n => n.importance === 'critical');
    const importantNodes = prioritizedNodes.filter(n => n.importance === 'important');
    const standardNodes = prioritizedNodes.filter(n => n.importance === 'standard');
    const optionalNodes = prioritizedNodes.filter(n => n.importance === 'optional');
    
    let remaining = maxNodes;
    const filtered: PriorityNode[] = [];
    
    // Always include critical nodes
    const criticalToInclude = Math.min(criticalNodes.length, remaining);
    filtered.push(...criticalNodes.slice(0, criticalToInclude));
    remaining -= criticalToInclude;
    
    // Include important nodes
    if (remaining > 0) {
      const importantToInclude = Math.min(importantNodes.length, remaining);
      filtered.push(...importantNodes.slice(0, importantToInclude));
      remaining -= importantToInclude;
    }
    
    // Include standard nodes
    if (remaining > 0) {
      const standardToInclude = Math.min(standardNodes.length, remaining);
      filtered.push(...standardNodes.slice(0, standardToInclude));
      remaining -= standardToInclude;
    }
    
    // Sample optional nodes if space remains
    if (remaining > 0 && optionalNodes.length > 0) {
      const optionalSample = this.sampleNodes(optionalNodes, remaining);
      filtered.push(...optionalSample);
    }
    
    this.processingStats.skippedNodes = prioritizedNodes.length - filtered.length;
    
    return filtered;
  }

  /**
   * Sample nodes for performance optimization
   */
  private sampleNodes(nodes: PriorityNode[], count: number): PriorityNode[] {
    if (nodes.length <= count) return nodes;
    
    // Stratified sampling to maintain representation
    const step = nodes.length / count;
    const sampled: PriorityNode[] = [];
    
    for (let i = 0; i < count; i++) {
      const index = Math.floor(i * step);
      if (index < nodes.length) {
        sampled.push(nodes[index]);
      }
    }
    
    return sampled;
  }

  /**
   * Process nodes with streaming and caching optimizations
   */
  private async processNodesOptimized(
    prioritizedNodes: PriorityNode[],
    extractionFn: (node: FigmaNodeMetadata) => Promise<any>
  ): Promise<any[]> {
    const results: any[] = [];
    const streaming = this.config.streaming;
    const processing = this.config.processing;
    
    if (streaming.enabled) {
      // Process in batches for memory efficiency
      const batches = this.createBatches(prioritizedNodes, streaming.batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} nodes)`);
        
        const batchResults = processing.parallel 
          ? await this.processBatchParallel(batch, extractionFn)
          : await this.processBatchSequential(batch, extractionFn);
        
        results.push(...batchResults);
        
        // Add delay between batches if configured
        if (streaming.delay > 0 && i < batches.length - 1) {
          await this.sleep(streaming.delay);
        }
      }
    } else {
      // Process all nodes at once
      const allResults = processing.parallel
        ? await this.processBatchParallel(prioritizedNodes, extractionFn)
        : await this.processBatchSequential(prioritizedNodes, extractionFn);
      
      results.push(...allResults);
    }
    
    return results;
  }

  /**
   * Process batch in parallel with worker limiting
   */
  private async processBatchParallel(
    batch: PriorityNode[],
    extractionFn: (node: FigmaNodeMetadata) => Promise<any>
  ): Promise<any[]> {
    const maxWorkers = Math.min(this.config.processing.maxWorkers, batch.length);
    const results: any[] = [];
    
    // Process in worker-sized chunks
    for (let i = 0; i < batch.length; i += maxWorkers) {
      const chunk = batch.slice(i, i + maxWorkers);
      const chunkPromises = chunk.map(priorityNode => 
        this.processNodeSafely(priorityNode.node, extractionFn)
      );
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          this.processingStats.processedNodes++;
        } else {
          console.warn(`❌ Failed to process node ${chunk[index].node.id}:`, result.reason);
        }
      });
    }
    
    return results;
  }

  /**
   * Process batch sequentially for memory efficiency
   */
  private async processBatchSequential(
    batch: PriorityNode[],
    extractionFn: (node: FigmaNodeMetadata) => Promise<any>
  ): Promise<any[]> {
    const results: any[] = [];
    
    for (const priorityNode of batch) {
      try {
        const result = await this.processNodeSafely(priorityNode.node, extractionFn);
        results.push(result);
        this.processingStats.processedNodes++;
      } catch (error) {
        console.warn(`❌ Failed to process node ${priorityNode.node.id}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Process individual node with caching and error handling
   */
  private async processNodeSafely(
    node: FigmaNodeMetadata,
    extractionFn: (node: FigmaNodeMetadata) => Promise<any>
  ): Promise<any> {
    const nodeId = node.id;
    
    // Check cache first
    if (this.config.caching.enabled && this.nodeCache.has(nodeId)) {
      this.processingStats.cachedNodes++;
      return this.nodeCache.get(nodeId);
    }
    
    // Process with timeout and retry logic
    const timeout = this.config.processing.timeout;
    const retries = this.config.processing.retries;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([
          extractionFn(node),
          this.createTimeoutPromise(timeout)
        ]);
        
        // Cache successful result
        if (this.config.caching.enabled) {
          this.nodeCache.set(nodeId, result);
        }
        
        return result;
        
      } catch (error) {
        if (attempt === retries) {
          // Final attempt failed, apply fallback strategy
          return this.applyFallbackStrategy(node, error);
        }
        
        // Wait before retry
        await this.sleep(Math.pow(2, attempt) * 100); // Exponential backoff
      }
    }
  }

  /**
   * Apply fallback strategy when processing fails
   */
  private applyFallbackStrategy(node: FigmaNodeMetadata, error: any): any {
    switch (this.config.processing.fallback) {
      case 'skip':
        return null;
        
      case 'simplify':
        return {
          id: node.id,
          name: node.name,
          type: node.type,
          error: 'Simplified due to processing failure'
        };
        
      case 'cache':
        // Return cached version if available, otherwise simplify
        return this.nodeCache.get(node.id) || {
          id: node.id,
          name: node.name,
          type: node.type,
          error: 'Fallback to cache failed'
        };
        
      case 'error':
      default:
        throw error;
    }
  }

  /**
   * Create batches for streaming processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Processing timeout after ${timeoutMs}ms`)), timeoutMs);
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    const stats = this.processingStats;
    
    // High skip rate recommendation
    if (stats.skippedNodes / stats.totalNodes > 0.3) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        title: 'High node skip rate detected',
        description: `${Math.round((stats.skippedNodes / stats.totalNodes) * 100)}% of nodes were skipped for performance. Consider increasing maxNodes or improving prioritization.`,
        impact: 'May miss important design elements',
        effort: 'low'
      });
    }
    
    // Slow processing recommendation
    if (stats.averageNodeTime > 100) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Slow node processing detected',
        description: `Average processing time of ${Math.round(stats.averageNodeTime)}ms per node is high. Consider enabling parallel processing or increasing worker count.`,
        impact: 'Significantly slower extraction times',
        effort: 'medium'
      });
    }
    
    // Cache effectiveness recommendation
    const cacheHitRate = stats.cachedNodes / stats.processedNodes;
    if (cacheHitRate < 0.1 && this.config.caching.enabled) {
      recommendations.push({
        type: 'caching',
        priority: 'low',
        title: 'Low cache hit rate',
        description: `Cache hit rate of ${Math.round(cacheHitRate * 100)}% suggests cache is not effective. Consider adjusting cache TTL or improving cache keys.`,
        impact: 'Missed performance opportunities',
        effort: 'low'
      });
    }
    
    return recommendations;
  }

  /**
   * Get current processing statistics
   */
  getProcessingStats(): ProcessingStats {
    return { ...this.processingStats };
  }

  /**
   * Clear cache and reset statistics
   */
  reset(): void {
    this.nodeCache.clear();
    this.processingStats = {
      totalNodes: 0,
      processedNodes: 0,
      skippedNodes: 0,
      cachedNodes: 0,
      processingTime: 0,
      averageNodeTime: 0
    };
  }
}

// =============================================================================
// SUPPORTING INTERFACES AND TYPES
// =============================================================================

interface PriorityNode {
  node: FigmaNodeMetadata;
  priority: number; // 0-1 score
  weight: number; // Visual weight
  importance: ImportanceLevel;
}

type ImportanceLevel = 'critical' | 'important' | 'standard' | 'optional';

interface ProcessingStats {
  totalNodes: number;
  processedNodes: number;
  skippedNodes: number;
  cachedNodes: number;
  processingTime: number; // milliseconds
  averageNodeTime: number; // milliseconds
}

interface PerformanceRecommendation {
  type: 'performance' | 'optimization' | 'caching' | 'memory';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

/**
 * Simple priority queue implementation
 */
class PriorityQueue<T> {
  private items: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    this.items.push({ item, priority });
    this.items.sort((a, b) => b.priority - a.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}

// =============================================================================
// PERFORMANCE MONITORING CLASSES (from performance.ts)
// =============================================================================

/**
 * Timer entry for tracking operation duration
 */
interface TimerEntry {
  name: string;
  startTime: number;
  endTime?: number;
}

/**
 * Metric entry for storing performance measurements
 */
interface MetricEntry {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

/**
 * Main performance monitor implementation
 */
class MCPPerformanceMonitor implements PerformanceMonitor {
  private timers: Map<string, TimerEntry> = new Map();
  private metrics: MetricEntry[] = [];
  private memorySnapshots: Array<{ timestamp: number; heapUsed: number; heapTotal: number }> = [];

  /**
   * Start timing an operation
   */
  startTimer(name: string): string {
    const timerId = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.timers.set(timerId, {
      name,
      startTime: performance.now()
    });

    return timerId;
  }

  /**
   * End timing an operation
   */
  endTimer(timerId: string): number {
    const timer = this.timers.get(timerId);
    if (!timer) {
      console.warn(`Timer ${timerId} not found`);
      return 0;
    }

    const endTime = performance.now();
    timer.endTime = endTime;
    
    const duration = endTime - timer.startTime;
    
    // Record the timing as a metric
    this.recordMetric(timer.name, duration, 'ms');
    
    this.timers.delete(timerId);
    return duration;
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: string = 'count'): void {
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now()
    });

    // Keep only the last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000); // Last 5 minutes

    // Calculate averages for timing metrics
    const timingMetrics = recentMetrics.filter(m => m.unit === 'ms');
    const avgTimings: Record<string, number> = {};
    
    timingMetrics.forEach(metric => {
      if (!avgTimings[metric.name]) {
        avgTimings[metric.name] = 0;
      }
      avgTimings[metric.name] += metric.value;
    });

    Object.keys(avgTimings).forEach(name => {
      const count = timingMetrics.filter(m => m.name === name).length;
      avgTimings[name] = count > 0 ? avgTimings[name] / count : 0;
    });

    // Get memory usage
    const memoryUsage = this.getMemoryUsage();

    // Calculate throughput
    const extractionMetrics = recentMetrics.filter(m => m.name.includes('extraction'));
    const throughput = extractionMetrics.length > 0 
      ? extractionMetrics.reduce((sum, m) => sum + m.value, 0) / (recentMetrics.length > 0 ? 5 : 1) // per minute
      : 0;

    return {
      timing: avgTimings,
      memory: memoryUsage,
      throughput,
      cacheHitRate: this.calculateCacheHitRate(recentMetrics),
      errorRate: this.calculateErrorRate(recentMetrics),
      apiCallCount: recentMetrics.filter(m => m.name.includes('api_call')).length,
      lastUpdated: now
    };
  }

  /**
   * Record operation start with automatic timing
   */
  recordOperationStart(operation: string, metadata?: Record<string, any>): string {
    const timerId = this.startTimer(operation);
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (typeof value === 'number') {
          this.recordMetric(`${operation}_${key}`, value);
        }
      });
    }

    return timerId;
  }

  /**
   * Record operation end with results
   */
  recordOperationEnd(timerId: string, resultSize?: number): number {
    const duration = this.endTimer(timerId);
    
    if (resultSize !== undefined) {
      const timer = this.timers.get(timerId);
      if (timer) {
        this.recordMetric(`${timer.name}_result_size`, resultSize, 'bytes');
      }
    }

    return duration;
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number; rss: number } {
    if (typeof globalThis !== 'undefined' && 'process' in globalThis && (globalThis as any).process?.memoryUsage) {
      return (globalThis as any).process.memoryUsage();
    }
    
    // Fallback for browser environments
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0
    };
  }

  /**
   * Calculate cache hit rate from recent metrics
   */
  private calculateCacheHitRate(metrics: MetricEntry[]): number {
    const cacheHits = metrics.filter(m => m.name.includes('cache_hit')).length;
    const cacheMisses = metrics.filter(m => m.name.includes('cache_miss')).length;
    const totalCacheRequests = cacheHits + cacheMisses;
    
    return totalCacheRequests > 0 ? cacheHits / totalCacheRequests : 0;
  }

  /**
   * Calculate error rate from recent metrics
   */
  private calculateErrorRate(metrics: MetricEntry[]): number {
    const errors = metrics.filter(m => m.name.includes('error')).length;
    const totalOperations = metrics.filter(m => !m.name.includes('error')).length;
    
    return totalOperations > 0 ? errors / totalOperations : 0;
  }

  /**
   * Reset all performance data and clear caches
   */
  reset(): void {
    this.timers.clear();
    this.metrics = [];
    this.memorySnapshots = [];
  }
}

/**
 * Performance monitor factory
 */
class PerformanceMonitorFactory {
  static create(): PerformanceMonitor {
    return new MCPPerformanceMonitor();
  }

  static createWithConfig(_config: {
    enableDetailedMetrics?: boolean;
    enableMemoryTracking?: boolean;
    enableCacheMetrics?: boolean;
  }): PerformanceMonitor {
    // For now, return the standard monitor
    // In the future, this could return different implementations based on config
    return new MCPPerformanceMonitor();
  }
}

// Define missing interface for type compatibility
interface PerformanceMonitor {
  startTimer(name: string): string;
  endTimer(timerId: string): number;
  recordMetric(name: string, value: number, unit?: string): void;
  getMetrics(): PerformanceMetrics;
  recordOperationStart(operation: string, metadata?: Record<string, any>): string;
  recordOperationEnd(timerId: string, resultSize?: number): number;
  reset(): void;
}

export { ExtractionPerformanceOptimizer, MCPPerformanceMonitor, PerformanceMonitorFactory };