/**
 * Ticket Generation Service Tests
 *
 * Tests the thin GeminiService wrapper — happy path, fallback, and health check.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TicketGenerationService } from '../../../app/services/TicketGenerationService.js';

describe('TicketGenerationService', () => {
  let service;
  let mockGeminiService;

  beforeEach(() => {
    mockGeminiService = {
      generate: vi.fn().mockResolvedValue({
        content: 'h1. LoginButton\n\nh2. Description\nAI generated ticket',
        metadata: {
          model: 'gemini-pro',
          tokens: 42,
        },
      }),
    };

    service = new TicketGenerationService(mockGeminiService);
  });

  // ── generateTicket — happy path ───────────────────────────────────────────

  describe('generateTicket — success', () => {
    it('returns content and gemini strategy when GeminiService succeeds', async () => {
      const request = {
        enhancedFrameData: [{ name: 'LoginButton', id: 'btn-1' }],
        techStack: 'React',
        documentType: 'component',
      };

      const result = await service.generateTicket(request);

      expect(result.content).toContain('LoginButton');
      expect(result.metadata.strategy).toBe('gemini');
      expect(result.metadata.service).toBe('TicketGenerationService');
    });

    it('passes request fields to GeminiService.generate()', async () => {
      const request = {
        componentName: 'NavBar',
        techStack: 'Vue 3',
        platform: 'jira',
        documentType: 'component',
      };

      await service.generateTicket(request);

      expect(mockGeminiService.generate).toHaveBeenCalledOnce();
      const call = mockGeminiService.generate.mock.calls[0][0];
      expect(call.componentName).toBe('NavBar');
      expect(call.techStack).toBe('Vue 3');
      expect(call.platform).toBe('jira');
    });

    it('derives componentName from enhancedFrameData when not explicit', async () => {
      const request = {
        enhancedFrameData: [{ name: 'HeroCard', id: 'card-1' }],
      };

      await service.generateTicket(request);

      const call = mockGeminiService.generate.mock.calls[0][0];
      expect(call.componentName).toBe('HeroCard');
    });

    it('derives componentName from frameData when enhancedFrameData absent', async () => {
      const request = { frameData: [{ name: 'FooterNav' }] };

      await service.generateTicket(request);

      const call = mockGeminiService.generate.mock.calls[0][0];
      expect(call.componentName).toBe('FooterNav');
    });

    it('falls back to "Component" when no frame data provided', async () => {
      await service.generateTicket({});

      const call = mockGeminiService.generate.mock.calls[0][0];
      expect(call.componentName).toBe('Component');
    });

    it('_strategy parameter is ignored (API compatibility)', async () => {
      const request = { componentName: 'Widget' };

      const resultA = await service.generateTicket(request, 'ai-powered');
      const resultB = await service.generateTicket(request, 'template');
      const resultC = await service.generateTicket(request, 'ignored-value');

      expect(resultA.metadata.strategy).toBe('gemini');
      expect(resultB.metadata.strategy).toBe('gemini');
      expect(resultC.metadata.strategy).toBe('gemini');
    });
  });

  // ── generateTicket — error / fallback ─────────────────────────────────────

  describe('generateTicket — error fallback', () => {
    beforeEach(() => {
      mockGeminiService.generate.mockRejectedValue(new Error('AI service unavailable'));
    });

    it('returns emergency-fallback strategy when GeminiService throws', async () => {
      const result = await service.generateTicket({ componentName: 'ErrorComp' });

      expect(result.metadata.strategy).toBe('emergency-fallback');
      expect(result.metadata.service).toBe('TicketGenerationService');
    });

    it('includes component name in fallback content', async () => {
      const result = await service.generateTicket({ componentName: 'MyButton' });

      expect(result.content).toContain('MyButton');
    });

    it('includes techStack in fallback content when provided', async () => {
      const result = await service.generateTicket({
        componentName: 'Card',
        techStack: 'Next.js',
      });

      expect(result.content).toContain('Next.js');
    });

    it('falls back gracefully when geminiService itself is null', async () => {
      const svcNoGemini = new TicketGenerationService(null);

      const result = await svcNoGemini.generateTicket({ componentName: 'Orphan' });

      expect(result.metadata.strategy).toBe('emergency-fallback');
      expect(result.content).toContain('Orphan');
    });
  });

  // ── healthCheck ───────────────────────────────────────────────────────────

  describe('healthCheck', () => {
    it('reports geminiAvailable: true when service is injected', () => {
      const health = service.healthCheck();

      expect(health.service).toBe('TicketGenerationService');
      expect(health.geminiAvailable).toBe(true);
    });

    it('reports geminiAvailable: false when no service injected', () => {
      const svc = new TicketGenerationService(null);
      const health = svc.healthCheck();

      expect(health.geminiAvailable).toBe(false);
    });
  });
});
