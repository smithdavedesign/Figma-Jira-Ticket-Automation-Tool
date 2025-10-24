/**
 * Data Cache Implementation for MCP Data Layer
 * 
 * High-performance caching layer for Figma extraction results,
 * design tokens, and processed metadata to optimize repeated requests.
 */

import type { DataCache, CachingStrategy } from './interfaces.js';

/**
 * In-memory cache implementation with TTL support
 */
export class MemoryCache implements DataCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private readonly cleanupInterval: number = 60000; // 1 minute
  private cleanupTimer?: NodeJS.Timeout;

  constructor() {
    this.startCleanup();
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data: value, expires });
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expires) {
          this.cache.delete(key);
        }
      }
    }, this.cleanupInterval);
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

/**
 * Multi-layer cache implementation with memory and persistent storage
 */
export class HybridCache implements DataCache {
  private memoryCache: MemoryCache;
  private persistentStore: Map<string, { data: any; expires: number }>;

  constructor() {
    this.memoryCache = new MemoryCache();
    this.persistentStore = new Map();
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryResult = await this.memoryCache.get<T>(key);
    if (memoryResult) {
      return memoryResult;
    }

    // Check persistent store
    const persistentEntry = this.persistentStore.get(key);
    if (persistentEntry && Date.now() <= persistentEntry.expires) {
      // Restore to memory cache
      await this.memoryCache.set(key, persistentEntry.data, 300); // 5 minutes in memory
      return persistentEntry.data as T;
    }

    // Clean up expired persistent entry
    if (persistentEntry) {
      this.persistentStore.delete(key);
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Set in memory cache with shorter TTL
    const memoryTTL = Math.min(ttl, 300); // Max 5 minutes in memory
    await this.memoryCache.set(key, value, memoryTTL);

    // Set in persistent store with full TTL
    const expires = Date.now() + (ttl * 1000);
    this.persistentStore.set(key, { data: value, expires });
  }

  async delete(key: string): Promise<boolean> {
    const memoryDeleted = await this.memoryCache.delete(key);
    const persistentDeleted = this.persistentStore.delete(key);
    return memoryDeleted || persistentDeleted;
  }

  async clear(): Promise<void> {
    await this.memoryCache.clear();
    this.persistentStore.clear();
  }

  async keys(): Promise<string[]> {
    const memoryKeys = await this.memoryCache.keys();
    const persistentKeys = Array.from(this.persistentStore.keys());
    return [...new Set([...memoryKeys, ...persistentKeys])];
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }

  async has(key: string): Promise<boolean> {
    const hasInMemory = await this.memoryCache.has(key);
    if (hasInMemory) return true;

    const persistentEntry = this.persistentStore.get(key);
    if (persistentEntry && Date.now() <= persistentEntry.expires) {
      return true;
    }

    // Clean up expired entry
    if (persistentEntry) {
      this.persistentStore.delete(key);
    }

    return false;
  }

  destroy(): void {
    this.memoryCache.destroy();
    this.persistentStore.clear();
  }
}

/**
 * Cache factory for creating appropriate cache instances
 */
export class CacheFactory {
  static create(strategy: CachingStrategy): DataCache {
    switch (strategy) {
      case 'memory':
        return new MemoryCache();
      case 'hybrid':
        return new HybridCache();
      case 'disk':
        // For now, return hybrid cache
        // In production, this would use a persistent database
        return new HybridCache();
      case 'none':
        return new NoOpCache();
      default:
        return new MemoryCache();
    }
  }
}

/**
 * No-operation cache for when caching is disabled
 */
class NoOpCache implements DataCache {
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T>(_key: string, _value: T, _ttl: number): Promise<void> {
    // No-op
  }

  async delete(_key: string): Promise<boolean> {
    return false;
  }

  async clear(): Promise<void> {
    // No-op
  }

  async keys(): Promise<string[]> {
    return [];
  }

  async size(): Promise<number> {
    return 0;
  }

  async has(_key: string): Promise<boolean> {
    return false;
  }
}