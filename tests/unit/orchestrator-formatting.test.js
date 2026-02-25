/**
 * WorkItemOrchestrator — Unit tests for pure formatting / content-building methods
 *
 * These methods have no I/O dependencies and can be verified deterministically.
 * Import the class directly so we can call private methods for isolated coverage.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkItemOrchestrator } from '../../core/orchestration/WorkItemOrchestrator.js';

// ── Minimal stub container so the constructor doesn't throw ──────────────────
function makeContainer() {
  const noop = vi.fn();
  const logger = { info: noop, warn: noop, error: noop, debug: noop };
  return {
    get: vi.fn((name) => {
      if (name === 'logger') return logger;
      return {};
    }),
  };
}

describe('WorkItemOrchestrator — formatting helpers', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new WorkItemOrchestrator(makeContainer());
  });

  // ── _buildFigmaDeepLink ────────────────────────────────────────────────────

  describe('_buildFigmaDeepLink', () => {
    it('returns null when neither figmaUrl nor fileKey are present', () => {
      expect(orchestrator._buildFigmaDeepLink({})).toBeNull();
    });

    it('builds URL from figmaUrl, stripping existing query string', () => {
      const ctx = { figmaUrl: 'https://www.figma.com/design/abc123?old=param' };
      const result = orchestrator._buildFigmaDeepLink(ctx);
      expect(result).toBe('https://www.figma.com/design/abc123');
    });

    it('appends node-id from first enhancedFrameData entry', () => {
      const ctx = {
        figmaUrl: 'https://www.figma.com/design/abc123',
        enhancedFrameData: [{ id: '12:34' }],
      };
      const result = orchestrator._buildFigmaDeepLink(ctx);
      expect(result).toBe('https://www.figma.com/design/abc123?node-id=12-34');
    });

    it('encodes colons in node-id to dashes', () => {
      const ctx = {
        figmaUrl: 'https://www.figma.com/design/x',
        enhancedFrameData: [{ id: '5:100' }],
      };
      expect(orchestrator._buildFigmaDeepLink(ctx)).toContain('node-id=5-100');
    });

    it('constructs URL from fileKey when no figmaUrl provided', () => {
      const ctx = { fileContext: { fileKey: 'myKey99' } };
      const result = orchestrator._buildFigmaDeepLink(ctx);
      expect(result).toBe('https://www.figma.com/design/myKey99');
    });

    it('falls back to frameData when enhancedFrameData is absent', () => {
      const ctx = {
        figmaUrl: 'https://www.figma.com/design/abc',
        frameData: [{ id: '7:8' }],
      };
      expect(orchestrator._buildFigmaDeepLink(ctx)).toContain('node-id=7-8');
    });
  });

  // ── _buildQaWikiContent ────────────────────────────────────────────────────

  describe('_buildQaWikiContent', () => {
    it('includes component name in the heading', () => {
      const result = orchestrator._buildQaWikiContent({ componentName: 'LoginButton' });
      expect(result).toContain('# QA Test Case: LoginButton');
    });

    it('includes today′s date', () => {
      const today = new Date().toLocaleDateString();
      const result = orchestrator._buildQaWikiContent({ componentName: 'X' });
      expect(result).toContain(today);
    });

    it('renders a Jira markdown link when both jiraIssueKey and jiraWebUrl are supplied', () => {
      const result = orchestrator._buildQaWikiContent({
        componentName: 'X',
        jiraIssueKey: 'PROJ-42',
        jiraWebUrl: 'https://jira.example.com/browse/PROJ-42',
      });
      expect(result).toContain('[PROJ-42](https://jira.example.com/browse/PROJ-42)');
    });

    it('falls back to _TBD_ when jiraIssueKey is absent', () => {
      const result = orchestrator._buildQaWikiContent({ componentName: 'X' });
      expect(result).toContain('_TBD_');
    });

    it('renders a wiki page link when wikiPageUrl is supplied', () => {
      const result = orchestrator._buildQaWikiContent({
        componentName: 'X',
        wikiPageUrl: 'https://wiki.example.com/page/123',
      });
      expect(result).toContain('[View Implementation Plan](https://wiki.example.com/page/123)');
    });

    it('includes the standard responsive / accessibility test rows', () => {
      const result = orchestrator._buildQaWikiContent({ componentName: 'Card' });
      expect(result).toContain('Responsive — mobile');
      expect(result).toContain('Keyboard navigation');
      expect(result).toContain('Screen reader compatibility');
    });

    it('closes with the <!-- design-preview --> marker', () => {
      const result = orchestrator._buildQaWikiContent({ componentName: 'Z' });
      expect(result).toContain('<!-- design-preview -->');
    });
  });

  // ── _formatForWiki ─────────────────────────────────────────────────────────

  describe('_formatForWiki', () => {
    it('prepends a Technical Design heading with the component name', () => {
      const result = orchestrator._formatForWiki('## content', { componentName: 'HeroSection' });
      expect(result).toContain('# Technical Design: HeroSection');
    });

    it('includes today′s date in the header', () => {
      const today = new Date().toLocaleDateString();
      const result = orchestrator._formatForWiki('', { componentName: 'X' });
      expect(result).toContain(today);
    });

    it('converts Jira h1. markup to markdown # heading', () => {
      const result = orchestrator._formatForWiki('h1. Overview', { componentName: 'X' });
      expect(result).toContain('# Overview');
    });

    it('converts Jira h2. markup to markdown ## heading', () => {
      const result = orchestrator._formatForWiki('h2. Details', { componentName: 'X' });
      expect(result).toContain('## Details');
    });

    it('converts {code} blocks to markdown fences', () => {
      const result = orchestrator._formatForWiki('{code}const x = 1;{code}', { componentName: 'X' });
      expect(result).toContain('```');
    });

    it('converts Jira link syntax [text|url] to markdown [text](url)', () => {
      const input = '[Figma Design|https://figma.com/abc]';
      const result = orchestrator._formatForWiki(input, { componentName: 'X' });
      expect(result).toContain('[Figma Design](https://figma.com/abc)');
    });

    it('appends Figma deep link in header when context provides figmaUrl', () => {
      const ctx = {
        componentName: 'NavBar',
        figmaUrl: 'https://www.figma.com/design/nav123',
      };
      const result = orchestrator._formatForWiki('', ctx);
      expect(result).toContain('[View Design](https://www.figma.com/design/nav123)');
    });
  });
});
