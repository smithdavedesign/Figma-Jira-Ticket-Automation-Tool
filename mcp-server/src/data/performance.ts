/**
 * Performance Monitor Implementation for MCP Data Layer
 * 
 * Tracks performance metrics during Figma data extraction,
 * providing insights into optimization opportunities and system health.
 */

import type { PerformanceMonitor } from './interfaces.js';
import type { PerformanceMetrics } from './types.js';

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
export class MCPPerformanceMonitor implements PerformanceMonitor {
  private timers = new Map<string, TimerEntry>();
  private metrics: MetricEntry[] = [];
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Start a new timer for an operation
   */
  startTimer(operationName: string): string {
    const timerId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.timers.set(timerId, {
      name: operationName,
      startTime: performance.now()
    });

    return timerId;
  }

  /**
   * End a timer and return the duration
   */
  endTimer(timerId: string): number {
    const timer = this.timers.get(timerId);
    
    if (!timer) {
      console.warn(`Timer ${timerId} not found`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - timer.startTime;

    // Update timer entry
    timer.endTime = endTime;
    
    // Record as metric
    this.recordMetric(`${timer.name}_duration`, duration, 'ms');

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
      timestamp: performance.now()
    });
  }

  /**
   * Get comprehensive performance metrics
   */
  getMetrics(): PerformanceMetrics {
    // Calculate operation metrics
    const operationMetrics = this.calculateOperationMetrics();
    
    // Calculate memory usage (if available)
    const memoryMetrics = this.calculateMemoryMetrics();

    return {
      loadTime: operationMetrics.totalLoadTime,
      bundleSize: operationMetrics.totalBundleSize,
      renderTime: operationMetrics.totalRenderTime,
      memoryUsage: memoryMetrics.used
    };
  }

  /**
   * Reset all metrics and timers
   */
  reset(): void {
    this.timers.clear();
    this.metrics = [];
    this.startTime = performance.now();
  }

  // =============================================================================
  // PRIVATE CALCULATION METHODS
  // =============================================================================

  private calculateOperationMetrics(): {
    totalLoadTime: number;
    totalBundleSize: number;
    totalRenderTime: number;
    operations: Array<{ name: string; duration: number; count: number }>;
  } {
    const operationStats = new Map<string, { totalDuration: number; count: number }>();
    let totalLoadTime = 0;
    let totalBundleSize = 0;
    let totalRenderTime = 0;

    // Process metrics
    for (const metric of this.metrics) {
      if (metric.name.includes('_duration')) {
        const operationName = metric.name.replace('_duration', '');
        const existing = operationStats.get(operationName) || { totalDuration: 0, count: 0 };
        
        operationStats.set(operationName, {
          totalDuration: existing.totalDuration + metric.value,
          count: existing.count + 1
        });

        // Categorize specific metrics
        if (metric.name.includes('load') || metric.name.includes('fetch')) {
          totalLoadTime += metric.value;
        } else if (metric.name.includes('render') || metric.name.includes('process')) {
          totalRenderTime += metric.value;
        }
      } else if (metric.name.includes('size') || metric.name.includes('bundle')) {
        totalBundleSize += metric.value;
      }
    }

    // Convert to operations array
    const operations = Array.from(operationStats.entries()).map(([name, stats]) => ({
      name,
      duration: stats.totalDuration,
      count: stats.count
    }));

    return {
      totalLoadTime,
      totalBundleSize,
      totalRenderTime,
      operations
    };
  }

  private calculateMemoryMetrics(): { used: number; available: number } {
    // Try to get memory info if available (Node.js)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        used: usage.heapUsed,
        available: usage.heapTotal
      };
    }

    // Try to get memory info if available (Browser)
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize || 0,
        available: memory.totalJSHeapSize || 0
      };
    }

    // Default values if memory info is not available
    return {
      used: 0,
      available: 0
    };
  }

  private calculateCacheMetrics(): { hitRate: number; hits: number; misses: number } {
    let hits = 0;
    let misses = 0;

    // Count cache-related metrics
    for (const metric of this.metrics) {
      if (metric.name.includes('cache_hit')) {
        hits += metric.value;
      } else if (metric.name.includes('cache_miss')) {
        misses += metric.value;
      }
    }

    const total = hits + misses;
    const hitRate = total > 0 ? hits / total : 0;

    return {
      hitRate,
      hits,
      misses
    };
  }

  /**
   * Get detailed timer information
   */
  getTimerDetails(): Array<{ id: string; name: string; duration?: number; isRunning: boolean }> {
    return Array.from(this.timers.entries()).map(([id, timer]) => {
      const duration = timer.endTime ? timer.endTime - timer.startTime : undefined;
      return {
        id,
        name: timer.name,
        ...(duration !== undefined && { duration }),
        isRunning: !timer.endTime
      };
    });
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: string): MetricEntry[] {
    return this.metrics.filter(metric => metric.name.includes(category));
  }

  /**
   * Get average metric value by name
   */
  getAverageMetric(metricName: string): number {
    const matchingMetrics = this.metrics.filter(metric => metric.name === metricName);
    
    if (matchingMetrics.length === 0) {
      return 0;
    }

    const sum = matchingMetrics.reduce((total, metric) => total + metric.value, 0);
    return sum / matchingMetrics.length;
  }

  /**
   * Record operation start
   */
  recordOperationStart(operationName: string, metadata?: Record<string, any>): string {
    const timerId = this.startTimer(operationName);
    
    if (metadata) {
      this.recordMetric(`${operationName}_metadata`, JSON.stringify(metadata).length, 'bytes');
    }

    return timerId;
  }

  /**
   * Record operation end with optional result size
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
}

/**
 * Performance monitor factory
 */
export class PerformanceMonitorFactory {
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