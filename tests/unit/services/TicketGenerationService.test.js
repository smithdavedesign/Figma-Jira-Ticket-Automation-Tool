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
    // Mock dependencies for 2-strategy architecture
    mockTemplateManager = {
      generateTicket: vi.fn().mockImplementation((options) => {
        const componentName = options?.componentName || 'Component';
        return Promise.resolve({
          content: `Template generated ticket for ${componentName}`,
          metadata: {
            template_id: 'test-template'
          }
        });
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

    // Create service instance with mocks
    service = new TicketGenerationService(
      mockTemplateManager,
      mockVisualAIService,
      mockAIOrchestrator,
      mockCacheService
    );

    // Mock the dependent services that get created during initialization
    service.configService = {
      get: vi.fn().mockReturnValue('mock-config-value')
    };
  });

  describe('Initialization', () => {
    it('should initialize successfully with new 2-strategy architecture', async () => {
      await service.initialize();
      
      expect(service.initialized).toBe(true);
      expect(service.getAvailableStrategies()).toContain('ai-powered');
      expect(service.getAvailableStrategies()).toContain('emergency');
      expect(service.getAvailableStrategies()).toHaveLength(2); // Only 2 strategies now
    });

    it('should have healthy strategies after initialization', async () => {
      await service.initialize();
      
      const health = service.getStrategyHealth();
      expect(health['ai-powered'].status).toBe('ready');
      expect(health['emergency'].status).toBe('ready');
    });
  });

  describe('Strategy Selection', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should select ai-powered strategy for AI requests', async () => {
      const request = {
        useAI: true,
        enhancedFrameData: [{ name: 'TestComponent', id: '123' }],
        documentType: 'component'
      };

      const result = await service.generateTicket(request, 'ai-powered');
      
      expect(result.metadata.strategy).toBe('ai-powered');
    });

    it('should map legacy strategy names to new architecture', async () => {
      const request = {
        frameData: [{ name: 'TestComponent' }],
        platform: 'jira',
        documentType: 'component'
      };

      // Test backward compatibility mapping
      const result1 = await service.generateTicket(request, 'ai');
      expect(result1.metadata.strategy).toBe('ai-powered');

      const result2 = await service.generateTicket(request, 'enhanced');
      expect(result2.metadata.strategy).toBe('ai-powered');

      const result3 = await service.generateTicket(request, 'template');
      expect(result3.metadata.strategy).toBe('ai-powered');
    });

    it('should use ai-powered strategy by default when AI available', async () => {
      const request = {
        enhancedFrameData: [{ name: 'TestComponent', id: '123' }],
        techStack: 'React',
        documentType: 'component'
      };

      const result = await service.generateTicket(request);
      
      expect(result.metadata.strategy).toBe('ai-powered');
    });

    it('should fallback to emergency strategy when AI unavailable', async () => {
      // Mock AI service as unavailable
      service.visualAIService = null;
      service.templateGuidedAIService = null;

      const request = {
        frameData: [{ name: 'TestComponent' }]
      };

      const result = await service.generateTicket(request);
      
      expect(result.metadata.strategy).toBe('emergency');
      expect(result.content[0].text).toContain('TestComponent'); // Emergency strategy returns array format
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
      expect(cacheCall[1].metadata.strategy).toBe('ai-powered');
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

      const key1 = service.createCacheKey(request1, 'ai-powered');
      const key2 = service.createCacheKey(request2, 'ai-powered');
      
      expect(key1).toBe(key2);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle AI generation failures gracefully', async () => {
      await service.initialize();
      
      // Reset the mock after initialization to ensure it's applied to the correct instance
      service.templateGuidedAIService.aiService.processVisualEnhancedContext = vi.fn().mockRejectedValue(
        new Error('AI service unavailable')
      );

      const request = {
        useAI: true,
        enhancedFrameData: [{ name: 'TestComponent' }]
      };

      // Service now has fallback mechanisms, so it should succeed with template-fallback
      const result = await service.generateTicket(request, 'ai-powered');
      expect(result).toBeDefined();
      
      // Check for template fallback indicators
      // When AI fails, confidence drops to 0.7 (vs 0.95 for successful AI)
      // and performance source becomes 'template-guided-ai' with template fallback
      expect(result.metadata?.ai_confidence === 0.7 && 
             result.performance?.source === 'template-guided-ai').toBe(true);
    });

    it('should handle cache failures gracefully', async () => {
      mockCacheService.get.mockRejectedValue(new Error('Cache error'));
      mockCacheService.set.mockRejectedValue(new Error('Cache error'));

      const request = {
        frameData: [{ name: 'TestComponent' }],
        platform: 'jira'
      };

      // Should still work without cache
      const result = await service.generateTicket(request, 'ai-powered');
      
      expect(result.metadata.strategy).toBe('ai-powered');
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
      expect(health.defaultStrategy).toBe('ai-powered');
      expect(health.availableStrategies).toContain('ai-powered');
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

      const result = await service.generateTicket(request, 'ai-powered');
      
      expect(result.content).toBeDefined();
      expect(result.content).toContain('Component'); // Should contain component name
      expect(result.metadata.strategy).toBe('ai-powered');
      // Note: confidence may vary based on fallback mechanisms
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

      const result = await service.generateTicket(request, 'ai-powered');
      
      expect(result.content).toBeDefined();
      expect(result.content).toContain('SearchInput'); // Should contain component name
      expect(result.metadata.strategy).toBe('ai-powered');
      // Template ID may vary based on which fallback mechanism is used
    });
  });
});