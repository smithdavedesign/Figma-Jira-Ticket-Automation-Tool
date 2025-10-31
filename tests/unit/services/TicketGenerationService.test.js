/**
 * Ticket Generation Service Tests
 * 
 * Comprehensive test suite for the unified ticket generation service
 * Phase 8: Server Architecture Refactoring
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketGenerationService } from '../../../app/services/TicketGenerationService.js';

describe('TicketGenerationService', () => {
  let service;
  let mockTemplateManager;
  let mockVisualAIService;
  let mockAIOrchestrator;
  let mockCacheService;

  beforeEach(() => {
    // Mock dependencies
    mockTemplateManager = {
      generateTicket: vi.fn().mockResolvedValue({
        content: 'Template generated ticket',
        templateId: 'test-template'
      })
    };

    mockVisualAIService = {
      processVisualEnhancedContext: vi.fn().mockResolvedValue({
        ticket: 'AI generated ticket content',
        confidence: 0.95,
        processingMetrics: {
          screenshotProcessed: true,
          dataStructuresAnalyzed: 1
        }
      })
    };

    mockAIOrchestrator = {};

    mockCacheService = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(true)
    };

    // Create service instance
    service = new TicketGenerationService(
      mockTemplateManager,
      mockVisualAIService,
      mockAIOrchestrator,
      mockCacheService
    );
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await service.initialize();
      
      expect(service.initialized).toBe(true);
      expect(service.getAvailableStrategies()).toContain('ai');
      expect(service.getAvailableStrategies()).toContain('template');
      expect(service.getAvailableStrategies()).toContain('enhanced');
      expect(service.getAvailableStrategies()).toContain('legacy');
    });

    it('should have healthy strategies after initialization', async () => {
      await service.initialize();
      
      const health = service.getStrategyHealth();
      expect(health.ai.status).toBe('ready');
      expect(health.template.status).toBe('ready');
      expect(health.enhanced.status).toBe('ready');
      expect(health.legacy.status).toBe('ready');
    });
  });

  describe('Strategy Selection', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should select AI strategy for AI requests', async () => {
      const request = {
        useAI: true,
        enhancedFrameData: [{ name: 'TestComponent', id: '123' }],
        documentType: 'component'
      };

      const result = await service.generateTicket(request, 'ai');
      
      expect(result.metadata.strategy).toBe('ai');
      expect(mockVisualAIService.processVisualEnhancedContext).toHaveBeenCalled();
    });

    it('should select template strategy for template requests', async () => {
      const request = {
        frameData: [{ name: 'TestComponent' }],
        platform: 'jira',
        documentType: 'component'
      };

      const result = await service.generateTicket(request, 'template');
      
      expect(result.metadata.strategy).toBe('template');
      expect(mockTemplateManager.generateTicket).toHaveBeenCalled();
    });

    it('should select enhanced strategy automatically for enhanced requests', async () => {
      const request = {
        enhancedFrameData: [{ name: 'TestComponent', id: '123' }],
        techStack: 'React',
        documentType: 'component'
      };

      const result = await service.generateTicket(request);
      
      expect(result.metadata.strategy).toBe('enhanced');
    });

    it('should fallback to legacy strategy for minimal requests', async () => {
      const request = {
        frameData: [{ name: 'TestComponent' }]
      };

      // Mock template manager to fail
      mockTemplateManager.generateTicket.mockRejectedValue(new Error('Template failed'));

      const result = await service.generateTicket(request, 'legacy');
      
      expect(result.metadata.strategy).toBe('legacy');
      expect(result.content[0].text).toContain('TestComponent');
    });
  });

  describe('Caching', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should use cached results when available', async () => {
      const cachedResult = {
        content: [{ type: 'text', text: 'Cached ticket' }],
        metadata: { strategy: 'template', cached: true }
      };

      mockCacheService.get.mockResolvedValue(cachedResult);

      const request = {
        frameData: [{ name: 'TestComponent' }],
        platform: 'jira'
      };

      const result = await service.generateTicket(request);
      
      expect(result).toEqual(cachedResult);
      expect(mockTemplateManager.generateTicket).not.toHaveBeenCalled();
    });

    it('should cache new results', async () => {
      const request = {
        frameData: [{ name: 'TestComponent' }],
        platform: 'jira',
        documentType: 'component'
      };

      await service.generateTicket(request, 'template');
      
      expect(mockCacheService.set).toHaveBeenCalled();
      const cacheCall = mockCacheService.set.mock.calls[0];
      expect(cacheCall[1].metadata.strategy).toBe('template');
      expect(cacheCall[2]).toBe(7200); // 2 hour TTL
    });

    it('should create consistent cache keys', () => {
      const request1 = {
        documentType: 'component',
        platform: 'jira',
        frameData: [{ name: 'TestComponent' }]
      };

      const request2 = {
        documentType: 'component',
        platform: 'jira',
        frameData: [{ name: 'TestComponent' }]
      };

      const key1 = service.createCacheKey(request1, 'template');
      const key2 = service.createCacheKey(request2, 'template');
      
      expect(key1).toBe(key2);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle AI generation failures gracefully', async () => {
      mockVisualAIService.processVisualEnhancedContext.mockRejectedValue(
        new Error('AI service unavailable')
      );

      const request = {
        useAI: true,
        enhancedFrameData: [{ name: 'TestComponent' }]
      };

      await expect(service.generateTicket(request, 'ai')).rejects.toThrow();
    });

    it('should handle cache failures gracefully', async () => {
      mockCacheService.get.mockRejectedValue(new Error('Cache error'));
      mockCacheService.set.mockRejectedValue(new Error('Cache error'));

      const request = {
        frameData: [{ name: 'TestComponent' }],
        platform: 'jira'
      };

      // Should still work without cache
      const result = await service.generateTicket(request, 'template');
      expect(result.metadata.strategy).toBe('template');
    });
  });

  describe('Health Check', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return comprehensive health status', () => {
      const health = service.healthCheck();
      
      expect(health.service).toBe('TicketGenerationService');
      expect(health.initialized).toBe(true);
      expect(health.strategies).toBeDefined();
      expect(health.defaultStrategy).toBe('enhanced');
      expect(health.availableStrategies).toContain('ai');
    });
  });

  describe('Integration Tests', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should generate ticket end-to-end with AI strategy', async () => {
      const request = {
        enhancedFrameData: [{
          name: 'LoginButton',
          id: 'btn-123',
          type: 'COMPONENT',
          fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.5, b: 0.8 } }],
          style: { fontFamily: 'Inter', fontSize: 16 }
        }],
        screenshot: 'data:image/png;base64,mock-screenshot',
        techStack: 'React',
        documentType: 'component',
        useAI: true
      };

      const result = await service.generateTicket(request, 'ai');
      
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('AI generated ticket content');
      expect(result.metadata.strategy).toBe('ai');
      expect(result.metadata.confidence).toBe(0.95);
      expect(result.metadata.generatedAt).toBeDefined();
    });

    it('should generate ticket end-to-end with template strategy', async () => {
      const request = {
        frameData: [{ name: 'SearchInput' }],
        platform: 'jira',
        documentType: 'component',
        techStack: 'Vue.js',
        teamStandards: { tech_stack: 'Vue.js' }
      };

      const result = await service.generateTicket(request, 'template');
      
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toBe('Template generated ticket');
      expect(result.metadata.strategy).toBe('template');
      expect(result.metadata.templateId).toBe('test-template');
    });
  });
});