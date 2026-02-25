/**
 * 🔧 Test Setup
 * Runs before each test file
 */

import { vi } from 'vitest';

// Mock console methods to reduce noise during tests
const originalConsole = { ...console };

// Set up global mocks that are available to all tests
// Mock external services for testing
vi.stubGlobal('fetch', vi.fn());

// Mock Figma API
vi.stubGlobal('figma', {
  root: {
    children: [],
    name: 'Test Document'
  },
  currentPage: {
    children: [],
    name: 'Test Page'
  },
  ui: {
    postMessage: vi.fn(),
    onmessage: vi.fn()
  }
});

// Mock Redis/Storage
const mockRedis = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
  exists: vi.fn().mockResolvedValue(0),
  del: vi.fn().mockResolvedValue(1),
  keys: vi.fn().mockResolvedValue([]),
  flushall: vi.fn().mockResolvedValue('OK')
};

vi.stubGlobal('__REDIS_CLIENT__', mockRedis);

// Mock localStorage for Node.js environment
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Custom test utilities
export const testUtils = {
  // Mock MCP server response
  mockMCPResponse: (data) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    });
  },

  // Mock Figma frame data
  mockFrameData: (frames = []) => {
    return {
      enhancedFrameData: frames.map(frame => ({
        id: frame.id || 'test-frame-id',
        name: frame.name || 'Test Frame',
        type: 'FRAME',
        width: frame.width || 375,
        height: frame.height || 812,
        backgroundColor: frame.backgroundColor || { r: 1, g: 1, b: 1, a: 1 },
        children: frame.children || [],
        absoluteBoundingBox: {
          x: 0,
          y: 0,
          width: frame.width || 375,
          height: frame.height || 812
        }
      })),
      documentInfo: {
        name: 'Test Document',
        id: 'test-doc-id'
      },
      pageInfo: {
        name: 'Test Page',
        id: 'test-page-id'
      }
    };
  },

  // Create test timer
  createTimer: () => {
    const start = Date.now();
    return {
      elapsed: () => Date.now() - start,
      end: () => {
        const duration = Date.now() - start;
        return duration;
      }
    };
  },

  // Assert response format
  assertMCPResponse: (response) => {
    if (!response.hasOwnProperty('success')) {
      throw new Error('Response missing success property');
    }
    if (!response.hasOwnProperty('data')) {
      throw new Error('Response missing data property');
    }
    if (typeof response.success !== 'boolean') {
      throw new Error('Response success property must be boolean');
    }
  },

  // Mock AI service response
  mockAIResponse: (service, response) => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response)
    });
    
    if (service === 'gemini') {
      vi.stubGlobal('fetch', mockFetch);
    }
  }
};

// Make test utilities globally available
vi.stubGlobal('testUtils', testUtils);