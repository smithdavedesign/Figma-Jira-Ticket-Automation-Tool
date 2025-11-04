/**
 * 🌐 JSDOM Test Setup
 * Browser environment setup for UI tests
 */

import { vi } from 'vitest';

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('sessionStorage', sessionStorageMock);

// Mock fetch for browser environment
global.fetch = vi.fn();

// Mock Figma plugin APIs
global.figma = {
  ui: {
    postMessage: vi.fn(),
    onmessage: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
    resize: vi.fn()
  },
  root: {
    children: [],
    name: 'Test Document'
  },
  currentPage: {
    children: [],
    name: 'Test Page'
  }
};

// Mock browser console for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};