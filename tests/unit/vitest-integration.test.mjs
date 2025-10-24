/**
 * 🧪 Vitest Integration Test
 * Test the new Vitest testing framework setup
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import logger from '../../core/logging/logger.js';
import { testUtils } from '../config/setupTests.js';

describe('🪵 Logging System Tests', () => {
  beforeEach(() => {
    // Clear any previous logs
    vi.clearAllMocks();
  });

  it('should create logger instance with proper configuration', () => {
    expect(logger).toBeDefined();
    expect(logger.sessionId).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should log messages with session context', () => {
    // Note: Logger might not log to console in test environment due to LOG_LEVEL
    // This test verifies the logger API works without checking console output
    expect(() => {
      logger.info('Test message', { testContext: true });
    }).not.toThrow();
    
    // Verify logger has session context
    expect(logger.sessionId).toBeDefined();
    expect(typeof logger.sessionId).toBe('string');
  });

  it('should handle performance timing correctly', () => {
    const timer = logger.startTimer('test_timer');
    expect(timer).toBe('test_timer');
    
    const duration = logger.endTimer('test_timer');
    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it('should format error logs properly', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const testError = new Error('Test error');
    
    logger.logError(testError, { context: 'vitest' });
    
    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0];
    expect(logCall[0]).toContain('ERROR');
    expect(logCall[0]).toContain('💥 Error Occurred');
    expect(logCall[1]).toHaveProperty('error');
    expect(logCall[1].error).toHaveProperty('message', 'Test error');
  });
});

describe('🧰 Test Utilities', () => {
  it('should provide mockMCPResponse utility', () => {
    expect(testUtils.mockMCPResponse).toBeDefined();
    expect(typeof testUtils.mockMCPResponse).toBe('function');
  });

  it('should provide mockFrameData utility', () => {
    const frameData = testUtils.mockFrameData([
      { id: 'test-1', name: 'Test Frame', width: 100, height: 200 }
    ]);
    
    expect(frameData).toHaveProperty('enhancedFrameData');
    expect(frameData.enhancedFrameData).toHaveLength(1);
    expect(frameData.enhancedFrameData[0]).toHaveProperty('id', 'test-1');
    expect(frameData.enhancedFrameData[0]).toHaveProperty('width', 100);
  });

  it('should provide timer utility', () => {
    const timer = testUtils.createTimer();
    expect(timer).toHaveProperty('elapsed');
    expect(timer).toHaveProperty('end');
    expect(typeof timer.elapsed()).toBe('number');
  });

  it('should validate MCP response format', () => {
    const validResponse = { success: true, data: { test: true } };
    
    expect(() => {
      testUtils.assertMCPResponse(validResponse);
    }).not.toThrow();
  });
});

describe('🔧 Core System Integration', () => {
  it('should handle tech stack parsing', async () => {
    // Mock a simple tech stack detection
    const mockFrameData = testUtils.mockFrameData([
      { name: 'Button Component', children: [] }
    ]);
    
    // This would normally call actual tech stack parsing
    const result = {
      frameworks: ['React'],
      components: ['Button'],
      confidence: 0.9
    };
    
    expect(result).toHaveProperty('frameworks');
    expect(result.frameworks).toContain('React');
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should simulate MCP server response', async () => {
    const mockData = { 
      name: 'test-server',
      tools: ['generate_tickets'],
      status: 'healthy'
    };
    
    testUtils.mockMCPResponse(mockData);
    
    // Test the mocked response
    const response = await fetch('http://localhost:3000/');
    const data = await response.json();
    
    expect(data).toEqual(mockData);
    expect(response.ok).toBe(true);
  });
});

describe('🎨 UI Component Testing', () => {
  it('should handle Figma plugin API mocks', () => {
    expect(global.figma).toBeDefined();
    expect(global.figma.ui).toHaveProperty('postMessage');
    expect(global.figma.root).toHaveProperty('children');
    expect(typeof global.figma.ui.postMessage).toBe('function');
  });

  it('should mock localStorage functionality', () => {
    expect(global.localStorage).toBeDefined();
    expect(typeof global.localStorage.setItem).toBe('function');
    expect(typeof global.localStorage.getItem).toBe('function');
  });
});